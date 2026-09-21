// The brook's sound: synthesised in the browser from noise and tiny sine bubbles rather than played
// from a recording, so it costs no download and never loops. Four layers, all through one soft
// outdoor reverb:
//   rush     brown noise, low-passed: the body of the water going by
//   shimmer  pink noise in a gentle band high up: the hiss of many small splashes
//   babble   hundreds of little bubbles a minute, each a sine whose pitch rises as it pops,
//            arriving in slow clusters the way a brook gurgles
//   birds    now and then, far off, a two-note whistle
//
// It is on by default, but browsers only allow sound after the visitor has done something, so it
// starts (fading in) on the first click or key press anywhere. The switch and volume in the
// sidebar are saved per visitor. The plips from clicking the water share its volume and switch.

type State = { enabled: boolean; volume: number; running: boolean };

const KEY_ON = 'streamSound';
const KEY_VOL = 'streamSoundVolume';
const SERVER: State = { enabled: true, volume: 0.5, running: false };

let state: State = SERVER;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((fn) => fn());
function set(part: Partial<State>) {
  state = { ...state, ...part };
  emit();
}

export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const getState = () => state;
export const getServerState = () => SERVER;

// ---- the graph ----
let ctx: AudioContext | null = null;
let master: GainNode | null = null; // the visitor's volume
let duckGain: GainNode | null = null; // dips while a Spotify preview plays
let ambience: GainNode | null = null; // the brook itself
let dry: GainNode | null = null;
let send: GainNode | null = null;
let babbleBus: GainNode | null = null;
let pans: StereoPannerNode[] = []; // a few fixed places across the stream for the bubbles to come from
let birdBus: GainNode | null = null;
let timer = 0;
let nextBubble = 0;
let nextSparkle = 0;
let nextBird = 0;
let seed = 12345;
let installed = false;
let stopTimer = 0;

// seeded, so the brook is the same brook for everyone
function rnd() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const level = (v: number) => v * v * 2; // the slider is perceptual, the gain is not

function noise(c: AudioContext, seconds: number, colour: 'pink' | 'brown'): AudioBuffer {
  const n = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, n, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < n; i++) {
      const w = rnd() * 2 - 1;
      if (colour === 'pink') {
        // Paul Kellet's filter
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    // cross-fade the ends so the loop has no seam
    const fade = Math.floor(c.sampleRate * 0.05);
    for (let i = 0; i < fade; i++) {
      const k = i / fade;
      d[i] = d[i] * k + d[n - fade + i] * (1 - k);
    }
  }
  return buf;
}

// a stereo impulse response for an open space: a quick, dark, diffuse tail
function room(c: AudioContext): AudioBuffer {
  const len = Math.floor(c.sampleRate * 2.4);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const t = i / c.sampleRate;
      const k = 0.35 + 0.6 * Math.min(1, t / 1.6); // the tail gets darker as it dies
      lp += (rnd() * 2 - 1 - lp) * (1 - k);
      d[i] = lp * Math.exp(-t / 0.5) * (t < 0.012 ? t / 0.012 : 1);
    }
  }
  return buf;
}

function lfo(c: AudioContext, hz: number, depth: number, target: AudioParam) {
  const o = c.createOscillator();
  o.frequency.value = hz;
  const g = c.createGain();
  g.gain.value = depth;
  o.connect(g).connect(target);
  o.start();
}

