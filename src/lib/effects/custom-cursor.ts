import { gsap } from "gsap";
import type { EffectInstance } from "../types";
import { prefersReducedMotion, supportsHover, hasDocument } from "../utils/dom";

export interface CustomCursorOptions {
    /** Optional root for scoping hover detection (defaults to document) */
    root?: ParentNode;

    /** Size of inner dot */
    dotSize?: number;
    /** Size of outer ring */
    ringSize?: number;
    /** Color of the dot */
    dotColor?: string;
    /** Color of the ring border */
    ringColor?: string;
    /** Scale factor on hover */
    hoverScale?: number;
    /** Enable trailing particles */
    trailEnabled?: boolean;
    /** Trail particle color */
    trailColor?: string;
    /** Selector for elements that trigger hover state */
    hoverSelector?: string;
    /** Use mix-blend-mode difference */
    mixBlend?: boolean;
    /** Z-index for cursor elements */
    zIndex?: number;
    /** Ring follow delay (0-1, lower = faster) */
    ringDelay?: number;

    /**
     * Prevents creating multiple cursors if called twice.
     * If true, and a cursor already exists, returns a no-op instance.
     */
    singleton?: boolean;

    /** Override style element id (advanced) */
    styleId?: string;
}

const defaultOptions: Required<
    Omit<CustomCursorOptions, "root" | "singleton" | "styleId">
> & {
    root?: ParentNode;
    singleton?: boolean;
    styleId?: string;
} = {
    root: undefined,
    dotSize: 8,
    ringSize: 40,
    dotColor: "white",
    ringColor: "rgba(255, 255, 255, 0.5)",
    hoverScale: 1.5,
    trailEnabled: false,
    trailColor: "#4a9eff",
    hoverSelector:
        "a, button, [data-cursor-hover], input, textarea, select, [role='button']",
    mixBlend: true,
    zIndex: 99999,
    ringDelay: 0.15,
    singleton: true,
    styleId: "custom-cursor-styles",
};

/**
 * Creates a custom cursor with dot + ring.
 * Note: This is intentionally "global UI" (app-level). Use sparingly.
 */
export function createCustomCursor(
    options: CustomCursorOptions = {}
): EffectInstance {
    if (!hasDocument() || prefersReducedMotion() || !supportsHover()) {
        return { destroy: () => {} };
    }

    const opts = { ...defaultOptions, ...options };
    const root: ParentNode = opts.root ?? document;

    // Optional singleton guard
    if (opts.singleton) {
        const existingDot = document.querySelector(".custom-cursor-dot");
        const existingRing = document.querySelector(".custom-cursor-ring");
        if (existingDot || existingRing) {
            return { destroy: () => {} };
        }
    }

    // Elements
    const dot = document.createElement("div");
    dot.className = "custom-cursor-dot";
    dot.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: ${opts.dotSize}px;
    height: ${opts.dotSize}px;
    background: ${opts.dotColor};
    border-radius: 50%;
    pointer-events: none;
    z-index: ${opts.zIndex + 1};
    transform: translate(-50%, -50%);
    opacity: 0;
    ${opts.mixBlend ? "mix-blend-mode: difference;" : ""}
  `;

    const ring = document.createElement("div");
    ring.className = "custom-cursor-ring";
    ring.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: ${opts.ringSize}px;
    height: ${opts.ringSize}px;
    border: 1px solid ${opts.ringColor};
    border-radius: 50%;
    pointer-events: none;
    z-index: ${opts.zIndex};
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: width 0.2s ease, height 0.2s ease;
    ${opts.mixBlend ? "mix-blend-mode: difference;" : ""}
  `;

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // Inject style once
    const styleId = opts.styleId ?? "custom-cursor-styles";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;

    const createdStyle = !styleEl;
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.textContent = `
      .has-custom-cursor,
      .has-custom-cursor * {
        cursor: none !important;
      }
    `;
        document.head.appendChild(styleEl);
    }

    document.body.classList.add("has-custom-cursor");

    // State
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let isVisible = false;
    let animationId = 0;

    const originalRingSize = opts.ringSize;

    const setHoverState = (hovered: boolean) => {
        if (hovered) {
            ring.style.width = `${originalRingSize * opts.hoverScale}px`;
            ring.style.height = `${originalRingSize * opts.hoverScale}px`;
            gsap.to(dot, { scale: opts.hoverScale, duration: 0.2, overwrite: "auto" });
        } else {
            ring.style.width = `${originalRingSize}px`;
            ring.style.height = `${originalRingSize}px`;
            gsap.to(dot, { scale: 1, duration: 0.2, overwrite: "auto" });
        }
    };

    // Trail particle
    const createTrailParticle = (x: number, y: number) => {
        const particle = document.createElement("div");
        particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 6px;
      height: 6px;
      background: ${opts.trailColor};
      border-radius: 50%;
      pointer-events: none;
      z-index: ${opts.zIndex - 1};
      transform: translate(-50%, -50%);
    `;
        document.body.appendChild(particle);

        gsap.to(particle, {
            scale: 0,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => particle.remove(),
        });
    };

    // Mouse move
    const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isVisible) {
            isVisible = true;
            gsap.to([dot, ring], { opacity: 1, duration: 0.25, overwrite: "auto" });
        }

        gsap.set(dot, { x: mouseX, y: mouseY });

        if (opts.trailEnabled) createTrailParticle(mouseX, mouseY);
    };

    // Ring follow loop
    const animateRing = () => {
        ringX += (mouseX - ringX) * opts.ringDelay;
        ringY += (mouseY - ringY) * opts.ringDelay;
        gsap.set(ring, { x: ringX, y: ringY });
        animationId = requestAnimationFrame(animateRing);
    };
    animateRing();

    // Window enter/leave
    const handleWindowLeave = () => {
        gsap.to([dot, ring], { opacity: 0, duration: 0.2, overwrite: "auto" });
        isVisible = false;
    };

    const handleWindowEnter = () => {
        gsap.to([dot, ring], { opacity: 1, duration: 0.2, overwrite: "auto" });
        isVisible = true;
    };

    // Hover: event delegation (no MutationObserver needed)
    const handlePointerOver = (e: Event) => {
        const target = e.target as Element | null;
        if (!target) return;
        if (target.closest(opts.hoverSelector)) setHoverState(true);
    };

    const handlePointerOut = (e: Event) => {
        const target = e.target as Element | null;
        if (!target) return;

        // When leaving an interactive element to another interactive element,
        // pointerout will fire too—so we check relatedTarget.
        const related = (e as MouseEvent).relatedTarget as Element | null;
        if (related && related.closest(opts.hoverSelector)) return;

        if (target.closest(opts.hoverSelector)) setHoverState(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleWindowLeave);
    document.addEventListener("mouseenter", handleWindowEnter);

    // Use capture so it triggers early and works reliably for nested elements
    (root as Document | Element).addEventListener("pointerover", handlePointerOver, true);
    (root as Document | Element).addEventListener("pointerout", handlePointerOut, true);

    return {
        destroy: () => {
            cancelAnimationFrame(animationId);

            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleWindowLeave);
            document.removeEventListener("mouseenter", handleWindowEnter);

            (root as Document | Element).removeEventListener("pointerover", handlePointerOver, true);
            (root as Document | Element).removeEventListener("pointerout", handlePointerOut, true);

            document.body.classList.remove("has-custom-cursor");

            // Only remove style element if we created it
            if (createdStyle) styleEl?.remove();

            gsap.killTweensOf(dot);
            gsap.killTweensOf(ring);

            dot.remove();
            ring.remove();
        },
    };
}

export default createCustomCursor;