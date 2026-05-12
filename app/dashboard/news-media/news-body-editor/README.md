# NewsBodyEditor

This folder contains the local implementation of the news body rich text editor.

The public import surface is still:

```tsx
import { NewsBodyEditor } from "./news-body-editor";
```

That works because [news-body-editor.tsx](/D:/ChristianGutierrez/ipay/app/dashboard/news-media/news-body-editor.tsx) is a thin shim that re-exports [index.tsx](/D:/ChristianGutierrez/ipay/app/dashboard/news-media/news-body-editor/index.tsx).

## Goals Of The Refactor

- Keep the editor feature local to `news-media`
- Reduce the original single-file size without splitting into too many thin files
- Keep behavior, DOM structure, and CSS classes unchanged
- Make the extension layer, state layer, and UI layer easier to work with

## Current Structure

```text
app/dashboard/news-media/
  news-body-editor.tsx                # public shim export
  news-body-editor/
    README.md                         # this file
    index.tsx                         # main editor component and main toolbar/menu UI
    extensions.ts                     # Tiptap extension list and table/image-related editor config
    types.ts                          # editor-local types
    utils.ts                          # pure editor helpers and ProseMirror/Tiptap utilities
    components/
      bubble-menus.tsx                # text, table, link, and image bubble menu UI plus color menu content
      icons.tsx                       # custom SVG icons only
      ImageUrlModal.tsx               # modal for inserting an image by URL
      primitives.tsx                  # shared editor UI primitives
      TableInsertPicker.tsx           # table size picker UI
    hooks/
      use-can-hover.ts                # hover capability detection
      use-editor-menu-state.ts        # dropdown/bubble open-state
      use-font-actions.ts             # font/color actions
      use-image-actions.ts            # image upload + image editing actions
      use-news-body-editor.ts         # main controller hook
      use-table-cell-actions.ts       # table cell actions and stateful cell editing helpers
```

## How The Module Is Split

### `index.tsx`

This is the main composition file.

It is responsible for:

- creating the editor controller with `useNewsBodyEditor`
- rendering the top menu bar
- rendering the menu-bar fullscreen shortcut on the far right
- rendering the fullscreen editor shell
- rendering the single-line toolbar row, including inline overflow dropdown behavior
- rendering `EditorContent`
- rendering toolbar color menus and their inline picker views
- wiring the hidden file input for image uploads
- wiring the Tiptap `BubbleMenu` instances
- enforcing bubble precedence for text selection vs linked text preview
- wiring the link insert/edit bubble flow
- rendering `ImageUrlModal`

If you need to add a new top-level menu item, toolbar button, or toolbar dropdown, this is usually the first file to change.

The toolbar behavior is intentionally split by layout:

- in the normal inline editor, the toolbar stays on one line and moves secondary controls into a right-side overflow dropdown
- in fullscreen mode, the same secondary controls stay visible inline on the toolbar row
- if inline width gets tight, the primary toolbar strip scrolls horizontally instead of wrapping

### `hooks/use-news-body-editor.ts`

This is the controller for the whole feature.

It is responsible for:

- creating the Tiptap editor instance
- subscribing to editor state with `useEditorState`
- deriving the editor snapshot used by the UI
- debouncing document-color palette extraction so full document scans stay off the typing hot path
- owning link bubble insert/edit state and selection targets
- owning fullscreen state and body scroll locking
- composing the focused hooks:
  - `useEditorMenuState`
  - `useFontActions`
  - `useImageUploadState`
  - `useImageActions`
  - `useTableCellActions`
- exposing a single controller object back to `index.tsx`

This is the file to update when a new extension needs:

- derived active-state for the UI
- a new command wrapper
- new editor-level effects
- new refs or cross-feature coordination
- new link bubble behavior or save semantics

### `extensions.ts`

This is the Tiptap schema/config layer.

It is responsible for:

- the extension array returned by `createNewsBodyEditorExtensions`
- registering text-style functionality such as alignment and line height
- custom table cell/header behavior
- enabling TableKit column resizing on the table node
- file-drop and paste image handling
- explicit link extension behavior such as autolink and paste-linking
- exported plugin keys used by the bubble menus
- exported image MIME-type allowlist

If you add a new Tiptap extension, this is the primary place to register it.

Table width behavior is intentionally owned by Tiptap:

