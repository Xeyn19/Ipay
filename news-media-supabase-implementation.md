# News & Media Supabase Implementation Guide

This guide documents how to connect the dashboard `News & Media` table to Supabase later. The current implementation intentionally still uses hardcoded data, but the recent TanStack refactor gives the Supabase integration a clear place to land.

## Current Architecture

The dashboard manage route is split into small pieces:

- `app/dashboard/news-media/page.tsx` remains a Server Component for page metadata and dashboard header rendering.
- `app/dashboard/news-media/news-media-manage-client.tsx` is the client boundary.
- `app/dashboard/news-media/use-posts.ts` owns post fetching and currently returns hardcoded seed data.
- `app/dashboard/news-media/news-media-manage-table.tsx` renders the TanStack table and receives only `data` and `isLoading`.
- `app/dashboard/news-media/news-media-columns.tsx` owns the TanStack column definitions.

The first Supabase integration should replace the hardcoded fetch in `use-posts.ts`, not move database logic into the table component.

## Database Shape

Use the `news_posts` table described in `news-media-database.md`.

Recommended UI mapping:

| Supabase column | Current UI field | Notes |
| --- | --- | --- |
| `id` | `id` | Use UUID string directly |
| `title` | `title` | Dashboard post name |
| `slug` | `slug` | Used in table subtitle and public URLs |
| `category` | `category` | Preserve for public newsroom cards |
| `excerpt` | `excerpt` | Longest table column |
| `body` | `body` | Used by search and edit form |
| `status` | `status` | Must map to `draft` or `published` |
| `featured_image_url` | `coverImage` | Prefer when storing a direct public URL |
| `featured_image_path` | `coverImage` | Convert to a public/signed URL if no direct URL exists |
| `published_at` | `publishDate` | Fallback to `created_at` for drafts if needed |
| `view_count` | `views` | Default to `0` |
| `archived_at` | none yet | Filter out active table rows with `is null` until archive view exists |

Keep `NewsArticle` as the UI-facing type unless the public newsroom model is also refactored. Add a separate Supabase row type so database naming does not leak into every component.

## Future Fetch Params

The existing placeholder already has pagination and sorting fields:

```ts
type PostsQueryParams = {
  pageIndex: number;
  pageSize: number;
  sortBy: string;
};
```

For real server-backed tables, expand this shape when state is lifted out of the table:

```ts
type PostsQueryParams = {
  pageIndex: number;
  pageSize: number;
  searchQuery: string;
  sortBy: Array<{
    id: string;
    desc: boolean;
  }>;
  status: "draft" | "published" | null;
};
```

`sortBy` should use TanStack sorting state so columns can map directly to Supabase order clauses.

## Row Mapper

Create a mapper near the fetch function or in a small data module:

```ts
type NewsPostRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string;
  body: string;
  status: "draft" | "published";
  featured_image_path: string | null;
  featured_image_url: string | null;
  published_at: string | null;
  created_at: string;
  view_count: number | null;
};

function mapNewsPostRow(row: NewsPostRow): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category ?? "Company Update",
    excerpt: row.excerpt,
    coverImage:
      row.featured_image_url ??
      row.featured_image_path ??
      "/img/requestproposal.jpg",
    publishDate: row.published_at ?? row.created_at,
    status: row.status,
    views: row.view_count ?? 0,
    body: row.body,
  };
}
```

If `featured_image_path` points to Supabase Storage, replace the raw path fallback with a helper that creates a public URL or signed URL.

## Future Fetch Implementation

Replace the body of `fetchPosts` in `use-posts.ts` with a Supabase query. Keep the TODO comment until the query is actually implemented.

```ts
async function fetchPosts(params: PostsQueryParams) {
  // TODO: replace with Supabase query
  const supabase = createBrowserClient();
  const from = params.pageIndex * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from("news_posts")
    .select(
      "id,title,slug,category,excerpt,body,status,featured_image_path,featured_image_url,published_at,created_at,view_count",
      { count: "exact" },
    )
    .is("archived_at", null)
    .range(from, to);

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.searchQuery.trim()) {
    const search = `%${params.searchQuery.trim()}%`;
    query = query.or(
      `title.ilike.${search},slug.ilike.${search},excerpt.ilike.${search},body.ilike.${search}`,
    );
  }

  const [sort] = params.sortBy;
  if (sort) {
    const columnMap: Record<string, string> = {
      title: "title",
      excerpt: "excerpt",
      status: "status",
      views: "view_count",
    };
    query = query.order(columnMap[sort.id] ?? "published_at", {
      ascending: !sort.desc,
    });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  return {
    data: (data ?? []).map(mapNewsPostRow),
    totalCount: count ?? 0,
  };
}
```

The current project has server-side Supabase helpers in `app/lib/supabase-server.ts` and `app/lib/supabase-admin.ts`. For this hook-based client fetch, add a browser-safe client helper instead of importing server-only helpers into Client Components.

## Required UI Refactor For Server-Backed Tables

The table currently owns search, filter, sorting, and pagination state. That is fine for hardcoded data, but server-backed pagination and sorting need those values before fetching.

When connecting Supabase:

1. Lift `pageIndex`, `pageSize`, `sortBy`, `searchQuery`, and `activeFilter` into `news-media-manage-client.tsx`.
2. Pass those values into `usePosts(params)`.
3. Pass the current values and change handlers into `NewsMediaManageTable`.
4. Keep `news-media-columns.tsx` unchanged unless action behavior changes.
5. Return `totalCount` from the hook so pagination can show the real page count from Supabase.

At that point, the table props will need to expand beyond `data` and `isLoading`. Keep database access out of the table even after props expand.

## Server Action Follow-Up

Create, edit, publish, and archive should use Server Actions rather than browser writes with privileged keys.

Recommended flow:

- Use `createClient()` from `app/lib/supabase-server.ts` for user-scoped reads/writes where RLS applies.
- Use `createAdminClient()` from `app/lib/supabase-admin.ts` only for trusted server-side operations that require service-role privileges.
- Keep archive as a soft delete by setting `archived_at`.
- Revalidate dashboard/public newsroom routes after successful mutations.

## Validation Checklist

When Supabase is connected, verify:

- Dashboard table loads rows from `news_posts`.
- Draft/Published filters query Supabase instead of filtering only in memory.
- Search works across title, slug, excerpt, and body.
- Sortable headers update Supabase ordering.
- Previous/Next uses Supabase `.range(from, to)`.
- `Page X of Y` uses Supabase `count`.
- Archived rows do not appear in the active manage table.
- Public newsroom only shows `published` and unarchived posts.
