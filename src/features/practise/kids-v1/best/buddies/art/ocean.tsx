import { leaf, lighten, spikePath, twinklePath } from './color';
import { accent, belly, far, ivory, plain, skin } from './fills';
import { Cheek, Eye, Gloss, Grin, Smile, Twinkle, type ArtProps } from './parts';

/*
  OCEAN REEF, drawn. Sea creatures do not stand on a floor, so each one bobs
  in its own little pool of water drawn under it, which is what lets a dolphin
  sit on the home-page floor beside a T. rex without looking stranded.
*/

export function Pool() {
  return (
    <g>
      <ellipse cx="100" cy="177" rx="84" ry="14" fill="#c4f3ff" opacity={0.42} />
      <path d="M 18 173 C 32 166, 46 166, 60 172 C 74 178, 86 178, 100 172 C 114 166, 128 166, 142 172 C 156 178, 168 178, 182 172"
        fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.85} />
      <path d="M 40 185 C 50 181, 60 181, 70 185 M 124 186 C 134 182, 144 182, 154 186" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.55} />
    </g>
  );
}

function Bubbles({ x, y }: { x: number; y: number }) {
  return (
    <g className="cr-bubbles" fill="none" stroke="#e6fbff" strokeWidth={1.8} opacity={0.9}>
      <circle cx={x} cy={y} r={5} /><circle cx={x + 7} cy={y - 12} r={3.4} /><circle cx={x + 2} cy={y - 22} r={2.4} />
    </g>
  );
}

/* ── Dolphin ─────────────────────────────────────────────────────────────── */

export function Dolphin({ u, k }: ArtProps) {
  const S = skin(u, k);
  const A = accent(u, k);
  return (
    <g>
      <g className="cr-swim">
        <path d={leaf(58, 150, 150, 26, 16)} {...A} />
        <path d={leaf(60, 152, 205, 26, 16)} {...A} />
        <path d={leaf(88, 88, -118, 26, 18)} {...A} />
        <path d="M 52 152 C 46 128, 62 96, 96 80 C 118 70, 140 66, 156 70 C 168 64, 184 66, 188 76 C 192 86, 180 92, 168 92 C 162 112, 140 134, 112 146 C 92 154, 66 160, 52 152 Z" {...S} />
        <path d="M 60 148 C 74 146, 98 140, 118 128 C 138 116, 152 102, 160 90 C 166 94, 170 98, 168 104 C 158 124, 132 144, 104 152 C 84 158, 66 158, 60 148 Z" {...belly(u, k)} />
        <path d={leaf(116, 138, 128, 24, 14)} {...A} />
        <Gloss x={106} y={84} rx={16} ry={6} rot={-22} o={0.45} />
        <path d="M 160 82 Q 172 90 184 80" fill="none" stroke={k.line} strokeWidth={2.6} strokeLinecap="round" />
        <Eye u={u} k={k} x={134} y={84} r={10} />
        <Eye u={u} k={k} x={156} y={76} r={9.5} />
        <Cheek x={130} y={100} r={5.5} /><Cheek x={166} y={92} r={5} />
      </g>
      <Pool />
      <Bubbles x={176} y={140} />
    </g>
  );
}

/* ── Sea turtle ──────────────────────────────────────────────────────────── */

const SHELL: Array<[number, number, number]> = [[90, 108, 12], [70, 118, 11], [110, 118, 11], [62, 136, 9.5], [90, 128, 11], [118, 136, 9.5], [80, 146, 9], [102, 146, 9]];

