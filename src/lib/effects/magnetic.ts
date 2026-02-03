import {gsap} from "gsap";
import type {EffectInstance, ElementSelector} from "../types";
import {resolveElements} from "../utils/dom";
import {guard} from "../utils/guards.ts";
import {createCleanup, noopInstance} from "../utils/instance.ts";

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


export function createMagnetic(
    selector: ElementSelector,
    options: MagneticOptions = {}
): EffectInstance {
    const g = guard({ requireHover: true });
    if (!g.ok) return g.instance;

    const opts = { ...defaultOptions, ...options };
    const elements = resolveElements(selector, opts.root);
    if (!elements.length) return noopInstance();

    const c = createCleanup();

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

        c.on(document, "mousemove", handleMouseMove);
        c.on(el, "mouseleave", handleMouseLeave);

        c.add(() => gsap.killTweensOf(el));
        if (inner) c.add(() => gsap.killTweensOf(inner));
    }

    return { destroy: () => c.destroy() };
}