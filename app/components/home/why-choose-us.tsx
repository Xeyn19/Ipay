import { solutionFeatures } from "@/app/components/home/data";

export function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-[var(--bg-contrast)] py-24 sm:py-20">
      {/* Background Image */}
      <div
        aria-hidden="true"
        style={{ backgroundImage: "url('/img/ipay-sol.jpg')" }}
        className="pointer-events-none absolute inset-0 bg-cover bg-[position:72%_center] bg-no-repeat dark:bg-center"
      />

      {/* Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[image:var(--solution-image-overlay)]"
      />

      <div className="relative z-10 mx-auto max-w-[1100px] px-5 sm:px-8">
        <div className="text-center my-10 sm:my-16 md:my-20">
          <div className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--tone-gold-muted)]">
            <span
              className="block h-0.5 w-6 rounded-full bg-[var(--tone-gold)]"
              aria-hidden="true"
            />
            The IPAY Solution
          </div>
          <h2 className="font-heading mt-4 text-[clamp(1.75rem,4.5vw,3rem)] font-extrabold leading-[1.15] tracking-[-0.03em] text-[var(--text-strong)]">
            <span className="font-bold text-[var(--text-strong)]">Unified controls for</span>
            <span className="block text-[var(--tone-gold)]">modern payment operations</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] px-2 text-[0.9rem] font-bold leading-7 text-white sm:px-0 sm:text-base sm:leading-8 dark:text-white">
            One platform to collect, disburse, and reconcile across every major
            Philippine payment rail. No fragmentation. No manual settlement.
          </p>
        </div>


        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {solutionFeatures.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-[20px] border border-[#efd9c7] bg-[#fff6ee] px-5 py-5 backdrop-blur-0 sm:px-6 sm:py-[26px] dark:border-[var(--border-contrast)] dark:bg-[var(--bg-elevated)]/40 dark:backdrop-blur-md"
            >
              <div
                className={`absolute inset-x-0 bottom-0 h-[3px] rounded-b-[20px] ${feature.tone === "green"
                  ? "bg-[var(--tone-green)]"
                  : feature.tone === "blue"
                    ? "bg-[var(--tone-blue)]"
                    : "bg-[var(--tone-gold)]"
                  }`}
              />

              <div className="flex items-center gap-3 justify-between">
                <h3 className="font-heading text-[1.4rem] font-extrabold leading-none text-[var(--tone-gold)] sm:text-[1.7rem]">
                  {feature.title}
                </h3>
                <span className="shrink-0 rounded-full bg-[var(--bg-badge)] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)] sm:text-[0.68rem]">
                  {feature.tag}
                </span>
              </div>
              <p className="mt-2 text-[0.62rem] uppercase tracking-[0.1em] text-[var(--text-secondary)] sm:text-[0.68rem] dark:text-white">
                {feature.subtitle}
              </p>
              <p className="mt-3 text-[0.85rem] leading-6 text-[var(--text-primary)] sm:text-[0.88rem] sm:leading-7 dark:text-white [text-align:justify]">
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
