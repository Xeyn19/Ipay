"use client";

import { NewsMediaManageTable } from "./news-media-manage-table";
import { usePosts } from "./use-posts";

export function NewsMediaManageClient() {
  const { data, isLoading } = usePosts();

  return <NewsMediaManageTable data={data} isLoading={isLoading} />;
}
