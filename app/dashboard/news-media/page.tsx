import type { Metadata } from "next";
import Link from "next/link";
import { NewsMediaEditor } from "./news-media-editor";

export const metadata: Metadata = {
  title: "News CMS | iPay Dashboard",
  description:
    "Prepare News & Media content in the iPay dashboard before backend publishing is connected.",
};

export default function DashboardNewsMediaPage() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-[var(--border-light)] bg-[linear-gradient(135deg,var(--bg-elevated)_0%,var(--bg-subtle)_100%)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
              Content Management
            </p>
            <h1 className="mt-2 font-heading text-[clamp(2rem,3vw,2.8rem)] font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
              News CMS
            </h1>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Manage the newsroom structure behind the public `News &amp;
              Media` page: featured story, press releases, supporting coverage,
              and media-style content blocks, all without backend storage yet.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Featured story",
                "Press releases",
                "In the news",
                "Featured video",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex rounded-full border border-[var(--border-light)] bg-[var(--bg-base)]/72 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/news-media"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--brand)] px-5 text-sm font-semibold text-white shadow-[var(--shadow-button)] transition hover:bg-[var(--brand-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
          >
            View public newsroom
          </Link>
        </div>
      </section>

      <NewsMediaEditor />
    </div>
  );
}