export function Turtle({ u, k }: ArtProps) {
  const S = skin(u, k);
  const hex = (x: number, y: number, r: number) => Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i - 90) * Math.PI) / 180;
    return `${i ? 'L' : 'M'} ${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)}`;
  }).join(' ') + ' Z';
  return (
    <g>
      <g className="cr-swim">
        <path d={leaf(122, 150, 40, 30, 16)} {...far(k)} />
        <path d={leaf(60, 152, 150, 26, 14)} {...far(k)} />
        <path d="M 38 140 L 26 146 L 40 150 Z" {...S} />
        <path d="M 34 152 C 30 118, 56 92, 90 92 C 124 92, 150 118, 146 152 C 120 160, 60 160, 34 152 Z" fill={`url(#${u}a)`} stroke={k.accentLine} strokeWidth={2.6} strokeLinejoin="round" />
        {SHELL.map(([x, y, r], i) => <path key={i} d={hex(x, y, r)} fill={`url(#${u}c)`} stroke={k.accentLine} strokeWidth={1.4} strokeLinejoin="round" opacity={0.9} />)}
        <path d="M 34 152 C 60 160, 120 160, 146 152 C 146 158, 140 162, 132 163 C 104 167, 74 167, 48 163 C 40 162, 34 158, 34 152 Z" {...plain(k.accent2, k.accentLine, 2)} />
        <Gloss x={70} y={104} rx={16} ry={6} rot={-18} o={0.4} />
        <path d={leaf(132, 156, 30, 30, 17)} {...S} />
        <path d={leaf(52, 158, 160, 26, 15)} {...S} />
        <ellipse cx="156" cy="124" rx="26" ry="24" {...S} />
        <Gloss x={146} y={110} rx={8} ry={4.5} />
        <Smile k={k} x={158} y={134} w={7} />
        <Eye u={u} k={k} x={146} y={121} r={9} />
        <Eye u={u} k={k} x={168} y={120} r={9} />
        <Cheek x={139} y={133} r={5} /><Cheek x={175} y={132} r={5} />
      </g>
      <Pool />
    </g>
  );
}

/* ── Octopus: eight arms means eight hugs ───────────────────────────────── */

const ARMS: Array<[number, number, number]> = [
  // start x, end x, how far down
  [62, 22, 168], [74, 50, 178], [88, 80, 182], [112, 120, 182], [126, 150, 178], [138, 178, 168],
];

export function Octopus({ u, k }: ArtProps) {
  const S = skin(u, k);
  return (
    <g>
      <g className="cr-swim">
        {ARMS.map(([sx, ex, ey], i) => {
          const dir = ex < 100 ? -1 : 1;
          const d = `M ${sx - 9} 118 C ${sx - 8} 146, ${ex - dir * 10} ${ey - 4}, ${ex} ${ey} C ${ex + dir * 9} ${ey - 2}, ${ex + dir * 8} ${ey - 14}, ${ex - dir * 1} ${ey - 13} C ${ex - dir * 6} ${ey - 13}, ${ex - dir * 4} ${ey - 6}, ${ex + dir * 1} ${ey - 7} C ${sx + 10} ${ey - 30}, ${sx + 10} 140, ${sx + 9} 118 Z`;
          return (
            <g key={i}>
              <path d={d} {...S} />
              {[0.3, 0.5, 0.7].map((t) => (
                <circle key={t} cx={sx + (ex - sx) * t} cy={130 + (ey - 130) * t} r={2.6 - t * 1.4} fill={k.belly} opacity={0.85} />
              ))}
            </g>
          );
        })}
        <path d="M 56 104 C 56 66, 76 46, 100 46 C 124 46, 144 66, 144 104 C 144 122, 126 132, 100 132 C 74 132, 56 122, 56 104 Z" {...S} />
        <g fill={k.accent2} opacity={0.7}><circle cx="80" cy="66" r="5" /><circle cx="118" cy="62" r="6" /><circle cx="128" cy="80" r="3.6" /><circle cx="70" cy="84" r="3.4" /></g>
        <Gloss x={84} y={58} rx={14} ry={7} o={0.45} />
        <Grin u={u} k={k} x={100} y={113} w={9} />
        <Eye u={u} k={k} x={84} y={98} r={11} />
        <Eye u={u} k={k} x={116} y={97} r={11} />
        <Cheek x={72} y={112} r={6} /><Cheek x={128} y={111} r={6} />
      </g>
      <Pool />
    </g>
  );
}

/* ── Pufferfish: puffs up when scared, breathes, feels better ───────────── */

export function Puffer({ u, k }: ArtProps) {
  const S = skin(u, k);
  const spikes = Array.from({ length: 16 }, (_, i) => (360 / 16) * i);
  return (
    <g>
      <g className="cr-swim">
        <g className="cr-tail">
          <path d={leaf(56, 112, 180, 24, 26)} {...accent(u, k)} />
        </g>
        {spikes.map((deg) => {
          const a = (deg * Math.PI) / 180;
          return <path key={deg} d={spikePath(100 + Math.cos(a) * 42, 112 + Math.sin(a) * 42, deg, 11, 8)} {...accent(u, k)} />;
        })}
        <circle cx="100" cy="112" r="45" {...S} />
        <path d="M 58 120 C 70 150, 130 150, 142 120 C 140 146, 124 157, 100 157 C 76 157, 60 146, 58 120 Z" fill={`url(#${u}y)`} />
        <g fill={k.accent2} opacity={0.4}><circle cx="78" cy="88" r="4" /><circle cx="122" cy="86" r="4.5" /><circle cx="136" cy="104" r="3.2" /><circle cx="66" cy="104" r="3" /></g>
        <path d={leaf(132, 122, 40, 18, 12)} {...accent(u, k)} />
        <Gloss x={84} y={80} rx={15} ry={8} o={0.5} />
        <ellipse cx="100" cy="128" rx="6" ry="5" fill="#7a2338" stroke={k.line} strokeWidth={2} />
        <Eye u={u} k={k} x={85} y={106} r={11.5} />
        <Eye u={u} k={k} x={115} y={105} r={11.5} />
        <Cheek x={72} y={122} r={7} /><Cheek x={128} y={121} r={7} />
      </g>
      <Pool />
      <Bubbles x={150} y={84} />
    </g>
  );
}

