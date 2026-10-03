import { leaf, lighten, spikePath, twinklePath } from './color';
import { accent, belly, far, ivory, plain, skin } from './fills';
import { Cheek, Eye, Gloss, Grin, Smile, Toes, Twinkle, type ArtProps } from './parts';

/*
  UNICORN SKY, drawn. The same rules as Dino Island (floor at y 182, facing
  right, face turned to the child), with softer colours, eyelashes for the
  ponies and a little more sparkle, because that is what this world is for.
*/

const RAINBOW = ['#ff7b7b', '#ffb259', '#ffe066', '#7fe08a', '#69c3ff', '#b48cff'];

function Lashes({ x, y, r, k }: { x: number; y: number; r: number; k: ArtProps['k'] }) {
  return (
    <path d={`M ${x + r * 0.55} ${y - r * 0.85} l ${r * 0.32} ${-r * 0.42} M ${x + r * 0.85} ${y - r * 0.45} l ${r * 0.45} ${-r * 0.22} M ${x + r * 0.15} ${y - r * 1.02} l ${r * 0.1} ${-r * 0.48}`}
      stroke={k.line} strokeWidth={2} strokeLinecap="round" />
  );
}

function PonyLeg({ u, k, x, top, back, hoof }: ArtProps & { x: number; top: number; back?: boolean; hoof: string }) {
  const w = back ? 13 : 15;
  return (
    <g>
      <path d={`M ${x} ${top} C ${x - 1} ${top + 14}, ${x} 168, ${x} 172 L ${x + w} 172 C ${x + w} 168, ${x + w + 1} ${top + 14}, ${x + w} ${top} Z`} {...(back ? far(k) : skin(u, k))} />
      <path d={`M ${x - 1.5} 171 L ${x + w + 1.5} 171 L ${x + w + 1.5} 178 Q ${x + w + 1.5} 183.5 ${x + w - 4} 183.5 L ${x + 4} 183.5 Q ${x - 1.5} 183.5 ${x - 1.5} 178 Z`}
        {...plain(back ? hoof : lighten(hoof, 0.15), k.line, 2.2)} />
    </g>
  );
}

/* ── Unicorn, Pegasus and the Rainbow Unicorn share a pony ───────────────── */

