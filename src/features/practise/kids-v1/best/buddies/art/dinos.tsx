import { leaf, spikePath, twinklePath } from './color';
import { accent, belly, far, ivory, skin } from './fills';
import { Cheek, Eye, Gloss, Grin, Leg, Smile, Toes, Twinkle, type ArtProps } from './parts';

/*
  DINO ISLAND, drawn.

  Every dinosaur stands on the same floor line (y 182) in a 200 by 200 box,
  faces the viewer's right, and turns its face toward the child: a side-on
  body with a front-on face, the way a toy-box dinosaur is drawn. Each one is
  recognisable from its outline alone (the frill and horns, the plates, the
  long neck, the sail), because the collection shows the outlines of the ones
  not yet found, and a child should be able to guess who is coming.
*/

type Spike = [x: number, y: number, deg: number, len: number, base: number];

/* ── T. rex, and the Crystal Rex, who is a T. rex made of starlight ───────── */

const REX_SPIKES: Spike[] = [
  [112, 27, -88, 12, 12], [98, 34, -118, 12, 12], [88, 46, -146, 11, 11],
  [70, 97, -140, 10, 11], [62, 113, -160, 9, 10], [46, 120, -100, 9, 9], [28, 128, -112, 7, 8],
];

function crystalPath(x: number, y: number, deg: number, len: number, base: number): string {
  const a = (deg * Math.PI) / 180;
  const n = [Math.cos(a), Math.sin(a)];
  const p = [-n[1], n[0]];
  const pt = (along: number, side: number) => `${(x + n[0] * along + p[0] * side).toFixed(1)} ${(y + n[1] * along + p[1] * side).toFixed(1)}`;
  return `M ${pt(0, base / 2)} L ${pt(len * 0.7, base * 0.42)} L ${pt(len * 1.25, 0)} L ${pt(len * 0.7, -base * 0.42)} L ${pt(0, -base / 2)} Z`;
}

