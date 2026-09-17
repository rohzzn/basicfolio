'use strict';
// ============================================================
// PORTFOLIO KIT
// Shared by every project film in this folder. Loads after core.js and never
// edits it. The films play as 4:3 loops on the /projects cards, about 330 css
// px wide, so everything here is tuned for that size: outlines 4 to 6 units,
// hatching and dot screens coarse enough to survive the downscale and the
// encoder, lettering big.
//
// Every film is its own piece: it picks a look (the line and finish weights) and
// its own palette, its own background, its own transition and its own way of
// showing the project's name. The kit only holds the vocabulary, never a formula.
//   ink     hatching and grain, wobbly outlines
//   screen  flat shapes under a regular dot grid
//   riso    halftone plates, crayon lines
//   pencil  thin graphite, sparse texture
//
// Sections: LOOKS · SHAPES · MARKS · PUPPETS · RISO · DEVICES · FILM
// ============================================================

// ===================== LOOKS =====================
const LOOKS = {
  ink: { key: 'ink', palette: 'paperInk', line: 5, thin: 3, amp: 3, hatch: { gap: 10, len: 20, width: 2.2, alpha: .3 }, grainSize: 3.4 },
  screen: { key: 'screen', palette: 'screenSea', line: 4.5, thin: 2.6, amp: 1.4, cell: 13 },
  riso: { key: 'riso', palette: 'risoPop', line: 6, thin: 3.5, amp: 3.5, cell: 13 },
  pencil: { key: 'pencil', palette: 'pencilMinimal', line: 3.4, thin: 2.2, amp: 2, hatch: { gap: 15, len: 46, width: 1.6, alpha: .3 }, grainSize: 2.6 },
};
let LK = LOOKS.ink, MODE = 'ink';
function setLook(k, palette) { LK = LOOKS[k]; usePalette(palette || LK.palette); return LK; }
// runs fn with every kit drawable in blueprint mode: chalk outlines, no fills, no finish
function inBlueprint(fn) { const m = MODE; MODE = 'blueprint'; try { fn(); } finally { MODE = m; } }
const BP = () => MODE === 'blueprint';
const lineCol = () => BP() ? PAL.chalk : PAL.ink;

// The card-scale finish. surface() with this look's weights, plus grain big enough to see.
function tex(c, path, box, o = {}) {
  if (BP()) return;
  const f = o.finish || PAL.finish, seed = o.seed || 1, color = o.color || PAL.shade;
  if (f === 'ink' || f === 'pencil') {
    const h = (LK.hatch || LOOKS.ink.hatch), d = o.density ?? 1;
    hatch(c, path, box, { angle: o.angle ?? (f === 'ink' ? 1.2 : 1.1), gap: (o.gap ?? h.gap) / Math.max(.35, d), len: o.len ?? h.len, jitter: f === 'ink' ? 4 : 6, color, alpha: o.alpha ?? h.alpha, width: o.width ?? h.width, seed });
    const n = o.grain ?? Math.round(box[2] * box[3] / (f === 'ink' ? 700 : 2400));
    if (n > 0) grain(c, path, box, n, color, f === 'ink' ? .3 : .25, seed + 1, LK.grainSize || 3);
  } else if (f === 'riso' || f === 'screen') {
    dotScreen(c, path, box, { cell: o.cell ?? LK.cell ?? 12, color, density: o.density ?? .42, angle: o.angle ?? (f === 'riso' ? .26 : 0), jitter: f === 'riso' ? .3 : .04, seed, alpha: o.alpha ?? .9 });
  }
}

