'use client';

import React, { useEffect, useRef } from 'react';
import { useMedia } from '@/lib/use-media';
import { plip } from '@/lib/site-sound';

// A clear blue stream down the right-hand side of every page, seen from straight above and drawn
// on the GPU in a clean, game-like style.
//
// Under the water is a smooth sandy bed with a scatter of plain, rounded stones in soft colours,
// each with a lit side, a shaded side and a small glint, and a soft shadow on the sand round it;
// three big stones lie a little deeper. The water is aqua over the shallows and a deeper fresh
// blue down the middle; it bends the bed as its surface moves, throws caustic light across it,
// glitters where the sun or moon catches it, and meets the page with a white lace of foam.
//
// Ripples are a real wave simulation on a half-resolution grid, carried downstream with the
// current: the cursor held in the water sheds a wake, moving it trails ripples, and a click drops
// a pebble. A few leaves ride the current and can be pushed.
//
// It is lit for the visitor's own time of day: the sun's height and bearing come from their clock
// and the date (at a mid-northern latitude), the moon's from its real phase, so it is bright at
// midday, warm at the ends of the day and moonlit navy at night. ?time=HH:MM in the address
// previews another hour.
//
// The canvas takes no pointer events: it reads the pointer off the window, so everything under
// and around it stays exactly as clickable as it was. It needs WebGL2 with float render targets;
// without them the column is simply left empty.

type Vec3 = [number, number, number];

const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const V0 = 38; // px/s down the middle of the stream
const K1 = TAU / 980;
const K2 = TAU / 520;
const K3 = TAU / 640;
const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="button"], [contenteditable="true"]';
// fraction of the height, position across (-1 bank to 1 bank), radius
const STONES: [number, number, number][] = [
  [0.22, -0.44, 18],
  [0.55, 0.4, 23],
  [0.84, -0.2, 15],
];
const MAX_DROPS = 16;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function rng(seed: number): () => number {
  let a = (seed * 1000003) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// sRGB hex to linear light
function lin(hex: string): Vec3 {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.pow(c / 255, 2.2)) as Vec3;
}
const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const scale3 = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];

// ---------------------------------------------------------------------------------------------
// Time of day
// ---------------------------------------------------------------------------------------------

type Sky = {
  sun: Vec3; // direction to the sun: x east, y north (screen down), z up
  sunCol: Vec3;
  sunUp: number;
  moon: Vec3;
  moonCol: Vec3;
  zen: Vec3;
  hor: Vec3;
  amb: Vec3;
  exposure: number;
};

// sky colours by the sun's elevation in degrees
const SKY_KEYS: { e: number; zen: string; hor: string; sun: string; i: number }[] = [
  { e: -18, zen: '#02040b', hor: '#060a16', sun: '#000000', i: 0 },
  { e: -9, zen: '#0b1330', hor: '#241f40', sun: '#000000', i: 0 },
  { e: -3, zen: '#22386a', hor: '#a86456', sun: '#ff6f3a', i: 0.12 },
  { e: 2, zen: '#3b5e94', hor: '#ee955a', sun: '#ff9147', i: 0.55 },
  { e: 8, zen: '#4e7ebc', hor: '#f2c08a', sun: '#ffbd78', i: 0.85 },
  { e: 22, zen: '#4983c7', hor: '#bdd6ec', sun: '#fff0d8', i: 1 },
  { e: 60, zen: '#3f7cc4', hor: '#c6def0', sun: '#fffaf2', i: 1.05 },
];

// South is at the top of the screen, so the midday sun lights things from above the way the eye
// expects (lit from below, pebbles read as dents); morning light comes from the right, evening
// light from the left.
function dirFrom(elev: number, az: number): Vec3 {
  return [Math.sin(az) * Math.cos(elev), Math.cos(az) * Math.cos(elev), Math.sin(elev)];
}

function skyAt(now: Date): Sky {
  const lat = 40 * DEG;
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((+now - +start) / 864e5);
  const decl = 23.44 * DEG * Math.sin((TAU * (284 + day)) / 365);
  // clock noon is about 12:10 solar, an hour later in summer time
  const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
  const dst = now.getTimezoneOffset() < Math.max(jan, jul);
  const hour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  const ha = (hour - 12.2 - (dst ? 1 : 0)) * 15 * DEG;
  const place = (h: number, d: number) => {
    const e = Math.asin(Math.sin(lat) * Math.sin(d) + Math.cos(lat) * Math.cos(d) * Math.cos(h));
    const az = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(lat) - Math.tan(d) * Math.cos(lat)) + Math.PI;
    return { e, az };
  };
  const sun = place(ha, decl);
  // the moon: its phase from a known new moon, trailing the sun by that much of a day
  const phase = ((((+now / 864e5 - 10962.76) / 29.530588853) % 1) + 1) % 1;
  const moon = place(ha - phase * TAU, decl * Math.cos(phase * TAU));
  const lit = (1 - Math.cos(phase * TAU)) / 2;

  const e = sun.e / DEG;
  let k = 0;
  while (k < SKY_KEYS.length - 2 && e > SKY_KEYS[k + 1].e) k++;
  const a = SKY_KEYS[k];
  const b = SKY_KEYS[k + 1];
  const t = clamp((e - a.e) / (b.e - a.e), 0, 1);
  const zen = mix3(lin(a.zen), lin(b.zen), t);
  const hor = mix3(lin(a.hor), lin(b.hor), t);
  const sunI = lerp(a.i, b.i, t);
  const sunCol = scale3(mix3(lin(a.sun), lin(b.sun), t), sunI * 2.0);
  const moonUp = clamp((moon.e / DEG + 4) / 14, 0, 1);
  const moonCol = scale3(lin('#c4d2ff'), (0.05 + 0.2 * lit) * moonUp);
  const amb = mix3(zen, hor, 0.45).map((c, i) => c * 0.85 + [0.0015, 0.002, 0.004][i]) as Vec3;
  const daylight = clamp((e + 8) / 18, 0, 1);
  return {
    sun: dirFrom(sun.e, sun.az),
    sunCol,
    sunUp: clamp((e + 1) / 9, 0, 1),
    moon: dirFrom(moon.e, moon.az),
    moonCol,
    zen,
    hor,
    amb,
    exposure: lerp(2.4, 0.7, daylight),
  };
}

