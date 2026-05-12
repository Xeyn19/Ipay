import { CellSelection, TableMap } from "@tiptap/pm/tables";
import type { Editor, JSONContent } from "@tiptap/react";
import type {
  MarkType,
  Node as ProseMirrorNode,
  ResolvedPos,
} from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";
import type { TextStyleAttributes as TiptapTextStyleAttributes } from "@tiptap/extension-text-style";
import {
  DEFAULT_HIGHLIGHT_COLOR,
  collectDocumentTextStyleColors,
  normalizeTextStyleAttributes,
  type NewsBodyTextStyleAttributes,
} from "@/app/lib/news-body-text-styles";
import {
  normalizeNewsBodyImageAlignment,
  normalizeNewsBodyImageWidth,
} from "@/app/lib/news-body-images";
import { NEWS_TABLE_OF_CONTENTS_NODE_NAME } from "@/app/lib/news-body-table-of-contents";
import type {
  ActiveTableContext,
  HeadingLevel,
  ImageInsertTarget,
  LinkBubbleTarget,
  LinkSelectionSnapshot,
  MergeDirection,
  MergeDirectionAvailability,
  SelectedImageState,
  SelectedLinkState,
  TableAxis,
  TableCellHorizontalAlignment,
  TableCellSelectionState,
  TableCellStyleAttributes,
  TableGeometry,
  TextAlignment,
} from "./types";

export function parseTableCellHorizontalAlignment(
  value: unknown,
): TableCellHorizontalAlignment | null {
  return value === "left" ||
    value === "center" ||
    value === "right" ||
    value === "justify"
    ? value
    : null;
}

export function normalizeTableCellPaddingValue(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^\d+(?:\.\d+)?px$/i.test(trimmed)) {
    return null;
  }

  const parsed = Number.parseFloat(trimmed);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  const normalized = Number.isInteger(parsed)
    ? parsed
    : Number(parsed.toFixed(2));

  return `${normalized}px`;
}

export function getTableCellPaddingInputValue(value: string | null | undefined) {
  const normalized = normalizeTableCellPaddingValue(value);

  if (!normalized) {
    return "";
  }

  return normalized.slice(0, -2);
}

export function getTableCellStyleAttributes(
  node: ProseMirrorNode | null,
): TableCellStyleAttributes {
  if (!node) {
    return {
      backgroundColor: null,
      horizontalAlign: null,
      padding: null,
    };
  }

  return {
    backgroundColor:
      typeof node.attrs.backgroundColor === "string"
        ? node.attrs.backgroundColor
        : null,
    horizontalAlign: parseTableCellHorizontalAlignment(node.attrs.horizontalAlign),
    padding: normalizeTableCellPaddingValue(node.attrs.padding),
  };
}

export function buildTableCellStyleValue(
  attributes: TableCellStyleAttributes,
  existingStyle: string | null | undefined,
) {
  const styles: string[] = [];

  if (existingStyle?.trim()) {
    styles.push(existingStyle.trim().replace(/;$/, ""));
  }

  if (attributes.backgroundColor) {
    styles.push(`background-color: ${attributes.backgroundColor}`);
  }

  if (attributes.padding) {
    styles.push(`padding: ${attributes.padding}`);
  }

  if (attributes.horizontalAlign) {
    styles.push(`text-align: ${attributes.horizontalAlign}`);
  }

  return styles.length > 0 ? styles.join("; ") : undefined;
}

export const tableCellAttributeConfig = {
  backgroundColor: {
    default: null,
    parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
    rendered: false,
  },
  horizontalAlign: {
    default: null,
    parseHTML: (element: HTMLElement) =>
      parseTableCellHorizontalAlignment(element.style.textAlign),
    rendered: false,
  },
  padding: {
    default: null,
    parseHTML: (element: HTMLElement) =>
      normalizeTableCellPaddingValue(element.style.padding),
    rendered: false,
  },
};

export function clampTableDimension(value: number) {
  return Math.min(10, Math.max(1, value));
}

export function parseTableDimensionInput(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return clampTableDimension(parsed);
}

export function getTableRole(node: ProseMirrorNode | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (node?.type?.spec as any)?.tableRole as string | undefined;
}

