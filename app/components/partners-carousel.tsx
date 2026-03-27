'use client'

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PartnerCategory } from "@/app/components/home/types";

export default function PartnersCarousel({
  groups,
}: {
  groups: PartnerCategory[];
}) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = groups.length;

  const goTo = (index: number) => {
    setCurrent(((index % total) + total) % total);
  };

  const navigate = (direction: number) => {
    setCurrent((value) => (value + direction + total) % total);
  };

  useEffect(() => {
    if (total <= 1 || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((value) => (value + 1) % total);
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused, total]);

  if (total === 0) {
    return null;
  }

  const group = groups[current];

  return (
    <div className="mx-auto max-w-[1040px] px-5 pb-20 pt-[52px] sm:px-8">
      <div
        role="tablist"
        aria-label="Partner categories"
        className="mx-auto mb-8 flex w-fit max-w-full items-center justify-center gap-1.5 overflow-x-auto rounded-[18px] border border-[var(--border-soft)] bg-[var(--bg-tab-list)] p-2 shadow-[var(--shadow-tab-inset)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {groups.map((item, index) => {
          const isActive = index === current;

          return (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`partner-panel-${index}`}
              id={`partner-tab-${index}`}
              onClick={() => goTo(index)}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[12px] border px-[18px] py-[10px] text-[0.85rem] transition duration-200 ${
                isActive
                  ? "border-[var(--bg-tab-active)] bg-[var(--bg-tab-active)] font-semibold text-[var(--text-tab-active)] shadow-[var(--shadow-tab-active)]"
                  : "border-transparent bg-transparent text-[var(--text-tab)] hover:border-[var(--border-light)] hover:bg-[var(--bg-tab-hover)] hover:text-[var(--text-strong)]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[13px] leading-none ${
                  isActive
                    ? "bg-[var(--bg-tab-active-icon)]"
                    : "bg-[var(--bg-tab-icon)] text-[var(--text-tab-icon)]"
                }`}
              >
                {item.tabIcon}
              </span>
              {item.tabLabel}
            </button>
          );
        })}
      </div>

      <div
        className="overflow-hidden rounded-[24px] border border-[var(--border-soft)] shadow-[var(--shadow-large)]"
        style={{ background: "var(--carousel-bg)" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          const nextFocused = event.relatedTarget as Node | null;

          if (!event.currentTarget.contains(nextFocused)) {
            setIsPaused(false);
          }
        }}
        onTouchStart={(event) => {
          setIsPaused(true);
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          const end = event.changedTouches[0]?.clientX;
          touchStartX.current = null;

          if (start == null || end == null) {
            return;
          }

          const diff = start - end;
          if (Math.abs(diff) > 40) {
            navigate(diff > 0 ? 1 : -1);
          }

          setIsPaused(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            navigate(1);
          }

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            navigate(-1);
          }
        }}
        tabIndex={0}
      >
        <div
          key={group.title}
          role="tabpanel"
          id={`partner-panel-${current}`}
          aria-labelledby={`partner-tab-${current}`}
          className="relative px-[22px] py-7 text-center sm:px-10 sm:py-10"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24"
            style={{ background: "var(--carousel-top-glow)" }}
          />
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="relative z-10 flex max-w-[420px] flex-col items-center">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[var(--text-badge)]">
                Partner Category
              </p>
              <h3 className="font-heading mt-2 text-[1.3rem] font-bold text-[var(--text-strong)]">
                {group.panelTitle}
              </h3>
              <p className="mt-2 max-w-[380px] text-[0.86rem] leading-6 text-[var(--text-tab)]">
                {group.description}
              </p>
            </div>
            <span className="relative z-10 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-[5px] text-[0.75rem] font-semibold text-[var(--text-tab)] shadow-[var(--shadow-pill)]">
              {group.counterLabel}
            </span>
          </div>

          {group.layout === "pill" ? (
            <div className="relative z-10 flex flex-wrap justify-center gap-[14px]">
              {group.logos.map((logo) => (
                <div
                  key={`${group.title}-${logo.name}`}
                  className="flex h-[78px] min-w-[148px] items-center justify-center rounded-[16px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-7 shadow-[var(--shadow-surface)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-surface-hover)]"
                >
                  {logo.src && logo.width && logo.height ? (
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={logo.width}
                      height={logo.height}
                      className="h-[42px] w-auto max-w-[138px] object-contain"
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm font-semibold text-[var(--text-strong)]">
                      {logo.label ?? logo.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="relative z-10 flex flex-wrap justify-center gap-4">
              {group.logos.map((logo) => (
                <div
                  key={`${group.title}-${logo.name}`}
                  className={`flex !h-[124px] !w-[124px] items-center justify-center overflow-hidden !rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-[var(--shadow-tile)] transition duration-200 ease-out hover:-translate-y-1 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-tile-hover)] ${logo.wrapperClassName ?? ""}`}
                >
                  {logo.src && logo.width && logo.height ? (
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={logo.width}
                      height={logo.height}
                      className={logo.className ?? "h-full w-full object-cover"}
                      unoptimized
                    />
                  ) : (
                    <span className={`text-center ${logo.labelClassName ?? "text-sm font-semibold"}`}>
                      {logo.label ?? logo.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center border-t border-[var(--border-subtle)] bg-[var(--bg-carousel-footer)] px-[22px] py-4 sm:px-10 sm:py-5">
          <div className="flex gap-2">
            {groups.map((item, index) => (
              <button
                key={`${item.title}-dot`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to ${item.tabLabel}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === current
                    ? "w-6 bg-[var(--bg-dot-active)]"
                    : "w-2 bg-[var(--bg-dot-inactive)] hover:bg-[var(--bg-dot-inactive-hover)]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
