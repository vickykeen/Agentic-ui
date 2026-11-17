import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VisualEditor, SavedEdits, applySavedEdits } from "visual-ai-editor";
import { handleEditorRequest, toNodeMiddleware } from "visual-ai-editor/server";
import visualEditor from "visual-ai-editor/vite";

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return `http://127.0.0.1:${server.address().port}`;
}

async function close(server) {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}

test("built public entry points are importable", () => {
  for (const entry of [
    VisualEditor,
    SavedEdits,
    applySavedEdits,
    handleEditorRequest,
    toNodeMiddleware,
    visualEditor,
  ]) {
    assert.equal(typeof entry, "function");
  }
  assert.equal(visualEditor().apply, "serve");
});

test("HTTP endpoints call a provider, persist, merge, and delete edits", async () => {
  const directory = await mkdtemp(join(tmpdir(), "visual-editor-test-"));
  const file = join(directory, "edits.json");
  let modelRequest;
  const model = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    modelRequest = { path: req.url, body: JSON.parse(body) };
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({ css: { color: "blue" } }),
            },
          },
        ],
      }),
    );
  });
  let server;
  try {
    const modelUrl = await listen(model);
    server = createServer(
      toNodeMiddleware({
        enabled: true,
        editsFile: file,
        provider: {
          type: "openai",
          baseUrl: modelUrl,
          model: "test-model",
          apiKey: "test-only",
        },
      }),
    );
    const base = `${await listen(server)}/api/visual-editor`;
    const post = (route, body) =>
      fetch(`${base}/${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    assert.deepEqual(await (await fetch(`${base}/edits`)).json(), []);
    const ai = await post("ai", {
      instruction: "Make it blue",
      selection: { selector: "#title" },
    });
    assert.equal(ai.status, 200);
    const patch = JSON.parse((await ai.json()).message);
    assert.equal(patch.css.color, "blue");
    assert.equal(modelRequest.path, "/chat/completions");
    assert.equal(modelRequest.body.model, "test-model");
    assert.equal(
      (await post("edits", { selector: "#title", patch })).status,
      200,
    );
    assert.equal(
      (
        await post("edits", {
          selector: "#title",
          patch: { css: { "font-size": "48px" } },
        })
      ).status,
      200,
    );
    const saved = await (await fetch(`${base}/edits`)).json();
    assert.equal(saved.length, 1);
    assert.deepEqual(saved[0].patch.css, {
      color: "blue",
      "font-size": "48px",
    });
    assert.deepEqual(JSON.parse(await readFile(file, "utf8")), saved);
    assert.equal((await post("ai", {})).status, 400);
    assert.equal(
      (await fetch(`${base}/edits?selector=%23title`, { method: "DELETE" }))
        .status,
      200,
    );
    assert.deepEqual(await (await fetch(`${base}/edits`)).json(), []);
  } finally {
    if (server?.listening) await close(server);
    if (model.listening) await close(model);
    await rm(directory, { recursive: true, force: true });
  }
});

test("disabled and unauthorized endpoints reject requests", async () => {
  const request = new Request("http://localhost/api/visual-editor/edits");
  assert.equal(
    (await handleEditorRequest(request, { enabled: false })).status,
    403,
  );
  assert.equal(
    (
      await handleEditorRequest(request, {
        enabled: true,
        authorize: () => false,
      })
    ).status,
    401,
  );
});
