const BEHANCE_PROJECTS = [
  { slug: "sarojini", id: "127106007", url: "https://www.behance.net/gallery/127106007/Sarojini-Gastro-BRANDING" },
  { slug: "kohi", id: "109291517", url: "https://www.behance.net/gallery/109291517/Kohi-BRANDING" },
  { slug: "pirateking", id: "134277689", url: "https://www.behance.net/gallery/134277689/Pirate-King-BANNER" },
  { slug: "merch", id: "109299665", url: "https://www.behance.net/gallery/109299665/Merch-Design" },
  { slug: "gamebg", id: "107259111", url: "https://www.behance.net/gallery/107259111/Game-Backgrounds" },
  { slug: "mascots", id: "97663207", url: "https://www.behance.net/gallery/97663207/Mascots-01" },
  { slug: "logofolio", id: "96981231", url: "https://www.behance.net/gallery/96981231/Logofolio-01" },
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function extractModuleImages(html) {
  const urls = new Set();

  for (const m of html.matchAll(/https:\\\/\\\/mir-s3-cdn-cf\.behance\.net[^"\\]+/g)) {
    urls.add(m[0].replace(/\\\/\//g, "//").replace(/\\u002F/g, "/"));
  }
  for (const m of html.matchAll(/https:\/\/mir-s3-cdn-cf\.behance\.net[^\s"'<>\\]+/g)) {
    urls.add(m[0]);
  }
  for (const m of html.matchAll(/"src":"(https:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/gi)) {
    urls.add(m[1].replace(/\\u002F/g, "/"));
  }

  return [...urls]
    .map((u) => u.split("?")[0])
    .filter((u) => u.includes("behance.net") && /project_modules|project_module|max_1200|disp|source/.test(u))
    .filter((u) => !u.includes("user") && !u.includes("profile"))
    .sort();
}

async function fetchProjectImages(projectUrl) {
  const res = await fetch(projectUrl, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!res.ok) throw new Error(`${projectUrl} -> ${res.status}`);
  const html = await res.text();
  const images = extractModuleImages(html);
  const unique = [...new Set(images)];
  return unique.length ? unique : extractModuleImages(html.replace(/\\u002F/g, "/"));
}

async function main() {
  for (const project of BEHANCE_PROJECTS) {
    try {
      const images = await fetchProjectImages(project.url);
      console.log(project.slug, images.length);
      images.slice(0, 5).forEach((u) => console.log(" ", u));
    } catch (e) {
      console.error(project.slug, e.message);
    }
  }
}

main();
