// Generates shadcn registry JSON for every component in src/components/rohan
// so `npx shadcn@latest add https://rohan.run/r/<slug>.json` works.
// Runs as part of `npm run build`; output lands in public/r/.

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const componentsDir = path.join(root, "src", "components", "rohan");
const outDir = path.join(root, "public", "r");

const TITLE_OVERRIDES = { otp: "OTP", "3d": "3D" };

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((word) => TITLE_OVERRIDES[word] ?? word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function parseDescription(source) {
  // Take the prose lines that follow the `@rohan/<slug>` tag in the JSDoc header.
  const match = source.match(/\/\*\*\s*\n\s*\*\s*@rohan\/[\w-]+\s*\n([\s\S]*?)\*\//);
  if (!match) return "";
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter(Boolean)
    .join(" ");
}

function parseDependencies(source) {
  const dependencies = new Set();
  const registryDependencies = new Set();
  for (const [, specifier] of source.matchAll(/from\s+"([^"]+)"/g)) {
    if (specifier.startsWith("./") || specifier.startsWith("../")) continue;
    if (specifier === "react" || specifier.startsWith("react/")) continue;
    if (specifier === "@/lib/utils") {
      registryDependencies.add("utils");
      continue;
    }
    if (specifier.startsWith("@/")) continue;
    // Reduce deep imports like "canvas-confetti/dist/x" to the package name.
    const parts = specifier.split("/");
    dependencies.add(specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]);
  }
  return {
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
  };
}

const files = (await readdir(componentsDir)).filter(
  (file) => file.endsWith(".tsx") && file !== "index.tsx"
);

// Rebuild from scratch so JSON for deleted components doesn't linger.
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const index = [];
for (const file of files.sort()) {
  const slug = file.replace(/\.tsx$/, "");
  const source = await readFile(path.join(componentsDir, file), "utf8");
  const { dependencies, registryDependencies } = parseDependencies(source);

  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: slug,
    type: "registry:component",
    title: titleFromSlug(slug),
    description: parseDescription(source),
    dependencies,
    registryDependencies,
    files: [
      {
        path: `registry/rohan/${file}`,
        type: "registry:component",
        target: `components/rohan/${file}`,
        content: source,
      },
    ],
  };

  await writeFile(path.join(outDir, `${slug}.json`), JSON.stringify(item, null, 2) + "\n");
  index.push({ name: slug, title: item.title, description: item.description });
}

await writeFile(
  path.join(outDir, "registry.json"),
  JSON.stringify(
    {
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "rohan",
      homepage: "https://rohan.run/hobbies/components",
      items: index,
    },
    null,
    2
  ) + "\n"
);

console.log(`Registry: wrote ${files.length} items to public/r/`);
