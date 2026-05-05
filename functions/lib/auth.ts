import {argon2Verify} from "hash-wasm";

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export interface AuthEnv {
    ADMIN_USERNAME?: string;
    ADMIN_PASSWORD_HASH?: string;
    SESSION_SECRET?: string;
    NODE_ENV?: string;
    ENVIRONMENT?: string;
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
}

export function timingSafeStringEqual(a: string, b: string): boolean {
    const enc = new TextEncoder();
    const ab = enc.encode(a);
    const bb = enc.encode(b);
    if (ab.length !== bb.length) {
        timingSafeEqual(ab, ab);
        return false;
    }
    return timingSafeEqual(ab, bb);
}

function b64urlEncode(bytes: Uint8Array): string {
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
    const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        {name: "HMAC", hash: "SHA-256"},
        false,
        ["sign"],
    );
}

async function sign(payload: string, secret: string): Promise<string> {
    const key = await hmacKey(secret);
    const sig = new Uint8Array(
        await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)),
    );
    return b64urlEncode(sig);
}

export async function makeSessionCookie(env: AuthEnv): Promise<string> {
    if (!env.SESSION_SECRET) throw new Error("SESSION_SECRET not set");
    const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
    const payload = b64urlEncode(new TextEncoder().encode(JSON.stringify({exp})));
    const sig = await sign(payload, env.SESSION_SECRET);
    return `${payload}.${sig}`;
}

export async function verifySession(cookieValue: string, env: AuthEnv): Promise<boolean> {
    if (!env.SESSION_SECRET) return false;
    const dot = cookieValue.indexOf(".");
    if (dot < 1 || dot === cookieValue.length - 1) return false;
    const payload = cookieValue.slice(0, dot);
    const provided = cookieValue.slice(dot + 1);
    const expected = await sign(payload, env.SESSION_SECRET);
    let providedBytes: Uint8Array;
    let expectedBytes: Uint8Array;
    try {
        providedBytes = b64urlDecode(provided);
        expectedBytes = b64urlDecode(expected);
    } catch {
        return false;
    }
    if (!timingSafeEqual(providedBytes, expectedBytes)) return false;
    let parsed: {exp?: number};
    try {
        parsed = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    } catch {
        return false;
    }
    if (typeof parsed.exp !== "number") return false;
    return parsed.exp > Math.floor(Date.now() / 1000);
}

export function getSessionCookie(request: Request): string | null {
    const header = request.headers.get("cookie");
    if (!header) return null;
    const parts = header.split(/;\s*/);
    for (const part of parts) {
        const eq = part.indexOf("=");
        if (eq < 0) continue;
        if (part.slice(0, eq) === COOKIE_NAME) return part.slice(eq + 1);
    }
    return null;
}

function isProduction(env: AuthEnv): boolean {
    return env.NODE_ENV === "production" || env.ENVIRONMENT === "production";
}

export function buildSetCookie(value: string, env: AuthEnv): string {
    const flags = [
        `${COOKIE_NAME}=${value}`,
        "HttpOnly",
        "SameSite=Lax",
        "Path=/",
        `Max-Age=${MAX_AGE_SECONDS}`,
    ];
    if (isProduction(env)) flags.push("Secure");
    return flags.join("; ");
}

export function buildClearCookie(env: AuthEnv): string {
    const flags = [
        `${COOKIE_NAME}=`,
        "HttpOnly",
        "SameSite=Lax",
        "Path=/",
        "Max-Age=0",
    ];
    if (isProduction(env)) flags.push("Secure");
    return flags.join("; ");
}

export async function isAuthenticated(request: Request, env: AuthEnv): Promise<boolean> {
    const cookie = getSessionCookie(request);
    if (!cookie) return false;
    return verifySession(cookie, env);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
        return await argon2Verify({password, hash});
    } catch {
        return false;
    }
}

export {COOKIE_NAME, MAX_AGE_SECONDS};
