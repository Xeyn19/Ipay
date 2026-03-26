import Image from "next/image";
import Link from "next/link";
import logo from "@/public/img/ipaylogo.webp";

type NavItem = { label: string; href: string };
type Segment = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
};
type Service = { title: string; description: string };
type Step = { number: string; title: string; description: string };
type PartnerLogo = {
  name: string;
  src: string;
  width: number;
  height: number;
  className?: string;
  wrapperClassName?: string;
};
type PartnerCategory = { title: string; logos: PartnerLogo[] };

const navigation: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Who We Serve", href: "#who-we-serve" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Partners", href: "#partners" },
];

const segments: Segment[] = [
  {
    title: "SMEs",
    description:
      "Retail, restaurants, salons, service providers, and multi-branch businesses that need dependable payment acceptance and fast operational visibility.",
    eyebrow: "Who We Serve",
    points: [
      "QR Ph and card acceptance",
      "Next-day settlements",
    ],
  },
  {
    title: "Institutions",
    description:
      "Schools, clinics, cooperatives, associations, and utility providers that require structured collections with clear controls and reporting.",
    eyebrow: "Who We Serve",
    points: [
      "Bulk collection tools",
      "Real-time reporting",
    ],
  },
  {
    title: "Platforms & Systems",
    description:
      "SaaS products, marketplaces, booking systems, and enterprise platforms looking to embed payments without building the rails themselves.",
    eyebrow: "Who We Serve",
    points: [
      "Robust API",
      "White-label options",
    ],
  },
];

const services: Service[] = [
  {
    title: "Payment Acceptance",
    description:
      "Omnichannel collections via QR Ph, payment links, APIs, and digital wallets through a single integration layer.",
  },
  {
    title: "Billing & Invoicing",
    description:
      "Automated recurring billing, digital invoicing, and scheduled collections with configurable workflows.",
  },
  {
    title: "Disbursement",
    description:
      "Real-time and batch payouts to banks and e-wallets nationwide, with automated status tracking.",
  },
  {
    title: "Reporting & Reconciliation",
    description:
      "Live transaction monitoring, automated settlement matching, and exportable financial reports.",
  },
  {
    title: "Developer API",
    description:
      "Secure RESTful APIs and webhooks designed for seamless system integration and scalability.",
  },
];

const steps: Step[] = [
  {
    number: "01",
    title: "Fragmented Payment Infrastructure",
    description:
      "Managing multiple QR codes, bank portals, and separate e-wallet dashboards creates operational silos and reconciliation complexity.",
  },
  {
    number: "02",
    title: "Compliance & Control Gaps",
    description:
      "Sharing bank credentials for verification exposes organizations to fraud, internal control weaknesses, and audit risks.",
  },
  {
    number: "03",
    title: "Manual & Error-Prone Reconciliation",
    description:
      "Time-consuming spreadsheet matching leads to delayed reporting, discrepancies, and operational inefficiencies.",
  },
];

const strengths = [
  "Unified Payment Ecosystem: One integration point for QR Ph, cards, banks, and e-wallets eliminating fragmentation and simplifying operations.",
  "Enterprise-Grade Governance: Role-based access controls, audit logs, and secure transaction visibility without sharing banking credentials.",
  "Automated Reconciliation & Settlement: Real-time transaction monitoring and system-generated settlement reports aligned with banking records.",
];

const partnerGroups: PartnerCategory[] = [
  {
    title: "Digital Collection Channels",
    logos: [
      {
        name: "GCash",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/gcash-logo.png",
        width: 210,
        height: 72,
      },
      {
        name: "Maya",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/maya_logo.svg_.png",
        width: 180,
        height: 72,
      },
      {
        name: "Grab",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/grab_company-logo.wine_.png",
        width: 210,
        height: 72,
      },
      {
        name: "InstaPay",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/1500-instapay-14072022.png",
        width: 220,
        height: 72,
      },
      {
        name: "Shopee",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/shopee.svg_.png",
        width: 200,
        height: 72,
      },
    ],
  },
  {
    title: "Digital Disbursement Channels",
    logos: [
      {
        name: "GCash",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/gcash-logo.png",
        width: 210,
        height: 72,
      },
      {
        name: "Maya",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/maya_logo.svg_.png",
        width: 180,
        height: 72,
      },
      {
        name: "Grab",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/grab_company-logo.wine_.png",
        width: 210,
        height: 72,
      },
      {
        name: "InstaPay",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/1500-instapay-14072022.png",
        width: 220,
        height: 72,
      },
    ],
  },
];

