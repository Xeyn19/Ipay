'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Theme } from "@/app/lib/theme";
import ThemeToggle from "@/app/components/theme-toggle";
import { BrandLogo } from "@/app/components/home/brand-logo";
import { navigation } from "@/app/components/home/data";
import { Button } from "@/app/components/home/ui";

export function Navbar({
  initialTheme,
}: {
  initialTheme: Theme;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#home");
  const [showProposalButton, setShowProposalButton] = useState(false);

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

  useEffect(() => {
    const syncActiveHref = () => {
      if (!isHomePage) {
        setActiveHref(pathname);
        return;
      }

      setActiveHref(window.location.hash || "#home");
    };

    syncActiveHref();
    if (!isHomePage) {
      return;
    }

    window.addEventListener("hashchange", syncActiveHref);

    return () => {
      window.removeEventListener("hashchange", syncActiveHref);
    };
  }, [isHomePage, pathname]);

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    const syncProposalButton = () => {
      const heroTwo = document.getElementById("hero_2");

      if (!heroTwo) {
        setShowProposalButton(false);
        return;
      }

      const { top } = heroTwo.getBoundingClientRect();
      setShowProposalButton(top <= Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")));
    };

    syncProposalButton();
    window.addEventListener("scroll", syncProposalButton, { passive: true });
    window.addEventListener("resize", syncProposalButton);

    return () => {
      window.removeEventListener("scroll", syncProposalButton);
      window.removeEventListener("resize", syncProposalButton);
    };
  }, [isHomePage]);

  const handleNavClick = (sectionId: string) => {
    setActiveHref(sectionId === "home" ? "#home" : `#${sectionId}`);
    setIsOpen(false);
  };

  const getNavHref = (sectionId: string) => {
    if (sectionId === "home") {
      return "/";
    }

    return isHomePage ? `#${sectionId}` : `/#${sectionId}`;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-[var(--border-light)] bg-[var(--nav-bg)] backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center"
          onClick={() => handleNavClick("home")}
        >
          <BrandLogo initialTheme={initialTheme} priority />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={getNavHref(item.sectionId)}
              onClick={() => handleNavClick(item.sectionId)}
              aria-current={activeHref === `#${item.sectionId}` ? "page" : undefined}
              className={`inline-flex h-20 items-center text-sm font-medium transition-colors duration-200 ease-out focus:outline-none ${
                activeHref === `#${item.sectionId}`
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="relative inline-flex items-center pb-1">
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-0.5 left-0 h-[3px] w-full origin-center rounded-full bg-[var(--brand)] transition-transform duration-300 ease-out ${
                    activeHref === `#${item.sectionId}` ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div
            className={`hidden transition-all duration-300 ease-out md:block ${
              showProposalButton
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
            aria-hidden={!showProposalButton}
          >
            <Button href="/request-proposal">Request Proposal</Button>
          </div>
          <ThemeToggle initialTheme={initialTheme} />

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
            className="fixed inset-x-0 z-40 bg-[color:var(--bg-base)]/45 backdrop-blur-[2px] md:hidden"
            style={{
              top: "var(--nav-height)",
              height: "calc(100vh - var(--nav-height))",
            }}
          />
          <div
            id="mobile-nav-panel"
            className="absolute inset-x-4 top-[calc(100%+0.75rem)] z-50 rounded-[24px] border border-[var(--border-light)] bg-[color:var(--bg-elevated)]/96 p-4 shadow-[var(--shadow-large-strong)] backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={getNavHref(item.sectionId)}
                  onClick={() => handleNavClick(item.sectionId)}
                  aria-current={activeHref === `#${item.sectionId}` ? "page" : undefined}
                  className={`flex items-center justify-between rounded-[16px] border px-4 py-3 text-sm font-semibold transition-all duration-200 ease-out ${
                    activeHref === `#${item.sectionId}`
                      ? "border-[var(--border-orange)] bg-[var(--bg-elevated-muted)] text-[var(--brand)]"
                      : "border-transparent bg-[var(--bg-base)]/72 text-[var(--text-primary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-elevated-muted)]"
                  }`}
                >
                  <span>{item.label}</span>
                  <span className="text-[var(--tone-gold)]" aria-hidden="true">
                    /
                  </span>
                </Link>
              ))}
            </nav>

            <div
              className={`overflow-hidden border-[var(--border-light)] transition-all duration-300 ease-out ${
                showProposalButton
                  ? "mt-4 max-h-24 border-t pt-4 opacity-100"
                  : "mt-0 max-h-0 border-t-0 pt-0 opacity-0"
              }`}
              aria-hidden={!showProposalButton}
            >
              <div>
                <Link
                  href="/request-proposal"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[var(--brand-cta)] px-6 py-3 text-sm font-semibold text-white shadow-none transition-all duration-200 ease-out hover:bg-[var(--brand-cta)] hover:shadow-none focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-cta)]/40"
                >
                  Request Proposal
                </Link>
              </div>
            </div>

          </div>
        </>
      ) : null}
    </header>
  );
}
