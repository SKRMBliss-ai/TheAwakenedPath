import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useKidStore, type SavedReflection } from '../../../kids/store';
import { FONT } from '../ui/chrome';
import { speak, stopSpeaking, preload } from '../kit/chirpyVoice';
import { useQuiet } from '../ui/quiet';
import { DoorHandle } from '../ui/DoorHandle';
import { BadgeSlot } from './ChildBadge';
import * as sound from '../kit/sound';
import { pickThreeAffirmations, allAffirmations } from '../kit/affirmations';
import { summariseReflections, constellationLayout, type ThoughtStar } from '../kit/reflectionSummary';
import './ReflectionPath.css';

/*
  ══════════════════════════════════════════════════════════════════════════
  THE REFLECTION ROOM — v4.

  One room. Everything opens INSIDE it. The child never leaves.

  v4 replaces the generic stone plates with hand-painted reflection bricks
  (four states: empty, hover, selected, completed), adds a breathing orb
  that cycles through three art states instead of a CSS gradient circle,
  a two-minute "quiet star" meditation that transforms the room rather than
  opening a new screen, and a compact affirmation bar that replaces the
  heart.webp bubble.

  THREE THINGS THIS ROOM WILL NOT DO:
    1. It never scores a child.
    2. It never says a thought was wrong.
    3. It never nags.
  ══════════════════════════════════════════════════════════════════════════
*/

/** v3 room art stays — the background, crystals. */
const V3 = '/mind-gym/reflection/v3/';
/** v4 interactive elements — bricks, orbs, star, bar. */
const V4 = '/mind-gym/reflection/v4/';
/** The locked child + bird. */
const CAST = '/mind-gym/reflection/';

const BRICKS = 8;

/*
  WHERE THE BRICKS LIE — same positions as the old stones, scattered up
  the steps. Percentages of the stage so they hold at every viewport.
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

const WELCOME = [
  'You can stay as long as you like. Nothing to do in here.',
  'Everything you wrote is still here. Nothing got lost.',
  'Your bricks are waiting. Sit wherever you want.',
  'This is your room. I just come and sit in it.',
];

const FIRST_AFFIRMATION = 'I am learning something new about myself.';

function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const BREATH_IN_MS = 4000;
const BREATH_OUT_MS = 6000;
const BREATH_DURATION_MS = 60000;
const MEDITATION_MS = 120000;

function formatDay(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

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

/* ── Ambience ─────────────────────────────────────────────────────────────── */
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

