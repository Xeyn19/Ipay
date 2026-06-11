import type { Metadata } from "next";
import Link from "next/link";
import {
  getLeadReadStatus,
  isLeadRead,
  isLeadTrashed,
} from "@/app/dashboard/lead-read-status";
import { createClient } from "@/app/lib/supabase-server";
import { DashboardCharts } from "./dashboard-charts";

export const metadata: Metadata = {
  title: "Overview | iPay Dashboard",
  description:
    "Review request proposal activity, read status, and active follow-ups.",
};

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

type NewsPostStatus = "archived" | "draft" | "published";

type NewsPost = {
  created_at?: string;
  id?: string;
  publish_date?: string;
  slug?: string;
  status?: NewsPostStatus;
  title?: string;
};

type SummaryCard = {
  icon: "read" | "requests" | "trash" | "unread";
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

function NewsStatusBadge({ status }: { status: NewsPost["status"] }) {
  const badge =
    status === "published"
      ? {
          className:
            "border-[var(--tone-green-soft)] bg-[var(--tone-green-soft)] text-[var(--tone-green)]",
          label: "Published",
        }
      : status === "draft"
        ? {
            className:
              "border-[var(--tone-gold-soft)] bg-[var(--tone-gold-soft)] text-[var(--tone-gold)]",
            label: "Draft",
          }
        : {
            className:
              "border-red-200 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-300",
            label: "Archived",
          };

  return (
    <span
      className={`inline-flex min-w-[5.5rem] items-center justify-center rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}

function getSummaryCards(leads: Lead[]): SummaryCard[] {
  const unreadCount = leads.filter((lead) => !isLeadRead(lead)).length;
  const readCount = leads.length - unreadCount;
  const trashedCount = leads.filter((lead) => isLeadTrashed(lead)).length;

  return [
    {
      icon: "requests",
      label: "Total Requests",
      tone: "brand",
      value: leads.length,
    },
    {
      icon: "unread",
      label: "Unread Requests",
      tone: "gold",
      value: unreadCount,
    },
    {
      icon: "read",
      label: "Read Requests",
      tone: "blue",
      value: readCount,
    },
    {
      icon: "trash",
      label: "Archived Requests",
      tone: "red",
      value: trashedCount,
    },
  ];
}

function getNewsSummaryCards(newsPosts: NewsPost[]): SummaryCard[] {
  const publishedCount = newsPosts.filter(
    (post) => post.status === "published",
  ).length;
  const draftCount = newsPosts.filter((post) => post.status === "draft").length;
  const archivedCount = newsPosts.filter(
    (post) => post.status === "archived",
  ).length;

  return [
    {
      icon: "requests",
      label: "Total Posts",
      tone: "brand",
      value: publishedCount + draftCount,
    },
    {
      icon: "read",
      label: "Published Posts",
      tone: "green",
      value: publishedCount,
    },
    {
      icon: "unread",
      label: "Draft Posts",
      tone: "gold",
      value: draftCount,
    },
    {
      icon: "trash",
      label: "Archived Posts",
      tone: "red",
      value: archivedCount,
    },
  ];
}

function MetricIcon({
  icon,
  tone,
}: {
  icon: "read" | "requests" | "trash" | "unread";
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
    icon === "read" ? (
      <>
        <path d="M1.75 10s3-5.25 8.25-5.25S18.25 10 18.25 10s-3 5.25-8.25 5.25S1.75 10 1.75 10z" />
        <circle cx="10" cy="10" r="2.5" />
      </>
    ) : icon === "unread" ? (
      <>
        <path d="M3 6h14a2 2 0 012 2v6a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2z" />
        <path d="M1 8l9 5 9-5" />
      </>
    ) : icon === "trash" ? (
      <>
        <path d="M5.75 6.25h8.5" />
        <path d="M7 6.25V5a1 1 0 011-1h4a1 1 0 011 1v1.25" />
        <path d="M7.75 8.5v4.75M12.25 8.5v4.75M6.75 6.25l.5 8a1 1 0 001 .94h2.5a1 1 0 001-.94l.5-8" />
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

  const [leadsResult, newsPostsResult] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase
      .from("news_posts")
      .select("id,title,slug,status,publish_date,created_at")
      .order("created_at", { ascending: false }),
  ]);

  const error = leadsResult.error ?? newsPostsResult.error;
  const leadRows = (leadsResult.data ?? []) as Lead[];
  const newsPostRows = (newsPostsResult.data ?? []) as NewsPost[];
  const activeLeadRows = leadRows.filter((lead) => !isLeadTrashed(lead));
  const activeNewsPostRows = newsPostRows.filter(
    (post) => post.status !== "archived",
  );
  const summaryCards = getSummaryCards(leadRows);
  const newsSummaryCards = getNewsSummaryCards(newsPostRows);
  const requestDates = activeLeadRows
    .map((lead) => lead.created_at)
    .filter((date): date is string => Boolean(date));
  const newsPostDates = activeNewsPostRows
    .map((post) => post.created_at)
    .filter((date): date is string => Boolean(date));
  const recentLeads = activeLeadRows.slice(0, 3);
  const recentNewsPosts = activeNewsPostRows.slice(0, 3);

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
            Review request proposal activity and active follow-ups.
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

          <DashboardCharts
            ariaLabelSubject="request proposal"
            datasetLabel="Request proposals"
            dates={requestDates}
            descriptions={{
              custom: "Request movement for your selected date range.",
              daily: "Daily request movement for the last seven days.",
              monthly:
                "Monthly request movement from January to December this year.",
              weekly: "Weekly request movement for the last six weeks.",
            }}
            eyebrow="Request Trend"
            title="Request proposal activity over time"
          />

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
                      <ReadStatusBadge lead={lead} />
                      <p className="text-xs font-medium text-[var(--text-faint)] sm:text-right">
                        {formatDate(lead.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-6 pt-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                  News & Media
                </p>
                <h2 className="mt-1 font-heading text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                  News & Media Analytics
                </h2>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Review newsroom post activity, publishing status, and recent content.
                </p>
              </div>
              <Link
                href="/dashboard/news-media"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
              >
                View all posts
              </Link>
            </div>

            <section className="grid gap-4 lg:grid-cols-4">
              {newsSummaryCards.map((metric) => (
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

            <DashboardCharts
              ariaLabelSubject="news media"
              datasetLabel="News & Media posts"
              dates={newsPostDates}
              descriptions={{
                custom: "News post movement for your selected date range.",
                daily: "Daily news post movement for the last seven days.",
                monthly:
                  "Monthly news post movement from January to December this year.",
                weekly: "Weekly news post movement for the last six weeks.",
              }}
              eyebrow="News & Media Trend"
              title="Newsroom post activity over time"
            />

            <section className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
              <div className="flex flex-col gap-2 border-b border-[var(--border-light)] bg-[var(--bg-subtle)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                    Recent News & Media Posts
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Latest non-archived newsroom posts prepared for the website.
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                  Latest {recentNewsPosts.length}
                </span>
              </div>

              {recentNewsPosts.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[var(--text-faint)]" aria-hidden="true">
                      <path d="M4 19.5V5a2 2 0 012-2h9.5L20 7.5V19a2 2 0 01-2 2H6a2 2 0 01-2-1.5z" />
                      <path d="M14 3v5h5M8 13h8M8 17h5" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    No active news posts yet
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Analytics will update once draft or published newsroom posts are created.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-light)]">
                  {recentNewsPosts.map((post, index) => (
                    <div
                      key={post.id ?? `${post.slug ?? "news-post"}-${index}`}
                      className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                          {post.title || "Untitled news post"}
                        </p>
                        <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                          {post.slug ? `/${post.slug}` : "No slug provided"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                        <NewsStatusBadge status={post.status} />
                        <p className="text-xs font-medium text-[var(--text-faint)] sm:text-right">
                          {formatDate(post.publish_date ?? post.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>
        </>
      )}
    </div>
  );
}
