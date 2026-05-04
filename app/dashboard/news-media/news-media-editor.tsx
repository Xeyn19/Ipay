'use client';

import Image from "next/image";
import { useState } from "react";
import {
  buildNewsSlug,
  createEmptyNewsArticle,
  estimateNewsReadingMinutes,
  formatNewsDate,
  getNewsBodyParagraphs,
  getPublishedNewsArticles,
  getNewsStatusClassName,
  getNewsStatusLabel,
  newsExternalCoverage,
  newsEditorSampleArticle,
  newsFeaturedVideos,
  newsSeedArticles,
  newsStatusOptions,
  type NewsArticle,
  type NewsArticleStatus,
} from "@/app/lib/news-media";

const inputClassName =
  "mt-2 w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[color:var(--brand)]/15";

function cloneArticle(article: NewsArticle): NewsArticle {
  return { ...article };
}

export function NewsMediaEditor() {
  const [article, setArticle] = useState<NewsArticle>(() =>
    cloneArticle(createEmptyNewsArticle())
  );
  const [hasCustomSlug, setHasCustomSlug] = useState(false);

  const previewTitle = article.title.trim() || "Untitled article";
  const previewCategory = article.category.trim() || "Company Update";
  const previewExcerpt =
    article.excerpt.trim() ||
    "Add a concise summary to show how this story will appear on the public News & Media page.";
  const previewBody =
    article.body.trim() ||
    "Write the body of the article here. The preview will update immediately as your draft takes shape.";
  const previewSlug =
    article.slug || buildNewsSlug(article.title) || "untitled-article";
  const previewCoverImage =
    article.coverImage.trim() || createEmptyNewsArticle().coverImage;
  const previewPublishDate = article.publishDate || "2026-05-10";
  const previewParagraphs = getNewsBodyParagraphs(previewBody);
  const previewReadingTime = estimateNewsReadingMinutes(previewBody);
  const publishedArticles = getPublishedNewsArticles(newsSeedArticles);

  const handleTitleChange = (value: string) => {
    setArticle((current) => ({
      ...current,
      title: value,
      slug: hasCustomSlug ? current.slug : buildNewsSlug(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    const nextSlug = buildNewsSlug(value);
    setHasCustomSlug(nextSlug.length > 0);
    setArticle((current) => ({
      ...current,
      slug: nextSlug,
    }));
  };

  const handleFieldChange = (
    field: keyof NewsArticle,
    value: string | NewsArticleStatus
  ) => {
    setArticle((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLoadSample = () => {
    setArticle(cloneArticle(newsEditorSampleArticle));
    setHasCustomSlug(true);
  };

  const handleReset = () => {
    setArticle(cloneArticle(createEmptyNewsArticle()));
    setHasCustomSlug(false);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--border-orange)] bg-[var(--bg-elevated)] px-5 py-4 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
              Preview-only workspace
            </p>
            <h2 className="mt-1 font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
              Draft the structure before backend publishing is added
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              This editor mirrors the public News &amp; Media field model and
              layout style. Changes stay in local page state only for now.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-base)] px-4 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)]"
            >
              Load sample article
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-light)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              Reset draft
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Published Stories",
            value: `${publishedArticles.length}`,
            detail: "Visible on the public newsroom feed",
          },
          {
            label: "Coverage Items",
            value: `${newsExternalCoverage.length}`,
            detail: "Used for the `In the News` block",
          },
          {
            label: "Video Features",
            value: `${newsFeaturedVideos.length}`,
            detail: "Used for the final media section",
          },
          {
            label: "Current Draft",
            value: getNewsStatusLabel(article.status),
            detail: "Preview state for the article you are editing",
          },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-card)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
              {item.label}
            </p>
            <p className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              {item.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {item.detail}
            </p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <section className="rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--border-light)] px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
              Editor
            </p>
            <h2 className="mt-1 font-heading text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              News article input
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Keep the story concise, public-facing, and aligned with the
              current iPay brand voice.
            </p>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Title
              </span>
              <input
                type="text"
                value={article.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                placeholder="Enter the article title"
                className={inputClassName}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Slug
              </span>
              <input
                type="text"
                value={article.slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                placeholder="article-url-slug"
                className={inputClassName}
              />
            </label>

            <label>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Category
              </span>
              <input
                type="text"
                value={article.category}
                onChange={(event) =>
                  handleFieldChange("category", event.target.value)
                }
                placeholder="Company Update"
                className={inputClassName}
              />
            </label>

            <label>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Status
              </span>
              <select
                value={article.status}
                onChange={(event) =>
                  handleFieldChange(
                    "status",
                    event.target.value as NewsArticleStatus
                  )
                }
                className={inputClassName}
              >
                {newsStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Publish date
              </span>
              <input
                type="date"
                value={article.publishDate}
                onChange={(event) =>
                  handleFieldChange("publishDate", event.target.value)
                }
                className={inputClassName}
              />
            </label>

            <label>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Cover image
              </span>
              <input
                type="text"
                value={article.coverImage}
                onChange={(event) =>
                  handleFieldChange("coverImage", event.target.value)
                }
                placeholder="/img/main-hero.jpg"
                className={inputClassName}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Excerpt
              </span>
              <textarea
                value={article.excerpt}
                onChange={(event) =>
                  handleFieldChange("excerpt", event.target.value)
                }
                rows={4}
                placeholder="Write the short summary that will appear in the article listing."
                className={`${inputClassName} resize-y`}
              />
            </label>

            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                Body
              </span>
              <textarea
                value={article.body}
                onChange={(event) =>
                  handleFieldChange("body", event.target.value)
                }
                rows={12}
                placeholder="Write the full article body. Separate paragraphs with a blank line."
                className={`${inputClassName} min-h-[16rem] resize-y`}
              />
            </label>
          </div>
        </section>

        <div className="space-y-6 xl:sticky xl:top-[calc(var(--nav-height)+1.5rem)] xl:self-start">
          <section className="rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
            <div className="border-b border-[var(--border-light)] px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                Live preview
              </p>
              <h2 className="mt-1 font-heading text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                Public newsroom article presentation
              </h2>
            </div>

            <div className="p-6">
              <article className="overflow-hidden rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-base)] shadow-[var(--shadow-control)]">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={previewCoverImage}
                    alt={previewTitle}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1280px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,17,26,0.04)_0%,rgba(13,17,26,0.68)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 px-5 py-4">
                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur">
                      {previewCategory}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] backdrop-blur ${getNewsStatusClassName(
                        article.status
                      )}`}
                    >
                      {getNewsStatusLabel(article.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-5 p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[var(--text-faint)]">
                    <span>{formatNewsDate(previewPublishDate)}</span>
                    <span className="text-[var(--border-light)]">/</span>
                    <span>{previewReadingTime} min read</span>
                    <span className="text-[var(--border-light)]">/</span>
                    <span>/{previewSlug}</span>
                  </div>

                  <div>
                    <h3 className="font-heading text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                      {previewTitle}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                      {previewExcerpt}
                    </p>
                  </div>

                  <div className="space-y-4 border-t border-[var(--border-light)] pt-5">
                    {previewParagraphs.slice(0, 3).map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-sm leading-7 text-[var(--text-secondary)]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
              Newsroom structure
            </p>
            <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--text-muted)]">
              <p>
                The public page now follows a newsroom-style layout: featured
                story, side media panel, press releases, external coverage,
                archive cards, and featured media.
              </p>
              <p>
                This editor currently shapes the main article model that fits
                the featured story and press-release style sections best.
              </p>
              <p>
                Use short excerpts, clean slugs, and paragraph breaks to keep
                the newsroom layout readable and consistent.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border-light)] bg-[linear-gradient(135deg,var(--bg-elevated)_0%,var(--bg-subtle)_100%)] p-5 shadow-[var(--shadow-card)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
              Section map
            </p>

            <div className="mt-4 space-y-3">
              {[
                {
                  title: "Featured Story",
                  detail: "Large hero article using title, cover image, excerpt, and body preview.",
                },
                {
                  title: "Press Releases",
                  detail: "List-style official announcement entries grouped below the lead story.",
                },
                {
                  title: "In the News",
                  detail: "External coverage cards using separate mock items and outbound links.",
                },
                {
                  title: "Featured Video",
                  detail: "Media-style cards for interviews, clips, and other branded content.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[20px] border border-[var(--border-light)] bg-[var(--bg-base)]/75 px-4 py-3"
                >
                  <p className="font-heading text-base font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-[var(--text-muted)]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
