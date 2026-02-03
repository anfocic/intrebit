// src/lib/presets/breathing.ts
import type { BreathingOptions } from "@lib";

export const breathingPresets = {
    /** Safe default for headings/wordmarks */
    default: {
        yOffset: -2,
        duration: 3.6,
        ease: "sine.inOut",
        delay: 0,
    },

    /** Barely noticeable “alive” motion */
    subtle: {
        yOffset: -1,
        duration: 4.8,
        ease: "sine.inOut",
        delay: 0,
    },

    /** Slightly more present, still tasteful */
    gentle: {
        yOffset: -2.5,
        duration: 3.8,
        ease: "sine.inOut",
        delay: 0,
    },

    /** More float, slower pace (nice for large hero type) */
    floaty: {
        yOffset: -4,
        duration: 5.2,
        ease: "sine.inOut",
        delay: 0,
    },

    /** Adds a tiny scale pulse (use on logos/icons more than text) */
    pulse: {
        yOffset: 0,
        scale: 1.02,
        duration: 2.6,
        ease: "sine.inOut",
        delay: 0,
    },

    /** Drift diagonally (works well on small decorative elements) */
    drift: {
        yOffset: -2,
        xOffset: 2,
        duration: 4.5,
        ease: "sine.inOut",
        delay: 0,
    },

    /** Calm premium motion: slow and smooth */
    cinematic: {
        yOffset: -3,
        duration: 7.0,
        ease: "sine.inOut",
        delay: 0,
    },

    /** Slightly faster “energized” motion (use sparingly) */
    energized: {
        yOffset: -2,
        duration: 2.4,
        ease: "sine.inOut",
        delay: 0,
    },
} as const satisfies Record<string, BreathingOptions>;