import Link from "next/link";
import { BrandLogo } from "@/app/components/home/brand-logo";
import { footerServices, navigation } from "@/app/components/home/data";

const googlePlayUrl =
  "https://play.google.com/store/apps/details?id=ph.ipay.android";
const appStoreUrl = "https://apps.apple.com/ph/app/ipays/id6479975365";
const qrBackgroundImage = `url("https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&format=png&ecc=H&color=F17A1E&bgcolor=FFFFFF&data=${encodeURIComponent(
  googlePlayUrl,
)}")`;
const credentials = [
  {
    label: "Regulatory Compliant",
    value: "OPSCOR-2025-0002",
  },
  {
    label: "BSP-Registered Operator",
    value: "of Payment System",
  },
  {
    label: "Enterprise Grade Secure",
    value: "Infrastructure",
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[var(--bg-footer)] text-[var(--text-inverse)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-[-7.5rem] h-[18.75rem] w-[31.25rem] rounded-full bg-[radial-gradient(ellipse,rgba(245,166,35,0.08)_0%,transparent_70%)]"
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[280px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_320px] xl:gap-12 lg:px-8">
        <div className="flex max-w-[17.5rem] flex-col gap-5">
          <div className="flex items-center">
            <BrandLogo variant="dark" className="w-[9.5rem]" />
          </div>
          <div className="h-0.5 w-10 rounded-full bg-[linear-gradient(90deg,var(--tone-gold),transparent)]" />
          <p className="max-w-[15rem] font-heading text-[0.68rem] font-bold uppercase tracking-[0.14em] leading-6 text-slate-500">
            Powering Seamless Business Payments Across the Philippines
          </p>
          <p className="max-w-xs text-[0.84rem] font-light leading-7 text-slate-400">
            Dependable, efficient, and secure payment solutions for growing
            enterprises, SMEs, and institutions.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p className="font-heading text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--tone-gold)]">
            Navigation
          </p>
          <div className="flex flex-col gap-4 text-sm text-slate-400">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="inline-block text-[0.88rem] leading-none text-slate-400 transition duration-200 ease-out hover:translate-x-[3px] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="font-heading text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--tone-gold)]">
            Solutions
          </p>
          <div className="flex flex-col gap-4 text-sm text-slate-400">
            {footerServices.map((item) => (
              <p key={item} className="text-[0.88rem] leading-none text-slate-400">
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="font-heading text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--tone-gold)]">
            Credentials
          </p>
          <div className="flex flex-col gap-3">
            {credentials.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-[10px] border border-white/8 bg-white/[0.02] px-3.5 py-3 transition duration-200 ease-out hover:border-[rgba(245,166,35,0.2)] hover:bg-[rgba(245,166,35,0.12)]"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.38rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--tone-gold)]"
                />
                <p className="text-[0.8rem] leading-6 text-slate-400">
                  {item.label}
                  <br />
                  <span className="font-semibold text-[var(--text-inverse)]">
                    {item.value}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative md:col-span-2 lg:col-span-4 xl:col-span-1 xl:justify-self-end">
          <div
            className="relative overflow-hidden rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(20,28,46,0.98)_0%,rgba(11,15,26,1)_100%)] p-6 shadow-[var(--shadow-large-strong)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,166,35,0.5),transparent)]" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[rgba(245,166,35,0.14)] blur-3xl" />

            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.12)] px-3 py-1.5 shadow-[var(--shadow-badge)]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-[var(--tone-gold)] shadow-[0_0_6px_rgba(245,166,35,1)]"
              />
              <span className="font-heading text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--tone-gold)]">
                Mobile App
              </span>
            </div>

            <div className="mt-5 font-heading">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-inverse-muted)]">
                Download iPay
              </p>
              <h3 className="mt-1 text-[1.38rem] font-extrabold leading-[1.2] text-white">
                Scan to get the
                <br />
                <span className="text-[var(--tone-gold)]">iPay app</span>
              </h3>
            </div>

            <div className="qr-orbit-shell mt-5">
              <div aria-hidden="true" className="qr-orbit-frame" />
              <div className="qr-orbit-card relative w-[220px] max-w-full rounded-[14px] bg-white p-3 shadow-[0_18px_36px_rgba(2,6,23,0.18)]">
                <div className="relative flex items-center justify-center rounded-[6px]">
                  <div
                    aria-label="QR code for the iPay Google Play app page"
                    className="aspect-square w-full rounded-[6px] bg-white bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: qrBackgroundImage }}
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="rounded-[6px] bg-[var(--tone-gold)] px-3.5 py-1.5 font-heading text-[0.82rem] font-extrabold uppercase tracking-[0.1em] text-[#0b0f1a] shadow-[0_8px_18px_rgba(245,166,35,0.28)]">
                      IPAY
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                href={googlePlayUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[10px] bg-[var(--tone-gold)] px-4 text-[0.8rem] font-semibold text-[#0b0f1a] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--brand-light)] hover:shadow-[0_6px_20px_rgba(245,166,35,0.35)]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3 20.5v-17c0-.83 1.01-1.3 1.68-.77l14 8.5c.6.36.6 1.18 0 1.54l-14 8.5C4.01 21.8 3 21.33 3 20.5z" />
                </svg>
                Google Play
              </Link>
              <Link
                href={appStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[10px] border border-white/8 bg-transparent px-4 text-[0.8rem] font-semibold text-white transition duration-200 ease-out hover:border-[rgba(245,166,35,0.3)] hover:bg-[rgba(245,166,35,0.12)]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </Link>
            </div>

            <p className="mt-4 text-center text-[0.68rem] leading-6 text-slate-500">
              Scan the QR or open the app directly from your store.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-xs text-slate-500">
            2026 <span className="text-[var(--tone-gold)]">iPay</span>. All
            rights reserved.
          </p>
          <p className="max-w-[32rem] text-xs leading-6 text-slate-500 md:text-right">
            Join the growing number of Philippine enterprises streamlining
            their financial operations with IPAY INTERNATIONAL.
          </p>
        </div>
      </div>
    </footer>
  );
}
