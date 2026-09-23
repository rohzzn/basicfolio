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

// A typewriter: a short burst of filtered noise for each key (lower and duller for the space
// bar), and a small bell when the carriage comes to the end of a line.

let noise: AudioBuffer | null = null;

function audio(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function clack(kind: 'key' | 'space' = 'key') {
  const a = audio();
  if (!a) return;
  if (!noise) {
    noise = a.createBuffer(1, Math.floor(a.sampleRate * 0.06), a.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  }
  const t = a.currentTime + 0.005;
  const src = a.createBufferSource();
  src.buffer = noise;
  const bp = a.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = kind === 'space' ? 520 : 1700 + Math.random() * 900;
  bp.Q.value = kind === 'space' ? 0.9 : 1.6;
  const g = a.createGain();
  const peak = kind === 'space' ? 0.09 : 0.07;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'space' ? 0.07 : 0.045));
  src.connect(bp).connect(g).connect(a.destination);
  src.start(t);
  src.stop(t + 0.08);
}

export function ding() {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + 0.01;
  [
    [2093, 0.05],
    [3136, 0.025],
    [5274, 0.01],
  ].forEach(([freq, gain]) => {
    const o = a.createOscillator();
    const g = a.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + 1.35);
  });
}
