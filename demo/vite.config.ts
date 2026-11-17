import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import visualEditor from "visual-ai-editor/vite";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  // Provider credentials are read by the server, never exposed with a VITE_ prefix.
  const env = loadEnv(mode, root, "");
  for (const key of [
    "OPENAI_API_KEY",
    "OPENAI_BASE_URL",
    "ANTHROPIC_API_KEY",
    "OLLAMA_BASE_URL",
    "VISUAL_EDITOR_PROVIDER",
    "VISUAL_EDITOR_MODEL",
  ]) {
    if (process.env[key] === undefined && env[key]) process.env[key] = env[key];
  }
  return {
    root,
    esbuild: { jsx: "automatic" },
    plugins: [
      visualEditor({
        editsFile: fileURLToPath(
          new URL("visual-editor.edits.json", import.meta.url),
        ),
      }),
    ],
    server: { host: "127.0.0.1", port: 5173, strictPort: true },
  };
});
