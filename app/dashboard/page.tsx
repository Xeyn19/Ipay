import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/app/lib/supabase-server";
import { getAutoReplyStatus } from "@/app/dashboard/auto-reply-status";
import { DashboardCharts } from "./dashboard-charts";

export const metadata: Metadata = {
  title: "Overview | iPay Dashboard",
  description: "Review request proposal analytics and recent submissions.",
};

type Lead = {
  auto_reply_last_error?: string | null;
  auto_reply_sent_at?: string | null;
  auto_reply_status?: string | null;
  company?: string;
  contact_number?: string;
  created_at?: string;
  email?: string;
  id?: number;
  message?: string;
  name?: string;
};

type SummaryCard = {
  icon: "failed" | "ready" | "requests" | "sent";
  label: string;
  tone: string;
  value: number;
};

function formatDate(dateString: string | undefined) {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

function getMetricCards(leads: Lead[]): SummaryCard[] {
  return [
    {
      icon: "requests",
      label: "Total Requests",
      tone: "brand",
      value: leads.length,
    },
  ];
}

function getAutoReplyBreakdownCards(
  leads: Lead[],
  autoReplyEnabled: boolean
): SummaryCard[] {
  const statusCounts = leads.reduce(
    (counts, lead) => {
      const status = getAutoReplyStatus(lead, autoReplyEnabled).label;

      if (status === "Sent") counts.sent += 1;
      if (status === "Failed") counts.failed += 1;
      if (status === "Ready") counts.ready += 1;

      return counts;
    },
    {
      failed: 0,
      ready: 0,
      sent: 0,
    }
  );

  return [
    {
      icon: "sent",
      label: "Auto-Replies Sent",
      tone: "green",
      value: statusCounts.sent,
    },
    {
      icon: "failed",
      label: "Auto-Replies Failed",
      tone: "red",
      value: statusCounts.failed,
    },
    {
      icon: "ready",
      label: "Auto-Replies Ready to Send",
      tone: "gold",
      value: statusCounts.ready,
    },
  ];
}

function MetricIcon({
  icon,
  tone,
}: {
  icon: "failed" | "ready" | "requests" | "sent";
  tone: string;
}) {
  const colorClass =
    tone === "green"
      ? "bg-[var(--tone-green-soft)] text-[var(--tone-green)]"
      : tone === "red"
        ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300"
      : tone === "gold"
        ? "bg-[var(--tone-gold-soft)] text-[var(--tone-gold)]"
        : tone === "blue"
          ? "bg-[var(--tone-blue-soft)] text-[var(--tone-blue)]"
          : "bg-[var(--brand-pale)] text-[var(--brand)]";

  const iconPath =
    icon === "sent" ? (
      <>
        <path d="M17 6l-7.5 7.5L6 10" />
        <path d="M17 10v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h8" />
      </>
    ) : icon === "failed" ? (
      <>
        <path d="M10 3l8 14H2L10 3z" />
        <path d="M10 8v4" />
        <path d="M10 15h.01" />
      </>
    ) : icon === "ready" ? (
      <>
        <path d="M4 6h12a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
        <path d="M2 8l8 5 8-5" />
        <path d="M14 4h4" />
        <path d="M16 2v4" />
      </>
    ) : (
      <>
        <path d="M4 14.5V7.75A2.75 2.75 0 016.75 5h6.5A2.75 2.75 0 0116 7.75v4.5A2.75 2.75 0 0113.25 15H8l-4 2.5v-3z" />
        <path d="M7.5 9h5M7.5 12h3.25" />
      </>
    );

  return (
    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        {iconPath}
      </svg>
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const autoReplyEnabled = process.env.AUTO_REPLY_ENABLED !== "false";

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  const leadRows = (leads ?? []) as Lead[];
  const metricCards = getMetricCards(leadRows);
  const autoReplyBreakdownCards = getAutoReplyBreakdownCards(
    leadRows,
    autoReplyEnabled
  );
  const summaryCards = [...metricCards, ...autoReplyBreakdownCards];
  const requestDates = leadRows
    .map((lead) => lead.created_at)
    .filter((date): date is string => Boolean(date));
  const recentLeads = leadRows.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
            Dashboard
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Request Proposal Analytics
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Review request proposal activity and auto-reply readiness.
          </p>
        </div>
        <Link
          href="/dashboard/leads"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
        >
          View all requests
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-300/40 bg-red-50/60 px-6 py-10 text-center dark:border-red-500/20 dark:bg-red-950/30">
          <svg viewBox="0 0 20 20" fill="currentColor" className="mx-auto mb-3 h-8 w-8 text-red-400" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            Failed to load analytics
          </p>
          <p className="mt-1 text-xs text-red-500/80 dark:text-red-400/60">
            {error.message}
          </p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-4">
            {summaryCards.map((metric) => (
              <article
                key={metric.label}
                className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                      {metric.label}
                    </p>
                    <p className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                      {metric.value}
                    </p>
                  </div>
                  <MetricIcon icon={metric.icon} tone={metric.tone} />
                </div>
              </article>
            ))}
          </section>

          <DashboardCharts requestDates={requestDates} />

          <section className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-2 border-b border-[var(--border-light)] bg-[var(--bg-subtle)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                  Recent Request Proposals
                </h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Latest request proposals submitted through the website.
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Latest {recentLeads.length}
              </span>
            </div>

            {recentLeads.length === 0 ? (
              <div className="px-6 py-14 text-center">
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
                  Analytics will update once visitors submit proposal requests.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-light)]">
                {recentLeads.map((lead, index) => (
                  <div
                    key={lead.id ?? `${lead.email ?? "lead"}-${index}`}
                    className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                        {lead.name || "Unnamed request proposal"}
                      </p>
                      <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                        {lead.company || lead.email || "No company or email provided"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <AutoReplyBadge
                        autoReplyEnabled={autoReplyEnabled}
                        lead={lead}
                      />
                      <p className="text-xs font-medium text-[var(--text-faint)] sm:text-right">
                        {formatDate(lead.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
