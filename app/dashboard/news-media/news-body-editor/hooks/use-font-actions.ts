"use client";

import type { ChangeEvent, RefObject } from "react";
import type { Editor } from "@tiptap/react";
import { stepFontSizeValue } from "@/app/lib/news-body-text-styles";
import type { ColorMenuMode } from "../types";
import { getSelectionComputedFontSize } from "../utils";

type UseFontActionsOptions = {
  backgroundColorInputRef: RefObject<HTMLInputElement | null>;
  cellBackgroundColorInputRef: RefObject<HTMLInputElement | null>;
  closeMenu: () => void;
  editor: Editor | null;
  selectedFontSize: string | null;
  setOpenCellPropertiesMenu: (value: "background-color" | null) => void;
  setSelectedTableCellBackgroundColor: (value: string) => void;
  textColorInputRef: RefObject<HTMLInputElement | null>;
};

export function useFontActions({
  backgroundColorInputRef,
  cellBackgroundColorInputRef,
  closeMenu,
  editor,
  selectedFontSize,
  setOpenCellPropertiesMenu,
  setSelectedTableCellBackgroundColor,
  textColorInputRef,
}: UseFontActionsOptions) {
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

  function openColorPicker(mode: ColorMenuMode) {
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
    mode: ColorMenuMode,
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

  return {
    handleColorPickerChange,
    openColorPicker,
    setBackgroundColorValue,
    setFontFamilyValue,
    setFontSizeValue,
    setTextColorValue,
    stepFontSize,
    unsetBackgroundColorValue,
    unsetTextColorValue,
  };
}
