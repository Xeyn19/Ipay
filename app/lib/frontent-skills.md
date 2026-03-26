---
name: modern-frontend-design
description: >
  How to design and build modern, premium-quality frontend interfaces that look like high-end SaaS
  products, modern AI tools, and award-winning design websites — not generic templates or outdated
  layouts. Use this skill whenever the user asks you to build a frontend, create a landing page,
  design a dashboard, scaffold a web app UI, build a SaaS interface, create a portfolio site, or
  produce any kind of user-facing web interface. Also use it when the user says things like "make
  it look modern", "build me a beautiful UI", "create a homepage for my app", "design a pricing
  page", or mentions anything related to frontend design, UI/UX, component architecture, or
  responsive web layouts — even if they don't explicitly say "frontend" or "design".

  ACTIVE PROJECT: iPay Philippines — B2B fintech payment platform. Brand color: #f17a1e.
  Theme: LIGHT (white backgrounds, dark text, orange accents).
  Stack: Next.js 14 App Router + TypeScript + Tailwind CSS.
version: "1.0.0"
author: deveshpunjabi
tags:
  - frontend
  - design
  - ui-ux
  - landing-page
  - fintech
  - payments
  - philippines
  - light-theme
  - web-design
  - tailwind
  - nextjs
  - react
  - saas
---

# Modern Frontend Design — iPay Philippines Edition

You are not just writing code. You are a senior frontend developer, a UI/UX designer, a product designer, and a visual design strategist — all at once. Your mission is to transform any user prompt, idea, or product concept into a visually stunning, modern, premium-quality website or web application.

**ACTIVE PROJECT CONTEXT**: You are rebuilding the iPay Philippines website — a B2B payment infrastructure platform serving SMEs, institutions, and enterprise platforms across the Philippines. The existing site is on WordPress.

**THEME: LIGHT** — white and off-white backgrounds, dark charcoal text, `#f17a1e` orange as the sole accent color. This is non-negotiable. Do NOT use dark backgrounds. Do NOT invert to a dark theme.

Brand primary color: `#f17a1e` (iPay Orange). Stack: Next.js 14 + TypeScript + Tailwind CSS.

---

## Design Philosophy — The Premium Standard

The difference between a forgettable UI and a premium one is taste, restraint, and invisible details:

- **Restraint over excess.** One accent color (`#f17a1e`), used surgically — CTAs, icon fills, headline accent words, border highlights. Everything else is white, off-white, and dark charcoal.
- **Rhythm and proportion.** Consistent spacing intervals, proportional font sizes, generous whitespace. The eye flows smoothly without jarring jumps.
- **Contextual authenticity.** iPay is a trust-first B2B fintech for the Philippine market. The design must feel clean, authoritative, and professional — like a well-funded local bank's digital product, not a consumer app.
- **Emotional first impression.** Users form opinions in 50ms. Clean white layout + bold dark headlines + confident orange CTAs = "This is a serious, trustworthy company."
- **The startup test.** Ask: "Would a well-funded Philippine fintech startup ship this?" If no — iterate.

---

## Step 1 — Understand the Product

**iPay Philippines — Product Summary**

- **Product type**: B2B fintech marketing/landing page
- **Target audience**: SME owners, institutional administrators (schools, clinics, cooperatives), SaaS developers, enterprise decision-makers in the Philippines
- **Core value proposition**: Dependable, efficient, and secure payment solutions for growing enterprises, SMEs, and institutions across the Philippines
- **Main conversion goal**: "Request a Proposal" — drive businesses to initiate a sales conversation
- **Key sections**: Hero, Who We Serve (SMEs / Institutions / Platforms), Services, How It Works, Why Choose Us, Partners, CTA Banner, Footer

### Niche-Aware Design Adaptation

iPay sits at the intersection of **Fintech** and **Consulting / B2B** — both executed in a premium light theme:

