"use client";

import { NodeSelection } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { EditorView, NodeView } from "@tiptap/pm/view";
import { ImagePlus } from "tiptap-image-plus";
import {
  clampNewsBodyImageWidthPercentage,
  normalizeNewsBodyImageAlignment,
  normalizeNewsBodyImageWidth,
} from "@/app/lib/news-body-images";

type ResizeHandlePosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

const RESIZE_HANDLE_POSITIONS: ResizeHandlePosition[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

const MIN_IMAGE_WIDTH_PX = 120;

function getAlignmentJustification(value: unknown) {
  const alignment = normalizeNewsBodyImageAlignment(value);

  if (alignment === "left") {
    return "flex-start";
  }

  if (alignment === "right") {
    return "flex-end";
  }

  return "center";
}

class NewsBodyImageNodeView implements NodeView {
  dom: HTMLDivElement;
  private readonly view: EditorView;
  private readonly getPos: (() => number | undefined) | boolean;
  private node: ProseMirrorNode;
  private readonly wrapper: HTMLDivElement;
  private readonly container: HTMLDivElement;
  private readonly image: HTMLImageElement;
  private readonly handles: HTMLButtonElement[];

  constructor(
    node: ProseMirrorNode,
    view: EditorView,
    getPos: (() => number | undefined) | boolean,
  ) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.wrapper = document.createElement("div");
    this.container = document.createElement("div");
    this.image = document.createElement("img");
    this.handles = [];

    this.dom = this.wrapper;
    this.wrapper.className = "news-body-editor__image-wrapper";
    this.wrapper.contentEditable = "false";
    this.container.className = "news-body-editor__image-container";
    this.image.className = "news-body-editor__image-element";

    this.wrapper.appendChild(this.container);
    this.container.appendChild(this.image);

    for (const position of RESIZE_HANDLE_POSITIONS) {
      const handle = document.createElement("button");
      handle.type = "button";
      handle.className = "news-body-editor__image-handle";
      handle.setAttribute("data-position", position);
      handle.setAttribute("aria-label", "Resize image");
      handle.addEventListener("pointerdown", (event) =>
        this.handleResizePointerDown(event, position),
      );
      this.handles.push(handle);
      this.container.appendChild(handle);
    }

    this.applyNodeAttributes();
  }

  update(node: ProseMirrorNode) {
    if (node.type.name !== this.node.type.name) {
      return false;
    }

    this.node = node;
    this.applyNodeAttributes();

    return true;
  }

  selectNode() {
    this.wrapper.classList.add("is-selected");
  }

  deselectNode() {
    this.wrapper.classList.remove("is-selected");
  }

  stopEvent(event: Event) {
    return event.target instanceof HTMLElement
      ? event.target.closest(".news-body-editor__image-handle") !== null
      : false;
  }

  ignoreMutation() {
    return true;
  }

  private getNodePosition() {
    return typeof this.getPos === "function" ? this.getPos() : undefined;
  }

  private selectCurrentNode() {
    const pos = this.getNodePosition();

    if (typeof pos !== "number") {
      return;
    }

    const selection = NodeSelection.create(this.view.state.doc, pos);
    const transaction = this.view.state.tr.setSelection(selection);

    this.view.dispatch(transaction);
    this.view.focus();
  }

  private updateNodeAttributes(nextWidth?: string) {
    const pos = this.getNodePosition();

    if (typeof pos !== "number") {
      return;
    }

    const transaction = this.view.state.tr.setNodeMarkup(pos, undefined, {
      ...this.node.attrs,
      width:
        nextWidth !== undefined
          ? normalizeNewsBodyImageWidth(nextWidth)
          : normalizeNewsBodyImageWidth(this.node.attrs.width),
      alignment: normalizeNewsBodyImageAlignment(this.node.attrs.alignment),
    });

    this.view.dispatch(transaction);
  }

  private applyNodeAttributes() {
    const src = typeof this.node.attrs.src === "string" ? this.node.attrs.src : "";
    const alt = typeof this.node.attrs.alt === "string" ? this.node.attrs.alt : "";
    const title =
      typeof this.node.attrs.title === "string" ? this.node.attrs.title : "";
    const width = normalizeNewsBodyImageWidth(this.node.attrs.width);
    const alignment = normalizeNewsBodyImageAlignment(this.node.attrs.alignment);

    this.wrapper.style.justifyContent = getAlignmentJustification(alignment);
    this.wrapper.setAttribute("data-alignment", alignment);
    this.container.setAttribute("data-alignment", alignment);
    this.container.style.width = width || "auto";

    this.image.src = src;
    this.image.alt = alt;

    if (title) {
      this.image.title = title;
    } else {
      this.image.removeAttribute("title");
    }

    if (width) {
      this.image.style.width = "100%";
    } else {
      this.image.style.width = "auto";
    }
  }

  private handleResizePointerDown(
    event: PointerEvent,
    position: ResizeHandlePosition,
  ) {
    event.preventDefault();
    event.stopPropagation();

    this.selectCurrentNode();

    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startWidth = this.container.getBoundingClientRect().width;
    const wrapperWidth = this.wrapper.getBoundingClientRect().width;
    const isLeftHandle = position.endsWith("left");

    if (!wrapperWidth) {
      return;
    }

    const handleTarget = event.currentTarget;

    if (handleTarget instanceof HTMLElement) {
      handleTarget.setPointerCapture(pointerId);
    }

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const nextWidthPx = isLeftHandle
        ? startWidth - deltaX
        : startWidth + deltaX;
      const clampedWidthPx = Math.min(
        Math.max(nextWidthPx, MIN_IMAGE_WIDTH_PX),
        wrapperWidth,
      );
      const percentage = (clampedWidthPx / wrapperWidth) * 100;
      const nextWidth = clampNewsBodyImageWidthPercentage(percentage);

      this.container.style.width = nextWidth || "auto";
      this.image.style.width = "100%";
    };

    const stopResizing = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", stopResizing);
      document.removeEventListener("pointercancel", stopResizing);

      this.updateNodeAttributes(this.container.style.width);

      if (handleTarget instanceof HTMLElement) {
        handleTarget.releasePointerCapture(pointerId);
      }
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", stopResizing);
    document.addEventListener("pointercancel", stopResizing);
  }
}

export const NewsBodyImage = ImagePlus.extend({
  name: "image",
  addNodeView() {
    return ({ node, editor, getPos }) =>
      new NewsBodyImageNodeView(node, editor.view, getPos);
  },
});
