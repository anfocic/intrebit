import { gsap } from "gsap";
import type { EffectInstance, ElementSelector } from "../types";
import { prefersReducedMotion, resolveElements } from "../utils/dom";

export interface BreathingOptions {
    /** Optional root for scoping selector queries */
    root?: ParentNode;

    /** Y offset for breathing motion */
    yOffset?: number;

    /** X offset for breathing motion (optional) */
    xOffset?: number;

    /** Scale variation (optional, e.g., 1.02 for subtle pulse) */
    scale?: number;

    /** Animation duration (one direction) */
    duration?: number;

    /** Easing function */
    ease?: string;

    /** Delay before starting */
    delay?: number;
}

const defaultOptions: Required<Omit<BreathingOptions, "root" | "xOffset" | "scale">> & {
    xOffset?: number;
    scale?: number;
} = {
    yOffset: -2,
    xOffset: undefined,
    scale: undefined,
    duration: 3.6,
    ease: "sine.inOut",
    delay: 0,
};

/**
 * Creates a subtle breathing/floating animation that loops infinitely.
 *
 * @example
 * ```ts
 * const fx = createBreathing(".hero-title", { yOffset: -2 });
 * // later
 * fx.destroy();
 * ```
 */
export function createBreathing(
    selector: ElementSelector,
    options: BreathingOptions = {}
): EffectInstance {
    if (prefersReducedMotion()) {
        return { destroy: () => {}, pause: () => {}, resume: () => {} };
    }

    const opts = { ...defaultOptions, ...options };
    const elements = resolveElements(selector, opts.root);
    const tweens: gsap.core.Tween[] = [];

    for (const element of elements) {
        const animProps: gsap.TweenVars = {
            duration: opts.duration,
            ease: opts.ease,
            yoyo: true,
            repeat: -1,
            delay: opts.delay,
        };

        if (opts.yOffset !== 0) animProps.y = opts.yOffset;
        if (opts.xOffset !== undefined) animProps.x = opts.xOffset;
        if (opts.scale !== undefined) animProps.scale = opts.scale;

        tweens.push(gsap.to(element, animProps));
    }

    const clear = () => {
        for (const el of elements) {
            // Only clear the props we might have set.
            gsap.set(el, { clearProps: "x,y,scale" });
        }
    };

    return {
        destroy: () => {
            for (const t of tweens) t.kill();
            // Optional: clear inline transforms we applied
            clear();
        },
        pause: () => {
            for (const t of tweens) t.pause();
        },
        resume: () => {
            for (const t of tweens) t.resume();
        },
    };
}