import { segments } from "@/app/components/home/data";
import { SectionHeader } from "@/app/components/home/ui";

export function WhoWeServe() {
  return (
    <section
      id="who-we-serve"
      className="bg-[var(--section-default)] py-28 backdrop-blur-[2px] sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Who We Serve"
          title={
            <>
              Tailored payment infrastructure
              <br />
              <span className="text-[var(--brand)]">for every growth stage</span>
            </>
          }
          description="From growing merchants to complex institutions and embedded platforms, iPay supports distinct payment flows with the same dependable infrastructure."
          align="center"
        />

        <div
          id="who-we-serve-cards"
          className="who-we-serve-grid mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-3"
        >
          {segments.map((segment) => (
            <article
              key={segment.title}
              className="who-we-serve-card flex h-full flex-col rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-7 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:shadow-[var(--shadow-card-hover)]"
            >
              <p className="w-fit rounded-full border border-[var(--border-orange)] bg-[var(--brand-pale)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                {segment.eyebrow}
              </p>
              <h3 className="font-heading mt-5 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                {segment.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--text-muted)]">
                {segment.description}
              </p>

              <div className="mt-auto pt-8">
                <div className="space-y-4 border-t border-[var(--border-light)] pt-6">
                  {segment.points.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-pale)] text-[var(--brand)] ring-1 ring-[var(--border-orange)]/70">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <path d="m5.75 10.25 2.5 2.5 6-6.5" />
                        </svg>
                      </span>
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
