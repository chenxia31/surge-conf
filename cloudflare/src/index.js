// 星语塔罗 Cloudflare Worker 后端
// - 静态站点(tarot/ via [assets])
// - /api/config          : 前端探测后端能力(是否启用云账户、Google Client ID)
// - /api/register|login|google|me|logout : 账户系统(D1)
// - /api/history (GET/POST/DELETE)       : 云端历史记录(D1)
// - /api/llm             : 统一 AI 代理(Anthropic + DeepSeek),归一化流式回传
// D1 未绑定时,账户/历史端点返回 503 backend_not_configured,其余照常工作。

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, authorization",
  "access-control-max-age": "86400",
};
const SESSION_TTL = 30 * 24 * 3600 * 1000; // 30 天

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS },
  });
}
const bytesToHex = (b) => [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
function hexToBytes(h) {
  const a = new Uint8Array(h.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(h.substr(i * 2, 2), 16);
  return a;
}
function randToken() {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(24)));
}

async function hashPassword(password, saltHex) {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const km = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, km, 256
  );
  return bytesToHex(salt) + "$" + bytesToHex(new Uint8Array(bits));
}
async function verifyPassword(password, stored) {
  if (!stored || !stored.includes("$")) return false;
  const [saltHex] = stored.split("$");
  const recomputed = await hashPassword(password, saltHex);
  // 长度固定,常规比较即可
  return recomputed === stored;
}

async function createSession(env, userId) {
  const token = randToken();
  const now = Date.now();
  await env.DB.prepare(
    "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?,?,?,?)"
  ).bind(token, userId, now, now + SESSION_TTL).run();
  return token;
}
async function getUser(request, env) {
  if (!env.DB) return null;
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const row = await env.DB.prepare(
    "SELECT s.expires_at, u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?"
  ).bind(token).first();
  if (!row || row.expires_at < Date.now()) return null;
  return { id: row.id, email: row.email, name: row.name };
}

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name };
}

async function handleRegister(request, env) {
  const { email, password, name } = await request.json().catch(() => ({}));
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return json(400, { error: { type: "invalid_request", message: "邮箱格式不正确" } });
  if (!password || password.length < 6)
    return json(400, { error: { type: "invalid_request", message: "密码至少 6 位" } });
  const exists = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (exists) return json(409, { error: { type: "conflict", message: "该邮箱已注册,请直接登录" } });
  const id = crypto.randomUUID();
  const hash = await hashPassword(password);
  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?,?,?,?,?)"
  ).bind(id, email, hash, name || email.split("@")[0], Date.now()).run();
  const token = await createSession(env, id);
  return json(200, { token, user: { id, email, name: name || email.split("@")[0] } });
}

async function handleLogin(request, env) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password)
    return json(400, { error: { type: "invalid_request", message: "请填写邮箱与密码" } });
  const row = await env.DB.prepare(
    "SELECT id, email, name, password_hash FROM users WHERE email = ?"
  ).bind(email).first();
  if (!row || !(await verifyPassword(password, row.password_hash)))
    return json(401, { error: { type: "auth_error", message: "邮箱或密码错误" } });
  const token = await createSession(env, row.id);
  return json(200, { token, user: publicUser(row) });
}

async function handleGoogle(request, env) {
  const { credential } = await request.json().catch(() => ({}));
  if (!credential) return json(400, { error: { type: "invalid_request", message: "缺少 Google 凭证" } });
  // 用 Google tokeninfo 端点校验 ID Token
  const resp = await fetch("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(credential));
  if (!resp.ok) return json(401, { error: { type: "auth_error", message: "Google 凭证无效" } });
  const claims = await resp.json();
  if (env.GOOGLE_CLIENT_ID && claims.aud !== env.GOOGLE_CLIENT_ID)
    return json(401, { error: { type: "auth_error", message: "Google 凭证的目标应用不匹配" } });
  const sub = claims.sub;
  const email = claims.email || null;
  const name = claims.name || (email ? email.split("@")[0] : "Google 用户");
  if (!sub) return json(401, { error: { type: "auth_error", message: "Google 凭证缺少用户标识" } });

  let user = await env.DB.prepare("SELECT id, email, name FROM users WHERE google_sub = ?").bind(sub).first();
  if (!user && email)
    user = await env.DB.prepare("SELECT id, email, name FROM users WHERE email = ?").bind(email).first();
  if (user) {
    await env.DB.prepare("UPDATE users SET google_sub = ? WHERE id = ?").bind(sub, user.id).run();
  } else {
    const id = crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO users (id, email, google_sub, name, created_at) VALUES (?,?,?,?,?)"
    ).bind(id, email, sub, name, Date.now()).run();
    user = { id, email, name };
  }
  const token = await createSession(env, user.id);
  return json(200, { token, user: publicUser(user) });
}

