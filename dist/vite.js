import {
  toNodeMiddleware
} from "./chunk-HIXC4RQ3.js";

// src/vite.ts
function visualEditor(options = {}) {
  const base = options.basePath ?? "/api/visual-editor";
  return {
    name: "visual-ai-editor",
    apply: "serve",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use(base, toNodeMiddleware(options));
    }
  };
}
var vite_default = visualEditor;
export {
  vite_default as default,
  visualEditor
};
