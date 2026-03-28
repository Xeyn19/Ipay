import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
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
              gap: 18,
              marginBottom: 30,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 9999,
                background: "#f59e0b",
                display: "flex",
              }}
            />
            <div
              style={{
                fontSize: 28,
                letterSpacing: "0.24em",
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
                fontSize: 108,
                fontWeight: 800,
                lineHeight: 0.95,
                color: "#1e3a8a",
                letterSpacing: "-0.06em",
              }}
            >
              iPay
            </div>
            <div
              style={{
                fontSize: 46,
                fontWeight: 700,
                lineHeight: 1.12,
                color: "#0f172a",
              }}
            >
              Business Payments Across the Philippines
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 28,
                lineHeight: 1.35,
                color: "#475569",
                maxWidth: 820,
              }}
            >
              Dependable payment infrastructure for SMEs, institutions, and
              enterprise platforms.
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
