import { services } from "@/app/components/home/data";
import { SectionHeader } from "@/app/components/home/ui";

export function Services() {
  return (
    <section
      id="services"
      className="bg-[var(--section-muted)] py-24 backdrop-blur-[2px] sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Core Capabilities"
          title={
            <>
              Built for scale,
              <span className="text-[var(--brand)]"> designed for reliability</span>
            </>
          }
          description="Core Capabilities"
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.title}
              className="rounded-[20px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-pale)] text-lg font-semibold text-[var(--brand)]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="font-heading mt-5 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                {service.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
