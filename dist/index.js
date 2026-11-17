"use client";

// component-css:/Users/triveintmac4/Documents/github/agent-ui/src/components/controlRail/styles.inline
var styles_default = '.ve-rail {\n  position: fixed;\n  right: 20px;\n  bottom: 20px;\n  z-index: 2147483647;\n  font-family: system-ui, sans-serif;\n}\n\n.ve-rail * {\n  box-sizing: border-box;\n}\n\n.ve-rail-surface {\n  position: relative;\n  width: 44px;\n  height: 44px;\n  border-radius: 22px;\n  background: #1a1a1a;\n  color: #fff;\n  transition: width 240ms cubic-bezier(0.34, 1.18, 0.64, 1);\n  animation: ve-rail-enter 360ms cubic-bezier(0.34, 1.18, 0.64, 1);\n}\n\n.ve-rail[data-expanded="true"] .ve-rail-surface {\n  width: 174px;\n}\n\n.ve-rail-controls {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  height: 44px;\n  padding: 5px;\n  opacity: 0;\n  visibility: hidden;\n  transform: translateX(12px) scale(0.94);\n  transform-origin: right center;\n  transition:\n    opacity 150ms ease,\n    transform 320ms cubic-bezier(0.34, 1.18, 0.64, 1),\n    visibility 150ms;\n}\n\n.ve-rail[data-expanded="true"] .ve-rail-controls {\n  opacity: 1;\n  visibility: visible;\n  transform: none;\n  transition-delay: 60ms;\n}\n\n.ve-rail-button {\n  position: relative;\n  flex: 0 0 34px;\n}\n\n.ve-rail button {\n  display: grid;\n  place-items: center;\n  width: 34px;\n  height: 34px;\n  margin: 0;\n  padding: 0;\n  border: 0;\n  border-radius: 50%;\n  background: transparent;\n  color: rgb(255 255 255 / 85%);\n  cursor: pointer;\n  transition:\n    background-color 150ms,\n    transform 100ms,\n    color 150ms;\n}\n\n.ve-rail button:hover:not(:disabled) {\n  background: rgb(255 255 255 / 12%);\n  color: #fff;\n}\n\n.ve-rail button:active:not(:disabled) {\n  transform: scale(0.92);\n}\n\n.ve-rail button:focus-visible {\n  outline: 2px solid #3c82f7;\n  outline-offset: 2px;\n}\n\n.ve-rail button:disabled {\n  opacity: 0.3;\n  cursor: default;\n}\n\n.ve-rail button[aria-pressed="true"] {\n  color: #90baff;\n  background: rgb(60 130 247 / 15%);\n}\n\n.ve-rail .ve-rail-toggle {\n  position: absolute;\n  top: 5px;\n  right: 5px;\n}\n\n.ve-rail-divider {\n  flex: 0 0 1px;\n  height: 20px;\n  background: rgb(255 255 255 / 20%);\n}\n\n.ve-rail-placeholder {\n  flex: 0 0 34px;\n}\n\n.ve-rail-glyph path {\n  transform-box: fill-box;\n  transform-origin: center;\n  transition:\n    transform 300ms cubic-bezier(0.22, 1, 0.36, 1),\n    opacity 160ms;\n}\n\n.ve-rail[data-expanded="true"] .ve-rail-top {\n  transform: translateY(5.25px) rotate(45deg) scaleX(1.1422494);\n}\n\n.ve-rail[data-expanded="true"] .ve-rail-middle {\n  transform: translateX(3.5px) rotate(-45deg) scaleX(2.4748737);\n}\n\n.ve-rail[data-expanded="true"] .ve-rail-bottom,\n.ve-rail[data-expanded="true"] .ve-rail-sparkle {\n  transform: scale(0);\n  opacity: 0;\n}\n\n.ve-rail-badge {\n  position: absolute;\n  top: -4px;\n  right: -4px;\n  padding: 2px 5px;\n  border-radius: 10px;\n  background: #3c82f7;\n  color: white;\n  font-size: 10px;\n  transition: opacity 150ms;\n}\n\n.ve-rail[data-expanded="true"] .ve-rail-badge {\n  opacity: 0;\n}\n\n.ve-rail-tooltip {\n  position: absolute;\n  bottom: 44px;\n  left: 50%;\n  padding: 6px 9px;\n  border-radius: 6px;\n  background: #1a1a1a;\n  color: white;\n  font-size: 11px;\n  white-space: nowrap;\n  pointer-events: none;\n  opacity: 0;\n  transform: translate(-50%, 4px);\n  transition:\n    opacity 150ms,\n    transform 150ms;\n}\n\n.ve-rail-button:hover .ve-rail-tooltip,\n.ve-rail-button:focus-within .ve-rail-tooltip {\n  opacity: 1;\n  transform: translate(-50%, 0);\n}\n\n.ve-rail svg {\n  fill: none;\n}\n\n@keyframes ve-rail-enter {\n  from {\n    opacity: 0;\n    transform: translateY(12px) scale(0.9);\n  }\n  to {\n    opacity: 1;\n    transform: none;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .ve-rail *,\n  .ve-rail-glyph path {\n    animation: none;\n    transition: none;\n  }\n}\n';

