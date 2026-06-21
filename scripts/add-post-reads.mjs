import fs from 'fs';
import path from 'path';

const writingRoot = 'src/app/writing';
const dirs = fs
  .readdirSync(writingRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== '[slug]')
  .map((entry) => entry.name);

for (const slug of dirs) {
  const file = path.join(writingRoot, slug, 'Article.tsx');
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('PostReads')) {
    console.log('Skip', slug);
    continue;
  }

  content = content.replace(
    /^import React from ['"]react['"];$/m,
    (line) => `${line}\nimport PostReads from '@/components/PostReads';`
  );

  content = content.replace(
    /(<time dateTime="[^"]*">[^<]*<\/time>)(\r?\n\s*<\/div>)/,
    '$1\n          <PostReads />$2'
  );

  if (!content.includes('PostReads')) {
    console.error('Failed', slug);
    continue;
  }

  fs.writeFileSync(file, content);
  console.log('Updated', slug);
}
