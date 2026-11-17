# visual-ai-editor

Click any element on your site, describe the change, and AI edits the UI and content live. Edits are saved to your project so they survive a refresh.



## Install

```bash
npm install visual-ai-editor
```

## Test this package locally before publishing

From this repository, run:

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5173. This builds the package and starts a React playground that imports its public package exports. Restart `npm run dev` after changing package source code to rebuild it.

Configure a provider before using the playground. For example, copy
`demo/.env.example` to `demo/.env.local`, add your credentials, and restart
`npm run dev`. The playground sends every request to that server-side model:

1. Click the wand in the bottom-right corner, then click the headline.
2. Enter the CSS or text change you want and click **Apply with AI**.
3. Refresh the page and confirm the styling remains.
4. Try `change text to "Hello"` on a heading, or `make it rounded` on a button.
5. Test **Undo** immediately after an edit. Use **Reset saved edits** in the header to clear the demo and reload.

Demo edits are stored in `demo/visual-editor.edits.json`, which is ignored by Git. Keep credentials server-side; do not prefix them with `VITE_`. Requests send selected page content to your provider and may incur usage charges.

Run the automated checks and inspect the publish contents:

```bash
npm test
npm pack --dry-run
```

The checks cover TypeScript, the build, public exports, provider request handling using a local fake provider, saved-edit persistence, merging, deletion, and access guards. They do not call a paid AI service. Test Live AI manually with your chosen provider as well.

To produce the actual archive for installation in another app, run `npm pack`. The `prepack` script builds it automatically. Only `dist/`, the README, and npm's required package metadata are included; the playground and credentials are excluded. These commands do not publish the package.

## Vite (React)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import visualEditor from "visual-ai-editor/vite";

export default defineConfig({ plugins: [react(), visualEditor()] });
```

```tsx
// main.tsx
import { VisualEditor } from "visual-ai-editor";

createRoot(document.getElementById("root")!).render(
  <VisualEditor>
    <App />
  </VisualEditor>,
);
```

Run your dev server and click the wand button in the bottom-right corner.

## Choose an AI provider

The API key stays on your server. It is never sent to the browser.

| Provider                                           | Setup                                                          |
| -------------------------------------------------- | -------------------------------------------------------------- |
| Anthropic                                          | `ANTHROPIC_API_KEY=...`                                        |
| OpenAI or compatible (OpenRouter, Groq, LM Studio) | `OPENAI_API_KEY=...` and optionally `OPENAI_BASE_URL=...`      |
| Ollama (local, free)                               | `ollama serve`, then optionally `VISUAL_EDITOR_MODEL=llama3.1` |

Force one with `VISUAL_EDITOR_PROVIDER=anthropic|openai|ollama`, or pass it in code:

```ts
visualEditor({ provider: { type: "anthropic", model: "claude-sonnet-5-5" } });
```

## Next.js (App Router)

```ts
// app/api/visual-editor/[...path]/route.ts
import { handleEditorRequest } from "visual-ai-editor/server";

const run = async (req: Request) =>
  (await handleEditorRequest(req)) ??
  new Response("Not found", { status: 404 });
export { run as GET, run as POST, run as DELETE };
```

Then wrap your layout children in `<VisualEditor>` (render it only in development).

## Express or any Node server

```ts
import { toNodeMiddleware } from "visual-ai-editor/server";
app.use("/api/visual-editor", toNodeMiddleware());
```

## Saved patches and production

Applied edits are written to `visual-editor.edits.json` in your project root. Commit it, then apply it for all visitors:

```tsx
import edits from "../visual-editor.edits.json";
import { SavedEdits } from "visual-ai-editor";

<SavedEdits edits={edits} />;
```

Keep `<VisualEditor>` out of your production build, for example `{import.meta.env.DEV && <VisualEditor>...}`. The server endpoints are disabled when `NODE_ENV=production`.

## Security

- Endpoints only run in development unless you set `enabled: true`. If you do, also pass an `authorize(request)` check.
- Model output is validated on the client and the server. Only CSS properties and plain text are allowed. `url()`, scripts and HTML are rejected.
- Text changes are set as plain text, never as HTML.

## Limitations

- Edits are stored as selector-based patches. If your DOM structure changes, a selector may stop matching. Adding `id` attributes to key elements makes edits more durable.
- React re-renders can overwrite a patched element. Persist the resulting styling in your application source when needed.
