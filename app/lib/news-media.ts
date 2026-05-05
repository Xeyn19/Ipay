import type { JSONContent } from "@tiptap/react";

export type NewsArticleStatus = "draft" | "published" | "archived";
export type ActiveNewsArticleStatus = Exclude<NewsArticleStatus, "archived">;

export type NewsPostCategory = {
  id: string;
  name: string;
};

export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  excerpt: string;
  coverImage: string;
  publishDate: string;
  status: NewsArticleStatus;
  views: number;
  body: JSONContent;
};

export type NewsroomLinkItem = {
  id: string;
  title: string;
  href: string;
  source: string;
  date: string;
  summary: string;
  image: string;
};

export const newsStatusOptions: Array<{
  label: string;
  value: ActiveNewsArticleStatus;
}> = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
];

export const EMPTY_NEWS_BODY: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function createNewsBody(...paragraphs: string[]): JSONContent {
  const content = paragraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: "paragraph",
      content: [{ type: "text", text: paragraph }],
    }));

  if (content.length === 0) {
    return EMPTY_NEWS_BODY;
  }

  return {
    type: "doc",
    content,
  };
}

export const newsSeedArticles: NewsArticle[] = [
  {
    id: "merchant-collections-scale",
    title: "iPay expands merchant collections support for growing multi-branch teams",
    slug: "ipay-expands-merchant-collections-support",
    categoryId: "company-update",
    categoryName: "Company Update",
    excerpt:
      "A stronger operations flow for merchants that need faster visibility, cleaner reconciliation, and dependable collection channels across locations.",
    coverImage: "/img/main-hero.jpg",
    publishDate: "2026-05-01",
    status: "published",
    views: 1840,
    body: createNewsBody(
      "iPay continues to refine how merchants handle day-to-day collections across branches, counters, and digital payment touchpoints. The latest rollout focuses on giving operations and finance teams a cleaner view of incoming transactions without adding extra dashboards to monitor.",
      "For merchant teams managing multiple outlets, consistency matters as much as speed. The updated workflow is designed to reduce handoff friction between front-line staff, reconcilers, and finance reviewers so branch activity can be monitored with less manual follow-up.",
      "This direction reflects iPay's broader goal: making enterprise-grade payment infrastructure easier to use for teams that need reliability, governance, and faster turnaround in everyday operations.",
    ),
  },
  {
    id: "settlement-monitoring-launch",
    title: "iPay introduces a clearer settlement monitoring experience for finance teams",
    slug: "ipay-introduces-settlement-monitoring-experience",
    categoryId: "product-update",
    categoryName: "Product Update",
    excerpt:
      "A refined view of transaction timing, reporting signals, and settlement progress for teams that need stronger operational clarity.",
    coverImage: "/img/services-bg.jpg",
    publishDate: "2026-04-24",
    status: "published",
    views: 1265,
    body: createNewsBody(
      "Finance teams often need to answer the same questions quickly: what settled, what is still moving, and what needs review. iPay's updated monitoring approach is built to make that interpretation more immediate.",
      "The public-facing news stream highlights this product direction through a simpler story: less time searching through fragmented updates, and more confidence in the status of day-to-day collections activity.",
      "As the newsroom grows, this category will be used for future platform updates, release notes, and notable workflow improvements relevant to iPay clients and partners.",
    ),
  },
  {
    id: "partner-enablements",
    title: "iPay strengthens partner enablement for institutions and platform operators",
    slug: "ipay-strengthens-partner-enablement",
    categoryId: "partnership",
    categoryName: "Partnership",
    excerpt:
      "A continuing focus on structured payment flows, rollout readiness, and clearer partner communications for institutional and platform use cases.",
    coverImage: "/img/ipay-sol.jpg",
    publishDate: "2026-04-15",
    status: "published",
    views: 930,
    body: createNewsBody(
      "Institutional rollouts and platform deployments usually require more than a working payment flow. Teams also need documentation, accountability, and a dependable rhythm for operational coordination.",
      "This update represents iPay's commitment to partner readiness: aligning implementation expectations, clarifying milestones, and improving how updates are communicated to the organizations that rely on the platform.",
      "The CMS workspace planned for the dashboard is intended to support that same direction by giving the internal team a cleaner place to prepare public-facing announcements before backend publishing is introduced.",
    ),
  },
  {
    id: "draft-qr-campaign-story",
    title: "iPay prepares a broader QR payment story for merchant campaign rollout",
    slug: "ipay-prepares-broader-qr-payment-story",
    categoryId: "campaign-update",
    categoryName: "Campaign Update",
    excerpt:
      "A draft newsroom entry focused on merchant rollout messaging, payment acceptance clarity, and supporting launch materials.",
    coverImage: "/img/requestproposal.jpg",
    publishDate: "2026-05-08",
    status: "draft",
    views: 0,
    body: createNewsBody(
      "This draft is being prepared to support a broader campaign around merchant QR payment readiness, simple customer communication, and clearer rollout references for the business team.",
      "The working version is intentionally concise while the final message, imagery, and public timing are still being aligned across marketing and partnerships.",
    ),
  },
  {
    id: "draft-client-portal-update",
    title: "Client communications draft for the upcoming settlement portal update",
    slug: "client-communications-settlement-portal-update",
    categoryId: "product-update",
    categoryName: "Product Update",
    excerpt:
      "An internal draft for a future public update covering visibility improvements, reporting guidance, and support readiness.",
    coverImage: "/img/report-recon.jpg",
    publishDate: "2026-05-06",
    status: "draft",
    views: 0,
    body: createNewsBody(
      "This draft is reserved for the next settlement portal messaging cycle and focuses on what finance and operations teams need to know before the update is announced publicly.",
      "The article body will later be expanded with screenshots, release timing, and operational guidance once the final rollout date is approved.",
    ),
  },
];

