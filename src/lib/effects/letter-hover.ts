import { gsap } from "gsap";
import { type EffectInstance, type ElementSelector } from "../types";
import { resolveElements } from "../utils/dom";
import { guard } from "../utils/guards";
import { createCleanup } from "../utils/instance";

export interface LetterHoverOptions {
    /** Optional root for scoping selector queries */
    root?: ParentNode;

    /** Selector for individual letter elements within the container */
    letterSelector?: string;

    /** Y offset on hover */
    yOffset?: number;

    /** X offset on hover (optional) */
    xOffset?: number;

    /** Scale on hover (optional) */
    scale?: number;

    /** Color change on hover (optional) */
    color?: string;

    /** Duration for hover in */
    duration?: number;

    /** Duration for hover out */
    durationOut?: number;

    /** Stagger between letters */
    stagger?: number;

    /** Easing function */
    ease?: string;

    /** Disable console warning when no letters found */
    silent?: boolean;
}

const defaultLetterHoverOptions: Required<
    Omit<
        LetterHoverOptions,
        "root" | "xOffset" | "scale" | "color" | "silent"
    >
> & {
    xOffset?: number;
    scale?: number;
    color?: string;
    silent?: boolean;
} = {
    letterSelector: ".hc, .char, [data-char]",
    yOffset: -4,
    xOffset: undefined,
    scale: undefined,
    color: undefined,
    duration: 0.25,
    durationOut: 0.3,
    stagger: 0.02,
    ease: "power2.out",
    silent: false,
};

/**
 * Creates a hover effect where letters lift up individually.
 * Requires letters to be wrapped in span elements (or match `letterSelector`).
 *
 * Framework-agnostic:
 * - Pass container element(s) or selector
 * - Optional `root` to scope selector queries to a component
 * - Returns `destroy()` cleanup
 *
 * @example
 * ```ts
 * const fx = createLetterHover(".title", { yOffset: -8 });
 * // later
 * fx.destroy();
 * ```
 */
export function createLetterHover(
    selector: ElementSelector,
    options: LetterHoverOptions = {}
): EffectInstance {
    const g = guard({ requireHover: true });
    if (!g.ok) return g.instance;

    const opts = { ...defaultLetterHoverOptions, ...options };
    const containers = resolveElements(selector, opts.root);
    const cleanup = createCleanup();

    for (const container of containers) {
        const letters = container.querySelectorAll(opts.letterSelector);

        if (letters.length === 0) {
            if (!opts.silent) {
                // eslint-disable-next-line no-console
                console.warn(
                    `LetterHover: No letters found with selector "${opts.letterSelector}" in`,
                    container
                );
            }
            continue;
        }

        const handleMouseEnter = () => {
            const animProps: gsap.TweenVars = {
                y: opts.yOffset,
                duration: opts.duration,
                stagger: opts.stagger,
                ease: opts.ease,
                overwrite: "auto",
            };

            if (opts.xOffset !== undefined) animProps.x = opts.xOffset;
            if (opts.scale !== undefined) animProps.scale = opts.scale;
            if (opts.color !== undefined) animProps.color = opts.color;

            gsap.to(letters, animProps);
        };

        const handleMouseLeave = () => {
            const animProps: gsap.TweenVars = {
                y: 0,
                duration: opts.durationOut,
                stagger: opts.stagger,
                ease: opts.ease,
                overwrite: "auto",
            };

            if (opts.xOffset !== undefined) animProps.x = 0;
            if (opts.scale !== undefined) animProps.scale = 1;

            // If color was set on enter, clear it on leave.
            if (opts.color !== undefined) animProps.clearProps = "color";

            gsap.to(letters, animProps);
        };

        cleanup.on(container, "mouseenter", handleMouseEnter);
        cleanup.on(container, "mouseleave", handleMouseLeave);

        cleanup.add(() => {
            gsap.killTweensOf(letters);
        });
    }

    return {
        destroy: () => {
            cleanup.destroy();
        },
    };
}