export function Rex({ u, k, crystal = false }: ArtProps & { crystal?: boolean }) {
  const S = crystal ? { ...skin(u, k), fill: `url(#${u}x)` } : skin(u, k);
  return (
    <g>
      {crystal && (
        <defs>
          <linearGradient id={`${u}x`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c7f6ff" />
            <stop offset=".45" stopColor="#b9a4ff" />
            <stop offset="1" stopColor="#ff9fde" />
          </linearGradient>
        </defs>
      )}
      {REX_SPIKES.map(([x, y, d, l, b], i) => crystal
        ? <path key={i} d={crystalPath(x, y, d, l * 1.25, b)} fill="#f4fbff" fillOpacity={0.9} stroke="#7a5ad8" strokeWidth={2} strokeLinejoin="round" />
        : <path key={i} d={spikePath(x, y, d, l, b)} {...accent(u, k)} />)}
      <path className="cr-tail" d="M 68 118 C 46 112, 26 122, 9 142 C 6 147, 10 151, 15 149 C 34 145, 52 150, 72 158 Z" {...S} />
      <path d="M 78 148 C 73 164, 74 176, 79 182 L 99 182 C 102 172, 101 160, 98 148 Z" {...far(k)} />
      <path d="M 96 82 C 124 82, 140 106, 138 136 C 136 164, 118 180, 96 180 C 72 180, 58 164, 58 138 C 58 110, 70 82, 96 82 Z" {...S} />
      <ellipse cx="109" cy="142" rx="20" ry="28" transform="rotate(-12 109 142)" {...belly(u, k)} />
      <path d="M 96 134 Q 108 138 120 132 M 96 147 Q 108 151 121 145 M 99 160 Q 109 163 119 158" fill="none" stroke={k.belly === '#fff2c6' ? '#e8d29a' : '#d9c8ff'} strokeWidth={1.6} strokeLinecap="round" />
      {!crystal && <g fill={k.accent2} opacity={0.55}>
        <ellipse cx="72" cy="118" rx="5" ry="4" /><ellipse cx="68" cy="138" rx="4" ry="3.2" /><ellipse cx="80" cy="102" rx="3.6" ry="3" />
      </g>}
      <ellipse cx="111" cy="157" rx="19" ry="21" {...S} />
      <path d="M 96 177 C 96 170, 104 167, 115 167 C 127 167, 136 171, 136 177 C 136 182, 128 184, 115 184 C 103 184, 96 182, 96 177 Z" {...S} />
      <Toes u={u} x={121} y={180} />
      <path d="M 119 114 C 128 108, 140 111, 143 119 C 145 125, 141 129, 137 127 C 134 125, 132 123, 125 125 Z" {...S} />
      <ellipse cx="144.5" cy="123" rx="2.4" ry="1.8" {...ivory(u)} strokeWidth={1.1} />
      <ellipse cx="141.5" cy="128.5" rx="2.4" ry="1.8" {...ivory(u)} strokeWidth={1.1} />
      <path d="M 84 60 C 84 34, 106 22, 128 22 C 154 22, 172 38, 172 62 C 172 88, 154 104, 128 104 C 102 104, 84 90, 84 60 Z" {...S} />
      <Gloss x={107} y={37} rx={15} ry={8} />
      {!crystal && <g fill={k.accent2} opacity={0.5}><ellipse cx="96" cy="44" rx="4" ry="3.2" /><ellipse cx="90" cy="56" rx="3" ry="2.4" /></g>}
      <circle cx="161" cy="49" r="1.9" fill={k.line} /><circle cx="167" cy="52" r="1.9" fill={k.line} />
      <Grin u={u} k={k} x={133} y={82} w={23} teeth={2} />
      <Eye u={u} k={k} x={110} y={57} r={11.5} />
      <Eye u={u} k={k} x={145} y={55} r={12} />
      <Cheek x={96} y={75} /><Cheek x={162} y={72} />
      {crystal && <g>
        <Twinkle x={30} y={60} r={9} /><Twinkle x={178} y={112} r={7} /><Twinkle x={46} y={168} r={6} /><Twinkle x={150} y={150} r={5} />
        <path d={twinklePath(110, 54, 3)} fill="#fff" /><path d={twinklePath(145, 52, 3)} fill="#fff" />
      </g>}
    </g>
  );
}

/* ── Triceratops ─────────────────────────────────────────────────────────── */

export function Trike({ u, k }: ArtProps) {
  const S = skin(u, k);
  const scallops = Array.from({ length: 13 }, (_, i) => {
    const a = ((-205 + i * (230 / 12)) * Math.PI) / 180;
    return [146 + Math.cos(a) * 45, 90 + Math.sin(a) * 45];
  });
  const dots = Array.from({ length: 6 }, (_, i) => {
    const a = ((-168 + i * 31) * Math.PI) / 180;
    return [146 + Math.cos(a) * 33, 90 + Math.sin(a) * 33];
  });
  return (
    <g>
      <path className="cr-tail" d="M 36 126 C 22 126, 11 134, 4 148 C 14 153, 27 151, 38 148 Z" {...S} />
      <Leg u={u} k={k} x={54} w={20} top={150} back />
      <Leg u={u} k={k} x={114} w={20} top={148} back />
      <Leg u={u} k={k} x={36} w={23} top={146} />
      <Leg u={u} k={k} x={98} w={23} top={148} />
      <ellipse cx="82" cy="132" rx="56" ry="38" {...S} />
      <ellipse cx="86" cy="153" rx="38" ry="13" {...belly(u, k)} />
      <g fill={k.hi} opacity={0.7}><circle cx="60" cy="112" r="6" /><circle cx="79" cy="104" r="4.6" /><circle cx="44" cy="126" r="4.4" /><circle cx="68" cy="126" r="3.4" /></g>
      <Gloss x={60} y={104} rx={18} ry={7} rot={-12} o={0.3} />
      <g>
        {scallops.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={8.5} {...accent(u, k)} />)}
        <circle cx="146" cy="90" r="45" fill={`url(#${u}a)`} />
        {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill={`url(#${u}c)`} />)}
      </g>
      <path d="M 123 92 C 118 74, 120 56, 127 42 C 134 55, 138 72, 138 89 Z" {...ivory(u)} />
      <path d="M 154 89 C 155 72, 160 55, 168 42 C 173 57, 173 74, 169 92 Z" {...ivory(u)} />
      <ellipse cx="146" cy="108" rx="33" ry="30" {...S} />
      <Gloss x={132} y={88} rx={12} ry={6} />
      <path d="M 140 113 C 141 105, 144 99, 147 95 C 150 99, 152 105, 153 113 Z" {...ivory(u)} />
      <Smile k={k} x={147} y={122} w={9} />
      <Eye u={u} k={k} x={131} y={104} r={10} />
      <Eye u={u} k={k} x={162} y={103} r={10} />
      <Cheek x={123} y={118} r={6} /><Cheek x={170} y={117} r={6} />
    </g>
  );
}

