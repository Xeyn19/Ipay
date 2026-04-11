'use client'

import { useState } from "react";
import type { Theme } from "@/app/lib/theme";
import { DashboardNavbar } from "@/app/components/dashboard/dashboard-navbar";
import { DashboardSidebar } from "@/app/components/dashboard/dashboard-sidebar";

export function DashboardShell({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <DashboardNavbar
        initialTheme={initialTheme}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="pt-[var(--nav-height)] transition-[padding] duration-300 lg:pl-[var(--sidebar-width)]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