function Pony({ u, k, horn = false, wings = false, rainbow = false }: ArtProps & { horn?: boolean; wings?: boolean; rainbow?: boolean }) {
  const S = skin(u, k);
  const mane = rainbow ? RAINBOW : [k.accent, k.accent2, k.accent, k.accent2, k.accent, k.accent2];
  const hoof = rainbow ? '#ffd45c' : k.accent2;
  return (
    <g>
      {rainbow && <circle cx="100" cy="104" r="88" fill="url(#rb-glow)" className="cr-aura" />}
      {rainbow && <defs><radialGradient id="rb-glow"><stop offset="0" stopColor="#fff6ff" stopOpacity=".95" /><stop offset="1" stopColor="#ffd6f6" stopOpacity="0" /></radialGradient></defs>}
      <g className="cr-tail">
        {(rainbow ? RAINBOW.slice(0, 4) : [k.accent, k.accent2]).map((col, i) => (
          <path key={i} d={`M 46 ${118 + i * 5} C ${26 - i * 2} ${112 + i * 6}, ${10 + i * 3} ${126 + i * 5}, ${12 + i * 4} ${146 + i * 4} C ${14 + i * 4} ${162 + i * 2}, ${28 + i * 3} ${170}, ${36 + i * 2} ${160} C ${26 + i * 3} ${150}, ${28 + i * 2} ${138 + i * 3}, ${46} ${132 + i * 3} Z`}
            {...plain(col, k.line, 2.2)} />
        ))}
      </g>
      <PonyLeg u={u} k={k} x={58} top={148} back hoof={hoof} />
      <PonyLeg u={u} k={k} x={112} top={146} back hoof={hoof} />
      <PonyLeg u={u} k={k} x={44} top={148} hoof={hoof} />
      <PonyLeg u={u} k={k} x={98} top={150} hoof={hoof} />
      <path d="M 100 126 C 102 104, 112 90, 124 80 L 148 92 C 137 102, 129 116, 127 134 Z" {...S} />
      <ellipse cx="84" cy="134" rx="46" ry="29" {...S} />
      <ellipse cx="88" cy="150" rx="30" ry="10" {...belly(u, k)} />
      <Gloss x={66} y={116} rx={16} ry={6} rot={-12} o={0.5} />
      {rainbow && <path d={twinklePath(70, 136, 7)} fill="#ffd45c" stroke="#e0a020" strokeWidth={1.2} />}
      {wings && (
        <g className="cr-wing-l">
          {[[86, 110, -128, 58, 22], [88, 108, -108, 54, 20], [92, 108, -88, 44, 18]].map(([x, y, d, h, w], i) => (
            <path key={i} d={leaf(x, y, d, h, w)} fill={i === 1 ? `url(#${u}c)` : '#ffffff'} stroke={k.line} strokeWidth={2.3} strokeLinejoin="round" />
          ))}
          <path d={leaf(88, 110, -112, 30, 26)} fill={`url(#${u}c)`} stroke={k.line} strokeWidth={2.3} strokeLinejoin="round" />
        </g>
      )}
      {[[119, 64, 13], [111, 80, 12], [105, 96, 11], [103, 112, 10]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} {...plain(mane[i % mane.length], k.line, 2.2)} />
      ))}
      {[[124, 56, 9], [113, 72, 9], [107, 88, 8]].map(([x, y, r], i) => (
        <circle key={`b${i}`} cx={x} cy={y} r={r} {...plain(mane[(i + 3) % mane.length], k.line, 2)} />
      ))}
      <path d={leaf(124, 64, -112, 22, 14)} {...S} />
      <path d={leaf(125, 63, -112, 13, 7)} fill="#ffc2dc" />
      <path d={leaf(163, 62, -68, 22, 14)} {...S} />
      <path d={leaf(162, 61, -68, 13, 7)} fill="#ffc2dc" />
      <ellipse cx="144" cy="87" rx="31" ry="29" {...S} />
      <Gloss x={129} y={70} rx={10} ry={5} o={0.5} />
      <ellipse cx="148" cy="105" rx="19" ry="12" fill={`url(#${u}y)`} stroke={k.line} strokeWidth={2} />
      <ellipse cx="142" cy="103" rx="1.8" ry="1.3" fill={k.line} /><ellipse cx="154" cy="103" rx="1.8" ry="1.3" fill={k.line} />
      <Smile k={k} x={148} y={109} w={6} />
      <circle cx="136" cy="63" r="9" {...plain(mane[0], k.line, 2)} />
      <circle cx="147" cy="60" r="7.5" {...plain(mane[1], k.line, 2)} />
      {horn && (
        <g>
          <defs>
            <linearGradient id={`${u}g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff7c2" /><stop offset="1" stopColor="#ffbf3a" /></linearGradient>
          </defs>
          <path d="M 135 60 L 143 18 L 151 60 Z" fill={`url(#${u}g)`} stroke="#c98a12" strokeWidth={2} strokeLinejoin="round" />
          <path d="M 137 51 L 149 46 M 139 40 L 147.5 36.5 M 140.8 29.5 L 145.6 27.5" stroke="#d99a1c" strokeWidth={1.8} strokeLinecap="round" />
        </g>
      )}
      <Eye u={u} k={k} x={132} y={87} r={10} />
      <Eye u={u} k={k} x={157} y={86} r={10} />
      <Lashes k={k} x={132} y={87} r={10} />
      <Lashes k={k} x={157} y={86} r={10} />
      <Cheek x={124} y={100} r={5.6} /><Cheek x={167} y={99} r={5.6} />
      {rainbow && <g><Twinkle x={30} y={60} r={9} color="#fff3a8" /><Twinkle x={180} y={40} r={7} /><Twinkle x={176} y={150} r={6} color="#ffd6f6" /></g>}
    </g>
  );
}

