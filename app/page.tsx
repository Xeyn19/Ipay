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

const navigation: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Who We Serve", href: "#who-we-serve" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Partners", href: "#partners" },
];

const segments: Segment[] = [
  {
    title: "SMEs & Retail Groups",
    description:
      "Deploy QR Ph, wallets, card acceptance, and daily reporting across branches without forcing operations teams into messy manual reconciliation.",
    eyebrow: "For growing merchants",
    points: [
      "Branch-ready collections",
      "Daily settlement visibility",
      "Support for field and counter teams",
    ],
  },
  {
    title: "Schools, Clinics & Cooperatives",
    description:
      "Centralize fee collection and finance workflows with payment rails designed for high-volume receivables and institution-grade controls.",
    eyebrow: "For institutions",
    points: [
      "Student and patient billing",
      "Approval-led finance workflows",
      "Collections across online and onsite channels",
    ],
  },
  {
    title: "Platforms & Enterprise Teams",
    description:
      "Embed dependable payment acceptance and payout operations into your product or internal finance stack with implementation support from iPay.",
    eyebrow: "For platforms",
    points: [
      "Gateway and payout orchestration",
      "Partner onboarding support",
      "Integration for enterprise operations",
    ],
  },
];

const services: Service[] = [
  {
    title: "QR Ph Collections",
    description:
      "Launch branded QR acceptance for branch counters, field representatives, and merchant networks with operational reporting.",
  },
  {
    title: "Payment Gateway",
    description:
      "Unify cards, bank transfer flows, and local digital payment methods behind one merchant-ready integration layer.",
  },
  {
    title: "Bulk Disbursements",
    description:
      "Coordinate supplier payouts, incentives, and approved releases with clearer controls for finance and operations teams.",
  },
  {
    title: "Settlement Reporting",
    description:
      "Give finance teams a clean daily view of receivables, cutoff windows, settlement timing, and exceptions.",
  },
  {
    title: "Merchant Onboarding",
    description:
      "Move from due diligence to launch with rollout support tailored for Philippine business payment operations.",
  },
  {
    title: "Enterprise Payment Advisory",
    description:
      "Structure collection and payout programs around your institution, platform, or multi-entity business model.",
  },
];

const steps: Step[] = [
  {
    number: "01",
    title: "Map your payment flow",
    description:
      "We review your collection channels, settlement expectations, approval steps, and reporting requirements.",
  },
  {
    number: "02",
    title: "Configure channels and controls",
    description:
      "iPay aligns QR Ph, gateway, payout, and reconciliation workflows around your operating model.",
  },
  {
    number: "03",
    title: "Launch with operations support",
    description:
      "Your team goes live with clearer visibility, dependable handoff, and a proposal built around scale.",
  },
];

const strengths = [
  "Built around Philippine payment behavior, compliance expectations, and enterprise workflows",
  "Dependable uptime and reporting designed to reduce reconciliation friction",
  "Hands-on rollout support for institutions, merchants, and platform partners",
  "A proposal-led engagement model for serious operators, not self-serve guesswork",
];

const partnerGroups = [
  "SME operators",
  "Retail networks",
  "Schools and universities",
  "Clinics and health groups",
  "Cooperatives",
  "SaaS platforms",
  "Enterprise finance teams",
  "Marketplace operators",
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
    <header className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-white/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
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
  const metrics = [
    { label: "businesses supported", value: "5,000+" },
    { label: "platform uptime", value: "99.9%" },
    { label: "implementation visibility", value: "24 hrs" },
  ];

  return (
    <section
      id="home"
      className="hero-warm relative overflow-hidden bg-transparent"
    >
      <div
        id="main"
        className="relative z-10 mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8"
      >
        <div className="flex flex-col justify-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand)]">
            Dependable Philippine B2B payments
          </p>
          <h1 className="font-heading max-w-4xl text-[clamp(2.65rem,5.3vw,4.25rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[var(--text-primary)]">
            Powering seamless
            <span className="text-[var(--brand)]"> business payments </span>
            across the Philippines
          </h1>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-[var(--text-secondary)]">
            iPay helps SMEs, institutions, and enterprise platforms collect,
            settle, and reconcile payments with a cleaner operational model and
            proposal-led implementation support.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="#proposal">Request Proposal</Button>
            <Button href="#services" variant="secondary">
              Explore Services
            </Button>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-[var(--border-light)] bg-white p-5 shadow-[var(--shadow-card)]"
              >
                <p className="font-heading text-3xl font-bold tracking-[-0.04em] text-[var(--text-primary)]">
                  {metric.value}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-faint)]">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
}

