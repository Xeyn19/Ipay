"use client";

import "../news-body-editor.css";
import { EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  AlignLeft,
  Bold,
  CaseSensitive,
  ChevronDown,
  Code2,
  Droplets,
  Eraser,
  Maximize2,
  Highlighter,
  Image as ImageIcon,
  ImagePlus as ImagePlusIcon,
  ImageUp,
  Italic,
  Link,
  List,
  ListOrdered,
  Minimize2,
  Minus,
  PaintBucket,
  Quote,
  Redo2,
  SquareDashedText,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table2,
  TextCursorInput,
  Type,
  Underline,
  Undo2,
  X,
  Strikethrough,
} from "lucide-react";
import { useId } from "react";
import {
  NEWS_ARTICLE_CONTENT_INSET_CLASS_NAME,
  NEWS_ARTICLE_FRAME_CLASS_NAME,
} from "@/app/lib/news-article-layout";
import {
  HIGHLIGHT_COLOR_OPTIONS,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  LINE_HEIGHT_OPTIONS,
} from "@/app/lib/news-body-text-styles";
import type {
  HeadingLevel,
  NewsBodyEditorProps,
  TopLevelMenuKey,
} from "./types";
import {
  EDITOR_IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_BUBBLE_MENU_PLUGIN_KEY,
  LINK_BUBBLE_MENU_PLUGIN_KEY,
  TABLE_BUBBLE_MENU_PLUGIN_KEY,
} from "./extensions";
import {
  useNewsBodyEditor,
  type NewsBodyEditorController,
} from "./hooks/use-news-body-editor";
import {
  getActiveTableContext,
  getActiveTableElement,
  getColorInputValue,
  getHeadingLabel,
  getSelectedImageElement,
  getSelectedImageState,
  getTableBubbleAnchorRect,
} from "./utils";
import {
  ColorMenuContent,
  ImageBubbleMenu,
  LinkBubbleMenu,
  LinkPreviewBubble,
  TableBubbleMenu,
  textAlignmentOptions,
} from "./components/bubble-menus";
import { ImageUrlModal } from "./components/ImageUrlModal";
import { TableInsertPicker } from "./components/TableInsertPicker";
import {
  LineHeightIcon,
  TableOfContentsIcon,
  TaskListIcon,
  VerticalEllipsisIcon,
} from "./components/icons";
import {
  MenuItem,
  MenuSeparator,
  SubmenuItem,
  ToolbarButton,
  ToolbarMenuButton,
  ToolbarMenuPanel,
  ToolbarSplitMenuButton,
  ToolbarSeparator,
} from "./components/primitives";

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

const topLevelMenus: Array<{ key: TopLevelMenuKey; label: string }> = [
  { key: "edit", label: "Edit" },
  { key: "view", label: "View" },
  { key: "insert", label: "Insert" },
  { key: "format", label: "Format" },
];

const toolbarOverflowMenuKeys = [
  "toolbar-overflow",
  "toolbar-overflow-highlight",
  "toolbar-overflow-text-alignment",
  "toolbar-overflow-line-height",
] as const;

function HighlightMenuIcon({
  color,
  className = "h-4 w-4",
}: {
  color: string;
  className?: string;
}) {
  return (
    <Highlighter className={className} style={{ color }} aria-hidden="true" />
  );
}