export const Unicorn = (p: ArtProps) => <Pony {...p} horn />;
export const Pegasus = (p: ArtProps) => <Pony {...p} wings />;
export const RainbowUnicorn = (p: ArtProps) => <Pony {...p} horn rainbow />;

/* ── Baby dragon: only breathes warm hugs ───────────────────────────────── */

export function Dragon({ u, k, galaxy = false }: ArtProps & { galaxy?: boolean }) {
  const S = skin(u, k);
  const A = accent(u, k);
  return (
    <g>
      {galaxy && <defs><radialGradient id={`${u}n`}><stop offset="0" stopColor="#b9a8ff" stopOpacity=".8" /><stop offset="1" stopColor="#7fe6ff" stopOpacity="0" /></radialGradient></defs>}
      {galaxy && <circle cx="100" cy="108" r="90" fill={`url(#${u}n)`} className="cr-aura" />}
      <g className="cr-wing-l">
        <path d="M 80 104 C 64 84, 48 66, 28 56 C 32 70, 32 80, 38 88 C 44 85, 50 89, 50 96 C 56 93, 62 97, 62 104 C 68 103, 73 107, 75 113 Z" {...A} />
        <path d="M 78 104 C 66 88, 54 76, 34 62 M 70 102 L 46 84 M 68 108 L 54 96" fill="none" stroke={k.accentLine} strokeWidth={1.8} strokeLinecap="round" opacity={0.55} />
      </g>
      {[[92, 88, -100], [80, 96, -125], [70, 108, -145], [62, 122, -165]].map(([x, y, d], i) => <path key={i} d={spikePath(x, y, d, 10, 10)} {...A} />)}
      <g className="cr-tail">
        <path d={leaf(18, 146, 185, 18, 16)} {...A} />
        <path d="M 66 122 C 46 116, 30 126, 18 140 C 16 145, 19 149, 24 148 C 38 146, 52 150, 70 158 Z" {...S} />
      </g>
      <path d="M 80 148 C 75 164, 76 176, 81 182 L 100 182 C 103 172, 102 160, 99 148 Z" {...far(k)} />
      <path d="M 96 86 C 122 86, 138 108, 136 136 C 134 164, 118 179, 96 179 C 73 179, 60 164, 60 138 C 60 112, 71 86, 96 86 Z" {...S} />
      <ellipse cx="108" cy="142" rx="19" ry="28" transform="rotate(-12 108 142)" {...belly(u, k)} />
      <path d="M 95 126 Q 107 130 120 124 M 94 139 Q 107 143 122 136 M 96 152 Q 108 156 121 149 M 99 165 Q 109 168 118 163" fill="none" stroke={k.accent} strokeWidth={1.8} strokeLinecap="round" opacity={0.75} />
      <ellipse cx="111" cy="157" rx="18" ry="20" {...S} />
      <path d="M 97 177 C 97 170, 105 167, 115 167 C 126 167, 134 171, 134 177 C 134 182, 126 184, 115 184 C 104 184, 97 182, 97 177 Z" {...S} />
      <Toes u={u} x={120} y={180} />
      <path d="M 122 116 C 134 112, 146 120, 145 132 C 144 138, 137 139, 135 134 C 134 129, 130 126, 124 128 Z" {...S} />
      <path d={spikePath(104, 46, -118, 17, 9)} {...ivory(u)} />
      <path d={spikePath(132, 42, -76, 17, 9)} {...ivory(u)} />
      <ellipse cx="120" cy="71" rx="35" ry="31" {...S} />
      <ellipse cx="149" cy="84" rx="19" ry="13" {...S} />
      <Gloss x={104} y={52} rx={11} ry={6} />
      <circle cx="158" cy="80" r="1.8" fill={k.line} /><circle cx="164" cy="83" r="1.8" fill={k.line} />
      <path className="cr-puff" d="M 177 66 C 177 62, 182 61, 183 65 C 184 61, 189 62, 189 66 C 189 70, 183 74, 183 74 C 183 74, 177 70, 177 66 Z" fill="#ff8fb8" stroke="#e0507e" strokeWidth={1.2} />
      <Grin u={u} k={k} x={146} y={89} w={11} />
      <Eye u={u} k={k} x={108} y={66} r={10.5} />
      <Eye u={u} k={k} x={134} y={64} r={11} />
      <Cheek x={98} y={83} r={6} /><Cheek x={134} y={82} r={5.5} />
      {galaxy && <g fill="#fff">
        {[[74, 120, 1.8], [82, 150, 1.4], [70, 140, 1.1], [116, 104, 1.3], [92, 108, 1.6], [126, 52, 1.2], [100, 46, 1.4], [40, 136, 1.2], [56, 128, 1.6]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} opacity={0.9} />)}
        <Twinkle x={28} y={58} r={8} color="#fff3a8" /><Twinkle x={176} y={120} r={6} /><Twinkle x={160} y={30} r={5} color="#7fe6ff" />
      </g>}
    </g>
  );
}