| Niche                                 | Design Direction                                                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Fintech (iPay primary)**            | **Clean white/light-gray surfaces, `#f17a1e` orange accents, organized data, professional typography, trust signals** |
| **Consulting / B2B (iPay secondary)** | **Authority-driven, numbered value props, compliance badges, client logo bars**                                       |
| AI / ML tools                         | Dark themes, glowing accents, futuristic gradients                                                                    |
| Developer tools                       | Monospace accents, high-contrast, code-block styling                                                                  |
| Social platforms                      | Vibrant colors, rounded shapes, card-based feeds                                                                      |
| Creative agencies                     | Bold typography, warm tones, gallery layouts                                                                          |
| SaaS dashboards                       | Sidebar navigation, metric cards, neutral palettes                                                                    |
| E-commerce                            | Product grid focus, prominent CTAs, trust badges                                                                      |
| Health / Wellness                     | Soft colors, generous whitespace, calming gradients                                                                   |
| Education                             | Structured layouts, progress indicators, friendly colors                                                              |
| Startups / Landing pages              | Hero-driven, social proof, feature grids, strong CTAs                                                                 |

---

## Step 2 — Visual Inspiration Research

Reference light-theme fintech and B2B products as direct peers:

- **Stripe.com** — clean white, structured sections, subtle gray dividers, bold dark headlines
- **PayMongo.com** — Philippine fintech, clean light layout, bright accents
- **Brex.com** — premium light B2B fintech, strong typography, card grids
- **Wise.com** — clean, trust-forward, white backgrounds (mirror structure, swap color to orange)
- **Xendit.co** — Southeast Asian fintech peer, clean professional layout

Key elements to extract:

- **Hero**: white or warm `#fffaf6` background, large dark bold headline with `#f17a1e` accent words, orange CTA button with shadow, right-side product mockup card
- **Typography**: 60–72px dark charcoal Sora display, 18px gray DM Sans subtext
- **Color palette**: `#ffffff` / `#f8f9fa` backgrounds, `#111827` dark text, `#f17a1e` orange accents only
- **Cards**: white bg, `1px #e5e7eb` border, soft multi-layer shadow, orange icon circles, hover lift
- **Spacing**: 96–128px section padding, generous whitespace
- **Social proof**: grayscale partner logos, "Trusted by 5,000+ businesses" trust badge
- **Section alternation**: white ↔ `#f8f9fa` creates visual rhythm without any dark backgrounds

### 2025–2026 Design Trends (Light Theme)

- **Bento grid layouts** — asymmetric card grids for WhoWeServe and Services sections
- **Mono-accent palettes** — `#f17a1e` as the ONLY accent, everything else in neutrals
- **Oversized typography heroes** — 64–80px headline, `-0.04em` letter spacing, dark charcoal
- **Subtle warm backgrounds** — hero may use a barely-perceptible orange tint `rgba(241,122,30,0.04)` for warmth
- **Sharp clean cards** — white cards, 1px light gray border, soft shadow — no glassmorphism on light theme
- **Orange gradient CTAs** — `linear-gradient(135deg, #f17a1e, #f99547)` on CTA buttons adds depth

---

## Step 3 — Visual System Planning

### Typography — iPay Specific

**Fonts**: Sora (headings) + DM Sans (body) — import via `next/font/google`

```ts
import { Sora, DM_Sans } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "600", "700", "800"],
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["400", "500", "600"],
});
```

| Role        | Font    | Size                   | Weight | Color     |
| ----------- | ------- | ---------------------- | ------ | --------- |
| Display     | Sora    | clamp(48px, 6vw, 72px) | 800    | `#111827` |
| H1          | Sora    | clamp(36px, 4vw, 56px) | 700    | `#111827` |
| H2          | Sora    | clamp(28px, 3vw, 40px) | 600    | `#111827` |
| H3          | Sora    | 22–24px                | 600    | `#1f2937` |
| Body        | DM Sans | 16–18px                | 400    | `#4b5563` |
| Caption     | DM Sans | 13–14px                | 400    | `#6b7280` |
| Label/Badge | DM Sans | 11–12px                | 600    | `#f17a1e` |

**Heading rule**: Dark charcoal base with `#f17a1e` on 1–2 accent words per headline.
Example: `Powering Seamless <span class="text-brand">Business Payments</span> Across the Philippines`

Letter spacing on headings: `-0.03em` to `-0.04em`. Display line height: `1.1`.

### Color Palette — Light Theme

