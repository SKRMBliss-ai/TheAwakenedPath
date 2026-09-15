import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cloud, Volume2 } from 'lucide-react';
import { CHROME, FONT, GrownUpExit, Pill, Question, SceneLine } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { RoomScene } from '../ui/scene';
import { DIM } from '../ui/scenery';
import { useQuiet } from '../ui/quiet';
import { getRoom } from '../rooms';
import { isMuted } from '../../../../lib/sfx';
import * as sound from '../kit/sound';

/**
 * THE WORRY LAB — a worry has a shape, so this asks about the shape.
 *
 * Reached from the Feelings Room rather than from a door on the hub: Worried
 * and Scared are the two feelings this app already treats as needing
 * somewhere other than the usual five-step walk (see DeepDive's
 * `sizeFeeling`), and a worry is not really a story to be talked out of —
 * it is a thing with a shape. What is it about, and is there something
 * small to do about it. So this room asks those two questions and stops.
 *
 * OPENS WITH THE FOUNDER'S FILM. Same clip that already plays on the old
 * Kids Gym's Worry Room, reused rather than re-cut — see WorryLabIntro.
 * Skipped entirely in the quiet state, same rule as the Feelings Room's
 * film (§7): a child already routed here because "really big" was the
 * answer to how big the worry was gets no cinematic, just the room.
 *
 * NOTHING IS TICKED. This is a companion visit, not a virtue — same
 * category as HelpChirpy, which awards nothing either. The point was
 * making the worry smaller, and that already happened on screen.
 */

const REASONS = [
  'Something at school',
  'A friend thing',
  'Something at home',
  'Something new I have to do',
];

const ACTIONS = [
  'Tell a grown-up I trust',
  'Ask a question',
  'Try one small bit of it',
  'Nothing — I can let it pass',
];

/** How many taps it takes to shrink the worry away. */
const TAPS_NEEDED = 5;

type Phase = 'intro' | 'tap' | 'reason' | 'action' | 'end';

