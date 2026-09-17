/**
 * The marks from /films/kit.js, ported for things the site has to draw live.
 *
 * The project cards are films: drawn offline, rendered to video. Anything fed by
 * live data cannot be, so it gets drawn in the browser instead — with the same
 * seeded jitter, so a wobbly square here looks like a wobbly square there.
 *
 * Everything is seeded. Math.random would make the marks crawl on every repaint.
 */

/** The film core's generator, so a given seed draws the same mark as it does there. */
export function rng(seed: number): () => number {
  let a = (seed * 1000003) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable seed from a string, so a cell's wobble belongs to its date and never changes. */
export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}

/**
 * A square drawn by hand: every edge divided in three and every point nudged.
 * Call it once for the fill and again with another seed for the outline, so the
 * two never coincide — that is what keeps it from looking like a rounded rect.
 */
export function wobSquare(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  amp: number,
  seed: number
): void {
  const r = rng(seed);
  const j = () => (r() - 0.5) * amp * 2;
  const steps = 3;
  c.beginPath();
  c.moveTo(x + j(), y + j());
  for (let k = 1; k <= steps; k++) c.lineTo(x + (w * k) / steps + j(), y + j());
  for (let k = 1; k <= steps; k++) c.lineTo(x + w + j(), y + (h * k) / steps + j());
  for (let k = 1; k <= steps; k++) c.lineTo(x + w - (w * k) / steps + j(), y + h + j());
  for (let k = 1; k <= steps; k++) c.lineTo(x + j(), y + h - (h * k) / steps + j());
  c.closePath();
}

/** Speckles inside the current path's box: the stock grain, at whatever scale fits. */
export function grain(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  n: number,
  color: string,
  alpha: number,
  seed: number,
  size = 1.4
): void {
  const r = rng(seed);
  c.save();
  c.fillStyle = color;
  c.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    c.fillRect(x + r() * w, y + r() * h, size * (0.4 + r()), size * (0.4 + r()));
  }
  c.restore();
}

/** Short parallel strokes across a box, the ink look's shading. */
export function hatch(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { gap?: number; color?: string; alpha?: number; width?: number; seed?: number } = {}
): void {
  const { gap = 5, color = '#000', alpha = 0.25, width = 1, seed = 1 } = opts;
  const r = rng(seed);
  c.save();
  c.strokeStyle = color;
  c.globalAlpha = alpha;
  c.lineWidth = width;
  c.lineCap = 'round';
  c.beginPath();
  for (let u = -h; u < w; u += gap) {
    const x0 = x + u + (r() - 0.5) * gap * 0.6;
    c.moveTo(Math.max(x, x0), Math.max(y, y + (x - x0)));
    const x1 = x0 + h;
    c.lineTo(Math.min(x + w, x1), y + Math.min(h, x1 - x0));
  }
  c.stroke();
  c.restore();
}

/** Size a canvas to its box in device pixels and hand back a context in CSS units. */
export function fitCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number
): CanvasRenderingContext2D | null {
  const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  const c = canvas.getContext('2d');
  if (!c) return null;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, cssWidth, cssHeight);
  return c;
}

/** Drawn on twos, like the films: 12 steps a second, not 60. */
export const FPS_DRAW = 12;
