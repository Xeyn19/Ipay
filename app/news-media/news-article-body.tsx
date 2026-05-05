import type { JSONContent } from "@tiptap/react";
import type { ReactNode } from "react";
import { getNewsBodyText } from "@/app/lib/news-media";

function renderInlineNodes(nodes: JSONContent[] | undefined, keyPrefix: string): ReactNode {
  if (!nodes?.length) {
    return null;
  }

  return nodes.map((node, index) => renderInlineNode(node, `${keyPrefix}-${index}`));
}

function applyMarks(node: JSONContent, content: ReactNode, key: string) {
  return (node.marks ?? []).reduce<ReactNode>((result, mark, markIndex) => {
    const markKey = `${key}-mark-${markIndex}`;

    if (mark.type === "bold") {
      return <strong key={markKey}>{result}</strong>;
    }

    if (mark.type === "italic") {
      return <em key={markKey}>{result}</em>;
    }

    return result;
  }, content);
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
      return <div key={key}>{renderInlineNodes(node.content, key)}</div>;
    }

    return renderBlockNode(node, key);
  });
}

function renderBlockNode(node: JSONContent, key: string): ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} className="text-base text-justify leading-8 text-[var(--text-muted)]">
          {renderInlineNodes(node.content, key)}
        </p>
      );
    case "heading": {
      const level = node.attrs?.level === 3 ? 3 : 2;
      const HeadingTag = level === 3 ? "h3" : "h2";

      return (
        <HeadingTag
          key={key}
          className={
            level === 3
              ? "font-heading text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]"
              : "font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]"
          }
        >
          {renderInlineNodes(node.content, key)}
        </HeadingTag>
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
