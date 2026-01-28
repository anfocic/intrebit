import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import type {AnimationTrigger, EffectInstance, ElementSelector} from "../types";
import {resolveElements} from "../utils/dom";
import {guard} from "../utils/guards";
import {createCleanup, noopInstance} from "../utils/instance";

// Register ScrollTrigger once (safe)
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export interface TextScrambleOptions {
    /** Scope querySelectorAll to a root element/document to avoid collisions */
    root?: ParentNode;

    /** Text to reveal (if not using element's textContent) */
    text?: string;

    /** Characters to use for scrambling */
    chars?: string;

    /** Animation duration in seconds */
    duration?: number;

    /** Delay before animation starts (seconds) */
    delay?: number;

    /** When to trigger animation */
    trigger?: AnimationTrigger;

    /** ScrollTrigger start position */
    scrollStart?: string;

    /** Callback when animation completes */
    onComplete?: () => void;
}

const defaultChars =
    "!@#$%^&*()_+-=[]{}|;:,.<>?0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const defaults: Required<
    Omit<TextScrambleOptions, "text" | "onComplete" | "root">
> & {
    root?: ParentNode;
    text?: string;
    onComplete?: () => void;
} = {
    root: undefined,
    text: undefined,
    chars: defaultChars,
    duration: 1.5,
    delay: 0,
    trigger: "load",
    scrollStart: "top 85%",
    onComplete: undefined,
};

type ScrambleController = { stop: () => void };

function scrambleRaf(
    el: HTMLElement,
    finalText: string,
    durationSec: number,
    chars: string,
    onComplete?: () => void
): ScrambleController {
    const length = finalText.length;
    const durationMs = Math.max(0.01, durationSec) * 1000;

    // where “reveal” starts (30% into the animation)
    const revealStart = 0.3;

    let raf = 0;
    let stopped = false;
    const start = performance.now();

    el.setAttribute("aria-label", finalText);
    el.textContent = "";

    const tick = (now: number) => {
        if (stopped) return;

        const t = Math.min((now - start) / durationMs, 1); // 0..1
        const resultChars: string[] = new Array(length);

        for (let i = 0; i < length; i++) {
            const ch = finalText[i];
            if (ch === " ") {
                resultChars[i] = " ";
                continue;
            }

            // each char reveals slightly later based on index
            const charRevealT = revealStart + (i / Math.max(1, length - 1)) * (1 - revealStart);

            if (t >= charRevealT) {
                resultChars[i] = ch;
            } else {
                resultChars[i] = chars[Math.floor(Math.random() * chars.length)];
            }
        }

        el.textContent = resultChars.join("");

        if (t >= 1) {
            el.textContent = finalText;
            onComplete?.();
            return;
        }

        raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return {
        stop: () => {
            stopped = true;
            if (raf) cancelAnimationFrame(raf);
            el.textContent = finalText;
        },
    };
}

export function createTextScramble(
    selector: ElementSelector,
    options: TextScrambleOptions = {}
): EffectInstance {
    const g = guard({ requireDocument: true, allowReducedMotion: false });
    if (!g.ok) return g.instance;

    const opts = { ...defaults, ...options };
    const elements = resolveElements(selector, opts.root);

    if (!elements.length) return noopInstance();

    const c = createCleanup();
    const active = new Map<HTMLElement, ScrambleController>();

    const stopFor = (el: HTMLElement) => {
        active.get(el)?.stop();
        active.delete(el);
    };

    const getFinalText = (el: HTMLElement) => {
        // prefer explicit option, then dataset override, then current textContent
        return opts.text ?? el.dataset.text ?? el.textContent ?? "";
    };

    const run = (el: HTMLElement) => {
        // stop any previous scramble on this element
        stopFor(el);

        const text = getFinalText(el);

        // store originals once
        if (!el.dataset.originalText) el.dataset.originalText = text;
        el.dataset.text = text;

        // start new scramble
        const ctrl = scrambleRaf(el, text, opts.duration, opts.chars, opts.onComplete);
        active.set(el, ctrl);
    };

    // Reduced motion: immediately show final state + no listeners/triggers.
    // (guard already blocks reduced motion; but keeping this is harmless if you later allow it.)
    // If you want to support reduced motion “show final” instead of noop, change guard() usage.

    for (const node of elements) {
        const el = node as HTMLElement;

        // Ensure dataset text is present for later triggers
        el.dataset.text = opts.text ?? el.textContent ?? "";

        if (opts.trigger === "load") {
            el.textContent = "";
            const dc = gsap.delayedCall(opts.delay, () => run(el));
            c.add(() => dc.kill());
        }

        if (opts.trigger === "scroll") {
            el.textContent = "";
            const st = ScrollTrigger.create({
                trigger: el,
                start: opts.scrollStart,
                onEnter: () => {
                    const dc = gsap.delayedCall(opts.delay, () => run(el));
                    // important: kill delayed calls if destroyed before they run
                    c.add(() => dc.kill());
                },
                once: true,
            });
            c.add(() => st.kill());
        }

        if (opts.trigger === "hover") {
            const onEnter = () => run(el);
            // typed helper: your createCleanup().on() supports event maps
            c.on(el, "mouseenter", onEnter);
        }

        // always cleanup element-specific controller
        c.add(() => stopFor(el));
    }

    return {
        destroy: () => {
            c.destroy();
            // optional: restore original text
            for (const node of elements) {
                const el = node as HTMLElement;
                const original = el.dataset.originalText;
                if (original != null) el.textContent = original;
            }
        },
        replay: () => {
            // replay immediately regardless of trigger type (useful for manual testing)
            for (const node of elements) run(node as HTMLElement);
        },
    };
}

export default createTextScramble;