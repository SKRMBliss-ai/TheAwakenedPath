import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useKidStore, type SavedReflection } from '../../../kids/store';
import { FONT } from '../ui/chrome';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import { useQuiet } from '../ui/quiet';
import { DoorHandle } from '../ui/DoorHandle';
import * as sound from '../kit/sound';
import { pickThreeAffirmations } from '../kit/affirmations';
import { summariseReflections, constellationLayout, type ThoughtStar } from '../kit/reflectionSummary';
import './ReflectionPath.css';

/*
  ══════════════════════════════════════════════════════════════════════════
  THE REFLECTION ROOM — one place, not a stack of screens.

  This used to be two: a path of bricks, and a "Play & Relax Mode" the child
  was thrown into when they touched one. The second screen took the room away
  — the lanterns, the portal, the rug, the bird — and replaced it with a
  transport bar, a scrubber and a card, at exactly the moment the child was
  being asked to sit with something they had written about themselves. It was
  a media player wearing a room's name.

  So there is one room. Everything opens INSIDE it, as a panel that floats up
  while the room softens behind it, and closes in a few sparkles that fall
  back into the floor. The child never leaves the place they came to be in.

  THREE THINGS THIS ROOM WILL NOT DO, and they are the reason it exists:

    1. It never scores a child. No streaks, no grades, no "emotional health",
       no ranking a feeling against another feeling. See kit/reflectionSummary
       — the rule lives with the data so it cannot drift.
    2. It never says a thought was wrong. The mind's story and the other
       possibility hang in the same sky as two stars, and the one that turns
       up more often is not drawn as the true one.
    3. It never nags. A child who opens the door, sits on the rug and closes
       it again has used this room exactly as intended.

  VOICE AND SOUND CARRY MOST OF IT, because the children this is for are six
  and cannot all read yet. The bird speaks on arrival, the child's own
  affirmation is read back in their own mind's voice, the month is narrated,
  every star in the sky says its thought out loud, and the breathing is
  counted in a grown-up voice over two real breath cues. Every one of those
  goes silent in the quiet state and under the app's mute, in one place: see
  `say` below.
  ══════════════════════════════════════════════════════════════════════════
*/

/** v3 art pack — reflection_room_assets_v3_no_boy, cropped to its own pixels. */
const V3 = '/mind-gym/reflection/v3/';
/** The locked child + bird, already in the project. No new child asset. */
const CAST = '/mind-gym/reflection/';

/** How many stones the floor holds. The rest of the archive comes round on a
 *  shuffle rather than filling the room until it is a wall of sentences. */
const STONES = 8;

/*
  WHERE THE STONES LIE, read off 10_full_scene_reference.png.

  Not a grid and not a path: they are scattered up the steps and across the
  floor, four to a side, mirrored about the middle. The middle column stays
  empty on purpose — that is where the child sits, and the affirmation floats
  in front of them. Percentages of the stage, so the arrangement survives
  every window width.
*/
const SLOTS = [
  { left: 36.5, top: 39.5, w: 13.5 },
  { left: 51.0, top: 39.5, w: 13.5 },
  { left: 27.0, top: 47.5, w: 14.5 },
  { left: 59.5, top: 47.5, w: 14.5 },
  { left: 18.5, top: 57.0, w: 15.0 },
  { left: 67.0, top: 57.0, w: 15.0 },
  { left: 10.5, top: 66.5, w: 15.5 },
  { left: 74.5, top: 66.5, w: 15.5 },
];

const TAG_ICON: Record<string, string> = {
  brave: '⛰', calm: '🌿', kind: '💬', belonging: '👥', try_again: '☀', other: '✦',
};
const TAG_LABELS: Record<string, string> = {
  brave: 'Brave', calm: 'Calm', kind: 'Kind',
  belonging: 'Belonging', try_again: 'Try Again', other: 'Reflection',
};

/** What Chirpy says on the way in. One at random, so the room is not a script. */
const WELCOME = [
  'You can stay as long as you like. Nothing to do in here.',
  'Everything you wrote is still here. Nothing got lost.',
  "I kept the lanterns on. Sit wherever you want.",
  'This is your room. I just come and sit in it.',
];

/** The affirmation a child sees before they have saved anything of their own. */
const FIRST_AFFIRMATION = 'I am learning something new about myself.';