/* ── Brachiosaurus ───────────────────────────────────────────────────────── */

export function Longneck({ u, k }: ArtProps) {
  const S = skin(u, k);
  return (
    <g>
      <path className="cr-tail" d="M 36 132 C 22 129, 10 122, 2 110 C 3 125, 15 142, 37 150 Z" {...S} />
      <Leg u={u} k={k} x={50} w={17} top={152} back />
      <Leg u={u} k={k} x={102} w={17} top={146} back />
      <Leg u={u} k={k} x={33} w={21} top={148} />
      <Leg u={u} k={k} x={88} w={22} top={144} />
      <ellipse cx="76" cy="138" rx="50" ry="30" transform="rotate(-8 76 138)" {...S} />
      <ellipse cx="80" cy="156" rx="34" ry="10" transform="rotate(-6 80 156)" {...belly(u, k)} />
      <path d="M 96 130 C 101 100, 115 72, 133 52 L 160 58 C 146 78, 134 102, 128 136 Z" {...S} />
      <path d="M 118 132 C 122 107, 134 83, 149 65 L 156 68 C 143 85, 132 107, 127 134 Z" fill={`url(#${u}y)`} />
      <g fill={k.hi} opacity={0.75}>
        <circle cx="56" cy="122" r="5" /><circle cx="74" cy="114" r="6" /><circle cx="93" cy="116" r="4.5" /><circle cx="110" cy="98" r="3.8" /><circle cx="120" cy="82" r="3.2" />
      </g>
      <ellipse cx="150" cy="27" rx="12" ry="9" {...S} />
      <ellipse cx="150" cy="47" rx="27" ry="22" {...S} />
      <Gloss x={139} y={33} rx={9} ry={5} />
      <Smile k={k} x={151} y={58} w={7.5} />
      <Eye u={u} k={k} x={139} y={44} r={9} />
      <Eye u={u} k={k} x={162} y={43} r={9} />
      <Cheek x={131} y={55} r={5.5} /><Cheek x={170} y={54} r={5.5} />
    </g>
  );
}

/* ── Stegosaurus ─────────────────────────────────────────────────────────── */

const STEGO_PLATES: Array<[number, number, number]> = [
  // angle round the body, plate height, plate width
  [218, 15, 13], [238, 21, 17], [258, 25, 19], [278, 25, 19], [298, 21, 17], [318, 16, 13],
];

export function Stego({ u, k }: ArtProps) {
  const S = skin(u, k);
  const plate = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return [84 + Math.cos(a) * 50, 136 + Math.sin(a) * 30, deg] as const;
  };
  return (
    <g>
      {STEGO_PLATES.map(([deg, h, w], i) => {
        const [x, y, d] = plate(deg);
        return (
          <g key={i}>
            <path d={leaf(x, y, d, h, w)} {...accent(u, k)} />
            <path d={leaf(x, y, d, h * 0.62, w * 0.5)} fill={k.accent2} opacity={0.75} />
          </g>
        );
      })}
      <g className="cr-tail">
        <path d={spikePath(16, 118, -125, 15, 7)} {...ivory(u)} />
        <path d={spikePath(24, 114, -88, 14, 7)} {...ivory(u)} />
        <path d={spikePath(10, 127, -160, 12, 6)} {...ivory(u)} />
        <path d={spikePath(19, 128, 160, 11, 6)} {...ivory(u)} />
        <path d="M 40 128 C 26 126, 14 120, 6 110 C 8 124, 20 140, 42 150 Z" {...S} />
      </g>
      <Leg u={u} k={k} x={56} w={19} top={152} back />
      <Leg u={u} k={k} x={114} w={19} top={150} back />
      <Leg u={u} k={k} x={38} w={22} top={148} />
      <Leg u={u} k={k} x={100} w={22} top={150} />
      <ellipse cx="84" cy="136" rx="54" ry="34" {...S} />
      <ellipse cx="88" cy="155" rx="36" ry="11" {...belly(u, k)} />
      <g fill={k.lo} opacity={0.35}><ellipse cx="62" cy="128" rx="6" ry="4" /><ellipse cx="80" cy="120" rx="5" ry="3.6" /><ellipse cx="100" cy="126" rx="5.4" ry="3.8" /></g>
      <Gloss x={66} y={112} rx={16} ry={6} rot={-10} o={0.3} />
      <ellipse cx="148" cy="130" rx="25" ry="23" {...S} />
      <Gloss x={139} y={117} rx={8} ry={4.5} />
      <Smile k={k} x={149} y={140} w={7.5} />
      <Eye u={u} k={k} x={138} y={126} r={8.6} />
      <Eye u={u} k={k} x={159} y={125} r={8.6} />
      <Cheek x={131} y={137} r={5.5} /><Cheek x={166} y={136} r={5.5} />
    </g>
  );
}

