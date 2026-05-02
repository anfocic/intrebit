const UPSTREAM = "https://plausible.fole.dev/js/script.js";

export const onRequestGet: PagesFunction = async () => {
    const upstream = await fetch(UPSTREAM, {
        cf: {cacheTtl: 14400, cacheEverything: true},
    });

    return new Response(upstream.body, {
        status: upstream.status,
        headers: {
            "content-type": "application/javascript",
            "cache-control": "public, max-age=86400",
        },
    });
};
