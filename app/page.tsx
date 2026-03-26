import Image from "next/image";
import Link from "next/link";
import logo from "@/public/img/ipaylogo.webp";
import SpotlightCardTracker from "@/app/spotlight-card-tracker";
import PartnersCarousel from "@/app/components/partners-carousel";
import ThemeToggle from "@/app/components/theme-toggle";

type NavItem = { label: string; href: string };
type Segment = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
};
type Service = { title: string; description: string };
type Step = { number: string; title: string; description: string };
type SolutionFeature = {
  title: string;
  subtitle: string;
  body: string;
  tag: string;
  tone: "gold" | "green" | "blue";
};
type SolutionDetail = { title: string; body: string };
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

const solutionFeatures: SolutionFeature[] = [
  {
    title: "One",
    subtitle: "Integration point for QR PH, cards, banks and e-wallets",
    body: "Connect once. Accept everywhere. Our single API replaces separate integrations and shortens go-live time from months to days.",
    tag: "Integration",
    tone: "gold",
  },
  {
    title: "Role-based",
    subtitle: "Access controls, audit logs and secure visibility",
    body: "Enterprise-grade permissions with full audit trails so finance, operations, and compliance teams each see exactly what they need.",
    tag: "Governance",
    tone: "blue",
  },
  {
    title: "Real-time",
    subtitle: "Transaction monitoring and settlement reports",
    body: "Watch every payment move as it happens with system-generated settlement reports aligned to your banking records.",
    tag: "Monitoring",
    tone: "green",
  },
];

const solutionDetails: SolutionDetail[] = [
  {
    title: "Unified Ecosystem",
    body: "One integration for QR Ph, cards, banks, and e-wallets, eliminating fragmentation and simplifying operations across teams.",
  },
  {
    title: "Enterprise Governance",
    body: "Role-based access controls, audit logs, and secure transaction visibility without sharing banking credentials.",
  },
  {
    title: "Auto Reconciliation and Settlement",
    body: "Real-time monitoring and system-generated settlement reports aligned with banking records so books close on time.",
  },
];

