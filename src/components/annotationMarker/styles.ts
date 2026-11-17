import type { CSSProperties } from "react";

export const styles = {
  marker: { position: "fixed", zIndex: 2147483646, width: 20, height: 20, padding: 0, border: "1px solid rgba(255,255,255,.35)", borderRadius: "50%", color: "#fff", display: "grid", placeItems: "center" },
  number: { display: "block" },
  action: { position: "absolute", inset: 0, display: "grid", placeItems: "center" },
  plus: { position: "absolute", inset: 0, display: "grid", placeItems: "center" },
} satisfies Record<string, CSSProperties>;
