import { cookies } from "next/headers";
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { BackToTop } from "@/app/components/home/back-to-top";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import { Button } from "@/app/components/home/ui";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";
import { proposalSuccessCookieName } from "../success-cookie";

export const metadata: Metadata = {
  title: "Proposal Request Received | iPay",
  description:
    "Your request proposal has been received by iPay. Our team will review it and follow up within one business day.",
};

export default async function RequestProposalSuccessPage() {
  const cookieStore = await cookies();
  const hasProposalSuccessCookie = cookieStore.has(proposalSuccessCookieName);

  if (!hasProposalSuccessCookie) {
    redirect("/request-proposal");
  }

  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;

  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar initialTheme={initialTheme} />

      <section className="relative isolate overflow-hidden bg-[var(--bg-base)]">
        <Image
          src="/img/success-bg.jpg"
          alt="Business handshake representing a successful partnership discussion"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.34)_0%,rgba(6,11,19,0.24)_42%,rgba(6,11,19,0.4)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,11,19,0.82)_0%,rgba(6,11,19,0.64)_34%,rgba(6,11,19,0.28)_62%,rgba(6,11,19,0.12)_100%)]"
        />
        <div className="relative mx-auto flex min-h-[calc(100svh-var(--nav-height))] max-w-7xl items-center justify-center px-6 py-14 sm:px-10 lg:px-8">
          <div className="max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(241,122,30,0.42)] bg-[rgba(8,17,29,0.46)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-light)] shadow-[0_14px_34px_rgba(0,0,0,0.2)] backdrop-blur-sm">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-[var(--tone-green)]"
              />
              Submission Confirmed
            </div>

            <h1 className="mt-6 font-heading text-[clamp(2.4rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
              Your <span className="text-[var(--brand)]">proposal request</span>{" "}
              has been received.
            </h1>

            <p className="mt-5 text-base leading-8 text-white/88 sm:text-lg">
              Thank you for reaching out to iPay. We&apos;ve received your
              request and our team will review it carefully before getting in
              touch with a focused next step for your business.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/">Return Home</Button>
              <Button href="/#services" variant="secondary">
                Explore Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </main>
  );
}
