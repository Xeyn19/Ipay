'use client';

import Link from "next/link";
import { Search } from "lucide-react";
import { useDeferredValue, useState } from "react";
import {
  getNewsStatusClassName,
  getNewsStatusLabel,
  type NewsArticle,
  type NewsArticleStatus,
} from "@/app/lib/news-media";

const buttonClassName =
  "inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--border-light)] disabled:hover:bg-[var(--bg-elevated)] disabled:hover:text-[var(--text-secondary)]";

function matchesSearch(article: NewsArticle, query: string) {
  if (!query) {
    return true;
  }

  const searchableText = [
    article.title,
    article.slug,
    article.excerpt,
    article.body,
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

function FilterPill({
  count,
  isActive,
  label,
  onClick,
}: {
  count: number;
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] ${
        isActive
          ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]"
          : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span>{label}</span>
      <span
        className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-[0.7rem] ${
          isActive
            ? "bg-white/80 text-[var(--brand)]"
            : "bg-[var(--bg-subtle)] text-[var(--text-faint)]"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

export function NewsMediaManageTable({
  articles,
}: {
  articles: NewsArticle[];
}) {
  const [activeFilter, setActiveFilter] = useState<NewsArticleStatus | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = deferredSearchQuery.trim().toLowerCase();
  const draftCount = articles.filter((article) => article.status === "draft").length;
  const publishedCount = articles.filter(
    (article) => article.status === "published"
  ).length;
  const filteredArticles = articles
    .filter((article) =>
      activeFilter ? article.status === activeFilter : true
    )
    .filter((article) => matchesSearch(article, normalizedSearchQuery));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <FilterPill
          count={draftCount}
          isActive={activeFilter === "draft"}
          label="Draft"
          onClick={() =>
            setActiveFilter((current) => (current === "draft" ? null : "draft"))
          }
        />
        <FilterPill
          count={publishedCount}
          isActive={activeFilter === "published"}
          label="Published"
          onClick={() =>
            setActiveFilter((current) =>
              current === "published" ? null : "published"
            )
          }
        />
      </div>

      <form
        onSubmit={(event) => event.preventDefault()}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label className="relative flex-1">
          <span className="sr-only">Search posts</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search posts"
            className="h-11 w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] pl-10 pr-4 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[color:var(--brand)]/15"
          />
        </label>
        <button type="submit" className={buttonClassName}>
          Search
        </button>
      </form>

      <section className="overflow-hidden rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-2 border-b border-[var(--border-light)] bg-[var(--bg-subtle)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
              All posts
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Manage static newsroom entries while persistence is still being
              prepared.
            </p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
            {filteredArticles.length} shown
          </span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)]">
              <Search
                className="h-5 w-5 text-[var(--text-faint)]"
                aria-hidden="true"
              />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              No posts match the current filters
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Adjust the pills or search term to see other static posts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead>
                <tr className="text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                  <th className="w-[20rem] px-5 py-3">Post Name</th>
                  <th className="w-[30rem] px-5 py-3">Excerpt</th>
                  <th className="w-[9rem] px-5 py-3">Status</th>
                  <th className="w-[8rem] px-5 py-3">Views</th>
                  <th className="w-[14rem] px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="align-top">
                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                          {article.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-[var(--text-faint)]">
                          /{article.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="max-w-[30rem] text-sm leading-6 text-[var(--text-secondary)]">
                        {article.excerpt}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex min-w-[6rem] items-center justify-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${getNewsStatusClassName(
                          article.status
                        )}`}
                      >
                        {getNewsStatusLabel(article.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[var(--text-secondary)]">
                      {article.views.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" disabled className={buttonClassName}>
                          View
                        </button>
                        <Link
                          href={`/dashboard/news-media/${article.id}`}
                          className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                        >
                          Edit
                        </Link>
                        <button type="button" disabled className={buttonClassName}>
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
