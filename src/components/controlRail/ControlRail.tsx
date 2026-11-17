import css from "./styles.inline";

type Props = {
  expanded: boolean;
  count: number;
  showMarkers: boolean;
  pendingCount: number;
  onToggle: () => void;
  onMarkers: () => void;
  onApply: () => void;
  onClear: () => void;
};

// Adapted from Agentation's persistent toolbarContainer, controlsContent,
// toggleContent and ToolbarToggleIcon. Keep both states mounted so motion reverses smoothly.
export function ControlRail(props: Props) {
  return (
    <aside
      data-visual-editor
      className="ve-rail"
      data-expanded={props.expanded}
    >
      <style>{css}</style>
      <div className="ve-rail-surface">
        <div
          className="ve-rail-controls"
          role="toolbar"
          aria-label="Visual editor"
          aria-hidden={!props.expanded}
        >
          <Control
            label={props.showMarkers ? "Hide markers" : "Show markers"}
            icon={props.showMarkers ? "eye" : "eyeOff"}
            pressed={!props.showMarkers}
            hidden={!props.expanded}
            onClick={props.onMarkers}
          />
          <Control
            label="Apply pending with AI"
            icon="wand"
            disabled={!props.pendingCount}
            hidden={!props.expanded}
            onClick={props.onApply}
          />
          <Control
            label="Undo all and clear"
            icon="trash"
            disabled={!props.count}
            hidden={!props.expanded}
            onClick={props.onClear}
          />
          <span className="ve-rail-divider" />
          <span className="ve-rail-placeholder" />
        </div>
        <button
          type="button"
          className="ve-rail-toggle"
          onClick={props.onToggle}
          aria-label={props.expanded ? "Exit editor" : "Open visual editor"}
          aria-expanded={props.expanded}
        >
          <svg
            className="ve-rail-glyph"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path className="ve-rail-top" d="M5.5 6.75H18.5" />
            <path className="ve-rail-middle" d="M5.5 12H11.5" />
            <path className="ve-rail-bottom" d="M5.5 17.25H9.25" />
            <path
              className="ve-rail-sparkle"
              d="M16 12.75L17 15L19.25 16L17 17L16 19.25L15 17L12.75 16L15 15Z"
            />
          </svg>
          {props.count > 0 && (
            <span className="ve-rail-badge">{props.count}</span>
          )}
        </button>
      </div>
    </aside>
  );
}

function Control({
  label,
  icon,
  disabled,
  hidden,
  pressed,
  onClick,
}: {
  label: string;
  icon: IconName;
  disabled?: boolean;
  hidden: boolean;
  pressed?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="ve-rail-button">
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        tabIndex={hidden ? -1 : 0}
        onClick={onClick}
      >
        <Icon name={icon} size={24} />
      </button>
      <span className="ve-rail-tooltip" role="tooltip">
        {label}
      </span>
    </div>
  );
}
type IconName =
  | "wand"
  | "eye"
  | "eyeOff"
  | "trash"
  | "close";
const paths: Record<IconName, string> = {
  wand: "M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M12.2 6.2 11 5M3 21l9-9",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  eyeOff:
    "M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.8M6.4 6.9A16 16 0 0 0 2 12s4 6 10 6a9.7 9.7 0 0 0 3.6-.7",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  close: "M6 6l12 12M18 6L6 18",
};
function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={paths[name]} />
    </svg>
  );
}
