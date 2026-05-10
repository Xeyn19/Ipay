"use client";

import "./news-body-editor.css";
import {
  type ChangeEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
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
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CaseSensitive,
  ChevronDown,
  ChevronRight,
  Code2,
  Droplets,
  Eraser,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  PaintBucket,
  Palette,
  Quote,
  Redo2,
  SquareDashedText,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  TextCursorInput,
  Type,
  Underline,
  Undo2,
} from "lucide-react";
import {
  collectDocumentTextStyleColors,
  DEFAULT_TEXT_STYLE_COLORS,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  normalizeTextStyleAttributes,
  stepFontSizeValue,
  type NewsBodyTextStyleAttributes,
} from "@/app/lib/news-body-text-styles";
import { EMPTY_NEWS_BODY } from "@/app/lib/news-media";

type NewsBodyEditorProps = {
  initialContent: JSONContent | null;
  onChange: (value: JSONContent) => void;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type TextAlignment = "left" | "right" | "center" | "justify" | null;
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
  value: Exclude<TextAlignment, null>;
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
      className={`inline-flex h-8 min-w-4 items-center justify-between gap-1.5 rounded-lg border px-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
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
        className={`h-4 w-4 shrink-0 transition-transform ${
          isOpen ? "rotate-180" : ""
        }`}
        aria-hidden="true"
      />
    </button>
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

function SubmenuItem({
  children,
  submenu,
  icon,
}: {
  children: ReactNode;
  submenu: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div
      className="[&:hover>.submenu-panel]:visible [&:hover>.submenu-panel]:opacity-100 relative"
      role="none"
    >
      <button
        type="button"
        role="menuitem"
        onMouseDown={(event) => event.preventDefault()}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      >
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">{children}</span>
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </button>
      <div className="submenu-panel invisible absolute left-full top-0 z-30 -ml-px min-w-64 overflow-visible rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] py-1 opacity-0 shadow-[var(--shadow-card)] transition">
        {submenu}
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

export function NewsBodyEditor({
  initialContent,
  onChange,
}: NewsBodyEditorProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const textColorInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundColorInputRef = useRef<HTMLInputElement | null>(null);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);

  const editor = useEditor({
    content: initialContent ?? EMPTY_NEWS_BODY,
    extensions: [
      StarterKit,
      Superscript,
      Subscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontSize,
      FontFamily,
      Color,
      BackgroundColor,
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
          canRedo: false,
          canUndo: false,
          code: false,
          currentHeading: "paragraph" as const,
          currentTextAlign: null as TextAlignment,
          currentTextStyle: null as NewsBodyTextStyleAttributes | null,
          documentColors: collectDocumentTextStyleColors(
            initialContent ?? EMPTY_NEWS_BODY,
          ),
          italic: false,
          link: false,
          orderedList: false,
          strike: false,
          subscript: false,
          superscript: false,
          underline: false,
        };
      }

      return {
        blockquote: currentEditor.isActive("blockquote"),
        bold: currentEditor.isActive("bold"),
        bulletList: currentEditor.isActive("bulletList"),
        canRedo: currentEditor.can().redo(),
        canUndo: currentEditor.can().undo(),
        code: currentEditor.isActive("code"),
        currentHeading: getCurrentHeading(currentEditor),
        currentTextAlign: getCurrentTextAlignment(currentEditor),
        currentTextStyle: getCurrentTextStyle(currentEditor),
        documentColors: collectDocumentTextStyleColors(currentEditor.getJSON()),
        italic: currentEditor.isActive("italic"),
        link: currentEditor.isActive("link"),
        orderedList: currentEditor.isActive("orderedList"),
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
  const documentColors = editorState?.documentColors ?? {
    backgroundColors: [],
    textColors: [],
  };

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
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, selectedFontSize]);

  function openColorPicker(mode: "text" | "background") {
    if (mode === "text") {
      textColorInputRef.current?.click();
      return;
    }

    backgroundColorInputRef.current?.click();
  }

  function handleColorPickerChange(
    event: ChangeEvent<HTMLInputElement>,
    mode: "text" | "background",
  ) {
    const value = event.target.value;

    if (!value) {
      return;
    }

    if (mode === "text") {
      setTextColorValue(value);
    } else {
      setBackgroundColorValue(value);
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
        onSelect={(color) => runAction(() => onSelect(color))}
      />
    );
  }

  function renderColorMenuContent(
    mode: "text" | "background",
    includeColorPicker: boolean,
  ) {
    const isTextColorMode = mode === "text";
    const activeColor = isTextColorMode
      ? selectedTextColor
      : selectedBackgroundColor;
    const documentPalette = isTextColorMode
      ? documentColors.textColors
      : documentColors.backgroundColors;

    return (
      <>
        <MenuItem
          icon={<Eraser className="h-4 w-4" />}
          disabled={!activeColor}
          onClick={() =>
            runAction(() =>
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
          onSelect={(color) =>
            runAction(() =>
              isTextColorMode
                ? setTextColorValue(color)
                : setBackgroundColorValue(color),
            )
          }
        />
        <MenuSectionLabel>Document Colors</MenuSectionLabel>
        {renderDocumentColorSection(documentPalette, activeColor, (color) => {
          if (isTextColorMode) {
            setTextColorValue(color);
            return;
          }

          setBackgroundColorValue(color);
        })}
        {includeColorPicker ? (
          <>
            <MenuSeparator />
            <MenuItem
              icon={<Palette className="h-4 w-4" />}
              onClick={() =>
                openColorPicker(isTextColorMode ? "text" : "background")
              }
            >
              Color Picker
            </MenuItem>
          </>
        ) : null}
      </>
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
      </div>

      <div
        onMouseDownCapture={() => {
          if (openMenu !== null) {
            closeMenu();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