function build(c: AudioContext) {
  master = c.createGain();
  master.gain.value = 0;
  // a soft limiter, so the top of the volume slider can never clip
  const limiter = c.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 6;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.25;
  master.connect(limiter).connect(c.destination);
  duckGain = c.createGain();
  duckGain.connect(master);
  ambience = c.createGain();
  ambience.gain.value = 1;
  ambience.connect(duckGain);

  const verb = c.createConvolver();
  verb.buffer = room(c);
  const wet = c.createGain();
  wet.gain.value = 0.55;
  verb.connect(wet).connect(ambience);
  dry = c.createGain();
  dry.connect(ambience);
  send = c.createGain();
  send.connect(verb);

  const route = (node: AudioNode, drySend: number, wetSend: number) => {
    const a = c.createGain();
    a.gain.value = drySend;
    node.connect(a).connect(dry as GainNode);
    const b = c.createGain();
    b.gain.value = wetSend;
    node.connect(b).connect(send as GainNode);
  };

  // rush
  const rush = c.createBufferSource();
  rush.buffer = noise(c, 7, 'brown');
  rush.loop = true;
  const rushLp = c.createBiquadFilter();
  rushLp.type = 'lowpass';
  rushLp.frequency.value = 620;
  rushLp.Q.value = 0.4;
  const rushHp = c.createBiquadFilter();
  rushHp.type = 'highpass';
  rushHp.frequency.value = 70;
  const rushG = c.createGain();
  rushG.gain.value = 0.26;
  lfo(c, 0.061, 0.06, rushG.gain);
  lfo(c, 0.137, 0.035, rushG.gain);
  lfo(c, 0.09, 90, rushLp.frequency);
  rush.connect(rushLp).connect(rushHp).connect(rushG);
  route(rushG, 1, 0.35);
  rush.start();

  // shimmer
  const hiss = c.createBufferSource();
  hiss.buffer = noise(c, 6, 'pink');
  hiss.loop = true;
  const band = c.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = 2300;
  band.Q.value = 0.6;
  const soft = c.createBiquadFilter();
  soft.type = 'lowpass';
  soft.frequency.value = 5200;
  const hissG = c.createGain();
  hissG.gain.value = 0.1;
  lfo(c, 0.11, 0.028, hissG.gain);
  lfo(c, 0.23, 0.016, hissG.gain);
  lfo(c, 0.07, 400, band.frequency);
  hiss.connect(band).connect(soft).connect(hissG);
  route(hissG, 1, 0.5);
  hiss.start();

  // babble and birds get their own buses, softened before the reverb
  babbleBus = c.createGain();
  babbleBus.gain.value = 0.9;
  const babbleLp = c.createBiquadFilter();
  babbleLp.type = 'lowpass';
  babbleLp.frequency.value = 2600;
  babbleBus.connect(babbleLp);
  route(babbleLp, 0.8, 0.7);
  pans = [-0.6, -0.3, 0, 0.3, 0.6].map((v) => {
    const p = c.createStereoPanner();
    p.pan.value = v;
    p.connect(babbleBus as GainNode);
    return p;
  });

  birdBus = c.createGain();
  birdBus.gain.value = 1;
  route(birdBus, 0.25, 1);

  nextBubble = nextSparkle = c.currentTime + 0.1;
  nextBird = c.currentTime + 12 + rnd() * 14;
}

// how busy the water is right now: a slow swell, so the babble comes in clusters
const flow = (t: number) => 0.55 + 0.25 * Math.sin(t * 0.21) + 0.2 * Math.sin(t * 0.53 + 1.3) * Math.sin(t * 0.08);

