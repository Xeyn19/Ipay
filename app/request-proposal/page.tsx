import { cookies } from "next/headers";
import type { Metadata } from "next";
import { BackToTop } from "@/app/components/home/back-to-top";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import { Button, SectionHeader } from "@/app/components/home/ui";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";

const proposalHighlights = [
  {
    title: "Collections Architecture",
    description:
      "Map the payment channels, settlement flow, and reporting model that fit your current business operations.",
  },
  {
    title: "Controls and Governance",
    description:
      "Outline access controls, reconciliation ownership, and approval paths before rollout starts.",
  },
  {
    title: "Implementation Planning",
    description:
      "Align on timelines, integration depth, and the operating model your teams need to launch confidently.",
  },
];

const scopingAreas = [
  "QR Ph, cards, banks, and e-wallet collection flows",
  "Recurring billing, invoicing, and disbursement requirements",
  "Reporting, reconciliation, and settlement expectations",
  "Developer API, embedded payments, or white-label rollout needs",
];

const engagementSteps = [
  {
    step: "01",
    title: "Share your operating model",
    description:
      "Tell us how payments move through your business today, including channels, teams, and reporting constraints.",
  },
  {
    step: "02",
    title: "Define the commercial scope",
    description:
      "We frame the solution around transaction volume, payout complexity, governance requirements, and deployment goals.",
  },
  {
    step: "03",
    title: "Review a tailored proposal path",
    description:
      "You get a clearer picture of the recommended setup, rollout priorities, and what implementation should cover next.",
  },
];

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

      <section className="relative overflow-hidden border-b border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-base)_0%,var(--bg-warm)_100%)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(241,122,30,0.12),transparent_62%)]"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-orange)] bg-[var(--brand-pale)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)] shadow-[var(--shadow-pill)]">
              Proposal Desk
            </span>
            <h1 className="mt-6 font-heading text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-[var(--text-primary)]">
              Request a proposal built around your payment operations.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-muted)] sm:text-xl">
              This page is for businesses evaluating iPay for collections,
              disbursements, embedded payments, and finance workflows. We keep
              the conversation grounded in channel coverage, controls, and
              rollout practicality.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/#services">Explore Services</Button>
              <Button href="/#partners" variant="secondary">
                View Partner Network
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {proposalHighlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-elevated)]/92 p-5 shadow-[var(--shadow-soft)] backdrop-blur"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                    {item.title}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-elevated)_0%,var(--bg-subtle)_100%)] p-6 shadow-[var(--shadow-large)] sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
                  Proposal Brief
                </p>
                <h2 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                  What to prepare
                </h2>
              </div>
              <div className="rounded-full border border-[var(--border-orange)] bg-[var(--brand-pale)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
                15-30 min
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {scopingAreas.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[22px] border border-[var(--border-light)] bg-[var(--bg-base)]/78 px-4 py-4 shadow-[var(--shadow-surface)]"
                >
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-pale)] text-[var(--brand)]">
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="m5 10 3 3 7-7" />
                    </svg>
                  </span>
                  <p className="text-sm leading-7 text-[var(--text-secondary)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] border border-[var(--border-orange)] bg-[linear-gradient(135deg,var(--brand-pale),transparent)] p-5">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Outcome
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                The goal is a more focused commercial discussion, with less
                guesswork around channels, controls, and implementation scope.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--bg-base)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Scope"
            title="What the proposal conversation should cover"
            description="A strong proposal starts with operating detail, not generic feature lists. These are the areas worth clarifying before commercial review."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {engagementSteps.map((item) => (
              <article
                key={item.step}
                className="rounded-[28px] border border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-elevated)_0%,var(--bg-warm)_100%)] p-6 shadow-[var(--shadow-card)]"
              >
                <div className="inline-flex rounded-full bg-[var(--brand-pale)] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[var(--brand)]">
                  Step {item.step}
                </div>
                <h3 className="mt-5 font-heading text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-4 text-base leading-8 text-[var(--text-muted)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-subtle)_0%,var(--bg-base)_100%)] py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-8 text-center shadow-[var(--shadow-large)] sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
              Next Step
            </p>
            <h2 className="mt-3 font-heading text-[clamp(2rem,4vw,3.25rem)] font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
              Continue reviewing iPay’s platform fit from the main site.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg">
              This new page is now wired into the site as the dedicated Request
              Proposal destination. If you want, the next step can be turning
              this into a live form connected to email, CRM, or an API route.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/">Back to Home</Button>
              <Button href="/#how-it-works" variant="secondary">
                Review How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </main>
  );
}
