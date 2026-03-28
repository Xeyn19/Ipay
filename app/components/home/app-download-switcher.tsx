'use client';

import type { ReactNode } from "react";
import { useState } from "react";
import { AppDownloadQr } from "@/app/components/home/app-download-qr";
import { appStoreUrl, googlePlayUrl } from "@/app/lib/app-download";

type Platform = "android" | "ios";

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 28 31" className="h-7 w-7 shrink-0" aria-hidden="true">
      <path d="M1.5 1.5 16.9 16 1.5 29.5Z" fill="#00D0FF" />
      <path d="M1.5 1.5 20.8 12.6 16.9 16Z" fill="#00F076" />
      <path d="M1.5 29.5 20.8 18.4 16.9 16Z" fill="#FF4B5C" />
      <path d="M20.8 12.6 26.2 15.7a.35.35 0 0 1 0 .6l-5.4 3.1L16.9 16Z" fill="#FFB300" />
    </svg>
  );
}

function AppStoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M15.2 3.2c-.9.1-2 .6-2.7 1.4-.6.7-1.1 1.8-.9 2.8 1 0 2-.5 2.7-1.3.7-.8 1.1-1.8.9-2.9ZM18.4 12.8c0-2.5 2.1-3.7 2.2-3.8-1.2-1.7-3.1-1.9-3.7-1.9-1.5-.2-3 .9-3.8.9s-2-.9-3.3-.9c-1.7 0-3.3 1-4.1 2.4-1.8 3.1-.5 7.6 1.3 10.2.9 1.3 1.9 2.8 3.2 2.7 1.3-.1 1.8-.8 3.4-.8s2.1.8 3.5.8c1.4 0 2.3-1.3 3.2-2.6 1-1.5 1.5-2.9 1.5-3-.1 0-3.4-1.3-3.4-4Z" />
    </svg>
  );
}

type StoreSelectorProps = {
  eyebrow: string;
  icon: ReactNode;
  isActive: boolean;
  label: string;
  onClick: () => void;
};

function StoreSelector({
  eyebrow,
  icon,
  isActive,
  label,
  onClick,
}: StoreSelectorProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={`inline-flex w-full items-center gap-3 rounded-[16px] border px-3.5 py-2.5 text-left transition duration-200 ease-out ${
        isActive
          ? "border-[var(--border-orange)] bg-[linear-gradient(135deg,var(--tone-gold-soft),var(--bg-elevated))] text-[var(--text-primary)] shadow-[var(--shadow-gold)] hover:-translate-y-0.5"
          : "border-[var(--border-light)] bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-[var(--border-orange)] hover:bg-[var(--bg-elevated-muted)] hover:shadow-[var(--shadow-surface-hover)]"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${
          isActive
            ? "bg-white/70 text-[#111111] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7)]"
            : "bg-[var(--bg-soft)] text-[var(--text-secondary)]"
        }`}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={`text-[0.62rem] font-semibold uppercase tracking-[0.14em] ${
            isActive ? "text-[var(--tone-gold-muted)]" : "text-[var(--text-muted)]"
          }`}
        >
          {eyebrow}
        </span>
        <span className="font-heading text-[0.98rem] font-bold leading-[1.1]">
          {label}
        </span>
      </span>
      <span
        className={`rounded-full px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] ${
          isActive
            ? "bg-[var(--tone-gold)] text-[var(--text-cta)]"
            : "bg-[var(--bg-soft-strong)] text-[var(--text-muted)]"
        }`}
      >
        {isActive ? "Selected" : "Show QR"}
      </span>
    </button>
  );
}

export function AppDownloadSwitcher() {
  const [platform, setPlatform] = useState<Platform>("ios");

  const qrConfig =
    platform === "android"
      ? { platformName: "Google Play", targetUrl: googlePlayUrl }
      : { platformName: "App Store", targetUrl: appStoreUrl };

  return (
    <div className="flex w-full max-w-[460px] flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
      <div className="w-full max-w-[210px] shrink-0">
        <AppDownloadQr
          platformName={qrConfig.platformName}
          targetUrl={qrConfig.targetUrl}
        />
      </div>

      <div className="flex w-full max-w-[232px] flex-col items-center gap-2.5 lg:items-start">
        <StoreSelector
          eyebrow="Scan for"
          label="Google Play"
          icon={<GooglePlayIcon />}
          isActive={platform === "android"}
          onClick={() => setPlatform("android")}
        />
        <StoreSelector
          eyebrow="Scan for"
          label="App Store"
          icon={<AppStoreIcon />}
          isActive={platform === "ios"}
          onClick={() => setPlatform("ios")}
        />
      </div>
    </div>
  );
}
