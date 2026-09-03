import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import { isMuted, setMuted } from '../../../../lib/sfx';
import {
  BODY_ZONE_WORDS, cameraTeach, FEELINGS, GOODBITS, MAYBES, SITUATIONS, SIZES, THOUGHTS,
  type BodyZoneId, type IntensityId, type TeachSequence,
} from './content';
import { FaceIcon } from './FaceIcon';
import { BodyMap } from './BodyMap';
import { ChirpyBar } from './ChirpyBar';
import { TeachScreen } from './TeachScreen';
import { SCENE_GRADIENT, type SceneId } from './scenes';
import { say, stopSpeech } from './voice';

/**
 * The check-in spine — ported faithfully from the working prototype
 * (see BUILD_BRIEF.md §1 and §6 "build order").
 *
 *   feeling → (intensity, only for an unpleasant feeling) → body → thought
 *   → situation → story (the three assembled into one moment) → a closing
 *   line — with "Get a grown-up" reachable from every screen and the quiet
 *   state taking over completely if a feeling is picked "really big".
 *
 * After the story: the eyes/camera test (P-06, "did your eyes see it, or did
 * it happen in your head?") then the "other maybes" reframe (P-07, other
 * stories Chirpy never thought of) before the closing line.
 *
 * Still not built: the five closing teaching moves (one per feeling — the
 * angry/sad/scared/worried/happy closers). TeachScreen already renders any
 * such sequence, so wiring those in is data, not new engineering. See the
 * report back to the founder for what's deliberately missing.
 *
 * Chirpy, the quiet state, and auto-advance are the three non-negotiables
 * (BUILD_BRIEF.md's "do not relitigate" list) and all three are live here.
 */

const FONT_DISPLAY = "'Baloo 2', 'Outfit', ui-rounded, system-ui, sans-serif";
const FONT_BODY = "'Outfit', system-ui, -apple-system, sans-serif";

type ScreenId =
  | 'feeling' | 'intensity' | 'body' | 'thought' | 'situation' | 'story'
  | 'camera' | 'teach' | 'maybes' | 'maybes-reveal'
  | 'good' | 'stop' | 'trusted-who' | 'trusted-go' | 'done';

interface Session {
  feeling: string | null;
  size: IntensityId | null;
  body: BodyZoneId | null;
  /** A THOUGHTS entry, 'none' for "something else", or null before it's picked. */
  thought: string | null;
  situation: string | null;
  /** Which half of the eyes/camera test (P-06) is showing — the situation first, then the thought. */
  cameraStep: 0 | 1;
  /** Index into MAYBES[situation] once picked. */
  maybe: number | null;
  noticed: string | null;
  quiet: boolean;
}

const EMPTY_SESSION: Session = {
  feeling: null, size: null, body: null, thought: null, situation: null,
  cameraStep: 0, maybe: null, noticed: null, quiet: false,
};

function Pill({ label, emoji, pressed, onClick, big }: { label: string; emoji?: string; pressed?: boolean; onClick: () => void; big?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      aria-pressed={pressed}
      className="flex w-full items-center gap-3 rounded-full px-5 text-left font-bold text-white transition"
      style={{
        minHeight: big ? 72 : 62,
        fontSize: big ? 19 : 17,
        background: pressed ? 'rgba(255,236,190,0.34)' : 'rgba(255,255,255,0.11)',
        border: `1px solid ${pressed ? 'rgba(255,224,160,0.9)' : 'rgba(255,255,255,0.24)'}`,
        transform: pressed ? 'scale(1.02)' : undefined,
        fontFamily: FONT_BODY,
      }}
    >
      {emoji && <span className="text-[22px] leading-none">{emoji}</span>}
      {label}
    </motion.button>
  );
}

