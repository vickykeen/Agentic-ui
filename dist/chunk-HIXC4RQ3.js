// src/core.ts
import { promises as fs } from "fs";
import path from "path";

// src/prompt.ts
var SYSTEM_PROMPT = `You are an AI UI/UX and content editor embedded in a live web page.
You receive JSON: { instruction, selection: { selector, tagName, text, html, styles } }.
Return ONE JSON object and nothing else (no markdown, no prose).

Allowed keys:
- "css": { "css-property": "value" }  (kebab-case CSS properties)
- "content": "replacement visible text"

Return whichever keys are needed. Use "content" for wording changes and "css" for look and layout.
For example, a request to change text color to red must return {"css":{"color":"red"}}.

Keep edits minimal and faithful to the instruction. Use the current styles as a starting point.
For "content", return the full new text for the element, matching its language and tone.
Never return JavaScript, URLs, data changes, navigation, authentication, or application behavior.`;

// src/shared.ts
var UNSAFE_VALUE = /url\(|expression\(|javascript:|@import/i;
function sanitizePatch(raw) {
  if (!raw || typeof raw !== "object") return null;
  const input = raw;
  const css = {};
  if (input.css && typeof input.css === "object") {
    for (const [property, value] of Object.entries(
      input.css
    )) {
      if (/^-{0,2}[a-z][a-z-]*$/.test(property) && typeof value === "string" && value.length < 300 && !UNSAFE_VALUE.test(value))
        css[property] = value;
    }
  }
  const content = typeof input.content === "string" && input.content.length < 5e3 ? input.content : void 0;
  return Object.keys(css).length || content !== void 0 ? { css, content } : null;
}

// src/core.ts
var json = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" }
});
function resolveProvider(option) {
  if (option) return option;
  const type = process.env.VISUAL_EDITOR_PROVIDER ?? (process.env.ANTHROPIC_API_KEY ? "anthropic" : process.env.OPENAI_API_KEY ? "openai" : "ollama");
  const model = process.env.VISUAL_EDITOR_MODEL;
  if (type === "anthropic") return { type, model };
  if (type === "openai")
    return { type, model, baseUrl: process.env.OPENAI_BASE_URL };
  return { type: "ollama", model, baseUrl: process.env.OLLAMA_BASE_URL };
}
async function callModel(provider, user) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: user }
  ];
  if (provider.type === "ollama") {
    const res2 = await fetch(
      `${provider.baseUrl ?? "http://localhost:11434"}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: provider.model ?? "gemma4:e2b",
          stream: false,
          format: "json",
          options: { temperature: 0.2 },
          messages
        })
      }
    ).catch(() => null);
    if (!res2?.ok) throw new Error("Ollama is unreachable. Run: ollama serve");
    return (await res2.json()).message?.content ?? "";
  }
  if (provider.type === "openai") {
    const apiKey2 = provider.apiKey ?? process.env.OPENAI_API_KEY;
    const res2 = await fetch(
      `${provider.baseUrl ?? "https://api.openai.com/v1"}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...apiKey2 ? { Authorization: `Bearer ${apiKey2}` } : {}
        },
        body: JSON.stringify({
          model: provider.model ?? "gpt-4o-mini",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages
        })
      }
    );
    if (!res2.ok)
      throw new Error(
        `Model request failed (${res2.status}). Check OPENAI_API_KEY and model name.`
      );
    return (await res2.json()).choices?.[0]?.message?.content ?? "";
  }
  const apiKey = provider.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Set ANTHROPIC_API_KEY on the server.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: provider.model ?? "claude-sonnet-5-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: user }]
    })
  });
  if (!res.ok)
    throw new Error(
      `Model request failed (${res.status}). Check ANTHROPIC_API_KEY and model name.`
    );
  return (await res.json()).content?.find((b) => b.type === "text")?.text ?? "";
}
var queue = Promise.resolve();
var locked = (job) => queue = queue.then(job, job);
async function readEdits(file) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return [];
  }
}
function merge(list, edit) {
  const previous = list.find((e) => e.selector === edit.selector);
  if (!previous) return [...list, edit];
  const patch = {
    css: { ...previous.patch.css, ...edit.patch.css },
    content: edit.patch.content ?? previous.patch.content
  };
  return list.map(
    (e) => e.selector === edit.selector ? { ...edit, patch } : e
  );
}
async function handleEditorRequest(request, options = {}) {
  const base = options.basePath ?? "/api/visual-editor";
  const url = new URL(request.url);
  if (url.pathname !== base && !url.pathname.startsWith(`${base}/`))
    return null;
  const enabled = options.enabled ?? process.env.NODE_ENV !== "production";
  if (!enabled)
    return json(403, {
      message: "Visual editor is disabled outside development."
    });
  if (options.authorize && !await options.authorize(request))
    return json(401, { message: "Not authorized." });
  const route = url.pathname.slice(base.length) || "/";
  const file = path.resolve(
    process.cwd(),
    options.editsFile ?? "visual-editor.edits.json"
  );
  let body = {};
  if (request.method === "POST") {
    const text = await request.text();
    if (text.length > 2e5)
      return json(413, { message: "Request too large." });
    try {
      body = JSON.parse(text || "{}");
    } catch {
      return json(400, { message: "Invalid JSON body." });
    }
  }
  if (route === "/ai" && request.method === "POST") {
    if (typeof body.instruction !== "string" || typeof body.selection?.selector !== "string")
      return json(400, { message: "Missing instruction or selection." });
    try {
      return json(200, {
        message: await callModel(
          resolveProvider(options.provider),
          JSON.stringify(body)
        )
      });
    } catch (error) {
      return json(502, {
        message: error instanceof Error ? error.message : "AI request failed."
      });
    }
  }
  if (route === "/edits" && request.method === "GET")
    return json(200, await readEdits(file));
  if (route === "/edits" && request.method === "POST") {
    const patch = sanitizePatch(body.patch);
    if (typeof body.selector !== "string" || body.selector.length > 500 || !patch)
      return json(400, { message: "Invalid edit." });
    const edit = {
      selector: body.selector,
      instruction: typeof body.instruction === "string" ? body.instruction.slice(0, 500) : void 0,
      patch,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await locked(
      async () => fs.writeFile(
        file,
        JSON.stringify(merge(await readEdits(file), edit), null, 2)
      )
    );
    return json(200, { ok: true });
  }
  if (route === "/edits" && request.method === "DELETE") {
    const selector = url.searchParams.get("selector");
    await locked(
      async () => fs.writeFile(
        file,
        JSON.stringify(
          selector ? (await readEdits(file)).filter((e) => e.selector !== selector) : [],
          null,
          2
        )
      )
    );
    return json(200, { ok: true });
  }
  return json(404, { message: "Not found." });
}

// src/adapter.ts
function toNodeMiddleware(options = {}) {
  return async (req, res, next) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const request = new Request(
      `http://${req.headers.host ?? "localhost"}${req.originalUrl ?? req.url}`,
      {
        method: req.method,
        headers: req.headers,
        body: hasBody && chunks.length ? Buffer.concat(chunks) : void 0
      }
    );
    const response = await handleEditorRequest(request, options);
    if (!response)
      return next ? next() : void (res.statusCode = 404, res.end());
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(await response.text());
  };
}

export {
  handleEditorRequest,
  toNodeMiddleware
};
