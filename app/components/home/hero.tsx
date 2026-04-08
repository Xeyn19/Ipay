import { Button } from "@/app/components/home/ui";

export function Hero() {
  return (
    <section
      id="home"
      className="hero-warm relative min-h-[65svh] overflow-hidden bg-transparent sm:min-h-[calc(100svh-var(--nav-height))]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[url('/img/girl-bg.jpg')] bg-cover bg-[position:35%_center] bg-no-repeat sm:bg-[position:50%_center] lg:bg-[position:40%_center] lg:bg-[length:auto_100%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[image:var(--hero-image-overlay-mobile)] lg:bg-[image:var(--hero-image-overlay-desktop)]"
      />
      <div
        id="hero-main"
        style={{ background: "transparent", backgroundImage: "none" }}
        className="relative z-10 mx-auto grid min-h-[65svh] max-w-7xl gap-10 px-5 pb-12 pt-6 sm:min-h-[calc(100svh-var(--nav-height))] sm:gap-14 sm:px-6 sm:pb-16 sm:pt-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-16"
      >
        <div className="flex flex-col justify-start sm:justify-center lg:justify-center">
          <div
            id="hero_2"
            className="mb-5 flex flex-wrap gap-2 sm:mb-4 sm:gap-2"
          >
            {/* Regulatory Compliant Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] px-2.5 py-1.5 shadow-sm sm:gap-2 sm:px-3 sm:py-1.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-3.5 w-3.5 text-[var(--brand)] sm:h-4 sm:w-4"
                aria-hidden="true"
              >
                <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
                <path d="m9.5 12 1.7 1.7 3.8-4.2" />
              </svg>
              <span className="text-[0.7rem] font-medium text-[var(--text-secondary)] sm:text-xs">
                Regulatory Compliant
              </span>
            </div>

            {/* BSP-Registered Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] px-2.5 py-1.5 shadow-sm sm:gap-2 sm:px-3 sm:py-1.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-3.5 w-3.5 text-[var(--brand)] sm:h-4 sm:w-4"
                aria-hidden="true"
              >
                <path d="M4 20h16" />
                <path d="M6 20V10h12v10" />
                <path d="M12 4 4 8v2h16V8l-8-4Z" />
                <path d="M9 14v2" />
                <path d="M12 14v2" />
                <path d="M15 14v2" />
              </svg>
              <span className="text-[0.7rem] font-medium text-[var(--text-secondary)] sm:text-xs">
                BSP-Registered
              </span>
            </div>

            {/* Enterprise Grade Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-light)] bg-[var(--bg-elevated)] px-2.5 py-1.5 shadow-sm sm:gap-2 sm:px-3 sm:py-1.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-3.5 w-3.5 text-[var(--brand)] sm:h-4 sm:w-4"
                aria-hidden="true"
              >
                <rect x="4" y="4" width="16" height="16" rx="3" />
                <path d="M8 9h8" />
                <path d="M8 12h8" />
                <path d="M8 15h5" />
              </svg>
              <span className="text-[0.7rem] font-medium text-[var(--text-secondary)] sm:text-xs">
                Enterprise Grade
              </span>
            </div>
          </div>
          <h1 className="font-heading max-w-4xl text-[2rem] font-bold leading-[1.1] tracking-[-0.02em] text-white sm:text-[clamp(3rem,6vw,5.25rem)] sm:leading-[0.96] sm:tracking-[-0.05em]">
            <span className="block lg:whitespace-nowrap">Powering Seamless</span>
            <span className="block text-[var(--brand)] lg:whitespace-nowrap">
              Business Payments
            </span>
            <span className="block lg:whitespace-nowrap">
              Across the Philippines
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-[1rem] leading-[1.6] text-white/90 sm:mt-6 sm:text-[clamp(1.125rem,1.5vw,1.35rem)] sm:leading-9 sm:text-white">
            Dependable, efficient, and secure payment solutions for growing
            enterprises, SMEs, and institutions.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <Button href="#proposal" className="text-[0.9rem] sm:text-base">
              Request Proposal
            </Button>
            <Button href="#services" variant="secondary" className="text-[0.9rem] sm:text-base">
              Explore Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