function lerpSky(a: Sky, b: Sky, t: number): Sky {
  return {
    sun: mix3(a.sun, b.sun, t),
    sunCol: mix3(a.sunCol, b.sunCol, t),
    sunUp: lerp(a.sunUp, b.sunUp, t),
    moon: mix3(a.moon, b.moon, t),
    moonCol: mix3(a.moonCol, b.moonCol, t),
    zen: mix3(a.zen, b.zen, t),
    hor: mix3(a.hor, b.hor, t),
    amb: mix3(a.amb, b.amb, t),
    exposure: lerp(a.exposure, b.exposure, t),
  };
}

// ?time=HH:MM holds the clock at that hour, today
function clockOverride(): Date | null {
  try {
    const m = /(?:^|[?&])time=(\d{1,2}):?(\d{2})?/.exec(window.location.search);
    if (!m) return null;
    const d = new Date();
    d.setHours(Number(m[1]) % 24, Number(m[2] ?? 0), 0, 0);
    return d;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------------------------

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const COMMON = `
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), u.x), mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
vec2 grad2(vec2 p) { float a = hash12(p) * 6.2831853; return vec2(cos(a), sin(a)); }
// gradient noise with its derivatives (value, d/dx, d/dy)
vec3 noised(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  vec2 du = 30.0 * f * f * (f * (f - 2.0) + 1.0);
  vec2 ga = grad2(i), gb = grad2(i + vec2(1, 0)), gc = grad2(i + vec2(0, 1)), gd = grad2(i + vec2(1, 1));
  float va = dot(ga, f), vb = dot(gb, f - vec2(1, 0)), vc = dot(gc, f - vec2(0, 1)), vd = dot(gd, f - vec2(1, 1));
  return vec3(va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * (va - vb - vc + vd),
              ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd) + du * (u.yx * (va - vb - vc + vd) + vec2(vb, vc) - va));
}`;

// Once per size: the ground (albedo and height), its normals, and the current over it.
const BAKE = `#version 300 es
precision highp float;
uniform vec2 uSize;
uniform vec4 uGeo;          // centre x, bend 1, bend 2, half width
uniform vec4 uStone[3];     // x, y, radius
uniform vec4 uStoneFlow[3]; // the current arriving at each stone, px/s
in vec2 vUv;
layout(location = 0) out vec4 oA; // linear albedo, height (water line at 0)
layout(location = 1) out vec4 oB; // ground normal xy, rock, foam source
layout(location = 2) out vec4 oC; // current xy (px/s, y down), across (-1..1 bank to bank)
${COMMON}
const float K1 = ${K1}, K2 = ${K2}, K3 = ${K3};
float cX(float y) { return uGeo.x + uGeo.y * sin(y * K1 + 0.9) + uGeo.z * sin(y * K2 + 2.1); }
float sl(float y) { return uGeo.y * K1 * cos(y * K1 + 0.9) + uGeo.z * K2 * cos(y * K2 + 2.1); }
float hW(float y) { return uGeo.w * (1.0 + 0.16 * sin(y * K3 + 4.0)); }
float across(vec2 p, out vec2 t) {
  float s = p.y;
  for (int k = 0; k < 2; k++) { float m = sl(s); s += ((p.x - cX(s)) * m + (p.y - s)) / (1.0 + m * m); }
  float m = sl(s), inv = inversesqrt(1.0 + m * m);
  t = vec2(m * inv, inv);
  return ((p.x - cX(s)) * inv + (p.y - s) * (-m * inv)) / hW(s);
}
vec3 srgb(vec3 c) { return pow(c, vec3(2.2)); }
// One stone per cell, each its own size, oval and turned its own way, some overlapping and some
// leaving sand between them: returns the height of the highest stone here, its id, how close to
// its rim this point is (0 at the rim, 1 at the crown), and how near the nearest rim is (1 on it).
vec4 stones(vec2 x, float cover) {
  vec2 n = floor(x), f = fract(x);
  float best = 0.0, bid = 0.0, crown = 0.0, near = 9.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = n + vec2(i, j);
    float k = hash12(id + 7.13);
    if (k > cover) continue;
    vec2 c = vec2(i, j) + 0.5 + (hash22(id) - 0.5) * 0.7 - f;
    float ang = hash12(id + 1.7) * 6.2831853;
    vec2 cs = vec2(cos(ang), sin(ang));
    vec2 q = vec2(dot(c, cs), dot(c, vec2(-cs.y, cs.x))) * vec2(1.0, 1.0 + hash12(id + 3.3) * 0.7);
    float rad = 0.3 + 0.24 * hash12(id + 5.5);
    float d = length(q) / rad;
    near = min(near, d);
    if (d < 1.0) {
      float dome = sqrt(1.0 - d * d) * (0.55 + 0.45 * hash12(id + 9.1)) * rad * 2.0;
      if (dome > best) { best = dome; bid = hash12(id + 11.9); crown = 1.0 - d; }
    }
  }
  return vec4(best, bid, crown, near);
}
// smooth pebbles in soft colours: cream, pale grey, blue-grey, warm beige, a little terracotta
// clean stone colours, the kind a game would pick: soft greys, blue-grey, warm beige, slate
vec3 stone(float k) {
  vec3 c = k < .2 ? vec3(.86,.88,.90) : k < .38 ? vec3(.90,.84,.76) : k < .54 ? vec3(.74,.82,.90) : k < .7 ? vec3(.95,.89,.78)
         : k < .84 ? vec3(.70,.74,.79) : vec3(.97,.96,.94);
  return srgb(c * (0.95 + 0.08 * fract(k * 37.1)));
}
// the ground's height (water line at 0), its colour, whether it is a boulder, and the relief on
// it (everything but the channel's own gentle slope, which is what the shading is taken from)
float ground(vec2 p, out vec3 alb, out float rock, out float relief) {
  vec2 t;
  float u = across(p, t), au = abs(u);
  float pool = 0.85 + 0.5 * (fbm(p * 0.007 + 3.1) - 0.5);
  float channel = -max(0.0, 1.0 - u * u) * pool + max(0.0, au - 1.0) * 1.3 + 0.03;
  float h = channel;
  // smooth sand, and a scatter of clean, rounded stones lying on it, all under the water
  alb = srgb(vec3(0.93, 0.87, 0.74)) * (0.97 + 0.05 * vnoise(p * 0.03));
  float under = smoothstep(0.1, 0.3, -channel); // none at the water's edge
  vec4 big = stones(p / 24.0, 0.5);
  vec4 small = stones(p / 11.0 + 31.7, 0.16);
  float hb = big.x * 0.1 * under, hs = small.x * 0.06 * under;
  // a soft contact shadow on the sand round each stone
  alb *= 1.0 - 0.28 * under * max(smoothstep(1.45, 1.0, big.w), smoothstep(1.35, 1.0, small.w) * 0.7);
  if (hs > 0.001) { alb = stone(small.y); h += hs; }
  if (hb > hs && hb > 0.001) { alb = stone(big.y); h += hb - hs; }

  // three big stones, lying just under the surface
  rock = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 s = uStone[i];
    vec2 z = p - s.xy;
    vec2 fd = normalize(uStoneFlow[i].xy + 1e-4);
    vec2 zz = vec2(dot(z, vec2(-fd.y, fd.x)), dot(z, fd) / 1.3);
    float d = length(zz) / s.z;
    if (d < 1.0) {
      float hr = -0.75 + 0.45 * pow(1.0 - d * d, 0.5);
      if (hr > h) {
        h = hr;
        alb = srgb(vec3(0.62, 0.67, 0.73) * (0.94 + 0.06 * float(i)));
      }
    }
  }
  relief = h - channel;
  return h;
}
void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  vec3 alb, tmp; float rock, r2, rel, a, b, c, d;
  float h = ground(p, alb, rock, rel);
  float e = 0.75;
  ground(p + vec2(e, 0), tmp, r2, a); ground(p - vec2(e, 0), tmp, r2, b);
  ground(p + vec2(0, e), tmp, r2, c); ground(p - vec2(0, e), tmp, r2, d);
  vec2 n = -vec2(a - b, c - d) / (2.0 * e) * 40.0;
  vec2 t;
  float u = across(p, t);
  vec2 v = t * ${V0}.0 * max(0.0, 1.0 - 0.72 * u * u);
  // the current parts gently round the big stones below it
  for (int i = 0; i < 3; i++) {
    vec4 s = uStone[i];
    vec2 U = uStoneFlow[i].xy, z = p - s.xy;
    float a2 = s.z * s.z * 0.8, r = dot(z, z);
    if (r < 36.0 * a2) {
      r = max(r, a2);
      float A = z.x * z.x - z.y * z.y, B = 2.0 * z.x * z.y;
      v -= a2 * vec2(U.x * A + U.y * B, U.x * B - U.y * A) / (r * r);
    }
  }
  if (h > 0.0) v = vec2(0.0);
  oA = vec4(alb, h);
  oB = vec4(n, rock, 0.0);
  oC = vec4(v, u, 0.0);
}`;

// Every frame, twice: the ripples. r height, g the height a step ago, b foam. The whole field is
// carried downstream with the current, and dry ground holds it at rest, so waves bounce off it.
const SIM = `#version 300 es
precision highp float;
uniform sampler2D uS, uA, uB, uC;
uniform vec2 uSimSize, uSize;
uniform float uDt;
uniform vec4 uDrop[${MAX_DROPS}];
uniform int uDropN;
out vec4 o;
void main() {
  vec2 uv = gl_FragCoord.xy / uSimSize;
  vec2 vel = texture(uC, uv).xy;
  vec2 suv = uv - vec2(vel.x, -vel.y) * uDt / uSize;
  vec2 e = 1.0 / uSimSize;
  vec4 c = texture(uS, suv);
  float h = (texture(uS, suv + vec2(0, e.y)).r + texture(uS, suv - vec2(0, e.y)).r
           + texture(uS, suv + vec2(e.x, 0)).r + texture(uS, suv - vec2(e.x, 0)).r) * 0.5 - c.g;
  h *= 0.992;
  float foam = c.b * exp(-uDt * 0.8) + texture(uB, uv).w * uDt * 1.6;
  vec2 p = vec2(uv.x, 1.0 - uv.y) * uSize;
  for (int i = 0; i < ${MAX_DROPS}; i++) {
    if (i >= uDropN) break;
    vec4 d = uDrop[i];
    float r = length(p - d.xy);
    if (r < d.z) h += d.w * (0.5 + 0.5 * cos(3.14159265 * r / d.z));
  }
  if (texture(uA, uv).a > -0.005) h = 0.0;
  o = vec4(h, c.r, clamp(foam, 0.0, 1.0), 1.0);
}`;

const RENDER = `#version 300 es
precision highp float;
uniform sampler2D uA, uB, uC, uS;
uniform vec2 uSize, uSimSize;
uniform float uTime, uExposure, uSunUp;
uniform vec3 uSun, uSunCol, uMoon, uMoonCol, uZen, uHor, uAmb, uEye;
uniform vec4 uLeaf[4];     // x, y, angle, length
uniform vec3 uLeafCol[4];
uniform int uLeafN;
in vec2 vUv;
out vec4 o;
${COMMON}
// light focused on the bed by the waves above it
float caustic(vec2 p, float t) {
  vec2 i = p; float c = 1.0; float inten = 0.005;
  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - 3.5 / float(n + 1));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 7.0);
}
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
vec2 toUv(vec2 p) { return vec2(p.x, uSize.y - p.y) / uSize; }
// a leaf along x from its stalk (-0.5) to its tip (0.5): widest a third of the way up, pointed at
// the tip; returned as a distance in leaf units, negative inside
float leafSd(vec2 l) {
  float t = clamp(l.x + 0.5, 0.0, 1.0);
  float w = 0.24 * pow(sin(3.14159 * pow(t, 0.8)), 0.9);
  float body = abs(l.y) - w;
  float ends = abs(l.x) - 0.5;
  float stalk = max(abs(l.y) - 0.018, max(l.x + 0.5 - 0.0, -(l.x + 0.66)));
  return min(max(body, ends), stalk);
}
vec3 lightOn(vec3 n) {
  return uSunCol * max(dot(n, uSun), 0.0) * smoothstep(-0.02, 0.1, uSun.z) + uMoonCol * max(dot(n, uMoon), 0.0) + uAmb * (0.55 + 0.45 * n.z);
}
void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  vec4 A = texture(uA, vUv), B = texture(uB, vUv), C = texture(uC, vUv);
  float h = A.a;
  // only the water is drawn: it meets the page at its own edge
  float alpha = smoothstep(0.004, -0.006, h);
  if (alpha <= 0.002) { o = vec4(0.0); return; }

  // ripples
  vec2 se = 1.0 / uSimSize;
  vec4 S = texture(uS, vUv);
  vec2 rs = vec2(texture(uS, vUv + vec2(se.x, 0)).r - texture(uS, vUv - vec2(se.x, 0)).r,
                 texture(uS, vUv - vec2(0, se.y)).r - texture(uS, vUv + vec2(0, se.y)).r);

  // small waves carried by the current: two phases of a flow map, cross-faded
  vec2 fl = C.xy;
  float ph0 = fract(uTime * 0.22), ph1 = fract(uTime * 0.22 + 0.5);
  float w0 = 1.0 - abs(2.0 * ph0 - 1.0);
  vec2 q0 = p - fl * ph0 * 4.5, q1 = p - fl * ph1 * 4.5 + vec2(41.0, 17.0);
  vec2 g0 = noised(q0 * 0.065).yz * 0.55 + noised(q0 * 0.17 + 5.0).yz * 0.28;
  vec2 g1 = noised(q1 * 0.065).yz * 0.55 + noised(q1 * 0.17 + 5.0).yz * 0.28;
  float spd = clamp(length(fl) / 38.0, 0.0, 1.5);
  float depth = max(0.0, -h);
  vec2 slope = (g0 * w0 + g1 * (1.0 - w0)) * (0.05 + 0.15 * spd) + rs * 9.0 * smoothstep(0.0, 0.08, depth);
  slope += noised(p * 0.11 + vec2(uTime * 0.35, uTime * 0.2)).yz * 0.018;
  vec3 N = normalize(vec3(-slope, 1.0));

  // the bed, seen through the moving surface, softer the deeper it lies
  vec2 rp = p - slope * depth * 14.0;
  float blur = clamp(depth * 0.7, 0.0, 1.0);
  vec4 Ar = textureLod(uA, toUv(rp), blur), Br = textureLod(uB, toUv(rp), blur);
  float dr = max(0.0, -Ar.a);
  vec3 nb = normalize(vec3(Br.xy, 1.0));
  vec2 cq0 = rp - fl * ph0 * 4.5, cq1 = rp - fl * ph1 * 4.5 + vec2(41.0, 17.0);
  float ca = caustic(cq0 * 0.045 - 250.0, uTime * 0.5) * w0 + caustic(cq1 * 0.045 - 250.0, uTime * 0.5) * (1.0 - w0);
  // game-style shading: a lit side and a shaded side with a soft step between, and a small glint
  vec3 Ls = normalize(uSun + vec3(0.0, 0.0, 0.6));
  float lam = smoothstep(-0.05, 0.35, dot(nb, Ls));
  vec3 lightB = (uSunCol * smoothstep(-0.02, 0.1, uSun.z) + uMoonCol) * mix(0.55, 1.0, lam) + uAmb;
  vec3 bed = Ar.rgb * (lightB + uSunCol * min(ca, 1.5) * 0.9 * exp(-dr * 1.0) * smoothstep(0.0, 0.3, uSun.z));
  bed += (uSunCol * smoothstep(-0.02, 0.1, uSun.z) + uMoonCol) * pow(max(dot(reflect(-uEye, nb), Ls), 0.0), 24.0) * 0.32 * step(0.02, 1.0 - nb.z);
  // clear water: aqua over the shallows, a deep fresh blue where it is deeper
  float dt = dr + 0.16;
  vec3 T = exp(-vec3(1.3, 0.45, 0.13) * dt * 2.8);
  vec3 scat = vec3(0.01, 0.06, 0.17) * (uAmb * 4.0 + uSunCol * uSunUp * 0.55);
  vec3 under = bed * T + scat * (1.0 - T);

  // the surface: the sky it reflects, and the sun or moon where it catches them
  vec3 R = reflect(-uEye, N);
  vec3 sky = mix(uHor, uZen, pow(clamp(R.z, 0.0, 1.0), 0.55));
  float F = min(1.0, (0.02 + 0.98 * pow(1.0 - max(dot(N, uEye), 0.0), 5.0)) * 1.6);
  float sd = max(dot(R, uSun), 0.0), md = max(dot(R, uMoon), 0.0);
  vec3 spec = uSunCol * (pow(sd, 1400.0) * 90.0 + pow(sd, 90.0) * 0.35) * smoothstep(-0.05, 0.05, uSun.z)
            + uMoonCol * (pow(md, 900.0) * 60.0 + pow(md, 60.0) * 0.25) * smoothstep(-0.05, 0.05, uMoon.z);
  vec3 water = mix(under, sky, F) + spec;

  // foam behind the rocks, where it has been stirred, and in a lace along the edges
  float fn = (vnoise(q0 * 0.35) * 0.6 + vnoise(q0 * 0.9 + 3.0) * 0.4) * w0 + (vnoise(q1 * 0.35) * 0.6 + vnoise(q1 * 0.9 + 3.0) * 0.4) * (1.0 - w0);
  float shore = max(smoothstep(0.03, 0.012, depth), smoothstep(0.09, 0.0, depth) * smoothstep(0.45, 0.75, fn) * 0.7);
  float foam = clamp(smoothstep(0.1, 0.9, S.b * 1.6 * (0.4 + fn)) + shore * 0.7, 0.0, 1.0);
  vec3 foamCol = uSunCol * max(uSun.z, 0.0) * 0.95 + uAmb * 1.4 + uMoonCol * 0.6;
  water = mix(water, foamCol, foam * 0.8);

  vec3 col = water;

  // leaves: their shadows, then the leaves themselves
  vec2 so = -uSun.xy / max(uSun.z, 0.3) * 3.0;
  for (int i = 0; i < 4; i++) {
    if (i >= uLeafN) break;
    vec4 lf = uLeaf[i];
    vec2 d = p - lf.xy - so;
    vec2 l = vec2(cos(lf.z) * d.x + sin(lf.z) * d.y, -sin(lf.z) * d.x + cos(lf.z) * d.y) / lf.w;
    col *= 1.0 - 0.4 * uSunUp * smoothstep(1.5, -1.5, leafSd(l) * lf.w);
  }
  for (int i = 0; i < 4; i++) {
    if (i >= uLeafN) break;
    vec4 lf = uLeaf[i];
    vec2 d = p - lf.xy;
    vec2 l = vec2(cos(lf.z) * d.x + sin(lf.z) * d.y, -sin(lf.z) * d.x + cos(lf.z) * d.y) / lf.w;
    float cov = smoothstep(0.7, -0.7, leafSd(l) * lf.w);
    if (cov <= 0.0) continue;
    vec3 lc = uLeafCol[i] * (0.9 + 0.15 * vnoise(l * 7.0)) * (1.0 + 0.2 * smoothstep(0.2, -0.3, l.x));
    float vein = max(smoothstep(0.02, 0.0, abs(l.y)) * step(-0.5, l.x) * step(l.x, 0.42),
                     smoothstep(0.8, 1.0, sin((l.x - abs(l.y) * 1.2) * 30.0)) * 0.35 * step(abs(l.y), 0.2));
    lc = mix(lc, lc * 0.72, vein);
    vec3 nl = normalize(vec3(-sin(lf.z) * l.y, cos(lf.z) * l.y, 1.4));
    vec3 lit = lc * lightOn(nl) + uSunCol * pow(max(dot(reflect(-uEye, nl), uSun), 0.0), 40.0) * 0.12;
    col = mix(col, lit, cov);
  }

  col = pow(aces(col * uExposure), vec3(1.0 / 2.2));
  o = vec4(col * alpha, alpha);
}`;

// ---------------------------------------------------------------------------------------------
// The engine
// ---------------------------------------------------------------------------------------------

type Leaf = { x: number; y: number; vx: number; vy: number; a: number; va: number; size: number; color: Vec3; away: number };
type Push = { x: number; y: number; vx: number; vy: number; age: number };
type Stone = { x: number; y: number; r: number; ux: number; uy: number };
type Drop = [number, number, number, number];

const LEAF_COLORS = ['#7fa650', '#e0b44a', '#d9853b', '#9cbf5c'].map(lin);

function runStream(canvas: HTMLCanvasElement, still: boolean) {
  const glc = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
  if (!glc || !glc.getExtension('EXT_color_buffer_float')) return { destroy() {} };
  const gl = glc;
  const rand = rng(7);

  // ---- programs ----
  function shader(type: number, src: string) {
    const s = gl.createShader(type) as WebGLShader;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(frag: string) {
    const p = gl.createProgram() as WebGLProgram;
    gl.attachShader(p, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, shader(gl.FRAGMENT_SHADER, frag));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p));
    const locs = new Map<string, WebGLUniformLocation | null>();
    const loc = (n: string) => {
      if (!locs.has(n)) locs.set(n, gl.getUniformLocation(p, n));
      return locs.get(n) ?? null;
    };
    return { p, loc };
  }
  const bake = program(BAKE);
  const sim = program(SIM);
  const draw = program(RENDER);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const textures: WebGLTexture[] = [];
  const framebuffers: WebGLFramebuffer[] = [];
  function texture(w: number, h: number, levels = 1) {
    const t = gl.createTexture() as WebGLTexture;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texStorage2D(gl.TEXTURE_2D, levels, gl.RGBA16F, w, h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, levels > 1 ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    textures.push(t);
    return t;
  }
  function framebuffer(ts: WebGLTexture[]) {
    const f = gl.createFramebuffer() as WebGLFramebuffer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    ts.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0));
    gl.drawBuffers(ts.map((_, i) => gl.COLOR_ATTACHMENT0 + i));
    framebuffers.push(f);
    return f;
  }
  function freeTargets() {
    textures.splice(0).forEach((t) => gl.deleteTexture(t));
    framebuffers.splice(0).forEach((f) => gl.deleteFramebuffer(f));
  }

  // ---- geometry (CSS px, y down) ----
  let W = 0;
  let H = 0;
  let live = false;
  let cx0 = 0;
  let a1 = 0;
  let a2 = 0;
  let hw0 = 0;
  const centerX = (y: number) => cx0 + a1 * Math.sin(y * K1 + 0.9) + a2 * Math.sin(y * K2 + 2.1);
  const slopeAt = (y: number) => a1 * K1 * Math.cos(y * K1 + 0.9) + a2 * K2 * Math.cos(y * K2 + 2.1);
  const halfW = (y: number) => hw0 * (1 + 0.16 * Math.sin(y * K3 + 4));
  const F = { tx: 0, ty: 1, nx: 1, ny: 0, u: 0, hw: 1 };
  function frameAt(x: number, y: number) {
    let s = y;
    for (let k = 0; k < 2; k++) {
      const m = slopeAt(s);
      s += ((x - centerX(s)) * m + (y - s)) / (1 + m * m);
    }
    const m = slopeAt(s);
    const inv = 1 / Math.sqrt(1 + m * m);
    F.tx = m * inv;
    F.ty = inv;
    F.nx = inv;
    F.ny = -m * inv;
    F.hw = halfW(s);
    F.u = ((x - centerX(s)) * F.nx + (y - s) * F.ny) / F.hw;
  }
  function placeAt(s: number, u: number): [number, number] {
    const m = slopeAt(s);
    const inv = 1 / Math.sqrt(1 + m * m);
    const d = u * halfW(s);
    return [centerX(s) + inv * d, s - m * inv * d];
  }

  let stones: Stone[] = [];
  const onRock = (x: number, y: number, pad = 0) => stones.some((s) => Math.hypot(x - s.x, y - s.y) < s.r * 0.82 + pad);
  const inWater = (x: number, y: number) => {
    frameAt(x, y);
    return Math.abs(F.u) < 0.95 && !onRock(x, y);
  };

  // the current, for the leaves: the same as the one baked for the ripples, plus the cursor's pushes
  const pushes: Push[] = [];
  const V = { x: 0, y: 0 };
  function flowAt(x: number, y: number) {
    frameAt(x, y);
    const u = F.u;
    const s = V0 * Math.max(0, 1 - 0.72 * u * u);
    V.x = F.tx * s;
    V.y = F.ty * s;
    for (const st of stones) {
      const zx = x - st.x;
      const zy = y - st.y;
      const a2r = st.r * st.r * 0.8;
      let r2 = zx * zx + zy * zy;
      if (r2 > 36 * a2r) continue;
      r2 = Math.max(r2, a2r);
      const A = zx * zx - zy * zy;
      const B = 2 * zx * zy;
      V.x -= (a2r * (st.ux * A + st.uy * B)) / (r2 * r2);
      V.y -= (a2r * (st.ux * B - st.uy * A)) / (r2 * r2);
    }
    for (const p of pushes) {
      const dx = x - p.x;
      const dy = y - p.y;
      const r2 = dx * dx + dy * dy;
      if (r2 > 3000) continue;
      const k = Math.exp(-r2 / 700) * (1 - p.age / 0.8) * 0.8;
      V.x += p.vx * k;
      V.y += p.vy * k;
    }
  }

  // ---- targets ----
  let bakeScale = 1;
  let renderScale = 1;
  let simW = 1;
  let simH = 1;
  let texA: WebGLTexture | null = null;
  let texB: WebGLTexture | null = null;
  let texC: WebGLTexture | null = null;
  let bakeFb: WebGLFramebuffer | null = null;
  const state: WebGLTexture[] = [];
  const stateFb: WebGLFramebuffer[] = [];
  let cur = 0;

  function layout() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    live = w >= 280 && h >= 240;
    if (!live || (w === W && h === H)) return;
    W = w;
    H = h;
    const dpr = window.devicePixelRatio || 1;
    renderScale = Math.min(dpr, 1.25);
    bakeScale = Math.min(dpr, 1.5);
    canvas.width = Math.round(W * renderScale);
    canvas.height = Math.round(H * renderScale);

    hw0 = clamp(W * 0.27, 90, 132);
    const rim = hw0 * 1.16;
    cx0 = (W + 26 - 34) / 2;
    const room = Math.max(0, cx0 - rim - 26);
    a1 = Math.min(W * 0.15, 84);
    a2 = a1 * 0.25;
    if (a1 + a2 > room) {
      const k = room / (a1 + a2);
      a1 *= k;
      a2 *= k;
    }
    const scale = hw0 / 85;
    stones = STONES.map(([fy, u, r]) => {
      const [x, y] = placeAt(fy * H, u);
      frameAt(x, y);
      const s = V0 * Math.max(0, 1 - 0.72 * F.u * F.u);
      return { x, y, r: r * scale, ux: F.tx * s, uy: F.ty * s };
    });

    freeTargets();
    const bw = Math.round(W * bakeScale);
    const bh = Math.round(H * bakeScale);
    texA = texture(bw, bh, 4);
    texB = texture(bw, bh, 4);
    texC = texture(bw, bh);
    bakeFb = framebuffer([texA, texB, texC]);
    simW = Math.ceil(W / 2);
    simH = Math.ceil(H / 2);
    state.length = 0;
    stateFb.length = 0;
    for (let i = 0; i < 2; i++) {
      const t = texture(simW, simH);
      state.push(t);
      stateFb.push(framebuffer([t]));
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    // bake the ground
    gl.bindFramebuffer(gl.FRAMEBUFFER, bakeFb);
    gl.viewport(0, 0, bw, bh);
    gl.useProgram(bake.p);
    gl.uniform2f(bake.loc('uSize'), W, H);
    gl.uniform4f(bake.loc('uGeo'), cx0, a1, a2, hw0);
    gl.uniform4fv(bake.loc('uStone'), stones.flatMap((s) => [s.x, s.y, s.r, 0]));
    gl.uniform4fv(bake.loc('uStoneFlow'), stones.flatMap((s) => [s.ux, s.uy, 0, 0]));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    for (const t of [texA, texB]) {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    if (leaves.length === 0) seedLeaves();
  }

  // ---- leaves ----
  const leaves: Leaf[] = [];
  function floatIn(l: Leaf, y: number) {
    const [x, yy] = placeAt(y, (rand() - 0.5) * 0.8);
    l.x = x;
    l.y = yy;
    flowAt(x, yy);
    l.vx = V.x;
    l.vy = V.y;
    l.away = 0;
  }
  function seedLeaves() {
    [0.3, 0.62, 0.9].forEach((fy, i) => {
      const l: Leaf = { x: 0, y: 0, vx: 0, vy: 0, a: rand() * TAU, va: 0, size: 30 + rand() * 6, color: LEAF_COLORS[i % LEAF_COLORS.length], away: 0 };
      floatIn(l, fy * H);
      leaves.push(l);
    });
  }
  function collide(l: Leaf, cx: number, cy: number, R: number, vx: number, vy: number) {
    const dx = l.x - cx;
    const dy = l.y - cy;
    const d = Math.hypot(dx, dy);
    if (d >= R || d === 0) return;
    const nx = dx / d;
    const ny = dy / d;
    l.x = cx + nx * R;
    l.y = cy + ny * R;
    const rel = (l.vx - vx) * nx + (l.vy - vy) * ny;
    if (rel >= 0) return;
    l.vx -= nx * rel * 1.4;
    l.vy -= ny * rel * 1.4;
    l.va += (nx * (l.vy - vy) - ny * (l.vx - vx)) * 0.015;
  }
  function stepLeaf(l: Leaf, dt: number) {
    if (l.away > 0) {
      if ((l.away -= dt) <= 0) floatIn(l, -24);
      return;
    }
    flowAt(l.x, l.y);
    const k = 1 - Math.exp(-dt * 2.2);
    l.vx += (V.x - l.vx) * k;
    l.vy += (V.y - l.vy) * k;
    // turn with the water's own spin, and a little on their own
    flowAt(l.x + 3, l.y);
    const a = V.y;
    flowAt(l.x - 3, l.y);
    const b = V.y;
    flowAt(l.x, l.y + 3);
    const c = V.x;
    flowAt(l.x, l.y - 3);
    const d = V.x;
    const curl = (a - b) / 6 - (c - d) / 6;
    l.va += (curl * 0.6 + 0.15 - l.va) * (1 - Math.exp(-dt * 2));
    l.a += l.va * dt;
    l.x += l.vx * dt;
    l.y += l.vy * dt;
    for (const s of stones) collide(l, s.x, s.y, s.r * 0.85 + l.size * 0.35, 0, 0);
    if (finger.wet) collide(l, finger.x, finger.y, 10 + l.size * 0.35, finger.vx, finger.vy);
    frameAt(l.x, l.y);
    if (Math.abs(F.u) > 0.8) {
      const sgn = Math.sign(F.u);
      const push = (Math.abs(F.u) - 0.8) * F.hw * sgn;
      l.x -= F.nx * push;
      l.y -= F.ny * push;
      const vn = l.vx * F.nx + l.vy * F.ny;
      if (vn * sgn > 0) {
        l.vx -= F.nx * vn * 1.3;
        l.vy -= F.ny * vn * 1.3;
      }
    }
    if (l.y > H + 30 || l.y < -60) l.away = 3 + rand() * 7;
  }

  // ---- the pointer ----
  const pointer = { x: -1e4, y: -1e4, inside: false };
  const finger = { x: 0, y: 0, vx: 0, vy: 0, wet: false, px: 0, py: 0 };
  const drops: Drop[] = [];
  const addDrop = (x: number, y: number, r: number, s: number) => {
    if (drops.length < MAX_DROPS) drops.push([x, y, r, s]);
  };
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    const t = e.target instanceof Element ? e.target : null;
    pointer.inside =
      !!t && !!t.closest('main') && !t.closest(INTERACTIVE) && pointer.x >= 0 && pointer.x <= W && pointer.y >= 0 && pointer.y <= H;
  };
  const onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) pointer.inside = false;
  };
  const onUp = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') pointer.inside = false;
  };
  const onBlur = () => {
    pointer.inside = false;
  };
  const onDown = (e: PointerEvent) => {
    if (!live || still || e.button !== 0) return;
    onMove(e);
    if (!pointer.inside) return;
    const { x, y } = pointer;
    for (const l of leaves) {
      if (l.away > 0 || Math.hypot(l.x - x, l.y - y) > l.size * 0.6) continue;
      const dx = l.x - x || 0.1;
      const dy = l.y - y;
      const d = Math.hypot(dx, dy) || 1;
      l.vx += (dx / d) * 60;
      l.vy += (dy / d) * 60;
      l.va += (dx > 0 ? 1 : -1) * 5;
      addDrop(l.x, l.y, 9, 0.9);
      plip(0.8, 0.06);
      return;
    }
    if (!inWater(x, y)) return;
    addDrop(x, y, 11, -1.4);
    plip(1, 0.08);
    plip(1.5, 0.025, 0.32);
  };

  // ---- a frame ----
  let time = 0;
  let sky = skyAt(clockOverride() ?? new Date());
  let skyTarget = sky;
  let skyCheck = 0;
  let nextAmbient = 1.5;

  function step(dt: number) {
    time += dt;
    // the sky, eased towards where the clock says it is
    if ((skyCheck -= dt) <= 0) {
      skyCheck = 20;
      skyTarget = skyAt(clockOverride() ?? new Date());
    }
    sky = lerpSky(sky, skyTarget, 1 - Math.exp(-dt * 0.5));

    // the finger
    const wet = pointer.inside && inWater(pointer.x, pointer.y);
    if (wet && !finger.wet) {
      finger.x = finger.px = pointer.x;
      finger.y = finger.py = pointer.y;
      finger.vx = finger.vy = 0;
      addDrop(pointer.x, pointer.y, 8, 0.9);
    }
    finger.wet = wet;
    if (wet) {
      const k = 1 - Math.exp(-dt * 14);
      finger.vx += ((pointer.x - finger.x) / dt - finger.vx) * k;
      finger.vy += ((pointer.y - finger.y) / dt - finger.vy) * k;
      finger.x = pointer.x;
      finger.y = pointer.y;
      const fs = Math.hypot(finger.vx, finger.vy);
      // held still, it sheds a wake; moving, it trails ripples behind it
      addDrop(finger.x, finger.y, 5, 0.09 * Math.sin(time * 24));
      const run = Math.hypot(finger.x - finger.px, finger.y - finger.py);
      if (run > 6) {
        addDrop(finger.x, finger.y, 6, 0.25 + Math.min(fs, 800) / 1400);
        finger.px = finger.x;
        finger.py = finger.y;
      }
      if (fs > 25) {
        const kk = Math.min(0.4, 220 / fs);
        pushes.push({ x: finger.x, y: finger.y, vx: finger.vx * kk, vy: finger.vy * kk, age: 0 });
        if (pushes.length > 40) pushes.shift();
      }
    } else {
      finger.vx *= 0.9;
      finger.vy *= 0.9;
    }
    for (let i = pushes.length - 1; i >= 0; i--) if ((pushes[i].age += dt) >= 0.8) pushes.splice(i, 1);

    // now and then something touches the surface
    if ((nextAmbient -= dt) <= 0) {
      nextAmbient = 1.5 + rand() * 3.5;
      const [x, y] = placeAt(H * (0.05 + rand() * 0.9), (rand() - 0.5) * 1.4);
      if (!onRock(x, y, 6)) addDrop(x, y, 3.5, 0.5 + rand() * 0.4);
    }
    for (const l of leaves) stepLeaf(l, dt);
  }

  function simulate(dt: number) {
    gl.useProgram(sim.p);
    gl.viewport(0, 0, simW, simH);
    gl.uniform2f(sim.loc('uSimSize'), simW, simH);
    gl.uniform2f(sim.loc('uSize'), W, H);
    gl.uniform1f(sim.loc('uDt'), dt / 2);
    for (let pass = 0; pass < 2; pass++) {
      const flat = new Float32Array(MAX_DROPS * 4);
      const n = pass === 0 ? drops.length : 0;
      for (let i = 0; i < n; i++) flat.set(drops[i], i * 4);
      gl.uniform4fv(sim.loc('uDrop'), flat);
      gl.uniform1i(sim.loc('uDropN'), n);
      gl.bindFramebuffer(gl.FRAMEBUFFER, stateFb[1 - cur]);
      bindTextures(sim, [['uS', state[cur]], ['uA', texA], ['uB', texB], ['uC', texC]]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      cur = 1 - cur;
    }
    drops.length = 0;
  }

  function bindTextures(prog: ReturnType<typeof program>, list: [string, WebGLTexture | null][]) {
    list.forEach(([name, t], i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.uniform1i(prog.loc(name), i);
    });
  }

  function render() {
    if (!live) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(draw.p);
    bindTextures(draw, [['uA', texA], ['uB', texB], ['uC', texC], ['uS', state[cur]]]);
    gl.uniform2f(draw.loc('uSize'), W, H);
    gl.uniform2f(draw.loc('uSimSize'), simW, simH);
    gl.uniform1f(draw.loc('uTime'), time % 3600);
    gl.uniform1f(draw.loc('uExposure'), sky.exposure);
    gl.uniform1f(draw.loc('uSunUp'), sky.sunUp);
    gl.uniform3fv(draw.loc('uSun'), sky.sun);
    gl.uniform3fv(draw.loc('uSunCol'), sky.sunCol);
    gl.uniform3fv(draw.loc('uMoon'), sky.moon);
    gl.uniform3fv(draw.loc('uMoonCol'), sky.moonCol);
    gl.uniform3fv(draw.loc('uZen'), sky.zen);
    gl.uniform3fv(draw.loc('uHor'), sky.hor);
    gl.uniform3fv(draw.loc('uAmb'), sky.amb);
    // look down from a little way off the light, so its glitter can show
    const light = sky.sun[2] > -0.05 ? sky.sun : sky.moon;
    const lh = Math.hypot(light[0], light[1]) || 1;
    const ex = (-light[0] / lh) * 0.32;
    const ey = (-light[1] / lh) * 0.32;
    const el = Math.hypot(ex, ey, 1);
    gl.uniform3f(draw.loc('uEye'), ex / el, ey / el, 1 / el);
    const shown = leaves.filter((l) => l.away <= 0);
    gl.uniform4fv(draw.loc('uLeaf'), new Float32Array(16).map((_, i) => {
      const l = shown[i >> 2];
      if (!l) return 0;
      return [l.x, l.y, l.a, l.size][i & 3];
    }));
    gl.uniform3fv(draw.loc('uLeafCol'), new Float32Array(12).map((_, i) => shown[Math.floor(i / 3)]?.color[i % 3] ?? 0));
    gl.uniform1i(draw.loc('uLeafN'), shown.length);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // ---- loop ----
  let raf = 0;
  let last = 0;
  let slow = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    const t = now / 1000;
    const dt = t - last;
    if (dt < 1 / 75) return; // high-refresh screens still draw at 60
    last = t;
    if (!live) return;
    // if the frames are dragging, draw fewer pixels
    slow = dt > 0.024 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 90 && renderScale > 0.6) {
      slow = 0;
      renderScale *= 0.85;
      canvas.width = Math.round(W * renderScale);
      canvas.height = Math.round(H * renderScale);
    }
    step(Math.min(dt, 1 / 30));
    simulate(Math.min(dt, 1 / 30));
    render();
  };
  const start = () => {
    if (raf || still || document.hidden || !live) return;
    last = performance.now() / 1000;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const onVisibility = () => (document.hidden || !live ? stop() : start());
  const onLost = (e: Event) => {
    e.preventDefault();
    stop();
    live = false;
  };

  const ro = new ResizeObserver(() => {
    layout();
    render();
    if (!still) onVisibility();
  });
  ro.observe(canvas);
  canvas.addEventListener('webglcontextlost', onLost);
  layout();
  if (still) {
    render();
  } else {
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('blur', onBlur);
    document.addEventListener('pointerout', onOut);
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();
  }

  return {
    destroy() {
      stop();
      ro.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('visibilitychange', onVisibility);
      freeTargets();
      [bake, sim, draw].forEach((pr) => gl.deleteProgram(pr.p));
      gl.deleteBuffer(buf);
      gl.deleteVertexArray(vao);
    },
  };
}

// Runs down the right-hand side of every page, from the top of the window to the bottom, in the
// column the shell keeps free for it (reaching 2rem into the page's own padding beside it). It
// lives in the shell, so going from page to page never remounts it: the water carries on and the
// leaves are still where you pushed them. Below xl there is no room for it, and nothing runs.
export default function WaterStream() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = runStream(canvas, reduced);
    return () => engine.destroy();
  }, [reduced]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-y-0 right-0 hidden xl:block"
      style={{ width: 'calc(var(--stream-w) + 2rem)' }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
