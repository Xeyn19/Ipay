import { steps } from "@/app/components/home/data";
import CardSwap, { Card } from "@/app/components/cardswap";
import { SectionHeader } from "@/app/components/home/ui";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="flex min-h-[500px] items-center bg-[var(--section-default)] py-16 backdrop-blur-[2px] sm:min-h-[600px] sm:py-24 lg:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:gap-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(520px,1.1fr)] lg:items-center lg:gap-16 lg:px-8">
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

        <div className="relative h-[380px] overflow-visible sm:h-[460px] lg:h-[500px]">
          <div className="relative ml-auto h-full max-w-[1120px] translate-y-10 sm:translate-y-20 lg:translate-y-35">
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
                  customClass="how-it-works-card w-full overflow-hidden"
                >
                  <article className="flex h-full flex-col">
                    <div className="how-it-works-card-header flex items-center gap-2 border-b border-[var(--how-it-works-card-border)] px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand)]/75 sm:h-3 sm:w-3" />
                      <h3 className="font-heading text-base font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-lg">
                        {step.title}
                      </h3>
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-7">
                      <p className="mt-3 text-[0.9rem] leading-6 text-[var(--text-primary)] [text-align:justify] sm:mt-5 sm:text-base sm:leading-7 light:text-[#1a1a1a]">
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
