import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoBuffer = await readFile(
    path.join(process.cwd(), "public", "img", "ipaylogo-white.png")
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #f8fafc 0%, #eef2ff 42%, #dbeafe 100%)",
          color: "#0f172a",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 28,
            borderRadius: 36,
            border: "2px solid rgba(30, 41, 59, 0.08)",
            background: "rgba(255, 255, 255, 0.84)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 64,
            right: 84,
            width: 220,
            height: 220,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.24) 0%, rgba(59, 130, 246, 0) 70%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            padding: "84px 92px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              marginBottom: 42,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "18px 28px",
                borderRadius: 24,
                background: "#1e3a8a",
                boxShadow: "0 20px 44px rgba(30, 58, 138, 0.22)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="iPay logo"
                width="256"
                height="78"
                style={{
                  display: "flex",
                  objectFit: "contain",
                }}
              />
            </div>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 9999,
                background: "#f59e0b",
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: 24,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#334155",
              }}
            >
              Payment Infrastructure
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxWidth: 860,
            }}
          >
            <div
              style={{
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1,
                color: "#1e3a8a",
                letterSpacing: "-0.03em",
              }}
            >
              Business Payments Across the Philippines
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                lineHeight: 1.22,
                color: "#0f172a",
                maxWidth: 840,
              }}
            >
              Dependable payment infrastructure for SMEs, institutions, and
              enterprise platforms.
            </div>
            <div
              style={{
                marginTop: 22,
                display: "flex",
                gap: 14,
                alignItems: "center",
                color: "#475569",
                fontSize: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  background: "#f59e0b",
                }}
              />
              SMEs
              <div
                style={{
                  display: "flex",
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  background: "#f59e0b",
                }}
              />
              Institutions
              <div
                style={{
                  display: "flex",
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  background: "#f59e0b",
                }}
              />
              Enterprise Platforms
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
