export type LeadReadFilter = "read" | "unread";

export type LeadReadRecord = {
  read_at?: string | null;
};

export type LeadReadStatus = {
  className: string;
  isRead: boolean;
  label: "Read" | "Unread";
};

export function isLeadRead(lead: LeadReadRecord) {
  return Boolean(lead.read_at);
}

export function normalizeLeadReadFilter(
  value: string | string[] | undefined
): LeadReadFilter {
  const filter = Array.isArray(value) ? value[0] : value;
  return filter === "read" ? "read" : "unread";
}

export function matchesLeadReadFilter(
  lead: LeadReadRecord,
  filter: LeadReadFilter
) {
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
