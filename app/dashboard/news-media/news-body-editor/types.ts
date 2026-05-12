import type { JSONContent } from "@tiptap/react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { NewsBodyImageAlignment } from "@/app/lib/news-body-images";
import type { NewsBodyTextStyleAttributes } from "@/app/lib/news-body-text-styles";

export type NewsBodyEditorProps = {
  initialContent: JSONContent | null;
  onChange: (value: JSONContent) => void;
};

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TextAlignment = "left" | "right" | "center" | "justify" | null;
export type TableCellHorizontalAlignment = Exclude<TextAlignment, null>;
export type OpenMenu =
  | "edit"
  | "view"
  | "insert"
  | "format"
  | "heading"
  | "toolbar-font-size"
  | "toolbar-font-family"
  | "toolbar-text-color"
  | "toolbar-background-color"
  | "toolbar-highlight"
  | "toolbar-table"
  | null;
export type TopLevelMenuKey = Extract<
  OpenMenu,
  "edit" | "view" | "insert" | "format"
>;
export type ImageInsertTarget = number | { from: number; to: number } | null;
export type TableAxis = "columns" | "rows";
export type MergeDirection = "up" | "right" | "down" | "left";
export type OpenTableBubbleSubmenu =
  | TableAxis
  | "merge"
  | "cell-properties"
  | null;
export type OpenCellPropertiesMenu = "background-color" | null;
export type OpenImageBubbleSubmenu = "alignment" | "size" | null;
export type OpenLinkBubbleMode = "insert" | "edit" | null;
export type ColorMenuMode = "text" | "background" | "cell-background";

export type ActiveTableContext = {
  activeCellPos: number | null;
  activeTablePos: number | null;
  tableActive: boolean;
};

export type SelectedImageState = {
  alignment: NewsBodyImageAlignment;
  alt: string;
  pos: number;
  src: string;
  width: string;
};

export type SelectedLinkState = {
  from: number;
  href: string;
  text: string;
  to: number;
};

export type LinkBubbleTarget = {
  from: number;
  to: number;
};

export type LinkSelectionSnapshot = {
  from: number;
  selectedLink: SelectedLinkState | null;
  text: string;
  to: number;
};

export type MergeDirectionAvailability = Record<MergeDirection, boolean>;

export type TableGeometry = {
  cellRect: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  };
  tableMap: import("@tiptap/pm/tables").TableMap;
  tableNode: ProseMirrorNode;
};

export type TableCellStyleAttributes = {
  backgroundColor?: string | null;
  horizontalAlign?: TableCellHorizontalAlignment | null;
  padding?: string | null;
};

export type TableCellSelectionState = {
  backgroundColor: string | null;
  hasBackgroundColor: boolean;
  horizontalAlign: TableCellHorizontalAlignment;
  padding: string | null;
};

export type DocumentEditorColors = {
  backgroundColors: string[];
  textColors: string[];
};

export type NewsBodyEditorSnapshot = {
  activeCellPos: number | null;
  activeTablePos: number | null;
  blockquote: boolean;
  bold: boolean;
  bulletList: boolean;
  canMergeDirection: MergeDirectionAvailability;
  canMergeSelection: boolean;
  canRedo: boolean;
  canSplitCell: boolean;
  canToggleHeaderColumn: boolean;
  canToggleHeaderRow: boolean;
  canUndo: boolean;
  code: boolean;
  currentCellProperties: TableCellSelectionState;
  currentColumnIsHeader: boolean;
  currentHeading: "paragraph" | HeadingLevel;
  currentRowIsHeader: boolean;
  currentTextAlign: TextAlignment;
  currentTextStyle: NewsBodyTextStyleAttributes | null;
  documentColors: DocumentEditorColors;
  italic: boolean;
  highlight: boolean;
  highlightColor: string | null;
  link: boolean;
  orderedList: boolean;
  selectedImage: SelectedImageState | null;
  selectedLink: SelectedLinkState | null;
  strike: boolean;
  subscript: boolean;
  superscript: boolean;
  tableActive: boolean;
  taskList: boolean;
  underline: boolean;
};