- `TableKit.configure({ table: { resizable: true, renderWrapper: true } })` enables the resize node view
- newly inserted tables are normalized to `width: 100%`, so they start at the full editor width with evenly split columns
- typing inside table cells is expected to wrap within the current column width, including long unbroken strings
- saved table widths live in the table/cell attrs that Tiptap manages, especially `colwidth`
- manual column resizing is still supported and saved after insertion
- HTML export uses Tiptap's `<colgroup>` plus table `width` or `min-width`
- the public renderer in `app/news-media/news-article-body.tsx` mirrors that same width model when rendering saved JSON
- existing saved tables are not retroactively normalized; the equal-width default only applies to newly inserted tables

### `utils.ts`

This file holds pure helpers that should not own React state.

Examples:

- table geometry and selection helpers
- image insertion helpers
- text style helpers
- heading helpers
- DOM anchor helpers for menus
- parsing and normalization helpers

If new editor behavior needs document inspection, selection math, or value normalization, it should usually go here instead of inside a React component.

### `components/bubble-menus.tsx`

This file groups the tightly coupled bubble/menu UI:

- `ColorMenuContent`
- inline color picker replacement views
- `TextSelectionBubbleMenu`
- `LinkBubbleMenu`
- `LinkPreviewBubble`
- `TableBubbleMenu`
- table cell properties panel
- `ImageBubbleMenu`

This file exists separately because the bubble UIs are large and stateful enough to justify a dedicated file, but they are still tightly coupled to one another.

### `components/primitives.tsx`

This file contains reusable editor-only UI building blocks such as:

- `ToolbarButton`
- `ToolbarMenuButton`
- `ToolbarSplitMenuButton`
- `MenuItem`
- `SubmenuItem`
- `ColorGrid`
- menu panels and separators

If you need a new editor-specific button or menu primitive that will be reused across the editor UI, add it here.

### `components/TableInsertPicker.tsx`

This is a standalone table size picker with its own internal hover/input behavior.

### `components/ImageUrlModal.tsx`

This is a standalone modal for inserting images by URL.

### `components/icons.tsx`

This file is intentionally narrow now. It only contains custom SVG icon components that are specific to this editor.

### `hooks/use-editor-menu-state.ts`

Owns open/close state for:

- top menus
- toolbar overflow dropdown and its nested toolbar submenus
- table bubble submenus
- table properties submenu
- image bubble submenus
- cell properties submenu
- inline color picker replacement views
- image alt editor mode
- cross-menu closing used before fullscreen transitions

If you add a new dropdown or bubble submenu state, it probably belongs here.

### `hooks/use-font-actions.ts`

Owns commands for:

- font size
- font family
- line height
- text color
- background color
- direct color application for toolbar and table/cell picker views

### `hooks/use-image-actions.ts`

This file owns both image upload state and image editing actions.

It contains:

- upload-from-computer flow
- URL modal state
- hidden file input ref
- upload/insert helpers
- selected image alt editing
- selected image alignment/size updates
- delete image action

### `hooks/use-table-cell-actions.ts`

Owns table-cell-specific logic such as:

- selected cell attribute updates
- selected table border color and width updates
- merge and split actions
- row/column selection helpers
- header toggles
- cell padding input state and commit behavior
- cell background and alignment actions

## Mental Model

Think of the editor in 4 layers:

1. `extensions.ts`
   This defines what the editor can do at the schema/extension level.
2. `utils.ts`
   This defines how we inspect and normalize editor state.
3. `hooks/`
   This defines the stateful behavior and command orchestration.
4. `index.tsx` and `components/`
   This defines how the editor is rendered and how users trigger commands.

## Where To Change Things

### Add a new Tiptap extension

Usually touch these files:

- [extensions.ts](/D:/ChristianGutierrez/ipay/app/dashboard/news-media/news-body-editor/extensions.ts)
  Register the extension in `createNewsBodyEditorExtensions`.
- [utils.ts](/D:/ChristianGutierrez/ipay/app/dashboard/news-media/news-body-editor/utils.ts)
  Add selectors or parsing helpers if the UI needs to inspect the new extension state.
- [hooks/use-news-body-editor.ts](/D:/ChristianGutierrez/ipay/app/dashboard/news-media/news-body-editor/hooks/use-news-body-editor.ts)
  Expose derived state or command wrappers to the UI.
