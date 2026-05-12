import type { JSONContent } from "@tiptap/react";

export const NEWS_TABLE_OF_CONTENTS_NODE_NAME = "newsTableOfContents";
export const NEWS_TABLE_OF_CONTENTS_HEADING_LEVELS = [2, 3, 4] as const;

export type NewsBodyHeadingItem = {
  id: string;
  level: number;
  path: string;
  textContent: string;
};

export type NewsTableOfContentsDisplayItem = NewsBodyHeadingItem & {
  depth: number;
  numbering: string;
};

type ExtractHeadingItemsOptions = {
  includeLevels?: readonly number[];
};

function getHeadingLevel(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") {
    return null;
  }

  const level = Number(value);

  if (!Number.isInteger(level) || level < 1 || level > 6) {
    return null;
  }

  return level;
}

function getTextContent(node: JSONContent | null | undefined): string {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return node.text ?? "";
  }

  if (node.type === "hardBreak") {
    return " ";
  }

  return (node.content ?? []).map((child) => getTextContent(child)).join("");
}

function normalizeAnchorCandidate(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function slugifyHeadingText(text: string) {
  const normalized = text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "section";
}

function createUniqueAnchorId(
  candidate: string,
  usedAnchorCounts: Map<string, number>,
) {
  const count = usedAnchorCounts.get(candidate) ?? 0;
  usedAnchorCounts.set(candidate, count + 1);

  return count === 0 ? candidate : `${candidate}-${count + 1}`;
}

function collectHeadingItems(
  node: JSONContent,
  path: string,
  items: NewsBodyHeadingItem[],
  usedAnchorCounts: Map<string, number>,
  includeLevels?: readonly number[],
) {
  if (node.type === NEWS_TABLE_OF_CONTENTS_NODE_NAME) {
    return;
  }

  if (node.type === "heading") {
    const level = getHeadingLevel(node.attrs?.level);
    const textContent = getTextContent(node).trim();

    if (
      level !== null &&
      textContent.length > 0 &&
      (!includeLevels || includeLevels.includes(level))
    ) {
      const anchorCandidate =
        normalizeAnchorCandidate(node.attrs?.id) ??
        normalizeAnchorCandidate(node.attrs?.["data-toc-id"]) ??
        slugifyHeadingText(textContent);

      items.push({
        id: createUniqueAnchorId(anchorCandidate, usedAnchorCounts),
        level,
        path,
        textContent,
      });
    }
  }

  (node.content ?? []).forEach((child, index) => {
    const childPath = path.length > 0 ? `${path}.${index}` : `${index}`;
    collectHeadingItems(
      child,
      childPath,
      items,
      usedAnchorCounts,
      includeLevels,
    );
  });
}

export function extractNewsBodyHeadingItems(
  body: JSONContent,
  options: ExtractHeadingItemsOptions = {},
) {
  const items: NewsBodyHeadingItem[] = [];

  collectHeadingItems(
    body,
    "",
    items,
    new Map<string, number>(),
    options.includeLevels,
  );

  return items;
}

export function extractNewsTableOfContentsItems(body: JSONContent) {
  return extractNewsBodyHeadingItems(body, {
    includeLevels: NEWS_TABLE_OF_CONTENTS_HEADING_LEVELS,
  });
}

export function buildNewsTableOfContentsDisplayItems(
  items: NewsBodyHeadingItem[],
): NewsTableOfContentsDisplayItem[] {
  const baseLevel = NEWS_TABLE_OF_CONTENTS_HEADING_LEVELS[0] ?? 1;
  const counters: number[] = [];

  return items.map((item) => {
    const depth = Math.max(0, item.level - baseLevel);

    while (counters.length <= depth) {
      counters.push(0);
    }

    counters.length = depth + 1;
    counters[depth] += 1;

    for (let index = 0; index < depth; index += 1) {
      if (counters[index] === 0) {
        counters[index] = 1;
      }
    }

    return {
      ...item,
      depth,
      numbering: counters.join("."),
    };
  });
}