function TrustBar() {
  const items = ["QR Ph", "InstaPay", "Settlement Controls", "Reconciliation"];

  return (
    <section className="border-y border-[var(--border-light)] bg-[var(--bg-subtle)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Trusted by growing Philippine businesses, institutions, and payment
          operations teams
        </p>
        <div className="flex flex-wrap gap-3">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[var(--border-light)] bg-white px-4 py-2 text-sm text-[var(--text-secondary)]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoWeServe() {
  return (
    <section id="who-we-serve" className="bg-white/82 py-24 backdrop-blur-[2px] sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Who We Serve"
          title={
            <>
              Payment infrastructure shaped for
              <span className="text-[var(--brand)]"> real business operators</span>
            </>
          }
          description="iPay is positioned for organizations that need dependable collections, finance visibility, and rollout support that fits Philippine operating realities."
          align="center"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr_1fr]">
          {segments.map((segment, index) => (
            <article
              key={segment.title}
              className={`rounded-[24px] border border-[var(--border-light)] bg-white p-7 shadow-[var(--shadow-card)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] ${index === 0 ? "lg:row-span-2" : ""
                }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
                {segment.eyebrow}
              </p>
              <h3 className="font-heading mt-4 text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                {segment.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--text-muted)]">
                {segment.description}
              </p>
              <div className="mt-6 space-y-3">
                {segment.points.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-pale)] text-[var(--brand)]">
                      OK
                    </span>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {point}
                    </p>
                  </div>
                ))}
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
          label="Services"
          title={
            <>
              A premium light-theme front door for
              <span className="text-[var(--brand)]"> enterprise payment solutions</span>
            </>
          }
          description="The service layer is presented with clean cards, visible structure, and trust-first copy so the brand feels credible to SME and enterprise buyers at first glance."
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
          label="How It Works"
          title={
            <>
              Clear rollout steps for teams that need
              <span className="text-[var(--brand)]"> operational confidence</span>
            </>
          }
          description="The experience is positioned like a serious B2B engagement: understand the workflow, configure the rails, and launch with stronger reporting and support."
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
    { value: "PHP 2B+", label: "annualized payment volume visibility" },
    { value: "5,000+", label: "businesses and institutions supported" },
    { value: "99.9%", label: "uptime target posture" },
    { value: "24 hrs", label: "settlement insight turnaround" },
  ];

  return (
    <section className="bg-[color:rgb(248_249_250_/_0.8)] py-24 backdrop-blur-[2px] sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeader
            label="Why Choose iPay"
            title={
              <>
                Fintech credibility with
                <span className="text-[var(--brand)]"> a cleaner buying signal</span>
              </>
            }
            description="This section keeps the brand grounded in trust, operational maturity, and Philippine market relevance instead of generic startup language."
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
    <section id="partners" className="bg-white/82 py-24 backdrop-blur-[2px] sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Partners"
          title={
            <>
              Built for the operators that keep
              <span className="text-[var(--brand)]"> payment ecosystems moving</span>
            </>
          }
          description="The partner section is intentionally restrained: grayscale trust treatment, visible structure, and enough hierarchy to feel enterprise-grade without becoming noisy."
          align="center"
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partnerGroups.map((partner) => (
            <div
              key={partner}
              className="rounded-[18px] border border-[var(--border-light)] bg-[var(--bg-subtle)] px-5 py-6 text-center text-base font-semibold tracking-[0.04em] text-slate-500"
            >
              {partner}
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
                Ready to modernize collections, settlement visibility, and payment operations?
              </h2>
              <p className="mt-4 text-lg leading-8 text-white/82">
                Start with a proposal tailored for your business model, volume,
                rollout constraints, and Philippine payment requirements.
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
    "QR Ph Collections",
    "Payment Gateway",
    "Bulk Disbursements",
    "Settlement Reporting",
  ];

  return (
    <footer className="bg-[#111827] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image src={logo} alt="iPay logo" className="h-11 w-auto" />
            <div>
              <p className="font-heading text-sm font-semibold tracking-[0.28em] text-[var(--brand)]">
                IPAY
              </p>
              <p className="text-xs text-slate-400">
                Payment infrastructure for Philippine businesses
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
            Dependable payment solutions for SMEs, institutions, and enterprise
            platforms across the Philippines.
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
            Trust Signals
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p>BSP-ready implementation posture</p>
            <p>QR Ph and InstaPay-aligned payment operations</p>
            <p>Proposal-led onboarding for enterprise buyers</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>(c) 2026 iPay. All rights reserved.</p>
          <p>BSP-facing fintech positioning for Philippine business payments.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
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
