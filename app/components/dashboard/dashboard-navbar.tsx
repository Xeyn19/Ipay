'use client'

import Link from "next/link";
import type { Theme } from "@/app/lib/theme";
import { BrandLogo } from "@/app/components/home/brand-logo";
import ThemeToggle from "@/app/components/theme-toggle";
import { logout } from "@/app/dashboard/actions";

export function DashboardNavbar({
  initialTheme,
  onToggleSidebar,
}: {
  initialTheme: Theme;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--nav-height)] border-b border-[var(--border-light)] bg-[var(--nav-bg)] backdrop-blur">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--border-orange)] hover:bg-[var(--bg-elevated-muted)] lg:hidden"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </button>

          <Link href="/dashboard/leads" className="flex items-center">
            <BrandLogo initialTheme={initialTheme} priority />
          </Link>
        </div>

        {/* Right: theme toggle + logout */}
        <div className="flex items-center gap-2">
          <ThemeToggle initialTheme={initialTheme} />

          <form action={logout}>
            <button
              type="submit"
              id="logout-btn"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3.5 text-sm font-medium text-[var(--text-secondary)] transition-all duration-200 hover:border-red-400/40 hover:bg-red-50/60 hover:text-red-600 dark:hover:border-red-500/30 dark:hover:bg-red-950/30 dark:hover:text-red-400"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M7 17H4a1 1 0 01-1-1V4a1 1 0 011-1h3M14 14l3-3m0 0l-3-3m3 3H7" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
