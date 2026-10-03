/* Colour arithmetic for the creature drawings: every creature is painted from
   a few base colours, and its light, shade and outline are mixed from them so
   the whole cast is shaded the same way. Shade mixes toward a deep plum rather
   than black, which keeps shadows warm, the way a cartoon's are. */

const DEEP = '#2a1238';

function parse(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h.slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

export function mix(a: string, b: string, t: number): string {
  const pa = parse(a);
  const pb = parse(b);
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

export const lighten = (c: string, t: number) => mix(c, '#ffffff', t);
export const darken = (c: string, t: number) => mix(c, DEEP, t);

export interface Pal {
  body: string;
  belly: string;
  /** Horns, frills, plates, manes, fins: the thing each one is known for. */
  accent: string;
  /** Spots, stripes and the inside of the accent. */
  accent2: string;
  /** The coloured ring in the eye. */
  iris: string;
}

/** The colours a drawing actually uses, worked out from its palette. */
export interface Paint extends Pal {
  hi: string;
  lo: string;
  line: string;
  accentLine: string;
}

function toHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const [R, G, B] = [r / 255, g / 255, b / 255];
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === R ? (G - B) / d + (G < B ? 6 : 0) : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  return [h * 60, s, l];
}

function fromHsl([h, s, l]: [number, number, number]): string {
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hueShift(hex: string, deg: number): string {
  const [h, s, l] = toHsl(parse(hex));
  return fromHsl([(h + deg + 360) % 360, Math.min(1, s * 1.1), l]);
}

/** A shiny one: the same creature in new colours. The face keeps its own. */
export function shinyPal(p: Pal): Pal {
  return { ...p, body: hueShift(p.body, 150), accent: hueShift(p.accent, 150), accent2: hueShift(p.accent2, 150), iris: hueShift(p.iris, 150) };
}

export function paintOf(p: Pal): Paint {
  return {
    ...p,
    hi: lighten(p.body, 0.42),
    lo: darken(p.body, 0.22),
    line: darken(p.body, 0.58),
    accentLine: darken(p.accent, 0.5),
  };
}

/** A rounded spike pointing along `deg` (0 = right, -90 = up), base centred on (x, y). */
export function spikePath(x: number, y: number, deg: number, len: number, base: number): string {
  const a = (deg * Math.PI) / 180;
  const nx = Math.cos(a);
  const ny = Math.sin(a);
  const px = -ny;
  const py = nx;
  const tip = [x + nx * len, y + ny * len];
  const l = [x + px * base / 2, y + py * base / 2];
  const r = [x - px * base / 2, y - py * base / 2];
  const cl = [x + px * base * 0.28 + nx * len * 0.62, y + py * base * 0.28 + ny * len * 0.62];
  const cr = [x - px * base * 0.28 + nx * len * 0.62, y - py * base * 0.28 + ny * len * 0.62];
  const f = (n: number) => n.toFixed(1);
  return `M ${f(l[0])} ${f(l[1])} Q ${f(cl[0])} ${f(cl[1])} ${f(tip[0])} ${f(tip[1])} Q ${f(cr[0])} ${f(cr[1])} ${f(r[0])} ${f(r[1])} Z`;
}

/** A four-pointed twinkle centred on (x, y). */
export function twinklePath(x: number, y: number, r: number): string {
  const k = r * 0.22;
  return `M ${x} ${y - r} Q ${x + k} ${y - k} ${x + r} ${y} Q ${x + k} ${y + k} ${x} ${y + r} Q ${x - k} ${y + k} ${x - r} ${y} Q ${x - k} ${y - k} ${x} ${y - r} Z`;
}

/** A plate or leaf: base on (x, y), pointing along deg. */
export function leaf(x: number, y: number, deg: number, h: number, w: number): string {
  const a = (deg * Math.PI) / 180;
  const n = [Math.cos(a), Math.sin(a)];
  const p = [-n[1], n[0]];
  const pt = (along: number, side: number) => `${(x + n[0] * along + p[0] * side).toFixed(1)} ${(y + n[1] * along + p[1] * side).toFixed(1)}`;
  return `M ${pt(-h * 0.08, 0)} Q ${pt(h * 0.5, w * 0.78)} ${pt(h, 0)} Q ${pt(h * 0.5, -w * 0.78)} ${pt(-h * 0.08, 0)} Z`;
}
