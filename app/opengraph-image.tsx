import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "iPay logo";

export const size = {
  width: 128,
  height: 39,
};

export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(
    path.join(process.cwd(), "public", "ipaylogo-white.png")
  );

  return new Response(new Uint8Array(logo), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
