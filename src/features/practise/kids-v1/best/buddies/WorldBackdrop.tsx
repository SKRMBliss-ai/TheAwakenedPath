import type { WorldId } from '../../../../kids/buddies';

/* The scenery behind each world's collection: a volcano and palms for Dino
   Island, clouds and a rainbow for Unicorn Sky, waves and weed for Ocean Reef,
   planets and stars for Star Station. Soft and low, so the creatures stay the
   brightest thing on the page. */
export function WorldBackdrop({ world }: { world: WorldId }) {
  return (
    <svg className="wb" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      {world === 'dino' && (
        <g>
          <circle cx="1250" cy="230" r="120" fill="#fff3c4" opacity=".35" />
          <path d="M 900 760 L 1150 330 C 1170 300, 1230 300, 1250 330 L 1500 760 Z" fill="#7a3f5c" opacity=".55" />
          <path d="M 1150 330 C 1170 300, 1230 300, 1250 330 L 1225 380 L 1200 350 L 1175 385 Z" fill="#ff8a4a" opacity=".8" />
          <path d="M 1190 300 C 1170 240, 1220 200, 1200 140 M 1215 296 C 1240 236, 1210 190, 1236 130" stroke="#fff" strokeWidth="18" strokeLinecap="round" opacity=".18" fill="none" />
          <path d="M 0 760 C 200 700, 420 720, 620 690 C 840 660, 1100 700, 1600 670 L 1600 900 L 0 900 Z" fill="#3c7a4a" opacity=".55" />
          {[[160, 690], [330, 700], [1440, 660]].map(([x, y], i) => (
            <g key={i} opacity=".55">
              <path d={`M ${x} ${y} C ${x + 6} ${y - 90}, ${x - 10} ${y - 170}, ${x + 14} ${y - 230}`} stroke="#4a2f3a" strokeWidth="16" fill="none" strokeLinecap="round" />
              {[-150, -110, -60, -20, 20].map((a, j) => (
                <path key={j} d={`M ${x + 14} ${y - 230} q ${Math.cos((a * Math.PI) / 180) * 70} ${Math.sin((a * Math.PI) / 180) * 70 - 20} ${Math.cos((a * Math.PI) / 180) * 120} ${Math.sin((a * Math.PI) / 180) * 120 + 30}`}
                  stroke="#2f6a3a" strokeWidth="26" fill="none" strokeLinecap="round" />
              ))}
            </g>
          ))}
        </g>
      )}
      {world === 'magic' && (
        <g>
          {['#ff9a9a', '#ffc27a', '#ffe680', '#9ee89a', '#8fd0ff', '#c4a6ff'].map((c, i) => (
            <path key={c} d={`M ${180 + i * 26} 820 A ${640 - i * 26} ${640 - i * 26} 0 0 1 ${1420 - i * 26} 820`} stroke={c} strokeWidth="26" fill="none" opacity=".35" />
          ))}
          {[[220, 250, 1], [1260, 180, 1.3], [760, 120, 0.8]].map(([x, y, s], i) => (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" opacity=".55">
              <circle cx="0" cy="0" r="48" /><circle cx="56" cy="-18" r="58" /><circle cx="118" cy="4" r="44" /><rect x="0" y="0" width="118" height="44" />
            </g>
          ))}
          <path d="M 0 790 C 300 740, 600 780, 900 750 C 1200 720, 1400 760, 1600 740 L 1600 900 L 0 900 Z" fill="#fff" opacity=".35" />
        </g>
      )}
      {world === 'ocean' && (
        <g>
          {[[0, 260], [0, 420]].map(([x, y], i) => (
            <path key={i} d={`M ${x} ${y} C 200 ${y - 40}, 400 ${y + 40}, 600 ${y} C 800 ${y - 40}, 1000 ${y + 40}, 1200 ${y} C 1400 ${y - 40}, 1500 ${y + 30}, 1600 ${y}`} stroke="#fff" strokeWidth="5" fill="none" opacity=".18" />
          ))}
          {[120, 260, 1380, 1500].map((x, i) => (
            <path key={x} d={`M ${x} 900 C ${x - 40} 800, ${x + 40} 740, ${x} ${640 - i * 30} C ${x + 30} 720, ${x - 20} 800, ${x + 20} 900 Z`} fill="#2fa36a" opacity=".45" />
          ))}
          {[[300, 600, 14], [340, 520, 9], [1300, 480, 16], [1340, 400, 10], [900, 300, 8]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} stroke="#fff" strokeWidth="3" fill="none" opacity=".45" />
          ))}
          <path d="M 0 800 C 300 770, 700 810, 1000 780 C 1300 760, 1450 790, 1600 780 L 1600 900 L 0 900 Z" fill="#f2d99a" opacity=".4" />
        </g>
      )}
      {world === 'space' && (
        <g>
          {Array.from({ length: 60 }, (_, i) => (
            <circle key={i} cx={(i * 263) % 1600} cy={(i * 151) % 820} r={i % 5 === 0 ? 3 : 1.6} fill="#fff" opacity={i % 3 === 0 ? 0.9 : 0.5} />
          ))}
          <circle cx="1320" cy="220" r="90" fill="#ff9a5a" opacity=".5" />
          <ellipse cx="1320" cy="220" rx="150" ry="28" stroke="#c4a6ff" strokeWidth="12" fill="none" opacity=".5" transform="rotate(-14 1320 220)" />
          <circle cx="240" cy="160" r="46" fill="#e6e1ff" opacity=".35" />
          <path d="M 0 800 C 400 760, 800 820, 1200 780 C 1400 760, 1500 790, 1600 780 L 1600 900 L 0 900 Z" fill="#9a8cff" opacity=".25" />
        </g>
      )}
    </svg>
  );
}
