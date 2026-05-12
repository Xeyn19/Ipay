"use client";

import { mergeAttributes } from "@tiptap/core";
import FileHandler from "@tiptap/extension-file-handler";
import Highlight from "@tiptap/extension-highlight";
import TiptapLink from "@tiptap/extension-link";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TableKit } from "@tiptap/extension-table";
import TableOfContents from "@tiptap/extension-table-of-contents";
import { TableCell } from "@tiptap/extension-table/cell";
import { TableHeader } from "@tiptap/extension-table/header";
import {
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  LineHeight,
  TextStyle,
} from "@tiptap/extension-text-style";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import type { Editor } from "@tiptap/react";
import { NEWS_TABLE_OF_CONTENTS_NODE_NAME } from "@/app/lib/news-body-table-of-contents";
import { NewsBodyImage } from "../news-body-image-extension";
import { NewsTableOfContents } from "../news-body-table-of-contents-extension";
import {
  buildTableCellStyleValue,
  getImageInsertTarget,
  shouldAutoLinkUrl,
  getTableCellStyleAttributes,
  tableCellAttributeConfig,
} from "./utils";

export const EDITOR_IMAGE_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const TABLE_BUBBLE_MENU_PLUGIN_KEY = "newsBodyEditorTableBubbleMenu";
export const IMAGE_BUBBLE_MENU_PLUGIN_KEY = "newsBodyEditorImageBubbleMenu";
export const LINK_BUBBLE_MENU_PLUGIN_KEY = "newsBodyEditorLinkBubbleMenu";

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

type CreateExtensionsOptions = {
  onDropImages: (
    editor: Editor,
    files: File[],
    pos?: number | { from: number; to: number } | null,
  ) => Promise<void> | void;
};

export function createNewsBodyEditorExtensions({
  onDropImages,
}: CreateExtensionsOptions) {
  return [
    StarterKit.configure({
      link: false,
    }),
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
        resizable: true,
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
    LineHeight,
    TiptapLink.configure({
      autolink: true,
      defaultProtocol: "https",
      linkOnPaste: true,
      openOnClick: false,
      protocols: ["http", "https"],
      shouldAutoLink: shouldAutoLinkUrl,
    }),
    Highlight.configure({
      multicolor: true,
    }),
    FileHandler.configure({
      allowedMimeTypes: [...EDITOR_IMAGE_ALLOWED_MIME_TYPES],
      onDrop: (currentEditor, files, pos) => {
        void onDropImages(currentEditor, files, pos);
      },
      onPaste: (currentEditor, files, htmlContent) => {
        if (htmlContent?.length) {
          return;
        }

        void onDropImages(currentEditor, files, getImageInsertTarget(currentEditor));
      },
    }),
  ];
}

export { NEWS_TABLE_OF_CONTENTS_NODE_NAME };
