"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { CellSelection } from "@tiptap/pm/tables";
import toast from "react-hot-toast";
import {
  NEWS_TABLE_BORDER_COLOR_CSS_VARIABLE,
  NEWS_TABLE_BORDER_WIDTH_CSS_VARIABLE,
  getNewsTableBorderWidthInputValue,
} from "@/app/lib/news-table-styles";
import type {
  MergeDirection,
  TableAxis,
  TableCellHorizontalAlignment,
  TableCellStyleAttributes,
} from "../types";
import {
  getAllTableCellPositions,
  getAdjacentCellPos,
  getSelectedTableCellPositions,
  getTableCellPaddingInputValue,
  setStyleDeclarationValue,
} from "../utils";

type UseTableCellActionsOptions = {
  activeCellPos: number | null;
  activeTablePos: number | null;
  closeTableBubbleSubmenu: () => void;
  editor: Editor | null;
  isTableActive: boolean;
  openTableBubbleSubmenu:
    | "columns"
    | "rows"
    | "merge"
    | "table-properties"
    | "cell-properties"
    | null;
  selectedCellPadding: string | null;
  selectedTableBorderWidth: string | null;
  setOpenCellPropertiesMenu: (value: "background-color" | null) => void;
  setOpenTablePropertiesMenu: (value: "border-color" | null) => void;
  setOpenTableBubbleSubmenu: (
    value:
      | "columns"
      | "rows"
      | "merge"
      | "table-properties"
      | "cell-properties"
      | null,
  ) => void;
};

type TableAttributeUpdateOptions = {
  refocusEditor?: boolean;
  scrollIntoView?: boolean;
};

