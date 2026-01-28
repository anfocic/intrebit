import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {type AnimationTrigger, type EffectInstance, type ElementSelector,} from '../types';
import {prefersReducedMotion, resolveElements} from "../utils/dom.ts";
// Register ScrollTrigger
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export type SplitTextAnimation =
    | 'cascade'
    | 'wave'
    | 'spring'
    | 'blur'
    | 'rotate'
    | 'scale'
    | 'glitch'
    | 'fade';

export interface SplitTextOptions {
    /** Animation type */
    animation?: SplitTextAnimation;
    /** Duration for each character animation */
    duration?: number;
    /** Stagger delay between characters */
    stagger?: number;
    /** Initial delay before animation starts */
    delay?: number;
    /** When to trigger animation */
    trigger?: AnimationTrigger;
    /** Loop animation (only for wave) */
    loop?: boolean;
    /** ScrollTrigger start position */
    scrollStart?: string;
    /** Custom class for character spans */
    charClass?: string;
    /** Callback when animation completes */
    onComplete?: () => void;
}

const defaultOptions: Required<Omit<SplitTextOptions, 'onComplete'>> & {
    onComplete?: () => void;
} = {
    animation: 'cascade',
    duration: 0.8,
    stagger: 0.08,
    delay: 0,
    trigger: 'load',
    loop: false,
    scrollStart: 'top 85%',
    charClass: 'split-char',
    onComplete: undefined,
};

/** Split text into individual character spans */
function splitIntoChars(element: HTMLElement, charClass: string): HTMLSpanElement[] {
    const text = element.textContent || '';
    element.setAttribute('aria-label', text);
    element.innerHTML = '';

    const chars: HTMLSpanElement[] = [];

    text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.className = charClass;
        span.style.display = 'inline-block';
        span.style.willChange = 'transform, opacity, filter';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--char-index', i.toString());
        element.appendChild(span);
        chars.push(span);
    });

    return chars;
}

/** Animation implementations */
const animations: Record<
    SplitTextAnimation,
    (
        chars: HTMLSpanElement[],
        opts: Required<Omit<SplitTextOptions, 'onComplete'>> & { onComplete?: () => void }
    ) => gsap.core.Timeline | gsap.core.Tween
> = {
    cascade: (chars, opts) => {
        gsap.set(chars, { opacity: 0, y: -50, rotateX: -90 });
        return gsap.to(chars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: opts.duration,
            stagger: opts.stagger,
            ease: 'back.out(1.7)',
            onComplete: opts.onComplete,
        });
    },

    wave: (chars, opts) => {
        gsap.set(chars, { opacity: 1, y: 0 });
        return gsap.to(chars, {
            y: -12,
            duration: opts.duration * 0.5,
            stagger: {
                each: opts.stagger,
                repeat: opts.loop ? -1 : 0,
                yoyo: true,
            },
            ease: 'sine.inOut',
            onComplete: opts.loop ? undefined : opts.onComplete,
        });
    },

    spring: (chars, opts) => {
        gsap.set(chars, { opacity: 0, scale: 0, y: 20 });
        return gsap.to(chars, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: opts.duration,
            stagger: opts.stagger,
            ease: 'elastic.out(1, 0.4)',
            onComplete: opts.onComplete,
        });
    },

    blur: (chars, opts) => {
        gsap.set(chars, { opacity: 0, filter: 'blur(20px)', x: -20 });
        return gsap.to(chars, {
            opacity: 1,
            filter: 'blur(0px)',
            x: 0,
            duration: opts.duration,
            stagger: opts.stagger,
            ease: 'power2.out',
            onComplete: opts.onComplete,
        });
    },

    rotate: (chars, opts) => {
        gsap.set(chars, { opacity: 0, rotateY: 90, transformOrigin: 'center center' });
        return gsap.to(chars, {
            opacity: 1,
            rotateY: 0,
            duration: opts.duration,
            stagger: opts.stagger,
            ease: 'power3.out',
            onComplete: opts.onComplete,
        });
    },

    scale: (chars, opts) => {
        gsap.set(chars, { opacity: 0, scale: 3 });
        return gsap.to(chars, {
            opacity: 1,
            scale: 1,
            duration: opts.duration,
            stagger: opts.stagger,
            ease: 'back.out(2)',
            onComplete: opts.onComplete,
        });
    },

    glitch: (chars, opts) => {
        const tl = gsap.timeline({ onComplete: opts.onComplete });

        chars.forEach((char, i) => {
            const charTl = gsap.timeline();

            // Glitch sequence
            for (let j = 0; j < 5; j++) {
                charTl.to(char, {
                    x: gsap.utils.random(-5, 5),
                    y: gsap.utils.random(-3, 3),
                    opacity: gsap.utils.random(0.5, 1),
                    color: j % 2 === 0 ? '#ff0055' : '#00ffff',
                    duration: 0.05,
                });
            }

            // Settle
            charTl.to(char, {
                x: 0,
                y: 0,
                opacity: 1,
                color: 'inherit',
                duration: 0.1,
            });

            tl.add(charTl, i * opts.stagger);
        });

        return tl;
    },

    fade: (chars, opts) => {
        gsap.set(chars, { opacity: 0 });
        return gsap.to(chars, {
            opacity: 1,
            duration: opts.duration,
            stagger: opts.stagger,
            ease: 'power2.out',
            onComplete: opts.onComplete,
        });
    },
};

