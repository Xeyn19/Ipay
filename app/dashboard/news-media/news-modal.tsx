import type { ReactNode } from "react";
import { X } from "lucide-react";

export const dashboardInputClassName =
  "mt-2 w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] shadow-sm outline-none transition focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[color:var(--brand)]/15";

export function NewsModal({
  ariaDescribedBy,
  ariaLabel,
  ariaLabelledBy,
  children,
  maxWidthClassName = "max-w-md",
  onClose,
  title,
}: {
  ariaDescribedBy?: string;
  ariaLabel: string;
  ariaLabelledBy?: string;
  children: ReactNode;
  maxWidthClassName?: string;
  onClose: () => void;
  title: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 py-6 sm:px-6">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        className={`relative flex w-full ${maxWidthClassName} flex-col overflow-hidden rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-large)]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-subtle)_0%,var(--bg-elevated)_100%)] px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">{title}</div>
          <button
            type="button"
            aria-label={ariaLabel}
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
