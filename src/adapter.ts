import type { IncomingMessage, ServerResponse } from "node:http";
import { handleEditorRequest, type EditorServerOptions } from "./core";

/** Wraps the web-standard handler for Express / Connect / Vite / plain Node servers. */
export function toNodeMiddleware(options: EditorServerOptions = {}) {
  return async (
    req: IncomingMessage & { originalUrl?: string },
    res: ServerResponse,
    next?: () => void,
  ) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const request = new Request(
      `http://${req.headers.host ?? "localhost"}${req.originalUrl ?? req.url}`,
      {
        method: req.method,
        headers: req.headers as Record<string, string>,
        body: hasBody && chunks.length ? Buffer.concat(chunks) : undefined,
      },
    );
    const response = await handleEditorRequest(request, options);
    if (!response)
      return next ? next() : void ((res.statusCode = 404), res.end());
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(await response.text());
  };
}
