"use client";

import { useEffect, useRef, type ChangeEvent } from "react";
import { useEditor, useEditorState, type JSONContent } from "@tiptap/react";
import toast from "react-hot-toast";
import { EMPTY_NEWS_BODY } from "@/app/lib/news-media";
import { stepFontSizeValue } from "@/app/lib/news-body-text-styles";
import {
  createNewsBodyEditorExtensions,
  NEWS_TABLE_OF_CONTENTS_NODE_NAME,
  TABLE_BUBBLE_MENU_PLUGIN_KEY,
} from "../extensions";
import type { NewsBodyEditorProps, NewsBodyEditorSnapshot } from "../types";
import {
  applyHeading,
  collectDocumentEditorColors,
  getActiveTableContext,
  getCurrentHeading,
  getCurrentTextAlignment,
  getCurrentTextStyle,
  isHeaderAxisActive,
  getSelectedImageState,
  getSelectedTableCellState,
  getSelectionComputedFontSize,
  getMergeDirectionAvailability,
  hasTableOfContentsNode,
  updateLink,
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

function getEmptyEditorState(
  initialContent: JSONContent | null,
): NewsBodyEditorSnapshot {
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
    currentTextAlign: null,
    currentTextStyle: null,
    documentColors: collectDocumentEditorColors(initialContent ?? EMPTY_NEWS_BODY),
    italic: false,
    link: false,
    orderedList: false,
    selectedImage: null,
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
  const menuRef = useRef<HTMLDivElement | null>(null);
  const textColorInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundColorInputRef = useRef<HTMLInputElement | null>(null);
  const cellBackgroundColorInputRef = useRef<HTMLInputElement | null>(null);
  const menu = useEditorMenuState();
  const imageUpload = useImageUploadState({
    closeMenu: menu.closeMenu,
  });

  const editor = useEditor({
    content: initialContent ?? EMPTY_NEWS_BODY,
    extensions: createNewsBodyEditorExtensions({
      onDropImages: imageUpload.uploadAndInsertImages,
    }),
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
    selector: ({ editor: currentEditor }): NewsBodyEditorSnapshot => {
      if (!currentEditor) {
        return getEmptyEditorState(initialContent);
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
        selectedImage: getSelectedImageState(currentEditor),
        strike: currentEditor.isActive("strike"),
        subscript: currentEditor.isActive("subscript"),
        superscript: currentEditor.isActive("superscript"),
        tableActive: activeTableContext.tableActive,
        taskList: currentEditor.isActive("taskList"),
        underline: currentEditor.isActive("underline"),
      };
    },
  });
  const resolvedEditorState = editorState ?? getEmptyEditorState(initialContent);

  const selectedHeading = resolvedEditorState.currentHeading ?? "paragraph";
  const selectedTextAlignment = resolvedEditorState.currentTextAlign ?? null;
  const selectedTextStyle = resolvedEditorState.currentTextStyle ?? null;
  const selectedFontSize = selectedTextStyle?.fontSize ?? null;
  const selectedFontFamily = selectedTextStyle?.fontFamily ?? null;
  const selectedTextColor = selectedTextStyle?.color ?? null;
  const selectedBackgroundColor = selectedTextStyle?.backgroundColor ?? null;
  const selectedCellProperties = resolvedEditorState.currentCellProperties;
  const selectedCellBackgroundColor = selectedCellProperties.backgroundColor ?? null;
  const hasSelectedCellBackgroundColor =
    selectedCellProperties.hasBackgroundColor ?? false;
  const selectedCellPadding = selectedCellProperties.padding ?? null;
  const selectedCellHorizontalAlignment =
    selectedCellProperties.horizontalAlign ?? "left";
  const documentColors = resolvedEditorState.documentColors;
  const selectedImage = resolvedEditorState.selectedImage;
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

  const table = useTableCellActions({
    activeCellPos,
    activeTablePos,
    closeTableBubbleSubmenu: menu.closeTableBubbleSubmenu,
    editor,
    isTableActive,
    openTableBubbleSubmenu: menu.openTableBubbleSubmenu,
    selectedCellPadding,
    setOpenCellPropertiesMenu: menu.setOpenCellPropertiesMenu,
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
    backgroundColorInputRef,
    cellBackgroundColorInputRef,
    closeMenu: menu.closeMenu,
    editor,
    selectedFontSize,
    setOpenCellPropertiesMenu: menu.setOpenCellPropertiesMenu,
    setSelectedTableCellBackgroundColor: table.setSelectedTableCellBackgroundColor,
    textColorInputRef,
  });

  function runAction(action: () => void) {
    action();
    menu.closeMenu();
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

    editor
      .chain()
      .focus()
      .insertTable({
        rows: Math.min(10, Math.max(1, rows)),
        cols: Math.min(10, Math.max(1, columns)),
        withHeaderRow: true,
      })
      .run();
    menu.closeMenu();
  }

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
  ]);

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
        menu.setOpenMenu(null);
        menu.setOpenCellPropertiesMenu(null);
        menu.setOpenTableBubbleSubmenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, menu, selectedFontSize]);

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
  }

  return {
    colors: {
      handleColorPickerChange: font.handleColorPickerChange,
      openColorPicker: font.openColorPicker,
    },
    commands: {
      applyHeading: (value: "paragraph" | 1 | 2 | 3 | 4 | 5 | 6) =>
        applyHeading(editor, value),
      editorSurfaceMouseDownCapture: handleEditorSurfaceMouseDownCapture,
      insertTable,
      insertTableOfContents,
      runAction,
      updateLink: () => updateLink(editor),
    },
    derivedState: {
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
      isTableActive,
      selectedBackgroundColor,
      selectedCellBackgroundColor,
      selectedCellHorizontalAlignment,
      selectedCellPadding,
      selectedCellProperties,
      selectedFontFamily,
      selectedFontSize,
      selectedHeading,
      selectedImage,
      selectedTextAlignment,
      selectedTextColor,
      selectedTextStyle,
    },
    editor,
    font,
    image: imageController,
    menu,
    refs: {
      backgroundColorInputRef,
      cellBackgroundColorInputRef,
      imageInputRef: imageUpload.imageInputRef,
      menuRef,
      textColorInputRef,
    },
    table,
  };
}

export type NewsBodyEditorController = ReturnType<typeof useNewsBodyEditor>;