function Cta({ label, onClick, ghost }: { label: string; onClick: () => void; ghost?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="w-full rounded-full font-semibold transition"
      style={{
        minHeight: ghost ? 48 : 56,
        fontSize: ghost ? 16 : 19,
        marginTop: ghost ? 8 : 0,
        background: ghost ? 'transparent' : 'rgba(255,255,255,0.94)',
        color: ghost ? 'rgba(253,252,255,0.78)' : '#241d3d',
        border: ghost ? '1px solid rgba(255,255,255,0.24)' : 'none',
        fontFamily: FONT_DISPLAY,
      }}
    >
      {label}
    </motion.button>
  );
}

export function CheckInFlow({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<ScreenId>('feeling');
  const [session, setSession] = useState<Session>(EMPTY_SESSION);
  const [history, setHistory] = useState<ScreenId[]>(['feeling']);
  const [muted, setMutedState] = useState(isMuted());
  const [holdProgress, setHoldProgress] = useState(0);
  const [showGrownUps, setShowGrownUps] = useState(false);
  const [teachSeq, setTeachSeq] = useState<TeachSequence | null>(null);
  const lockRef = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  /** What happens when the current TeachScreen finishes — set right before
   *  going to 'teach', since the two camera-test passes lead somewhere
   *  different (back to camera step 2, or on to maybes). */
  const teachOnDone = useRef<() => void>(() => {});

  useEffect(() => () => stopSpeech(), []);

  const speak = (text: string, opts: { who?: 'narrator' | 'chirpy'; lineId?: string } = {}) => {
    say(text, { ...opts, quiet: session.quiet, muted });
  };

  const go = (next: ScreenId) => {
    setHistory((h) => [...h, next]);
    setScreen(next);
  };
  const back = () => {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const nh = h.slice(0, -1);
      setScreen(nh[nh.length - 1]);
      return nh;
    });
  };

  /** Tap a choice → it visibly fills, pauses briefly, then the app moves on
   *  by itself. No screen in this flow has a lingering "Next" on a picker. */
  const choose = (mutate: () => void, next: () => void, delay = 520) => {
    if (lockRef.current) return;
    lockRef.current = true;
    mutate();
    setTimeout(() => { lockRef.current = false; next(); }, delay);
  };

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  const pickFeeling = (id: string) => choose(
    () => setSession((s) => ({ ...s, feeling: id })),
    () => {
      const f = FEELINGS.find((x) => x.id === id);
      if (!f) { go('body'); return; } // "I don't know" — straight to reflection, no size to name
      if (f.ok) { go('good'); return; }
      go('intensity');
    },
  );

  const pickSize = (id: IntensityId) => choose(
    () => setSession((s) => ({ ...s, size: id, quiet: id === 'really' })),
    () => go('body'),
  );

  const pickBody = (zone: BodyZoneId) => choose(
    () => setSession((s) => ({ ...s, body: zone })),
    () => go('thought'),
  );

  /** Longer pause than other picks — Chirpy has to actually say the thought
   *  out loud (sayChirpy) before the app moves on, same timing as the
   *  prototype's pickThought(). */
  const pickThought = (text: string) => choose(
    () => setSession((s) => ({ ...s, thought: text })),
    () => go('situation'),
    1600,
  );

  const pickSituation = (id: string) => choose(
    () => setSession((s) => ({ ...s, situation: id })),
    () => go('story'),
  );

  const pickGood = (text: string) => choose(
    () => setSession((s) => ({ ...s, noticed: text })),
    () => go('done'),
  );

  /** The eyes/camera test: each of its two passes (situation, then thought)
   *  explains the answer via a TeachScreen, then either repeats for the
   *  second pass or moves on to the maybes. Not run through `choose()` —
   *  it's not a lingering-choice pick, it's an immediate cut to the
   *  explanation, same as the prototype's camera(). */
  const pickCamera = (choice: 'cam' | 'brain') => {
    const step = session.cameraStep;
    setTeachSeq(cameraTeach(step, choice));
    teachOnDone.current = () => {
      if (step === 0) {
        setSession((s) => ({ ...s, cameraStep: 1 }));
        go('camera');
      } else {
        go('maybes');
      }
    };
    go('teach');
  };

  const pickMaybe = (i: number) => choose(
    () => setSession((s) => ({ ...s, maybe: i })),
    () => go('maybes-reveal'),
  );

  const goAgain = () => {
    setSession(EMPTY_SESSION);
    setHistory(['feeling']);
    setScreen('feeling');
  };

  // ── Grown-up gate: reachable only by a ~1.4s press-and-hold ────────────
  // Counts fixed 30ms ticks rather than diffing wall-clock time, so no
  // impure Date.now() call sits in the component body.
  const HOLD_MS = 1400;
  const HOLD_TICK_MS = 30;
  const holdStart = () => {
    let ticks = 0;
    holdTimer.current = setInterval(() => {
      ticks += 1;
      const p = Math.min((ticks * HOLD_TICK_MS) / HOLD_MS, 1);
      setHoldProgress(p);
      if (p >= 1) { holdEnd(); setShowGrownUps(true); }
    }, HOLD_TICK_MS);
  };
  const holdEnd = () => {
    if (holdTimer.current) clearInterval(holdTimer.current);
    holdTimer.current = null;
    setHoldProgress(0);
  };

  const feeling = FEELINGS.find((f) => f.id === session.feeling);
  const SCENE_BY_SCREEN: Partial<Record<ScreenId, SceneId>> = {
    body: 'look', situation: 'look', camera: 'look', story: 'den', maybes: 'den', 'maybes-reveal': 'den', good: 'dawn',
    'trusted-who': 'still', 'trusted-go': 'still', stop: 'still',
  };
  // 'teach' has no fixed scene of its own — each sequence names its own (see cameraTeach()).
  const scene: SceneId = screen === 'teach' && teachSeq ? teachSeq.scene : SCENE_BY_SCREEN[screen] ?? 'night';
  const canBack = history.length > 1 && screen !== 'feeling' && screen !== 'trusted-go' && screen !== 'stop' && screen !== 'teach';
  const showExit = screen !== 'trusted-who' && screen !== 'trusted-go';

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ background: SCENE_GRADIENT[scene], fontFamily: FONT_BODY }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(6,6,16,.14) 0%, rgba(6,6,16,0) 24%, rgba(6,6,16,.34) 56%, rgba(6,6,16,.76) 100%)',
          opacity: session.quiet ? 0.55 : 1,
          filter: session.quiet ? 'brightness(1.16) saturate(.82)' : undefined,
        }}
      />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-5 pb-4 pt-3">
        {/* top bar */}
        <div className="flex min-h-[44px] items-center gap-2">
          {canBack ? (
            <button onClick={back} aria-label="Go back" className="grid h-10 w-10 place-items-center rounded-full text-white/80 backdrop-blur transition hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.24)' }}>
              <ChevronLeft size={20} />
            </button>
          ) : <div className="h-10 w-10" />}
          <div className="flex-1" />
          <button onClick={toggleSound} aria-label={muted ? 'Turn the voice on' : 'Turn the voice off'} className="grid h-10 w-10 place-items-center rounded-full text-white/80 backdrop-blur transition hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.24)' }}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button
            onPointerDown={holdStart}
            onPointerUp={holdEnd}
            onPointerLeave={holdEnd}
            aria-label="Hold for grown-ups"
            className="relative overflow-hidden rounded-full px-3.5 text-[11px] font-extrabold uppercase tracking-wider text-white/60"
            style={{ height: 32, background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.24)' }}
          >
            <span className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${holdProgress * 100}%` }} />
            <span className="relative">Grown-ups</span>
          </button>
        </div>

        {/* screen body */}
        <main className="flex flex-1 flex-col justify-end py-2" style={{ minHeight: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: session.quiet ? 0.5 : 0.35 }}
              className="w-full"
            >
              {screen === 'feeling' && (
                <FeelingScreen quiet={session.quiet} onPick={pickFeeling} speak={speak} />
              )}
              {screen === 'intensity' && feeling && (
                <IntensityScreen feeling={feeling} selected={session.size} onPick={pickSize} speak={speak} />
              )}
              {screen === 'body' && (
                <BodyScreen quiet={session.quiet} selected={session.body} onPick={pickBody} onStop={() => go('stop')} speak={speak} />
              )}
              {screen === 'thought' && (
                <ThoughtScreen quiet={session.quiet} chirpyName="Chirpy" selected={session.thought} onPick={pickThought} onStop={() => go('stop')} speak={speak} />
              )}
              {screen === 'situation' && (
                <SituationScreen selected={session.situation} onPick={pickSituation} speak={speak} />
              )}
              {screen === 'story' && feeling && (
                <StoryScreen
                  quiet={session.quiet}
                  feeling={feeling}
                  body={session.body}
                  thought={session.thought}
                  situation={session.situation}
                  chirpyName="Chirpy"
                  speak={speak}
                />
              )}
              {screen === 'camera' && (
                <CameraScreen
                  step={session.cameraStep}
                  situation={SITUATIONS.find((x) => x.id === session.situation)?.label ?? 'Something happened'}
                  thought={session.thought && session.thought !== 'none' ? session.thought : 'Something bad is going to happen.'}
                  onPick={pickCamera}
                  speak={speak}
                />
              )}
              {screen === 'teach' && teachSeq && (
                <TeachScreen sequence={teachSeq} onDone={() => teachOnDone.current()} speak={speak} />
              )}
              {screen === 'maybes' && (
                <MaybesScreen
                  options={MAYBES[session.situation ?? ''] ?? MAYBES.other}
                  selected={session.maybe}
                  onPick={pickMaybe}
                  speak={speak}
                />
              )}
              {screen === 'maybes-reveal' && (
                <MaybesRevealScreen speak={speak} />
              )}
              {screen === 'good' && (
                <GoodScreen onPick={pickGood} speak={speak} />
              )}
              {screen === 'stop' && (
                <StopScreen onGrownUp={() => go('trusted-who')} onClose={goAgain} speak={speak} />
              )}
              {screen === 'trusted-who' && (
                <TrustedWhoScreen onPick={() => go('trusted-go')} speak={speak} />
              )}
              {screen === 'trusted-go' && (
                <TrustedGoScreen speak={speak} />
              )}
              {screen === 'done' && (
                <DoneScreen quiet={session.quiet} noticed={session.noticed} speak={speak} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* footer */}
        <footer className="pb-1 pt-2">
          {screen === 'stop' && (
            <>
              <Cta label="Get a grown-up" onClick={() => go('trusted-who')} />
              <Cta label="Just close it" onClick={goAgain} ghost />
            </>
          )}
          {screen === 'story' && session.quiet && (
            <>
              <Cta label="Next" onClick={() => go('done')} />
              <Cta label="Stop here for now" onClick={() => go('stop')} ghost />
            </>
          )}
          {screen === 'story' && !session.quiet && <Cta label="Which one?" onClick={() => go('camera')} />}
          {screen === 'maybes-reveal' && <Cta label="Okay!" onClick={() => go('done')} />}
          {screen === 'trusted-go' && <Cta label="Okay" onClick={goAgain} />}
          {screen === 'done' && <Cta label="Go again" onClick={goAgain} ghost />}
          {showExit && screen !== 'stop' && (
            <button
              onClick={() => go('trusted-who')}
              className="mt-1 block w-full py-2 text-center font-bold text-white/50 transition hover:text-white/75"
              style={{ fontSize: session.quiet ? 16 : 13.5 }}
            >
              Get a grown-up
            </button>
          )}
        </footer>
      </div>

      {showGrownUps && (
        <GrownUpsPanel
          quiet={session.quiet}
          feeling={feeling?.label ?? null}
          onClose={() => setShowGrownUps(false)}
          onExitToHub={onExit}
        />
      )}
    </div>
  );
}

/* ── Screens ─────────────────────────────────────────────────────────── */

type Speak = (text: string, opts?: { who?: 'narrator' | 'chirpy'; lineId?: string }) => void;

function FeelingScreen({ quiet, onPick, speak }: { quiet: boolean; onPick: (id: string) => void; speak: Speak }) {
  useEffect(() => { speak('How do you feel right now?', { lineId: 'p01.01' }); }, [speak]);
  return (
    <div>
      {!quiet && <ChirpyBar pose="idle" line="Hello again!" size="sm" />}
      <h1 className="text-[30px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>How do you feel right now?</h1>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {FEELINGS.map((f) => (
          <button
            key={f.id}
            onClick={() => onPick(f.id)}
            className="flex flex-col items-center gap-1.5 rounded-[22px] py-2.5 font-extrabold text-white transition"
            style={{ background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.24)', color: `hsl(${f.hue} 82% 78%)`, backdropFilter: 'blur(16px)' }}
          >
            <FaceIcon face={f.face} />
            <span className="text-[13px] text-white">{f.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-2.5">
        <Pill label="I don't know" emoji="🤷" onClick={() => onPick('dunno')} />
      </div>
    </div>
  );
}

function IntensityScreen({ feeling, selected, onPick, speak }: { feeling: (typeof FEELINGS)[number]; selected: IntensityId | null; onPick: (id: IntensityId) => void; speak: Speak }) {
  useEffect(() => { speak('How big is it?', { lineId: 'p01.02' }); }, [speak]);
  return (
    <div>
      <ChirpyBar pose="curious" line="How big?" />
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>
        How big is the {feeling.label.toLowerCase()} one?
      </h1>
      <div className="mt-4 flex items-end gap-2.5">
        {SIZES.map((s) => (
          <button
            key={s.id}
            onClick={() => onPick(s.id)}
            aria-pressed={selected === s.id}
            className="flex flex-1 flex-col items-center justify-end gap-2 rounded-[22px] py-3.5 font-extrabold text-white transition"
            style={{ minHeight: 62, background: selected === s.id ? 'rgba(255,236,190,0.34)' : 'rgba(255,255,255,0.11)', border: `1px solid ${selected === s.id ? 'rgba(255,224,160,0.9)' : 'rgba(255,255,255,0.24)'}`, color: `hsl(${feeling.hue} 80% 74%)` }}
          >
            <span className="rounded-full" style={{ width: s.blob, height: s.blob, background: 'currentColor', opacity: 0.92 }} />
            <span className="text-[13.5px] text-white">{s.label}</span>
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/50">All three are fine. There's no better one.</p>
    </div>
  );
}

function BodyScreen({ quiet, selected, onPick, onStop, speak }: { quiet: boolean; selected: BodyZoneId | null; onPick: (z: BodyZoneId) => void; onStop: () => void; speak: Speak }) {
  useEffect(() => { speak(quiet ? 'Where is it?' : "Where's the feeling hiding?"); }, [quiet, speak]);
  return (
    <div>
      {!quiet && <ChirpyBar pose="curious" line="Where's it hiding?" size="sm" />}
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>
        {quiet ? 'Where is it?' : "Where's it hiding?"}
      </h1>
      <BodyMap selected={selected} onPick={onPick} />
      <div className="mt-1.5">
        <Pill label="Can't find it" emoji="🌫️" pressed={selected === 'cant'} onClick={() => onPick('cant')} />
      </div>
      {!quiet && <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/50">No right place. It lives wherever it lives.</p>}
      {quiet && (
        <button onClick={onStop} className="mt-3 w-full rounded-full py-3 text-[16px] font-semibold text-white/85" style={{ background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.24)' }}>
          Stop here for now
        </button>
      )}
    </div>
  );
}

function ThoughtScreen({
  quiet, chirpyName, selected, onPick, onStop, speak,
}: { quiet: boolean; chirpyName: string; selected: string | null; onPick: (text: string) => void; onStop: () => void; speak: Speak }) {
  const heard = selected && selected !== 'none';
  useEffect(() => { speak(quiet ? "What's in your head?" : `Listen. What's ${chirpyName} saying?`); }, [quiet, chirpyName, speak]);

  const pick = (text: string) => {
    // Chirpy actually speaks the guess, in his own voice — the bubble below
    // echoes it as text, same as the prototype's pickThought().
    speak(text, { who: 'chirpy' });
    onPick(text);
  };

  const options = quiet ? THOUGHTS.slice(0, 3) : THOUGHTS;

  return (
    <div>
      {!quiet && (
        <ChirpyBar pose="said1" size="sm" waiting={!heard} line={heard ? selected : 'shhh… listening'} />
      )}
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>
        {quiet ? "What's in your head?" : `Listen. What's ${chirpyName} saying?`}
      </h1>
      <div className="mt-4 flex flex-col gap-2">
        {options.map((t) => (
          <Pill key={t} big={quiet} label={t} pressed={selected === t} onClick={() => pick(t)} />
        ))}
        <Pill big={quiet} label="Something else" emoji="🎤" pressed={selected === 'none'} onClick={() => onPick('none')} />
      </div>
      {quiet && (
        <button onClick={onStop} className="mt-3 w-full rounded-full py-3 text-[16px] font-semibold text-white/85" style={{ background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.24)' }}>
          Stop here for now
        </button>
      )}
    </div>
  );
}

function SituationScreen({ selected, onPick, speak }: { selected: string | null; onPick: (id: string) => void; speak: Speak }) {
  useEffect(() => { speak("What did your eyes see? Just the bit that happened out there, in the room."); }, [speak]);
  return (
    <div>
      <ChirpyBar pose="curious" line="What happened?" size="sm" />
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>What did your eyes see?</h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-white/60">Just the bit that happened out there, in the room.</p>
      <div className="mt-3 flex flex-col gap-2">
        {SITUATIONS.map((s) => (
          <Pill key={s.id} label={s.label} emoji={s.emoji} pressed={selected === s.id} onClick={() => onPick(s.id)} />
        ))}
      </div>
    </div>
  );
}

function StoryScreen({
  quiet, feeling, body, thought, situation, chirpyName, speak,
}: {
  quiet: boolean;
  feeling: (typeof FEELINGS)[number];
  body: BodyZoneId | null;
  thought: string | null;
  situation: string | null;
  chirpyName: string;
  speak: Speak;
}) {
  const s = SITUATIONS.find((x) => x.id === situation);
  const bodyWord = body ? BODY_ZONE_WORDS[body] : 'body';
  const th = thought && thought !== 'none' ? thought : "something you didn't like";
  const opener = s ? s.past.charAt(0).toUpperCase() + s.past.slice(1) : 'Something happened';

  const lines = [
    `${opener}.`,
    `You felt ${feeling.label.toLowerCase()}. It was in your ${bodyWord}.`,
    quiet ? null : `And ${chirpyName} went: "${th}"`,
  ].filter((l): l is string => l !== null);

  useEffect(() => { speak(quiet ? "Here's what happened." : 'Look what we made.'); }, [quiet, speak]);

  return (
    <div>
      {!quiet && <ChirpyBar pose="jumping" size="sm" />}
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>
        {quiet ? "Here's what happened." : 'Look what we made!'}
      </h1>
      <div className="mt-3 flex flex-col gap-2">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.45, duration: 0.5 }}
            className="rounded-2xl px-4 py-3 text-[16px] font-bold leading-snug text-white"
            style={{
              background: i === 2 ? 'rgba(178,150,255,0.24)' : 'rgba(255,255,255,0.11)',
              border: `1px solid ${i === 2 ? 'rgba(203,186,255,0.45)' : 'rgba(255,255,255,0.17)'}`,
            }}
          >
            {line}
          </motion.div>
        ))}
      </div>
      {!quiet && (
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/50">
          Two of those really happened out there. One of them {chirpyName} made up in your head.
        </p>
      )}
    </div>
  );
}

