# Visual AI Editor docs

This package helps you add a lightweight visual editing surface to a React app. Users can select an element on the page, describe the change they want in plain language, and let the app apply a safe CSS or text update.

The package is intentionally narrow: it focuses on focused visual edits and text changes, not a broad page builder or code-generation workflow.

## What the package does

- Lets a user click an element in a live page
- Sends a short instruction to an AI provider
- Validates the response before applying it
- Stores safe edits locally for reuse across refreshes
- Supports undo, delete, and reset flows

## High-level architecture

The project is organized around a few public entry points:

- `VisualEditor`: React component used in the app to open the editing UI
- `SavedEdits`: applies persisted edits from JSON
- `handleEditorRequest` / `toNodeMiddleware`: server-side endpoints for AI calls and edit persistence
- `visualEditor()` Vite plugin: development-time integration for Vite apps

At runtime, the flow is:

1. The user selects an element in the browser.
2. The editor opens an annotation popup near the selected node.
3. The request is sent to the configured provider.
4. Model output is validated to allow only small safe patches.
5. The relevant CSS or text is applied to the DOM.
6. The edit is saved in a JSON file or in-memory state.

## Public API overview

### React integration

```tsx
import { VisualEditor } from "visual-ai-editor";

export function App() {
  return (
    <VisualEditor>
      <MyPage />
    </VisualEditor>
  );
}
```

Use this only in development unless you explicitly enable the editor for a controlled environment.

### Saved edits

```tsx
import edits from "../visual-editor.edits.json";
import { SavedEdits } from "visual-ai-editor";

export function App() {
  return (
    <>
      <MyPage />
      <SavedEdits edits={edits} />
    </>
  );
}
```

This replays previously saved patches after the app loads.

### Server route

```ts
import { handleEditorRequest } from "visual-ai-editor/server";

export async function GET(req: Request) {
  return (await handleEditorRequest(req)) ?? new Response("Not found", { status: 404 });
}

export async function POST(req: Request) {
  return (await handleEditorRequest(req)) ?? new Response("Not found", { status: 404 });
}
```

These endpoints handle AI generation, saved edit lists, and edit deletion while keeping the API key on the server.

## Provider configuration

The package supports a few provider types through the server config:

- Anthropic
- OpenAI-compatible providers
- Ollama

Example:

```ts
const config = {
  enabled: true,
  editsFile: "./visual-editor.edits.json",
  provider: {
    type: "openai",
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY!,
    baseUrl: process.env.OPENAI_BASE_URL,
  },
};
```

The recommended pattern is to keep credentials on the server and never expose them in browser code.

## Safety model

The package validates model output before it is applied. It accepts only narrow, safe mutations such as:

- CSS property updates
- Plain text replacements
- Selector-based patch application

It rejects high-risk content such as:

- embedded script or HTML
- `url()` values or imported CSS assets
- arbitrary DOM structure changes
- unsafe text injection patterns

This is important because the editor is intentionally acting on live UI state.

## Development and testing

The repo includes a local demo and automated checks:

```bash
npm install
npm run dev
npm test
```

The tests validate the public entry points, save/merge/delete behavior, disabled endpoint handling, and request validation.

## Design intent

The design philosophy is documented in [../DESIGN_GUIDE.md](../DESIGN_GUIDE.md). It describes the interaction model, visual language, accessibility expectations, and product boundaries.

The core idea is that the editor should stay minimal and calm: it should improve the page in context without becoming a second application or a heavy visual-builder interface.

## When to use this package

This package is best for:

- internal product demos
- design QA workflows
- dev-only visual experimentation
- small, controlled UI tweaks driven by AI

This package is not intended to be a general-purpose page builder, CMS editor, or production content authoring system.

## Operational guidance

- Keep `<VisualEditor>` in development only unless you have a strong reason to enable it in production.
- Persist saved edits in source control when you want the changes to apply consistently across environments.
- Prefer stable selectors like IDs on key elements when page structure can change.
- Treat browser-side edits as a convenience layer, not the final source of truth for production styling.
