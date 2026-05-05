import { cookies } from "next/headers";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BackToTop } from "@/app/components/home/back-to-top";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import { fetchPublishedNewsArticleBySlug } from "@/app/lib/news-posts";
import { formatNewsDate } from "@/app/lib/news-media";
import { createClient } from "@/app/lib/supabase-server";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";
import { NewsArticleBody } from "../news-article-body";

type NewsArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const metadata: Metadata = {
  title: "News Article | iPay",
  description: "Read the latest official iPay newsroom article.",
};

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const [{ slug }, cookieStore, supabase] = await Promise.all([
    params,
    cookies(),
    createClient(),
  ]);
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;
  const article = await fetchPublishedNewsArticleBySlug(supabase, slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar initialTheme={initialTheme} />

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
                  <span>Published on {formatNewsDate(article.publishDate)}</span>
                </div>
              </div>

              <p className="mt-5 text-justify text-base leading-8 text-[var(--text-muted)]">
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
    </main>
  );
}