function CameraScreen({
  step, situation, thought, onPick, speak,
}: { step: 0 | 1; situation: string; thought: string; onPick: (choice: 'cam' | 'brain') => void; speak: Speak }) {
  const card = step === 0 ? situation : `Chirpy said: "${thought}"`;
  useEffect(() => { speak('This bit. Did your eyes see it happen? Or did it happen in your head?'); }, [speak]);
  return (
    <div className="text-center">
      <ChirpyBar pose="curious" line="Which one?" size="sm" />
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>Did your eyes see it?</h1>
      <div className="mt-3 rounded-2xl px-4 py-3.5 text-[17px] font-extrabold leading-snug text-white" style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.22)' }}>
        {card}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onPick('cam')}
          className="flex flex-col items-center justify-center gap-2 rounded-[22px] py-5 font-extrabold text-white"
          style={{ minHeight: 126, background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.24)' }}
        >
          <span className="text-[33px]">👀</span>
          <span className="text-[15px] leading-tight">My eyes saw it</span>
        </button>
        <button
          onClick={() => onPick('brain')}
          className="flex flex-col items-center justify-center gap-2 rounded-[22px] py-5 font-extrabold text-white"
          style={{ minHeight: 126, background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.24)' }}
        >
          <span className="text-[33px]">🧠</span>
          <span className="text-[15px] leading-tight">It happened in my head</span>
        </button>
      </div>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/50">Both are allowed. They're just different kinds of bits.</p>
    </div>
  );
}

