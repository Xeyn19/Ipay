'use client';

import { useEffect, useState } from "react";
import {
  THEME_COOKIE_KEY,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/app/lib/theme";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.cookie = `${THEME_COOKIE_KEY}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export default function ThemeToggle({
  initialTheme,
}: {
  initialTheme: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTheme(
        document.documentElement.dataset.theme === "dark" ? "dark" : "light",
      );
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={() => {
        applyTheme(nextTheme);
        setTheme(nextTheme);

        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch {
          // Ignore storage failures and keep the in-memory toggle working.
        }
      }}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--brand)] transition-all duration-200 ease-out hover:bg-[var(--brand-pale)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/40"
    >
      <span
        suppressHydrationWarning
        className="inline-flex items-center justify-center"
      >
        {theme === "dark" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2.5" />
            <path d="M12 19.5V22" />
            <path d="m4.93 4.93 1.77 1.77" />
            <path d="m17.3 17.3 1.77 1.77" />
            <path d="M2 12h2.5" />
            <path d="M19.5 12H22" />
            <path d="m4.93 19.07 1.77-1.77" />
            <path d="m17.3 6.7 1.77-1.77" />
          </svg>
        )}
      </span>
    </button>
  );
}
