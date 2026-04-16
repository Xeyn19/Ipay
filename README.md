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
- **Admin Leads Dashboard**: Secure `/dashboard/leads` portal mapped directly from the Supabase `leads` table to monitor inbound submissions, including Name, Company, Email, Contact Number, Message, and Request Date.
- **Full Message Review Modal**: Dashboard users can open long lead messages in a scrollable modal, keep the table context visible, and reply through Gmail compose with the recipient email prefilled.
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
  dashboard/            # Protected admin portal
    leads/              # Leads table, full-message modal, and Gmail reply flow
  lib/                  # Supabase clients & theme logic
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

## Key Architectural Highlights

- **`proposal-form.tsx`**: Uses multi-state observation to bridge Draft restoration, UI Submission blocking, Supabase `leads` insertion, and Emerald Green `toast.success` notifications synced to a 3.8-second duration.
- **`auth-toast-listener.tsx`**: Reads auth result flags from the URL, displays login/logout success toasts at the top center, and cleans the query string after the toast is triggered.
- **`login-form.tsx`**: Handles sign-in errors, pending state, and password visibility toggling with accessible eye icons.
- **`leads-table.tsx`**: Renders the leads dashboard table with clickable message previews, an accessible scrollable message modal, and Gmail compose reply links that prefill the recipient address.
- **`partners.tsx`**: Uses flexible, non-wrapping native layouts paired with pre-calculated container boundaries guaranteeing flawless cross-device visual parity without breaking DOM height allocations.
- **`layout.tsx`**: Centralizes both the `next/script` theme loader and the `react-hot-toast` `<Toaster>` provider engineered with beautiful transluscent gradients.
