# iPay Landing Page and Dashboard

Marketing site and lead-management platform for iPay. The app is built on Next.js 16 App Router with React 19, Tailwind CSS v4, and Supabase.

I developed in the iPay International website a more complete request-management experience by restoring the Privacy Policy scroll-to-enable consent flow in the proposal form modal, refining the dashboard leads module into an archive-based workflow with bulk actions, search, responsive table improvements, and automatic read handling, and extending the communication flow with a dedicated reply page that now supports built-in and user-saved reply templates, an in-context modal for creating reusable templates from edited subject and message drafts, attachments, SMTP delivery through nodemailer, and reply-history tracking.

## Tech Stack

- Framework: Next.js `16.2.1`
- UI: React `19.2.4`
- Language: TypeScript
- Styling: Tailwind CSS v4
- Database and auth: Supabase SSR and `@supabase/supabase-js`
- Email: Nodemailer over SMTP
- Icons: `lucide-react`
- Notifications: `react-hot-toast`

## Current Product Features

- Public `/request-proposal` form with:
  - draft persistence in `sessionStorage`
  - privacy-policy scroll gate
  - Cloudflare Turnstile verification
  - honeypot protection
  - Supabase-backed accepted-submission rate limiting
  - optional Abstract email validation
- Automatic iPay confirmation email after a successful proposal submission.
- Success page that changes its message depending on whether the confirmation email was sent or failed.
- Protected `/dashboard` overview with cards for total, unread, read, and archived requests.
- `/dashboard/leads` management flow with:
  - `Unread`, `Read`, and `Archive` filters
  - clickable message previews that open a full modal
  - automatic mark-as-read when a message is opened
  - manual mark-as-unread for active reviewed leads
  - archive, restore, and permanent delete actions
  - bulk selection with archive, restore, and delete actions
  - search across lead name, company, email, contact number, and message
  - confirmation modals before state-changing actions
  - dedicated reply page with built-in templates, user-saved custom templates, editable template-save modal, file attachments, and nodemailer sending
  - 30-day archive retention support when the database cleanup job is configured

## Project Structure

```text
app/
  components/
    dashboard/          # Dashboard shell and navigation
    home/               # Landing page sections and shared marketing UI
  dashboard/
    leads/              # Leads table, reply page, message modal, and lead actions
  lib/
    lead-auto-reply.ts  # Shared auto-reply builder and send logic
    mailer.ts           # SMTP transport and outbound email send
    proposal-rate-limit.ts
    supabase-*.ts       # SSR and admin Supabase clients
  login/
  privacy-policy/
  request-proposal/
    actions.ts
    success/
    success-cookie.ts
  globals.css
  layout.tsx
  page.tsx
supabase/
  migrations/           # Add your project SQL migrations here
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

If you prefer Bun, this repo also includes `bun.lock`:

```bash
bun install
```

### 2. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Required Environment Variables

Add these to `.env.local`:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
TURNSTILE_EXPECTED_HOSTNAME=localhost

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RATE_LIMIT_HASH_SECRET=

ABSTRACT_EMAIL_API_KEY=
PROPOSAL_EMAIL_VALIDATION_ENABLED=true
PROPOSAL_BLOCKED_EMAIL_DOMAINS=
PROPOSAL_FALLBACK_RESTRICTED_EMAIL_DOMAINS=

AUTO_REPLY_ENABLED=true
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
AUTO_REPLY_FROM_EMAIL=
AUTO_REPLY_REPLY_TO_EMAIL=
MANUAL_REPLY_FROM_EMAIL=
MANUAL_REPLY_REPLY_TO_EMAIL=
```

Notes:

- Keep `TURNSTILE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RATE_LIMIT_HASH_SECRET`, `SMTP_USER`, and `SMTP_PASS` server-only.
- `TURNSTILE_EXPECTED_HOSTNAME` should be `localhost` in local development.
- In production, use your real hostname only. If you support both apex and `www`, use a comma-separated list.
- `AUTO_REPLY_FROM_EMAIL` must be allowed by your SMTP provider.

