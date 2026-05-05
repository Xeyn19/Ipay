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
| `body` | `body` | `jsonb` column; stores TipTap `editor.getJSON()` output |
| `status` | `status` | `news_post_status` enum: `draft`, `published`, `archived` |
| `featured_image_path` | `coverImage` | Derive public URL at runtime via Supabase Storage helper |
| `published_at` | `publishDate` | Fallback to `created_at` for drafts if needed |
| `view_count` | `views` | Default to `0` |

`featured_image_url` has been removed from the schema. Always derive the public URL from `featured_image_path` at runtime:

```ts
const { data: { publicUrl } } = supabase.storage
  .from('news-media')
  .getPublicUrl(post.featured_image_path)
```

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

`status` does not need to include `"archived"` here — archived posts are always excluded from the manage table by filtering on `status != 'archived'` at the query level.

`sortBy` should use TanStack sorting state so columns can map directly to Supabase order clauses.

## Row Mapper

Create a mapper near the fetch function or in a small data module. `featured_image_url` has been removed — use a Supabase Storage helper to derive the public URL from `featured_image_path` instead:

```ts
type NewsPostRow = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string;
  body: Record<string, unknown>; // jsonb from TipTap editor.getJSON()
  status: "draft" | "published" | "archived";
  featured_image_path: string | null;
  published_at: string | null;
  created_at: string;
  view_count: number | null;
};

function getPublicImageUrl(path: string | null): string {
  if (!path) return "/img/requestproposal.jpg";
  const { data: { publicUrl } } = supabase.storage
    .from("news-media")
    .getPublicUrl(path);
  return publicUrl;
}

function mapNewsPostRow(row: NewsPostRow): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category ?? "Company Update",
    excerpt: row.excerpt,
    body: row.body,
    coverImage: getPublicImageUrl(row.featured_image_path),
    publishDate: row.published_at ?? row.created_at,
    status: row.status,
    views: row.view_count ?? 0,
  };
}
```

## Future Fetch Implementation

Replace the body of `fetchPosts` in `use-posts.ts` with a Supabase query. Archived posts are excluded by filtering `status` directly — no `archived_at` column exists in the schema:

```ts
async function fetchPosts(params: PostsQueryParams) {
  // TODO: replace with Supabase query
  const supabase = createBrowserClient();
  const from = params.pageIndex * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from("news_posts")
    .select(
      "id,title,slug,category,excerpt,body,status,featured_image_path,published_at,created_at,view_count",
      { count: "exact" },
    )
    .neq("status", "archived") // exclude archived posts
    .range(from, to);

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.searchQuery.trim()) {
    const search = `%${params.searchQuery.trim()}%`;
    query = query.or(
      `title.ilike.${search},slug.ilike.${search},excerpt.ilike.${search}`,
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

Note: `body` is a `jsonb` column. Supabase returns it as a plain object — pass it directly to TipTap's `content` prop without parsing.

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
- Archive is handled by setting `status = 'archived'` — there is no `archived_at` column.
- Revalidate dashboard/public newsroom routes after successful mutations.

## Validation Checklist

When Supabase is connected, verify:

- Dashboard table loads rows from `news_posts`.
- Archived posts (`status = 'archived'`) do not appear in the manage table.
- Draft/Published filters query Supabase instead of filtering only in memory.
- Search works across title, slug, and excerpt.
- Sortable headers update Supabase ordering.
- Previous/Next uses Supabase `.range(from, to)`.
- `Page X of Y` uses Supabase `count`.
- Public newsroom only shows `published` posts with `status != 'archived'`.
- TipTap editor receives `body` as a plain object (not a string) when loading an existing post.
- Featured images resolve correctly via Supabase Storage public URL.

## Changes from Initial Guide

| Change | Reason |
| --- | --- |
| `featured_image_url` removed from row type and mapper | Dropped from schema; public URL derived at runtime from `featured_image_path` |
| `archived_at` filter replaced with `status != 'archived'` | Archive state is now owned by the `status` enum, not a separate timestamp column |
| `body` typed as `Record<string, unknown>` instead of `string` | Schema uses `jsonb`; Supabase returns it as a plain object |
| `status` type updated to include `"archived"` | Reflects the `news_post_status` enum values |
| Search removed `body` from `ilike` filter | `body` is now `jsonb` and cannot be used with `ilike`; use full-text search if body search is needed later |