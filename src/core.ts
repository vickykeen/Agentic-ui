import { promises as fs } from "node:fs";
import path from "node:path";
import { SYSTEM_PROMPT } from "./prompt";
import { sanitizePatch, type UiPatch } from "./shared";

export type Provider =
  | { type: "ollama"; model?: string; baseUrl?: string }
  | { type: "openai"; model?: string; baseUrl?: string; apiKey?: string } // OpenAI, OpenRouter, LM Studio, Groq…
  | { type: "anthropic"; model?: string; apiKey?: string };

export type EditorServerOptions = {
  /** Defaults to env: VISUAL_EDITOR_PROVIDER = ollama | openai | anthropic. */
  provider?: Provider;
  /** Where saved edits are written. Default: ./visual-editor.edits.json */
  editsFile?: string;
  /** Default: true unless NODE_ENV === "production". */
  enabled?: boolean;
  /** Return false to reject a request (use this if you ever enable it outside local dev). */
  authorize?: (request: Request) => boolean | Promise<boolean>;
  basePath?: string;
};

type StoredEdit = {
  selector: string;
  instruction?: string;
  patch: UiPatch;
  updatedAt: string;
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function resolveProvider(option?: Provider): Provider {
  if (option) return option;
  const type =
    process.env.VISUAL_EDITOR_PROVIDER ??
    (process.env.ANTHROPIC_API_KEY
      ? "anthropic"
      : process.env.OPENAI_API_KEY
        ? "openai"
        : "ollama");
  const model = process.env.VISUAL_EDITOR_MODEL;
  if (type === "anthropic") return { type, model };
  if (type === "openai")
    return { type, model, baseUrl: process.env.OPENAI_BASE_URL };
  return { type: "ollama", model, baseUrl: process.env.OLLAMA_BASE_URL };
}

async function callModel(provider: Provider, user: string): Promise<string> {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: user },
  ];

  if (provider.type === "ollama") {
    const res = await fetch(
      `${provider.baseUrl ?? "http://localhost:11434"}/api/chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: provider.model ?? "gemma4:e2b",
          stream: false,
          format: "json",
          options: { temperature: 0.2 },
          messages,
        }),
      },
    ).catch(() => null);
    if (!res?.ok) throw new Error("Ollama is unreachable. Run: ollama serve");
    return (
      ((await res.json()) as { message?: { content?: string } }).message
        ?.content ?? ""
    );
  }

  if (provider.type === "openai") {
    const apiKey = provider.apiKey ?? process.env.OPENAI_API_KEY;
    const res = await fetch(
      `${provider.baseUrl ?? "https://api.openai.com/v1"}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: provider.model ?? "gpt-4o-mini",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages,
        }),
      },
    );
    if (!res.ok)
      throw new Error(
        `Model request failed (${res.status}). Check OPENAI_API_KEY and model name.`,
      );
    return (
      ((await res.json()) as { choices?: { message?: { content?: string } }[] })
        .choices?.[0]?.message?.content ?? ""
    );
  }

  const apiKey = provider.apiKey ?? process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Set ANTHROPIC_API_KEY on the server.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: provider.model ?? "claude-sonnet-5-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok)
    throw new Error(
      `Model request failed (${res.status}). Check ANTHROPIC_API_KEY and model name.`,
    );
  return (
    (
      (await res.json()) as { content?: { type: string; text?: string }[] }
    ).content?.find((b) => b.type === "text")?.text ?? ""
  );
}

/* Saved edits: a small JSON file you commit or import into your app. Writes are serialized. */
let queue: Promise<unknown> = Promise.resolve();
const locked = <T>(job: () => Promise<T>) =>
  (queue = queue.then(job, job)) as Promise<T>;

async function readEdits(file: string): Promise<StoredEdit[]> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as StoredEdit[];
  } catch {
    return [];
  }
}

function merge(list: StoredEdit[], edit: StoredEdit): StoredEdit[] {
  const previous = list.find((e) => e.selector === edit.selector);
  if (!previous) return [...list, edit];
  const patch: UiPatch = {
    css: { ...previous.patch.css, ...edit.patch.css },
    content: edit.patch.content ?? previous.patch.content,
  };
  return list.map((e) =>
    e.selector === edit.selector ? { ...edit, patch } : e,
  );
}

/** Web-standard request handler. Returns null when the URL isn't ours. Works in Next.js route handlers, Hono, Bun, Deno… */
export async function handleEditorRequest(
  request: Request,
  options: EditorServerOptions = {},
): Promise<Response | null> {
  const base = options.basePath ?? "/api/visual-editor";
  const url = new URL(request.url);
  if (url.pathname !== base && !url.pathname.startsWith(`${base}/`))
    return null;

  const enabled = options.enabled ?? process.env.NODE_ENV !== "production";
  if (!enabled)
    return json(403, {
      message: "Visual editor is disabled outside development.",
    });
  if (options.authorize && !(await options.authorize(request)))
    return json(401, { message: "Not authorized." });

  const route = url.pathname.slice(base.length) || "/";
  const file = path.resolve(
    process.cwd(),
    options.editsFile ?? "visual-editor.edits.json",
  );

  let body: any = {};
  if (request.method === "POST") {
    const text = await request.text();
    if (text.length > 200_000)
      return json(413, { message: "Request too large." });
    try {
      body = JSON.parse(text || "{}");
    } catch {
      return json(400, { message: "Invalid JSON body." });
    }
  }

  if (route === "/ai" && request.method === "POST") {
    if (
      typeof body.instruction !== "string" ||
      typeof body.selection?.selector !== "string"
    )
      return json(400, { message: "Missing instruction or selection." });
    try {
      return json(200, {
        message: await callModel(
          resolveProvider(options.provider),
          JSON.stringify(body),
        ),
      });
    } catch (error) {
      return json(502, {
        message: error instanceof Error ? error.message : "AI request failed.",
      });
    }
  }

  if (route === "/edits" && request.method === "GET")
    return json(200, await readEdits(file));

  if (route === "/edits" && request.method === "POST") {
    const patch = sanitizePatch(body.patch);
    if (
      typeof body.selector !== "string" ||
      body.selector.length > 500 ||
      !patch
    )
      return json(400, { message: "Invalid edit." });
    const edit: StoredEdit = {
      selector: body.selector,
      instruction:
        typeof body.instruction === "string"
          ? body.instruction.slice(0, 500)
          : undefined,
      patch,
      updatedAt: new Date().toISOString(),
    };
    await locked(async () =>
      fs.writeFile(
        file,
        JSON.stringify(merge(await readEdits(file), edit), null, 2),
      ),
    );
    return json(200, { ok: true });
  }

  if (route === "/edits" && request.method === "DELETE") {
    const selector = url.searchParams.get("selector");
    await locked(async () =>
      fs.writeFile(
        file,
        JSON.stringify(
          selector
            ? (await readEdits(file)).filter((e) => e.selector !== selector)
            : [],
          null,
          2,
        ),
      ),
    );
    return json(200, { ok: true });
  }

  return json(404, { message: "Not found." });
}
