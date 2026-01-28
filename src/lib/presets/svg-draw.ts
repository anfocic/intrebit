// src/lib/presets/svg-draw.ts
import type { SvgDrawOptions, SvgUnderlineOptions } from "../effects/svg-draw";

export const svgDrawPresets = {
    /** Safe default */
    default: {
        duration: 1.2,
        delay: 0,
        trigger: "load",
        ease: "power2.inOut",
        scrollStart: "top 80%",
        reverseOnLeave: true,
        stagger: 0.2,
    },

    /** Faster, snappy */
    snappy: {
        duration: 0.75,
        delay: 0,
        trigger: "load",
        ease: "power2.out",
        scrollStart: "top 85%",
        reverseOnLeave: true,
        stagger: 0.12,
    },

    /** Scroll reveal for icons/illustrations */
    onScroll: {
        duration: 1.1,
        delay: 0,
        trigger: "scroll",
        ease: "power2.out",
        scrollStart: "top 85%",
        reverseOnLeave: false,
        stagger: 0.15,
    },

    /** Hover draw (desktop only) */
    onHover: {
        duration: 0.9,
        delay: 0,
        trigger: "hover",
        ease: "power2.out",
        scrollStart: "top 85%",
        reverseOnLeave: true,
        stagger: 0.1,
    },

    /** Cinematic draw */
    cinematic: {
        duration: 1.8,
        delay: 0,
        trigger: "load",
        ease: "sine.inOut",
        scrollStart: "top 80%",
        reverseOnLeave: true,
        stagger: 0.25,
    },
} as const satisfies Record<string, SvgDrawOptions>;

export const svgUnderlinePresets = {
    /** Clean underline */
    default: {
        ...svgDrawPresets.onScroll,
        color: "currentColor",
        strokeWidth: 3,
        offsetY: 6,
        pathD: "M0,15 Q75,5 150,12 T300,8",
    },

    /** Subtle thin underline */
    subtle: {
        ...svgDrawPresets.onScroll,
        color: "currentColor",
        strokeWidth: 2,
        offsetY: 5,
        pathD: "M0,14 Q75,9 150,12 T300,10",
    },

    /** Chunky marker vibe */
    marker: {
        ...svgDrawPresets.onScroll,
        color: "currentColor",
        strokeWidth: 5,
        offsetY: 7,
        pathD: "M0,14 Q60,2 150,12 T300,6",
    },

    /** Hover underline (desktop only) */
    hover: {
        ...svgDrawPresets.onHover,
        color: "currentColor",
        strokeWidth: 3,
        offsetY: 6,
        pathD: "M0,15 Q75,5 150,12 T300,8",
    },
} as const satisfies Record<string, SvgUnderlineOptions>;