function bubble(c: AudioContext, t: number, f: number, amp: number, dur: number) {
  if (!babbleBus) return;
  const o = c.createOscillator();
  o.frequency.setValueAtTime(f, t);
  o.frequency.exponentialRampToValueAtTime(f * (1.4 + rnd() * 0.9), t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(amp, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(pans[Math.floor(rnd() * pans.length)] ?? babbleBus);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function whistle(c: AudioContext, t: number, f0: number, f1: number, dur: number, amp: number, pan: number) {
  if (!birdBus) return;
  const o = c.createOscillator();
  o.frequency.setValueAtTime(f0, t);
  o.frequency.linearRampToValueAtTime(f1, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(amp, t + 0.04);
  g.gain.setValueAtTime(amp, t + dur - 0.07);
  g.gain.linearRampToValueAtTime(0, t + dur);
  const p = c.createStereoPanner();
  p.pan.value = pan;
  o.connect(g).connect(p).connect(birdBus);
  o.start(t);
  o.stop(t + dur + 0.02);
}

// schedules a little ahead of the clock, so timer jitter never leaves a gap
function schedule() {
  const c = ctx;
  if (!c) return;
  const until = c.currentTime + 0.3;
  while (nextBubble < until) {
    const t = nextBubble;
    const busy = flow(t);
    // most bubbles mid-pitch, a few low gulps; smaller ones ring higher and shorter
    const f = 380 * Math.pow(2, rnd() * 1.9);
    const dur = 0.025 + (520 / f) * 0.05 * (0.7 + rnd() * 0.6);
    // many small, even bubbles rather than a few loud ones: a trickle, not a cartoon
    const amp = 0.16 * Math.exp(rnd() * 1.2 - 0.8) * (0.6 + busy * 0.6);
    bubble(c, t, f, amp, dur);
    nextBubble += -Math.log(1 - rnd()) / (40 + 80 * busy);
  }
  while (nextSparkle < until) {
    const t = nextSparkle;
    const f = 1500 + rnd() * 1600;
    bubble(c, t, f, 0.018 * (0.5 + rnd()), 0.012 + rnd() * 0.018);
    nextSparkle += -Math.log(1 - rnd()) / (25 + 25 * flow(t));
  }
  if (nextBird < until) {
    // far off and seldom: "fee-bee", sometimes twice
    const pan = (rnd() * 2 - 1) * 0.8;
    const amp = 0.024 + rnd() * 0.016;
    const k = 0.94 + rnd() * 0.12;
    const times = rnd() < 0.4 ? 2 : 1;
    for (let i = 0; i < times; i++) {
      const t = nextBird + i * 1.35;
      whistle(c, t, 3950 * k, 3870 * k, 0.3, amp, pan);
      whistle(c, t + 0.36, 3420 * k, 3330 * k, 0.34, amp * 0.9, pan);
    }
    nextBird += 20 + rnd() * 35;
  }
}

function start() {
  if (!state.enabled) return;
  try {
    if (!ctx) {
      ctx = new AudioContext();
      build(ctx);
    }
    const c = ctx;
    window.clearTimeout(stopTimer);
    void c.resume().then(() => {
      if (!master || !state.enabled) return;
      nextBubble = Math.max(nextBubble, c.currentTime + 0.05);
      nextSparkle = Math.max(nextSparkle, c.currentTime + 0.05);
      nextBird = Math.max(nextBird, c.currentTime + 8);
      const g = master.gain;
      g.cancelScheduledValues(c.currentTime);
      g.setValueAtTime(g.value, c.currentTime);
      g.linearRampToValueAtTime(level(state.volume), c.currentTime + 3);
      if (!timer) timer = window.setInterval(schedule, 100);
      schedule();
      set({ running: true });
    });
  } catch {
    // no Web Audio: the site is simply quiet
  }
}

function stop() {
  const c = ctx;
  if (!c || !master) return;
  const g = master.gain;
  g.cancelScheduledValues(c.currentTime);
  g.setValueAtTime(g.value, c.currentTime);
  g.linearRampToValueAtTime(0, c.currentTime + 0.6);
  window.clearTimeout(stopTimer);
  stopTimer = window.setTimeout(() => {
    window.clearInterval(timer);
    timer = 0;
    void c.suspend();
  }, 700);
  set({ running: false });
}

// The first thing the visitor does starts it. Presses on the sound controls themselves are
// left to the controls, so the press that starts the sound is never also read as "turn it off".
function onGesture(e: Event) {
  const t = e.target instanceof Element ? e.target : null;
  if (t?.closest('[data-sound-controls]')) return;
  if (state.enabled && !state.running) start();
}

export function initSound() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  try {
    const on = localStorage.getItem(KEY_ON);
    const vol = Number(localStorage.getItem(KEY_VOL));
    set({ enabled: on !== 'off', volume: localStorage.getItem(KEY_VOL) !== null && Number.isFinite(vol) ? Math.min(1, Math.max(0, vol)) : 0.5 });
  } catch {
    // storage blocked: defaults
  }
  window.addEventListener('pointerdown', onGesture, true);
  window.addEventListener('keydown', onGesture, true);
}

export function setEnabled(on: boolean) {
  set({ enabled: on });
  try {
    localStorage.setItem(KEY_ON, on ? 'on' : 'off');
  } catch {}
  if (on) start();
  else stop();
}

// the button: if the sound is on but still waiting for a first gesture, this press is that gesture
export function toggle() {
  if (state.enabled && !state.running) start();
  else setEnabled(!state.enabled);
}

export function setVolume(v: number) {
  const volume = Math.min(1, Math.max(0, v));
  set({ volume });
  try {
    localStorage.setItem(KEY_VOL, String(volume));
  } catch {}
  if (ctx && master && state.running) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(level(volume), ctx.currentTime, 0.05);
  }
  if (state.enabled && !state.running) start();
}

// quieter, not silent, while something else is playing
export function duck(on: boolean) {
  if (!ctx || !duckGain) return;
  duckGain.gain.setTargetAtTime(on ? 0.2 : 1, ctx.currentTime, 0.4);
}

// a drop of water, for clicks on the stream: same switch, same volume
export function plip(pitch: number, gain: number, delay = 0) {
  if (!state.enabled) return;
  if (!state.running) start();
  const c = ctx;
  if (!c) return;
  const t = c.currentTime + delay + 0.01;
  const peak = gain * 2.2 * level(state.volume) + 0.0002;
  const o = c.createOscillator();
  const g = c.createGain();
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2600;
  o.frequency.setValueAtTime(360 * pitch, t);
  o.frequency.exponentialRampToValueAtTime(1150 * pitch, t + 0.075);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  // straight out at the visitor's volume: the brook fading in never swallows the first plip
  o.connect(lp).connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.16);
}
