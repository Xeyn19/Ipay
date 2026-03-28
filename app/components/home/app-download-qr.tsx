import Image from "next/image";
import type { CSSProperties } from "react";
import { appStoreUrl } from "@/app/lib/app-download";
import logoDark from "@/public/img/ipaylogo-white.png";

const qrAnimationStyles: Record<string, CSSProperties> = {
  glow: {
    inset: "8px",
    background:
      "radial-gradient(circle, rgba(149,70,12,0.18) 0%, rgba(108,48,8,0.1) 38%, transparent 72%)",
  },
  frame: {
    inset: "12px",
    borderColor: "rgba(168,76,14,0.46)",
    boxShadow:
      "0 0 0 1px rgba(168,76,14,0.1), 0 0 10px rgba(116,52,10,0.12)",
  },
  corners: {
    inset: "6px",
    zIndex: 3,
  },
  corner: {
    borderColor: "rgba(168,76,14,0.72)",
    filter: "drop-shadow(0 0 4px rgba(116,52,10,0.18))",
  },
  tint: {
    zIndex: 1,
    background: `linear-gradient(
      180deg,
      transparent,
      rgba(103,45,8,0.03) 20%,
      rgba(149,70,12,0.14) 50%,
      rgba(103,45,8,0.03) 80%,
      transparent
    )`,
  },
  beam: {
    zIndex: 1,
    background: `linear-gradient(
      180deg,
      transparent,
      rgba(98,42,7,0.03) 18%,
      rgba(153,71,12,0.16) 50%,
      rgba(98,42,7,0.03) 82%,
      transparent
    )`,
  },
  line: {
    zIndex: 2,
    background:
      "linear-gradient(90deg, transparent, rgba(176,82,16,0.68), transparent)",
    boxShadow:
      "0 0 10px rgba(123,56,10,0.18), 0 0 16px rgba(92,41,7,0.12)",
  },
  shimmer: {
    zIndex: 1,
    background: `linear-gradient(
      105deg,
      transparent,
      rgba(184,94,18,0.08),
      rgba(255,189,102,0.16),
      transparent
    )`,
  },
};

type AppDownloadQrProps = {
  className?: string;
  platformName?: string;
  targetUrl?: string;
};

export function AppDownloadQr({
  className = "",
  platformName = "App Store",
  targetUrl = appStoreUrl,
}: AppDownloadQrProps) {
  const qrBackgroundImage = `url("https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=0&format=png&ecc=H&data=${encodeURIComponent(
    targetUrl,
  )}")`;

  return (
    <div className={`qr-scan-card relative w-full overflow-hidden rounded-[22px] p-[14px] shadow-[0_18px_36px_rgba(2,6,23,0.16)] ${className}`.trim()}>
      <div
        aria-hidden="true"
        className="qr-scan-glow"
        style={qrAnimationStyles.glow}
      />
      <div
        aria-hidden="true"
        className="qr-scan-frame"
        style={qrAnimationStyles.frame}
      />
      <div
        aria-hidden="true"
        className="qr-scan-corners"
        style={qrAnimationStyles.corners}
      >
        <span
          className="qr-scan-corner qr-scan-corner-tl"
          style={qrAnimationStyles.corner}
        />
        <span
          className="qr-scan-corner qr-scan-corner-tr"
          style={qrAnimationStyles.corner}
        />
        <span
          className="qr-scan-corner qr-scan-corner-bl"
          style={qrAnimationStyles.corner}
        />
        <span
          className="qr-scan-corner qr-scan-corner-br"
          style={qrAnimationStyles.corner}
        />
      </div>
      <div
        aria-hidden="true"
        className="qr-scan-tint"
        style={qrAnimationStyles.tint}
      />
      <div
        aria-hidden="true"
        className="qr-scan-beam"
        style={qrAnimationStyles.beam}
      />
      <div
        aria-hidden="true"
        className="qr-scan-line"
        style={qrAnimationStyles.line}
      />
      <div
        aria-hidden="true"
        className="qr-code-shimmer"
        style={qrAnimationStyles.shimmer}
      />
      <div className="qr-code-panel relative z-[4] flex items-center justify-center overflow-hidden rounded-[18px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] rounded-[18px] bg-white"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[2] rounded-[18px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.92)]"
        />
        <div
          aria-label={`QR code for the iPay ${platformName} page`}
          className="relative z-[3] aspect-square w-full rounded-[16px] bg-white bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: qrBackgroundImage }}
        />
        <div className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center">
          <div className="flex h-[36px] min-w-[110px] items-center justify-center rounded-[8px] bg-black px-3 shadow-[0_12px_20px_rgba(2,6,23,0.18)] ring-1 ring-[rgba(255,255,255,0.06)]">
            <Image
              src={logoDark}
              alt="iPay logo"
              className="block h-[20px] w-20 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
