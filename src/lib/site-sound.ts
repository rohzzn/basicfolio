// The plip when the stream is tapped: a sine drop whose pitch leaps as it pops, synthesised so
// there is nothing to download. Only ever called from a click, so the browser lets it sound.

let ctx: AudioContext | null = null;

export function plip(pitch: number, gain: number, delay = 0) {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const t = ctx.currentTime + delay + 0.01;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2600;
    o.frequency.setValueAtTime(360 * pitch, t);
    o.frequency.exponentialRampToValueAtTime(1150 * pitch, t + 0.075);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(lp).connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.16);
  } catch {
    // no Web Audio: no plip
  }
}