const partnerShowcaseGroups: PartnerCategory[] = [
  {
    title: "Merchant",
    logos: [
      {
        name: "DailyBest",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/daily-best.png",
        width: 132,
        height: 132,
        wrapperClassName: "h-[156px] w-[156px] rounded-[18px] bg-[#ffd83d] p-5 shadow-sm",
        className: "h-full w-full object-contain",
      },
      {
        name: "Nameless Cafe",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/nameless.png",
        width: 132,
        height: 132,
        wrapperClassName: "h-[156px] w-[156px] rounded-[18px] bg-black p-5 shadow-sm",
        className: "h-full w-full object-contain",
      },
      {
        name: "SG Clinic",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/sg-clinic-1.png",
        width: 132,
        height: 132,
        wrapperClassName: "h-[156px] w-[156px] rounded-[18px] bg-[#f4f4f4] p-5 shadow-sm",
        className: "h-full w-full object-contain",
      },
    ],
  },
  {
    title: "E-Commerce",
    logos: [
      {
        name: "XMeta",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/xmeta.png",
        width: 132,
        height: 132,
        wrapperClassName: "h-[156px] w-[156px] rounded-[18px] bg-[#ff6a2f] p-5 shadow-sm",
        className: "h-full w-full object-contain",
      },
      {
        name: "Rulls",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/rulls.png",
        width: 132,
        height: 132,
        wrapperClassName: "h-[156px] w-[156px] rounded-[18px] bg-white p-0 shadow-sm ring-1 ring-black/6",
        className: "h-full w-full object-cover rounded-[18px]",
      },
    ],
  },
  {
    title: "Office\nAutomation",
    logos: [
      {
        name: "SOOA",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/soooa-1.png",
        width: 132,
        height: 132,
        wrapperClassName: "h-[156px] w-[156px] rounded-[18px] bg-[#f4f4f4] p-5 shadow-sm",
        className: "h-full w-full object-contain",
      },
    ],
  },
];