export const GalaxyDragon = (p: ArtProps) => <Dragon {...p} galaxy />;

/* ── Moon bunny ──────────────────────────────────────────────────────────── */

export function Bunny({ u, k }: ArtProps) {
  const S = skin(u, k);
  return (
    <g>
      <g className="cr-ear-l"><ellipse cx="80" cy="50" rx="12" ry="32" transform="rotate(-14 80 50)" {...S} />
        <ellipse cx="81" cy="52" rx="6" ry="22" transform="rotate(-14 81 52)" fill="#ffc2dc" /></g>
      <g className="cr-ear-r"><ellipse cx="120" cy="48" rx="12" ry="32" transform="rotate(16 120 48)" {...S} />
        <ellipse cx="119" cy="50" rx="6" ry="22" transform="rotate(16 119 50)" fill="#ffc2dc" /></g>
      <circle cx="56" cy="160" r="13" {...plain('#ffffff', k.line, 2.2)} />
      <ellipse cx="100" cy="150" rx="45" ry="34" {...S} />
      <ellipse cx="100" cy="158" rx="26" ry="20" {...belly(u, k)} />
      <ellipse cx="80" cy="180" rx="17" ry="7" {...S} />
      <ellipse cx="121" cy="180" rx="17" ry="7" {...S} />
      <ellipse cx="88" cy="140" rx="8" ry="7" {...S} />
      <ellipse cx="113" cy="140" rx="8" ry="7" {...S} />
      <ellipse cx="100" cy="101" rx="40" ry="34" {...S} />
      <Gloss x={84} y={80} rx={12} ry={6} o={0.5} />
      <path d="M 104 70 C 96 70, 92 76, 94 82 C 98 78, 104 78, 108 82 C 110 76, 108 71, 104 70 Z" fill={`url(#${u}a)`} stroke="#d4a017" strokeWidth={1.3} transform="rotate(-20 101 76)" />
      <path d="M 96 112 Q 100 110 104 112 Q 100 118 96 112 Z" fill="#ff8fb8" />
      <path d="M 100 115 L 100 119 M 100 119 Q 96 123 92 120 M 100 119 Q 104 123 108 120" fill="none" stroke={k.line} strokeWidth={2} strokeLinecap="round" />
      <Eye u={u} k={k} x={85} y={100} r={10.5} />
      <Eye u={u} k={k} x={115} y={100} r={10.5} />
      <Cheek x={73} y={114} r={6} /><Cheek x={127} y={114} r={6} />
    </g>
  );
}

/* ── Cloud lamb ──────────────────────────────────────────────────────────── */

const CLOUD: Array<[number, number, number]> = [[68, 140, 25], [94, 128, 29], [122, 136, 25], [82, 160, 24], [114, 160, 24], [100, 148, 28], [56, 158, 18], [136, 156, 18]];

