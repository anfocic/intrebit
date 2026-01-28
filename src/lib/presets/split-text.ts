// src/lib/presets/split-text.ts
import type { SplitTextOptions } from "../effects/split-text";

export const splitTextPresets = {
    /** Safe default: nice hero reveal */
    default: {
        animation: "cascade",
        duration: 0.8,
        stagger: 0.06,
        delay: 0,
        trigger: "load",
        charClass: "split-char",
        scrollStart: "top 85%",
        loop: false,
    },

    /** Faster/snappier headline */
    snappy: {
        animation: "cascade",
        duration: 0.55,
        stagger: 0.03,
        delay: 0,
        trigger: "load",
        charClass: "split-char",
        scrollStart: "top 85%",
        loop: false,
    },

    /** Soft and clean (no rotations) */
    fade: {
        animation: "fade",
        duration: 0.6,
        stagger: 0.04,
        delay: 0,
        trigger: "load",
        charClass: "split-char",
        scrollStart: "top 85%",
        loop: false,
    },

    /** Stylish blur-in (great for dark backgrounds) */
    blur: {
        animation: "blur",
        duration: 0.75,
        stagger: 0.05,
        delay: 0,
        trigger: "load",
        charClass: "split-char",
        scrollStart: "top 85%",
        loop: false,
    },

    /** Fun wave (optionally looping) */
    waveOnce: {
        animation: "wave",
        duration: 0.9,
        stagger: 0.06,
        delay: 0,
        trigger: "load",
        charClass: "split-char",
        scrollStart: "top 85%",
        loop: false,
    },

    /** Continuous wave (use sparingly) */
    waveLoop: {
        animation: "wave",
        duration: 0.9,
        stagger: 0.06,
        delay: 0,
        trigger: "load",
        charClass: "split-char",
        scrollStart: "top 85%",
        loop: true,
    },

    /** Scroll-triggered section heading */
    sectionScroll: {
        animation: "spring",
        duration: 0.8,
        stagger: 0.04,
        delay: 0,
        trigger: "scroll",
        scrollStart: "top 85%",
        charClass: "split-char",
        loop: false,
    },

    /** Hover-triggered (desktop only) */
    hover: {
        animation: "scale",
        duration: 0.45,
        stagger: 0.02,
        delay: 0,
        trigger: "hover",
        charClass: "split-char",
        scrollStart: "top 85%",
        loop: false,
    },

    /** Cyber vibe (use rarely) */
    glitch: {
        animation: "glitch",
        duration: 0.8, // used indirectly
        stagger: 0.03,
        delay: 0,
        trigger: "load",
        charClass: "split-char",
        scrollStart: "top 85%",
        loop: false,
    },
} as const satisfies Record<string, SplitTextOptions>;