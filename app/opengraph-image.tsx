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
  const [logoBuffer, backgroundBuffer] = await Promise.all([
    readFile(path.join(process.cwd(), "public", "ipaylogo-white.png")),
    readFile(path.join(process.cwd(), "public", "img", "ipay-bg.jpg")),
  ]);

  const logoSrc = toDataUrl(logoBuffer, "image/png");
  const backgroundSrc = toDataUrl(backgroundBuffer, "image/jpeg");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "#08111d",
          color: "#eef2ff",
          fontFamily: '"Segoe UI", Arial, sans-serif',
        }}
      >
        <img
          src={backgroundSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center right",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(6, 11, 19, 0.9) 0%, rgba(6, 11, 19, 0.82) 34%, rgba(6, 11, 19, 0.58) 58%, rgba(6, 11, 19, 0.22) 78%, rgba(6, 11, 19, 0.12) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 18%, rgba(255, 151, 72, 0.2), transparent 28%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -150,
            left: -70,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: "rgba(255, 151, 72, 0.18)",
            filter: "blur(42px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 170,
            bottom: -120,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(245, 166, 35, 0.14)",
            filter: "blur(26px)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "44px 56px 52px",
            position: "relative",
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
                justifyContent: "center",
                background: "rgba(15, 26, 43, 0.72)",
                border: "1px solid rgba(148, 163, 184, 0.18)",
                borderRadius: 18,
                padding: "16px 20px",
              }}
            >
              <img
                src={logoSrc}
                alt="iPay"
                style={{
                  width: 144,
                  height: 42,
                  objectFit: "contain",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: 999,
                background: "rgba(19, 31, 50, 0.88)",
                color: "#d5deef",
                border: "1px solid rgba(255, 193, 101, 0.35)",
                padding: "10px 18px",
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Dark Theme Preview
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 760,
              gap: 24,
              paddingBottom: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                color: "#eef2ff",
                fontWeight: 700,
                fontSize: 82,
                lineHeight: 0.96,
                letterSpacing: "-0.05em",
              }}
            >
              <span>Powering Seamless</span>
              <span style={{ color: "#ff9748" }}>Business Payments</span>
              <span>Across the Philippines</span>
            </div>

            <div
              style={{
                display: "flex",
                color: "#d5deef",
                fontSize: 28,
                lineHeight: 1.35,
                maxWidth: 690,
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
                gap: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "linear-gradient(135deg, #ff9748 0%, #ffb170 100%)",
                  color: "#ffffff",
                  borderRadius: 12,
                  padding: "16px 28px",
                  fontSize: 22,
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
                  background: "transparent",
                  color: "#ff9748",
                  borderRadius: 12,
                  border: "2px solid #ff9748",
                  padding: "14px 26px",
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                Explore Services
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                color: "#a8b5ca",
                fontSize: 20,
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              <span>ipay.ph</span>
              <span style={{ color: "#7d8ca6", fontSize: 18 }}>
                Secure business payments
              </span>
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
