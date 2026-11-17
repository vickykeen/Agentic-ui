export type UiPatch = {
  css: Record<string, string>;
  content?: string;
};

const UNSAFE_VALUE = /url\(|expression\(|javascript:|@import/i;

/** Validates untrusted patch data (from the model, the network, or a JSON file). Used on client AND server. */
export function sanitizePatch(raw: unknown): UiPatch | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as { css?: unknown; content?: unknown };
  const css: Record<string, string> = {};
  if (input.css && typeof input.css === "object") {
    for (const [property, value] of Object.entries(
      input.css as Record<string, unknown>,
    )) {
      if (
        /^-{0,2}[a-z][a-z-]*$/.test(property) &&
        typeof value === "string" &&
        value.length < 300 &&
        !UNSAFE_VALUE.test(value)
      )
        css[property] = value;
    }
  }
  const content =
    typeof input.content === "string" && input.content.length < 5000
      ? input.content
      : undefined;
  return Object.keys(css).length || content !== undefined
    ? { css, content }
    : null;
}
