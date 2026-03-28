export type NavItem = { label: string; href: string };

export type Segment = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  imageSrc: string;
  imageAlt: string;
  imagePosition?: string;
  imageScale?: number;
};

export type Service = { title: string; description: string };

export type Step = { number: string; title: string; description: string };

export type SolutionFeature = {
  title: string;
  subtitle: string;
  body: string;
  tag: string;
  tone: "gold" | "green" | "blue";
};

export type SolutionDetail = { title: string; body: string };

export type PartnerLogo = {
  name: string;
  src?: string;
  width?: number;
  height?: number;
  label?: string;
  className?: string;
  wrapperClassName?: string;
  labelClassName?: string;
};

export type PartnerCategory = {
  title: string;
  panelTitle: string;
  tabLabel: string;
  tabIcon: string;
  counterLabel: string;
  description: string;
  layout: "pill" | "card";
  logos: PartnerLogo[];
};
