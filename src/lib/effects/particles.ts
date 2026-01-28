import {gsap} from 'gsap';
import {type EffectInstance} from '../types';
import {generateId, prefersReducedMotion} from "../utils/dom.ts";

export type ParticleType = 'dot' | 'ring' | 'glow' | 'mixed';
export type ParticleMode = 'drift' | 'follow' | 'explode';

export interface ParticlesOptions {
    /** Number of particles */
    count?: number;
    /** Particle color */
    color?: string;
    /** Minimum particle size */
    minSize?: number;
    /** Maximum particle size */
    maxSize?: number;
    /** Movement speed multiplier (0.1 - 2) */
    speed?: number;
    /** Maximum opacity */
    opacity?: number;
    /** Particle type */
    type?: ParticleType;
    /** Container element (defaults to body) */
    container?: Element | string;
    /** Z-index for particle container */
    zIndex?: number;
    /** Enable mouse interaction */
    interactive?: boolean;
    /** Interaction mode */
    mode?: ParticleMode;
}

const defaultOptions: Required<ParticlesOptions> = {
    count: 30,
    color: '#4a9eff',
    minSize: 3,
    maxSize: 8,
    speed: 1,
    opacity: 0.4,
    type: 'mixed',
    container: 'body',
    zIndex: 0,
    interactive: false,
    mode: 'drift',
};

interface Particle {
    el: HTMLElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    type: string;
}

/**
 * Creates ambient floating particles
 *
 * @example
 * ```ts
 * // Basic usage
 * const particles = createParticles();
 *
 * // Customized
 * const particles = createParticles({
 *   count: 50,
 *   color: '#4a9eff',
 *   speed: 0.5,
 *   opacity: 0.3,
 * });
 *
 * // Interactive (follow cursor)
 * const particles = createParticles({
 *   interactive: true,
 *   mode: 'follow',
 * });
 *
 * // Cleanup
 * particles.destroy();
 * ```
 */
