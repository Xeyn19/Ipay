"use client";

import type { Editor } from "@tiptap/react";
import {
  DEFAULT_LINE_HEIGHT,
  stepFontSizeValue,
} from "@/app/lib/news-body-text-styles";
import type { HeadingLevel } from "../types";
import { getSelectionComputedFontSize } from "../utils";

type UseFontActionsOptions = {
  editor: Editor | null;
  selectedHeading: "paragraph" | HeadingLevel;
  selectedFontSize: string | null;
};

export function useFontActions({
  editor,
  selectedHeading,
  selectedFontSize,
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

  function setLineHeightValue(value: string) {
    if (!editor) {
      return;
    }

    const chain = editor.chain().focus();

    if (value === DEFAULT_LINE_HEIGHT && selectedHeading === "paragraph") {
      chain.unsetLineHeight().run();
      return;
    }

    chain.setLineHeight(value).run();
  }

  function stepFontSize(delta: number) {
    if (!editor) {
      return;
    }

    const fallbackPx = getSelectionComputedFontSize(editor) ?? 16;
    const nextSize = stepFontSizeValue(selectedFontSize, delta, fallbackPx);
    editor.chain().focus().setFontSize(nextSize).run();
  }

  return {
    setBackgroundColorValue,
    setFontFamilyValue,
    setFontSizeValue,
    setLineHeightValue,
    setTextColorValue,
    stepFontSize,
    unsetBackgroundColorValue,
    unsetTextColorValue,
  };
}
