const TRASH_RETENTION_DAYS = 30;
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export type LeadReadFilter = "read" | "trash" | "unread";

export type LeadReadRecord = {
  read_at?: string | null;
  trashed_at?: string | null;
};

export type LeadReadStatus = {
  className: string;
  isRead: boolean;
  label: "Read" | "Unread";
};

export function isLeadRead(lead: LeadReadRecord) {
  return Boolean(lead.read_at);
}

export function isLeadTrashed(lead: LeadReadRecord) {
  return Boolean(lead.trashed_at);
}

export function normalizeLeadReadFilter(
  value: string | string[] | undefined
): LeadReadFilter {
  const filter = Array.isArray(value) ? value[0] : value;
  return filter === "read" || filter === "trash" ? filter : "unread";
}

export function matchesLeadReadFilter(
  lead: LeadReadRecord,
  filter: LeadReadFilter
) {
  if (filter === "trash") {
    return isLeadTrashed(lead);
  }

  if (isLeadTrashed(lead)) {
    return false;
  }

  return filter === "read" ? isLeadRead(lead) : !isLeadRead(lead);
}

export function getLeadReadStatus(lead: LeadReadRecord): LeadReadStatus {
  if (isLeadRead(lead)) {
    return {
      className:
        "border-[var(--border-light)] bg-[var(--bg-subtle)] text-[var(--text-faint)]",
      isRead: true,
      label: "Read",
    };
  }

  return {
    className:
      "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand-dark)]",
    isRead: false,
    label: "Unread",
  };
}

export function getLeadTrashState(lead: LeadReadRecord, now = new Date()) {
  if (!lead.trashed_at) {
    return null;
  }

  const trashedAt = new Date(lead.trashed_at);
  const expiresAt = new Date(
    trashedAt.getTime() + TRASH_RETENTION_DAYS * MILLISECONDS_PER_DAY
  );
  const millisecondsRemaining = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.max(
    0,
    Math.ceil(millisecondsRemaining / MILLISECONDS_PER_DAY)
  );

  return {
    daysRemaining,
    expiresAt,
    label:
      daysRemaining <= 0
        ? "Deletes today"
        : daysRemaining === 1
          ? "1 day left"
          : `${daysRemaining} days left`,
  };
}
