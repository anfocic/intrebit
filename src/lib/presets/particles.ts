// src/lib/presets/particles.ts
import type { ParticlesOptions } from "../effects/particles";

export const particlesPresets = {
    /** Safe default ambient layer (most sites) */
    default: {
        count: 30,
        color: "#4a9eff",
        minSize: 3,
        maxSize: 8,
        speed: 1,
        opacity: 0.4,
        type: "mixed",
        container: "body",
        zIndex: 0,
        interactive: false,
        mode: "drift",
        singleton: true,
    },

    /** Very subtle, barely-there texture */
    subtle: {
        count: 18,
        color: "rgba(74, 158, 255, 0.9)",
        minSize: 2,
        maxSize: 6,
        speed: 0.6,
        opacity: 0.22,
        type: "ring",
        container: "body",
        zIndex: 0,
        interactive: false,
        mode: "drift",
        singleton: true,
    },

    /** Hero-friendly: bigger glows, slower motion */
    hero: {
        count: 22,
        color: "#4a9eff",
        minSize: 3,
        maxSize: 10,
        speed: 0.5,
        opacity: 0.28,
        type: "mixed",
        container: "body",
        zIndex: 0,
        interactive: false,
        mode: "drift",
        singleton: true,
    },

    /** Dots only: cleaner and more modern */
    dots: {
        count: 28,
        color: "#4a9eff",
        minSize: 2,
        maxSize: 6,
        speed: 0.9,
        opacity: 0.3,
        type: "dot",
        container: "body",
        zIndex: 0,
        interactive: false,
        mode: "drift",
        singleton: true,
    },

    /** Rings only: more “techy” vibe */
    rings: {
        count: 26,
        color: "#4a9eff",
        minSize: 3,
        maxSize: 8,
        speed: 0.8,
        opacity: 0.28,
        type: "ring",
        container: "body",
        zIndex: 0,
        interactive: false,
        mode: "drift",
        singleton: true,
    },

    /** Glows only: dreamy, soft background */
    glow: {
        count: 14,
        color: "#4a9eff",
        minSize: 3,
        maxSize: 10, // glow sizes get multiplied internally
        speed: 0.45,
        opacity: 0.25,
        type: "glow",
        container: "body",
        zIndex: 0,
        interactive: false,
        mode: "drift",
        singleton: true,
    },

    /** Interactive follow mode (use sparingly; can be distracting) */
    follow: {
        count: 24,
        color: "#4a9eff",
        minSize: 2,
        maxSize: 7,
        speed: 1,
        opacity: 0.32,
        type: "dot",
        container: "body",
        zIndex: 0,
        interactive: true,
        mode: "follow",
        singleton: true,
    },

    /** Click burst mode (interactive explode) */
    explode: {
        count: 18,
        color: "#4a9eff",
        minSize: 2,
        maxSize: 6,
        speed: 0.7,
        opacity: 0.2,
        type: "ring",
        container: "body",
        zIndex: 0,
        interactive: true,
        mode: "explode",
        singleton: true,
    },

    /** Behind content: useful when you want particles under overlays */
    behind: {
        count: 26,
        color: "#4a9eff",
        minSize: 3,
        maxSize: 8,
        speed: 0.8,
        opacity: 0.25,
        type: "mixed",
        container: "body",
        zIndex: -1,
        interactive: false,
        mode: "drift",
        singleton: true,
    },

    /** Above content: for special pages; be careful with readability */
    above: {
        count: 18,
        color: "rgba(255,255,255,0.8)",
        minSize: 2,
        maxSize: 6,
        speed: 0.7,
        opacity: 0.18,
        type: "dot",
        container: "body",
        zIndex: 999,
        interactive: false,
        mode: "drift",
        singleton: true,
    },
} as const satisfies Record<string, ParticlesOptions>;