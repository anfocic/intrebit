export type AnimationTrigger = "load" | "scroll" | "hover";

export interface BaseEffectOptions {
    trigger?: AnimationTrigger;
    delay?: number;
    duration?: number;
}

export type CleanupFunction = () => void;

export interface EffectInstance {
    destroy: CleanupFunction;
    replay?: () => void;
    pause?: () => void;
    resume?: () => void;
}

export type ElementSelector = string | Element | Element[] | NodeListOf<Element>;

/**
 * Type-only reference to GSAP without importing it at runtime.
 * Useful if you want to type functions that accept a GSAP instance.
 */
export type GSAPInstance = typeof import("gsap").gsap;

export interface ScrollTriggerConfig {
    trigger?: Element | string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    pin?: boolean;
    markers?: boolean;
    onEnter?: () => void;
    onLeave?: () => void;
    once?: boolean;
}