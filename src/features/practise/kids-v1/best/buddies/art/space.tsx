import { leaf, lighten, twinklePath } from './color';
import { accent, belly, plain, skin } from './fills';
import { Cheek, Eye, Gloss, Grin, Smile, Twinkle, type ArtProps } from './parts';

/*
  STAR STATION, drawn. Shiny metal, glass and glow, still with the same big
  friendly eyes: a robot here has a screen for a face, but it smiles the same.
*/

/* ── Robot ───────────────────────────────────────────────────────────────── */

export function Robot({ u, k }: ArtProps) {
  const S = skin(u, k);
  const glow = k.accent;
  return (
    <g>
      <path d="M 100 46 L 100 26" stroke={k.line} strokeWidth={4} strokeLinecap="round" />
      <circle className="cr-blink-light" cx="100" cy="22" r="7" fill={glow} stroke={k.line} strokeWidth={2.2} />
      <circle cx="98" cy="20" r="2.4" fill="#fff" />
      <path d="M 82 160 L 80 174 Q 80 183 88 183 L 96 183 Q 100 183 100 177 L 98 160 Z" {...S} />
      <path d="M 102 160 L 100 177 Q 100 183 104 183 L 112 183 Q 120 183 120 174 L 118 160 Z" {...S} />
      <path d="M 70 124 C 56 126, 50 138, 54 150" fill="none" stroke={k.line} strokeWidth={9} strokeLinecap="round" />
      <path d="M 70 124 C 56 126, 50 138, 54 150" fill="none" stroke={k.body} strokeWidth={5} strokeLinecap="round" />
      <path d="M 130 124 C 144 122, 152 112, 150 100" fill="none" stroke={k.line} strokeWidth={9} strokeLinecap="round" />
      <path d="M 130 124 C 144 122, 152 112, 150 100" fill="none" stroke={k.body} strokeWidth={5} strokeLinecap="round" />
      <circle cx="54" cy="153" r="7" {...plain(lighten(k.body, 0.3), k.line, 2.2)} />
      <circle className="cr-wave" cx="150" cy="97" r="7" {...plain(lighten(k.body, 0.3), k.line, 2.2)} />
      <rect x="68" y="110" width="64" height="54" rx="16" {...S} />
      <rect x="82" y="122" width="36" height="28" rx="8" fill="#26345e" stroke={k.line} strokeWidth={2} />
      <path d="M 100 145 C 92 139, 88 134, 92 130 C 95 127, 99 129, 100 132 C 101 129, 105 127, 108 130 C 112 134, 108 139, 100 145 Z" fill={k.accent2} />
      <circle cx="76" cy="120" r="3" fill={k.accent2} /><circle cx="124" cy="120" r="3" fill={glow} />
      <circle cx="54" cy="78" r="8" {...plain(lighten(k.body, 0.2), k.line, 2.2)} />
      <circle cx="146" cy="78" r="8" {...plain(lighten(k.body, 0.2), k.line, 2.2)} />
      <rect x="58" y="44" width="84" height="66" rx="22" {...S} />
      <Gloss x={78} y={54} rx={12} ry={5} o={0.6} />
      <rect x="68" y="56" width="64" height="44" rx="14" fill="#1f2b52" stroke={k.line} strokeWidth={2} />
      <g className="cr-eye">
        <circle cx="86" cy="76" r="9" fill={glow} />
        <circle cx="114" cy="76" r="9" fill={glow} />
        <circle cx="83" cy="73" r="3" fill="#fff" /><circle cx="111" cy="73" r="3" fill="#fff" />
      </g>
      <path d="M 90 90 Q 100 97 110 90" fill="none" stroke={glow} strokeWidth={3} strokeLinecap="round" />
      <Cheek x={76} y={90} r={4.5} /><Cheek x={124} y={90} r={4.5} />
    </g>
  );
}

/* ── Alien ───────────────────────────────────────────────────────────────── */

