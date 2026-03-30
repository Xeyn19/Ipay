import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "iPay logo";

export const size = {
  width: 128,
  height: 39,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoBuffer = await readFile(
    path.join(process.cwd(), "public", "ipaylogo-white.png")
  );

  return new Response(new Uint8Array(logoBuffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, immutable, no-transform, max-age=31536000",
    },
  });
}