// ===================== SHAPES =====================
// A shape carries its fill path, its outline points (subdivided, so the
// wobbly outline reads as drawn) and its box. draw() does fill, finish, outline.
function subdiv(pts, step = 34, close = true) {
  const out = [], n = pts.length;
  for (let i = 0; i < (close ? n : n - 1); i++) {
    const a = pts[i], b = pts[(i + 1) % n], k = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]);
  }
  if (!close) out.push(pts[n - 1]);
  return out;
}
function rrPts(x, y, w, h, r, step = 34) {
  r = Math.max(0, Math.min(r, w / 2, h / 2)); const p = [];
  const arc = (cx, cy, a0) => { for (let k = 0; k <= 4; k++) { const a = a0 + k / 4 * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI);
  return subdiv(p, step);
}
function boxOf(pts, pad = 4) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad]; }
const RR = (x, y, w, h, r = 0) => ({ path: roundRectPath(x, y, w, h, r), pts: rrPts(x, y, w, h, r), box: [x, y, w, h] });
const EL = (cx, cy, rx, ry, rot = 0) => { const m = Math.max(rx, ry); return { path: ellPath(cx, cy, rx, ry, rot), pts: ellPts(cx, cy, rx, ry, rot, Math.max(28, Math.round((rx + ry) / 6))), box: [cx - m, cy - m, 2 * m, 2 * m] }; };
const CI = (cx, cy, r) => EL(cx, cy, r, r);
const PG = pts => ({ path: polyPath(pts), pts: subdiv(pts), box: boxOf(pts) });
// a shape moved and scaled (for puppets built once in local coordinates)
function moved(sh, dx, dy, k = 1) { const m = new DOMMatrix([k, 0, 0, k, dx, dy]), p = new Path2D(); p.addPath(sh.path, m); return { path: p, pts: sh.pts.map(([x, y]) => [dx + x * k, dy + y * k]), box: [dx + sh.box[0] * k, dy + sh.box[1] * k, sh.box[2] * k, sh.box[3] * k] }; }

// draw: fill -> finish -> wobbly outline. In blueprint mode only the outline, in chalk.
//   o.tex false: no finish     o.texo: finish options     o.line false: no outline
//   o.lw line width            o.lc line colour           o.amp jitter
function draw(c, sh, fill, seed, o = {}) {
  const bp = BP();
  if (!bp && fill) { c.fillStyle = fill; c.fill(sh.path); if (o.tex !== false) tex(c, sh.path, sh.box, { seed: seed + 1, ...(o.texo || {}) }); }
  if (bp && o.bpFill) { c.fillStyle = o.bpFill; c.fill(sh.path); }
  if (o.line === false) return;
  c.save(); c.strokeStyle = bp ? (o.bpLine || PAL.chalk) : (o.lc || PAL.ink); c.lineWidth = (o.lw || LK.line) * (bp ? .75 : 1); c.lineJoin = 'round'; c.lineCap = 'round';
  if (o.alpha != null) c.globalAlpha = o.alpha;
  wob(c, sh.pts, o.amp ?? LK.amp, seed + 2, true); c.restore();
}
// stroke an open polyline, subdivided and wobbled
function stroke(c, pts, seed, o = {}) {
  c.save(); c.strokeStyle = o.color || lineCol(); c.lineWidth = o.lw || LK.line; c.lineJoin = 'round'; c.lineCap = 'round'; if (o.alpha != null) c.globalAlpha = o.alpha;
  if (o.dash) c.setLineDash(o.dash);
  wob(c, o.raw ? pts : subdiv(pts, o.step || 30, false), o.amp ?? LK.amp * .8, seed, !!o.close); c.restore();
}
// a stroke that draws itself: progress 0..1
function strokeOn(c, pts, progress, seed, o = {}) {
  if (progress <= 0) return; const p = o.raw ? pts : subdiv(pts, o.step || 24, !!o.close);
  c.save(); c.strokeStyle = o.color || lineCol(); c.lineWidth = o.lw || LK.line; c.lineJoin = 'round'; c.lineCap = 'round';
  selfDraw(c, p, clamp(progress, 0, 1), seed, o.amp ?? LK.amp * .7, !!o.close); c.restore();
}
function dot(c, x, y, r, color) { c.fillStyle = color; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
// arc points (for curves, orbits, rings)
function arcPts(cx, cy, rx, ry, a0, a1, n = 40) { const p = []; for (let k = 0; k <= n; k++) { const a = lerp(a0, a1, k / n); p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return p; }
// quadratic-ish curve points through a control
function curvePts(p0, p1, p2, n = 30) { const p = []; for (let k = 0; k <= n; k++) { const t = k / n, u = 1 - t; p.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]); } return p; }

