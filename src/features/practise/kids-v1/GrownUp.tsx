import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { SCENE_MOODS } from './rooms';
import { CHROME, FONT } from './ui/chrome';

/**
 * SUP-01 · Talk to a grown-up. Safety-critical, and the one screen in this
 * feature with rules that override everything else in the design system.
 *
 *   · **Chirpy is absent.** Not hidden, not quieter — not rendered. A child
 *     who has decided to tell someone must not be met by a character doing
 *     a bit. (BUILD_BRIEF §0, and the acceptance checklist tests for it.)
 *   · **No motion, no ambience, no art.** A flat, calm scene. Everything
 *     that makes the rest of the app feel like a place is decoration here.
 *   · **It exits cleanly.** No "are you sure?", no penalty, no lost
 *     progress, no attempt to keep the child in the app (journey J10).
 *   · **No advice and no reassurance.** If something serious has been said,
 *     the app stops being an app (J11). It does not counsel, it does not
 *     say "it'll be okay", and it does not ask what happened. It points at
 *     a person.
 *
 * The trusted-adult LIST belongs here (SET-02 powers it) once setup exists.
 * Until then this screen does the one thing that matters without any data:
 * it tells a child that going to find someone is a complete and correct
 * thing to do, and gets out of the way.
 */

const LINES = [
  'That sounds like a lot.',
  'You don’t have to explain it.',
  'Some things are for a grown-up. That’s not giving up — that’s the right move.',
];

export function GrownUp({ onBack }: { onBack: () => void }) {
  const mood = SCENE_MOODS.night;

  return (
    <div
      className="relative min-h-[100svh] w-full"
      style={{
        fontFamily: FONT,
        background: `linear-gradient(170deg, ${mood.ground[0]} 0%, ${mood.ground[1]} 100%)`,
      }}
    >
      {/* The warm source stays — a calm room, never a cold one. Static. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(60% 44% at 50% 22%, ${mood.glow} 0%, transparent 74%)` }}
      />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col px-5 pb-10 pt-4 sm:px-7">
        <button
          onClick={onBack}
          aria-label="Back"
          className="grid h-11 w-11 place-items-center rounded-full"
          style={{ background: CHROME.back, border: `1px solid ${CHROME.backBorder}`, color: CHROME.text }}
        >
          <ChevronLeft size={22} />
        </button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="flex flex-1 flex-col justify-center gap-7"
        >
          <div className="flex flex-col gap-4">
            {LINES.map((l) => (
              <p
                key={l}
                className="text-[24px] font-extrabold leading-[1.24] sm:text-[27px]"
                style={{ color: CHROME.text, letterSpacing: '-0.01em', textWrap: 'balance', fontFamily: FONT }}
              >
                {l}
              </p>
            ))}
          </div>

          <div
            className="rounded-[24px] p-5"
            style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${CHROME.backBorder}` }}
          >
            <p className="text-[16px] font-extrabold" style={{ color: CHROME.text }}>
              Go and find someone you trust.
            </p>
            <p className="mt-2 text-[15px] font-semibold leading-relaxed" style={{ color: CHROME.textSoft }}>
              A grown-up at home, or a teacher, or anyone on your list. You don’t need the right
              words. “Can I talk to you” is enough of a start.
            </p>
          </div>

          <p className="text-[14.5px] font-semibold leading-relaxed" style={{ color: CHROME.textSoft }}>
            If it’s urgent and there’s nobody there — in the UK you can call Childline free, any
            time, on 0800 1111. They answer at night too.
          </p>

          {/* 64px, well clear of anything else. Nothing on this screen is
              adjacent to anything a distressed child could mis-tap into. */}
          <button
            onClick={onBack}
            className="mt-2 w-full rounded-[999px] px-6 py-4 text-[16px] font-extrabold"
            style={{ minHeight: 64, background: 'rgba(255,255,255,0.16)', color: CHROME.text, border: `1px solid ${CHROME.backBorder}` }}
          >
            Take me back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
