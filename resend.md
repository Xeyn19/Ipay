# Resend Auto Reply Testing Guide

This project is currently set up to test the auto-reply feature on:

- `localhost`
- `ipays.vercel.app`

For now, this guide focuses on testing only.

## Important Limitation

`localhost` and `ipays.vercel.app` are where the app runs.

They are not your email sender domain.

That means:

- you can test the app locally on `http://localhost:3000`
- you can test the deployed app on `https://ipays.vercel.app`
- but you still cannot send real emails from `no-reply@ipays.ph` until `ipays.ph` is verified in Resend

For testing right now, use Resend's test sender:

```env
RESEND_FROM_EMAIL=onboarding@resend.dev
```

Resend only allows this sender to send to your own Resend account email.

So if you use `onboarding@resend.dev`:

- test only with your own email address
- do not test with real client email addresses yet

Reference:

- https://resend.com/docs/knowledge-base/403-error-resend-dev-domain

## Current Testing Goal

Use the dashboard auto-reply button to confirm that:

- the button works
- the server action runs
- Resend accepts the request
- the lead row updates to `Sent`
- the auto-reply metadata is saved in Supabase

## Environment Variables For Local Testing

Put these in `.env.local`:

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_REPLY_TO_EMAIL=your_email@example.com
AUTO_REPLY_ENABLED=true
```

### Variable Meaning

- `RESEND_API_KEY`
  Your Resend API key

- `RESEND_FROM_EMAIL`
  Use `onboarding@resend.dev` for test mode only

- `RESEND_REPLY_TO_EMAIL`
  Your own email for reply handling during testing

- `AUTO_REPLY_ENABLED`
  Must be `true` to allow the dashboard button to send

## Localhost Test Setup

### 1. Add env vars

Make sure `.env.local` contains:

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_REPLY_TO_EMAIL=your_email@example.com
AUTO_REPLY_ENABLED=true
```

### 2. Run the migration

Run this migration in Supabase:

[20260422_add_lead_auto_reply_tracking.sql](/C:/Users/EDGAR/Documents/ipay/supabase/migrations/20260422_add_lead_auto_reply_tracking.sql)

This adds:

- `auto_reply_status`
- `auto_reply_sent_at`
- `auto_reply_message_id`
- `auto_reply_subject`
- `auto_reply_sent_by`
- `auto_reply_last_error`

### 3. Start the app

```bash
bun run dev
```

Open:

`http://localhost:3000/dashboard/leads`

### 4. Use your own email in the lead

Because you are using `onboarding@resend.dev`, the lead email should be your own email address connected to your Resend account.

If the lead email is not yours, Resend will reject the send.

### 5. Test the auto reply

1. Log in to the dashboard
2. Open `/dashboard/leads`
3. Open a lead message
4. Click `Send auto reply`

Expected result:

- the request succeeds
- Resend accepts the email
- the row updates to `Sent`
- metadata is stored in the `leads` row

## `ipays.vercel.app` Test Setup

You can also test the deployed app on Vercel.

### 1. Add env vars in Vercel

Open:

`Vercel Project Settings -> Environment Variables`

Add:

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_REPLY_TO_EMAIL=your_email@example.com
AUTO_REPLY_ENABLED=true
```

### 2. Redeploy

After adding env vars in Vercel, redeploy the project.

### 3. Open the deployed dashboard

Open:

`https://ipays.vercel.app/dashboard/leads`

### 4. Use your own email in the lead

Just like local testing, the lead email must be your own email if you are using `onboarding@resend.dev`.

### 5. Click `Send auto reply`

Expected result:

- the auto reply sends through Resend
- the row updates correctly
- the dashboard shows `Sent`

## Very Important Vercel Note

`.env.local` is only for local development.

Vercel does not read your local file.

For `ipays.vercel.app`, you must add the same environment variables in the Vercel dashboard.

## What Works Right Now

Right now, you can test:

- app flow on `localhost`
- app flow on `ipays.vercel.app`
- server action execution
- Supabase update after sending
- Resend integration using the test sender

## What Does Not Work Yet

Right now, you cannot:

- send from `no-reply@ipays.ph`
- send to arbitrary client email addresses
- use `ipays.ph` as the sender domain before Resend verifies it

## When You Want Real Sending Later

Later, when you want to send real auto replies to actual leads:

1. Verify a domain in Resend
2. Best option: verify a sending subdomain like `mail.ipays.ph`
3. Change:

```env
RESEND_FROM_EMAIL=no-reply@mail.ipays.ph
```

Then the same code will work for real recipients on:

- `localhost`
- `ipays.vercel.app`

Reference:

- Domain verification: https://resend.com/docs/dashboard/domains/introduction
- Vercel + Resend domain setup: https://resend.com/docs/knowledge-base/vercel

## Files Used By This Feature

- [app/lib/resend.ts](/C:/Users/EDGAR/Documents/ipay/app/lib/resend.ts)
- [app/dashboard/leads/actions.ts](/C:/Users/EDGAR/Documents/ipay/app/dashboard/leads/actions.ts)
- [app/dashboard/leads/leads-table.tsx](/C:/Users/EDGAR/Documents/ipay/app/dashboard/leads/leads-table.tsx)
- [app/dashboard/leads/page.tsx](/C:/Users/EDGAR/Documents/ipay/app/dashboard/leads/page.tsx)
- [20260422_add_lead_auto_reply_tracking.sql](/C:/Users/EDGAR/Documents/ipay/supabase/migrations/20260422_add_lead_auto_reply_tracking.sql)

## Common Errors

### `The ipays.ph domain is not verified`

Cause:

- you are trying to send from `no-reply@ipays.ph`
- Resend has not verified `ipays.ph`

Fix for test mode:

- use `RESEND_FROM_EMAIL=onboarding@resend.dev`

Fix for real sending later:

- verify `ipays.ph` or `mail.ipays.ph` in Resend

### `403` when using `onboarding@resend.dev`

Cause:

- you are sending to an email address that is not your own Resend account email

Fix:

- use your own email address for the lead during testing

### Auto reply button does not send

Possible causes:

- `AUTO_REPLY_ENABLED=false`
- Vercel env vars are missing
- migration was not run
- lead has no email
- lead email is not your own email while using `onboarding@resend.dev`

## Quick Test Checklist

- `.env.local` updated for local test mode
- Vercel env vars added for deployed test mode
- `RESEND_FROM_EMAIL=onboarding@resend.dev`
- lead email is your own email address
- migration applied
- `AUTO_REPLY_ENABLED=true`
- dashboard login works
- `Send auto reply` updates the row to `Sent`