// ===================== MARKS =====================
// illegible handwriting at card scale
function squig(c, x, y, w, lines, o = {}) { squiggleText(c, x, y, w, lines, { lineH: 30, amp: 8, width: 3.2, gap: .5, color: BP() ? PAL.chalkDim : PAL.ink, ...o }); }
// a single line of "text": a rounded bar, the way UI copy reads at this size
function textBar(c, x, y, w, color, h = 12) { c.fillStyle = color; c.beginPath(); c.roundRect(x, y - h / 2, w, h, h / 2); c.fill(); }
// real lettering in a marker hand, two inks slightly off (only for the sign-off)
const KIT_HAND = '"Ink Free", "Segoe Print", "Bradley Hand", "Segoe Script", "Comic Sans MS", cursive';
function hand(c, text, x, y, o = {}) {
  const { size = 100, ink = PAL.ink, ink2 = PAL.accents[0], align = 'center', weight = 'normal', off = size * .035 } = o;
  c.save(); c.font = `${weight} ${size}px ${KIT_HAND}`; c.textAlign = align; c.textBaseline = 'alphabetic';
  if (ink2) { c.fillStyle = ink2; c.globalAlpha = .85; c.fillText(text, x + off, y + off * .6); }
  c.fillStyle = ink; c.globalAlpha = 1; c.fillText(text, x, y); c.restore();
}
function checkMark(c, x, y, s, progress, seed, o = {}) { strokeOn(c, [[x - s, y], [x - s * .3, y + s * .7], [x + s, y - s * .8]], progress, seed, { lw: o.lw || LK.line * 1.2, color: o.color, raw: false, step: 8 }); }
function crossMark(c, x, y, s, seed, o = {}) { stroke(c, [[x - s, y - s], [x + s, y + s]], seed, o); stroke(c, [[x + s, y - s], [x - s, y + s]], seed + 1, o); }
// rings travelling out from a point: born every `every` seconds, speed units/s
function ringsOut(c, x, y, tau, o = {}) {
  const { every = 1 / 3, speed = 300, max = 900, colors = [PAL.accents[0], PAL.accents[1]], width = LK.thin * 1.4, seed = 40, t0 = 0, t1 = 99, r0 = 10 } = o;
  for (let b = 0; t0 + b * every <= Math.min(tau, t1); b++) { const r = r0 + (tau - t0 - b * every) * speed; if (r > 4 && r < max) crayon(c, ellPts(x, y, r, r, 0, Math.max(36, r / 6 | 0)), colors[b % colors.length], width, seed + b, true); }
}
// sparkle: a four-point star
function sparkle(c, x, y, s, color, rot = 0) { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = color; c.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? s * .28 : s, a = k / 8 * TAU - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.restore(); }