- [index.tsx](/D:/ChristianGutierrez/ipay/app/dashboard/news-media/news-body-editor/index.tsx)
  Add toolbar/menu buttons if the user needs to trigger it.
- [components/bubble-menus.tsx](/D:/ChristianGutierrez/ipay/app/dashboard/news-media/news-body-editor/components/bubble-menus.tsx)
  Only if the feature belongs in a bubble menu.

### Add a new toolbar button

Usually touch:

- `index.tsx`
- `hooks/use-news-body-editor.ts` if you need a new controller command
- `utils.ts` if you need a derived active state

### Add a new top-level menu item

Usually touch:

- `index.tsx`
- `hooks/use-editor-menu-state.ts` if it needs new open-state
- `hooks/use-news-body-editor.ts` if it needs a new command or derived state

### Fullscreen Mode

The `View -> Fullscreen Mode` option and the top-right menu bar fullscreen button are implemented as editor-local state.

Key behavior:

- the same Tiptap editor instance is reused in inline and fullscreen layouts
- fullscreen is a fixed overlay above the dashboard chrome
- page scroll is locked while fullscreen is open
- the editable content is centered to the same width used by the published article page
- both fullscreen entry points use the same toggle path, so menu state and overlay behavior stay in sync

The article-width classes are shared through [app/lib/news-article-layout.ts](/D:/ChristianGutierrez/ipay/app/lib/news-article-layout.ts) so the editor and reader page do not drift apart over time.

### Add a new table action

Usually touch:

- `hooks/use-table-cell-actions.ts`
- `components/bubble-menus.tsx`
- `utils.ts` if table geometry or selection inspection is required

### Add a new image action

Usually touch:

- `hooks/use-image-actions.ts`
- `components/bubble-menus.tsx`
- `index.tsx` only if it affects the toolbar or modal wiring

## Recommended Workflow For New Extensions

When adding a new Tiptap extension, work in this order:

1. Add the extension in `extensions.ts`.
2. Confirm whether the feature needs custom schema attributes, custom renderHTML logic, or file/paste handling.
3. Add any document-reading helpers to `utils.ts`.
4. Expose any active state or command wrappers from `use-news-body-editor.ts`.
5. Add the UI trigger in `index.tsx` or `components/bubble-menus.tsx`.
6. If the feature needs a separate state domain, add or extend a focused hook in `hooks/`.

## File Boundary Rules

Use these rules when changing this folder:

- Keep custom hooks separate when they own meaningful state or logic.
- Keep pure document/selection helpers in `utils.ts`.
- Keep editor schema/config in `extensions.ts`.
- Prefer adding tightly coupled menu/toolbar UI to `index.tsx` instead of creating a new thin file.
- Only create a new component file if it has meaningful local state, substantial internal markup, or clear independent complexity.
- Do not move editor-local pieces into shared folders unless they are genuinely reused outside this feature.

## What Not To Change Casually

- The public props of `NewsBodyEditor`: `initialContent` and `onChange`
- CSS class names used by the editor
- DOM structure relied on by existing styles or menu positioning
- plugin keys in `extensions.ts` unless the related bubble menu wiring is updated too

## Short Practical Examples

### Example: add a `Highlight` extension

Likely steps:

1. Register `Highlight` in `extensions.ts`.
2. In `use-news-body-editor.ts`, expose whether highlight is active and a command to toggle it.
3. In `index.tsx`, add a toolbar button and/or menu item.
4. If highlight uses a color palette, reuse `ColorMenuContent` or extend `use-font-actions.ts` only if the behavior is truly part of the font/color domain.

### Example: add a custom inline node with its own bubble actions

Likely steps:

1. Add the node/extension in `extensions.ts`.
2. Add selection detection helpers in `utils.ts`.
3. Expose selected-node state from `use-news-body-editor.ts`.
4. If the bubble UI is substantial and tightly coupled, add it to `components/bubble-menus.tsx`.
5. Only create a new file if that bubble UI becomes independently complex.

## Summary

The current structure is intentionally:

- one main composition file: `index.tsx`
- one extension/config file: `extensions.ts`
- one pure helper file: `utils.ts`
- a small set of focused hooks
- a small set of justified editor-local components

That should give you a predictable place to add new Tiptap features without drifting back to either a single 4000-line file or too many tiny files.
