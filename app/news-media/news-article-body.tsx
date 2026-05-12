import type { JSONContent } from "@tiptap/react";
import type { CSSProperties, ReactNode } from "react";
import {
  normalizeNewsBodyImageAlignment,
  normalizeNewsBodyImageWidth,
} from "@/app/lib/news-body-images";
import {
  buildNewsTableOfContentsDisplayItems,
  extractNewsBodyHeadingItems,
  extractNewsTableOfContentsItems,
  NEWS_TABLE_OF_CONTENTS_NODE_NAME,
  type NewsBodyHeadingItem,
} from "@/app/lib/news-body-table-of-contents";
import {
  DEFAULT_HIGHLIGHT_COLOR,
  buildInlineTextStyle,
} from "@/app/lib/news-body-text-styles";
import { getNewsBodyText } from "@/app/lib/news-media";

const headingClassNames = {
  1: "font-heading text-4xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]",
  2: "font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]",
  3: "font-heading text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]",
  4: "font-heading text-xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]",
  5: "font-heading text-lg font-semibold text-[var(--text-primary)]",
  6: "font-heading text-base font-semibold text-[var(--text-primary)]",
} as const;

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function getTextAlignmentClassName(node: JSONContent) {
  const textAlign = node.attrs?.textAlign;

  if (textAlign === "left") {
    return "text-left";
  }

  if (textAlign === "right") {
    return "text-right";
  }

  if (textAlign === "center") {
    return "text-center";
  }

  if (textAlign === "justify") {
    return "text-justify";
  }

  return undefined;
}

function getTableCellHorizontalAlignment(node: JSONContent) {
  const align = node.attrs?.horizontalAlign ?? node.attrs?.align;

  if (align === "left") {
    return "left";
  }

  if (align === "right") {
    return "right";
  }

  if (align === "center") {
    return "center";
  }

  if (align === "justify") {
    return "justify";
  }

  return undefined;
}

function isTaskItemChecked(node: JSONContent) {
  return node.attrs?.checked === true || node.attrs?.checked === "true";
}

type NewsArticleBodyRenderContext = {
  headingAnchorMap: ReadonlyMap<string, string>;
  tableOfContentsItems: NewsBodyHeadingItem[];
};

function renderInlineNodes(
  nodes: JSONContent[] | undefined,
  keyPrefix: string,
): ReactNode {
  if (!nodes?.length) {
    return null;
  }

  return nodes.map((node, index) =>
    renderInlineNode(node, `${keyPrefix}-${index}`),
  );
}

function applyMarks(node: JSONContent, content: ReactNode, key: string) {
  const textStyleMark = (node.marks ?? []).find(
    (mark) => mark.type === "textStyle",
  );
  const textStyle = textStyleMark
    ? buildInlineTextStyle(textStyleMark.attrs)
    : undefined;
  const styledContent = textStyle ? (
    <span key={`${key}-text-style`} style={textStyle}>
      {content}
    </span>
  ) : (
    content
  );

  return (node.marks ?? [])
    .filter((mark) => mark.type !== "textStyle")
    .reduce<ReactNode>((result, mark, markIndex) => {
      const markKey = `${key}-mark-${markIndex}`;

      if (mark.type === "bold") {
        return <strong key={markKey}>{result}</strong>;
      }

      if (mark.type === "italic") {
        return <em key={markKey}>{result}</em>;
      }

      if (mark.type === "underline") {
        return <u key={markKey}>{result}</u>;
      }

      if (mark.type === "strike") {
        return <s key={markKey}>{result}</s>;
      }

      if (mark.type === "superscript") {
        return <sup key={markKey}>{result}</sup>;
      }

      if (mark.type === "subscript") {
        return <sub key={markKey}>{result}</sub>;
      }

      if (mark.type === "code") {
        return (
          <code
            key={markKey}
            className="rounded-md bg-[var(--bg-subtle)] px-1.5 py-0.5 font-mono text-sm text-[var(--text-primary)]"
          >
            {result}
          </code>
        );
      }

      if (mark.type === "highlight") {
        const backgroundColor =
          typeof mark.attrs?.color === "string" && mark.attrs.color.trim()
            ? mark.attrs.color
            : DEFAULT_HIGHLIGHT_COLOR;

        return (
          <mark
            key={markKey}
            style={{
              backgroundColor,
              color: "inherit",
            }}
          >
            {result}
          </mark>
        );
      }

      if (mark.type === "link") {
        const href =
          typeof mark.attrs?.href === "string" ? mark.attrs.href : undefined;

        if (!href) {
          return result;
        }

        return (
          <a
            key={markKey}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--brand)] underline decoration-[var(--brand)]/35 underline-offset-4 transition-colors hover:decoration-[var(--brand)]"
          >
            {result}
          </a>
        );
      }

      return result;
    }, styledContent);
}

