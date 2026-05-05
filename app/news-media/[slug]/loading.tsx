export default function Loading() {
  return (
    <main className="overflow-x-hidden bg-[var(--bg-base)] pt-[var(--nav-height)] text-[var(--text-primary)]">
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="h-5 w-40 animate-pulse rounded-full bg-[var(--bg-subtle)]" />

          <div className="mt-6 overflow-hidden rounded-[32px] border border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]">
            <div className="aspect-[16/9] w-full animate-pulse bg-[var(--bg-subtle)]" />

            <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
              <div className="h-4 w-56 animate-pulse rounded-full bg-[var(--bg-subtle)]" />
              <div className="mt-5 h-12 w-full animate-pulse rounded-3xl bg-[var(--bg-subtle)]" />
              <div className="mt-3 h-12 w-4/5 animate-pulse rounded-3xl bg-[var(--bg-subtle)]" />
              <div className="mt-8 space-y-4">
                <div className="h-5 w-full animate-pulse rounded-full bg-[var(--bg-subtle)]" />
                <div className="h-5 w-full animate-pulse rounded-full bg-[var(--bg-subtle)]" />
                <div className="h-5 w-11/12 animate-pulse rounded-full bg-[var(--bg-subtle)]" />
                <div className="h-5 w-full animate-pulse rounded-full bg-[var(--bg-subtle)]" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
