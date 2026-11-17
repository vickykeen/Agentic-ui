import type { CSSProperties, InputHTMLAttributes } from "react";

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  /** Uses the same light/dark appearance as the annotation components. */
  theme?: "light" | "dark";
}

/** A compact accessible checkbox with a CSS-free animated checkmark. */
export function Checkbox({
  className = "",
  checked,
  onChange,
  theme = "light",
  disabled,
  ...props
}: CheckboxProps) {
  const isChecked = checked === true;
  const dark = theme === "dark";
  const foreground = dark ? "#1a1a1a" : "#fafafa";

  return (
    <label
      className={className}
      data-checkbox
      data-checked={isChecked || undefined}
      data-theme={theme}
      style={{
        ...C.container,
        borderColor: dark ? "rgb(255 255 255 / 0.2)" : "rgb(26 26 26 / 0.2)",
        background: isChecked
          ? dark
            ? "#fff"
            : "#1a1a1a"
          : dark
            ? "#252525"
            : "#fff",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <input
        {...props}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={C.input}
      />
      <svg
        aria-hidden="true"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        style={{ ...C.check, color: foreground }}
      >
        <path
          d="M3.94 7L6.13 9.19L10.5 4.81"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: "9.29px",
            strokeDashoffset: isChecked ? 0 : "9.29px",
            transition: "stroke-dashoffset .1s ease",
          }}
        />
      </svg>
    </label>
  );
}

const C: Record<string, CSSProperties> = {
  container: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: 14,
    height: 14,
    border: "1px solid",
    borderRadius: 4,
    transition: "background-color .2s ease, border-color .2s ease",
  },
  input: {
    position: "absolute",
    zIndex: 1,
    inset: -1,
    width: "calc(100% + 2px)",
    height: "calc(100% + 2px)",
    margin: 0,
    opacity: 0,
    cursor: "pointer",
  },
  check: { pointerEvents: "none" },
};
