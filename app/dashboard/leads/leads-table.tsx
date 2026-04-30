'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useOptimistic, useState, useTransition } from "react";
import toast from "react-hot-toast";
import {
  getLeadReadStatus,
  matchesLeadReadFilter,
  type LeadReadFilter,
} from "@/app/dashboard/lead-read-status";
import { toggleLeadReadStatus } from "./actions";

type Lead = {
  company?: string;
  contact_number?: string;
  created_at?: string;
  email?: string;
  id?: number;
  message?: string;
  name?: string;
  read_at?: string | null;
};

type ActionFeedback = {
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

function ReadStatusBadge({ lead }: { lead: Pick<Lead, "read_at"> }) {
  const status = getLeadReadStatus(lead);

  return (
    <span
      className={`inline-flex min-w-[5.5rem] items-center justify-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${status.className}`}
    >
      {status.label}
    </span>
  );
}

export function LeadsTable({
  activeFilter,
  leads,
  error,
}: {
  activeFilter: LeadReadFilter;
  leads: Lead[];
  error?: string;
}) {
  const pathname = usePathname();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);
  const [isUpdatingReadState, startReadStateTransition] = useTransition();
  const [pendingLeadId, setPendingLeadId] = useState<number | null>(null);
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
        setActionFeedback(null);
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

  function openLead(lead: Lead) {
    setActionFeedback(null);
    setSelectedLead(lead);
  }

  function getFilterHref(filter: LeadReadFilter) {
    return filter === "unread" ? pathname : `${pathname}?filter=read`;
  }

  function handleToggleReadStatus(lead: Pick<Lead, "id" | "read_at">) {
    const leadId = lead.id;

    if (!leadId) {
      return;
    }

    startReadStateTransition(async () => {
      setPendingLeadId(leadId);
      setActionFeedback(null);

      const result = await toggleLeadReadStatus(leadId);

      if (result.lead?.id) {
        updateLeadState(result.lead);
      }

      setActionFeedback({
        message: result.message,
        status: result.status,
      });

      if (result.status === "success") {
        toast.success(result.message);
        setPendingLeadId(null);
        return;
      }

      toast.error(result.message);
      setPendingLeadId(null);
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

  const totalLeadCount = leadRows.length;
  const unreadLeadCount = leadRows.filter((lead) => !lead.read_at).length;
  const readLeadCount = totalLeadCount - unreadLeadCount;
  const filteredLeadRows = leadRows.filter((lead) =>
    matchesLeadReadFilter(lead, activeFilter)
  );

  if (totalLeadCount === 0) {
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

  const selectedLeadReadStatus = selectedLead
    ? getLeadReadStatus(selectedLead)
    : null;
  const selectedLeadIsRead = Boolean(selectedLead?.read_at);
  const selectedLeadEmail = selectedLead?.email?.trim();
  const selectedLeadId = selectedLead?.id ?? null;
  const selectedLeadMessageLength = selectedLead?.message?.trim().length ?? 0;
  const modalHeightClass =
    selectedLeadMessageLength > 900
      ? "h-[min(92vh,60rem)]"
      : selectedLeadMessageLength > 280
        ? "h-[min(86vh,50rem)]"
        : "h-[min(74vh,40rem)]";
  const activeFilterTitle =
    activeFilter === "unread" ? "Unread requests" : "Read requests";
  const activeFilterDescription =
    activeFilter === "unread"
      ? "Review new proposal requests that are still waiting for follow-up."
      : "Revisit proposal requests that have already been reviewed.";

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 border-b border-[var(--border-light)] bg-[var(--bg-subtle)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
              {activeFilterTitle}
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {activeFilterDescription}
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] p-1 shadow-[var(--shadow-button)]">
            <Link
              href={getFilterHref("unread")}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                activeFilter === "unread"
                  ? "bg-[var(--brand)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              Unread
              <span
                className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[0.64rem] font-bold ${
                  activeFilter === "unread"
                    ? "bg-white/16 text-white"
                    : "bg-[var(--bg-subtle)] text-[var(--text-faint)]"
                }`}
              >
                {unreadLeadCount}
              </span>
            </Link>
            <Link
              href={getFilterHref("read")}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                activeFilter === "read"
                  ? "bg-[var(--brand)] text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              Read
              <span
                className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[0.64rem] font-bold ${
                  activeFilter === "read"
                    ? "bg-white/16 text-white"
                    : "bg-[var(--bg-subtle)] text-[var(--text-faint)]"
                }`}
              >
                {readLeadCount}
              </span>
            </Link>
          </div>
        </div>

        {filteredLeadRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[var(--text-faint)]" aria-hidden="true">
                <path d="M4 6h16v12H4z" />
                <path d="M4 8l8 5 8-5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {activeFilter === "unread"
                ? "No unread request proposals"
                : "No read request proposals"}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {activeFilter === "unread"
                ? "New submissions will appear here until you mark them as read."
                : "Marked requests will appear here once you review them."}
            </p>
          </div>
        ) : (
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
                {filteredLeadRows.map((lead, idx) => (
                  <tr
                    key={lead.id ?? idx}
                    className="transition-colors duration-150 hover:bg-[var(--bg-subtle)]"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-[var(--text-primary)]">
                      {lead.name || "Unnamed request proposal"}
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
                      {lead.message?.trim() ? (
                        <button
                          type="button"
                          onClick={() => openLead(lead)}
                          className="block max-w-xs truncate rounded-md text-left text-[var(--brand)] underline decoration-[var(--brand)]/25 underline-offset-2 transition-colors hover:decoration-[var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                          aria-label={`Read full message from ${lead.name || lead.email || "request proposal"}`}
                        >
                          {lead.message.trim()}
                        </button>
                      ) : (
                        <p className="truncate">No message provided.</p>
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
        )}
      </div>

      {selectedLead && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 sm:px-6">
          <button
            type="button"
            aria-label="Close message"
            onClick={() => {
              setActionFeedback(null);
              setSelectedLead(null);
            }}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            aria-describedby={modalDescriptionId}
            className={`relative flex w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-large)] ${modalHeightClass}`}
          >
            <div className="flex justify-center border-b border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-subtle)_0%,var(--bg-elevated)_100%)] px-5 py-4 text-center sm:px-6">
              <div className="min-w-0">
                <p
                  id={modalTitleId}
                  className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--text-primary)]"
                >
                  Proposal request details
                </p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden px-5 py-4 sm:px-6">
              <div className="grid h-full gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)]">
                <aside className="overflow-y-auto rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)]/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                    Lead details
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                        Full Name
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-primary)]">
                        {selectedLead.name || "No name provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                        Email
                      </p>
                      <p className="mt-1 break-words text-sm text-[var(--text-primary)]">
                        {selectedLeadEmail || "No email provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                        Contact Number
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-primary)]">
                        {selectedLead.contact_number || "No contact number provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                        Company
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-primary)]">
                        {selectedLead.company || "No company provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                        Read status
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {selectedLeadReadStatus && (
                          <ReadStatusBadge lead={selectedLead} />
                        )}
                        <span className="text-xs text-[var(--text-faint)]">
                          {selectedLead.read_at
                            ? `Marked ${formatDate(selectedLead.read_at)}`
                            : "Not marked as read yet"}
                        </span>
                      </div>
                    </div>
                  </div>
                </aside>

                <section className="min-w-0 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow-card)] lg:flex lg:min-h-0 lg:flex-col">
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--border-light)] pb-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                        Message
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-[var(--bg-base)]/80 p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text-secondary)]">
                      {selectedLead.message?.trim() || "No message provided."}
                    </p>
                  </div>
                </section>
              </div>
            </div>

            <div className="border-t border-[var(--border-light)] bg-[var(--bg-elevated-muted)] px-5 py-3 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p
                    id={modalDescriptionId}
                    className="text-xs font-medium text-[var(--text-faint)]"
                  >
                    Update the read state after reviewing the message.
                  </p>
                  {actionFeedback && (
                    <p
                      className={`mt-2 text-xs ${
                        actionFeedback.status === "success"
                          ? "text-emerald-600 dark:text-emerald-300"
                          : "text-red-500"
                      }`}
                    >
                      {actionFeedback.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActionFeedback(null);
                      setSelectedLead(null);
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)]"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingReadState}
                    onClick={() => {
                      if (selectedLead) {
                        handleToggleReadStatus(selectedLead);
                      }
                    }}
                    className={`inline-flex h-10 min-w-[10.5rem] items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)] disabled:cursor-not-allowed disabled:opacity-60 ${
                      selectedLeadIsRead
                        ? "border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                        : "bg-[var(--brand)] text-white shadow-[var(--shadow-button)] hover:bg-[var(--brand-dark)]"
                    }`}
                  >
                    {isUpdatingReadState && pendingLeadId === selectedLeadId
                      ? "Updating..."
                      : selectedLeadIsRead
                        ? "Mark as unread"
                        : "Mark as read"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
