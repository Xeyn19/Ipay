'use client';

import { useState } from "react";
import type { CSSProperties } from "react";
import type { PartnerCategory } from "@/app/components/home/types";

type MarqueeLogo = {
  id: string;
  name: string;
  src?: string;
  width?: number;
  height?: number;
  marqueeScale?: number;
  marqueeZoom?: number;
  marqueePosition?: string;
  marqueeImageClassName?: string;
};

const MARQUEE_DURATION = "46s";
const TARGET_MARQUEE_AREA = 180 * 72;
const DEFAULT_LOGO_RATIO = 180 / 72;
const MAX_FRAME_WIDTH = 220;
const MAX_FRAME_HEIGHT = 104;

function getLogoFrameStyle(logo: MarqueeLogo): CSSProperties {
  const sourceWidth = logo.width && logo.width > 0 ? logo.width : 180;
  const sourceHeight = logo.height && logo.height > 0 ? logo.height : 72;
  const aspectRatio = sourceWidth / sourceHeight || DEFAULT_LOGO_RATIO;
  const scale = logo.marqueeScale ?? 1;

  let frameWidth = Math.sqrt(TARGET_MARQUEE_AREA * aspectRatio);
  let frameHeight = Math.sqrt(TARGET_MARQUEE_AREA / aspectRatio);

  frameWidth *= scale;
  frameHeight *= scale;

  const widthRatio = MAX_FRAME_WIDTH / frameWidth;
  const heightRatio = MAX_FRAME_HEIGHT / frameHeight;
  const clampRatio = Math.min(widthRatio, heightRatio, 1);

  return {
    "--partner-logo-width": `${frameWidth * clampRatio}px`,
    "--partner-logo-height": `${frameHeight * clampRatio}px`,
  } as CSSProperties;
}

function LogoCard({ logo }: { logo: MarqueeLogo }) {
  const [hasError, setHasError] = useState(!logo.src);

  return (
    <div className="partner-marquee-card" role="listitem" aria-label={logo.name}>
      {logo.src && !hasError ? (
        <div
          className="partner-marquee-image-frame"
          style={getLogoFrameStyle(logo)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.src}
            alt={logo.name}
            className={`partner-marquee-image ${logo.marqueeImageClassName ?? ""}`.trim()}
            style={
              {
                "--partner-logo-zoom": logo.marqueeZoom ?? 1,
                objectPosition: logo.marqueePosition ?? "center center",
              } as CSSProperties
            }
            onError={() => setHasError(true)}
          />
        </div>
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
      width: logo.width,
      height: logo.height,
      marqueeScale: logo.marqueeScale,
      marqueeZoom: logo.marqueeZoom,
      marqueePosition: logo.marqueePosition,
      marqueeImageClassName: logo.marqueeImageClassName,
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