// src/components/controlRail/ControlRail.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function ControlRail(props) {
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      "data-visual-editor": true,
      className: "ve-rail",
      "data-expanded": props.expanded,
      children: [
        /* @__PURE__ */ jsx("style", { children: styles_default }),
        /* @__PURE__ */ jsxs("div", { className: "ve-rail-surface", children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "ve-rail-controls",
              role: "toolbar",
              "aria-label": "Visual editor",
              "aria-hidden": !props.expanded,
              children: [
                /* @__PURE__ */ jsx(
                  Control,
                  {
                    label: props.showMarkers ? "Hide markers" : "Show markers",
                    icon: props.showMarkers ? "eye" : "eyeOff",
                    pressed: !props.showMarkers,
                    hidden: !props.expanded,
                    onClick: props.onMarkers
                  }
                ),
                /* @__PURE__ */ jsx(
                  Control,
                  {
                    label: "Apply pending with AI",
                    icon: "wand",
                    disabled: !props.pendingCount,
                    hidden: !props.expanded,
                    onClick: props.onApply
                  }
                ),
                /* @__PURE__ */ jsx(
                  Control,
                  {
                    label: "Undo all and clear",
                    icon: "trash",
                    disabled: !props.count,
                    hidden: !props.expanded,
                    onClick: props.onClear
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "ve-rail-divider" }),
                /* @__PURE__ */ jsx("span", { className: "ve-rail-placeholder" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "ve-rail-toggle",
              onClick: props.onToggle,
              "aria-label": props.expanded ? "Exit editor" : "Open visual editor",
              "aria-expanded": props.expanded,
              children: [
                /* @__PURE__ */ jsxs(
                  "svg",
                  {
                    className: "ve-rail-glyph",
                    width: "24",
                    height: "24",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    "aria-hidden": "true",
                    children: [
                      /* @__PURE__ */ jsx("path", { className: "ve-rail-top", d: "M5.5 6.75H18.5" }),
                      /* @__PURE__ */ jsx("path", { className: "ve-rail-middle", d: "M5.5 12H11.5" }),
                      /* @__PURE__ */ jsx("path", { className: "ve-rail-bottom", d: "M5.5 17.25H9.25" }),
                      /* @__PURE__ */ jsx(
                        "path",
                        {
                          className: "ve-rail-sparkle",
                          d: "M16 12.75L17 15L19.25 16L17 17L16 19.25L15 17L12.75 16L15 15Z"
                        }
                      )
                    ]
                  }
                ),
                props.count > 0 && /* @__PURE__ */ jsx("span", { className: "ve-rail-badge", children: props.count })
              ]
            }
          )
        ] })
      ]
    }
  );
}
function Control({
  label,
  icon,
  disabled,
  hidden,
  pressed,
  onClick
}) {
  return /* @__PURE__ */ jsxs("div", { className: "ve-rail-button", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        "aria-label": label,
        "aria-pressed": pressed,
        disabled,
        tabIndex: hidden ? -1 : 0,
        onClick,
        children: /* @__PURE__ */ jsx(Icon, { name: icon, size: 24 })
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "ve-rail-tooltip", role: "tooltip", children: label })
  ] });
}
var paths = {
  wand: "M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M12.2 6.2 11 5M3 21l9-9",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeOff: "M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.8M6.4 6.9A16 16 0 0 0 2 12s4 6 10 6a9.7 9.7 0 0 0 3.6-.7",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  close: "M6 6l12 12M18 6L6 18"
};
function Icon({ name, size = 16 }) {
  return /* @__PURE__ */ jsx(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
      children: /* @__PURE__ */ jsx("path", { d: paths[name] })
    }
  );
}

