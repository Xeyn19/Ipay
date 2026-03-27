# iPay Landing Page

Marketing site for iPay, built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## Stack

- Next.js `16.2.1`
- React `19.2.4`
- TypeScript
- Tailwind CSS v4
- ESLint 9

## Current Features

- Single landing page in `app/page.tsx`
- Fixed navigation with dark/light theme toggle
- Spotlight hover effect for the "Who We Serve" cards
- Partner carousel with grouped logos
- Remote image support for approved external asset domains

## Project Structure

```text
app/
  components/
    partners-carousel.tsx
    theme-toggle.tsx
  globals.css
  layout.tsx
  page.tsx
  spotlight-card-tracker.tsx
public/
  img/
next.config.ts
package.json
```

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run linting:

```bash
npm run lint
```

The site runs locally at `http://localhost:3000`.

## Key Files

- `app/page.tsx`: Main landing page content and section layout
- `app/layout.tsx`: Root layout and theme initialization script
- `app/globals.css`: Design tokens, theme variables, and global styling
- `app/components/theme-toggle.tsx`: Client-side theme switcher
- `app/components/partners-carousel.tsx`: Partner showcase carousel
- `app/spotlight-card-tracker.tsx`: Pointer-based card glow behavior
- `next.config.ts`: External image allowlist

## Notes

- Theme preference is stored in `localStorage` under `ipay-theme`.
- External partner logos are currently loaded from `ipay99.wordpress.com`.
- If remote image sources change, update `images.remotePatterns` in `next.config.ts`.
