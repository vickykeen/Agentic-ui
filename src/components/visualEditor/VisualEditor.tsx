import { ControlRail } from "../controlRail/ControlRail";
import { sanitizePatch, type UiPatch } from "../../shared";
import { AnnotationPopup } from "../annotationPopup/AnnotationPopup";
import { AnnotationMarker } from "../annotationMarker/AnnotationMarker";
import css from "./styles.inline";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ───────────────────────── Types ───────────────────────── */

export type ElementAnnotation = {
  selector: string;
  tagName: string;
  text: string;
  /** Exact text highlighted by the user before annotating, when present. */
  selectedText?: string;
  componentHint: string;
  /** Explicit test/component hooks make annotations easier for an agent to locate. */
  attributes?: Record<string, string>;
  classNames?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  /** Truncated outerHTML so the model can see real structure and classes. */
  html: string;
  /** A few computed styles so the model knows the current look. */
  styles: Record<string, string>;
};

export type AiRequest = {
  instruction: string;
  selection: ElementAnnotation;
};

export type { UiPatch };

export type SavedEdit = {
  selector: string;
  instruction?: string;
  patch: UiPatch;
};

const DEFAULT_BASE = "/api/visual-editor";

export type VisualEditorProps = {
  children: ReactNode;
  /** Base URL of the editor server routes (added by the Vite plugin or your route handler). */
  endpoint?: string;
  /** Save applied edits to the project via the server. Default: true. */
  persist?: boolean;
  /** Override the built-in server call, e.g. to use your own backend. */
  onAskAi?: (request: AiRequest) => Promise<string>;
  /** Called after an AI patch has been applied to the live page (use it to persist changes). */
  onApplied?: (note: {
    selection: ElementAnnotation;
    instruction: string;
    patch: UiPatch;
  }) => void;
};

type NoteStatus = "draft" | "noted" | "pending" | "applied" | "failed";

type Note = {
  id: number;
  element: HTMLElement;
  offset: { x: number; y: number }; // click position as a ratio of the element box
  position: { x: number; y: number };
  selection: ElementAnnotation;
  instruction: string;
  status: NoteStatus;
  patch?: UiPatch;
  message?: string;
  undo?: () => void;
};

/* ───────────────────────── Component ───────────────────────── */

