import type { JSONContent } from "@tiptap/react";
import type { ReactNode } from "react";
import { buildInlineTextStyle } from "@/app/lib/news-body-text-styles";
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

function renderInlineNodes(nodes: JSONContent[] | undefined, keyPrefix: string): ReactNode {
  if (!nodes?.length) {
    return null;
  }

  return nodes.map((node, index) => renderInlineNode(node, `${keyPrefix}-${index}`));
}

function applyMarks(node: JSONContent, content: ReactNode, key: string) {
  const textStyleMark = (node.marks ?? []).find((mark) => mark.type === "textStyle");
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

function renderListItemContent(nodes: JSONContent[] | undefined, keyPrefix: string): ReactNode {
  if (!nodes?.length) {
    return null;
  }

  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`;

    if (node.type === "paragraph") {
      return (
        <div key={key} className={getTextAlignmentClassName(node)}>
          {renderInlineNodes(node.content, key)}
        </div>
      );
    }

    return renderBlockNode(node, key);
  });
}

function renderBlockNode(node: JSONContent, key: string): ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p
          key={key}
          className={joinClassNames(
            "text-base leading-8 text-[var(--text-muted)]",
            getTextAlignmentClassName(node),
          )}
        >
          {renderInlineNodes(node.content, key)}
        </p>
      );
    case "heading": {
      const level = Number(node.attrs?.level);
      const headingLevel =
        level >= 1 && level <= 6 ? (level as keyof typeof headingClassNames) : 2;
      const className = joinClassNames(
        headingClassNames[headingLevel],
        getTextAlignmentClassName(node),
      );
      const content = renderInlineNodes(node.content, key);

      if (headingLevel === 1) {
        return (
          <h1 key={key} className={className}>
            {content}
          </h1>
        );
      }

      if (headingLevel === 3) {
        return (
          <h3 key={key} className={className}>
            {content}
          </h3>
        );
      }

      if (headingLevel === 4) {
        return (
          <h4 key={key} className={className}>
            {content}
          </h4>
        );
      }

      if (headingLevel === 5) {
        return (
          <h5 key={key} className={className}>
            {content}
          </h5>
        );
      }

      if (headingLevel === 6) {
        return (
          <h6 key={key} className={className}>
            {content}
          </h6>
        );
      }

      return (
        <h2 key={key} className={className}>
          {content}
        </h2>
      );
    }
    case "bulletList":
      return (
        <ul
          key={key}
          className="list-disc space-y-3 pl-6 text-base leading-8 text-[var(--text-muted)] marker:text-[var(--brand)]"
        >
          {(node.content ?? []).map((child, index) =>
            child.type === "listItem" ? (
              <li key={`${key}-${index}`}>{renderListItemContent(child.content, `${key}-${index}`)}</li>
            ) : null,
          )}
        </ul>
      );
    case "orderedList":
      return (
        <ol
          key={key}
          className="list-decimal space-y-3 pl-6 text-base leading-8 text-[var(--text-muted)] marker:text-[var(--brand)]"
        >
          {(node.content ?? []).map((child, index) =>
            child.type === "listItem" ? (
              <li key={`${key}-${index}`}>{renderListItemContent(child.content, `${key}-${index}`)}</li>
            ) : null,
          )}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-[var(--border-orange)] bg-[var(--bg-subtle)] px-5 py-4 text-base italic leading-8 text-[var(--text-secondary)]"
        >
          <div className="space-y-4">{(node.content ?? []).map((child, index) => renderBlockNode(child, `${key}-${index}`))}</div>
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
    default: {
      const text = getNewsBodyText(node);

      if (!text) {
        return null;
      }

      return (
        <p key={key} className="text-base leading-8 text-[var(--text-muted)]">
          {text}
        </p>
      );
    }
  }
}

export function NewsArticleBody({ body }: { body: JSONContent }) {
  const blocks = body.content ?? [];

  if (blocks.length === 0) {
    return null;
  }

  return <div className="space-y-6">{blocks.map((node, index) => renderBlockNode(node, `block-${index}`))}</div>;
}
