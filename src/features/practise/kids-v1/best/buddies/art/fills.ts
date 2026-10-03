import { darken, type Paint } from './color';

/* How each kind of part is painted. Every part gets its own gradient box, so
   a head is lit from its own top-left and a leg from its own: the soft,
   rounded look of a vinyl toy rather than one flat light over everything. */

type Join = 'round';
export interface Fill { fill: string; stroke: string; strokeWidth: number; strokeLinejoin: Join }

export const W = 2.6;

export const skin = (u: string, k: Paint): Fill => ({ fill: `url(#${u}b)`, stroke: k.line, strokeWidth: W, strokeLinejoin: 'round' });
/** The far legs and far arm: in shadow, behind the body. */
export const far = (k: Paint): Fill => ({ fill: k.lo, stroke: k.line, strokeWidth: W, strokeLinejoin: 'round' });
export const accent = (u: string, k: Paint): Fill => ({ fill: `url(#${u}a)`, stroke: k.accentLine, strokeWidth: 2.3, strokeLinejoin: 'round' });
export const belly = (u: string, k: Paint): Fill => ({ fill: `url(#${u}y)`, stroke: darken(k.belly, 0.35), strokeWidth: 1.6, strokeLinejoin: 'round' });
export const ivory = (u: string): Fill => ({ fill: `url(#${u}h)`, stroke: '#a8875a', strokeWidth: 2.1, strokeLinejoin: 'round' });
export const plain = (color: string, line: string, w = W): Fill => ({ fill: color, stroke: line, strokeWidth: w, strokeLinejoin: 'round' });
