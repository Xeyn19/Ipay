import { cookies } from "next/headers";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { BackToTop } from "@/app/components/home/back-to-top";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import {
  PUBLIC_NEWS_POSTS_PAGE_SIZE,
  fetchMostRecentPublishedNewsArticles,
  fetchMostViewedPublishedNewsArticles,
  fetchNewsPostCategories,
  fetchPublishedNewsArticlesPage,
} from "@/app/lib/news-posts";
import type { NewsArticle, NewsPostCategory } from "@/app/lib/news-media";
import { formatNewsDate } from "@/app/lib/news-media";
import { createClient } from "@/app/lib/supabase-server";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";

export const metadata: Metadata = {
  title: "News & Media | iPay",
  description:
    "Official iPay announcements, company updates, and media resources for partners, clients, and the press.",
};

type NewsMediaPageProps = {
  searchParams: Promise<{
    category?: string | string[] | undefined;
    page?: string | string[] | undefined;
  }>;
};

type PaginationItem = number | "ellipsis";

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePageNumber(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function buildNewsMediaHref(params: { categoryId?: string; page?: number }) {
  const search = new URLSearchParams();

  if (params.categoryId) {
    search.set("category", params.categoryId);
  }

  if (params.page && params.page > 1) {
    search.set("page", String(params.page));
  }

  const query = search.toString();

  return query ? `/news-media?${query}` : "/news-media";
}

function getPaginationItems(totalPages: number, currentPage: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];

  if (currentPage > 3) {
    items.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  if (currentPage < totalPages - 2) {
    items.push("ellipsis");
  }

  items.push(totalPages);

  return items;
}

function NewsPostCard({ article }: { article: NewsArticle }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-control)]">
      <Link href={`/news-media/${article.slug}`} className="relative block aspect-[16/10] w-full overflow-hidden">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover object-center transition duration-500 hover:scale-[1.03]"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
          {formatNewsDate(article.publishDate)}
        </p>

        <h3 className="font-heading mt-3 text-2xl font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--text-primary)]">
          <Link href={`/news-media/${article.slug}`} className="transition hover:text-[var(--brand)]">
            {article.title}
          </Link>
        </h3>

        <p className="mt-4 h-20 overflow-hidden text-sm leading-7 text-[var(--text-muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
          {article.excerpt}
        </p>

        <Link
          href={`/news-media/${article.slug}`}
          className="mt-6 inline-flex text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
        >
          Read More &gt;
        </Link>
      </div>
    </article>
  );
}

function CategoryPill({
  category,
  isActive,
}: {
  category: NewsPostCategory | null;
  isActive: boolean;
}) {
  return (
    <Link
      href={buildNewsMediaHref({
        categoryId: category?.id,
        page: 1,
      })}
      className={`inline-flex min-h-11 items-center justify-center rounded-full border px-5 text-sm font-semibold transition ${
        isActive
          ? "border-[var(--brand)] bg-[var(--brand)] text-white"
          : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
      }`}
    >
      {category?.name ?? "All"}
    </Link>
  );
}

