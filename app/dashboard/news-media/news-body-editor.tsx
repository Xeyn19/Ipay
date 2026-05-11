"use client";

import "./news-body-editor.css";
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { mergeAttributes } from "@tiptap/core";
import FileHandler from "@tiptap/extension-file-handler";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import TableOfContents from "@tiptap/extension-table-of-contents";
import { TableCell } from "@tiptap/extension-table/cell";
import { TableHeader } from "@tiptap/extension-table/header";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { CellSelection, TableMap } from "@tiptap/pm/tables";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";
import {
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  TextStyle,
  type TextStyleAttributes as TiptapTextStyleAttributes,
} from "@tiptap/extension-text-style";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CaseSensitive,
  ChevronDown,
  Columns3,
  ChevronRight,
  Code2,
  Droplets,
  Eraser,
  Image as ImageIcon,
  ImagePlus as ImagePlusIcon,
  ImageUp,
  Italic,
  Link,
  List,
  ListOrdered,
  MessageSquare,
  Minus,
  PaintBucket,
  Palette,
  Quote,
  Redo2,
  Rows3,
  SquareDashedText,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  TableCellsMerge,
  Table2,
  TextCursorInput,
  Trash2,
  Type,
  Underline,
  Undo2,
} from "lucide-react";
import toast from "react-hot-toast";
import { uploadNewsBodyImage } from "@/app/dashboard/news-media/actions";
import {
  getNewsBodyImageSizeLabel,
  NEWS_BODY_IMAGE_SIZE_PRESETS,
  normalizeNewsBodyImageAlignment,
  normalizeNewsBodyImageWidth,
  type NewsBodyImageAlignment,
} from "@/app/lib/news-body-images";
import {
  collectDocumentTextStyleColors,
  DEFAULT_TEXT_STYLE_COLORS,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  normalizeTextStyleAttributes,
  stepFontSizeValue,
  type NewsBodyTextStyleAttributes,
} from "@/app/lib/news-body-text-styles";
import { NEWS_TABLE_OF_CONTENTS_NODE_NAME } from "@/app/lib/news-body-table-of-contents";
import { EMPTY_NEWS_BODY } from "@/app/lib/news-media";
import { NewsBodyImage } from "./news-body-image-extension";
import { NewsTableOfContents } from "./news-body-table-of-contents-extension";
import { dashboardInputClassName, NewsModal } from "./news-modal";

type NewsBodyEditorProps = {
  initialContent: JSONContent | null;
  onChange: (value: JSONContent) => void;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type TextAlignment = "left" | "right" | "center" | "justify" | null;
type TableCellHorizontalAlignment = Exclude<TextAlignment, null>;
type OpenMenu =
  | "edit"
  | "view"
  | "insert"
  | "format"
  | "heading"
  | "toolbar-font-size"
  | "toolbar-font-family"
  | "toolbar-text-color"
  | "toolbar-background-color"
  | "toolbar-table"
  | null;

type ToolbarButtonProps = {
  ariaLabel: string;
  children: ReactNode;
  disabled?: boolean;
  isActive?: boolean;
  onClick: () => void;
};

type ToolbarMenuButtonProps = {
  ariaLabel: string;
  icon: ReactNode;
  isActive?: boolean;
  isOpen: boolean;
  label?: string;
  swatchColor?: string | null;
  onClick: () => void;
};

type MenuItemProps = {
  children: ReactNode;
  icon?: ReactNode;
  isActive?: boolean;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
};

type ColorGridProps = {
  activeColor?: string | null;
  colors: string[];
  columns: 3 | 5;
  onSelect: (color: string) => void;
};

type TableInsertPickerProps = {
  onInsert: (rows: number, columns: number) => void;
};

type ImageInsertTarget = number | { from: number; to: number } | null;
type TableAxis = "columns" | "rows";
type MergeDirection = "up" | "right" | "down" | "left";
type OpenTableBubbleSubmenu = TableAxis | "merge" | "cell-properties" | null;
type OpenCellPropertiesMenu = "background-color" | null;
type OpenImageBubbleSubmenu = "alignment" | "size" | null;
type ActiveTableContext = {
  activeCellPos: number | null;
  activeTablePos: number | null;
  tableActive: boolean;
};
type SelectedImageState = {
  alignment: NewsBodyImageAlignment;
  alt: string;
  pos: number;
  src: string;
  width: string;
};
type ToolbarSplitMenuButtonProps = {
  ariaLabel: string;
  ariaMenuLabel: string;
  menuDisabled?: boolean;
  icon: ReactNode;
  isOpen: boolean;
  onClick: () => void;
  onMenuClick: () => void;
  primaryDisabled?: boolean;
};
type MenuToggleItemProps = {
  checked: boolean;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
};
type MergeDirectionAvailability = Record<MergeDirection, boolean>;
type TableGeometry = {
  cellRect: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  tableMap: TableMap;
  tableNode: ProseMirrorNode;
};
type TableCellStyleAttributes = {
  backgroundColor?: string | null;
  horizontalAlign?: TableCellHorizontalAlignment | null;
  padding?: string | null;
};
type TableCellSelectionState = {
  backgroundColor: string | null;
  hasBackgroundColor: boolean;
  horizontalAlign: TableCellHorizontalAlignment;
  padding: string | null;
};

const EDITOR_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
const TABLE_PICKER_LIMIT = 10;
const DEFAULT_TABLE_DIMENSION = 3;
const TABLE_BUBBLE_MENU_PLUGIN_KEY = "newsBodyEditorTableBubbleMenu";
const IMAGE_BUBBLE_MENU_PLUGIN_KEY = "newsBodyEditorImageBubbleMenu";
const EMPTY_MERGE_DIRECTION_AVAILABILITY: MergeDirectionAvailability = {
  down: false,
  left: false,
  right: false,
  up: false,
};

const headingOptions: Array<{
  label: string;
  value: "paragraph" | HeadingLevel;
}> = [
  { label: "Paragraph", value: "paragraph" },
  { label: "Heading 1", value: 1 },
  { label: "Heading 2", value: 2 },
  { label: "Heading 3", value: 3 },
  { label: "Heading 4", value: 4 },
  { label: "Heading 5", value: 5 },
  { label: "Heading 6", value: 6 },
];

const topLevelMenus: Array<{
  key: Extract<OpenMenu, "edit" | "view" | "insert" | "format">;
  label: string;
}> = [
  { key: "edit", label: "Edit" },
  { key: "view", label: "View" },
  { key: "insert", label: "Insert" },
  { key: "format", label: "Format" },
];

const textAlignmentOptions: Array<{
  icon: ReactNode;
  label: string;
  value: TableCellHorizontalAlignment;
}> = [
  {
    icon: <AlignLeft className="h-4 w-4" />,
    label: "Align Left",
    value: "left",
  },
  {
    icon: <AlignRight className="h-4 w-4" />,
    label: "Align Right",
    value: "right",
  },
  {
    icon: <AlignCenter className="h-4 w-4" />,
    label: "Align Center",
    value: "center",
  },
  {
    icon: <AlignJustify className="h-4 w-4" />,
    label: "Justify",
    value: "justify",
  },
];

const imageAlignmentOptions: Array<{
  icon: ReactNode;
  label: string;
  value: NewsBodyImageAlignment;
}> = [
  {
    icon: <AlignLeft className="h-4 w-4" />,
    label: "Align left",
    value: "left",
  },
  {
    icon: <AlignCenter className="h-4 w-4" />,
    label: "Align center",
    value: "center",
  },
  {
    icon: <AlignRight className="h-4 w-4" />,
    label: "Align right",
    value: "right",
  },
];

function CellPropertiesGridIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {[
        [5, 5],
        [12, 5],
        [19, 5],
        [5, 12],
        [12, 12],
        [19, 12],
        [5, 19],
        [12, 19],
        [19, 19],
      ].map(([cx, cy]) => (
        <rect
          key={`${cx}-${cy}`}
          x={cx - 2}
          y={cy - 2}
          width="4"
          height="4"
          rx="0.75"
        />
      ))}
    </svg>
  );
}

function TableOfContentsIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 7h14" />
      <path d="M5 12h8" />
      <path d="M5 17h10" />
      <circle cx="18" cy="12" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="16" cy="17" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TaskListIcon({
  className = "h-4 w-4",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4.5" y="5" width="4" height="4" rx="0.9" />
      <path d="m5.7 6.9 1.1 1.2 1.8-2.2" />
      <path d="M11.5 7h8" />
      <rect x="4.5" y="15" width="4" height="4" rx="0.9" />
      <path d="M11.5 17h8" />
    </svg>
  );
}

function parseTableCellHorizontalAlignment(
  value: unknown,
): TableCellHorizontalAlignment | null {
  return value === "left" ||
    value === "center" ||
    value === "right" ||
    value === "justify"
    ? value
    : null;
}

function normalizeTableCellPaddingValue(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/^(\d+(?:\.\d+)?)px$/i);

  if (!match) {
    return null;
  }

  const parsed = Number.parseFloat(match[1]);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  const normalized = Number.isInteger(parsed)
    ? parsed
    : Number(parsed.toFixed(2));

  return `${normalized}px`;
}

function getTableCellPaddingInputValue(value: string | null | undefined) {
  const normalized = normalizeTableCellPaddingValue(value);

  if (!normalized) {
    return "";
  }

  return normalized.slice(0, -2);
}

function getTableCellStyleAttributes(
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

function buildTableCellStyleValue(
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

const tableCellAttributeConfig = {
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

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...tableCellAttributeConfig,
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const { style, ...rest } = HTMLAttributes;
    const nextStyle = buildTableCellStyleValue(
      getTableCellStyleAttributes(node),
      typeof style === "string" ? style : null,
    );

    return [
      "td",
      mergeAttributes(
        this.options.HTMLAttributes,
        rest,
        nextStyle ? { style: nextStyle } : {},
      ),
      0,
    ];
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...tableCellAttributeConfig,
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const { style, ...rest } = HTMLAttributes;
    const nextStyle = buildTableCellStyleValue(
      getTableCellStyleAttributes(node),
      typeof style === "string" ? style : null,
    );

    return [
      "th",
      mergeAttributes(
        this.options.HTMLAttributes,
        rest,
        nextStyle ? { style: nextStyle } : {},
      ),
      0,
    ];
  },
});

