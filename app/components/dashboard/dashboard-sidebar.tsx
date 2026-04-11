'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  {
    label: "Leads",
    href: "/dashboard/leads",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM6 17v-1a4 4 0 014-4h0a4 4 0 014 4v1" />
        <path d="M16 3.13a4 4 0 010 7.75" />
        <path d="M17 14h1a4 4 0 014 4v1" opacity="0.4" />
      </svg>
    ),
  },
];

export function DashboardSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
          style={{ top: "var(--nav-height)" }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar fixed top-[var(--nav-height)] bottom-0 left-0 z-40 w-[var(--sidebar-width)] border-r border-[var(--border-light)] bg-[var(--bg-base)] transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col gap-1 p-3 pt-4">
          <p className="mb-2 px-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--text-faint)]">
            Navigation
          </p>

          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)] shadow-sm"
                    : "border border-transparent text-[var(--text-secondary)] hover:border-[var(--border-light)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className={`flex shrink-0 items-center justify-center ${isActive ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
