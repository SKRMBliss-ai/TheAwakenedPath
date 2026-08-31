/**
 * The Practice Gym mark — a tree inside an open circle, as drawn in the
 * mockups' masthead.
 *
 * Not a reuse of `components/ui/MindGymLogo.tsx#LogoMark`: that mark is a
 * different drawing (sacred-geometry circle, path and gold dot) tuned for a
 * near-black ground, and would read as a smudge on cream. The wordmark beside
 * it is set in the same serif the rest of the gym uses.
 */
export function GymMark({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      role="img"
      aria-label="My Best Every Day"
      style={{ flexShrink: 0 }}
    >
      <circle cx="22" cy="22" r="20" fill="none" stroke="var(--gym-accent)" strokeWidth="1.5" opacity="0.55" />
      {/* trunk */}
      <path d="M22 31.5v-8" stroke="var(--gym-accent)" strokeWidth="1.8" strokeLinecap="round" />
      {/* branches */}
      <path d="M22 26.5l-4.5-4M22 24l4.5-4" stroke="var(--gym-accent)" strokeWidth="1.5" strokeLinecap="round" />
      {/* canopy */}
      <circle cx="22" cy="17.5" r="5.4" fill="var(--gym-accent)" opacity="0.18" />
      <circle cx="16.6" cy="21" r="3.6" fill="var(--gym-accent)" opacity="0.28" />
      <circle cx="27.4" cy="20.2" r="3.9" fill="var(--gym-accent)" opacity="0.22" />
      <circle cx="22" cy="17.5" r="5.4" fill="none" stroke="var(--gym-accent)" strokeWidth="1.4" />
      {/* ground */}
      <path d="M15 33h14" stroke="var(--gym-accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}
