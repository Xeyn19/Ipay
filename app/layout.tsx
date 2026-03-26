import type { Metadata } from "next";
import "./globals.css";

const themeInitScript = `
(() => {
  const storageKey = "ipay-theme";
  const root = document.documentElement;
  let theme = "light";

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
      data-theme="light"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--bg-base)] font-sans antialiased transition-colors duration-300">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
