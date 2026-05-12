import type { JSONContent } from "@tiptap/react";
import type { CSSProperties } from "react";

export type NewsBodyTextStyleAttributes = {
  backgroundColor?: string | null;
  color?: string | null;
  fontFamily?: string | null;
  fontSize?: string | null;
  lineHeight?: string | null;
};

export type FontSizeOption = {
  label: string;
  value: string | null;
};

export type FontFamilyOption = {
  label: string;
  value: string;
};

export type HighlightColorOption = {
  label: string;
  value: string;
};

export type LineHeightOption = {
  label: string;
  value: string;
};

export const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { label: "10", value: "10px" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "Default", value: null },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "22", value: "22px" },
];

export const FONT_FAMILY_OPTIONS: FontFamilyOption[] = [
  { label: "Aptos Display", value: "var(--font-heading)" },
  { label: "Aptos", value: "var(--font-sans)" },
  {
    label: "Arial",
    value: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
  },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  {
    label: "Trebuchet MS",
    value: '"Trebuchet MS", "Lucida Grande", sans-serif',
  },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  {
    label: "Lucida Sans Unicode",
    value: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
  },
  {
    label: "Times New Roman",
    value: '"Times New Roman", Times, serif',
  },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
];

export const DEFAULT_TEXT_STYLE_COLORS = [
  "#111827",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#22C55E",
  "#14B8A6",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#DC2626",
];

export const DEFAULT_HIGHLIGHT_COLOR = "#FEF08A";
export const DEFAULT_LINE_HEIGHT = "1.5";

export const HIGHLIGHT_COLOR_OPTIONS: HighlightColorOption[] = [
  { label: "Yellow Marker", value: DEFAULT_HIGHLIGHT_COLOR },
  { label: "Green Marker", value: "#BBF7D0" },
  { label: "Pink Marker", value: "#F9A8D4" },
  { label: "Blue Marker", value: "#BFDBFE" },
  { label: "Red Marker", value: "#FECACA" },
  { label: "Dark Green Marker", value: "#4ADE80" },
];

export const LINE_HEIGHT_OPTIONS: LineHeightOption[] = [
  { label: "1", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5 (default)", value: DEFAULT_LINE_HEIGHT },
  { label: "2", value: "2" },
  { label: "2.5", value: "2.5" },
  { label: "3", value: "3" },
];

function normalizeColorValue(value: string) {
  return value.trim().toLowerCase();
}

export function parseFontSizeValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)px$/i);

  if (!match) {
    return null;
  }

  const parsed = Number.parseFloat(match[1]);

  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeFontSizeValue(value: string | null | undefined) {
  const parsed = parseFontSizeValue(value);

  if (parsed === null) {
    return null;
  }

  const rounded = Number.isInteger(parsed) ? parsed : Number(parsed.toFixed(2));
  return `${rounded}px`;
}

export function parseLineHeightValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return null;
  }

  const parsed = Number.parseFloat(trimmed);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function normalizeLineHeightValue(value: string | null | undefined) {
  const parsed = parseLineHeightValue(value);

  if (parsed === null) {
    return null;
  }

  return Number.isInteger(parsed) ? `${parsed}` : `${parsed}`;
}

export function getFontSizeLabel(value: string | null | undefined) {
  const normalized = normalizeFontSizeValue(value);

  if (!normalized) {
    return "Default";
  }

  const preset = FONT_SIZE_OPTIONS.find((option) => option.value === normalized);

  if (preset) {
    return preset.label;
  }

  const parsed = parseFontSizeValue(normalized);
  return parsed === null ? "Custom" : `${Math.round(parsed)}`;
}

export function stepFontSizeValue(
  value: string | null | undefined,
  delta: number,
  fallbackPx: number,
) {
  const current = parseFontSizeValue(value) ?? fallbackPx;
  const next = Math.max(1, Math.round(current) + delta);
  return `${next}px`;
}

export function getFontFamilyLabel(value: string | null | undefined) {
  if (!value) {
    return "Font Family";
  }

  const option = FONT_FAMILY_OPTIONS.find((item) => item.value === value);
  return option?.label ?? "Custom Font";
}

export function buildInlineTextStyle(
  attributes: NewsBodyTextStyleAttributes | null | undefined,
) {
  if (!attributes) {
    return undefined;
  }

  const style: CSSProperties = {};

  if (attributes.fontSize) {
    style.fontSize = attributes.fontSize;
  }

  if (attributes.fontFamily) {
    style.fontFamily = attributes.fontFamily;
  }

  if (attributes.color) {
    style.color = attributes.color;
  }

  if (attributes.backgroundColor) {
    style.backgroundColor = attributes.backgroundColor;
  }

  if (attributes.lineHeight) {
    style.lineHeight = attributes.lineHeight;
  }

  return Object.keys(style).length > 0 ? style : undefined;
}

export function normalizeTextStyleAttributes(
  attributes: NewsBodyTextStyleAttributes | null | undefined,
) {
  if (!attributes) {
    return null;
  }

  const normalized: NewsBodyTextStyleAttributes = {};

  if (attributes.fontSize) {
    normalized.fontSize = normalizeFontSizeValue(attributes.fontSize);
  }

  if (attributes.fontFamily) {
    normalized.fontFamily = attributes.fontFamily;
  }

  if (attributes.color) {
    normalized.color = attributes.color;
  }

  if (attributes.backgroundColor) {
    normalized.backgroundColor = attributes.backgroundColor;
  }

  if (attributes.lineHeight) {
    normalized.lineHeight = normalizeLineHeightValue(attributes.lineHeight);
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
}

export function collectDocumentTextStyleColors(body: JSONContent | null | undefined) {
  const textColors: string[] = [];
  const backgroundColors: string[] = [];
  const seenTextColors = new Set<string>();
  const seenBackgroundColors = new Set<string>();

  function visit(node: JSONContent | undefined) {
    if (!node) {
      return;
    }

    for (const mark of node.marks ?? []) {
      if (mark.type !== "textStyle") {
        continue;
      }

      const color =
        typeof mark.attrs?.color === "string" ? mark.attrs.color.trim() : "";
      const backgroundColor =
        typeof mark.attrs?.backgroundColor === "string"
          ? mark.attrs.backgroundColor.trim()
          : "";

      if (color) {
        const normalized = normalizeColorValue(color);

        if (!seenTextColors.has(normalized)) {
          seenTextColors.add(normalized);
          textColors.push(color);
        }
      }

      if (backgroundColor) {
        const normalized = normalizeColorValue(backgroundColor);

        if (!seenBackgroundColors.has(normalized)) {
          seenBackgroundColors.add(normalized);
          backgroundColors.push(backgroundColor);
        }
      }
    }

    for (const child of node.content ?? []) {
      visit(child);
    }
  }

  visit(body ?? undefined);

  return {
    backgroundColors: backgroundColors.slice(0, 5),
    textColors: textColors.slice(0, 5),
  };
}
