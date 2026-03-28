'use client';

import { useState } from "react";
import type { CSSProperties } from "react";
import type { PartnerCategory } from "@/app/components/home/types";

type MarqueeLogo = {
  id: string;
  name: string;
  src?: string;
};

const MARQUEE_DURATION = "46s";

function LogoCard({ logo }: { logo: MarqueeLogo }) {
  const [hasError, setHasError] = useState(!logo.src);

  return (
    <div className="partner-marquee-card" role="listitem" aria-label={logo.name}>
      {logo.src && !hasError ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={logo.src}
          alt={logo.name}
          className="partner-marquee-image"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="partner-marquee-placeholder">{logo.name}</div>
      )}
    </div>
  );
}

export default function PartnersCarousel({
  groups,
}: {
  groups: PartnerCategory[];
}) {
  const logos = groups.flatMap((group) =>
    group.logos.map((logo, index) => ({
      id: `${group.title}-${logo.name}-${index}`,
      name: logo.label ?? logo.name,
      src: logo.src,
    }))
  );

  const marqueeLogos = [...logos, ...logos];

  return (
    <div className="partner-marquee-shell">
      <div className="partner-marquee-fade partner-marquee-fade-left" aria-hidden="true" />
      <div className="partner-marquee-fade partner-marquee-fade-right" aria-hidden="true" />

      <div className="partner-marquee-row">
        <div
          className="partner-marquee-track"
          style={
            {
              "--marquee-duration": MARQUEE_DURATION,
            } as CSSProperties
          }
          role="list"
          aria-label="Partner logos"
        >
          {marqueeLogos.map((logo, index) => (
            <LogoCard
              key={`${logo.id}-${index}`}
              logo={logo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
