import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase-server";
import { LeadsTable } from "./leads-table";

export const metadata: Metadata = {
  title: "Leads | iPay Dashboard",
  description: "View and manage your leads from the iPay dashboard.",
};

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          Leads
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          View all proposal requests submitted through the website.
        </p>
      </div>

      {/* Table */}
      <LeadsTable leads={leads ?? []} error={error?.message} />
    </div>
  );
}
