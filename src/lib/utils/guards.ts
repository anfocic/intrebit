// src/utils/guards.ts
import type {EffectInstance} from "@lib";
import {hasDocument, hasWindow, prefersReducedMotion, supportsHover} from "@lib";
import {noopInstance} from "./instance";

export type GuardReason = "ssr" | "reduced-motion" | "no-hover";

export interface GuardOptions {
    requireDocument?: boolean;       // default true
    requireWindow?: boolean;         // default true
    requireHover?: boolean;          // default false
    allowReducedMotion?: boolean;    // default false
    debug?: boolean;                 // default false
}

export function guard(
    opts: GuardOptions = {}
): { ok: true } | { ok: false; reason: GuardReason; instance: EffectInstance } {
    const o: Required<GuardOptions> = {
        requireDocument: true,
        requireWindow: true,
        requireHover: false,
        allowReducedMotion: false,
        debug: false,
        ...opts,
    };

    if (o.requireWindow && !hasWindow()) {
        if (o.debug) console.warn("[effects] blocked: no window (SSR)");
        return { ok: false, reason: "ssr", instance: noopInstance() };
    }

    if (o.requireDocument && !hasDocument()) {
        if (o.debug) console.warn("[effects] blocked: no document (SSR)");
        return { ok: false, reason: "ssr", instance: noopInstance() };
    }

    if (!o.allowReducedMotion && prefersReducedMotion()) {
        if (o.debug) console.warn("[effects] blocked: prefers-reduced-motion");
        return { ok: false, reason: "reduced-motion", instance: noopInstance() };
    }

    if (o.requireHover && !supportsHover()) {
        if (o.debug) console.warn("[effects] blocked: no hover support");
        return { ok: false, reason: "no-hover", instance: noopInstance() };
    }

    return { ok: true };
}