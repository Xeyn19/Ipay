import type { JSONContent } from "@tiptap/react";
import type { SortingState } from "@tanstack/react-table";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  NewsArticle,
  NewsArticleStatus,
  NewsPostCategory,
} from "./news-media";

export const NEWS_POSTS_PAGE_SIZE = 5;
export const PUBLIC_NEWS_POSTS_PAGE_SIZE = 9;

export type NewsPostStatus = NewsArticleStatus | "archived";

export type NewsPostRow = {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  news_post_categories:
    | {
        name: string | null;
      }
    | Array<{
        name: string | null;
      }>
    | null;
  excerpt: string;
  body: JSONContent;
  status: NewsPostStatus;
  featured_image_path: string | null;
  publish_date: string;
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

export type PublishedNewsPostsPageParams = {
  categoryId?: string | null;
  page: number;
  pageSize: number;
};

export type NewsPostStatusCounts = {
  archived: number;
  draft: number;
  published: number;
};

export const newsPostSelect =
  "id,title,slug,category_id,news_post_categories(name),excerpt,body,status,featured_image_path,publish_date,published_at,created_at,view_count";

const newsPostSortColumnMap: Record<string, string> = {
  excerpt: "excerpt",
  publishDate: "publish_date",
  status: "status",
  title: "title",
  views: "view_count",
};

type OrderableQuery<TQuery> = {
  order: (
    column: string,
    options?: {
      ascending?: boolean;
      nullsFirst?: boolean;
    },
  ) => TQuery;
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

function applyDefaultOrder<TQuery extends OrderableQuery<TQuery>>(query: TQuery) {
  return query
    .order("publish_date", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", { ascending: false });
}

function applySorting<TQuery extends OrderableQuery<TQuery>>(
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

function applyPublishedOrder<TQuery extends OrderableQuery<TQuery>>(query: TQuery) {
  return query
    .order("publish_date", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", { ascending: false });
}

function applyPublishedFilters<
  TQuery extends {
    eq: (column: string, value: string) => TQuery;
  },
>(query: TQuery, categoryId?: string | null) {
  let nextQuery = query.eq("status", "published");

  if (categoryId) {
    nextQuery = nextQuery.eq("category_id", categoryId);
  }

  return nextQuery;
}

function getCategoryName(
  category:
    | NewsPostRow["news_post_categories"]
    | null
) {
  if (!category) {
    return "";
  }

  if (Array.isArray(category)) {
    return category[0]?.name ?? "";
  }

  return category.name ?? "";
}

export function mapNewsPostRow(
  row: NewsPostRow,
  supabase: Pick<SupabaseClient, "storage">,
): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    categoryId: row.category_id,
    categoryName: getCategoryName(row.news_post_categories),
    excerpt: row.excerpt,
    body: row.body,
    coverImage: getPublicImageUrl(supabase, row.featured_image_path),
    publishDate: row.publish_date,
    status: row.status,
    views: row.view_count ?? 0,
  };
}

export async function fetchNewsPostCategories(
  supabase: SupabaseClient,
) {
  const { data, error } = await supabase
    .from("news_post_categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as NewsPostCategory[];
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
    .range(from, to);

  if (params.status === "archived") {
    query = query.eq("status", "archived");
  } else {
    query = query.neq("status", "archived");
  }

  if (params.status && params.status !== "archived") {
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
  const [draftResult, publishedResult, archivedResult] = await Promise.all([
    supabase
      .from("news_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "draft"),
    supabase
      .from("news_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("news_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "archived"),
  ]);

  if (draftResult.error) {
    throw draftResult.error;
  }

  if (publishedResult.error) {
    throw publishedResult.error;
  }

  if (archivedResult.error) {
    throw archivedResult.error;
  }

  return {
    archived: archivedResult.count ?? 0,
    draft: draftResult.count ?? 0,
    published: publishedResult.count ?? 0,
  } satisfies NewsPostStatusCounts;
}

export async function fetchPublishedNewsArticles(supabase: SupabaseClient) {
  const query = applyPublishedOrder(
    supabase
      .from("news_posts")
      .select(newsPostSelect)
      .eq("status", "published"),
  );
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapNewsPostRow(row as NewsPostRow, supabase));
}

export async function fetchPublishedNewsArticlesPage(
  supabase: SupabaseClient,
  params: PublishedNewsPostsPageParams,
) {
  const safePage = Math.max(1, params.page);
  const safePageSize = Math.max(1, params.pageSize);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = supabase
    .from("news_posts")
    .select(newsPostSelect, { count: "exact" })
    .range(from, to);
  query = applyPublishedFilters(query, params.categoryId);
  query = applyPublishedOrder(query);
  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []).map((row) => mapNewsPostRow(row as NewsPostRow, supabase)),
    totalCount: count ?? 0,
  };
}

export async function fetchNewsArticleById(
  supabase: SupabaseClient,
  postId: string,
  options?: {
    includeArchived?: boolean;
  },
) {
  let query = supabase
    .from("news_posts")
    .select(newsPostSelect)
    .eq("id", postId);

  if (!options?.includeArchived) {
    query = query.neq("status", "archived");
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapNewsPostRow(data as NewsPostRow, supabase);
}

export async function fetchPublishedNewsArticleBySlug(
  supabase: SupabaseClient,
  slug: string,
) {
  const { data, error } = await supabase
    .from("news_posts")
    .select(newsPostSelect)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapNewsPostRow(data as NewsPostRow, supabase);
}

export async function fetchMostViewedPublishedNewsArticles(
  supabase: SupabaseClient,
  limit: number,
) {
  const { data, error } = await supabase
    .from("news_posts")
    .select(newsPostSelect)
    .eq("status", "published")
    .order("view_count", { ascending: false, nullsFirst: false })
    .order("publish_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(Math.max(1, limit));

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapNewsPostRow(row as NewsPostRow, supabase));
}

export async function fetchMostRecentPublishedNewsArticles(
  supabase: SupabaseClient,
  limit: number,
) {
  const query = applyPublishedOrder(
    supabase
      .from("news_posts")
      .select(newsPostSelect)
      .eq("status", "published")
      .limit(Math.max(1, limit)),
  );
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapNewsPostRow(row as NewsPostRow, supabase));
}