export function Alien({ u, k }: ArtProps) {
  const S = skin(u, k);
  return (
    <g>
      <path d="M 84 70 C 80 56, 74 46, 68 38" fill="none" stroke={k.line} strokeWidth={6} strokeLinecap="round" />
      <path d="M 84 70 C 80 56, 74 46, 68 38" fill="none" stroke={k.body} strokeWidth={3} strokeLinecap="round" />
      <path d="M 116 70 C 120 56, 126 46, 132 38" fill="none" stroke={k.line} strokeWidth={6} strokeLinecap="round" />
      <path d="M 116 70 C 120 56, 126 46, 132 38" fill="none" stroke={k.body} strokeWidth={3} strokeLinecap="round" />
      <circle cx="67" cy="35" r="7" {...accent(u, k)} /><circle cx="133" cy="35" r="7" {...accent(u, k)} />
      <ellipse cx="78" cy="180" rx="15" ry="6" {...S} />
      <ellipse cx="122" cy="180" rx="15" ry="6" {...S} />
      <path d="M 60 176 C 48 136, 56 70, 100 64 C 144 70, 152 136, 140 176 C 126 186, 74 186, 60 176 Z" {...S} />
      <ellipse cx="100" cy="150" rx="26" ry="22" {...belly(u, k)} />
      <g fill={k.accent2} opacity={0.75}><circle cx="70" cy="132" r="4.5" /><circle cx="132" cy="138" r="5" /><circle cx="128" cy="96" r="3.4" /><circle cx="74" cy="98" r="3" /></g>
      <path d="M 62 128 C 50 128, 44 120, 46 112" fill="none" stroke={k.line} strokeWidth={8} strokeLinecap="round" />
      <path d="M 62 128 C 50 128, 44 120, 46 112" fill="none" stroke={k.body} strokeWidth={4.5} strokeLinecap="round" />
      <path d="M 138 128 C 150 128, 156 120, 154 112" fill="none" stroke={k.line} strokeWidth={8} strokeLinecap="round" />
      <path d="M 138 128 C 150 128, 156 120, 154 112" fill="none" stroke={k.body} strokeWidth={4.5} strokeLinecap="round" />
      <Gloss x={84} y={80} rx={13} ry={6} o={0.45} />
      <path d={twinklePath(100, 150, 7)} fill={k.accent} stroke="#8a4ad8" strokeWidth={1.2} />
      <Grin u={u} k={k} x={100} y={120} w={11} />
      <Eye u={u} k={k} x={79} y={103} r={9.5} />
      <Eye u={u} k={k} x={100} y={92} r={12} />
      <Eye u={u} k={k} x={121} y={103} r={9.5} />
      <Cheek x={70} y={118} r={5} /><Cheek x={130} y={118} r={5} />
    </g>
  );
}

/* ── Astro-pup ───────────────────────────────────────────────────────────── */