export default async function NewsMediaPage({ searchParams }: NewsMediaPageProps) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;
  const supabase = await createClient();
  const query = await searchParams;
  const requestedCategoryId = getQueryValue(query.category);
  const requestedPage = parsePageNumber(getQueryValue(query.page));
  const categories = await fetchNewsPostCategories(supabase);
  const activeCategoryId = categories.some((category) => category.id === requestedCategoryId)
    ? requestedCategoryId
    : undefined;

  const [gridResult, mostViewedArticles, mostRecentArticles] = await Promise.all([
    fetchPublishedNewsArticlesPage(supabase, {
      categoryId: activeCategoryId,
      page: requestedPage,
      pageSize: PUBLIC_NEWS_POSTS_PAGE_SIZE,
    }),
    fetchMostViewedPublishedNewsArticles(supabase, 3),
    fetchMostRecentPublishedNewsArticles(supabase, 5),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(gridResult.totalCount / PUBLIC_NEWS_POSTS_PAGE_SIZE),
  );
  const currentPage = Math.min(requestedPage, totalPages);
  const postsPage =
    currentPage === requestedPage
      ? gridResult
      : await fetchPublishedNewsArticlesPage(supabase, {
          categoryId: activeCategoryId,
          page: currentPage,
          pageSize: PUBLIC_NEWS_POSTS_PAGE_SIZE,
        });
  const featuredArticle = mostRecentArticles[0] ?? postsPage.data[0] ?? null;
  const paginationItems = getPaginationItems(totalPages, currentPage);
  const [primaryMostViewed, ...secondaryMostViewed] = mostViewedArticles;
  const hasPosts = Boolean(featuredArticle) || postsPage.data.length > 0;

  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar initialTheme={initialTheme} />

      {featuredArticle ? (
        <section className="relative overflow-hidden border-b border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-subtle)_0%,var(--bg-base)_100%)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(245,166,35,0.18),transparent_58%)]"
          />

          <div className="relative mx-auto max-w-7xl py-10">
              <article className="overflow-hidden">
                <div className="grid lg:grid-cols-2 items-center">
                  <Link
                  href={`/news-media/${featuredArticle.slug}`}
                  className="relative block min-h-[18rem] lg:h-[20rem]"
                >
                  <Image
                    src={featuredArticle.coverImage}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    priority
                  />
                </Link>

                <div className="flex items-center p-6 sm:p-8 lg:p-12">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                      Featured Post
                    </p>
                    <h1 className="font-heading mt-4 text-[clamp(2.2rem,4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-[var(--text-primary)]">
                      {featuredArticle.title}
                    </h1>
                    <Link
                      href={`/news-media/${featuredArticle.slug}`}
                      className="mt-8 inline-flex text-base font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
                    >
                      Read More &gt;
                    </Link>
                  </div>
                  </div>
                </div>
              </article>
          </div>
        </section>
      ) : null}

      <section className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-7xl space-y-14">
          <section>
            <div className="flex flex-wrap gap-3">
              <CategoryPill category={null} isActive={!activeCategoryId} />
              {categories.map((category) => (
                <CategoryPill
                  key={category.id}
                  category={category}
                  isActive={activeCategoryId === category.id}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
              Latest Updates
            </h2>
            {postsPage.data.length > 0 ? (
              <>
                <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {postsPage.data.map((article) => (
                    <NewsPostCard key={article.id} article={article} />
                  ))}
                </div>

                {gridResult.totalCount > PUBLIC_NEWS_POSTS_PAGE_SIZE ? (
                  <nav
                    aria-label="News post pagination"
                    className="mt-8 flex flex-wrap items-center gap-2"
                  >
                    <Link
                      href={buildNewsMediaHref({
                        categoryId: activeCategoryId,
                        page: Math.max(1, currentPage - 1),
                      })}
                      aria-disabled={currentPage === 1}
                      className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${
                        currentPage === 1
                          ? "pointer-events-none border-[var(--border-light)] bg-[var(--bg-subtle)] text-[var(--text-faint)]"
                          : "border-[var(--border-light)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Previous
                    </Link>

                    {paginationItems.map((item, index) =>
                      item === "ellipsis" ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="inline-flex min-h-11 items-center justify-center px-2 text-sm font-semibold text-[var(--text-faint)]"
                        >
                          ...
                        </span>
                      ) : (
                        <Link
                          key={item}
                          href={buildNewsMediaHref({
                            categoryId: activeCategoryId,
                            page: item,
                          })}
                          aria-current={item === currentPage ? "page" : undefined}
                          className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${
                            item === currentPage
                              ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                              : "border-[var(--border-light)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {item}
                        </Link>
                      ),
                    )}

                    <Link
                      href={buildNewsMediaHref({
                        categoryId: activeCategoryId,
                        page: Math.min(totalPages, currentPage + 1),
                      })}
                      aria-disabled={currentPage === totalPages}
                      className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${
                        currentPage === totalPages
                          ? "pointer-events-none border-[var(--border-light)] bg-[var(--bg-subtle)] text-[var(--text-faint)]"
                          : "border-[var(--border-light)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      Next
                    </Link>
                  </nav>
                ) : null}
              </>
            ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)]">
                    <Newspaper
                      size={36}
                      className="text-[var(--text-faint)]"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-base font-medium text-[var(--text-secondary)]">
                    No posts published yet. Please check back later for updates.
                  </p>
                </div>
            )}
          </section>

          {hasPosts ? (
            <section className="grid gap-6 xl:grid-cols-[minmax(0,7fr)_minmax(18rem,3fr)] xl:gap-0">
            <div className="xl:pr-6">
              <div>
                <h2 className="font-heading mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Most Viewed
                </h2>
              </div>

                <div className="mt-8">
                  {primaryMostViewed ? (
                  <div className="grid gap-5 xl:h-[32rem] xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
                    <article className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-base)] shadow-[var(--shadow-control)]">
                      <Link
                        href={`/news-media/${primaryMostViewed.slug}`}
                        className="relative block h-56 w-full shrink-0 sm:h-72 xl:h-[18rem]"
                      >
                        <Image
                          src={primaryMostViewed.coverImage}
                          alt={primaryMostViewed.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1279px) 100vw, 44vw"
                        />
                      </Link>

                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <h3 className="font-heading text-2xl font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--text-primary)] sm:text-3xl">
                          <Link
                            href={`/news-media/${primaryMostViewed.slug}`}
                            className="transition hover:text-[var(--brand)]"
                          >
                            {primaryMostViewed.title}
                          </Link>
                        </h3>
                        <p className="mt-4 overflow-hidden text-sm leading-7 text-[var(--text-muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] sm:text-base">
                          {primaryMostViewed.excerpt}
                        </p>
                        <Link
                          href={`/news-media/${primaryMostViewed.slug}`}
                          className="mt-5 inline-flex text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)] xl:mt-auto"
                        >
                          Read More &gt;
                        </Link>
                      </div>
                    </article>

                    <div className="grid gap-5 xl:h-full xl:grid-rows-2">
                      {secondaryMostViewed.map((article) => (
                        <article
                          key={article.id}
                          className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-base)] shadow-[var(--shadow-control)]"
                        >
                          <Link
                            href={`/news-media/${article.slug}`}
                            className="relative block h-40 w-full sm:h-48 xl:flex-1"
                          >
                            <Image
                              src={article.coverImage}
                              alt={article.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 1279px) 100vw, 19vw"
                            />
                          </Link>

                          <div className="p-5">
                            <h3 className="font-heading overflow-hidden text-xl font-semibold leading-[1.12] tracking-[-0.03em] text-[var(--text-primary)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                              <Link
                                href={`/news-media/${article.slug}`}
                                className="transition hover:text-[var(--brand)]"
                              >
                                {article.title}
                              </Link>
                            </h3>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[var(--border-light)] bg-[var(--bg-subtle)] px-6 py-10 text-center">
                    <p className="text-sm text-[var(--text-muted)]">
                      No popular posts to show yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <aside className="xl:border-l xl:border-[var(--border-light)] xl:pl-6">
              <div>
                <h2 className="font-heading mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Just published
                </h2>
              </div>

              <div className="mt-8 divide-y divide-[var(--border-light)]">
                {mostRecentArticles.length > 0 ? (
                  mostRecentArticles.map((article) => (
                    <article key={article.id} className="py-4 first:pt-0 last:pb-0">
                      <h3 className="text-base font-semibold leading-7 text-[var(--text-primary)]">
                        <Link
                          href={`/news-media/${article.slug}`}
                          className="transition hover:text-[var(--brand)]"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                        {formatNewsDate(article.publishDate)}
                      </p>
                    </article>
                  ))
                ) : (
                  <div className="py-2">
                    <p className="text-sm text-[var(--text-muted)]">
                      No recent posts to show yet.
                    </p>
                  </div>
                )}
              </div>
            </aside>
            </section>
          ) : null}
        </div>
      </section>

      <Footer />
      <BackToTop />
    </main>
  );
}
