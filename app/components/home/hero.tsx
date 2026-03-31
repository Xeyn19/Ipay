import { Button } from "@/app/components/home/ui";

export function Hero() {
  return (
    <section
      id="home"
      className="hero-warm relative min-h-[calc(100svh-var(--nav-height))] overflow-hidden bg-transparent"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/img/girl-bg.jpg')] bg-cover bg-[position:50%_center] bg-no-repeat lg:bg-[position:40%_center] lg:bg-[length:auto_100%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.84)_0%,rgba(255,255,255,0.78)_32%,rgba(255,255,255,0.66)_100%)] lg:bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.92)_34%,rgba(255,255,255,0.56)_58%,rgba(255,255,255,0.12)_80%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(180deg,rgba(6,11,19,0.78)_0%,rgba(6,11,19,0.72)_36%,rgba(6,11,19,0.62)_100%)] dark:lg:bg-[linear-gradient(90deg,rgba(6,11,19,0.96)_0%,rgba(6,11,19,0.9)_34%,rgba(6,11,19,0.5)_60%,rgba(6,11,19,0.14)_82%,rgba(6,11,19,0)_100%)]"
      />
      <div
        id="hero-main"
        style={{ background: "transparent", backgroundImage: "none" }}
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
