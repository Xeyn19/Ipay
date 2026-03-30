/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export const alt = "iPay business payments preview";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoBase64 = await readFile(
    path.join(process.cwd(), "public", "ipaylogo-white.png"),
    "base64"
  );
  const logoSrc = `data:image/png;base64,${logoBase64}`;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0d0d1a 0%, #12192a 50%, #1f2d49 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(241, 122, 30, 0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -220,
            left: -120,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: "rgba(245, 166, 35, 0.12)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "72px 76px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontSize: 30,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "rgba(255, 255, 255, 0.9)",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#f17a1e",
                }}
              />
              iPay
            </div>
            <div
              style={{
                display: "flex",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                borderRadius: 999,
                padding: "12px 20px",
                fontSize: 22,
                color: "rgba(255, 255, 255, 0.72)",
              }}
            >
              Business Payments Across the Philippines
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              maxWidth: 920,
            }}
          >
            <img
              src={logoSrc}
              alt="iPay logo"
              style={{
                width: 420,
                height: 128,
                objectFit: "contain",
              }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 68,
                lineHeight: 1.05,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                maxWidth: 900,
              }}
            >
              Dependable payment infrastructure for Philippine businesses.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              fontSize: 24,
              color: "rgba(255, 255, 255, 0.72)",
            }}
          >
            <div style={{ display: "flex" }}>SMEs, institutions, and enterprise platforms</div>
            <div
              style={{
                display: "flex",
                color: "#f5a623",
                fontWeight: 600,
              }}
            >
              ipay-eta.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
