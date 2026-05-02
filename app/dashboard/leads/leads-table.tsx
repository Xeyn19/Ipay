'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  Check,
  LoaderCircle,
  Reply,
  Search,
  Trash,
  Undo2,
  X,
} from "lucide-react";
import {
  useDeferredValue,
  useEffect,
  useId,
  useOptimistic,
  useRef,
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
  archiveLead,
  bulkArchiveLeads,
  bulkPermanentlyDeleteLeads,
  bulkRestoreLeads,
  markLeadAsRead,
  markLeadAsUnread,
  restoreLead,
  permanentlyDeleteLead,
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

type LeadMutationType =
  | "archive"
  | "delete"
  | "mark-read"
  | "mark-unread"
  | "restore";
type BulkMutationType = "bulk-archive" | "bulk-delete" | "bulk-restore";
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
  lead?: Lead;
  leadIds?: number[];
  title: string;
  tone: ConfirmationTone;
  type: BulkMutationType | LeadMutationType;
};

const leadToastOptions = {
  position: "top-right" as const,
};

function formatRequestCount(count: number) {
  return `${count} request${count === 1 ? "" : "s"}`;
}

function matchesLeadSearchQuery(lead: Lead, query: string) {
  if (!query) {
    return true;
  }

  const searchableValues = [
    lead.name,
    lead.company,
    lead.email,
    lead.contact_number,
    lead.message,
  ];

  return searchableValues.some((value) =>
    value?.toLowerCase().includes(query)
  );
}

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
      Archived
    </span>
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
    return "Archive";
  }

  return "Unread requests";
}

