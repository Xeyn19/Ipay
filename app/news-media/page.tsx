import Image from "next/image";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { BackToTop } from "@/app/components/home/back-to-top";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import { Button } from "@/app/components/home/ui";
import { fetchPublishedNewsArticles } from "@/app/lib/news-posts";
import { createClient } from "@/app/lib/supabase-server";
import {
  estimateNewsReadingMinutes,
  formatNewsDate,
  getNewsBodyParagraphs,
  newsExternalCoverage,
  newsFeaturedVideos,
} from "@/app/lib/news-media";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";

export const metadata: Metadata = {
  title: "News & Media | iPay",
  description:
    "Official iPay announcements, company updates, and media resources for partners, clients, and the press.",
};

export default async function NewsMediaPage() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;
  const supabase = await createClient();
  const publishedArticles = await fetchPublishedNewsArticles(supabase);
  const [featuredArticle, ...otherArticles] = publishedArticles;
  const featuredParagraphs = featuredArticle
    ? getNewsBodyParagraphs(featuredArticle.body).slice(0, 2)
    : [];
  const pressReleaseArticles = publishedArticles.slice(0, 3);

  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar initialTheme={initialTheme} />

      <section className="relative overflow-hidden px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.16)_0%,rgba(245,166,35,0.06)_38%,transparent_74%)] blur-3xl"
        />

        <div className="relative mx-auto max-w-6xl space-y-8">
          <div className="rounded-[36px] border border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-elevated)_0%,var(--bg-subtle)_100%)] p-8 shadow-[var(--shadow-large)] sm:p-12 lg:p-16">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                Newsroom
              </p>
              <h1 className="font-heading mt-4 text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--text-primary)]">
                News &amp; Media
              </h1>
              <p className="mt-6 text-base leading-8 text-[var(--text-muted)] sm:text-lg">
                Official iPay updates, product stories, and partner-facing
                announcements presented in one public news stream.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <div className="rounded-full border border-[var(--border-light)] bg-[var(--bg-base)]/70 px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">
                {publishedArticles.length} published stories
              </div>
              <div className="rounded-full border border-[var(--border-light)] bg-[var(--bg-base)]/70 px-4 py-2 text-sm font-medium text-[var(--text-secondary)]">
                Company updates, product direction, and partner news
              </div>
            </div>
          </div>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_22rem]">
            {featuredArticle ? (
              <article className="overflow-hidden rounded-[36px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-large)]">
                <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="relative min-h-[21rem]">
                    <Image
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 52vw"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,17,29,0.1)_0%,rgba(8,17,29,0.45)_100%)]" />
                  </div>

                  <div className="flex flex-col justify-between p-8 sm:p-10">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full border border-[var(--border-orange)] bg-[var(--bg-elevated-muted)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--brand)]">
                          Featured story
                        </span>
                        <span className="inline-flex rounded-full border border-[var(--border-light)] bg-[var(--bg-subtle)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                          {featuredArticle.category}
                        </span>
                      </div>

                      <h2 className="font-heading mt-5 text-[clamp(2rem,3vw,3rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--text-primary)]">
                        {featuredArticle.title}
                      </h2>

                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]">
                        <span>{formatNewsDate(featuredArticle.publishDate)}</span>
                        <span>/</span>
                        <span>
                          {estimateNewsReadingMinutes(featuredArticle.body)} min read
                        </span>
                      </div>

                      <p className="mt-5 text-base leading-8 text-[var(--text-muted)]">
                        {featuredArticle.excerpt}
                      </p>

                      <div className="mt-6 space-y-4">
                        {featuredParagraphs.map((paragraph) => (
                          <p
                            key={paragraph}
                            className="text-sm leading-7 text-[var(--text-secondary)]"
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      <Button href="/request-proposal">Request Proposal</Button>
                      <Button href="/" variant="secondary">
                        Back to Home
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ) : null}

            <aside className="rounded-[32px] border border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-elevated)_0%,var(--bg-subtle)_100%)] p-6 shadow-[var(--shadow-card)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                Media &amp; Partnerships
              </p>
              <h2 className="font-heading mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                Need official iPay information?
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
                For announcements, media references, and collaboration
                discussions, connect with the team through the main business
                channel while the newsroom workflow continues to expand.
              </p>

              <div className="mt-6 rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-base)]/80 p-5">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-faint)]">
                  Contact
                </p>
                <a
                  href="mailto:info@ipay.ph"
                  className="mt-2 inline-flex text-base font-semibold text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
                >
                  info@ipay.ph
                </a>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                  Use this for partnership conversations, corporate inquiries,
                  and requests related to public-facing company updates.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Press-ready company updates",
                  "Partnership and ecosystem stories",
                  "Product direction and rollout highlights",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] border border-[var(--border-light)] bg-[var(--bg-base)]/72 px-4 py-3 text-sm leading-7 text-[var(--text-secondary)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="rounded-[32px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-8 shadow-[var(--shadow-card)] sm:p-10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                    Press releases
                  </p>
                  <h2 className="font-heading mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                    Official announcements
                  </h2>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  Structured updates in the same tone as the wider iPay site.
                </p>
              </div>

              <div className="mt-8 divide-y divide-[var(--border-light)]">
                {pressReleaseArticles.map((article) => (
                  <article key={article.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]">
                      <span>{formatNewsDate(article.publishDate)}</span>
                      <span>/</span>
                      <span>{article.category}</span>
                    </div>
                    <h3 className="font-heading mt-3 text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                      {article.excerpt}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-[var(--border-light)] bg-[linear-gradient(135deg,var(--bg-elevated)_0%,var(--bg-subtle)_100%)] p-8 shadow-[var(--shadow-card)] sm:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                  In the news
                </p>
                <h2 className="font-heading mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  External coverage
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                  Coverage-style entries keep the newsroom page feeling active
                  even before full publishing workflows are connected.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {newsExternalCoverage.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-base)] shadow-[var(--shadow-control)]"
                  >
                    <div className="grid sm:grid-cols-[9rem_minmax(0,1fr)]">
                      <div className="relative min-h-[9rem]">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 9rem"
                        />
                      </div>

                      <div className="p-5">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
                          {item.source}
                        </p>
                        <h3 className="font-heading mt-2 text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                          {item.summary}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]">
                          <span>{formatNewsDate(item.date)}</span>
                          <span>/</span>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
                          >
                            Read more
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-8 shadow-[var(--shadow-card)] sm:p-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                  More stories
                </p>
                <h2 className="font-heading mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Additional newsroom updates
                </h2>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                A broader stream of recent items, similar to a newsroom archive.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {otherArticles.map((article) => (
                <article
                  key={article.id}
                  className="overflow-hidden rounded-[26px] border border-[var(--border-light)] bg-[var(--bg-base)] shadow-[var(--shadow-control)]"
                >
                  <div className="relative h-52">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full border border-[var(--border-light)] bg-[var(--bg-subtle)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                        {article.category}
                      </span>
                    </div>

                    <h3 className="font-heading text-xl font-semibold leading-[1.12] tracking-[-0.03em] text-[var(--text-primary)]">
                      {article.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]">
                      <span>{formatNewsDate(article.publishDate)}</span>
                      <span>/</span>
                      <span>{estimateNewsReadingMinutes(article.body)} min read</span>
                    </div>

                    <p className="text-sm leading-7 text-[var(--text-muted)]">
                      {article.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-[var(--border-light)] bg-[linear-gradient(135deg,var(--bg-elevated)_0%,var(--bg-subtle)_100%)] p-8 shadow-[var(--shadow-card)] sm:p-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                  Featured video
                </p>
                <h2 className="font-heading mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  Interviews and leadership clips
                </h2>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                A final media-style section inspired by newsroom pages that mix
                announcements with interviews and coverage moments.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {newsFeaturedVideos.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[26px] border border-[var(--border-light)] bg-[var(--bg-base)] shadow-[var(--shadow-control)]"
                >
                  <div className="relative h-56">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,29,0.04)_0%,rgba(8,17,29,0.72)_100%)]" />
                    <div className="absolute bottom-4 left-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur">
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="ml-0.5 h-5 w-5"
                        aria-hidden="true"
                      >
                        <path d="M6.5 5.6a1 1 0 0 1 1.53-.85l6.35 4.4a1 1 0 0 1 0 1.64l-6.35 4.4A1 1 0 0 1 6.5 14.35V5.6Z" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">
                      {item.source}
                    </p>
                    <h3 className="font-heading text-xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-7 text-[var(--text-muted)]">
                      {item.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]">
                      <span>{formatNewsDate(item.date)}</span>
                      <span>/</span>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--brand)] transition hover:text-[var(--brand-dark)]"
                      >
                        Watch feature
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/request-proposal">Contact iPay</Button>
              <Button href="/" variant="secondary">
                Explore homepage
              </Button>
            </div>
          </section>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </main>
  );
}
