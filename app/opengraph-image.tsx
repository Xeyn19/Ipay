/* eslint-disable @next/next/no-img-element */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "iPay homepage preview";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

function toDataUrl(buffer: Buffer, contentTypeValue: string) {
  return `data:${contentTypeValue};base64,${buffer.toString("base64")}`;
}

export default async function OpenGraphImage() {
  const logoBuffer = await readFile(
    path.join(process.cwd(), "public", "ipaylogo-white.png")
  );

  const logoSrc = toDataUrl(logoBuffer, "image/png");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "#8f99a8",
          color: "#ffffff",
          fontFamily: '"Segoe UI", Arial, sans-serif',
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 720,
            height: 240,
            borderRadius: 28,
            background: "#6b7280",
            boxShadow: "0 24px 64px rgba(15, 23, 42, 0.22)",
            border: "1px solid rgba(255, 255, 255, 0.14)",
          }}
        >
          <img
            src={logoSrc}
            alt="iPay"
            style={{
              width: 420,
              height: 128,
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