```css
/* globals.css */
:root {
  /* Brand */
  --brand: #f17a1e;
  --brand-dark: #d4651a;
  --brand-light: #f99547;
  --brand-pale: rgba(241, 122, 30, 0.08);

  /* Backgrounds — LIGHT THEME ONLY */
  --bg-base: #ffffff;
  --bg-subtle: #f8f9fa;
  --bg-warm: #fffaf6;
  --bg-tint: rgba(241, 122, 30, 0.04);

  /* Borders */
  --border-light: #e5e7eb;
  --border-medium: #d1d5db;
  --border-orange: rgba(241, 122, 30, 0.3);

  /* Text */
  --text-primary: #111827;
  --text-secondary: #374151;
  --text-muted: #6b7280;
  --text-faint: #9ca3af;

  /* Shadows */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06);
  --shadow-card-hover:
    0 4px 12px rgba(0, 0, 0, 0.1), 0 8px 32px rgba(241, 122, 30, 0.1);
  --shadow-button: 0 4px 14px rgba(241, 122, 30, 0.35);
}
```

```ts
// tailwind.config.ts
colors: {
  brand: { DEFAULT: '#f17a1e', dark: '#d4651a', light: '#f99547', pale: '#fff4ec' },
  neutral: {
    50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb',
    300: '#d1d5db', 600: '#4b5563', 700: '#374151',
    800: '#1f2937', 900: '#111827',
  }
}
```

**HARD RULES:**

- `#ffffff` and `#f8f9fa` are the ONLY page backgrounds — no dark sections except the footer and CTABanner
- `#f17a1e` is the ONLY accent color — no blue, purple, teal, or green anywhere
- Section rhythm: alternate white ↔ `#f8f9fa` throughout
- CTABanner is the ONE full-orange-background section (`bg-brand` with white text)
- Footer uses `bg-neutral-900` — a dark footer is standard and acceptable even on light-theme sites

### Spacing, Radius, and Shadows

- **Spacing scale** (4px base): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128
- **Border radius**: `8px` cards, `6px` buttons, `4px` inputs — professional, never fully pill-shaped
- **Card shadows**: soft multi-layer (`var(--shadow-card)`), orange-tinted on hover (`var(--shadow-card-hover)`)

---

## Step 4 — Layout Architecture

### iPay Landing Page Section Order

```
<Navbar />
  — bg-white, sticky, bottom border #e5e7eb on scroll
  — logo (orange diamond + "IPAY") + nav links in #374151 + "Request Proposal" orange CTA

<Hero />
  — bg-white or #fffaf6 (warm off-white)
  — subtle radial orange tint at top-left: rgba(241,122,30,0.06)
  — left: 64–72px Sora headline (dark + orange accent) + 18px body + 2 CTA buttons
  — right: floating product mockup card (payment transaction UI, white card with shadow)

<TrustBar />
  — bg-neutral-50 (#f8f9fa), thin top/bottom borders #e5e7eb
  — "Trusted by 5,000+ Philippine businesses" + grayscale partner logos

<WhoWeServe />
  — bg-white
  — orange label + dark Sora heading + muted subtext
  — 3-card bento grid: white cards, #e5e7eb border, orange icon circles, soft shadow

<Services />
  — bg-neutral-50 (#f8f9fa)
  — 6-card grid (3×2): white cards, orange Lucide icons, hover lift with orange-tinted shadow

<HowItWorks />
  — bg-white
  — 3 numbered steps, orange number circles, orange dashed connecting line on desktop

<WhyChooseUs />
  — bg-neutral-50 (#f8f9fa)
  — animated stat counters: orange numbers (₱2B+, 5,000+, 99.9%, 24hrs)
  — feature grid with orange check icons

<Partners />
  — bg-white
  — "Our Partners" orange label + grayscale logo cloud

<CTABanner />
  — bg-brand (#f17a1e) — the ONE full orange background section
  — white headline + white-bg/orange-text secondary button

<Footer />
  — bg-neutral-900 (#111827) — dark footer, standard for all themes
  — white text, muted gray links, orange logo, BSP badge, copyright
```

---

## Step 5 — UI Component System

### Component Organization

