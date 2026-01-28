import type { TextScrambleOptions } from "@lib";

const DEFAULT_CHARS =
    "!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * Presets are intentionally noticeable.
 * You can always override per-call:
 * createTextScramble(el, { ...textScramblePresets.cinematic, duration: 2 })
 */
export const textScramblePresets = {
    /** sensible default for most UI copy */
    default: {
        chars: DEFAULT_CHARS,
        duration: 1.25,
        delay: 0,
        trigger: "load",
        scrollStart: "top 85%",
        onComplete: undefined,
    },

    /** snappier / more “product UI” */
    snappy: {
        chars: DEFAULT_CHARS,
        duration: 0.7,
        delay: 0,
        trigger: "load",
        scrollStart: "top 85%",
        onComplete: undefined,
    },

    /** heavier “hacker decode” vibe */
    hacker: {
        chars: "01",
        duration: 1.4,
        delay: 0,
        trigger: "load",
        scrollStart: "top 85%",
        onComplete: undefined,
    },

    /** very glitchy / noisy */
    glitchy: {
        chars: "!<>-_\\/[]{}—=+*^?#________",
        duration: 1.1,
        delay: 0,
        trigger: "load",
        scrollStart: "top 85%",
        onComplete: undefined,
    },

    /** slower / hero-ish */
    cinematic: {
        chars: DEFAULT_CHARS,
        duration: 2.0,
        delay: 0.1,
        trigger: "load",
        scrollStart: "top 85%",
        onComplete: undefined,
    },

    /** for sections that should reveal when they enter viewport */
    onScroll: {
        chars: DEFAULT_CHARS,
        duration: 1.1,
        delay: 0,
        trigger: "scroll",
        scrollStart: "top 85%",
        onComplete: undefined,
    },

    /** hover-only scramble, keep text visible until hover */
    onHover: {
        chars: DEFAULT_CHARS,
        duration: 0.9,
        delay: 0,
        trigger: "hover",
        scrollStart: "top 85%",
        onComplete: undefined,
    },
} as const satisfies Record<string, Omit<TextScrambleOptions, "root" | "text">>;