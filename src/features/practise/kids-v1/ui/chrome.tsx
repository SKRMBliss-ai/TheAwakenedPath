import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Heart } from 'lucide-react';
import type { RoomConfig } from '../rooms';
import { QuietContext, useMotion } from './quiet';

/**
 * The chrome — the UI that floats on top of the art.
 *
 * There is no single brand palette in this app (UI design §3.1). Each scene
 * has its own lighting, the way film does; what stays constant is this. So
 * every token below is a literal from that document's chrome table, not a
 * value someone picked to look nice, and the components here are the only
 * things allowed to draw UI over a painting.
 *
 * The quiet state's context and hooks live in ./quiet — see that file for
 * what it is and why. Only its provider is here, because only its provider
 * is a component.
 */

export const FONT = "'Outfit', system-ui, -apple-system, sans-serif";

export const CHROME = {
  text: '#FFFFFF',
  textSoft: 'rgba(255,255,255,0.78)',
  pill: 'rgba(255,255,255,0.10)',
  pillBorder: 'rgba(255,255,255,0.22)',
  pillSelected: 'rgba(255,255,255,0.20)',
  pillSelectedBorder: 'rgba(255,255,255,0.55)',
  back: 'rgba(0,0,0,0.34)',
  backBorder: 'rgba(255,255,255,0.18)',
  adultExit: 'rgba(255,255,255,0.16)',
} as const;

export function QuietProvider({ quiet, children }: { quiet: boolean; children: ReactNode }) {
  return <QuietContext.Provider value={quiet}>{children}</QuietContext.Provider>;
}

/* ── The scrim ──────────────────────────────────────────────────────────
 * Not optional. Illustrated backgrounds vary wildly in luminance; this
 * gradient over the bottom 55% is what stops white text disappearing over a
 * bright lamp (UI §3.1). */

export function Scrim({ room }: { room: RoomConfig }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        /*
          IT COVERS THE WHOLE SCREEN NOW. This used to be `transparent 40%`,
          which meant the entire upper half of every room — the room's name,
          its question, its "read it to me", its points line — sat on undimmed
          painting. The bottom of the screen was beautifully legible and the
          part with the words on it was not.

          AND IT IS NOT LIGHTEST IN THE MIDDLE, which was the first attempt at
          fixing it: "veil the ends, let the art breathe through the middle"
          is a good instinct for a poster and exactly wrong here, because the
          middle band is where every control in the app actually sits. It put
          the thinnest part of the veil behind the one thing that had to read.

          So: near-even through the top three-quarters, deepening at the foot
          where the bottom bar and the companion overlap. The art is still
          plainly there — it is a painting seen in a dim room, which is what
          every one of these scenes is meant to be anyway (§1).
        */
        background: `linear-gradient(to bottom, ${room.palette.scrim}94 0%, ${room.palette.scrim}82 34%, ${room.palette.scrim}8F 62%, ${room.palette.scrim}CC 84%, ${room.palette.scrim}F2 100%)`,
      }}
    />
  );
}

/* ── Back ───────────────────────────────────────────────────────────────
 * Top-left, every screen but the front door. */

export function BackButton({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:brightness-125"
      style={{ background: CHROME.back, border: `1px solid ${CHROME.backBorder}`, color: CHROME.text }}
    >
      <ChevronLeft size={22} />
    </button>
  );
}

/* ── The exit ───────────────────────────────────────────────────────────
 * "Talk to a grown-up" is present on every screen, at the same position, in
 * the same form (§2.10). Never buried, never behind a confirm, never dimmed.
 * A child deciding to tell someone must not have to hunt. */

export function GrownUpExit({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 items-center gap-2 rounded-full px-4 text-[13px] font-bold transition hover:brightness-125"
      style={{ background: CHROME.adultExit, color: CHROME.text, border: `1px solid ${CHROME.backBorder}` }}
    >
      <Heart size={15} strokeWidth={2.4} />
      Talk to a grown-up
    </button>
  );
}

/* ── Pills ──────────────────────────────────────────────────────────────
 * The choice button. Selection is shown by fill and border weight —
 * NEVER a tick, a star, or a colour that means "right" (§2.4). */

export function Pill({
  label,
  selected,
  onClick,
  accent,
  disabled,
}: {
  label: string;
  selected?: boolean;
  onClick: () => void;
  accent: string;
  disabled?: boolean;
}) {
  const m = useMotion();
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: m.quiet ? 0.99 : 0.975 }}
      onClick={disabled ? undefined : onClick}
      aria-pressed={selected}
      disabled={disabled}
      className="w-full rounded-[999px] px-5 text-left text-[15.5px] font-bold leading-snug backdrop-blur-md transition-colors"
      style={{
        minHeight: m.target,
        paddingTop: 12,
        paddingBottom: 12,
        color: CHROME.text,
        background: selected ? CHROME.pillSelected : CHROME.pill,
        border: selected
          ? `1.5px solid ${CHROME.pillSelectedBorder}`
          : `1px solid ${CHROME.pillBorder}`,
        boxShadow: selected ? `0 0 26px -6px ${accent}` : 'none',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {label}
    </motion.button>
  );
}

/** The single call to action on a screen. One per screen, maximum (§3.1). */
export function Cta({
  label,
  onClick,
  accent,
}: {
  label: string;
  onClick: () => void;
  accent: string;
}) {
  const m = useMotion();
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full rounded-[999px] px-6 text-[16px] font-extrabold transition"
      style={{
        minHeight: m.target,
        paddingTop: 13,
        paddingBottom: 13,
        background: accent,
        // #0E1A1C on a light CTA, per §3.1 cta.label — contrast ≥ 4.5:1 always.
        color: '#0E1A1C',
        boxShadow: `0 10px 34px -10px ${accent}`,
      }}
    >
      {label}
    </motion.button>
  );
}

/* ── The question ───────────────────────────────────────────────────────
 * One thing on the screen (§2.1). Never a question plus a tip, never a
 * question plus a progress meter. */

export function Question({ children, room }: { children: ReactNode; room: RoomConfig }) {
  return (
    <h2
      className="text-[26px] font-extrabold leading-[1.16] sm:text-[30px]"
      style={{
        fontFamily: FONT,
        color: CHROME.text,
        letterSpacing: '-0.01em',
        textWrap: 'balance',
        textShadow: `0 2px 26px ${room.palette.scrim}, 0 1px 4px ${room.palette.scrim}`,
      }}
    >
      {children}
    </h2>
  );
}

/** A line of situation, set above the question. Quieter than the question. */
export function SceneLine({ children }: { children: ReactNode }) {
  return (
    <p className="text-[15px] font-semibold leading-snug" style={{ color: CHROME.textSoft }}>
      {children}
    </p>
  );
}
