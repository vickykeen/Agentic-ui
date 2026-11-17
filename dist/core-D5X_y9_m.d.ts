type Provider = {
    type: "ollama";
    model?: string;
    baseUrl?: string;
} | {
    type: "openai";
    model?: string;
    baseUrl?: string;
    apiKey?: string;
} | {
    type: "anthropic";
    model?: string;
    apiKey?: string;
};
type EditorServerOptions = {
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
/** Web-standard request handler. Returns null when the URL isn't ours. Works in Next.js route handlers, Hono, Bun, Deno… */
declare function handleEditorRequest(request: Request, options?: EditorServerOptions): Promise<Response | null>;

export { type EditorServerOptions as E, type Provider as P, handleEditorRequest as h };