export function Pup({ u, k }: ArtProps) {
  const S = skin(u, k);
  const suit = plain('#f4f6ff', '#5a5f8a', 2.6);
  return (
    <g>
      <path className="cr-tail" d="M 70 150 C 58 146, 52 136, 54 126" fill="none" stroke="#5a5f8a" strokeWidth={9} strokeLinecap="round" />
      <path className="cr-tail" d="M 70 150 C 58 146, 52 136, 54 126" fill="none" stroke={k.body} strokeWidth={5.5} strokeLinecap="round" />
      <path d="M 80 166 L 80 177 Q 80 183 87 183 L 95 183 Q 99 183 99 177 L 99 166 Z" {...suit} />
      <path d="M 101 166 L 101 177 Q 101 183 105 183 L 113 183 Q 120 183 120 177 L 120 166 Z" {...suit} />
      <ellipse cx="100" cy="144" rx="31" ry="28" {...suit} />
      <path d="M 72 140 L 128 140" stroke="#4fb8ff" strokeWidth={5} />
      <circle cx="100" cy="152" r="8" fill="#ffd25c" stroke="#c98a12" strokeWidth={1.6} />
      <path d={twinklePath(100, 152, 5)} fill="#fff" />
      <ellipse cx="72" cy="150" rx="8" ry="7" {...S} />
      <ellipse cx="128" cy="150" rx="8" ry="7" {...S} />
      <ellipse cx="72" cy="88" rx="11" ry="20" transform="rotate(18 72 88)" fill={k.accent2} stroke={k.line} strokeWidth={2.4} />
      <ellipse cx="128" cy="88" rx="11" ry="20" transform="rotate(-18 128 88)" fill={k.accent2} stroke={k.line} strokeWidth={2.4} />
      <ellipse cx="100" cy="84" rx="29" ry="26" {...S} />
      <ellipse cx="100" cy="98" rx="15" ry="10" fill={`url(#${u}y)`} stroke={k.line} strokeWidth={1.8} />
      <ellipse cx="100" cy="92" rx="5.5" ry="4" fill={k.line} />
      <path d="M 100 96 L 100 100 M 100 100 Q 95 104 91 101 M 100 100 Q 105 104 109 101" fill="none" stroke={k.line} strokeWidth={2} strokeLinecap="round" />
      <path d="M 97 103 Q 100 112 103 103 Z" fill="#ff7d96" stroke={k.line} strokeWidth={1.2} />
      <Eye u={u} k={k} x={88} y={80} r={8.5} />
      <Eye u={u} k={k} x={112} y={80} r={8.5} />
      <Cheek x={80} y={95} r={5} /><Cheek x={120} y={95} r={5} />
      <rect x="66" y="112" width="68" height="10" rx="5" fill="#c9d2f2" stroke="#5a5f8a" strokeWidth={2.2} />
      <circle cx="100" cy="82" r="43" fill="#c8f1ff" opacity={0.22} stroke="#9fdcff" strokeWidth={3} />
      <path d="M 72 60 C 80 48, 94 42, 108 43" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
      <circle cx="122" cy="52" r="3" fill="#fff" opacity={0.85} />
    </g>
  );
}

/* ── Rocket pal ──────────────────────────────────────────────────────────── */

export function Rocket({ u, k }: ArtProps) {
  const S = skin(u, k);
  return (
    <g>
      <g className="cr-flame">
        <path d="M 86 140 C 84 158, 92 172, 100 182 C 108 172, 116 158, 114 140 Z" fill="#ffb03a" />
        <path d="M 92 140 C 91 154, 96 164, 100 172 C 104 164, 109 154, 108 140 Z" fill="#fff3a8" />
      </g>
      <path d="M 70 104 C 54 112, 48 128, 50 144 L 72 134 Z" {...accent(u, k)} />
      <path d="M 130 104 C 146 112, 152 128, 150 144 L 128 134 Z" {...accent(u, k)} />
      <path d="M 86 132 L 114 132 L 110 142 L 90 142 Z" fill="#5a5f8a" stroke="#2f3360" strokeWidth={2} strokeLinejoin="round" />
      <path d="M 100 22 C 124 36, 134 74, 132 134 L 68 134 C 66 74, 76 36, 100 22 Z" fill="#f6f7ff" stroke="#5a5f8a" strokeWidth={2.6} strokeLinejoin="round" />
      <path d="M 100 22 C 112 29, 120 40, 125 54 C 110 49, 90 49, 75 54 C 80 40, 88 29, 100 22 Z" {...S} />
      <path d="M 68 122 L 132 122 L 132 134 L 68 134 Z" {...S} />
      <Gloss x={84} y={78} rx={6} ry={22} rot={4} o={0.55} />
      <circle cx="100" cy="74" r="15" fill="#bfe9ff" stroke="#5a5f8a" strokeWidth={3} />
      <path d="M 92 68 Q 96 63 102 64" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
      <path d={twinklePath(108, 80, 4)} fill="#fff" />
      <Smile k={{ ...k, line: '#5a5f8a' }} x={100} y={112} w={7} />
      <Eye u={u} k={{ ...k, line: '#5a5f8a' }} x={88} y={102} r={8} />
      <Eye u={u} k={{ ...k, line: '#5a5f8a' }} x={112} y={102} r={8} />
      <Cheek x={80} y={112} r={4.5} /><Cheek x={120} y={112} r={4.5} />
    </g>
  );
}