/**
 * Creates letter-by-letter text animations
 *
 * @example
 * ```ts
 * // Basic cascade animation
 * const split = createSplitText('.hero-title', {
 *   animation: 'cascade',
 * });
 *
 * // Wave animation (loops)
 * const split = createSplitText('.title', {
 *   animation: 'wave',
 *   loop: true,
 * });
 *
 * // On scroll
 * const split = createSplitText('.section-title', {
 *   animation: 'spring',
 *   trigger: 'scroll',
 * });
 *
 * // Replay
 * split.replay?.();
 *
 * // Cleanup
 * split.destroy();
 * ```
 */
export function createSplitText(
    selector: ElementSelector,
    options: SplitTextOptions = {}
): EffectInstance {
    if (prefersReducedMotion()) {
        return { destroy: () => {} };
    }

    const opts = { ...defaultOptions, ...options };
    const elements = resolveElements(selector);
    const cleanupFns: Array<() => void> = [];
    const charArrays: HTMLSpanElement[][] = [];
    let currentAnimation: gsap.core.Timeline | gsap.core.Tween | null = null;

    const runAnimation = (chars: HTMLSpanElement[]) => {
        const animationFn = animations[opts.animation];
        if (animationFn) {
            currentAnimation = animationFn(chars, opts);
        }
    };

    elements.forEach((element) => {
        const el = element as HTMLElement;

        // Store original text
        const originalText = el.textContent || '';
        el.dataset.originalText = originalText;

        // Split into characters
        const chars = splitIntoChars(el, opts.charClass);
        charArrays.push(chars);

        // Set initial hidden state (except wave)
        if (opts.animation !== 'wave') {
            gsap.set(chars, { opacity: 0 });
        }

        if (opts.trigger === 'load') {
            setTimeout(() => runAnimation(chars), opts.delay * 1000);
        } else if (opts.trigger === 'scroll') {
            const scrollTrigger = ScrollTrigger.create({
                trigger: el,
                start: opts.scrollStart,
                onEnter: () => {
                    setTimeout(() => runAnimation(chars), opts.delay * 1000);
                },
                once: true,
            });

            cleanupFns.push(() => scrollTrigger.kill());
        } else if (opts.trigger === 'hover') {
            // Show text initially
            gsap.set(chars, { opacity: 1 });

            const handleMouseEnter = () => runAnimation(chars);
            el.addEventListener('mouseenter', handleMouseEnter);
            cleanupFns.push(() => el.removeEventListener('mouseenter', handleMouseEnter));
        }
    });

    return {
        destroy: () => {
            if (currentAnimation) {
                currentAnimation.kill();
            }
            charArrays.flat().forEach((char) => gsap.killTweensOf(char));
            cleanupFns.forEach((fn) => fn());

            // Restore original text
            elements.forEach((el) => {
                const htmlEl = el as HTMLElement;
                if (htmlEl.dataset.originalText) {
                    htmlEl.textContent = htmlEl.dataset.originalText;
                }
            });
        },
        replay: () => {
            if (currentAnimation) {
                currentAnimation.kill();
            }
            charArrays.forEach((chars) => {
                // Reset and replay
                const animationFn = animations[opts.animation];
                if (animationFn) {
                    currentAnimation = animationFn(chars, opts);
                }
            });
        },
    };
}

/**
 * Auto-initialize split text on elements with data-split-text attribute
 *
 * @example
 * ```html
 * <h1 data-split-text data-split-text-animation="cascade">
 *   Hello World
 * </h1>
 * ```
 */
export function initSplitText(): EffectInstance {
    const elements = document.querySelectorAll('[data-split-text]');
    const instances: EffectInstance[] = [];

    elements.forEach((el) => {
        const options: SplitTextOptions = {
            animation: (el.getAttribute('data-split-text-animation') as SplitTextAnimation) || 'cascade',
            duration: parseFloat(el.getAttribute('data-split-text-duration') || '0.8'),
            stagger: parseFloat(el.getAttribute('data-split-text-stagger') || '0.08'),
            delay: parseFloat(el.getAttribute('data-split-text-delay') || '0'),
            trigger: (el.getAttribute('data-split-text-trigger') as AnimationTrigger) || 'load',
            loop: el.getAttribute('data-split-text-loop') === 'true',
        };

        instances.push(createSplitText(el, options));
    });

    return {
        destroy: () => {
            instances.forEach((instance) => instance.destroy());
        },
    };
}

export default createSplitText;