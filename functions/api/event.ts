const UPSTREAM = "https://plausible.fole.dev/api/event";

export const onRequestPost: PagesFunction = async ({request}) => {
    const headers = new Headers();
    headers.set("content-type", request.headers.get("content-type") ?? "application/json");
    headers.set("user-agent", request.headers.get("user-agent") ?? "");
    headers.set("x-forwarded-for", request.headers.get("cf-connecting-ip") ?? "");

    const upstream = await fetch(UPSTREAM, {
        method: "POST",
        headers,
        body: await request.text(),
    });

    return new Response(upstream.body, {
        status: upstream.status,
        headers: {"content-type": upstream.headers.get("content-type") ?? "text/plain"},
    });
};
