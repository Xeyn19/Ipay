import { cookies } from "next/headers";
import type { Metadata } from "next";
import { BackToTop } from "@/app/components/home/back-to-top";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import { Button } from "@/app/components/home/ui";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";
import { PrivacyPolicyContent } from "./policy-content";

export const metadata: Metadata = {
  title: "Privacy Policy | iPay",
  description:
    "Privacy Policy outlining how we collect, process, and protect your personal data.",
};

export default async function PrivacyPolicyPage() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;

  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar initialTheme={initialTheme} />

      <section className="relative px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-[var(--border-light)] bg-[linear-gradient(180deg,var(--bg-elevated)_0%,var(--bg-subtle)_100%)] p-8 shadow-[var(--shadow-large)] sm:p-12 lg:p-16">
          <div className="prose prose-sm max-w-none prose-a:text-[var(--brand)] prose-headings:font-heading prose-headings:font-semibold prose-headings:tracking-[-0.03em] prose-headings:text-[var(--text-primary)] prose-li:text-[var(--text-muted)] prose-p:text-[var(--text-muted)] prose-strong:text-[var(--text-primary)] hover:prose-a:text-[var(--brand-dark)] dark:prose-invert sm:prose-base">
            <PrivacyPolicyContent />

            <div className="mt-12 flex justify-center border-t border-[var(--border-light)] pt-8">
              <Button href="/request-proposal">Back to Proposal Form</Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </main>
  );
}