export function Lamb({ u, k }: ArtProps) {
  const leg = '#9a8ac8';
  return (
    <g>
      {[70, 86, 112, 128].map((x, i) => (
        <path key={x} d={`M ${x} 164 L ${x} 177 Q ${x} 183 ${x + 5} 183 L ${x + 7} 183 Q ${x + 12} 183 ${x + 12} 177 L ${x + 12} 164 Z`} {...plain(i % 3 === 0 ? '#7f6fb0' : leg, '#4b3b7a', 2.2)} />
      ))}
      {CLOUD.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r + 1.3} fill="#5d4c8c" />)}
      {CLOUD.map(([x, y, r], i) => <circle key={`c${i}`} cx={x} cy={y} r={r} fill={`url(#${u}b)`} />)}
      <Gloss x={86} y={114} rx={14} ry={6} o={0.7} />
      <ellipse cx="106" cy="104" rx="13" ry="7" transform="rotate(-24 106 104)" {...plain('#fff3f6', '#5d4c8c', 2.2)} />
      <ellipse cx="158" cy="104" rx="13" ry="7" transform="rotate(24 158 104)" {...plain('#fff3f6', '#5d4c8c', 2.2)} />
      <ellipse cx="106" cy="104" rx="7" ry="3.5" transform="rotate(-24 106 104)" fill="#ffc2dc" />
      <ellipse cx="158" cy="104" rx="7" ry="3.5" transform="rotate(24 158 104)" fill="#ffc2dc" />
      <ellipse cx="132" cy="112" rx="28" ry="26" {...plain('#fff1f5', '#5d4c8c', 2.6)} />
      {[[117, 86, 12], [132, 81, 13], [147, 86, 11]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} {...plain('#ffffff', '#5d4c8c', 2.2)} />)}
      <Smile k={{ ...k, line: '#5d4c8c' }} x={132} y={125} w={6} />
      <Eye u={u} k={{ ...k, line: '#5d4c8c' }} x={121} y={110} r={9.5} />
      <Eye u={u} k={{ ...k, line: '#5d4c8c' }} x={143} y={109} r={9.5} />
      <Cheek x={112} y={123} r={5.5} /><Cheek x={153} y={122} r={5.5} />
      <path d={twinklePath(150, 140, 6)} fill={k.accent2} stroke="#e0b030" strokeWidth={1} />
    </g>
  );
}

/* ── Star fox: a new tail for every time it grows wiser ─────────────────── */

