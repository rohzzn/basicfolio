import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "src/data/behance-art.ts");

const BEHANCE_PROJECTS = [
  {
    slug: "sarojini",
    title: "Sarojini Gastro",
    description: "Branding design for Hospital.",
    url: "https://www.behance.net/gallery/127106007/Sarojini-Gastro-BRANDING",
    tags: ["Branding", "Logo Design", "Hospital"],
  },
  {
    slug: "kohi",
    title: "Kōhī",
    description: "Brand identity design for a Japanese-inspired coffee beans.",
    url: "https://www.behance.net/gallery/109291517/Kohi-BRANDING",
    tags: ["Branding", "Japanese", "Coffee"],
  },
  {
    slug: "pirateking",
    title: "Pirate King",
    description: "Illustration of Pirate King YouTuber.",
    url: "https://www.behance.net/gallery/134277689/Pirate-King-BANNER",
    tags: ["Cover Art", "Branding", "Identity"],
  },
  {
    slug: "merch",
    title: "Merch Design",
    description: "Collection of merchandise designs featuring unique illustrations and patterns.",
    url: "https://www.behance.net/gallery/109299665/Merch-Design",
    tags: ["Merchandise", "Illustration", "Fashion"],
  },
  {
    slug: "logofolio",
    title: "Logofolio 01",
    description: "Collection of logo designs and brand marks for various clients.",
    url: "https://www.behance.net/gallery/96981231/Logofolio-01",
    tags: ["Logo Design", "Branding", "Identity"],
  },
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function extractModuleImages(html) {
  const urls = new Set();
  for (const m of html.matchAll(/https:\\\/\\\/mir-s3-cdn-cf\.behance\.net[^"\\]+/g)) {
    urls.add(m[0].replace(/\\\/\//g, "//").replace(/\\u002F/g, "/"));
  }
  for (const m of html.matchAll(/https:\/\/mir-s3-cdn-cf\.behance\.net[^\s"'<>\\]+/g)) {
    urls.add(m[0]);
  }
  return [...urls].filter((u) => u.includes("project_modules"));
}

function moduleKey(url) {
  const file = url.split("?")[0].split("/").pop() ?? url;
  return file.replace(/\.(jpg|jpeg|png|webp)$/i, "");
}

function moduleScore(url) {
  if (url.includes("/fs/") || url.includes("/fs_webp/")) return 5;
  if (url.includes("/2800/") && !url.includes("_webp")) return 4;
  if (url.includes("/1400/") && !url.includes("_webp")) return 3;
  if (url.includes("/2800_webp/")) return 2;
  if (url.includes("/1400_webp/")) return 1;
  if (url.includes("/disp/")) return 0;
  return 0;
}

function pickBestModules(urls) {
  const best = new Map();
  for (const url of urls) {
    const key = moduleKey(url);
    const prev = best.get(key);
    if (!prev || moduleScore(url) > moduleScore(prev)) best.set(key, url.split("?")[0]);
  }
  return [...best.values()];
}

function extFromUrl(url) {
  const m = url.match(/\.(jpg|jpeg|png|webp)(?:\?|$)/i);
  if (!m) return "jpg";
  return m[1].toLowerCase() === "jpeg" ? "jpg" : m[1].toLowerCase();
}

async function fetchProjectImages(projectUrl) {
  const res = await fetch(projectUrl, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!res.ok) throw new Error(`${projectUrl} -> ${res.status}`);
  return pickBestModules(extractModuleImages(await res.text()));
}

async function downloadFile(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download ${url} -> ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const items = [];
  let id = 1;

  for (const project of BEHANCE_PROJECTS) {
    console.log(`Fetching ${project.slug}...`);
    const images = await fetchProjectImages(project.url);
    console.log(`  ${images.length} modules`);

    for (let i = 0; i < images.length; i++) {
      const url = images[i];
      const ext = extFromUrl(url);
      const rel = `/images/design/behance/${project.slug}/${String(i + 1).padStart(2, "0")}.${ext}`;
      const dest = path.join(ROOT, "public", rel);
      if (!fs.existsSync(dest)) {
        console.log(`  download ${rel}`);
        await downloadFile(url, dest);
      }
      items.push({
        id: id++,
        title: project.title,
        description: project.description,
        platform: "Behance",
        imageUrl: rel,
        projectUrl: project.url,
        tags: project.tags,
      });
    }
  }

  const file = `export interface ArtWorkItem {
  id: number;
  title: string;
  description: string;
  platform: "Behance" | "Dribbble";
  imageUrl: string;
  projectUrl: string;
  tags: string[];
}

export const behanceArtItems: ArtWorkItem[] = ${JSON.stringify(items, null, 2)};
`;

  fs.writeFileSync(MANIFEST_PATH, file);
  console.log(`Wrote ${items.length} items to ${MANIFEST_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