const partnerCategories: PartnerCategory[] = [
  {
    title: "Digital Collection Channels",
    panelTitle: "Digital Collection Channels",
    tabLabel: "Digital Collection",
    tabIcon: "💳",
    counterLabel: "5 Channels",
    description:
      "Accept payments from the Philippines' most-used wallets and platforms.",
    layout: "pill",
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
    panelTitle: "Digital Disbursement Channels",
    tabLabel: "Disbursement",
    tabIcon: "📤",
    counterLabel: "4 Channels",
    description: "Send funds instantly to any e-wallet or bank account.",
    layout: "pill",
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

partnerCategories.push(
  {
    title: "Merchant",
    panelTitle: "Merchant Partners",
    tabLabel: "Merchant",
    tabIcon: "🏪",
    counterLabel: "3 Partners",
    description: "Trusted by brands across retail, food, and services.",
    layout: "card",
    logos: [
      {
        name: "Daily Best",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/daily-best.png",
        width: 132,
        height: 132,
        wrapperClassName:
          "h-[90px] w-[90px] rounded-[18px] bg-[#ffd83d] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:h-[92px] sm:w-[92px]",
        className: "h-full w-full object-contain",
      },
      {
        name: "Nameless",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/nameless.png",
        width: 132,
        height: 132,
        wrapperClassName:
          "h-[90px] w-[90px] rounded-[18px] bg-[#111111] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:h-[92px] sm:w-[92px]",
        className: "h-full w-full object-contain",
      },
      {
        name: "SG",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/sg-clinic-1.png",
        width: 132,
        height: 132,
        wrapperClassName:
          "h-[90px] w-[90px] rounded-[18px] bg-[#f0f0f0] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:h-[92px] sm:w-[92px]",
        className: "h-full w-full object-contain",
      },
    ],
  },
  {
    title: "E-Commerce",
    panelTitle: "E-Commerce Partners",
    tabLabel: "E-Commerce",
    tabIcon: "🛒",
    counterLabel: "2 Partners",
    description: "Powering online stores with fast, reliable checkout.",
    layout: "card",
    logos: [
      {
        name: "XMeta",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/xmeta.png",
        width: 132,
        height: 132,
        wrapperClassName:
          "h-[90px] w-[90px] rounded-[18px] bg-[#ff6a2f] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:h-[92px] sm:w-[92px]",
        className: "h-full w-full object-contain",
      },
      {
        name: "Rulls",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/rulls.png",
        width: 132,
        height: 132,
        wrapperClassName:
          "h-[90px] w-[90px] rounded-[18px] bg-white p-0 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:h-[92px] sm:w-[92px]",
        className: "h-full w-full rounded-[18px] object-cover",
      },
    ],
  },
  {
    title: "Office Automation",
    panelTitle: "Office Automation",
    tabLabel: "Office Automation",
    tabIcon: "🖥",
    counterLabel: "1 Partner",
    description: "Smart tools for billing, payroll, and back-office ops.",
    layout: "card",
    logos: [
      {
        name: "Soon",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/soooa-1.png",
        width: 132,
        height: 132,
        wrapperClassName:
          "h-[90px] w-[90px] rounded-[18px] bg-[#f4f4f4] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:h-[92px] sm:w-[92px]",
        className: "h-full w-full object-contain",
      },
    ],
  },
);

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
      "bg-[linear-gradient(135deg,var(--brand),var(--brand-light))] text-white shadow-[var(--shadow-button)] hover:bg-[var(--brand-dark)] hover:shadow-[var(--shadow-button-hover)]",
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
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-[var(--border-light)] bg-[var(--nav-bg)] backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="#home" className="brand-logo-shell flex items-center gap-3">
          <Image
            src={logo}
            alt="iPay logo"
            className="brand-logo-image h-11 w-auto"
            priority
          />
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

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button href="#proposal" className="hidden md:inline-flex">
            Request Proposal
          </Button>

          <Link
            href="#proposal"
            className="inline-flex min-h-11 items-center rounded-md border border-[var(--border-light)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] md:hidden"
          >
            Proposal
          </Link>
        </div>
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
    <section className="border-y border-[var(--border-light)] bg-[var(--bg-soft)]">
      <div
        id="hero_2"
        className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8"
      >
        {items.map((item) => (
          <article
            key={item.title}
            className="flex flex-col items-center rounded-[20px] border border-[var(--border-light)] bg-[var(--bg-elevated)] px-6 py-8 text-center shadow-[var(--shadow-soft)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-soft-hover)]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-soft-strong)] text-[var(--text-secondary)]">
              {item.icon}
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

function WhoWeServe() {
  return (
    <section
      id="who-we-serve"
      className="bg-[var(--section-default)] py-28 backdrop-blur-[2px] sm:py-24"
    >
      <SpotlightCardTracker
        containerSelector=".who-we-serve-grid"
        cardSelector=".who-we-serve-card"
      />
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

        <div className="who-we-serve-grid mx-auto mt-16 grid max-w-6xl gap-6 lg:grid-cols-3">
          {segments.map((segment) => (
            <article
              key={segment.title}
              className="who-we-serve-card flex h-full flex-col rounded-[28px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-7 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
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
                      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-pale)] text-[var(--brand)] ring-1 ring-[var(--border-orange)]/70">
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
      className="bg-[var(--section-muted)] py-24 backdrop-blur-[2px] sm:py-20"
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
              className="rounded-[20px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
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
    <section
      id="how-it-works"
      className="bg-[var(--section-default)] py-24 backdrop-blur-[2px] sm:py-20"
    >
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
              className="relative rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-elevated)] p-7 shadow-[var(--shadow-card)]"
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
  return (
    <section className="bg-[var(--bg-contrast)] py-24 sm:py-20">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[var(--tone-gold-muted)]">
            <span className="block h-0.5 w-6 rounded-full bg-[var(--tone-gold)]" aria-hidden="true" />
            The IPAY Solution
          </div>
          <h2 className="font-heading mt-4 text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.1] tracking-[-0.04em] text-[var(--text-strong)]">
            Unified controls for
            <span className="block text-[var(--tone-gold)]">modern payment operations</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-base leading-8 text-[var(--text-soft)]">
            One platform to collect, disburse, and reconcile across every major
            Philippine payment rail. No fragmentation. No manual settlement.
          </p>
        </div>

        <div className="my-12 h-px bg-[var(--border-contrast)]" />

        <div className="grid gap-5 md:grid-cols-3">
          {solutionFeatures.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-[20px] border border-[var(--border-contrast)] bg-[var(--bg-elevated)] px-6 py-[26px] transition duration-300 ease-out hover:-translate-y-1.5 hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-large)]"
            >
              <div
                className={`absolute inset-x-0 bottom-0 h-[3px] rounded-b-[20px] opacity-0 transition duration-300 group-hover:opacity-100 ${
                  feature.tone === "green"
                    ? "bg-[var(--tone-green)]"
                    : feature.tone === "blue"
                      ? "bg-[var(--tone-blue)]"
                      : "bg-[var(--tone-gold)]"
                }`}
              />
              <div className="mb-5 flex items-center justify-between gap-4">
                <div
                  className={`flex h-[52px] w-[52px] items-center justify-center rounded-[14px] ${
                    feature.tone === "green"
                      ? "bg-[var(--tone-green-soft)]"
                      : feature.tone === "blue"
                        ? "bg-[var(--tone-blue-soft)]"
                        : "bg-[var(--tone-gold-soft)]"
                  }`}
                  aria-hidden="true"
                >
                  {feature.tone === "gold" ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 text-[var(--tone-gold)]"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
                  ) : feature.tone === "blue" ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 text-[var(--tone-blue)]"
                    >
                      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
                      <path d="m9.5 12 1.7 1.7 3.8-4.2" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5 text-[var(--tone-green)]"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                      <path d="M8 8h8v8H8z" opacity="0.18" />
                    </svg>
                  )}
                </div>
                <span className="rounded-full bg-[var(--bg-badge)] px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.09em] text-[var(--text-subtle)]">
                  {feature.tag}
                </span>
              </div>

              <h3 className="font-heading text-[1.7rem] font-extrabold leading-none text-[var(--tone-gold)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[var(--text-subtle)]">
                {feature.subtitle}
              </p>
              <p className="mt-3 text-[0.88rem] leading-7 text-[var(--text-soft)]">
                {feature.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {solutionDetails.map((detail) => (
            <article
              key={detail.title}
              className="rounded-[16px] border border-[var(--border-contrast)] bg-[var(--bg-elevated)] px-5 py-[18px] transition duration-200 ease-out hover:-translate-y-[3px] hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-soft)]"
            >
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tone-gold-soft)]">
                  <svg viewBox="0 0 14 14" fill="none" className="h-[13px] w-[13px]" aria-hidden="true">
                    <path
                      d="M2.5 7 5.5 10 11.5 4"
                      stroke="var(--tone-gold)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3 className="font-heading text-[0.9rem] font-bold text-[var(--text-strong)]">
                  {detail.title}
                </h3>
              </div>
              <p className="text-[0.83rem] leading-7 text-[var(--text-soft)]">
                {detail.body}
              </p>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

function Partners() {
  return (
    <section
      id="partners"
      className="relative overflow-hidden py-24 sm:py-20"
      style={{ background: "var(--partners-bg)" }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{ background: "var(--partners-overlay)" }}
      />
      <div className="relative mx-auto max-w-[1200px]">
        <div className="px-6 text-center sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-badge)] bg-[var(--partners-badge-bg)] px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[var(--tone-gold-muted)] shadow-[var(--shadow-badge)] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--tone-gold)]" aria-hidden="true" />
            Trusted Ecosystem
          </div>
          <h2 className="font-heading mt-5 text-[clamp(2.2rem,5vw,3.2rem)] font-extrabold leading-[1.08] tracking-[-0.04em] text-[var(--text-strong)]">
            Partner With <span className="text-[var(--tone-gold)]">IPAY PH</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-base leading-8 text-[var(--text-soft)]">
            Join our growing network of top-tier financial technology partners
            and deliver seamless payment solutions to your clients.
          </p>
        </div>

        <PartnersCarousel groups={partnerCategories} />

        <div className="px-6 pb-2 pt-10 sm:px-8">
          <div
            className="flex flex-col items-start justify-between gap-6 rounded-[24px] border border-white/10 px-6 py-8 shadow-[var(--shadow-large-strong)] sm:px-10 md:flex-row md:items-center md:px-12"
            style={{ background: "var(--partners-cta-bg)" }}
          >
            <div>
              <h3 className="font-heading max-w-[420px] text-[clamp(1.2rem,2.5vw,1.7rem)] font-bold leading-[1.3] text-[var(--text-inverse)]">
                Ready to grow with <span className="text-[var(--tone-gold)]">IPAY PH?</span>
              </h3>
              <p className="mt-1.5 text-[0.85rem] leading-6 text-[var(--text-inverse-muted)]">
                Join hundreds of businesses already thriving in our ecosystem.
              </p>
            </div>

            <Link
              href="#proposal"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--tone-gold)] px-[30px] py-[15px] font-heading text-[0.9rem] font-bold text-[var(--text-cta)] shadow-[var(--shadow-gold)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--brand-light)] hover:shadow-[var(--shadow-gold-hover)]"
            >
              Become a Partner
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
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
    <footer className="bg-[var(--bg-footer)] text-[var(--text-inverse)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="brand-logo-shell">
              <Image
                src={logo}
                alt="iPay logo"
                className="brand-logo-image h-11 w-auto"
              />
            </div>
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
      <Footer />
    </main>
  );
}
