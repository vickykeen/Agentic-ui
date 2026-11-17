import * as react from 'react';
import { ReactNode, CSSProperties, InputHTMLAttributes } from 'react';

type UiPatch = {
    css: Record<string, string>;
    content?: string;
};

type ElementAnnotation = {
    selector: string;
    tagName: string;
    text: string;
    /** Exact text highlighted by the user before annotating, when present. */
    selectedText?: string;
    componentHint: string;
    /** Explicit test/component hooks make annotations easier for an agent to locate. */
    attributes?: Record<string, string>;
    classNames?: string;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** Truncated outerHTML so the model can see real structure and classes. */
    html: string;
    /** A few computed styles so the model knows the current look. */
    styles: Record<string, string>;
};
type AiRequest = {
    instruction: string;
    selection: ElementAnnotation;
};

type SavedEdit = {
    selector: string;
    instruction?: string;
    patch: UiPatch;
};
type VisualEditorProps = {
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
/** Click-to-annotate overlay: pin notes on elements, then let AI edit the live UI. */
declare function VisualEditor({ children, onAskAi: customAskAi, onApplied, endpoint, persist, }: VisualEditorProps): react.JSX.Element;
/** Applies saved edits to the current page. Returns how many elements were updated. */
declare function applySavedEdits(edits: SavedEdit[]): number;
/** Drop into your production app: <SavedEdits edits={editsJson} /> */
declare function SavedEdits({ edits }: {
    edits: SavedEdit[];
}): null;

type AnnotationPopupProps = {
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
/** A dependency-free annotation form, suitable for visual feedback tools and editor overlays. */
declare function AnnotationPopup({ element, selectedText, computedStyles, value, placeholder, disabled, accentColor, onChange, onCancel, onSubmit, beforeField, afterField, footer, style, surfaceState, className, positioning, directEntry, }: AnnotationPopupProps): react.JSX.Element;

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    /** Uses the same light/dark appearance as the annotation components. */
    theme?: "light" | "dark";
}
/** A compact accessible checkbox with a CSS-free animated checkmark. */
declare function Checkbox({ className, checked, onChange, theme, disabled, ...props }: CheckboxProps): react.JSX.Element;

type AnnotationMarkerStatus = "draft" | "noted" | "pending" | "applied" | "failed";
type AnnotationMarkerProps = {
    index: number;
    status: AnnotationMarkerStatus;
    x: number;
    y: number;
    onClick: () => void;
};
/** Animated, status-aware marker used to reopen an annotation. */
declare function AnnotationMarker({ index, status, x, y, onClick, }: AnnotationMarkerProps): react.JSX.Element;

export { type AiRequest, AnnotationMarker, type AnnotationMarkerProps, type AnnotationMarkerStatus, AnnotationPopup, type AnnotationPopupProps, Checkbox, type CheckboxProps, type ElementAnnotation, type SavedEdit, SavedEdits, type UiPatch, VisualEditor, type VisualEditorProps, applySavedEdits };
