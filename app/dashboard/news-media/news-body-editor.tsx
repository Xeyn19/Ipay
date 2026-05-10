"use client";

import "./news-body-editor.css";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  ChevronDown,
  ChevronRight,
  Code2,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  SquareDashedText,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Underline,
  Undo2,
} from "lucide-react";
import { EMPTY_NEWS_BODY } from "@/app/lib/news-media";

type NewsBodyEditorProps = {
  initialContent: JSONContent | null;
  onChange: (value: JSONContent) => void;
};

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type OpenMenu = "edit" | "view" | "insert" | "format" | "heading" | null;

type ToolbarButtonProps = {
  ariaLabel: string;
  children: ReactNode;
  disabled?: boolean;
  isActive?: boolean;
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
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive
          ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]"
          : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarSeparator() {
  return (
    <div
      className="mx-1 h-9 w-px self-center bg-[var(--border-light)]"
      aria-hidden="true"
    />
  );
}

function MenuSeparator() {
  return (
    <div className="my-1 h-px bg-[var(--border-light)]" role="separator" />
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
      {shortcut && (
        <kbd className="ml-4 shrink-0 text-xs font-medium text-[var(--text-faint)]">
          {shortcut}
        </kbd>
      )}
    </button>
  );
}

function SubmenuItem({
  children,
  submenu,
}: {
  children: ReactNode;
  submenu: ReactNode;
}) {
  return (
    <div className="group/submenu relative" role="none">
      <button
        type="button"
        role="menuitem"
        onMouseDown={(event) => event.preventDefault()}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      >
        <span className="min-w-0 flex-1">{children}</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
      <div className="invisible absolute left-full top-0 z-30 ml-1 min-w-56 overflow-hidden rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] py-1 opacity-0 shadow-[var(--shadow-card)] transition group-hover/submenu:visible group-hover/submenu:opacity-100">
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

function updateLink(editor: Editor | null) {
  if (!editor) {
    return;
  }

  const previousHref = editor.getAttributes("link").href as string | undefined;
  // TODO: Replace this browser prompt with a custom editor popover.
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

export function NewsBodyEditor({
  initialContent,
  onChange,
}: NewsBodyEditorProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);

  const editor = useEditor({
    content: initialContent ?? EMPTY_NEWS_BODY,
    extensions: [StarterKit, Superscript, Subscript],
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON());
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

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
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
  }, []);

  function closeMenu() {
    setOpenMenu(null);
  }

  function runAction(action: () => void) {
    action();
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

  return (
    <div
      ref={menuRef}
      className="news-body-editor mt-2 overflow-visible rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-sm transition focus-within:border-[var(--border-orange)] focus-within:ring-2 focus-within:ring-[color:var(--brand)]/15"
    >
      <div className="relative z-20 flex flex-wrap gap-1 rounded-t-xl border-b border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 py-2">
        {[
          ["edit", "Edit"],
          ["view", "View"],
          ["insert", "Insert"],
          ["format", "Format"],
        ].map(([key, label]) => (
          <div key={key} className="relative">
            <button
              type="button"
              aria-expanded={openMenu === key}
              aria-haspopup="menu"
              onClick={() =>
                setOpenMenu((currentMenu) =>
                  currentMenu === key ? null : (key as OpenMenu),
                )
              }
              className={`inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
                openMenu === key
                  ? "bg-[var(--brand-pale)] text-[var(--brand)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              {label}
            </button>

            {openMenu === key && (
              <div
                role="menu"
                className="absolute left-0 z-30 mt-1 min-w-64 overflow-visible rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] py-1 shadow-[var(--shadow-card)]"
              >
                {key === "edit" && (
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
                )}

                {key === "view" && <EmptyMenuItem />}

                {key === "insert" && (
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
                )}

                {key === "format" && (
                  <>
                    <SubmenuItem
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
                                editor?.chain().focus().toggleSuperscript().run(),
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
                    <SubmenuItem submenu={<EmptyMenuItem />}>Font</SubmenuItem>
                    <SubmenuItem submenu={renderHeadingMenuItems()}>
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
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-2 border-b border-[var(--border-light)] bg-[var(--bg-subtle)] px-3 py-3">
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
            onClick={() =>
              setOpenMenu((currentMenu) =>
                currentMenu === "heading" ? null : "heading",
              )
            }
            className="inline-flex h-9 min-w-36 items-center justify-between gap-3 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
          >
            {getHeadingLabel(selectedHeading)}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                openMenu === "heading" ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {openMenu === "heading" && (
            <div
              role="menu"
              className="absolute left-0 z-30 mt-1 min-w-44 overflow-hidden rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] py-1 shadow-[var(--shadow-card)]"
            >
              {renderHeadingMenuItems()}
            </div>
          )}
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

      <EditorContent editor={editor} />
    </div>
  );
}
