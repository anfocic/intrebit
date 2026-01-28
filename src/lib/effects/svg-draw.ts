import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    type ElementSelector,
    type EffectInstance,
    type AnimationTrigger,
} from '../types';
import {prefersReducedMotion, resolveElements} from "../utils/dom.ts";

// Register ScrollTrigger
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export interface SvgDrawOptions {
    /** Animation duration in seconds */
    duration?: number;
    /** Delay before animation starts */
    delay?: number;
    /** When to trigger animation */
    trigger?: AnimationTrigger;
    /** Easing function */
    ease?: string;
    /** ScrollTrigger start position */
    scrollStart?: string;
    /** Whether to reverse on hover leave (for hover trigger) */
    reverseOnLeave?: boolean;
    /** Stagger delay for multiple paths */
    stagger?: number;
    /** Callback when animation completes */
    onComplete?: () => void;
}

const defaultOptions: Required<Omit<SvgDrawOptions, 'onComplete'>> & {
    onComplete?: () => void;
} = {
    duration: 1.2,
    delay: 0,
    trigger: 'load',
    ease: 'power2.inOut',
    scrollStart: 'top 80%',
    reverseOnLeave: true,
    stagger: 0.2,
    onComplete: undefined,
};

/** Calculate the total length of an SVG path */
function getPathLength(path: SVGPathElement): number {
    return path.getTotalLength();
}

/** Prepare a path for draw animation */
function preparePath(path: SVGPathElement): void {
    const length = getPathLength(path);
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
}

/**
 * Creates an SVG line draw animation
 *
 * @example
 * ```ts
 * // Draw all paths in an SVG
 * const draw = createSvgDraw('.my-svg path');
 *
 * // Draw on scroll
 * const draw = createSvgDraw('#logo path', {
 *   trigger: 'scroll',
 *   duration: 2,
 * });
 *
 * // Draw on hover
 * const draw = createSvgDraw('.icon path', {
 *   trigger: 'hover',
 *   reverseOnLeave: true,
 * });
 *
 * // Replay
 * draw.replay?.();
 *
 * // Cleanup
 * draw.destroy();
 * ```
 */
export function createSvgDraw(
    selector: ElementSelector,
    options: SvgDrawOptions = {}
): EffectInstance {
    if (prefersReducedMotion()) {
        // Show paths immediately
        const elements = resolveElements(selector);
        elements.forEach((el) => {
            if (el instanceof SVGPathElement) {
                el.style.strokeDasharray = 'none';
                el.style.strokeDashoffset = '0';
            }
        });
        return { destroy: () => {} };
    }

    const opts = { ...defaultOptions, ...options };
    const elements = resolveElements(selector);
    const paths = elements.filter((el): el is SVGPathElement => el instanceof SVGPathElement);
    const cleanupFns: Array<() => void> = [];
    let currentAnimation: gsap.core.Tween | null = null;

    // Prepare all paths
    paths.forEach(preparePath);

    const runAnimation = (reverse = false) => {
        if (currentAnimation) {
            currentAnimation.kill();
        }

        currentAnimation = gsap.to(paths, {
            strokeDashoffset: reverse ? (i: number) => getPathLength(paths[i]) : 0,
            duration: opts.duration,
            delay: opts.delay,
            ease: opts.ease,
            stagger: opts.stagger,
            onComplete: reverse ? undefined : opts.onComplete,
        });
    };

    if (opts.trigger === 'load') {
        runAnimation();
    } else if (opts.trigger === 'scroll') {
        // Find parent element for scroll trigger
        const parentSvg = paths[0]?.closest('svg') || paths[0]?.parentElement;

        if (parentSvg) {
            const scrollTrigger = ScrollTrigger.create({
                trigger: parentSvg,
                start: opts.scrollStart,
                onEnter: () => runAnimation(),
                once: true,
            });

            cleanupFns.push(() => scrollTrigger.kill());
        }
    } else if (opts.trigger === 'hover') {
        const parentSvg = paths[0]?.closest('svg') || paths[0]?.parentElement;

        if (parentSvg) {
            const handleMouseEnter = () => runAnimation(false);
            const handleMouseLeave = () => {
                if (opts.reverseOnLeave) {
                    runAnimation(true);
                }
            };

            parentSvg.addEventListener('mouseenter', handleMouseEnter);
            parentSvg.addEventListener('mouseleave', handleMouseLeave);

            cleanupFns.push(() => {
                parentSvg.removeEventListener('mouseenter', handleMouseEnter);
                parentSvg.removeEventListener('mouseleave', handleMouseLeave);
            });
        }
    }

    return {
        destroy: () => {
            if (currentAnimation) {
                currentAnimation.kill();
            }
            cleanupFns.forEach((fn) => fn());
            paths.forEach((path) => {
                gsap.killTweensOf(path);
                path.style.strokeDasharray = '';
                path.style.strokeDashoffset = '';
            });
        },
        replay: () => {
            paths.forEach(preparePath);
            runAnimation();
        },
    };
}

