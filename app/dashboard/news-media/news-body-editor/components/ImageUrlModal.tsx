"use client";

import { useEffect, useId, useState } from "react";
import { dashboardInputClassName, NewsModal } from "../../news-modal";
import { normalizeImageUrl } from "../utils";

export function ImageUrlModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (url: string) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleSubmit() {
    const normalizedUrl = normalizeImageUrl(value);

    if (!normalizedUrl) {
      setError("Enter a valid http or https image URL.");
      return;
    }

    setError("");
    onSubmit(normalizedUrl);
  }

  return (
    <NewsModal
      ariaDescribedBy={descriptionId}
      ariaLabel="Close image URL dialog"
      ariaLabelledBy={titleId}
      onClose={onClose}
      title={
        <p
          id={titleId}
          className="font-heading text-base font-bold tracking-[-0.02em] text-[var(--text-primary)]"
        >
          Insert image via URL
        </p>
      }
    >
      <div className="space-y-4 px-5 py-5 sm:px-6">
        <p id={descriptionId} className="sr-only">
          Paste a public image URL to insert it into the article body.
        </p>
        <label>
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Image URL
          </span>
          <input
            autoFocus
            type="url"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) {
                setError("");
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="https://example.com/news-image.jpg"
            className={dashboardInputClassName}
          />
          {error ? (
            <p className="mt-2 text-xs font-medium text-[#dc2626]">{error}</p>
          ) : null}
        </label>

        <div className="flex flex-col-reverse gap-2 border-t border-[var(--border-light)] pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
          >
            Insert image
          </button>
        </div>
      </div>
    </NewsModal>
  );
}