// ===================== PUPPETS =====================
// Every puppet draws in the frame's logical units and honours MODE.
// win: an app window. Returns the content box [x, y, w, h].
function win(c, x, y, w, h, seed, o = {}) {
  const bar = o.bar ?? 54, body = o.body || PAL.light, barFill = o.barFill || tint(PAL.fills[1], .35);
  if (o.shadow !== false && !BP()) { c.fillStyle = alpha(PAL.shade, .16); c.beginPath(); c.roundRect(x + 14, y + 16, w, h, 22); c.fill(); }
  draw(c, RR(x, y, w, h, 22), body, seed, { tex: o.tex ?? false, texo: o.texo, bpFill: o.bpFill });
  const b = RR(x, y, w, bar, 0); c.save(); c.clip(roundRectPath(x, y, w, h, 22)); if (!BP()) { c.fillStyle = barFill; c.fill(b.path); tex(c, b.path, b.box, { seed: seed + 5, density: .7 }); } c.restore();
  stroke(c, [[x, y + bar], [x + w, y + bar]], seed + 3, { lw: LK.thin });
  const dots = o.dots || [PAL.blush, PAL.fills[3] || PAL.fills[1], PAL.accents[3] || PAL.fills[0]];
  dots.forEach((col, k) => { const d = CI(x + 34 + k * 30, y + bar / 2, 9); draw(c, d, col, seed + 10 + k, { tex: false, lw: LK.thin * .8 }); });
  if (o.title) textBar(c, x + w / 2 - o.title / 2, y + bar / 2, o.title, BP() ? PAL.chalkDim : alpha(PAL.ink, .35), 10);
  return [x, y + bar, w, h - bar];
}
// browser: a window with an address pill
function browser(c, x, y, w, h, seed, o = {}) {
  const [bx, by, bw, bh] = win(c, x, y, w, h, seed, { bar: 60, ...o });
  const pill = RR(x + 130, y + 14, w - 170, 32, 16); draw(c, pill, BP() ? null : tint(PAL.paper, .5), seed + 20, { tex: false, lw: LK.thin * .8 });
  textBar(c, x + 150, y + 30, Math.min(220, (w - 220) * .5), BP() ? PAL.chalkDim : alpha(PAL.ink, .3), 9);
  return [bx, by, bw, bh];
}
// phone: body with a screen; returns the screen box
function phone(c, x, y, w, h, seed, o = {}) {
  if (!BP()) { c.fillStyle = alpha(PAL.shade, .16); c.beginPath(); c.roundRect(x + 14, y + 16, w, h, w * .16); c.fill(); }
  draw(c, RR(x, y, w, h, w * .16), o.body || PAL.ink, seed, { tex: false });
  const m = w * .06, sx = x + m, sy = y + m, sw = w - 2 * m, sh = h - 2 * m;
  draw(c, RR(sx, sy, sw, sh, w * .11), o.screen || PAL.light, seed + 3, { tex: false, lw: LK.thin * .6, line: BP() });
  if (!BP()) { c.fillStyle = o.body || PAL.ink; c.beginPath(); c.roundRect(x + w / 2 - w * .16, sy + 8, w * .32, 18, 9); c.fill(); }
  return [sx, sy, sw, sh];
}
// monitor on a stand; returns the screen box
function monitor(c, x, y, w, h, seed, o = {}) {
  const neck = RR(x + w / 2 - 40, y + h - 10, 80, 90, 6), foot = RR(x + w / 2 - 150, y + h + 70, 300, 28, 14);
  draw(c, neck, o.stand || PAL.fills[2], seed + 1, {}); draw(c, foot, o.stand || PAL.fills[2], seed + 2, {});
  draw(c, RR(x, y, w, h, 26), o.body || PAL.ink, seed + 3, { tex: false });
  const m = 24; draw(c, RR(x + m, y + m, w - 2 * m, h - 2 * m, 10), o.screen || PAL.light, seed + 4, { tex: false, line: false });
  return [x + m, y + m, w - 2 * m, h - 2 * m];
}
// terminal: a dark window, lines in chalk
function terminal(c, x, y, w, h, seed, o = {}) {
  return win(c, x, y, w, h, seed, { body: PAL.night, barFill: shade(PAL.night, -.0) , bpFill: shade(PAL.night, .2), ...o });
}
// the classic arrow cursor, tip at (x, y), size s = height
const ARROW = [[0, 0], [0, 1], [.25, .77], [.42, 1.12], [.58, 1.05], [.42, .72], [.72, .72]];
function cursor(c, x, y, s, fill, seed, o = {}) {
  const pts = ARROW.map(([u, v]) => [x + u * s * .78, y + v * s * .86]);
  if (o.shadow && !BP()) { c.fillStyle = alpha(PAL.shade, .2); c.fill(polyPath(pts.map(([a, b]) => [a + s * .06, b + s * .08]))); }
  draw(c, PG(pts), fill, seed, { lw: LK.line, ...o });
}
// a chat bubble with scribbled text
function bubble(c, x, y, w, h, fill, seed, o = {}) {
  const tail = o.right ? [[x + w - 40, y + h - 2], [x + w + 8, y + h + 26], [x + w - 70, y + h - 2]] : [[x + 40, y + h - 2], [x - 8, y + h + 26], [x + 70, y + h - 2]];
  if (!BP()) { c.fillStyle = fill; c.fill(polyPath(tail)); }
  draw(c, RR(x, y, w, h, Math.min(34, h / 2)), fill, seed, { texo: { density: .5 }, ...o });
  stroke(c, [tail[0], tail[1], tail[2]], seed + 4, { lw: o.lw || LK.line, raw: true });
  if (!BP() && o.fillOver !== false) { c.fillStyle = fill; c.fillRect(Math.min(tail[0][0], tail[2][0]) + 4, y + h - 10, Math.abs(tail[2][0] - tail[0][0]) - 8, 10); }
  if (o.lines !== false) squig(c, x + 26, y + 40, w - 52, Math.max(1, Math.floor((h - 30) / 30)), { seed: seed + 7, color: o.textColor || PAL.ink, width: 3.4 });
}
// a gear, rotation rot
function gearPts(cx, cy, r, teeth, rot) { const p = []; const n = teeth * 4; for (let k = 0; k < n; k++) { const a = rot + k / n * TAU, rr = (k % 4 < 2) ? r : r * .8; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; }
function gear(c, cx, cy, r, teeth, rot, fill, seed) { const pts = gearPts(cx, cy, r, teeth, rot); draw(c, { path: polyPath(pts), pts: subdiv(pts, 20), box: [cx - r, cy - r, 2 * r, 2 * r] }, fill, seed); draw(c, CI(cx, cy, r * .32), BP() ? null : PAL.paper, seed + 5, { tex: false }); }
// a sheet of paper with writing
function sheet(c, x, y, w, h, seed, o = {}) { draw(c, RR(x, y, w, h, 8), o.fill || PAL.light, seed, { tex: o.tex ?? false, texo: o.texo }); if (o.lines !== 0) squig(c, x + w * .12, y + h * .16, w * .76, o.lines || Math.max(2, Math.floor(h * .7 / 30)), { seed: seed + 3, ...(o.squig || {}) }); }
// a round clock face
function clockFace(c, cx, cy, r, hours, seed, o = {}) {
  draw(c, CI(cx, cy, r), o.fill || PAL.light, seed, { texo: { density: .45 }, tex: o.tex });
  c.save(); c.strokeStyle = lineCol(); c.lineCap = 'round';
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, r0 = r * (k % 3 ? .84 : .76); c.lineWidth = k % 3 ? LK.thin * .8 : LK.thin * 1.3; c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * r * .92, cy + Math.sin(a) * r * .92); c.stroke(); }
  const ha = hours / 12 * TAU - Math.PI / 2, ma = hours * TAU - Math.PI / 2;
  c.lineWidth = LK.line * 1.3; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ha) * r * .45, cy + Math.sin(ha) * r * .45); c.stroke();
  c.lineWidth = LK.line * .9; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ma) * r * .7, cy + Math.sin(ma) * r * .7); c.stroke();
  c.restore(); dot(c, cx, cy, r * .07, o.pin || (BP() ? PAL.chalk : PAL.blush));
}
// a stack of coins
function coin(c, cx, cy, r, fill, seed) { draw(c, EL(cx, cy + r * .12, r, r * .42), shade(fill, .25), seed + 1, { tex: false }); draw(c, EL(cx, cy, r, r * .42), fill, seed, { texo: { density: .6 } }); }
// a padlock, open 0..1
function padlock(c, cx, cy, s, open, fill, seed) {
  const lift = open * s * .35; stroke(c, arcPts(cx, cy - s * .2 - lift, s * .34, s * .42, Math.PI, TAU, 24).concat([[cx + s * .34, cy - lift * (1 - open)]]), seed + 3, { lw: LK.line * 2.2, raw: true });
  draw(c, RR(cx - s * .5, cy - s * .2, s, s * .75, s * .12), fill, seed, {});
  dot(c, cx, cy + s * .1, s * .07, lineCol()); stroke(c, [[cx, cy + s * .12], [cx, cy + s * .3]], seed + 5, { lw: LK.line * 1.2, raw: true });
}
// a playing card
function playCard(c, x, y, w, h, rot, seed, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot);
  draw(c, RR(-w / 2, -h / 2, w, h, w * .1), o.back ? o.back : PAL.light, seed, { tex: !!o.back });
  if (o.draw) o.draw(c, w, h);
  c.restore();
}
function heartPts(cx, cy, s) { const p = []; for (let k = 0; k < 40; k++) { const t = k / 40 * TAU; p.push([cx + s * 16 * Math.pow(Math.sin(t), 3) / 16, cy - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16]); } return p; }
function starPts(cx, cy, r, n = 5, inner = .45, rot = -Math.PI / 2) { const p = []; for (let k = 0; k < n * 2; k++) { const rr = k % 2 ? r * inner : r, a = rot + k / (n * 2) * TAU; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; }
// a stick-simple person: head and shoulders (video tiles, avatars)
function bust(c, cx, cy, s, fill, skin, seed, o = {}) {
  draw(c, EL(cx, cy + s * .95, s * .78, s * .55), fill, seed, {});
  draw(c, CI(cx, cy, s * .42), skin, seed + 3, { texo: { density: .45 } });
  if (!BP()) { const blink = o.blink; c.strokeStyle = PAL.ink; c.lineWidth = LK.thin; c.lineCap = 'round';
    for (const sx of [-1, 1]) { c.beginPath(); if (blink) { c.moveTo(cx + sx * s * .15 - 6, cy - s * .02); c.lineTo(cx + sx * s * .15 + 6, cy - s * .02); } else c.arc(cx + sx * s * .15, cy - s * .03, 4.5, 0, TAU); blink ? c.stroke() : (c.fillStyle = PAL.ink, c.fill()); }
    c.beginPath(); c.arc(cx, cy + s * .1, s * .12 + (o.talk ? 3 : 0), .15 * Math.PI, .85 * Math.PI); c.stroke(); }
}

// ===================== RISO =====================
// Plates come from a small pool (core's plate() makes a new canvas every call).
// Draw each ink's coverage in black on white in LOGICAL units; grey is partial coverage.
const _platePool = [];
function poolPlate(k) {
  if (!_platePool[k]) _platePool[k] = layer();
  const P = _platePool[k], g = P.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = '#fff'; g.fillRect(0, 0, P.width, P.height);
  resetT(g); g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineCap = 'round'; g.lineJoin = 'round';
  return P;
}
const gray = v => { const k = 255 - clamp(v, 0, 1) * 255 | 0; return `rgb(${k},${k},${k})`; };
const radialG = (g, x, y, r0, r1, c0, c1) => { const gr = g.createRadialGradient(x, y, r0, x, y, r1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; };
const linearG = (g, x0, y0, x1, y1, c0, c1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c0); gr.addColorStop(1, c1); return gr; };
// print: paper first (unless o.noPaper), then one plate per ink, multiplied
function risoPrint(c, drawPlate, o = {}) {
  const inks = o.inks || PAL.inks.slice(0, 3), angles = o.angles || [.26, 1.31, 0, .79];
  if (!o.noPaper) paper(c);
  inks.forEach((ink, k) => { const P = poolPlate(k), g = P.getContext('2d'); drawPlate(g, k); printPlate(c, P, { cell: o.cell || LK.cell || 12, ink, angle: angles[k], seed: (o.seed || 30) + k, maxCov: o.maxCov ?? .82, jitter: .18 }); });
}
// crayon outline over a riso print
function crayonShape(c, pts, color, width, seed, close = true) { crayon(c, subdiv(pts, 26, close), color, width, seed, close); }

// ===================== DEVICES =====================
// establishing ground (recipe A): a huge hatched disc below the frame, light and blush layers, a wobbly rim
function groundA(c, cx, top, R, seed, o = {}) {
  const cy = top + R, g = circPath(cx, cy, R), box = [cx - R, top, 2 * R, 2 * R];
  if (BP()) { stroke(c, ellPts(cx, cy, R, R, 0, 160), seed, { lw: LK.thin, alpha: .7, raw: true, close: true, color: PAL.chalkDim }); return; }
  c.fillStyle = o.fill || PAL.fills[0]; c.fill(g);
  c.save(); c.clip(g);
  hatch(c, circPath(cx - R * .35, top + R * .45, R * .55), [cx - R * .9, top - R * .1, R * 1.1, R * 1.1], { angle: .8, gap: 11, len: 26, jitter: 8, color: PAL.light, alpha: .55, width: 2.4, seed: seed + 1 });
  hatch(c, circPath(cx + R * .45, cy + R * .2, R * .95), [cx - R * .5, top, R * 1.9, R * 1.9], { angle: -.6, gap: 9, len: 26, jitter: 7, color: o.blush || PAL.blush, alpha: .3, width: 2.2, seed: seed + 2 });
  c.restore();
  grain(c, g, [cx - R, top, 2 * R, Math.min(2 * R, H - top + 40)], 2600, PAL.shade, .3, seed + 3, 3.4);
  c.save(); c.strokeStyle = PAL.ink; c.lineWidth = LK.line * .9; c.globalAlpha = .85; wob(c, ellPts(cx, cy, R, R, 0, 180), 3, seed + 4, true); c.restore();
}
// desk (screen look): a flat orange desk top with wood lines
function deskTop(c, y, seed, o = {}) {
  const p = rectPath(-20, y, W + 40, H - y + 20); c.fillStyle = o.fill || PAL.fills[3]; c.fill(p);
  tex(c, p, [0, y, W, H - y], { density: .3, color: shade(o.fill || PAL.fills[3], .35), seed });
  const r = rng(seed + 3); c.save(); c.strokeStyle = shade(o.fill || PAL.fills[3], .3); c.lineWidth = 2.4; c.globalAlpha = .6;
  for (let k = 0; k < 14; k++) { const yy = y + 20 + r() * (H - y - 30), x0 = r() * W, L = 120 + r() * 300; wob(c, [[x0, yy], [x0 + L * .5, yy + (r() - .5) * 6], [x0 + L, yy]], 2, seed + 10 + k); }
  c.restore(); stroke(c, [[-10, y], [W + 10, y]], seed + 40, { lw: LK.line });
}
// guides: construction around a subject, sized for cards
function guides(c, cx, cy, R, seed, al = .8) { c.save(); c.lineWidth = 2; construction(c, cx, cy, R, seed, BP() ? alpha(PAL.chalk, .45) : PAL.guide, al); c.restore(); }
// blot wipe with bristles that read at card size
function blotWipe(c, src, cx, cy, R, seed, fringe = PAL.night) {
  if (R <= 0) return; const r = rng(seed), path = new Path2D();
  for (let i = 0; i < 90; i++) { const a = i / 90 * TAU, rr = R * (1 + (r() - .5) * .18), x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; i ? path.lineTo(x, y) : path.moveTo(x, y); } path.closePath();
  c.save(); resetT(c); c.clip(path); c.drawImage(src, 0, 0, W, H); c.restore();
  c.save(); resetT(c); c.strokeStyle = fringe; c.lineCap = 'round'; c.globalAlpha = .9;
  for (let i = 0; i < 360; i++) { const a = r() * TAU, rad = R * (1 + (r() - .5) * .16), L = 14 + r() * 60, x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad; c.lineWidth = 2 + r() * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); }
  c.restore();
}
// shared layers for transitions, made once
const LA = layer(), LB = layer(), LC = layer();
// recipe B as a beat: the ink render, then a blot opening on its blueprint twin
function blotBeat(inkFn, cx, cy, o = {}) {
  const dur = o.dur ?? .75;
  return (c, tau, i) => {
    inkFn(LA.getContext('2d'), o.inkTau ?? tau, i);
    const b = LB.getContext('2d'); night(b); inBlueprint(() => (o.bpFn || inkFn)(b, o.bpTau ?? tau, i, true));
    blit(c, LA); blotWipe(c, LB, typeof cx === 'function' ? cx() : cx, cy, lerp(0, Math.hypot(W, H), sm(0, dur, tau, easeOut)), o.seed || 32);
  };
}
// iris open onto another render
function irisBeat(fromFn, toFn, cx, cy, o = {}) {
  const t0 = o.t0 ?? 0, dur = o.dur ?? .6;
  return (c, tau, i) => {
    fromFn(c, tau, i);
    const p = sm(t0, t0 + dur, tau, easeOut), R = lerp(0, Math.hypot(W, H) * .6, p);
    if (p > 0) { const L = LC.getContext('2d'); toFn(L, tau, i); iris(c, cx, cy, R, cc => blit(cc, LC)); if (p < 1) { resetT(c); stroke(c, ellPts(cx, cy, R, R, 0, 90), 91, { lw: LK.line, raw: true, close: true, color: o.rim || PAL.ink }); } }
  };
}
// torn-paper section rising (pencil device), progress 0..1 from bottom to y
function tornRise(c, y, progress, color, seed) { if (progress <= 0) return; section(c, lerp(H + 30, y, easeOut(clamp(progress, 0, 1))), color, seed); }
// quantise a time to the drawn grid, so motion lands on twos
const q12 = t => Math.floor(t * FPS_DRAW) / FPS_DRAW;
// bounce: 0..1..0 over a period, eased
const bounce = (t, period = 1) => { const u = ((t % period) + period) % period / period; return Math.sin(u * Math.PI); };
// hop: a jump curve with a squash at the bottom, returns [dy, squash]
function hop(t, period, height) { const u = ((t % period) + period) % period / period; if (u < .82) { const v = u / .82; return [-4 * height * v * (1 - v), 1]; } const s = Math.sin((u - .82) / .18 * Math.PI); return [0, 1 - s * .12]; }

