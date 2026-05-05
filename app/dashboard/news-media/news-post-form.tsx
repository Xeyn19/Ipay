'use client';

import Image from "next/image";
import { Expand, Pencil, X } from "lucide-react";
import { type Editor } from "@tiptap/react";
import toast from "react-hot-toast";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import {
  EMPTY_NEWS_BODY,
  buildNewsSlug,
  formatNewsDate,
  type NewsArticle,
} from "@/app/lib/news-media";
import { NewsBodyEditor } from "./news-body-editor";

const inputClassName =
  "mt-2 w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[color:var(--brand)]/15";

const toastOptions = {
  position: "top-right" as const,
};

export function NewsPostForm({
  initialArticle,
  mode,
}: {
  initialArticle: NewsArticle;
  mode: "create" | "edit";
}) {
  const [article, setArticle] = useState<NewsArticle>(initialArticle);
  const [hasCustomSlug, setHasCustomSlug] = useState(mode === "edit");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [imagePreviewSrc, setImagePreviewSrc] = useState(initialArticle.coverImage);
  const editorRef = useRef<Editor | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const imageModalTitleId = useId();
  const imageModalDescriptionId = useId();
  const initialBodyContent = mode === "edit" ? initialArticle.body : null;
  const isObjectUrlPreview = imagePreviewSrc.startsWith("blob:");
  const imagePreviewLabel = selectedImageName || "Choose an image file";
  const imageModalTitle = article.title.trim() || "Untitled post";
  const imageModalDate = formatNewsDate(article.publishDate);

  function clearPreviewObjectUrl() {
    if (!previewObjectUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(previewObjectUrlRef.current);
    previewObjectUrlRef.current = null;
  }

  useEffect(() => clearPreviewObjectUrl, []);

  useEffect(() => {
    if (!isImageModalOpen) {
      return;
    }

    const originalBodyOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsImageModalOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageModalOpen]);

  function handleTitleChange(value: string) {
    setArticle((current) => ({
      ...current,
      title: value,
      slug: hasCustomSlug ? current.slug : buildNewsSlug(value),
    }));
  }

  function handleSlugChange(value: string) {
    const nextSlug = buildNewsSlug(value);
    setHasCustomSlug(nextSlug.length > 0);
    setArticle((current) => ({
      ...current,
      slug: nextSlug,
    }));
  }

  function handleFieldChange<Field extends "excerpt">(
    field: Field,
    value: NewsArticle[Field]
  ) {
    setArticle((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      clearPreviewObjectUrl();
      setSelectedImageName("");
      setImagePreviewSrc(initialArticle.coverImage);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);

    clearPreviewObjectUrl();
    previewObjectUrlRef.current = nextPreviewUrl;
    setSelectedImageName(selectedFile.name);
    setImagePreviewSrc(nextPreviewUrl);
  }

  function openImagePicker(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    imageInputRef.current?.click();
  }

  function openImageModal(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsImageModalOpen(true);
  }

  function closeImageModal() {
    setIsImageModalOpen(false);
  }

  function handleToggleStatus() {
    setArticle((current) => ({
      ...current,
      status: current.status === "published" ? "draft" : "published",
    }));
  }

  function handleSave() {
    const body = editorRef.current?.getJSON() ?? EMPTY_NEWS_BODY;

    setArticle((current) => ({
      ...current,
      body,
    }));

    toast(
      "Save is not connected yet. This post has not been persisted to the database.",
      toastOptions
    );
  }

  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        <section className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 p-6">
            <label>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Title
              </span>
              <input
                type="text"
                value={article.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Enter the post title"
                className={inputClassName}
              />
            </label>

            <label>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                URL slug
              </span>
              <input
                type="text"
                value={article.slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                placeholder="post-url-slug"
                className={inputClassName}
              />
            </label>

            <label>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Excerpt
              </span>
              <textarea
                value={article.excerpt}
                onChange={(event) => handleFieldChange("excerpt", event.target.value)}
                rows={5}
                placeholder="Write a short summary for the post listing."
                className={`${inputClassName} resize-y`}
              />
            </label>

            <div>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Body
              </span>
              <NewsBodyEditor
                initialContent={initialBodyContent}
                editorRef={editorRef}
              />
            </div>
          </div>
        </section>

        <div className="space-y-6 xl:sticky xl:top-[calc(var(--nav-height)+1.5rem)] xl:self-start">
          <section className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                  Status
                </p>
                <h2 className="mt-1 font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                  {article.status === "published" ? "Published" : "Draft"}
                </h2>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={article.status === "published"}
                onClick={handleToggleStatus}
                className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] ${
                  article.status === "published"
                    ? "border-[var(--tone-green)]/30 bg-[var(--tone-green-soft)]"
                    : "border-[var(--border-light)] bg-[var(--bg-subtle)]"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                    article.status === "published"
                      ? "translate-x-7"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
              Featured image
            </p>
            <label className="group block cursor-pointer">
              <span className="sr-only">Upload featured image</span>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
              <div className="relative min-h-40 overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)] transition-colors group-hover:border-[var(--border-orange)] group-focus-within:border-[var(--border-orange)]">
                <Image
                  src={imagePreviewSrc}
                  alt={article.title || "Featured image preview"}
                  fill
                  sizes="(max-width: 1279px) 100vw, 24rem"
                  className="object-cover transition duration-200 group-hover:scale-[1.02] group-hover:brightness-75 group-focus-within:scale-[1.02] group-focus-within:brightness-75"
                  unoptimized={isObjectUrlPreview}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,29,0.04)_0%,rgba(8,17,29,0.16)_45%,rgba(8,17,29,0.7)_100%)] transition group-hover:bg-[linear-gradient(180deg,rgba(8,17,29,0.16)_0%,rgba(8,17,29,0.3)_45%,rgba(8,17,29,0.78)_100%)] group-focus-within:bg-[linear-gradient(180deg,rgba(8,17,29,0.16)_0%,rgba(8,17,29,0.3)_45%,rgba(8,17,29,0.78)_100%)]" />
                <div className="absolute right-4 top-4 z-10 flex items-center gap-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  <button
                    type="button"
                    aria-label="View featured image fullscreen"
                    onClick={openImageModal}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/14 text-white shadow-sm backdrop-blur-sm transition hover:bg-white/22 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    <Expand className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Edit featured image"
                    onClick={openImagePicker}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/14 text-white shadow-sm backdrop-blur-sm transition hover:bg-white/22 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-sm font-semibold text-white">
                    {imagePreviewLabel}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/78">
                    JPG, PNG, or WEBP can be attached here when storage is
                    connected.
                  </p>
                </div>
              </div>
            </label>
          </section>

          <section>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex w-full h-11 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
            >
              Save
            </button>
          </section>
        </div>
      </div>

      {isImageModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/88 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close image viewer"
            onClick={closeImageModal}
            className="absolute inset-0"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={imageModalTitleId}
            aria-describedby={imageModalDescriptionId}
            className="relative flex h-full w-full items-center justify-center"
          >
            <button
              type="button"
              aria-label="Close image viewer"
              onClick={closeImageModal}
              className="absolute right-4 top-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/30 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:right-6 sm:top-6"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="relative h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] sm:h-[calc(100vh-3rem)] sm:w-[calc(100vw-3rem)]">
              <Image
                src={imagePreviewSrc}
                alt={article.title || "Featured image preview"}
                fill
                sizes="100vw"
                className="object-contain"
                unoptimized={isObjectUrlPreview}
                priority
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.72)_100%)]" />
              <div className="absolute bottom-4 left-4 z-10 max-w-[min(30rem,calc(100%-2rem))] text-white sm:bottom-6 sm:left-6">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white/65">
                  Featured image
                </p>
                <h2
                  id={imageModalTitleId}
                  className="mt-2 font-heading text-xl font-semibold leading-tight tracking-[-0.03em] sm:text-2xl"
                >
                  {imageModalTitle}
                </h2>
                <p
                  id={imageModalDescriptionId}
                  className="mt-2 text-sm text-white/78"
                >
                  {imageModalDate}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