/* ── Ankylosaurus ────────────────────────────────────────────────────────── */

const ANKY_SCUTES: Array<[number, number]> = [
  [62, 128], [80, 125], [98, 125], [116, 128],
  [46, 143], [64, 141], [82, 140], [100, 140], [118, 141], [135, 144],
  [37, 158], [55, 157], [73, 156], [91, 156], [109, 156], [127, 157], [144, 159],
];

export function Anky({ u, k }: ArtProps) {
  const S = skin(u, k);
  return (
    <g>
      <g className="cr-tail">
        <path d="M 34 156 C 26 156, 20 153, 16 148 L 21 143 C 24 147, 29 149, 35 149 Z" {...S} />
        <ellipse cx="12" cy="146" rx="12" ry="10" {...accent(u, k)} />
        <Gloss x={9} y={142} rx={5} ry={3} o={0.4} />
      </g>
      <path d={spikePath(36, 150, -168, 10, 8)} {...ivory(u)} />
      <path d={spikePath(44, 132, -145, 10, 8)} {...ivory(u)} />
      <path d={spikePath(137, 132, -40, 10, 8)} {...ivory(u)} />
      <Leg u={u} k={k} x={56} w={18} top={158} back />
      <Leg u={u} k={k} x={110} w={18} top={158} back />
      <Leg u={u} k={k} x={40} w={21} top={158} />
      <Leg u={u} k={k} x={122} w={21} top={158} />
      <path d="M 28 168 C 28 134, 54 112, 90 112 C 126 112, 152 134, 152 168 C 120 173, 60 173, 28 168 Z" {...S} />
      <ellipse cx="92" cy="167" rx="52" ry="6" {...belly(u, k)} />
      {ANKY_SCUTES.map(([x, y], i) => (
        <g key={i}>
          <path d={`M ${x - 7} ${y} Q ${x - 7} ${y - 6.5} ${x} ${y - 7} Q ${x + 7} ${y - 6.5} ${x + 7} ${y} Q ${x + 7} ${y + 6} ${x} ${y + 6.5} Q ${x - 7} ${y + 6} ${x - 7} ${y} Z`}
            fill={`url(#${u}a)`} stroke={k.accentLine} strokeWidth={1.2} opacity={0.9} />
          <path d={`M ${x - 4} ${y - 3} Q ${x} ${y - 6} ${x + 4} ${y - 3}`} fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" opacity={0.45} />
        </g>
      ))}
      {[[60, 120], [84, 114], [108, 116], [128, 124]].map(([x, y], i) => <path key={i} d={spikePath(x, y, -95 + i * 8, 8, 7)} {...ivory(u)} />)}
      <path d={spikePath(141, 134, -125, 11, 8)} {...ivory(u)} />
      <path d={spikePath(171, 133, -55, 11, 8)} {...ivory(u)} />
      <ellipse cx="156" cy="148" rx="25" ry="21" {...S} />
      <Gloss x={147} y={136} rx={8} ry={4.5} />
      <Smile k={k} x={157} y={158} w={7} />
      <Eye u={u} k={k} x={146} y={145} r={8.4} />
      <Eye u={u} k={k} x={167} y={144} r={8.4} />
      <Cheek x={139} y={156} r={5} /><Cheek x={174} y={155} r={5} />
    </g>
  );
}

/* ── The two-legged plant-eaters share a body ───────────────────────────── */

