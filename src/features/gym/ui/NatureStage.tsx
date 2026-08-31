import type { ReactNode } from 'react';

/**
 * The nature backdrop behind the Kids/Adult gym cards on /mindgymforall.
 *
 * FULL-BLEED, not a framed inset panel — it fills the entire card region
 * edge to edge, top to bottom (stretched to match the hero text column's
 * height on desktop via the parent grid's `items-stretch`), the way the
 * reference image has it: no border, no rounded frame, no boxed shadow
 * separating it from the page. The two cards float directly on top of it.
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
 * STILL NOT behind the hero headline/body copy — that stays on the plain
 * cream ground in the left column. .agent/rules/
 * accessibility-in-dark-glow-environment.md requires text stay readable even
 * against a low-intensity background, and painting a busy scene directly
 * under body paragraphs is exactly the risk that rule exists to avoid.
 */
export function NatureStage({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative h-full min-h-[420px] overflow-hidden"
      style={{
        borderRadius: 'var(--gym-radius-panel)',
        background: 'linear-gradient(180deg, #EAF3EC 0%, #DCEEE2 45%, #A9D6C9 100%)',
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 480"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id="gym-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EAF3EC" />
            <stop offset="45%" stopColor="#DCEEE2" />
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

        <rect width="400" height="480" fill="url(#gym-sky)" />

        {/*
          Elements are spread across a broad y=40..480 band (not clustered
          only near the bottom) on purpose. This box gets `slice`-cropped to
          wildly different aspect ratios — a tall single column on a phone,
          a wide short strip on desktop where it matches the hero text
          column's height — and a scene concentrated in one narrow band
          would vanish entirely under some crops. Spreading hills, trees and
          a bird across most of the height means every realistic crop still
          shows a real scene, not empty sky.
        */}
        <circle cx="330" cy="70" r="52" fill="url(#gym-sun)" />

        {/* far hills */}
        <path d="M0 210 Q70 165 150 195 T400 185 V400 H0 Z" fill="#B9DCC9" opacity="0.75" />
        {/* near hills */}
        <path d="M0 265 Q90 225 200 250 T400 235 V410 H0 Z" fill="#8FC7AC" opacity="0.85" />

        {/* pond band, with the near hills reflected as soft horizontal bands */}
        <rect x="0" y="370" width="400" height="110" fill="url(#gym-pond)" />
        <g opacity="0.35" stroke="#EAF6EF" strokeWidth="3" strokeLinecap="round">
          <line x1="30" y1="392" x2="110" y2="392" />
          <line x1="150" y1="408" x2="260" y2="408" />
          <line x1="60" y1="430" x2="180" y2="430" />
          <line x1="230" y1="392" x2="330" y2="392" />
          <line x1="40" y1="452" x2="150" y2="452" />
          <line x1="220" y1="440" x2="340" y2="440" />
        </g>

        {/* tree clusters — same layered-canopy language as GymMark's logo tree —
            spread from y≈220 through y≈340 so a mid-height crop keeps at
            least one. */}
        {[
          { x: 40, y: 335, s: 1.0 },
          { x: 362, y: 320, s: 1.1 },
          { x: 14, y: 255, s: 0.62 },
          { x: 386, y: 235, s: 0.55 },
          { x: 200, y: 220, s: 0.5 },
        ].map((t, i) => (
          <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.s})`} opacity="0.9">
            <path d="M0 46v-22" stroke="#4F7D5F" strokeWidth="4" strokeLinecap="round" />
            <circle cx="0" cy="8" r="17" fill="#5E9973" />
            <circle cx="-13" cy="16" r="11" fill="#4F7D5F" />
            <circle cx="13" cy="13" r="12" fill="#6BA97F" />
          </g>
        ))}

        {/* birds, one low enough (y=180) to survive a tight desktop crop */}
        <g stroke="#4F7D5F" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.55">
          <path d="M60 70 q8 -10 16 0 q8 -10 16 0" />
          <path d="M300 120 q6 -8 12 0 q6 -8 12 0" />
          <path d="M150 180 q5 -7 10 0 q5 -7 10 0" />
        </g>
      </svg>

      <div className="relative flex h-full flex-col justify-center p-4 sm:p-5">{children}</div>
    </div>
  );
}
