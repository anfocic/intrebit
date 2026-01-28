import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ElementSelector, EffectInstance, AnimationTrigger } from "../types";
import {
    prefersReducedMotion,
    resolveElements,
    hasWindow,
    hasDocument,
    supportsHover,
} from "../utils/dom";

export interface SvgDrawOptions {
    /** Optional root for scoping selector queries */
    root?: ParentNode;

    /** Animation duration in seconds */
    duration?: number;

    /** Delay before animation starts */
    delay?: number;

    /** When to trigger animation */
    trigger?: AnimationTrigger;

    /** Easing function */
    ease?: string;

    /** ScrollTrigger start position */
    scrollStart?: string;

    /** Whether to reverse on hover leave (for hover trigger) */
    reverseOnLeave?: boolean;

    /** Stagger delay for multiple paths */
    stagger?: number;

    /** Callback when animation completes */
    onComplete?: () => void;
}

const defaultOptions: Required<Omit<SvgDrawOptions, "root" | "onComplete">> & {
    root?: ParentNode;
    onComplete?: () => void;
} = {
    root: undefined,
    duration: 1.2,
    delay: 0,
    trigger: "load",
    ease: "power2.inOut",
    scrollStart: "top 80%",
    reverseOnLeave: true,
    stagger: 0.2,
    onComplete: undefined,
};

function ensureScrollTrigger() {
    if (!hasWindow()) return;
    gsap.registerPlugin(ScrollTrigger);
}

function getPathLength(path: SVGPathElement): number {
    return path.getTotalLength();
}

function preparePath(path: SVGPathElement): void {
    const length = getPathLength(path);
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
}

function showPathImmediately(path: SVGPathElement) {
    path.style.strokeDasharray = "none";
    path.style.strokeDashoffset = "0";
}

export function createSvgDraw(
    selector: ElementSelector,
    options: SvgDrawOptions = {}
): EffectInstance {
    if (!hasWindow() || !hasDocument()) return { destroy: () => {} };

    const opts = { ...defaultOptions, ...options };

    // On hover trigger, skip on touch/non-hover devices
    if (opts.trigger === "hover" && !supportsHover()) {
        return { destroy: () => {} };
    }

    const elements = resolveElements(selector, opts.root);
    const paths = elements.filter(
        (el): el is SVGPathElement => el instanceof SVGPathElement
    );

    if (paths.length === 0) return { destroy: () => {} };

    // Reduced motion: just show
    if (prefersReducedMotion()) {
        paths.forEach(showPathImmediately);
        return { destroy: () => {} };
    }

    ensureScrollTrigger();

    const cleanupFns: Array<() => void> = [];
    let currentAnimation: gsap.core.Tween | null = null;
    let st: ScrollTrigger | null = null;

    const runAnimation = (reverse = false) => {
        currentAnimation?.kill();

        // Always prep before a draw (important on replay / reverse)
        paths.forEach(preparePath);

        currentAnimation = gsap.to(paths, {
            strokeDashoffset: reverse ? (i: number) => getPathLength(paths[i]) : 0,
            duration: opts.duration,
            delay: opts.delay,
            ease: opts.ease,
            stagger: opts.stagger,
            onComplete: reverse ? undefined : opts.onComplete,
        });
    };

    const getTriggerEl = () => paths[0]?.closest("svg") || paths[0]?.parentElement;

    if (opts.trigger === "load") {
        runAnimation(false);
    }

    if (opts.trigger === "scroll") {
        const triggerEl = getTriggerEl();
        if (triggerEl) {
            st = ScrollTrigger.create({
                trigger: triggerEl,
                start: opts.scrollStart,
                once: true,
                onEnter: () => runAnimation(false),
            });
            cleanupFns.push(() => st?.kill());
        }
    }

    if (opts.trigger === "hover") {
        const triggerEl = getTriggerEl();
        if (triggerEl) {
            const onEnter = () => runAnimation(false);
            const onLeave = () => {
                if (opts.reverseOnLeave) runAnimation(true);
            };

            triggerEl.addEventListener("mouseenter", onEnter);
            triggerEl.addEventListener("mouseleave", onLeave);

            cleanupFns.push(() => {
                triggerEl.removeEventListener("mouseenter", onEnter);
                triggerEl.removeEventListener("mouseleave", onLeave);
            });
        }
    }

    return {
        destroy: () => {
            currentAnimation?.kill();
            st?.kill();
            cleanupFns.forEach((fn) => fn());

            paths.forEach((p) => {
                gsap.killTweensOf(p);
                p.style.strokeDasharray = "";
                p.style.strokeDashoffset = "";
            });
        },
        replay: () => runAnimation(false),
    };
}

/* ---------------------------- SVG Underline ---------------------------- */

export interface SvgUnderlineOptions extends SvgDrawOptions {
    /** Stroke color */
    color?: string;
    /** Stroke width */
    strokeWidth?: number;
    /** Vertical offset from text */
    offsetY?: number;
    /** Path data (so you can swap underline style) */
    pathD?: string;
}

const defaultUnderline: Required<Pick<SvgUnderlineOptions, "color" | "strokeWidth" | "offsetY" | "pathD">> =
    {
        color: "currentColor",
        strokeWidth: 3,
        offsetY: 6,
        pathD: "M0,15 Q75,5 150,12 T300,8",
    };

export function createSvgUnderline(
    selector: ElementSelector,
    options: SvgUnderlineOptions = {}
): EffectInstance {
    if (!hasWindow() || !hasDocument()) return { destroy: () => {} };

    const { color, strokeWidth, offsetY, pathD, ...drawOptions } = {
        ...defaultUnderline,
        ...options,
    };

    const elements = resolveElements(selector, drawOptions.root);
    const instances: EffectInstance[] = [];

    elements.forEach((element) => {
        const el = element as HTMLElement;

        // container styles
        if (!el.style.position) el.style.position = "relative";
        el.style.display = "inline-block";

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "svg-underline");
        svg.setAttribute("viewBox", "0 0 300 20");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.setAttribute("aria-hidden", "true");

        svg.style.cssText = `
      position: absolute;
      bottom: -${offsetY}px;
      left: -3%;
      width: 106%;
      height: 16px;
      overflow: visible;
      pointer-events: none;
    `;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", String(strokeWidth));
        path.setAttribute("stroke-linecap", "round");

        svg.appendChild(path);
        el.appendChild(svg);

        instances.push(createSvgDraw(path, drawOptions));
    });

    return {
        destroy: () => {
            instances.forEach((i) => i.destroy());
            elements.forEach((el) => (el as HTMLElement).querySelector(".svg-underline")?.remove());
        },
        replay: () => instances.forEach((i) => i.replay?.()),
    };
}

export default createSvgDraw;