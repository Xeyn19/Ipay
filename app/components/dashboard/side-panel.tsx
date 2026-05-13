"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function SidePanel({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  canClose = true,
  children,
  isOpen,
  onClose,
  title,
}: {
  ariaDescribedBy?: string;
  ariaLabel: string;
  ariaLabelledBy?: string;
  canClose?: boolean;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalBodyOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && canClose) {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [canClose, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => {
          if (canClose) {
            onClose();
          }
        }}
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
      />

      <div className="absolute inset-y-0 right-0 flex w-full justify-end pl-6 sm:pl-10">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          className="relative flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-large)]"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-subtle)_0%,var(--bg-elevated)_100%)] px-5 py-4 sm:px-6">
            <div className="min-w-0 flex-1">{title}</div>
            <button
              type="button"
              aria-label={ariaLabel}
              onClick={() => {
                if (canClose) {
                  onClose();
                }
              }}
              disabled={!canClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