function getActiveFilterDescription(activeFilter: LeadReadFilter) {
  if (activeFilter === "read") {
    return "Revisit proposal requests you have already reviewed.";
  }

  if (activeFilter === "trash") {
    return "Restore archived requests when needed or delete them permanently.";
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
  const selectAllRef = useRef<HTMLInputElement>(null);
  const visibleLeadIdsRef = useRef<number[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [confirmationRequest, setConfirmationRequest] =
    useState<ConfirmationRequest | null>(null);
  const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [isMutatingLead, startLeadMutationTransition] = useTransition();
  const [isMutatingBulkAction, startBulkActionTransition] = useTransition();
  const [pendingMutation, setPendingMutation] = useState<{
    leadId: number;
    type: LeadMutationType;
  } | null>(null);
  const [pendingBulkAction, setPendingBulkAction] = useState<{
    leadIds: number[];
    type: BulkMutationType;
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
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearchQuery = deferredSearchQuery.trim().toLowerCase();

  const activeLeadRows = leadRows.filter((lead) => !isLeadTrashed(lead));
  const trashLeadCount = leadRows.length - activeLeadRows.length;
  const unreadLeadCount = activeLeadRows.filter((lead) => !lead.read_at).length;
  const readLeadCount = activeLeadRows.length - unreadLeadCount;
  const filteredLeadRows = leadRows
    .filter((lead) => matchesLeadReadFilter(lead, activeFilter))
    .filter((lead) => matchesLeadSearchQuery(lead, normalizedSearchQuery));
  const visibleLeadIds = filteredLeadRows
    .map((lead) => lead.id)
    .filter((leadId): leadId is number => Number.isInteger(leadId));
  visibleLeadIdsRef.current = visibleLeadIds;
  const visibleLeadIdsKey = visibleLeadIds.join(",");
  const selectedVisibleLeadIds = selectedLeadIds.filter((leadId) =>
    visibleLeadIds.includes(leadId)
  );
  const areAllVisibleSelected =
    visibleLeadIds.length > 0 &&
    selectedVisibleLeadIds.length === visibleLeadIds.length;
  const hasSelectedVisibleLeads = selectedVisibleLeadIds.length > 0;
  const hasSomeVisibleSelected =
    hasSelectedVisibleLeads && !areAllVisibleSelected;
  const isAnyMutationPending = isMutatingLead || isMutatingBulkAction;

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

  useEffect(() => {
    setSelectedLeadIds((currentIds) => {
      const nextIds = currentIds.filter((leadId) =>
        visibleLeadIdsRef.current.includes(leadId)
      );

      return nextIds.length === currentIds.length &&
        nextIds.every((leadId, index) => leadId === currentIds[index])
        ? currentIds
        : nextIds;
    });
  }, [activeFilter, visibleLeadIdsKey]);

  useEffect(() => {
    if (!selectAllRef.current) {
      return;
    }

    selectAllRef.current.indeterminate = hasSomeVisibleSelected;
  }, [hasSomeVisibleSelected]);

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
    setSelectedLeadIds((currentIds) =>
      currentIds.filter((currentLeadId) => currentLeadId !== leadId)
    );
    setSelectedLead((currentLead) =>
      currentLead?.id === leadId ? null : currentLead
    );
  }

  function updateMultipleLeadStates(
    updatedLeads: Array<Partial<Lead> & Pick<Lead, "id">>
  ) {
    updatedLeads.forEach((updatedLead) => {
      updateLeadState(updatedLead);
    });
  }

  function removeMultipleLeadStates(leadIds: number[]) {
    leadIds.forEach((leadId) => {
      removeLeadState(leadId);
    });
  }

  function clearSelectedLeadIds(leadIds: number[]) {
    if (leadIds.length === 0) {
      return;
    }

    setSelectedLeadIds((currentIds) =>
      currentIds.filter((leadId) => !leadIds.includes(leadId))
    );
  }

  function toggleLeadSelection(leadId: number) {
    setSelectedLeadIds((currentIds) =>
      currentIds.includes(leadId)
        ? currentIds.filter((currentLeadId) => currentLeadId !== leadId)
        : [...currentIds, leadId]
    );
  }

  function toggleSelectAllVisible() {
    setSelectedLeadIds((currentIds) => {
      if (areAllVisibleSelected) {
        return currentIds.filter((leadId) => !visibleLeadIds.includes(leadId));
      }

      return [...new Set([...currentIds, ...visibleLeadIds])];
    });
  }

  function openLead(lead: Lead) {
    setActionFeedback(null);
    setSelectedLead(lead);

    if (!lead.id || lead.read_at || lead.trashed_at) {
      return;
    }

    runLeadMutation({ leadId: lead.id, type: "mark-read" }, async () => {
      const result = await markLeadAsRead(lead.id as number);

      if (result.lead?.id) {
        updateLeadState(result.lead);
      }

      if (result.status === "error") {
        setActionFeedback({
          message: result.message,
          status: result.status,
        });
        toast.error(result.message, leadToastOptions);
      }
    });
  }

  function closeLeadModal() {
    if (confirmationRequest) {
      setConfirmationRequest(null);
      return;
    }

    setActionFeedback(null);
    setSelectedLead(null);
  }

  function getFilterHref(filter: LeadReadFilter) {
    return filter === "unread" ? pathname : `${pathname}?filter=${filter}`;
  }

  function getReplyHref(leadId: number) {
    return activeFilter === "unread"
      ? `/dashboard/leads/${leadId}/reply`
      : `/dashboard/leads/${leadId}/reply?filter=${activeFilter}`;
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

  function runBulkMutation(
    mutation: { leadIds: number[]; type: BulkMutationType },
    task: () => Promise<void>
  ) {
    startBulkActionTransition(async () => {
      setPendingBulkAction(mutation);
      setActionFeedback(null);

      try {
        await task();
      } finally {
        setPendingBulkAction(null);
      }
    });
  }

  function handleMarkLeadAsUnread(lead: Pick<Lead, "id">) {
    const leadId = lead.id;

    if (!leadId) {
      return;
    }

    runLeadMutation({ leadId, type: "mark-unread" }, async () => {
      const result = await markLeadAsUnread(leadId);

      if (result.lead?.id) {
        updateLeadState(result.lead);
      }

      setActionFeedback({
        message: result.message,
        status: result.status,
      });

      if (result.status === "success") {
        toast.success(result.message, leadToastOptions);
        return;
      }

      toast.error(result.message, leadToastOptions);
    });
  }

  function handleArchiveLead(lead: Pick<Lead, "id">) {
    const leadId = lead.id;

    if (!leadId) {
      return;
    }

    runLeadMutation({ leadId, type: "archive" }, async () => {
      const result = await archiveLead(leadId);

      if (result.lead?.id) {
        updateLeadState(result.lead);
      }

      setActionFeedback({
        message: result.message,
        status: result.status,
      });

      if (result.status === "success") {
        toast.success(result.message, leadToastOptions);
        return;
      }

      toast.error(result.message, leadToastOptions);
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
        toast.success(result.message, leadToastOptions);
        return;
      }

      toast.error(result.message, leadToastOptions);
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
        toast.success(result.message, leadToastOptions);
        return;
      }

      toast.error(result.message, leadToastOptions);
    });
  }

  function handleBulkArchiveLeads(leadIds: number[]) {
    if (leadIds.length === 0) {
      return;
    }

    runBulkMutation({ leadIds, type: "bulk-archive" }, async () => {
      const result = await bulkArchiveLeads(leadIds);

      if (result.updatedLeads?.length) {
        updateMultipleLeadStates(result.updatedLeads);
      }

      if (result.status === "success") {
        clearSelectedLeadIds(leadIds);
        toast.success(result.message, leadToastOptions);
        return;
      }

      toast.error(result.message, leadToastOptions);
    });
  }

  function handleBulkRestoreLeads(leadIds: number[]) {
    if (leadIds.length === 0) {
      return;
    }

    runBulkMutation({ leadIds, type: "bulk-restore" }, async () => {
      const result = await bulkRestoreLeads(leadIds);

      if (result.updatedLeads?.length) {
        updateMultipleLeadStates(result.updatedLeads);
      }

      if (result.status === "success") {
        clearSelectedLeadIds(leadIds);
        toast.success(result.message, leadToastOptions);
        return;
      }

      toast.error(result.message, leadToastOptions);
    });
  }

  function handleBulkDeleteLeads(leadIds: number[]) {
    if (leadIds.length === 0) {
      return;
    }

    runBulkMutation({ leadIds, type: "bulk-delete" }, async () => {
      const result = await bulkPermanentlyDeleteLeads(leadIds);

      if (result.deletedLeadIds?.length) {
        removeMultipleLeadStates(result.deletedLeadIds);
      }

      if (result.status === "success") {
        clearSelectedLeadIds(leadIds);
        toast.success(result.message, leadToastOptions);
        return;
      }

      toast.error(result.message, leadToastOptions);
    });
  }

  function openConfirmationRequest(lead: Lead, type: LeadMutationType) {
    if (!lead.id) {
      return;
    }

    if (type === "archive") {
      setConfirmationRequest({
        confirmLabel: "Archive",
        description:
          "Are you sure you want to archive this request? You can restore it anytime from the archive view.",
        lead,
        title: "Archive this request?",
        tone: "warning",
        type,
      });
      return;
    }

    if (type === "restore") {
      setConfirmationRequest({
        confirmLabel: "Restore",
        description:
          "Are you sure you want to restore this request from the archive and return it to your active leads?",
        lead,
        title: "Restore this request?",
        tone: "neutral",
        type,
      });
      return;
    }

    if (type === "delete") {
      setConfirmationRequest({
        confirmLabel: "Delete permanently",
        description:
          "Are you sure you want to permanently delete this request? This action cannot be undone.",
        lead,
        title: "Delete this request permanently?",
        tone: "danger",
        type,
      });
      return;
    }

    setConfirmationRequest({
      confirmLabel: "Mark as unread",
      description:
        "Are you sure you want to mark this request as unread so it returns to your follow-up queue?",
      lead,
      title: "Mark this request as unread?",
      tone: "neutral",
      type,
    });
  }

  function openBulkConfirmationRequest(type: BulkMutationType) {
    if (!selectedVisibleLeadIds.length) {
      return;
    }

    const requestCount = formatRequestCount(selectedVisibleLeadIds.length);

    if (type === "bulk-archive") {
      setConfirmationRequest({
        confirmLabel: "Archive selected",
        description: `Archive ${requestCount}? You can restore them anytime from the archive view.`,
        leadIds: selectedVisibleLeadIds,
        title: `Archive ${requestCount}?`,
        tone: "warning",
        type,
      });
      return;
    }

    if (type === "bulk-restore") {
      setConfirmationRequest({
        confirmLabel: "Restore selected",
        description: `Restore ${requestCount} and return them to your active leads?`,
        leadIds: selectedVisibleLeadIds,
        title: `Restore ${requestCount}?`,
        tone: "neutral",
        type,
      });
      return;
    }

    setConfirmationRequest({
      confirmLabel: "Delete selected",
      description: `Permanently delete ${requestCount}? This action cannot be undone.`,
      leadIds: selectedVisibleLeadIds,
      title: `Delete ${requestCount} permanently?`,
      tone: "danger",
      type,
    });
  }

  function confirmRequestedAction() {
    if (!confirmationRequest) {
      return;
    }

    const { lead, leadIds = [], type } = confirmationRequest;
    setConfirmationRequest(null);

    if (type === "bulk-archive") {
      handleBulkArchiveLeads(leadIds);
      return;
    }

    if (type === "bulk-restore") {
      handleBulkRestoreLeads(leadIds);
      return;
    }

    if (type === "bulk-delete") {
      handleBulkDeleteLeads(leadIds);
      return;
    }

    if (!lead) {
      return;
    }

    if (type === "archive") {
      handleArchiveLead(lead);
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

    handleMarkLeadAsUnread(lead);
  }

  function isPendingAction(leadId: number | undefined, type?: LeadMutationType) {
    if (!leadId || !pendingMutation || pendingMutation.leadId !== leadId) {
      return false;
    }

    return type ? pendingMutation.type === type : true;
  }

  function isPendingBulk(type: BulkMutationType) {
    return Boolean(
      pendingBulkAction &&
        pendingBulkAction.type === type &&
        isMutatingBulkAction
    );
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

  const activeFilterTitle = getActiveFilterTitle(activeFilter);
  const activeFilterDescription = getActiveFilterDescription(activeFilter);
  const selectedLeadId = selectedLead?.id;
  const selectedLeadIsRead = Boolean(selectedLead?.read_at);
  const selectedLeadIsTrashed = Boolean(selectedLead?.trashed_at);
  const selectedLeadEmail = selectedLead?.email?.trim();
  const selectedLeadCanReply = Boolean(selectedLeadEmail);
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
                label: "Archive",
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

        <div className="border-b border-[var(--border-light)] bg-[var(--bg-elevated-muted)] px-5 py-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <label className="relative block w-full">
              <span className="sr-only">Search requests</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--text-faint)]"
                aria-hidden="true"
                strokeWidth={1.9}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, company, email, contact number, or message"
                className="h-11 w-full rounded-xl border border-[var(--border-light)] bg-[var(--bg-elevated)] pl-10 pr-11 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-faint)] focus:border-[var(--border-orange)] focus:ring-2 focus:ring-[rgba(241,122,30,0.18)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-faint)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
                </button>
              )}
            </label>
            <p className="text-sm text-[var(--text-faint)] lg:justify-self-end">
              {filteredLeadRows.length} matching {filteredLeadRows.length === 1 ? "request" : "requests"}
            </p>
          </div>
        </div>

        {hasSelectedVisibleLeads && (
          <div className="border-b border-[var(--border-light)] bg-[var(--bg-elevated-muted)] px-5 py-3">
            <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-[var(--brand-pale)] px-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--brand-dark)]">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={2.2} />
                  {formatRequestCount(selectedVisibleLeadIds.length)} selected
                </span>
                <button
                  type="button"
                  disabled={isAnyMutationPending}
                  onClick={() => clearSelectedLeadIds(selectedVisibleLeadIds)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-faint)] transition-colors hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
                  Clear selection
                </button>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              {activeFilter === "trash" ? (
                <>
                  <button
                    type="button"
                    disabled={isAnyMutationPending}
                    onClick={() => openBulkConfirmationRequest("bulk-restore")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPendingBulk("bulk-restore") ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Undo2 className="h-4 w-4" aria-hidden="true" strokeWidth={1.9} />
                    )}
                    {isPendingBulk("bulk-restore") ? "Restoring..." : "Restore selected"}
                  </button>
                  <button
                    type="button"
                    disabled={isAnyMutationPending}
                    onClick={() => openBulkConfirmationRequest("bulk-delete")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200/80 bg-transparent px-4 text-sm font-semibold text-red-500 transition-colors hover:border-red-300 hover:bg-red-50/70 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-950/30"
                  >
                    {isPendingBulk("bulk-delete") ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash className="h-4 w-4" aria-hidden="true" strokeWidth={1.9} />
                    )}
                    {isPendingBulk("bulk-delete")
                      ? "Deleting..."
                      : "Delete selected"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={isAnyMutationPending}
                  onClick={() => openBulkConfirmationRequest("bulk-archive")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPendingBulk("bulk-archive") ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Archive className="h-4 w-4" aria-hidden="true" strokeWidth={1.9} />
                  )}
                  {isPendingBulk("bulk-archive")
                    ? "Archiving..."
                    : "Archive selected"}
                </button>
              )}
              </div>
            </div>
          </div>
        )}

        {filteredLeadRows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[var(--text-faint)]" aria-hidden="true">
                <path d="M4 6h16v12H4z" />
                <path d="M4 8l8 5 8-5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {normalizedSearchQuery
                ? "No matching request proposals"
                : activeFilter === "unread"
                  ? "No unread request proposals"
                  : activeFilter === "read"
                    ? "No read request proposals"
                    : "Archive is empty"}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {normalizedSearchQuery
                ? "Try a different keyword or clear the current search."
                : activeFilter === "unread"
                  ? "New submissions will appear here until you mark them as read."
                  : activeFilter === "read"
                    ? "Marked requests will appear here once you review them."
                    : "Archived requests will remain here until you restore or permanently delete them."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[72rem] w-full table-auto text-left text-sm" id="leads-table">
              <thead>
                <tr className="border-b border-[var(--border-light)] bg-[var(--bg-subtle)]">
                  <th className="w-14 px-5 py-3">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={areAllVisibleSelected}
                      disabled={isAnyMutationPending}
                      onChange={toggleSelectAllVisible}
                      aria-label="Select all visible leads"
                      className="h-4 w-4 rounded border-[var(--border-medium)] text-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40 focus:ring-offset-1 focus:ring-offset-[var(--bg-subtle)]"
                    />
                  </th>
                  <th className="w-[11rem] whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                    Name
                  </th>
                  <th className="w-[10rem] whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                    Company
                  </th>
                  <th className="w-[13rem] whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                    Email
                  </th>
                  <th className="w-[9rem] whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                    Contact Number
                  </th>
                  <th className="min-w-[22rem] px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                    Message
                  </th>
                  {activeFilter === "trash" && (
                    <th className="w-[9rem] whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                      Archive Window
                    </th>
                  )}
                  <th className="w-[9rem] whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
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
                  const isSelected = Boolean(leadId && selectedLeadIds.includes(leadId));

                  return (
                    <tr
                      key={lead.id ?? idx}
                      className="transition-colors duration-150 hover:bg-[var(--bg-subtle)]"
                    >
                      <td className="px-5 py-3">
                        {leadId ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isAnyMutationPending}
                            onChange={() => toggleLeadSelection(leadId)}
                            aria-label={`Select ${lead.name || lead.email || "request proposal"}`}
                            className="h-4 w-4 rounded border-[var(--border-medium)] text-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/40 focus:ring-offset-1 focus:ring-offset-[var(--bg-elevated)]"
                          />
                        ) : null}
                      </td>
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
                      <td className="px-5 py-3 text-[var(--text-muted)]">
                        {lead.message?.trim() ? (
                          <button
                            type="button"
                            onClick={() => openLead(lead)}
                            className="block w-full truncate rounded-md text-left text-[0.92rem] text-[var(--brand)] underline decoration-[var(--brand)]/25 underline-offset-2 transition-colors hover:decoration-[var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
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
            onClick={closeLeadModal}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={modalTitleId}
            aria-describedby={modalDescriptionId}
            className={`relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-large)] ${modalHeightClass}`}
          >
            <div className="relative border-b border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-subtle)_0%,var(--bg-elevated)_100%)] px-5 py-4 text-center sm:px-6">
              <button
                type="button"
                aria-label="Close request details"
                onClick={closeLeadModal}
                className="absolute right-5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-faint)] transition-colors hover:border-[var(--border-orange)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] sm:right-6"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
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
                          Archive status
                        </p>
                        <div className="mt-2 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <TrashStatusBadge lead={selectedLead} />
                            <span className="text-xs text-[var(--text-faint)]">
                              {selectedLeadTrashState?.label || "Pending cleanup"}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-faint)]">
                            Archived {formatDate(selectedLead.trashed_at)}
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
                      : "Opening a message marks it as read automatically. You can mark it as unread again if it still needs follow-up."}
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
                  {selectedLeadId && selectedLeadCanReply ? (
                    <Link
                      href={getReplyHref(selectedLeadId)}
                      className="inline-flex h-10 min-w-[9.75rem] items-center justify-center gap-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)]"
                    >
                      <Reply className="h-4 w-4" aria-hidden="true" />
                      Reply
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-10 min-w-[9.75rem] items-center justify-center gap-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-semibold text-[var(--text-secondary)] opacity-60"
                    >
                      <Reply className="h-4 w-4" aria-hidden="true" />
                      Reply
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closeLeadModal}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)]"
                  >
                    Close
                  </button>
                  {selectedLeadIsTrashed ? (
                    <>
                      <button
                        type="button"
                        disabled={isAnyMutationPending}
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
                        disabled={isAnyMutationPending}
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
                  ) : selectedLeadIsRead ? (
                    <button
                      type="button"
                      disabled={isAnyMutationPending}
                      onClick={() => {
                        if (selectedLead) {
                          openConfirmationRequest(selectedLead, "mark-unread");
                        }
                      }}
                      className="inline-flex h-10 min-w-[10.5rem] items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPendingAction(selectedLeadId, "mark-unread")
                        ? "Updating..."
                        : "Mark as unread"}
                    </button>
                  ) : null}
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
                    ("lead" in confirmationRequest &&
                      Boolean(
                        confirmationRequest.lead?.id &&
                          isMutatingLead &&
                          pendingMutation?.leadId === confirmationRequest.lead.id &&
                          pendingMutation?.type === confirmationRequest.type
                      )) ||
                    ("leadIds" in confirmationRequest &&
                      Boolean(
                        confirmationRequest.leadIds?.length &&
                          isMutatingBulkAction &&
                          pendingBulkAction?.type === confirmationRequest.type
                      ))
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
                  {(("lead" in confirmationRequest &&
                    Boolean(
                      confirmationRequest.lead?.id &&
                        isMutatingLead &&
                        pendingMutation?.leadId === confirmationRequest.lead.id &&
                        pendingMutation?.type === confirmationRequest.type
                    )) ||
                    ("leadIds" in confirmationRequest &&
                      Boolean(
                        confirmationRequest.leadIds?.length &&
                          isMutatingBulkAction &&
                          pendingBulkAction?.type === confirmationRequest.type
                      )))
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
