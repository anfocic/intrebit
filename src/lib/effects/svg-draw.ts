import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ElementSelector, EffectInstance, AnimationTrigger } from "../types";
import { prefersReducedMotion, resolveElements, hasWindow } from "../utils/dom";
import { guard } from "../utils/guards";
import { createCleanup, noopInstance } from "../utils/instance";

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
    const opts = { ...defaultOptions, ...options };

    const g = guard({
        requireDocument: true,
        requireHover: opts.trigger === "hover",
        // We handle reduced-motion ourselves (show final state)
        allowReducedMotion: true,
    });

    if (!g.ok) return g.instance;

    const elements = resolveElements(selector, opts.root);
    const paths = elements.filter(
        (el): el is SVGPathElement => el instanceof SVGPathElement
    );

    if (paths.length === 0) return noopInstance();

    // Reduced motion: just show
    if (prefersReducedMotion()) {
        paths.forEach(showPathImmediately);
        return noopInstance();
    }

    ensureScrollTrigger();

    const cleanup = createCleanup();
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
            cleanup.add(() => st?.kill());
        }
    }

    if (opts.trigger === "hover") {
        const triggerEl = getTriggerEl();
        if (triggerEl) {
            const onEnter = () => runAnimation(false);
            const onLeave = () => {
                if (opts.reverseOnLeave) runAnimation(true);
            };

            cleanup.on(triggerEl, "mouseenter", onEnter);
            cleanup.on(triggerEl, "mouseleave", onLeave);
        }
    }

    return {
        destroy: () => {
            currentAnimation?.kill();
            st?.kill();
            cleanup.destroy();

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
    const g = guard({ requireDocument: true });
    if (!g.ok) return g.instance;

    const { color, strokeWidth, offsetY, pathD, ...drawOptions } = {
        ...defaultUnderline,
        ...options,
    };

    const elements = resolveElements(selector, drawOptions.root);
    const cleanup = createCleanup();
    const instances: EffectInstance[] = [];

    elements.forEach((element) => {
        const el = element as HTMLElement;

        // container styles (restore on destroy)
        const hadPosition = !!el.style.position;
        const prevPosition = el.style.position;
        const prevDisplay = el.style.display;

        if (!hadPosition) el.style.position = "relative";
        el.style.display = "inline-block";

        cleanup.add(() => {
            // Only revert position if we set it
            if (!hadPosition) el.style.position = prevPosition;
            el.style.display = prevDisplay;
        });

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
            cleanup.destroy();
        },
        replay: () => instances.forEach((i) => i.replay?.()),
    };
}

export default createSvgDraw;