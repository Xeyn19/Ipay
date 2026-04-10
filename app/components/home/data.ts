import type {
  NavItem,
  PartnerCategory,
  Segment,
  Service,
  SolutionDetail,
  SolutionFeature,
  Step,
} from "@/app/components/home/types";

export const navigation: NavItem[] = [
  { label: "Home", href: "#home" },
  { label: "Who We Serve", href: "#who-we-serve" },
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Partners", href: "#partners" },
];

export const segments: Segment[] = [
  {
    title: "SMEs",
    description:
      "Retail, restaurants, salons, service providers, and multi-branch businesses that need dependable payment acceptance and fast operational visibility.",
    eyebrow: "Who We Serve",
    points: ["QR Ph and card acceptance", "Next-day settlements"],
    imageSrc: "/img/who-we-serve/smes.jpg",
    imageAlt: "SME operations and fulfillment workflow",
    imagePosition: "58% 60%",
    imageScale: 1.14,
  },
  {
    title: "Institutions",
    description:
      "Schools, clinics, cooperatives, associations, and utility providers that require structured collections with clear controls and reporting.",
    eyebrow: "Who We Serve",
    points: ["Bulk collection tools", "Real-time reporting"],
    imageSrc: "/img/who-we-serve/institutions.jpg",
    imageAlt: "Institution payment collection desk",
    imagePosition: "61% 58%",
    imageScale: 1.12,
  },
  {
    title: "Platforms & Systems",
    description:
      "SaaS products, marketplaces, booking systems, and enterprise platforms looking to embed payments without building the rails themselves.",
    eyebrow: "Who We Serve",
    points: ["Robust API", "White-label options"],
    imageSrc: "/img/who-we-serve/platform.jpg",
    imageAlt: "Platform and SaaS workflow operations",
    imagePosition: "center center",
    imageScale: 1,
  },
];

export const services: Service[] = [
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

export const steps: Step[] = [
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

export const solutionFeatures: SolutionFeature[] = [
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

export const solutionDetails: SolutionDetail[] = [
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

export const partnerCategories: PartnerCategory[] = [
  {
    title: "Digital Collection Channels",
    panelTitle: "Digital Collection Channels",
    tabLabel: "Digital Collection",
    tabIcon: "\uD83D\uDCB3",
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
        marqueeScale: 1.18,
        marqueeZoom: 1,
        marqueePosition: "center center",
      },
      {
        name: "Maya",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/maya_logo.svg_.png",
        width: 180,
        height: 72,
        marqueeScale: 1.16,
        marqueeZoom: 1,
        marqueePosition: "center center",
      },
      {
        name: "Grab",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/grab_company-logo.wine_.png",
        width: 210,
        height: 72,
        marqueeScale: 1.24,
        marqueeZoom: 1,
        marqueePosition: "center center",
      },
      {
        name: "InstaPay",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/1500-instapay-14072022.png",
        width: 220,
        height: 72,
        marqueeScale: 1.48,
        marqueeZoom: 3.4,
        marqueePosition: "center center",
      },
      {
        name: "Shopee",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/shopee.svg_.png",
        width: 200,
        height: 72,
        marqueeScale: 1.12,
        marqueeZoom: 1,
        marqueePosition: "center center",
      },
    ],
  },
  {
    title: "Digital Disbursement Channels",
    panelTitle: "Digital Disbursement Channels",
    tabLabel: "Disbursement",
    tabIcon: "\uD83D\uDCE4",
    counterLabel: "4 Channels",
    description: "Send funds instantly to any e-wallet or bank account.",
    layout: "pill",
    logos: [
      {
        name: "GCash",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/gcash-logo.png",
        width: 210,
        height: 72,
        marqueeScale: 1.18,
        marqueeZoom: 1,
        marqueePosition: "center center",
      },
      {
        name: "Maya",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/maya_logo.svg_.png",
        width: 180,
        height: 72,
        marqueeScale: 1.16,
        marqueeZoom: 1,
        marqueePosition: "center center",
      },
      {
        name: "Grab",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/grab_company-logo.wine_.png",
        width: 210,
        height: 72,
        marqueeScale: 1.24,
        marqueeZoom: 1,
        marqueePosition: "center center",
      },
      {
        name: "InstaPay",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/1500-instapay-14072022.png",
        width: 220,
        height: 72,
        marqueeScale: 1.48,
        marqueeZoom: 3.4,
        marqueePosition: "center center",
      },
    ],
  },
  {
    title: "Merchant",
    panelTitle: "Merchant Partners",
    tabLabel: "Merchant",
    tabIcon: "\uD83C\uDFEA",
    counterLabel: "3 Partners",
    description: "Trusted by brands across retail, food, and services.",
    layout: "card",
    logos: [
      {
        name: "Daily Best",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/daily-best.png",
        width: 132,
        height: 132,
        marqueeScale: 1.1,
        marqueeZoom: 1.2,
        marqueePosition: "center center",
        wrapperClassName:
          "h-[90px] w-[90px] rounded-[18px] bg-[#ffd83d] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:h-[92px] sm:w-[92px]",
        className: "h-full w-full object-contain",
      },
      {
        name: "Nameless",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/nameless.png",
        width: 132,
        height: 132,
        marqueeScale: 1.1,
        marqueeZoom: 1.2,
        marqueePosition: "center center",
        wrapperClassName:
          "h-[90px] w-[90px] rounded-[18px] bg-[#111111] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:h-[92px] sm:w-[92px]",
        className: "h-full w-full object-contain",
      },
      {
        name: "SG",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/sg-clinic-1.png",
        width: 132,
        height: 132,
        marqueeScale: 1.08,
        marqueeZoom: 1.16,
        marqueePosition: "center center",
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
    tabIcon: "\uD83D\uDED2",
    counterLabel: "2 Partners",
    description: "Powering online stores with fast, reliable checkout.",
    layout: "card",
    logos: [
      {
        name: "XMeta",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/xmeta.png",
        width: 132,
        height: 132,
        marqueeScale: 1.12,
        marqueeZoom: 1.18,
        marqueePosition: "center center",
        wrapperClassName:
          "h-[90px] w-[90px] rounded-[18px] bg-[#ff6a2f] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:h-[92px] sm:w-[92px]",
        className: "h-full w-full object-contain",
      },
      {
        name: "Rulls",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/rulls.png",
        width: 132,
        height: 132,
        marqueeScale: 1.14,
        marqueeZoom: 1.14,
        marqueePosition: "center center",
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
    tabIcon: "\uD83D\uDDA5",
    counterLabel: "1 Partner",
    description: "Smart tools for billing, payroll, and back-office ops.",
    layout: "card",
    logos: [
      {
        name: "Soon",
        src: "https://ipay99.wordpress.com/wp-content/uploads/2026/02/soooa-1.png",
        width: 132,
        height: 132,
        marqueeScale: 1.1,
        marqueeZoom: 1.16,
        marqueePosition: "center center",
        wrapperClassName:
          "h-[90px] w-[90px] rounded-[18px] bg-[#f4f4f4] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.08)] sm:h-[92px] sm:w-[92px]",
        className: "h-full w-full object-contain",
      },
    ],
  },
];

export const trustItems = [
  {
    title: "Regulatory Compliant",
    description: "OPSCOR-2025-0002",
  },
  {
    title: "BSP-Registered Operator",
    description: "of Payment System",
  },
  {
    title: "Enterprise Grade",
    description: "Secure Infrastructure",
  },
];

export const footerServices = [
  "Payment Acceptance",
  "Billing & Invoicing",
  "Disbursement",
  "Reporting & Reconciliation",
  "Developer API",
];
