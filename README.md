# iPay Landing Page & Dashboard Platform

A premium marketing and lead-generation portal for iPay. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, and backed by Supabase.

## Tech Stack

- **Framework**: Next.js `16.2.1`
- **UI & State**: React `19.2.4`
- **Styling**: Tailwind CSS v4
- **Database / Backend**: `@supabase/supabase-js` & SSR
- **Notifications**: `react-hot-toast` (Premium Glass-morphic overrides)
- **Language**: TypeScript

## Cutting-Edge Features

- **Split-Screen Proposal Workflow**: Advanced `/request-proposal` page featuring resilient draft persistence via `sessionStorage` so users never lose their typed data while navigating.
- **Strict Privacy Compliance**: Integrated `IntersectionObserver` that forcefully enforces users to scroll to the very bottom of the `/privacy-policy` page before unlocking the "Submit" action for their proposal.
- **Request Proposal Dashboard**: Secure `/dashboard` overview and `/dashboard/leads` detail page mapped directly from the Supabase `leads` table to monitor request proposal submissions.
- **Proposal Anti-Spam Protection**: `/request-proposal` submissions are handled by a server action with Cloudflare Turnstile verification, a hidden honeypot, and Supabase-backed rate limiting before any lead is inserted.
- **Route-Safe Human Verification**: The proposal form starts Turnstile only on `/request-proposal`, preserves a fresh unused token while users review `/privacy-policy`, and restores the visible captcha when they return instead of losing verification state.
- **Modern Request Analytics**: Dashboard overview includes responsive request proposal metrics and a Chart.js-powered request trend chart with Daily, Weekly, Monthly, and Custom date views.
- **Full Message Review Modal**: Dashboard users can open long request proposal messages in a scrollable modal, keep the table context visible, and reply through Gmail compose with the recipient email prefilled.
- **Polished Auth Feedback**: Login and logout actions display top-center success toasts, with logout returning users to `/login` and using a distinct red confirmation style.
- **User-Friendly Password Entry**: The login form includes an accessible eye icon toggle for showing or hiding the password while preserving the existing input design language.
- **Flawless Smooth Scrolling**: Custom DOM `window.scrollTo` router interception in Next.js perfectly offsets against sticky-nav heights and guarantees silky smooth anchor-link transitions without URL-hash snapping.
- **CLS Eradication**: Responsive `min-height` architectural constraints applied across automatic Carousel & Partner Tab cycle components completely neutralize Cumulative Layout Shifts (CLS), preventing any layout jitters.
- **Animated 3D Cards**: Implemented custom `GSAP` 3D stacked card mechanics for "How It Works" workflow highlights.

## Project Structure

```text
app/
  components/
    dashboard/          # Dashboard layout & sidebar interfaces
    home/               # Modular landing page components (navbar, footer, partners)
  dashboard/            # Protected analytics overview and request proposal portal
    leads/              # Request proposal table, full-message modal, and Gmail reply flow
  lib/                  # Supabase, theme, Turnstile, and rate-limit helpers
  login/                # Authentication page with password visibility toggle
  privacy-policy/       # Scroll-tracked legal document
  request-proposal/     # Main lead-capture form & layout
  globals.css           # Design tokens & glass-morphism overrides
  layout.tsx            # Root layout including Toaster implementation
  page.tsx              # Main entry landing page
```

## Getting Started

### 1. Install Dependencies
Run via Bun for superior speed:
```bash
bun install
```

### 2. Run Development Server
```bash
bun run dev
```
The site runs locally at `http://localhost:3000`.

### 3. Configure Proposal Anti-Spam

Run the Supabase SQL setup in `supabase/proposal-anti-spam.sql` from the Supabase SQL Editor. This creates the submission-attempt table, indexes the rate-limit lookups, enables RLS, and revokes direct browser inserts into `leads` so proposal creation must go through the Next.js server action.

Create a Cloudflare Turnstile widget and add the hostnames you will use:

- Local development: `localhost`
- Production: your real hostname, for example `example.com`

Do not include `http://`, `https://`, ports, or paths in Cloudflare hostnames.

Add these environment variables:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RATE_LIMIT_HASH_SECRET=
TURNSTILE_EXPECTED_HOSTNAME=
```

For local development, use:

```env
TURNSTILE_EXPECTED_HOSTNAME=localhost
```

For production, use only the production hostname:

```env
TURNSTILE_EXPECTED_HOSTNAME=example.com
```

Keep `TURNSTILE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `RATE_LIMIT_HASH_SECRET` server-only. Never prefix them with `NEXT_PUBLIC_`.

### 4. Proposal Form Verification Flow

The proposal form stores drafts and privacy-review state in `sessionStorage`. Turnstile is loaded with `next/script` using `onReady` so the widget can render correctly after client-side route navigation.

When a visitor completes Turnstile and opens `/privacy-policy`, the `/request-proposal` page is unmounted by Next.js. The app keeps the recent unused Turnstile token for up to 4.5 minutes, then shows the captcha widget again when the visitor returns. The stored token is cleared when it expires, fails, or after any submit attempt that asks the client to reset captcha.

## Key Architectural Highlights

- **`proposal-form.tsx`**: Restores draft values and recent unused Turnstile tokens from `sessionStorage`, gates submission on privacy consent and human verification, renders the captcha after route remounts, and displays server-action success/error feedback through toasts.
- **`request-proposal/actions.ts`**: Validates proposal fields server-side, records honeypot and rate-limit attempts, verifies Turnstile tokens, and inserts accepted leads through a server-only Supabase admin client.
- **`proposal-rate-limit.ts`**: Hashes IP and email values with `RATE_LIMIT_HASH_SECRET` and enforces Supabase-backed submission limits without storing raw visitor identifiers.
- **`auth-toast-listener.tsx`**: Reads auth result flags from the URL, displays login/logout success toasts at the top center, and cleans the query string after the toast is triggered.
- **`login-form.tsx`**: Handles sign-in errors, pending state, and password visibility toggling with accessible eye icons.
- **`dashboard-charts.tsx`**: Loads Chart.js from a pinned CDN URL and renders the request trend chart with Daily, Weekly, Monthly, and Custom date range controls.
- **`leads-table.tsx`**: Renders the request proposal table with clickable message previews, an accessible scrollable message modal, and Gmail compose reply links that prefill the recipient address.
- **`partners.tsx`**: Uses flexible, non-wrapping native layouts paired with pre-calculated container boundaries guaranteeing flawless cross-device visual parity without breaking DOM height allocations.
- **`layout.tsx`**: Centralizes both the `next/script` theme loader and the `react-hot-toast` `<Toaster>` provider engineered with beautiful transluscent gradients.