/** Click-to-annotate overlay: pin notes on elements, then let AI edit the live UI. */
export function VisualEditor({
  children,
  onAskAi: customAskAi,
  onApplied,
  endpoint = DEFAULT_BASE,
  persist = true,
}: VisualEditorProps) {
  const onAskAi =
    customAskAi ?? ((request: AiRequest) => askEndpoint(endpoint, request));
  const [enabled, setEnabled] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<number>();
  const [closing, setClosing] = useState(false);
  const [hovered, setHovered] = useState<HTMLElement>();
  const [, redraw] = useReducer((n: number) => n + 1, 0);
  const nextId = useRef(1);
  const closeTimer = useRef<number>();
  const hydratedEndpoint = useRef<string>();
  const notesRef = useRef(notes);
  notesRef.current = notes;

  const patchNote = useCallback((id: number, changes: Partial<Note>) => {
    setNotes((list) =>
      list.map((n) => (n.id === id ? { ...n, ...changes } : n)),
    );
  }, []);

  /* Inspect mode: hover highlight + click to pin a note */
  useEffect(() => {
    if (!enabled || closing) {
      setHovered(undefined);
      return;
    }
    const inEditor = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("[data-visual-editor]");

    const onClick = (event: MouseEvent) => {
      if (inEditor(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      const element =
        event.target instanceof HTMLElement
          ? event.target
          : event.target instanceof Node
            ? event.target.parentElement
            : null;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const id = nextId.current++;
      const note: Note = {
        id,
        element,
        status: "draft",
        instruction: "",
        offset: {
          x: rect.width ? (event.clientX - rect.left) / rect.width : 0.5,
          y: rect.height ? (event.clientY - rect.top) / rect.height : 0.5,
        },
        position: { x: event.clientX, y: event.clientY },
        selection: describeElement(element, getSelectedTextFor(element)),
      };
      setNotes((list) => [...list.filter((n) => n.status !== "draft"), note]);
      setActiveId(id);
    };
    const onMove = (event: MouseEvent) => {
      setHovered(
        inEditor(event.target) ? undefined : (event.target as HTMLElement),
      );
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closePopup();
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, closing]);

  useEffect(
    () => () => window.clearTimeout(closeTimer.current),
    [],
  );

  /* Keep markers glued to their elements */
  useEffect(() => {
    window.addEventListener("scroll", redraw, true);
    window.addEventListener("resize", redraw);
    return () => {
      window.removeEventListener("scroll", redraw, true);
      window.removeEventListener("resize", redraw);
    };
  }, []);

  /* Restore persisted edits as applied annotations, including their markers. */
  useEffect(() => {
    if (!persist) return;
    if (hydratedEndpoint.current === endpoint) return;
    hydratedEndpoint.current = endpoint;
    fetch(`${endpoint}/edits`)
      .then((r) => (r.ok ? r.json() : []))
      .then((list: SavedEdit[]) => {
        if (!Array.isArray(list)) return;
        const restored: Note[] = [];
        for (const edit of list) {
          const patch = sanitizePatch(edit.patch);
          if (!patch) continue;
          let element: HTMLElement | null = null;
          try {
            element = document.querySelector<HTMLElement>(edit.selector);
          } catch {
            continue;
          }
          if (!element) continue;
          const rect = element.getBoundingClientRect();
          restored.push({
            id: nextId.current++,
            element,
            offset: { x: 0.5, y: 0.5 },
            position: {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            },
            selection: describeElement(element),
            instruction: edit.instruction ?? "",
            status: "applied",
            patch,
            undo: applyPatch(element, patch),
          });
        }
        setNotes(restored);
        redraw();
      })
      .catch(() => {});
  }, [endpoint, persist]);

  function closePopup() {
    if (closing) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setActiveId(undefined);
      setNotes((list) => list.filter((n) => n.status !== "draft"));
      setClosing(false);
    }, 220);
  }

  async function runAi(id: number) {
    const note = notesRef.current.find((n) => n.id === id);
    if (!note || !note.instruction.trim() || !onAskAi) return;
    note.undo?.();
    patchNote(id, {
      status: "pending",
      message: undefined,
      undo: undefined,
      patch: undefined,
    });
    try {
      const answer = await onAskAi({
        selection: note.selection,
        instruction: note.instruction,
      });
      const patch = extractUiPatch(answer);
      if (!patch) {
        patchNote(id, {
          status: "failed",
          message: "The model didn't return a usable change. Try rephrasing.",
        });
        return;
      }
      const undo = applyPatch(note.element, patch);
      patchNote(id, { status: "applied", patch, undo, message: undefined });
      onApplied?.({
        selection: note.selection,
        instruction: note.instruction,
        patch,
      });
      if (persist)
        void saveEdit(endpoint, {
          selector: note.selection.selector,
          instruction: note.instruction,
          patch,
        });
      redraw();
    } catch (error) {
      patchNote(id, {
        status: "failed",
        message: error instanceof Error ? error.message : "AI request failed.",
      });
    }
  }

  function undoNote(id: number) {
    const note = notesRef.current.find((n) => n.id === id);
    note?.undo?.();
    if (persist && note) void deleteEdit(endpoint, note.selection.selector);
    patchNote(id, { status: "noted", undo: undefined, patch: undefined });
    redraw();
  }

  function removeNote(id: number) {
    const note = notesRef.current.find((n) => n.id === id);
    note?.undo?.();
    if (persist && note?.status === "applied")
      void deleteEdit(endpoint, note.selection.selector);
    setNotes((list) => list.filter((n) => n.id !== id));
    setActiveId(undefined);
    redraw();
  }

  async function applyAll() {
    for (const n of notesRef.current) {
      if (
        (n.status === "noted" || n.status === "failed") &&
        n.instruction.trim()
      )
        await runAi(n.id);
    }
  }

  function resetAll() {
    notesRef.current.forEach((n) => n.undo?.());
    if (persist && notesRef.current.some((n) => n.status === "applied"))
      void deleteEdit(endpoint);
    setNotes([]);
    setActiveId(undefined);
  }

  const active = notes.find((n) => n.id === activeId);
  const saved = notes.filter((n) => n.status !== "draft");
  const pendingCount = saved.filter(
    (n) => n.status === "noted" || n.status === "failed",
  ).length;
  const hoverRect =
    enabled && hovered?.isConnected
      ? hovered.getBoundingClientRect()
      : undefined;

  return (
    <>
      <style>{css}</style>
      {children}

      {hoverRect && hovered && (
        <>
          <div
            aria-hidden
            className="ve-highlight"
            style={{
              top: hoverRect.top,
              left: hoverRect.left,
              width: hoverRect.width,
              height: hoverRect.height,
            }}
          />
          <div
            aria-hidden
            className="ve-hover-label"
            style={{
              top: Math.max(4, hoverRect.top - 24),
              left: Math.max(4, hoverRect.left),
            }}
          >
            {hovered.getAttribute("data-component") ||
              hovered.getAttribute("aria-label") ||
              hovered.tagName.toLowerCase()}
          </div>
        </>
      )}

      {enabled &&
        showMarkers &&
        notes.map((note, index) => {
          if (!note.element.isConnected) return null;
          const rect = note.element.getBoundingClientRect();
          const x = rect.left + rect.width * note.offset.x;
          const y = rect.top + rect.height * note.offset.y;
          return (
            <AnnotationMarker
              key={note.id}
              index={index}
              status={note.status}
              x={x}
              y={y}
              onClick={() => setActiveId(note.id)}
            />
          );
        })}

      {(enabled || closing) &&
        active &&
        (() => {
          const busy = active.status === "pending";
          const clickX = active.position.x;
          const clickY = active.position.y;
          const inset = 12;
          const popupWidth = Math.min(
            280,
            Math.max(0, window.innerWidth - inset * 2),
          );
          const left = Math.max(
            inset,
            Math.min(clickX - popupWidth / 2, window.innerWidth - inset - popupWidth),
          );
          const preferredTop = clickY + 16;
          const top = Math.min(
            Math.max(inset, preferredTop),
            Math.max(inset, window.innerHeight - 260),
          );
          const maxHeight = Math.max(0, window.innerHeight - top - inset);
          return (
            <AnnotationPopup
              element={active.selection.componentHint}
              selectedText={active.selection.selectedText}
              computedStyles={active.selection.styles}
              value={active.instruction}
              disabled={busy}
              onChange={(instruction) => patchNote(active.id, { instruction })}
              onCancel={closePopup}
              onSubmit={() => {
                patchNote(active.id, { status: "noted" });
                void runAi(active.id);
              }}
              placeholder="What should change? e.g. “Make this button larger with a purple gradient”"
              surfaceState={closing ? "hidden" : "edit"}
              className="ve-popup-position"
              style={{ left, top, maxHeight }}
              beforeField={<code className="ve-selector">{active.selection.selector}</code>}
              afterField={
                <>
                  {active.patch && (
                    <pre className="ve-patch">
                      {JSON.stringify(active.patch, null, 2)}
                    </pre>
                  )}
                  {active.message && (
                    <p className="ve-error">{active.message}</p>
                  )}
                </>
              }
              footer={
                <div className="ve-actions">
                  {active.status !== "draft" && (
                    <button
                      type="button"
                      onClick={() => removeNote(active.id)}
                      className="ve-button ve-button-secondary"
                    >
                      Delete
                    </button>
                  )}
                  {active.status === "applied" && (
                    <button
                      type="button"
                      onClick={() => undoNote(active.id)}
                      className="ve-button ve-button-secondary"
                    >
                      Undo
                    </button>
                  )}
                  <span style={{ flex: 1 }} />
                  <button
                    type="button"
                    disabled={busy || !active.instruction.trim() || !onAskAi}
                    onClick={() => {
                      patchNote(active.id, { status: "noted" });
                      void runAi(active.id);
                    }}
                    className="ve-button ve-button-primary"
                  >
                    {busy
                      ? "Applying…"
                      : active.status === "applied"
                        ? "Re-apply"
                        : "Apply with AI"}
                  </button>
                </div>
              }
            />
          );
        })()}

      <ControlRail
        expanded={enabled}
        onToggle={() => {
          setEnabled(!enabled);
          closePopup();
        }}
        count={saved.length}
        showMarkers={showMarkers}
        pendingCount={pendingCount}
        onMarkers={() => setShowMarkers((v) => !v)}
        onApply={applyAll}
        onClear={resetAll}
      />
    </>
  );
}

/* ───────────────────────── DOM helpers ───────────────────────── */

const STYLE_PROBES = [
  "color",
  "background-color",
  "font-size",
  "font-weight",
  "font-family",
  "padding",
  "margin",
  "border-radius",
  "display",
];

const IDENTIFYING_ATTRIBUTES = [
  "data-testid",
  "data-test",
  "data-qa",
  "data-cy",
  "data-component",
];

function getSelectedTextFor(element: HTMLElement): string | undefined {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount)
    return undefined;
  const text = selection.toString().trim();
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const selectionElement =
    container.nodeType === Node.ELEMENT_NODE
      ? (container as Element)
      : container.parentElement;
  return text &&
    selectionElement &&
    (element.contains(selectionElement) || selectionElement.contains(element))
    ? text.slice(0, 500)
    : undefined;
}

