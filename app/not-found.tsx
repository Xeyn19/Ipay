import Image from "next/image";
import { cookies } from "next/headers";
import { BackToTop } from "@/app/components/home/back-to-top";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import { Button } from "@/app/components/home/ui";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";

export default async function NotFound() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;

  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar initialTheme={initialTheme} />

      <section className="relative isolate overflow-hidden">
        {/* Background image — Next.js Image fills the container precisely */}
        <Image
          src="/img/girl-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          aria-hidden="true"
        />

        {/* Overlays */}
        <div
          aria-hidden="true"
          className="absolute h-full inset-0 bg-[linear-gradient(180deg,rgba(4,8,16,0.55)_0%,rgba(6,11,19,0.45)_42%,rgba(6,11,19,0.72)_100%)] dark:bg-[linear-gradient(180deg,rgba(6,11,19,0.82)_0%,rgba(6,11,19,0.78)_40%,rgba(6,11,19,0.88)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute h-full inset-0 bg-[linear-gradient(90deg,rgba(6,11,19,0.95)_0%,rgba(6,11,19,0.80)_34%,rgba(6,11,19,0.35)_64%,rgba(6,11,19,0.18)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute h-full inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(245,166,35,0.22),transparent_68%)]"
        />

        {/* Ghost watermark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        >
          <span className="font-heading text-[clamp(16rem,40vw,28rem)] font-semibold leading-none tracking-[-0.06em] text-white/[0.035]">
            404
          </span>
        </div>

        {/* Content */}
        <div className="relative mx-auto flex min-h-[calc(100svh-var(--nav-height))] max-w-7xl items-center px-6 py-14 sm:px-10 lg:px-8">
          <div className="max-w-xl">
            <h1 className="font-heading text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-white">
              Lost somewhere{" "}
              <br />
              <span className="text-[var(--brand)]">off the map.</span>
            </h1>

            <p className="mt-5 max-w-sm text-base leading-relaxed text-white/65 sm:text-lg">
              This page doesn&apos;t exist or may have moved. Let&apos;s get you back on
              track.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
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
