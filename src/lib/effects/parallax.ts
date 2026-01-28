import {gsap} from 'gsap';
import {type EffectInstance, type ElementSelector,} from '../types';
import {prefersReducedMotion, resolveElements, supportsHover} from "../utils/dom.ts";

export interface ParallaxMouseOptions {
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

const defaultOptions: Required<Omit<ParallaxMouseOptions, 'strengthX' | 'strengthY'>> & {
    strengthX?: number;
    strengthY?: number;
} = {
    strength: 0.02,
    strengthX: undefined,
    strengthY: undefined,
    duration: 0.4,
    ease: 'power3.out',
    resetOnLeave: true,
    resetDuration: 0.6,
};

/**
 * Creates a parallax effect where elements follow the mouse cursor
 * The element moves opposite to cursor direction for a depth effect
 *
 * @example
 * ```ts
 * // Basic parallax on hero title
 * const parallax = createParallaxMouse('.hero-inner', '.hero-title');
 *
 * // Stronger effect
 * const parallax = createParallaxMouse('.container', '.floating-element', {
 *   strength: 0.05,
 * });
 *
 * // Different X/Y strength
 * const parallax = createParallaxMouse('.hero', '.title', {
 *   strengthX: 0.03,
 *   strengthY: 0.01,
 * });
 *
 * // Cleanup
 * parallax.destroy();
 * ```
 */
export function createParallaxMouse(
    containerSelector: ElementSelector,
    targetSelector: ElementSelector,
    options: ParallaxMouseOptions = {}
): EffectInstance {
    if (prefersReducedMotion() || !supportsHover()) {
        return { destroy: () => {} };
    }

    const opts = { ...defaultOptions, ...options };
    const containers = resolveElements(containerSelector);
    const cleanupFns: Array<() => void> = [];

    const strengthX = opts.strengthX ?? opts.strength;
    const strengthY = opts.strengthY ?? opts.strength;

    containers.forEach((container: Element) => {
        const targets = resolveElements(targetSelector);

        const handleMouseMove = (e: Event) => {
            const mouseEvent = e as MouseEvent;
            const rect = (container as HTMLElement).getBoundingClientRect();
            const x = mouseEvent.clientX - rect.left - rect.width / 2;
            const y = mouseEvent.clientY - rect.top - rect.height / 2;

            targets.forEach((target: Element) => {
                gsap.to(target, {
                    x: x * strengthX,
                    y: y * strengthY,
                    duration: opts.duration,
                    ease: opts.ease,
                    overwrite: true,
                });
            });
        };

        const handleMouseLeave = () => {
            if (!opts.resetOnLeave) return;

            targets.forEach((target) => {
                gsap.to(target, {
                    x: 0,
                    y: 0,
                    duration: opts.resetDuration,
                    ease: opts.ease,
                    overwrite: true,
                });
            });
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        cleanupFns.push(() => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            targets.forEach((target) => gsap.killTweensOf(target));
        });
    });

    return {
        destroy: () => {
            cleanupFns.forEach((fn) => fn());
        },
    };
}

export interface ScrollFadeOptions {
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

const defaultScrollFadeOptions: Required<ScrollFadeOptions> = {
    startY: 0,
    endY: 600,
    minOpacity: 0.85,
    parallaxStrength: 0.08,
    duration: 0.3,
};

/**
 * Creates a scroll-based fade and parallax effect
 * Element fades and moves as user scrolls down
 *
 * @example
 * ```ts
 * // Basic scroll fade
 * const scrollFade = createScrollFade('.hero-inner');
 *
 * // Customized
 * const scrollFade = createScrollFade('.hero-content', {
 *   endY: 400,
 *   minOpacity: 0,
 *   parallaxStrength: 0.1,
 * });
 *
 * // Cleanup
 * scrollFade.destroy();
 * ```
 */
export function createScrollFade(
    selector: ElementSelector,
    options: ScrollFadeOptions = {}
): EffectInstance {
    if (prefersReducedMotion()) {
        return { destroy: () => {} };
    }

    const opts = { ...defaultScrollFadeOptions, ...options };
    const elements = resolveElements(selector);
    let ticking = false;

    const handleScroll = () => {
        if (ticking) return;

        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;

            elements.forEach((element) => {
                // Calculate opacity based on scroll position
                const progress = Math.min(Math.max((y - opts.startY) / (opts.endY - opts.startY), 0), 1);
                const opacity = 1 - progress * (1 - opts.minOpacity);

                gsap.to(element, {
                    y: y * opts.parallaxStrength,
                    opacity,
                    duration: opts.duration,
                    overwrite: true,
                });
            });

            ticking = false;
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial call
    handleScroll();

    return {
        destroy: () => {
            window.removeEventListener('scroll', handleScroll);
            elements.forEach((el) => {
                gsap.killTweensOf(el);
                gsap.set(el, { clearProps: 'y,opacity' });
            });
        },
    };
}

/**
 * Creates a background parallax drift effect
 * Background position shifts slowly in a loop
 *
 * @example
 * ```ts
 * const bgDrift = createBackgroundDrift('.hero-section', {
 *   startPosition: '50% 0%',
 *   endPosition: '50% 12%',
 *   duration: 12,
 * });
 * ```
 */
export interface BackgroundDriftOptions {
    /** Starting background position */
    startPosition?: string;
    /** Ending background position */
    endPosition?: string;
    /** Duration for one direction */
    duration?: number;
    /** Easing function */
    ease?: string;
}

const defaultBgDriftOptions: Required<BackgroundDriftOptions> = {
    startPosition: '50% 0%',
    endPosition: '50% 12%',
    duration: 12,
    ease: 'sine.inOut',
};

export function createBackgroundDrift(
    selector: ElementSelector,
    options: BackgroundDriftOptions = {}
): EffectInstance {
    if (prefersReducedMotion()) {
        return { destroy: () => {}, pause: () => {}, resume: () => {} };
    }

    const opts = { ...defaultBgDriftOptions, ...options };
    const elements = resolveElements(selector);
    const tweens: gsap.core.Tween[] = [];

    elements.forEach((element) => {
        gsap.set(element, { backgroundPosition: opts.startPosition });

        const tween = gsap.to(element, {
            backgroundPosition: opts.endPosition,
            duration: opts.duration,
            ease: opts.ease,
            yoyo: true,
            repeat: -1,
        });

        tweens.push(tween);
    });

    return {
        destroy: () => {
            tweens.forEach((tween) => tween.kill());
            elements.forEach((el) => gsap.set(el, { clearProps: 'backgroundPosition' }));
        },
        pause: () => {
            tweens.forEach((tween) => tween.pause());
        },
        resume: () => {
            tweens.forEach((tween) => tween.resume());
        },
    };
}

/**
 * Auto-initialize parallax effects from data attributes
 */
export function initParallaxEffects(): EffectInstance {
    const instances: EffectInstance[] = [];

    // Parallax mouse
    document.querySelectorAll('[data-parallax-mouse]').forEach((container) => {
        const targetSelector = container.getAttribute('data-parallax-target') || container.getAttribute('data-parallax-mouse');
        if (targetSelector) {
            const options: ParallaxMouseOptions = {
                strength: parseFloat(container.getAttribute('data-parallax-strength') || '0.02'),
            };
            instances.push(createParallaxMouse(container, targetSelector, options));
        }
    });

    // Scroll fade
    document.querySelectorAll('[data-scroll-fade]').forEach((el) => {
        const options: ScrollFadeOptions = {
            endY: parseFloat(el.getAttribute('data-scroll-fade-end') || '600'),
            minOpacity: parseFloat(el.getAttribute('data-scroll-fade-min-opacity') || '0.85'),
            parallaxStrength: parseFloat(el.getAttribute('data-scroll-fade-parallax') || '0.08'),
        };
        instances.push(createScrollFade(el, options));
    });

    // Background drift
    document.querySelectorAll('[data-bg-drift]').forEach((el) => {
        const options: BackgroundDriftOptions = {
            endPosition: el.getAttribute('data-bg-drift-end') || '50% 12%',
            duration: parseFloat(el.getAttribute('data-bg-drift-duration') || '12'),
        };
        instances.push(createBackgroundDrift(el, options));
    });

    return {
        destroy: () => {
            instances.forEach((i) => i.destroy());
        },
    };
}