function renderInlineNode(node: JSONContent, key: string): ReactNode {
  if (node.type === "hardBreak") {
    return <br key={key} />;
  }

  if (node.type === "text") {
    return applyMarks(node, node.text ?? "", key);
  }

  const nested = renderInlineNodes(node.content, key);

  if (!nested) {
    return null;
  }

  return applyMarks(node, nested, key);
}

function renderListItemContent(
  nodes: JSONContent[] | undefined,
  keyPrefix: string,
  pathPrefix: string,
  context: NewsArticleBodyRenderContext,
): ReactNode {
  if (!nodes?.length) {
    return null;
  }

  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    const path = `${pathPrefix}.${index}`;

    if (node.type === "paragraph") {
      return (
        <div key={key} className={getTextAlignmentClassName(node)}>
          {renderInlineNodes(node.content, key)}
        </div>
      );
    }

    return renderBlockNode(node, key, path, context);
  });
}

function renderTableCellContent(
  nodes: JSONContent[] | undefined,
  keyPrefix: string,
  pathPrefix: string,
  context: NewsArticleBodyRenderContext,
): ReactNode {
  if (!nodes?.length) {
    return null;
  }

  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    const path = `${pathPrefix}.${index}`;

    if (node.type === "paragraph") {
      return (
        <div
          key={key}
          className={joinClassNames(
            "text-sm leading-[1.5] text-[var(--text-primary)]",
            getTextAlignmentClassName(node),
          )}
        >
          {renderInlineNodes(node.content, key)}
        </div>
      );
    }

    return renderBlockNode(node, key, path, context);
  });
}

function getNumericNodeAttribute(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
}

function getTableCellRenderProps(node: JSONContent) {
  const horizontalAlign = getTableCellHorizontalAlignment(node);
  const backgroundColor =
    typeof node.attrs?.backgroundColor === "string"
      ? node.attrs.backgroundColor
      : undefined;
  const padding =
    typeof node.attrs?.padding === "string" ? node.attrs.padding : undefined;
  const colSpan = getNumericNodeAttribute(
    node.attrs?.colspan ?? node.attrs?.colSpan,
  );
  const rowSpan = getNumericNodeAttribute(
    node.attrs?.rowspan ?? node.attrs?.rowSpan,
  );
  const style: CSSProperties = {};

  if (backgroundColor) {
    style.backgroundColor = backgroundColor;
  }

  if (padding) {
    style.padding = padding;
  }

  if (horizontalAlign) {
    style.textAlign = horizontalAlign;
  }

  return {
    className: joinClassNames(
      "min-w-32 border border-[var(--border-light)]",
      padding ? undefined : "px-3.5 py-3",
      "align-top",
    ),
    colSpan,
    rowSpan,
    style: Object.keys(style).length > 0 ? style : undefined,
  };
}

