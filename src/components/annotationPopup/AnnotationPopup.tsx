import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { styles } from "./styles";

export type AnnotationPopupProps = {
  element: string;
  selectedText?: string;
  computedStyles?: Record<string, string>;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  accentColor?: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  /** Called by Enter (without Shift). Omit when the host supplies its own action flow. */
  onSubmit?: () => void;
  beforeField?: ReactNode;
  afterField?: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Controls the card surface presentation. `edit` is interactive; preview is display-only. */
  surfaceState?: "hidden" | "preview" | "edit";
  positioning?: boolean;
  directEntry?: boolean;
};

const font = "system-ui, -apple-system, 'Segoe UI', sans-serif";

/** A dependency-free annotation form, suitable for visual feedback tools and editor overlays. */
export function AnnotationPopup({
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
  directEntry,
}: AnnotationPopupProps) {
  const [stylesOpen, setStylesOpen] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => textarea.current?.focus({ preventScroll: true }),
      40,
    );
    return () => window.clearTimeout(timer);
  }, []);

  const hasStyles = !!computedStyles && Object.keys(computedStyles).length > 0;
  const submit = () => {
    if (!disabled && value.trim()) onSubmit?.();
  };

  return (
    <div
      data-visual-editor
      data-annotation-card
      data-annotation-popup
      data-state={surfaceState}
      data-positioning={positioning || undefined}
      data-direct-entry={directEntry || undefined}
      className={className}
      role="dialog"
      aria-label={`Annotate ${element}`}
      aria-hidden={surfaceState === "hidden"}
      style={{
        ...styles.popup,
        ...surfaceStyle(surfaceState, positioning),
        ...style,
      }}
    >
      <div style={styles.header}>
        {hasStyles ? (
          <button
            type="button"
            onClick={() => setStylesOpen((open) => !open)}
            aria-expanded={stylesOpen}
            style={styles.headingButton}
          >
            <span
              style={{
                ...styles.chevron,
                transform: stylesOpen ? "rotate(90deg)" : undefined,
              }}
            >
              ›
            </span>
            <span style={styles.element}>{element}</span>
          </button>
        ) : (
          <span style={styles.element}>{element}</span>
        )}
        <button
          type="button"
          aria-label="Close annotation"
          onClick={onCancel}
          style={styles.close}
        >
          ×
        </button>
      </div>

      {hasStyles && (
        <div
          style={{
            ...styles.stylePanel,
            gridTemplateRows: stylesOpen ? "1fr" : "0fr",
          }}
        >
          <div style={styles.styleClip}>
            <div style={styles.styleBlock}>
              {Object.entries(computedStyles!).map(([property, cssValue]) => (
                <div key={property}>
                  <span style={styles.property}>{property}</span>: {cssValue};
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {selectedText && (
        <div style={styles.quote}>
          “{selectedText.slice(0, 160)}
          {selectedText.length > 160 ? "…" : ""}”
        </div>
      )}
      {beforeField}
      <textarea
        ref={textarea}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
          if (event.key === "Enter" && !event.shiftKey && onSubmit) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        rows={3}
        style={{ ...styles.textarea, borderColor: accentColor }}
      />
      {afterField}
      {footer ?? (
        <div style={styles.actions}>
          <button type="button" onClick={onCancel} style={styles.cancel}>
            Cancel
          </button>
          {onSubmit && (
            <button
              type="button"
              disabled={disabled || !value.trim()}
              onClick={submit}
              style={{
                ...styles.submit,
                background: accentColor,
                opacity: value.trim() ? 1 : 0.45,
              }}
            >
              Add
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function surfaceStyle(
  state: NonNullable<AnnotationPopupProps["surfaceState"]>,
  positioning?: boolean,
): CSSProperties {
  const visible = state === "preview" || state === "edit";
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0) scale(1)" : "translateY(10px) scale(.94)",
    pointerEvents: state === "edit" ? "auto" : "none",
    ...(positioning ? { transition: "none" } : {}),
  };
}
