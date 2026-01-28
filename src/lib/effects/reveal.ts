import { gsap } from "gsap";
import type { EffectInstance, ElementSelector } from "../types";
import { resolveElements } from "../utils/dom";
import { guard } from "../utils/guards";
import { createCleanup, noopInstance } from "../utils/instance";

export interface RevealSequenceOptions {
  /** Optional root for querySelector scoping (recommended for components) */
  root?: ParentNode;

  /** Main element to reveal with a clip-path "mask" */
  title: ElementSelector;

  /** Secondary elements to fade-up (staggered) */
  text?: ElementSelector;

  /** Optional extra element */
  extra?: ElementSelector;

  /** Duration for the main reveal */
  titleDuration?: number;

  /** Duration for text reveal */
  textDuration?: number;

  /** Stagger between text elements */
  stagger?: number;

  /** Initial Y offset */
  yOffset?: number;

  /** Easing function */
  ease?: string;

  /** Overlap start time for text relative to title end (negative = overlap) */
  textOverlap?: number;

  /** Callback when animation completes */
  onComplete?: () => void;

  /** Clip-path start/end values for the main reveal */
  clipFrom?: string;
  clipTo?: string;

  /** Extra blur start/end (if extra is provided) */
  extraBlurFrom?: number;
  extraBlurTo?: number;

  /** Extra target final opacity */
  extraOpacity?: number;
}

const defaults: Required<
  Omit<RevealSequenceOptions, "root" | "title" | "text" | "extra" | "onComplete">
> & {
  onComplete?: () => void;
} = {
  titleDuration: 0.9,
  textDuration: 0.6,
  stagger: 0.15,
  yOffset: 18,
  ease: "power3.out",
  textOverlap: 0.35,
  clipFrom: "inset(0 0 100% 0)",
  clipTo: "inset(0 0 0% 0)",
  extraBlurFrom: 6,
  extraBlurTo: 0,
  extraOpacity: 0.85,
  onComplete: undefined,
};

/**
 * Generic "mask reveal + staggered fade-up" sequence.
 *
 * Framework-agnostic:
 * - pass elements or selectors
 * - optional `root` to scope selectors to a component
 *
 * Returns `destroy()` cleanup + `replay()` helper.
 */
export function createRevealSequence(options: RevealSequenceOptions): EffectInstance {
  // We want to be SSR-safe, but we ALSO want to set the final state in reduced-motion.
  // So: allowReducedMotion=true in the guard, then handle reduced-motion explicitly.
  const g = guard({ requireDocument: true, allowReducedMotion: true });
  if (!g.ok) return g.instance;

  const opts = { ...defaults, ...options };
  const root = opts.root ?? document;

  const titleEls = resolveElements(opts.title, root);
  const textEls = resolveElements(opts.text ?? [], root);
  const extraEls = resolveElements(opts.extra ?? [], root);
  const allEls = [...titleEls, ...textEls, ...extraEls];

  // Reduced motion: set to final state and return a no-op instance.
  // (We keep `allowReducedMotion` in guard so SSR still blocks safely.)
  const rm = guard({ requireDocument: true, allowReducedMotion: false });
  if (!rm.ok && rm.reason === "reduced-motion") {
    if (allEls.length) {
      gsap.set(allEls, {
        opacity: 1,
        y: 0,
        clipPath: "none",
        filter: "none",
      });
    }
    return noopInstance();
  }

  const cleanup = createCleanup();
  let timeline: gsap.core.Timeline | null = null;

  const killAll = () => {
    if (timeline) {
      timeline.kill();
      timeline = null;
    }

    for (const el of allEls) {
      gsap.killTweensOf(el);
    }
  };

  const run = () => {
    killAll();

    // Initial states
    if (titleEls.length) {
      gsap.set(titleEls, {
        opacity: 0,
        y: opts.yOffset,
        clipPath: opts.clipFrom,
      });
    }

    if (textEls.length) {
      gsap.set(textEls, { opacity: 0, y: opts.yOffset * 0.8 });
    }

    if (extraEls.length) {
      gsap.set(extraEls, {
        opacity: 0,
        y: opts.yOffset * 0.5,
        filter: `blur(${opts.extraBlurFrom}px)`,
      });
    }

    timeline = gsap.timeline({
      defaults: { ease: opts.ease },
      onComplete: opts.onComplete,
    });

    // Title mask reveal
    if (titleEls.length) {
      timeline.to(titleEls, {
        opacity: 1,
        y: 0,
        clipPath: opts.clipTo,
        duration: opts.titleDuration,
      });
    }

    // Staggered text fade-up (overlap with title end)
    if (textEls.length) {
      const pos = titleEls.length ? `-=${opts.textOverlap}` : 0;
      timeline.to(
        textEls,
        {
          opacity: 1,
          y: 0,
          duration: opts.textDuration,
          stagger: opts.stagger,
        },
        pos as any
      );
    }

    // Extra element
    if (extraEls.length) {
      timeline.to(
        extraEls,
        {
          opacity: opts.extraOpacity,
          y: 0,
          filter: `blur(${opts.extraBlurTo}px)`,
          duration: 0.5,
        },
        "+=0.15"
      );
    }
  };

  run();

  cleanup.add(() => killAll());

  return {
    destroy: () => {
      cleanup.destroy();
    },
    replay: () => {
      run();
    },
  };
}