function renderTableOfContents(
  items: NewsBodyHeadingItem[],
  key: string,
): ReactNode {
  const displayItems = buildNewsTableOfContentsDisplayItems(items);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <nav
      key={key}
      aria-label="Table of contents"
      className="rounded-[0.5rem] border border-[var(--border-light)] bg-[var(--bg-subtle)] px-5 py-5 sm:px-6"
    >
      <p className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
        Table of Contents
      </p>
      <ol className="mt-4 space-y-1.5">
        {displayItems.map((item) => (
          <li key={`${key}-${item.path}`}>
            <a
              href={`#${item.id}`}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 text-sm leading-6 text-[var(--text-secondary)] transition-colors hover:text-[var(--brand)]"
              style={{ paddingInlineStart: `${item.depth * 1}rem` }}
            >
              <span
                aria-hidden="true"
                className="font-semibold tabular-nums text-[var(--text-faint)]"
              >
                {item.numbering}.
              </span>
              <span>{item.textContent}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function renderBlockNode(
  node: JSONContent,
  key: string,
  path: string,
  context: NewsArticleBodyRenderContext,
): ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p
          key={key}
          className={joinClassNames(
            "text-base leading-[1.5] text-[var(--text-muted)]",
            getTextAlignmentClassName(node),
          )}
        >
          {renderInlineNodes(node.content, key)}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level);
      const headingLevel =
        level >= 1 && level <= 6
          ? (level as keyof typeof headingClassNames)
          : 2;
      const className = joinClassNames(
        headingClassNames[headingLevel],
        getTextAlignmentClassName(node),
      );
      const content = renderInlineNodes(node.content, key);
      const id = context.headingAnchorMap.get(path);

      if (headingLevel === 1) {
        return (
          <h1 key={key} id={id} className={className}>
            {content}
          </h1>
        );
      }

      if (headingLevel === 3) {
        return (
          <h3 key={key} id={id} className={className}>
            {content}
          </h3>
        );
      }

      if (headingLevel === 4) {
        return (
          <h4 key={key} id={id} className={className}>
            {content}
          </h4>
        );
      }

      if (headingLevel === 5) {
        return (
          <h5 key={key} id={id} className={className}>
            {content}
          </h5>
        );
      }

      if (headingLevel === 6) {
        return (
          <h6 key={key} id={id} className={className}>
            {content}
          </h6>
        );
      }

      return (
        <h2 key={key} id={id} className={className}>
          {content}
        </h2>
      );
    }
    case "bulletList":
      return (
        <ul
          key={key}
          className="list-disc space-y-3 pl-6 text-base leading-[1.5] text-[var(--text-muted)] marker:text-[var(--brand)]"
        >
          {(node.content ?? []).map((child, index) =>
            child.type === "listItem" ? (
              <li key={`${key}-${index}`}>
                {renderListItemContent(
                  child.content,
                  `${key}-${index}`,
                  `${path}.${index}`,
                  context,
                )}
              </li>
            ) : null,
          )}
        </ul>
      );
    case "orderedList":
      return (
        <ol
          key={key}
          className="list-decimal space-y-3 pl-6 text-base leading-[1.5] text-[var(--text-muted)] marker:text-[var(--brand)]"
        >
          {(node.content ?? []).map((child, index) =>
            child.type === "listItem" ? (
              <li key={`${key}-${index}`}>
                {renderListItemContent(
                  child.content,
                  `${key}-${index}`,
                  `${path}.${index}`,
                  context,
                )}
              </li>
            ) : null,
          )}
        </ol>
      );
    case "taskList":
      return (
        <ul
          key={key}
          className="space-y-3 pl-0 text-base leading-[1.5] text-[var(--text-muted)]"
        >
          {(node.content ?? []).map((child, index) =>
            child.type === "taskItem" ? (
              <li key={`${key}-${index}`} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isTaskItemChecked(child)}
                  readOnly
                  tabIndex={-1}
                  aria-hidden="true"
                  className="mt-[0.65rem] h-4 w-4 shrink-0 accent-[var(--brand)] pointer-events-none"
                />
                <div className="min-w-0 flex-1 space-y-3">
                  {renderListItemContent(
                    child.content,
                    `${key}-${index}`,
                    `${path}.${index}`,
                    context,
                  )}
                </div>
              </li>
            ) : null,
          )}
        </ul>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-[var(--border-orange)] bg-[var(--bg-subtle)] px-5 py-4 text-base italic leading-[1.5] text-[var(--text-secondary)]"
        >
          <div className="space-y-4">
            {(node.content ?? []).map((child, index) =>
              renderBlockNode(
                child,
                `${key}-${index}`,
                `${path}.${index}`,
                context,
              ),
            )}
          </div>
        </blockquote>
      );
    case "codeBlock":
      return (
        <pre
          key={key}
          className="overflow-x-auto rounded-2xl border border-[var(--border-light)] bg-[var(--bg-base)] px-5 py-4 text-sm leading-7 text-[var(--text-primary)]"
        >
          <code>{getNewsBodyText(node)}</code>
        </pre>
      );
    case "horizontalRule":
      return (
        <hr
          key={key}
          className="border-0 border-t border-[var(--border-light)]"
        />
      );
    case "table":
      return (
        <div
          key={key}
          className="overflow-x-auto border border-[var(--border-light)] bg-[var(--bg-elevated)]"
        >
          <table className="min-w-full border-collapse">
            <tbody>
              {(node.content ?? []).map((row, rowIndex) =>
                row.type === "tableRow" ? (
                  <tr key={`${key}-${rowIndex}`}>
                    {(row.content ?? []).map((cell, cellIndex) => {
                      const cellKey = `${key}-${rowIndex}-${cellIndex}`;
                      const cellProps = getTableCellRenderProps(cell);

                      if (cell.type === "tableHeader") {
                        return (
                          <th
                            key={cellKey}
                            className={joinClassNames(
                              cellProps.className,
                              "bg-[var(--bg-subtle)] text-sm font-semibold text-[var(--text-primary)]",
                            )}
                            style={{
                              textAlign: "left", // override browser default
                              ...cellProps.style, // explicit alignment from editor still wins
                            }}
                            colSpan={cellProps.colSpan}
                            rowSpan={cellProps.rowSpan}
                          >
                            <div className="space-y-2">
                              {renderTableCellContent(
                                cell.content,
                                cellKey,
                                `${path}.${rowIndex}.${cellIndex}`,
                                context,
                              )}
                            </div>
                          </th>
                        );
                      }

                      return (
                        <td
                          key={cellKey}
                          className={joinClassNames(
                            cellProps.className,
                            "text-sm text-[var(--text-primary)]",
                          )}
                          style={cellProps.style}
                          colSpan={cellProps.colSpan}
                          rowSpan={cellProps.rowSpan}
                        >
                          <div className="space-y-2">
                            {renderTableCellContent(
                              cell.content,
                              cellKey,
                              `${path}.${rowIndex}.${cellIndex}`,
                              context,
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ) : null,
              )}
            </tbody>
          </table>
        </div>
      );
    case NEWS_TABLE_OF_CONTENTS_NODE_NAME:
      return renderTableOfContents(context.tableOfContentsItems, key);
    case "image": {
      const src =
        typeof node.attrs?.src === "string" ? node.attrs.src.trim() : "";

      if (!src) {
        return null;
      }

      const alt =
        typeof node.attrs?.alt === "string" ? node.attrs.alt : "Article image";
      const title =
        typeof node.attrs?.title === "string" ? node.attrs.title : undefined;
      const width = normalizeNewsBodyImageWidth(node.attrs?.width);
      const legacyWidth = width
        ? undefined
        : getNumericNodeAttribute(node.attrs?.width);
      const height = getNumericNodeAttribute(node.attrs?.height);
      const alignment = normalizeNewsBodyImageAlignment(node.attrs?.alignment);
      const alignmentClassName =
        alignment === "left"
          ? "md:justify-start"
          : alignment === "right"
            ? "md:justify-end"
            : "md:justify-center";
      const figureStyle = {
        "--news-body-image-width": width || "auto",
      } as CSSProperties;

      return (
        <div
          key={key}
          className={joinClassNames("flex w-full", alignmentClassName)}
        >
          <figure
            className="w-full overflow-hidden rounded-[1.75rem] border border-[var(--border-light)] bg-[var(--bg-subtle)] md:max-w-full md:[width:var(--news-body-image-width)]"
            style={figureStyle}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              title={title}
              width={legacyWidth}
              height={height}
              className={
                width
                  ? "block h-auto w-full max-w-full"
                  : "block h-auto w-full max-w-full md:w-auto"
              }
              style={{
                height: "auto",
                maxWidth: "100%",
              }}
            />
          </figure>
        </div>
      );
    }
    default: {
      const text = getNewsBodyText(node);

      if (!text) {
        return null;
      }

      return (
        <p
          key={key}
          className="text-base leading-[1.5] text-[var(--text-muted)]"
        >
          {text}
        </p>
      );
    }
  }
}

export function NewsArticleBody({ body }: { body: JSONContent }) {
  const blocks = body.content ?? [];
  const headingItems = extractNewsBodyHeadingItems(body);
  const renderContext: NewsArticleBodyRenderContext = {
    headingAnchorMap: new Map(
      headingItems.map((item) => [item.path, item.id] as const),
    ),
    tableOfContentsItems: extractNewsTableOfContentsItems(body),
  };

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {blocks.map((node, index) =>
        renderBlockNode(node, `block-${index}`, `${index}`, renderContext),
      )}
    </div>
  );
}
