import type { Metadata } from "next";
import { normalizeLeadReadFilter } from "@/app/dashboard/lead-read-status";
import { createClient } from "@/app/lib/supabase-server";
import { LeadsTable } from "./leads-table";

export const metadata: Metadata = {
  title: "Request Proposal | iPay Dashboard",
  description: "View and manage your request proposals from the iPay dashboard.",
};

type LeadsPageProps = {
  searchParams: Promise<{
    filter?: string | string[] | undefined;
  }>;
};

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const supabase = await createClient();
  const { filter } = await searchParams;
  const activeFilter = normalizeLeadReadFilter(filter);

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Request Proposal
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          View all request proposals submitted through the website.
        </p>
      </div>

      {/* Table */}
      <LeadsTable
        activeFilter={activeFilter}
        leads={leads ?? []}
        error={error?.message}
      />
    </div>
  );
}
