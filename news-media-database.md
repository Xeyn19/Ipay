# News & Media Database Outline

This document covers the recommended Supabase schema for the future dashboard-backed `News & Media` feature.

## Main Table

Use a primary table named `news_posts`.

Recommended columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key with `gen_random_uuid()` default |
| `title` | `text` | Required |
| `slug` | `text` | Required, unique |
| `excerpt` | `text` | Required for manage-table summaries and public cards |
| `body` | `text` | Required for article content |
| `status` | `text` or enum | Recommended values: `draft`, `published` |
| `featured_image_path` | `text` | Preferred when files live in Supabase Storage |
| `featured_image_url` | `text` | Optional convenience field if public URLs are stored directly |
| `view_count` | `integer` | Default `0` |
| `archived_at` | `timestamptz` | Nullable soft-archive field |
| `published_at` | `timestamptz` | Nullable; set when status becomes published |
| `category` | `text` | Keep if the public newsroom continues showing category labels |
| `created_by` | `uuid` | Optional reference to auth user |
| `updated_by` | `uuid` | Optional reference to auth user |
| `created_at` | `timestamptz` | Default `now()` |
| `updated_at` | `timestamptz` | Default `now()` with update trigger |

## Status Rules

- `draft`: editable, not shown on the public newsroom page
- `published`: eligible for the public newsroom page

If scheduling is added later, a separate `scheduled_at` column can be introduced without changing the current dashboard UI contract.

## Images

For v1, store uploaded images in Supabase Storage and keep only the storage path or public URL in `news_posts`.

- Recommended storage bucket: `news-media`
- Recommended DB field for canonical lookup: `featured_image_path`

This is simpler than introducing a separate images table before there is a stronger media-library requirement.

## Archive Model

Use `archived_at` for soft archive behavior instead of a separate archive table.

- `NULL`: active post
- timestamp value: archived post

This allows the dashboard archive view to be added later without changing the core row identity.

## Current UI Mapping

Fields already reflected in the current dashboard UI:

- `title`
- `slug`
- `excerpt`
- `body`
- `status`
- featured image via `featured_image_path` or `featured_image_url`

Fields retained mainly for future public-newsroom compatibility:

- `category`
- `published_at`
- `view_count`

Fields that support later workflow expansion:

- `archived_at`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`
