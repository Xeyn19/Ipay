"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Editor } from "@tiptap/react";
import toast from "react-hot-toast";
import { uploadNewsBodyImage } from "@/app/dashboard/news-media/actions";
import { EDITOR_IMAGE_ALLOWED_MIME_TYPES } from "../extensions";
import type { ImageInsertTarget, SelectedImageState } from "../types";
import { getImageInsertTarget, insertImageNode } from "../utils";

export function useImageUploadState({
  closeMenu,
}: {
  closeMenu: () => void;
}) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const pendingImageInsertTargetRef = useRef<ImageInsertTarget>(null);
  const [isImageUrlModalOpen, setIsImageUrlModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  async function uploadImageFile(file: File) {
    try {
      const formData = new FormData();

      formData.set("image", file);

      const result = await uploadNewsBodyImage(formData);

      if (result.status === "error" || !result.url) {
        toast.error(result.message || "The image could not be uploaded.");
        return null;
      }

      return result.url;
    } catch {
      toast.error("The image could not be uploaded.");
      return null;
    }
  }

  async function uploadAndInsertImages(
    targetEditor: Editor,
    files: File[],
    target?: ImageInsertTarget,
  ) {
    const imageFiles = files.filter((file) =>
      EDITOR_IMAGE_ALLOWED_MIME_TYPES.includes(
        file.type as (typeof EDITOR_IMAGE_ALLOWED_MIME_TYPES)[number],
      ),
    );

    if (imageFiles.length === 0) {
      return;
    }

    setIsUploadingImage(true);

    try {
      let nextTarget = target;

      for (const file of imageFiles) {
        const imageUrl = await uploadImageFile(file);

        if (!imageUrl) {
          continue;
        }

        insertImageNode(targetEditor, imageUrl, nextTarget);
        nextTarget = undefined;
      }
    } finally {
      setIsUploadingImage(false);
    }
  }

  function openUploadFromComputer(editor: Editor | null) {
    if (!editor || isUploadingImage) {
      return;
    }

    pendingImageInsertTargetRef.current = getImageInsertTarget(editor);
    closeMenu();
    imageInputRef.current?.click();
  }

  async function handleImageInputChange(
    editor: Editor | null,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFiles = Array.from(event.target.files ?? []);
    const target = pendingImageInsertTargetRef.current;

    pendingImageInsertTargetRef.current = null;
    event.target.value = "";

    if (!editor || selectedFiles.length === 0) {
      return;
    }

    await uploadAndInsertImages(editor, selectedFiles, target);
  }

  function openImageUrlModal(editor: Editor | null) {
    if (!editor) {
      return;
    }

    pendingImageInsertTargetRef.current = getImageInsertTarget(editor);
    closeMenu();
    setIsImageUrlModalOpen(true);
  }

  function closeImageUrlModal() {
    pendingImageInsertTargetRef.current = null;
    setIsImageUrlModalOpen(false);
  }

  function handleInsertImageUrl(editor: Editor | null, url: string) {
    if (!editor) {
      return;
    }

    insertImageNode(editor, url, pendingImageInsertTargetRef.current);
    pendingImageInsertTargetRef.current = null;
    setIsImageUrlModalOpen(false);
  }

  return {
    closeImageUrlModal,
    handleImageInputChange,
    handleInsertImageUrl,
    imageInputRef,
    isImageUrlModalOpen,
    isUploadingImage,
    openImageUrlModal,
    openUploadFromComputer,
    uploadAndInsertImages,
  };
}

type UseImageActionsOptions = {
  closeImageBubbleSubmenu: () => void;
  editor: Editor | null;
  selectedImage: SelectedImageState | null;
  setIsImageAltEditorOpen: (value: boolean) => void;
  setOpenImageBubbleSubmenu: (value: "alignment" | "size" | null) => void;
};

export function useImageActions({
  closeImageBubbleSubmenu,
  editor,
  selectedImage,
  setIsImageAltEditorOpen,
  setOpenImageBubbleSubmenu,
}: UseImageActionsOptions) {
  const imageAltSourceValue = selectedImage?.alt ?? "";
  const imageAltSourceKey = `${selectedImage?.pos ?? "none"}:${imageAltSourceValue}`;
  const [imageAltInputState, setImageAltInputState] = useState<{
    sourceKey: string;
    value: string;
  }>({
    sourceKey: imageAltSourceKey,
    value: imageAltSourceValue,
  });
  const imageAltInputValue =
    imageAltInputState.sourceKey === imageAltSourceKey
      ? imageAltInputState.value
      : imageAltSourceValue;

  useEffect(() => {
    if (!selectedImage) {
      setOpenImageBubbleSubmenu(null);
      setIsImageAltEditorOpen(false);
      return;
    }

    setOpenImageBubbleSubmenu(null);
    setIsImageAltEditorOpen(false);
  }, [
    selectedImage,
    selectedImage?.alt,
    selectedImage?.pos,
    setIsImageAltEditorOpen,
    setOpenImageBubbleSubmenu,
  ]);

  function updateSelectedImageAttributes(
    attributes: Partial<{
      alignment: "left" | "center" | "right";
      alt: string;
      width: string;
    }>,
  ) {
    if (!editor || !selectedImage) {
      return;
    }

    editor
      .chain()
      .focus()
      .setNodeSelection(selectedImage.pos)
      .updateAttributes("image", attributes)
      .run();
  }

  function runImageBubbleAction(action: () => void) {
    action();
    closeImageBubbleSubmenu();
    setIsImageAltEditorOpen(false);
  }

  function openImageAltEditor() {
    if (!selectedImage) {
      return;
    }

    setOpenImageBubbleSubmenu(null);
    setImageAltInputState({
      sourceKey: imageAltSourceKey,
      value: selectedImage.alt,
    });
    setIsImageAltEditorOpen(true);
  }

  function saveSelectedImageAlt() {
    updateSelectedImageAttributes({
      alt: imageAltInputValue.trim(),
    });
    setIsImageAltEditorOpen(false);
  }

  function deleteSelectedImage() {
    if (!editor || !selectedImage) {
      return;
    }

    editor.chain().focus().setNodeSelection(selectedImage.pos).deleteSelection().run();
    closeImageBubbleSubmenu();
    setIsImageAltEditorOpen(false);
  }

  return {
    deleteSelectedImage,
    imageAltInputValue,
    openImageAltEditor,
    saveSelectedImageAlt,
    setImageAltInputValue: (value: string) =>
      setImageAltInputState({
        sourceKey: imageAltSourceKey,
        value,
      }),
    updateSelectedImageAttributes,
    runImageBubbleAction,
  };
}
