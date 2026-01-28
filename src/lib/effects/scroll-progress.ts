import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {prefersReducedMotion} from "../utils/dom.ts";
import type {EffectInstance} from "../types";
// Register ScrollTrigger
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export type ScrollProgressType = 'bar' | 'bar-side' | 'circle';
export type ScrollProgressPosition = 'top' | 'bottom' | 'left' | 'right';

export interface ScrollProgressOptions {
    /** Type of progress indicator */
    type?: ScrollProgressType;
    /** Color of the progress indicator */
    color?: string;
    /** End color for gradient (bar type only) */
    colorEnd?: string;
    /** Size in pixels (height for bar, diameter for circle) */
    size?: number;
    /** Position (top/bottom for bar, left/right for side bar) */
    position?: ScrollProgressPosition;
    /** Show percentage text (circle type only) */
    showPercent?: boolean;
    /** Container to track scroll (defaults to document body) */
    container?: Element | string;
    /** Z-index for the progress element */
    zIndex?: number;
    /** Scrub smoothness (0 = instant, higher = smoother) */
    scrub?: number;
    /** Callback on progress update */
    onProgress?: (progress: number) => void;
}

const defaultOptions: Required<Omit<ScrollProgressOptions, 'colorEnd' | 'onProgress'>> & {
    colorEnd?: string;
    onProgress?: (progress: number) => void;
} = {
    type: 'bar',
    color: '#4a9eff',
    colorEnd: undefined,
    size: 3,
    position: 'top',
    showPercent: true,
    container: 'body',
    zIndex: 9999,
    scrub: 0.3,
    onProgress: undefined,
};

/** Create the bar progress element */
function createBarElement(opts: typeof defaultOptions): HTMLElement {
    const bar = document.createElement('div');
    bar.className = 'scroll-progress-bar';

    const gradient = opts.colorEnd
        ? `linear-gradient(90deg, ${opts.color}, ${opts.colorEnd})`
        : opts.color;

    bar.style.cssText = `
    position: fixed;
    ${opts.position}: 0;
    left: 0;
    width: 0%;
    height: ${opts.size}px;
    background: ${gradient};
    z-index: ${opts.zIndex};
    pointer-events: none;
    transition: none;
  `;

    return bar;
}