/* ── Seahorse ────────────────────────────────────────────────────────────── */

export function Seahorse({ u, k }: ArtProps) {
  const S = skin(u, k);
  return (
    <g>
      <g className="cr-swim">
        <path d={leaf(80, 112, 180, 22, 26)} {...accent(u, k)} />
        <path d="M 100 72 C 124 76, 132 100, 126 124 C 120 146, 104 152, 98 166 C 94 176, 102 186, 112 182 C 120 178, 118 168, 110 170 C 106 171, 106 176, 110 176"
          fill="none" stroke={k.line} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 100 72 C 124 76, 132 100, 126 124 C 120 146, 104 152, 98 166 C 94 176, 102 186, 112 182 C 120 178, 118 168, 110 170 C 106 171, 106 176, 110 176"
          fill="none" stroke={k.body} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="104" cy="114" rx="24" ry="30" {...S} />
        <ellipse cx="112" cy="118" rx="12" ry="20" {...belly(u, k)} />
        <path d="M 102 102 Q 112 105 121 101 M 101 114 Q 112 117 123 113 M 102 126 Q 111 129 120 125" fill="none" stroke={k.accent2} strokeWidth={1.8} strokeLinecap="round" opacity={0.7} />
        {[[92, 46, -115], [102, 42, -90], [112, 45, -65]].map(([x, y, d], i) => <path key={i} d={spikePath(x, y, d, 9, 8)} {...accent(u, k)} />)}
        <path d="M 126 70 L 146 70 C 152 70, 154 78, 148 79 L 126 80 Z" {...S} />
        <ellipse cx="104" cy="68" rx="25" ry="22" {...S} />
        <Gloss x={94} y={55} rx={8} ry={4.5} o={0.45} />
        <Smile k={k} x={128} y={81} w={5} />
        <Eye u={u} k={k} x={96} y={66} r={9.5} />
        <Eye u={u} k={k} x={118} y={65} r={9.5} />
        <Cheek x={88} y={79} r={5} /><Cheek x={124} y={77} r={4.5} />
      </g>
      <Pool />
      <Bubbles x={160} y={60} />
    </g>
  );
}

/* ── Gentle shark ────────────────────────────────────────────────────────── */

export function Shark({ u, k }: ArtProps) {
  const S = skin(u, k);
  const A = accent(u, k);
  return (
    <g>
      <g className="cr-swim">
        <g className="cr-tail">
          <path d={leaf(46, 122, -150, 34, 18)} {...A} />
          <path d={leaf(46, 126, 160, 28, 16)} {...A} />
        </g>
        <path d={leaf(92, 98, -100, 30, 26)} {...A} />
        <path d="M 40 126 C 44 100, 80 88, 118 90 C 152 92, 176 106, 178 124 C 178 142, 156 154, 120 156 C 80 158, 42 150, 40 126 Z" {...S} />
        <path d="M 44 132 C 70 140, 100 136, 128 136 C 148 136, 166 132, 176 128 C 172 144, 152 154, 120 156 C 82 158, 50 150, 44 132 Z" {...belly(u, k)} />
        <path d="M 118 108 q -4 8 0 16 M 110 108 q -4 8 0 16 M 102 108 q -4 8 0 16" fill="none" stroke={k.lo} strokeWidth={2.2} strokeLinecap="round" />
        <path d={leaf(110, 140, 120, 24, 14)} {...A} />
        <Gloss x={84} y={100} rx={18} ry={6} rot={-6} o={0.45} />
        <path d="M 136 132 Q 154 146 172 130 Q 154 136 136 132 Z" fill="#7a2338" stroke={k.line} strokeWidth={2.2} strokeLinejoin="round" />
        <path d="M 142 134 l 2.5 4.5 l 2.5 -4 Z M 162 134 l 2.5 4.5 l 2.5 -4.6 Z" fill="#fff" />
        <Eye u={u} k={k} x={142} y={114} r={10} />
        <Eye u={u} k={k} x={164} y={112} r={10} />
        <Cheek x={134} y={128} r={5.5} /><Cheek x={173} y={124} r={5} />
      </g>
      <Pool />
    </g>
  );
}