export function useTableCellActions({
  activeCellPos,
  activeTablePos,
  closeTableBubbleSubmenu,
  editor,
  isTableActive,
  openTableBubbleSubmenu,
  selectedCellPadding,
  selectedTableBorderWidth,
  setOpenCellPropertiesMenu,
  setOpenTablePropertiesMenu,
  setOpenTableBubbleSubmenu,
}: UseTableCellActionsOptions) {
  const cellPaddingSourceValue = getTableCellPaddingInputValue(selectedCellPadding);
  const cellPaddingSourceKey = `${activeTablePos ?? "none"}:${activeCellPos ?? "none"}:${cellPaddingSourceValue}`;
  const [cellPaddingInputState, setCellPaddingInputState] = useState<{
    sourceKey: string;
    value: string;
  }>({
    sourceKey: cellPaddingSourceKey,
    value: cellPaddingSourceValue,
  });
  const cellPaddingInputValue =
    cellPaddingInputState.sourceKey === cellPaddingSourceKey
      ? cellPaddingInputState.value
      : cellPaddingSourceValue;
  const tableBorderWidthSourceValue =
    getNewsTableBorderWidthInputValue(selectedTableBorderWidth);
  const tableBorderWidthSourceKey = `${activeTablePos ?? "none"}:${tableBorderWidthSourceValue}`;
  const [tableBorderWidthInputState, setTableBorderWidthInputState] = useState<{
    sourceKey: string;
    value: string;
  }>({
    sourceKey: tableBorderWidthSourceKey,
    value: tableBorderWidthSourceValue,
  });
  const tableBorderWidthInputValue =
    tableBorderWidthInputState.sourceKey === tableBorderWidthSourceKey
      ? tableBorderWidthInputState.value
      : tableBorderWidthSourceValue;

  useEffect(() => {
    if (!isTableActive) {
      setOpenCellPropertiesMenu(null);
      setOpenTablePropertiesMenu(null);
      setOpenTableBubbleSubmenu(null);
    }
  }, [
    isTableActive,
    activeTablePos,
    setOpenCellPropertiesMenu,
    setOpenTablePropertiesMenu,
    setOpenTableBubbleSubmenu,
  ]);

  useEffect(() => {
    if (openTableBubbleSubmenu !== "cell-properties") {
      setOpenCellPropertiesMenu(null);
    }
  }, [openTableBubbleSubmenu, setOpenCellPropertiesMenu]);

  useEffect(() => {
    if (openTableBubbleSubmenu !== "table-properties") {
      setOpenTablePropertiesMenu(null);
    }
  }, [openTableBubbleSubmenu, setOpenTablePropertiesMenu]);

  function runTableBubbleAction(action: () => void) {
    action();
    closeTableBubbleSubmenu();
  }

  function setSelectedTableCellAttribute(
    attribute: keyof TableCellStyleAttributes,
    value: string | null,
    {
      refocusEditor = true,
      scrollIntoView = true,
    }: TableAttributeUpdateOptions = {},
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

    editor.view.dispatch(
      scrollIntoView ? transaction.scrollIntoView() : transaction,
    );

    if (refocusEditor) {
      editor.view.focus();
    }
  }

  function updateTableBorderCells(
    attribute: "borderColor" | "borderWidth",
    value: string | null,
    {
      refocusEditor = true,
      scrollIntoView = true,
    }: TableAttributeUpdateOptions = {},
  ) {
    if (!editor || activeTablePos === null) {
      return;
    }

    const tableNode = editor.state.doc.nodeAt(activeTablePos);

    if (!tableNode) {
      return;
    }

    const positions = getAllTableCellPositions(editor.state.doc, activeTablePos);

    if (positions.length === 0) {
      return;
    }

    let transaction = editor.state.tr;
    let didChange = false;

    for (const position of positions) {
      const cellNode = transaction.doc.nodeAt(position);

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

      transaction = transaction.setNodeMarkup(position, undefined, {
        ...cellNode.attrs,
        [attribute]: value,
      });
      didChange = true;
    }

    const currentStyle =
      typeof tableNode.attrs.style === "string" ? tableNode.attrs.style : null;
    const styleWithoutBorderColor = setStyleDeclarationValue(
      currentStyle,
      NEWS_TABLE_BORDER_COLOR_CSS_VARIABLE,
      null,
    );
    const styleWithoutBorderDeclarations = setStyleDeclarationValue(
      styleWithoutBorderColor,
      NEWS_TABLE_BORDER_WIDTH_CSS_VARIABLE,
      null,
    );

    if ((currentStyle ?? undefined) !== styleWithoutBorderDeclarations) {
      transaction = transaction.setNodeMarkup(activeTablePos, undefined, {
        ...tableNode.attrs,
        style: styleWithoutBorderDeclarations,
      });
      didChange = true;
    }

    if (!didChange) {
      return;
    }

    editor.view.dispatch(
      scrollIntoView ? transaction.scrollIntoView() : transaction,
    );

    if (refocusEditor) {
      editor.view.focus();
    }
  }

  function setSelectedTableBorderColorValue(value: string) {
    updateTableBorderCells("borderColor", value);
  }

  function commitSelectedTableBorderColorFromPicker(value: string) {
    updateTableBorderCells("borderColor", value, {
      refocusEditor: false,
      scrollIntoView: false,
    });
  }

  function setSelectedTableBorderColor(value: string) {
    setSelectedTableBorderColorValue(value);
    setOpenTablePropertiesMenu(null);
  }

  function unsetSelectedTableBorderColor() {
    updateTableBorderCells("borderColor", null);
    setOpenTablePropertiesMenu(null);
  }

  function setSelectedTableCellBackgroundColorValue(value: string) {
    setSelectedTableCellAttribute("backgroundColor", value);
  }

  function commitSelectedTableCellBackgroundColorFromPicker(value: string) {
    setSelectedTableCellAttribute("backgroundColor", value, {
      refocusEditor: false,
      scrollIntoView: false,
    });
  }

  function setSelectedTableCellBackgroundColor(value: string) {
    setSelectedTableCellBackgroundColorValue(value);
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
      setCellPaddingInputState({
        sourceKey: cellPaddingSourceKey,
        value: cellPaddingSourceValue,
      });
      toast.error("Padding must be a single pixel value.");
      return;
    }

    const parsed = Number.parseFloat(trimmedValue);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setCellPaddingInputState({
        sourceKey: cellPaddingSourceKey,
        value: cellPaddingSourceValue,
      });
      toast.error("Padding must be a single pixel value.");
      return;
    }

    const normalized = Number.isInteger(parsed)
      ? parsed
      : Number(parsed.toFixed(2));

    setSelectedTableCellAttribute("padding", `${normalized}px`);
    setCellPaddingInputState({
      sourceKey: cellPaddingSourceKey,
      value: `${normalized}`,
    });
  }

  function commitTableBorderWidthInput() {
    const trimmedValue = tableBorderWidthInputValue.trim();

    if (trimmedValue === "") {
      updateTableBorderCells("borderWidth", null);
      return;
    }

    if (!/^\d+(?:\.\d+)?$/.test(trimmedValue)) {
      setTableBorderWidthInputState({
        sourceKey: tableBorderWidthSourceKey,
        value: tableBorderWidthSourceValue,
      });
      toast.error("Border size must be a single pixel value.");
      return;
    }

    const parsed = Number.parseFloat(trimmedValue);

    if (!Number.isFinite(parsed) || parsed < 0) {
      setTableBorderWidthInputState({
        sourceKey: tableBorderWidthSourceKey,
        value: tableBorderWidthSourceValue,
      });
      toast.error("Border size must be a single pixel value.");
      return;
    }

    const normalized = Number.isInteger(parsed)
      ? parsed
      : Number(parsed.toFixed(2));

    updateTableBorderCells("borderWidth", `${normalized}px`);
    setTableBorderWidthInputState({
      sourceKey: tableBorderWidthSourceKey,
      value: `${normalized}`,
    });
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

  return {
    cellPaddingInputValue,
    commitCellPaddingInput,
    commitTableBorderWidthInput,
    mergeCellInDirection,
    runTableBubbleAction,
    selectTableAxis,
    setCellPaddingInputValue: (value: string) =>
      setCellPaddingInputState({
        sourceKey: cellPaddingSourceKey,
        value,
      }),
    setSelectedTableBorderColor,
    setSelectedTableBorderColorValue,
    setSelectedTableCellBackgroundColor,
    setSelectedTableCellBackgroundColorValue,
    commitSelectedTableBorderColorFromPicker,
    commitSelectedTableCellBackgroundColorFromPicker,
    setSelectedTableCellHorizontalAlignment,
    setTableBorderWidthInputValue: (value: string) =>
      setTableBorderWidthInputState({
        sourceKey: tableBorderWidthSourceKey,
        value,
      }),
    splitSelectedCell,
    tableBorderWidthInputValue,
    toggleHeaderAxis,
    toggleMergeSelectedCells,
    unsetSelectedTableBorderColor,
    unsetSelectedTableCellBackgroundColor,
  };
}