export function WorryLab({
  label,
  onExit,
  onGrownUp,
}: {
  /** The feeling word already spoken and recorded — "Worried" or "Scared". */
  label: string;
  onExit: () => void;
  onGrownUp: () => void;
}) {
  const art = getRoom('worry');
  const accent = art.palette.accent;
  const quiet = useQuiet();
  const [phase, setPhase] = useState<Phase>(quiet ? 'tap' : 'intro');
  const [taps, setTaps] = useState(0);
  const [reason, setReason] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);

  const tapWorry = () => {
    if (taps >= TAPS_NEEDED) return;
    sound.play('tap');
    const n = taps + 1;
    setTaps(n);
    if (n >= TAPS_NEEDED) {
      sound.play('resolve');
      window.setTimeout(() => setPhase('reason'), 700);
    }
  };

  const pickReason = (r: string) => {
    sound.play('roomCard');
    setReason(r);
    setPhase('action');
  };

  const pickAction = (a: string) => {
    sound.play('discovery');
    setAction(a);
    setPhase('end');
  };

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      {phase === 'intro' ? (
        <WorryLabIntro onDone={() => setPhase('tap')} />
      ) : (
        <>
          <RoomScene room={art} dim={phase === 'end' ? DIM.arrive : DIM.content} />
          <DoorHandle side="left" label="Back" onClick={onExit} accent={accent} />

          <div className="relative mx-auto flex min-h-[100svh] w-full max-w-xl flex-col px-[74px] pb-10 pt-4 sm:px-20">
            <div className="flex items-center justify-end gap-3">
              <GrownUpExit onClick={onGrownUp} />
            </div>

            <div className="flex flex-1 flex-col justify-center gap-5">
              {phase === 'tap' && (
                <>
                  <SceneLine>{label}. Let’s make it a bit smaller.</SceneLine>
                  <Question room={art}>Tap the worry.</Question>
                  <WorryCloud taps={taps} needed={TAPS_NEEDED} accent={accent} onTap={tapWorry} />
                </>
              )}

              {phase === 'reason' && (
                <>
                  <Question room={art}>What’s it about?</Question>
                  <div className="flex flex-col gap-2.5">
                    {REASONS.map((r) => (
                      <Pill key={r} label={r} accent={accent} onClick={() => pickReason(r)} />
                    ))}
                  </div>
                </>
              )}

              {phase === 'action' && (
                <>
                  {reason && <SceneLine>{reason}. Alright.</SceneLine>}
                  <Question room={art}>Is there something small you could do?</Question>
                  <div className="flex flex-col gap-2.5">
                    {ACTIONS.map((a) => (
                      <Pill key={a} label={a} accent={accent} onClick={() => pickAction(a)} />
                    ))}
                  </div>
                </>
              )}

              {phase === 'end' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-4"
                >
                  {action && <SceneLine>{action}. Good plan.</SceneLine>}
                  <Question room={art}>Your worry got smaller, and you got braver.</Question>
                  <DoorHandle side="right" label="Go on" onClick={onExit} accent={accent} />
                </motion.div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The worry, shrinking one tap at a time.
 *
 * No counter of a number going down — "4 more taps" is a chore to clear, not
 * a worry getting smaller. The cloud itself carries the whole idea: it
 * actually shrinks, so the shrinking is the thing being watched rather than
 * being told about.
 */
function WorryCloud({
  taps, needed, accent, onTap,
}: { taps: number; needed: number; accent: string; onTap: () => void }) {
  const left = needed - taps;
  const scale = 1 - (taps / needed) * 0.58;
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <motion.button
        onClick={onTap}
        disabled={left <= 0}
        aria-label="Tap the worry to make it smaller"
        whileTap={left > 0 ? { scale: scale * 0.88 } : undefined}
        animate={{ scale, opacity: left > 0 ? 1 : 0.5 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        className="grid place-items-center rounded-full"
        style={{
          height: 172,
          width: 172,
          background: `${accent}30`,
          border: `2px solid ${accent}`,
          boxShadow: `0 0 44px -10px ${accent}`,
        }}
      >
        <Cloud size={86} color={CHROME.text} fill={`${accent}CC`} strokeWidth={1.6} />
      </motion.button>
      <p className="text-[13px] font-bold" style={{ color: CHROME.textSoft }}>
        {left > 0 ? 'Tap it again' : 'There it goes…'}
      </p>
    </div>
  );
}

/** Under the app's own cues (0.3–0.55) it would be lost; at 1.0 it startles. */
const VOLUME = 0.8;

/**
 * THE OPENING FILM — same clip and posters as the live Kids Gym's Worry
 * Room (public/rooms/worry-lab-intro-*), reused rather than re-cut.
 *
 * A leaner cousin of FeelingsIntro: that one recedes into a blurred loop
 * because the balls rise over the top of the same footage. This room's next
 * phase is its own painted scene, not this film continuing underneath it,
 * so there is nothing to recede into — the clip simply plays once and hands
 * off.
 */
function WorryLabIntro({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== 'undefined' ? window.innerHeight >= window.innerWidth : true,
  );
  const [canSkip, setCanSkip] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const onChange = () => setIsPortrait(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setCanSkip(true), 1800);
    return () => clearTimeout(t);
  }, []);

  function finish() {
    if (done) return;
    setDone(true);
    onDone();
  }

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const cleanup: (() => void)[] = [];

    sound.stopAll();
    v.volume = VOLUME;
    v.muted = isMuted();

    // Same gesture problem FeelingsIntro solves — see its note. The child's
    // tap that opened this room finished several renders ago, so a browser
    // that wants a fresh gesture for sound gets one from the next touch.
    void v.play().catch(() => {
      if (v.muted) { finish(); return; }
      v.muted = true;
      setSoundBlocked(true);
      void v.play().catch(() => finish());

      const rescue = () => {
        const el = videoRef.current;
        if (!el) return;
        el.muted = false;
        el.volume = VOLUME;
        setSoundBlocked(false);
        void el.play().catch(() => { /* nothing left to try */ });
      };
      window.addEventListener('pointerdown', rescue, { once: true });
      cleanup.push(() => window.removeEventListener('pointerdown', rescue));
    });

    return () => {
      cleanup.forEach((fn) => fn());
      try { v.pause(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPortrait]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: '#0A0F2E' }}>
      <video
        ref={videoRef}
        key={isPortrait ? 'mobile' : 'web'}
        src={isPortrait ? '/rooms/worry-lab-intro-mobile.mp4' : '/rooms/worry-lab-intro-web.mp4'}
        poster={isPortrait ? '/rooms/worry-lab-intro-mobile-poster.webp' : '/rooms/worry-lab-intro-web-poster.webp'}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        onEnded={finish}
        onError={finish}
      />

      {!done && soundBlocked && (
        <motion.button
          onClick={() => {
            const v = videoRef.current;
            if (!v) return;
            v.muted = false;
            v.volume = VOLUME;
            setSoundBlocked(false);
            void v.play().catch(() => { /* nothing more to try */ });
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-5 py-3 text-[15px] font-extrabold"
          style={{
            background: '#FFD98A',
            color: '#221A08',
            boxShadow: '0 8px 30px -6px rgba(255,217,138,0.9)',
            fontFamily: FONT,
          }}
        >
          <Volume2 size={19} strokeWidth={2.6} /> Turn on the sound
        </motion.button>
      )}

      <AnimatePresence>
        {!done && canSkip && (
          <motion.button
            onClick={finish}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-5 right-5 rounded-full px-4 py-2 text-[12.5px] font-bold backdrop-blur-md"
            style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text, fontFamily: FONT }}
          >
            Skip →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
