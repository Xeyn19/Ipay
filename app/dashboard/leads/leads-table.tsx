'use client'

type Lead = {
  id?: number;
  name?: string;
  company?: string;
  email?: string;
  contact_number?: string;
  message?: string;
  created_at?: string;
};

function formatDate(dateString: string | undefined) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadsTable({
  leads,
  error,
}: {
  leads: Lead[];
  error?: string;
}) {
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
          Failed to load leads
        </p>
        <p className="mt-1 text-xs text-red-500/80 dark:text-red-400/60">
          {error}
        </p>
      </div>
    );
  }

  if (leads.length === 0) {
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
          No leads yet
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Leads will appear here when visitors submit proposal requests.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
      {/* Counter */}
      <div className="flex items-center justify-between border-b border-[var(--border-light)] px-5 py-3">
        <p className="text-xs font-semibold text-[var(--text-muted)]">
          <span className="text-[var(--brand)]">{leads.length}</span>{" "}
          {leads.length === 1 ? "lead" : "leads"}
        </p>
      </div>

      {/* Table */}
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
              <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Message
              </th>
              <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {leads.map((lead, idx) => (
              <tr
                key={lead.id ?? idx}
                className="transition-colors duration-150 hover:bg-[var(--bg-subtle)]"
              >
                <td className="whitespace-nowrap px-5 py-3.5 font-medium text-[var(--text-primary)]">
                  {lead.name || "—"}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
                  {lead.company || "—"}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-[var(--brand)] underline decoration-[var(--brand)]/30 underline-offset-2 transition-colors hover:decoration-[var(--brand)]"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-[var(--text-secondary)]">
                  {lead.contact_number || "—"}
                </td>
                <td className="max-w-xs truncate px-5 py-3.5 text-[var(--text-muted)]">
                  {lead.message || "—"}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-xs text-[var(--text-faint)]">
                  {formatDate(lead.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