function MaybesScreen({
  options, selected, onPick, speak,
}: { options: string[]; selected: number | null; onPick: (i: number) => void; speak: Speak }) {
  useEffect(() => { speak("It only thought of one story. Let's make some more."); }, [speak]);
  return (
    <div>
      <ChirpyBar pose="hopeful" line="I only thought of one!" size="sm" />
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>Chirpy made one story.</h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-white/60">Here are some others it never thought of.</p>
      <div className="mt-3 flex flex-col gap-2">
        {options.map((m, i) => <Pill key={m} label={m} pressed={selected === i} onClick={() => onPick(i)} />)}
      </div>
    </div>
  );
}

function MaybesRevealScreen({ speak }: { speak: Speak }) {
  useEffect(() => { speak('Which one is true? Nobody knows. Not you. Not me. Not your chatterbox either. And that\'s allowed.'); }, [speak]);
  return (
    <div className="text-center">
      <ChirpyBar pose="curious" line="Nobody knows!" size="big" />
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>Which one's true?</h1>
      <p className="mt-2 text-[16px] font-semibold leading-relaxed text-white/78">
        Nobody knows. Not you. Not me. Definitely not Chirpy. And that's allowed.
      </p>
    </div>
  );
}

function GoodScreen({ onPick, speak }: { onPick: (text: string) => void; speak: Speak }) {
  useEffect(() => { speak('What made it a good one?'); }, [speak]);
  return (
    <div>
      <ChirpyBar pose="excited" line="Ooh, tell me!" size="sm" />
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>What made it a good one?</h1>
      <div className="mt-4 flex flex-col gap-2">
        {GOODBITS.map((t) => <Pill key={t} label={t} onClick={() => onPick(t)} />)}
      </div>
    </div>
  );
}

