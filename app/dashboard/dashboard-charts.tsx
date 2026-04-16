'use client'

import Script from "next/script";
import { useEffect, useId, useMemo, useRef, useState } from "react";

const CHART_JS_CDN =
  "https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js";

type TrendRange = "daily" | "weekly" | "monthly" | "custom";

type ChartData = {
  labels: string[];
  values: number[];
};

type ChartInstance = {
  destroy: () => void;
};

type ChartConstructor = new (
  context: CanvasRenderingContext2D,
  config: Record<string, unknown>,
) => ChartInstance;

declare global {
  interface Window {
    Chart?: ChartConstructor;
  }
}

const trendOptions: Array<{ label: string; value: TrendRange }> = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Custom", value: "custom" },
];

function getCssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

function getDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

function formatWeekRange(start: Date) {
  const end = addDays(start, 6);

  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);

  return nextDate;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function getStartOfWeek(date: Date) {
  const start = startOfDay(date);
  const day = start.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;

  start.setDate(start.getDate() - daysFromMonday);

  return start;
}

function getValidRequestDates(requestDates: string[]) {
  return requestDates
    .map((dateString) => new Date(dateString))
    .filter((date) => !Number.isNaN(date.getTime()));
}

function countBetween(dates: Date[], start: Date, end: Date) {
  return dates.filter((date) => date >= start && date < end).length;
}

function buildDailyData(dates: Date[]) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: 7 }, (_, index) => {
    const dayStart = addDays(today, index - 6);

    return {
      label: formatShortDate(dayStart),
      start: dayStart,
      end: addDays(dayStart, 1),
    };
  });

  return {
    labels: days.map((day) => day.label),
    values: days.map((day) => countBetween(dates, day.start, day.end)),
  };
}

function buildWeeklyData(dates: Date[]) {
  const thisWeek = getStartOfWeek(new Date());
  const weeks = Array.from({ length: 6 }, (_, index) => {
    const weekStart = addDays(thisWeek, (index - 5) * 7);

    return {
      label: formatWeekRange(weekStart),
      start: weekStart,
      end: addDays(weekStart, 7),
    };
  });

  return {
    labels: weeks.map((week) => week.label),
    values: weeks.map((week) => countBetween(dates, week.start, week.end)),
  };
}

function buildMonthlyData(dates: Date[]) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, index) => {
    const monthStart = new Date(now.getFullYear(), index, 1);

    return {
      label: monthStart.toLocaleDateString("en-PH", {
        month: "short",
      }),
      start: monthStart,
      end: addMonths(monthStart, 1),
    };
  });

  return {
    labels: months.map((month) => month.label),
    values: months.map((month) => countBetween(dates, month.start, month.end)),
  };
}

function buildCustomData(dates: Date[], startValue: string, endValue: string) {
  const start = startOfDay(new Date(startValue));
  const end = startOfDay(new Date(endValue));

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { labels: [], values: [] };
  }

  const rangeStart = start <= end ? start : end;
  const rangeEnd = start <= end ? end : start;
  const inclusiveEnd = addDays(rangeEnd, 1);
  const daysInRange = Math.max(
    1,
    Math.round((inclusiveEnd.getTime() - rangeStart.getTime()) / 86400000),
  );

  if (daysInRange > 120) {
    const monthCount =
      (rangeEnd.getFullYear() - rangeStart.getFullYear()) * 12 +
      rangeEnd.getMonth() -
      rangeStart.getMonth() +
      1;
    const months = Array.from({ length: monthCount }, (_, index) => {
      const monthStart = addMonths(
        new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1),
        index,
      );

      return {
        label: monthStart.toLocaleDateString("en-PH", {
          month: "short",
          year: "2-digit",
        }),
        start: monthStart,
        end: addMonths(monthStart, 1),
      };
    });

    return {
      labels: months.map((month) => month.label),
      values: months.map((month) => countBetween(dates, month.start, month.end)),
    };
  }

  if (daysInRange > 31) {
    const firstWeek = getStartOfWeek(rangeStart);
    const weekCount = Math.ceil(daysInRange / 7) + 1;
    const weeks = Array.from({ length: weekCount }, (_, index) => {
      const weekStart = addDays(firstWeek, index * 7);

      return {
        label: formatWeekRange(weekStart),
        start: weekStart,
        end: addDays(weekStart, 7),
      };
    });

    return {
      labels: weeks.map((week) => week.label),
      values: weeks.map((week) => countBetween(dates, week.start, week.end)),
    };
  }

  const days = Array.from({ length: daysInRange }, (_, index) => {
    const dayStart = addDays(rangeStart, index);

    return {
      label: formatShortDate(dayStart),
      start: dayStart,
      end: addDays(dayStart, 1),
    };
  });

  return {
    labels: days.map((day) => day.label),
    values: days.map((day) => countBetween(dates, day.start, day.end)),
  };
}

function getTrendDescription(range: TrendRange) {
  if (range === "daily") return "Daily request movement for the last seven days.";
  if (range === "weekly") return "Weekly request movement for the last six weeks.";
  if (range === "custom") return "Request movement for your selected date range.";

  return "Monthly request movement from January to December this year.";
}

function ChartFallback({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[18rem] items-center justify-center rounded-xl border border-dashed border-[var(--border-light)] bg-[var(--bg-subtle)] px-6 text-center">
      <p className="max-w-sm text-sm leading-6 text-[var(--text-muted)]">
        {message}
      </p>
    </div>
  );
}

