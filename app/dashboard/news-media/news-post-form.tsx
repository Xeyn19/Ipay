'use client';

import { type Editor } from "@tiptap/react";
import toast from "react-hot-toast";
import { useRef, useState, type ChangeEvent } from "react";
import {
  EMPTY_NEWS_BODY,
  buildNewsSlug,
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
  const [selectedImageName, setSelectedImageName] = useState("");
  const editorRef = useRef<Editor | null>(null);
  const initialBodyContent = mode === "edit" ? initialArticle.body : null;

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
    setSelectedImageName(selectedFile?.name ?? "");
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
          <label className="block cursor-pointer">
            <span className="sr-only">Upload featured image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
            <div className="flex min-h-28 flex-col justify-between rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] p-4 transition-colors hover:border-[var(--border-orange)]">
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {selectedImageName || "Choose an image file"}
                </p>
                <p className="mt-2 text-xs leading-6 text-[var(--text-muted)]">
                  JPG, PNG, or WEBP can be attached here when storage is
                  connected.
                </p>
              </div>
              <span className="mt-4 inline-flex w-fit rounded-full border border-[var(--border-light)] bg-[var(--bg-subtle)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Select file
              </span>
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
  );
}
