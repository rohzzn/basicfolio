// The site's sounds: the tick when a link or button is clicked (CursorSound) and the plip when the
// stream is tapped (WaterStream). One switch covers both, beside the status in the sidebar, and it
// is remembered per visitor. The plip is synthesised: a sine drop whose pitch leaps as it pops.

type State = { enabled: boolean };

const KEY = 'siteSound';
const SERVER: State = { enabled: true };

let state: State = SERVER;
let installed = false;
const listeners = new Set<() => void>();

export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const getState = () => state;
export const getServerState = () => SERVER;

function set(next: State) {
  state = next;
  listeners.forEach((fn) => fn());
}

// Reads the visitor's choice. Safe to call from every component that needs it; only the first
// call does anything.
export function initSound() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  try {
    if (localStorage.getItem(KEY) === 'off') set({ enabled: false });
  } catch {
    // storage blocked: sound stays on
  }
}

export function toggleSound() {
  const enabled = !state.enabled;
  set({ enabled });
  try {
    localStorage.setItem(KEY, enabled ? 'on' : 'off');
  } catch {}
}

let ctx: AudioContext | null = null;

// A drop of water. Only ever called from a click, so the browser lets it sound.
export function plip(pitch: number, gain: number, delay = 0) {
  if (!state.enabled) return;
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