// src/shared.ts
var UNSAFE_VALUE = /url\(|expression\(|javascript:|@import/i;
function sanitizePatch(raw) {
  if (!raw || typeof raw !== "object") return null;
  const input = raw;
  const css = {};
  if (input.css && typeof input.css === "object") {
    for (const [property, value] of Object.entries(
      input.css
    )) {
      if (/^-{0,2}[a-z][a-z-]*$/.test(property) && typeof value === "string" && value.length < 300 && !UNSAFE_VALUE.test(value))
        css[property] = value;
    }
  }
  const content = typeof input.content === "string" && input.content.length < 5e3 ? input.content : void 0;
  return Object.keys(css).length || content !== void 0 ? { css, content } : null;
}

// src/components/annotationPopup/AnnotationPopup.tsx
import {
  useEffect,
  useRef,
  useState
} from "react";

// src/components/annotationPopup/styles.ts
var font = "system-ui, -apple-system, 'Segoe UI', sans-serif";
var styles = {
  popup: {
    width: 280,
    maxWidth: "calc(100vw - 24px)",
    boxSizing: "border-box",
    display: "grid",
    gap: 8,
    padding: "12px",
    overflow: "auto",
    borderRadius: 12,
    background: "#1a1a1a",
    color: "#fff",
    fontFamily: font,
    boxShadow: "0 4px 24px rgba(0,0,0,.3), 0 0 0 1px rgba(255,255,255,.08)",
    border: 0,
    transition: "left 200ms ease, top 200ms ease, opacity 180ms ease-out, transform 220ms cubic-bezier(.34, 1.56, .64, 1)"
  },
  header: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  headingButton: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    minWidth: 0,
    flex: 1,
    padding: 0,
    border: 0,
    color: "inherit",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer"
  },
  chevron: {
    fontSize: 20,
    lineHeight: 0.7,
    color: "rgba(255,255,255,.55)",
    transition: "transform .2s ease"
  },
  element: {
    minWidth: 0,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: 12,
    color: "rgba(255,255,255,.65)"
  },
  close: {
    border: 0,
    padding: 0,
    width: 24,
    height: 24,
    borderRadius: 5,
    background: "transparent",
    color: "rgba(255,255,255,.7)",
    fontSize: 21,
    lineHeight: 1,
    cursor: "pointer"
  },
  stylePanel: { display: "grid", transition: "grid-template-rows .2s ease" },
  styleClip: { overflow: "hidden" },
  styleBlock: {
    padding: "8px 10px",
    borderRadius: 7,
    background: "rgba(255,255,255,.06)",
    color: "rgba(255,255,255,.78)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 11,
    lineHeight: 1.55
  },
  property: { color: "#c792ea" },
  quote: {
    padding: "7px 9px",
    borderRadius: 7,
    background: "rgba(255,255,255,.06)",
    color: "rgba(255,255,255,.65)",
    fontSize: 12,
    lineHeight: 1.45,
    fontStyle: "italic"
  },
  textarea: {
    width: "100%",
    height: 68,
    resize: "none",
    padding: "8px 9px",
    borderRadius: 8,
    outline: "none",
    background: "rgba(255,255,255,.05)",
    color: "#fff",
    fontFamily: font,
    fontSize: 13
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 2
  },
  cancel: {
    border: 0,
    padding: "7px 11px",
    borderRadius: 999,
    background: "transparent",
    color: "rgba(255,255,255,.65)",
    fontSize: 12,
    cursor: "pointer"
  },
  submit: {
    border: 0,
    padding: "7px 13px",
    borderRadius: 999,
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer"
  }
};

// src/components/annotationPopup/AnnotationPopup.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function AnnotationPopup({
  element,
  selectedText,
  computedStyles,
  value,
  placeholder = "What should change?",
  disabled,
  accentColor = "#3c82f7",
  onChange,
  onCancel,
  onSubmit,
  beforeField,
  afterField,
  footer,
  style,
  surfaceState = "edit",
  className,
  positioning,
  directEntry
}) {
  const [stylesOpen, setStylesOpen] = useState(false);
  const textarea = useRef(null);
  useEffect(() => {
    const timer = window.setTimeout(
      () => textarea.current?.focus({ preventScroll: true }),
      40
    );
    return () => window.clearTimeout(timer);
  }, []);
  const hasStyles = !!computedStyles && Object.keys(computedStyles).length > 0;
  const submit = () => {
    if (!disabled && value.trim()) onSubmit?.();
  };
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      "data-visual-editor": true,
      "data-annotation-card": true,
      "data-annotation-popup": true,
      "data-state": surfaceState,
      "data-positioning": positioning || void 0,
      "data-direct-entry": directEntry || void 0,
      className,
      role: "dialog",
      "aria-label": `Annotate ${element}`,
      "aria-hidden": surfaceState === "hidden",
      style: {
        ...styles.popup,
        ...surfaceStyle(surfaceState, positioning),
        ...style
      },
      children: [
        /* @__PURE__ */ jsxs2("div", { style: styles.header, children: [
          hasStyles ? /* @__PURE__ */ jsxs2(
            "button",
            {
              type: "button",
              onClick: () => setStylesOpen((open) => !open),
              "aria-expanded": stylesOpen,
              style: styles.headingButton,
              children: [
                /* @__PURE__ */ jsx2(
                  "span",
                  {
                    style: {
                      ...styles.chevron,
                      transform: stylesOpen ? "rotate(90deg)" : void 0
                    },
                    children: "\u203A"
                  }
                ),
                /* @__PURE__ */ jsx2("span", { style: styles.element, children: element })
              ]
            }
          ) : /* @__PURE__ */ jsx2("span", { style: styles.element, children: element }),
          /* @__PURE__ */ jsx2(
            "button",
            {
              type: "button",
              "aria-label": "Close annotation",
              onClick: onCancel,
              style: styles.close,
              children: "\xD7"
            }
          )
        ] }),
        hasStyles && /* @__PURE__ */ jsx2(
          "div",
          {
            style: {
              ...styles.stylePanel,
              gridTemplateRows: stylesOpen ? "1fr" : "0fr"
            },
            children: /* @__PURE__ */ jsx2("div", { style: styles.styleClip, children: /* @__PURE__ */ jsx2("div", { style: styles.styleBlock, children: Object.entries(computedStyles).map(([property, cssValue]) => /* @__PURE__ */ jsxs2("div", { children: [
              /* @__PURE__ */ jsx2("span", { style: styles.property, children: property }),
              ": ",
              cssValue,
              ";"
            ] }, property)) }) })
          }
        ),
        selectedText && /* @__PURE__ */ jsxs2("div", { style: styles.quote, children: [
          "\u201C",
          selectedText.slice(0, 160),
          selectedText.length > 160 ? "\u2026" : "",
          "\u201D"
        ] }),
        beforeField,
        /* @__PURE__ */ jsx2(
          "textarea",
          {
            ref: textarea,
            value,
            disabled,
            onChange: (event) => onChange(event.target.value),
            onKeyDown: (event) => {
              if (event.nativeEvent.isComposing) return;
              if (event.key === "Escape") {
                event.preventDefault();
                onCancel();
              }
              if (event.key === "Enter" && !event.shiftKey && onSubmit) {
                event.preventDefault();
                submit();
              }
            },
            placeholder,
            rows: 3,
            style: { ...styles.textarea, borderColor: accentColor }
          }
        ),
        afterField,
        footer ?? /* @__PURE__ */ jsxs2("div", { style: styles.actions, children: [
          /* @__PURE__ */ jsx2("button", { type: "button", onClick: onCancel, style: styles.cancel, children: "Cancel" }),
          onSubmit && /* @__PURE__ */ jsx2(
            "button",
            {
              type: "button",
              disabled: disabled || !value.trim(),
              onClick: submit,
              style: {
                ...styles.submit,
                background: accentColor,
                opacity: value.trim() ? 1 : 0.45
              },
              children: "Add"
            }
          )
        ] })
      ]
    }
  );
}
function surfaceStyle(state, positioning) {
  const visible = state === "preview" || state === "edit";
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(.94)",
    pointerEvents: state === "edit" ? "auto" : "none",
    ...positioning ? { transition: "none" } : {}
  };
}

