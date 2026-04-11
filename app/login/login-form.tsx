'use client'

import { useActionState } from 'react'
import { login } from '@/app/login/actions'

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

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
        <input
          id="login-password"
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-base)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
        />
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