/* ── Panel ────────────────────────────────────────────────────────────────── */
function Panel({ title, icon, onClose, children, wide }: {
  title: string; icon: string; onClose: () => void; children: ReactNode; wide?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);

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

type CalmMode = 'none' | 'breathing' | 'meditation';

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

  const [focusId, setFocusId] = useState<string | null>(null);
  const [popup, setPopup] = useState<Popup>(null);
  const [speaking, setSpeaking] = useState(false);
  const [calmMode, setCalmMode] = useState<CalmMode>('none');
  const [breathPhase, setBreathPhase] = useState<'idle' | 'in' | 'out'>('idle');
  const [starId, setStarId] = useState<string | null>(null);
  /* The line the room is saying right now, shown in the affirmation bar, and
     the affirmation being read inside an open popup. */
  const [roomLine, setRoomLine] = useState<string | null>(null);
  const [popupLine, setPopupLine] = useState<string | null>(null);
  const [lit, setLit] = useState(false);
  const [meditationDots, setMeditationDots] = useState(12);

  const [visitStart] = useState(() => new Date());
  const [daySeed] = useState(() => Math.floor(Date.now() / 86_400_000));

  const summary = useMemo(() => summariseReflections(all, visitStart), [all, visitStart]);

  const say = useCallback((text: string, who: 'grownup' | 'mind' | 'guide' = 'mind', onEnd?: () => void) => {
    if (!text) return;
    speak(text, quiet, who, onEnd);
  }, [quiet]);

  const cue = useCallback((c: Parameters<typeof sound.play>[0]) => {
    if (!quiet) sound.play(c);
  }, [quiet]);

  /*
    One list of lines, read one after another. `onEnd` only fires for the
    Gemini audio, never the browser fallback, so every line also gets a timer
    sized to its length and whichever comes first moves on. Starting a new
    list, or calling cancelLines, abandons the old one.
  */
  const lineToken = useRef(0);
  const cancelLines = useCallback(() => { lineToken.current += 1; setSpeaking(false); }, []);
  const playLines = useCallback((
    lines: Array<{ text: string; who: 'grownup' | 'mind' }>,
    onStep: (i: number) => void,
    onDone: () => void,
  ) => {
    const token = ++lineToken.current;
    setSpeaking(true);
    const next = (i: number) => {
      if (token !== lineToken.current) return;
      if (i >= lines.length) { setSpeaking(false); onDone(); return; }
      onStep(i);
      let moved = false;
      let timer = 0;
      const advance = () => {
        if (moved || token !== lineToken.current) return;
        moved = true;
        window.clearTimeout(timer);
        window.setTimeout(() => next(i + 1), 700);
      };
      timer = window.setTimeout(advance, Math.max(3500, lines[i].text.length * 110) + 1500);
      speak(lines[i].text, quiet, lines[i].who, advance);
    };
    next(0);
  }, [quiet]);

  /* ── Room arrival ────────────────────────────────────────────────────────── */
  /* Every affirmation the child has, shuffled once per visit. */
  const [roomAffirmations] = useState(() => {
    const own = [...new Set(all.map((r) => r.affirmation).filter((a): a is string => !!a))];
    const list = own.length ? own : [FIRST_AFFIRMATION, ...pickThreeAffirmations('other')];
    return shuffled(list);
  });
  /* How far the room has got, so a popup can interrupt and the room picks up
     where it left off afterwards. */
  const roomAt = useRef(0);
  /*
    THE ROOM KEEPS SAYING THEM, for as long as a child sits in it.

    It already started on its own when they arrived — a welcome line, then
    every affirmation they have, in a shuffled order. But it said them once and
    then went quiet for good, which on a screen a child is meant to be able to
    sit in for ten minutes meant the room fell silent about forty seconds in
    and never spoke again. A room that affirms you once is a notification.

    So when the list runs out it waits a breath and goes round again from the
    top. Anything the child starts — a brick, a breathing exercise, the quiet
    star — interrupts it, and it picks up afterwards, which is what roomAt was
    always for.
  */
  const loopTimer = useRef<number | undefined>(undefined);
  /* Each time this ticks the room starts the list again. A counter rather than
     a function calling itself: the self-reference needed a ref written during
     render, which React does not allow. */
  const [roomPass, setRoomPass] = useState(0);
  const playRoom = useCallback(() => {
    const rest = roomAffirmations.slice(roomAt.current);
    if (!rest.length) {
      setRoomLine(null);
      roomAt.current = 0;
      window.clearTimeout(loopTimer.current);
      loopTimer.current = window.setTimeout(() => setRoomPass((n) => n + 1), 14000);
      return;
    }
    playLines(
      rest.map((text) => ({ text, who: 'mind' as const })),
      (i) => { roomAt.current = roomAffirmations.length - rest.length + i + 1; setRoomLine(rest[i]); },
      () => setRoomPass((n) => n + 1),
    );
  }, [roomAffirmations, playLines]);
  useEffect(() => {
    if (!roomPass) return;
    playRoom();
  }, [roomPass, playRoom]);

  useEffect(() => {
    const t1 = window.setTimeout(() => { setLit(true); cue('enterRoom'); }, still ? 0 : 420);
    const t2 = window.setTimeout(() => {
      playLines([{ text: WELCOME[Math.floor(Math.random() * WELCOME.length)], who: 'mind' }], () => {}, playRoom);
    }, still ? 300 : 1500);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); window.clearTimeout(loopTimer.current); lineToken.current += 1; stopSpeaking(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);

  useEffect(() => {
    if (quiet) return;
    const cancel = sound.playMusicWhenAllowed('reflectionBed');
    return () => { cancel(); sound.stopMusic(); };
  }, [quiet]);

  /*
    EVERY AFFIRMATION, WARMED BEFORE A HAND EVER REACHES FOR A BRICK.

    Tapping a brick used to mean a wait — speak() had never seen that line
    before, so it went out to the Function and only then started talking.
    A stone's tag decides which three of the sixty-odd lines get read, and a
    child can tap any brick in any order, so there's no way to know in
    advance which three matter. The whole set is small enough to just fetch
    it all: a few dozen short lines, most of them already sitting in the
    Function's own Storage cache from every other child who has heard them,
    so this is mostly a handful of quick downloads rather than new
    synthesis.

    Four at a time, quietly, in the background — this must never compete
    with the welcome line above for the one voice slot, and must never make
    a room that's about to speak wait on a fetch that doesn't matter yet.
  */
  useEffect(() => {
    if (quiet) return;
    let cancelled = false;
    const lines = allAffirmations();
    const run = async () => {
      const batch = 4;
      for (let i = 0; i < lines.length; i += batch) {
        if (cancelled) return;
        await Promise.all(lines.slice(i, i + batch).map((line) => preload(line, 'mind')));
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [quiet]);

  /* The lullaby bed stops for breathing — the orb and the counted breath are
     the only thing that should be heard while a child is doing them — and
     comes back once the exercise ends, whether it ran to the end or was
     stopped early. */
  useEffect(() => {
    if (quiet || calmMode !== 'breathing') return;
    sound.stopMusic();
    return () => { sound.playMusicWhenAllowed('reflectionBed'); };
  }, [calmMode, quiet]);

  /* ── Dealt bricks ────────────────────────────────────────────────────────── */
  const dealt = useMemo(() => {
    if (!all.length) return [];
    const pool: SavedReflection[] = [];
    for (const r of all) { pool.push(r); if (r.favourite) pool.push(r); }
    let s = daySeed;
    const rand = () => { s = ((s * 1664525 + 1013904223) | 0) >>> 0; return s / 0x100000000; };
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const seen = new Set<string>();
    const out: SavedReflection[] = [];
    for (const r of pool) {
      if (!seen.has(r.id)) { seen.add(r.id); out.push(r); }
      if (out.length >= BRICKS) break;
    }
    return out;
  }, [all, daySeed]);

  /* ── Active affirmation ──────────────────────────────────────────────────── */
  const focused = all.find((r) => r.id === focusId) ?? summary.recentReflections[0] ?? null;
  const affirmation = focused?.affirmation
    ?? summary.favouriteAffirmations[0]?.text
    ?? FIRST_AFFIRMATION;

  /* The popup's affirmations, fixed when it opens so the list it is reading
     from doesn't reshuffle under it. */
  const [choices, setChoices] = useState<string[]>([]);

  /* ── Breathing ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (calmMode !== 'breathing') return;
    let phase: 'in' | 'out' = 'in';
    const startTime = Date.now();
    const beat = () => {
      if (Date.now() - startTime > BREATH_DURATION_MS) {
        setCalmMode('none');
        setBreathPhase('idle');
        cue('breathComplete');
        useKidStore.getState().noteActivity({ kind: 'calm', detail: 'breathing' });
        say('Stay here as long as you like.', 'guide');
        return;
      }
      setBreathPhase(phase);
      if (phase === 'in') { cue('breatheIn'); say('Breathe in…', 'guide'); }
      else { cue('breatheOut'); say('And out.', 'guide'); }
      const wait = phase === 'in' ? BREATH_IN_MS : BREATH_OUT_MS;
      phase = phase === 'in' ? 'out' : 'in';
      timer = window.setTimeout(beat, wait);
    };
    let timer = window.setTimeout(beat, 300);
    return () => { window.clearTimeout(timer); stopSpeaking(); };
  }, [calmMode, cue, say]);

  /* ── Meditation ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (calmMode !== 'meditation') return;
    setMeditationDots(12);
    const t0 = window.setTimeout(() => {
      say('Watch the little star, or just rest here.', 'guide');
    }, 600);
    // One dot fades every 10s
    const dotInterval = window.setInterval(() => {
      setMeditationDots((d) => {
        if (d <= 1) return 0;
        return d - 1;
      });
    }, 10000);
    const endTimer = window.setTimeout(() => {
      cue('breathComplete');
      useKidStore.getState().noteActivity({ kind: 'calm', detail: 'quiet' });
      setCalmMode('none');
      setMeditationDots(12);
      window.setTimeout(() => {
        say(affirmation, 'mind');
      }, 800);
    }, MEDITATION_MS);
    return () => {
      window.clearTimeout(t0);
      window.clearInterval(dotInterval);
      window.clearTimeout(endTimer);
      stopSpeaking();
    };
  }, [calmMode, cue, say, affirmation]);

  /* ── Opening things ──────────────────────────────────────────────────────── */
  /* Opening a brick reads the reflection, then every affirmation in a
     shuffled order, then closes itself and the room carries on. */
  const openReflection = (r: SavedReflection) => {
    cancelLines();
    cue('roomCard');
    setFocusId(r.id);
    markPlayed(r.id);
    const three = pickThreeAffirmations(r.tag ?? 'other');
    if (r.affirmation && !three.includes(r.affirmation)) three[2] = r.affirmation;
    const list = shuffled(three);
    setChoices(list);
    setPopupLine(null);
    setPopup({ kind: 'reflection', id: r.id });
    const parts = [
      r.feeling ? `You were feeling ${r.feeling.toLowerCase()}.` : '',
      r.whatHappened ? `What happened: ${r.whatHappened}` : '',
      r.originalStory ? `Your mind said: ${r.originalStory}` : '',
      r.anotherWay && r.anotherWay !== r.originalStory ? `And then you found: ${r.anotherWay}` : '',
    ].filter(Boolean).join(' ');
    const lines = [
      ...(parts ? [{ text: parts, who: 'grownup' as const }] : []),
      ...list.map((text) => ({ text, who: 'mind' as const })),
    ];
    const offset = parts ? 1 : 0;
    window.setTimeout(() => playLines(
      lines,
      (i) => setPopupLine(i >= offset ? list[i - offset] : null),
      () => closePopup(),
    ), still ? 200 : 620);
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
    cancelLines();
    stopSpeaking();
    setPopup(null);
    setPopupLine(null);
    setStarId(null);
    window.setTimeout(playRoom, 900);
  };

  const favourite = (r: SavedReflection) => {
    const next = !r.favourite;
    cue(next ? 'resolve' : 'tap');
    toggleFav(r.id);
    if (next) say('Kept.', 'mind');
  };


  const startBreathing = () => {
    if (calmMode === 'breathing') {
      setCalmMode('none');
      setBreathPhase('idle');
      stopSpeaking();
      return;
    }
    cancelLines();
    cue('tap');
    setCalmMode('breathing');
  };

  const startMeditation = () => {
    if (calmMode === 'meditation') {
      setCalmMode('none');
      setMeditationDots(12);
      stopSpeaking();
      return;
    }
    cancelLines();
    cue('tap');
    setCalmMode('meditation');
  };

  /* ── Sky ─────────────────────────────────────────────────────────────────── */
  const sky = useMemo(
    () => constellationLayout(summary.commonThoughts.slice(0, 12)),
    [summary.commonThoughts],
  );
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

  const bricks = SLOTS.map((slot, i) => ({ slot, i, r: dealt[i] ?? null }));
  const openReflectionRecord = popup?.kind === 'reflection'
    ? all.find((r) => r.id === popup.id) ?? null
    : null;

  const inCalm = calmMode !== 'none';

  return (
    <main
      className={[
        'rr-room',
        still ? 'rr-still' : '',
        lit ? 'rr-lit' : '',
        popup ? 'rr-hushed' : '',
        inCalm ? 'rr-calm-mode' : '',
      ].filter(Boolean).join(' ')}
      style={{ fontFamily: FONT }}
      data-floating-room
    >
      <img className="rr-bg" src={`${V3}room.webp`} alt="" aria-hidden="true" draggable={false} />
      <div className="rr-portal-glow" aria-hidden="true" />
      <Ambience still={still || inCalm} />

      <img className="rr-crystals" src={`${V3}crystals.webp`} alt="" aria-hidden="true" draggable={false} />

      <DoorHandle side="left" label="Back to Mind Gym" onClick={() => { stopSpeaking(); sound.stopMusic(); onExit(); }}
        accent="#ffd98a" scale={0.42} bottomVh={64} />

      <header className="rr-head">
        <h1>Reflection Room <span aria-hidden="true">♡</span></h1>
        <p className="rr-head-sub">Stay as long as you like.</p>
        {all.length > 0 && <p className="rr-head-hint">Tap a glowing brick to revisit it.</p>}
      </header>

      <div className="rr-charms">
        <BadgeSlot />
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

      {/* ── The floor of reflection bricks ──────────────────────────────────── */}
      <ul className={`rr-bricks ${narrow ? 'rr-bricks-rail' : ''}`} aria-label="Your saved reflections">
        {bricks.map(({ slot, i, r }) => {
          const style = narrow
            ? ({ '--i': i } as CSSProperties)
            : ({ left: `${slot.left}%`, top: `${slot.top}%`, width: `${slot.w}%`, '--i': i } as CSSProperties);

          if (!r) {
            return narrow ? null : (
              <li key={`empty-${i}`} className="rr-brick-slot rr-brick-empty" style={style} aria-hidden="true">
                <img src={`${V4}reflection_brick_empty.webp`} alt="" draggable={false} />
              </li>
            );
          }

          const isFocus = focusId === r.id;
          const brickImg = r.favourite
            ? `${V4}reflection_brick_completed.webp`
            : isFocus
              ? `${V4}reflection_brick_selected.webp`
              : `${V4}reflection_brick_empty.webp`;

          return (
            <li key={r.id} className={`rr-brick-slot ${isFocus ? 'rr-brick-here' : ''}`} style={style}>
              <button
                className="rr-brick"
                onClick={() => openReflection(r)}
                onPointerEnter={() => setFocusId(r.id)}
                onFocus={() => setFocusId(r.id)}
                aria-label={`Reflection from ${formatDay(r.createdAt)}: ${r.pathLabel}`}
              >
                <img className="rr-brick-art" src={brickImg} alt="" aria-hidden="true" draggable={false} />
                <span className="rr-brick-text">
                  <span className="rr-brick-mark" aria-hidden="true">{r.favourite ? '♥' : TAG_ICON[r.tag] ?? '✦'}</span>
                  {r.pathLabel}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* ── The child and Chirpy ────────────────────────────────────────────── */}
      <div className={`rr-cast ${speaking && !still ? 'rr-cast-listening' : ''}`} aria-hidden="true">
        <img className="rr-child" src={`${CAST}child_character.png`} alt="" draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <img className="rr-chirpy" src={`${CAST}chirpy_character.png`} alt="" draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>

      {/* ── Affirmation with calm objects flanking it ────────────────────────── */}
      <div className="rr-affirm-wrap">
        {/* Left: breathe lantern */}
        <button
          className={`rr-calm-object rr-calm-lantern ${calmMode === 'breathing' ? 'rr-on' : ''}`}
          aria-pressed={calmMode === 'breathing'}
          onClick={startBreathing}
        >
          <img src={`${V3}lantern.webp`} alt="" aria-hidden="true" draggable={false} />
          <span className="rr-calm-motes" aria-hidden="true">
            {[8, 32, 51, 68, 84, 22].map((x, i) => <i key={x} style={{ '--x': x, '--d': i * 0.9 } as CSSProperties} />)}
          </span>
          <span className="rr-calm-tag">{calmMode === 'breathing' ? 'Stop whenever' : 'Breathe & relax'}</span>
        </button>

        {/* Center: affirmation bar */}
        <div className={`rr-affirm ${speaking ? 'rr-affirm-live' : ''}`}>
          <img className="rr-affirm-art" src={`${V4}affirmation_bar_blank.webp`} alt="" aria-hidden="true" draggable={false} />
          <p className="rr-affirm-text" aria-live="polite">{roomLine ?? affirmation}</p>
          <div className="rr-affirm-tools">
            <button
              className={focused?.favourite ? 'rr-on' : ''}
              onClick={() => focused && favourite(focused)}
              disabled={!focused}
              aria-pressed={!!focused?.favourite}
              aria-label={focused?.favourite ? 'Remove from favourites' : 'Keep as favourite'}
            >{focused?.favourite ? '♥' : '♡'}</button>
          </div>
          {speaking && !still && (
            <span className="rr-affirm-sparks" aria-hidden="true">
              {Array.from({ length: 7 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}
            </span>
          )}
        </div>

        {/* Right: meditation star */}
        <button
          className={`rr-calm-object rr-calm-star ${calmMode === 'meditation' ? 'rr-on' : ''}`}
          aria-pressed={calmMode === 'meditation'}
          onClick={startMeditation}
        >
          <img src={`${V4}meditation_focus_star.webp`} alt="" aria-hidden="true" draggable={false} />
          <span className="rr-calm-motes" aria-hidden="true">
            {[8, 32, 51, 68, 84, 22].map((x, i) => <i key={x} style={{ '--x': x, '--d': i * 0.9 } as CSSProperties} />)}
          </span>
          <span className="rr-calm-tag">{calmMode === 'meditation' ? 'Finish for now' : '2 min quiet'}</span>
        </button>
      </div>


      {/* ── Breathing — room transformation ────────────────────────────────── */}
      {calmMode === 'breathing' && (
        <div className="rr-breath" role="status" aria-label="Breathing exercise">
          <img
            className={`rr-breath-orb rr-breath-${breathPhase}`}
            src={`${V4}breathing_orb_${breathPhase === 'in' ? 'inhale' : breathPhase === 'out' ? 'exhale' : 'idle'}.webp`}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <p aria-live="polite">{breathPhase === 'in' ? 'Breathe in…' : breathPhase === 'out' ? 'And out…' : ''}</p>
          <button className="rr-breath-stop" onClick={startBreathing}>Stop whenever you like</button>
        </div>
      )}

      {/* ── Meditation — quiet star ────────────────────────────────────────── */}
      {calmMode === 'meditation' && (
        <div className="rr-meditation" role="status" aria-label="Two minute quiet time">
          <img
            className="rr-meditation-star"
            src={`${V4}meditation_focus_star.webp`}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <div className="rr-meditation-dots" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                className={`rr-meditation-dot ${i >= meditationDots ? 'rr-meditation-dot-gone' : ''}`}
                style={{ '--angle': `${i * 30}deg` } as CSSProperties}
              />
            ))}
          </div>
          <button className="rr-meditation-stop" onClick={startMeditation}>Finish for now</button>
        </div>
      )}


      {/* The grown-up exit stays a plain control, and stays where it always is
          on every screen (§2.10). It is not scenery and must never be a thing
          to find. */}
      <nav className="rr-actions" aria-label="Things you can do here">
        <button className="rr-action-soft" onClick={() => { cancelLines(); stopSpeaking(); sound.stopMusic(); onGrownUp(); }}>
          <span aria-hidden="true">♡</span> Talk to a grown-up
        </button>
      </nav>

      {!all.length && (
        <p className="rr-empty">
          Your room is ready and there is nothing in it yet.<br />
          Finish a Story Lab journey and it turns up here, lit, as a brick on the floor.
        </p>
      )}

      {/* ══ Popups ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {openReflectionRecord && (
          <Panel key="reflection" icon="✦" title={formatDay(openReflectionRecord.createdAt) || 'A reflection'} onClose={closePopup}>
            <ReflectionDetail
              r={openReflectionRecord}
              choices={choices}
              now={popupLine}
              onFavourite={() => favourite(openReflectionRecord)}
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

/* ── Popup 1 · reflection detail ──────────────────────────────────────────── */

function ReflectionDetail({ r, choices, now, onFavourite }: {
  r: SavedReflection;
  choices: string[];
  now: string | null;
  onFavourite: () => void;
}) {
  return (
    <>
      <div className="rr-detail-top">
        {r.feeling && <span className="rr-chip">{r.feeling}</span>}
        <span className="rr-chip rr-chip-soft">{TAG_LABELS[r.tag] ?? 'Reflection'}</span>
      </div>

      <p className="rr-detail-lead">"{r.pathLabel}"</p>

      <ol className="rr-chain">
        {r.whatHappened && (
          <li><b>What happened</b><span>{r.whatHappened}</span></li>
        )}
        {r.originalStory && (
          <li className="rr-chain-old"><b>Old story</b><span>"{r.originalStory}"</span></li>
        )}
        {r.anotherWay && r.anotherWay !== r.originalStory && (
          <li className="rr-chain-new"><b>Another way</b><span>"{r.anotherWay}"</span></li>
        )}
      </ol>

      <div className="rr-picks" aria-live="polite">
        {choices.map((c) => (
          <p key={c} className={now === c ? 'rr-pick-on' : ''}>{c}</p>
        ))}
      </div>

      <div className="rr-detail-foot">
        <button className={r.favourite ? 'rr-on' : ''} onClick={onFavourite} aria-pressed={r.favourite}>
          {r.favourite ? '♥ Kept' : '♡ Keep this'}
        </button>
      </div>
    </>
  );
}

/* ── Popup 2 · the month ──────────────────────────────────────────────────── */

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
              <li key={a.text}>"{a.text}"</li>
            ))}
          </ul>
        </section>
      )}

      {summary.practiceLine && <p className="rr-month-line">{summary.practiceLine}</p>}
    </>
  );
}

/* ── Popup 3 · the sky ────────────────────────────────────────────────────── */

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

        <p className="rr-sky-note">Gold stars are stories your mind made. Green ones are other ways you found. A bigger star just means you wrote it down more often — not that it is the true one.</p>
      </div>
    </div>
  );
}