// ===================== FILM =====================
const easeBack = t => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
// writeOn: hand lettering revealed left to right as if written, with the pen at the edge.
//   p 0..1; o: size, ink, ink2, align, pen (colour or null), font, weight, rot
function writeOn(c, text, x, y, p, o = {}) {
  const { size = 160, align = 'center', pen = PAL.ink, rot = 0 } = o;
  if (p <= 0) { const w = handWidth(c, text, size, o.font); return [x + (align === 'center' ? -w / 2 : align === 'right' ? -w : 0), y - size * .3]; }
  c.save(); c.translate(x, y); c.rotate(rot);
  c.font = `${o.weight || 'normal'} ${size}px ${o.font || KIT_HAND}`;
  const w = c.measureText(text).width, x0 = align === 'center' ? -w / 2 : align === 'right' ? -w : 0, edge = x0 + w * clamp(p, 0, 1) + size * .04;
  c.beginPath(); c.rect(x0 - size, -size * 1.4, edge - x0 + size, size * 2.2); c.clip();
  hand(c, text, 0, 0, { ...o, size, align });
  c.restore();
  const py = -size * .3 + Math.sin(p * 40) * size * .12;
  if (pen && p < 1) { c.save(); c.translate(x, y); c.rotate(rot); dot(c, edge, py, size * .05, pen); c.restore(); }
  return [x + Math.cos(rot) * edge - Math.sin(rot) * py, y + Math.sin(rot) * edge + Math.cos(rot) * py];   // where the pen is
}
// the width of a line of lettering, for layouts
function handWidth(c, text, size, font) { c.save(); c.font = `${size}px ${font || KIT_HAND}`; const w = c.measureText(text).width; c.restore(); return w; }
// portfolioFilm: one film, its look and palette, the poster frame exposed to the build.
//   look     ink | screen | riso | pencil   (line and finish weights)
//   palette  a preset name or a palette object (makePalette / derivePalette / duotone)
//   beats    [{ name, dur, fn, palette? }]   a beat may bring its own palette
//   poster   seconds into the film for the still the card shows before it is hovered
function portfolioFilm({ look, palette, beats, poster = 1, crf }) {
  setLook(look, palette);
  const pal = PAL;
  // every beat starts from the film's palette (or its own), so a switch never leaks into the next shot
  const wrapped = beats.map(b => ({ ...b, fn: (c, t, i) => { usePalette(b.palette || pal); MODE = 'ink'; b.fn(c, t, i); } }));
  window.__POSTER = Math.round(poster * FPS_DRAW);
  // a film whose whole frame moves under a dot screen costs the encoder far more than a still
  // composition does; those films ask for a higher crf instead of a megabyte of card.
  if (crf) window.__CRF = crf;
  defineFilm({ palette: pal, timeline: wrapped, format: { ar: '4:3', width: 720 } });
}
