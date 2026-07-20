// 星语塔罗 Cloudflare Worker
// - /api/claude : 同源代理到 Anthropic Messages API(转发用户自带的 x-api-key,流式回传)
// - 其余路径    : 由 [assets] 提供 tarot/ 静态站点

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers":
    "content-type, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access",
  "access-control-max-age": "86400",
};

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/claude") {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
      }
      if (request.method !== "POST") {
        return json(405, { error: { type: "method_not_allowed", message: "Use POST" } });
      }
      const apiKey = request.headers.get("x-api-key");
      if (!apiKey) {
        return json(401, {
          error: { type: "authentication_error", message: "Missing x-api-key header" },
        });
      }

      const body = await request.text();
      let upstream;
      try {
        upstream = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body,
        });
      } catch (e) {
        return json(502, {
          error: { type: "upstream_error", message: "Failed to reach api.anthropic.com" },
        });
      }

      const headers = new Headers(CORS_HEADERS);
      const ct = upstream.headers.get("content-type");
      if (ct) headers.set("content-type", ct);
      return new Response(upstream.body, { status: upstream.status, headers });
    }

    return env.ASSETS.fetch(request);
  },
};
