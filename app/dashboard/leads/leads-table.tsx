'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LoaderCircle, Trash, Trash2, Undo2 } from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useId,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import toast from "react-hot-toast";
import {
  getLeadReadStatus,
  getLeadTrashState,
  isLeadTrashed,
  matchesLeadReadFilter,
  type LeadReadFilter,
} from "@/app/dashboard/lead-read-status";
import {
  permanentlyDeleteLead,
  restoreLead,
  toggleLeadReadStatus,
  trashLead,
} from "./actions";

type Lead = {
  company?: string;
  contact_number?: string;
  created_at?: string;
  email?: string;
  id?: number;
  message?: string;
  name?: string;
  read_at?: string | null;
  trashed_at?: string | null;
};

type ActionFeedback = {
  message: string;
  status: "error" | "success";
};

type LeadMutationType = "delete" | "read" | "restore" | "trash";
type ConfirmationTone = "danger" | "neutral" | "warning";

type LeadOptimisticAction =
  | {
      type: "delete";
      leadId: number;
    }
  | {
      type: "update";
      lead: Partial<Lead> & Pick<Lead, "id">;
    };

type ConfirmationRequest = {
  confirmLabel: string;
  description: string;
  lead: Lead;
  title: string;
  tone: ConfirmationTone;
  type: LeadMutationType;
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

function formatDateParts(dateString: string | undefined | null) {
  if (!dateString) {
    return {
      date: "-",
      time: "",
    };
  }

  const date = new Date(dateString);

  return {
    date: date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function ReadStatusBadge({
  lead,
}: {
  lead: Pick<Lead, "read_at" | "trashed_at">;
}) {
  const status = getLeadReadStatus(lead);

  return (
    <span
      className={`inline-flex min-w-[5.5rem] items-center justify-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${status.className}`}
    >
      {status.label}
    </span>
  );
}

function TrashStatusBadge({ lead }: { lead: Pick<Lead, "trashed_at"> }) {
  const trashState = getLeadTrashState(lead);

  if (!trashState) {
    return null;
  }

  return (
    <span className="inline-flex min-w-[5.5rem] items-center justify-center rounded-full border border-red-200/70 bg-red-50 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-red-600 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300">
      In trash
    </span>
  );
}

function LeadActionIconButton({
  ariaLabel,
  children,
  className,
  disabled,
  onClick,
  title,
}: {
  ariaLabel: string;
  children: ReactNode;
  className: string;
  disabled?: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

function getModalHeightClass(message: string | undefined) {
  const messageLength = message?.trim().length ?? 0;

  if (messageLength > 900) {
    return "h-[min(92vh,60rem)]";
  }

  if (messageLength > 280) {
    return "h-[min(86vh,50rem)]";
  }

  return "h-[min(72vh,39rem)]";
}

function getActiveFilterTitle(activeFilter: LeadReadFilter) {
  if (activeFilter === "read") {
    return "Read requests";
  }

  if (activeFilter === "trash") {
    return "Trash";
  }

  return "Unread requests";
}

function getActiveFilterDescription(activeFilter: LeadReadFilter) {
  if (activeFilter === "read") {
    return "Revisit proposal requests you have already reviewed.";
  }

  if (activeFilter === "trash") {
    return "Restore requests when needed or let them auto-delete after 30 days.";
  }

  return "Review new proposal requests waiting for follow-up.";
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
  const [confirmationRequest, setConfirmationRequest] =
    useState<ConfirmationRequest | null>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);
  const [isMutatingLead, startLeadMutationTransition] = useTransition();
  const [pendingMutation, setPendingMutation] = useState<{
    leadId: number;
    type: LeadMutationType;
  } | null>(null);
  const modalTitleId = useId();
  const modalDescriptionId = useId();
  const [leadRows, updateLeadRows] = useOptimistic(
    leads,
    (currentLeads, action: LeadOptimisticAction) => {
      if (action.type === "delete") {
        return currentLeads.filter((lead) => lead.id !== action.leadId);
      }

      return currentLeads.map((lead) =>
        lead.id === action.lead.id ? { ...lead, ...action.lead } : lead
      );
    }
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (confirmationRequest) {
        setConfirmationRequest(null);
        return;
      }

      if (selectedLead) {
        setActionFeedback(null);
        setSelectedLead(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [confirmationRequest, selectedLead]);

  function updateLeadState(updatedLead: Partial<Lead> & Pick<Lead, "id">) {
    updateLeadRows({
      type: "update",
      lead: updatedLead,
    });
    setSelectedLead((currentLead) =>
      currentLead?.id === updatedLead.id
        ? { ...currentLead, ...updatedLead }
        : currentLead
    );
  }

  function removeLeadState(leadId: number) {
    updateLeadRows({
      leadId,
      type: "delete",
    });
    setSelectedLead((currentLead) =>
      currentLead?.id === leadId ? null : currentLead
    );
  }

  function openLead(lead: Lead) {
    setActionFeedback(null);
    setSelectedLead(lead);
  }

  function getFilterHref(filter: LeadReadFilter) {
    return filter === "unread" ? pathname : `${pathname}?filter=${filter}`;
  }

  function runLeadMutation(
    mutation: { leadId: number; type: LeadMutationType },
    task: () => Promise<void>
  ) {
    startLeadMutationTransition(async () => {
      setPendingMutation(mutation);
      setActionFeedback(null);

      try {
        await task();
      } finally {
        setPendingMutation(null);
      }
    });
  }

  function handleToggleReadStatus(lead: Pick<Lead, "id" | "read_at">) {
    const leadId = lead.id;

    if (!leadId) {
      return;
    }

    runLeadMutation({ leadId, type: "read" }, async () => {
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
        return;
      }

      toast.error(result.message);
    });
  }

  function handleTrashLead(lead: Pick<Lead, "id">) {
    const leadId = lead.id;

    if (!leadId) {
      return;
    }

    runLeadMutation({ leadId, type: "trash" }, async () => {
      const result = await trashLead(leadId);

      if (result.lead?.id) {
        updateLeadState(result.lead);
      }

      setActionFeedback({
        message: result.message,
        status: result.status,
      });

      if (result.status === "success") {
        toast.success(result.message);
        return;
      }

      toast.error(result.message);
    });
  }

  function handleRestoreLead(lead: Pick<Lead, "id">) {
    const leadId = lead.id;

    if (!leadId) {
      return;
    }

    runLeadMutation({ leadId, type: "restore" }, async () => {
      const result = await restoreLead(leadId);

      if (result.lead?.id) {
        updateLeadState(result.lead);
      }

      setActionFeedback({
        message: result.message,
        status: result.status,
      });

      if (result.status === "success") {
        toast.success(result.message);
        return;
      }

      toast.error(result.message);
    });
  }

  function handleDeleteLead(lead: Pick<Lead, "id">) {
    const leadId = lead.id;

    if (!leadId) {
      return;
    }

    runLeadMutation({ leadId, type: "delete" }, async () => {
      const result = await permanentlyDeleteLead(leadId);

      if (result.leadId) {
        removeLeadState(result.leadId);
      }

      setActionFeedback({
        message: result.message,
        status: result.status,
      });

      if (result.status === "success") {
        toast.success(result.message);
        return;
      }

      toast.error(result.message);
    });
  }

  function openConfirmationRequest(lead: Lead, type: LeadMutationType) {
    if (!lead.id) {
      return;
    }

    if (type === "trash") {
      setConfirmationRequest({
        confirmLabel: "Yes",
        description:
          "Are you sure you want to move this request to trash? You can restore it anytime within 30 days.",
        lead,
        title: "Move this request to trash?",
        tone: "warning",
        type,
      });
      return;
    }

    if (type === "restore") {
      setConfirmationRequest({
        confirmLabel: "Yes",
        description:
          "Are you sure you want to restore this request from trash and return it to your active leads?",
        lead,
        title: "Restore this request?",
        tone: "neutral",
        type,
      });
      return;
    }

    if (type === "delete") {
      setConfirmationRequest({
        confirmLabel: "Yes",
        description:
          "Are you sure you want to permanently delete this request? This action cannot be undone.",
        lead,
        title: "Delete this request permanently?",
        tone: "danger",
        type,
      });
      return;
    }

    const isRead = Boolean(lead.read_at);

    setConfirmationRequest({
      confirmLabel: "Yes",
      description: isRead
        ? "Are you sure you want to mark this request as unread so it returns to your follow-up queue?"
        : "Are you sure you want to mark this request as read after reviewing it?",
      lead,
      title: isRead ? "Mark this request as unread?" : "Mark this request as read?",
      tone: "neutral",
      type,
    });
  }

  function confirmRequestedAction() {
    if (!confirmationRequest) {
      return;
    }

    const { lead, type } = confirmationRequest;
    setConfirmationRequest(null);

    if (type === "trash") {
      handleTrashLead(lead);
      return;
    }

    if (type === "restore") {
      handleRestoreLead(lead);
      return;
    }

    if (type === "delete") {
      handleDeleteLead(lead);
      return;
    }

    handleToggleReadStatus(lead);
  }

  function isPendingAction(leadId: number | undefined, type?: LeadMutationType) {
    if (!leadId || !pendingMutation || pendingMutation.leadId !== leadId) {
      return false;
    }

    return type ? pendingMutation.type === type : true;
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

  const activeLeadRows = leadRows.filter((lead) => !isLeadTrashed(lead));
  const trashLeadCount = leadRows.length - activeLeadRows.length;
  const unreadLeadCount = activeLeadRows.filter((lead) => !lead.read_at).length;
  const readLeadCount = activeLeadRows.length - unreadLeadCount;
  const filteredLeadRows = leadRows.filter((lead) =>
    matchesLeadReadFilter(lead, activeFilter)
  );

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

  const activeFilterTitle = getActiveFilterTitle(activeFilter);
  const activeFilterDescription = getActiveFilterDescription(activeFilter);
  const selectedLeadId = selectedLead?.id;
  const selectedLeadIsRead = Boolean(selectedLead?.read_at);
  const selectedLeadIsTrashed = Boolean(selectedLead?.trashed_at);
  const selectedLeadEmail = selectedLead?.email?.trim();
  const selectedLeadReadStatus = selectedLead
    ? getLeadReadStatus(selectedLead)
    : null;
  const selectedLeadTrashState = selectedLead
    ? getLeadTrashState(selectedLead)
    : null;
  const modalHeightClass = getModalHeightClass(selectedLead?.message);

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
            {[
              {
                count: unreadLeadCount,
                filter: "unread" as const,
                label: "Unread",
              },
              {
                count: readLeadCount,
                filter: "read" as const,
                label: "Read",
              },
              {
                count: trashLeadCount,
                filter: "trash" as const,
                label: "Trash",
              },
            ].map((filterOption) => (
              <Link
                key={filterOption.filter}
                href={getFilterHref(filterOption.filter)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                  activeFilter === filterOption.filter
                    ? "bg-[var(--brand)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                {filterOption.label}
                <span
                  className={`inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[0.64rem] font-bold ${
                    activeFilter === filterOption.filter
                      ? "bg-white/16 text-white"
                      : "bg-[var(--bg-subtle)] text-[var(--text-faint)]"
                  }`}
                >
                  {filterOption.count}
                </span>
              </Link>
            ))}
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
                : activeFilter === "read"
                  ? "No read request proposals"
                  : "Trash is empty"}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {activeFilter === "unread"
                ? "New submissions will appear here until you mark them as read."
                : activeFilter === "read"
                  ? "Marked requests will appear here once you review them."
                  : "Trashed requests will stay here for 30 days before permanent deletion."}
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
                  <th className="w-[11rem] max-w-[11rem] px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                    Message
                  </th>
                  {activeFilter === "trash" && (
                    <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                      Trash Window
                    </th>
                  )}
                  <th className="min-w-[16rem] whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                    Request Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-light)]">
                {filteredLeadRows.map((lead, idx) => {
                  const leadIsTrashed = isLeadTrashed(lead);
                  const trashState = getLeadTrashState(lead);
                  const requestDateParts = formatDateParts(lead.created_at);
                  const leadId = lead.id;
                  const isTrashingLead = isPendingAction(leadId, "trash");
                  const isRestoringLead = isPendingAction(leadId, "restore");
                  const isDeletingLead = isPendingAction(leadId, "delete");

                  return (
                    <tr
                      key={lead.id ?? idx}
                      className="transition-colors duration-150 hover:bg-[var(--bg-subtle)]"
                    >
                      <td className="whitespace-nowrap px-5 py-3 font-medium text-[var(--text-primary)]">
                        {lead.name || "Unnamed request proposal"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[var(--text-secondary)]">
                        {lead.company || "-"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[var(--text-secondary)]">
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
                      <td className="whitespace-nowrap px-5 py-3 text-[var(--text-secondary)]">
                        {lead.contact_number || "-"}
                      </td>
                      <td className="w-[9rem] max-w-[9rem] px-5 py-3 text-[var(--text-muted)]">
                        {lead.message?.trim() ? (
                          <button
                            type="button"
                            onClick={() => openLead(lead)}
                            className="block max-w-[9rem] truncate rounded-md text-left text-[0.92rem] text-[var(--brand)] underline decoration-[var(--brand)]/25 underline-offset-2 transition-colors hover:decoration-[var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                            aria-label={`Read full message from ${lead.name || lead.email || "request proposal"}`}
                          >
                            {lead.message.trim()}
                          </button>
                        ) : (
                          <p className="truncate">No message provided.</p>
                        )}
                      </td>
                      {activeFilter === "trash" && (
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-[var(--text-faint)]">
                          {leadIsTrashed && trashState ? (
                            <span className="inline-flex items-center rounded-full border border-red-200/70 bg-red-50 px-2.5 py-1 font-semibold text-red-600 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300">
                              {trashState.label}
                            </span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                      )}
                      <td className="px-5 py-3 align-top text-xs text-[var(--text-faint)]">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <p className="text-[0.78rem] font-semibold leading-5 text-[var(--text-secondary)]">
                              {requestDateParts.date}
                            </p>
                            {requestDateParts.time ? (
                              <p className="text-[0.74rem] leading-5 text-[var(--text-faint)]">
                                {requestDateParts.time}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5 lg:justify-end">
                            {leadIsTrashed ? (
                              <>
                                <LeadActionIconButton
                                  ariaLabel="Restore lead"
                                  title="Restore"
                                  disabled={isMutatingLead && pendingMutation?.leadId === leadId}
                                  onClick={() => openConfirmationRequest(lead, "restore")}
                                  className="border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100 focus-visible:ring-sky-400 focus-visible:ring-offset-[var(--bg-elevated)] dark:border-sky-500/30 dark:bg-sky-950/30 dark:text-sky-300 dark:hover:bg-sky-950/50"
                                >
                                  {isRestoringLead ? (
                                    <LoaderCircle className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                                  ) : (
                                    <Undo2 className="h-4.5 w-4.5" aria-hidden="true" strokeWidth={1.8} />
                                  )}
                                </LeadActionIconButton>
                                <LeadActionIconButton
                                  ariaLabel="Delete lead permanently"
                                  title="Delete now"
                                  disabled={isMutatingLead && pendingMutation?.leadId === leadId}
                                  onClick={() => openConfirmationRequest(lead, "delete")}
                                  className="border-red-200/80 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100 focus-visible:ring-red-400 focus-visible:ring-offset-[var(--bg-elevated)] dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                                >
                                  {isDeletingLead ? (
                                    <LoaderCircle className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                                  ) : (
                                    <Trash className="h-4.5 w-4.5" aria-hidden="true" strokeWidth={1.8} />
                                  )}
                                </LeadActionIconButton>
                              </>
                            ) : (
                              <LeadActionIconButton
                                ariaLabel="Move lead to trash"
                                title="Trash"
                                disabled={isMutatingLead && pendingMutation?.leadId === leadId}
                                onClick={() => openConfirmationRequest(lead, "trash")}
                                className="border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100 focus-visible:ring-amber-400 focus-visible:ring-offset-[var(--bg-elevated)] dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
                              >
                                {isTrashingLead ? (
                                  <LoaderCircle className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                                ) : (
                                  <Trash2 className="h-4.5 w-4.5" aria-hidden="true" strokeWidth={1.8} />
                                )}
                              </LeadActionIconButton>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              if (confirmationRequest) {
                setConfirmationRequest(null);
                return;
              }

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
            className={`relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-large)] ${modalHeightClass}`}
          >
            <div className="flex justify-center border-b border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-subtle)_0%,var(--bg-elevated)_100%)] px-5 py-4 text-center sm:px-6">
              <p
                id={modalTitleId}
                className="font-heading text-base font-bold tracking-[-0.02em] text-[var(--text-primary)]"
              >
                Proposal request details
              </p>
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
                        Request Date
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-primary)]">
                        {formatDate(selectedLead.created_at)}
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
                    {selectedLeadIsTrashed ? (
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                          Trash status
                        </p>
                        <div className="mt-2 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <TrashStatusBadge lead={selectedLead} />
                            <span className="text-xs text-[var(--text-faint)]">
                              {selectedLeadTrashState?.label || "Pending cleanup"}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-faint)]">
                            Moved to trash {formatDate(selectedLead.trashed_at)}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </aside>

                <section className="min-w-0 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow-card)] lg:flex lg:min-h-0 lg:flex-col">
                  <div className="border-b border-[var(--border-light)] pb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                      Message
                    </p>
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
                    {selectedLeadIsTrashed
                      ? "Restore this request when you still need it, or delete it permanently."
                      : "Review the request, then update its read status when needed."}
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
                      if (confirmationRequest) {
                        setConfirmationRequest(null);
                        return;
                      }

                      setActionFeedback(null);
                      setSelectedLead(null);
                    }}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)]"
                  >
                    Close
                  </button>
                  {selectedLeadIsTrashed ? (
                    <>
                      <button
                        type="button"
                        disabled={isMutatingLead && pendingMutation?.leadId === selectedLeadId}
                        onClick={() => {
                          if (selectedLead) {
                            openConfirmationRequest(selectedLead, "restore");
                          }
                        }}
                        className="inline-flex h-10 min-w-[10rem] items-center justify-center rounded-lg border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-500/30 dark:bg-sky-950/30 dark:text-sky-300 dark:hover:bg-sky-950/50"
                      >
                        {isPendingAction(selectedLeadId, "restore")
                          ? "Restoring..."
                          : "Restore"}
                      </button>
                      <button
                        type="button"
                        disabled={isMutatingLead && pendingMutation?.leadId === selectedLeadId}
                        onClick={() => {
                          if (selectedLead) {
                            openConfirmationRequest(selectedLead, "delete");
                          }
                        }}
                        className="inline-flex h-10 min-w-[11rem] items-center justify-center rounded-lg border border-red-200/80 bg-red-50 px-4 text-sm font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                      >
                        {isPendingAction(selectedLeadId, "delete")
                          ? "Deleting..."
                          : "Delete permanently"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={isMutatingLead && pendingMutation?.leadId === selectedLeadId}
                      onClick={() => {
                        if (selectedLead) {
                          openConfirmationRequest(selectedLead, "read");
                        }
                      }}
                      className={`inline-flex h-10 min-w-[10.5rem] items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)] disabled:cursor-not-allowed disabled:opacity-60 ${
                        selectedLeadIsRead
                          ? "border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                          : "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
                      }`}
                    >
                      {isPendingAction(selectedLeadId, "read")
                        ? "Updating..."
                        : selectedLeadIsRead
                          ? "Mark as unread"
                          : "Mark as read"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {confirmationRequest && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6 sm:px-6">
          <button
            type="button"
            aria-label="Close confirmation"
            onClick={() => setConfirmationRequest(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[3px]"
          />
          <section
            role="dialog"
            aria-modal="true"
            className="relative flex w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-large)]"
          >
            <div className="border-b border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-subtle)_0%,var(--bg-elevated)_100%)] px-5 py-4 text-center sm:px-6">
              <p className="font-heading text-base font-bold tracking-[-0.02em] text-[var(--text-primary)]">
                {confirmationRequest.title}
              </p>
            </div>

            <div className="px-5 py-5 sm:px-6">
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                {confirmationRequest.description}
              </p>
            </div>

            <div className="border-t border-[var(--border-light)] bg-[var(--bg-elevated-muted)] px-5 py-4 sm:px-6">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmationRequest(null)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)]"
                >
                  No
                </button>
                <button
                  type="button"
                  disabled={
                    isMutatingLead &&
                    pendingMutation?.leadId === confirmationRequest.lead.id &&
                    pendingMutation?.type === confirmationRequest.type
                  }
                  onClick={confirmRequestedAction}
                  className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)] disabled:cursor-not-allowed disabled:opacity-60 ${
                    confirmationRequest.tone === "danger"
                      ? "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400"
                      : confirmationRequest.tone === "warning"
                        ? "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-400"
                        : "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)] focus-visible:ring-[var(--brand)]"
                  }`}
                >
                  {isMutatingLead &&
                  pendingMutation?.leadId === confirmationRequest.lead.id &&
                  pendingMutation?.type === confirmationRequest.type
                    ? "Please wait..."
                    : confirmationRequest.confirmLabel}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
