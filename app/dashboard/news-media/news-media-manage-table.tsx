"use client";

import { Search, ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { FormEvent } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import type { NewsArticle, NewsArticleStatus } from "@/app/lib/news-media";
import type { NewsPostStatusCounts } from "@/app/lib/news-posts";
import { newsMediaColumns } from "./news-media-columns";

const searchButtonClassName =
  "inline-flex items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--border-light)] disabled:hover:bg-[var(--bg-elevated)] disabled:hover:text-[var(--text-secondary)] sm:self-stretch";

const columnClassNames: Record<string, string> = {
  actions: "w-[9.5rem]",
  excerpt: "w-[26rem]",
  status: "w-[7.5rem]",
  title: "w-[18rem]",
  views: "w-[6.5rem]",
};

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

function getSortLabel(sortState: false | "asc" | "desc", header: string) {
  if (sortState === "asc") {
    return `${header}, sorted ascending. Click to sort descending.`;
  }

  if (sortState === "desc") {
    return `${header}, sorted descending. Click to clear sorting.`;
  }

  return `${header}, not sorted. Click to sort ascending.`;
}

function SortIcon({ sortState }: { sortState: false | "asc" | "desc" }) {
  if (sortState === "asc") {
    return <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />;
  }

  if (sortState === "desc") {
    return <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />;
  }

  return <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden="true" />;
}

export function NewsMediaManageTable({
  activeFilter,
  data,
  isLoading,
  pagination,
  searchInput,
  sorting,
  statusCounts,
  totalCount,
  onFilterToggle,
  onPaginationChange,
  onSearchInputChange,
  onSearchSubmit,
  onSortingChange,
}: {
  activeFilter: NewsArticleStatus | null;
  data: NewsArticle[];
  isLoading: boolean;
  pagination: PaginationState;
  searchInput: string;
  sorting: SortingState;
  statusCounts: NewsPostStatusCounts;
  totalCount: number;
  onFilterToggle: (status: NewsArticleStatus) => void;
  onPaginationChange: (
    updater: PaginationState | ((current: PaginationState) => PaginationState),
  ) => void;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSortingChange: (
    updater: SortingState | ((current: SortingState) => SortingState),
  ) => void;
}) {
  // TanStack Table exposes function-heavy instances that React Compiler cannot memoize safely.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    columns: newsMediaColumns,
    data,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onPaginationChange,
    onSortingChange,
    pageCount: Math.max(1, Math.ceil(totalCount / pagination.pageSize)),
    state: {
      pagination,
      sorting,
    },
  });

  const pageCount = Math.max(table.getPageCount(), 1);
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <FilterPill
          count={statusCounts.draft}
          isActive={activeFilter === "draft"}
          label="Draft"
          onClick={() => onFilterToggle("draft")}
        />
        <FilterPill
          count={statusCounts.published}
          isActive={activeFilter === "published"}
          label="Published"
          onClick={() => onFilterToggle("published")}
        />
      </div>

      <form
        onSubmit={onSearchSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-stretch"
      >
        <label className="relative flex-1">
          <span className="sr-only">Search posts</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Search posts"
            className="h-11 w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] pl-10 pr-4 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[color:var(--brand)]/15"
          />
        </label>
        <button type="submit" className={searchButtonClassName}>
          Search
        </button>
      </form>

      <section className="overflow-hidden rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
        {isLoading ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Loading posts...
            </p>
          </div>
        ) : rows.length === 0 ? (
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
              Adjust the pills or search term to see other posts.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[68rem] table-fixed">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]"
                    >
                      {headerGroup.headers.map((header) => {
                        const columnId = header.column.id;
                        const sortState = header.column.getIsSorted();
                        const headerText =
                          typeof header.column.columnDef.header === "string"
                            ? header.column.columnDef.header
                            : header.id;

                        return (
                          <th
                            key={header.id}
                            className={`${columnClassNames[columnId] ?? ""} px-3 py-3`}
                          >
                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                              <button
                                type="button"
                                onClick={header.column.getToggleSortingHandler()}
                                aria-label={getSortLabel(sortState, headerText)}
                                className="inline-flex max-w-full items-center gap-1.5 text-left transition-colors hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                              >
                                <span className="truncate">
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                                </span>
                                <SortIcon sortState={sortState} />
                              </button>
                            ) : (
                              <span className="block truncate">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-[var(--border-light)]">
                  {rows.map((row) => (
                    <tr key={row.id} className="align-middle">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={`${columnClassNames[cell.column.id] ?? ""} min-w-0 px-3 py-4`}
                        >
                          <div className="min-w-0">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[var(--border-light)] px-5 py-4 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
              <p className="font-medium">
                Page {pagination.pageIndex + 1} of {pageCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
