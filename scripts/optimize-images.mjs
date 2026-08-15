// One-off / repeatable pass that shrinks large PNG/JPG assets in public/ in place.
// Resizes anything wider than MAX_WIDTH and re-encodes losslessly (PNG) or at high
// quality (JPEG). Paths never change, so no source references need updating.
// Run with: node scripts/optimize-images.mjs

import sharp from "sharp";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.argv[2] || "public";
const MAX_WIDTH = 1600;
const MIN_SAVINGS_RATIO = 0.05;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

async function processFile(file) {
  const before = statSync(file).size;
  const ext = extname(file).toLowerCase();

  let pipeline = sharp(file);
  const meta = await pipeline.metadata();

  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  pipeline =
    ext === ".png"
      ? pipeline.png({ compressionLevel: 9, effort: 10 })
      : pipeline.jpeg({ quality: 85, mozjpeg: true });

  const buffer = await pipeline.toBuffer();
  const after = buffer.length;

  if (after < before * (1 - MIN_SAVINGS_RATIO)) {
    writeFileSync(file, buffer);
    return { file, before, after, changed: true };
  }
  return { file, before, after: before, changed: false };
}

const files = walk(ROOT);
let totalBefore = 0;
let totalAfter = 0;
let changedCount = 0;
const results = [];

for (const file of files) {
  try {
    const r = await processFile(file);
    totalBefore += r.before;
    totalAfter += r.after;
    if (r.changed) {
      changedCount++;
      results.push(r);
    }
  } catch (err) {
    console.error("FAILED", file, err.message);
  }
}

results.sort((a, b) => b.before - b.after - (a.before - a.after));
for (const r of results) {
  const pct = (((r.before - r.after) / r.before) * 100).toFixed(0);
  console.log(
    `${r.file}: ${(r.before / 1024).toFixed(0)}KB -> ${(r.after / 1024).toFixed(0)}KB (-${pct}%)`
  );
}

console.log("---");
console.log(`Files scanned: ${files.length}, changed: ${changedCount}`);
console.log(
  `Total: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB (saved ${(
    (totalBefore - totalAfter) /
    1024 /
    1024
  ).toFixed(2)}MB)`
);
