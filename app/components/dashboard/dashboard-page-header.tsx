import type { ReactNode } from "react";

export function DashboardPageHeader({
  actions,
  subtitle,
  title,
}: {
  actions?: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
