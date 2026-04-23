# Abstract Email Validation Setup

This guide explains how to connect the iPay International website's `/request-proposal` form to Abstract Email Validation.

Official references:

- Docs: `https://docs.abstractapi.com/api/email-validation`
- Pricing / free tier: `https://www.abstractapi.com/api/email-verification-validation-api`

## What This Project Uses Abstract For

The current `app/request-proposal` flow uses Abstract on the server side to:

- validate email format again at the API layer
- detect disposable email domains
- detect free/personal email domains

If Abstract is unavailable, times out, or the free quota is exhausted, the form falls back to local syntax validation so legitimate users can still submit.

## Keys And Env Vars Needed

For the Abstract integration itself, this repo needs:

```env
ABSTRACT_EMAIL_API_KEY=
PROPOSAL_EMAIL_VALIDATION_ENABLED=true
PROPOSAL_BLOCKED_EMAIL_DOMAINS=
PROPOSAL_FALLBACK_RESTRICTED_EMAIL_DOMAINS=
```

Meaning:

- `ABSTRACT_EMAIL_API_KEY`
  Your private Abstract Email Validation API key.
- `PROPOSAL_EMAIL_VALIDATION_ENABLED`
  Enables or disables Abstract validation for the proposal form.
  Keep it as `true` to use Abstract.
- `PROPOSAL_BLOCKED_EMAIL_DOMAINS`
  Comma-separated domains that should always be blocked, even if Abstract fails.
- `PROPOSAL_FALLBACK_RESTRICTED_EMAIL_DOMAINS`
  Comma-separated domains to block only when Abstract is unavailable.

Important:

- Do **not** prefix `ABSTRACT_EMAIL_API_KEY` with `NEXT_PUBLIC_`
- Keep it server-only in `.env.local` and production env settings

## Step By Step

### 1. Create an Abstract account

Go to:

`https://www.abstractapi.com/api/email-verification-validation-api`

Create a free account.

### 2. Open the Email Validation product

Inside Abstract, open the Email Validation API dashboard.

The API used by this repo is:

`https://emailvalidation.abstractapi.com/v1/`

### 3. Copy your API key

From the Abstract dashboard, copy your Email Validation API key.

This is the value you will place in:

```env
ABSTRACT_EMAIL_API_KEY=your_real_abstract_key_here
```

### 4. Add the env vars locally

Open `.env.local` and add:

```env
ABSTRACT_EMAIL_API_KEY=your_real_abstract_key_here
PROPOSAL_EMAIL_VALIDATION_ENABLED=true
PROPOSAL_BLOCKED_EMAIL_DOMAINS=pornhub.com,pornhubpremium.com,redtube.com,tube8.com,xhamster.com,xvideos.com,youporn.com
PROPOSAL_FALLBACK_RESTRICTED_EMAIL_DOMAINS=gmail.com,yahoo.com,outlook.com,hotmail.com,live.com,icloud.com,aol.com,proton.me,protonmail.com,mailinator.com,yopmail.com,guerrillamail.com,tempmail.com,10minutemail.com
```

If you want to temporarily disable Abstract without removing the key:

```env
PROPOSAL_EMAIL_VALIDATION_ENABLED=false
```

### 5. Add the env vars in production

In your hosting platform, add the same server-side env vars:

```env
ABSTRACT_EMAIL_API_KEY=your_real_abstract_key_here
PROPOSAL_EMAIL_VALIDATION_ENABLED=true
PROPOSAL_BLOCKED_EMAIL_DOMAINS=pornhub.com,pornhubpremium.com,redtube.com,tube8.com,xhamster.com,xvideos.com,youporn.com
PROPOSAL_FALLBACK_RESTRICTED_EMAIL_DOMAINS=gmail.com,yahoo.com,outlook.com,hotmail.com,live.com,icloud.com,aol.com,proton.me,protonmail.com,mailinator.com,yopmail.com,guerrillamail.com,tempmail.com,10minutemail.com
```

Do not expose this key in public/browser env vars.

### 6. Restart the app

After changing env vars, restart the dev server:

```bash
bun run dev
```

or your normal production deployment process.

### 7. Test the `/request-proposal` form

Test these cases:

1. Valid company email

Example:

`name@company.com`

Expected:

- form should continue normally

2. Invalid syntax

Example:

`@pornhub@gmail.com`

Expected:

- error: `Enter a valid email address.`

3. Disposable email

Example:

`test@yopmail.com`

Expected:

- error: `Please use a valid company email address.`

4. Free/personal email

Example:

`name@gmail.com`

Expected:

- error: `Please use a valid company email address.`

### 8. Understand the fallback behavior

If Abstract returns an error, times out, or your free credits are exhausted:

- the app does **not** hard fail the form
- the app still enforces `PROPOSAL_BLOCKED_EMAIL_DOMAINS`
- the app falls back to `PROPOSAL_FALLBACK_RESTRICTED_EMAIL_DOMAINS`

That means:

- malformed emails are still blocked
- Abstract-only checks like disposable/free detection may be skipped during API failure

## Current App Logic

This repo currently checks Abstract in:

- `app/request-proposal/email-policy.ts`

It is called from:

- `app/request-proposal/actions.ts`

The current logic is:

- local syntax check first
- block anything listed in `PROPOSAL_BLOCKED_EMAIL_DOMAINS`
- call Abstract if enabled and key is present
- reject if Abstract says:
  - invalid format
  - undeliverable
  - disposable email
  - free/personal email
- if Abstract is unavailable, use `PROPOSAL_FALLBACK_RESTRICTED_EMAIL_DOMAINS`

## Example Request Shape

Abstract is called as a server-side GET request like this:

```text
https://emailvalidation.abstractapi.com/v1/?api_key=YOUR_KEY&auto_correct=false&email=user@example.com
```

This project sends:

- `api_key`
- `email`
- `auto_correct=false`

## Notes About The Free Tier

Abstract's public pricing page currently advertises a free tier.

Because free-tier limits can change, always verify directly in your account dashboard before relying on it for production traffic.

## Troubleshooting

### Abstract is not being used

Check:

- `ABSTRACT_EMAIL_API_KEY` is set
- `PROPOSAL_EMAIL_VALIDATION_ENABLED=true`
- the server was restarted after env changes

### Valid users are still getting through with Gmail or Yopmail

Possible reasons:

- Abstract key is missing
- Abstract validation is disabled
- API request failed or timed out
- free quota is exhausted and fallback mode allowed the submission

### I want stricter behavior

Current setup is fail-open on API failure.

If you want stricter blocking later, update the fallback behavior in:

- `app/request-proposal/email-policy.ts`

## Summary

Minimum setup for this repo:

```env
ABSTRACT_EMAIL_API_KEY=your_real_abstract_key_here
PROPOSAL_EMAIL_VALIDATION_ENABLED=true
```

Once set, the `/request-proposal` form will use Abstract to filter free and disposable email addresses while keeping the API key fully server-side.