function StopScreen({ onGrownUp, onClose, speak }: { onGrownUp: () => void; onClose: () => void; speak: Speak }) {
  useEffect(() => { speak("That's completely fine. You can stop whenever you like."); }, [speak]);
  void onGrownUp; void onClose;
  return (
    <div className="text-center">
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>That's completely fine.</h1>
      <p className="mt-2 text-[17px] font-semibold text-white/78">You can stop whenever you like.</p>
    </div>
  );
}

function TrustedWhoScreen({ onPick, speak }: { onPick: () => void; speak: Speak }) {
  useEffect(() => { speak('Who do you want?'); }, [speak]);
  return (
    <div>
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>Who do you want?</h1>
      <p className="mt-1.5 text-[15px] leading-relaxed text-white/70">Tell them anything you like. You don't have to show them what's in here.</p>
      <div className="mt-4 flex flex-col gap-2">
        <Pill big label="Mum" onClick={onPick} />
        <Pill big label="Dad" onClick={onPick} />
        <Pill big label="Someone at school" onClick={onPick} />
      </div>
    </div>
  );
}

function TrustedGoScreen({ speak }: { speak: Speak }) {
  useEffect(() => { speak('Go and find them.'); }, [speak]);
  return (
    <div>
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>Go and find them.</h1>
      <p className="mt-1.5 text-[15px] leading-relaxed text-white/70">If they're busy right now, that's okay. Try again in a bit, or try someone else.</p>
    </div>
  );
}

