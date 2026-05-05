"use client";

import {
  useEffect,
  useId,
  type ReactNode,
} from "react";

export type ConfirmationModalTone = "danger" | "neutral" | "warning";

type ConfirmationModalProps = {
  cancelLabel?: string;
  children?: ReactNode;
  confirmLabel: string;
  description?: ReactNode;
  isOpen: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingLabel?: string;
  title: string;
  tone?: ConfirmationModalTone;
};

function getConfirmButtonClassName(tone: ConfirmationModalTone) {
  if (tone === "danger") {
    return "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400";
  }

  if (tone === "warning") {
    return "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400";
  }

  return "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)] focus-visible:ring-[var(--brand)]";
}

export function ConfirmationModal({
  cancelLabel = "Cancel",
  children,
  confirmLabel,
  description,
  isOpen,
  isPending = false,
  onClose,
  onConfirm,
  pendingLabel = "Please wait...",
  title,
  tone = "neutral",
}: ConfirmationModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const hasDescription = Boolean(description || children);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPending, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6 sm:px-6">
      <button
        type="button"
        aria-label="Close confirmation"
        onClick={() => {
          if (!isPending) {
            onClose();
          }
        }}
        className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        className="relative flex w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-large)]"
      >
        <div className="border-b border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-subtle)_0%,var(--bg-elevated)_100%)] px-5 py-4 text-center sm:px-6">
          <p
            id={titleId}
            className="font-heading text-base font-bold tracking-[-0.02em] text-[var(--text-primary)]"
          >
            {title}
          </p>
        </div>

        {hasDescription ? (
          <div
            id={descriptionId}
            className="px-5 py-5 text-sm leading-7 text-[var(--text-secondary)] sm:px-6"
          >
            {children ?? description}
          </div>
        ) : null}

        <div className="border-t border-[var(--border-light)] bg-[var(--bg-elevated-muted)] px-5 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)] disabled:cursor-not-allowed disabled:opacity-60 ${getConfirmButtonClassName(
                tone,
              )}`}
            >
              {isPending ? pendingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
