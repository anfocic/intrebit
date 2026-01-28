import { gsap } from "gsap";
import type { EffectInstance, ElementSelector } from "../types";
import { prefersReducedMotion, resolveElements, supportsHover } from "../utils/dom";

export interface MagneticOptions {
    /** Optional root for scoping selector queries */
    root?: ParentNode;

    /** How much the element moves toward cursor (0-1) */
    strength?: number;

    /** How much inner content moves (0-1) */
    innerStrength?: number;

    /** Selector for inner element (defaults to first child) */
    innerSelector?: string;

    /** Animation duration */
    duration?: number;

    /** Easing for movement */
    ease?: string;

    /** Easing for return animation */
    returnEase?: string;

    /** Duration for return animation */
    returnDuration?: number;
}

const defaultOptions: Required<
    Omit<MagneticOptions, "root">
> = {
    strength: 0.3,
    innerStrength: 0.2,
    innerSelector: "",
    duration: 0.4,
    ease: "power3.out",
    returnEase: "elastic.out(1, 0.5)",
    returnDuration: 0.6,
};

/**
 * Creates a magnetic effect on elements that pull toward the cursor.
 *
 * @example
 * ```ts
 * const fx = createMagnetic(".btn", { strength: 0.4 });
 * fx.destroy();
 * ```
 */
export function createMagnetic(
    selector: ElementSelector,
    options: MagneticOptions = {}
): EffectInstance {
    if (prefersReducedMotion() || !supportsHover()) {
        return { destroy: () => {} };
    }

    const opts = { ...defaultOptions, ...options };
    const elements = resolveElements(selector, opts.root);
    const cleanupFns: Array<() => void> = [];

    for (const element of elements) {
        const el = element as HTMLElement;

        const inner: Element | null = opts.innerSelector
            ? el.querySelector(opts.innerSelector)
            : el.firstElementChild;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(el, {
                x: x * opts.strength,
                y: y * opts.strength,
                duration: opts.duration,
                ease: opts.ease,
                overwrite: "auto",
            });

            if (inner) {
                gsap.to(inner, {
                    x: x * opts.innerStrength,
                    y: y * opts.innerStrength,
                    duration: opts.duration,
                    ease: opts.ease,
                    overwrite: "auto",
                });
            }
        };

        const handleMouseLeave = () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: opts.returnDuration,
                ease: opts.returnEase,
                overwrite: "auto",
            });

            if (inner) {
                gsap.to(inner, {
                    x: 0,
                    y: 0,
                    duration: opts.returnDuration,
                    ease: opts.returnEase,
                    overwrite: "auto",
                });
            }
        };

        el.addEventListener("mousemove", handleMouseMove);
        el.addEventListener("mouseleave", handleMouseLeave);

        cleanupFns.push(() => {
            el.removeEventListener("mousemove", handleMouseMove);
            el.removeEventListener("mouseleave", handleMouseLeave);

            gsap.killTweensOf(el);
            if (inner) gsap.killTweensOf(inner);

            // Optional: clear transforms we applied
            gsap.set(el, { clearProps: "x,y" });
            if (inner) gsap.set(inner, { clearProps: "x,y" });
        });
    }

    return {
        destroy: () => cleanupFns.forEach((fn) => fn()),
    };
}

export default createMagnetic;