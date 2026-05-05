import type { Metadata } from "next";
import Link from "next/link";
import { Archive } from "lucide-react";
import { DashboardPageHeader } from "@/app/components/dashboard/dashboard-page-header";
import { NewsMediaManageClient } from "./news-media-manage-client";

export const metadata: Metadata = {
  title: "News & Media | iPay Dashboard",
  description:
    "Manage News & Media posts in the iPay dashboard.",
};

type DashboardNewsMediaPageProps = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

export default async function DashboardNewsMediaPage({
  searchParams,
}: DashboardNewsMediaPageProps) {
  const { filter } = await searchParams;
  const isArchivedView = filter === "archived";

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="News & Media"
        subtitle="Manage newsroom posts, drafts, and published content in one place."
        actions={
          <>
            <Link
              href={isArchivedView ? "/dashboard/news-media" : "/dashboard/news-media?filter=archived"}
              aria-label={isArchivedView ? "Return to active posts" : "View archived posts"}
              title={isArchivedView ? "Active posts" : "Archived posts"}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] ${
                isArchivedView
                  ? "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]"
                  : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/dashboard/news-media/new"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
            >
              + New Post
            </Link>
          </>
        }
      />

      <NewsMediaManageClient />
    </div>
  );
}