function describeElement(
  element: HTMLElement,
  selectedText?: string,
): ElementAnnotation {
  const computed = getComputedStyle(element);
  const styles: Record<string, string> = {};
  for (const property of STYLE_PROBES)
    styles[property] = computed.getPropertyValue(property);
  const rect = element.getBoundingClientRect();
  const attributes = Object.fromEntries(
    IDENTIFYING_ATTRIBUTES.flatMap((name) => {
      const value = element.getAttribute(name);
      return value && value.length <= 500 ? [[name, value]] : [];
    }),
  );
  return {
    selector: getSelector(element),
    tagName: element.tagName.toLowerCase(),
    text: (element.innerText || element.textContent || "").trim().slice(0, 240),
    selectedText,
    componentHint:
      element.getAttribute("data-component") ||
      element.getAttribute("aria-label") ||
      element.tagName.toLowerCase(),
    attributes,
    classNames: element.className,
    boundingBox: {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
    html: element.outerHTML.slice(0, 600),
    styles,
  };
}

/** Builds a selector that matches exactly this element and survives class-name changes. */
function getSelector(element: HTMLElement) {
  if (element.id) return `#${CSS.escape(element.id)}`;
  for (const attribute of IDENTIFYING_ATTRIBUTES) {
    const value = element.getAttribute(attribute);
    if (!value) continue;
    const candidate = `[${attribute}="${CSS.escape(value)}"]`;
    try {
      if (document.querySelectorAll(candidate).length === 1) return candidate;
    } catch {
      /* try the next hook */
    }
  }
  const parts: string[] = [];
  let current: HTMLElement | null = element;
  while (
    current &&
    current !== document.body &&
    current !== document.documentElement
  ) {
    if (current.id) {
      parts.unshift(`#${CSS.escape(current.id)}`);
      break;
    }
    const node: HTMLElement = current;
    const tag = node.tagName.toLowerCase();
    const same = node.parentElement
      ? [...node.parentElement.children].filter(
          (c) => c.tagName === node.tagName,
        )
      : [];
    parts.unshift(
      same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(node) + 1})` : tag,
    );
    const candidate = parts.join(" > ");
    try {
      if (document.querySelectorAll(candidate).length === 1) return candidate;
    } catch {
      /* keep climbing */
    }
    current = node.parentElement;
  }
  return parts.join(" > ");
}

/** Pulls a safe patch from JSON, fenced JSON, or a plain CSS declaration. */
function extractUiPatch(answer: string): UiPatch | null {
  for (const raw of jsonObjects(answer)) {
    const patch = sanitizePatch(normalizePatch(raw));
    if (patch) return patch;
  }
  return sanitizePatch({ css: parseCssDeclarations(answer) });
}

function normalizePatch(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const response = raw as Record<string, unknown>;
  const candidate = response.css ?? response.styles;
  const css =
    typeof candidate === "string"
      ? parseCssDeclarations(candidate)
      : candidate && typeof candidate === "object"
        ? candidate
        : Object.fromEntries(
            Object.entries(response).filter(([property, value]) =>
              /^-{0,2}[a-z][a-z-]*$/.test(property) &&
              typeof value === "string",
            ),
          );
  return {
    css,
    content:
      typeof response.content === "string"
        ? response.content
        : typeof response.text === "string"
          ? response.text
          : undefined,
  };
}

function parseCssDeclarations(value: string): Record<string, string> {
  const css: Record<string, string> = {};
  const declarations = /(?:^|[;\n])\s*([a-z-]+)\s*:\s*([^;\n{}]+)\s*;?/gi;
  for (const match of value.matchAll(declarations))
    css[match[1].toLowerCase()] = match[2].trim();
  return css;
}

function jsonObjects(value: string): unknown[] {
  const objects: unknown[] = [];
  let start = -1;
  let depth = 0;
  let quote = false;
  let escaped = false;

  for (let index = 0; index < value.length; index++) {
    const character = value[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quote = false;
      continue;
    }
    if (character === '"') quote = true;
    else if (character === "{") {
      if (!depth) start = index;
      depth++;
    } else if (character === "}" && depth && --depth === 0) {
      try {
        objects.push(JSON.parse(value.slice(start, index + 1)));
      } catch {
        // Try the next complete object in the response.
      }
    }
  }
  return objects;
}

/** Applies the patch and returns a function that restores the original state. */
function applyPatch(element: HTMLElement, patch: UiPatch): () => void {
  const prevStyle = element.getAttribute("style");
  let restoreText: (() => void) | undefined;

  for (const [property, value] of Object.entries(patch.css))
    element.style.setProperty(property, value);

  if (patch.content !== undefined) {
    // Replace only the visible text so child elements (icons, links) survive.
    const textNode = [...element.childNodes].find(
      (n) => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim(),
    );
    if (textNode) {
      const previous = textNode.nodeValue;
      textNode.nodeValue = patch.content;
      restoreText = () => {
        textNode.nodeValue = previous;
      };
    } else if (!element.children.length) {
      const previous = element.textContent;
      element.textContent = patch.content;
      restoreText = () => {
        element.textContent = previous;
      };
    }
  }

  return () => {
    prevStyle === null
      ? element.removeAttribute("style")
      : element.setAttribute("style", prevStyle);
    restoreText?.();
  };
}

/* ───────────────────────── Server + saved edits ───────────────────────── */

async function askEndpoint(base: string, request: AiRequest) {
  const response = await fetch(`${base}/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
  };
  if (!response.ok)
    throw new Error(
      data.message ?? "AI request failed. Is the editor server running?",
    );
  return data.message ?? "";
}

async function saveEdit(base: string, edit: SavedEdit) {
  try {
    await fetch(`${base}/edits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit),
    });
  } catch {
    /* offline: edit stays in the page only */
  }
}

async function deleteEdit(base: string, selector?: string) {
  try {
    await fetch(
      `${base}/edits${selector ? `?selector=${encodeURIComponent(selector)}` : ""}`,
      { method: "DELETE" },
    );
  } catch {
    /* ignore */
  }
}

/** Applies saved edits to the current page. Returns how many elements were updated. */
export function applySavedEdits(edits: SavedEdit[]): number {
  let count = 0;
  for (const edit of edits) {
    const patch = sanitizePatch(edit.patch);
    if (!patch) continue;
    let element: HTMLElement | null = null;
    try {
      element = document.querySelector<HTMLElement>(edit.selector);
    } catch {
      continue;
    }
    if (element) {
      applyPatch(element, patch);
      count++;
    }
  }
  return count;
}

/** Drop into your production app: <SavedEdits edits={editsJson} /> */
export function SavedEdits({ edits }: { edits: SavedEdit[] }) {
  useEffect(() => {
    applySavedEdits(edits);
  }, [edits]);
  return null;
}
