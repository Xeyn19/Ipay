import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageHeader } from "@/app/components/dashboard/dashboard-page-header";
import { createEmptyNewsArticle } from "@/app/lib/news-media";
import { NewsPostForm } from "../news-post-form";

export const metadata: Metadata = {
  title: "Create News Post | iPay Dashboard",
  description:
    "Draft a new News & Media post in the iPay dashboard.",
};

export default function NewNewsMediaPostPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Create post"
        subtitle="Prepare a new newsroom entry with the core post information."
        actions={
          <Link
            href="/dashboard/news-media"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
          >
            Back
          </Link>
        }
      />

      <NewsPostForm
        key="new-post"
        initialArticle={createEmptyNewsArticle()}
        mode="create"
      />
    </div>
  );
}
