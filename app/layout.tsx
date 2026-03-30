import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import {
  DEFAULT_THEME,
  THEME_COOKIE_KEY,
  THEME_STORAGE_KEY,
  isTheme,
} from "@/app/lib/theme";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

function getThemeInitScript(initialTheme: "light" | "dark") {
  return `
(() => {
  const storageKey = "${THEME_STORAGE_KEY}";
  const cookieKey = "${THEME_COOKIE_KEY}";
  const root = document.documentElement;
  let theme = "${initialTheme}";

  try {
    const cookieMatch = document.cookie.match(
      new RegExp("(^|; )" + cookieKey + "=([^;]+)")
    );
    const cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[2]) : null;
    if (cookieTheme === "light" || cookieTheme === "dark") {
      theme = cookieTheme;
    }

    const storedTheme = window.localStorage.getItem(storageKey);
    if (storedTheme === "light" || storedTheme === "dark") {
      theme = storedTheme;
    }
  } catch {}

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.cookie = cookieKey + "=" + theme + "; path=/; max-age=31536000; samesite=lax";
})();
`;
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "iPay | Business Payments Across the Philippines",
  description:
    "iPay delivers dependable payment infrastructure for SMEs, institutions, and enterprise platforms across the Philippines.",
  applicationName: "iPay",
  icons: {
    icon: "/ipaylogo (1).ico",
    shortcut: "/ipaylogo (1).ico",
    apple: "/apple-icon",
  },
  openGraph: {
    title: "iPay | Business Payments Across the Philippines",
    description:
      "iPay delivers dependable payment infrastructure for SMEs, institutions, and enterprise platforms across the Philippines.",
    type: "website",
    siteName: "iPay",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "iPay business payments preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iPay | Business Payments Across the Philippines",
    description:
      "iPay delivers dependable payment infrastructure for SMEs, institutions, and enterprise platforms across the Philippines.",
    images: ["/twitter-image"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;

  return (
    <html
      lang="en"
      className="h-full scroll-smooth"
      data-theme={initialTheme}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--bg-base)] font-sans antialiased transition-colors duration-300">
        <Script id="theme-init" strategy="beforeInteractive">
          {getThemeInitScript(initialTheme)}
        </Script>
        {children}
      </body>
    </html>
  );
}