export function getActiveTableContext(editor: Editor | null): ActiveTableContext {
  if (!editor) {
    return {
      activeCellPos: null,
      activeTablePos: null,
      tableActive: false,
    };
  }

  const { selection } = editor.state;
  let activeCellPos: number | null = null;
  let activeTablePos: number | null = null;

  for (let depth = selection.$anchor.depth; depth > 0; depth -= 1) {
    const node = selection.$anchor.node(depth);
    const tableRole = getTableRole(node);

    if (
      activeCellPos === null &&
      (tableRole === "cell" || tableRole === "header_cell")
    ) {
      activeCellPos = selection.$anchor.before(depth);
    }

    if (tableRole === "table") {
      activeTablePos = selection.$anchor.before(depth);
      break;
    }
  }

  return {
    activeCellPos,
    activeTablePos,
    tableActive: activeTablePos !== null,
  };
}

export function getActiveTableElement(editor: Editor | null, tablePos: number | null) {
  if (!editor || tablePos === null) {
    return null;
  }

  const nodeDom = editor.view.nodeDOM(tablePos);

  if (!(nodeDom instanceof HTMLElement)) {
    return null;
  }

  const wrapper =
    nodeDom.classList.contains("tableWrapper")
      ? nodeDom
      : nodeDom.closest(".tableWrapper");

  if (wrapper instanceof HTMLElement) {
    return wrapper;
  }

  if (nodeDom instanceof HTMLTableElement) {
    return nodeDom;
  }

  const table = nodeDom.querySelector("table");

  return table instanceof HTMLElement ? table : nodeDom;
}

export function getTableBubbleAnchorRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const centerX = (rect.left + rect.right) / 2;

  if (typeof DOMRect !== "undefined" && typeof DOMRect.fromRect === "function") {
    return DOMRect.fromRect({
      x: centerX,
      y: rect.top,
      width: 0,
      height: 0,
    });
  }

  return {
    x: centerX,
    y: rect.top,
    width: 0,
    height: 0,
    top: rect.top,
    right: centerX,
    bottom: rect.top,
    left: centerX,
    toJSON: () => ({}),
  };
}

export function isHeaderCellNode(node: ProseMirrorNode | null) {
  return getTableRole(node) === "header_cell";
}

export function getTableStructure(doc: ProseMirrorNode, tablePos: number | null) {
  if (tablePos === null) {
    return null;
  }

  const tableNode = doc.nodeAt(tablePos);

  if (!tableNode || getTableRole(tableNode) !== "table") {
    return null;
  }

  return {
    tableMap: TableMap.get(tableNode),
    tableNode,
  };
}

export function getTableGeometry(
  doc: ProseMirrorNode,
  tablePos: number | null,
  cellPos: number | null,
): TableGeometry | null {
  if (tablePos === null || cellPos === null) {
    return null;
  }

  const tableStructure = getTableStructure(doc, tablePos);

  if (!tableStructure) {
    return null;
  }

  const relativeCellPos = cellPos - (tablePos + 1);

  if (relativeCellPos <= 0) {
    return null;
  }

  const { tableMap, tableNode } = tableStructure;
  let cellRect: TableGeometry["cellRect"];

  try {
    cellRect = tableMap.findCell(relativeCellPos);
  } catch {
    return null;
  }

  return {
    cellRect,
    tableMap,
    tableNode,
  };
}

export function isHeaderAxisActive(
  doc: ProseMirrorNode,
  tablePos: number | null,
  axis: TableAxis,
) {
  const tableStructure = getTableStructure(doc, tablePos);

  if (!tableStructure || tablePos === null) {
    return false;
  }

  const { tableMap } = tableStructure;
  const rect =
    axis === "columns"
      ? {
          bottom: tableMap.height,
          left: 0,
          right: 1,
          top: 0,
        }
      : {
          bottom: 1,
          left: 0,
          right: tableMap.width,
          top: 0,
        };

  const cells = tableMap.cellsInRect(rect);

  return (
    cells.length > 0 &&
    cells.every((relativePos) =>
      isHeaderCellNode(doc.nodeAt(tablePos + 1 + relativePos)),
    )
  );
}

export function getAdjacentCellPos(
  doc: ProseMirrorNode,
  tablePos: number | null,
  cellPos: number | null,
  direction: MergeDirection,
) {
  const tableGeometry = getTableGeometry(doc, tablePos, cellPos);

  if (!tableGeometry || tablePos === null) {
    return null;
  }

  let targetRow = tableGeometry.cellRect.top;
  let targetColumn = tableGeometry.cellRect.left;

  if (direction === "up") {
    targetRow = tableGeometry.cellRect.top - 1;
  }

  if (direction === "right") {
    targetColumn = tableGeometry.cellRect.right;
  }

  if (direction === "down") {
    targetRow = tableGeometry.cellRect.bottom;
  }

  if (direction === "left") {
    targetColumn = tableGeometry.cellRect.left - 1;
  }

  if (
    targetRow < 0 ||
    targetColumn < 0 ||
    targetRow >= tableGeometry.tableMap.height ||
    targetColumn >= tableGeometry.tableMap.width
  ) {
    return null;
  }

  const relativePos =
    tableGeometry.tableMap.map[
      targetRow * tableGeometry.tableMap.width + targetColumn
    ];

  if (typeof relativePos !== "number") {
    return null;
  }

  return tablePos + 1 + relativePos;
}

