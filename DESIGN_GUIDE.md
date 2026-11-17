# Visual AI Editor — Design Guide

## Design intent

Visual AI Editor turns a live page into a lightweight editing surface. A person can select an element, describe the change in everyday language, and let AI apply a focused CSS or text update directly to that element.

The product should feel like a calm design assistant, not a full design tool. Its interface stays out of the way until it is needed, then gives clear feedback about what is selected, what will change, and how to undo or remove a change.

## Core principles

### Edit in context

All edits happen on the real page. The user sees the selected element in its actual layout, content, and responsive context rather than in a separate editor or preview.

### Keep the interface small

The control rail contains only the actions needed to manage the editor: show or hide markers, apply pending changes, and clear saved changes. The annotation popup contains one request field and one primary AI action.

Avoid adding format pickers, advanced modes, or secondary workflows unless they solve a clear user problem.

### Let AI choose the implementation

Users describe the result they want, not the technical format. The AI returns only the smallest appropriate combination of:

- CSS properties for visual changes
- Plain replacement text for copy changes

The editor does not expose CSS, Tailwind, or text-mode tabs. This keeps the interaction focused on the outcome.

### Make every state understandable

The selected element receives a visible highlight. Existing edits are represented by markers. A marker can be opened to review the applied patch, undo it, or delete it.

Errors should explain the next useful action. For example, if a model response cannot be interpreted as a safe edit, ask the user to rephrase rather than failing silently.

### Preserve user work

Applied edits and their annotations are saved through the editor endpoint. On refresh, the editor restores both the change and its marker. An annotation remains until the user deletes it or clears all edits.

## Interaction flow

1. The user opens the editor from the control rail.
2. Hovering shows which page element will be selected.
3. Clicking an element opens the annotation popup near that element.
4. The user describes the desired change and chooses **Apply with AI**.
5. The editor validates and applies a safe CSS/text patch.
6. The change is saved and remains available through an annotation marker.
7. The user can undo a change, delete an annotation, or clear all saved edits.

## Popup behavior

The annotation popup must always stay inside the viewport.

- It is horizontally clamped with a consistent screen inset.
- Its height is limited to the available space below its position.
- Overflow scrolls inside the popup rather than outside the browser window.
- The textarea has a fixed height and is not manually resizable.
- Opening uses a subtle spring motion; closing uses the reverse motion before the popup unmounts.

Motion should communicate cause and effect, never delay work. Respect reduced-motion preferences where they are supported.

## AI response contract

The model is asked to return a small JSON patch. A typical color request should produce:

```json
{
  "css": {
    "color": "#2563eb"
  }
}
```

A copy request should produce:

```json
{
  "content": "A clearer headline"
}
```

For resilience, the client can also interpret safe fenced JSON, direct CSS objects, and CSS declarations. All model output is validated before application. Scripts, URLs, imports, and unsafe CSS values are rejected.

## Visual language

- Use dark, compact surfaces for editor controls so they remain distinct from the host page.
- Use a single blue accent for selection, active states, markers, and primary actions.
- Prefer small rounded corners, subdued borders, and low-contrast secondary text.
- Keep tooltips short and action-oriented.
- Use clear labels such as **Apply with AI**, **Undo**, **Delete**, and **Clear**.

The editor should look intentional on any host page without attempting to imitate the host product’s design system.

## Accessibility expectations

- Controls must have accessible names and keyboard focus states.
- The annotation popup uses dialog semantics and supports Escape to close.
- Enter submits the request; Shift+Enter creates a new line.
- Disabled states should be visually and semantically apparent.
- Decorative highlights and markers should not interrupt screen-reader navigation.

## Boundaries

This editor is for focused visual and text adjustments. It does not change application behavior, navigation, data, authentication, or page structure. Changes should remain minimal, reversible, and tied to a concrete selected element.
