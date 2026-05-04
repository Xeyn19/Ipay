"use client";

import { useEffect, useState } from "react";
import {
  getManagedNewsArticles,
  newsSeedArticles,
  type NewsArticle,
} from "@/app/lib/news-media";

type PostsQueryParams = {
  pageIndex: number;
  pageSize: number;
  sortBy: string;
};

async function fetchPosts(_params: PostsQueryParams) {
  void _params;
  // TODO: replace with Supabase query
  return getManagedNewsArticles(newsSeedArticles);
}

export function usePosts() {
  const [data, setData] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      setIsLoading(true);

      try {
        const posts = await fetchPosts({
          pageIndex: 0,
          pageSize: 5,
          sortBy: "",
        });

        if (isMounted) {
          setData(posts);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, isLoading };
}