// src/components/annotationMarker/AnnotationMarker.tsx
import { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";

// src/components/annotationMarker/styles.ts
var styles2 = {
  marker: { position: "fixed", zIndex: 2147483646, width: 20, height: 20, padding: 0, border: "1px solid rgba(255,255,255,.35)", borderRadius: "50%", color: "#fff", display: "grid", placeItems: "center" },
  number: { display: "block" },
  action: { position: "absolute", inset: 0, display: "grid", placeItems: "center" },
  plus: { position: "absolute", inset: 0, display: "grid", placeItems: "center" }
};

// src/components/annotationMarker/AnnotationMarker.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function AnnotationMarker({
  index,
  status,
  x,
  y,
  onClick
}) {
  const [hovered, setHovered] = useState2(false);
  const marker = useRef2(null);
  const pending = status === "pending";
  const color = status === "failed" ? "#e5484d" : status === "applied" ? "#22a06b" : "#3c82f7";
  useEffect2(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    marker.current?.animate(
      [
        { opacity: 0, transform: "translate(-50%, -50%) scale(.3)" },
        { opacity: 1, transform: "translate(-50%, -50%) scale(1)" }
      ],
      { duration: 250, easing: "cubic-bezier(.22,1,.36,1)" }
    );
  }, []);
  const actionVisible = hovered && !pending;
  return /* @__PURE__ */ jsxs3(
    "button",
    {
      ref: marker,
      "data-visual-editor": true,
      "data-annotation-marker": true,
      "data-status": status,
      type: "button",
      "aria-label": pending ? "Pending annotation" : `Edit annotation ${index + 1}`,
      disabled: pending,
      onClick,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setHovered(true),
      onBlur: () => setHovered(false),
      style: {
        ...styles2.marker,
        left: x,
        top: y,
        background: color,
        cursor: pending ? "default" : "pointer",
        transform: `translate(-50%, -50%) scale(${actionVisible ? 1.1 : 1})`,
        zIndex: actionVisible ? 2147483647 : 2147483646
      },
      children: [
        /* @__PURE__ */ jsx3(
          "span",
          {
            "aria-hidden": true,
            style: {
              ...styles2.number,
              opacity: actionVisible || pending ? 0 : 1,
              transform: actionVisible ? "translateY(-2px) scale(.8)" : "translateY(0) scale(1)"
            },
            children: status === "applied" ? "\u2713" : status === "failed" ? "!" : index + 1
          }
        ),
        /* @__PURE__ */ jsx3(
          "span",
          {
            "aria-hidden": true,
            style: {
              ...styles2.action,
              opacity: actionVisible ? 1 : 0,
              transform: actionVisible ? "translateY(0) scale(1) rotate(0)" : "translateY(2px) scale(.8) rotate(-12deg)"
            },
            children: /* @__PURE__ */ jsx3(Pencil, {})
          }
        ),
        /* @__PURE__ */ jsx3(
          "span",
          {
            "aria-hidden": true,
            style: {
              ...styles2.plus,
              opacity: pending ? 1 : 0,
              transform: pending ? "rotate(0) scale(1)" : "rotate(-90deg) scale(.6)"
            },
            children: "+"
          }
        )
      ]
    }
  );
}
function Pencil() {
  return /* @__PURE__ */ jsxs3(
    "svg",
    {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsx3("path", { d: "M12 20h9" }),
        /* @__PURE__ */ jsx3("path", { d: "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" })
      ]
    }
  );
}

