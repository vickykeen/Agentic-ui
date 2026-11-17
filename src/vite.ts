import type { Plugin } from "vite";
import { toNodeMiddleware } from "./adapter";
import type { EditorServerOptions } from "./core";

/** Dev-only Vite plugin: mounts the AI + save endpoints on your dev server. */
export function visualEditor(options: EditorServerOptions = {}): Plugin {
  const base = options.basePath ?? "/api/visual-editor";
  return {
    name: "visual-ai-editor",
    apply: "serve",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use(base, toNodeMiddleware(options));
    },
  };
}

export default visualEditor;