export function createParticles(options: ParticlesOptions = {}): EffectInstance {
    if (prefersReducedMotion()) {
        return { destroy: () => {}, pause: () => {}, resume: () => {} };
    }

    const opts = { ...defaultOptions, ...options };
    const particles: Particle[] = [];
    let animationId: number;
    let isPaused = false;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Resolve container
    const containerEl =
        typeof opts.container === 'string'
            ? document.querySelector(opts.container)
            : opts.container;

    if (!containerEl) {
        console.warn('Particles: Container not found');
        return { destroy: () => {}, pause: () => {}, resume: () => {} };
    }

    // Create particle container
    const wrapper = document.createElement('div');
    wrapper.className = 'ambient-particles';
    wrapper.id = generateId('particles');
    wrapper.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: ${opts.zIndex};
    overflow: hidden;
  `;

    containerEl.appendChild(wrapper);

    // Determine particle types
    const getParticleTypes = (index: number): string => {
        if (opts.type !== 'mixed') return opts.type;

        // Mixed: 15% glow, 35% dot, 50% ring
        if (index < opts.count * 0.15) return 'glow';
        if (index < opts.count * 0.5) return 'dot';
        return 'ring';
    };

    // Create particles
    for (let i = 0; i < opts.count; i++) {
        const type = getParticleTypes(i);
        const particle = document.createElement('div');
        particle.className = `particle particle--${type}`;

        const size =
            type === 'glow'
                ? gsap.utils.random(opts.maxSize * 4, opts.maxSize * 8)
                : gsap.utils.random(opts.minSize, opts.maxSize);

        const x = gsap.utils.random(0, window.innerWidth);
        const y = gsap.utils.random(0, window.innerHeight);

        // Base styles
        particle.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
    `;

        // Type-specific styles
        switch (type) {
            case 'dot':
                particle.style.background = opts.color;
                break;
            case 'ring':
                particle.style.border = `1px solid ${opts.color}`;
                particle.style.background = 'transparent';
                break;
            case 'glow':
                particle.style.background = `radial-gradient(circle, ${opts.color} 0%, transparent 70%)`;
                break;
        }

        wrapper.appendChild(particle);

        const p: Particle = {
            el: particle,
            x,
            y,
            vx: gsap.utils.random(-0.5, 0.5) * opts.speed,
            vy: gsap.utils.random(-0.5, 0.5) * opts.speed,
            size,
            type,
        };

        particles.push(p);

        // Fade in
        gsap.to(particle, {
            opacity: type === 'glow' ? opts.opacity * 0.5 : gsap.utils.random(opts.opacity * 0.3, opts.opacity),
            duration: gsap.utils.random(1, 2),
            delay: gsap.utils.random(0, 1),
            ease: 'power2.out',
        });

        // Set initial position
        gsap.set(particle, { x, y });
    }

    // Animation loop
    const animate = () => {
        if (isPaused) {
            animationId = requestAnimationFrame(animate);
            return;
        }

        particles.forEach((p, index) => {
            if (opts.mode === 'drift' || !opts.interactive) {
                // Gentle drift
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < -50) p.x = window.innerWidth + 50;
                if (p.x > window.innerWidth + 50) p.x = -50;
                if (p.y < -50) p.y = window.innerHeight + 50;
                if (p.y > window.innerHeight + 50) p.y = -50;
            } else if (opts.mode === 'follow' && opts.interactive) {
                // Follow cursor with orbit
                const angle = Math.atan2(mouseY - p.y, mouseX - p.x) + 0.02;
                const targetDist = 100 + index * 5;

                p.x += (mouseX - Math.cos(angle) * targetDist - p.x) * 0.02;
                p.y += (mouseY - Math.sin(angle) * targetDist - p.y) * 0.02;
            }

            gsap.set(p.el, { x: p.x, y: p.y });
        });

        animationId = requestAnimationFrame(animate);
    };

    animate();

    // Mouse tracking for interactive mode
    const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    };

    // Click burst for explode mode
    const handleClick = (e: MouseEvent) => {
        if (opts.mode !== 'explode' || !opts.interactive) return;

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const velocity = gsap.utils.random(100, 200);

            const particle = document.createElement('div');
            particle.className = 'particle particle--dot';
            particle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 4px;
        height: 4px;
        background: ${opts.color};
        border-radius: 50%;
        pointer-events: none;
        z-index: ${opts.zIndex + 1};
      `;
            document.body.appendChild(particle);

            gsap.to(particle, {
                x: Math.cos(angle) * velocity,
                y: Math.sin(angle) * velocity,
                opacity: 0,
                scale: 0,
                duration: 1,
                ease: 'power2.out',
                onComplete: () => particle.remove(),
            });
        }
    };

    if (opts.interactive) {
        document.addEventListener('mousemove', handleMouseMove);
        if (opts.mode === 'explode') {
            document.addEventListener('click', handleClick);
        }
    }

    // Handle resize
    const handleResize = () => {
        particles.forEach((p) => {
            if (p.x > window.innerWidth) p.x = window.innerWidth - 50;
            if (p.y > window.innerHeight) p.y = window.innerHeight - 50;
        });
    };

    window.addEventListener('resize', handleResize);

    return {
        destroy: () => {
            cancelAnimationFrame(animationId);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('click', handleClick);
            window.removeEventListener('resize', handleResize);
            particles.forEach((p) => gsap.killTweensOf(p.el));
            wrapper.remove();
        },
        pause: () => {
            isPaused = true;
        },
        resume: () => {
            isPaused = false;
        },
    };
}

/**
 * Creates a burst of particles at a specific position
 *
 * @example
 * ```ts
 * // On button click
 * button.addEventListener('click', (e) => {
 *   createParticleBurst(e.clientX, e.clientY, {
 *     count: 20,
 *     color: '#ff0055',
 *   });
 * });
 * ```
 */
export function createParticleBurst(
    x: number,
    y: number,
    options: Partial<{
        count: number;
        color: string;
        size: number;
        duration: number;
        spread: number;
    }> = {}
): void {
    const {
        count = 12,
        color = '#4a9eff',
        size = 4,
        duration = 1,
        spread = 150,
    } = options;

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const velocity = gsap.utils.random(spread * 0.5, spread);

        const particle = document.createElement('div');
        particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
    `;
        document.body.appendChild(particle);

        gsap.to(particle, {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity,
            opacity: 0,
            scale: 0,
            duration,
            ease: 'power2.out',
            onComplete: () => particle.remove(),
        });
    }
}

/**
 * Auto-initialize particles from data attribute
 */
export function initParticles(): EffectInstance {
    const element = document.querySelector('[data-particles]');

    if (!element) {
        return { destroy: () => {}, pause: () => {}, resume: () => {} };
    }

    const options: ParticlesOptions = {
        count: parseInt(element.getAttribute('data-particles-count') || '30'),
        color: element.getAttribute('data-particles-color') || '#4a9eff',
        minSize: parseFloat(element.getAttribute('data-particles-min-size') || '3'),
        maxSize: parseFloat(element.getAttribute('data-particles-max-size') || '8'),
        speed: parseFloat(element.getAttribute('data-particles-speed') || '1'),
        opacity: parseFloat(element.getAttribute('data-particles-opacity') || '0.4'),
        type: (element.getAttribute('data-particles-type') as ParticleType) || 'mixed',
        interactive: element.getAttribute('data-particles-interactive') === 'true',
        mode: (element.getAttribute('data-particles-mode') as ParticleMode) || 'drift',
    };

    return createParticles(options);
}

export default createParticles;