// Build the project films into the site.
//
// For every <slug>.html in this folder (or the slugs given), in one headless Chrome:
//   public/projects/films/<slug>.mp4    the card loop, drawn at 12 fps, packed to 24
//   public/projects/films/<slug>.webp   the poster (the frame the film names in window.__POSTER)
//   out/<slug>-contact.jpg              two tiles per second, for review
//   out/_posters.jpg                    every poster on one sheet
//   src/data/project-films.json         what the cards read: src, poster, duration, version
//
// usage: node build.mjs [slug ...] [--jobs 4] [--width 720]
// Env: CHROME=/path/to/chrome, ffmpeg on PATH (source env.sh on Windows).
import puppeteer from 'puppeteer-core';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const outDir = path.join(here, 'out');

// Three sets of cards, one pipeline. A film's file name says where it belongs:
//   hobby-<slug>.html -> /hobbies cards      post-<slug>.html -> /writing cards
//   anything else     -> /projects cards
const GROUPS = [
  {prefix: 'hobby-', dir: 'hobbies', manifest: 'hobby-films.json'},
  {prefix: 'post-', dir: 'writing', manifest: 'writing-films.json'},
  {prefix: '', dir: 'projects', manifest: 'project-films.json'},
];
const groupOf = name => GROUPS.find(g => name.startsWith(g.prefix));
const bareOf = (name, g) => name.slice(g.prefix.length);
const pubDir = g => path.join(root, 'public', g.dir, 'films');
const manifestPath = g => path.join(root, 'src', 'data', g.manifest);

const argv = process.argv.slice(2);
const flag = (name, d) => { const k = argv.indexOf(name); return k >= 0 ? argv[k + 1] : d; };
// 960: the cards run two across in a max-w-5xl column, so a card is ~500 css px and a
// 2x screen wants ~1000 device px of film.
const jobs = +flag('--jobs', 4), width = +flag('--width', 960);
const flagVals = new Set([flag('--jobs'), flag('--width')].filter(Boolean));
const wanted = argv.filter(a => !a.startsWith('--') && !flagVals.has(a)).map(a => a.replace(/\.html$/, ''));
const all = readdirSync(here).filter(f => f.endsWith('.html') && !f.startsWith('_')).map(f => f.replace(/\.html$/, '')).sort();
const slugs = wanted.length ? wanted : all;
for (const s of slugs) if (!all.includes(s)) { console.error(`no film: ${s}.html`); process.exit(2); }

function findChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  for (const p of ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium']) if (existsSync(p)) return p;
  throw new Error('No Chrome found. Set CHROME=/path/to/chrome');
}
const run = (cmd, args) => new Promise((res, rej) => { const p = spawn(cmd, args, {stdio: ['ignore', 'ignore', 'pipe']}); let err = ''; p.stderr.on('data', d => err += d); p.on('close', code => code ? rej(new Error(`${cmd} ${code}: ${err}`)) : res()); });
const save = (file, dataUrl) => writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));

mkdirSync(outDir, {recursive: true});
for (const g of GROUPS) mkdirSync(pubDir(g), {recursive: true});
// one manifest per group, kept as it was on disk so a partial build does not drop the rest
const manifests = new Map(GROUPS.map(g => [g, existsSync(manifestPath(g)) ? JSON.parse(readFileSync(manifestPath(g), 'utf8')) : {}]));
const browser = await puppeteer.launch({executablePath: findChrome(), headless: true});
const failed = [];