function Button({
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
      "bg-[linear-gradient(135deg,var(--brand),var(--brand-light))] text-white shadow-[var(--shadow-button)] hover:bg-[var(--brand-dark)] hover:shadow-[0_10px_28px_rgba(241,122,30,0.38)]",
    secondary:
      "border-2 border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white",
    inverse: "bg-white text-[var(--brand)] shadow-sm hover:bg-[var(--bg-subtle)]",
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

function SectionHeader({
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

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-[var(--border-light)] bg-white/92 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="#home" className="flex items-center gap-3">
          <Image src={logo} alt="iPay logo" className="h-11 w-auto" priority />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[var(--text-secondary)] transition-colors duration-200 ease-out hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/40"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button href="#proposal" className="hidden md:inline-flex">
          Request Proposal
        </Button>

        <Link
          href="#proposal"
          className="inline-flex min-h-11 items-center rounded-md border border-[var(--border-light)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] md:hidden"
        >
          Proposal
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="home"
      className="hero-warm relative min-h-[calc(100svh-var(--nav-height))] overflow-hidden bg-transparent"
    >
      <div
        id="main"
        className="relative z-10 mx-auto grid min-h-[calc(100svh-var(--nav-height))] max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8"
      >
        <div className="flex flex-col justify-center">
          <h1 className="font-heading max-w-4xl text-[clamp(3rem,6vw,5.25rem)] font-bold leading-[0.96] tracking-[-0.05em] text-[var(--text-primary)]">
            <span className="block lg:whitespace-nowrap">Powering Seamless</span>
            <span className="block text-[var(--brand)] lg:whitespace-nowrap">
              Business Payments
            </span>
            <span className="block lg:whitespace-nowrap">
              Across the Philippines
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-[clamp(1.125rem,1.5vw,1.35rem)] leading-9 text-[var(--text-secondary)]">
            Dependable, efficient, and secure payment solutions for growing
            enterprises, SMEs, and institutions.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="#proposal" className="text-base">
              Request Proposal
            </Button>
            <Button href="#services" variant="secondary" className="text-base">
              Explore Services
            </Button>
          </div>
        </div>


      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    {
      title: "Regulatory Compliant",
      description: "OPSCOR-2025-0002",
      icon: (
        <svg
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
    },
    {
      title: "BSP-Registered",
      description: "Operator of Payment System",
      icon: (
        <svg
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
    },
    {
      title: "Enterprise Grade",
      description: "Secure Infrastructure",
      icon: (
        <svg
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
    },
  ];

  return (
    <section className="border-y border-[var(--border-light)] bg-[#f5f5f5]">
      <div
        id="hero_2"
        className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8"
      >
        {items.map((item) => (
          <article
            key={item.title}
            className="flex flex-col items-center rounded-[20px] border border-[var(--border-light)] bg-white px-6 py-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,23,42,0.1)]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f3f4f6] text-[var(--text-secondary)]">
              {item.icon}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WhoWeServe() {
  return (
    <section id="who-we-serve" className="bg-white/82 py-28 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Who We Serve"
          title={
            <>
              Tailored payment infrastructure
              <br />
              <span className="text-[var(--brand)]">for every growth stage</span>
            </>
          }
          description="From growing merchants to complex institutions and embedded platforms, iPay supports distinct payment flows with the same dependable infrastructure."
          align="center"
        />

        <div className="mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-3">
          {segments.map((segment) => (
            <article
              key={segment.title}
              className="flex h-full flex-col rounded-[28px] border border-[var(--border-light)] bg-white p-7 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
            >
              <p className="w-fit rounded-full border border-[var(--border-orange)] bg-[var(--brand-pale)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                {segment.eyebrow}
              </p>
              <h3 className="font-heading mt-5 text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
                {segment.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--text-muted)]">
                {segment.description}
              </p>

              <div className="mt-auto pt-8">
                <div className="space-y-4 border-t border-[var(--border-light)] pt-6">
                  {segment.points.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-pale)] text-[var(--brand)] ring-1 ring-[var(--border-orange)]/50">
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <path d="m5.75 10.25 2.5 2.5 6-6.5" />
                        </svg>
                      </span>
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section
      id="services"
      className="bg-[color:rgb(248_249_250_/_0.8)] py-24 backdrop-blur-[2px] sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Core Capabilities"
          title={
            <>
              Built for scale,
              <span className="text-[var(--brand)]"> designed for reliability</span>
            </>
          }
          description="Core Capabilities"
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.title}
              className="rounded-[20px] border border-[var(--border-light)] bg-white p-6 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-pale)] text-lg font-semibold text-[var(--brand)]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="font-heading mt-5 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                {service.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-[var(--text-muted)]">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white/80 py-24 backdrop-blur-[2px] sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Operational Payment Complexity"
          title={
            <>
              We replace fragmented, manual processes with
              <span className="text-[var(--brand)]"> a single, automated infrastructure</span>
            </>
          }
          description="The Challenge"
          align="center"
        />

        <div className="relative mt-16 grid gap-6 lg:grid-cols-3">
          <div className="absolute left-[16.5%] right-[16.5%] top-8 hidden border-t-2 border-dashed border-[var(--border-orange)] lg:block" />
          {steps.map((step) => (
            <article
              key={step.number}
              className="relative rounded-[24px] border border-[var(--border-light)] bg-white p-7 shadow-[var(--shadow-card)]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-pale)] font-heading text-xl font-bold text-[var(--brand)]">
                {step.number}
              </div>
              <h3 className="font-heading mt-6 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                {step.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--text-muted)]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const stats = [
    { value: "One", label: "integration point for QR Ph, cards, banks, and e-wallets" },
    { value: "Role-based", label: "access controls, audit logs, and secure visibility" },
    { value: "Real-time", label: "transaction monitoring and settlement reports" },
  ];

  return (
    <section className="bg-[color:rgb(248_249_250_/_0.8)] py-24 backdrop-blur-[2px] sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeader
            label="The IPAY Solution"
            title={
              <>
                Unified controls for
                <span className="text-[var(--brand)]"> modern payment operations</span>
              </>
            }
            description="Unified Payment Ecosystem, Enterprise-Grade Governance, and Automated Reconciliation & Settlement."
          />

          <div className="grid gap-5 sm:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[20px] border border-[var(--border-light)] bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <p className="font-heading text-5xl font-bold tracking-[-0.05em] text-[var(--brand)]">
                  {stat.value}
                </p>
                <p className="mt-3 text-sm uppercase tracking-[0.16em] text-[var(--text-faint)]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {strengths.map((strength) => (
            <div
              key={strength}
              className="flex items-start gap-4 rounded-[18px] border border-[var(--border-light)] bg-white p-5 shadow-[var(--shadow-card)]"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-pale)] text-lg font-semibold text-[var(--brand)]">
                OK
              </span>
              <p className="text-base leading-7 text-[var(--text-secondary)]">
                {strength}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section id="partners" className="bg-white py-24 sm:py-20">
      <div className="mx-auto max-w-[1100px] px-6 sm:px-8">
        <div className="mx-auto max-w-[480px] text-center">
          <h2 className="font-heading text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.03em] text-[#0d0d1a]">
            Partner With IPAY PH
          </h2>
          <p className="mt-4 text-[1.05rem] leading-7 text-[#555]">
            Join our ecosystem to deliver superior financial technology to your
            clients.
          </p>
        </div>

        <div className="mt-14">
          {partnerGroups.map((group, index) => (
            <div
              key={group.title}
              className={`flex flex-col items-start gap-6 py-12 sm:gap-8 md:flex-row md:items-center md:gap-10 ${index > 0 ? "border-t border-[#e5e5e5]" : ""}`}
            >
              <div className="w-full shrink-0 md:w-[180px]">
                <h3 className="font-heading text-[1.1rem] font-bold leading-6 text-[#0d0d1a]">
                  {group.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
                {group.logos.map((logo) => (
                  <div key={`${group.title}-${logo.name}`} className="flex items-center">
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={logo.width}
                      height={logo.height}
                      className={`h-9 w-auto object-contain transition duration-200 ease-out hover:scale-[1.08] hover:[filter:drop-shadow(0_4px_12px_rgba(0,0,0,0.12))] sm:h-11 ${logo.className ?? ""}`}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          {partnerShowcaseGroups.map((group, index) => (
            <div
              key={group.title}
              className={`flex flex-col items-start gap-6 py-12 sm:gap-8 md:flex-row md:items-center md:gap-10 ${index < partnerShowcaseGroups.length - 1 ? "border-b border-[#b8b8b8]" : ""}`}
            >
              <div className="w-full shrink-0 md:w-[180px]">
                <h3 className="font-heading whitespace-pre-line text-[clamp(1.2rem,3vw,1.4rem)] font-bold leading-[1.45] text-[#0d0d1a]">
                  {group.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-6 md:gap-7">
                {group.logos.map((logo) => (
                  <div
                    key={`${group.title}-${logo.name}`}
                    className={`flex items-center justify-center overflow-hidden transition duration-200 ease-out hover:scale-[1.03] hover:[filter:drop-shadow(0_10px_20px_rgba(0,0,0,0.08))] ${logo.wrapperClassName ?? ""}`}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={logo.width}
                      height={logo.height}
                      className={logo.className ?? "h-full w-full object-contain"}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section id="proposal" className="bg-[var(--brand)] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))] px-8 py-10 text-white shadow-[0_24px_60px_rgba(241,122,30,0.24)] md:px-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
            Request a Proposal
          </p>
          <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="font-heading text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
                Design Your Payment Infrastructure
              </h2>
              <p className="mt-4 text-lg leading-8 text-white/82">
                Join the growing number of Philippine enterprises streamlining
                their financial operations with IPAY INTERNATIONAL.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button href="mailto:hello@ipay.com.ph" variant="inverse">
                Request Proposal
              </Button>
              <Button
                href="#home"
                variant="inverse"
                className="bg-transparent text-white ring-1 ring-white/50 hover:bg-white hover:text-[var(--brand)]"
              >
                Back to Top
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const footerServices = [
    "Payment Acceptance",
    "Billing & Invoicing",
    "Disbursement",
    "Reporting & Reconciliation",
    "Developer API",
  ];

  return (
    <footer className="bg-[#111827] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image src={logo} alt="iPay logo" className="h-11 w-auto" />
            <div>
              <p className="text-xs text-slate-400">
                Powering Seamless Business Payments Across the Philippines
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
            Dependable, efficient, and secure payment solutions for growing
            enterprises, SMEs, and institutions.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Navigation
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
            {navigation.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Solutions
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-400">
            {footerServices.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
            Credentials
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p>Regulatory Compliant OPSCOR-2025-0002</p>
            <p>BSP-Registered Operator of Payment System</p>
            <p>Enterprise Grade Secure Infrastructure</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>(c) 2026 iPay. All rights reserved.</p>
          <p>Join the growing number of Philippine enterprises streamlining their financial operations with IPAY INTERNATIONAL.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar />
      <Hero />
      <TrustBar />
      <WhoWeServe />
      <Services />
      <HowItWorks />
      <WhyChooseUs />
      <Partners />
      <CTABanner />
      <Footer />
    </main>
  );
}
