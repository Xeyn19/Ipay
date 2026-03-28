import { Button } from "@/app/components/home/ui";

export function Hero() {
  return (
    <section
      id="home"
      className="hero-warm relative min-h-[calc(100svh-var(--nav-height))] overflow-hidden bg-transparent"
    >
      <div
        id="main"
        className="relative z-10 mx-auto grid min-h-[calc(100svh-var(--nav-height))] max-w-7xl gap-14 px-4 pb-16 pt-6 sm:px-6 sm:pb-16 sm:pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-16"
      >
        <div className="flex flex-col justify-start lg:justify-center">
          <h1 className="font-heading max-w-4xl text-[clamp(3rem,6vw,5.25rem)] font-bold leading-[0.96] tracking-[-0.05em] text-[var(--text-primary)]">
            <span className="block lg:whitespace-nowrap">Powering Seamless</span>
            <span className="block text-[var(--brand)] lg:whitespace-nowrap">
              Business Payments
            </span>
            <span className="block lg:whitespace-nowrap">
              Across the Philippines
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-[clamp(1.125rem,1.5vw,1.35rem)] leading-9 text-[var(--text-secondary)]">
            Dependable, efficient, and secure payment solutions for growing
            enterprises, SMEs, and institutions.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="#proposal" className="text-base">
              Request Proposal
            </Button>
            <Button href="#services" variant="secondary" className="text-base">
              Explore Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
