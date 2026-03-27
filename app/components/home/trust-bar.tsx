import { trustItems } from "@/app/components/home/data";

const icons = [
  (
    <svg
      key="regulatory"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="m9.5 12 1.7 1.7 3.8-4.2" />
    </svg>
  ),
  (
    <svg
      key="bsp"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 20h16" />
      <path d="M6 20V10h12v10" />
      <path d="M12 4 4 8v2h16V8l-8-4Z" />
      <path d="M9 14v2" />
      <path d="M12 14v2" />
      <path d="M15 14v2" />
    </svg>
  ),
  (
    <svg
      key="enterprise"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 9h8" />
      <path d="M8 12h8" />
      <path d="M8 15h5" />
    </svg>
  ),
];

export function TrustBar() {
  return (
    <section className="border-y border-[var(--border-light)] bg-[var(--bg-soft)]">
      <div
        id="hero_2"
        className="hero-spotlight-grid who-we-serve-grid mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8"
      >
        {trustItems.map((item, index) => (
          <article
            key={item.title}
            className="hero-spotlight-card who-we-serve-card flex flex-col items-center rounded-[20px] border border-[var(--border-light)] bg-[var(--bg-elevated)] px-6 py-8 text-center shadow-[var(--shadow-soft)] transition-all duration-200 ease-out hover:shadow-[var(--shadow-soft-hover)]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-soft-strong)] text-[var(--text-secondary)]">
              {icons[index]}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
