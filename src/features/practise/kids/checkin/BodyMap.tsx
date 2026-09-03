import type { BodyZoneId } from './content';

/** The body silhouette + tappable zones — ported from the prototype's p02 screen. */
export function BodyMap({ selected, onPick }: { selected: BodyZoneId | null; onPick: (zone: BodyZoneId) => void }) {
  const zone = (id: BodyZoneId, on: boolean, children: React.ReactNode) => (
    <g
      className="cursor-pointer"
      onClick={() => onPick(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPick(id); }}
    >
      <g style={{ transition: 'all 220ms ease' }}>
        {children}
      </g>
      {on && <title>{id}</title>}
    </g>
  );

  const ring = (cx: number, cy: number, r: number, on: boolean) => (
    <circle
      cx={cx} cy={cy} r={r}
      fill={on ? 'rgba(255,206,138,0.4)' : 'rgba(255,255,255,0.07)'}
      stroke={on ? '#ffdca8' : 'rgba(255,255,255,0.36)'}
      strokeWidth={on ? 2.6 : 2}
      strokeDasharray={on ? undefined : '4 5'}
    />
  );

  return (
    <div className="relative mx-auto mt-1.5 w-[222px]" style={{ height: 238 }}>
      <svg viewBox="0 0 222 238" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <g fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.38)" strokeWidth={2} strokeLinejoin="round">
          <circle cx="111" cy="36" r="26" />
          <path d="M111 62 q-29 2-33 24 l-6 56 q-1 9 8 10 l2 40 q0 7 7 7 h44 q7 0 7-7 l2-40 q9-1 8-10 l-6-56 q-4-22-33-24z" />
          <path d="M76 90 q-15 7-17 27 l-6 36 q-1 8 7 9 q7 1 9-7 l6-34z" />
          <path d="M146 90 q15 7 17 27 l6 36 q1 8-7 9 q-7 1-9-7 l-6-34z" />
        </g>

        {zone('head', selected === 'head', (
          <>
            {ring(111, 36, 28, selected === 'head')}
            <text x="111" y="6" textAnchor="middle" fontSize={12} fontWeight={800} fill="rgba(253,252,255,.9)">head</text>
          </>
        ))}
        {zone('heart', selected === 'heart', (
          <>
            {ring(111, 100, 25, selected === 'heart')}
            <text x="111" y="104" textAnchor="middle" fontSize={12} fontWeight={800} fill="rgba(253,252,255,.9)">chest</text>
          </>
        ))}
        {zone('tummy', selected === 'tummy', (
          <>
            {ring(111, 154, 25, selected === 'tummy')}
            <text x="111" y="158" textAnchor="middle" fontSize={12} fontWeight={800} fill="rgba(253,252,255,.9)">tummy</text>
          </>
        ))}
        {zone('hands', selected === 'hands', (
          <>
            {ring(42, 166, 23, selected === 'hands')}
            {ring(180, 166, 23, selected === 'hands')}
            <text x="42" y="202" textAnchor="middle" fontSize={12} fontWeight={800} fill="rgba(253,252,255,.9)">hands</text>
            <text x="180" y="202" textAnchor="middle" fontSize={12} fontWeight={800} fill="rgba(253,252,255,.9)">hands</text>
          </>
        ))}
      </svg>
    </div>
  );
}
