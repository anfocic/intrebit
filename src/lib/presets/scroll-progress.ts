// src/lib/presets/scroll-progress.ts
import type { ScrollProgressOptions } from "../effects/scroll-progress";

export const scrollProgressPresets = {
    /** Safe default: thin top bar */
    default: {
        type: "bar",
        position: "top",
        size: 3,
        color: "#4a9eff",
        zIndex: 9999,
        scrub: 0.3,
        container: "body",
        showPercent: true,
    },

    /** Even more subtle (nice for content sites) */
    subtle: {
        type: "bar",
        position: "top",
        size: 2,
        color: "rgba(74, 158, 255, 0.8)",
        zIndex: 9999,
        scrub: 0.35,
        container: "body",
        showPercent: true,
    },

    /** Bottom bar (when header already has UI) */
    bottom: {
        type: "bar",
        position: "bottom",
        size: 3,
        color: "#4a9eff",
        zIndex: 9999,
        scrub: 0.3,
        container: "body",
        showPercent: true,
    },

    /** Gradient top bar */
    gradient: {
        type: "bar",
        position: "top",
        size: 3,
        color: "#4a9eff",
        colorEnd: "#a855f7",
        zIndex: 9999,
        scrub: 0.3,
        container: "body",
        showPercent: true,
    },

    /** Side bar (right) */
    sideRight: {
        type: "bar-side",
        position: "right",
        size: 4,
        color: "#4a9eff",
        zIndex: 9999,
        scrub: 0.35,
        container: "body",
        showPercent: true,
    },

    /** Side bar (left) */
    sideLeft: {
        type: "bar-side",
        position: "left",
        size: 4,
        color: "#4a9eff",
        zIndex: 9999,
        scrub: 0.35,
        container: "body",
        showPercent: true,
    },

    /** Circle indicator bottom-right */
    circle: {
        type: "circle",
        size: 52,
        color: "#4a9eff",
        zIndex: 9999,
        scrub: 0.35,
        container: "body",
        showPercent: true,
    },

    /** Circle, no percent text (cleaner) */
    circleMinimal: {
        type: "circle",
        size: 48,
        color: "rgba(74, 158, 255, 0.9)",
        zIndex: 9999,
        scrub: 0.35,
        container: "body",
        showPercent: false,
    },
} as const satisfies Record<string, ScrollProgressOptions>;