async function buildOne(slug) {
  const t0 = Date.now(), frames = path.join(outDir, `${slug}-frames`), errors = [];
  rmSync(frames, {recursive: true, force: true}); mkdirSync(frames, {recursive: true});
  const page = await browser.newPage();
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  try {
    await page.goto(pathToFileURL(path.join(here, `${slug}.html`)).href + `?bare=1&frame=0&ar=4:3&w=${width}`, {waitUntil: 'load'});
    await page.waitForFunction('window.__ready === true', {timeout: 60000});
    await page.evaluate(() => document.fonts.ready);
    const {N, poster, size, crf} = await page.evaluate(() => ({N: window.__NDRAW, poster: window.__POSTER ?? 0, size: window.__size, crf: window.__CRF ?? 25}));
    for (let i = 0; i < N; i++) {
      try { save(path.join(frames, `${String(i).padStart(4, '0')}.png`), await page.evaluate(i => window.__frame(i), i)); }
      catch (e) { errors.push(`drawn frame ${i} (t=${(i / 12).toFixed(2)} s): ${String(e.message || e).split('\n')[0]}`); }
    }
    const posterUrl = await page.evaluate(i => { window.__drawFrame(i); return document.getElementById('c').toDataURL('image/webp', .86); }, Math.min(poster, N - 1));
    if (errors.length) throw new Error([...new Set(errors)].join('\n  '));
    const group = groupOf(slug), bare = bareOf(slug, group);
    const mp4 = path.join(pubDir(group), `${bare}.mp4`), webp = path.join(pubDir(group), `${bare}.webp`);
    save(webp, posterUrl);
    await run('ffmpeg', ['-v', 'error', '-y', '-framerate', '12', '-i', path.join(frames, '%04d.png'), '-r', '24', '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', mp4]);
    const rows = Math.ceil(N / 6 / 6);
    await run('ffmpeg', ['-v', 'error', '-y', '-i', mp4, '-vf', `select=not(mod(n\\,12)),scale=240:-1,tile=6x${rows}`, '-frames:v', '1', path.join(outDir, `${slug}-contact.jpg`)]);
    const hash = createHash('sha1').update(readFileSync(mp4)).update(readFileSync(webp)).digest('hex').slice(0, 8);
    manifests.get(group)[bare] = {src: `/${group.dir}/films/${bare}.mp4`, poster: `/${group.dir}/films/${bare}.webp`, duration: +(N / 12).toFixed(3), width: size.w, height: size.h, v: hash};
    const kb = n => (readFileSync(n).length / 1024).toFixed(0);
    console.log(`${slug.padEnd(22)} ${String(N).padStart(3)} frames  ${(N / 12).toFixed(2)} s  mp4 ${kb(mp4)} KB  poster ${kb(webp)} KB  ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  } catch (e) {
    failed.push(slug); console.error(`${slug}: FAILED\n  ${String(e.message || e)}`);
  } finally {
    await page.close();
  }
}

try {
  const queue = [...slugs];
  await Promise.all(Array.from({length: Math.min(jobs, queue.length)}, async () => { while (queue.length) await buildOne(queue.shift()); }));
  // the whole grid at a glance
  const posters = all.filter(s => { const g = groupOf(s); return manifests.get(g)[bareOf(s, g)] && existsSync(path.join(pubDir(g), `${bareOf(s, g)}.webp`)); });
  const page = await browser.newPage();
  const sheet = await page.evaluate(async (items) => {
    const cw = 360, ch = 270, pad = 22, cols = 6, rows = Math.ceil(items.length / cols), cv = document.createElement('canvas');
    cv.width = cols * cw; cv.height = rows * (ch + pad); const g = cv.getContext('2d'); g.fillStyle = '#141414'; g.fillRect(0, 0, cv.width, cv.height); g.font = '13px monospace'; g.fillStyle = '#ddd';
    for (const [k, [name, url]] of items.entries()) { const img = new Image(); img.src = url; await img.decode(); const x = (k % cols) * cw, y = Math.floor(k / cols) * (ch + pad); g.drawImage(img, x, y, cw, ch); g.fillText(name, x + 4, y + ch + 15); }
    return cv.toDataURL('image/jpeg', .85);
  }, posters.map(s => { const g = groupOf(s); return [s, 'data:image/webp;base64,' + readFileSync(path.join(pubDir(g), `${bareOf(s, g)}.webp`)).toString('base64')]; }));
  save(path.join(outDir, '_posters.jpg'), sheet);
} finally {
  await browser.close();
}
for (const g of GROUPS) {
  const m = manifests.get(g);
  // keep only the films this group still has a source file for
  const live = Object.keys(m).filter(k => all.includes(g.prefix + k)).sort();
  if (live.length === 0) continue;
  writeFileSync(manifestPath(g), JSON.stringify(Object.fromEntries(live.map(k => [k, m[k]])), null, 2) + '\n');
  console.log(`${g.dir}: ${live.length} films -> ${path.relative(root, manifestPath(g))}`);
}
if (failed.length) { console.error(`failed: ${failed.join(', ')}`); process.exit(1); }
