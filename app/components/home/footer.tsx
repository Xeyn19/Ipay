import Image from "next/image";
import Link from "next/link";
import { footerServices, navigation } from "@/app/components/home/data";
import logo from "@/public/img/ipaylogo.webp";

const googlePlayUrl =
  "https://play.google.com/store/apps/details?id=ph.ipay.android";
const appStoreUrl = "https://apps.apple.com/ph/app/ipays/id6479975365";
const qrBackgroundImage = `url("https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&format=png&ecc=H&color=F17A1E&bgcolor=FFFFFF&data=${encodeURIComponent(
  googlePlayUrl,
)}")`;

export function Footer() {
  return (
    <footer className="bg-[var(--bg-footer)] text-[var(--text-inverse)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_minmax(0,1.15fr)] lg:px-8">
        <div className="lg:max-w-sm">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="iPay logo" className="h-11 w-auto" />
            <div>
              <p className="text-xs text-slate-400">
                Powering Seamless Business Payments Across the Philippines
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
            Dependable, efficient, and secure payment solutions for growing
            enterprises, SMEs, and institutions.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Navigation
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
            {navigation.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Solutions
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
            {footerServices.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Credentials
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p>Regulatory Compliant OPSCOR-2025-0002</p>
            <p>BSP-Registered Operator of Payment System</p>
            <p>Enterprise Grade Secure Infrastructure</p>
          </div>
        </div>

        <div className="relative lg:justify-self-end">
          <div
            className="relative overflow-hidden rounded-[30px] border border-[var(--border-badge)] px-5 py-6 shadow-[var(--shadow-large-strong)] sm:px-6"
            style={{ background: "var(--partners-cta-bg)" }}
          >
            <div className="pointer-events-none absolute -right-14 -top-14 h-32 w-32 rounded-full bg-[var(--brand)]/18 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-[var(--tone-gold)]/12 blur-3xl" />

            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-badge)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--tone-gold)] shadow-[var(--shadow-badge)] backdrop-blur-sm lg:ml-auto lg:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--tone-gold)]" aria-hidden="true" />
              Mobile App
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-inverse-muted)] lg:text-right">
              Download iPay
            </p>
            <h3 className="font-heading mt-3 text-[1.9rem] font-bold leading-[1.02] tracking-[-0.05em] text-white sm:text-[2.2rem] lg:ml-auto lg:max-w-[15rem] lg:text-right">
              Scan to get the <span className="text-[var(--tone-gold)]">iPay app</span>
            </h3>

            <div className="mt-6 flex justify-center lg:justify-end">
              <div className="relative rounded-[28px] border border-[var(--border-badge)] bg-[linear-gradient(180deg,_#fffaf6_0%,_#ffffff_100%)] p-3 shadow-[0_18px_38px_rgba(0,0,0,0.26)]">
                <div
                  aria-label="QR code for the iPay Google Play app page"
                  className="h-[208px] w-[208px] rounded-[22px] bg-white bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: qrBackgroundImage }}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="rounded-[20px] border-4 border-white bg-[linear-gradient(135deg,var(--brand),var(--brand-light))] px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-[var(--shadow-button)]">
                    iPay
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href={googlePlayUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--tone-gold)] px-5 text-sm font-semibold text-[var(--text-cta)] shadow-[var(--shadow-gold)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--brand-light)] hover:shadow-[var(--shadow-gold-hover)]"
              >
                Google Play
              </Link>
              <Link
                href={appStoreUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-badge)] bg-[rgba(255,255,255,0.04)] px-5 text-sm font-semibold text-white transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[rgba(255,255,255,0.08)]"
              >
                App Store
              </Link>
            </div>

            <p className="mt-3 text-xs leading-6 text-[var(--text-inverse-muted)] lg:text-right">
              Scan the QR or open the app directly from your store.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>(c) 2026 iPay. All rights reserved.</p>
          <p>
            Join the growing number of Philippine enterprises streamlining
            their financial operations with IPAY INTERNATIONAL.
          </p>
        </div>
      </div>
    </footer>
  );
}