// component-css:/Users/triveintmac4/Documents/github/agent-ui/src/components/visualEditor/styles.inline
var styles_default2 = '.ve-highlight {\n  position: fixed;\n  z-index: 2147483645;\n  border: 1px solid #3c82f7;\n  border-radius: 3px;\n  background: rgb(60 130 247 / 8%);\n  pointer-events: none;\n}\n.ve-hover-label {\n  position: fixed;\n  z-index: 2147483645;\n  padding: 2px 6px;\n  border-radius: 3px;\n  background: #1a1a1a;\n  color: rgb(255 255 255 / 78%);\n  font:\n    10px system-ui,\n    sans-serif;\n  white-space: nowrap;\n  pointer-events: none;\n  box-shadow: 0 1px 5px rgb(0 0 0 / 20%);\n}\n.ve-popup-position {\n  position: fixed;\n  z-index: 2147483647;\n  overflow-y: auto;\n}\n.ve-popup-position[data-state="edit"] {\n  animation: ve-popup-enter 340ms cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n@keyframes ve-popup-enter {\n  from {\n    opacity: 0;\n    transform: translateY(10px) scale(0.94);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0) scale(1);\n  }\n}\n.ve-selector {\n  overflow: hidden;\n  color: rgb(255 255 255 / 42%);\n  font-size: 10px;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.ve-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n.ve-button {\n  border: 0;\n  cursor: pointer;\n}\n.ve-patch {\n  max-height: 130px;\n  margin: 0;\n  overflow: auto;\n  padding: 9px;\n  border-radius: 6px;\n  background: rgb(255 255 255 / 5%);\n  color: rgb(255 255 255 / 76%);\n  font-size: 11px;\n}\n.ve-error {\n  margin: 0;\n  color: #ff8b8f;\n  font-size: 12px;\n}\n.ve-button {\n  border-radius: 7px;\n  padding: 7px 10px;\n  font-size: 12px;\n}\n.ve-button-primary {\n  background: #3c82f7;\n  color: #fff;\n}\n.ve-button-secondary {\n  background: rgb(255 255 255 / 7%);\n  color: rgb(255 255 255 / 70%);\n}\n';

