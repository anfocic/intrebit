import { gsap } from "gsap";
import type { EffectInstance } from "../types";
import { generateId, prefersReducedMotion, hasWindow, hasDocument } from "../utils/dom";

export type ParticleType = "dot" | "ring" | "glow" | "mixed";
export type ParticleMode = "drift" | "follow" | "explode";

export interface ParticlesOptions {
    /** Optional root for scoping container selector queries */
    root?: ParentNode;

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

    /** Container element or selector (defaults to body) */
    container?: Element | string;

    /** Z-index for particle container */
    zIndex?: number;

    /** Enable mouse interaction */
    interactive?: boolean;

    /** Interaction mode */
    mode?: ParticleMode;

    /**
     * Prevent creating multiple particle layers accidentally.
     * If true and one exists, returns a no-op instance.
     */
    singleton?: boolean;
}

const defaultOptions: Required<
    Omit<ParticlesOptions, "root" | "container" | "singleton">
> & {
    root?: ParentNode;
    container: Element | string;
    singleton?: boolean;
} = {
    root: undefined,
    count: 30,
    color: "#4a9eff",
    minSize: 3,
    maxSize: 8,
    speed: 1,
    opacity: 0.4,
    type: "mixed",
    container: "body",
    zIndex: 0,
    interactive: false,
    mode: "drift",
    singleton: true,
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
 * Creates ambient floating particles.
 * Note: this is global-ish UI. Prefer creating once per page.
 */
export function createParticles(options: ParticlesOptions = {}): EffectInstance {
    if (!hasWindow() || !hasDocument() || prefersReducedMotion()) {
        return { destroy: () => {}, pause: () => {}, resume: () => {} };
    }

    const opts = { ...defaultOptions, ...options };

    // Optional singleton guard
    if (opts.singleton) {
        const existing = document.querySelector(".ambient-particles");
        if (existing) return { destroy: () => {}, pause: () => {}, resume: () => {} };
    }

    const particles: Particle[] = [];
    let animationId = 0;
    let isPaused = false;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Resolve container
    const resolveContainer = (): Element | null => {
        if (typeof opts.container !== "string") return opts.container;

        const scope: ParentNode = opts.root ?? document;
        const q = (scope as Document | Element).querySelector?.(opts.container);
        return q ?? null;
    };

    const containerEl = resolveContainer();
    if (!containerEl) {
        console.warn("Particles: Container not found", opts.container);
        return { destroy: () => {}, pause: () => {}, resume: () => {} };
    }

    // Create particle wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "ambient-particles";
    wrapper.id = generateId("particles");
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
    const getParticleType = (index: number): string => {
        if (opts.type !== "mixed") return opts.type;
        // Mixed: 15% glow, 35% dot, 50% ring
        if (index < opts.count * 0.15) return "glow";
        if (index < opts.count * 0.5) return "dot";
        return "ring";
    };

    // Create particles
    for (let i = 0; i < opts.count; i++) {
        const type = getParticleType(i);
        const el = document.createElement("div");
        el.className = `particle particle--${type}`;

        const size =
            type === "glow"
                ? gsap.utils.random(opts.maxSize * 4, opts.maxSize * 8)
                : gsap.utils.random(opts.minSize, opts.maxSize);

        const x = gsap.utils.random(0, window.innerWidth);
        const y = gsap.utils.random(0, window.innerHeight);

        el.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
    `;

        switch (type) {
            case "dot":
                el.style.background = opts.color;
                break;
            case "ring":
                el.style.border = `1px solid ${opts.color}`;
                el.style.background = "transparent";
                break;
            case "glow":
                el.style.background = `radial-gradient(circle, ${opts.color} 0%, transparent 70%)`;
                break;
        }

        wrapper.appendChild(el);

        const p: Particle = {
            el,
            x,
            y,
            vx: gsap.utils.random(-0.5, 0.5) * opts.speed,
            vy: gsap.utils.random(-0.5, 0.5) * opts.speed,
            size,
            type,
        };

        particles.push(p);

        gsap.to(el, {
            opacity:
                type === "glow"
                    ? opts.opacity * 0.5
                    : gsap.utils.random(opts.opacity * 0.3, opts.opacity),
            duration: gsap.utils.random(1, 2),
            delay: gsap.utils.random(0, 1),
            ease: "power2.out",
        });

        gsap.set(el, { x, y });
    }

    // Mouse tracking for interactive mode
    const handleMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    };

    // Click burst for explode mode
    const handleClick = (e: MouseEvent) => {
        if (opts.mode !== "explode" || !opts.interactive) return;
        createParticleBurst(e.clientX, e.clientY, {
            count: 12,
            color: opts.color,
            size: 4,
            duration: 1,
            spread: 180,
            zIndex: opts.zIndex + 1,
        });
    };

    // Animation loop
    const animate = () => {
        if (!isPaused) {
            for (const [index, p] of particles.entries()) {
                if (opts.mode === "drift" || !opts.interactive) {
                    p.x += p.vx;
                    p.y += p.vy;

                    if (p.x < -50) p.x = window.innerWidth + 50;
                    if (p.x > window.innerWidth + 50) p.x = -50;
                    if (p.y < -50) p.y = window.innerHeight + 50;
                    if (p.y > window.innerHeight + 50) p.y = -50;
                } else if (opts.mode === "follow") {
                    const angle = Math.atan2(mouseY - p.y, mouseX - p.x) + 0.02;
                    const targetDist = 100 + index * 5;

                    p.x += (mouseX - Math.cos(angle) * targetDist - p.x) * 0.02;
                    p.y += (mouseY - Math.sin(angle) * targetDist - p.y) * 0.02;
                }

                gsap.set(p.el, { x: p.x, y: p.y });
            }
        }

        animationId = requestAnimationFrame(animate);
    };

    animate();

    if (opts.interactive) {
        document.addEventListener("mousemove", handleMouseMove);
        if (opts.mode === "explode") document.addEventListener("click", handleClick);
    }

    // Resize
    const handleResize = () => {
        for (const p of particles) {
            if (p.x > window.innerWidth) p.x = window.innerWidth - 50;
            if (p.y > window.innerHeight) p.y = window.innerHeight - 50;
        }
    };
    window.addEventListener("resize", handleResize);

    return {
        destroy: () => {
            cancelAnimationFrame(animationId);

            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("click", handleClick);
            window.removeEventListener("resize", handleResize);

            for (const p of particles) gsap.killTweensOf(p.el);

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
 * Creates a burst of particles at a specific position.
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
        zIndex: number;
    }> = {}
): void {
    if (!hasWindow() || !hasDocument()) return;

    const {
        count = 12,
        color = "#4a9eff",
        size = 4,
        duration = 1,
        spread = 150,
        zIndex = 99999,
    } = options;

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const velocity = gsap.utils.random(spread * 0.5, spread);

        const particle = document.createElement("div");
        particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: ${zIndex};
      transform: translate(-50%, -50%);
    `;
        document.body.appendChild(particle);

        gsap.to(particle, {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity,
            opacity: 0,
            scale: 0,
            duration,
            ease: "power2.out",
            onComplete: () => particle.remove(),
        });
    }
}

export default createParticles;