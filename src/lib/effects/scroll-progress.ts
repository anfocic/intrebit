import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { EffectInstance } from "../types";
import { prefersReducedMotion, hasWindow, hasDocument } from "../utils/dom";

export type ScrollProgressType = "bar" | "bar-side" | "circle";
export type ScrollProgressPosition = "top" | "bottom" | "left" | "right";

export interface ScrollProgressOptions {
    /** Optional root for scoping container selector queries */
    root?: ParentNode;

    /** Type of progress indicator */
    type?: ScrollProgressType;

    /** Color of the progress indicator */
    color?: string;

    /** End color for gradient (bar type only) */
    colorEnd?: string;

    /** Size in pixels (height for bar, diameter for circle) */
    size?: number;

    /** Position (top/bottom for bar, left/right for side bar) */
    position?: ScrollProgressPosition;

    /** Show percentage text (circle type only) */
    showPercent?: boolean;

    /** Container to track scroll (element or selector). Defaults to body */
    container?: Element | string;

    /** Z-index for the progress element */
    zIndex?: number;

    /** Scrub smoothness (0 = instant, higher = smoother) */
    scrub?: number;

    /** Callback on progress update */
    onProgress?: (progress: number) => void;
}

const defaultOptions: Required<
    Omit<ScrollProgressOptions, "root" | "colorEnd" | "onProgress">
> & {
    root?: ParentNode;
    colorEnd?: string;
    onProgress?: (progress: number) => void;
} = {
    root: undefined,
    type: "bar",
    color: "#4a9eff",
    colorEnd: undefined,
    size: 3,
    position: "top",
    showPercent: true,
    container: "body",
    zIndex: 9999,
    scrub: 0.3,
    onProgress: undefined,
};

function ensureScrollTrigger() {
    if (!hasWindow()) return;
    // gsap.registerPlugin is idempotent; safe to call repeatedly
    gsap.registerPlugin(ScrollTrigger);
}

/** Create the bar progress element */
function createBarElement(opts: typeof defaultOptions): HTMLElement {
    const bar = document.createElement("div");
    bar.className = "scroll-progress-bar";

    const gradient = opts.colorEnd
        ? `linear-gradient(90deg, ${opts.color}, ${opts.colorEnd})`
        : opts.color;

    bar.style.cssText = `
    position: fixed;
    ${opts.position}: 0;
    left: 0;
    width: 0%;
    height: ${opts.size}px;
    background: ${gradient};
    z-index: ${opts.zIndex};
    pointer-events: none;
    transition: none;
  `;

    return bar;
}

/** Create the side bar progress element */
function createSideBarElement(opts: typeof defaultOptions): HTMLElement {
    const container = document.createElement("div");
    container.className = "scroll-progress-side";

    const isLeft = opts.position === "left";

    container.style.cssText = `
    position: fixed;
    top: 50%;
    ${isLeft ? "left" : "right"}: 24px;
    width: ${opts.size}px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: ${opts.size}px;
    transform: translateY(-50%);
    z-index: ${opts.zIndex};
    pointer-events: none;
    overflow: hidden;
  `;

    const fill = document.createElement("div");
    fill.className = "scroll-progress-side-fill";
    fill.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0%;
    background: ${opts.color};
    border-radius: ${opts.size}px;
    transition: none;
  `;

    container.appendChild(fill);
    return container;
}

/** Create the circle progress element */
function createCircleElement(opts: typeof defaultOptions): HTMLElement {
    const container = document.createElement("div");
    container.className = "scroll-progress-circle";

    container.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: ${opts.size}px;
    height: ${opts.size}px;
    z-index: ${opts.zIndex};
    pointer-events: none;
  `;

    const circumference = 2 * Math.PI * 20; // r=20 in viewBox

    container.innerHTML = `
    <svg viewBox="0 0 50 50" style="width: 100%; height: 100%;">
      <circle
        cx="25" cy="25" r="20"
        fill="none"
        stroke="${opts.color}"
        stroke-width="3"
        opacity="0.2"
      />
      <circle
        class="scroll-progress-circle-fill"
        cx="25" cy="25" r="20"
        fill="none"
        stroke="${opts.color}"
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${circumference}"
        style="transform: rotate(-90deg); transform-origin: center;"
      />
    </svg>
    ${
        opts.showPercent
            ? `<span class="scroll-progress-text" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 0.65rem;
            font-weight: 600;
            color: ${opts.color};
          ">0%</span>`
            : ""
    }
  `;

    return container;
}

function resolveContainer(
    container: Element | string,
    root?: ParentNode
): Element | null {
    if (typeof container !== "string") return container;
    const scope: ParentNode = root ?? document;
    return (scope as Document | Element).querySelector?.(container) ?? null;
}

/**
 * Creates a scroll progress indicator.
 */
export function createScrollProgress(
    options: ScrollProgressOptions = {}
): EffectInstance {
    if (!hasWindow() || !hasDocument() || prefersReducedMotion()) {
        return { destroy: () => {} };
    }

    ensureScrollTrigger();

    const opts = { ...defaultOptions, ...options };

    const containerEl =
        resolveContainer(opts.container, opts.root) ?? document.body;

    // Create appropriate element
    let element: HTMLElement;
    switch (opts.type) {
        case "bar-side":
            element = createSideBarElement(opts);
            break;
        case "circle":
            element = createCircleElement(opts);
            break;
        case "bar":
        default:
            element = createBarElement(opts);
            break;
    }

    document.body.appendChild(element);

    // Get anim target
    const target =
        opts.type === "bar-side"
            ? element.querySelector(".scroll-progress-side-fill")
            : opts.type === "circle"
                ? element.querySelector(".scroll-progress-circle-fill")
                : element;

    const textElement = element.querySelector(".scroll-progress-text");

    // If circle, ensure dashoffset baseline is correct even if user CSS touches it
    if (opts.type === "circle" && target instanceof SVGCircleElement) {
        const circumference = 2 * Math.PI * 20;
        target.style.strokeDasharray = `${circumference}`;
        target.style.strokeDashoffset = `${circumference}`;
    }

    let tween: gsap.core.Tween | null = null;

    if (target) {
        const animationProps: gsap.TweenVars = {
            ease: "none",
            scrollTrigger: {
                trigger: containerEl,
                start: "top top",
                end: "bottom bottom",
                scrub: opts.scrub,
                onUpdate: (self: ScrollTrigger) => {
                    if (textElement && opts.type === "circle") {
                        textElement.textContent = `${Math.round(self.progress * 100)}%`;
                    }
                    opts.onProgress?.(self.progress);
                },
            },
        };

        switch (opts.type) {
            case "bar":
                tween = gsap.to(target, { width: "100%", ...animationProps });
                break;
            case "bar-side":
                tween = gsap.to(target, { height: "100%", ...animationProps });
                break;
            case "circle":
                tween = gsap.to(target, { strokeDashoffset: 0, ...animationProps });
                break;
        }
    }

    return {
        destroy: () => {
            // Kill only what we created
            if (tween) {
                const st = tween.scrollTrigger;
                tween.kill();
                st?.kill();
            }

            if (target) gsap.killTweensOf(target);
            element.remove();
        },
    };
}

export default createScrollProgress;