export function getMergeDirectionAvailability(
  doc: ProseMirrorNode,
  tablePos: number | null,
  cellPos: number | null,
): MergeDirectionAvailability {
  return {
    down: getAdjacentCellPos(doc, tablePos, cellPos, "down") !== null,
    left: getAdjacentCellPos(doc, tablePos, cellPos, "left") !== null,
    right: getAdjacentCellPos(doc, tablePos, cellPos, "right") !== null,
    up: getAdjacentCellPos(doc, tablePos, cellPos, "up") !== null,
  };
}

export function getHeadingLabel(value: "paragraph" | HeadingLevel) {
  if (value === "paragraph") {
    return "Paragraph";
  }

  return `Heading ${value}`;
}

export function getCurrentHeading(editor: Editor | null): "paragraph" | HeadingLevel {
  if (!editor) {
    return "paragraph";
  }

  for (const level of [1, 2, 3, 4, 5, 6] as const) {
    if (editor.isActive("heading", { level })) {
      return level;
    }
  }

  return "paragraph";
}

export function applyHeading(
  editor: Editor | null,
  value: "paragraph" | HeadingLevel,
) {
  if (!editor) {
    return;
  }

  if (value === "paragraph") {
    editor.chain().focus().setParagraph().run();
    return;
  }

  editor.chain().focus().setHeading({ level: value }).run();
}

export function getCurrentTextAlignment(editor: Editor | null): TextAlignment {
  if (!editor) {
    return null;
  }

  if (editor.isActive("heading")) {
    const textAlign = editor.getAttributes("heading").textAlign;
    return typeof textAlign === "string" ? (textAlign as TextAlignment) : null;
  }

  const textAlign = editor.getAttributes("paragraph").textAlign;
  return typeof textAlign === "string" ? (textAlign as TextAlignment) : null;
}

export function getCurrentTextStyle(
  editor: Editor | null,
): NewsBodyTextStyleAttributes | null {
  if (!editor) {
    return null;
  }

  const attributes = editor.getAttributes(
    "textStyle",
  ) as TiptapTextStyleAttributes;

  return normalizeTextStyleAttributes({
    backgroundColor:
      typeof attributes.backgroundColor === "string"
        ? attributes.backgroundColor
        : null,
    color: typeof attributes.color === "string" ? attributes.color : null,
    fontFamily:
      typeof attributes.fontFamily === "string" ? attributes.fontFamily : null,
    fontSize:
      typeof attributes.fontSize === "string" ? attributes.fontSize : null,
  });
}

export function getCurrentHighlightColor(editor: Editor | null) {
  if (!editor || !editor.isActive("highlight")) {
    return null;
  }

  const { color } = editor.getAttributes("highlight") as { color?: unknown };

  return typeof color === "string" && color.trim()
    ? color
    : DEFAULT_HIGHLIGHT_COLOR;
}

function createZeroWidthRect(x: number, y: number) {
  if (typeof DOMRect !== "undefined" && typeof DOMRect.fromRect === "function") {
    return DOMRect.fromRect({
      x,
      y,
      width: 0,
      height: 0,
    });
  }

  return {
    x,
    y,
    width: 0,
    height: 0,
    top: y,
    right: x,
    bottom: y,
    left: x,
    toJSON: () => ({}),
  };
}

export function getLinkBubbleAnchorRect(
  editor: Editor | null,
  target: LinkBubbleTarget | null,
) {
  if (!editor || !target) {
    return null;
  }

  const { from, to } = target;

  try {
    if (from === to) {
      const caret = editor.view.coordsAtPos(from);
      return createZeroWidthRect(caret.left, caret.top);
    }

    const start = editor.view.coordsAtPos(from);
    const end = editor.view.coordsAtPos(to);
    const centerX = (start.left + end.right) / 2;
    const top = Math.min(start.top, end.top);

    return createZeroWidthRect(centerX, top);
  } catch {
    return null;
  }
}

