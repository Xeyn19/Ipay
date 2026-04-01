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
        className="pointer-events-none absolute inset-0 bg-[image:var(--hero-image-overlay-mobile)] lg:bg-[image:var(--hero-image-overlay-desktop)]"
      />
      <div
        id="hero-main"
        style={{ background: "transparent", backgroundImage: "none" }}
        className="relative z-10 mx-auto grid min-h-[calc(100svh-var(--nav-height))] max-w-7xl gap-14 px-4 pb-16 pt-6 sm:px-6 sm:pb-16 sm:pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-16"
      >
        <div className="flex flex-col justify-start lg:justify-center">
          <div
            id="hero_2"
            className="mb-4 flex flex-wrap gap-2"
          >
            {/* Regulatory Compliant Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 py-1.5 shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-4 w-4 text-[var(--brand)]"
                aria-hidden="true"
              >
                <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
                <path d="m9.5 12 1.7 1.7 3.8-4.2" />
              </svg>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Regulatory Compliant
              </span>
            </div>

            {/* BSP-Registered Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 py-1.5 shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-4 w-4 text-[var(--brand)]"
                aria-hidden="true"
              >
                <path d="M4 20h16" />
                <path d="M6 20V10h12v10" />
                <path d="M12 4 4 8v2h16V8l-8-4Z" />
                <path d="M9 14v2" />
                <path d="M12 14v2" />
                <path d="M15 14v2" />
              </svg>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                BSP-Registered
              </span>
            </div>

            {/* Enterprise Grade Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3 py-1.5 shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-4 w-4 text-[var(--brand)]"
                aria-hidden="true"
              >
                <rect x="4" y="4" width="16" height="16" rx="3" />
                <path d="M8 9h8" />
                <path d="M8 12h8" />
                <path d="M8 15h5" />
              </svg>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Enterprise Grade
              </span>
            </div>
          </div>
          <h1 className="font-heading max-w-4xl text-[clamp(3rem,6vw,5.25rem)] font-bold leading-[0.96] tracking-[-0.05em] text-white">
            <span className="block lg:whitespace-nowrap">Powering Seamless</span>
            <span className="block text-[var(--brand)] lg:whitespace-nowrap">
              Business Payments
            </span>
            <span className="block lg:whitespace-nowrap">
              Across the Philippines
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-[clamp(1.125rem,1.5vw,1.35rem)] leading-9 text-white">
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
