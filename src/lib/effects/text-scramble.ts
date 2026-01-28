import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {type AnimationTrigger, type EffectInstance, type ElementSelector} from '../types';
import {prefersReducedMotion, resolveElements} from "../utils/dom.ts";
// Register ScrollTrigger
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export interface TextScrambleOptions {
    /** Text to reveal (if not using element's textContent) */
    text?: string;
    /** Characters to use for scrambling */
    chars?: string;
    /** Animation duration in seconds */
    duration?: number;
    /** Delay before animation starts */
    delay?: number;
    /** When to trigger animation */
    trigger?: AnimationTrigger;
    /** ScrollTrigger start position */
    scrollStart?: string;
    /** Callback when animation completes */
    onComplete?: () => void;
}

const defaultChars = '!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const defaultOptions: Required<Omit<TextScrambleOptions, 'text' | 'onComplete'>> & {
    text?: string;
    onComplete?: () => void;
} = {
    text: undefined,
    chars: defaultChars,
    duration: 1.5,
    delay: 0,
    trigger: 'load',
    scrollStart: 'top 85%',
    onComplete: undefined,
};

/**
 * Scrambles text character by character, revealing the final text progressively
 */
function scrambleText(
    element: HTMLElement,
    finalText: string,
    duration: number,
    chars: string,
    onComplete?: () => void
): { stop: () => void } {
    const length = finalText.length;
    let iterations = 0;
    const maxIterations = duration * 60; // ~60fps
    const revealPoint = maxIterations * 0.3; // Start revealing at 30%
    let stopped = false;

    element.textContent = '';
    element.setAttribute('aria-label', finalText);

    const interval = setInterval(() => {
        if (stopped) {
            clearInterval(interval);
            return;
        }

        let result = '';
        for (let i = 0; i < length; i++) {
            const charRevealPoint = revealPoint + (i / length) * (maxIterations - revealPoint);

            if (iterations > charRevealPoint) {
                result += finalText[i];
            } else if (finalText[i] === ' ') {
                result += ' ';
            } else {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
        }

        element.textContent = result;
        iterations++;

        if (iterations >= maxIterations) {
            clearInterval(interval);
            element.textContent = finalText;
            onComplete?.();
        }
    }, 1000 / 60);

    return {
        stop: () => {
            stopped = true;
            clearInterval(interval);
            element.textContent = finalText;
        },
    };
}

/**
 * Creates a text scramble/decode effect
 *
 * @example
 * ```ts
 * // Basic usage
 * const scramble = createTextScramble('.tagline', {
 *   text: 'No buzzwords. No nonsense.',
 * });
 *
 * // On scroll
 * const scramble = createTextScramble('.headline', {
 *   trigger: 'scroll',
 *   duration: 2,
 * });
 *
 * // On hover
 * const scramble = createTextScramble('.hover-text', {
 *   trigger: 'hover',
 * });
 *
 * // Replay
 * scramble.replay?.();
 *
 * // Cleanup
 * scramble.destroy();
 * ```
 */
export function createTextScramble(
    selector: ElementSelector,
    options: TextScrambleOptions = {}
): EffectInstance {
    if (prefersReducedMotion()) {
        // Just show the text immediately
        const elements = resolveElements(selector);
        elements.forEach((el) => {
            const text = options.text || (el as HTMLElement).textContent || '';
            (el as HTMLElement).textContent = text;
        });
        return { destroy: () => {} };
    }

    const opts = { ...defaultOptions, ...options };
    const elements = resolveElements(selector);
    const cleanupFns: Array<() => void> = [];
    const activeScrambles: Array<{ stop: () => void }> = [];

    const runScramble = (el: HTMLElement) => {
        const text = opts.text || el.dataset.text || el.textContent || '';

        // Store original text
        if (!el.dataset.originalText) {
            el.dataset.originalText = text;
        }

        const scramble = scrambleText(el, text, opts.duration, opts.chars, opts.onComplete);
        activeScrambles.push(scramble);
        return scramble;
    };

    elements.forEach((element) => {
        const el = element as HTMLElement;
        const text = opts.text || el.textContent || '';

        // Store text and clear for load/scroll triggers
        el.dataset.text = text;

        if (opts.trigger === 'load') {
            el.textContent = '';
            setTimeout(() => runScramble(el), opts.delay * 1000);
        } else if (opts.trigger === 'scroll') {
            el.textContent = '';

            const scrollTrigger = ScrollTrigger.create({
                trigger: el,
                start: opts.scrollStart,
                onEnter: () => {
                    setTimeout(() => runScramble(el), opts.delay * 1000);
                },
                once: true,
            });

            cleanupFns.push(() => scrollTrigger.kill());
        } else if (opts.trigger === 'hover') {
            // Keep text visible, scramble on hover
            const handleMouseEnter = () => {
                runScramble(el);
            };

            el.addEventListener('mouseenter', handleMouseEnter);
            cleanupFns.push(() => el.removeEventListener('mouseenter', handleMouseEnter));
        }
    });

    return {
        destroy: () => {
            activeScrambles.forEach((s) => s.stop());
            cleanupFns.forEach((fn) => fn());
        },
        replay: () => {
            activeScrambles.forEach((s) => s.stop());
            activeScrambles.length = 0;
            elements.forEach((el) => runScramble(el as HTMLElement));
        },
    };
}

/**
 * Auto-initialize text scramble on elements with data-text-scramble attribute
 *
 * @example
 * ```html
 * <p data-text-scramble data-text-scramble-trigger="scroll">
 *   This text will scramble in
 * </p>
 * ```
 */
export function initTextScramble(): EffectInstance {
    const elements = document.querySelectorAll('[data-text-scramble]');
    const instances: EffectInstance[] = [];

    elements.forEach((el) => {
        const options: TextScrambleOptions = {
            duration: parseFloat(el.getAttribute('data-text-scramble-duration') || '1.5'),
            delay: parseFloat(el.getAttribute('data-text-scramble-delay') || '0'),
            trigger: (el.getAttribute('data-text-scramble-trigger') as AnimationTrigger) || 'load',
            chars: el.getAttribute('data-text-scramble-chars') || defaultChars,
        };

        instances.push(createTextScramble(el, options));
    });

    return {
        destroy: () => {
            instances.forEach((instance) => instance.destroy());
        },
    };
}

export default createTextScramble;