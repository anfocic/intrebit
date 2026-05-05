import {
    AuthEnv,
    buildSetCookie,
    makeSessionCookie,
    timingSafeStringEqual,
    verifyPassword,
} from "../../lib/auth";
import {checkRateLimit, clearRateLimit} from "../../lib/rateLimit";

function jsonError(message: string, status: number, extraHeaders: Record<string, string> = {}) {
    return new Response(JSON.stringify({error: message}), {
        status,
        headers: {"content-type": "application/json", ...extraHeaders},
    });
}

export const onRequestPost: PagesFunction<AuthEnv> = async ({request, env}) => {
    if (!env.ADMIN_USERNAME || !env.ADMIN_PASSWORD_HASH || !env.SESSION_SECRET) {
        return jsonError("server not configured", 500);
    }

    const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
    const limit = checkRateLimit(`login:${ip}`);
    if (!limit.allowed) {
        return jsonError("too many attempts", 429, {
            "retry-after": String(limit.retryAfterSeconds),
        });
    }

    let body: {username?: unknown; password?: unknown};
    try {
        body = await request.json();
    } catch {
        return jsonError("invalid credentials", 401);
    }
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";

    const userOk = timingSafeStringEqual(username, env.ADMIN_USERNAME);
    const passOk = password.length > 0
        ? await verifyPassword(password, env.ADMIN_PASSWORD_HASH)
        : false;

    if (!userOk || !passOk) {
        return jsonError("invalid credentials", 401);
    }

    clearRateLimit(`login:${ip}`);
    const cookie = await makeSessionCookie(env);
    return new Response(null, {
        status: 204,
        headers: {"set-cookie": buildSetCookie(cookie, env)},
    });
};
