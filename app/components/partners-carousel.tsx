'use client'

import Image from "next/image";
import { useRef, useState } from "react";

type PartnerLogo = {
  name: string;
  src?: string;
  width?: number;
  height?: number;
  label?: string;
  className?: string;
  wrapperClassName?: string;
  labelClassName?: string;
};

type PartnerCategory = {
  title: string;
  panelTitle: string;
  tabLabel: string;
  tabIcon: string;
  counterLabel: string;
  description: string;
  layout: "pill" | "card";
  logos: PartnerLogo[];
};

export default function PartnersCarousel({
  groups,
}: {
  groups: PartnerCategory[];
}) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const total = groups.length;

  const goTo = (index: number) => {
    setCurrent(((index % total) + total) % total);
  };

  const navigate = (direction: number) => {
    setCurrent((value) => (value + direction + total) % total);
  };

  if (total === 0) {
    return null;
  }

  const group = groups[current];

  return (
    <div className="mx-auto max-w-[1040px] px-5 pb-20 pt-[52px] sm:px-8">
      <div
        role="tablist"
        aria-label="Partner categories"
        className="mx-auto mb-8 flex w-fit max-w-full items-center justify-center gap-1.5 overflow-x-auto rounded-[18px] border border-[#dfe3e8] bg-[#f3f4f6] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                  ? "border-[#111827] bg-[#111827] font-semibold text-white shadow-[0_10px_24px_rgba(17,24,39,0.18)]"
                  : "border-transparent bg-transparent text-[#667085] hover:border-[#e5e7eb] hover:bg-white hover:text-[#0d0d1a]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[13px] leading-none ${
                  isActive ? "bg-white/14" : "bg-white text-[#4b5563]"
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
        className="overflow-hidden rounded-[24px] border border-[#dfe3e8] bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfc_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
        onTouchStart={(event) => {
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
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(245,166,35,0.08)_0%,rgba(255,255,255,0)_100%)]" />
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="relative z-10 flex max-w-[420px] flex-col items-center">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-[#98a2b3]">
                Partner Category
              </p>
              <h3 className="font-heading mt-2 text-[1.3rem] font-bold text-[#0d0d1a]">
                {group.panelTitle}
              </h3>
              <p className="mt-2 max-w-[380px] text-[0.86rem] leading-6 text-[#667085]">
                {group.description}
              </p>
            </div>
            <span className="relative z-10 rounded-full border border-[#e7eaee] bg-white px-3 py-[5px] text-[0.75rem] font-semibold text-[#667085] shadow-[0_4px_12px_rgba(15,23,42,0.04)]">
              {group.counterLabel}
            </span>
          </div>

          {group.layout === "pill" ? (
            <div className="relative z-10 flex flex-wrap justify-center gap-[14px]">
              {group.logos.map((logo) => (
                <div
                  key={`${group.title}-${logo.name}`}
                  className="flex h-[78px] min-w-[148px] items-center justify-center rounded-[16px] border border-[#e7eaee] bg-white px-7 shadow-[0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(15,23,42,0.04)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[#f0c26e] hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]"
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
                    <span className="text-sm font-semibold text-[#0d0d1a]">
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
                  className={`flex !h-[124px] !w-[124px] items-center justify-center overflow-hidden !rounded-[24px] border border-[#e7eaee] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition duration-200 ease-out hover:-translate-y-1 hover:border-[#f0c26e] hover:shadow-[0_18px_36px_rgba(15,23,42,0.1)] ${logo.wrapperClassName ?? ""}`}
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

        <div className="flex items-center justify-between border-t border-[#e7eaee] bg-[#f8f9fb] px-[22px] py-4 sm:px-10 sm:py-5">
          <div className="flex gap-2">
            {groups.map((item, index) => (
              <button
                key={`${item.title}-dot`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to ${item.tabLabel}`}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === current ? "w-6 bg-[#f5a623]" : "w-2 bg-[#d5dae1] hover:bg-[#bfc6d1]"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Previous partner category"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe3e8] bg-white text-[#0d0d1a] shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition duration-200 ease-out hover:scale-[1.03] hover:border-[#111827] hover:bg-[#111827] hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => navigate(1)}
              aria-label="Next partner category"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe3e8] bg-white text-[#0d0d1a] shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition duration-200 ease-out hover:scale-[1.03] hover:border-[#111827] hover:bg-[#111827] hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
