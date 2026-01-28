// src/lib/presets/magnetic.ts
import type { MagneticOptions } from "../effects/magnetic";

export const magneticPresets = {
    /** Balanced default: noticeable but not gimmicky */
    default: {
        strength: 0.3,
        innerStrength: 0.2,
        duration: 0.4,
        ease: "power3.out",
        returnDuration: 0.6,
        returnEase: "elastic.out(1, 0.5)",
        innerSelector: "",
    },

    /** Barely-there pull (good for text links) */
    subtle: {
        strength: 0.18,
        innerStrength: 0.12,
        duration: 0.35,
        ease: "power3.out",
        returnDuration: 0.5,
        returnEase: "power3.out",
        innerSelector: "",
    },

    /** More playful pull (good for buttons / logos) */
    strong: {
        strength: 0.5,
        innerStrength: 0.32,
        duration: 0.32,
        ease: "power3.out",
        returnDuration: 0.7,
        returnEase: "elastic.out(1, 0.55)",
        innerSelector: "",
    },

    /** Quick + tight response (product-y feel) */
    snappy: {
        strength: 0.35,
        innerStrength: 0.22,
        duration: 0.22,
        ease: "power2.out",
        returnDuration: 0.28,
        returnEase: "power2.out",
        innerSelector: "",
    },

    /** Soft, floaty response (studio feel) */
    floaty: {
        strength: 0.28,
        innerStrength: 0.18,
        duration: 0.55,
        ease: "sine.out",
        returnDuration: 0.7,
        returnEase: "sine.out",
        innerSelector: "",
    },

    /** Elastic return emphasis (fun, use sparingly) */
    elastic: {
        strength: 0.4,
        innerStrength: 0.25,
        duration: 0.35,
        ease: "power3.out",
        returnDuration: 0.9,
        returnEase: "elastic.out(1, 0.4)",
        innerSelector: "",
    },

    /** Move outer only (inner stays still) */
    outerOnly: {
        strength: 0.3,
        innerStrength: 0,
        duration: 0.35,
        ease: "power3.out",
        returnDuration: 0.55,
        returnEase: "power3.out",
        innerSelector: "",
    },

    /** Inner-only feel (outer barely moves; good for icons inside buttons) */
    innerOnly: {
        strength: 0.08,
        innerStrength: 0.3,
        duration: 0.35,
        ease: "power3.out",
        returnDuration: 0.55,
        returnEase: "power3.out",
        innerSelector: "",
    },
} as const satisfies Record<string, MagneticOptions>;