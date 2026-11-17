import { useEffect, useRef, useState, type CSSProperties } from "react";
import { styles } from "./styles";

export type AnnotationMarkerStatus =
  "draft" | "noted" | "pending" | "applied" | "failed";

export type AnnotationMarkerProps = {
  index: number;
  status: AnnotationMarkerStatus;
  x: number;
  y: number;
  onClick: () => void;
};

/** Animated, status-aware marker used to reopen an annotation. */
export function AnnotationMarker({
  index,
  status,
  x,
  y,
  onClick,
}: AnnotationMarkerProps) {
  const [hovered, setHovered] = useState(false);
  const marker = useRef<HTMLButtonElement>(null);
  const pending = status === "pending";
  const color =
    status === "failed"
      ? "#e5484d"
      : status === "applied"
        ? "#22a06b"
        : "#3c82f7";

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    marker.current?.animate(
      [
        { opacity: 0, transform: "translate(-50%, -50%) scale(.3)" },
        { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
      ],
      { duration: 250, easing: "cubic-bezier(.22,1,.36,1)" },
    );
  }, []);

  const actionVisible = hovered && !pending;
  return (
    <button
      ref={marker}
      data-visual-editor
      data-annotation-marker
      data-status={status}
      type="button"
      aria-label={
        pending ? "Pending annotation" : `Edit annotation ${index + 1}`
      }
      disabled={pending}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        ...styles.marker,
        left: x,
        top: y,
        background: color,
        cursor: pending ? "default" : "pointer",
        transform: `translate(-50%, -50%) scale(${actionVisible ? 1.1 : 1})`,
        zIndex: actionVisible ? 2147483647 : 2147483646,
      }}
    >
      <span
        aria-hidden
        style={{
          ...styles.number,
          opacity: actionVisible || pending ? 0 : 1,
          transform: actionVisible
            ? "translateY(-2px) scale(.8)"
            : "translateY(0) scale(1)",
        }}
      >
        {status === "applied" ? "✓" : status === "failed" ? "!" : index + 1}
      </span>
      <span
        aria-hidden
        style={{
          ...styles.action,
          opacity: actionVisible ? 1 : 0,
          transform: actionVisible
            ? "translateY(0) scale(1) rotate(0)"
            : "translateY(2px) scale(.8) rotate(-12deg)",
        }}
      >
        <Pencil />
      </span>
      <span
        aria-hidden
        style={{
          ...styles.plus,
          opacity: pending ? 1 : 0,
          transform: pending
            ? "rotate(0) scale(1)"
            : "rotate(-90deg) scale(.6)",
        }}
      >
        +
      </span>
    </button>
  );
}

function Pencil() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
