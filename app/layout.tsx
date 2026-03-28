import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const themeInitScript = `
(() => {
  const storageKey = "ipay-theme-v2";
  const root = document.documentElement;
  let theme = "dark";

  try {
    const storedTheme = window.localStorage.getItem(storageKey);
    if (storedTheme === "light" || storedTheme === "dark") {
      theme = storedTheme;
    }
  } catch {}

  root.dataset.theme = theme;
  root.style.colorScheme = theme;
})();
`;

export const metadata: Metadata = {
  title: "iPay | Business Payments Across the Philippines",
  description:
    "iPay delivers dependable payment infrastructure for SMEs, institutions, and enterprise platforms across the Philippines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full scroll-smooth"
      data-theme="dark"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--bg-base)] font-sans antialiased transition-colors duration-300">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        {children}
      </body>
    </html>
  );
}