function HadroBody({ u, k, stripes = true }: ArtProps & { stripes?: boolean }) {
  const S = skin(u, k);
  return (
    <g>
      <path className="cr-tail" d="M 68 120 C 46 114, 26 124, 9 142 C 6 147, 10 151, 15 149 C 34 145, 52 150, 72 158 Z" {...S} />
      <path d="M 80 148 C 75 164, 76 176, 81 182 L 100 182 C 103 172, 102 160, 99 148 Z" {...far(k)} />
      <path d="M 96 86 C 122 86, 138 108, 136 136 C 134 164, 118 179, 96 179 C 73 179, 60 164, 60 138 C 60 112, 71 86, 96 86 Z" {...S} />
      <ellipse cx="108" cy="142" rx="18" ry="27" transform="rotate(-12 108 142)" {...belly(u, k)} />
      {stripes && <g fill="none" stroke={k.accent2} strokeWidth={4.5} strokeLinecap="round" opacity={0.75}>
        <path d="M 66 116 q 6 -2 9 -8" /><path d="M 62 132 q 7 -2 10 -9" /><path d="M 62 148 q 7 -2 10 -9" />
      </g>}
      <ellipse cx="111" cy="157" rx="18" ry="20" {...S} />
      <path d="M 97 177 C 97 170, 105 167, 115 167 C 126 167, 134 171, 134 177 C 134 182, 126 184, 115 184 C 104 184, 97 182, 97 177 Z" {...S} />
      <Toes u={u} x={120} y={180} />
      <path d="M 122 116 C 134 112, 146 120, 145 132 C 144 138, 137 139, 135 134 C 134 129, 130 126, 124 128 Z" {...S} />
    </g>
  );
}

/* ── Parasaurolophus ─────────────────────────────────────────────────────── */

export function Para({ u, k }: ArtProps) {
  const S = skin(u, k);
  return (
    <g>
      <HadroBody u={u} k={k} />
      <path d="M 102 52 C 90 37, 74 27, 55 24 C 46 23, 44 34, 52 37 C 69 41, 83 50, 94 64 Z" {...accent(u, k)} />
      <path d="M 92 50 C 82 42, 70 36, 57 33" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" opacity={0.45} />
      <ellipse cx="121" cy="70" rx="35" ry="32" {...S} />
      <ellipse cx="150" cy="84" rx="20" ry="13" fill={`url(#${u}y)`} stroke={k.line} strokeWidth={2.4} />
      <Gloss x={104} y={52} rx={11} ry={6} />
      <circle cx="160" cy="80" r="1.7" fill={k.line} /><circle cx="165" cy="83" r="1.7" fill={k.line} />
      <Smile k={k} x={150} y={87} w={10} />
      <Eye u={u} k={k} x={108} y={65} r={10.5} />
      <Eye u={u} k={k} x={135} y={63} r={11} />
      <Cheek x={98} y={83} r={6} /><Cheek x={133} y={81} r={6} />
    </g>
  );
}

/* ── Pachycephalosaurus ──────────────────────────────────────────────────── */

export function Pachy({ u, k }: ArtProps) {
  const S = skin(u, k);
  const knobs = [94, 103, 112, 121, 130, 139, 148];
  return (
    <g>
      <HadroBody u={u} k={k} stripes={false} />
      <g fill={k.accent2} opacity={0.55}><circle cx="70" cy="118" r="4.5" /><circle cx="66" cy="136" r="3.6" /><circle cx="78" cy="104" r="3.4" /></g>
      {[[90, 64, -160], [92, 52, -140], [100, 41, -120], [146, 44, -60], [152, 56, -35], [154, 68, -15]].map(([x, y, d], i) =>
        <path key={i} d={spikePath(x, y, d, 8, 7)} {...accent(u, k)} />)}
      <path d="M 87 76 C 87 44, 102 26, 121 26 C 140 26, 155 44, 155 76 C 155 94, 140 105, 121 105 C 102 105, 87 94, 87 76 Z" {...S} />
      <path d="M 89 66 C 90 40, 104 27, 121 27 C 138 27, 152 40, 153 66 C 138 59, 104 59, 89 66 Z" fill={`url(#${u}c)`} stroke={k.line} strokeWidth={2.2} strokeLinejoin="round" />
      <Gloss x={110} y={37} rx={13} ry={6.5} o={0.55} />
      {knobs.map((x, i) => <circle key={i} cx={x} cy={65.5 - Math.sin((i / 6) * Math.PI) * 3.2} r={3.4} fill={k.accent2} stroke={k.line} strokeWidth={1.2} />)}
      <Smile k={k} x={124} y={92} w={8} />
      <Eye u={u} k={k} x={109} y={78} r={10} />
      <Eye u={u} k={k} x={136} y={77} r={10.4} />
      <Cheek x={98} y={90} r={6} /><Cheek x={147} y={89} r={6} />
    </g>
  );
}

