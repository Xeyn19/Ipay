import type { Metadata } from "next";
import Link from "next/link";
import { DashboardPageHeader } from "@/app/components/dashboard/dashboard-page-header";
import { fetchNewsArticleById } from "@/app/lib/news-posts";
import { createClient } from "@/app/lib/supabase-server";
import { NewsPostForm } from "../news-post-form";

export const metadata: Metadata = {
  title: "Edit News Post | iPay Dashboard",
  description:
    "Edit a News & Media post in the iPay dashboard.",
};

type NewsMediaEditPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

function NewsMediaPostState() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Edit post"
        subtitle="Return to the manage page and choose another post to continue."
        actions={
          <Link
            href="/dashboard/news-media"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
          >
            Back
          </Link>
        }
      />

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
              <path d="M4 6.75A2.75 2.75 0 016.75 4h10.5A2.75 2.75 0 0120 6.75v10.5A2.75 2.75 0 0117.25 20H6.75A2.75 2.75 0 014 17.25V6.75Z" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Post not found
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
            The selected post does not exist or is no longer available.
          </p>
          <Link
            href="/dashboard/news-media"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
          >
            Back to manage page
          </Link>
        </div>
      </section>
    </div>
  );
}

export default async function EditNewsMediaPostPage({
  params,
}: NewsMediaEditPageProps) {
  const { postId } = await params;
  const supabase = await createClient();
  const article = await fetchNewsArticleById(supabase, postId);

  if (!article) {
    return <NewsMediaPostState />;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Edit post"
        subtitle="Update the current post and review its draft details."
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
        key={article.id}
        initialArticle={article}
        mode="edit"
      />
    </div>
  );
}
