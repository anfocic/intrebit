import {AuthEnv, isAuthenticated} from "./lib/auth";

function isGated(pathname: string): {gated: boolean; isApi: boolean} {
    if (pathname === "/dashboard" || pathname === "/dashboard.html" || pathname.startsWith("/dashboard/")) {
        return {gated: true, isApi: false};
    }
    if (pathname.startsWith("/api/stats/") || pathname === "/api/stats") {
        return {gated: true, isApi: true};
    }
    return {gated: false, isApi: false};
}

export const onRequest: PagesFunction<AuthEnv> = async (ctx) => {
    const url = new URL(ctx.request.url);
    const {gated, isApi} = isGated(url.pathname);
    if (!gated) return ctx.next();

    const ok = await isAuthenticated(ctx.request, ctx.env);
    if (ok) return ctx.next();

    if (isApi) {
        return new Response(JSON.stringify({error: "unauthorized"}), {
            status: 401,
            headers: {"content-type": "application/json"},
        });
    }

    const next = url.pathname + url.search;
    const loginUrl = new URL("/login", url);
    loginUrl.searchParams.set("next", next);
    return Response.redirect(loginUrl.toString(), 302);
};
