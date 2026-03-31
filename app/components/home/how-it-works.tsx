import { steps } from "@/app/components/home/data";
import CardSwap, { Card } from "@/app/components/cardswap";
import { SectionHeader } from "@/app/components/home/ui";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[var(--section-default)] py-24 backdrop-blur-[2px] sm:py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(520px,1.1fr)] lg:items-center lg:gap-16 lg:px-8">
        <div className="max-w-2xl">
          <SectionHeader
            label="Operational Payment Complexity"
            title={
              <>
                We replace fragmented, manual processes with
                <span className="text-[var(--brand)]"> a single, automated infrastructure</span>
              </>
            }
            description=""
          />
        </div>

        <div className="relative h-[500px] overflow-visible sm:h-[460px]">
          <div className="relative ml-auto h-full max-w-[1120px] translate-y-20 sm:translate-y-35">
            <CardSwap
              width={380}
              height={290}
              cardDistance={40}
              verticalDistance={53}
              delay={4500}
              pauseOnHover
              skewAmount={2}
              easing="linear"
            >
              {steps.map((step) => (
                <Card
                  key={step.number}
                  customClass="w-full overflow-hidden border-[var(--border-light)] bg-[var(--bg-elevated)] shadow-[var(--shadow-card)]"
                >
                  <article className="flex h-full flex-col">
                    <div className="flex items-center gap-3 border-b border-[var(--border-light)] px-5 py-4">
                      <span className="h-3 w-3 rounded-full bg-[var(--brand)]/75" />
                      <h3 className="font-heading text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                        {step.title}
                      </h3>
                    </div>
                    <div className="flex flex-1 flex-col p-7">
                      <p className="mt-5 text-base leading-7 text-[var(--text-muted)] [text-align:justify]">
                        {step.description}
                      </p>
                    </div>
                  </article>
                </Card>
              ))}
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
}
