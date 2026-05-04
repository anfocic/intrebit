const UPSTREAM = "https://plausible.fole.dev/api/event";

export const onRequestPost: PagesFunction = async ({ request }) => {
  const upstream = await fetch(UPSTREAM, {
    method: "POST",
    headers: {
      "content-type": request.headers.get("content-type") ?? "application/json",
      "user-agent": request.headers.get("user-agent") ?? "",
      "x-forwarded-for": request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "",
      "referer": request.headers.get("referer") ?? "",
      "accept-language": request.headers.get("accept-language") ?? "",
    },
    body: request.body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-cache",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
    },
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type",
      "access-control-max-age": "86400",
    },
  });
};
