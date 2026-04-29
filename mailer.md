# SMTP / Nodemailer Auto Reply Guide

This project now sends dashboard lead auto-replies through Nodemailer using your SMTP provider.

The app can run on:

- `localhost`
- `ipays.vercel.app`

Those hosts are where the app runs. Your actual ability to send mail depends on whether your SMTP provider accepts the configured sender address.

## Current Goal

Use the dashboard auto-reply button to confirm that:

- the button works
- the server action runs
- the SMTP provider accepts the message
- the lead row updates to `Sent`
- the auto-reply metadata is saved in Supabase

## Environment Variables

Put these in `.env.local` for local testing:

```env
AUTO_REPLY_ENABLED=true
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
AUTO_REPLY_FROM_EMAIL=no-reply@example.com
AUTO_REPLY_REPLY_TO_EMAIL=your_email@example.com
```

### Variable Meaning

- `AUTO_REPLY_ENABLED`
  Must be `true` to allow the dashboard button to send

- `SMTP_HOST`
  Your SMTP server hostname

- `SMTP_PORT`
  Usually `587` for STARTTLS or `465` for implicit TLS

- `SMTP_SECURE`
  Use `true` for port `465`, `false` for port `587` in most setups

- `SMTP_USER`
  SMTP username or mailbox login

- `SMTP_PASS`
  SMTP password or app password

- `AUTO_REPLY_FROM_EMAIL`
  Sender address allowed by your SMTP provider

- `AUTO_REPLY_REPLY_TO_EMAIL`
  Inbox that receives replies from leads

## Localhost Test Setup

### 1. Add env vars

Make sure `.env.local` contains valid SMTP credentials and sender values.

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

### 4. Test the auto reply

1. Log in to the dashboard
2. Open `/dashboard/leads`
3. Open a lead message
4. Click `Send auto reply`

Expected result:

- the request succeeds
- the SMTP provider accepts the email
- the row updates to `Sent`
- metadata is stored in the `leads` row

## `ipays.vercel.app` Test Setup

### 1. Add env vars in Vercel

Open:

`Vercel Project Settings -> Environment Variables`

Add the same SMTP and auto-reply variables used locally.

### 2. Redeploy

After adding env vars in Vercel, redeploy the project.

### 3. Open the deployed dashboard

Open:

`https://ipays.vercel.app/dashboard/leads`

### 4. Click `Send auto reply`

Expected result:

- the auto reply sends through your SMTP provider
- the row updates correctly
- the dashboard shows `Sent`

## Very Important Vercel Note

`.env.local` is only for local development.

Vercel does not read your local file.

For `ipays.vercel.app`, you must add the same environment variables in the Vercel dashboard.

## Files Used By This Feature

- [app/lib/mailer.ts](/C:/Users/EDGAR/Documents/ipay/app/lib/mailer.ts)
- [app/dashboard/leads/actions.ts](/C:/Users/EDGAR/Documents/ipay/app/dashboard/leads/actions.ts)
- [app/dashboard/leads/leads-table.tsx](/C:/Users/EDGAR/Documents/ipay/app/dashboard/leads/leads-table.tsx)
- [app/dashboard/leads/page.tsx](/C:/Users/EDGAR/Documents/ipay/app/dashboard/leads/page.tsx)
- [20260422_add_lead_auto_reply_tracking.sql](/C:/Users/EDGAR/Documents/ipay/supabase/migrations/20260422_add_lead_auto_reply_tracking.sql)

## Common Errors

### `SMTP_HOST is not configured`

Cause:

- one or more required SMTP variables are missing

Fix:

- set all required SMTP and auto-reply variables

### Authentication or connection errors

Cause:

- the SMTP hostname, port, secure mode, username, or password is wrong

Fix:

- verify the provider settings
- make sure `SMTP_SECURE` matches the selected port
- if you are using Gmail or Microsoft, use the provider-approved app password or SMTP credentials

### Auto reply button does not send

Possible causes:

- `AUTO_REPLY_ENABLED=false`
- Vercel env vars are missing
- migration was not run
- lead has no email
- the SMTP provider rejected the sender or credentials

## Quick Test Checklist

- `.env.local` updated with SMTP credentials
- Vercel env vars added for deployed test mode
- `AUTO_REPLY_ENABLED=true`
- `AUTO_REPLY_FROM_EMAIL` is valid for the provider
- migration applied
- dashboard login works
- `Send auto reply` updates the row to `Sent`
