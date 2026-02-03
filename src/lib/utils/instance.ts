// src/utils/instance.ts
import type { EffectInstance } from "../types";

export type Cleanup = () => void;

export function noopInstance(overrides: Partial<EffectInstance> = {}): EffectInstance {
    return {
        destroy: () => {},
        pause: () => {},
        resume: () => {},
        replay: () => {},
        ...overrides,
    };
}

type AnyListener = (event: Event) => void;

export function createCleanup() {
    const fns: Cleanup[] = [];

    function add(fn: Cleanup) {
        fns.push(fn);
    }

    // --- Overloads (good DX) ---
    function on<K extends keyof WindowEventMap>(
        target: Window,
        type: K,
        handler: (event: WindowEventMap[K]) => void,
        options?: AddEventListenerOptions | boolean
    ): void;

    function on<K extends keyof DocumentEventMap>(
        target: Document,
        type: K,
        handler: (event: DocumentEventMap[K]) => void,
        options?: AddEventListenerOptions | boolean
    ): void;

    function on<K extends keyof HTMLElementEventMap>(
        target: HTMLElement,
        type: K,
        handler: (event: HTMLElementEventMap[K]) => void,
        options?: AddEventListenerOptions | boolean
    ): void;

    // Fallback for generic EventTarget/custom events
    function on(
        target: EventTarget,
        type: string,
        handler: AnyListener,
        options?: AddEventListenerOptions | boolean
    ): void;

    function on(
        target: EventTarget,
        type: string,
        handler: AnyListener,
        options?: AddEventListenerOptions | boolean
    ) {
        target.addEventListener(type, handler as EventListener, options);
        add(() => target.removeEventListener(type, handler as EventListener, options));
    }

    function destroy() {
        for (let i = fns.length - 1; i >= 0; i--) fns[i]?.();
        fns.length = 0;
    }

    return { add, on, destroy };
}