/* ── UFO kitty ───────────────────────────────────────────────────────────── */

export function Ufo({ u, k }: ArtProps) {
  const S = skin(u, k);
  const lights = [k.accent, k.accent2, '#ffe066', k.accent, k.accent2];
  const line = '#7a5a9a';
  return (
    <g>
      <defs>
        <linearGradient id={`${u}beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6b0" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff6b0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M 76 146 L 58 188 L 142 188 L 124 146 Z" fill={`url(#${u}beam)`} />
      <ellipse cx="100" cy="143" rx="32" ry="9" fill={k.lo} stroke={k.line} strokeWidth={2.4} />
      <path d={leaf(80, 76, -112, 19, 16)} {...plain('#fff6fb', line, 2.4)} />
      <path d={leaf(81, 75, -112, 11, 8)} fill="#ffc2dc" />
      <path d={leaf(120, 76, -68, 19, 16)} {...plain('#fff6fb', line, 2.4)} />
      <path d={leaf(119, 75, -68, 11, 8)} fill="#ffc2dc" />
      <ellipse cx="100" cy="92" rx="28" ry="24" {...plain('#fff6fb', line, 2.6)} />
      <path d="M 86 72 Q 90 80 88 86 M 100 70 L 100 80 M 114 72 Q 110 80 112 86" fill="none" stroke={k.accent} strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
      <ellipse cx="100" cy="100" rx="5" ry="3.4" fill="#ff8fb8" />
      <path d="M 100 103 L 100 106 M 100 106 Q 96 110 92 107 M 100 106 Q 104 110 108 107" fill="none" stroke={line} strokeWidth={2} strokeLinecap="round" />
      <path d="M 68 96 L 82 99 M 68 104 L 82 103 M 132 96 L 118 99 M 132 104 L 118 103" stroke={line} strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
      <Eye u={u} k={{ ...k, line }} x={89} y={90} r={9} />
      <Eye u={u} k={{ ...k, line }} x={111} y={90} r={9} />
      <Cheek x={79} y={102} r={4.5} /><Cheek x={121} y={102} r={4.5} />
      <ellipse cx="86" cy="116" rx="7" ry="5" {...plain('#fff6fb', line, 2)} />
      <ellipse cx="114" cy="116" rx="7" ry="5" {...plain('#fff6fb', line, 2)} />
      <path d="M 52 124 C 52 80, 74 54, 100 54 C 126 54, 148 80, 148 124 Z" fill="#c8f1ff" opacity={0.22} stroke="#9fdcff" strokeWidth={3} />
      <path d="M 66 88 C 72 74, 84 64, 98 62" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
      <ellipse cx="100" cy="130" rx="68" ry="19" {...S} />
      <ellipse cx="100" cy="124" rx="60" ry="9" fill={lighten(k.body, 0.35)} opacity={0.8} />
      {lights.map((col, i) => <circle key={i} className="cr-blink-light" style={{ animationDelay: `${i * 0.25}s` }} cx={56 + i * 22} cy={136 - Math.sin((i / 4) * Math.PI) * 3} r={4.5} fill={col} stroke={k.line} strokeWidth={1.4} />)}
    </g>
  );
}

/* ── Star jelly ──────────────────────────────────────────────────────────── */

export function Jelly({ u, k }: ArtProps) {
  const S = skin(u, k);
  const ribbons: Array<[number, string]> = [[74, k.accent], [88, k.accent2], [100, k.accent], [112, k.accent2], [126, k.accent]];
  return (
    <g>
      <g className="cr-tail">
        {ribbons.map(([x, col], i) => (
          <g key={i}>
            <path d={`M ${x} 112 C ${x - 8} 128, ${x + 8} 140, ${x} 156 C ${x - 6} 166, ${x + 4} 174, ${x} 180`} fill="none" stroke={k.line} strokeWidth={7} strokeLinecap="round" />
            <path d={`M ${x} 112 C ${x - 8} 128, ${x + 8} 140, ${x} 156 C ${x - 6} 166, ${x + 4} 174, ${x} 180`} fill="none" stroke={col} strokeWidth={4} strokeLinecap="round" />
            {i % 2 === 0 && <path d={twinklePath(x, 182, 5)} fill="#fff3a8" stroke="#e0b030" strokeWidth={1} />}
          </g>
        ))}
      </g>
      <path d="M 52 108 C 52 70, 74 46, 100 46 C 126 46, 148 70, 148 108 C 140 116, 132 110, 124 116 C 116 110, 108 118, 100 112 C 92 118, 84 110, 76 116 C 68 110, 60 116, 52 108 Z" {...S} opacity={0.96} />
      <path d="M 62 100 C 62 74, 80 56, 100 56" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.4} />
      <g fill="#fff" opacity={0.75}><circle cx="124" cy="66" r="3.4" /><circle cx="134" cy="84" r="2.4" /><circle cx="72" cy="70" r="2" /></g>
      <Grin u={u} k={k} x={100} y={95} w={8} />
      <Eye u={u} k={k} x={84} y={82} r={10} />
      <Eye u={u} k={k} x={116} y={82} r={10} />
      <Cheek x={72} y={95} r={5.5} /><Cheek x={128} y={95} r={5.5} />
      <Twinkle x={40} y={60} r={6} color="#fff3a8" /><Twinkle x={164} y={78} r={5} />
    </g>
  );
}

/* ── Planet pal ──────────────────────────────────────────────────────────── */

export function Planet({ u, k }: ArtProps) {
  const S = skin(u, k);
  return (
    <g>
      <path d="M 30 108 C 30 88, 170 88, 170 108" fill="none" stroke={k.accentLine} strokeWidth={13} strokeLinecap="round" transform="rotate(-14 100 108)" />
      <path d="M 30 108 C 30 88, 170 88, 170 108" fill="none" stroke={k.accent} strokeWidth={8} strokeLinecap="round" transform="rotate(-14 100 108)" />
      <circle cx="100" cy="104" r="46" {...S} />
      <path d="M 58 76 C 80 82, 120 82, 144 74 M 56 126 C 80 134, 122 134, 144 124" fill="none" stroke={k.accent2} strokeWidth={6} strokeLinecap="round" opacity={0.55} />
      <Gloss x={80} y={78} rx={15} ry={8} o={0.5} />
      <Smile k={k} x={100} y={104} w={8} />
      <Eye u={u} k={k} x={86} y={90} r={10} />
      <Eye u={u} k={k} x={114} y={90} r={10} />
      <Cheek x={74} y={103} r={6} /><Cheek x={126} y={103} r={6} />
      <path d="M 30 108 C 30 128, 170 128, 170 108" fill="none" stroke={k.accentLine} strokeWidth={13} strokeLinecap="round" transform="rotate(-14 100 108)" />
      <path d="M 30 108 C 30 128, 170 128, 170 108" fill="none" stroke={k.accent} strokeWidth={8} strokeLinecap="round" transform="rotate(-14 100 108)" />
      <path d="M 40 112 C 60 122, 100 126, 140 122" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" opacity={0.5} transform="rotate(-14 100 108)" />
      <g className="cr-moon"><circle cx="162" cy="50" r="10" {...plain('#e6e1ff', '#6a5aa8', 2.2)} /><circle cx="159" cy="47" r="2.4" fill="#c9c0f2" /><circle cx="165" cy="53" r="1.8" fill="#c9c0f2" /></g>
      <path d={twinklePath(36, 52, 6)} fill="#fff3a8" className="cr-twinkle" />
    </g>
  );
}
