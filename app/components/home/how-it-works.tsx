import { steps } from "@/app/components/home/data";
import { SectionHeader } from "@/app/components/home/ui";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[var(--section-default)] py-24 backdrop-blur-[2px] sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Operational Payment Complexity"
          title={
            <>
              We replace fragmented, manual processes with
              <span className="text-[var(--brand)]"> a single, automated infrastructure</span>
            </>
          }
          description="The Challenge"
          align="center"
        />

        <div className="relative mt-16 grid gap-6 lg:grid-cols-3">
          <div className="absolute left-[16.5%] right-[16.5%] top-8 hidden border-t-2 border-dashed border-[var(--border-orange)] lg:block" />
          {steps.map((step) => (
            <article
              key={step.number}
              className="relative rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-7 shadow-[var(--shadow-card)]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-pale)] font-heading text-xl font-bold text-[var(--brand)]">
                {step.number}
              </div>
              <h3 className="font-heading mt-6 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                {step.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--text-muted)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
