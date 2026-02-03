import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { AnimationTrigger, EffectInstance, ElementSelector } from "../types";
import { prefersReducedMotion, resolveElements, supportsHover } from "../utils/dom";
import { guard } from "../utils/guards";
import { createCleanup } from "../utils/instance";

export type SplitTextAnimation =
    | "cascade"
    | "wave"
    | "spring"
    | "blur"
    | "rotate"
    | "scale"
    | "glitch"
    | "fade";

export interface SplitTextOptions {
    /** Optional root for scoping selector queries */
    root?: ParentNode;

    /** Animation type */
    animation?: SplitTextAnimation;

    /** Duration for each character animation */
    duration?: number;

    /** Stagger delay between characters */
    stagger?: number;

    /** Initial delay before animation starts (seconds) */
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

const defaultOptions: Required<Omit<SplitTextOptions, "root" | "onComplete">> & {
    root?: ParentNode;
    onComplete?: () => void;
} = {
    root: undefined,
    animation: "cascade",
    duration: 0.8,
    stagger: 0.08,
    delay: 0,
    trigger: "load",
    loop: false,
    scrollStart: "top 85%",
    charClass: "split-char",
    onComplete: undefined,
};

/** Split text into individual character spans */
function splitIntoChars(element: HTMLElement, charClass: string): HTMLSpanElement[] {
    const text = element.textContent ?? "";
    element.setAttribute("aria-label", text);
    element.innerHTML = "";

    const chars: HTMLSpanElement[] = [];
    [...text].forEach((char, i) => {
        const span = document.createElement("span");
        span.className = charClass;
        span.style.display = "inline-block";
        span.style.willChange = "transform, opacity, filter";
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.setProperty("--char-index", String(i));
        element.appendChild(span);
        chars.push(span);
    });

    return chars;
}

type ResolvedOpts = Required<Omit<SplitTextOptions, "root" | "onComplete">> & {
    root?: ParentNode;
    onComplete?: () => void;
};

const animations: Record<
    SplitTextAnimation,
    (chars: HTMLSpanElement[], opts: ResolvedOpts) => gsap.core.Timeline | gsap.core.Tween
> = {
    cascade: (chars, opts) => {
        gsap.set(chars, { opacity: 0, y: -50, rotateX: -90 });
        return gsap.to(chars, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: opts.duration,
            stagger: opts.stagger,
            ease: "back.out(1.7)",
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
            ease: "sine.inOut",
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
            ease: "elastic.out(1, 0.4)",
            onComplete: opts.onComplete,
        });
    },

    blur: (chars, opts) => {
        gsap.set(chars, { opacity: 0, filter: "blur(20px)", x: -20 });
        return gsap.to(chars, {
            opacity: 1,
            filter: "blur(0px)",
            x: 0,
            duration: opts.duration,
            stagger: opts.stagger,
            ease: "power2.out",
            onComplete: opts.onComplete,
        });
    },

    rotate: (chars, opts) => {
        gsap.set(chars, { opacity: 0, rotateY: 90, transformOrigin: "center center" });
        return gsap.to(chars, {
            opacity: 1,
            rotateY: 0,
            duration: opts.duration,
            stagger: opts.stagger,
            ease: "power3.out",
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
            ease: "back.out(2)",
            onComplete: opts.onComplete,
        });
    },

    glitch: (chars, opts) => {
        const tl = gsap.timeline({ onComplete: opts.onComplete });

        chars.forEach((char, i) => {
            const charTl = gsap.timeline();

            for (let j = 0; j < 5; j++) {
                charTl.to(char, {
                    x: gsap.utils.random(-5, 5),
                    y: gsap.utils.random(-3, 3),
                    opacity: gsap.utils.random(0.5, 1),
                    color: j % 2 === 0 ? "#ff0055" : "#00ffff",
                    duration: 0.05,
                });
            }

            charTl.to(char, {
                x: 0,
                y: 0,
                opacity: 1,
                color: "inherit",
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
            ease: "power2.out",
            onComplete: opts.onComplete,
        });
    },
};

export function createSplitText(
    selector: ElementSelector,
    options: SplitTextOptions = {}
): EffectInstance {
    const g = guard({
        requireDocument: true,
        requireHover:
            (options.trigger ?? defaultOptions.trigger) === "hover",
    });

    if (!g.ok) return g.instance;

    gsap.registerPlugin(ScrollTrigger);

    const opts: ResolvedOpts = { ...defaultOptions, ...options };
    const cleanup = createCleanup();
    const elements = resolveElements(selector, opts.root);

    const charArrays: HTMLSpanElement[][] = [];
    const originals = new Map<HTMLElement, string>();

    const runAnimation = (chars: HTMLSpanElement[]) => {
        const fn = animations[opts.animation];
        return fn ? fn(chars, opts) : null;
    };

    const schedule = (fn: () => void) => {
        if (opts.delay <= 0) return fn();
        window.setTimeout(fn, opts.delay * 1000);
    };

    let currentAnimation: gsap.core.Timeline | gsap.core.Tween | null = null;

    for (const element of elements) {
        const el = element as HTMLElement;

        const originalText = el.textContent ?? "";
        originals.set(el, originalText);

        const chars = splitIntoChars(el, opts.charClass);
        charArrays.push(chars);

        if (opts.animation !== "wave") gsap.set(chars, { opacity: 0 });

        if (opts.trigger === "load") {
            schedule(() => {
                currentAnimation?.kill();
                currentAnimation = runAnimation(chars);
            });
        }

        if (opts.trigger === "scroll") {
            const st = ScrollTrigger.create({
                trigger: el,
                start: opts.scrollStart,
                once: true,
                onEnter: () => {
                    schedule(() => {
                        currentAnimation?.kill();
                        currentAnimation = runAnimation(chars);
                    });
                },
            });

            cleanup.add(() => st.kill());
        }

        if (opts.trigger === "hover") {
            gsap.set(chars, { opacity: 1 });
            const onEnter = () => {
                currentAnimation?.kill();
                currentAnimation = runAnimation(chars);
            };
            cleanup.on(el, "mouseenter", onEnter);
        }
    }

    return {
        destroy: () => {
            currentAnimation?.kill();

            for (const chars of charArrays.flat()) {
                gsap.killTweensOf(chars);
            }

            for (const [el, text] of originals.entries()) {
                el.textContent = text;
            }

            cleanup.destroy();
        },
        replay: () => {
            currentAnimation?.kill();
            for (const chars of charArrays) {
                currentAnimation = runAnimation(chars);
            }
        },
    };
}

export default createSplitText;