async function handleHistory(request, env, user, url) {
  if (request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT id, question, spread, cards, summary, ai_text, created_at FROM readings WHERE user_id = ? ORDER BY created_at DESC LIMIT 200"
    ).bind(user.id).all();
    return json(200, { readings: results || [] });
  }
  if (request.method === "POST") {
    const b = await request.json().catch(() => ({}));
    if (b.id) {
      const owned = await env.DB.prepare("SELECT id FROM readings WHERE id = ? AND user_id = ?").bind(b.id, user.id).first();
      if (owned) {
        await env.DB.prepare("UPDATE readings SET ai_text = ?, summary = ? WHERE id = ?")
          .bind(b.ai_text ?? null, b.summary ?? null, b.id).run();
        return json(200, { id: b.id });
      }
    }
    const id = crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO readings (id, user_id, question, spread, cards, summary, ai_text, created_at) VALUES (?,?,?,?,?,?,?,?)"
    ).bind(id, user.id, b.question ?? "", b.spread ?? "", JSON.stringify(b.cards ?? []), b.summary ?? "", b.ai_text ?? null, Date.now()).run();
    return json(200, { id });
  }
  if (request.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (id) await env.DB.prepare("DELETE FROM readings WHERE id = ? AND user_id = ?").bind(id, user.id).run();
    return json(200, { ok: true });
  }
  return json(405, { error: { type: "method_not_allowed", message: "不支持的方法" } });
}

// 统一 AI 代理:归一化两家的流式输出为 data: {"text": "..."}
function normalizeStream(upstreamBody, provider) {
  const reader = upstreamBody.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = "";
  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
        return;
      }
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith("data:")) continue;
        const data = t.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        let ev;
        try { ev = JSON.parse(data); } catch (_) { continue; }
        let text = "";
        if (provider === "anthropic") {
          if (ev.type === "content_block_delta" && ev.delta && ev.delta.type === "text_delta") text = ev.delta.text;
        } else {
          text = (ev.choices && ev.choices[0] && ev.choices[0].delta && ev.choices[0].delta.content) || "";
        }
        if (text) controller.enqueue(encoder.encode("data: " + JSON.stringify({ text }) + "\n\n"));
      }
    },
    cancel() { reader.cancel(); },
  });
}

async function handleLlm(request, env) {
  const b = await request.json().catch(() => ({}));
  const provider = b.provider === "deepseek" ? "deepseek" : "anthropic";
  const apiKey = (b.apiKey || "").trim();
  if (!apiKey) return json(401, { error: { type: "auth_error", message: "缺少 API Key" } });
  const system = b.system || "";
  const userContent = b.userContent || "";
  const model = b.model || (provider === "deepseek" ? "deepseek-chat" : "claude-opus-4-8");

  let upstream;
  try {
    if (provider === "deepseek") {
      upstream = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + apiKey },
        body: JSON.stringify({
          model, stream: true, max_tokens: 4000,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userContent },
          ],
        }),
      });
    } else {
      upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model, max_tokens: 4000, stream: true, system,
          messages: [{ role: "user", content: userContent }],
        }),
      });
    }
  } catch (e) {
    return json(502, { error: { type: "upstream_error", message: "无法连接 AI 服务商" } });
  }

  if (!upstream.ok || !upstream.body) {
    let message = "AI 请求失败(HTTP " + upstream.status + ")";
    if (upstream.status === 401) message = "API Key 无效或已过期,请到账户设置中重新填写。";
    else if (upstream.status === 429) message = "请求过于频繁,请稍后再试。";
    else {
      try {
        const e = await upstream.json();
        message = (e.error && (e.error.message || e.error.type)) || message;
      } catch (_) {}
    }
    return json(upstream.status || 502, { error: { type: "upstream_error", message } });
  }

  return new Response(normalizeStream(upstream.body, provider), {
    status: 200,
    headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache", ...CORS },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/")) {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

      if (path === "/api/config") {
        return json(200, { accounts: !!env.DB, googleClientId: env.GOOGLE_CLIENT_ID || null });
      }
      if (path === "/api/llm") {
        if (request.method !== "POST") return json(405, { error: { type: "method_not_allowed", message: "Use POST" } });
        return handleLlm(request, env);
      }

      // 以下端点需要 D1
      if (!env.DB) return json(503, { error: { type: "backend_not_configured", message: "云端账户功能尚未配置" } });

      try {
        if (path === "/api/register" && request.method === "POST") return await handleRegister(request, env);
        if (path === "/api/login" && request.method === "POST") return await handleLogin(request, env);
        if (path === "/api/google" && request.method === "POST") return await handleGoogle(request, env);

        if (path === "/api/me") {
          const user = await getUser(request, env);
          if (!user) return json(401, { error: { type: "auth_error", message: "未登录" } });
          return json(200, { user });
        }
        if (path === "/api/logout" && request.method === "POST") {
          const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
          if (token) await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
          return json(200, { ok: true });
        }
        if (path === "/api/history") {
          const user = await getUser(request, env);
          if (!user) return json(401, { error: { type: "auth_error", message: "未登录" } });
          return await handleHistory(request, env, user, url);
        }
      } catch (e) {
        return json(500, { error: { type: "server_error", message: String(e && e.message || e) } });
      }
      return json(404, { error: { type: "not_found", message: "未知接口" } });
    }

    return env.ASSETS.fetch(request);
  },
};
