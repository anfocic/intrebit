import {gsap} from 'gsap';
import {type EffectInstance} from '../types';
import {prefersReducedMotion, supportsHover} from "../utils/dom.ts";

export interface CustomCursorOptions {
    /** Size of inner dot */
    dotSize?: number;
    /** Size of outer ring */
    ringSize?: number;
    /** Color of the dot */
    dotColor?: string;
    /** Color of the ring border */
    ringColor?: string;
    /** Scale factor on hover */
    hoverScale?: number;
    /** Enable trailing particles */
    trailEnabled?: boolean;
    /** Trail particle color */
    trailColor?: string;
    /** Selector for elements that trigger hover state */
    hoverSelector?: string;
    /** Use mix-blend-mode difference */
    mixBlend?: boolean;
    /** Z-index for cursor elements */
    zIndex?: number;
    /** Ring follow delay (0-1, lower = faster) */
    ringDelay?: number;
}

const defaultOptions: Required<CustomCursorOptions> = {
    dotSize: 8,
    ringSize: 40,
    dotColor: 'white',
    ringColor: 'rgba(255, 255, 255, 0.5)',
    hoverScale: 1.5,
    trailEnabled: false,
    trailColor: '#4a9eff',
    hoverSelector: 'a, button, [data-cursor-hover], input, textarea, select, [role="button"]',
    mixBlend: true,
    zIndex: 99999,
    ringDelay: 0.15,
};

/**
 * Creates a custom cursor with dot and ring
 *
 * @example
 * ```ts
 * // Basic usage
 * const cursor = createCustomCursor();
 *
 * // With trail
 * const cursor = createCustomCursor({
 *   trailEnabled: true,
 *   trailColor: '#4a9eff',
 * });
 *
 * // Customized
 * const cursor = createCustomCursor({
 *   dotSize: 10,
 *   ringSize: 50,
 *   dotColor: '#ff0055',
 *   ringColor: 'rgba(255, 0, 85, 0.3)',
 *   hoverScale: 2,
 * });
 *
 * // Cleanup
 * cursor.destroy();
 * ```
 */
export function createCustomCursor(options: CustomCursorOptions = {}): EffectInstance {
    // Skip on touch devices or reduced motion
    if (prefersReducedMotion() || !supportsHover()) {
        return { destroy: () => {} };
    }

    const opts = { ...defaultOptions, ...options };

    // Create cursor elements
    const dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    dot.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: ${opts.dotSize}px;
    height: ${opts.dotSize}px;
    background: ${opts.dotColor};
    border-radius: 50%;
    pointer-events: none;
    z-index: ${opts.zIndex + 1};
    transform: translate(-50%, -50%);
    opacity: 0;
    ${opts.mixBlend ? 'mix-blend-mode: difference;' : ''}
  `;

    const ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    ring.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: ${opts.ringSize}px;
    height: ${opts.ringSize}px;
    border: 1px solid ${opts.ringColor};
    border-radius: 50%;
    pointer-events: none;
    z-index: ${opts.zIndex};
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: width 0.2s ease, height 0.2s ease;
    ${opts.mixBlend ? 'mix-blend-mode: difference;' : ''}
  `;

    document.body.appendChild(dot);
    document.body.appendChild(ring);

    // Add class to body to hide default cursor
    const style = document.createElement('style');
    style.id = 'custom-cursor-styles';
    style.textContent = `
    .has-custom-cursor,
    .has-custom-cursor * {
      cursor: none !important;
    }
  `;
    document.head.appendChild(style);
    document.body.classList.add('has-custom-cursor');

    // State
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let isVisible = false;
    let animationId: number;

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Show cursor on first move
        if (!isVisible) {
            isVisible = true;
            gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
        }

        // Dot follows immediately
        gsap.set(dot, { x: mouseX, y: mouseY });

        // Create trail particle
        if (opts.trailEnabled) {
            createTrailParticle(mouseX, mouseY);
        }
    };

    // Ring animation loop
    const animateRing = () => {
        ringX += (mouseX - ringX) * opts.ringDelay;
        ringY += (mouseY - ringY) * opts.ringDelay;
        gsap.set(ring, { x: ringX, y: ringY });
        animationId = requestAnimationFrame(animateRing);
    };
    animateRing();

    // Trail particle
    const createTrailParticle = (x: number, y: number) => {
        const particle = document.createElement('div');
        particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 6px;
      height: 6px;
      background: ${opts.trailColor};
      border-radius: 50%;
      pointer-events: none;
      z-index: ${opts.zIndex - 1};
      transform: translate(-50%, -50%);
    `;
        document.body.appendChild(particle);

        gsap.to(particle, {
            scale: 0,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => particle.remove(),
        });
    };

    // Hover effects
    const hoverElements = document.querySelectorAll(opts.hoverSelector);
    const originalRingSize = opts.ringSize;

    const handleMouseEnter = () => {
        ring.style.width = `${originalRingSize * opts.hoverScale}px`;
        ring.style.height = `${originalRingSize * opts.hoverScale}px`;
        gsap.to(dot, { scale: opts.hoverScale, duration: 0.3 });
    };

    const handleMouseLeave = () => {
        ring.style.width = `${originalRingSize}px`;
        ring.style.height = `${originalRingSize}px`;
        gsap.to(dot, { scale: 1, duration: 0.3 });
    };

    hoverElements.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
    });

    // Hide on mouse leave window
    const handleWindowLeave = () => {
        gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
        isVisible = false;
    };

    const handleWindowEnter = () => {
        gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
        isVisible = true;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleWindowLeave);
    document.addEventListener('mouseenter', handleWindowEnter);

    // MutationObserver to handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node instanceof Element) {
                    if (node.matches(opts.hoverSelector)) {
                        node.addEventListener('mouseenter', handleMouseEnter);
                        node.addEventListener('mouseleave', handleMouseLeave);
                    }
                    node.querySelectorAll(opts.hoverSelector).forEach((el) => {
                        el.addEventListener('mouseenter', handleMouseEnter);
                        el.addEventListener('mouseleave', handleMouseLeave);
                    });
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return {
        destroy: () => {
            cancelAnimationFrame(animationId);
            observer.disconnect();

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleWindowLeave);
            document.removeEventListener('mouseenter', handleWindowEnter);

            hoverElements.forEach((el) => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });

            document.body.classList.remove('has-custom-cursor');
            style.remove();
            dot.remove();
            ring.remove();
        },
    };
}

/**
 * Auto-initialize custom cursor from data attribute
 *
 * @example
 * ```html
 * <div data-custom-cursor data-cursor-trail="true"></div>
 * ```
 */
export function initCustomCursor(): EffectInstance {
    const element = document.querySelector('[data-custom-cursor]');

    const options: CustomCursorOptions = element
        ? {
            dotSize: parseFloat(element.getAttribute('data-cursor-dot-size') || '8'),
            ringSize: parseFloat(element.getAttribute('data-cursor-ring-size') || '40'),
            dotColor: element.getAttribute('data-cursor-dot-color') || 'white',
            ringColor: element.getAttribute('data-cursor-ring-color') || 'rgba(255,255,255,0.5)',
            hoverScale: parseFloat(element.getAttribute('data-cursor-hover-scale') || '1.5'),
            trailEnabled: element.getAttribute('data-cursor-trail') === 'true',
            trailColor: element.getAttribute('data-cursor-trail-color') || '#4a9eff',
            mixBlend: element.getAttribute('data-cursor-mix-blend') !== 'false',
        }
        : {};

    return createCustomCursor(options);
}

export default createCustomCursor;