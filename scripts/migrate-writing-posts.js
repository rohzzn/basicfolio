const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/app/writing');
const entries = fs.readdirSync(dir, { withFileTypes: true });

for (const ent of entries) {
  if (!ent.isDirectory() || ent.name === '[slug]') continue;

  const slug = ent.name;
  const pageFile = path.join(dir, slug, 'page.tsx');
  const articleFile = path.join(dir, slug, 'Article.tsx');

  if (!fs.existsSync(pageFile)) {
    console.log('skip (no page.tsx)', slug);
    continue;
  }
  if (fs.existsSync(articleFile)) {
    fs.unlinkSync(pageFile);
    console.log('removed page.tsx (Article exists)', slug);
    continue;
  }

  let content = fs.readFileSync(pageFile, 'utf8');

  content = content.replace(/^import type \{ Metadata \} from 'next';\n/m, '');
  content = content.replace(/^import ArticleJsonLd from '@\/components\/ArticleJsonLd';\n/m, '');
  content = content.replace(/export const metadata: Metadata = \{[\s\S]*?\};\n\n/m, '');

  content = content.replace(
    /return \(\s*\n\s*<>\s*\n\s*<ArticleJsonLd slug="[^"]+" \/>\s*\n\s*<article/m,
    'return (\n    <article'
  );

  content = content.replace(/\n    <\/article>\s*\n    <\/>\s*\n  \);/g, '\n    </article>\n  );');

  if (!content.includes('export default')) {
    const namedMatch = content.match(/const (\w+): React\.FC = \(\) => \{/);
    if (namedMatch) {
      content += `\nexport default ${namedMatch[1]};\n`;
    }
  }

  fs.writeFileSync(articleFile, content);
  fs.unlinkSync(pageFile);
  console.log('migrated', slug);
}
