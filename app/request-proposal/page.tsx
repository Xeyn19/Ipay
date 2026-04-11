import { cookies } from "next/headers";
import type { Metadata } from "next";
import Image from "next/image";
import { BackToTop } from "@/app/components/home/back-to-top";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";
import { ProposalForm } from "./proposal-form";

export const metadata: Metadata = {
  title: "Request Proposal | iPay",
  description:
    "Start a proposal discussion with iPay for collections, disbursements, embedded payments, and reconciliation workflows.",
};

export default async function RequestProposalPage() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;

  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar initialTheme={initialTheme} />

      {/* ── Contact / Proposal Section ── */}
      <section className="relative min-h-[calc(100svh-var(--nav-height))]">
        <div className="mx-auto grid min-h-[calc(100svh-var(--nav-height))] lg:grid-cols-2">

          {/* ── Left — Image ── */}
          <div className="relative hidden lg:block">
            <Image
              src="/img/requestproposal.jpg"
              alt="Business professional ready to assist with your payment proposal"
              fill
              priority
              sizes="50vw"
              className="object-cover"
            />
            {/* Subtle brand overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(241,122,30,0.08)] to-transparent"
            />
          </div>

          {/* ── Right — Form ── */}
          <div className="flex items-center justify-center bg-[var(--bg-base)] px-6 py-14 sm:px-10 lg:px-14 xl:px-20">
            <div className="w-full max-w-lg">
              {/* Header */}
              <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--text-primary)]">
                Request a <span className="text-[var(--brand)]">Proposal</span>
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                Share a few details and we&apos;ll come back with a focused
                starting point for the commercial discussion.
              </p>

              {/* Divider */}
              <div className="my-6 h-px bg-[var(--border-light)]" />

              {/* Form */}
              <ProposalForm />
            </div>
          </div>

        </div>
      </section>

      <Footer />
      <BackToTop />
    </main>
  );
}
