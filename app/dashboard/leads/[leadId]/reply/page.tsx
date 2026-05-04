import type { Metadata } from "next";
import Link from "next/link";
import { normalizeLeadReadFilter } from "@/app/dashboard/lead-read-status";
import { LeadReplyForm } from "@/app/dashboard/leads/lead-reply-form";
import {
  getLeadReplyTemplates,
  type LeadReplyTemplateRecord,
} from "@/app/dashboard/leads/reply-templates";
import { createClient } from "@/app/lib/supabase-server";

export const metadata: Metadata = {
  title: "Reply to Request | iPay Dashboard",
  description: "Prepare and send a reply to a request proposal from the dashboard.",
};

type LeadReplyPageProps = {
  params: Promise<{
    leadId: string;
  }>;
  searchParams: Promise<{
    filter?: string | string[] | undefined;
  }>;
};

function getBackHref(filter: string | string[] | undefined) {
  const activeFilter = normalizeLeadReadFilter(filter);
  return activeFilter === "unread"
    ? "/dashboard/leads"
    : `/dashboard/leads?filter=${activeFilter}`;
}

function ReplyPageState({
  backHref,
  description,
  title,
}: {
  backHref: string;
  description: string;
  title: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
          Request Proposal
        </p>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Reply to request
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Return to the request list or choose another lead to continue.
        </p>
      </div>

      <section className="rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] px-6 py-10 shadow-[var(--shadow-card)]">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-subtle)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-[var(--text-faint)]"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              <path d="M8 9h8M8 13h5" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
            {description}
          </p>
          <Link
            href={backHref}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
          >
            Back to requests
          </Link>
        </div>
      </section>
    </div>
  );
}

export default async function LeadReplyPage({
  params,
  searchParams,
}: LeadReplyPageProps) {
  const { leadId } = await params;
  const query = await searchParams;
  const backHref = getBackHref(query.filter);
  const parsedLeadId = Number(leadId);

  if (!Number.isInteger(parsedLeadId) || parsedLeadId <= 0) {
    return (
      <ReplyPageState
        backHref={backHref}
        title="Invalid request selection"
        description="The reply page could not identify which request you want to answer."
      />
    );
  }

  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("id, name, company, email")
    .eq("id", parsedLeadId)
    .single();

  if (error || !lead) {
    return (
      <ReplyPageState
        backHref={backHref}
        title="Request not found"
        description="The selected request could not be loaded. It may have been removed or is no longer available."
      />
    );
  }

  if (!lead.email?.trim()) {
    return (
      <ReplyPageState
        backHref={backHref}
        title="No email address available"
        description="This request does not include a valid email address, so a reply cannot be sent from the dashboard."
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  let customTemplates: LeadReplyTemplateRecord[] = [];

  if (user) {
    const { data } = await supabase
      .from("lead_reply_templates")
      .select("id, label, subject, message_text, source_template_key, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    customTemplates = (data ?? []) as LeadReplyTemplateRecord[];
  }

  const replyTemplates = getLeadReplyTemplates(lead, customTemplates);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
            Request Proposal
          </p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
            Reply to request
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Send a direct response with templates and supporting attachments.
          </p>
        </div>
        <Link
          href={backHref}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
        >
          Back to requests
        </Link>
      </div>

      <LeadReplyForm
        backHref={backHref}
        initialTemplates={replyTemplates}
        lead={lead}
      />
    </div>
  );
}
