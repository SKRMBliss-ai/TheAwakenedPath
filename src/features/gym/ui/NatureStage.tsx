import type { ReactNode } from 'react';

/**
 * The nature backdrop behind the Kids/Adult gym cards on /mindgymforall,
 * matching the reference mockup's forest-and-pond scene behind that column.
 *
 * DRAWN, NOT PHOTOGRAPHED. A commissioned photo/illustration (the same
 * ChatGPT pipeline as the two characters — see scripts/prepare-gym-art.mjs)
 * would read closer to the reference's painterly detail, and is a fine
 * upgrade later: swap the <svg> below for an <img> and nothing around it
 * moves. Coded for now because it ships immediately with no round trip, adds
 * ~1KB instead of another asset, stays crisp at any size or zoom, and is
 * trivially recoloured from the same --gym-* tokens as everything else here —
 * a photo would need art-directing to match the palette exactly.
 *
 * DELIBERATELY NOT behind the hero text. .agent/rules/
 * accessibility-in-dark-glow-environment.md requires text stay readable even
 * against a low-intensity background; a busy scene under body copy risks
 * exactly that, and it's not where the reference puts it either — the
 * headline stays on the plain cream ground, only the card column sits on the
 * scene.
 */
export function NatureStage({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        borderRadius: 'var(--gym-radius-panel)',
        // A hairline frame so the scene has an edge on the cream page, same
        // language as every other panel in the gym.
        border: '1px solid var(--gym-line)',
        boxShadow: 'var(--gym-shadow-soft)',
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="gym-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EAF3EC" />
            <stop offset="55%" stopColor="#DCEEE2" />
            <stop offset="100%" stopColor="#CFE8DC" />
          </linearGradient>
          <linearGradient id="gym-pond" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BFE1D6" />
            <stop offset="100%" stopColor="#A9D6C9" />
          </linearGradient>
          <radialGradient id="gym-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF6DE" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFF6DE" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="400" height="600" fill="url(#gym-sky)" />
        <circle cx="320" cy="90" r="70" fill="url(#gym-sun)" />

        {/* far hills */}
        <path d="M0 260 Q70 210 150 245 T400 235 V420 H0 Z" fill="#B9DCC9" opacity="0.75" />
        {/* near hills */}
        <path d="M0 320 Q90 275 200 305 T400 290 V430 H0 Z" fill="#8FC7AC" opacity="0.85" />

        {/* pond band, with the near hills reflected as soft horizontal bands */}
        <rect x="0" y="420" width="400" height="180" fill="url(#gym-pond)" />
        <g opacity="0.35" stroke="#EAF6EF" strokeWidth="3" strokeLinecap="round">
          <line x1="30" y1="450" x2="110" y2="450" />
          <line x1="150" y1="470" x2="260" y2="470" />
          <line x1="60" y1="495" x2="180" y2="495" />
          <line x1="230" y1="450" x2="330" y2="450" />
          <line x1="40" y1="530" x2="150" y2="530" />
          <line x1="220" y1="510" x2="340" y2="510" />
        </g>

        {/* tree clusters — same layered-canopy language as GymMark's logo tree */}
        {[
          { x: 46, y: 400, s: 1.0 },
          { x: 356, y: 392, s: 1.15 },
          { x: 20, y: 330, s: 0.6 },
          { x: 380, y: 320, s: 0.55 },
        ].map((t, i) => (
          <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.s})`} opacity="0.9">
            <path d="M0 46v-22" stroke="#4F7D5F" strokeWidth="4" strokeLinecap="round" />
            <circle cx="0" cy="8" r="17" fill="#5E9973" />
            <circle cx="-13" cy="16" r="11" fill="#4F7D5F" />
            <circle cx="13" cy="13" r="12" fill="#6BA97F" />
          </g>
        ))}

        {/* birds */}
        <g stroke="#4F7D5F" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55">
          <path d="M60 90 q8 -10 16 0 q8 -10 16 0" />
          <path d="M300 150 q6 -8 12 0 q6 -8 12 0" />
          <path d="M120 60 q5 -7 10 0 q5 -7 10 0" />
        </g>
      </svg>

      {/* Fade to the page's own cream at the top edge, so the stage reads as
          rising out of the section rather than a hard-edged photo dropped in. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-10"
        style={{ background: 'linear-gradient(180deg, var(--gym-bg) 0%, transparent 100%)' }}
      />

      <div className="relative p-4 sm:p-5">{children}</div>
    </div>
  );
}
