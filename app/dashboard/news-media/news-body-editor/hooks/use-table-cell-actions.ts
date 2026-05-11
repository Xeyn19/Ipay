"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { CellSelection } from "@tiptap/pm/tables";
import toast from "react-hot-toast";
import type {
  MergeDirection,
  TableAxis,
  TableCellHorizontalAlignment,
  TableCellStyleAttributes,
} from "../types";
import {
  getAdjacentCellPos,
  getSelectedTableCellPositions,
  getTableCellPaddingInputValue,
} from "../utils";

type UseTableCellActionsOptions = {
  activeCellPos: number | null;
  activeTablePos: number | null;
  closeTableBubbleSubmenu: () => void;
  editor: Editor | null;
  isTableActive: boolean;
  openTableBubbleSubmenu: "columns" | "rows" | "merge" | "cell-properties" | null;
  selectedCellPadding: string | null;
  setOpenCellPropertiesMenu: (value: "background-color" | null) => void;
  setOpenTableBubbleSubmenu: (
    value: "columns" | "rows" | "merge" | "cell-properties" | null,
  ) => void;
};

export function useTableCellActions({
  activeCellPos,
  activeTablePos,
  closeTableBubbleSubmenu,
  editor,
  isTableActive,
  openTableBubbleSubmenu,
  selectedCellPadding,
  setOpenCellPropertiesMenu,
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

  useEffect(() => {
    if (!isTableActive) {
      setOpenCellPropertiesMenu(null);
      setOpenTableBubbleSubmenu(null);
    }
  }, [isTableActive, activeTablePos, setOpenCellPropertiesMenu, setOpenTableBubbleSubmenu]);

  useEffect(() => {
    if (openTableBubbleSubmenu !== "cell-properties") {
      setOpenCellPropertiesMenu(null);
    }
  }, [openTableBubbleSubmenu, setOpenCellPropertiesMenu]);

  function runTableBubbleAction(action: () => void) {
    action();
    closeTableBubbleSubmenu();
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
    mergeCellInDirection,
    runTableBubbleAction,
    selectTableAxis,
    setCellPaddingInputValue: (value: string) =>
      setCellPaddingInputState({
        sourceKey: cellPaddingSourceKey,
        value,
      }),
    setSelectedTableCellBackgroundColor,
    setSelectedTableCellHorizontalAlignment,
    splitSelectedCell,
    toggleHeaderAxis,
    toggleMergeSelectedCells,
    unsetSelectedTableCellBackgroundColor,
  };
}
