'use client';

import Link from "next/link";
import toast from "react-hot-toast";
import { useState, type ChangeEvent } from "react";
import { buildNewsSlug, type NewsArticle } from "@/app/lib/news-media";

const inputClassName =
  "mt-2 w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[color:var(--brand)]/15";

const toastOptions = {
  position: "top-right" as const,
};

export function NewsPostForm({
  backHref,
  initialArticle,
  mode,
}: {
  backHref: string;
  initialArticle: NewsArticle;
  mode: "create" | "edit";
}) {
  const [article, setArticle] = useState<NewsArticle>(initialArticle);
  const [hasCustomSlug, setHasCustomSlug] = useState(mode === "edit");
  const [selectedImageName, setSelectedImageName] = useState("");

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

  function handleFieldChange(field: keyof NewsArticle, value: string | number) {
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
    toast(
      "Save is not connected yet. This post has not been persisted to the database.",
      toastOptions
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
      <section className="rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
        <div className="border-b border-[var(--border-light)] px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
            {mode === "create" ? "New post" : "Edit post"}
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
            Post details
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Add the core information now. Rich text and persistence will be
            connected later.
          </p>
        </div>

        <div className="space-y-5 p-6">
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
            <p className="mt-2 text-xs text-[var(--text-faint)]">
              Generated from the title until the slug is edited manually.
            </p>
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

          <label>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Body
            </span>
            <textarea
              value={article.body}
              onChange={(event) => handleFieldChange("body", event.target.value)}
              rows={16}
              placeholder="Write the body content here."
              className={`${inputClassName} min-h-[18rem] resize-y`}
            />
          </label>
        </div>
      </section>

      <div className="space-y-6 xl:sticky xl:top-[calc(var(--nav-height)+1.5rem)] xl:self-start">
        <section className="rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                Status
              </p>
              <h2 className="mt-1 font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                {article.status === "published" ? "Published" : "Draft"}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                Turn publishing on when the post should be treated as live.
              </p>
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

        <section className="rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
            Featured image
          </p>
          <div className="mt-4 rounded-[24px] border border-dashed border-[var(--border-light)] bg-[var(--bg-subtle)] p-4">
            <label className="block cursor-pointer">
              <span className="sr-only">Upload featured image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
              />
              <div className="flex min-h-28 flex-col justify-between rounded-[18px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-4 transition-colors hover:border-[var(--border-orange)]">
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
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--border-light)] bg-[linear-gradient(135deg,var(--bg-elevated)_0%,var(--bg-subtle)_100%)] p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
            Actions
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
            >
              Save
            </button>
            <Link
              href={backHref}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
            >
              Back to manage page
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