function DoneScreen({ quiet, noticed, speak }: { quiet: boolean; noticed: string | null; speak: Speak }) {
  void noticed;
  useEffect(() => { speak('See you next time.'); }, [speak]);
  return (
    <div className="text-center">
      {!quiet && <ChirpyBar pose="excited" line="Bye!" size="big" />}
      <h1 className="text-[28px] font-extrabold leading-tight text-white" style={{ fontFamily: FONT_DISPLAY }}>See you next time.</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-white/70">Nobody sees this unless you show them.</p>
    </div>
  );
}

function GrownUpsPanel({ quiet, feeling, onClose, onExitToHub }: { quiet: boolean; feeling: string | null; onClose: () => void; onExitToHub: () => void }) {
  return (
    <div className="absolute inset-0 z-20 overflow-auto p-6" style={{ background: '#12121f' }}>
      <h2 className="text-[23px] font-semibold text-white" style={{ fontFamily: FONT_DISPLAY }}>For grown-ups</h2>
      <p className="mt-1 text-[14.5px] leading-relaxed text-white/70">Behind a press-and-hold, so a child doesn't wander in.</p>

      <h3 className="mt-6 text-[11.5px] font-extrabold uppercase tracking-wider text-white/50">This session</h3>
      <div className="flex justify-between border-b border-white/10 py-2 text-[14.5px]">
        <span className="text-white/70">Feeling</span><span className="font-extrabold text-white">{feeling ?? '—'}</span>
      </div>
      <div className="flex justify-between border-b border-white/10 py-2 text-[14.5px]">
        <span className="text-white/70">Quiet state</span><span className="font-extrabold text-white">{quiet ? 'On' : 'Off'}</span>
      </div>

      <div className="mt-3 rounded-2xl p-4 text-[13.5px]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
        <strong className="text-white">There is no score in here.</strong> No streak, no level, nothing marked correct. Ask what they caught instead, and let a shrug be a fine answer.
      </div>
      <div className="mt-2.5 rounded-2xl p-4 text-[13.5px]" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
        The quiet state switches on by itself when a hard feeling is <em>really big</em>. Chirpy leaves, choices shrink, and a real way out appears — neither of you gets told.
      </div>
      <div className="mt-2.5 rounded-2xl p-4 text-[12.5px] text-white/60" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
        This check-in runs feeling → size → body → thought → situation → story → the eyes test → other maybes, then closes. The five closing teachings (one per feeling) and the practice rooms are separate pieces, not yet joined to this flow. The quiet state skips straight from the story to closing.
      </div>

      <Cta label="Back" onClick={onClose} />
      <Cta label="Leave the check-in" onClick={onExitToHub} ghost />
    </div>
  );
}