function getLinkRangeAtResolvedPos(
  $pos: ResolvedPos,
  markType: MarkType,
) {
  const start =
    $pos.parent.childAfter($pos.parentOffset).node &&
    markType.isInSet($pos.parent.childAfter($pos.parentOffset).node?.marks ?? [])
      ? $pos.parent.childAfter($pos.parentOffset)
      : $pos.parent.childBefore($pos.parentOffset);

  if (!start.node) {
    return null;
  }

  const mark = start.node.marks.find((currentMark) => currentMark.type === markType);

  if (!mark) {
    return null;
  }

  let startIndex = start.index;
  let startPos = $pos.start() + start.offset;
  let endIndex = startIndex + 1;
  let endPos = startPos + start.node.nodeSize;

  while (
    startIndex > 0 &&
    mark.isInSet($pos.parent.child(startIndex - 1).marks)
  ) {
    startIndex -= 1;
    startPos -= $pos.parent.child(startIndex).nodeSize;
  }

  while (
    endIndex < $pos.parent.childCount &&
    mark.isInSet($pos.parent.child(endIndex).marks)
  ) {
    endPos += $pos.parent.child(endIndex).nodeSize;
    endIndex += 1;
  }

  return {
    from: startPos,
    mark,
    to: endPos,
  };
}

export function getSelectedLinkState(editor: Editor | null): SelectedLinkState | null {
  if (!editor || !editor.isActive("link")) {
    return null;
  }

  const markType = editor.state.schema.marks.link;

  if (!markType) {
    return null;
  }

  const { selection } = editor.state;
  const range =
    getLinkRangeAtResolvedPos(selection.$from, markType) ??
    getLinkRangeAtResolvedPos(selection.$to, markType);

  if (!range) {
    return null;
  }

  const href = range.mark.attrs.href;

  if (typeof href !== "string" || href.trim().length === 0) {
    return null;
  }

  return {
    from: range.from,
    href: href.trim(),
    text: editor.state.doc.textBetween(range.from, range.to, " ").trim(),
    to: range.to,
  };
}

export function getLinkSelectionSnapshot(
  editor: Editor | null,
): LinkSelectionSnapshot | null {
  if (!editor) {
    return null;
  }

  const {
    selection: { from, to },
    doc,
  } = editor.state;

  return {
    from,
    selectedLink: getSelectedLinkState(editor),
    text: from === to ? "" : doc.textBetween(from, to, " "),
    to,
  };
}

export function normalizeLinkUrl(
  value: string,
  {
    allowBareDomain,
  }: {
    allowBareDomain: boolean;
  },
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const prefixedValue =
    allowBareDomain &&
    !/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) &&
    /^[^\s]+\.[^\s]+$/i.test(trimmed)
      ? `https://${trimmed}`
      : trimmed;

  try {
    const url = new URL(prefixedValue);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function shouldAutoLinkUrl(value: string) {
  const normalized = normalizeLinkUrl(value, { allowBareDomain: false });

  return normalized !== null && /^https?:\/\//i.test(value.trim());
}

export function getSelectionComputedFontSize(editor: Editor | null) {
  if (!editor || typeof window === "undefined") {
    return null;
  }

  const selection = window.getSelection();
  const root = editor.view.dom;

  if (!selection?.anchorNode) {
    return null;
  }

  let element =
    selection.anchorNode.nodeType === Node.TEXT_NODE
      ? selection.anchorNode.parentElement
      : selection.anchorNode instanceof HTMLElement
        ? selection.anchorNode
        : null;

  while (element && !root.contains(element)) {
    element = element.parentElement;
  }

  const target = element && root.contains(element) ? element : root;
  const computedFontSize = window.getComputedStyle(target).fontSize;
  const parsed = Number.parseFloat(computedFontSize);

  return Number.isFinite(parsed) ? parsed : null;
}

export function getColorInputValue(
  value: string | null | undefined,
  fallback: string,
) {
  if (value && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())) {
    return value.trim();
  }

  return fallback;
}

export function collectDocumentEditorColors(body: JSONContent | null | undefined) {
  const textStyleColors = collectDocumentTextStyleColors(body);
  const backgroundColors = [...textStyleColors.backgroundColors];
  const seenBackgroundColors = new Set(
    backgroundColors.map((color) => color.trim().toLowerCase()),
  );

  function visit(node: JSONContent | undefined) {
    if (!node) {
      return;
    }

    if (
      (node.type === "tableCell" || node.type === "tableHeader") &&
      typeof node.attrs?.backgroundColor === "string"
    ) {
      const color = node.attrs.backgroundColor.trim();
      const normalized = color.toLowerCase();

      if (color && !seenBackgroundColors.has(normalized)) {
        seenBackgroundColors.add(normalized);
        backgroundColors.push(color);
      }
    }

    for (const child of node.content ?? []) {
      visit(child);
    }
  }

  visit(body ?? undefined);

  return {
    backgroundColors: backgroundColors.slice(0, 5),
    textColors: textStyleColors.textColors,
  };
}

