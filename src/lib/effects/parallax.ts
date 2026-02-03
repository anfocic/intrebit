import { gsap } from "gsap";
import type { EffectInstance, ElementSelector } from "../types";
import { hasWindow, resolveElements } from "../utils/dom";
import { guard } from "../utils/guards";
import { createCleanup, noopInstance } from "../utils/instance";

/* -------------------------------------------------------------------------- */
/*                               Parallax Mouse                               */
/* -------------------------------------------------------------------------- */

export interface ParallaxMouseOptions {
    /** Optional root for scoping selector queries (used for targets; containers can also be resolved via root) */
    root?: ParentNode;

    /** Movement strength (0-1, where 0.02 is subtle, 0.1 is strong) */
    strength?: number;

    /** Separate X strength (optional) */
    strengthX?: number;

    /** Separate Y strength (optional) */
    strengthY?: number;

    /** Animation duration for smoothness */
    duration?: number;

    /** Easing function */
    ease?: string;

    /** Reset position on mouse leave */
    resetOnLeave?: boolean;

    /** Duration for reset animation */
    resetDuration?: number;
}

const defaultParallaxMouseOptions: Required<
    Omit<ParallaxMouseOptions, "root" | "strengthX" | "strengthY">
> & {
    strengthX?: number;
    strengthY?: number;
} = {
    strength: 0.02,
    strengthX: undefined,
    strengthY: undefined,
    duration: 0.4,
    ease: "power3.out",
    resetOnLeave: true,
    resetDuration: 0.6,
};

/**
 * Container listens for mouse movement; target(s) move relative to cursor position within container.
 */
export function createParallaxMouse(
    containerSelector: ElementSelector,
    targetSelector: ElementSelector,
    options: ParallaxMouseOptions = {}
): EffectInstance {
    const g = guard({ requireHover: true });
    if (!g.ok) return g.instance;

    const opts = { ...defaultParallaxMouseOptions, ...options };
    const strengthX = opts.strengthX ?? opts.strength;
    const strengthY = opts.strengthY ?? opts.strength;

    // Resolve containers (optionally scoped)
    const containers = resolveElements(containerSelector, opts.root);
    const cleanup = createCleanup();

    for (const container of containers) {
        const containerEl = container as HTMLElement;

        // IMPORTANT: resolve targets *within the container* by default.
        // If user passes actual elements, resolveElements will just use them.
        const targets =
            typeof targetSelector === "string"
                ? resolveElements(targetSelector, containerEl)
                : resolveElements(targetSelector, opts.root);

        const handleMouseMove = (e: MouseEvent) => {
            const rect = containerEl.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            for (const target of targets) {
                gsap.to(target, {
                    x: x * strengthX,
                    y: y * strengthY,
                    duration: opts.duration,
                    ease: opts.ease,
                    overwrite: "auto",
                });
            }
        };

        const handleMouseLeave = () => {
            if (!opts.resetOnLeave) return;

            for (const target of targets) {
                gsap.to(target, {
                    x: 0,
                    y: 0,
                    duration: opts.resetDuration,
                    ease: opts.ease,
                    overwrite: "auto",
                });
            }
        };

        cleanup.on(containerEl, "mousemove", handleMouseMove);
        cleanup.on(containerEl, "mouseleave", handleMouseLeave);

        cleanup.add(() => {
            for (const target of targets) {
                gsap.killTweensOf(target);
                gsap.set(target, { clearProps: "x,y" });
            }
        });
    }

    return {
        destroy: () => cleanup.destroy(),
    };
}

/* -------------------------------------------------------------------------- */
/*                                 Scroll Fade                                */
/* -------------------------------------------------------------------------- */

export interface ScrollFadeOptions {
    /** Optional root for scoping selector queries */
    root?: ParentNode;

    /** Fade start scroll position (px) */
    startY?: number;

    /** Fully faded at this scroll position (px) */
    endY?: number;

    /** Minimum opacity */
    minOpacity?: number;

    /** Parallax Y movement multiplier */
    parallaxStrength?: number;

    /** Animation duration for smoothness */
    duration?: number;
}

const defaultScrollFadeOptions: Required<Omit<ScrollFadeOptions, "root">> = {
    startY: 0,
    endY: 600,
    minOpacity: 0.85,
    parallaxStrength: 0.08,
    duration: 0.3,
};

export function createScrollFade(
    selector: ElementSelector,
    options: ScrollFadeOptions = {}
): EffectInstance {
    if (!hasWindow()) return noopInstance();
    const g = guard();
    if (!g.ok) return g.instance;

    const opts = { ...defaultScrollFadeOptions, ...options };
    const elements = resolveElements(selector, opts.root);
    const cleanup = createCleanup();
    let ticking = false;

    const handleScroll = () => {
        if (ticking) return;

        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            const denom = Math.max(1, opts.endY - opts.startY);

            for (const element of elements) {
                const progress = Math.min(
                    Math.max((y - opts.startY) / denom, 0),
                    1
                );
                const opacity = 1 - progress * (1 - opts.minOpacity);

                gsap.to(element, {
                    y: y * opts.parallaxStrength,
                    opacity,
                    duration: opts.duration,
                    overwrite: "auto",
                });
            }

            ticking = false;
        });
    };

    cleanup.on(window, "scroll", handleScroll, { passive: true });
    handleScroll();

    cleanup.add(() => {
        for (const el of elements) {
            gsap.killTweensOf(el);
            gsap.set(el, { clearProps: "y,opacity" });
        }
    });

    return {
        destroy: () => cleanup.destroy(),
    };
}

/* -------------------------------------------------------------------------- */
/*                              Background Drift                              */
/* -------------------------------------------------------------------------- */

export interface BackgroundDriftOptions {
    /** Optional root for scoping selector queries */
    root?: ParentNode;

    /** Starting background position */
    startPosition?: string;

    /** Ending background position */
    endPosition?: string;

    /** Duration for one direction */
    duration?: number;

    /** Easing function */
    ease?: string;
}

const defaultBgDriftOptions: Required<Omit<BackgroundDriftOptions, "root">> = {
    startPosition: "50% 0%",
    endPosition: "50% 12%",
    duration: 12,
    ease: "sine.inOut",
};

export function createBackgroundDrift(
    selector: ElementSelector,
    options: BackgroundDriftOptions = {}
): EffectInstance {
    const g = guard();
    if (!g.ok) return g.instance;

    const opts = { ...defaultBgDriftOptions, ...options };
    const elements = resolveElements(selector, opts.root);
    const cleanup = createCleanup();
    const tweens: gsap.core.Tween[] = [];

    for (const element of elements) {
        gsap.set(element, { backgroundPosition: opts.startPosition });

        const tween = gsap.to(element, {
            backgroundPosition: opts.endPosition,
            duration: opts.duration,
            ease: opts.ease,
            yoyo: true,
            repeat: -1,
        });

        tweens.push(tween);

        cleanup.add(() => {
            tween.kill();
            gsap.set(element, { clearProps: "backgroundPosition" });
        });
    }

    return {
        destroy: () => cleanup.destroy(),
        pause: () => {
            for (const tween of tweens) tween.pause();
        },
        resume: () => {
            for (const tween of tweens) tween.resume();
        },
    };
}