/* ── Velociraptor ────────────────────────────────────────────────────────── */

export function Raptor({ u, k }: ArtProps) {
  const S = skin(u, k);
  const A = accent(u, k);
  return (
    <g>
      <g className="cr-tail">
        <path d={leaf(16, 100, -160, 20, 9)} {...A} />
        <path d={leaf(15, 104, 175, 22, 9)} {...A} />
        <path d={leaf(17, 108, 150, 18, 8)} {...A} />
        <path d="M 72 112 C 52 104, 34 99, 16 99 C 10 100, 9 108, 15 110 C 32 114, 52 126, 74 140 Z" {...S} />
      </g>
      <path d="M 80 148 L 76 172 C 75 178, 78 182, 84 182 L 96 182 C 98 177, 94 172, 92 168 L 94 148 Z" {...far(k)} />
      <path d="M 92 92 C 114 92, 124 110, 122 132 C 120 154, 106 164, 90 164 C 72 164, 62 150, 62 130 C 62 108, 72 92, 92 92 Z" {...S} />
      <ellipse cx="101" cy="133" rx="13" ry="20" transform="rotate(-10 101 133)" {...belly(u, k)} />
      <g fill="none" stroke={k.lo} strokeWidth={4} strokeLinecap="round" opacity={0.8}>
        <path d="M 70 110 q 6 2 10 -4" /><path d="M 66 124 q 6 2 10 -4" /><path d="M 66 138 q 6 2 10 -4" />
      </g>
      <ellipse cx="100" cy="151" rx="15" ry="17" {...S} />
      <path d="M 92 177 C 92 171, 99 168, 108 168 C 119 168, 127 172, 127 177 C 127 182, 119 184, 108 184 C 98 184, 92 182, 92 177 Z" {...S} />
      <Toes u={u} x={113} y={180} n={2} gap={6} />
      <path d="M 104 170 C 103 162, 108 158, 113 161" fill="none" stroke="#fff6dd" strokeWidth={3.2} strokeLinecap="round" />
      <path d="M 104 170 C 103 162, 108 158, 113 161" fill="none" stroke="#a8875a" strokeWidth={1} strokeLinecap="round" opacity={0.6} />
      <path d={leaf(118, 130, 110, 14, 7)} {...A} />
      <path d={leaf(124, 129, 80, 13, 7)} {...A} />
      <path d="M 110 116 C 120 112, 132 118, 132 128 C 132 133, 127 134, 125 130 C 124 126, 120 124, 113 125 Z" {...S} />
      <path d={leaf(104, 48, -130, 20, 9)} {...A} />
      <path d={leaf(110, 44, -105, 22, 9)} {...A} />
      <path d={leaf(98, 54, -155, 17, 8)} {...A} />
      <path d="M 98 68 C 98 50, 111 41, 126 41 C 140 41, 150 49, 154 61 C 164 63, 173 70, 173 79 C 173 89, 163 93, 151 93 C 141 99, 129 99, 118 97 C 104 95, 98 83, 98 68 Z" {...S} />
      <Gloss x={112} y={50} rx={11} ry={5.5} />
      <circle cx="165" cy="72" r="1.7" fill={k.line} />
      <Grin u={u} k={k} x={150} y={82} w={13} teeth={1} />
      <Eye u={u} k={k} x={114} y={63} r={9.6} />
      <Eye u={u} k={k} x={137} y={61} r={10} />
      <Cheek x={106} y={78} r={5.5} /><Cheek x={135} y={77} r={5.5} />
    </g>
  );
}

/* ── Pteranodon (a flying reptile, not a dinosaur, and proud of it) ─────── */