function ToolbarButton({
  ariaLabel,
  children,
  disabled = false,
  isActive = false,
  onClick,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isActive}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive
          ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]"
          : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarMenuButton({
  ariaLabel,
  icon,
  isActive = false,
  isOpen,
  label,
  swatchColor,
  onClick,
}: ToolbarMenuButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-expanded={isOpen}
      aria-haspopup="menu"
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 min-w-4 items-center justify-between gap-1.5 rounded-lg border px-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
        isOpen || isActive
          ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]"
          : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
          {icon}
          {swatchColor ? (
            <span
              className="absolute -bottom-1 left-0 right-0 h-1 rounded-full border border-black/10"
              style={{ backgroundColor: swatchColor }}
            />
          ) : null}
        </span>
        {label && <span className="truncate">{label}</span>}
      </span>
      <ChevronDown
        size={12}
        className={`shrink-0 transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

function ToolbarSplitMenuButton({
  ariaLabel,
  ariaMenuLabel,
  menuDisabled = false,
  icon,
  isOpen,
  onClick,
  onMenuClick,
  primaryDisabled = false,
}: ToolbarSplitMenuButtonProps) {
  const isActive = isOpen;
  const isFullyDisabled = primaryDisabled && menuDisabled;

  return (
    <div
      className={`inline-flex h-8 overflow-hidden rounded-lg border transition-colors ${
        isActive
          ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]"
          : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      } ${isFullyDisabled ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={primaryDisabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onClick}
        className="inline-flex h-full min-w-8 items-center justify-center px-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-inset disabled:cursor-not-allowed"
      >
        {icon}
      </button>
      <button
        type="button"
        aria-label={ariaMenuLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        disabled={menuDisabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onMenuClick}
        className="inline-flex h-full w-7 items-center justify-center border-l border-current/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-inset disabled:cursor-not-allowed"
      >
        <ChevronDown
          size={12}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function ToolbarSeparator() {
  return (
    <div
      className="mx-0.5 h-8 w-px self-center bg-[var(--border-light)]"
      aria-hidden="true"
    />
  );
}

function MenuSeparator() {
  return (
    <div className="my-1 h-px bg-[var(--border-light)]" role="separator" />
  );
}

function MenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-3 pb-1 pt-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]"
      role="presentation"
    >
      {children}
    </div>
  );
}

function EmptyMenuItem() {
  return (
    <div className="px-3 py-2 text-sm text-[var(--text-faint)]" role="none">
      No options yet
    </div>
  );
}

function MenuItem({
  children,
  icon,
  isActive = false,
  shortcut,
  disabled = false,
  onClick,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive
          ? "bg-[var(--brand-pale)] font-medium text-[var(--brand)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {shortcut ? (
        <kbd className="ml-4 shrink-0 text-xs font-medium text-[var(--text-faint)]">
          {shortcut}
        </kbd>
      ) : null}
    </button>
  );
}

function MenuToggleItem({
  checked,
  children,
  disabled = false,
  onClick,
}: MenuToggleItemProps) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="min-w-0 flex-1">{children}</span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-[var(--brand)]" : "bg-[var(--border-light)]"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function ColorGrid({ activeColor, colors, columns, onSelect }: ColorGridProps) {
  const gridClassName = columns === 3 ? "grid-cols-3" : "grid-cols-5";
  const normalizedActiveColor = activeColor?.trim().toLowerCase() ?? null;

  return (
    <div className={`grid ${gridClassName} gap-2 px-3 py-2`} role="none">
      {colors.map((color) => {
        const isActive = normalizedActiveColor === color.trim().toLowerCase();

        return (
          <button
            key={color}
            type="button"
            role="menuitem"
            aria-label={`Select color ${color}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(color)}
            className={`h-8 w-full rounded-md border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
              isActive
                ? "border-[var(--brand)] ring-2 ring-[var(--brand)]/25"
                : "border-black/10 hover:border-[var(--border-orange)]"
            }`}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}

function useCanHover() {
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    function updateCanHover() {
      setCanHover(mediaQuery.matches);
    }

    updateCanHover();
    mediaQuery.addEventListener("change", updateCanHover);

    return () => {
      mediaQuery.removeEventListener("change", updateCanHover);
    };
  }, []);

  return canHover;
}

function clampTableDimension(value: number) {
  return Math.min(TABLE_PICKER_LIMIT, Math.max(1, value));
}

function parseTableDimensionInput(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return clampTableDimension(parsed);
}

function getTableRole(node: ProseMirrorNode | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (node?.type?.spec as any)?.tableRole as string | undefined;
}

function getActiveTableContext(editor: Editor | null): ActiveTableContext {
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

function getActiveTableElement(editor: Editor | null, tablePos: number | null) {
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

function getTableBubbleAnchorRect(element: HTMLElement) {
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

function isHeaderCellNode(node: ProseMirrorNode | null) {
  return getTableRole(node) === "header_cell";
}

function getTableStructure(doc: ProseMirrorNode, tablePos: number | null) {
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

function getTableGeometry(
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

function isHeaderAxisActive(
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

function getAdjacentCellPos(
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

function getMergeDirectionAvailability(
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

function SubmenuItem({
  children,
  submenu,
  icon,
  submenuClassName = "min-w-64",
}: {
  children: ReactNode;
  submenu: ReactNode;
  icon?: ReactNode;
  submenuClassName?: string;
}) {
  const canHover = useCanHover();
  const [isOpen, setIsOpen] = useState(false);

  function toggleOpen() {
    setIsOpen((currentOpen) => !currentOpen);
  }

  return (
    <div
      className={`relative ${
        canHover
          ? "[&:hover>.submenu-panel]:visible [&:hover>.submenu-panel]:opacity-100"
          : ""
      }`}
      role="none"
    >
      <button
        type="button"
        role="menuitem"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onMouseDown={(event) => event.preventDefault()}
        onClick={toggleOpen}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      >
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">{children}</span>
        <ChevronRight
          className={`h-4 w-4 shrink-0 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        data-open={isOpen}
        className={`submenu-panel invisible absolute left-0 right-0 top-full z-30 mt-1 overflow-visible rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] py-1 opacity-0 shadow-[var(--shadow-card)] transition data-[open=true]:visible data-[open=true]:opacity-100 sm:left-full sm:right-auto sm:top-0 sm:-ml-px sm:mt-0 ${submenuClassName}`}
      >
        {submenu}
      </div>
    </div>
  );
}

function TableInsertPicker({ onInsert }: TableInsertPickerProps) {
  const canHover = useCanHover();
  const [hoveredRows, setHoveredRows] = useState(0);
  const [hoveredColumns, setHoveredColumns] = useState(0);
  const [rowValue, setRowValue] = useState(
    String(DEFAULT_TABLE_DIMENSION),
  );
  const [columnValue, setColumnValue] = useState(
    String(DEFAULT_TABLE_DIMENSION),
  );

  const parsedRows = parseTableDimensionInput(rowValue);
  const parsedColumns = parseTableDimensionInput(columnValue);
  const canInsertFromInputs = parsedRows !== null && parsedColumns !== null;

  function handleInputInsert() {
    if (!canInsertFromInputs) {
      return;
    }

    onInsert(parsedRows, parsedColumns);
  }

  if (!canHover) {
    return (
      <div className="space-y-3 px-3 py-3" role="none">
        <div className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-faint)]">
          Insert table
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Rows
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={TABLE_PICKER_LIMIT}
              value={rowValue}
              onChange={(event) => setRowValue(event.target.value)}
              className={dashboardInputClassName}
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              Columns
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={TABLE_PICKER_LIMIT}
              value={columnValue}
              onChange={(event) => setColumnValue(event.target.value)}
              className={dashboardInputClassName}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={!canInsertFromInputs}
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleInputInsert}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Insert table
        </button>
      </div>
    );
  }

  return (
    <div
      className="px-3 pb-3 pt-2"
      role="none"
      onMouseLeave={() => {
        setHoveredRows(0);
        setHoveredColumns(0);
      }}
    >
      <div className="pb-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--text-faint)]">
        {hoveredRows > 0 && hoveredColumns > 0
          ? `${hoveredRows} x ${hoveredColumns} table`
          : "Select table size"}
      </div>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: TABLE_PICKER_LIMIT * TABLE_PICKER_LIMIT }).map(
          (_, index) => {
            const row = Math.floor(index / TABLE_PICKER_LIMIT) + 1;
            const column = (index % TABLE_PICKER_LIMIT) + 1;
            const isActive = row <= hoveredRows && column <= hoveredColumns;

            return (
              <button
                key={`${row}-${column}`}
                type="button"
                role="menuitem"
                aria-label={`Insert ${row} by ${column} table`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => {
                  setHoveredRows(row);
                  setHoveredColumns(column);
                }}
                onFocus={() => {
                  setHoveredRows(row);
                  setHoveredColumns(column);
                }}
                onClick={() => onInsert(row, column)}
                className={`h-4 w-4 rounded-[0.2rem] border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
                  isActive
                    ? "border-[var(--border-orange)] bg-[var(--brand)]/20"
                    : "border-[var(--border-light)] bg-[var(--bg-subtle)] hover:border-[var(--border-orange)]"
                }`}
              />
            );
          },
        )}
      </div>
    </div>
  );
}

function getHeadingLabel(value: "paragraph" | HeadingLevel) {
  if (value === "paragraph") {
    return "Paragraph";
  }

  return `Heading ${value}`;
}