// src/components/visualEditor/VisualEditor.tsx
import {
  useCallback,
  useEffect as useEffect3,
  useReducer,
  useRef as useRef3,
  useState as useState3
} from "react";
import { Fragment, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var DEFAULT_BASE = "/api/visual-editor";
function VisualEditor({
  children,
  onAskAi: customAskAi,
  onApplied,
  endpoint = DEFAULT_BASE,
  persist = true
}) {
  const onAskAi = customAskAi ?? ((request) => askEndpoint(endpoint, request));
  const [enabled, setEnabled] = useState3(false);
  const [showMarkers, setShowMarkers] = useState3(true);
  const [notes, setNotes] = useState3([]);
  const [activeId, setActiveId] = useState3();
  const [closing, setClosing] = useState3(false);
  const [hovered, setHovered] = useState3();
  const [, redraw] = useReducer((n) => n + 1, 0);
  const nextId = useRef3(1);
  const closeTimer = useRef3();
  const hydratedEndpoint = useRef3();
  const notesRef = useRef3(notes);
  notesRef.current = notes;
  const patchNote = useCallback((id, changes) => {
    setNotes(
      (list) => list.map((n) => n.id === id ? { ...n, ...changes } : n)
    );
  }, []);
  useEffect3(() => {
    if (!enabled || closing) {
      setHovered(void 0);
      return;
    }
    const inEditor = (t) => t instanceof Element && !!t.closest("[data-visual-editor]");
    const onClick = (event) => {
      if (inEditor(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      const element = event.target instanceof HTMLElement ? event.target : event.target instanceof Node ? event.target.parentElement : null;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const id = nextId.current++;
      const note = {
        id,
        element,
        status: "draft",
        instruction: "",
        offset: {
          x: rect.width ? (event.clientX - rect.left) / rect.width : 0.5,
          y: rect.height ? (event.clientY - rect.top) / rect.height : 0.5
        },
        position: { x: event.clientX, y: event.clientY },
        selection: describeElement(element, getSelectedTextFor(element))
      };
      setNotes((list) => [...list.filter((n) => n.status !== "draft"), note]);
      setActiveId(id);
    };
    const onMove = (event) => {
      setHovered(
        inEditor(event.target) ? void 0 : event.target
      );
    };
    const onKey = (event) => {
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
  }, [enabled, closing]);
  useEffect3(
    () => () => window.clearTimeout(closeTimer.current),
    []
  );
  useEffect3(() => {
    window.addEventListener("scroll", redraw, true);
    window.addEventListener("resize", redraw);
    return () => {
      window.removeEventListener("scroll", redraw, true);
      window.removeEventListener("resize", redraw);
    };
  }, []);
  useEffect3(() => {
    if (!persist) return;
    if (hydratedEndpoint.current === endpoint) return;
    hydratedEndpoint.current = endpoint;
    fetch(`${endpoint}/edits`).then((r) => r.ok ? r.json() : []).then((list) => {
      if (!Array.isArray(list)) return;
      const restored = [];
      for (const edit of list) {
        const patch = sanitizePatch(edit.patch);
        if (!patch) continue;
        let element = null;
        try {
          element = document.querySelector(edit.selector);
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
            y: rect.top + rect.height / 2
          },
          selection: describeElement(element),
          instruction: edit.instruction ?? "",
          status: "applied",
          patch,
          undo: applyPatch(element, patch)
        });
      }
      setNotes(restored);
      redraw();
    }).catch(() => {
    });
  }, [endpoint, persist]);
  function closePopup() {
    if (closing) return;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setActiveId(void 0);
      setNotes((list) => list.filter((n) => n.status !== "draft"));
      setClosing(false);
    }, 220);
  }
  async function runAi(id) {
    const note = notesRef.current.find((n) => n.id === id);
    if (!note || !note.instruction.trim() || !onAskAi) return;
    note.undo?.();
    patchNote(id, {
      status: "pending",
      message: void 0,
      undo: void 0,
      patch: void 0
    });
    try {
      const answer = await onAskAi({
        selection: note.selection,
        instruction: note.instruction
      });
      const patch = extractUiPatch(answer);
      if (!patch) {
        patchNote(id, {
          status: "failed",
          message: "The model didn't return a usable change. Try rephrasing."
        });
        return;
      }
      const undo = applyPatch(note.element, patch);
      patchNote(id, { status: "applied", patch, undo, message: void 0 });
      onApplied?.({
        selection: note.selection,
        instruction: note.instruction,
        patch
      });
      if (persist)
        void saveEdit(endpoint, {
          selector: note.selection.selector,
          instruction: note.instruction,
          patch
        });
      redraw();
    } catch (error) {
      patchNote(id, {
        status: "failed",
        message: error instanceof Error ? error.message : "AI request failed."
      });
    }
  }
  function undoNote(id) {
    const note = notesRef.current.find((n) => n.id === id);
    note?.undo?.();
    if (persist && note) void deleteEdit(endpoint, note.selection.selector);
    patchNote(id, { status: "noted", undo: void 0, patch: void 0 });
    redraw();
  }
  function removeNote(id) {
    const note = notesRef.current.find((n) => n.id === id);
    note?.undo?.();
    if (persist && note?.status === "applied")
      void deleteEdit(endpoint, note.selection.selector);
    setNotes((list) => list.filter((n) => n.id !== id));
    setActiveId(void 0);
    redraw();
  }
  async function applyAll() {
    for (const n of notesRef.current) {
      if ((n.status === "noted" || n.status === "failed") && n.instruction.trim())
        await runAi(n.id);
    }
  }
  function resetAll() {
    notesRef.current.forEach((n) => n.undo?.());
    if (persist && notesRef.current.some((n) => n.status === "applied"))
      void deleteEdit(endpoint);
    setNotes([]);
    setActiveId(void 0);
  }
  const active = notes.find((n) => n.id === activeId);
  const saved = notes.filter((n) => n.status !== "draft");
  const pendingCount = saved.filter(
    (n) => n.status === "noted" || n.status === "failed"
  ).length;
  const hoverRect = enabled && hovered?.isConnected ? hovered.getBoundingClientRect() : void 0;
  return /* @__PURE__ */ jsxs4(Fragment, { children: [
    /* @__PURE__ */ jsx4("style", { children: styles_default2 }),
    children,
    hoverRect && hovered && /* @__PURE__ */ jsxs4(Fragment, { children: [
      /* @__PURE__ */ jsx4(
        "div",
        {
          "aria-hidden": true,
          className: "ve-highlight",
          style: {
            top: hoverRect.top,
            left: hoverRect.left,
            width: hoverRect.width,
            height: hoverRect.height
          }
        }
      ),
      /* @__PURE__ */ jsx4(
        "div",
        {
          "aria-hidden": true,
          className: "ve-hover-label",
          style: {
            top: Math.max(4, hoverRect.top - 24),
            left: Math.max(4, hoverRect.left)
          },
          children: hovered.getAttribute("data-component") || hovered.getAttribute("aria-label") || hovered.tagName.toLowerCase()
        }
      )
    ] }),
    enabled && showMarkers && notes.map((note, index) => {
      if (!note.element.isConnected) return null;
      const rect = note.element.getBoundingClientRect();
      const x = rect.left + rect.width * note.offset.x;
      const y = rect.top + rect.height * note.offset.y;
      return /* @__PURE__ */ jsx4(
        AnnotationMarker,
        {
          index,
          status: note.status,
          x,
          y,
          onClick: () => setActiveId(note.id)
        },
        note.id
      );
    }),
    (enabled || closing) && active && (() => {
      const busy = active.status === "pending";
      const clickX = active.position.x;
      const clickY = active.position.y;
      const inset = 12;
      const popupWidth = Math.min(
        280,
        Math.max(0, window.innerWidth - inset * 2)
      );
      const left = Math.max(
        inset,
        Math.min(clickX - popupWidth / 2, window.innerWidth - inset - popupWidth)
      );
      const preferredTop = clickY + 16;
      const top = Math.min(
        Math.max(inset, preferredTop),
        Math.max(inset, window.innerHeight - 260)
      );
      const maxHeight = Math.max(0, window.innerHeight - top - inset);
      return /* @__PURE__ */ jsx4(
        AnnotationPopup,
        {
          element: active.selection.componentHint,
          selectedText: active.selection.selectedText,
          computedStyles: active.selection.styles,
          value: active.instruction,
          disabled: busy,
          onChange: (instruction) => patchNote(active.id, { instruction }),
          onCancel: closePopup,
          onSubmit: () => {
            patchNote(active.id, { status: "noted" });
            void runAi(active.id);
          },
          placeholder: "What should change? e.g. \u201CMake this button larger with a purple gradient\u201D",
          surfaceState: closing ? "hidden" : "edit",
          className: "ve-popup-position",
          style: { left, top, maxHeight },
          beforeField: /* @__PURE__ */ jsx4("code", { className: "ve-selector", children: active.selection.selector }),
          afterField: /* @__PURE__ */ jsxs4(Fragment, { children: [
            active.patch && /* @__PURE__ */ jsx4("pre", { className: "ve-patch", children: JSON.stringify(active.patch, null, 2) }),
            active.message && /* @__PURE__ */ jsx4("p", { className: "ve-error", children: active.message })
          ] }),
          footer: /* @__PURE__ */ jsxs4("div", { className: "ve-actions", children: [
            active.status !== "draft" && /* @__PURE__ */ jsx4(
              "button",
              {
                type: "button",
                onClick: () => removeNote(active.id),
                className: "ve-button ve-button-secondary",
                children: "Delete"
              }
            ),
            active.status === "applied" && /* @__PURE__ */ jsx4(
              "button",
              {
                type: "button",
                onClick: () => undoNote(active.id),
                className: "ve-button ve-button-secondary",
                children: "Undo"
              }
            ),
            /* @__PURE__ */ jsx4("span", { style: { flex: 1 } }),
            /* @__PURE__ */ jsx4(
              "button",
              {
                type: "button",
                disabled: busy || !active.instruction.trim() || !onAskAi,
                onClick: () => {
                  patchNote(active.id, { status: "noted" });
                  void runAi(active.id);
                },
                className: "ve-button ve-button-primary",
                children: busy ? "Applying\u2026" : active.status === "applied" ? "Re-apply" : "Apply with AI"
              }
            )
          ] })
        }
      );
    })(),
    /* @__PURE__ */ jsx4(
      ControlRail,
      {
        expanded: enabled,
        onToggle: () => {
          setEnabled(!enabled);
          closePopup();
        },
        count: saved.length,
        showMarkers,
        pendingCount,
        onMarkers: () => setShowMarkers((v) => !v),
        onApply: applyAll,
        onClear: resetAll
      }
    )
  ] });
}
var STYLE_PROBES = [
  "color",
  "background-color",
  "font-size",
  "font-weight",
  "font-family",
  "padding",
  "margin",
  "border-radius",
  "display"
];
var IDENTIFYING_ATTRIBUTES = [
  "data-testid",
  "data-test",
  "data-qa",
  "data-cy",
  "data-component"
];
function getSelectedTextFor(element) {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount)
    return void 0;
  const text = selection.toString().trim();
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const selectionElement = container.nodeType === Node.ELEMENT_NODE ? container : container.parentElement;
  return text && selectionElement && (element.contains(selectionElement) || selectionElement.contains(element)) ? text.slice(0, 500) : void 0;
}
function describeElement(element, selectedText) {
  const computed = getComputedStyle(element);
  const styles3 = {};
  for (const property of STYLE_PROBES)
    styles3[property] = computed.getPropertyValue(property);
  const rect = element.getBoundingClientRect();
  const attributes = Object.fromEntries(
    IDENTIFYING_ATTRIBUTES.flatMap((name) => {
      const value = element.getAttribute(name);
      return value && value.length <= 500 ? [[name, value]] : [];
    })
  );
  return {
    selector: getSelector(element),
    tagName: element.tagName.toLowerCase(),
    text: (element.innerText || element.textContent || "").trim().slice(0, 240),
    selectedText,
    componentHint: element.getAttribute("data-component") || element.getAttribute("aria-label") || element.tagName.toLowerCase(),
    attributes,
    classNames: element.className,
    boundingBox: {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    },
    html: element.outerHTML.slice(0, 600),
    styles: styles3
  };
}
function getSelector(element) {
  if (element.id) return `#${CSS.escape(element.id)}`;
  for (const attribute of IDENTIFYING_ATTRIBUTES) {
    const value = element.getAttribute(attribute);
    if (!value) continue;
    const candidate = `[${attribute}="${CSS.escape(value)}"]`;
    try {
      if (document.querySelectorAll(candidate).length === 1) return candidate;
    } catch {
    }
  }
  const parts = [];
  let current = element;
  while (current && current !== document.body && current !== document.documentElement) {
    if (current.id) {
      parts.unshift(`#${CSS.escape(current.id)}`);
      break;
    }
    const node = current;
    const tag = node.tagName.toLowerCase();
    const same = node.parentElement ? [...node.parentElement.children].filter(
      (c) => c.tagName === node.tagName
    ) : [];
    parts.unshift(
      same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(node) + 1})` : tag
    );
    const candidate = parts.join(" > ");
    try {
      if (document.querySelectorAll(candidate).length === 1) return candidate;
    } catch {
    }
    current = node.parentElement;
  }
  return parts.join(" > ");
}
function extractUiPatch(answer) {
  for (const raw of jsonObjects(answer)) {
    const patch = sanitizePatch(normalizePatch(raw));
    if (patch) return patch;
  }
  return sanitizePatch({ css: parseCssDeclarations(answer) });
}
function normalizePatch(raw) {
  if (!raw || typeof raw !== "object") return raw;
  const response = raw;
  const candidate = response.css ?? response.styles;
  const css = typeof candidate === "string" ? parseCssDeclarations(candidate) : candidate && typeof candidate === "object" ? candidate : Object.fromEntries(
    Object.entries(response).filter(
      ([property, value]) => /^-{0,2}[a-z][a-z-]*$/.test(property) && typeof value === "string"
    )
  );
  return {
    css,
    content: typeof response.content === "string" ? response.content : typeof response.text === "string" ? response.text : void 0
  };
}
function parseCssDeclarations(value) {
  const css = {};
  const declarations = /(?:^|[;\n])\s*([a-z-]+)\s*:\s*([^;\n{}]+)\s*;?/gi;
  for (const match of value.matchAll(declarations))
    css[match[1].toLowerCase()] = match[2].trim();
  return css;
}
function jsonObjects(value) {
  const objects = [];
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
      }
    }
  }
  return objects;
}
function applyPatch(element, patch) {
  const prevStyle = element.getAttribute("style");
  let restoreText;
  for (const [property, value] of Object.entries(patch.css))
    element.style.setProperty(property, value);
  if (patch.content !== void 0) {
    const textNode = [...element.childNodes].find(
      (n) => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim()
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
    prevStyle === null ? element.removeAttribute("style") : element.setAttribute("style", prevStyle);
    restoreText?.();
  };
}
async function askEndpoint(base, request) {
  const response = await fetch(`${base}/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data.message ?? "AI request failed. Is the editor server running?"
    );
  return data.message ?? "";
}
async function saveEdit(base, edit) {
  try {
    await fetch(`${base}/edits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edit)
    });
  } catch {
  }
}
async function deleteEdit(base, selector) {
  try {
    await fetch(
      `${base}/edits${selector ? `?selector=${encodeURIComponent(selector)}` : ""}`,
      { method: "DELETE" }
    );
  } catch {
  }
}
function applySavedEdits(edits) {
  let count = 0;
  for (const edit of edits) {
    const patch = sanitizePatch(edit.patch);
    if (!patch) continue;
    let element = null;
    try {
      element = document.querySelector(edit.selector);
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
function SavedEdits({ edits }) {
  useEffect3(() => {
    applySavedEdits(edits);
  }, [edits]);
  return null;
}

// src/components/checkbox/Checkbox.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function Checkbox({
  className = "",
  checked,
  onChange,
  theme = "light",
  disabled,
  ...props
}) {
  const isChecked = checked === true;
  const dark = theme === "dark";
  const foreground = dark ? "#1a1a1a" : "#fafafa";
  return /* @__PURE__ */ jsxs5(
    "label",
    {
      className,
      "data-checkbox": true,
      "data-checked": isChecked || void 0,
      "data-theme": theme,
      style: {
        ...C.container,
        borderColor: dark ? "rgb(255 255 255 / 0.2)" : "rgb(26 26 26 / 0.2)",
        background: isChecked ? dark ? "#fff" : "#1a1a1a" : dark ? "#252525" : "#fff",
        opacity: disabled ? 0.55 : 1
      },
      children: [
        /* @__PURE__ */ jsx5(
          "input",
          {
            ...props,
            type: "checkbox",
            checked,
            onChange,
            disabled,
            style: C.input
          }
        ),
        /* @__PURE__ */ jsx5(
          "svg",
          {
            "aria-hidden": "true",
            width: "14",
            height: "14",
            viewBox: "0 0 14 14",
            fill: "none",
            style: { ...C.check, color: foreground },
            children: /* @__PURE__ */ jsx5(
              "path",
              {
                d: "M3.94 7L6.13 9.19L10.5 4.81",
                stroke: "currentColor",
                strokeWidth: "1.5",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                style: {
                  strokeDasharray: "9.29px",
                  strokeDashoffset: isChecked ? 0 : "9.29px",
                  transition: "stroke-dashoffset .1s ease"
                }
              }
            )
          }
        )
      ]
    }
  );
}
var C = {
  container: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: 14,
    height: 14,
    border: "1px solid",
    borderRadius: 4,
    transition: "background-color .2s ease, border-color .2s ease"
  },
  input: {
    position: "absolute",
    zIndex: 1,
    inset: -1,
    width: "calc(100% + 2px)",
    height: "calc(100% + 2px)",
    margin: 0,
    opacity: 0,
    cursor: "pointer"
  },
  check: { pointerEvents: "none" }
};
export {
  AnnotationMarker,
  AnnotationPopup,
  Checkbox,
  SavedEdits,
  VisualEditor,
  applySavedEdits
};
