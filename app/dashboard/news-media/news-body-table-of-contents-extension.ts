"use client";

import type { Editor } from "@tiptap/core";
import { mergeAttributes, Node } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { NodeView } from "@tiptap/pm/view";
import {
  buildNewsTableOfContentsDisplayItems,
  extractNewsTableOfContentsItems,
  NEWS_TABLE_OF_CONTENTS_HEADING_LEVELS,
  NEWS_TABLE_OF_CONTENTS_NODE_NAME,
} from "@/app/lib/news-body-table-of-contents";

function escapeAttributeValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

class NewsBodyTableOfContentsNodeView implements NodeView {
  dom: HTMLDivElement;
  private readonly editor: Editor;
  private readonly title: HTMLParagraphElement;
  private readonly content: HTMLDivElement;

  constructor(editor: Editor) {
    this.editor = editor;
    this.dom = document.createElement("div");
    this.title = document.createElement("p");
    this.content = document.createElement("div");

    this.dom.className = "news-body-editor__toc";
    this.dom.contentEditable = "false";
    this.title.className = "news-body-editor__toc-title";
    this.title.textContent = "Table of Contents";
    this.content.className = "news-body-editor__toc-content";

    this.dom.append(this.title, this.content);

    this.editor.on("transaction", this.handleEditorTransaction);
    this.render();
  }

  update(node: ProseMirrorNode) {
    return node.type.name === NEWS_TABLE_OF_CONTENTS_NODE_NAME;
  }

  selectNode() {
    this.dom.classList.add("is-selected");
  }

  deselectNode() {
    this.dom.classList.remove("is-selected");
  }

  stopEvent(event: Event) {
    return event.target instanceof HTMLElement
      ? event.target.closest(".news-body-editor__toc-link") !== null
      : false;
  }

  ignoreMutation() {
    return true;
  }

  destroy() {
    this.editor.off("transaction", this.handleEditorTransaction);
  }

  private readonly handleEditorTransaction = () => {
    this.render();
  };

  private render() {
    const items = buildNewsTableOfContentsDisplayItems(
      extractNewsTableOfContentsItems(this.editor.getJSON()),
    );
    const highestHeadingLevel =
      NEWS_TABLE_OF_CONTENTS_HEADING_LEVELS[
        NEWS_TABLE_OF_CONTENTS_HEADING_LEVELS.length - 1
      ];

    this.content.replaceChildren();

    if (items.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "news-body-editor__toc-empty";
      emptyState.textContent = `Add H${NEWS_TABLE_OF_CONTENTS_HEADING_LEVELS[0]}-H${highestHeadingLevel} headings to build the table of contents.`;
      this.content.appendChild(emptyState);
      return;
    }

    const list = document.createElement("ol");
    list.className = "news-body-editor__toc-list";

    items.forEach((item) => {
      const listItem = document.createElement("li");
      const button = document.createElement("button");
      const number = document.createElement("span");
      const label = document.createElement("span");

      listItem.className = "news-body-editor__toc-item";
      button.type = "button";
      button.className = "news-body-editor__toc-link";
      button.style.paddingInlineStart = `${item.depth}rem`;
      number.className = "news-body-editor__toc-link-number";
      number.textContent = `${item.numbering}.`;
      number.setAttribute("aria-hidden", "true");
      label.className = "news-body-editor__toc-link-label";
      label.textContent = item.textContent;
      button.addEventListener("click", () => {
        const heading = this.editor.view.dom.querySelector(
          `[id="${escapeAttributeValue(item.id)}"]`,
        );

        if (!(heading instanceof HTMLElement)) {
          return;
        }

        this.editor.commands.focus();
        heading.scrollIntoView({ behavior: "smooth", block: "center" });
      });

      button.append(number, label);
      listItem.appendChild(button);
      list.appendChild(listItem);
    });

    this.content.appendChild(list);
  }
}

export const NewsTableOfContents = Node.create({
  name: NEWS_TABLE_OF_CONTENTS_NODE_NAME,
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  parseHTML() {
    return [{ tag: "div[data-news-body-toc]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-news-body-toc": "",
      }),
    ];
  },

  addNodeView() {
    return ({ editor }) => new NewsBodyTableOfContentsNodeView(editor);
  },
});
