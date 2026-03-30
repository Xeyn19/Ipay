import Link from "next/link";

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "inverse";
  className?: string;
}) {
  const variants = {
    primary:
      "bg-[var(--brand-cta)] text-white shadow-none hover:bg-[var(--brand-cta)] hover:shadow-none",
    secondary:
      "border-2 border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white",
    inverse:
      "bg-[var(--bg-elevated)] text-[var(--brand)] shadow-[var(--shadow-control)] hover:bg-[var(--bg-subtle)]",
  };

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-6 py-3 text-sm font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/40 ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function SectionHeader({
  label,
  title,
  description,
  align = "left",
}: {
  label: string;
  title: React.ReactNode;
  description: string;
  align?: "left" | "center";
}) {
  const alignment = align === "center" ? "text-center mx-auto" : "";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
        {label}
      </p>
      <h2 className="font-heading text-[clamp(2rem,3vw,3rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-8 text-[var(--text-muted)]">
        {description}
      </p>
    </div>
  );
}