export function getSelectedTableCellPositions(
  editor: Editor | null,
  tablePos: number | null,
  activeCellPos: number | null,
) {
  if (!editor || activeCellPos === null) {
    return [];
  }

  const { selection } = editor.state;

  if (!(selection instanceof CellSelection) || tablePos === null) {
    return [activeCellPos];
  }

  const tableStructure = getTableStructure(editor.state.doc, tablePos);

  if (!tableStructure) {
    return [activeCellPos];
  }

  const anchorCellPos = selection.$anchorCell.pos - (tablePos + 1);
  const headCellPos = selection.$headCell.pos - (tablePos + 1);
  const rect = tableStructure.tableMap.rectBetween(anchorCellPos, headCellPos);

  return tableStructure.tableMap
    .cellsInRect(rect)
    .map((relativePos) => tablePos + 1 + relativePos);
}

export function getCommonTableCellValue<T>(values: T[], fallback: T) {
  if (values.length === 0) {
    return fallback;
  }

  const [firstValue, ...remainingValues] = values;

  return remainingValues.every((value) => value === firstValue)
    ? firstValue
    : fallback;
}

export function getSelectedTableCellState(
  editor: Editor | null,
  tablePos: number | null,
  activeCellPos: number | null,
): TableCellSelectionState {
  const positions = getSelectedTableCellPositions(editor, tablePos, activeCellPos);

  if (!editor || positions.length === 0) {
    return {
      backgroundColor: null,
      hasBackgroundColor: false,
      horizontalAlign: "left",
      padding: null,
    };
  }

  const cells = positions
    .map((position) => editor.state.doc.nodeAt(position))
    .filter((node): node is ProseMirrorNode => node !== null);
  const styles = cells.map((cell) => getTableCellStyleAttributes(cell));
  const backgroundColors = styles.map((style) => style.backgroundColor ?? null);
  const paddings = styles.map((style) => style.padding ?? null);
  const horizontalAlignments = styles.map(
    (style) => style.horizontalAlign ?? "left",
  );

  return {
    backgroundColor: getCommonTableCellValue(backgroundColors, null),
    hasBackgroundColor: backgroundColors.some((value) => Boolean(value)),
    horizontalAlign: getCommonTableCellValue(horizontalAlignments, "left"),
    padding: getCommonTableCellValue(paddings, null),
  };
}

export function getImageInsertTarget(editor: Editor): ImageInsertTarget {
  const { from, to } = editor.state.selection;

  return from === to ? from : { from, to };
}

export function getSelectedImageState(editor: Editor | null): SelectedImageState | null {
  if (!editor) {
    return null;
  }

  const { selection } = editor.state;

  if (!(selection instanceof NodeSelection) || selection.node.type.name !== "image") {
    return null;
  }

  return {
    alignment: normalizeNewsBodyImageAlignment(selection.node.attrs.alignment),
    alt:
      typeof selection.node.attrs.alt === "string" ? selection.node.attrs.alt : "",
    pos: selection.from,
    src:
      typeof selection.node.attrs.src === "string" ? selection.node.attrs.src : "",
    width: normalizeNewsBodyImageWidth(selection.node.attrs.width),
  };
}

export function hasTableOfContentsNode(editor: Editor | null) {
  if (!editor) {
    return false;
  }

  let found = false;

  editor.state.doc.descendants((node) => {
    if (node.type.name === NEWS_TABLE_OF_CONTENTS_NODE_NAME) {
      found = true;
      return false;
    }

    return true;
  });

  return found;
}

export function getSelectedImageElement(editor: Editor | null) {
  if (!editor) {
    return null;
  }

  return editor.view.dom.querySelector(
    ".news-body-editor__image-wrapper.is-selected .news-body-editor__image-container",
  ) as HTMLElement | null;
}

export function insertImageNode(
  editor: Editor,
  src: string,
  target?: ImageInsertTarget,
) {
  const imageNode = {
    type: "image",
    attrs: {
      alignment: "center",
      alt: "",
      src,
      width: "",
    },
  };

  if (target !== undefined && target !== null) {
    editor.chain().focus().insertContentAt(target, imageNode).run();
    return;
  }

  editor.chain().focus().insertContent(imageNode).run();
}

export function normalizeImageUrl(value: string) {
  try {
    const url = new URL(value.trim());

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}
