import type { ElementSelector } from "../types";

export function hasDocument(): boolean {
    return typeof document !== "undefined";
}

function hasWindow(): boolean {
    return typeof window !== "undefined";
}

function safeMatchMedia(query: string): MediaQueryList | null {
    if (!hasWindow()) return null;
    return window.matchMedia?.(query) ?? null;
}

export function prefersReducedMotion(): boolean {
    return safeMatchMedia("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function supportsHover(): boolean {
    return safeMatchMedia("(hover: hover)")?.matches ?? true;
}

export function generateId(prefix = "effect"): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Resolve ElementSelector into a concrete element array.
 * - If selector is a string, queries inside `root` if provided, otherwise document.
 * - SSR-safe: returns [] if document is not available.
 */
export function resolveElements(
    selector: ElementSelector,
    root?: ParentNode
): Element[] {
    if (typeof selector === "string") {
        if (!hasDocument()) return [];
        const scope: ParentNode = root ?? document;
        return Array.from((scope as Document | Element).querySelectorAll(selector));
    }

    if (selector instanceof Element) return [selector];

    // NodeListOf<Element>
    if (typeof NodeList !== "undefined" && selector instanceof NodeList) {
        return Array.from(selector);
    }

    // Element[]
    return Array.isArray(selector) ? selector : [];
}