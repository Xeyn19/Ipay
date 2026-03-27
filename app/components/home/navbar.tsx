import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/app/components/theme-toggle";
import { navigation } from "@/app/components/home/data";
import { Button } from "@/app/components/home/ui";
import logo from "@/public/img/ipaylogo.webp";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-[var(--border-light)] bg-[var(--nav-bg)] backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="#home" className="brand-logo-shell flex items-center gap-3">
          <Image
            src={logo}
            alt="iPay logo"
            className="brand-logo-image h-11 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 ease-out hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/40"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button href="#proposal" className="hidden md:inline-flex">
            Request Proposal
          </Button>

          <Link
            href="#proposal"
            className="inline-flex min-h-11 items-center rounded-md border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] md:hidden"
          >
            Proposal
          </Link>
        </div>
      </div>
    </header>
  );
}
