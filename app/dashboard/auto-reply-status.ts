export type AutoReplyLead = {
  auto_reply_sent_at?: string | null;
  auto_reply_status?: string | null;
  email?: string | null;
};

export type AutoReplyStatus = {
  className: string;
  label: "Disabled" | "Failed" | "No email" | "Ready" | "Sending" | "Sent";
};

export function getAutoReplyStatus(
  lead: AutoReplyLead,
  autoReplyEnabled: boolean
): AutoReplyStatus {
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
