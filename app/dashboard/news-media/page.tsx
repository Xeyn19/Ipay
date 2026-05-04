import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageHeader } from "@/app/components/dashboard/dashboard-page-header";
import { getManagedNewsArticles, newsSeedArticles } from "@/app/lib/news-media";
import { NewsMediaManageTable } from "./news-media-manage-table";

export const metadata: Metadata = {
  title: "News & Media | iPay Dashboard",
  description:
    "Manage News & Media posts in the iPay dashboard before backend publishing is connected.",
};

export default function DashboardNewsMediaPage() {
  const articles = getManagedNewsArticles(newsSeedArticles);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Content Management"
        title="News & Media"
        subtitle="Manage static newsroom posts, drafts, and published content in one place."
        actions={
          <>
            <button
              type="button"
              disabled
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              Archive
            </button>
            <Link
              href="/dashboard/news-media/new"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
            >
              + New Post
            </Link>
          </>
        }
      />

      <NewsMediaManageTable articles={articles} />
    </div>
  );
}
