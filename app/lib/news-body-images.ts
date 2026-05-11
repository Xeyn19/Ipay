export const NEWS_BODY_IMAGE_ALIGNMENT_VALUES = [
  "left",
  "center",
  "right",
] as const;

export type NewsBodyImageAlignment =
  (typeof NEWS_BODY_IMAGE_ALIGNMENT_VALUES)[number];

export const NEWS_BODY_IMAGE_SIZE_PRESETS = [
  { label: "Original", value: "" },
  { label: "25%", value: "25%" },
  { label: "50%", value: "50%" },
  { label: "75%", value: "75%" },
] as const;

export function normalizeNewsBodyImageAlignment(
  value: unknown,
): NewsBodyImageAlignment {
  return value === "left" || value === "right" || value === "center"
    ? value
    : "center";
}

function formatPercentage(value: number) {
  const rounded = Math.round(value * 100) / 100;

  return Number.isInteger(rounded)
    ? `${rounded}%`
    : `${rounded.toFixed(2).replace(/\.?0+$/, "")}%`;
}

export function normalizeNewsBodyImageWidth(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(/^(\d+(?:\.\d+)?)%$/);

  if (!match) {
    return "";
  }

  const parsed = Number.parseFloat(match[1]);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return "";
  }

  return formatPercentage(Math.min(parsed, 100));
}

export function clampNewsBodyImageWidthPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return "";
  }

  return formatPercentage(Math.min(Math.max(value, 0), 100));
}

export function getNewsBodyImageSizeLabel(value: unknown) {
  const normalized = normalizeNewsBodyImageWidth(value);
  const preset = NEWS_BODY_IMAGE_SIZE_PRESETS.find(
    (option) => option.value === normalized,
  );

  return preset?.label ?? (normalized || "Original");
}
