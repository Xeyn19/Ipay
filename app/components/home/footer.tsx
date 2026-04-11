import Image from "next/image";
import Link from "next/link";
import { DM_Sans, Sora } from "next/font/google";
import { BrandLogo } from "@/app/components/home/brand-logo";
import { footerServices, navigation, trustItems } from "@/app/components/home/data";

function getSectionHref(sectionId: string) {
  return sectionId === "home" ? "/" : `/#${sectionId}`;
}

const googlePlayUrl =
  "https://play.google.com/store/apps/details?id=ph.ipay.android";
const appStoreUrl = "https://apps.apple.com/ph/app/ipays/id6479975365";
const corSealImageUrl = "/img/CORSeal (2)_page-0001.png";
const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
const credentialIcons = {
  "Regulatory Compliant": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="m9.5 12 1.7 1.7 3.8-4.2" />
    </svg>
  ),
  "BSP-Registered Operator": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M4 20h16" />
      <path d="M6 20V10h12v10" />
      <path d="M12 4 4 8v2h16V8l-8-4Z" />
      <path d="M9 14v2" />
      <path d="M12 14v2" />
      <path d="M15 14v2" />
    </svg>
  ),
  "Enterprise Grade": (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 9h8" />
      <path d="M8 12h8" />
      <path d="M8 15h5" />
    </svg>
  ),
} as const;

export function Footer() {
  return (
    <footer
      className={`${dmSans.className} relative overflow-hidden border-t border-white/10 bg-[#0D0D1A] text-white`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-[-7.5rem] h-[18.75rem] w-[31.25rem] rounded-full bg-[radial-gradient(ellipse,rgba(245,166,35,0.08)_0%,transparent_70%)]"
      />

      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 pb-12 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1.8fr] xl:items-start xl:gap-8">
          <div className="mx-auto flex max-w-[18.5rem] flex-col items-center gap-5 text-center md:mx-0 md:items-start md:text-left">
            <div className="flex items-center justify-center md:justify-start">
              <BrandLogo variant="dark" className="w-[9.5rem]" />
            </div>
            <div className="h-0.5 w-10 rounded-full bg-[linear-gradient(90deg,#F5A623,transparent)]" />
            <p
              className={`${sora.className} mx-auto max-w-[15rem] text-[0.68rem] font-bold leading-6 uppercase tracking-[0.14em] text-white/44 md:mx-0`}
            >
              Powering Seamless Business Payments Across the Philippines
            </p>
            <p className="mx-auto max-w-xs text-[0.92rem] font-normal leading-7 text-white/66 md:mx-0">
              Dependable, efficient, and secure payment solutions for growing
              enterprises, SMEs, and institutions.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <p
              className={`${sora.className} text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#F5A623]`}
            >
              Navigation
            </p>
            <div className="flex flex-col items-center gap-4 text-sm text-white/64 md:items-start">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={getSectionHref(item.sectionId)}
                  className="inline-block text-[0.92rem] leading-none text-white/64 transition duration-200 ease-out hover:translate-x-[3px] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
            <p
              className={`${sora.className} text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#F5A623]`}
            >
              Solutions
            </p>
            <div className="flex flex-col items-center gap-4 text-sm text-white/64 md:items-start">
              {footerServices.map((item) => (
                <p key={item} className="text-[0.92rem] leading-none text-white/64">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="relative md:col-span-2 xl:col-span-1 xl:justify-self-end">
            <div className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#121820_0%,#10161f_100%)] px-6 pb-6 pt-7 shadow-[0_24px_56px_rgba(2,6,23,0.34)]">
              <div className="pointer-events-none absolute inset-x-[10%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(245,166,35,0.55),transparent)]" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.07)_0%,transparent_65%)]" />

              <div className="relative z-[1] flex items-center justify-center gap-4 md:justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(245,166,35,0.24)] bg-[rgba(245,166,35,0.1)] px-3.5 py-1.5">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-[#F5A623] shadow-[0_0_6px_rgba(245,166,35,1)]"
                  />
                  <span
                    className={`${sora.className} text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#F5A623]`}
                  >
                    Get The App
                  </span>
                </div>
              </div>

              <div className="relative z-[1] mt-5 text-center md:text-left">
                <p className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[#5a6a84]">
                  Mobile Access
                </p>
                <h3
                  className={`${sora.className} mt-1 text-[1.56rem] font-extrabold leading-[1.16] text-white`}
                >
                  Download from your
                  <br />
                  <span className="text-[#F5A623]">preferred app store</span>
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
                    <span className={`${sora.className} text-[0.82rem] font-bold text-white`}>
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
                    <span className={`${sora.className} text-[0.82rem] font-bold text-white`}>
                      App Store
                    </span>
                  </span>
                </Link>
              </div>

              <p className="relative z-[1] mt-4 text-center text-[0.72rem] leading-6 text-[#5a6a84]">
                Visit Google Play or the App Store to install iPay.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="xl:-mt-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-2 sm:px-6 xl:flex-row xl:items-center xl:gap-8 lg:px-8">
          <div className="flex-1 overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.03]">
            <div className="grid divide-y divide-white/8 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
              {trustItems.map((item) => (
                <div
                  key={item.title}
                  className="flex flex-col items-center gap-4 px-5 py-4 text-center lg:flex-row lg:text-left lg:px-6 lg:py-5"
                >
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.08)] text-[#F5A623]">
                    {credentialIcons[item.title as keyof typeof credentialIcons]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-white/42">
                      {item.title}
                    </p>
                    <p className={`${sora.className} mt-1 text-[0.94rem] font-bold leading-5 text-white`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center xl:ml-auto xl:justify-end">
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
                className="h-auto w-[145px] object-contain sm:w-[170px]"
              />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-center text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between md:text-left lg:px-8">
          <p className="text-xs text-slate-500">
            2026 <span className="text-[var(--tone-gold)]">iPay International</span>. All
            rights reserved.
          </p>
          <p className="mx-auto max-w-[32rem] text-center text-xs leading-6 text-slate-500 md:mx-0 md:text-right">
            Join the growing number of Philippine enterprises streamlining
            their financial operations with IPAY INTERNATIONAL.
          </p>
        </div>
      </div>
    </footer>
  );
}
