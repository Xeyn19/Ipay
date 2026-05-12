export const NEWS_TABLE_BORDER_COLOR_CSS_VARIABLE =
  "--news-table-border-color";
export const NEWS_TABLE_BORDER_WIDTH_CSS_VARIABLE =
  "--news-table-border-width";

export function normalizeNewsTableBorderColor(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed : null;
}

export function normalizeNewsTableBorderWidthValue(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^\d+(?:\.\d+)?px$/i.test(trimmed)) {
    return null;
  }

  const parsed = Number.parseFloat(trimmed);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  const normalized = Number.isInteger(parsed)
    ? parsed
    : Number(parsed.toFixed(2));

  return `${normalized}px`;
}

export function getNewsTableBorderWidthInputValue(
  value: string | null | undefined,
) {
  const normalized = normalizeNewsTableBorderWidthValue(value);

  if (!normalized) {
    return "";
  }

  return normalized.slice(0, -2);
}
