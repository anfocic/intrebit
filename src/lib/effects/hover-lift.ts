import { gsap } from "gsap";
import type { ElementSelector, EffectInstance } from "../types";
import { resolveElements, prefersReducedMotion, supportsHover } from "../utils/dom";

export interface HoverLiftOptions {
    root?: ParentNode;
    y?: number;
    x?: number;
    scale?: number;
    rotate?: number;
    color?: string;
    durationIn?: number;
    durationOut?: number;
    ease?: string;
    silent?: boolean;
}

const defaults: Required<Omit<HoverLiftOptions, "root" | "color" | "silent">> & {
    color?: string;
    silent?: boolean;
} = {
    y: -2,
    x: 0,
    scale: 1.03,
    rotate: 0,
    color: undefined,
    durationIn: 0.25,
    durationOut: 0.3,
    ease: "power2.out",
    silent: false,
};

export function createHoverLift(
    target: ElementSelector,
    options: HoverLiftOptions = {}
): EffectInstance {
    if (prefersReducedMotion() || !supportsHover()) return { destroy: () => {} };

    const opts = { ...defaults, ...options };
    const els = resolveElements(target, opts.root);
    const cleanup: Array<() => void> = [];

    for (const el of els) {
        const enter = () => {
            const vars: gsap.TweenVars = {
                x: opts.x,
                y: opts.y,
                scale: opts.scale,
                rotate: opts.rotate,
                duration: opts.durationIn,
                ease: opts.ease,
                overwrite: "auto",
            };
            if (opts.color) vars.color = opts.color;
            gsap.to(el, vars);
        };

        const leave = () => {
            const vars: gsap.TweenVars = {
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
                duration: opts.durationOut,
                ease: opts.ease,
                overwrite: "auto",
            };
            if (opts.color) vars.clearProps = "color";
            gsap.to(el, vars);
        };

        el.addEventListener("mouseenter", enter);
        el.addEventListener("mouseleave", leave);

        cleanup.push(() => {
            el.removeEventListener("mouseenter", enter);
            el.removeEventListener("mouseleave", leave);
            gsap.killTweensOf(el);
        });
    }

    return { destroy: () => cleanup.forEach((fn) => fn()) };
}