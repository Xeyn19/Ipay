import Link from "next/link";
import PartnersCarousel from "@/app/components/partners-carousel";
import { partnerCategories } from "@/app/components/home/data";

export function Partners() {
  return (
    <section
      id="partners"
      className="relative overflow-hidden py-24 sm:py-20"
      style={{ background: "var(--partners-bg)" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: "var(--partners-overlay)" }}
      />
      <div className="relative mx-auto max-w-[1200px]">
        <div className="px-6 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-badge)] bg-[var(--partners-badge-bg)] px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--tone-gold-muted)] shadow-[var(--shadow-badge)] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--tone-gold)]" aria-hidden="true" />
            Trusted Ecosystem
          </div>
          <h2 className="font-heading mt-5 text-[clamp(2.2rem,5vw,3.2rem)] font-extrabold leading-[1.08] tracking-[-0.04em] text-[var(--text-strong)]">
            Partner With <span className="text-[var(--tone-gold)]">IPAY PH</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-base leading-8 text-[var(--text-soft)]">
            Join our growing network of top-tier financial technology partners
            and deliver seamless payment solutions to your clients.
          </p>
        </div>

        <PartnersCarousel groups={partnerCategories} />

        <div className="px-6 pb-2 pt-10 sm:px-8">
          <div
            className="flex flex-col items-start justify-between gap-6 rounded-[24px] border border-white/10 px-6 py-8 shadow-[var(--shadow-large-strong)] sm:px-10 md:flex-row md:items-center md:px-12"
            style={{ background: "var(--partners-cta-bg)" }}
          >
            <div>
              <h3 className="font-heading max-w-[420px] text-[clamp(1.2rem,2.5vw,1.7rem)] font-bold leading-[1.3] text-[var(--text-inverse)]">
                Ready to grow with <span className="text-[var(--tone-gold)]">IPAY PH?</span>
              </h3>
              <p className="mt-1.5 text-[0.85rem] leading-6 text-[var(--text-inverse-muted)]">
                Join hundreds of businesses already thriving in our ecosystem.
              </p>
            </div>

            <Link
              href="#proposal"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--tone-gold)] px-[30px] py-[15px] font-heading text-[0.9rem] font-bold text-[var(--text-cta)] shadow-[var(--shadow-gold)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--brand-light)] hover:shadow-[var(--shadow-gold-hover)]"
            >
              Become a Partner
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
