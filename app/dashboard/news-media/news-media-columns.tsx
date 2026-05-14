"use client";

import Link from "next/link";
import {
  Archive,
  ExternalLink,
  Loader2,
  Pencil,
  Sparkle,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  getNewsStatusClassName,
  getNewsStatusLabel,
  type NewsArticle,
} from "@/app/lib/news-media";

const iconButtonClassName =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--border-light)] disabled:hover:bg-[var(--bg-elevated)] disabled:hover:text-[var(--text-secondary)]";

type NewsMediaColumnsOptions = {
  pendingAction:
    | {
        postId: string;
        type: "archive" | "delete" | "feature" | "restore";
      }
    | null;
  onArchive: (article: NewsArticle) => void;
  onDelete: (article: NewsArticle) => void;
  onToggleFeatured: (article: NewsArticle) => void;
  onRestore: (article: NewsArticle) => void;
};

export function getNewsMediaColumns({
  pendingAction,
  onArchive,
  onDelete,
  onToggleFeatured,
  onRestore,
}: NewsMediaColumnsOptions): ColumnDef<NewsArticle>[] {
  return [
    {
      accessorKey: "title",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {row.original.title}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--text-faint)]">
            /{row.original.slug}
          </p>
        </div>
      ),
      header: "Post Name",
    },
    {
      accessorKey: "excerpt",
      cell: ({ getValue }) => (
        <p className="truncate text-sm text-[var(--text-secondary)]">
          {getValue<string>()}
        </p>
      ),
      header: "Excerpt",
    },
    {
      accessorKey: "isFeatured",
      cell: ({ row }) => {
        const article = row.original;
        const isPending =
          pendingAction?.postId === article.id &&
          pendingAction.type === "feature";
        const isFeatureEligible = article.status === "published";

        return (
          <div className="flex justify-center">
            <button
              type="button"
              disabled={!isFeatureEligible || isPending}
              aria-label={
                article.isFeatured
                  ? `Clear featured post for ${article.title}`
                  : `Feature ${article.title}`
              }
              aria-pressed={article.isFeatured}
              title={
                isFeatureEligible
                  ? article.isFeatured
                    ? "Featured post"
                    : "Set as featured post"
                  : "Only published posts can be featured"
              }
              onClick={() => onToggleFeatured(article)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed ${
                article.isFeatured
                  ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)] shadow-[0_0_16px_rgba(245,166,35,0.35)]"
                  : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-faint)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] disabled:hover:border-[var(--border-light)] disabled:hover:bg-[var(--bg-elevated)] disabled:hover:text-[var(--text-faint)]"
              } ${isPending ? "opacity-80" : ""}`}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : article.isFeatured ? (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Sparkle className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        );
      },
      enableSorting: false,
      header: "Featured",
      id: "featured",
    },
    {
      accessorKey: "status",
      cell: ({ getValue }) => {
        const status = getValue<NewsArticle["status"]>();

        return (
          <span
            className={`inline-flex min-w-[6rem] items-center justify-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${getNewsStatusClassName(
              status,
            )}`}
          >
            {getNewsStatusLabel(status)}
          </span>
        );
      },
      filterFn: (row, columnId, value) => {
        if (!value) {
          return true;
        }

        return row.getValue(columnId) === value;
      },
      header: "Status",
    },
    {
      accessorKey: "views",
      cell: ({ getValue }) => (
        <div className="text-center">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {getValue<number>().toLocaleString()}
          </span>
        </div>
      ),
      header: "Views",
    },
    {
      cell: ({ row }) => {
        const article = row.original;
        const isArchived = article.status === "archived";
        const isPending = pendingAction?.postId === article.id;

        return (
          <div className="mx-auto flex w-fit items-center justify-center gap-2">
            <Link
              href={`/dashboard/news-media/${article.id}`}
              aria-label={`Edit ${article.title}`}
              title="Edit"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand)] text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Link>
            {
              !isArchived && (
                <Link
                  href={`/news-media/${article.slug}?preview=true`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Preview ${article.title}`}
                  title="Preview"
                  className={iconButtonClassName}
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Link>
              )
            }
            {isArchived ? (
              <>
                <button
                  type="button"
                  disabled={isPending}
                  aria-label={`Restore ${article.title}`}
                  title="Restore"
                  onClick={() => onRestore(article)}
                  className={iconButtonClassName}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Undo2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  aria-label={`Delete ${article.title}`}
                  title="Delete"
                  onClick={() => onDelete(article)}
                  className={iconButtonClassName}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={isPending}
                aria-label={`Archive ${article.title}`}
                title="Archive"
                onClick={() => onArchive(article)}
                className={iconButtonClassName}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Archive className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        );
      },
      enableSorting: false,
      header: "Actions",
      id: "actions",
    },
  ];
}
