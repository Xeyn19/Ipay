"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/app/lib/supabase-browser";
import {
  fetchNewsPostsPage,
  fetchNewsPostStatusCounts,
  type NewsPostStatusCounts,
  type PostsQueryParams,
} from "@/app/lib/news-posts";
import type { NewsArticle } from "@/app/lib/news-media";

type UsePostsResult = {
  data: NewsArticle[];
  totalCount: number;
  statusCounts: NewsPostStatusCounts;
};

async function fetchPosts(params: PostsQueryParams): Promise<UsePostsResult> {
  const supabase = createBrowserClient();
  const [posts, statusCounts] = await Promise.all([
    fetchNewsPostsPage(supabase, params),
    fetchNewsPostStatusCounts(supabase),
  ]);

  return {
    data: posts.data,
    totalCount: posts.totalCount,
    statusCounts,
  };
}

export function usePosts(params: PostsQueryParams, refreshKey = 0) {
  const { pageIndex, pageSize, searchQuery, sortBy, status } = params;
  const [data, setData] = useState<NewsArticle[]>([]);
  const [statusCounts, setStatusCounts] = useState<NewsPostStatusCounts>({
    archived: 0,
    draft: 0,
    published: 0,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadPosts() {
      setIsLoading(true);

      try {
        const posts = await fetchPosts({
          pageIndex,
          pageSize,
          searchQuery,
          sortBy,
          status,
        });

        if (isActive) {
          setData(posts.data);
          setStatusCounts(posts.statusCounts);
          setTotalCount(posts.totalCount);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadPosts();

    return () => {
      isActive = false;
    };
  }, [
    pageIndex,
    pageSize,
    refreshKey,
    searchQuery,
    sortBy,
    status,
  ]);

  return { data, totalCount, statusCounts, isLoading };
}
