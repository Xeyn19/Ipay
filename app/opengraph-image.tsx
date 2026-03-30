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
  const [logoBuffer, heroBuffer] = await Promise.all([
    readFile(path.join(process.cwd(), "public", "ipaylogo-white.png")),
    readFile(path.join(process.cwd(), "public", "img", "main-hero.jpg")),
  ]);

  const logoSrc = toDataUrl(logoBuffer, "image/png");
  const heroSrc = toDataUrl(heroBuffer, "image/jpeg");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #fff7ef 0%, #ffffff 48%, #f3f4f6 100%)",
          color: "#111827",
          fontFamily: '"Segoe UI", Arial, sans-serif',
        }}
      >
        <img
          src={heroSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(7, 12, 21, 0.82) 0%, rgba(7, 12, 21, 0.64) 42%, rgba(7, 12, 21, 0.18) 72%, rgba(7, 12, 21, 0.06) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -90,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "rgba(241, 122, 30, 0.24)",
            filter: "blur(24px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -60,
            bottom: -110,
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "rgba(241, 122, 30, 0.18)",
            filter: "blur(18px)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "52px 58px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(17, 24, 39, 0.52)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                borderRadius: 20,
                padding: "18px 22px",
                backdropFilter: "blur(8px)",
              }}
            >
              <img
                src={logoSrc}
                alt="iPay"
                style={{
                  width: 150,
                  height: 46,
                  objectFit: "contain",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.18)",
                color: "#fff7ed",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                padding: "10px 18px",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "0.02em",
              }}
            >
              Business payments platform
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 760,
              gap: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: 72,
                lineHeight: 1,
                letterSpacing: "-0.05em",
              }}
            >
              <span>Powering Seamless</span>
              <span style={{ color: "#f99547" }}>Business Payments</span>
              <span>Across the Philippines</span>
            </div>

            <div
              style={{
                display: "flex",
                color: "rgba(255, 255, 255, 0.82)",
                fontSize: 30,
                lineHeight: 1.35,
                maxWidth: 700,
              }}
            >
              Dependable, efficient, and secure payment solutions for growing
              enterprises, SMEs, and institutions.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f17a1e",
                  color: "#ffffff",
                  borderRadius: 999,
                  padding: "16px 28px",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                Request Proposal
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "#ffffff",
                  borderRadius: 999,
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  padding: "16px 28px",
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                Explore Services
              </div>
            </div>
            <div
              style={{
                display: "flex",
                color: "rgba(255, 255, 255, 0.72)",
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              ipay.ph
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
