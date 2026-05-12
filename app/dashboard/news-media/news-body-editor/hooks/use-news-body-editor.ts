"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import toast from "react-hot-toast";
import { EMPTY_NEWS_BODY } from "@/app/lib/news-media";
import {
  DEFAULT_LINE_HEIGHT,
  DEFAULT_HIGHLIGHT_COLOR,
  stepFontSizeValue,
} from "@/app/lib/news-body-text-styles";
import {
  createNewsBodyEditorExtensions,
  LINK_BUBBLE_MENU_PLUGIN_KEY,
  NEWS_TABLE_OF_CONTENTS_NODE_NAME,
  TABLE_BUBBLE_MENU_PLUGIN_KEY,
} from "../extensions";
import type {
  LinkBubbleTarget,
  LinkSelectionSnapshot,
  NewsBodyEditorProps,
  NewsBodyEditorSnapshot,
  SelectedLinkState,
} from "../types";
import {
  applyHeading,
  collectDocumentEditorColors,
  getActiveTableContext,
  getCurrentHeading,
  getCurrentHighlightColor,
  getCurrentTextAlignment,
  getCurrentTextStyle,
  getLinkBubbleAnchorRect,
  getLinkSelectionSnapshot,
  getMergeDirectionAvailability,
  getSelectedImageState,
  getSelectedLinkState,
  getSelectedTableCellState,
  getSelectedTableState,
  getSelectionComputedFontSize,
  hasTableOfContentsNode,
  isHeaderAxisActive,
  normalizeLinkUrl,
  setStyleDeclarationValue,
} from "../utils";
import { useEditorMenuState } from "./use-editor-menu-state";
import { useFontActions } from "./use-font-actions";
import { useImageActions, useImageUploadState } from "./use-image-actions";
import { useTableCellActions } from "./use-table-cell-actions";

const EMPTY_MERGE_DIRECTION_AVAILABILITY = {
  down: false,
  left: false,
  right: false,
  up: false,
} as const;

function areSelectedLinksEqual(
  currentLink: SelectedLinkState | null,
  nextLink: SelectedLinkState | null,
) {
  if (currentLink === nextLink) {
    return true;
  }

  if (!currentLink || !nextLink) {
    return false;
  }

  return (
    currentLink.from === nextLink.from &&
    currentLink.to === nextLink.to &&
    currentLink.href === nextLink.href &&
    currentLink.text === nextLink.text
  );
}

function getEmptyEditorState(): NewsBodyEditorSnapshot {
  return {
    activeCellPos: null,
    activeTablePos: null,
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
    code: false,
    currentCellProperties: {
      backgroundColor: null,
      hasBackgroundColor: false,
      horizontalAlign: "left",
      padding: null,
    },
    currentColumnIsHeader: false,
    currentHeading: "paragraph",
    currentRowIsHeader: false,
    currentTableProperties: {
      borderColor: null,
      borderWidth: null,
      hasBorderColor: false,
      hasMixedBorderColor: false,
      hasMixedBorderWidth: false,
    },
    currentTextAlign: null,
    currentTextStyle: null,
    highlight: false,
    highlightColor: null,
    italic: false,
    link: false,
    orderedList: false,
    selectedImage: null,
    selectedLink: null,
    strike: false,
    subscript: false,
    superscript: false,
    tableActive: false,
    taskList: false,
    underline: false,
  };
}

