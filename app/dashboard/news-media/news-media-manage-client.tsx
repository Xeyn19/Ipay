"use client";

import { useCallback, useState, type FormEvent } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import {
  NEWS_POSTS_PAGE_SIZE,
  type PostsQueryParams,
} from "@/app/lib/news-posts";
import type { NewsArticleStatus } from "@/app/lib/news-media";
import { NewsMediaManageTable } from "./news-media-manage-table";
import { usePosts } from "./use-posts";

export function NewsMediaManageClient() {
  const [activeFilter, setActiveFilter] = useState<NewsArticleStatus | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: NEWS_POSTS_PAGE_SIZE,
  });

  const params: PostsQueryParams = {
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    searchQuery,
    sortBy: sorting,
    status: activeFilter,
  };
  const { data, isLoading, statusCounts, totalCount } = usePosts(params);

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

  function handleFilterToggle(status: NewsArticleStatus) {
    setActiveFilter((current) => (current === status ? null : status));
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
      onSearchInputChange={setSearchInput}
      onSearchSubmit={handleSearchSubmit}
      onSortingChange={handleSortingChange}
    />
  );
}
