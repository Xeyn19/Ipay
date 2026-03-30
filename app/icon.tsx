/* eslint-disable @next/next/no-img-element */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default async function Icon() {
  const logoBuffer = await readFile(
    path.join(process.cwd(), "public", "ipaylogo-white.png")
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1b2559",
          borderRadius: 18,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 4,
            borderRadius: 14,
            border: "2px solid rgba(255,255,255,0.14)",
            display: "flex",
          }}
        />
        <img
          src={logoSrc}
          alt="iPay logo"
          style={{
            display: "flex",
            width: 52,
            height: 16,
            objectFit: "contain",
          }}
        />
      </div>
    ),
    size
  );
}
