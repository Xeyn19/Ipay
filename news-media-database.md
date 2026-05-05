# News & Media Database Outline

This document covers the recommended Supabase schema for the dashboard-backed `News & Media` feature.

## Main Table

Use a primary table named `news_posts`.

Recommended columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key with `gen_random_uuid()` default |
| `title` | `text` | Required |
| `slug` | `text` | Required, unique |
| `excerpt` | `text` | Required for manage-table summaries and public cards |
| `body` | `jsonb` | Required; stores TipTap `editor.getJSON()` output |
| `status` | `news_post_status` | Enum: `draft`, `published`, `archived`. Default `draft` |
| `featured_image_path` | `text` | Nullable; storage path in Supabase Storage. Derive public URL at runtime |
| `view_count` | `integer` | Default `0` |
| `published_at` | `timestamptz` | Nullable; set when status becomes `published` |
| `category` | `text` | Keep if the public newsroom continues showing category labels |
| `created_by` | `uuid` | Optional reference to `auth.users` |
| `updated_by` | `uuid` | Optional reference to `auth.users` |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` with update trigger |

## Status Enum

Define a Postgres enum instead of a plain `text` column for data integrity:

```sql
create type news_post_status as enum ('draft', 'published', 'archived');
```

- `draft`: editable, not shown on the public newsroom page
- `published`: visible on the public newsroom page; sets `published_at`
- `archived`: soft-deleted; hidden from dashboard default view and public page

Using an enum for `archived` removes the need for a separate `archived_at` column.

If scheduling is added later, a `scheduled_at` column can be introduced without changing the current dashboard UI contract.

## Images

Store uploaded images in Supabase Storage and keep only the storage path in `news_posts`. Derive the public URL at runtime — do not store it in the database.

- Recommended storage bucket: `news-media`
- Recommended DB field: `featured_image_path`

```ts
const { data: { publicUrl } } = supabase.storage
  .from('news-media')
  .getPublicUrl(post.featured_image_path)
```

This is simpler than introducing a separate images table before there is a stronger media-library requirement.

## Archive Model

Archive state is handled by `status = 'archived'` rather than a separate `archived_at` timestamp column.

- `draft` or `published`: active post
- `archived`: soft-archived; excluded from default queries

This keeps the status field as the single source of truth for post state.

## Migration SQL

```sql
create type news_post_status as enum ('draft', 'published', 'archived');

create table news_posts (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  slug                text not null unique,
  excerpt             text not null,
  body                jsonb not null,
  status              news_post_status not null default 'draft',
  featured_image_path text,
  view_count          integer not null default 0,
  category            text,
  published_at        timestamptz,
  created_by          uuid references auth.users(id),
  updated_by          uuid references auth.users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
```

## Current UI Mapping

Fields already reflected in the current dashboard UI:

- `title`
- `slug`
- `excerpt`
- `body`
- `status`
- `featured_image_path`

Fields retained for future public-newsroom compatibility:

- `category`
- `published_at`
- `view_count`

Fields that support later workflow expansion:

- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

## Changes from Initial Outline

| Change | Reason |
| --- | --- |
| `body` changed from `text` to `jsonb` | TipTap stores `editor.getJSON()` output; `jsonb` is indexable and re-hydrates cleanly back into the editor |
| `status` changed from `text` to `news_post_status` enum | Enforces valid values at the database level |
| `archived_at` removed | Replaced by `status = 'archived'`; single source of truth for post state |
| `featured_image_url` removed | Redundant; public URL is derived at runtime from `featured_image_path` |