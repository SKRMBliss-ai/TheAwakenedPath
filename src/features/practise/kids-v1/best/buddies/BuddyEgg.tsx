import { useId } from 'react';
import type { Rarity, WorldId } from '../../../../kids/buddies';

/*
  A buddy egg. Each world lays its own (speckled for Dino Island, starry for
  Unicorn Sky, wavy for Ocean Reef, a night-sky shell for Star Station), and
  an egg holding something special looks special: rare ones shimmer blue,
  epic ones purple, and a legendary egg is gold. Knowing a golden egg is coming
  is half the fun of it.
*/

const EGG = 'M50 4 C 76 4, 92 44, 92 72 C 92 100, 72 116, 50 116 C 28 116, 8 100, 8 72 C 8 44, 24 4, 50 4 Z';
const TOP = 'M8 64 C 8 44, 24 4, 50 4 C 76 4, 92 44, 92 64 L 82 56 L 72 66 L 62 56 L 50 66 L 38 56 L 28 66 L 18 56 Z';
const BOTTOM = 'M8 64 L 18 56 L 28 66 L 38 56 L 50 66 L 62 56 L 72 66 L 82 56 L 92 64 C 92 100, 72 116, 50 116 C 28 116, 8 100, 8 64 Z';
const CRACKS = [
  'M46 30 L 52 40 L 45 48 L 53 56',
  'M53 56 L 62 60 L 70 54 M45 48 L 36 52 L 30 46',
  'M70 54 L 80 62 L 88 58 M30 46 L 20 56 L 12 60',
];

const SHELLS: Record<WorldId, { shell: [string, string]; line: string }> = {
  dino: { shell: ['#fffbea', '#e3cf96'], line: '#9c7a3c' },
  magic: { shell: ['#fff4fd', '#dcbcff'], line: '#8a5ac8' },
  ocean: { shell: ['#f0fdff', '#93def2'], line: '#2f8fb8' },
  space: { shell: ['#a99cff', '#3a2a8c'], line: '#1f1458' },
};
const RARE_SHELL: Partial<Record<Rarity, [string, string]>> = {
  legendary: ['#fff6c2', '#f2b02c'],
};

function Pattern({ world }: { world: WorldId }) {
  switch (world) {
    case 'dino':
      return (
        <g>
          <g fill="#7cc06a" opacity={0.75}><ellipse cx="32" cy="40" rx="6" ry="4.5" /><ellipse cx="66" cy="30" rx="4.5" ry="3.4" /><ellipse cx="72" cy="80" rx="7" ry="5" /><ellipse cx="30" cy="88" rx="5" ry="3.6" /></g>
          <g fill="#b0864a" opacity={0.6}><circle cx="52" cy="98" r="3.2" /><circle cx="56" cy="58" r="2.8" /><circle cx="22" cy="64" r="2.4" /><circle cx="80" cy="54" r="2.6" /></g>
        </g>
      );
    case 'magic':
      return (
        <g fill="#ffb3e6">
          {[[30, 40, 6], [66, 30, 4.5], [72, 82, 6.5], [32, 90, 5], [54, 60, 4]].map(([x, y, r], i) => (
            <path key={i} d={`M ${x} ${y - r} Q ${x + r * 0.25} ${y - r * 0.25} ${x + r} ${y} Q ${x + r * 0.25} ${y + r * 0.25} ${x} ${y + r} Q ${x - r * 0.25} ${y + r * 0.25} ${x - r} ${y} Q ${x - r * 0.25} ${y - r * 0.25} ${x} ${y - r} Z`}
              fill={i % 2 ? '#ffe27a' : '#ffb3e6'} />
          ))}
        </g>
      );
    case 'ocean':
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M 12 52 C 24 44, 36 60, 50 52 C 64 44, 76 60, 88 52" stroke="#5ac8f0" strokeWidth={5} opacity={0.75} />
          <path d="M 12 82 C 24 74, 36 90, 50 82 C 64 74, 76 90, 88 82" stroke="#5ac8f0" strokeWidth={5} opacity={0.6} />
          <circle cx="34" cy="30" r="4" stroke="#fff" strokeWidth={2} /><circle cx="64" cy="100" r="3" stroke="#fff" strokeWidth={2} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M 9 70 C 30 78, 70 78, 91 70" fill="none" stroke="#ffd25c" strokeWidth={6} opacity={0.85} />
          <g fill="#fff">{[[30, 34, 1.8], [62, 24, 1.4], [72, 46, 2.2], [26, 56, 1.3], [44, 96, 1.8], [70, 92, 1.4], [52, 44, 1.2]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
        </g>
      );
  }
}

export function BuddyEgg({ world, rarity = 'common', crack = 0, open = false, size, className = '' }: {
  world: WorldId; rarity?: Rarity; crack?: number; open?: boolean; size?: number | string; className?: string;
}) {
  const uid = `e${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const base = SHELLS[world];
  const shell = RARE_SHELL[rarity] ?? base.shell;
  const line = rarity === 'legendary' ? '#b87a0c' : base.line;
  const fill = `url(#${uid}g)`;
  return (
    <svg className={`be ${className}`} viewBox="0 0 100 120" width={size} height={size} aria-hidden="true" focusable="false" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id={`${uid}g`} cx=".36" cy=".28" r=".85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".3" stopColor={shell[0]} />
          <stop offset="1" stopColor={shell[1]} />
        </radialGradient>
        <clipPath id={`${uid}k`}><path d={EGG} /></clipPath>
        <clipPath id={`${uid}t`}><path d={TOP} /></clipPath>
        <clipPath id={`${uid}b`}><path d={BOTTOM} /></clipPath>
      </defs>
      {open ? (
        <>
          <g clipPath={`url(#${uid}b)`}><path d={EGG} fill={fill} /><Pattern world={world} /></g>
          <path d={BOTTOM} fill="none" stroke={line} strokeWidth={2.4} strokeLinejoin="round" />
          <g className="be-lid" clipPath={`url(#${uid}t)`}><path d={EGG} fill={fill} /><Pattern world={world} /></g>
        </>
      ) : (
        <>
          <path d={EGG} fill={fill} />
          <g clipPath={`url(#${uid}k)`}>
            <Pattern world={world} />
            <ellipse cx="34" cy="30" rx="12" ry="19" fill="#fff" opacity={0.5} transform="rotate(-24 34 30)" />
            {rarity !== 'common' && <rect className="be-shine" x="-30" y="-10" width="16" height="140" fill="#fff" opacity={0.55} />}
          </g>
          <path d={EGG} fill="none" stroke={line} strokeWidth={2.6} />
          {CRACKS.slice(0, crack).map((d, i) => <path key={i} d={d} fill="none" stroke={line} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />)}
        </>
      )}
    </svg>
  );
}
