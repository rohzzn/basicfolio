const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src/app/writing');
const entries = fs.readdirSync(dir, { withFileTypes: true });

for (const ent of entries) {
  if (!ent.isDirectory() || ent.name === '[slug]') continue;

  const articleFile = path.join(dir, ent.name, 'Article.tsx');
  if (!fs.existsSync(articleFile)) continue;

  let content = fs.readFileSync(articleFile, 'utf8');
  const original = content;

  content = content.replace(/^import type \{ Metadata \} from 'next';\r?\n/m, '');
  content = content.replace(/^import ArticleJsonLd from '@\/components\/ArticleJsonLd';\r?\n/m, '');
  content = content.replace(/export const metadata: Metadata = \{[\s\S]*?\};\r?\n\r?\n/m, '');
  content = content.replace(
    /return \(\s*\r?\n\s*<>\s*\r?\n\s*<ArticleJsonLd slug="[^"]+" \/>\s*\r?\n\s*<article/m,
    'return (\n    <article'
  );
  content = content.replace(/\r?\n    <\/article>\s*\r?\n    <\/>\s*\r?\n  \);/g, '\n    </article>\n  );');

  if (content !== original) {
    fs.writeFileSync(articleFile, content);
    console.log('cleaned', ent.name);
  }
}
