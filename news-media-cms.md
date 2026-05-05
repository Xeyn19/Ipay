# News & Media CMS Guide

This document explains how the current `News & Media` implementation works across the public page and the dashboard CMS.

## Current Scope

- Public newsroom route: `app/news-media/page.tsx`
- Dashboard manage route: `app/dashboard/news-media/page.tsx`
- Dashboard create route: `app/dashboard/news-media/new/page.tsx`
- Dashboard edit route: `app/dashboard/news-media/[postId]/page.tsx`
- Shared dashboard form UI: `app/dashboard/news-media/news-post-form.tsx`
- Manage table UI: `app/dashboard/news-media/news-media-manage-table.tsx`
- Shared local content/data model: `app/lib/news-media.ts`

The current version is intentionally local-content driven.

- No Supabase integration yet
- No server-side save or publish flow yet
- No runtime persistence from the dashboard CMS to the public newsroom page
- Dashboard create/edit actions are still local UI only
- The save button currently shows a placeholder toast and does not persist data

## Public Newsroom Layout

The public `News & Media` page follows a newsroom-style structure inspired by modern company newsroom pages while staying aligned with the iPay design system.

Current sections:

1. Newsroom hero intro
2. Featured story
3. Media and partnerships contact panel
4. Press releases list
5. `In the news` external coverage block
6. Additional newsroom updates grid
7. Featured video / interview section

The page is rendered from local mock content in `app/lib/news-media.ts`.

## Dashboard CMS Layout

The dashboard CMS is the admin-side companion to the public newsroom page.

Current CMS sections:

1. Manage page header with `Archive` and `+ New Post`
2. Draft and published filter pills
3. Search bar with search button
4. Static posts table with view, edit, and archive actions
5. Shared create/edit form route with a two-column layout
6. Right-column controls for status, featured image, and save

This feature now models the intended dashboard workflow before backend publishing is connected.

## Shared Content Model

The main article type is `NewsArticle` in `app/lib/news-media.ts`.

Current fields:

- `id`
- `title`
- `slug`
- `category`
- `excerpt`
- `coverImage`
- `publishDate`
- `status`
- `views`
- `body`

Related supporting type:

- `NewsroomLinkItem`

This is used for:

- external coverage items
- featured video/interview items

## Local Data Sources

The public page currently reads these exports from `app/lib/news-media.ts`:

- `newsSeedArticles`
- `newsExternalCoverage`
- `newsFeaturedVideos`

The dashboard CMS currently uses:

- `createEmptyNewsArticle()`
- `getManagedNewsArticles()`
- `getNewsArticleById()`
- helper functions such as:
  - `buildNewsSlug()`
  - `formatNewsDate()`
  - `getPublishedNewsArticles()`
  - `getNewsBodyParagraphs()`
  - `estimateNewsReadingMinutes()`
  - `getNewsStatusLabel()`
  - `getNewsStatusClassName()`

## Important Behavior

### Slug behavior

- The create form auto-generates the slug from the title until the user manually edits the slug field.
- Edit mode keeps the existing slug stable unless the user changes it directly.

### Publishing behavior

There is no real publishing flow yet.

- Changing the dashboard CMS does not update `newsSeedArticles`
- The public newsroom page only reflects the hardcoded local data exports
- `status` is currently visual and editorial only
- `Archive` and `View` are visible but intentionally disabled in this static phase
- `Save` only shows a toast to indicate persistence is not connected yet

## How To Update Content Right Now

If you want the public newsroom page to change today, update `app/lib/news-media.ts`.

Typical tasks:

### Add or edit a public article

- Update `newsSeedArticles`
- Keep `status: "published"` if it should appear on the public newsroom page
- `status: "draft"` will keep the item visible only in the dashboard manage table

### Add or edit external coverage

- Update `newsExternalCoverage`

### Add or edit featured video/interview entries

- Update `newsFeaturedVideos`

### Change create-form defaults

- Update `createEmptyNewsArticle()`

## Design Rules

When extending this feature, keep these constraints:

- Preserve the existing iPay visual language
- Keep the newsroom structure modular and readable
- Prefer the current rounded-card, layered-surface, and heading treatment already used in the site
- Do not introduce Supabase or server actions until the publishing workflow is intentionally designed
- Keep mock newsroom sections and dashboard CMS sections structurally aligned

## Recommended Next Phase

When backend work is approved, the next logical step is:

1. Add persistent article storage
2. Connect create/edit/archive actions
3. Add a real public article detail view if needed
4. Replace mock arrays with database-backed reads
5. Replace the body textarea with the chosen rich text editor