export function DashboardCharts({ requestDates }: { requestDates: string[] }) {
  const trendCanvasId = useId();
  const trendCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trendChartRef = useRef<ChartInstance | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [themeVersion, setThemeVersion] = useState(0);
  const [selectedRange, setSelectedRange] = useState<TrendRange>("daily");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customStart, setCustomStart] = useState(() => {
    const date = addDays(new Date(), -30);
    return getDateInputValue(date);
  });
  const [customEnd, setCustomEnd] = useState(() => getDateInputValue(new Date()));

  const validRequestDates = useMemo(
    () => getValidRequestDates(requestDates),
    [requestDates],
  );

  const trendData: ChartData = useMemo(() => {
    if (selectedRange === "daily") return buildDailyData(validRequestDates);
    if (selectedRange === "weekly") return buildWeeklyData(validRequestDates);
    if (selectedRange === "custom") {
      return buildCustomData(validRequestDates, customStart, customEnd);
    }

    return buildMonthlyData(validRequestDates);
  }, [customEnd, customStart, selectedRange, validRequestDates]);

  const selectedRangeLabel =
    trendOptions.find((option) => option.value === selectedRange)?.label ??
    "Monthly";

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeVersion((version) => version + 1);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!chartReady || scriptError || !window.Chart) return;

    const trendCanvas = trendCanvasRef.current;
    const trendContext = trendCanvas?.getContext("2d");

    if (!trendContext) return;

    trendChartRef.current?.destroy();

    const brand = getCssVar("--brand", "#f17a1e");
    const textPrimary = getCssVar("--text-primary", "#111827");
    const textMuted = getCssVar("--text-muted", "#6b7280");
    const textFaint = getCssVar("--text-faint", "#9ca3af");
    const borderLight = getCssVar("--border-light", "#e5e7eb");
    const bgElevated = getCssVar("--bg-elevated", "#ffffff");

    trendChartRef.current = new window.Chart(trendContext, {
      type: "line",
      data: {
        labels: trendData.labels,
        datasets: [
          {
            label: "Request proposals",
            data: trendData.values,
            borderColor: brand,
            backgroundColor: "rgba(241, 122, 30, 0.14)",
            pointBackgroundColor: brand,
            pointBorderColor: bgElevated,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.38,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 650,
          easing: "easeOutQuart",
        },
        scales: {
          x: {
            grid: {
              color: "transparent",
            },
            ticks: {
              color: textFaint,
              maxRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            precision: 0,
            grid: {
              color: borderLight,
            },
            ticks: {
              color: textFaint,
              stepSize: 1,
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: bgElevated,
            borderColor: borderLight,
            borderWidth: 1,
            titleColor: textPrimary,
            bodyColor: textMuted,
            padding: 12,
            displayColors: false,
          },
        },
      },
    });

    return () => {
      trendChartRef.current?.destroy();
      trendChartRef.current = null;
    };
  }, [chartReady, scriptError, themeVersion, trendData]);

  return (
    <>
      <Script
        id="chartjs-cdn"
        src={CHART_JS_CDN}
        strategy="afterInteractive"
        onReady={() => {
          setScriptError(false);
          setChartReady(true);
        }}
        onError={() => {
          setScriptError(true);
        }}
      />

      <section>
        <article className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-elevated)] p-5 shadow-[var(--shadow-card)]">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-faint)]">
                Request Trend
              </p>
              <h2 className="mt-2 font-heading text-lg font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
                Request proposal activity over time
              </h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {getTrendDescription(selectedRange)}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {selectedRange === "custom" && (
                <div className="grid grid-cols-2 gap-2">
                  <label className="min-w-0">
                    <span className="sr-only">Start date</span>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(event) => setCustomStart(event.target.value)}
                      className="h-10 w-full rounded-lg border border-[var(--border-light)] bg-[var(--bg-base)] px-3 text-sm text-[var(--text-secondary)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
                    />
                  </label>
                  <label className="min-w-0">
                    <span className="sr-only">End date</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(event) => setCustomEnd(event.target.value)}
                      className="h-10 w-full rounded-lg border border-[var(--border-light)] bg-[var(--bg-base)] px-3 text-sm text-[var(--text-secondary)] outline-none transition-all focus:border-[var(--brand)] focus:ring-3 focus:ring-[rgba(241,122,30,0.12)]"
                    />
                  </label>
                </div>
              )}

              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="inline-flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] px-3.5 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-orange)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-elevated)] sm:w-36"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                >
                  {selectedRangeLabel}
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} aria-hidden="true">
                    <path d="M5 7.5l5 5 5-5" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-full min-w-36 overflow-hidden rounded-lg border border-[var(--border-light)] bg-[var(--bg-elevated)] py-1 shadow-[var(--shadow-card)]"
                  >
                    {trendOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setSelectedRange(option.value);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm transition-colors ${
                          selectedRange === option.value
                            ? "bg-[var(--brand-pale)] font-medium text-[var(--brand)]"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {option.label}
                        {selectedRange === option.value && (
                          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                            <path d="M4.5 10.5l3.5 3.5 7.5-8" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative h-[18rem] min-h-[18rem]">
            {scriptError ? (
              <ChartFallback message="Charts are unavailable because the analytics library could not be loaded." />
            ) : (
              <canvas
                ref={trendCanvasRef}
                id={trendCanvasId}
                role="img"
                aria-label={`${selectedRangeLabel} request proposal trend chart`}
              />
            )}
          </div>
        </article>
      </section>
    </>
  );
}
