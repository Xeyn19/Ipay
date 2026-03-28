import Image from "next/image";
import { AppDownloadSwitcher } from "@/app/components/home/app-download-switcher";
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
            Partner With <span className="text-[var(--tone-gold)]">IPAY INTERNATIONAL</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-base leading-8 text-[var(--text-soft)]">
            Join our growing network of top-tier financial technology partners
            and deliver seamless payment solutions to your clients.
          </p>
        </div>

        <PartnersCarousel groups={partnerCategories} />

        <div className="px-6 pb-2 pt-10 sm:px-8">
          <div className="flex flex-col gap-10 px-6 py-8 sm:px-10 md:px-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative mx-auto w-full max-w-[100px] shrink-0 sm:max-w-[480px] lg:mx-0">
              <Image
                src="/img/phone-model.png"
                alt="iPay PH mobile app preview"
                width={2067}
                height={1801}
                sizes="(min-width: 1024px) 100px, (min-width: 640px) 480px, 100vw"
                className="h-auto w-full object-contain"
                priority
              />
            </div>

            <div className="flex w-full flex-col gap-6 lg:max-w-[520px]">
              <div className="text-center lg:text-left">
                <p className="font-heading text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--tone-gold)]">
                  Download The App
                </p>
                <h3 className="font-heading mt-3 max-w-[440px] text-[clamp(1.4rem,2.6vw,2rem)] font-bold leading-[1.2] text-[var(--text-strong)] [text-align:justify] lg:max-w-none">
                  Download <span className="text-[var(--tone-gold)]">iPay International</span> now and manage payments on the go.
                </h3>
                <p className="mt-3 max-w-[460px] text-[0.92rem] leading-7 text-[var(--text-soft)] [text-align:justify] lg:max-w-none">
                  Scan the QR code to install the app and give your team faster access to collections, transfers, and day-to-day payment operations.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 lg:items-start">
                <AppDownloadSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
