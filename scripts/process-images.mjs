// One-off: turns the raw Instagram downloads (../*.jpg) into curated, web-ready assets in public/images.
// Run: node scripts/process-images.mjs
// Crops keep each cup fully in frame; story stickers (flavor name boxes) are patched with
// nearby clean background from the same photo — no generated imagery.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("..");
const OUT = path.resolve("public/images");
const src = (id) => {
  const f = fs.readdirSync(SRC).find((n) => n.includes(id) && !n.includes("(1)"));
  if (!f) throw new Error("missing " + id);
  return path.join(SRC, f);
};

// patch: [x, y, w, h, dy] → copy the region shifted by dy (usually just below) over the sticker
// fill: [x, y, w, h, color] → flat fill (only for pure-white cutout backgrounds)
const jobs = [
  // ---- product hero shots (4:5) ----
  { id: "607221148", out: "products/nutella.jpg", crop: [223, 975, 944, 1180], patch: [[100, 1540, 290, 145, 150]] },
  { id: "608204147", out: "products/posna.jpg", crop: [251, 925, 944, 1180] },
  { id: "618284823", out: "products/tiramisu.jpg", crop: [267, 1060, 880, 1100], patch: [[100, 1560, 325, 200, 205]] },
  { id: "621066170", out: "products/choco-raspberry.jpg", crop: [290, 1035, 848, 1060] },
  { id: "622843821", out: "products/snickers.jpg", crop: [312, 965, 848, 1060], patch: [[50, 1590, 410, 122, 128]] },
  { id: "622913232", out: "products/bounty.jpg", crop: [267, 1050, 880, 1100], patch: [[60, 1578, 360, 152, 158]] },
  { id: "627242558", out: "products/blueberry.jpg", crop: [310, 380, 800, 1000] },
  { id: "649519593", out: "products/cheesecake.jpg", crop: [315, 430, 800, 1000] },
  { id: "642489267", out: "products/coko-bananica.jpg", crop: [248, 1060, 880, 1100], patch: [[985, 1748, 345, 105, 110]] },
  { id: "732104748", out: "products/cherry.jpg", crop: [250, 330, 1040, 1300], fill: [[0, 1500, 1440, 420, "#ffffff"]] },
  { id: "732532963", out: "products/raspberry.jpg", crop: [290, 610, 500, 625] },
  { id: "791118015", out: "products/pistachio.jpg", crop: [482, 760, 897, 1121], fill: [[340, 1270, 270, 100, "#ffffff"]] },
  { id: "794294726", out: "products/mini.jpg", crop: [60, 230, 1320, 1320] },
  // ---- secondary angles ----
  { id: "642315774", out: "products/choco-raspberry-duo.jpg" },
  { id: "639953868", out: "products/nutella-tiramisu.jpg" },
  // ---- bundles: square group shots → 4:5 by repeating the plain wall at the top (no cup cropped) ----
  { id: "639953868", out: "bundles/slatka-kombinacija.jpg", crop: [200, 40, 1040, 1300] },
  { id: "642315774", out: "bundles/choco-duo.jpg", crop: [180, 0, 1080, 1350] },
  { id: "706003634", out: "bundles/cokoladni-trio.jpg", crop: [110, 0, 1220, 1300], extendTop: 225 },
  { id: "719232558", out: "bundles/zdrava-kombinacija.jpg", crop: [60, 0, 1250, 1300], extendTop: 262 },
  { id: "778870261", out: "bundles/omiljena-cetvorka.jpg", crop: [110, 0, 1220, 1360], extendTop: 165 },
  { id: "712410497", out: "bundles/bomb-paket.jpg", crop: [100, 0, 1240, 1330], extendTop: 220 },
  // ---- lifestyle / editorial ----
  { id: "712410497", out: "lifestyle/lineup-five.jpg" },
  { id: "778870261", out: "lifestyle/lineup-four.jpg" },
  { id: "706003634", out: "lifestyle/trio-wood.jpg" },
  { id: "719232558", out: "lifestyle/kraft-carriers.jpg" },
  { id: "780323074", out: "lifestyle/top-down-seven.jpg", crop: [0, 170, 1440, 1240] },
  { id: "794294726", out: "lifestyle/mini-events.jpg", crop: [0, 0, 1440, 1540] },
  // ---- instagram grid (real posts, untouched) ----
  { id: "730164366", out: "ig/menu.jpg" },
  { id: "711868120", out: "ig/collage-1.jpg" },
  { id: "712724135", out: "ig/collage-3.jpg" },
  { id: "690050075", out: "ig/saradnja.jpg" },
  { id: "750085894", out: "ig/spoj-ukusa.jpg" },
];

for (const j of jobs) {
  let img = sharp(src(j.id));
  const meta = await img.metadata();
  const overlays = [];
  for (const [x, y, w, h, dy] of j.patch ?? []) {
    const buf = await sharp(src(j.id)).extract({ left: x, top: y + dy, width: w, height: h }).blur(3).toBuffer();
    overlays.push({ input: buf, left: x, top: y });
  }
  for (const [x, y, w, h, color] of j.fill ?? []) {
    const ww = Math.min(w, meta.width - x), hh = Math.min(h, meta.height - y);
    overlays.push({ input: { create: { width: ww, height: hh, channels: 3, background: color } }, left: x, top: y });
  }
  if (overlays.length) img = sharp(await img.composite(overlays).toBuffer());
  if (j.crop) {
    const [left, top, width, height] = j.crop;
    img = img.extract({ left, top, width: Math.min(width, meta.width - left), height: Math.min(height, meta.height - top) });
  }
  if (j.extendTop) img = sharp(await img.extend({ top: j.extendTop, extendWith: "copy" }).toBuffer());
  const file = path.join(OUT, j.out);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await img.resize({ width: 1400, withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true }).toFile(file);
  console.log("✓", j.out);
}

// Logo: black brush letters on white → transparent PNG, trimmed.
const logo = await sharp(src("546624738")).greyscale().raw().toBuffer({ resolveWithObject: true });
const { width, height } = logo.info;
const rgba = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  const a = 255 - logo.data[i];
  rgba[i * 4 + 3] = a < 40 ? 0 : Math.min(255, a * 1.15);
}
fs.mkdirSync(path.resolve("public/brand"), { recursive: true });
await sharp(rgba, { raw: { width, height, channels: 4 } }).trim().png().toFile(path.resolve("public/brand/logo.png"));
console.log("✓ brand/logo.png");
