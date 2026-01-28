import {gsap} from 'gsap';
import {type EffectInstance, type ElementSelector,} from '../types';
import {prefersReducedMotion, resolveElements, supportsHover} from "../utils/dom.ts";

export interface MagneticOptions {
    /** How much the element moves toward cursor (0-1) */
    strength?: number;
    /** How much inner content moves (0-1) */
    innerStrength?: number;
    /** Selector for inner element (defaults to first child) */
    innerSelector?: string;
    /** Animation duration */
    duration?: number;
    /** Easing for movement */
    ease?: string;
    /** Easing for return animation */
    returnEase?: string;
    /** Duration for return animation */
    returnDuration?: number;
}

const defaultOptions: Required<MagneticOptions> = {
    strength: 0.3,
    innerStrength: 0.2,
    innerSelector: '',
    duration: 0.4,
    ease: 'power3.out',
    returnEase: 'elastic.out(1, 0.5)',
    returnDuration: 0.6,
};

/**
 * Creates a magnetic effect on elements that pull toward the cursor
 *
 * @example
 * ```ts
 * // Basic usage
 * const magnetic = createMagnetic('.btn');
 *
 * // With options
 * const magnetic = createMagnetic('.nav-link', {
 *   strength: 0.5,
 *   innerStrength: 0.3,
 * });
 *
 * // Cleanup
 * magnetic.destroy();
 * ```
 */
export function createMagnetic(
    selector: ElementSelector,
    options: MagneticOptions = {}
): EffectInstance {
    // Skip if reduced motion preferred or no hover support
    if (prefersReducedMotion() || !supportsHover()) {
        return { destroy: () => {} };
    }

    const opts = { ...defaultOptions, ...options };
    const elements = resolveElements(selector);
    const cleanupFns: Array<() => void> = [];

    elements.forEach((element: Element) => {
        const el = element as HTMLElement;
        const inner = opts.innerSelector
            ? el.querySelector(opts.innerSelector)
            : el.firstElementChild;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(el, {
                x: x * opts.strength,
                y: y * opts.strength,
                duration: opts.duration,
                ease: opts.ease,
            });

            if (inner) {
                gsap.to(inner, {
                    x: x * opts.innerStrength,
                    y: y * opts.innerStrength,
                    duration: opts.duration,
                    ease: opts.ease,
                });
            }
        };

        const handleMouseLeave = () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: opts.returnDuration,
                ease: opts.returnEase,
            });

            if (inner) {
                gsap.to(inner, {
                    x: 0,
                    y: 0,
                    duration: opts.returnDuration,
                    ease: opts.returnEase,
                });
            }
        };

        el.addEventListener('mousemove', handleMouseMove);
        el.addEventListener('mouseleave', handleMouseLeave);

        cleanupFns.push(() => {
            el.removeEventListener('mousemove', handleMouseMove);
            el.removeEventListener('mouseleave', handleMouseLeave);
            gsap.killTweensOf(el);
            if (inner) gsap.killTweensOf(inner);
        });
    });

    return {
        destroy: () => {
            cleanupFns.forEach((fn) => fn());
        },
    };
}

/**
 * Auto-initialize magnetic effect on elements with data-magnetic attribute
 *
 * @example
 * ```html
 * <button data-magnetic data-magnetic-strength="0.5">Click me</button>
 * ```
 *
 * ```ts
 * initMagnetic(); // Call once on page load
 * ```
 */
export function initMagnetic(): EffectInstance {
    const elements = document.querySelectorAll('[data-magnetic]');
    const instances: EffectInstance[] = [];

    elements.forEach((el) => {
        const options: MagneticOptions = {
            strength: parseFloat(el.getAttribute('data-magnetic-strength') || '0.3'),
            innerStrength: parseFloat(el.getAttribute('data-magnetic-inner-strength') || '0.2'),
            innerSelector: el.getAttribute('data-magnetic-inner') || '',
        };

        instances.push(createMagnetic(el, options));
    });

    return {
        destroy: () => {
            instances.forEach((instance) => instance.destroy());
        },
    };
}

export default createMagnetic;