export function Fox({ u, k }: ArtProps) {
  const S = skin(u, k);
  const tails: Array<[number, number]> = [[-168, 58], [-140, 64], [-112, 58]];
  return (
    <g>
      <g className="cr-tail">
        {tails.map(([deg, h], i) => {
          const a = (deg * Math.PI) / 180;
          const tx = 74 + Math.cos(a) * h * 0.95;
          const ty = 158 + Math.sin(a) * h * 0.95;
          return (
            <g key={i}>
              <path d={leaf(74, 158, deg, h, 30)} {...S} />
              <path d={leaf(74 + Math.cos(a) * h * 0.62, 158 + Math.sin(a) * h * 0.62, deg, h * 0.38, 18)} fill="#fff" />
              <path d={twinklePath(tx, ty, 5.5)} fill={k.accent2} stroke="#d99a1c" strokeWidth={1} />
            </g>
          );
        })}
      </g>
      <ellipse cx="104" cy="150" rx="33" ry="32" {...S} />
      <ellipse cx="110" cy="150" rx="18" ry="23" {...plain('#fff7ee', k.line, 1.6)} />
      <path d="M 92 160 L 92 177 Q 92 183 98 183 L 101 183 Q 106 183 106 177 L 106 160 Z" {...plain('#fff7ee', k.line)} />
      <path d="M 114 160 L 114 177 Q 114 183 120 183 L 123 183 Q 128 183 128 177 L 128 160 Z" {...plain('#fff7ee', k.line)} />
      <path d={leaf(88, 76, -118, 32, 24)} {...S} />
      <path d={leaf(89, 75, -118, 20, 12)} fill="#fff1e6" />
      <path d={leaf(129, 74, -62, 32, 24)} {...S} />
      <path d={leaf(128, 73, -62, 20, 12)} fill="#fff1e6" />
      <path d="M 72 100 C 72 76, 88 66, 108 66 C 128 66, 144 76, 144 100 C 144 112, 138 118, 132 120 C 124 128, 116 130, 108 130 C 100 130, 92 128, 84 120 C 78 118, 72 112, 72 100 Z" {...S} />
      <path d="M 76 106 C 84 104, 94 108, 100 114 C 104 108, 112 108, 116 114 C 122 108, 132 104, 140 106 C 138 116, 130 124, 108 129 C 86 124, 78 116, 76 106 Z" fill="#fff7ee" />
      <Gloss x={92} y={76} rx={11} ry={5} o={0.45} />
      <ellipse cx="108" cy="113" rx="5" ry="3.6" fill={k.line} />
      <path d="M 108 117 L 108 120 M 108 120 Q 104 124 100 121 M 108 120 Q 112 124 116 121" fill="none" stroke={k.line} strokeWidth={2} strokeLinecap="round" />
      <Eye u={u} k={k} x={93} y={97} r={9.5} />
      <Eye u={u} k={k} x={123} y={96} r={9.5} />
      <Cheek x={82} y={112} r={5} /><Cheek x={134} y={111} r={5} />
      <path d={twinklePath(108, 80, 5)} fill={k.accent2} stroke="#d99a1c" strokeWidth={1} />
    </g>
  );
}

/* ── Phoenix ─────────────────────────────────────────────────────────────── */

export function Phoenix({ u, k }: ArtProps) {
  const S = skin(u, k);
  const flame = (x: number, y: number, deg: number, h: number, w: number, key: string) => (
    <g key={key}>
      <path d={leaf(x, y, deg, h, w)} fill={`url(#${u}a)`} stroke={k.line} strokeWidth={2.2} strokeLinejoin="round" />
      <path d={leaf(x, y, deg, h * 0.62, w * 0.45)} fill={k.accent2} opacity={0.8} />
    </g>
  );
  return (
    <g>
      <g className="cr-tail">
        {flame(94, 136, 112, 52, 16, 't1')}
        {flame(100, 138, 90, 60, 18, 't2')}
        {flame(106, 136, 68, 52, 16, 't3')}
      </g>
      <g className="cr-wing-l">{flame(84, 110, -152, 50, 22, 'l1')}{flame(84, 104, -126, 54, 22, 'l2')}{flame(88, 100, -100, 44, 20, 'l3')}</g>
      <g className="cr-wing-r">{flame(116, 110, -28, 50, 22, 'r1')}{flame(116, 104, -54, 54, 22, 'r2')}{flame(112, 100, -80, 44, 20, 'r3')}</g>
      <circle cx="100" cy="118" r="30" {...S} />
      <ellipse cx="100" cy="126" rx="18" ry="19" {...belly(u, k)} />
      {flame(94, 62, -112, 22, 10, 'c1')}{flame(100, 60, -90, 27, 11, 'c2')}{flame(106, 62, -68, 22, 10, 'c3')}
      <circle cx="100" cy="84" r="26" {...S} />
      <Gloss x={90} y={70} rx={9} ry={5} o={0.45} />
      <path d="M 93 92 Q 100 90 107 92 L 100 102 Z" fill={`url(#${u}a)`} stroke={k.line} strokeWidth={2} strokeLinejoin="round" />
      <Eye u={u} k={k} x={89} y={82} r={9} />
      <Eye u={u} k={k} x={111} y={82} r={9} />
      <Cheek x={80} y={93} r={5} /><Cheek x={120} y={93} r={5} />
    </g>
  );
}
