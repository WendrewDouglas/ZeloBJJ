// Generate favicons (icon.png + apple-icon.png + favicon.ico) from public/logo.png
import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile } from "node:fs/promises";

const SRC = "public/logo.png";
const APP_DIR = "src/app";

// 1. Modern favicon (PNG) — Next will serve at /icon
//    Use 512px so it looks crisp at any size
await sharp(SRC).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(`${APP_DIR}/icon.png`);
console.log("✓ icon.png (512x512)");

// 2. Apple touch icon — 180x180 standard
await sharp(SRC).resize(180, 180, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(`${APP_DIR}/apple-icon.png`);
console.log("✓ apple-icon.png (180x180)");

// 3. Multi-size .ico for legacy browsers
const sizes = [16, 32, 48];
const buffers = await Promise.all(
  sizes.map((s) =>
    sharp(SRC).resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
  )
);
const ico = await pngToIco(buffers);
await writeFile(`${APP_DIR}/favicon.ico`, ico);
console.log(`✓ favicon.ico (${sizes.join("/")})`);

console.log("\n✅ Favicons gerados a partir de", SRC);