export function Ptero({ u, k }: ArtProps) {
  const S = skin(u, k);
  return (
    <g>
      <defs>
        <linearGradient id={`${u}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={k.accent2} />
          <stop offset="1" stopColor={k.body} />
        </linearGradient>
      </defs>
      <g className="cr-wing-l">
        <path d="M 92 100 C 72 84, 44 66, 8 58 C 14 74, 22 90, 34 104 C 42 102, 46 106, 48 112 C 56 108, 62 112, 64 118 C 72 114, 80 116, 92 122 Z" fill={`url(#${u}w)`} stroke={k.line} strokeWidth={2.6} strokeLinejoin="round" />
        <path d="M 92 100 C 72 84, 44 66, 8 58" fill="none" stroke={k.lo} strokeWidth={4.5} strokeLinecap="round" />
        <path d="M 56 80 l -5 -5 M 56 80 l 0 -7" stroke="#fff6dd" strokeWidth={2.6} strokeLinecap="round" />
      </g>
      <g className="cr-wing-r">
        <path d="M 108 100 C 128 84, 156 66, 192 58 C 186 74, 178 90, 166 104 C 158 102, 154 106, 152 112 C 144 108, 138 112, 136 118 C 128 114, 120 116, 108 122 Z" fill={`url(#${u}w)`} stroke={k.line} strokeWidth={2.6} strokeLinejoin="round" />
        <path d="M 108 100 C 128 84, 156 66, 192 58" fill="none" stroke={k.lo} strokeWidth={4.5} strokeLinecap="round" />
        <path d="M 144 80 l 5 -5 M 144 80 l 0 -7" stroke="#fff6dd" strokeWidth={2.6} strokeLinecap="round" />
      </g>
      <path d="M 93 136 l -3 10 M 107 136 l 3 10" stroke={k.line} strokeWidth={5} strokeLinecap="round" />
      <path d="M 93 136 l -3 10 M 107 136 l 3 10" stroke={k.body} strokeWidth={2.4} strokeLinecap="round" />
      <ellipse cx="100" cy="117" rx="19" ry="25" {...S} />
      <ellipse cx="102" cy="123" rx="11" ry="15" {...belly(u, k)} />
      <path d="M 94 68 C 80 54, 62 42, 40 34 C 48 52, 64 70, 86 84 Z" {...accent(u, k)} />
      <path d="M 112 75 C 134 75, 157 80, 178 89 C 159 94, 136 93, 114 91 Z" {...ivory(u)} />
      <ellipse cx="100" cy="78" rx="21" ry="19" {...S} />
      <Gloss x={91} y={66} rx={8} ry={4.5} />
      <Smile k={k} x={101} y={88} w={5.5} />
      <Eye u={u} k={k} x={93} y={76} r={8.6} />
      <Eye u={u} k={k} x={110} y={75} r={8.2} />
      <Cheek x={87} y={87} r={4.6} /><Cheek x={115} y={86} r={4.6} />
    </g>
  );
}

/* ── Spinosaurus ─────────────────────────────────────────────────────────── */

export function Spino({ u, k }: ArtProps) {
  const S = skin(u, k);
  return (
    <g>
      <path d="M 58 126 C 52 92, 64 50, 92 40 C 110 34, 124 47, 123 71 C 123 87, 119 100, 115 111 Z" {...accent(u, k)} />
      <path d="M 66 74 C 72 56, 84 45, 96 43 C 108 41, 118 50, 119 64" fill="none" stroke={k.accent2} strokeWidth={5} strokeLinecap="round" opacity={0.8} />
      <g stroke={k.accentLine} strokeWidth={2} strokeLinecap="round" opacity={0.55}>
        <path d="M 70 118 L 66 74" /><path d="M 80 112 L 79 54" /><path d="M 92 107 L 95 44" /><path d="M 104 105 L 111 54" /><path d="M 113 107 L 120 78" />
      </g>
      <g className="cr-tail">
        <path d="M 50 128 C 40 116, 26 115, 14 127 Z" {...accent(u, k)} />
        <path d="M 66 124 C 44 118, 24 126, 6 140 C 12 150, 30 154, 68 160 Z" {...S} />
      </g>
      <path d="M 80 150 C 75 165, 76 176, 81 182 L 100 182 C 103 172, 102 160, 99 150 Z" {...far(k)} />
      <path d="M 94 92 C 122 92, 136 114, 134 140 C 132 166, 116 180, 94 180 C 70 180, 58 164, 58 140 C 58 114, 68 92, 94 92 Z" {...S} />
      <ellipse cx="107" cy="146" rx="18" ry="25" transform="rotate(-12 107 146)" {...belly(u, k)} />
      <ellipse cx="110" cy="158" rx="18" ry="20" {...S} />
      <path d="M 96 177 C 96 170, 104 167, 114 167 C 126 167, 134 171, 134 177 C 134 182, 126 184, 114 184 C 103 184, 96 182, 96 177 Z" {...S} />
      <Toes u={u} x={119} y={180} />
      <path d="M 120 120 C 132 116, 144 124, 143 136 C 142 142, 135 143, 133 138 C 132 133, 128 130, 122 132 Z" {...S} />
      <path d="M 108 66 C 108 50, 118 42, 132 42 C 146 42, 154 50, 157 60 L 182 65 C 191 67, 193 78, 186 82 L 157 89 C 151 96, 141 98, 131 98 C 117 98, 108 86, 108 66 Z" {...S} />
      <Gloss x={121} y={50} rx={10} ry={5} />
      <circle cx="184" cy="70" r="1.8" fill={k.line} />
      <path d="M 152 84 Q 168 89 184 80" fill="none" stroke={k.line} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M 160 86 l 1.6 4 l 1.6 -3.6 M 172 85 l 1.6 4 l 1.6 -4" fill="#fff" stroke="#fff" strokeWidth={1} strokeLinejoin="round" />
      <Eye u={u} k={k} x={123} y={63} r={10.4} />
      <Eye u={u} k={k} x={146} y={61} r={10.6} />
      <Cheek x={116} y={79} r={5.6} /><Cheek x={150} y={78} r={5.6} />
    </g>
  );
}

/* ── Plesiosaur (a sea reptile from dinosaur times) ──────────────────────── */

export function Plesio({ u, k }: ArtProps) {
  const S = skin(u, k);
  const F = accent(u, k);
  return (
    <g>
      <g className="cr-swim">
        <path d="M 120 152 C 134 156, 150 164, 160 174 C 148 177, 132 172, 116 162 Z" {...far(k)} />
        <path d="M 74 152 C 64 157, 52 165, 44 175 C 57 176, 68 171, 78 162 Z" {...far(k)} />
        <path className="cr-tail" d="M 44 142 C 30 142, 18 138, 8 130 C 12 142, 24 153, 46 155 Z" {...S} />
        <ellipse cx="86" cy="145" rx="46" ry="26" {...S} />
        <ellipse cx="92" cy="160" rx="30" ry="8" {...belly(u, k)} />
        <g fill={k.accent2} opacity={0.7}><circle cx="66" cy="132" r="4.5" /><circle cx="84" cy="126" r="5.2" /><circle cx="102" cy="130" r="3.8" /></g>
        <path d="M 104 154 C 120 156, 138 164, 150 176 C 137 180, 119 176, 100 166 Z" {...F} />
        <path d="M 64 156 C 52 160, 36 170, 26 180 C 41 182, 57 176, 70 166 Z" {...F} />
        <path d="M 102 132 C 108 106, 119 82, 136 64 L 157 70 C 143 87, 133 111, 128 140 Z" {...S} />
        <path d="M 122 136 C 126 112, 136 90, 150 74 L 155 76 C 142 92, 133 113, 129 138 Z" fill={`url(#${u}y)`} />
        <ellipse cx="148" cy="57" rx="23" ry="20" {...S} />
        <Gloss x={139} y={45} rx={8} ry={4.5} />
        <Smile k={k} x={149} y={67} w={7.5} />
        <Eye u={u} k={k} x={138} y={54} r={8.6} />
        <Eye u={u} k={k} x={159} y={53} r={8.8} />
        <Cheek x={131} y={65} r={5} /><Cheek x={166} y={64} r={5} />
      </g>
      <ellipse cx="96" cy="176" rx="86" ry="15" fill="#c4f3ff" opacity={0.42} />
      <path d="M 14 172 C 30 165, 44 165, 58 171 C 72 177, 84 177, 98 171 C 112 165, 126 165, 140 171 C 154 177, 168 177, 182 171" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" opacity={0.85} />
      <path d="M 36 184 C 46 180, 56 180, 66 184 M 120 185 C 130 181, 140 181, 150 185" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
    </g>
  );
}

export function CrystalRex(props: ArtProps) {
  return <Rex {...props} crystal />;
}
