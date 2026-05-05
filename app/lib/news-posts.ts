import type { JSONContent } from "@tiptap/react";
import type { SortingState } from "@tanstack/react-table";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewsArticle, NewsArticleStatus } from "./news-media";

export const NEWS_POSTS_PAGE_SIZE = 5;

export type NewsPostStatus = NewsArticleStatus | "archived";

export type NewsPostRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string;
  body: JSONContent;
  status: NewsPostStatus;
  featured_image_path: string | null;
  published_at: string | null;
  created_at: string;
  view_count: number | null;
};

export type PostsQueryParams = {
  pageIndex: number;
  pageSize: number;
  searchQuery: string;
  sortBy: SortingState;
  status: NewsArticleStatus | null;
};

export type NewsPostStatusCounts = {
  draft: number;
  published: number;
};

export const newsPostSelect =
  "id,title,slug,category,excerpt,body,status,featured_image_path,published_at,created_at,view_count";

const newsPostSortColumnMap: Record<string, string> = {
  excerpt: "excerpt",
  status: "status",
  title: "title",
  views: "view_count",
};

function getPublicImageUrl(
  supabase: Pick<SupabaseClient, "storage">,
  path: string | null,
) {
  if (!path) {
    return "/img/requestproposal.jpg";
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("news-media").getPublicUrl(path);

  return publicUrl || "/img/requestproposal.jpg";
}

function getActiveStatus(status: NewsPostStatus): NewsArticleStatus {
  if (status === "archived") {
    throw new Error("Archived news posts must be filtered before mapping.");
  }

  return status;
}

function applyDefaultOrder<TQuery extends SupabaseClient["from"] extends (
  ...args: never[]
) => infer _TReturn
  ? { order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => TQuery }
  : never>(query: TQuery) {
  return query.order("published_at", {
    ascending: false,
    nullsFirst: false,
  }).order("created_at", { ascending: false });
}

function applySorting<TQuery extends { order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => TQuery }>(
  query: TQuery,
  sortBy: SortingState,
) {
  const [sort] = sortBy;

  if (!sort) {
    return applyDefaultOrder(query);
  }

  const column = newsPostSortColumnMap[sort.id];

  if (!column) {
    return applyDefaultOrder(query);
  }

  return query
    .order(column, { ascending: !sort.desc, nullsFirst: false })
    .order("created_at", { ascending: false });
}

function getSearchPattern(value: string) {
  return `%${value.trim()}%`;
}

export function mapNewsPostRow(
  row: NewsPostRow,
  supabase: Pick<SupabaseClient, "storage">,
): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category ?? "Company Update",
    excerpt: row.excerpt,
    body: row.body,
    coverImage: getPublicImageUrl(supabase, row.featured_image_path),
    publishDate: row.published_at ?? row.created_at,
    status: getActiveStatus(row.status),
    views: row.view_count ?? 0,
  };
}

export async function fetchNewsPostsPage(
  supabase: SupabaseClient,
  params: PostsQueryParams,
) {
  const from = params.pageIndex * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from("news_posts")
    .select(newsPostSelect, { count: "exact" })
    .neq("status", "archived")
    .range(from, to);

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.searchQuery.trim()) {
    const searchPattern = getSearchPattern(params.searchQuery);
    query = query.or(
      `title.ilike.${searchPattern},slug.ilike.${searchPattern},excerpt.ilike.${searchPattern}`,
    );
  }

  query = applySorting(query, params.sortBy);

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []).map((row) => mapNewsPostRow(row as NewsPostRow, supabase)),
    totalCount: count ?? 0,
  };
}

export async function fetchNewsPostStatusCounts(supabase: SupabaseClient) {
  const [draftResult, publishedResult] = await Promise.all([
    supabase
      .from("news_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("news_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  if (draftResult.error) {
    throw draftResult.error;
  }

  if (publishedResult.error) {
    throw publishedResult.error;
  }

  return {
    draft: draftResult.count ?? 0,
    published: publishedResult.count ?? 0,
  } satisfies NewsPostStatusCounts;
}

export async function fetchPublishedNewsArticles(supabase: SupabaseClient) {
  const query = supabase
    .from("news_posts")
    .select(newsPostSelect)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapNewsPostRow(row as NewsPostRow, supabase));
}

export async function fetchNewsArticleById(
  supabase: SupabaseClient,
  postId: string,
) {
  const { data, error } = await supabase
    .from("news_posts")
    .select(newsPostSelect)
    .eq("id", postId)
    .neq("status", "archived")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapNewsPostRow(data as NewsPostRow, supabase);
}