function HeadingMenuItems({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { commands, derivedState } = controller;

  return headingOptions.map((option) => (
    <MenuItem
      key={option.value}
      isActive={derivedState.selectedHeading === option.value}
      onClick={() =>
        commands.runAction(() => commands.applyHeading(option.value))
      }
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

function FontFamilyMenuItems({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { commands, derivedState, font } = controller;

  return FONT_FAMILY_OPTIONS.map((option) => (
    <MenuItem
      key={option.label}
      isActive={derivedState.selectedFontFamily === option.value}
      onClick={() =>
        commands.runAction(() => font.setFontFamilyValue(option.value))
      }
    >
      <span style={{ fontFamily: option.value }}>{option.label}</span>
    </MenuItem>
  ));
}

function FontSizeMenuItems({
  controller,
  includeStepActions,
}: {
  controller: NewsBodyEditorController;
  includeStepActions: boolean;
}) {
  const { commands, derivedState, font } = controller;

  return (
    <>
      {FONT_SIZE_OPTIONS.map((option) => (
        <MenuItem
          key={option.label}
          isActive={
            option.value === null
              ? derivedState.selectedFontSize === null
              : derivedState.selectedFontSize === option.value
          }
          onClick={() =>
            commands.runAction(() => font.setFontSizeValue(option.value))
          }
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
            onClick={() => commands.runAction(() => font.stepFontSize(1))}
          >
            Increase Font
          </MenuItem>
          <MenuItem
            icon={<TextCursorInput className="h-4 w-4" />}
            shortcut="Ctrl+Shift+,"
            onClick={() => commands.runAction(() => font.stepFontSize(-1))}
          >
            Decrease Font
          </MenuItem>
        </>
      ) : null}
    </>
  );
}

function TextAlignmentMenuItems({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { commands, derivedState, editor } = controller;

  return textAlignmentOptions.map((option) => (
    <MenuItem
      key={option.value}
      icon={option.icon}
      isActive={derivedState.selectedTextAlignment === option.value}
      onClick={() =>
        commands.runAction(() =>
          editor?.chain().focus().setTextAlign(option.value).run(),
        )
      }
    >
      {option.label}
    </MenuItem>
  ));
}

function LineHeightMenuItems({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { commands, derivedState, font } = controller;

  return LINE_HEIGHT_OPTIONS.map((option) => (
    <MenuItem
      key={option.value}
      icon={<LineHeightIcon className="h-4 w-4" />}
      isActive={derivedState.selectedLineHeight === option.value}
      onClick={() =>
        commands.runAction(() => font.setLineHeightValue(option.value))
      }
    >
      {option.label}
    </MenuItem>
  ));
}

function HighlightMenuItems({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { commands, derivedState, highlight } = controller;

  return (
    <>
      {HIGHLIGHT_COLOR_OPTIONS.map((option) => {
        return (
          <MenuItem
            key={option.value}
            icon={<HighlightMenuIcon color={option.value} />}
            isActive={derivedState.selectedHighlightColor === option.value}
            onClick={() =>
              commands.runAction(() =>
                highlight.applyHighlightColor(option.value),
              )
            }
          >
            {option.label}
          </MenuItem>
        );
      })}
      <MenuSeparator />
      <MenuItem
        icon={<Eraser className="h-4 w-4" />}
        disabled={!derivedState.isHighlightActive}
        onClick={() => commands.runAction(highlight.unsetHighlight)}
      >
        Remove Highlight
      </MenuItem>
    </>
  );
}

function EditMenu({ controller }: { controller: NewsBodyEditorController }) {
  const { commands, derivedState, editor } = controller;

  return (
    <>
      <MenuItem
        icon={<Undo2 className="h-4 w-4" />}
        shortcut="Ctrl + Z"
        disabled={!derivedState.editorState.canUndo}
        onClick={() =>
          commands.runAction(() => editor?.chain().focus().undo().run())
        }
      >
        Undo
      </MenuItem>
      <MenuItem
        icon={<Redo2 className="h-4 w-4" />}
        shortcut="Ctrl + Y"
        disabled={!derivedState.editorState.canRedo}
        onClick={() =>
          commands.runAction(() => editor?.chain().focus().redo().run())
        }
      >
        Redo
      </MenuItem>
      <MenuSeparator />
      <MenuItem
        icon={<SquareDashedText className="h-4 w-4" />}
        shortcut="Ctrl + A"
        onClick={() =>
          commands.runAction(() => editor?.chain().focus().selectAll().run())
        }
      >
        Select All
      </MenuItem>
    </>
  );
}

function ViewMenu({ controller }: { controller: NewsBodyEditorController }) {
  const { commands, fullscreen } = controller;

  return (
    <MenuItem
      icon={<Maximize2 className="h-4 w-4" />}
      isActive={fullscreen.isFullscreen}
      onClick={() => commands.runAction(fullscreen.toggleFullscreen)}
    >
      Fullscreen Mode
    </MenuItem>
  );
}

function InsertMenu({ controller }: { controller: NewsBodyEditorController }) {
  const { commands, derivedState, editor, image } = controller;

  return (
    <>
      <SubmenuItem
        icon={<ImageIcon className="h-4 w-4" />}
        submenu={
          <>
            <MenuItem
              icon={<ImageUp className="h-4 w-4" />}
              disabled={!editor || image.isUploadingImage}
              onClick={image.openUploadFromComputer}
            >
              {image.isUploadingImage
                ? "Uploading image..."
                : "Upload From Computer"}
            </MenuItem>
            <MenuItem
              icon={<ImagePlusIcon className="h-4 w-4" />}
              disabled={!editor || image.isUploadingImage}
              onClick={image.openImageUrlModal}
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
        submenu={<TableInsertPicker onInsert={commands.insertTable} />}
        submenuClassName="min-w-[17rem]"
      >
        Table
      </SubmenuItem>
      <MenuSeparator />
      <MenuItem
        icon={<Link className="h-4 w-4" />}
        isActive={derivedState.editorState.link}
        onClick={() => commands.runAction(commands.openLinkBubble)}
      >
        Link
      </MenuItem>
      <MenuSeparator />
      <MenuItem
        icon={<Quote className="h-4 w-4" />}
        isActive={derivedState.editorState.blockquote}
        onClick={() =>
          commands.runAction(() =>
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
          commands.runAction(() =>
            editor?.chain().focus().setHorizontalRule().run(),
          )
        }
      >
        Horizontal Rule
      </MenuItem>
      <MenuItem
        icon={<TableOfContentsIcon className="h-4 w-4" />}
        onClick={() => commands.runAction(commands.insertTableOfContents)}
      >
        Table of Contents
      </MenuItem>
    </>
  );
}

function FormatMenu({ controller }: { controller: NewsBodyEditorController }) {
  const { commands, derivedState, editor } = controller;

  return (
    <>
      <SubmenuItem
        icon={<Type className="h-4 w-4" />}
        submenu={
          <>
            <MenuItem
              icon={<Bold className="h-4 w-4" />}
              isActive={derivedState.editorState.bold}
              shortcut="Ctrl + B"
              onClick={() =>
                commands.runAction(() =>
                  editor?.chain().focus().toggleBold().run(),
                )
              }
            >
              Bold
            </MenuItem>
            <MenuItem
              icon={<Italic className="h-4 w-4" />}
              isActive={derivedState.editorState.italic}
              shortcut="Ctrl + I"
              onClick={() =>
                commands.runAction(() =>
                  editor?.chain().focus().toggleItalic().run(),
                )
              }
            >
              Italic
            </MenuItem>
            <MenuItem
              icon={<Underline className="h-4 w-4" />}
              isActive={derivedState.editorState.underline}
              shortcut="Ctrl + U"
              onClick={() =>
                commands.runAction(() =>
                  editor?.chain().focus().toggleUnderline().run(),
                )
              }
            >
              Underline
            </MenuItem>
            <MenuItem
              icon={<Strikethrough className="h-4 w-4" />}
              isActive={derivedState.editorState.strike}
              onClick={() =>
                commands.runAction(() =>
                  editor?.chain().focus().toggleStrike().run(),
                )
              }
            >
              Strike Through
            </MenuItem>
            <MenuItem
              icon={<SuperscriptIcon className="h-4 w-4" />}
              isActive={derivedState.editorState.superscript}
              onClick={() =>
                commands.runAction(() =>
                  editor?.chain().focus().toggleSuperscript().run(),
                )
              }
            >
              Superscript
            </MenuItem>
            <MenuItem
              icon={<SubscriptIcon className="h-4 w-4" />}
              isActive={derivedState.editorState.subscript}
              onClick={() =>
                commands.runAction(() =>
                  editor?.chain().focus().toggleSubscript().run(),
                )
              }
            >
              Subscript
            </MenuItem>
            <MenuItem
              icon={<Code2 className="h-4 w-4" />}
              isActive={derivedState.editorState.code}
              onClick={() =>
                commands.runAction(() =>
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
              submenu={
                <FontSizeMenuItems controller={controller} includeStepActions />
              }
            >
              Font Size
            </SubmenuItem>
            <SubmenuItem
              icon={<Type className="h-4 w-4" />}
              submenu={<FontFamilyMenuItems controller={controller} />}
            >
              Font Family
            </SubmenuItem>
            <MenuSeparator />
            <SubmenuItem
              icon={<Droplets className="h-4 w-4" />}
              submenu={
                <ColorMenuContent
                  controller={controller}
                  includeColorPicker={false}
                  mode="text"
                />
              }
            >
              Font Color
            </SubmenuItem>
            <SubmenuItem
              icon={<PaintBucket className="h-4 w-4" />}
              submenu={
                <ColorMenuContent
                  controller={controller}
                  includeColorPicker={false}
                  mode="background"
                />
              }
            >
              Font Background Color
            </SubmenuItem>
            <MenuSeparator />
            <SubmenuItem
              icon={
                <HighlightMenuIcon
                  color={controller.highlight.lastUsedHighlightColor}
                />
              }
              submenu={
                <HighlightMenuItems controller={controller} />
              }
            >
              Highlight
            </SubmenuItem>
          </>
        }
      >
        Font
      </SubmenuItem>
      <SubmenuItem
        icon={<Type className="h-4 w-4" />}
        submenu={<HeadingMenuItems controller={controller} />}
      >
        Heading
      </SubmenuItem>
      <MenuSeparator />
      <MenuItem
        icon={<List className="h-4 w-4" />}
        isActive={derivedState.editorState.bulletList}
        onClick={() =>
          commands.runAction(() =>
            editor?.chain().focus().toggleBulletList().run(),
          )
        }
      >
        Bulleted List
      </MenuItem>
      <MenuItem
        icon={<ListOrdered className="h-4 w-4" />}
        isActive={derivedState.editorState.orderedList}
        onClick={() =>
          commands.runAction(() =>
            editor?.chain().focus().toggleOrderedList().run(),
          )
        }
      >
        Numbered List
      </MenuItem>
      <MenuItem
        icon={<TaskListIcon className="h-4 w-4" />}
        isActive={derivedState.editorState.taskList}
        onClick={() =>
          commands.runAction(() =>
            editor?.chain().focus().toggleTaskList().run(),
          )
        }
      >
        Task List
      </MenuItem>
      <MenuSeparator />
      <SubmenuItem
        icon={<AlignLeft className="h-4 w-4" />}
        submenu={<TextAlignmentMenuItems controller={controller} />}
      >
        Text Alignment
      </SubmenuItem>
      <SubmenuItem
        icon={<LineHeightIcon className="h-4 w-4" />}
        submenu={<LineHeightMenuItems controller={controller} />}
      >
        Line Height
      </SubmenuItem>
    </>
  );
}

function TopLevelMenuContent({
  controller,
  menuKey,
}: {
  controller: NewsBodyEditorController;
  menuKey: TopLevelMenuKey;
}) {
  if (menuKey === "edit") {
    return <EditMenu controller={controller} />;
  }

  if (menuKey === "view") {
    return <ViewMenu controller={controller} />;
  }

  if (menuKey === "insert") {
    return <InsertMenu controller={controller} />;
  }

  return <FormatMenu controller={controller} />;
}

function TopMenuBar({ controller }: { controller: NewsBodyEditorController }) {
  const { menu } = controller;

  return (
    <div className="relative z-20 flex flex-wrap gap-1 rounded-t-xl border-b border-[var(--border-light)] bg-[var(--bg-elevated)] px-2 py-2">
      {topLevelMenus.map(({ key, label }) => (
        <div key={key} className="relative">
          <button
            type="button"
            aria-expanded={menu.openMenu === key}
            aria-haspopup="menu"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => menu.toggleMenu(key)}
            className={`inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
              menu.openMenu === key
                ? "bg-[var(--brand-pale)] text-[var(--brand)]"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            }`}
          >
            {label}
          </button>

          {menu.openMenu === key ? (
            <div
              role="menu"
              className="absolute left-0 z-30 mt-1 min-w-64 overflow-visible rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] py-1 shadow-[var(--shadow-card)]"
            >
              <TopLevelMenuContent controller={controller} menuKey={key} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function isToolbarOverflowMenuOpen(openMenu: NewsBodyEditorController["menu"]["openMenu"]) {
  return toolbarOverflowMenuKeys.includes(
    openMenu as (typeof toolbarOverflowMenuKeys)[number],
  );
}

function SecondaryToolbarControls({
  controller,
  mode,
}: {
  controller: NewsBodyEditorController;
  mode: "inline" | "overflow";
}) {
  const { commands, derivedState, editor, highlight, menu } = controller;
  const activeAlignmentOption =
    textAlignmentOptions.find(
      (option) => option.value === derivedState.selectedTextAlignment,
    ) ?? textAlignmentOptions[0];
  const menuKeys =
    mode === "overflow"
      ? {
          highlight: "toolbar-overflow-highlight" as const,
          lineHeight: "toolbar-overflow-line-height" as const,
          textAlignment: "toolbar-overflow-text-alignment" as const,
        }
      : {
          highlight: "toolbar-highlight" as const,
          lineHeight: "toolbar-line-height" as const,
          textAlignment: "toolbar-text-alignment" as const,
        };

  function runListAction(action: () => void) {
    if (mode === "overflow") {
      commands.runAction(action);
      return;
    }

    action();
  }

  return (
    <div
      className={`flex items-center whitespace-nowrap ${
        mode === "overflow" ? "gap-1" : "gap-1.5"
      }`}
    >
      <div className="relative">
        <ToolbarSplitMenuButton
          ariaLabel="Apply highlight"
          ariaMenuLabel="Highlight color options"
          icon={
            <HighlightMenuIcon
              color={highlight.lastUsedHighlightColor}
              className="h-4 w-4"
            />
          }
          isActive={derivedState.isHighlightActive}
          isOpen={menu.openMenu === menuKeys.highlight}
          onClick={highlight.applyCurrentHighlightColor}
          onMenuClick={() => menu.toggleMenu(menuKeys.highlight)}
        />

        {menu.openMenu === menuKeys.highlight ? (
          <ToolbarMenuPanel className="min-w-48">
            <HighlightMenuItems controller={controller} />
          </ToolbarMenuPanel>
        ) : null}
      </div>

      <ToolbarSeparator />

      <div className="relative">
        <ToolbarMenuButton
          ariaLabel="Text alignment options"
          icon={activeAlignmentOption.icon}
          isActive={derivedState.selectedTextAlignment !== null}
          isOpen={menu.openMenu === menuKeys.textAlignment}
          onClick={() => menu.toggleMenu(menuKeys.textAlignment)}
        />

        {menu.openMenu === menuKeys.textAlignment ? (
          <ToolbarMenuPanel className="min-w-48">
            <TextAlignmentMenuItems controller={controller} />
          </ToolbarMenuPanel>
        ) : null}
      </div>

      <div className="relative">
        <ToolbarMenuButton
          ariaLabel="Line height options"
          icon={<LineHeightIcon className="h-4 w-4" aria-hidden="true" />}
          isActive={derivedState.selectedTextStyle?.lineHeight !== null}
          isOpen={menu.openMenu === menuKeys.lineHeight}
          onClick={() => menu.toggleMenu(menuKeys.lineHeight)}
        />

        {menu.openMenu === menuKeys.lineHeight ? (
          <ToolbarMenuPanel className="min-w-48">
            <LineHeightMenuItems controller={controller} />
          </ToolbarMenuPanel>
        ) : null}
      </div>

      <ToolbarSeparator />

      <ToolbarButton
        ariaLabel="Toggle bulleted list"
        isActive={derivedState.editorState.bulletList}
        onClick={() =>
          runListAction(() => editor?.chain().focus().toggleBulletList().run())
        }
      >
        <List className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        ariaLabel="Toggle numbered list"
        isActive={derivedState.editorState.orderedList}
        onClick={() =>
          runListAction(() => editor?.chain().focus().toggleOrderedList().run())
        }
      >
        <ListOrdered className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
      <ToolbarButton
        ariaLabel="Toggle task list"
        isActive={derivedState.editorState.taskList}
        onClick={() =>
          runListAction(() => editor?.chain().focus().toggleTaskList().run())
        }
      >
        <TaskListIcon className="h-4 w-4" aria-hidden="true" />
      </ToolbarButton>
    </div>
  );
}

function ToolbarSection({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { commands, derivedState, editor, fullscreen, menu } = controller;
  const isInlineMode = !fullscreen.isFullscreen;
  const isOverflowOpen = isToolbarOverflowMenuOpen(menu.openMenu);

  function toggleOverflowPanel() {
    if (isOverflowOpen) {
      menu.closeMenu();
      return;
    }

    menu.setOpenMenu("toolbar-overflow");
  }

  return (
    <div className="relative z-10 flex items-center gap-2 border-b border-[var(--border-light)] bg-[var(--bg-subtle)] px-1.5 py-2">
      <div className="min-w-0 flex-1">
        <div
          className={`flex min-w-max items-center whitespace-nowrap gap-1`}
        >
          <ToolbarButton
            ariaLabel="Undo"
            disabled={!derivedState.editorState.canUndo}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            ariaLabel="Redo"
            disabled={!derivedState.editorState.canRedo}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <Redo2 className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>

          <ToolbarSeparator />

          <div className="relative">
            <button
              type="button"
              aria-expanded={menu.openMenu === "heading"}
              aria-haspopup="menu"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => menu.toggleMenu("heading")}
              className={`inline-flex h-8 items-center justify-between gap-1 min-w-24 px-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]`}
            >
              {getHeadingLabel(derivedState.selectedHeading)}
              <ChevronDown
                size={12}
                className={`transition-transform ${
                  menu.openMenu === "heading" ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>

            {menu.openMenu === "heading" ? (
              <ToolbarMenuPanel className="min-w-44">
                <HeadingMenuItems controller={controller} />
              </ToolbarMenuPanel>
            ) : null}
          </div>

          <ToolbarSeparator />

          <div className="relative">
            <ToolbarMenuButton
              ariaLabel="Font family options"
              icon={<Type className="h-4 w-4" aria-hidden="true" />}
              isActive={derivedState.selectedFontFamily !== null}
              isOpen={menu.openMenu === "toolbar-font-family"}
              onClick={() => menu.toggleMenu("toolbar-font-family")}
            />

            {menu.openMenu === "toolbar-font-family" ? (
              <ToolbarMenuPanel>
                <FontFamilyMenuItems controller={controller} />
              </ToolbarMenuPanel>
            ) : null}
          </div>

          <div className="relative">
            <ToolbarMenuButton
              ariaLabel="Font size options"
              icon={<TextCursorInput className="h-4 w-4" aria-hidden="true" />}
              isActive={derivedState.selectedFontSize !== null}
              isOpen={menu.openMenu === "toolbar-font-size"}
              onClick={() => menu.toggleMenu("toolbar-font-size")}
            />

            {menu.openMenu === "toolbar-font-size" ? (
              <ToolbarMenuPanel>
                <FontSizeMenuItems
                  controller={controller}
                  includeStepActions={false}
                />
              </ToolbarMenuPanel>
            ) : null}
          </div>

          <div className="relative">
            <ToolbarMenuButton
              ariaLabel="Text color options"
              icon={<Droplets className="h-4 w-4" aria-hidden="true" />}
              isActive={derivedState.selectedTextColor !== null}
              isOpen={menu.openMenu === "toolbar-text-color"}
              swatchColor={derivedState.selectedTextColor}
              onClick={() => menu.toggleMenu("toolbar-text-color")}
            />

            {menu.openMenu === "toolbar-text-color" ? (
              <ToolbarMenuPanel>
                <ColorMenuContent
                  controller={controller}
                  includeColorPicker
                  mode="text"
                />
              </ToolbarMenuPanel>
            ) : null}
          </div>

          <div className="relative">
            <ToolbarMenuButton
              ariaLabel="Text background color options"
              icon={<PaintBucket className="h-4 w-4" aria-hidden="true" />}
              isActive={derivedState.selectedBackgroundColor !== null}
              isOpen={menu.openMenu === "toolbar-background-color"}
              swatchColor={derivedState.selectedBackgroundColor}
              onClick={() => menu.toggleMenu("toolbar-background-color")}
            />

            {menu.openMenu === "toolbar-background-color" ? (
              <ToolbarMenuPanel>
                <ColorMenuContent
                  controller={controller}
                  includeColorPicker
                  mode="background"
                />
              </ToolbarMenuPanel>
            ) : null}
          </div>

          <ToolbarSeparator />

          <ToolbarButton
            ariaLabel="Toggle bold"
            isActive={derivedState.editorState.bold}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            ariaLabel="Toggle italic"
            isActive={derivedState.editorState.italic}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            ariaLabel="Toggle underline"
            isActive={derivedState.editorState.underline}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <Underline className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>

          <ToolbarSeparator />

          <ToolbarButton
            ariaLabel="Insert or edit link"
            isActive={Boolean(
              derivedState.activeLinkBubbleMode || derivedState.editorState.link,
            )}
            onClick={commands.openLinkBubble}
          >
            <Link className="h-4 w-4" aria-hidden="true" />
          </ToolbarButton>

          <div className="relative">
            <ToolbarMenuButton
              ariaLabel="Table options"
              icon={<Table2 className="h-4 w-4" aria-hidden="true" />}
              isOpen={menu.openMenu === "toolbar-table"}
              onClick={() => menu.toggleMenu("toolbar-table")}
            />

            {menu.openMenu === "toolbar-table" ? (
              <ToolbarMenuPanel className="min-w-[17rem]">
                <TableInsertPicker onInsert={commands.insertTable} />
              </ToolbarMenuPanel>
            ) : null}
          </div>
          {isInlineMode ? (
            <>
              <ToolbarSeparator />
              <div className="relative shrink-0">
                <ToolbarMenuButton
                  ariaLabel="More formatting options"
                  icon={<VerticalEllipsisIcon className="h-4 w-4" />}
                  isOpen={isOverflowOpen}
                  onClick={toggleOverflowPanel}
                />

                {isOverflowOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-30 mt-1 flex items-center gap-1 overflow-visible whitespace-nowrap rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] p-2 shadow-[var(--shadow-card)]"
                  >
                    <SecondaryToolbarControls controller={controller} mode="overflow" />
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <ToolbarSeparator />
              <SecondaryToolbarControls controller={controller} mode="inline" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NewsBodyEditorView({
  controller,
}: {
  controller: NewsBodyEditorController;
}) {
  const { colors, commands, derivedState, editor, fullscreen, image, link, refs } =
    controller;
  const menuRef = refs.menuRef;
  const textColorInputRef = refs.textColorInputRef;
  const backgroundColorInputRef = refs.backgroundColorInputRef;
  const cellBackgroundColorInputRef = refs.cellBackgroundColorInputRef;
  const tableBorderColorInputRef = refs.tableBorderColorInputRef;
  const imageInputRef = refs.imageInputRef;
  const fullscreenTitleId = useId();
  const fullscreenCardClassName = fullscreen.isFullscreen
    ? "news-body-editor is-fullscreen relative flex min-h-0 w-full flex-1 flex-col overflow-visible rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)] transition focus-within:border-[var(--border-orange)] focus-within:ring-2 focus-within:ring-[color:var(--brand)]/15"
    : "news-body-editor mt-2 overflow-visible rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-sm transition focus-within:border-[var(--border-orange)] focus-within:ring-2 focus-within:ring-[color:var(--brand)]/15";
  const fullscreenContentFrameClassName = [
    "news-body-editor__content-shell",
    fullscreen.isFullscreen
      ? `${NEWS_ARTICLE_FRAME_CLASS_NAME} ${NEWS_ARTICLE_CONTENT_INSET_CLASS_NAME} py-6 sm:py-8 lg:py-10`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const editorSurface = (
    <div
      ref={(node) => {
        menuRef.current = node;
      }}
      className={fullscreenCardClassName}
    >
      <input
        ref={(node) => {
          textColorInputRef.current = node;
        }}
        type="color"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        value={getColorInputValue(derivedState.selectedTextColor, "#111827")}
        onChange={(event) => colors.handleColorPickerChange(event, "text")}
      />
      <input
        ref={(node) => {
          backgroundColorInputRef.current = node;
        }}
        type="color"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        value={getColorInputValue(
          derivedState.selectedBackgroundColor,
          "#f8fafc",
        )}
        onChange={(event) =>
          colors.handleColorPickerChange(event, "background")
        }
      />
      <input
        ref={(node) => {
          cellBackgroundColorInputRef.current = node;
        }}
        type="color"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        value={getColorInputValue(
          derivedState.selectedCellBackgroundColor,
          "#f8fafc",
        )}
        onChange={(event) =>
          colors.handleColorPickerChange(event, "cell-background")
        }
      />
      <input
        ref={(node) => {
          tableBorderColorInputRef.current = node;
        }}
        type="color"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        value={getColorInputValue(
          derivedState.selectedTableBorderColor,
          "#d1d5db",
        )}
        onChange={(event) => colors.handleColorPickerChange(event, "table-border")}
      />

      <TopMenuBar controller={controller} />
      <ToolbarSection controller={controller} />

      <div
        className={fullscreen.isFullscreen ? "min-h-0 flex-1 overflow-y-auto" : ""}
        onMouseDownCapture={commands.editorSurfaceMouseDownCapture}
      >
        <input
          ref={(node) => {
            imageInputRef.current = node;
          }}
          type="file"
          accept={EDITOR_IMAGE_ALLOWED_MIME_TYPES.join(",")}
          onChange={image.handleImageInputChange}
          className="sr-only"
        />
        <div className={fullscreenContentFrameClassName}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {link.isLinkFormOpen && link.linkFormAnchorRect ? (
        <div
          className="news-body-editor__floating-link-bubble"
          style={{
            left: `${link.linkFormAnchorRect.left}px`,
            top: `${link.linkFormAnchorRect.top}px`,
          }}
        >
          <LinkBubbleMenu controller={controller} />
        </div>
      ) : null}

      {editor ? (
        <BubbleMenu
          editor={editor}
          pluginKey={LINK_BUBBLE_MENU_PLUGIN_KEY}
          appendTo={() => refs.menuRef.current ?? document.body}
          options={{
            placement: "top",
            offset: 10,
            shift: true,
          }}
          shouldShow={({ view }) => {
            const activeElement =
              typeof document !== "undefined" ? document.activeElement : null;
            const bubbleHasFocus =
              activeElement instanceof Node &&
              Boolean(refs.menuRef.current?.contains(activeElement));

            return (
              !link.isLinkFormOpen &&
              link.activePreviewLink !== null &&
              link.linkPreviewAnchorRect !== null &&
              (view.hasFocus() || bubbleHasFocus)
            );
          }}
          getReferencedVirtualElement={() => {
            const anchorRect = link.linkPreviewAnchorRect;

            if (!anchorRect) {
              return null;
            }

            return {
              contextElement: refs.menuRef.current ?? editor.view.dom,
              getBoundingClientRect: () => anchorRect,
            };
          }}
        >
          <LinkPreviewBubble controller={controller} />
        </BubbleMenu>
      ) : null}

      {editor ? (
        <BubbleMenu
          editor={editor}
          pluginKey={TABLE_BUBBLE_MENU_PLUGIN_KEY}
          appendTo={() => refs.menuRef.current ?? document.body}
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
            const tableElement = getActiveTableElement(
              editor,
              derivedState.activeTablePos,
            );

            if (!tableElement) {
              return null;
            }

            return {
              contextElement: tableElement,
              getBoundingClientRect: () =>
                getTableBubbleAnchorRect(tableElement),
            };
          }}
        >
          <TableBubbleMenu controller={controller} />
        </BubbleMenu>
      ) : null}

      {editor ? (
        <BubbleMenu
          editor={editor}
          pluginKey={IMAGE_BUBBLE_MENU_PLUGIN_KEY}
          appendTo={() => refs.menuRef.current ?? document.body}
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
              Boolean(refs.menuRef.current?.contains(activeElement));

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
          <ImageBubbleMenu controller={controller} />
        </BubbleMenu>
      ) : null}

      {image.isImageUrlModalOpen ? (
        <ImageUrlModal
          onClose={image.closeImageUrlModal}
          onSubmit={image.handleInsertImageUrl}
        />
      ) : null}
    </div>
  );

  if (!fullscreen.isFullscreen) {
    return editorSurface;
  }

  return (
    <div className="fixed inset-0 z-[90] bg-[color:var(--bg-base)]/96 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={fullscreenTitleId}
        className="flex h-full flex-col p-3 sm:p-4 lg:p-6"
      >
        <div className="mx-auto flex w-full max-w-[96rem] items-center justify-between gap-4 pb-3">
          <div className="min-w-0">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
              Editor View
            </p>
            <h2
              id={fullscreenTitleId}
              className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]"
            >
              Fullscreen mode
            </h2>
          </div>

          <button
            type="button"
            onClick={fullscreen.closeFullscreen}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] shadow-sm transition hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
          >
            <Minimize2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Exit fullscreen</span>
            <X className="h-4 w-4 sm:hidden" aria-hidden="true" />
          </button>
        </div>

        <div className="mx-auto flex min-h-0 w-full max-w-[96rem] flex-1">
          {editorSurface}
        </div>
      </section>
    </div>
  );
}

export function NewsBodyEditor(props: NewsBodyEditorProps) {
  const controller = useNewsBodyEditor(props);

  return <NewsBodyEditorView controller={controller} />;
}
