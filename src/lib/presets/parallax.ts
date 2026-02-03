// src/lib/presets/parallax.ts
import type {
    ParallaxMouseOptions,
    ScrollFadeOptions,
    BackgroundDriftOptions,
} from "../effects/parallax";

export const parallaxMousePresets = {
    /** Safe default for hero titles */
    default: {
        strength: 0.02,
        duration: 0.4,
        ease: "power3.out",
        resetOnLeave: true,
        resetDuration: 0.6,
    },

    /** Barely there (good for subtle polish) */
    subtle: {
        strength: 0.012,
        duration: 0.45,
        ease: "power3.out",
        resetOnLeave: true,
        resetDuration: 0.55,
    },

    /** More noticeable (use on small elements, icons, cards) */
    strong: {
        strength: 0.05,
        duration: 0.32,
        ease: "power3.out",
        resetOnLeave: true,
        resetDuration: 0.6,
    },

    /** Different X/Y strengths (wider screens feel nicer) */
    wide: {
        strengthX: 0.03,
        strengthY: 0.012,
        duration: 0.4,
        ease: "power3.out",
        resetOnLeave: true,
        resetDuration: 0.6,
    },

    /** Snappy response, quick settle */
    snappy: {
        strength: 0.02,
        duration: 0.2,
        ease: "power2.out",
        resetOnLeave: true,
        resetDuration: 0.25,
    },

    /** Smooth “float” feel */
    floaty: {
        strength: 0.018,
        duration: 0.6,
        ease: "sine.out",
        resetOnLeave: true,
        resetDuration: 0.8,
    },

    /** Don’t reset on leave (only use if it makes sense visually) */
    noReset: {
        strength: 0.02,
        duration: 0.4,
        ease: "power3.out",
        resetOnLeave: false,
        resetDuration: 0.6,
    },
} as const satisfies Record<string, ParallaxMouseOptions>;

export const scrollFadePresets = {
    /** Safe default for hero content */
    default: {
        startY: 0,
        endY: 600,
        minOpacity: 0.85,
        parallaxStrength: 0.08,
        duration: 0.3,
    },

    /** Fade more, move less (text-heavy pages) */
    subtle: {
        startY: 0,
        endY: 700,
        minOpacity: 0.9,
        parallaxStrength: 0.05,
        duration: 0.28,
    },

    /** More dramatic fade (landing page sections) */
    dramatic: {
        startY: 0,
        endY: 500,
        minOpacity: 0.6,
        parallaxStrength: 0.1,
        duration: 0.25,
    },

    /** Longer travel / slower fade */
    long: {
        startY: 0,
        endY: 900,
        minOpacity: 0.85,
        parallaxStrength: 0.08,
        duration: 0.3,
    },

    /** Movement only (keeps opacity mostly intact) */
    parallaxOnly: {
        startY: 0,
        endY: 700,
        minOpacity: 0.98,
        parallaxStrength: 0.1,
        duration: 0.28,
    },
} as const satisfies Record<string, ScrollFadeOptions>;

export const backgroundDriftPresets = {
    /** Safe default: slow vertical drift */
    default: {
        startPosition: "50% 0%",
        endPosition: "50% 12%",
        duration: 12,
        ease: "sine.inOut",
    },

    /** Extra subtle (barely visible) */
    subtle: {
        startPosition: "50% 0%",
        endPosition: "50% 6%",
        duration: 16,
        ease: "sine.inOut",
    },

    /** Wider drift (nice on textured backgrounds) */
    wide: {
        startPosition: "45% 0%",
        endPosition: "55% 10%",
        duration: 14,
        ease: "sine.inOut",
    },

    /** More present (use sparingly) */
    strong: {
        startPosition: "50% 0%",
        endPosition: "50% 18%",
        duration: 10,
        ease: "sine.inOut",
    },

    /** Cinematic slow drift */
    cinematic: {
        startPosition: "50% 0%",
        endPosition: "50% 14%",
        duration: 22,
        ease: "sine.inOut",
    },
} as const satisfies Record<string, BackgroundDriftOptions>;