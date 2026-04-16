'use client'

import { useEffect, useId, useState } from "react";

type Lead = {
  id?: number;
  name?: string;
  company?: string;
  email?: string;
  contact_number?: string;
  message?: string;
  created_at?: string;
};

function formatDate(dateString: string | undefined) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getGmailComposeUrl(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.trim())}`;
}

export function LeadsTable({
  leads,
  error,
}: {
  leads: Lead[];
  error?: string;
}) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const modalTitleId = useId();
  const modalDescriptionId = useId();

  useEffect(() => {
    if (!selectedLead) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedLead(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedLead]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-300/40 bg-red-50/60 px-6 py-10 text-center dark:border-red-500/20 dark:bg-red-950/30">
        <svg viewBox="0 0 20 20" fill="currentColor" className="mx-auto mb-3 h-8 w-8 text-red-400" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm font-medium text-red-700 dark:text-red-300">
          Failed to load leads
        </p>
        <p className="mt-1 text-xs text-red-500/80 dark:text-red-400/60">
          {error}
        </p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[var(--text-faint)]" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          No leads yet
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Leads will appear here when visitors submit proposal requests.
        </p>
      </div>
    );
  }

  const selectedLeadEmail = selectedLead?.email?.trim();

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" id="leads-table">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-[var(--bg-subtle)]">
              <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Name
              </th>
              <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Company
              </th>
              <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Email
              </th>
              <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Contact Number
              </th>
              <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Message
              </th>
              <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Request Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {leads.map((lead, idx) => (
              <tr
                key={lead.id ?? idx}
                className="transition-colors duration-150 hover:bg-[var(--bg-subtle)]"
              >
                <td className="whitespace-nowrap px-5 py-3.5 font-medium text-[var(--text-primary)]">
                  {lead.name || "—"}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
                  {lead.company || "—"}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-[var(--brand)] underline decoration-[var(--brand)]/30 underline-offset-2 transition-colors hover:decoration-[var(--brand)]"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
                  {lead.contact_number || "—"}
                </td>
                <td className="max-w-xs px-5 py-3.5 text-[var(--text-muted)]">
                  {lead.message ? (
                    <button
                      type="button"
                      onClick={() => setSelectedLead(lead)}
                      className="block max-w-xs truncate rounded-md text-left text-[var(--brand)] underline decoration-[var(--brand)]/25 underline-offset-2 transition-colors hover:decoration-[var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                      aria-label={`Read full message from ${lead.name || lead.email || "lead"}`}
                    >
                      {lead.message}
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[var(--text-faint)]">
                  {formatDate(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      {selectedLead && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 sm:px-6">
          <button
            type="button"
            aria-label="Close message"
            onClick={() => setSelectedLead(null)}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          aria-describedby={modalDescriptionId}
          className="relative flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-large)]"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border-light)] bg-[var(--bg-subtle)] px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Lead message
              </p>
              <h2
                id={modalTitleId}
                className="mt-1 truncate font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]"
              >
                {selectedLead.name || "Unnamed lead"}
              </h2>
              <p
                id={modalDescriptionId}
                className="mt-1 text-sm text-[var(--text-muted)]"
              >
                {selectedLead.company || "No company provided"} | {formatDate(selectedLead.created_at)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLead(null)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-elevated-muted)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-subtle)]"
              aria-label="Close message"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--text-secondary)]">
              {selectedLead.message}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-[var(--border-light)] bg-[var(--bg-elevated-muted)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--text-faint)]">
              {selectedLeadEmail || "No email provided"}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)]"
              >
                Close
              </button>
              {selectedLeadEmail && (
                <a
                  href={getGmailComposeUrl(selectedLeadEmail)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)]"
                >
                  Reply in Gmail
                </a>
              )}
            </div>
          </div>
          </section>
        </div>
      )}
    </>
  );
}
