"use client";

import Link from "next/link";
import { Archive, Loader2, Pencil, Trash2, Undo2 } from "lucide-react";
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
        type: "archive" | "delete" | "restore";
      }
    | null;
  onArchive: (article: NewsArticle) => void;
  onDelete: (article: NewsArticle) => void;
  onRestore: (article: NewsArticle) => void;
};

export function getNewsMediaColumns({
  pendingAction,
  onArchive,
  onDelete,
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
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {getValue<number>().toLocaleString()}
        </span>
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
