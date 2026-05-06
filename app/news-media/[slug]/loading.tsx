import { cookies } from "next/headers";
import { Footer } from "@/app/components/home/footer";
import { Navbar } from "@/app/components/home/navbar";
import { DEFAULT_THEME, THEME_COOKIE_KEY, isTheme } from "@/app/lib/theme";

function SkeletonLine({
  className,
}: {
  className: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-full bg-[var(--bg-subtle)] ${className}`}
    />
  );
}

export default async function Loading() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_KEY)?.value;
  const initialTheme = isTheme(cookieTheme) ? cookieTheme : DEFAULT_THEME;

  return (
    <main className="flex min-h-screen flex-col bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <Navbar initialTheme={initialTheme} />

      <div className="flex-1 overflow-x-clip">
        <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <article>
              <div
                aria-hidden="true"
                className="relative aspect-[16/9] w-full animate-pulse overflow-hidden rounded-2xl bg-[var(--bg-subtle)]"
              />

              <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
                <div className="flex justify-center">
                  <SkeletonLine className="h-3 w-32" />
                </div>

                <div className="mt-8 space-y-3">
                  <SkeletonLine className="h-8 w-full rounded-xl" />
                  <SkeletonLine className="h-8 w-3/4 rounded-xl" />
                </div>

                <div className="mt-6 flex justify-center">
                  <SkeletonLine className="h-3 w-24" />
                </div>

                <div className="mt-10 space-y-3">
                  <SkeletonLine className="h-4 w-full" />
                  <SkeletonLine className="h-4 w-full" />
                  <SkeletonLine className="h-4 w-5/6" />
                </div>

                <div className="mt-10 space-y-4">
                  <SkeletonLine className="h-4 w-full" />
                  <SkeletonLine className="h-4 w-full" />
                  <SkeletonLine className="h-4 w-[92%]" />
                  <SkeletonLine className="h-4 w-full" />
                  <SkeletonLine className="h-4 w-[88%]" />
                  <SkeletonLine className="h-4 w-[95%]" />
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