```
components/
├── layout/
│   ├── Navbar.tsx         — white bg, sticky, orange CTA
│   └── Footer.tsx         — dark bg #111827, white text, 4-col
├── ui/
│   ├── Button.tsx         — primary (orange) | secondary (outline) | inverse (white on orange)
│   ├── Card.tsx           — white bg, border, shadow, hover lift
│   ├── SectionHeader.tsx  — orange label + dark heading + muted subtext
│   ├── StatCard.tsx       — orange CountUp number + dark label
│   └── Badge.tsx          — pale orange pill label
├── sections/
│   ├── Hero.tsx
│   ├── TrustBar.tsx
│   ├── WhoWeServe.tsx
│   ├── Services.tsx
│   ├── HowItWorks.tsx
│   ├── WhyChooseUs.tsx
│   ├── Partners.tsx
│   └── CTABanner.tsx
```

### Component Recipes

**Card**

```tsx
// bg-white border border-neutral-200 rounded-xl p-6
// shadow-[0_1px_3px_rgba(0,0,0,0.08),_0_4px_16px_rgba(0,0,0,0.06)]
// hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(241,122,30,0.10)]
// transition-all duration-200 ease-out
// Icon: w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand
```

**Button — Primary**

```tsx
// bg-brand hover:bg-brand-dark text-white font-semibold
// px-6 py-3 rounded-md text-sm
// shadow-[0_4px_14px_rgba(241,122,30,0.35)] hover:shadow-[0_6px_20px_rgba(241,122,30,0.50)]
// transition-all duration-200
```

**Button — Secondary (outline)**

```tsx
// border-2 border-brand text-brand hover:bg-brand hover:text-white
// px-6 py-3 rounded-md text-sm font-semibold transition-all duration-200
```

**Button — Inverse (on CTABanner)**

```tsx
// bg-white text-brand hover:bg-neutral-100
// px-6 py-3 rounded-md text-sm font-semibold shadow-sm transition-all duration-200
```

**SectionHeader**

```tsx
// Label: text-brand text-xs font-semibold uppercase tracking-[0.1em] mb-3
// Heading: text-3xl md:text-4xl font-bold text-neutral-900 mb-4 font-sora
// Subtext: text-neutral-500 text-lg max-w-2xl mx-auto text-center leading-relaxed
```

**StatCard**

```tsx
// border-t-2 border-brand pt-6
// Number: text-5xl font-bold text-brand font-sora (CountUp on scroll)
// Label: text-sm text-neutral-500 uppercase tracking-widest mt-2
```

### Component Quality Standards

- White cards on white sections MUST have `border border-neutral-200 shadow-sm` — never invisible
- Orange icon circles: `bg-brand/10` (pale fill) with `text-brand` icon
- All hover transitions: `duration-200 ease-out`
- Focus rings: `focus:ring-2 focus:ring-brand/40 focus:outline-none`

---

## Step 6 — Modern Interaction Design

### Essential Interactions

- **Card hover**: `-translate-y-1` lift + orange-tinted shadow — 200ms ease-out
- **CTA hover**: `bg-brand-dark` + stronger shadow glow
- **Scroll reveals**: `opacity: 0 → 1` + `translateY(20px → 0)`, 400–500ms ease-out (Framer Motion)
- **Stagger**: card grids animate with 80ms stagger delay per child
- **Stat counters**: count up from 0 on first scroll-into-view (`react-countup`)
- **Navbar on scroll**: add `shadow-sm border-b border-neutral-200` — stays white

### Animation Setup (Framer Motion)

```tsx
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
```

### Subtle Background Accents

```css
/* Hero warm tint — barely visible, adds warmth */
.hero-bg {
  background: radial-gradient(
    ellipse 800px 500px at 5% 40%,
    rgba(241, 122, 30, 0.06),
    transparent 70%
  );
}

/* Section accent divider */
.section-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #f17a1e, transparent);
  opacity: 0.25;
}
```

### Animation Rules

- `transform` and `opacity` only — GPU-accelerated, no layout thrashing
- Respect `prefers-reduced-motion` — wrap in Framer Motion's `useReducedMotion()`
- Entrance animations: subtle upward slide + fade only — never dramatic fly-ins
- No glow/blur effects on light backgrounds — use shadow lifts instead

---

## Step 7 — Technology Stack