/** Create the side bar progress element */
function createSideBarElement(opts: typeof defaultOptions): HTMLElement {
    const container = document.createElement('div');
    container.className = 'scroll-progress-side';

    const isLeft = opts.position === 'left';

    container.style.cssText = `
    position: fixed;
    top: 50%;
    ${isLeft ? 'left' : 'right'}: 24px;
    width: ${opts.size}px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: ${opts.size}px;
    transform: translateY(-50%);
    z-index: ${opts.zIndex};
    pointer-events: none;
    overflow: hidden;
  `;

    const fill = document.createElement('div');
    fill.className = 'scroll-progress-side-fill';
    fill.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0%;
    background: ${opts.color};
    border-radius: ${opts.size}px;
    transition: none;
  `;

    container.appendChild(fill);
    return container;
}

/** Create the circle progress element */
function createCircleElement(opts: typeof defaultOptions): HTMLElement {
    const container = document.createElement('div');
    container.className = 'scroll-progress-circle';

    container.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: ${opts.size}px;
    height: ${opts.size}px;
    z-index: ${opts.zIndex};
    pointer-events: none;
  `;

    const circumference = 2 * Math.PI * 20; // r=20 in viewBox

    container.innerHTML = `
    <svg viewBox="0 0 50 50" style="width: 100%; height: 100%;">
      <circle
        cx="25" cy="25" r="20"
        fill="none"
        stroke="${opts.color}"
        stroke-width="3"
        opacity="0.2"
      />
      <circle
        class="scroll-progress-circle-fill"
        cx="25" cy="25" r="20"
        fill="none"
        stroke="${opts.color}"
        stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${circumference}"
        style="transform: rotate(-90deg); transform-origin: center;"
      />
    </svg>
    ${
        opts.showPercent
            ? `<span class="scroll-progress-text" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 0.65rem;
            font-weight: 600;
            color: ${opts.color};
          ">0%</span>`
            : ''
    }
  `;

    return container;
}

/**
 * Creates a scroll progress indicator
 *
 * @example
 * ```ts
 * // Top bar (default)
 * const progress = createScrollProgress();
 *
 * // Bottom bar with gradient
 * const progress = createScrollProgress({
 *   position: 'bottom',
 *   color: '#4a9eff',
 *   colorEnd: '#a855f7',
 * });
 *
 * // Side bar
 * const progress = createScrollProgress({
 *   type: 'bar-side',
 *   position: 'right',
 * });
 *
 * // Circle with percentage
 * const progress = createScrollProgress({
 *   type: 'circle',
 *   size: 50,
 * });
 *
 * // With callback
 * const progress = createScrollProgress({
 *   onProgress: (progress) => console.log(`${progress * 100}%`),
 * });
 *
 * // Cleanup
 * progress.destroy();
 * ```
 */
export function createScrollProgress(options: ScrollProgressOptions = {}): EffectInstance {
    if (prefersReducedMotion()) {
        return { destroy: () => {} };
    }

    const opts = { ...defaultOptions, ...options };
    let element: HTMLElement;
    let scrollTrigger: ScrollTrigger;

    // Create appropriate element
    switch (opts.type) {
        case 'bar-side':
            element = createSideBarElement(opts);
            break;
        case 'circle':
            element = createCircleElement(opts);
            break;
        case 'bar':
        default:
            element = createBarElement(opts);
    }

    document.body.appendChild(element);

    // Get the animatable element
    const getAnimTarget = (): Element | null => {
        switch (opts.type) {
            case 'bar-side':
                return element.querySelector('.scroll-progress-side-fill');
            case 'circle':
                return element.querySelector('.scroll-progress-circle-fill');
            default:
                return element;
        }
    };

    const target = getAnimTarget();
    const textElement = element.querySelector('.scroll-progress-text');
    const circumference = 2 * Math.PI * 20;

    // Resolve container
    const container =
        typeof opts.container === 'string'
            ? document.querySelector(opts.container)
            : opts.container;

    // Create animation
    const animationProps: gsap.TweenVars = {
        ease: 'none',
        scrollTrigger: {
            trigger: container || document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: opts.scrub,
            onUpdate: (self: ScrollTrigger) => {
                if (textElement && opts.type === 'circle') {
                    textElement.textContent = `${Math.round(self.progress * 100)}%`;
                }
                opts.onProgress?.(self.progress);
            },
        },
    };

    // Set animation target property based on type
    if (target) {
        switch (opts.type) {
            case 'bar':
                gsap.to(target, { width: '100%', ...animationProps });
                break;
            case 'bar-side':
                gsap.to(target, { height: '100%', ...animationProps });
                break;
            case 'circle':
                gsap.to(target, { strokeDashoffset: 0, ...animationProps });
                break;
        }
    }

    return {
        destroy: () => {
            ScrollTrigger.getAll().forEach((st) => {
                if (st.vars.trigger === container || st.vars.trigger === document.body) {
                    st.kill();
                }
            });
            if (target) gsap.killTweensOf(target);
            element.remove();
        },
    };
}

/**
 * Auto-initialize scroll progress from data attribute
 *
 * @example
 * ```html
 * <div data-scroll-progress data-scroll-progress-type="circle"></div>
 * ```
 */
export function initScrollProgress(): EffectInstance {
    const element = document.querySelector('[data-scroll-progress]');

    if (!element) {
        // Create default if no element found
        return createScrollProgress();
    }

    const options: ScrollProgressOptions = {
        type: (element.getAttribute('data-scroll-progress-type') as ScrollProgressType) || 'bar',
        color: element.getAttribute('data-scroll-progress-color') || '#4a9eff',
        colorEnd: element.getAttribute('data-scroll-progress-color-end') || undefined,
        size: parseFloat(element.getAttribute('data-scroll-progress-size') || '3'),
        position:
            (element.getAttribute('data-scroll-progress-position') as ScrollProgressPosition) || 'top',
        showPercent: element.getAttribute('data-scroll-progress-show-percent') !== 'false',
    };

    return createScrollProgress(options);
}

export default createScrollProgress;