export const newsExternalCoverage: NewsroomLinkItem[] = [
  {
    id: "coverage-qrph-growth",
    title: "QR Ph adoption continues to reshape everyday business collections",
    href: "https://example.com/news/qrph-growth",
    source: "Financial Times PH",
    date: "2026-04-28",
    summary:
      "Industry observers highlight how merchants are prioritizing faster checkout experiences and stronger transaction visibility across digital channels.",
    image: "/img/services/payment-acceptance.jpg",
  },
  {
    id: "coverage-ops-visibility",
    title: "Operators want fewer dashboards and clearer settlement reporting",
    href: "https://example.com/news/ops-visibility",
    source: "Business Ledger",
    date: "2026-04-16",
    summary:
      "Coverage focused on the operational pressure finance teams face when collections, reporting, and reconciliation remain fragmented.",
    image: "/img/report-recon.jpg",
  },
  {
    id: "coverage-platform-partnerships",
    title: "Embedded payment partnerships gain momentum among local platforms",
    href: "https://example.com/news/platform-partnerships",
    source: "Tech Dispatch",
    date: "2026-04-04",
    summary:
      "Platform operators are investing in faster go-live cycles and more dependable payments infrastructure for their merchants and end users.",
    image: "/img/dev-api.jpg",
  },
];

export const newsFeaturedVideos: NewsroomLinkItem[] = [
  {
    id: "video-future-of-collections",
    title: "How iPay thinks about the future of business collections",
    href: "https://example.com/video/future-of-collections",
    source: "iPay Sessions",
    date: "2026-05-02",
    summary:
      "A quick executive-view format covering collections reliability, rollout discipline, and the need for cleaner operational tooling.",
    image: "/img/main-bg.jpg",
  },
  {
    id: "video-partner-rollout",
    title: "What better partner rollout coordination should look like",
    href: "https://example.com/video/partner-rollout",
    source: "Industry Roundtable",
    date: "2026-04-21",
    summary:
      "A partner-focused discussion about implementation readiness, governance, and smoother communication between fintech teams and clients.",
    image: "/img/ipay-bg.jpg",
  },
];

export function createEmptyNewsArticle(): NewsArticle {
  return {
    id: "new-post",
    title: "",
    slug: "",
    categoryId: "",
    categoryName: "",
    excerpt: "",
    coverImage: "",
    publishDate: "",
    status: "draft",
    views: 0,
    body: EMPTY_NEWS_BODY,
  };
}

export function buildNewsSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseNewsDate(dateString: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(`${dateString}T12:00:00`);
  }

  return new Date(dateString);
}

export function formatNewsDate(dateString: string) {
  return parseNewsDate(dateString).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getPublishedNewsArticles(articles: NewsArticle[]) {
  return [...articles]
    .filter((article) => article.status === "published")
    .sort(
      (left, right) =>
        parseNewsDate(right.publishDate).getTime() -
        parseNewsDate(left.publishDate).getTime()
    );
}

export function getManagedNewsArticles(articles: NewsArticle[]) {
  return [...articles].sort(
    (left, right) =>
      parseNewsDate(right.publishDate).getTime() -
      parseNewsDate(left.publishDate).getTime()
  );
}

export function getNewsArticleById(
  articles: NewsArticle[],
  articleId: string
) {
  return articles.find((article) => article.id === articleId);
}

function getNodeText(node: JSONContent | undefined): string {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return node.text ?? "";
  }

  if (node.type === "hardBreak") {
    return " ";
  }

  return (node.content ?? []).map(getNodeText).join(" ");
}

function getBlockParagraphs(node: JSONContent | undefined): string[] {
  if (!node) {
    return [];
  }

  if (
    node.type === "paragraph" ||
    node.type === "heading" ||
    node.type === "codeBlock"
  ) {
    const text = getNodeText(node).replace(/\s+/g, " ").trim();
    return text ? [text] : [];
  }

  return (node.content ?? []).flatMap(getBlockParagraphs);
}

export function getNewsBodyText(body: JSONContent) {
  return getNodeText(body).replace(/\s+/g, " ").trim();
}

export function getNewsBodyParagraphs(body: JSONContent) {
  return getBlockParagraphs(body);
}

export function estimateNewsReadingMinutes(body: JSONContent) {
  const wordCount = getNewsBodyText(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 180));
}

export function getNewsStatusLabel(status: NewsArticleStatus) {
  if (status === "archived") {
    return "Archived";
  }

  if (status === "published") {
    return "Published";
  }

  return "Draft";
}

export function getNewsStatusClassName(status: NewsArticleStatus) {
  if (status === "archived") {
    return "border-[var(--border-light)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]";
  }

  if (status === "published") {
    return "border-[var(--tone-green)]/20 bg-[var(--tone-green-soft)] text-[var(--tone-green)]";
  }

  return "border-[var(--border-orange)] bg-[var(--brand-pale)] text-[var(--brand)]";
}
