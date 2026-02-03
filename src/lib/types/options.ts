export interface BaseOptions {
    /** Optional root for scoping selector queries */
    root?: ParentNode;

    /** Enable debug logs/warnings */
    debug?: boolean;

    /** Suppress warnings (e.g. no targets found) */
    silent?: boolean;
}

export interface TransformOptions {
    /** Translate on X axis (px). Meaning depends on the effect (e.g. offset, hover target). */
    x?: number;

    /** Translate on Y axis (px). Meaning depends on the effect (e.g. offset, hover target). */
    y?: number;

    /** Scale factor (e.g. 1.03) */
    scale?: number;

    /** Rotation (degrees) */
    rotate?: number;
}

export interface ColorOptions {
    /** Optional color override (e.g. hover color) */
    color?: string;
}

export interface MotionOptions {
    /** Easing function (GSAP ease string) */
    ease?: string;

    /** Delay before starting (seconds) */
    delay?: number;

    /** Duration (seconds) */
    duration?: number;
}