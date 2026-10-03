import { darken, lighten, twinklePath, type Paint } from './color';
import { far, ivory, skin } from './fills';

/* The pieces every creature is built from: the gradients it is painted with,
   and the face. The face is the same family on all of them (big eyes with two
   catch-lights, pink cheeks, a small mouth), which is what makes a T. rex and
   a jellyfish look like they belong in the same box of toys. */

export interface ArtProps { u: string; k: Paint }

export function Defs({ u, k }: ArtProps) {
  return (
    <defs>
      <radialGradient id={`${u}b`} cx=".34" cy=".28" r=".85">
        <stop offset="0" stopColor={k.hi} />
        <stop offset=".5" stopColor={k.body} />
        <stop offset="1" stopColor={k.lo} />
      </radialGradient>
      <radialGradient id={`${u}a`} cx=".34" cy=".28" r=".85">
        <stop offset="0" stopColor={lighten(k.accent, 0.45)} />
        <stop offset=".55" stopColor={k.accent} />
        <stop offset="1" stopColor={darken(k.accent, 0.18)} />
      </radialGradient>
      <radialGradient id={`${u}c`} cx=".34" cy=".28" r=".85">
        <stop offset="0" stopColor={lighten(k.accent2, 0.45)} />
        <stop offset=".55" stopColor={k.accent2} />
        <stop offset="1" stopColor={darken(k.accent2, 0.18)} />
      </radialGradient>
      <linearGradient id={`${u}h`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fffdf3" />
        <stop offset=".6" stopColor="#f6e7c2" />
        <stop offset="1" stopColor="#dcc28c" />
      </linearGradient>
      <radialGradient id={`${u}i`} cx=".5" cy=".38" r=".62">
        <stop offset="0" stopColor={lighten(k.iris, 0.45)} />
        <stop offset="1" stopColor={k.iris} />
      </radialGradient>
      <radialGradient id={`${u}y`} cx=".4" cy=".3" r=".8">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor={k.belly} />
      </radialGradient>
    </defs>
  );
}

/** A big cartoon eye looking a little toward the viewer's right. */
export function Eye({ u, k, x, y, r, look = [1.1, 0.9] }: ArtProps & { x: number; y: number; r: number; look?: [number, number] }) {
  const ix = x + look[0];
  const iy = y + look[1];
  return (
    <g className="cr-eye">
      <ellipse cx={x} cy={y} rx={r} ry={r * 1.1} fill="#fff" stroke={k.line} strokeWidth={2.2} />
      <circle cx={ix} cy={iy} r={r * 0.72} fill={`url(#${u}i)`} />
      <circle cx={ix} cy={iy} r={r * 0.4} fill="#1c0f2c" />
      <circle cx={ix - r * 0.3} cy={iy - r * 0.34} r={r * 0.28} fill="#fff" />
      <circle cx={ix + r * 0.28} cy={iy + r * 0.27} r={r * 0.12} fill="#fff" opacity={0.9} />
    </g>
  );
}

export function Cheek({ x, y, r = 7 }: { x: number; y: number; r?: number }) {
  return <ellipse cx={x} cy={y} rx={r} ry={r * 0.6} fill="#ff86b4" opacity={0.62} />;
}

export function Smile({ k, x, y, w }: { k: Paint; x: number; y: number; w: number }) {
  return <path d={`M ${x - w} ${y} Q ${x} ${y + w * 0.85} ${x + w} ${y}`} fill="none" stroke={k.line} strokeWidth={2.8} strokeLinecap="round" />;
}

/** An open, happy mouth with a tongue and, for the meat-eaters, two small teeth. */
export function Grin({ u, k, x, y, w, teeth = 0 }: ArtProps & { x: number; y: number; w: number; teeth?: number }) {
  const d = `M ${x - w} ${y} Q ${x} ${y + w * 1.25} ${x + w} ${y} Q ${x} ${y + w * 0.3} ${x - w} ${y} Z`;
  const tooth = (s: number) => {
    const tx = x + w * (2 * s - 1);
    const ty = y + 0.6 * w * s * (1 - s);
    return `M ${tx - 2.6} ${ty - 0.4} L ${tx} ${ty + 5} L ${tx + 2.6} ${ty - 0.4} Z`;
  };
  return (
    <g>
      <clipPath id={`${u}m${Math.round(x)}`}><path d={d} /></clipPath>
      <path d={d} fill="#7a2338" stroke={k.line} strokeWidth={2.4} strokeLinejoin="round" />
      <ellipse cx={x + w * 0.12} cy={y + w * 0.66} rx={w * 0.46} ry={w * 0.26} fill="#ff7d96" clipPath={`url(#${u}m${Math.round(x)})`} />
      {teeth > 0 && <path d={tooth(0.22)} fill="#fff" />}
      {teeth > 1 && <path d={tooth(0.78)} fill="#fff" />}
    </g>
  );
}

/** The soft white shine that makes a surface look round and glossy. */
export function Gloss({ x, y, rx, ry, rot = -20, o = 0.38 }: { x: number; y: number; rx: number; ry: number; rot?: number; o?: number }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${rot} ${x} ${y})`} fill="#fff" opacity={o} />;
}

export function Twinkle({ x, y, r, color = '#fff', className = 'cr-twinkle' }: { x: number; y: number; r: number; color?: string; className?: string }) {
  return <path className={className} d={twinklePath(x, y, r)} fill={color} />;
}

export function Toes({ u, x, y, n = 3, gap = 6 }: { u: string; x: number; y: number; n?: number; gap?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <ellipse key={i} cx={x + i * gap} cy={y - (i === 1 && n === 3 ? 0.6 : 0)} rx={2.7} ry={2.1} {...ivory(u)} strokeWidth={1.3} />
      ))}
    </g>
  );
}

/** A sturdy leg for the four-legged ones. Drawn before the body, which hides
    its top, so it comes out from under the tummy the way a toy's does. */
export function Leg({ x, w, top, u, k, back }: ArtProps & { x: number; w: number; top: number; back?: boolean }) {
  const d = `M ${x + 1} ${top} C ${x} ${top + 14}, ${x - 2} 170, ${x - 2} 176 Q ${x - 2} 183.5 ${x + 6} 183.5 L ${x + w - 6} 183.5 Q ${x + w + 2} 183.5 ${x + w + 2} 176 C ${x + w + 2} 170, ${x + w} ${top + 14}, ${x + w - 1} ${top} Z`;
  return (
    <g>
      <path d={d} {...(back ? far(k) : skin(u, k))} />
      {!back && <Toes u={u} x={x + w * 0.22} y={181.5} gap={w * 0.28} />}
    </g>
  );
}
