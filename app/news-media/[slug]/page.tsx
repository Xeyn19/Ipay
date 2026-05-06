import { cookies } from "next/headers";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BackToTop } from "@/app/components/home/back-to-top";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import {
  publishNewsPostFromPreview,
  unpublishNewsPostFromPreview,
} from "@/app/dashboard/news-media/actions";
import { fetchNewsArticleBySlug } from "@/app/lib/news-posts";
import {
  formatNewsDate,
  getNewsStatusClassName,
  getNewsStatusLabel,
} from "@/app/lib/news-media";
import { createClient } from "@/app/lib/supabase-server";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";
import { NewsPostViewTracker } from "./news-post-view-tracker";
import { PreviewSubmitButton } from "./preview-submit-button";
import { NewsArticleBody } from "../news-article-body";

type NewsArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    preview?: string | string[] | undefined;
  }>;
};

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata: Metadata = {
  title: "News Article | iPay",
  description: "Read the latest official iPay newsroom article.",
};

export default async function NewsArticlePage({
  params,
  searchParams,
}: NewsArticlePageProps) {
  const [{ slug }, query, cookieStore, supabase] = await Promise.all([
    params,
    searchParams,
    cookies(),
    createClient(),
  ]);
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;
  const isPreviewRequest = getQueryValue(query.preview) === "true";
  const article = await fetchNewsArticleBySlug(supabase, slug);

  if (!article) {
    notFound();
  }

  const user = isPreviewRequest
    ? (await supabase.auth.getUser()).data.user
    : null;
  const showPreviewBar = isPreviewRequest && Boolean(user);
  const shouldTrackView = article.status === "published" && !showPreviewBar;
  const previewHref = `/news-media/${article.slug}?preview=true`;
  const publishPreviewAction =
    article.status === "draft"
      ? {
          action: publishNewsPostFromPreview.bind(null, article.id, previewHref),
          label: "Publish",
          pendingLabel: "Publishing...",
        }
      : article.status === "published"
        ? {
            action: unpublishNewsPostFromPreview.bind(null, article.id, previewHref),
            label: "Unpublish",
            pendingLabel: "Unpublishing...",
          }
        : null;
  const publishLabel =
    article.status === "published"
      ? `Published on ${formatNewsDate(article.publishDate)}`
      : `${article.status === "draft" ? "Draft preview" : "Archived preview"} • ${formatNewsDate(article.publishDate)}`;

  return (
    <main className="bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <div className="overflow-x-clip">
      {shouldTrackView ? <NewsPostViewTracker postId={article.id} /> : null}
      <Navbar initialTheme={initialTheme} />
      {showPreviewBar ? (
        <div className="sticky top-[var(--nav-height)] z-40 border-b border-[var(--border-light)] bg-[color:var(--bg-elevated)]/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/news-media"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                <span>All Posts</span>
              </Link>
              <span
                className={`inline-flex min-h-10 items-center justify-center rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${getNewsStatusClassName(
                  article.status,
                )}`}
              >
                {getNewsStatusLabel(article.status)}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link
                href={`/dashboard/news-media/${article.id}`}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)]"
              >
                Edit
              </Link>
              {publishPreviewAction ? (
                <form action={publishPreviewAction.action}>
                  <PreviewSubmitButton
                    label={publishPreviewAction.label}
                    pendingLabel={publishPreviewAction.pendingLabel}
                  />
                </form>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <article>
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>

            <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">

                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-[var(--text-muted)]">
                    <Link
                      href="/news-media"
                      className="transition hover:text-[var(--brand)]"
                    >
                      Posts
                    </Link>
                    <span aria-hidden="true" className="text-[var(--text-faint)]">
                      &gt;
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {article.categoryName}
                    </span>
                  </div>

                  <h1 className="font-heading text-center text-[clamp(2rem,3vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--text-primary)]">
                    {article.title}
                  </h1>
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                  <span>{publishLabel}</span>
                </div>
              </div>

              <p className="mt-10 text-justify text-base leading-8 text-[var(--text-muted)]">
                {article.excerpt}
              </p>

              <div className="mt-10">
                <NewsArticleBody body={article.body} />
              </div>
            </div>
          </article>
        </div>
      </section>

      <Footer />
      <BackToTop />
      </div>
    </main>
  );
}
