'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/app/components/theme-toggle";
import { BrandLogo } from "@/app/components/home/brand-logo";
import { navigation } from "@/app/components/home/data";
import { Button } from "@/app/components/home/ui";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-[var(--border-light)] bg-[var(--nav-bg)] backdrop-blur relative">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="#home" className="flex items-center" onClick={() => setIsOpen(false)}>
          <BrandLogo priority />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 ease-out hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/40"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button href="#proposal" className="hidden md:inline-flex">
            Request Proposal
          </Button>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-nav-panel"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-control)] transition-all duration-200 ease-out hover:border-[var(--border-orange)] hover:bg-[var(--bg-elevated-muted)] md:hidden"
          >
            <span className="relative h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition duration-200 ease-out ${
                  isOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition duration-200 ease-out ${
                  isOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition duration-200 ease-out ${
                  isOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close mobile navigation"
            onClick={() => setIsOpen(false)}
            className="fixed inset-x-0 top-20 z-40 h-[calc(100vh-5rem)] bg-[color:var(--bg-base)]/45 backdrop-blur-[2px] md:hidden"
          />
          <div
            id="mobile-nav-panel"
            className="absolute inset-x-4 top-[calc(100%+0.75rem)] z-50 rounded-[24px] border border-[var(--border-light)] bg-[color:var(--bg-elevated)]/96 p-4 shadow-[var(--shadow-large-strong)] backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-[16px] border border-transparent bg-[var(--bg-base)]/72 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-all duration-200 ease-out hover:border-[var(--border-orange)] hover:bg-[var(--bg-elevated-muted)]"
                >
                  <span>{item.label}</span>
                  <span className="text-[var(--tone-gold)]" aria-hidden="true">
                    /
                  </span>
                </Link>
              ))}
            </nav>

            <div className="mt-4 border-t border-[var(--border-light)] pt-4">
              <Link
                href="#proposal"
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[linear-gradient(135deg,var(--brand),var(--brand-light))] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition-all duration-200 ease-out hover:bg-[var(--brand-dark)] hover:shadow-[var(--shadow-button-hover)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/40"
              >
                Request Proposal
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