| Layer     | Choice                    | Why                                             |
| --------- | ------------------------- | ----------------------------------------------- |
| Framework | **Next.js 14 App Router** | SSR for SEO — critical for B2B lead gen         |
| Styling   | **Tailwind CSS**          | Rapid iteration, design-system utilities        |
| Animation | **Framer Motion**         | Declarative scroll reveals, stagger, card lifts |
| Icons     | **Lucide React**          | Clean, consistent icons in orange               |
| Fonts     | **next/font/google**      | Sora + DM Sans, zero layout shift               |
| Language  | **TypeScript**            | Type safety, self-documenting props             |
| Counters  | **react-countup**         | Animated stat numbers on scroll entry           |

### Project Structure

```
/app
  layout.tsx      — fonts, metadata, white body background
  page.tsx        — assembles all section components
  globals.css     — CSS variables, base styles, subtle animations

/components
  /layout         — Navbar, Footer
  /sections       — Hero, TrustBar, WhoWeServe, Services, HowItWorks,
                    WhyChooseUs, Partners, CTABanner
  /ui             — Button, Card, SectionHeader, StatCard, Badge

/public
  /icons          — SVG logos, partner logos, BSP badge
```

---

## Step 8 — Backend Awareness

iPay is a lead-gen marketing site. Design for:

- **Proposal form fields**: `bg-white border border-neutral-300 focus:border-brand focus:ring-2 focus:ring-brand/20 text-neutral-900 rounded-md px-4 py-3`
- **Loading states**: skeleton pulse in `bg-neutral-100`
- **Error states**: `text-red-500` with retry CTA
- **All components**: accept copy/data via props — never hard-coded strings

Use realistic Philippine business copy — company names, peso amounts, QR Ph, BSP. Never lorem ipsum.

---

## Step 9 — Responsive System

| Token | Width  | Target         |
| ----- | ------ | -------------- |
| `sm`  | 640px  | Large phones   |
| `md`  | 768px  | Tablets        |
| `lg`  | 1024px | Small laptops  |
| `xl`  | 1280px | Desktops       |
| `2xl` | 1536px | Large displays |

### iPay Responsive Patterns

| Section    | Desktop             | Tablet           | Mobile            |
| ---------- | ------------------- | ---------------- | ----------------- |
| Navbar     | Full links + CTA    | Full links + CTA | Hamburger drawer  |
| Hero       | 2-col (text + card) | 2-col stacked    | Single column     |
| WhoWeServe | 3-col grid          | 2+1 grid         | 1-col stack       |
| Services   | 3×2 grid            | 2×3 grid         | 1-col stack       |
| HowItWorks | Horizontal 3-step   | Horizontal       | Vertical timeline |
| Stats      | 4-col row           | 2×2 grid         | 2×2 grid          |
| Footer     | 4-col               | 2×2              | 1-col             |

- Display text: `clamp(40px, 6vw, 72px)`
- Section padding: `py-24 md:py-20 sm:py-14`
- Max-width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Touch targets: minimum `44×44px` on mobile

---

## Step 10 — Visual Quality Validation

**Typography**

- [ ] Display headline Sora 700–800 in `#111827` with `#f17a1e` accent words
- [ ] Headings use `-0.03em` to `-0.04em` letter spacing
- [ ] Body DM Sans 16–18px, `#4b5563`, 1.6 line height
- [ ] Lines capped at 65–75 characters

**Spacing**

- [ ] All spacing from the 4px scale
- [ ] Sections `py-20` to `py-28` on desktop
- [ ] Generous whitespace — nothing cramped

**Color and Polish**

- [ ] All backgrounds are `#ffffff` or `#f8f9fa` — no dark sections except footer + CTABanner
- [ ] `#f17a1e` only on: buttons, icon fills, headline accents, stat numbers, border highlights
- [ ] No blue, purple, or off-palette colors
- [ ] White cards on white sections have visible border + shadow
- [ ] Primary buttons have orange glow shadow, not flat
- [ ] Section alternation: white ↔ `#f8f9fa` throughout
- [ ] CTABanner is full `bg-brand` with white text

**Fintech Trust**

- [ ] BSP compliance note in footer
- [ ] QR Ph / InstaPay in copy
- [ ] ₱ peso symbol in stat counters
- [ ] Security/uptime visible near CTA