/* ── Narwhal, and the Rainbow Whale ─────────────────────────────────────── */

function Whale({ u, k, tusk = false, rainbow = false }: ArtProps & { tusk?: boolean; rainbow?: boolean }) {
  const S = skin(u, k);
  const bands = ['#ff9a9a', '#ffc27a', '#ffe680', '#9ee89a', '#8fd0ff', '#c4a6ff'];
  return (
    <g>
      {rainbow && <defs><radialGradient id={`${u}q`}><stop offset="0" stopColor="#ffffff" stopOpacity=".9" /><stop offset="1" stopColor="#d6f2ff" stopOpacity="0" /></radialGradient></defs>}
      {rainbow && <circle cx="100" cy="110" r="90" fill={`url(#${u}q)`} className="cr-aura" />}
      <g className="cr-swim">
        <g className="cr-tail">
          <path d={leaf(40, 124, -140, 30, 18)} {...accent(u, k)} />
          <path d={leaf(40, 128, 170, 30, 18)} {...accent(u, k)} />
        </g>
        {tusk && (
          <g>
            <path d="M 146 92 L 186 34 L 154 98 Z" {...ivory(u)} />
            <path d="M 152 86 L 160 88 M 160 74 L 167 76 M 168 62 L 174 64 M 176 50 L 180 52" stroke="#c9a46a" strokeWidth={2} strokeLinecap="round" />
          </g>
        )}
        {rainbow && (
          <g className="cr-spout">
            <path d="M 112 76 C 108 60, 98 50, 86 50 M 112 76 C 114 58, 122 46, 134 44 M 112 76 C 112 60, 112 50, 112 40" fill="none" stroke="#bdf0ff" strokeWidth={5} strokeLinecap="round" />
            <circle cx="84" cy="48" r="4" fill="#d6f6ff" /><circle cx="136" cy="42" r="4" fill="#d6f6ff" /><circle cx="112" cy="36" r="4.5" fill="#d6f6ff" />
          </g>
        )}
        <path d="M 38 128 C 40 96, 76 78, 112 78 C 150 78, 176 100, 176 128 C 176 152, 152 162, 112 162 C 70 162, 38 154, 38 128 Z" {...S} />
        {rainbow
          ? bands.map((col, i) => <path key={col} d={`M ${50 + i * 3} ${136 + i * 4} C ${80} ${146 + i * 3}, ${140} ${146 + i * 3}, ${170 - i * 3} ${132 + i * 4}`} fill="none" stroke={col} strokeWidth={4.5} strokeLinecap="round" />)
          : <path d="M 46 138 C 76 150, 140 152, 172 134 C 166 152, 146 160, 112 161 C 76 161, 52 154, 46 138 Z" {...belly(u, k)} />}
        {!rainbow && <g fill={k.accent2} opacity={0.7}><circle cx="70" cy="104" r="4.5" /><circle cx="88" cy="96" r="3.6" /><circle cx="64" cy="122" r="3.4" /><circle cx="104" cy="94" r="3" /></g>}
        <path d={leaf(104, 146, 130, 26, 14)} {...accent(u, k)} />
        <Gloss x={82} y={94} rx={20} ry={7} rot={-12} o={0.45} />
        <Grin u={u} k={k} x={152} y={128} w={11} />
        <Eye u={u} k={k} x={136} y={112} r={10.5} />
        <Eye u={u} k={k} x={160} y={110} r={10.5} />
        <Cheek x={128} y={127} r={6} /><Cheek x={169} y={124} r={5} />
      </g>
      <Pool />
      {rainbow && <g><Twinkle x={30} y={70} r={8} /><Twinkle x={178} y={60} r={6} color="#fff3a8" /><path d={twinklePath(60, 50, 5)} fill={lighten('#ffd6f6', 0.2)} /></g>}
    </g>
  );
}

export const Narwhal = (p: ArtProps) => <Whale {...p} tusk />;
export const RainbowWhale = (p: ArtProps) => <Whale {...p} rainbow />;
