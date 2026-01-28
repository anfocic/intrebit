import type { HoverLiftOptions } from "@lib";

export const hoverLiftPresets = {
    /** Safe baseline: subtle lift + slight scale */
    default: {
        y: -2,
        scale: 1.04,
        durationIn: 0.22,
        durationOut: 0.26,
        ease: "power2.out",
    },

    /** Very restrained, barely-there */
    subtle: {
        y: -1.5,
        scale: 1.02,
        durationIn: 0.2,
        durationOut: 0.24,
        ease: "power2.out",
    },

    /** Stronger, snappier interaction */
    punchy: {
        y: -4,
        scale: 1.06,
        durationIn: 0.18,
        durationOut: 0.22,
        ease: "power3.out",
    },

    /** Softer timing, “buoyant” feel */
    floaty: {
        y: -3,
        scale: 1.04,
        durationIn: 0.28,
        durationOut: 0.34,
        ease: "sine.out",
    },

    /** Minimal scale, mostly translation (good for large type) */
    liftOnly: {
        y: -3,
        scale: 1,
        durationIn: 0.22,
        durationOut: 0.26,
        ease: "power2.out",
    },

    /** Scale-forward, less movement (good for tight layouts) */
    scaleOnly: {
        y: 0,
        scale: 1.06,
        durationIn: 0.2,
        durationOut: 0.24,
        ease: "power2.out",
    },

    /** Slight rotation for character (use sparingly on text) */
    jaunty: {
        y: -2,
        scale: 1.04,
        rotate: -1,
        durationIn: 0.22,
        durationOut: 0.26,
        ease: "power3.out",
    },

    /** Slow, premium feel */
    cinematic: {
        y: -3,
        scale: 1.045,
        durationIn: 0.35,
        durationOut: 0.4,
        ease: "power2.out",
    },

    /** “Press” interaction (useful for buttons) */
    press: {
        y: 0,
        scale: 0.98,
        durationIn: 0.12,
        durationOut: 0.18,
        ease: "power2.out",
    },

    /** Slight lateral nudge + lift (nice for wordmarks) */
    drift: {
        x: 1,
        y: -2,
        scale: 1.035,
        durationIn: 0.22,
        durationOut: 0.26,
        ease: "power2.out",
    },
} as const satisfies Record<string, HoverLiftOptions>;