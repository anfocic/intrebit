import {gsap} from 'gsap';
import {type EffectInstance, type ElementSelector,} from '../types';
import {prefersReducedMotion, resolveElements} from "../utils/dom.ts";

export interface BreathingOptions {
    /** Y offset for breathing motion */
    yOffset?: number;
    /** X offset for breathing motion (optional) */
    xOffset?: number;
    /** Scale variation (optional, e.g., 1.02 for subtle pulse) */
    scale?: number;
    /** Animation duration (one direction) */
    duration?: number;
    /** Easing function */
    ease?: string;
    /** Delay before starting */
    delay?: number;
}

const defaultOptions: Required<Omit<BreathingOptions, 'xOffset' | 'scale'>> & {
    xOffset?: number;
    scale?: number;
} = {
    yOffset: -2,
    xOffset: undefined,
    scale: undefined,
    duration: 3.6,
    ease: 'sine.inOut',
    delay: 0,
};

/**
 * Creates a subtle breathing/floating animation that loops infinitely
 * Perfect for hero titles or floating elements
 *
 * @example
 * ```ts
 * // Basic breathing (Y axis only)
 * const breathing = createBreathing('.hero-title');
 *
 * // With X movement too
 * const breathing = createBreathing('.floating-element', {
 *   yOffset: -5,
 *   xOffset: 3,
 *   duration: 4,
 * });
 *
 * // With scale pulse
 * const breathing = createBreathing('.logo', {
 *   yOffset: 0,
 *   scale: 1.02,
 *   duration: 2,
 * });
 *
 * // Pause/resume
 * breathing.pause?.();
 * breathing.resume?.();
 *
 * // Cleanup
 * breathing.destroy();
 * ```
 */
export function createBreathing(
    selector: ElementSelector,
    options: BreathingOptions = {}
): EffectInstance {
    if (prefersReducedMotion()) {
        return { destroy: () => {}, pause: () => {}, resume: () => {} };
    }

    const opts = { ...defaultOptions, ...options };
    const elements = resolveElements(selector);
    const tweens: gsap.core.Tween[] = [];

    elements.forEach((element) => {
        const animProps: gsap.TweenVars = {
            duration: opts.duration,
            ease: opts.ease,
            yoyo: true,
            repeat: -1,
            delay: opts.delay,
        };

        if (opts.yOffset !== undefined && opts.yOffset !== 0) {
            animProps.y = opts.yOffset;
        }

        if (opts.xOffset !== undefined) {
            animProps.x = opts.xOffset;
        }

        if (opts.scale !== undefined) {
            animProps.scale = opts.scale;
        }

        const tween = gsap.to(element, animProps);
        tweens.push(tween);
    });

    return {
        destroy: () => {
            tweens.forEach((tween) => tween.kill());
            elements.forEach((el) => {
                gsap.set(el, { clearProps: 'y,x,scale' });
            });
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
 * Auto-initialize breathing on elements with data-breathing attribute
 *
 * @example
 * ```html
 * <h1 data-breathing data-breathing-y="-3" data-breathing-duration="4">
 *   Floating Title
 * </h1>
 * ```
 */
export function initBreathing(): EffectInstance {
    const elements = document.querySelectorAll('[data-breathing]');
    const instances: EffectInstance[] = [];

    elements.forEach((el) => {
        const options: BreathingOptions = {
            yOffset: parseFloat(el.getAttribute('data-breathing-y') || '-2'),
            xOffset: el.hasAttribute('data-breathing-x')
                ? parseFloat(el.getAttribute('data-breathing-x') || '0')
                : undefined,
            scale: el.hasAttribute('data-breathing-scale')
                ? parseFloat(el.getAttribute('data-breathing-scale') || '1')
                : undefined,
            duration: parseFloat(el.getAttribute('data-breathing-duration') || '3.6'),
            delay: parseFloat(el.getAttribute('data-breathing-delay') || '0'),
        };

        instances.push(createBreathing(el, options));
    });

    return {
        destroy: () => {
            instances.forEach((i) => i.destroy());
        },
        pause: () => {
            instances.forEach((i) => i.pause?.());
        },
        resume: () => {
            instances.forEach((i) => i.resume?.());
        },
    };
}