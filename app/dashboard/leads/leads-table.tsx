'use client'

import { useEffect, useId, useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { sendLeadAutoReply } from "./actions";

type Lead = {
  auto_reply_last_error?: string | null;
  auto_reply_message_id?: string | null;
  auto_reply_sent_at?: string | null;
  auto_reply_sent_by?: string | null;
  auto_reply_status?: string | null;
  auto_reply_subject?: string | null;
  company?: string;
  contact_number?: string;
  created_at?: string;
  email?: string;
  id?: number;
  message?: string;
  name?: string;
};

type ReplyFeedback = {
  message: string;
  status: "error" | "success";
};

function formatDate(dateString: string | undefined | null) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAutoReplyStatus(lead: Lead, autoReplyEnabled: boolean) {
  if (!autoReplyEnabled) {
    return {
      className:
        "border-[var(--border-light)] bg-[var(--bg-subtle)] text-[var(--text-faint)]",
      label: "Disabled",
    };
  }

  if (!lead.email?.trim()) {
    return {
      className:
        "border-[var(--border-light)] bg-[var(--bg-subtle)] text-[var(--text-faint)]",
      label: "No email",
    };
  }

  if (lead.auto_reply_sent_at) {
    return {
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300",
      label: "Sent",
    };
  }

  if (lead.auto_reply_status === "sending") {
    return {
      className:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-950/30 dark:text-sky-300",
      label: "Sending",
    };
  }

  if (lead.auto_reply_status === "failed") {
    return {
      className:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300",
      label: "Failed",
    };
  }

  return {
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-300",
    label: "Ready",
  };
}

function AutoReplyBadge({
  autoReplyEnabled,
  lead,
}: {
  autoReplyEnabled: boolean;
  lead: Lead;
}) {
  const status = getAutoReplyStatus(lead, autoReplyEnabled);

  return (
    <span
      className={`inline-flex min-w-[5.5rem] items-center justify-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${status.className}`}
    >
      {status.label}
    </span>
  );
}

export function LeadsTable({
  autoReplyEnabled,
  leads,
  error,
}: {
  autoReplyEnabled: boolean;
  leads: Lead[];
  error?: string;
}) {
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [replyFeedback, setReplyFeedback] = useState<ReplyFeedback | null>(null);
  const [isSendingReply, startReplyTransition] = useTransition();
  const modalTitleId = useId();
  const modalDescriptionId = useId();
  const [leadRows, updateLeadRows] = useOptimistic(
    leads,
    (currentLeads, updatedLead: Partial<Lead> & Pick<Lead, "id">) =>
      currentLeads.map((lead) =>
        lead.id === updatedLead.id ? { ...lead, ...updatedLead } : lead
      )
  );

  useEffect(() => {
    if (!selectedLead) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setReplyFeedback(null);
        setSelectedLead(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedLead]);

  function updateLeadState(updatedLead: Partial<Lead> & Pick<Lead, "id">) {
    updateLeadRows(updatedLead);
    setSelectedLead((currentLead) =>
      currentLead?.id === updatedLead.id
        ? { ...currentLead, ...updatedLead }
        : currentLead
    );
  }

  function handleSendAutoReply() {
    const leadId = selectedLead?.id;

    if (!leadId) {
      return;
    }

    startReplyTransition(async () => {
      setReplyFeedback(null);

      const result = await sendLeadAutoReply(leadId);

      if (result.lead?.id) {
        updateLeadState(result.lead);
      }

      setReplyFeedback({
        message: result.message,
        status: result.status,
      });

      if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  }

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
          Failed to load request proposals
        </p>
        <p className="mt-1 text-xs text-red-500/80 dark:text-red-400/60">
          {error}
        </p>
      </div>
    );
  }

  if (leadRows.length === 0) {
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
          No request proposals yet
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Request proposals will appear here when visitors submit the form.
        </p>
      </div>
    );
  }

  const selectedLeadEmail = selectedLead?.email?.trim();
  const selectedLeadHasSentReply = Boolean(selectedLead?.auto_reply_sent_at);
  const selectedLeadIsSending = selectedLead?.auto_reply_status === "sending";
  const canSendAutoReply =
    Boolean(selectedLead?.id) &&
    autoReplyEnabled &&
    Boolean(selectedLeadEmail) &&
    !selectedLeadHasSentReply &&
    !selectedLeadIsSending;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
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
                  Auto Reply
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                  Request Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {leadRows.map((lead, idx) => (
                <tr
                  key={lead.id ?? idx}
                  className="transition-colors duration-150 hover:bg-[var(--bg-subtle)]"
                >
                  <td className="whitespace-nowrap px-5 py-3.5 font-medium text-[var(--text-primary)]">
                    {lead.name || "-"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
                    {lead.company || "-"}
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
                      "-"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
                    {lead.contact_number || "-"}
                  </td>
                  <td className="max-w-xs px-5 py-3.5 text-[var(--text-muted)]">
                    {lead.message ? (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyFeedback(null);
                          setSelectedLead(lead);
                        }}
                        className="block max-w-xs truncate rounded-md text-left text-[var(--brand)] underline decoration-[var(--brand)]/25 underline-offset-2 transition-colors hover:decoration-[var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                        aria-label={`Read full message from ${lead.name || lead.email || "request proposal"}`}
                      >
                        {lead.message}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <AutoReplyBadge autoReplyEnabled={autoReplyEnabled} lead={lead} />
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
            onClick={() => {
              setReplyFeedback(null);
              setSelectedLead(null);
            }}
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
                  Request proposal message
                </p>
                <h2
                  id={modalTitleId}
                  className="mt-1 truncate font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]"
                >
                  {selectedLead.name || "Unnamed request proposal"}
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
                onClick={() => {
                  setReplyFeedback(null);
                  setSelectedLead(null);
                }}
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

            <div className="border-t border-[var(--border-light)] bg-[var(--bg-elevated-muted)] px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text-faint)]">
                    {selectedLeadEmail || "No email provided"}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <AutoReplyBadge autoReplyEnabled={autoReplyEnabled} lead={selectedLead} />
                    {selectedLead.auto_reply_sent_at && (
                      <span className="text-xs text-[var(--text-faint)]">
                        Sent {formatDate(selectedLead.auto_reply_sent_at)}
                      </span>
                    )}
                  </div>
                  {selectedLead.auto_reply_last_error && !selectedLead.auto_reply_sent_at && (
                    <p className="mt-2 text-xs text-red-500">
                      {selectedLead.auto_reply_last_error}
                    </p>
                  )}
                  {replyFeedback && (
                    <p
                      className={`mt-2 text-xs ${
                        replyFeedback.status === "success"
                          ? "text-emerald-600 dark:text-emerald-300"
                          : "text-red-500"
                      }`}
                    >
                      {replyFeedback.message}
                    </p>
                  )}
                  {!autoReplyEnabled && (
                    <p className="mt-2 text-xs text-[var(--text-faint)]">
                      Auto reply is disabled. Set `AUTO_REPLY_ENABLED=true` to send emails.
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyFeedback(null);
                      setSelectedLead(null);
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)]"
                  >
                    Close
                  </button>
                  {selectedLeadEmail && (
                    <button
                      type="button"
                      disabled={!canSendAutoReply || isSendingReply}
                      onClick={handleSendAutoReply}
                      className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)] disabled:cursor-not-allowed disabled:bg-[var(--border-medium)] disabled:shadow-none"
                    >
                      {isSendingReply || selectedLeadIsSending
                        ? "Sending auto reply..."
                        : selectedLeadHasSentReply
                          ? "Auto reply sent"
                          : "Send auto reply"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
