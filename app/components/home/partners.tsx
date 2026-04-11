"use client";

import { useState, useEffect, useCallback } from "react";
// import Image from "next/image";
// import { AppDownloadSwitcher } from "@/app/components/home/app-download-switcher";
import { partnerCategories } from "@/app/components/home/data";
import type { PartnerCategory, PartnerLogo } from "@/app/components/home/types";

const TAB_KEYS = [
  "Digital Collection Channels",
  "Digital Disbursement Channels",
  "Merchant",
  "E-Commerce",
  "Office Automation",
] as const;

type TabKey = (typeof TAB_KEYS)[number];

const AUTO_SWITCH_INTERVAL = 4000; // 4 seconds

function getTabData(tabKey: TabKey): PartnerCategory | undefined {
  return partnerCategories.find((cat) => cat.title === tabKey);
}

function LogoCard({ logo }: { logo: PartnerLogo }) {
  const [hasError, setHasError] = useState(!logo.src);

  // Extract background color from wrapperClassName if present
  const bgColorMatch = logo.wrapperClassName?.match(/bg-\[([^\]]+)\]/);
  const bgColor = bgColorMatch ? bgColorMatch[1] : "white";

  // Check if it's a square logo (Merchant, E-Commerce, Office Automation)
  const isSquareLogo = logo.width === logo.height;

  if (isSquareLogo) {
    return (
      <div
        className="flex shrink-0 h-[100px] w-[100px] items-center justify-center rounded-[20px] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] sm:h-[120px] sm:w-[120px] lg:h-[130px] lg:w-[130px]"
        style={{ backgroundColor: bgColor }}
      >
        {logo.src && !hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.src}
            alt={logo.name}
            className={logo.className ?? "h-full w-full object-contain"}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[var(--text-muted)]">
            {logo.name}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex shrink-0 h-[80px] w-[140px] items-center justify-center rounded-[16px] bg-white p-3 shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] sm:h-[90px] sm:w-[170px] lg:h-[100px] lg:w-[190px] lg:p-4">
      {logo.src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.src}
          alt={logo.name}
          className="h-full w-full object-contain"
          style={{
            objectPosition: logo.marqueePosition ?? "center center",
          }}
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="text-sm font-medium text-[var(--text-muted)]">
          {logo.name}
        </div>
      )}
    </div>
  );
}

export function Partners() {
  const [activeTab, setActiveTab] = useState<TabKey>("Digital Collection Channels");
  const [isPaused, setIsPaused] = useState(false);
  const activeData = getTabData(activeTab);

  const goToNextTab = useCallback(() => {
    setActiveTab((current) => {
      const currentIndex = TAB_KEYS.indexOf(current);
      const nextIndex = (currentIndex + 1) % TAB_KEYS.length;
      return TAB_KEYS[nextIndex];
    });
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(goToNextTab, AUTO_SWITCH_INTERVAL);
    return () => clearInterval(interval);
  }, [isPaused, goToNextTab]);

  const handleTabClick = (tabKey: TabKey) => {
    setActiveTab(tabKey);
    setIsPaused(true);
    // Resume auto-switching after 10 seconds of inactivity
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <section
      id="partners"
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ background: "var(--partners-bg)" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: "var(--partners-overlay)" }}
      />
      <div className="relative mx-auto max-w-[1200px] px-6 sm:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-badge)] bg-[var(--partners-badge-bg)] px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--tone-gold-muted)] shadow-[var(--shadow-badge)] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--tone-gold)]" aria-hidden="true" />
            Trusted Ecosystem
          </div>
          <h2 className="font-heading mt-5 text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[var(--text-strong)]">
            Partner With <span className="text-[var(--tone-gold)]">IPAY INTERNATIONAL</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-base leading-7 text-[var(--text-soft)]">
            Join our ecosystem to deliver superior financial technology to your clients.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {TAB_KEYS.map((tabKey) => {
            const isActive = activeTab === tabKey;
            const category = getTabData(tabKey);
            const label = category?.tabLabel ?? tabKey;

            return (
              <button
                key={tabKey}
                onClick={() => handleTabClick(tabKey)}
                className={`
                  rounded-full px-4 py-2 text-[0.8rem] font-semibold transition-all duration-150 shrink-0 whitespace-nowrap
                  sm:px-5 sm:py-2.5 sm:text-sm
                  ${
                    isActive
                      ? "bg-[rgba(245,166,35,0.15)] text-[var(--tone-gold)] ring-1 ring-[rgba(245,166,35,0.4)]"
                      : "border border-[var(--border-soft)] bg-transparent text-[var(--text-muted)] hover:border-[var(--border-medium)] hover:text-[var(--text-secondary)]"
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Logo Panel */}
        <div className="mt-10 flex min-h-[320px] items-start justify-center sm:mt-12 sm:min-h-[240px] md:min-h-[160px]">
          <div
            key={activeTab}
            className="flex flex-wrap items-center justify-center gap-4 animate-[fadeIn_120ms_ease-out] sm:gap-5"
          >
            {activeData?.logos.map((logo, index) => (
              <LogoCard key={`${activeTab}-${logo.name}-${index}`} logo={logo} />
            ))}
          </div>
        </div>

        {/* Category Counter */}
        {activeData && (
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-[var(--text-muted)]">
              {activeData.counterLabel}
            </p>
          </div>
        )}

        {/* App Download Section
        <div className="mt-16 pt-10">
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
                <h3 className="font-heading mt-3 max-w-[440px] text-[clamp(1.4rem,2.6vw,2rem)] font-bold leading-[1.2] text-[var(--text-strong)] lg:max-w-none">
                  Download <span className="text-[var(--tone-gold)]">iPay International</span> now and manage payments on the go.
                </h3>
                <p className="mt-3 max-w-[460px] text-[0.92rem] leading-7 text-[var(--text-soft)] lg:max-w-none">
                  Scan the QR code to install the app and give your team faster access to collections, transfers, and day-to-day payment operations.
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 lg:items-start">
                <AppDownloadSwitcher />
              </div>
            </div>
          </div>
        </div>
         */}
      </div>
    </section>
  );
}