const BREATH_IN_MS = 4000;
const BREATH_OUT_MS = 5000;

function formatDay(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

/** True while the window is too narrow to lay the stones across a floor. */
function useNarrow() {
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 900,
  );
  useEffect(() => {
    const query = window.matchMedia('(max-width: 899px)');
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return narrow;
}

/*
  ── The room's own weather ───────────────────────────────────────────────
  Fireflies over the floor and a shimmer on the crystals. Deterministic
  positions: random ones would redraw the sky on every render, which reads as
  flicker rather than as life. Gone entirely when motion is off.
*/
const FIREFLIES = Array.from({ length: 14 }, (_, i) => ({
  left: 6 + ((i * 37) % 88),
  top: 34 + ((i * 53) % 58),
  delay: (i % 7) * 1.4,
  dur: 9 + (i % 5) * 2.6,
  size: 3 + (i % 3),
}));

function Ambience({ still }: { still: boolean }) {
  if (still) return null;
  return (
    <div className="rr-ambience" aria-hidden="true">
      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          className="rr-fly"
          style={{
            left: `${f.left}%`, top: `${f.top}%`,
            width: f.size, height: f.size,
            animationDelay: `${f.delay}s`, animationDuration: `${f.dur}s`,
          }}
        />
      ))}
      <span className="rr-shimmer rr-shimmer-a" />
      <span className="rr-shimmer rr-shimmer-b" />
    </div>
  );
}

/*
  ── A panel that floats up out of the room ───────────────────────────────

  Every extra thing in here is one of these: it scales from .96, the room
  behind it softens rather than disappearing, and on the way out a handful of
  sparkles drop back into the floor. That closing beat is the difference
  between "a dialog went away" and "the room took it back".
*/
function Panel({ title, icon, onClose, children, wide }: {
  title: string; icon: string; onClose: () => void; children: ReactNode; wide?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);

  /*
    Escape closes, focus starts inside so a keyboard is not stranded on the
    room behind — and on the way out it goes back to whatever opened this.
    Without that last part a child tabbing the room loses their place every
    time they look at a reflection, and lands back at the top.
  */
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    box.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <motion.div
      className="rr-veil"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.34 }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        ref={box}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`rr-panel ${wide ? 'rr-panel-wide' : ''}`}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ type: 'spring', stiffness: 210, damping: 24 }}
      >
        <span className="rr-panel-crest" aria-hidden="true">{icon}</span>
        <div className="rr-panel-bar">
          <h2>{title}</h2>
          <button className="rr-panel-close" onClick={onClose} aria-label="Close and go back to the room">✕</button>
        </div>
        <div className="rr-panel-body">{children}</div>
        <span className="rr-panel-sparks" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}
        </span>
      </motion.div>
    </motion.div>
  );
}

type Popup =
  | { kind: 'reflection'; id: string }
  | { kind: 'month' }
  | { kind: 'sky' }
  | null;

