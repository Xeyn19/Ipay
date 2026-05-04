# News & Media CMS Guide

This document explains how the current `News & Media` implementation works across the public page and the dashboard CMS.

## Current Scope

- Public newsroom route: `app/news-media/page.tsx`
- Dashboard CMS route: `app/dashboard/news-media/page.tsx`
- Editor UI: `app/dashboard/news-media/news-media-editor.tsx`
- Shared local content/data model: `app/lib/news-media.ts`

The current version is intentionally local-content driven.

- No Supabase integration yet
- No server-side save or publish flow yet
- No runtime persistence from the dashboard CMS to the public newsroom page
- Dashboard edits are preview-only and stored in component state for the current browser session

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

1. News CMS header
2. Section chips showing newsroom block types
3. Summary cards for published stories, coverage items, video items, and current draft status
4. Article editor form
5. Live preview card
6. Newsroom structure notes
7. Section map for how the public page is organized

This page is intended to help shape content structure and presentation before backend publishing is connected.

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

- `newsEditorSampleArticle`
- `createEmptyNewsArticle()`
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

- The CMS auto-generates the slug from the title until the user manually edits the slug field.
- Once the slug field is manually edited, auto-sync from title stops for that draft.

### Preview behavior

- The CMS preview updates immediately as the user types.
- The preview mirrors the newsroom article card and featured-story presentation style.
- `Load sample article` fills the editor with the current sample draft.
- `Reset draft` returns the editor to a blank local article state.

### Publishing behavior

There is no real publishing flow yet.

- Changing the dashboard CMS does not update `newsSeedArticles`
- The public newsroom page only reflects the hardcoded local data exports
- `status` is currently visual and editorial only

## How To Update Content Right Now

If you want the public newsroom page to change today, update `app/lib/news-media.ts`.

Typical tasks:

### Add or edit a public article

- Update `newsSeedArticles`
- Keep `status: "published"` if it should appear on the public newsroom page

### Add or edit external coverage

- Update `newsExternalCoverage`

### Add or edit featured video/interview entries

- Update `newsFeaturedVideos`

### Change editor defaults

- Update `newsEditorSampleArticle`
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
2. Add create/edit/delete draft actions
3. Add publish scheduling rules
4. Replace mock arrays with database-backed reads
5. Decide whether to add article detail pages such as `/news-media/[slug]`
