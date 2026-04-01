"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { services } from "@/app/components/home/data";
import { SectionHeader } from "@/app/components/home/ui";

const serviceCards = [
  {
    imageSrc: "/img/pay-acceptance.jpg",
    imageAlt: "Payment acceptance on mobile and point-of-sale devices",
  },
  {
    imageSrc: "/img/bill-invoice.jpg",
    imageAlt: "Billing and invoicing workflow on a digital dashboard",
  },
  {
    imageSrc: "/img/disburse.jpg",
    imageAlt: "Digital disbursement and payout processing",
  },
  {
    imageSrc: "/img/report-recon.jpg",
    imageAlt: "Reporting and reconciliation analytics interface",
  },
  {
    imageSrc: "/img/dev-api.jpg",
    imageAlt: "Developer API integration environment",
  },
];

// Calculate initial scattered position based on grid position
const getScatteredTransform = (index: number) => {
  // Grid layout: 3 cols on xl, 2 cols on md, 1 col on mobile
  // For xl (3 columns):
  // Row 0: [0, 1, 2]
  // Row 1: [3, 4]
  
  const xlCol = index % 3;
  const xlRow = Math.floor(index / 3);
  
  // Determine direction based on position
  let x = 0;
  let y = 0;
  
  // Horizontal direction
  if (xlCol === 0) {
    x = -120; // Left
  } else if (xlCol === 2) {
    x = 120; // Right
  } else {
    x = 0; // Center
  }
  
  // Vertical direction
  if (xlRow === 0) {
    y = -80; // Top row
  } else {
    y = 80; // Bottom row
  }
  
  return { x, y };
};

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of section is visible
        rootMargin: "0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="bg-[image:var(--services-section-bg)] py-24 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Core Capabilities"
          title={
            <>
              Built for scale,
              <span className="text-[#f97316]"> designed for reliability</span>
            </>
          }
          description="Integrated payment rails, billing flows, payouts, reconciliation, and API access in one operating layer."
          align="center"
        />

        <div
          id="services-grid"
          className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
        >
          {services.map((service, index) => {
            const card = serviceCards[index];
            const desktopPositionClass =
              index === 3
                ? "xl:col-start-1 xl:translate-x-1/2"
                : index === 4
                  ? "md:col-span-2 md:mx-auto md:w-[calc(50%-0.75rem)] xl:col-span-1 xl:col-start-2 xl:mx-0 xl:w-auto xl:translate-x-1/2"
                  : "";

            const scatteredPos = getScatteredTransform(index);
            const animationDelay = index * 150; // 150ms stagger between each item

            return (
              <article
                key={service.title}
                className={`flex h-full min-h-[20rem] flex-col overflow-hidden rounded-[24px] border border-[var(--border-light)] bg-[image:var(--services-card-bg)] shadow-[var(--services-card-shadow)] transition-all duration-700 ease-out ${desktopPositionClass}`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible
                    ? "translate(0, 0)"
                    : `translate(${scatteredPos.x}vw, ${scatteredPos.y}vh)`,
                  transitionDelay: `${animationDelay}ms`,
                }}
              >
                <div className="relative flex min-h-[20rem] flex-1 overflow-hidden">
                  <Image
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    fill
                    sizes="(min-width: 1280px) 32vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.3)_60%,rgba(0,0,0,0.75)_100%)]" />

                  <div className="absolute inset-x-0 bottom-0 z-10 p-6">
                    <h3 className="font-heading text-2xl font-bold tracking-[-0.03em] text-[var(--services-title)]">
                      {service.title}
                    </h3>
                    <p className="mt-4 text-base leading-relaxed text-[var(--services-description)]">
                      {service.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