export function ReflectionPath({ onExit, onGrownUp }: {
  onExit: () => void;
  onGrownUp: () => void;
}) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const narrow = useNarrow();

  const all = useKidStore((s) => s.savedReflections);
  const markPlayed = useKidStore((s) => s.markReflectionPlayed);
  const toggleFav = useKidStore((s) => s.toggleReflectionFavourite);
  const setAffirmation = useKidStore((s) => s.setReflectionAffirmation);

  const [focusId, setFocusId] = useState<string | null>(null);
  const [popup, setPopup] = useState<Popup>(null);
  const [speaking, setSpeaking] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
  const [withMe, setWithMe] = useState(false);
  const [starId, setStarId] = useState<string | null>(null);
  const [shuffleNonce, setShuffleNonce] = useState(0);
  const [lit, setLit] = useState(false);

  /* Both of these read the clock, and the clock is not allowed in a render:
     a seed that changes between two renders reshuffles the floor under the
     child's finger. Taken once, on arrival, and held for the visit. */
  const [visitStart] = useState(() => new Date());
  const [daySeed] = useState(() => Math.floor(Date.now() / 86_400_000));

  const summary = useMemo(() => summariseReflections(all, visitStart), [all, visitStart]);

  /*
    ONE DOOR FOR EVERY SPOKEN LINE.

    Scattering `speak(...)` through a screen this size is how half of it ends
    up still talking in the quiet state eighteen months from now. Everything
    that says anything goes through here, and the mute lives in one place.
  */
  const say = useCallback((text: string, who: 'grownup' | 'mind' = 'mind', onEnd?: () => void) => {
    if (!text) return;
    speak(text, quiet, who, onEnd);
  }, [quiet]);

  const cue = useCallback((c: Parameters<typeof sound.play>[0]) => {
    if (!quiet) sound.play(c);
  }, [quiet]);

  /*
    THE ROOM COMES UP, THEN THE BIRD SPEAKS.

    Both on a delay, and the delay is the point: a line that starts while the
    screen is still arriving is a line nobody hears. The welcome is one of
    four, at random, so a child who comes here every evening is not read the
    same sentence every evening.
  */
  useEffect(() => {
    const t1 = window.setTimeout(() => { setLit(true); cue('enterRoom'); }, still ? 0 : 420);
    const t2 = window.setTimeout(() => {
      say(WELCOME[Math.floor(Math.random() * WELCOME.length)]);
    }, still ? 300 : 1500);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); stopSpeaking(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);

  /*
    THE LULLABY IS THE ROOM, not something to go and switch on. This is where
    the hub's meditation door lands, so a child who came here to be somewhere
    quiet should not have to find a button first. `playMusicWhenAllowed`
    because the room is reachable directly and the tab may not have been
    touched yet — see kit/sound.
  */
  useEffect(() => {
    if (quiet) return;
    const cancel = sound.playMusicWhenAllowed('twoStories');
    return () => { cancel(); sound.stopMusic(); };
  }, [quiet]);

  /* The stones on the floor: a seeded hand from the whole archive, favourites
     weighted so the ones the child kept come round more often. Re-dealt only
     when they ask for it, so a stone never moves under a finger. */
  const dealt = useMemo(() => {
    if (!all.length) return [];
    const pool: SavedReflection[] = [];
    for (const r of all) { pool.push(r); if (r.favourite) pool.push(r); }
    let s = daySeed + shuffleNonce * 7919;
    const rand = () => { s = ((s * 1664525 + 1013904223) | 0) >>> 0; return s / 0x100000000; };
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const seen = new Set<string>();
    const out: SavedReflection[] = [];
    for (const r of pool) {
      if (!seen.has(r.id)) { seen.add(r.id); out.push(r); }
      if (out.length >= STONES) break;
    }
    return out;
  }, [all, shuffleNonce, daySeed]);

  /*
    WHOSE AFFIRMATION IS FLOATING IN FRONT OF THE CHILD.

    The one on the stone they touched, or the newest thing they saved, or —
    for a child who has walked in here before finishing anything — a line that
    is true of a child standing in a room they have never been in.
  */
  const focused = all.find((r) => r.id === focusId) ?? summary.recentReflections[0] ?? null;
  const affirmation = focused?.affirmation
    ?? summary.favouriteAffirmations[0]?.text
    ?? FIRST_AFFIRMATION;

  /* Three to choose from, re-dealt only when the child moves to another
     reflection — a picker that reshuffles under the finger is unusable. */
  const choices = useMemo(() => {
    const three = pickThreeAffirmations(focused?.tag ?? 'other');
    if (focused?.affirmation && !three.includes(focused.affirmation)) three[2] = focused.affirmation;
    return three;
  }, [focused?.id, focused?.tag, focused?.affirmation]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Nothing may still be talking after the room closes. */
  useEffect(() => () => { stopSpeaking(); }, []);

  /* ── The affirmation, out loud ────────────────────────────────────────── */
  const stopSaying = useCallback(() => {
    stopSpeaking();
    setSpeaking(false);
    setWithMe(false);
  }, []);

  const sayAffirmation = useCallback((repeat = false) => {
    cue('tap');
    if (speaking && !repeat) { stopSaying(); return; }
    stopSpeaking();
    setSpeaking(true);
    setWithMe(repeat);
    /* The mind's own voice, because these are words the child says about
       themselves — a grown-up reading them back turns it into being told. */
    say(affirmation, 'mind', () => {
      if (!repeat) { setSpeaking(false); return;}
      /* "Say it with me" is the line twice, with a gap to say it into. */
      window.setTimeout(() => say(affirmation, 'mind', () => { setSpeaking(false); setWithMe(false); }), 1400);
    });
    /* speechSynthesis has no dependable end event on every platform, so the
       pulse also stands down on a timer scaled to the line. Being a little
       out is harmless; a bubble pulsing forever is not. */
    window.setTimeout(() => setSpeaking(false), Math.max(3000, affirmation.length * 95) * (repeat ? 2.4 : 1));
  }, [affirmation, speaking, say, cue, stopSaying]);

  /* ── Breathing ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!breathing) return;
    let phase: 'in' | 'out' = 'in';
    let rounds = 0;
    const beat = () => {
      setBreathPhase(phase);
      if (phase === 'in') { cue('breatheIn'); say('Breathe in…', 'grownup'); }
      else { cue('breatheOut'); say('And out.', 'grownup'); }
      const wait = phase === 'in' ? BREATH_IN_MS : BREATH_OUT_MS;
      phase = phase === 'in' ? 'out' : 'in';
      if (phase === 'in') { rounds += 1; if (rounds % 3 === 0) cue('breathComplete'); }
      timer = window.setTimeout(beat, wait);
    };
    let timer = window.setTimeout(beat, 300);
    return () => { window.clearTimeout(timer); stopSpeaking(); };
  }, [breathing, cue, say]);

  /* ── Opening things ───────────────────────────────────────────────────── */
  const openReflection = (r: SavedReflection) => {
    cue('roomCard');
    setFocusId(r.id);
    markPlayed(r.id);
    setPopup({ kind: 'reflection', id: r.id });
    /* Read it back on arrival. A six-year-old who cannot yet read their own
       saved sentence would otherwise be looking at a picture of it. */
    const parts = [
      r.feeling ? `You were feeling ${r.feeling.toLowerCase()}.` : '',
      r.whatHappened ? `What happened: ${r.whatHappened}` : '',
      r.originalStory ? `Your mind said: ${r.originalStory}` : '',
      r.anotherWay && r.anotherWay !== r.originalStory ? `And then you found: ${r.anotherWay}` : '',
    ].filter(Boolean).join(' ');
    window.setTimeout(() => say(parts, 'grownup'), still ? 200 : 620);
  };

  const openMonth = () => {
    cue('panelSlide');
    setPopup({ kind: 'month' });
    const line = summary.reflectionCount
      ? `${summary.journeysThisMonth} ${summary.journeysThisMonth === 1 ? 'journey' : 'journeys'} in ${summary.monthLabel}. ${summary.practiceLine ?? ''}`
      : 'Nothing here yet. This fills up on its own.';
    window.setTimeout(() => say(line, 'grownup'), still ? 200 : 700);
  };

  const openSky = () => {
    cue('discovery');
    setStarId(null);
    setPopup({ kind: 'sky' });
    window.setTimeout(() => say(
      summary.commonThoughts.length
        ? 'Every thought you have written down is a star. Touch one to see where it came from.'
        : 'Your sky is empty for now. Every journey puts a star in it.',
      'mind',
    ), still ? 200 : 700);
  };

  const closePopup = () => {
    cue('exitRoom');
    stopSpeaking();
    setPopup(null);
    setStarId(null);
  };

  const shuffle = () => {
    cue('miniWin');
    setShuffleNonce((n) => n + 1);
    setFocusId(null);
    say('Here are some others.', 'mind');
  };

  const favourite = (r: SavedReflection) => {
    const next = !r.favourite;
    cue(next ? 'resolve' : 'tap');
    toggleFav(r.id);
    if (next) say('Kept.', 'mind');
  };

  const chooseAffirmation = (r: SavedReflection, text: string) => {
    cue('discovery');
    setAffirmation(r.id, text);
    say(text, 'mind');
  };

  /* ── The sky ──────────────────────────────────────────────────────────── */
  const sky = useMemo(
    () => constellationLayout(summary.commonThoughts.slice(0, 12)),
    [summary.commonThoughts],
  );
  /* Two stars are joined when the same journey produced both — which is, in
     practice, every old story and the possibility the child found instead. */
  const links = useMemo(() => {
    const out: Array<[number, number]> = [];
    for (let a = 0; a < sky.length; a++) {
      for (let b = a + 1; b < sky.length; b++) {
        if (sky[a].reflectionIds.some((id) => sky[b].reflectionIds.includes(id))) out.push([a, b]);
      }
    }
    return out;
  }, [sky]);

  const touchStar = (star: ThoughtStar) => {
    cue('discovery');
    setStarId(star.label);
    say(star.label, star.kind === 'old' ? 'grownup' : 'mind');
  };

  const starExamples = (label: string) =>
    all.filter((r) => sky.find((s) => s.label === label)?.reflectionIds.includes(r.id));

  const stones = SLOTS.map((slot, i) => ({ slot, i, r: dealt[i] ?? null }));
  const openReflectionRecord = popup?.kind === 'reflection'
    ? all.find((r) => r.id === popup.id) ?? null
    : null;

  return (
    <main
      className={`rr-room ${still ? 'rr-still' : ''} ${lit ? 'rr-lit' : ''} ${popup ? 'rr-hushed' : ''}`}
      style={{ fontFamily: FONT }}
      data-floating-room
    >
      {/* The place itself. Everything else in here stands in front of it. */}
      <img className="rr-bg" src={`${V3}room.webp`} alt="" aria-hidden="true" draggable={false} />
      <div className="rr-portal-glow" aria-hidden="true" />
      <Ambience still={still} />

      {/* Foreground decor, inert to the pointer — it is scenery, not controls. */}
      <img className="rr-lantern" src={`${V3}lantern.webp`} alt="" aria-hidden="true" draggable={false} />
      <img className="rr-crystals" src={`${V3}crystals.webp`} alt="" aria-hidden="true" draggable={false} />

      <DoorHandle side="left" label="Back to Mind Gym" onClick={() => { stopSpeaking(); sound.stopMusic(); onExit(); }}
        accent="#ffd98a" scale={0.42} bottomVh={64} />

      <header className="rr-head">
        <h1>Reflection Room <span aria-hidden="true">♡</span></h1>
        <p className="rr-head-sub">Stay as long as you like.</p>
        {/* Only once there is something to tap. A room with nothing in it
            telling a child to tap a glowing reflection is a room setting them
            a task they cannot do. */}
        {all.length > 0 && <p className="rr-head-hint">Tap a glowing reflection to revisit it.</p>}
      </header>

      {/*
        TWO SMALL OBJECTS IN THE ROOM, rather than a dashboard bolted to the
        corner. The hanging star is the month; the little sky-glass is the
        constellation. Both are things in the world that happen to open
        something, which is the whole rule this screen is built on.
      */}
      <div className="rr-charms">
        <button className="rr-charm rr-charm-month" onClick={openMonth}
          aria-label={`My journey this month: ${summary.journeysThisMonth} ${summary.journeysThisMonth === 1 ? 'journey' : 'journeys'}`}>
          <span className="rr-charm-art" aria-hidden="true">★</span>
          <span className="rr-charm-label"><b>{summary.journeysThisMonth}</b>My month</span>
        </button>
        <button className="rr-charm rr-charm-sky" onClick={openSky} aria-label="Open my thought constellation">
          <span className="rr-charm-art" aria-hidden="true">✦</span>
          <span className="rr-charm-label"><b>{summary.commonThoughts.length}</b>My sky</span>
        </button>
      </div>

      {/* ── The floor of reflections ─────────────────────────────────────── */}
      <ul className={`rr-stones ${narrow ? 'rr-stones-rail' : ''}`} aria-label="Your saved reflections">
        {stones.map(({ slot, i, r }) => {
          const style = narrow
            ? ({ '--i': i } as CSSProperties)
            : ({ left: `${slot.left}%`, top: `${slot.top}%`, width: `${slot.w}%`, '--i': i } as CSSProperties);

          if (!r) {
            /* An unlit stone. Scenery that shows the room has room, never a
               control that does nothing — so it is out of the tab order. */
            return narrow ? null : (
              <li key={`empty-${i}`} className="rr-stone-slot rr-stone-empty" style={style} aria-hidden="true">
                <img src={`${V3}stone.webp`} alt="" draggable={false} />
              </li>
            );
          }

          const isFocus = focusId === r.id;
          return (
            <li key={r.id} className={`rr-stone-slot ${isFocus ? 'rr-stone-here' : ''}`} style={style}>
              <button
                className="rr-stone"
                onClick={() => openReflection(r)}
                onPointerEnter={() => setFocusId(r.id)}
                onFocus={() => setFocusId(r.id)}
                aria-label={`Reflection from ${formatDay(r.createdAt)}: ${r.pathLabel}`}
              >
                <img className="rr-stone-art" src={`${V3}stone.webp`} alt="" aria-hidden="true" draggable={false} />
                <span className="rr-stone-text">
                  <span className="rr-stone-mark" aria-hidden="true">{r.favourite ? '♥' : TAG_ICON[r.tag] ?? '✦'}</span>
                  {r.pathLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* ── The child, and the bird who lives here ───────────────────────── */}
      <div className={`rr-cast ${speaking && !still ? 'rr-cast-listening' : ''}`} aria-hidden="true">
        <img className="rr-child" src={`${CAST}child_character.png`} alt="" draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <img className="rr-chirpy" src={`${CAST}chirpy_character.png`} alt="" draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>

      {/*
        ── The affirmation ───────────────────────────────────────────────

        The one thing in the room that is about right now rather than about
        something that already happened, so it sits closest to the child and
        gets the brightest surface in the pack.

        ITS CONTROLS ARE THREE ICONS ON THE BUBBLE ITSELF. There is no
        transport bar, no scrubber and no timeline, and there was: a strip
        with ❚❚ and a progress track counting against a duration nobody knew,
        because the line is spoken live and has no length until it is over.
        A bar that fills while the voice has already stopped is a lie a child
        catches in about four seconds.
      */}
      <div className={`rr-affirm ${speaking ? 'rr-affirm-live' : ''} ${withMe ? 'rr-affirm-withme' : ''}`}>
        <img className="rr-affirm-art" src={`${V3}heart.webp`} alt="" aria-hidden="true" draggable={false} />
        <p className="rr-affirm-text">{affirmation}</p>
        <div className="rr-affirm-tools">
          <button onClick={() => sayAffirmation(false)} aria-pressed={speaking}
            aria-label={speaking ? 'Stop saying my affirmation' : 'Say my affirmation out loud'}>
            {speaking ? '❚❚' : '▶'}
          </button>
          <button
            className={focused?.favourite ? 'rr-on' : ''}
            onClick={() => focused && favourite(focused)}
            disabled={!focused}
            aria-pressed={!!focused?.favourite}
            aria-label={focused?.favourite ? 'Remove this reflection from my favourites' : 'Keep this reflection as a favourite'}
          >{focused?.favourite ? '♥' : '♡'}</button>
          <button onClick={() => sayAffirmation(true)} aria-label="Say it with me, twice">↻</button>
        </div>
        {speaking && !still && (
          <span className="rr-affirm-sparks" aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}
          </span>
        )}
      </div>

      {withMe && <p className="rr-with-me" role="status">Say it with me — out loud, as many times as you like.</p>}

      {/* Breathing takes the room over rather than opening a panel: it is the
          one thing in here that is better with nothing else on screen. */}
      {breathing && (
        <div className="rr-breath" role="status">
          <span className={`rr-breath-orb rr-breath-${breathPhase}`} aria-hidden="true" />
          <p>{breathPhase === 'in' ? 'Breathe in…' : 'And out…'}</p>
        </div>
      )}

      {/* ── Four glowing stones along the foot ───────────────────────────── */}
      <nav className="rr-actions" aria-label="Things you can do here">
        <button onClick={shuffle} disabled={all.length < 2}>
          <span aria-hidden="true">♡</span> Shuffle a reflection
        </button>
        <button className={breathing ? 'rr-on' : ''} aria-pressed={breathing}
          onClick={() => { cue('tap'); setBreathing((v) => { if (v) stopSpeaking(); return !v; }); }}>
          <span aria-hidden="true">☾</span> {breathing ? 'Stop breathing' : 'Breathe and relax'}
        </button>
        <button className={withMe ? 'rr-on' : ''} aria-pressed={withMe} onClick={() => sayAffirmation(true)}>
          <span aria-hidden="true">★</span> Say it with me
        </button>
        <button className="rr-action-soft" onClick={() => { stopSpeaking(); sound.stopMusic(); onGrownUp(); }}>
          <span aria-hidden="true">♡</span> Talk to a grown-up
        </button>
      </nav>

      {!all.length && (
        <p className="rr-empty">
          Your room is ready and there is nothing in it yet.<br />
          Finish a Story Lab journey and it turns up here, lit, as a stone on the floor.
        </p>
      )}

      {/* ══ Popups, all in the same room ═══════════════════════════════════ */}
      <AnimatePresence>
        {openReflectionRecord && (
          <Panel key="reflection" icon="✦" title={formatDay(openReflectionRecord.createdAt) || 'A reflection'} onClose={closePopup}>
            <ReflectionDetail
              r={openReflectionRecord}
              choices={choices}
              onSay={(t, who) => { cue('tap'); say(t, who); }}
              onFavourite={() => favourite(openReflectionRecord)}
              onChoose={(t) => chooseAffirmation(openReflectionRecord, t)}
            />
          </Panel>
        )}

        {popup?.kind === 'month' && (
          <Panel key="month" icon="★" title={`My journey — ${summary.monthLabel}`} onClose={closePopup}>
            <MonthPanel summary={summary} />
          </Panel>
        )}

        {popup?.kind === 'sky' && (
          <Panel key="sky" icon="✧" title="My thought constellation" onClose={closePopup} wide>
            <SkyPanel
              sky={sky}
              links={links}
              still={still}
              selected={starId}
              onTouch={touchStar}
              examples={starId ? starExamples(starId) : []}
            />
          </Panel>
        )}
      </AnimatePresence>
    </main>
  );
}

/* ── Popup 1 · one reflection, read back ─────────────────────────────────── */

function ReflectionDetail({ r, choices, onSay, onFavourite, onChoose }: {
  r: SavedReflection;
  choices: string[];
  onSay: (text: string, who: 'grownup' | 'mind') => void;
  onFavourite: () => void;
  onChoose: (text: string) => void;
}) {
  /*
    SHORT LABELS, AND NOTHING THE CHILD DID NOT SAY.

    Each link renders only if that step was answered, so a reflection saved
    from a shorter walk shows a shorter chain rather than a row of empty
    boxes with internal field names in them.
  */
  return (
    <>
      <div className="rr-detail-top">
        {r.feeling && <span className="rr-chip">{r.feeling}</span>}
        <span className="rr-chip rr-chip-soft">{TAG_LABELS[r.tag] ?? 'Reflection'}</span>
      </div>

      <p className="rr-detail-lead">“{r.pathLabel}”</p>

      <ol className="rr-chain">
        {r.whatHappened && (
          <li><b>What happened</b><span>{r.whatHappened}</span></li>
        )}
        {r.originalStory && (
          <li className="rr-chain-old"><b>Old story</b><span>“{r.originalStory}”</span></li>
        )}
        {r.anotherWay && r.anotherWay !== r.originalStory && (
          <li className="rr-chain-new"><b>Another way</b><span>“{r.anotherWay}”</span></li>
        )}
      </ol>

      <div className="rr-detail-affirm">
        <b>My affirmation</b>
        <p>{r.affirmation ? `“${r.affirmation}”` : 'Pick one to carry with you.'}</p>
        <button className="rr-icon-btn" onClick={() => onSay(r.affirmation || r.pathLabel, 'mind')}
          aria-label="Listen to this">🔊</button>
      </div>

      <p className="rr-pick-hint">{r.affirmation ? 'Pick again, or keep this one.' : 'Choose an affirmation.'}</p>
      <div className="rr-picks">
        {choices.map((c) => (
          <button key={c} className={r.affirmation === c ? 'rr-pick-on' : ''} onClick={() => onChoose(c)}>{c}</button>
        ))}
      </div>

      <div className="rr-detail-foot">
        <button onClick={() => onSay(
          [r.whatHappened, r.originalStory, r.anotherWay].filter(Boolean).join('. '), 'grownup',
        )}>🔊 Read it to me</button>
        <button className={r.favourite ? 'rr-on' : ''} onClick={onFavourite} aria-pressed={r.favourite}>
          {r.favourite ? '♥ Kept' : '♡ Keep this'}
        </button>
      </div>
    </>
  );
}

/* ── Popup 2 · the month, described and never graded ─────────────────────── */

function MonthPanel({ summary }: { summary: ReturnType<typeof summariseReflections> }) {
  if (!summary.reflectionCount) {
    return <p className="rr-month-empty">Nothing here yet — and that is fine. This fills itself in, one journey at a time.</p>;
  }
  return (
    <>
      <div className="rr-month-grid">
        <div className="rr-month-stat">
          <b>{summary.journeysThisMonth}</b>
          <span>{summary.journeysThisMonth === 1 ? 'journey this month' : 'journeys this month'}</span>
        </div>
        <div className="rr-month-stat">
          <b>{summary.revisited}</b>
          <span>{summary.revisited === 1 ? 'reflection revisited' : 'reflections revisited'}</span>
        </div>
        <div className="rr-month-stat">
          <b>{summary.favouriteAffirmations.length}</b>
          <span>{summary.favouriteAffirmations.length === 1 ? 'affirmation kept' : 'affirmations kept'}</span>
        </div>
      </div>

      {summary.mostCommonFeelings.length > 0 && (
        <section className="rr-month-block">
          <h3>Feelings you noticed most</h3>
          <ul className="rr-feel-row">
            {summary.mostCommonFeelings.slice(0, 4).map((f) => (
              <li key={f.label}><b>{f.label}</b><span>{f.count}×</span></li>
            ))}
          </ul>
        </section>
      )}

      {summary.favouriteAffirmations.length > 0 && (
        <section className="rr-month-block">
          <h3>Lines you keep coming back to</h3>
          <ul className="rr-keep-list">
            {summary.favouriteAffirmations.slice(0, 3).map((a) => (
              <li key={a.text}>“{a.text}”</li>
            ))}
          </ul>
        </section>
      )}

      {/* The one sentence in the room that describes the child, and it
          describes what they have been DOING. See kit/reflectionSummary. */}
      {summary.practiceLine && <p className="rr-month-line">{summary.practiceLine}</p>}
    </>
  );
}

/* ── Popup 3 · the sky ───────────────────────────────────────────────────── */

function SkyPanel({ sky, links, still, selected, onTouch, examples }: {
  sky: ReturnType<typeof constellationLayout>;
  links: Array<[number, number]>;
  still: boolean;
  selected: string | null;
  onTouch: (star: ThoughtStar) => void;
  examples: SavedReflection[];
}) {
  if (!sky.length) {
    return <p className="rr-month-empty">Your sky is empty for now. Every journey you finish puts a star in it.</p>;
  }
  return (
    <div className="rr-sky-wrap">
      <div className="rr-sky">
        <svg className="rr-sky-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {links.map(([a, b], i) => (
            <line key={i} x1={sky[a].x} y1={sky[a].y} x2={sky[b].x} y2={sky[b].y} />
          ))}
        </svg>
        {sky.map((star, i) => (
          <button
            key={star.label}
            className={`rr-star rr-star-${star.kind} ${selected === star.label ? 'rr-star-on' : ''} ${still ? '' : 'rr-star-twinkle'}`}
            style={{
              left: `${star.x}%`, top: `${star.y}%`,
              '--scale': star.scale, '--i': i,
            } as CSSProperties}
            onClick={() => onTouch(star)}
            aria-label={`${star.kind === 'old' ? 'A story your mind made' : 'Another way you found'}: ${star.label}. Written down ${star.count} ${star.count === 1 ? 'time' : 'times'}.`}
          >
            <span aria-hidden="true">✦</span>
          </button>
        ))}
      </div>

      <div className="rr-sky-side">
        <ul className="rr-sky-list">
          {sky.slice(0, 6).map((star) => (
            <li key={star.label}>
              <button className={`rr-sky-item rr-sky-${star.kind} ${selected === star.label ? 'rr-sky-item-on' : ''}`}
                onClick={() => onTouch(star)}>
                <span aria-hidden="true">✦</span>{star.label}
              </button>
            </li>
          ))}
        </ul>

        {selected ? (
          <div className="rr-sky-detail" role="status">
            <b>Where this came from</b>
            {examples.length
              ? <ul>{examples.slice(0, 3).map((r) => (
                  <li key={r.id}>{formatDay(r.createdAt)} — {r.feeling ? `${r.feeling}. ` : ''}{r.whatHappened || r.pathLabel}</li>
                ))}</ul>
              : <p>This one is new.</p>}
          </div>
        ) : (
          <p className="rr-sky-hint">Touch a star to hear it, and to see where it came from.</p>
        )}

        {/* Said plainly, because the sky itself cannot say it: the biggest
            star is the one written down most, and that is all it is. */}
        <p className="rr-sky-note">Gold stars are stories your mind made. Green ones are other ways you found. A bigger star just means you wrote it down more often — not that it is the true one.</p>
      </div>
    </div>
  );
}