**Overall Impression**

- [ ] Looks like a clean, professional Philippine fintech — comparable to PayMongo.com
- [ ] Orange is warm and confident, not aggressive or neon
- [ ] A Philippine SME or enterprise buyer trusts this on first look

---

## Step 11 — Final Automated Testing & Error Resolution (MANDATORY)

### 11.1 — Build Verification

```bash
npm install
npx tsc --noEmit
npm run build
```

### 11.2 — Lint

```bash
npx next lint
```

### 11.3 — Runtime Smoke Test

```bash
npm run dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000  # Must return 200
kill %1 2>/dev/null || true
```

### 11.4 — Component Scan

| Check                            | Fix                    |
| -------------------------------- | ---------------------- |
| Import errors                    | Fix paths, add deps    |
| Missing `key` in `.map()`        | Add unique key         |
| `window`/`document` at top level | Wrap in `useEffect`    |
| `<img>` instead of `next/image`  | Replace with `<Image>` |
| Missing `alt` text               | Add descriptive alt    |

### 11.5 — Responsive & Accessibility

| Check                                                    | Fix                                       |
| -------------------------------------------------------- | ----------------------------------------- |
| No horizontal scroll at 375px                            | `overflow-x-hidden` on wrapper            |
| Touch targets ≥ 44×44px                                  | Increase padding                          |
| Focus states visible                                     | `focus:ring-2 focus:ring-brand/40`        |
| `#f17a1e` only on large text/icons (not small body copy) | Orange on white = 3.1:1 — large text only |

**Task is NOT complete until:**

- [ ] `npm run build` exits code 0
- [ ] `npx next lint` passes
- [ ] `npm run dev` boots without crashing
- [ ] `npx tsc --noEmit` passes
- [ ] No console errors
- [ ] No overflow at 375px

---

## Final Output Requirements

- **Clean premium light-theme fintech UI** — white bg, dark typography, confident orange accents
- **`#f17a1e` precision** — CTA buttons, icon fills, headline accent words, stat numbers only
- **One full orange section** — CTABanner only (`bg-brand`, white text)
- **Dark footer** — `bg-neutral-900`, white text (standard on all themes)
- **Modular TypeScript components** — reusable, prop-driven
- **Fully responsive** — 375px / 768px / 1440px tested
- **Realistic Philippine fintech copy** — ₱ amounts, QR Ph, InstaPay, BSP references
- **Framer Motion interactions** — scroll reveals, card hover lifts, stagger animations

---

## Anti-Patterns — What to Avoid for iPay

| Anti-Pattern                  | Why Wrong                      | Fix                                                    |
| ----------------------------- | ------------------------------ | ------------------------------------------------------ |
| **Dark backgrounds**          | Violates the light theme       | `#ffffff` or `#f8f9fa` only                            |
| **Blue as accent**            | Not iPay's brand               | `#f17a1e` orange only                                  |
| **Purple gradients**          | Off-brand, AI-slop             | Never                                                  |
| **Orange as page background** | Too heavy except CTABanner     | Accents only; full-bg only on CTABanner                |
| **Invisible cards on white**  | No depth without border/shadow | Always `border border-neutral-200 shadow-sm`           |
| **Pill buttons**              | Too consumer for B2B           | `border-radius: 6–8px` max                             |
| **Stock building photos**     | Generic                        | Abstract graphics or product mockup cards              |
| **Lorem ipsum**               | Unjudgeable design             | Real Philippine fintech copy                           |
| **Inter or Roboto**           | Too generic                    | Sora + DM Sans only                                    |
| **Orange on small body text** | Fails contrast                 | Orange on large text, headings, icons only             |
| **Flat CTA buttons**          | Looks dated                    | Always add `shadow-[0_4px_14px_rgba(241,122,30,0.35)]` |
| **Identical card grid**       | No hierarchy                   | Vary sizes, use bento grid                             |

### The "Premium or Redo" Test

1. **Competitor test** — Put next to PayMongo.com or Wise.com. Does it belong in that category?
2. **Squint test** — Does orange guide the eye to the most important elements?
3. **3-second test** — Can a viewer tell immediately: "Philippine B2B payment company — request a proposal"?

If any answer is "no" — redesign before delivery.
