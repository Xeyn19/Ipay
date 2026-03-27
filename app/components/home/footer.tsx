import Image from "next/image";
import Link from "next/link";
import { footerServices, navigation } from "@/app/components/home/data";
import logo from "@/public/img/ipaylogo.webp";

export function Footer() {
  return (
    <footer className="bg-[var(--bg-footer)] text-[var(--text-inverse)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="brand-logo-shell">
              <Image
                src={logo}
                alt="iPay logo"
                className="brand-logo-image h-11 w-auto"
              />
            </div>
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
