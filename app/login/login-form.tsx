'use client'

import { useActionState, useState } from 'react'
import { login } from '@/app/login/actions'

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form id="login-form" action={action} className="space-y-5">
      {/* Error message */}
      {state?.error && (
        <div
          id="login-error"
          className="flex items-center gap-2.5 rounded-xl border border-red-300/40 bg-red-50/60 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          {state.error}
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="login-email"
          className="mb-1.5 block text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)]"
        >
          Email
        </label>
        <input
          id="login-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="login-password"
          className="mb-1.5 block text-xs font-semibold tracking-[0.06em] text-[var(--text-secondary)]"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            name="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] py-3 pr-12 pl-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d="M3 3l18 18" />
                <path d="M10.7 5.1A10.7 10.7 0 0112 5c5 0 8.6 4.1 10 7a15.5 15.5 0 01-3 4.2" />
                <path d="M6.6 6.7A15.3 15.3 0 002 12c1.4 2.9 5 7 10 7a10.7 10.7 0 004.2-.9" />
                <path d="M9.9 9.9a3 3 0 104.2 4.2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          id="login-submit-btn"
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-cta)] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[var(--shadow-button)] transition-all duration-200 hover:brightness-110 hover:shadow-[var(--shadow-button-hover)] focus:outline-none focus:ring-3 focus:ring-[rgba(241,122,30,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-none"
        >
          {pending ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M4 10h12M11 6l4 4-4 4" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