## Supabase Requirements

This app expects these database capabilities:

### `public.leads`

The `leads` table should contain the normal proposal fields plus:

- `read_at timestamptz null`
- `trashed_at timestamptz null`
- auto-reply tracking fields used by `app/lib/lead-auto-reply.ts`:
  - `auto_reply_status`
  - `auto_reply_sent_at`
  - `auto_reply_message_id`
  - `auto_reply_subject`
  - `auto_reply_sent_by`
  - `auto_reply_last_error`

### `public.lead_replies`

The manual reply flow expects a table that stores:

- `lead_id`
- `recipient_email`
- `subject`
- `message_text`
- `template_key`
- `sender_user_id`
- `status`
- `smtp_message_id`
- `error_message`
- `attachment_metadata`
- `sent_at`
- `created_at`

### `public.lead_reply_templates`

The saved-template flow expects a table that stores:

- `user_id`
- `label`
- `subject`
- `message_text`
- `source_template_key`
- `created_at`
- `updated_at`

### `public.proposal_submission_attempts`

The rate limiter expects a table that stores accepted attempts with:

- `ip_hash`
- `email_hash`
- `accepted`
- `reason`
- `created_at`

It also expects indexes that support recent lookups by IP hash, email hash, and created date.

### Archive cleanup

If you want archived leads to be removed automatically after 30 days, configure a Supabase SQL function plus a scheduled `pg_cron` job that deletes rows where:

```sql
trashed_at <= now() - interval '30 days'
```

Without that cleanup job, archive, restore, and manual permanent delete will still work, but automatic removal will not happen.

## Request Proposal Flow

1. User fills out `/request-proposal`.
2. Client-side checks require privacy review and a valid Turnstile token.
3. Server action validates fields, verifies Turnstile, checks the honeypot, checks rate limits, and optionally validates the email domain.
4. Accepted submissions are inserted into `public.leads`.
5. Accepted submissions are recorded in `public.proposal_submission_attempts`.
6. The app attempts to send the iPay confirmation email.
7. The success popup and `/request-proposal/success` page reflect the real result:
   - request saved + email sent
   - request saved + email failed

## Dashboard Lead Workflow

- `Unread` is the default filter.
- `Read` contains reviewed active leads.
- `Archive` contains soft-deleted leads.
- Archived leads can be restored or permanently deleted.
- Opening a message marks an active unread lead as read automatically.
- The message modal is used for reading full inquiries, replying, and updating unread status when needed.
- Bulk actions handle archive, restore, and permanent delete for selected rows.
- The dedicated reply page supports built-in templates, user-saved custom templates, editable save-template modal fields, attachments, and SMTP-based manual replies.
- Confirmation modals are shown before archive, restore, delete, and mark-as-unread actions.

## Important Files

- [app/request-proposal/actions.ts](app/request-proposal/actions.ts): proposal validation, rate limiting, lead insert, and public auto-reply send.
- [app/request-proposal/success/page.tsx](app/request-proposal/success/page.tsx): outcome-aware success page.
- [app/lib/lead-auto-reply.ts](app/lib/lead-auto-reply.ts): shared auto-reply content and lead tracking updates.
- [app/lib/proposal-rate-limit.ts](app/lib/proposal-rate-limit.ts): accepted-submission rate limiting.
- [app/dashboard/page.tsx](app/dashboard/page.tsx): overview stats and recent requests.
- [app/dashboard/leads/leads-table.tsx](app/dashboard/leads/leads-table.tsx): filters, table UX, archive actions, message modal, and confirmation modal.
- [app/dashboard/leads/lead-reply-form.tsx](app/dashboard/leads/lead-reply-form.tsx): reusable reply composer with templates and attachments.
- [app/dashboard/leads/actions.ts](app/dashboard/leads/actions.ts): read, archive, restore, delete, manual reply, saved-template creation, and dashboard auto-reply actions.

## Verification

Run:

```bash
npm run lint
```

At the time of writing, lint passes with one existing warning in `app/components/cardswap.tsx` about an unnecessary `useCallback` dependency.