export function useNewsBodyEditor({
  initialContent,
  onChange,
}: NewsBodyEditorProps) {
  const documentColorsTimeoutRef = useRef<number | null>(null);
  const lastLinkSelectionSnapshotRef = useRef<LinkSelectionSnapshot | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [documentColors, setDocumentColors] = useState(() =>
    collectDocumentEditorColors(initialContent ?? EMPTY_NEWS_BODY),
  );
  const [lastUsedHighlightColor, setLastUsedHighlightColor] = useState(
    DEFAULT_HIGHLIGHT_COLOR,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasInteractedWithEditor, setHasInteractedWithEditor] = useState(false);
  const [linkDisplayedTextInputValue, setLinkDisplayedTextInputValue] =
    useState("");
  const [linkUrlInputValue, setLinkUrlInputValue] = useState("");
  const [linkBubbleTarget, setLinkBubbleTarget] = useState<LinkBubbleTarget | null>(
    null,
  );
  const [activeLinkPreview, setActiveLinkPreview] =
    useState<SelectedLinkState | null>(null);
  const [, setLinkOverlayPositionVersion] = useState(0);
  const menu = useEditorMenuState();
  const imageUpload = useImageUploadState({
    closeMenu: menu.closeMenu,
  });

  function clearDocumentColorsTimeout() {
    if (documentColorsTimeoutRef.current !== null) {
      window.clearTimeout(documentColorsTimeoutRef.current);
      documentColorsTimeoutRef.current = null;
    }
  }

  function scheduleDocumentColorsUpdate(content: JSONContent) {
    clearDocumentColorsTimeout();
    documentColorsTimeoutRef.current = window.setTimeout(() => {
      documentColorsTimeoutRef.current = null;
      setDocumentColors(collectDocumentEditorColors(content));
    }, 200);
  }

  function saveLinkSelectionSnapshot(currentEditor: Editor | null) {
    const nextSnapshot = getLinkSelectionSnapshot(currentEditor);

    if (!nextSnapshot) {
      return;
    }

    const currentSnapshot = lastLinkSelectionSnapshotRef.current;

    if (
      currentSnapshot &&
      currentSnapshot.from === nextSnapshot.from &&
      currentSnapshot.to === nextSnapshot.to &&
      currentSnapshot.text === nextSnapshot.text &&
      currentSnapshot.selectedLink?.from === nextSnapshot.selectedLink?.from &&
      currentSnapshot.selectedLink?.to === nextSnapshot.selectedLink?.to &&
      currentSnapshot.selectedLink?.href === nextSnapshot.selectedLink?.href &&
      currentSnapshot.selectedLink?.text === nextSnapshot.selectedLink?.text
    ) {
      return;
    }

    lastLinkSelectionSnapshotRef.current = nextSnapshot;
  }

  function syncActiveLinkPreview(currentEditor: Editor | null) {
    const nextPreviewLink = getSelectedLinkState(currentEditor);

    setActiveLinkPreview((currentPreviewLink) =>
      areSelectedLinksEqual(currentPreviewLink, nextPreviewLink)
        ? currentPreviewLink
        : nextPreviewLink,
    );
  }

  function getPreferredLinkSelectionSnapshot() {
    if (editor?.isFocused) {
      return getLinkSelectionSnapshot(editor);
    }

    return lastLinkSelectionSnapshotRef.current;
  }

  const editor = useEditor({
    content: initialContent ?? EMPTY_NEWS_BODY,
    extensions: createNewsBodyEditorExtensions({
      onDropImages: imageUpload.uploadAndInsertImages,
    }),
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      const nextJson = currentEditor.getJSON();
      onChange(nextJson);
      scheduleDocumentColorsUpdate(nextJson);
    },
    onFocus: ({ editor: currentEditor }) => {
      setHasInteractedWithEditor(true);
      saveLinkSelectionSnapshot(currentEditor);
      syncActiveLinkPreview(currentEditor);
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      if (currentEditor.isFocused) {
        setHasInteractedWithEditor(true);
      }

      saveLinkSelectionSnapshot(currentEditor);
      syncActiveLinkPreview(currentEditor);
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
    selector: ({ editor: currentEditor }): NewsBodyEditorSnapshot => {
      if (!currentEditor) {
        return getEmptyEditorState();
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
        currentTableProperties: getSelectedTableState(
          currentEditor,
          activeTableContext.activeTablePos,
        ),
        currentTextAlign: getCurrentTextAlignment(currentEditor),
        currentTextStyle: getCurrentTextStyle(currentEditor),
        highlight: currentEditor.isActive("highlight"),
        highlightColor: getCurrentHighlightColor(currentEditor),
        italic: currentEditor.isActive("italic"),
        link: currentEditor.isActive("link"),
        orderedList: currentEditor.isActive("orderedList"),
        selectedImage: getSelectedImageState(currentEditor),
        selectedLink: getSelectedLinkState(currentEditor),
        strike: currentEditor.isActive("strike"),
        subscript: currentEditor.isActive("subscript"),
        superscript: currentEditor.isActive("superscript"),
        tableActive: activeTableContext.tableActive,
        taskList: currentEditor.isActive("taskList"),
        underline: currentEditor.isActive("underline"),
      };
    },
  });
  const resolvedEditorState = editorState ?? getEmptyEditorState();

  const selectedHeading = resolvedEditorState.currentHeading ?? "paragraph";
  const selectedTextAlignment = resolvedEditorState.currentTextAlign ?? null;
  const selectedTextStyle = resolvedEditorState.currentTextStyle ?? null;
  const selectedFontSize = selectedTextStyle?.fontSize ?? null;
  const selectedFontFamily = selectedTextStyle?.fontFamily ?? null;
  const selectedTextColor = selectedTextStyle?.color ?? null;
  const selectedBackgroundColor = selectedTextStyle?.backgroundColor ?? null;
  const selectedLineHeight =
    selectedTextStyle?.lineHeight ??
    (selectedHeading === "paragraph" ? DEFAULT_LINE_HEIGHT : null);
  const selectedHighlightColor = resolvedEditorState.highlightColor ?? null;
  const selectedCellProperties = resolvedEditorState.currentCellProperties;
  const selectedTableProperties = resolvedEditorState.currentTableProperties;
  const selectedCellBackgroundColor = selectedCellProperties.backgroundColor ?? null;
  const hasSelectedCellBackgroundColor =
    selectedCellProperties.hasBackgroundColor ?? false;
  const selectedCellPadding = selectedCellProperties.padding ?? null;
  const selectedCellHorizontalAlignment =
    selectedCellProperties.horizontalAlign ?? "left";
  const selectedTableBorderColor = selectedTableProperties.borderColor ?? null;
  const hasSelectedTableBorderColor =
    selectedTableProperties.hasBorderColor ?? false;
  const hasMixedTableBorderColor =
    selectedTableProperties.hasMixedBorderColor ?? false;
  const hasMixedTableBorderWidth =
    selectedTableProperties.hasMixedBorderWidth ?? false;
  const selectedTableBorderWidth = selectedTableProperties.borderWidth ?? null;
  const selectedImage = resolvedEditorState.selectedImage;
  const selectedLink = resolvedEditorState.selectedLink;
  const activeCellPos = resolvedEditorState.activeCellPos;
  const activeTablePos = resolvedEditorState.activeTablePos;
  const canMergeDirection =
    resolvedEditorState.canMergeDirection ?? EMPTY_MERGE_DIRECTION_AVAILABILITY;
  const canMergeSelection = resolvedEditorState.canMergeSelection ?? false;
  const canSplitCell = resolvedEditorState.canSplitCell ?? false;
  const canToggleHeaderColumn = resolvedEditorState.canToggleHeaderColumn ?? false;
  const canToggleHeaderRow = resolvedEditorState.canToggleHeaderRow ?? false;
  const currentColumnIsHeader = resolvedEditorState.currentColumnIsHeader ?? false;
  const currentRowIsHeader = resolvedEditorState.currentRowIsHeader ?? false;
  const isTableActive = resolvedEditorState.tableActive ?? false;
  const hasDirectionalMergeAction = Object.values(canMergeDirection).some(Boolean);
  const isHighlightActive = resolvedEditorState.highlight ?? false;

  const table = useTableCellActions({
    activeCellPos,
    activeTablePos,
    closeTableBubbleSubmenu: menu.closeTableBubbleSubmenu,
    editor,
    isTableActive,
    openTableBubbleSubmenu: menu.openTableBubbleSubmenu,
    selectedCellPadding,
    selectedTableBorderWidth,
    setOpenCellPropertiesMenu: menu.setOpenCellPropertiesMenu,
    setOpenTablePropertiesMenu: menu.setOpenTablePropertiesMenu,
    setOpenTableBubbleSubmenu: menu.setOpenTableBubbleSubmenu,
  });

  const image = useImageActions({
    closeImageBubbleSubmenu: menu.closeImageBubbleSubmenu,
    editor,
    selectedImage,
    setIsImageAltEditorOpen: menu.setIsImageAltEditorOpen,
    setOpenImageBubbleSubmenu: menu.setOpenImageBubbleSubmenu,
  });
  const imageController = {
    ...image,
    closeImageUrlModal: imageUpload.closeImageUrlModal,
    handleImageInputChange: (event: ChangeEvent<HTMLInputElement>) =>
      imageUpload.handleImageInputChange(editor, event),
    handleInsertImageUrl: (url: string) =>
      imageUpload.handleInsertImageUrl(editor, url),
    imageInputRef: imageUpload.imageInputRef,
    isImageUrlModalOpen: imageUpload.isImageUrlModalOpen,
    isUploadingImage: imageUpload.isUploadingImage,
    openImageUrlModal: () => imageUpload.openImageUrlModal(editor),
    openUploadFromComputer: () => imageUpload.openUploadFromComputer(editor),
    uploadAndInsertImages: imageUpload.uploadAndInsertImages,
  };

  const font = useFontActions({
    editor,
    selectedHeading,
    selectedFontSize,
  });

  const activeLinkBubbleMode = menu.openLinkBubbleMode;
  const activeLinkBubbleTarget = linkBubbleTarget;
  const activeLinkBubbleTargetFrom = activeLinkBubbleTarget?.from ?? null;
  const activeLinkBubbleTargetTo = activeLinkBubbleTarget?.to ?? null;
  const activeLinkPreviewFrom = activeLinkPreview?.from ?? null;
  const activeLinkPreviewTo = activeLinkPreview?.to ?? null;
  const activeLinkPreviewHref = activeLinkPreview?.href ?? null;

  function resetLinkForm() {
    setLinkDisplayedTextInputValue("");
    setLinkUrlInputValue("");
    setLinkBubbleTarget(null);
  }

  function closeLinkBubble() {
    resetLinkForm();
    menu.closeLinkBubble();
  }

  function setLinkTargetState(target: LinkBubbleTarget, values?: {
    displayedText?: string;
    href?: string;
  }) {
    setLinkBubbleTarget(target);
    setLinkDisplayedTextInputValue(values?.displayedText ?? "");
    setLinkUrlInputValue(values?.href ?? "");
  }

  function getCurrentLinkReplacementMarks(from: number, href: string) {
    if (!editor) {
      return [
        {
          attrs: { href },
          type: "link",
        },
      ];
    }

    const linkMarkType = editor.state.schema.marks.link;
    const resolvedPos = editor.state.doc.resolve(
      Math.min(Math.max(from, 1), editor.state.doc.content.size),
    );
    const currentMarks = resolvedPos
      .marks()
      .filter((mark) => mark.type !== linkMarkType);

    return [
      ...currentMarks.map((mark) => ({
        attrs: mark.attrs,
        type: mark.type.name,
      })),
      {
        attrs: { href },
        type: "link",
      },
    ];
  }

  function openLinkEditFlow(targetLink?: SelectedLinkState | null) {
    if (!editor) {
      return;
    }

    const resolvedLink =
      targetLink ??
      getPreferredLinkSelectionSnapshot()?.selectedLink ??
      activeLinkPreview ??
      getSelectedLinkState(editor);

    if (!resolvedLink) {
      return;
    }

    menu.closeAllMenus();
    editor
      .chain()
      .focus()
      .setTextSelection({
        from: resolvedLink.from,
        to: resolvedLink.to,
      })
      .run();
    setLinkTargetState(
      {
        from: resolvedLink.from,
        to: resolvedLink.to,
      },
      {
        displayedText: resolvedLink.text,
        href: resolvedLink.href,
      },
    );
    menu.setOpenLinkBubbleMode("edit");
  }

  function openLinkInsertFlow() {
    if (!editor) {
      return;
    }

    const selectionSnapshot = getPreferredLinkSelectionSnapshot();

    if (selectionSnapshot?.selectedLink) {
      openLinkEditFlow(selectionSnapshot.selectedLink);
      return;
    }

    menu.closeAllMenus();

    if (selectionSnapshot) {
      editor
        .chain()
        .focus()
        .setTextSelection({
          from: selectionSnapshot.from,
          to: selectionSnapshot.to,
        })
        .run();
      setLinkTargetState(
        {
          from: selectionSnapshot.from,
          to: selectionSnapshot.to,
        },
        {
          displayedText: selectionSnapshot.text,
          href: "",
        },
      );
      menu.setOpenLinkBubbleMode("insert");
      return;
    }

    if (!hasInteractedWithEditor) {
      editor.chain().focus("start").run();
    } else {
      editor.chain().focus().run();
    }

    const fallbackSnapshot = getLinkSelectionSnapshot(editor);

    if (!fallbackSnapshot) {
      return;
    }

    setLinkTargetState(
      {
        from: fallbackSnapshot.from,
        to: fallbackSnapshot.to,
      },
      {
        displayedText: fallbackSnapshot.text,
        href: "",
      },
    );
    menu.setOpenLinkBubbleMode("insert");
  }

  function saveLink() {
    if (!editor || !linkBubbleTarget) {
      return;
    }

    const normalizedHref = normalizeLinkUrl(linkUrlInputValue, {
      allowBareDomain: true,
    });

    if (!normalizedHref) {
      toast.error("Enter a valid http or https URL.");
      return;
    }

    const displayedText = linkDisplayedTextInputValue.trim() || normalizedHref;
    const currentRangeText = editor.state.doc.textBetween(
      linkBubbleTarget.from,
      linkBubbleTarget.to,
      " ",
    );

    if (
      linkBubbleTarget.from !== linkBubbleTarget.to &&
      currentRangeText === displayedText
    ) {
      editor
        .chain()
        .focus()
        .setTextSelection({
          from: linkBubbleTarget.from,
          to: linkBubbleTarget.to,
        })
        .setLink({ href: normalizedHref })
        .run();
    } else {
      const selectionEnd = linkBubbleTarget.from + displayedText.length;

      editor
        .chain()
        .focus()
        .insertContentAt(linkBubbleTarget, {
          marks: getCurrentLinkReplacementMarks(
            linkBubbleTarget.from,
            normalizedHref,
          ),
          text: displayedText,
          type: "text",
        })
        .setTextSelection(selectionEnd)
        .run();
    }

    closeLinkBubble();
  }

  function unlinkSelectedLink() {
    if (!editor) {
      return;
    }

    const activeLink =
      activeLinkPreview ?? selectedLink ?? getSelectedLinkState(editor);

    if (!activeLink) {
      return;
    }

    editor
      .chain()
      .focus()
      .setTextSelection({
        from: activeLink.from,
        to: activeLink.to,
      })
      .unsetLink()
      .setTextSelection(activeLink.to)
      .run();

    setActiveLinkPreview(null);
    closeLinkBubble();
  }

  function openActiveLinkInNewTab() {
    const activeLink =
      activeLinkPreview ??
      selectedLink ??
      (editor ? getSelectedLinkState(editor) : null);

    if (!activeLink || typeof window === "undefined") {
      return;
    }

    window.open(activeLink.href, "_blank", "noopener,noreferrer");
  }

  function runAction(action: () => void) {
    action();
    menu.closeMenu();
  }

  const openFullscreen = useCallback(() => {
    menu.closeAllMenus();
    setIsFullscreen(true);
  }, [menu]);

  const closeFullscreen = useCallback(() => {
    menu.closeAllMenus();
    setIsFullscreen(false);
  }, [menu]);

  const toggleFullscreen = useCallback(() => {
    menu.closeAllMenus();
    setIsFullscreen((current) => !current);
  }, [menu]);

  function applyHighlightColor(color: string) {
    if (!editor) {
      return;
    }

    setLastUsedHighlightColor(color);
    editor.chain().focus().setHighlight({ color }).run();
  }

  function applyCurrentHighlightColor() {
    applyHighlightColor(lastUsedHighlightColor);
  }

  function unsetHighlight() {
    editor?.chain().focus().unsetHighlight().run();
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

  function insertTable(rows: number, columns: number) {
    if (!editor) {
      return;
    }

    const didInsertTable = editor
      .chain()
      .focus()
      .insertTable({
        rows: Math.min(10, Math.max(1, rows)),
        cols: Math.min(10, Math.max(1, columns)),
        withHeaderRow: true,
      })
      .run();

    if (!didInsertTable) {
      return;
    }

    const { activeTablePos } = getActiveTableContext(editor);

    if (activeTablePos !== null) {
      const tableNode = editor.state.doc.nodeAt(activeTablePos);

      if (tableNode) {
        const nextStyle = setStyleDeclarationValue(
          typeof tableNode.attrs.style === "string" ? tableNode.attrs.style : null,
          "width",
          "100%",
        );
        const styleWithoutMinWidth = setStyleDeclarationValue(
          nextStyle,
          "min-width",
          null,
        );
        const transaction = editor.state.tr.setNodeMarkup(
          activeTablePos,
          undefined,
          {
            ...tableNode.attrs,
            style: styleWithoutMinWidth,
          },
        );

        editor.view.dispatch(transaction);
      }
    }

    menu.closeMenu();
  }

  useEffect(() => {
    return () => {
      if (documentColorsTimeoutRef.current !== null) {
        window.clearTimeout(documentColorsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!editor || !isTableActive) {
      return;
    }

    editor.commands.setMeta(TABLE_BUBBLE_MENU_PLUGIN_KEY, "updatePosition");
  }, [
    editor,
    isTableActive,
    activeTablePos,
    menu.openTableBubbleSubmenu,
    menu.openCellPropertiesMenu,
    menu.openTablePropertiesMenu,
  ]);

  useEffect(() => {
    if (
      !editor ||
      activeLinkPreviewFrom === null ||
      activeLinkPreviewTo === null ||
      activeLinkPreviewHref === null ||
      activeLinkBubbleMode !== null
    ) {
      return;
    }

    editor.commands.setMeta(LINK_BUBBLE_MENU_PLUGIN_KEY, "updatePosition");
  }, [
    activeLinkBubbleMode,
    editor,
    activeLinkPreviewFrom,
    activeLinkPreviewHref,
    activeLinkPreviewTo,
  ]);

  useEffect(() => {
    if (
      activeLinkBubbleMode === null ||
      activeLinkBubbleTargetFrom === null ||
      activeLinkBubbleTargetTo === null
    ) {
      return;
    }

    function refreshLinkOverlayPosition() {
      setLinkOverlayPositionVersion((currentValue) => currentValue + 1);
    }

    window.addEventListener("resize", refreshLinkOverlayPosition);
    document.addEventListener("scroll", refreshLinkOverlayPosition, true);

    return () => {
      window.removeEventListener("resize", refreshLinkOverlayPosition);
      document.removeEventListener("scroll", refreshLinkOverlayPosition, true);
    };
  }, [
    activeLinkBubbleMode,
    activeLinkBubbleTargetFrom,
    activeLinkBubbleTargetTo,
  ]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }

    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [isFullscreen]);

  useEffect(() => {
    function applyStep(delta: number) {
      if (!editor) {
        return;
      }

      const fallbackPx = getSelectionComputedFontSize(editor) ?? 16;
      const nextSize = stepFontSizeValue(selectedFontSize, delta, fallbackPx);
      editor.chain().focus().setFontSize(nextSize).run();
    }

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        menu.setOpenMenu(null);
        menu.setOpenCellPropertiesMenu(null);
        menu.setOpenTableBubbleSubmenu(null);
        setActiveLinkPreview(null);
        resetLinkForm();
        menu.closeLinkBubble();
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
        applyStep(1);
        return;
      }

      if (
        editor?.isFocused &&
        event.ctrlKey &&
        event.shiftKey &&
        event.code === "Comma"
      ) {
        event.preventDefault();
        applyStep(-1);
        return;
      }

      if (event.key === "Escape") {
        if (isFullscreen) {
          event.preventDefault();
          closeFullscreen();
          return;
        }

        menu.setOpenMenu(null);
        menu.setOpenCellPropertiesMenu(null);
        menu.setOpenTableBubbleSubmenu(null);
        setActiveLinkPreview(null);
        resetLinkForm();
        menu.closeLinkBubble();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    closeFullscreen,
    editor,
    isFullscreen,
    menu,
    selectedFontSize,
  ]);

  function handleEditorSurfaceMouseDownCapture() {
    if (menu.openMenu !== null) {
      menu.closeMenu();
    }

    if (menu.openCellPropertiesMenu !== null) {
      menu.setOpenCellPropertiesMenu(null);
    }

    if (menu.openTableBubbleSubmenu !== null) {
      menu.closeTableBubbleSubmenu();
    }

    if (menu.openImageBubbleSubmenu !== null) {
      menu.closeImageBubbleSubmenu();
    }

    if (menu.isImageAltEditorOpen) {
      menu.setIsImageAltEditorOpen(false);
    }

    if (menu.openLinkBubbleMode !== null) {
      closeLinkBubble();
    }
  }

  return {
    commands: {
      applyHeading: (value: "paragraph" | 1 | 2 | 3 | 4 | 5 | 6) =>
        applyHeading(editor, value),
      editorSurfaceMouseDownCapture: handleEditorSurfaceMouseDownCapture,
      insertTable,
      insertTableOfContents,
      openLinkBubble: openLinkInsertFlow,
      runAction,
    },
    derivedState: {
      activeLinkBubbleMode,
      activeLinkBubbleTarget,
      activeCellPos,
      activeTablePos,
      canMergeDirection,
      canMergeSelection,
      canSplitCell,
      canToggleHeaderColumn,
      canToggleHeaderRow,
      currentColumnIsHeader,
      currentRowIsHeader,
      documentColors,
      editorState: resolvedEditorState,
      hasDirectionalMergeAction,
      hasSelectedCellBackgroundColor,
      hasMixedTableBorderColor,
      hasMixedTableBorderWidth,
      hasSelectedTableBorderColor,
      isHighlightActive,
      isTableActive,
      selectedBackgroundColor,
      selectedCellBackgroundColor,
      selectedCellHorizontalAlignment,
      selectedCellPadding,
      selectedCellProperties,
      selectedFontFamily,
      selectedFontSize,
      selectedHeading,
      selectedHighlightColor,
      selectedImage,
      selectedLineHeight,
      selectedLink,
      selectedTableBorderColor,
      selectedTableBorderWidth,
      selectedTableProperties,
      selectedTextAlignment,
      selectedTextColor,
      selectedTextStyle,
    },
    editor,
    font,
    fullscreen: {
      closeFullscreen,
      isFullscreen,
      openFullscreen,
      toggleFullscreen,
    },
    highlight: {
      applyCurrentHighlightColor,
      applyHighlightColor,
      lastUsedHighlightColor,
      setLastUsedHighlightColor,
      unsetHighlight,
    },
    image: imageController,
    link: {
      closeLinkBubble,
      displayedTextInputValue: linkDisplayedTextInputValue,
      activePreviewLink: activeLinkPreview,
      isLinkFormOpen: menu.openLinkBubbleMode !== null,
      linkFormAnchorRect:
        menu.openLinkBubbleMode !== null
          ? getLinkBubbleAnchorRect(editor, linkBubbleTarget)
          : null,
      linkPreviewAnchorRect: activeLinkPreview
        ? getLinkBubbleAnchorRect(editor, {
            from: activeLinkPreview.from,
            to: activeLinkPreview.to,
          })
        : null,
      linkUrlInputValue,
      openActiveLinkInNewTab,
      openLinkEditFlow,
      openLinkInsertFlow,
      saveLink,
      setLinkDisplayedTextInputValue,
      setLinkUrlInputValue,
      unlinkSelectedLink,
    },
    menu,
    refs: {
      imageInputRef: imageUpload.imageInputRef,
      menuRef,
    },
    table,
  };
}

export type NewsBodyEditorController = ReturnType<typeof useNewsBodyEditor>;
