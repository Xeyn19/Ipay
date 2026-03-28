import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/app/components/home/brand-logo";
import { footerServices, navigation } from "@/app/components/home/data";

const googlePlayUrl =
  "https://play.google.com/store/apps/details?id=ph.ipay.android";
const appStoreUrl = "https://apps.apple.com/ph/app/ipays/id6479975365";
const corSealImageUrl = "/img/CORSeal (2)_page-0001.png";
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

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[280px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_340px] xl:gap-12 lg:px-8">
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

        <div className="relative flex flex-col gap-5 md:col-span-2 lg:col-span-4 xl:col-span-1 xl:justify-self-end">
          <div
            className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#121820_0%,#10161f_100%)] px-6 pb-6 pt-7 shadow-[0_24px_56px_rgba(2,6,23,0.34)]"
          >
            <div className="pointer-events-none absolute inset-x-[10%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,166,35,0.55),transparent)]" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.07)_0%,transparent_65%)]" />

            <div className="relative z-[1] flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(245,166,35,0.24)] bg-[rgba(245,166,35,0.1)] px-3.5 py-1.5">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-[var(--tone-gold)] shadow-[0_0_6px_rgba(245,166,35,1)]"
                />
                <span className="font-heading text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--tone-gold)]">
                  Get The App
                </span>
              </div>
            </div>

            <div className="relative z-[1] mt-5">
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[#5a6a84]">
                Mobile Access
              </p>
              <h3 className="mt-1 font-heading text-[1.56rem] font-extrabold leading-[1.16] text-[var(--text-inverse)]">
                Download from your
                <br />
                <span className="text-[var(--tone-gold)]">preferred app store</span>
              </h3>
            </div>

            <div className="relative z-[1] mb-4 h-px bg-white/7" />

            <div className="relative z-[1] grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Link
                href={googlePlayUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative flex min-h-[58px] items-center gap-3 overflow-hidden rounded-[16px] border border-white/6 bg-[#151b24] px-4 py-3 text-left text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(245,166,35,0.24)] hover:bg-[#18202a]"
              >
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(245,166,35,0.06),transparent)] opacity-0 transition duration-200 group-hover:opacity-100" />
                <span className="relative flex w-5 shrink-0 items-center justify-center">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <path
                      fill="#4285F4"
                      d="M4.93 2.89C4.38 3.09 4 3.62 4 4.28v15.44c0 .66.38 1.19.93 1.39L13.5 12 4.93 2.89Z"
                    />
                    <path
                      fill="#34A853"
                      d="M16.53 15.02 13.5 12 4.93 21.11c.35.13.75.09 1.14-.13l10.46-5.96Z"
                    />
                    <path
                      fill="#FBBC04"
                      d="M16.53 8.98 6.07 3.02c-.39-.22-.79-.26-1.14-.13L13.5 12l3.03-3.02Z"
                    />
                    <path
                      fill="#EA4335"
                      d="m16.53 8.98-3.03 3.02 3.03 3.02 3.63-2.07c1.12-.64 1.12-1.67 0-2.31l-3.63-2.07Z"
                    />
                  </svg>
                </span>
                <span className="relative flex flex-col leading-tight">
                  <span className="text-[0.56rem] font-medium uppercase tracking-[0.08em] text-[#5a6a84]">
                    Get it on
                  </span>
                  <span className="font-heading text-[0.82rem] font-bold text-[var(--text-inverse)]">
                    Google Play
                  </span>
                </span>
              </Link>
              <Link
                href={appStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative flex min-h-[58px] items-center gap-3 overflow-hidden rounded-[16px] border border-white/6 bg-[#090a0c] px-4 py-3 text-left text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:border-white/12 hover:bg-[#101216]"
              >
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent)] opacity-0 transition duration-200 group-hover:opacity-100" />
                <span className="relative flex w-5 shrink-0 items-center justify-center">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    className="shrink-0 text-white"
                  >
                    <path d="M16.365 1.43c0 1.14-.425 2.223-1.18 3.063-.757.84-1.98 1.484-3.046 1.4-.132-1.072.433-2.22 1.165-3.06.804-.924 2.13-1.587 3.061-1.403ZM20.58 17.11c-.54 1.187-.798 1.715-1.49 2.794-.964 1.5-2.322 3.37-4.005 3.386-1.497.014-1.883-.97-3.916-.958-2.034.012-2.457.976-3.954.962-1.688-.016-2.973-1.698-3.937-3.197-2.695-4.167-2.98-9.05-1.318-11.576 1.178-1.788 3.04-2.848 4.795-2.848 1.79 0 2.918.976 4.401.976 1.437 0 2.313-.976 4.39-.976 1.47 0 3.028.798 4.206 2.173-3.699 2.027-3.093 7.31.828 9.264Z" />
                  </svg>
                </span>
                <span className="relative flex flex-col leading-tight">
                  <span className="text-[0.56rem] font-medium tracking-[0.04em] text-white/45">
                    Download on
                  </span>
                  <span className="font-heading text-[0.82rem] font-bold text-[var(--text-inverse)]">
                    App Store
                  </span>
                </span>
              </Link>
            </div>

            <p className="relative z-[1] mt-4 text-center text-[0.72rem] leading-6 text-[#5a6a84]">
              Visit Google Play or the App Store to install iPay.
            </p>
          </div>

          <div className="relative mx-auto flex flex-col items-center justify-center gap-2">
            <a
              href={corSealImageUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open certificate of registration image in a new tab"
              className="transition duration-200 ease-out hover:opacity-90"
            >
              <Image
                src={corSealImageUrl}
                alt="COR Seal"
                width={2481}
                height={3508}
                unoptimized
                className="h-auto w-[200px] object-contain"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-xs text-slate-500">
            2026 <span className="text-[var(--tone-gold)]">iPay International</span>. All
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
