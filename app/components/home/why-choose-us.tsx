import {
  solutionDetails,
  solutionFeatures,
} from "@/app/components/home/data";

export function WhyChooseUs() {
  return (
    <section className="bg-[var(--bg-contrast)] py-24 sm:py-20">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--tone-gold-muted)]">
            <span
              className="block h-0.5 w-6 rounded-full bg-[var(--tone-gold)]"
              aria-hidden="true"
            />
            The IPAY Solution
          </div>
          <h2 className="font-heading mt-4 text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.04em] text-[var(--text-strong)]">
            Unified controls for
            <span className="block text-[var(--tone-gold)]">modern payment operations</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-base leading-8 text-[var(--text-soft)]">
            One platform to collect, disburse, and reconcile across every major
            Philippine payment rail. No fragmentation. No manual settlement.
          </p>
        </div>

        <div className="my-12 h-px bg-[var(--border-contrast)]" />

        <div className="grid gap-5 md:grid-cols-3">
          {solutionFeatures.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-[20px] border border-[var(--border-contrast)] bg-[var(--bg-elevated)] px-6 py-[26px] transition duration-300 ease-out hover:-translate-y-1.5 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-large)]"
            >
              <div
                className={`absolute inset-x-0 bottom-0 h-[3px] rounded-b-[20px] opacity-0 transition duration-300 group-hover:opacity-100 ${
                  feature.tone === "green"
                    ? "bg-[var(--tone-green)]"
                    : feature.tone === "blue"
                      ? "bg-[var(--tone-blue)]"
                      : "bg-[var(--tone-gold)]"
                }`}
              />
              <div className="mb-5 flex items-center justify-between gap-4">
                <div
                  className={`flex h-[52px] w-[52px] items-center justify-center rounded-[14px] ${
                    feature.tone === "green"
                      ? "bg-[var(--tone-green-soft)]"
                      : feature.tone === "blue"
                        ? "bg-[var(--tone-blue-soft)]"
                        : "bg-[var(--tone-gold-soft)]"
                  }`}
                  aria-hidden="true"
                >
                  {feature.tone === "gold" ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 text-[var(--tone-gold)]"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  ) : feature.tone === "blue" ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 text-[var(--tone-blue)]"
                    >
                      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
                      <path d="m9.5 12 1.7 1.7 3.8-4.2" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 text-[var(--tone-green)]"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                      <path d="M8 8h8v8H8z" opacity="0.18" />
                    </svg>
                  )}
                </div>
                <span className="rounded-full bg-[var(--bg-badge)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
                  {feature.tag}
                </span>
              </div>

              <h3 className="font-heading text-[1.7rem] font-extrabold leading-none text-[var(--tone-gold)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                {feature.subtitle}
              </p>
              <p className="mt-3 text-[0.88rem] leading-7 text-[var(--text-soft)]">
                {feature.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {solutionDetails.map((detail) => (
            <article
              key={detail.title}
              className="rounded-[16px] border border-[var(--border-contrast)] bg-[var(--bg-elevated)] px-5 py-[18px] transition duration-200 ease-out hover:-translate-y-[3px] hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-soft)]"
            >
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tone-gold-soft)]">
                  <svg
                    viewBox="0 0 14 14"
                    fill="none"
                    className="h-[13px] w-[13px]"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 7 5.5 10 11.5 4"
                      stroke="var(--tone-gold)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3 className="font-heading text-[0.9rem] font-bold text-[var(--text-strong)]">
                  {detail.title}
                </h3>
              </div>
              <p className="text-[0.83rem] leading-7 text-[var(--text-soft)]">
                {detail.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