function getCurrentHeading(editor: Editor | null): "paragraph" | HeadingLevel {
  if (!editor) {
    return "paragraph";
  }

  const heading = headingOptions.find(
    (option): option is { label: string; value: HeadingLevel } =>
      typeof option.value === "number" &&
      editor.isActive("heading", { level: option.value }),
  );

  return heading?.value ?? "paragraph";
}

function applyHeading(
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

function getCurrentTextAlignment(editor: Editor | null): TextAlignment {
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

function getCurrentTextStyle(
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

function updateLink(editor: Editor | null) {
  if (!editor) {
    return;
  }

  const previousHref = editor.getAttributes("link").href as string | undefined;
  const nextHref = window.prompt("Enter link URL", previousHref ?? "");

  if (nextHref === null) {
    return;
  }

  if (nextHref.trim() === "") {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }

  editor
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: nextHref.trim() })
    .run();
}

function getSelectionComputedFontSize(editor: Editor | null) {
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

function getColorInputValue(
  value: string | null | undefined,
  fallback: string,
) {
  if (value && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())) {
    return value.trim();
  }

  return fallback;
}

function collectDocumentEditorColors(body: JSONContent | null | undefined) {
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

function getSelectedTableCellPositions(
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

function getCommonTableCellValue<T>(
  values: T[],
  fallback: T,
) {
  if (values.length === 0) {
    return fallback;
  }

  const [firstValue, ...remainingValues] = values;

  return remainingValues.every((value) => value === firstValue)
    ? firstValue
    : fallback;
}

function getSelectedTableCellState(
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

function getImageInsertTarget(editor: Editor) {
  const { from, to } = editor.state.selection;

  return from === to ? from : { from, to };
}

function getSelectedImageState(editor: Editor | null): SelectedImageState | null {
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

function hasTableOfContentsNode(editor: Editor | null) {
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

function getSelectedImageElement(editor: Editor | null) {
  if (!editor) {
    return null;
  }

  return editor.view.dom.querySelector(
    ".news-body-editor__image-wrapper.is-selected .news-body-editor__image-container",
  ) as HTMLElement | null;
}

function insertImageNode(
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

function normalizeImageUrl(value: string) {
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

function ImageUrlModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (url: string) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleSubmit() {
    const normalizedUrl = normalizeImageUrl(value);

    if (!normalizedUrl) {
      setError("Enter a valid http or https image URL.");
      return;
    }

    setError("");
    onSubmit(normalizedUrl);
  }

  return (
    <NewsModal
      ariaDescribedBy={descriptionId}
      ariaLabel="Close image URL dialog"
      ariaLabelledBy={titleId}
      onClose={onClose}
      title={
        <p
          id={titleId}
          className="font-heading text-base font-bold tracking-[-0.02em] text-[var(--text-primary)]"
        >
          Insert image via URL
        </p>
      }
    >
      <div className="space-y-4 px-5 py-5 sm:px-6">
        <p id={descriptionId} className="sr-only">
          Paste a public image URL to insert it into the article body.
        </p>
        <label>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Image URL
          </span>
          <input
            autoFocus
            type="url"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) {
                setError("");
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="https://example.com/news-image.jpg"
            className={dashboardInputClassName}
          />
          {error ? (
            <p className="mt-2 text-xs font-medium text-[#dc2626]">{error}</p>
          ) : null}
        </label>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--border-light)] pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
          >
            Insert image
          </button>
        </div>
      </div>
    </NewsModal>
  );
}

export function NewsBodyEditor({
  initialContent,
  onChange,
}: NewsBodyEditorProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const textColorInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundColorInputRef = useRef<HTMLInputElement | null>(null);
  const cellBackgroundColorInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const pendingImageInsertTargetRef = useRef<ImageInsertTarget>(null);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [openTableBubbleSubmenu, setOpenTableBubbleSubmenu] =
    useState<OpenTableBubbleSubmenu>(null);
  const [openCellPropertiesMenu, setOpenCellPropertiesMenu] =
    useState<OpenCellPropertiesMenu>(null);
  const [cellPaddingInputValue, setCellPaddingInputValue] = useState("");
  const [isImageUrlModalOpen, setIsImageUrlModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [openImageBubbleSubmenu, setOpenImageBubbleSubmenu] =
    useState<OpenImageBubbleSubmenu>(null);
  const [isImageAltEditorOpen, setIsImageAltEditorOpen] = useState(false);
  const [imageAltInputValue, setImageAltInputValue] = useState("");

  const editor = useEditor({
    content: initialContent ?? EMPTY_NEWS_BODY,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem,
      NewsTableOfContents,
      TableOfContents.configure({
        anchorTypes: ["heading"],
      }),
      NewsBodyImage,
      TableKit.configure({
        table: {
          renderWrapper: true,
        },
        tableCell: false,
        tableHeader: false,
      }),
      CustomTableCell,
      CustomTableHeader,
      Superscript,
      Subscript,
      Typography,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontSize,
      FontFamily,
      Color,
      BackgroundColor,
      FileHandler.configure({
        allowedMimeTypes: [...EDITOR_IMAGE_ALLOWED_MIME_TYPES],
        onDrop: (currentEditor, files, pos) => {
          void uploadAndInsertImages(currentEditor, files, pos);
        },
        onPaste: (currentEditor, files, htmlContent) => {
          if (htmlContent?.length) {
            return;
          }

          void uploadAndInsertImages(
            currentEditor,
            files,
            getImageInsertTarget(currentEditor),
          );
        },
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      const nextJson = currentEditor.getJSON();

      onChange(nextJson);
    },
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "news-body-editor__content",
      },
    },
  });

  const editorState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => {
      if (!currentEditor) {
        return {
          blockquote: false,
          bold: false,
          bulletList: false,
          canMergeDirection: EMPTY_MERGE_DIRECTION_AVAILABILITY,
          canMergeSelection: false,
          canRedo: false,
          canSplitCell: false,
          canToggleHeaderColumn: false,
          canToggleHeaderRow: false,
          canUndo: false,
          activeCellPos: null as number | null,
          activeTablePos: null as number | null,
          code: false,
          currentColumnIsHeader: false,
          currentHeading: "paragraph" as const,
          currentCellProperties: {
            backgroundColor: null,
            hasBackgroundColor: false,
            horizontalAlign: "left" as TableCellHorizontalAlignment,
            padding: null,
          },
          currentRowIsHeader: false,
          currentTextAlign: null as TextAlignment,
          currentTextStyle: null as NewsBodyTextStyleAttributes | null,
          documentColors: collectDocumentEditorColors(initialContent ?? EMPTY_NEWS_BODY),
          italic: false,
          link: false,
          orderedList: false,
          taskList: false,
          selectedImage: null as SelectedImageState | null,
          tableActive: false,
          strike: false,
          subscript: false,
          superscript: false,
          underline: false,
        };
      }

      const activeTableContext = getActiveTableContext(currentEditor);
      const currentColumnIsHeader = isHeaderAxisActive(
        currentEditor.state.doc,
        activeTableContext.activeTablePos,
        "columns",
      );
      const currentRowIsHeader = isHeaderAxisActive(
        currentEditor.state.doc,
        activeTableContext.activeTablePos,
        "rows",
      );

      return {
        ...activeTableContext,
        blockquote: currentEditor.isActive("blockquote"),
        bold: currentEditor.isActive("bold"),
        bulletList: currentEditor.isActive("bulletList"),
        canMergeDirection: getMergeDirectionAvailability(
          currentEditor.state.doc,
          activeTableContext.activeTablePos,
          activeTableContext.activeCellPos,
        ),
        canMergeSelection: currentEditor.can().mergeCells(),
        canRedo: currentEditor.can().redo(),
        canSplitCell: currentEditor.can().splitCell(),
        canToggleHeaderColumn: currentEditor.can().toggleHeaderColumn(),
        canToggleHeaderRow: currentEditor.can().toggleHeaderRow(),
        canUndo: currentEditor.can().undo(),
        code: currentEditor.isActive("code"),
        currentCellProperties: getSelectedTableCellState(
          currentEditor,
          activeTableContext.activeTablePos,
          activeTableContext.activeCellPos,
        ),
        currentColumnIsHeader,
        currentHeading: getCurrentHeading(currentEditor),
        currentRowIsHeader,
        currentTextAlign: getCurrentTextAlignment(currentEditor),
        currentTextStyle: getCurrentTextStyle(currentEditor),
        documentColors: collectDocumentEditorColors(currentEditor.getJSON()),
        italic: currentEditor.isActive("italic"),
        link: currentEditor.isActive("link"),
        orderedList: currentEditor.isActive("orderedList"),
        taskList: currentEditor.isActive("taskList"),
        selectedImage: getSelectedImageState(currentEditor),
        strike: currentEditor.isActive("strike"),
        subscript: currentEditor.isActive("subscript"),
        superscript: currentEditor.isActive("superscript"),
        underline: currentEditor.isActive("underline"),
      };
    },
  });

  const selectedHeading: "paragraph" | HeadingLevel =
    editorState?.currentHeading ?? "paragraph";
  const selectedTextAlignment: TextAlignment =
    editorState?.currentTextAlign ?? null;
  const selectedTextStyle = editorState?.currentTextStyle ?? null;
  const selectedFontSize = selectedTextStyle?.fontSize ?? null;
  const selectedFontFamily = selectedTextStyle?.fontFamily ?? null;
  const selectedTextColor = selectedTextStyle?.color ?? null;
  const selectedBackgroundColor = selectedTextStyle?.backgroundColor ?? null;
  const selectedCellProperties = editorState?.currentCellProperties ?? {
    backgroundColor: null,
    hasBackgroundColor: false,
    horizontalAlign: "left" as TableCellHorizontalAlignment,
    padding: null,
  };
  const selectedCellBackgroundColor =
    selectedCellProperties.backgroundColor ?? null;
  const hasSelectedCellBackgroundColor =
    selectedCellProperties.hasBackgroundColor ?? false;
  const selectedCellPadding = selectedCellProperties.padding ?? null;
  const selectedCellHorizontalAlignment =
    selectedCellProperties.horizontalAlign ?? "left";
  const documentColors = editorState?.documentColors ?? {
    backgroundColors: [],
    textColors: [],
  };
  const selectedImage = editorState?.selectedImage ?? null;
  const activeCellPos = editorState?.activeCellPos ?? null;
  const activeTablePos = editorState?.activeTablePos ?? null;
  const canMergeDirection =
    editorState?.canMergeDirection ?? EMPTY_MERGE_DIRECTION_AVAILABILITY;
  const canMergeSelection = editorState?.canMergeSelection ?? false;
  const canSplitCell = editorState?.canSplitCell ?? false;
  const canToggleHeaderColumn = editorState?.canToggleHeaderColumn ?? false;
  const canToggleHeaderRow = editorState?.canToggleHeaderRow ?? false;
  const currentColumnIsHeader = editorState?.currentColumnIsHeader ?? false;
  const currentRowIsHeader = editorState?.currentRowIsHeader ?? false;
  const isTableActive = editorState?.tableActive ?? false;
  const hasDirectionalMergeAction = Object.values(canMergeDirection).some(
    Boolean,
  );

  useEffect(() => {
    if (!selectedImage) {
      setOpenImageBubbleSubmenu(null);
      setIsImageAltEditorOpen(false);
      setImageAltInputValue("");
      return;
    }

    setOpenImageBubbleSubmenu(null);
    setIsImageAltEditorOpen(false);
    setImageAltInputValue(selectedImage.alt);
  }, [selectedImage?.alt, selectedImage?.pos]);

  function closeMenu() {
    setOpenMenu(null);
  }

  function toggleMenu(menu: Exclude<OpenMenu, null>) {
    setOpenMenu((currentMenu) => (currentMenu === menu ? null : menu));
  }

  function runAction(action: () => void) {
    action();
    closeMenu();
  }

  function insertTableOfContents() {
    if (!editor) {
      return;
    }

    if (hasTableOfContentsNode(editor)) {
      toast.error("Table of contents already exists.");
      return;
    }

    editor
      .chain()
      .focus()
      .insertContent({ type: NEWS_TABLE_OF_CONTENTS_NODE_NAME })
      .run();
  }

  function closeImageBubbleSubmenu() {
    setOpenImageBubbleSubmenu(null);
  }

  function toggleImageBubbleSubmenu(
    menu: Exclude<OpenImageBubbleSubmenu, null>,
  ) {
    setIsImageAltEditorOpen(false);
    setOpenImageBubbleSubmenu((currentMenu) =>
      currentMenu === menu ? null : menu,
    );
  }

  function updateSelectedImageAttributes(
    attributes: Partial<{
      alignment: NewsBodyImageAlignment;
      alt: string;
      width: string;
    }>,
  ) {
    if (!editor || !selectedImage) {
      return;
    }

    editor
      .chain()
      .focus()
      .setNodeSelection(selectedImage.pos)
      .updateAttributes("image", attributes)
      .run();
  }

  function runImageBubbleAction(action: () => void) {
    action();
    closeImageBubbleSubmenu();
    setIsImageAltEditorOpen(false);
  }

  function openImageAltEditor() {
    if (!selectedImage) {
      return;
    }

    setOpenImageBubbleSubmenu(null);
    setImageAltInputValue(selectedImage.alt);
    setIsImageAltEditorOpen(true);
  }

  function saveSelectedImageAlt() {
    updateSelectedImageAttributes({
      alt: imageAltInputValue.trim(),
    });
    setIsImageAltEditorOpen(false);
  }

  function deleteSelectedImage() {
    if (!editor || !selectedImage) {
      return;
    }

    editor.chain().focus().setNodeSelection(selectedImage.pos).deleteSelection().run();
    closeImageBubbleSubmenu();
    setIsImageAltEditorOpen(false);
  }

  function toggleTableBubbleSubmenu(
    menu: Exclude<OpenTableBubbleSubmenu, null>,
  ) {
    setOpenCellPropertiesMenu(null);
    setOpenTableBubbleSubmenu((currentMenu) =>
      currentMenu === menu ? null : menu,
    );
  }

  function closeTableBubbleSubmenu() {
    setOpenCellPropertiesMenu(null);
    setOpenTableBubbleSubmenu(null);
  }

  function runTableBubbleAction(action: () => void) {
    action();
    closeTableBubbleSubmenu();
  }

  function openCellPropertiesView() {
    setOpenCellPropertiesMenu(null);
    setOpenTableBubbleSubmenu("cell-properties");
  }

  function closeCellPropertiesView() {
    setOpenCellPropertiesMenu(null);
    setOpenTableBubbleSubmenu(null);
  }

  function toggleCellPropertiesMenu(
    menu: Exclude<OpenCellPropertiesMenu, null>,
  ) {
    setOpenCellPropertiesMenu((currentMenu) =>
      currentMenu === menu ? null : menu,
    );
  }

  function setSelectedTableCellAttribute(
    attribute: keyof TableCellStyleAttributes,
    value: string | null,
  ) {
    if (!editor || activeCellPos === null) {
      return;
    }

    const cellPositions = getSelectedTableCellPositions(
      editor,
      activeTablePos,
      activeCellPos,
    );

    if (cellPositions.length === 0) {
      return;
    }

    let transaction = editor.state.tr;
    let didChange = false;

    for (const cellPosition of cellPositions) {
      const cellNode = transaction.doc.nodeAt(cellPosition);

      if (!cellNode) {
        continue;
      }

      const currentValue =
        typeof cellNode.attrs[attribute] === "string"
          ? cellNode.attrs[attribute]
          : null;

      if (currentValue === value) {
        continue;
      }

      transaction = transaction.setNodeMarkup(cellPosition, undefined, {
        ...cellNode.attrs,
        [attribute]: value,
      });
      didChange = true;
    }

    if (!didChange) {
      return;
    }

    editor.view.dispatch(transaction.scrollIntoView());
    editor.view.focus();
  }

  function setSelectedTableCellBackgroundColor(value: string) {
    setSelectedTableCellAttribute("backgroundColor", value);
    setOpenCellPropertiesMenu(null);
  }

  function unsetSelectedTableCellBackgroundColor() {
    setSelectedTableCellAttribute("backgroundColor", null);
    setOpenCellPropertiesMenu(null);
  }

  function setSelectedTableCellHorizontalAlignment(
    value: TableCellHorizontalAlignment,
  ) {
    setSelectedTableCellAttribute(
      "horizontalAlign",
      value === "left" ? null : value,
    );
  }

  function commitCellPaddingInput() {
    const trimmedValue = cellPaddingInputValue.trim();

    if (trimmedValue === "") {
      setSelectedTableCellAttribute("padding", null);
      return;
    }

    if (!/^\d+(?:\.\d+)?$/.test(trimmedValue)) {
      setCellPaddingInputValue(getTableCellPaddingInputValue(selectedCellPadding));
      toast.error("Padding must be a single pixel value.");
      return;
    }

    const parsed = Number.parseFloat(trimmedValue);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setCellPaddingInputValue(getTableCellPaddingInputValue(selectedCellPadding));
      toast.error("Padding must be a single pixel value.");
      return;
    }

    const normalized = Number.isInteger(parsed)
      ? parsed
      : Number(parsed.toFixed(2));

    setSelectedTableCellAttribute("padding", `${normalized}px`);
    setCellPaddingInputValue(`${normalized}`);
  }

  async function uploadImageFile(file: File) {
    try {
      const formData = new FormData();

      formData.set("image", file);

      const result = await uploadNewsBodyImage(formData);

      if (result.status === "error" || !result.url) {
        toast.error(result.message || "The image could not be uploaded.");
        return null;
      }

      return result.url;
    } catch {
      toast.error("The image could not be uploaded.");
      return null;
    }
  }

  async function uploadAndInsertImages(
    targetEditor: Editor,
    files: File[],
    target?: ImageInsertTarget,
  ) {
    const imageFiles = files.filter((file) =>
      EDITOR_IMAGE_ALLOWED_MIME_TYPES.includes(
        file.type as (typeof EDITOR_IMAGE_ALLOWED_MIME_TYPES)[number],
      ),
    );

    if (imageFiles.length === 0) {
      return;
    }

    setIsUploadingImage(true);

    try {
      let nextTarget = target;

      for (const file of imageFiles) {
        const imageUrl = await uploadImageFile(file);

        if (!imageUrl) {
          continue;
        }

        insertImageNode(targetEditor, imageUrl, nextTarget);
        nextTarget = undefined;
      }
    } finally {
      setIsUploadingImage(false);
    }
  }

  function openUploadFromComputer() {
    if (!editor || isUploadingImage) {
      return;
    }

    pendingImageInsertTargetRef.current = getImageInsertTarget(editor);
    closeMenu();
    imageInputRef.current?.click();
  }

  async function handleImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const target = pendingImageInsertTargetRef.current;

    pendingImageInsertTargetRef.current = null;
    event.target.value = "";

    if (!editor || selectedFiles.length === 0) {
      return;
    }

    await uploadAndInsertImages(editor, selectedFiles, target);
  }

  function openImageUrlModal() {
    if (!editor) {
      return;
    }

    pendingImageInsertTargetRef.current = getImageInsertTarget(editor);
    closeMenu();
    setIsImageUrlModalOpen(true);
  }

  function closeImageUrlModal() {
    pendingImageInsertTargetRef.current = null;
    setIsImageUrlModalOpen(false);
  }

  function handleInsertImageUrl(url: string) {
    if (!editor) {
      return;
    }

    insertImageNode(editor, url, pendingImageInsertTargetRef.current);
    pendingImageInsertTargetRef.current = null;
    setIsImageUrlModalOpen(false);
  }

  function insertTable(rows: number, columns: number) {
    if (!editor) {
      return;
    }

    editor
      .chain()
      .focus()
      .insertTable({
        rows: clampTableDimension(rows),
        cols: clampTableDimension(columns),
        withHeaderRow: true,
      })
      .run();
    closeMenu();
  }

  function selectTableAxis(axis: TableAxis) {
    if (!editor || activeCellPos === null) {
      return;
    }

    const $cell = editor.state.doc.resolve(activeCellPos);
    const nextSelection =
      axis === "columns"
        ? CellSelection.colSelection($cell, $cell)
        : CellSelection.rowSelection($cell, $cell);

    editor.view.dispatch(
      editor.state.tr.setSelection(nextSelection).scrollIntoView(),
    );
    editor.view.focus();
  }

  function toggleHeaderAxis(axis: TableAxis) {
    if (!editor) {
      return;
    }

    const didToggle =
      axis === "columns"
        ? editor.chain().focus().toggleHeaderColumn().run()
        : editor.chain().focus().toggleHeaderRow().run();

    if (!didToggle) {
      toast.error("That header toggle isn't available for the current cell.");
    }
  }

  function toggleMergeSelectedCells() {
    if (!editor) {
      return;
    }

    const didMergeOrSplit = editor.chain().focus().mergeOrSplit().run();

    if (!didMergeOrSplit) {
      toast.error("Select mergeable cells or a merged cell first.");
    }
  }

  function splitSelectedCell() {
    if (!editor) {
      return;
    }

    const didSplit = editor.chain().focus().splitCell().run();

    if (!didSplit) {
      toast.error("Select a merged cell first.");
    }
  }

  function mergeCellInDirection(direction: MergeDirection) {
    if (!editor || activeCellPos === null || activeTablePos === null) {
      return;
    }

    const adjacentCellPos = getAdjacentCellPos(
      editor.state.doc,
      activeTablePos,
      activeCellPos,
      direction,
    );

    if (adjacentCellPos === null) {
      toast.error("No adjacent cell is available in that direction.");
      return;
    }

    editor.view.dispatch(
      editor.state.tr
        .setSelection(
          new CellSelection(
            editor.state.doc.resolve(activeCellPos),
            editor.state.doc.resolve(adjacentCellPos),
          ),
        )
        .scrollIntoView(),
    );

    const didMerge = editor.chain().focus().mergeCells().run();

    if (!didMerge) {
      toast.error("Those cells can't be merged.");
    }
  }

  function setFontSizeValue(value: string | null) {
    if (!editor) {
      return;
    }

    const chain = editor.chain().focus();

    if (value === null) {
      chain.unsetFontSize().run();
      return;
    }

    chain.setFontSize(value).run();
  }

  function setFontFamilyValue(value: string) {
    editor?.chain().focus().setFontFamily(value).run();
  }

  function setTextColorValue(value: string) {
    editor?.chain().focus().setColor(value).run();
  }

  function unsetTextColorValue() {
    editor?.chain().focus().unsetColor().run();
  }

  function setBackgroundColorValue(value: string) {
    editor?.chain().focus().setBackgroundColor(value).run();
  }

  function unsetBackgroundColorValue() {
    editor?.chain().focus().unsetBackgroundColor().run();
  }

  function stepFontSize(delta: number) {
    if (!editor) {
      return;
    }

    const fallbackPx = getSelectionComputedFontSize(editor) ?? 16;
    const nextSize = stepFontSizeValue(selectedFontSize, delta, fallbackPx);
    editor.chain().focus().setFontSize(nextSize).run();
  }

  useEffect(() => {
    if (!isTableActive) {
      setOpenCellPropertiesMenu(null);
      setOpenTableBubbleSubmenu(null);
    }
  }, [isTableActive, activeTablePos]);

  useEffect(() => {
    if (openTableBubbleSubmenu !== "cell-properties") {
      setOpenCellPropertiesMenu(null);
    }
  }, [openTableBubbleSubmenu]);

  useEffect(() => {
    setCellPaddingInputValue(getTableCellPaddingInputValue(selectedCellPadding));
  }, [selectedCellPadding, activeCellPos, activeTablePos]);

  useEffect(() => {
    if (!editor || !isTableActive) {
      return;
    }

    editor.commands.setMeta(TABLE_BUBBLE_MENU_PLUGIN_KEY, "updatePosition");
  }, [
    editor,
    isTableActive,
    activeTablePos,
    openTableBubbleSubmenu,
    openCellPropertiesMenu,
  ]);

  useEffect(() => {
    function applyStepFontSize(delta: number) {
      if (!editor) {
        return;
      }

      const fallbackPx = getSelectionComputedFontSize(editor) ?? 16;
      const nextSize = stepFontSizeValue(selectedFontSize, delta, fallbackPx);
      editor.chain().focus().setFontSize(nextSize).run();
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
        setOpenCellPropertiesMenu(null);
        setOpenTableBubbleSubmenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        editor?.isFocused &&
        event.ctrlKey &&
        event.shiftKey &&
        event.code === "Period"
      ) {
        event.preventDefault();
        applyStepFontSize(1);
        return;
      }

      if (
        editor?.isFocused &&
        event.ctrlKey &&
        event.shiftKey &&
        event.code === "Comma"
      ) {
        event.preventDefault();
        applyStepFontSize(-1);
        return;
      }

      if (event.key === "Escape") {
        setOpenMenu(null);
        setOpenCellPropertiesMenu(null);
        setOpenTableBubbleSubmenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, selectedFontSize]);

  function openColorPicker(mode: "text" | "background" | "cell-background") {
    if (mode === "text") {
      textColorInputRef.current?.click();
      return;
    }

    if (mode === "cell-background") {
      cellBackgroundColorInputRef.current?.click();
      return;
    }

    backgroundColorInputRef.current?.click();
  }

  function handleColorPickerChange(
    event: ChangeEvent<HTMLInputElement>,
    mode: "text" | "background" | "cell-background",
  ) {
    const value = event.target.value;

    if (!value) {
      return;
    }

    if (mode === "text") {
      setTextColorValue(value);
    } else if (mode === "background") {
      setBackgroundColorValue(value);
    } else {
      setSelectedTableCellBackgroundColor(value);
    }

    if (mode === "cell-background") {
      setOpenCellPropertiesMenu(null);
      return;
    }

    closeMenu();
  }

  function renderHeadingMenuItems() {
    return headingOptions.map((option) => (
      <MenuItem
        key={option.value}
        isActive={selectedHeading === option.value}
        onClick={() => runAction(() => applyHeading(editor, option.value))}
      >
        <span
          className={
            option.value === "paragraph"
              ? ""
              : "font-heading font-semibold text-[var(--text-primary)]"
          }
          style={
            typeof option.value === "number"
              ? { fontSize: `${1.2 - option.value * 0.06}rem` }
              : undefined
          }
        >
          {option.label}
        </span>
      </MenuItem>
    ));
  }

  function renderTextAlignmentMenuItems() {
    return textAlignmentOptions.map((option) => (
      <MenuItem
        key={option.value}
        icon={option.icon}
        isActive={selectedTextAlignment === option.value}
        onClick={() =>
          runAction(() =>
            editor?.chain().focus().setTextAlign(option.value).run(),
          )
        }
      >
        {option.label}
      </MenuItem>
    ));
  }

  function renderFontSizeMenuItems(includeStepActions: boolean) {
    return (
      <>
        {FONT_SIZE_OPTIONS.map((option) => (
          <MenuItem
            key={option.label}
            isActive={
              option.value === null
                ? selectedFontSize === null
                : selectedFontSize === option.value
            }
            onClick={() => runAction(() => setFontSizeValue(option.value))}
          >
            {option.label}
          </MenuItem>
        ))}
        {includeStepActions ? (
          <>
            <MenuSeparator />
            <MenuItem
              icon={<TextCursorInput className="h-4 w-4" />}
              shortcut="Ctrl+Shift+."
              onClick={() => runAction(() => stepFontSize(1))}
            >
              Increase Font
            </MenuItem>
            <MenuItem
              icon={<TextCursorInput className="h-4 w-4" />}
              shortcut="Ctrl+Shift+,"
              onClick={() => runAction(() => stepFontSize(-1))}
            >
              Decrease Font
            </MenuItem>
          </>
        ) : null}
      </>
    );
  }

  function renderFontFamilyMenuItems() {
    return FONT_FAMILY_OPTIONS.map((option) => (
      <MenuItem
        key={option.label}
        isActive={selectedFontFamily === option.value}
        onClick={() => runAction(() => setFontFamilyValue(option.value))}
      >
        <span style={{ fontFamily: option.value }}>{option.label}</span>
      </MenuItem>
    ));
  }

  function renderDocumentColorSection(
    colors: string[],
    activeColor: string | null,
    onSelect: (color: string) => void,
    closeAfterSelect = true,
  ) {
    if (colors.length === 0) {
      return (
        <div className="px-3 py-2 text-sm text-[var(--text-faint)]" role="none">
          No document colors yet
        </div>
      );
    }

    return (
      <ColorGrid
        activeColor={activeColor}
        colors={colors}
        columns={5}
        onSelect={(color) => {
          if (closeAfterSelect) {
            runAction(() => onSelect(color));
            return;
          }

          onSelect(color);
        }}
      />
    );
  }

  function renderColorMenuContent(
    mode: "text" | "background" | "cell-background",
    includeColorPicker: boolean,
  ) {
    const isTextColorMode = mode === "text";
    const isCellBackgroundMode = mode === "cell-background";
    const activeColor = isTextColorMode
      ? selectedTextColor
      : isCellBackgroundMode
        ? selectedCellBackgroundColor
        : selectedBackgroundColor;
    const documentPalette = isTextColorMode
      ? documentColors.textColors
      : documentColors.backgroundColors;
    const canRemoveColor = isCellBackgroundMode
      ? hasSelectedCellBackgroundColor
      : Boolean(activeColor);

    return (
      <>
        <MenuItem
          icon={<Eraser className="h-4 w-4" />}
          disabled={!canRemoveColor}
          onClick={() =>
            isCellBackgroundMode
              ? unsetSelectedTableCellBackgroundColor()
              : runAction(() =>
                  isTextColorMode
                    ? unsetTextColorValue()
                    : unsetBackgroundColorValue(),
                )
          }
        >
          Remove color
        </MenuItem>
        <ColorGrid
          activeColor={activeColor}
          colors={DEFAULT_TEXT_STYLE_COLORS}
          columns={5}
          onSelect={(color) => {
            if (isCellBackgroundMode) {
              setSelectedTableCellBackgroundColor(color);
              return;
            }

            runAction(() =>
              isTextColorMode
                ? setTextColorValue(color)
                : setBackgroundColorValue(color),
            );
          }}
        />
        <MenuSectionLabel>Document Colors</MenuSectionLabel>
        {renderDocumentColorSection(
          documentPalette,
          activeColor,
          (color) => {
            if (isCellBackgroundMode) {
              setSelectedTableCellBackgroundColor(color);
              return;
            }

            if (isTextColorMode) {
              setTextColorValue(color);
              return;
            }

            setBackgroundColorValue(color);
          },
          !isCellBackgroundMode,
        )}
        {includeColorPicker ? (
          <>
            <MenuSeparator />
            <MenuItem
              icon={<Palette className="h-4 w-4" />}
              onClick={() =>
                openColorPicker(
                  isTextColorMode
                    ? "text"
                    : isCellBackgroundMode
                      ? "cell-background"
                      : "background",
                )
              }
            >
              Color Picker
            </MenuItem>
          </>
        ) : null}
      </>
    );
  }

  function renderTableInsertMenuContent() {
    return <TableInsertPicker onInsert={insertTable} />;
  }

  function renderImageAlignmentMenuContent() {
    return imageAlignmentOptions.map((option) => (
      <MenuItem
        key={option.value}
        icon={option.icon}
        isActive={selectedImage?.alignment === option.value}
        onClick={() =>
          runImageBubbleAction(() =>
            updateSelectedImageAttributes({ alignment: option.value }),
          )
        }
      >
        {option.label}
      </MenuItem>
    ));
  }

  function renderImageSizeMenuContent() {
    return NEWS_BODY_IMAGE_SIZE_PRESETS.map((option) => (
      <MenuItem
        key={option.label}
        isActive={selectedImage?.width === option.value}
        onClick={() =>
          runImageBubbleAction(() =>
            updateSelectedImageAttributes({ width: option.value }),
          )
        }
      >
        {option.label}
      </MenuItem>
    ));
  }

  function renderTableBubbleMenuPanel(
    content: ReactNode,
    className = "min-w-44",
  ) {
    return (
      <div
        role="menu"
        className={`news-body-editor__table-bubble-submenu ${className}`}
      >
        {content}
      </div>
    );
  }

  function renderImageBubbleContent() {
    if (!selectedImage) {
      return null;
    }

    if (isImageAltEditorOpen) {
      return (
        <div className="news-body-editor__table-bubble news-body-editor__image-bubble news-body-editor__image-alt-bubble">
          <input
            autoFocus
            type="text"
            value={imageAltInputValue}
            onChange={(event) => setImageAltInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                saveSelectedImageAlt();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                setIsImageAltEditorOpen(false);
              }
            }}
            placeholder="Describe this image"
            className={`${dashboardInputClassName} news-body-editor__image-alt-input !mt-0`}
          />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={saveSelectedImageAlt}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-orange)] bg-[var(--brand-pale)] px-3 text-sm font-semibold text-[var(--brand)] transition hover:bg-[var(--brand)]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
          >
            Save
          </button>
        </div>
      );
    }

    const selectedAlignmentOption = imageAlignmentOptions.find(
      (option) => option.value === selectedImage.alignment,
    );

    return (
      <div className="news-body-editor__table-bubble news-body-editor__image-bubble">
        <ToolbarButton ariaLabel="Edit image alt text" onClick={openImageAltEditor}>
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>

        <div
          className="mx-0.5 h-7 w-px self-center bg-[var(--border-light)]"
          aria-hidden="true"
        />

        <div className="relative">
          <ToolbarMenuButton
            ariaLabel="Image alignment options"
            icon={selectedAlignmentOption?.icon ?? <AlignCenter className="h-4 w-4" />}
            isOpen={openImageBubbleSubmenu === "alignment"}
            onClick={() => toggleImageBubbleSubmenu("alignment")}
          />

          {openImageBubbleSubmenu === "alignment"
            ? renderTableBubbleMenuPanel(renderImageAlignmentMenuContent(), "min-w-48")
            : null}
        </div>

        <div className="relative">
          <ToolbarMenuButton
            ariaLabel="Image size options"
            icon={<ImageUp className="h-4 w-4" aria-hidden="true" />}
            isOpen={openImageBubbleSubmenu === "size"}
            label={getNewsBodyImageSizeLabel(selectedImage.width)}
            onClick={() => toggleImageBubbleSubmenu("size")}
          />

          {openImageBubbleSubmenu === "size"
            ? renderTableBubbleMenuPanel(renderImageSizeMenuContent(), "min-w-40")
            : null}
        </div>

        <div
          className="mx-0.5 h-7 w-px self-center bg-[var(--border-light)]"
          aria-hidden="true"
        />

        <ToolbarButton ariaLabel="Delete image" onClick={deleteSelectedImage}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
      </div>
    );
  }

  function renderCellPropertiesContent() {
    const backgroundButtonLabel = selectedCellBackgroundColor
      ? selectedCellBackgroundColor
      : hasSelectedCellBackgroundColor
        ? "Mixed"
        : "Select color";

    return (
      <div className="news-body-editor__table-bubble news-body-editor__cell-properties-bubble">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Back to table actions"
            onMouseDown={(event) => event.preventDefault()}
            onClick={closeCellPropertiesView}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
          >
            <ChevronRight className="h-4 w-4 rotate-180" aria-hidden="true" />
          </button>
          <p className="font-heading text-sm font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Cell Properties
          </p>
        </div>

        <div className="news-body-editor__cell-properties-grid">
          <div className="space-y-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
              Background
            </p>
            <div className="relative">
              <button
                type="button"
                aria-label="Cell background color options"
                aria-expanded={openCellPropertiesMenu === "background-color"}
                aria-haspopup="menu"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => toggleCellPropertiesMenu("background-color")}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
                  openCellPropertiesMenu === "background-color"
                    ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]"
                    : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded-md border border-black/10"
                    style={{
                      backgroundColor:
                        selectedCellBackgroundColor ??
                        "var(--bg-subtle)",
                    }}
                  />
                  <span className="truncate">{backgroundButtonLabel}</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    openCellPropertiesMenu === "background-color"
                      ? "rotate-180"
                      : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {openCellPropertiesMenu === "background-color"
                ? renderTableBubbleMenuPanel(
                    renderColorMenuContent("cell-background", true),
                    "min-w-[17rem]",
                  )
                : null}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
              Dimensions
            </p>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                aria-label="Cell padding in pixels"
                placeholder="padding"
                value={cellPaddingInputValue}
                onChange={(event) => setCellPaddingInputValue(event.target.value)}
                onBlur={commitCellPaddingInput}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitCellPaddingInput();
                  }
                }}
                className={`${dashboardInputClassName} !mt-0`}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                px
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
            Table Cell Text Alignment
          </p>
          <div className="news-body-editor__cell-alignment-group">
            {textAlignmentOptions.map((option) => (
              <ToolbarButton
                key={option.value}
                ariaLabel={option.label}
                isActive={selectedCellHorizontalAlignment === option.value}
                onClick={() =>
                  setSelectedTableCellHorizontalAlignment(option.value)
                }
              >
                {option.icon}
              </ToolbarButton>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderTableBubbleContent() {
    if (openTableBubbleSubmenu === "cell-properties") {
      return renderCellPropertiesContent();
    }

    return (
      <div className="news-body-editor__table-bubble">
        <div className="relative">
          <ToolbarMenuButton
            ariaLabel="Column actions"
            icon={<Columns3 className="h-4 w-4" aria-hidden="true" />}
            isOpen={openTableBubbleSubmenu === "columns"}
            onClick={() => toggleTableBubbleSubmenu("columns")}
          />

          {openTableBubbleSubmenu === "columns"
            ? renderTableBubbleMenuPanel(
                <>
                  <MenuToggleItem
                    checked={currentColumnIsHeader}
                    disabled={!canToggleHeaderColumn}
                    onClick={() =>
                      runTableBubbleAction(() => toggleHeaderAxis("columns"))
                    }
                  >
                    Header column
                  </MenuToggleItem>
                  <MenuSeparator />
                  <MenuItem
                    onClick={() =>
                      runTableBubbleAction(() =>
                        editor?.chain().focus().addColumnBefore().run(),
                      )
                    }
                  >
                    Insert column left
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      runTableBubbleAction(() =>
                        editor?.chain().focus().addColumnAfter().run(),
                      )
                    }
                  >
                    Insert column right
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      runTableBubbleAction(() =>
                        editor?.chain().focus().deleteColumn().run(),
                      )
                    }
                  >
                    Delete column
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      runTableBubbleAction(() => selectTableAxis("columns"))
                    }
                  >
                    Select column
                  </MenuItem>
                </>,
                "min-w-52",
              )
            : null}
        </div>

        <div className="relative">
          <ToolbarMenuButton
            ariaLabel="Row actions"
            icon={<Rows3 className="h-4 w-4" aria-hidden="true" />}
            isOpen={openTableBubbleSubmenu === "rows"}
            onClick={() => toggleTableBubbleSubmenu("rows")}
          />

          {openTableBubbleSubmenu === "rows"
            ? renderTableBubbleMenuPanel(
                <>
                  <MenuToggleItem
                    checked={currentRowIsHeader}
                    disabled={!canToggleHeaderRow}
                    onClick={() =>
                      runTableBubbleAction(() => toggleHeaderAxis("rows"))
                    }
                  >
                    Header row
                  </MenuToggleItem>
                  <MenuSeparator />
                  <MenuItem
                    onClick={() =>
                      runTableBubbleAction(() =>
                        editor?.chain().focus().addRowBefore().run(),
                      )
                    }
                  >
                    Insert row above
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      runTableBubbleAction(() =>
                        editor?.chain().focus().addRowAfter().run(),
                      )
                    }
                  >
                    Insert row below
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      runTableBubbleAction(() =>
                        editor?.chain().focus().deleteRow().run(),
                      )
                    }
                  >
                    Delete row
                  </MenuItem>
                  <MenuItem
                    onClick={() =>
                      runTableBubbleAction(() => selectTableAxis("rows"))
                    }
                  >
                    Select row
                  </MenuItem>
                </>,
                "min-w-52",
              )
            : null}
        </div>

        <div className="relative">
          <ToolbarSplitMenuButton
            ariaLabel="Merge or split selected cells"
            ariaMenuLabel="Merge and split cell options"
            icon={<TableCellsMerge className="h-4 w-4" aria-hidden="true" />}
            isOpen={openTableBubbleSubmenu === "merge"}
            menuDisabled={!hasDirectionalMergeAction && !canSplitCell}
            onClick={() => runTableBubbleAction(toggleMergeSelectedCells)}
            onMenuClick={() => toggleTableBubbleSubmenu("merge")}
            primaryDisabled={!canMergeSelection && !canSplitCell}
          />

          {openTableBubbleSubmenu === "merge"
            ? renderTableBubbleMenuPanel(
                <>
                  <MenuItem
                    disabled={!canMergeDirection.up}
                    onClick={() =>
                      runTableBubbleAction(() => mergeCellInDirection("up"))
                    }
                  >
                    Merge cell up
                  </MenuItem>
                  <MenuItem
                    disabled={!canMergeDirection.right}
                    onClick={() =>
                      runTableBubbleAction(() => mergeCellInDirection("right"))
                    }
                  >
                    Merge cell right
                  </MenuItem>
                  <MenuItem
                    disabled={!canMergeDirection.down}
                    onClick={() =>
                      runTableBubbleAction(() => mergeCellInDirection("down"))
                    }
                  >
                    Merge cell down
                  </MenuItem>
                  <MenuItem
                    disabled={!canMergeDirection.left}
                    onClick={() =>
                      runTableBubbleAction(() => mergeCellInDirection("left"))
                    }
                  >
                    Merge cell left
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem
                    disabled={!canSplitCell}
                    onClick={() => runTableBubbleAction(splitSelectedCell)}
                  >
                    Split cell
                  </MenuItem>
                </>,
                "min-w-52",
              )
            : null}
        </div>

        <div
          className="mx-0.5 h-7 w-px self-center bg-[var(--border-light)]"
          aria-hidden="true"
        />

        <ToolbarButton
          ariaLabel="Cell properties"
          onClick={openCellPropertiesView}
        >
          <CellPropertiesGridIcon />
        </ToolbarButton>

        <div
          className="mx-0.5 h-7 w-px self-center bg-[var(--border-light)]"
          aria-hidden="true"
        />

        <ToolbarButton
          ariaLabel="Delete table"
          onClick={() =>
            runTableBubbleAction(() =>
              editor?.chain().focus().deleteTable().run(),
            )
          }
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
      </div>
    );
  }

  function renderToolbarMenuPanel(content: ReactNode, className = "min-w-64") {
    return (
      <div
        role="menu"
        className={`absolute left-0 z-30 mt-1 overflow-hidden rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] py-1 shadow-[var(--shadow-card)] ${className}`}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="news-body-editor mt-2 overflow-visible rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-sm transition focus-within:border-[var(--border-orange)] focus-within:ring-2 focus-within:ring-[color:var(--brand)]/15"
    >
      <input
        ref={textColorInputRef}
        type="color"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        value={getColorInputValue(selectedTextColor, "#111827")}
        onChange={(event) => handleColorPickerChange(event, "text")}
      />
      <input
        ref={backgroundColorInputRef}
        type="color"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        value={getColorInputValue(selectedBackgroundColor, "#f8fafc")}
        onChange={(event) => handleColorPickerChange(event, "background")}
      />
      <input
        ref={cellBackgroundColorInputRef}
        type="color"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        value={getColorInputValue(selectedCellBackgroundColor, "#f8fafc")}
        onChange={(event) => handleColorPickerChange(event, "cell-background")}
      />

      <div className="relative z-20 flex flex-wrap gap-1 rounded-t-xl border-b border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 py-2">
        {topLevelMenus.map(({ key, label }) => (
          <div key={key} className="relative">
            <button
              type="button"
              aria-expanded={openMenu === key}
              aria-haspopup="menu"
              onClick={() => toggleMenu(key)}
              className={`inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
                openMenu === key
                  ? "bg-[var(--brand-pale)] text-[var(--brand)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              {label}
            </button>

            {openMenu === key ? (
              <div
                role="menu"
                className="absolute left-0 z-30 mt-1 min-w-64 overflow-visible rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] py-1 shadow-[var(--shadow-card)]"
              >
                {key === "edit" ? (
                  <>
                    <MenuItem
                      icon={<Undo2 className="h-4 w-4" />}
                      shortcut="Ctrl + Z"
                      disabled={!editorState?.canUndo}
                      onClick={() =>
                        runAction(() => editor?.chain().focus().undo().run())
                      }
                    >
                      Undo
                    </MenuItem>
                    <MenuItem
                      icon={<Redo2 className="h-4 w-4" />}
                      shortcut="Ctrl + Y"
                      disabled={!editorState?.canRedo}
                      onClick={() =>
                        runAction(() => editor?.chain().focus().redo().run())
                      }
                    >
                      Redo
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      icon={<SquareDashedText className="h-4 w-4" />}
                      shortcut="Ctrl + A"
                      onClick={() =>
                        runAction(() =>
                          editor?.chain().focus().selectAll().run(),
                        )
                      }
                    >
                      Select All
                    </MenuItem>
                  </>
                ) : null}

                {key === "view" ? <EmptyMenuItem /> : null}

                {key === "insert" ? (
                  <>
                    <SubmenuItem
                      icon={<ImageIcon className="h-4 w-4" />}
                      submenu={
                        <>
                          <MenuItem
                            icon={<ImageUp className="h-4 w-4" />}
                            disabled={!editor || isUploadingImage}
                            onClick={openUploadFromComputer}
                          >
                            {isUploadingImage
                              ? "Uploading image..."
                              : "Upload From Computer"}
                          </MenuItem>
                          <MenuItem
                            icon={<ImagePlusIcon className="h-4 w-4" />}
                            disabled={!editor || isUploadingImage}
                            onClick={openImageUrlModal}
                          >
                            Via Url
                          </MenuItem>
                        </>
                      }
                    >
                      Image
                    </SubmenuItem>
                    <SubmenuItem
                      icon={<Table2 className="h-4 w-4" />}
                      submenu={renderTableInsertMenuContent()}
                      submenuClassName="min-w-[17rem]"
                    >
                      Table
                    </SubmenuItem>
                    <MenuSeparator />
                    <MenuItem
                      icon={<Link className="h-4 w-4" />}
                      isActive={editorState?.link}
                      onClick={() => runAction(() => updateLink(editor))}
                    >
                      Link
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      icon={<Quote className="h-4 w-4" />}
                      isActive={editorState?.blockquote}
                      onClick={() =>
                        runAction(() =>
                          editor?.chain().focus().toggleBlockquote().run(),
                        )
                      }
                    >
                      Block Quote
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      icon={<Minus className="h-4 w-4" />}
                      onClick={() =>
                        runAction(() =>
                          editor?.chain().focus().setHorizontalRule().run(),
                        )
                      }
                    >
                      Horizontal Rule
                    </MenuItem>
                    <MenuItem
                      icon={<TableOfContentsIcon className="h-4 w-4" />}
                      onClick={() => runAction(insertTableOfContents)}
                    >
                      Table of Contents
                    </MenuItem>
                  </>
                ) : null}

                {key === "format" ? (
                  <>
                    <SubmenuItem
                      icon={<Type className="h-4 w-4" />}
                      submenu={
                        <>
                          <MenuItem
                            icon={<Bold className="h-4 w-4" />}
                            isActive={editorState?.bold}
                            shortcut="Ctrl + B"
                            onClick={() =>
                              runAction(() =>
                                editor?.chain().focus().toggleBold().run(),
                              )
                            }
                          >
                            Bold
                          </MenuItem>
                          <MenuItem
                            icon={<Italic className="h-4 w-4" />}
                            isActive={editorState?.italic}
                            shortcut="Ctrl + I"
                            onClick={() =>
                              runAction(() =>
                                editor?.chain().focus().toggleItalic().run(),
                              )
                            }
                          >
                            Italic
                          </MenuItem>
                          <MenuItem
                            icon={<Underline className="h-4 w-4" />}
                            isActive={editorState?.underline}
                            shortcut="Ctrl + U"
                            onClick={() =>
                              runAction(() =>
                                editor?.chain().focus().toggleUnderline().run(),
                              )
                            }
                          >
                            Underline
                          </MenuItem>
                          <MenuItem
                            icon={<Strikethrough className="h-4 w-4" />}
                            isActive={editorState?.strike}
                            onClick={() =>
                              runAction(() =>
                                editor?.chain().focus().toggleStrike().run(),
                              )
                            }
                          >
                            Strike Through
                          </MenuItem>
                          <MenuItem
                            icon={<SuperscriptIcon className="h-4 w-4" />}
                            isActive={editorState?.superscript}
                            onClick={() =>
                              runAction(() =>
                                editor
                                  ?.chain()
                                  .focus()
                                  .toggleSuperscript()
                                  .run(),
                              )
                            }
                          >
                            Superscript
                          </MenuItem>
                          <MenuItem
                            icon={<SubscriptIcon className="h-4 w-4" />}
                            isActive={editorState?.subscript}
                            onClick={() =>
                              runAction(() =>
                                editor?.chain().focus().toggleSubscript().run(),
                              )
                            }
                          >
                            Subscript
                          </MenuItem>
                          <MenuItem
                            icon={<Code2 className="h-4 w-4" />}
                            isActive={editorState?.code}
                            onClick={() =>
                              runAction(() =>
                                editor?.chain().focus().toggleCode().run(),
                              )
                            }
                          >
                            Code
                          </MenuItem>
                        </>
                      }
                    >
                      Text
                    </SubmenuItem>
                    <SubmenuItem
                      icon={<CaseSensitive className="h-4 w-4" />}
                      submenu={
                        <>
                          <SubmenuItem
                            icon={<TextCursorInput className="h-4 w-4" />}
                            submenu={renderFontSizeMenuItems(true)}
                          >
                            Font Size
                          </SubmenuItem>
                          <SubmenuItem
                            icon={<Type className="h-4 w-4" />}
                            submenu={renderFontFamilyMenuItems()}
                          >
                            Font Family
                          </SubmenuItem>
                          <MenuSeparator />
                          <SubmenuItem
                            icon={<Droplets className="h-4 w-4" />}
                            submenu={renderColorMenuContent("text", false)}
                          >
                            Font Color
                          </SubmenuItem>
                          <SubmenuItem
                            icon={<PaintBucket className="h-4 w-4" />}
                            submenu={renderColorMenuContent(
                              "background",
                              false,
                            )}
                          >
                            Font Background Color
                          </SubmenuItem>
                        </>
                      }
                    >
                      Font
                    </SubmenuItem>
                    <SubmenuItem
                      icon={<Type className="h-4 w-4" />}
                      submenu={renderHeadingMenuItems()}
                    >
                      Heading
                    </SubmenuItem>
                    <MenuSeparator />
                    <MenuItem
                      icon={<List className="h-4 w-4" />}
                      isActive={editorState?.bulletList}
                      onClick={() =>
                        runAction(() =>
                          editor?.chain().focus().toggleBulletList().run(),
                        )
                      }
                    >
                      Bulleted List
                    </MenuItem>
                    <MenuItem
                      icon={<ListOrdered className="h-4 w-4" />}
                      isActive={editorState?.orderedList}
                      onClick={() =>
                        runAction(() =>
                          editor?.chain().focus().toggleOrderedList().run(),
                        )
                      }
                    >
                      Numbered List
                    </MenuItem>
                    <MenuItem
                      icon={<TaskListIcon className="h-4 w-4" />}
                      isActive={editorState?.taskList}
                      onClick={() =>
                        runAction(() =>
                          editor?.chain().focus().toggleTaskList().run(),
                        )
                      }
                    >
                      Task List
                    </MenuItem>
                    <MenuSeparator />
                    <SubmenuItem
                      icon={<AlignLeft className="h-4 w-4" />}
                      submenu={renderTextAlignmentMenuItems()}
                    >
                      Text Alignment
                    </SubmenuItem>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-1.5 border-b border-[var(--border-light)] bg-[var(--bg-subtle)] px-2.5 py-2.5">
        <ToolbarButton
          ariaLabel="Undo"
          disabled={!editorState?.canUndo}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="Redo"
          disabled={!editorState?.canRedo}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarSeparator />

        <div className="relative">
          <button
            type="button"
            aria-expanded={openMenu === "heading"}
            aria-haspopup="menu"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => toggleMenu("heading")}
            className="inline-flex h-8 min-w-32 items-center justify-between gap-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
          >
            {getHeadingLabel(selectedHeading)}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openMenu === "heading" ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {openMenu === "heading"
            ? renderToolbarMenuPanel(renderHeadingMenuItems(), "min-w-44")
            : null}
        </div>

        <ToolbarSeparator />

        <div className="relative">
          <ToolbarMenuButton
            ariaLabel="Font family options"
            icon={<Type className="h-4 w-4" aria-hidden="true" />}
            isActive={selectedFontFamily !== null}
            isOpen={openMenu === "toolbar-font-family"}
            onClick={() => toggleMenu("toolbar-font-family")}
          />

          {openMenu === "toolbar-font-family"
            ? renderToolbarMenuPanel(renderFontFamilyMenuItems())
            : null}
        </div>

        <div className="relative">
          <ToolbarMenuButton
            ariaLabel="Font size options"
            icon={<TextCursorInput className="h-4 w-4" aria-hidden="true" />}
            isActive={selectedFontSize !== null}
            isOpen={openMenu === "toolbar-font-size"}
            onClick={() => toggleMenu("toolbar-font-size")}
          />

          {openMenu === "toolbar-font-size"
            ? renderToolbarMenuPanel(renderFontSizeMenuItems(false))
            : null}
        </div>

        <div className="relative">
          <ToolbarMenuButton
            ariaLabel="Text color options"
            icon={<Droplets className="h-4 w-4" aria-hidden="true" />}
            isActive={selectedTextColor !== null}
            isOpen={openMenu === "toolbar-text-color"}
            swatchColor={selectedTextColor}
            onClick={() => toggleMenu("toolbar-text-color")}
          />

          {openMenu === "toolbar-text-color"
            ? renderToolbarMenuPanel(renderColorMenuContent("text", true))
            : null}
        </div>

        <div className="relative">
          <ToolbarMenuButton
            ariaLabel="Text background color options"
            icon={<PaintBucket className="h-4 w-4" aria-hidden="true" />}
            isActive={selectedBackgroundColor !== null}
            isOpen={openMenu === "toolbar-background-color"}
            swatchColor={selectedBackgroundColor}
            onClick={() => toggleMenu("toolbar-background-color")}
          />

          {openMenu === "toolbar-background-color"
            ? renderToolbarMenuPanel(renderColorMenuContent("background", true))
            : null}
        </div>

        <ToolbarSeparator />

        <ToolbarButton
          ariaLabel="Toggle bold"
          isActive={editorState?.bold}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="Toggle italic"
          isActive={editorState?.italic}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          ariaLabel="Toggle underline"
          isActive={editorState?.underline}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" aria-hidden="true" />
        </ToolbarButton>

        <ToolbarSeparator />

        <div className="relative">
          <ToolbarMenuButton
            ariaLabel="Table options"
            icon={<Table2 className="h-4 w-4" aria-hidden="true" />}
            isOpen={openMenu === "toolbar-table"}
            onClick={() => toggleMenu("toolbar-table")}
          />

          {openMenu === "toolbar-table"
            ? renderToolbarMenuPanel(
                renderTableInsertMenuContent(),
                "min-w-[17rem]",
              )
            : null}
        </div>
      </div>

      <div
        onMouseDownCapture={() => {
          if (openMenu !== null) {
            closeMenu();
          }

          if (openCellPropertiesMenu !== null) {
            setOpenCellPropertiesMenu(null);
          }

          if (openTableBubbleSubmenu !== null) {
            closeTableBubbleSubmenu();
          }

          if (openImageBubbleSubmenu !== null) {
            closeImageBubbleSubmenu();
          }

          if (isImageAltEditorOpen) {
            setIsImageAltEditorOpen(false);
          }
        }}
      >
        <input
          ref={imageInputRef}
          type="file"
          accept={EDITOR_IMAGE_ALLOWED_MIME_TYPES.join(",")}
          onChange={handleImageInputChange}
          className="sr-only"
        />
        <EditorContent editor={editor} />
      </div>

      {editor ? (
        <BubbleMenu
          editor={editor}
          pluginKey={TABLE_BUBBLE_MENU_PLUGIN_KEY}
          appendTo={() => menuRef.current ?? document.body}
          options={{
            placement: "top",
            offset: 10,
            shift: true,
          }}
          shouldShow={({ editor: currentEditor, view }) => {
            const tableContext = getActiveTableContext(currentEditor);

            return (
              view.hasFocus() &&
              tableContext.tableActive &&
              getActiveTableElement(
                currentEditor,
                tableContext.activeTablePos,
              ) !== null
            );
          }}
          getReferencedVirtualElement={() => {
            const tableElement = getActiveTableElement(editor, activeTablePos);

            if (!tableElement) {
              return null;
            }

            return {
              contextElement: tableElement,
              getBoundingClientRect: () => getTableBubbleAnchorRect(tableElement),
            };
          }}
        >
          {renderTableBubbleContent()}
        </BubbleMenu>
      ) : null}

      {editor ? (
        <BubbleMenu
          editor={editor}
          pluginKey={IMAGE_BUBBLE_MENU_PLUGIN_KEY}
          appendTo={() => menuRef.current ?? document.body}
          options={{
            placement: "top",
            offset: 10,
            shift: true,
          }}
          shouldShow={({ editor: currentEditor, view }) => {
            const activeElement =
              typeof document !== "undefined" ? document.activeElement : null;
            const bubbleHasFocus =
              activeElement instanceof Node &&
              Boolean(menuRef.current?.contains(activeElement));

            return (
              getSelectedImageState(currentEditor) !== null &&
              (view.hasFocus() || bubbleHasFocus)
            );
          }}
          getReferencedVirtualElement={() => {
            const imageElement = getSelectedImageElement(editor);

            if (!imageElement) {
              return null;
            }

            return {
              contextElement: imageElement,
              getBoundingClientRect: () => imageElement.getBoundingClientRect(),
            };
          }}
        >
          {renderImageBubbleContent()}
        </BubbleMenu>
      ) : null}

      {isImageUrlModalOpen ? (
        <ImageUrlModal
          onClose={closeImageUrlModal}
          onSubmit={handleInsertImageUrl}
        />
      ) : null}
    </div>
  );
}
