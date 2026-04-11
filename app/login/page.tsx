import { cookies } from "next/headers";
import type { Metadata } from "next";
import Image from "next/image";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign In | iPay",
  description:
    "Sign in to your iPay account to access leads and manage your business payments dashboard.",
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;

  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar initialTheme={initialTheme} />

      <section className="relative min-h-[calc(100svh-var(--nav-height))]">
        <div className="mx-auto grid min-h-[calc(100svh-var(--nav-height))] lg:grid-cols-2">

          {/* ── Left — Background Image ── */}
          <div className="relative hidden lg:block">
            <Image
              src="/img/login/handshake.jpg"
              alt="Business professionals shaking hands"
              fill
              priority
              sizes="50vw"
              className="object-cover"
            />
            {/* Dark overlay for text legibility */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(13,13,26,0.5)] via-[rgba(13,13,26,0.2)] to-transparent"
            />
            {/* Brand accent overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(241,122,30,0.08)] to-transparent"
            />
          </div>

          {/* ── Right — Login Form ── */}
          <div className="flex items-center justify-center bg-[var(--bg-base)] px-6 py-14 sm:px-10 lg:px-14 xl:px-20">
            <div className="w-full max-w-md">
              {/* Header */}
              <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-[var(--text-primary)]">
                Welcome <span className="text-[var(--brand)]">back</span>
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                Sign in to access your dashboard and manage your business operations.
              </p>

              {/* Divider */}
              <div className="my-6 h-px bg-[var(--border-light)]" />

              {/* Form */}
              <LoginForm />
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </main>
  );
}
