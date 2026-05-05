"use client";

import type { ReadonlyURLSearchParams } from "next/navigation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import {
  NEWS_POSTS_PAGE_SIZE,
  type PostsQueryParams,
} from "@/app/lib/news-posts";
import type { NewsArticleStatus } from "@/app/lib/news-media";
import { NewsMediaManageTable } from "./news-media-manage-table";
import { usePosts } from "./use-posts";

function getFilterFromSearchParams(
  searchParams: ReadonlyURLSearchParams,
): NewsArticleStatus | null {
  const filter = searchParams.get("filter");

  if (filter === "draft" || filter === "published" || filter === "archived") {
    return filter;
  }

  return null;
}

export function NewsMediaManageClient() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: NEWS_POSTS_PAGE_SIZE,
  });
  const activeFilter = getFilterFromSearchParams(searchParams);

  const params: PostsQueryParams = {
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    searchQuery,
    sortBy: sorting,
    status: activeFilter,
  };
  const { data, isLoading, statusCounts, totalCount } = usePosts(
    params,
    refreshKey,
  );

  const resetToFirstPage = useCallback(() => {
    setPagination((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    );
  }, []);

  const handlePaginationChange = useCallback(
    (updater: PaginationState | ((current: PaginationState) => PaginationState)) => {
      setPagination((current) =>
        typeof updater === "function" ? updater(current) : updater,
      );
    },
    [],
  );

  const handleSortingChange = useCallback(
    (updater: SortingState | ((current: SortingState) => SortingState)) => {
      setSorting((current) =>
        typeof updater === "function" ? updater(current) : updater,
      );
      resetToFirstPage();
    },
    [resetToFirstPage],
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearchQuery(searchInput.trim());
    resetToFirstPage();
  }

  function syncFilterInUrl(nextFilter: NewsArticleStatus | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextFilter) {
      params.set("filter", nextFilter);
    } else {
      params.delete("filter");
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }

  function handleFilterToggle(status: NewsArticleStatus) {
    const nextFilter = activeFilter === status ? null : status;
    syncFilterInUrl(nextFilter);
    resetToFirstPage();
  }

  return (
    <NewsMediaManageTable
      activeFilter={activeFilter}
      data={data}
      isLoading={isLoading}
      pagination={pagination}
      searchInput={searchInput}
      sorting={sorting}
      statusCounts={statusCounts}
      totalCount={totalCount}
      onFilterToggle={handleFilterToggle}
      onPaginationChange={handlePaginationChange}
      onPostsChanged={() => setRefreshKey((current) => current + 1)}
      onSearchInputChange={setSearchInput}
      onSearchSubmit={handleSearchSubmit}
      onSortingChange={handleSortingChange}
    />
  );
}
