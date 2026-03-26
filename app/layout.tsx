import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full bg-[var(--bg-base)] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
