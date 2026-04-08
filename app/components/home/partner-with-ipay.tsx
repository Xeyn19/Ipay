'use client';

import { useState, type CSSProperties } from "react";
import { partnerCategories } from "@/app/components/home/data";
import type { PartnerCategory, PartnerLogo } from "@/app/components/home/types";

const TAB_KEYS = [
  "Digital Collection Channels",
  "Digital Disbursement Channels",
  "Merchant",
  "E-Commerce",
  "Office Automation",
] as const;

type TabKey = typeof TAB_KEYS[number];

function getTabData(tabKey: TabKey): PartnerCategory | undefined {
  return partnerCategories.find((cat) => cat.title === tabKey);
}

function LogoCard({ logo }: { logo: PartnerLogo }) {
  const [hasError, setHasError] = useState(!logo.src);

  if (logo.wrapperClassName) {
    return (
      <div className={logo.wrapperClassName}>
        {logo.src && !hasError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.src}
            alt={logo.name}
            className={logo.className ?? "h-full w-full object-contain"}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-[var(--text-muted)]">
            {logo.name}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-[72px] w-[140px] items-center justify-center rounded-xl border border-[var(--border-soft)] bg-white p-3 shadow-[var(--shadow-pill)] sm:h-[80px] sm:w-[160px]">
      {logo.src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.src}
          alt={logo.name}
          className="h-full w-full object-contain"
          style={
            {
              transform: `scale(${logo.marqueeZoom ?? 1})`,
              objectPosition: logo.marqueePosition ?? "center center",
            } as CSSProperties
          }
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="text-xs font-medium text-[var(--text-muted)]">
          {logo.name}
        </div>
      )}
    </div>
  );
}

export function PartnerWithIPay() {
  const [activeTab, setActiveTab] = useState<TabKey>("Digital Collection Channels");

  const activeData = getTabData(activeTab);

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-24"
      style={{ background: "#0D0D1A" }}
    >
      <div className="relative mx-auto max-w-[1200px] px-6 sm:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(245,166,35,0.3)] bg-[rgba(245,166,35,0.08)] px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--tone-gold)] shadow-[0_10px_30px_rgba(245,166,35,0.08)] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--tone-gold)]" aria-hidden="true" />
            Trusted Ecosystem
          </div>
          <h2 className="font-heading mt-5 text-[clamp(2rem,5vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-white">
            Partner With{" "}
            <span className="text-[#F5A623]">IPAY PH</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-base leading-7 text-[rgba(255,255,255,0.65)]">
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
                onClick={() => setActiveTab(tabKey)}
                className={`
                  rounded-full px-4 py-2 text-[0.8rem] font-semibold transition-all duration-150
                  sm:px-5 sm:py-2.5 sm:text-sm
                  ${
                    isActive
                      ? "bg-[rgba(29,184,122,0.15)] text-[#1db87a] ring-1 ring-[rgba(29,184,122,0.4)]"
                      : "border border-[rgba(255,255,255,0.15)] bg-transparent text-[rgba(255,255,255,0.6)] hover:border-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.8)]"
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Logo Panel */}
        <div className="mt-10 sm:mt-12">
          <div
            key={activeTab}
            className="flex flex-wrap items-center justify-center gap-4 transition-opacity duration-[120ms] sm:gap-5"
            style={{ animation: "fadeIn 120ms ease-out" }}
          >
            {activeData?.logos.map((logo, index) => (
              <LogoCard key={`${activeTab}-${logo.name}-${index}`} logo={logo} />
            ))}
          </div>
        </div>

        {/* Category Info */}
        {activeData && (
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-[rgba(255,255,255,0.5)]">
              {activeData.counterLabel}
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