/**
 * Creates an animated underline effect using SVG
 *
 * @example
 * ```ts
 * // Wrap text with underline
 * const underline = createSvgUnderline('.highlight', {
 *   color: '#4a9eff',
 *   trigger: 'scroll',
 * });
 * ```
 */
export interface SvgUnderlineOptions extends SvgDrawOptions {
    /** Stroke color */
    color?: string;
    /** Stroke width */
    strokeWidth?: number;
    /** Vertical offset from text */
    offsetY?: number;
}

export function createSvgUnderline(
    selector: ElementSelector,
    options: SvgUnderlineOptions = {}
): EffectInstance {
    const {
        color = 'currentColor',
        strokeWidth = 3,
        offsetY = 6,
        ...drawOptions
    } = options;

    const elements = resolveElements(selector);
    const instances: EffectInstance[] = [];

    elements.forEach((element) => {
        const el = element as HTMLElement;

        // Make container relative
        el.style.position = 'relative';
        el.style.display = 'inline-block';

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'svg-underline');
        svg.setAttribute('viewBox', '0 0 300 20');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('aria-hidden', 'true');

        svg.style.cssText = `
      position: absolute;
      bottom: -${offsetY}px;
      left: -3%;
      width: 106%;
      height: 16px;
      overflow: visible;
      pointer-events: none;
    `;

        // Create path with wavy line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M0,15 Q75,5 150,12 T300,8');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', strokeWidth.toString());
        path.setAttribute('stroke-linecap', 'round');

        svg.appendChild(path);
        el.appendChild(svg);

        // Create draw animation for the path
        const instance = createSvgDraw(path, drawOptions);
        instances.push(instance);
    });

    return {
        destroy: () => {
            instances.forEach((i) => i.destroy());
            elements.forEach((el) => {
                const svg = (el as HTMLElement).querySelector('.svg-underline');
                svg?.remove();
            });
        },
        replay: () => {
            instances.forEach((i) => i.replay?.());
        },
    };
}

/**
 * Auto-initialize SVG draw on elements with data-svg-draw attribute
 */
export function initSvgDraw(): EffectInstance {
    const elements = document.querySelectorAll('[data-svg-draw]');
    const instances: EffectInstance[] = [];

    elements.forEach((el) => {
        const paths = el.querySelectorAll('path');
        if (paths.length === 0) return;

        const options: SvgDrawOptions = {
            duration: parseFloat(el.getAttribute('data-svg-draw-duration') || '1.2'),
            delay: parseFloat(el.getAttribute('data-svg-draw-delay') || '0'),
            trigger: (el.getAttribute('data-svg-draw-trigger') as AnimationTrigger) || 'load',
            stagger: parseFloat(el.getAttribute('data-svg-draw-stagger') || '0.2'),
        };

        instances.push(createSvgDraw(paths, options));
    });

    return {
        destroy: () => {
            instances.forEach((instance) => instance.destroy());
        },
    };
}

export default createSvgDraw;