import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { FONT } from '../ui/chrome';
import { useQuiet } from '../ui/quiet';
import { DoorHandle } from '../ui/DoorHandle';
import { MicButton } from '../ui/MicButton';
import { useFloatingPosition } from '../ui/useFloatingPosition';
import { chirpySprite } from '../ui/sprites';
import { band } from '../kit/band';
import { thoughtsFor, eventsFor, possibilitiesFor, type Option } from '../kit/storyLabContent';
import { companionFor, COMPANY } from '../kit/feelingCompanions';
import * as sound from '../kit/sound';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import type { DeepDiveAnswers } from './DeepDive';
import './StoryLabRoom.css';

/*
  THE BOY IS IN TWO PLACES, so the bubbles have to be too.

  Under 900px `.sl-thinking-boy` sits inside the panel and the clouds are
  directly above him, so the bubbles rise straight up. At 900px and over that
  copy is hidden and `.sl-room-boy` takes over, sitting on the empty floor to
  the LEFT of the filmstrip — there the bubbles have to travel up and across
  to reach the panel, which is why the two streams below are not one component
  with a flag. Each is only ever drawn at the width its boy exists at (see
  .sl-panel-bubbles / .sl-room-bubbles in the stylesheet).
*/
const BUBBLE_ORIGINS = [
  { left: 44, bottom: 134, size: 15 },
  { left: 61, bottom: 122, size: 12 },
  { left: 52, bottom: 141, size: 11 },
  { left: 68, bottom: 117, size: 16 },
  { left: 56, bottom: 129, size: 10 },
  { left: 41, bottom: 124, size: 14 },
  { left: 64, bottom: 137, size: 11 },
  { left: 49, bottom: 119, size: 13 },
  { left: 59, bottom: 132, size: 10 },
  { left: 45, bottom: 127, size: 15 },
];

/** Straight up from the in-panel boy into the clouds above him (phone). */
function ThoughtParticles({ show }: { show: boolean }) {
  const still = useReducedMotion();
  if (still || !show) return null;

  return (
    <div className="sl-panel-bubbles" aria-hidden="true">
      {BUBBLE_ORIGINS.map((o, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        const spread = 10 + (i % 4) * 11;
        return (
          <motion.span
            key={i}
            className="sl-thought-particle"
            style={{ left: o.left, bottom: o.bottom, width: o.size, height: o.size } as CSSProperties}
            animate={{
              opacity: [0, 0.95, 0.8, 0.5, 0.15, 0],
              y: [0, -70, -150, -230, -300, -310],
              x: [0, dir * spread * 0.25, dir * spread * 0.55, dir * spread * 0.8, dir * spread, dir * spread * 0.9],
              scale: [0.45, 1, 0.95, 0.8, 0.55, 0.2],
            }}
            transition={{ duration: 2.4 + (i % 5) * 0.28, ease: 'easeOut', repeat: Infinity, delay: i * 0.35 }}
          />
        );
      })}
    </div>
  );
}

/*
  Up and ACROSS, from the boy on the floor to the panel in the middle of the
  room. The horizontal leg is in vw rather than px because the panel is centred
  — the gap between the boy and its left edge grows with the window, and a
  fixed pixel distance that lands on the clouds at 1280 stops well short of
  them at 1800.
*/
const ROOM_BUBBLES = [
  { size: 17, rise: 150, lift: 0 },
  { size: 13, rise: 205, lift: 14 },
  { size: 20, rise: 120, lift: -10 },
  { size: 15, rise: 245, lift: 8 },
  { size: 12, rise: 175, lift: -16 },
  { size: 18, rise: 135, lift: 18 },
  { size: 14, rise: 215, lift: -6 },
  { size: 16, rise: 165, lift: 10 },
  { size: 11, rise: 235, lift: -14 },
  { size: 19, rise: 145, lift: 4 },
];

function RoomThoughtParticles({ show, boyPos }: { show: boolean; boyPos?: { xPct: number; yPct: number } }) {
  const still = useReducedMotion();
  if (still || !show) return null;

  return (
    <div
      className="sl-room-bubbles"
      aria-hidden="true"
      style={boyPos ? {
        left: `${boyPos.xPct}%`,
        bottom: `${100 - boyPos.yPct}%`,
      } as CSSProperties : undefined}
    >
      {ROOM_BUBBLES.map((b, i) => (
        <motion.span
          key={i}
          className="sl-thought-particle"
          style={{ left: 0, bottom: b.lift, width: b.size, height: b.size } as CSSProperties}
          animate={{
            opacity: [0, 0.95, 0.85, 0.55, 0.18, 0],
            x: ['0vw', '7vw', '15vw', '22vw', '27vw', '30vw'],
            y: [0, -b.rise * 0.34, -b.rise * 0.64, -b.rise * 0.86, -b.rise, -b.rise * 1.06],
            scale: [0.4, 1, 0.95, 0.82, 0.58, 0.22],
          }}
          transition={{ duration: 3.1 + (i % 5) * 0.32, ease: 'easeOut', repeat: Infinity, delay: i * 0.42 }}
        />
      ))}
    </div>
  );
}
/*
  THE WALK IS A FILMSTRIP NOW, which is what approved_reference_story_lab.png
  has been showing all along.

  The sheet is not four alternative designs for one screen — it is the screen,
  at the end of the walk: 3. Thought, 4. What Happened?, 5. Story and 6.
  Another Way standing side by side with arrows between them. So that is what
  this builds. The child starts with one panel. Answering it slides the next in
  from the right and everything shrinks to make room, and what they already
  said stays on screen, lit, in the panel that asked for it.

  EVERY PANEL IS DRAWN AT 386x675 AND THEN SCALED. That is the size of the
  sheet's own crops, so the proportions inside a panel are the sheet's
  proportions at every window size — one number changes, never the layout. The
  number is measured from the space actually available (see useFilmScale), not
  guessed from the viewport, because the header above it reflows.
*/
const PANEL_W = 386;
const PANEL_H = 675;
const PANEL_GAP = 30;

/*
  SEVEN STEPS, NOT SIX — the Reflection Room is the last one.

  The transition sheet in MindGym_Reflection_Path_Implementation_Pack runs its
  progress bar to "7. Reflection Room (Rest, listen, grow)". Ending the rail at
  "6. Another way" tells a child the walk stops at the last panel, which is
  exactly where they were stopping. The seventh has no answer of its own; it is
  the door, and it lights up when the other six are behind them.
*/
const STEPS = ['Feeling', 'Body', 'Thought', 'What happened?', 'Story', 'Another way', 'Reflection Room'];
const STEP_ART = ['feeling', 'body', 'thought', 'what_happened', 'story', 'another_way'];
const LAST_STEP = STEPS.length - 1;
const TITLES = ['3. Thought', '4. What Happened?', '5. Story', '6. Another Way'];
const PROMPTS = ['What was your mind saying?', 'What actually happened?', "Here's the story your mind made…", "Could anything else be true?"];
const SUBS = ['Tap a thought, or tell me in your own words.', "Let's look at what a little camera could see.", 'Your mind connects the pieces and tries to make sense of it.', "Let's see some other possible stories."];

const SAY_IT: Option = { text: 'Say it your way', icon: 'mic', own: true };
const SOMETHING_ELSE: Option = { text: 'Something else', icon: 'mic', own: true };
const MY_OWN: Option = { text: 'My own idea…', icon: 'mic', own: true };

/**
 * How big a panel can be drawn, measured from the room it is actually given.
 *
 * Arithmetic against the viewport is what put buttons under the pinned strip
 * twice before: the header wraps, the question runs to three lines, and every
 * hand-written offset drifts. This measures the strip's own box instead, so it
 * is right whatever happens above it.
 */
function useFilmScale(count: number) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const measure = useCallback(() => {
    const node = box.current;
    if (!node) return;
    /* The CONTENT box, not the border box: padding on this element is not
       room a panel can be drawn in, and counting it is what put the panels
       under the pinned strip. */
    const style = getComputedStyle(node);
    const width = node.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = node.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    if (!width || !height) return;
    const usable = width - (count - 1) * PANEL_GAP - 8;
    setScale(Math.max(0.2, Math.min(height / PANEL_H, usable / (count * PANEL_W))));
  }, [count]);
  useLayoutEffect(() => {
    measure();
    const node = box.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure]);
  return { box, scale };
}

/* ── The options come round rather than all at once ────────────────────── *
 *
 * Both lists outgrew their panel. Twelve thoughts and a dozen situations were
 * being drawn at the same time inside a box 386 wide and 675 tall, so on a
 * desktop the top row was clipped, the bottom row ran under the panel's edge
 * and "Say it your way" — the one option that is always true — was off the
 * bottom where nobody could reach it. Making the type smaller to fit is the
 * obvious fix and the wrong one: a child of six reads slowly, and a wall of
 * thirteen small sentences is not scanned, it is given up on.
 *
 * So a handful sit there at a time and the rest come round. The child sees
 * more of the list than they ever did, in pieces they can actually read.
 */

/** How many of the pool stand on screen at once, per panel. */
const THOUGHT_WINDOW = 8;
const EVENT_WINDOW = 5;
const POSSIBILITY_WINDOW = 3;
/** How long a set stays before the next comes round. */
const ROTATE_MS = 3000;
/** Long enough to read as drifting off rather than blinking out. */
const FADE_MS = 430;

/**
 * A window onto `pool` that moves along every `ms`.
 *
 * `paused` is doing more work than it looks. It holds the list still while a
 * child is reaching for one of them — pointer over the field, or a keyboard
 * focus inside it — because an option that slides away from under a finger is
 * the single worst thing this could do. It also holds while the writing form
 * is open, once an answer is given, on any panel that is not the current one,
 * and in the quiet state, where motion is the thing being turned off.
 *
 * Indices run past the end and are taken modulo, so a pool that changes size
 * underneath this needs no reset — which is what keeps it out of an effect.
 */
function useRotatingWindow<T>(pool: T[], size: number, ms: number, paused: boolean) {
  const [start, setStart] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (paused || pool.length <= size) return;
    let swap: number | undefined;
    const tick = window.setInterval(() => {
      setFading(true);
      swap = window.setTimeout(() => { setStart((s) => s + size); setFading(false); }, FADE_MS);
    }, ms);
    return () => { window.clearInterval(tick); if (swap !== undefined) window.clearTimeout(swap); };
  }, [paused, pool, size, ms]);

  const items = useMemo(() => {
    if (pool.length <= size) return pool;
    return Array.from({ length: size }, (_, i) => pool[(start + i) % pool.length]);
  }, [pool, size, start]);

  /* Never fade while paused: pausing mid-fade would otherwise leave the set
     sitting there at nothing, which looks like the panel has broken. */
  return { items, fading: fading && !paused };
}

/** True while the window is too narrow to stand more than one panel side by side. */
function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 760);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 759px)');
    const sync = () => setNarrow(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return narrow;
}

/** The panel frame every step shares — the sheet's rounded window on the room. */
function Panel({ index, step, chirpy, children, onHome }: {
  index: number; step: number; chirpy: string;
  children: ReactNode; onHome: () => void;
}) {
  const current = index === step;
  const done = index < step;
  return <div className={`sl-panel ${current ? 'sl-panel-now' : ''} ${done ? 'sl-panel-done' : ''}`}>
    <div className="sl-panel-bar">
      <h2>{TITLES[index - 2]}</h2>
      <button className="sl-panel-home" onClick={onHome} aria-label="Back to Mind Gym">⌂</button>
    </div>
    <p className="sl-dots" aria-hidden="true">{STEPS.map((label, i) => <span key={label} className={i === index ? 'sl-dot-now' : i < index ? 'sl-dot-done' : ''} />)}</p>
    <div className="sl-ask">
      <img className="sl-ask-chirpy" src={chirpy} alt={current ? 'Chirpy' : ''} aria-hidden={!current} />
      <div className="sl-ask-bubble"><h3>{PROMPTS[index - 2]}</h3>{SUBS[index - 2] && <p>{SUBS[index - 2]}</p>}</div>
    </div>
    <div className="sl-panel-body">{children}</div>
  </div>;
}

/** One mounted room: four panels that arrive in turn and then stand together. */
export function StoryLabRoom({ carried, onBody, onExit, onGrownUp, onSave, onReflectionPath }: {
  carried: DeepDiveAnswers;
  onBody: () => void;
  onExit: () => void;
  onGrownUp: () => void;
  onSave: (answers: DeepDiveAnswers) => boolean;
  /** Called when the child taps "See My Reflection Path" after saving. */
  onReflectionPath?: () => void;
}) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  /* Only the OS-level reduced-motion flag stops the drift. Quiet mode means
     say nothing, not hold still — a child who arrives angry was getting a
     frozen grid of six sentences while a happy one got eight that floated. */
  const still = !!reduced;
  /* Sits below the progress strip, between Body and Thought steps by default,
     and stays wherever a child drags him — see useFloatingPosition. */
  const boyFloat = useFloatingPosition('story-lab:boy', { xPct: 28, yPct: 78 });
  const [ageBand] = useState(() => band());
  const [step, setStep] = useState(2);
  const [thought, setThought] = useState('');
  const [event, setEvent] = useState('');
  const [story, setStory] = useState('');
  const [alternative, setAlternative] = useState('');
  const [draft, setDraft] = useState('');
  const [writing, setWriting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const savedOnce = useRef(false);
  const [sessionId] = useState(() => `story-${Date.now()}`);
  const heading = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  /*
    ON A PHONE THERE IS ROOM FOR ONE PANEL.

    Four of them across 390px puts each at a quarter scale, where the sheet's
    12px type lands at 3px and nothing can be read or pressed. So a narrow
    window shows the panel being answered; the ones behind it are still in the
    strip at the foot, each with the answer it took.
  */
  const narrow = useNarrow();
  const reached = Math.min(step, 5);
  const panels = narrow ? [reached] : [2, 3, 4, 5].filter(index => index <= reached);
  const { box, scale } = useFilmScale(panels.length);

  /*
    EVERY ARRIVAL IS AUDIBLE, AND IT IS THE BIG SWOOSH.

    A panel sliding in is the app saying "that's kept, here's the next bit".
    This used to use the soft whoosh, on the reasoning that a cue heard four
    times in a minute should stay out of the way — but the slide is the one
    moment the walk feels like it is moving, and underplaying it made the
    strip read as a redraw. `panelSlide` is the dramatic swing (see the sound
    table), and it interrupts itself so answering quickly cannot stack two.

    The last step keeps its own cue: arriving at the end of the journey is a
    different event from another panel joining the strip.
  */
  useEffect(() => {
    if (!moved.current) { moved.current = true; return; }
    if (!quiet) sound.play(step >= 6 ? 'miniWin' : 'panelSlide');
    const timer = setTimeout(() => heading.current?.focus({ preventScroll: true }), still ? 0 : 420);
    return () => clearTimeout(timer);
  }, [step, still, quiet]);

  const capture = (value: string) => {
    const text = value.trim();
    if (!text) return;
    savedOnce.current = false; setSaved(false); setSaveError(false);
    setWriting(false); setDraft('');
    if (step === 2) { setThought(text); setStory(text); setConfirmed(false); setAlternative(''); setStep(3); }
    else if (step === 3) { setEvent(text); setConfirmed(false); setAlternative(''); setStep(4); }
    else if (step === 4) { setStory(text); setConfirmed(true); setAlternative(''); setStep(5); }
    else if (step === 5) { setAlternative(text); setStep(6); }
  };
  const answers = [carried.feeling || '', carried.body?.join(', ') || '', thought, event, confirmed ? story : '', alternative];
  const showOwn = () => { if (!quiet) sound.play('tap'); setDraft(step === 4 ? story : ''); setWriting(true); };
  const pick = (option: Option) => {
    if (option.own) { showOwn(); return; }
    if (!quiet) sound.play('tap');
    capture(option.text);
  };
  const save = () => {
    if (savedOnce.current) return;
    const ok = onSave({ ...carried, thought, eyes: event, story, other: alternative, sessionId });
    savedOnce.current = ok; setSaved(ok); setSaveError(!ok);
    if (ok && !quiet) sound.play('resolve');
  };
  const back = () => { if (step === 2) { onBody(); return; } if (!quiet) sound.play('exitRoom'); setStep(step - 1); };

  /*
    THE STORY LAB HAD NO VOICE, AND IT IS THE ROOM THAT NEEDED ONE MOST.

    Every other screen reads Chirpy's line out loud — the hub, Help Chirpy,
    the Reflection Room, and every room drawn by ui/scene, which speaks in the
    Chirpy component itself. This room draws its own panels, so it never went
    through that component and never spoke. Four of the six steps of the walk
    happen in here, so a child who cannot yet read got the whole middle of the
    journey in silence, including the two questions that ask them to say
    something about themselves.

    The sub-line goes with it. "Tap a thought, or tell me in your own words"
    is the half that tells a pre-reader there is a way in that is not reading,
    so speaking the question without it is the wrong half.

    `speak` already returns early in the quiet state and honours the app's own
    mute, so there is no second switch to find here. Stopping on the way out
    matters as much as starting: the cleanup runs on every step change too, so
    a child who moves on quickly is not talked over by the question they have
    already answered.
  */
  useEffect(() => {
    const line = PROMPTS[step - 2];
    if (!line) return;
    const sub = SUBS[step - 2];
    speak(sub ? `${line} ${sub}` : line, quiet);
    return () => stopSpeaking();
  }, [step, quiet]);

  /*
    AND A BED UNDER IT. The walk plays music in the Different Story reveal and
    the Reflection Room sits in a forest lullaby, so the Story Lab was the one
    long stretch where the sound simply stopped — a child walked out of the
    body room into four silent panels and back into music at the end.

    `playMusicWhenAllowed` rather than `playMusic`: the room is reached by
    tapping, so the tab has been touched and it will usually start at once,
    but the retry costs nothing and is the difference between a bed and
    silence on a phone that has just been reloaded.
  */
  useEffect(() => {
    if (quiet) return;
    const cancel = sound.playMusicWhenAllowed('storyTheme');
    return () => { cancel(); sound.stopMusic(); };
  }, [quiet]);

  /*
    THE END OF THE WALK IS A DOOR, NOT A BUTTON IN THE FOOTER.

    The Reflection Path handoff draws this beat
    (reference_scenes/story_lab_to_reflection_room_transition.png): once the
    fourth panel is answered the child gets "Story Lab Complete — you did it",
    the archway to the Reflection Room, and one clear way through it. What was
    here instead was a Save button and a link in the footer, under a strip of
    four panels, which is where a child stops.

    It saves itself on arrival rather than asking, because Chirpy's line on
    that screen promises the reflections are already kept — and a promise the
    child has to press a button to make true is not one. `save` is guarded by
    savedOnce, so running it here costs nothing if it has already happened.
  */
  /*
    THREE SECONDS IN, THE ROOM GETS OUT OF THE WAY.

    The Thought panel asks the child to notice what their mind was actually
    saying, and then surrounds the question with a lit sign, two shelves of
    books, a boy at a desk and a note about how their thoughts matter. All of
    it is lovely and none of it is the question. So the panel reads itself out,
    gives the child a beat to take the room in, and then everything except the
    clouds steps back — the child is choosing from twelve now, and they need
    the quiet to scan them.

    It only applies while the thought is unanswered: going back to the panel
    later, with the answer already on it, should show the room as it is.
  */
  const hushEligible = step === 2 && !thought && !writing && !still;
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!hushEligible) return;
    const timer = setTimeout(() => setFocused(true), 3000);
    /* Clearing on the way out is what lets the hush start over: answering the
       thought, opening the writing form or stepping back all make the panel
       ineligible, and the room comes back up until it settles again. */
    return () => { clearTimeout(timer); setFocused(false); };
  }, [hushEligible]);

  const [leftComplete, setLeftComplete] = useState(false);
  useEffect(() => {
    if (step >= 6 && !savedOnce.current) save();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save is guarded by savedOnce
  }, [step]);

  /*
    THE CLOUDS COME FROM THE FEELING THEY BROUGHT IN, and the events come from
    the thought they picked — see kit/storyLabContent. Both lists are shuffled
    once per visit rather than on every render, so a cloud does not move house
    under the finger going to press it.

    Quiet mode still gets a short list: a dozen drifting clouds is exactly the
    kind of busy the flag exists to turn off.
  */
  /*
    THE BOY AT THE DESK IS THE CHILD'S OWN FEELING NOW.

    This corner used to be thinking-boy-clean.webp — one drawing, the same
    every visit, chin on hands, mildly pensive. A child who had just told the
    Feelings Room they were scared walked into the Thought panel and found a
    contented boy daydreaming at them, which quietly answers the question the
    panel is about to ask, and answers it wrong.

    The plates already existed: /feelings holds the same boy with Chirpy on
    his shoulder wearing each of the twelve, cut for the floating companion
    (kit/feelingCompanions). Same boy, same cap, same bird, so this reads as
    the child's own figure having followed them in from the last room rather
    than as a second character.

    COMPANY is the fallback and claims nothing — a child can reach this panel
    without naming a feeling at all (straight in from the hub), and the rule
    that matters is never to put the wrong face on a real answer. No answer is
    not a wrong answer, so the serene plate is fine there and only there.
  */
  const companion = companionFor(carried.feeling) ?? COMPANY;

  const [thoughtPool] = useState(() => thoughtsFor(carried.feeling));
  const eventPool = useMemo(() => eventsFor(thought, carried.feeling), [thought, carried.feeling]);
  /* Which "Another way" reframes are on offer follows the same thought/theme
     routing as the events pool above — a rejection story gets rejection
     reframes, a pressure story gets pressure reframes. See possibilitiesFor. */
  const possibilityPool = useMemo(() => possibilitiesFor(thought, carried.feeling), [thought, carried.feeling]);

  /*
    A child reaching for a cloud with a mouse or a keyboard stops the clock;
    see useRotatingWindow. Touch has no hover to read, which is why the answer
    itself also pauses it — the set the child tapped is the set that stays.
  */
  const [reaching, setReaching] = useState(false);
  const hold = { onPointerEnter: () => setReaching(true), onPointerLeave: () => setReaching(false),
                 onFocus: () => setReaching(true), onBlur: () => setReaching(false) };

  const thoughtRoll = useRotatingWindow(thoughtPool, THOUGHT_WINDOW, ROTATE_MS,
    still || writing || reaching || !!thought || step !== 2);
  const eventRoll = useRotatingWindow(eventPool, EVENT_WINDOW, ROTATE_MS,
    still || writing || reaching || !!event || step !== 3);
  const possibilityRoll = useRotatingWindow(possibilityPool, POSSIBILITY_WINDOW, ROTATE_MS,
    still || writing || reaching || !!alternative || step !== 5);

  /* Once it is answered the panel shrinks into the filmstrip and its only job
     is to show what the child said. Keeping the whole list there, one of them
     lit, is a lot of unchosen sentences to leave a child looking at — and a
     rotating list would eventually turn their own answer off the screen. */
  const kept = (pool: Option[], text: string, icon: string): Option[] =>
    [pool.find((o) => o.text === text) ?? { text, icon }];

  const thoughtOptions = thought ? kept(thoughtPool, thought, '☁')
    : [...thoughtRoll.items, SAY_IT];
  const eventOptions = event ? kept(eventPool, event, '✧')
    : [...eventRoll.items, SOMETHING_ELSE];
  const otherOptions = alternative ? kept(possibilityPool, alternative, '✦')
    : [...possibilityRoll.items, MY_OWN];

  const chosen = (index: number) => answers[index];
  const cardClass = (index: number, text: string) => {
    const value = chosen(index);
    if (!value) return '';
    return value === text ? 'sl-chosen' : 'sl-not-chosen';
  };

  /** The child's own words, in whichever panel asked for them. */
  const ownForm = <form className="sl-own-form" onSubmit={e => { e.preventDefault(); if (!quiet) sound.play('tap'); capture(draft); }}>
    <label htmlFor="sl-own-answer">{step === 4 ? 'The story my mind made' : 'Your own words'}</label>
    <textarea id="sl-own-answer" autoFocus value={draft} onChange={e => setDraft(e.target.value)} rows={2} maxLength={400} />
    <div><MicButton onText={text => setDraft(value => value ? `${value} ${text}` : text)} /><button type="submit" disabled={!draft.trim()}>Keep these words →</button><button type="button" onClick={() => setWriting(false)}>Cancel</button></div>
  </form>;

  return <motion.main initial={still ? false : { opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .7 }} className={`sl-room ${still ? 'sl-still' : ''} ${quiet ? 'sl-quiet' : ''} ${focused && hushEligible ? 'sl-focused' : ''}`} style={{ fontFamily: FONT }} data-step={step} data-floating-room>
    <DoorHandle side="left" label="Back" onClick={back} accent="#c490ff"  scale={0.5} />
    <header className="sl-header">
      <button className="sl-logo" onClick={onExit} aria-label="Back to Mind Gym">Mind<span>Gym</span><small>A BRIGHTER<br />YOU INSIDE</small></button>
      <p className="sl-header-books" aria-hidden="true"><span>THOUGHTS</span><span>STORIES</span><span>POSSIBILITIES</span></p>
      <div className="sl-title chrome-fade"><h1>Story Lab</h1><p>Explore your mind. Find new perspectives.</p></div>
      <p className="sl-header-notes" aria-hidden="true">
        <span>Different Thoughts<br />Create Brighter<br />Tomorrows ♡</span>
        <span>Same You<br />Brighter<br />Views ♡</span>
      </p>
      <button className="sl-grownup chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
    </header>

    <div className="sl-film" ref={box} style={{ '--sl-scale': scale } as CSSProperties}>
      <div className="sl-film-row" tabIndex={-1} ref={heading}>
        <AnimatePresence initial={false}>
          {panels.map((index, position) => <motion.div
            key={index}
            className="sl-slot"
            layout={!still}
            /*
              THE SLIDE IS THE EVENT, SO IT IS ALLOWED TO BE ONE.

              A 140px drift over .45s reads as a layout shift. The panel now
              comes in from off the strip on a spring, with a little tilt that
              settles — the "magically, dramatically" the walk is asking for —
              while the panels already standing shuffle along underneath via
              the layout transition. Still honours the quiet/reduced-motion
              flag, which drops all of it.
            */
            initial={still ? false : { opacity: 0, x: 360, scale: .8, rotate: 4 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            transition={still ? { duration: 0 } : { type: 'spring', stiffness: 170, damping: 20, mass: .9 }}
          >
            {position > 0 && <span className="sl-film-arrow" aria-hidden="true">›</span>}
            <Panel index={index} step={step} onHome={onExit}
              chirpy={index === 4 ? '/mind-gym/story-lab/chirpy-pointing.webp' : chirpySprite(index === 5 ? 'hopeful' : 'curious')}>

              {index === 2 && <div className={`sl-thought-field ${!thought ? 'sl-field-railed' : ''}`}>
                <ThoughtParticles show={!thought} />
                <div className={`sl-thought-clouds ${thoughtRoll.fading ? 'sl-rolling-out' : ''}`} {...hold}>
                  {thoughtOptions.map((option, i) => (
                    /* Two wrappers give independent X and Y bounce: the span
                       carries its own CSS animation for X, the button for Y.
                       Both use `alternate` direction with coprime durations so
                       each cloud traces a unique Lissajous-ish path, and
                       negative delays spread them across the cycle. */
                    <span
                      key={option.text}
                      className="sl-cloud-mover"
                      style={{
                        '--bx': `${9 + (i % 4) * 5}px`,
                        '--bx-dur': `${6.2 + (i % 7) * 0.55}s`,
                        '--bx-del': `${-(i % 7) * 0.92}s`,
                      } as CSSProperties}
                    >
                      <button
                        className={`sl-thought-cloud ${cardClass(2, option.text)}`}
                        style={{
                          '--by': `${5 + (i % 4) * 4}px`,
                          '--by-dur': `${4.7 + (i % 5) * 0.9}s`,
                          '--by-del': `${-(i % 5) * 1.1}s`,
                        } as CSSProperties}
                        disabled={step !== 2}
                        onClick={() => pick(option)}
                      >
                        {option.text}
                      </button>
                    </span>
                  ))}
                </div>

                {/*
                  HIS OWN WORDS ARE NOT ONE OF THE CLOUDS.

                  Mixed into the drift it was a sentence to scan past on the
                  way to the sentences — and it is the one option that is true
                  whatever the sky is showing, including when none of it fits.
                  So it stands on its own shelf under the weather, still, lit,
                  and always in the same place.
                */}
                {!thought && <div className="sl-own-rail">
                  <button className="sl-say-own" onClick={showOwn} disabled={step !== 2}>
                    <span className="sl-mic" aria-hidden="true"><Mic size={14} strokeWidth={2.6} /></span>
                    <span className="sl-say-own-text">
                      <b>Say it your way</b>
                      <small>None of these? Tell me yourself.</small>
                    </span>
                    <span className="sl-say-own-go" aria-hidden="true">›</span>
                  </button>
                </div>}
                <img
                  className="sl-thinking-boy"
                  /* Keyed on the plate so a child who steps back and changes
                     their feeling gets a fresh <img> and a fresh landing hop,
                     rather than the new face fading in on a bird mid-bounce. */
                  key={companion.src}
                  src={companion.src}
                  alt={carried.feeling ? `You, feeling ${carried.feeling.toLowerCase()}, with Chirpy` : 'You, with Chirpy'}
                />
                <p className="sl-desk-note" aria-hidden="true">Your<br />Thoughts<br />Matter<br /><span>♡</span></p>
              </div>}

              {index === 3 && <>
                <figure className="sl-screen" aria-label="Memory theatre">
                  <img src="/mind-gym/story-lab/memory-illustration.webp" alt="An illustrated example of a moment in a school playground" />
                  <figcaption className="sr-only">{ageBand === 'older' ? 'What happened, before deciding what it meant?' : 'What would a little camera have seen?'}</figcaption>
                </figure>
                <div className={`sl-cards ${eventRoll.fading ? 'sl-rolling-out' : ''}`} {...hold}>{eventOptions.map(option => <button key={option.text} className={`${option.own ? 'sl-card-own' : ''} ${cardClass(3, option.text)}`} disabled={step !== 3} onClick={() => pick(option)}>
                  <span className="sl-card-icon" aria-hidden="true">{option.icon === 'mic' ? <Mic size={15} strokeWidth={2.6} /> : option.icon}</span>{option.text}
                </button>)}</div>
              </>}

              {index === 4 && <div className="sl-assembly">
                {/* ── Story scene: bubble + badges + boy ───────────── */}
                <div className="sl-story-scene" aria-label="Your feeling, body, thought and event joining together">
                  <div className="sl-scene-center">
                    <img className="sl-scene-bubble" src="/mind-gym/story-lab/story-bubble-magic.png" alt="" aria-hidden="true" />
                    {/* Was story-boy-sad.png, hard-coded: a child who had
                        said "excited" four panels ago watched their story
                        assemble around a boy who was plainly miserable. */}
                    <img className="sl-scene-boy" key={companion.src} src={companion.src} alt={carried.feeling ? `You, feeling ${carried.feeling.toLowerCase()}, inside a glowing bubble` : 'A child sitting inside a glowing bubble'} />
                    {/* Top-left: Thought */}
                    <div className="sl-badge sl-badge-thought">
                      <span className="sl-badge-label">Thought</span>
                      <span className="sl-badge-val">"{answers[2] || '…'}"</span>
                    </div>
                    {/* Top-right: What happened */}
                    <div className="sl-badge sl-badge-event">
                      <span className="sl-badge-label">What happened</span>
                      <span className="sl-badge-val">"{answers[3] || '…'}"</span>
                    </div>
                    {/* Left: Feeling */}
                    <div className="sl-badge sl-badge-feeling">
                      <span className="sl-badge-label">Feeling</span>
                      <span className="sl-badge-val">{answers[0] || '…'}</span>
                    </div>
                    {/* Right: Body */}
                    <div className="sl-badge sl-badge-body">
                      <span className="sl-badge-label">Body</span>
                      <span className="sl-badge-val">{answers[1] || '…'}</span>
                    </div>
                  </div>
                  <span className="sl-scene-arrow" aria-hidden="true">▼</span>
                </div>

                {/* ── Story book ───────────────────────────────────── */}
                <div className="sl-story-book">
                  <img className="sl-book-frame" src="/mind-gym/story-lab/story-book-open.png" alt="" aria-hidden="true" />
                  <div className="sl-book-text">
                    <p className="sl-book-heading">Story my mind made:</p>
                    <p className="sl-book-quote">"{story}"</p>
                  </div>
                </div>

                <p className="sl-confirm-ask">Does this sound like what your mind was saying?</p>
                <div className="sl-cards sl-confirm">
                  <button disabled={step !== 4} onClick={() => { if (!quiet) sound.play('tap'); capture(story); }}><span className="sl-card-icon sl-icon-yes" aria-hidden="true">✓</span>Yes</button>
                  <button disabled={step !== 4} onClick={showOwn}><span className="sl-card-icon sl-icon-almost" aria-hidden="true">◑</span>Almost</button>
                  <button disabled={step !== 4} onClick={showOwn} className="sl-card-own"><span className="sl-card-icon" aria-hidden="true"><Mic size={15} strokeWidth={2.6} /></span>Change it</button>
                  <button disabled={step !== 4} onClick={() => { if (!quiet) sound.play('tap'); capture("I'm not sure what story my mind made yet."); }}><span className="sl-card-icon sl-icon-unsure" aria-hidden="true">?</span>Not sure</button>
                </div>
              </div>}

              {index === 5 && <>
                <div className="sl-possibility-windows">
                  <div className="sl-window sl-original"><h4>Original Story</h4><img src="/mind-gym/story-lab/thinking-boy-clean.webp" alt="" /><p>"{story}"</p></div>
                  <div className="sl-window sl-another"><h4>Another Possibility</h4>{alternative ? <img src="/mind-gym/story-lab/thinking-boy-clean.webp" alt="" /> : <span className="sl-possibility-light" aria-hidden="true">✧</span>}<p>{alternative ? `"${alternative}"` : 'A little space for another way to see it…'}</p></div>
                </div>
                <div className={`sl-cards sl-wide ${possibilityRoll.fading ? 'sl-rolling-out' : ''}`} {...hold}>{otherOptions.map(option => <button key={option.text} className={`${option.own ? 'sl-card-own' : ''} ${cardClass(5, option.text)}`} disabled={step !== 5} onClick={() => pick(option)}>
                  <span className="sl-card-icon" aria-hidden="true">{option.icon === 'mic' ? <Mic size={15} strokeWidth={2.6} /> : option.icon}</span>{option.text}
                </button>)}</div>
                <p className="sl-truth">More than one story can be true.<br />You get to choose what to believe.</p>
              </>}

              {writing && step === index && ownForm}
            </Panel>
          </motion.div>)}
        </AnimatePresence>
      </div>
    </div>

    {saveError && <p role="alert" className="sl-save-error">This device couldn't save your journey. Your words are still here; you can try again.</p>}

    <AnimatePresence>
      {step >= 6 && !leftComplete && <motion.section
        className="sl-complete"
        aria-labelledby="sl-complete-title"
        initial={still ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: still ? 0 : .5 }}
      >
        <motion.div
          className="sl-complete-card"
          initial={still ? false : { opacity: 0, y: 34, scale: .94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={still ? { duration: 0 } : { type: 'spring', stiffness: 150, damping: 19, delay: .12 }}
        >
          <p className="sl-complete-kicker" id="sl-complete-title">Story Lab Complete!</p>
          <h2 className="sl-complete-big">You did it!</h2>
          <p className="sl-complete-said">You explored a new perspective and found another way.</p>
          <p className="sl-complete-grow">Your brighter stories are ready to keep growing.</p>

          <div className="sl-complete-chirpy">
            <img src={chirpySprite('hopeful')} alt="" aria-hidden="true" />
            <p role="status">{saved
              ? 'Your reflections are saved and waiting for you!'
              : 'Your words are safe here with me.'}</p>
          </div>

          <div className="sl-portal">
            <img src="/mind-gym/reflection/reflection_portal.png" alt="" aria-hidden="true"
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="sl-portal-label">Reflection<br />Room <b aria-hidden="true">♡</b></span>
          </div>

          <ol className="sl-complete-steps" aria-label="What you did">
            <li>Feel</li><li>Explore</li><li>Find Another Way</li><li>Keep Growing</li>
          </ol>

          {onReflectionPath && <button className="sl-enter-reflection" onClick={() => { if (!quiet) sound.play('enterRoom'); onReflectionPath(); }}>
            <span aria-hidden="true">⌸</span> Enter Reflection Room <span aria-hidden="true">›</span>
          </button>}
          <p className="sl-continues">Your journey continues…</p>

          <p className="sl-complete-signs" aria-hidden="true">
            <span>Same You, Brighter Views</span><span>Kinder Thoughts</span><span>Bigger Tomorrows</span>
          </p>

          <button className="chrome-fade sl-look-again" onClick={() => setLeftComplete(true)}>Look at my stories again</button>
        </motion.div>
      </motion.section>}
    </AnimatePresence>

    {/*
      HE SITS IN THE ROOM, NOT IN THE PANEL.

      The panel is 386 by 675 before scaling and holds a question, a dozen
      drifting clouds and a way to type your own — there was never room in it
      for a figure as well, which is why the old desk boy was 130px in a
      corner with clouds landing on his cap. The room around the filmstrip is
      mostly empty floor, so that is where he goes: big enough to read, off to
      the left where nothing is ever drawn, bouncing.

      The in-panel copy below is still rendered and takes over under 900px,
      where the panel fills the window and there is no floor to sit on.
    */}
    <img
      className="sl-room-boy sl-room-boy-floating"
      key={companion.src}
      src={companion.src}
      alt={carried.feeling ? `You, feeling ${carried.feeling.toLowerCase()}, with Chirpy` : 'You, with Chirpy'}
      draggable={false}
      {...boyFloat.dragHandlers}
    />
    <RoomThoughtParticles show={step === 2 && !thought} boyPos={boyFloat.pos} />

    <nav className="sl-rail" aria-label="Journey progress">
      <ol>{STEPS.map((label, i) => {
        const door = i === LAST_STEP;
        return <li key={label} className={`${i === step ? 'sl-current' : i < step ? 'sl-collected' : ''} ${door ? 'sl-step-door' : ''}`} aria-current={i === step ? 'step' : undefined}>
          <span className="sl-step-symbol" aria-hidden="true">
            <img src={door ? '/mind-gym/reflection/reflection_portal.png' : `/mind-gym/home/icon_${STEP_ART[i]}.webp`} alt=""
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            {i < step && <b>✓</b>}
          </span>
          <span className="sl-step-label">{i + 1}. {label}</span>
          <span className="sl-step-answer">{door
            ? 'Rest, listen, grow'
            : i === step ? 'You are here' : answers[i] || (i < 2 ? '(In its own room)' : '')}</span>
          <span className="sr-only">{i < step ? ' — collected' : i === step ? ' — current step' : ' — coming up'}</span>
        </li>;
      })}</ol>
      <p className={`sl-rail-badge ${step >= 6 ? 'sl-rail-done' : ''}`}><span aria-hidden="true">★</span>You've Explored<br />New Perspectives!</p>
    </nav>

    <footer className="sl-stop">
      <button className="chrome-fade" onClick={onExit}>Stop for now</button>
      {step >= 6 && <button className="sl-save" onClick={save} disabled={saved}>{saved ? 'Journey saved ✓' : '✧ Save This Journey'}</button>}
      {saved && onReflectionPath && <button className="sl-save sl-reflection-cta" onClick={onReflectionPath}>✦ See My Reflection Path →</button>}
      {/* Not offered on step 5 — the "Another way" possibility is the whole
          point of the walk, so a child stays in the Story Lab, choosing
          among the reframes, rather than skipping past the one step this
          room exists for. Every earlier step still has its own skip. */}
      {step < 6 && step !== 4 && step !== 5 && <button className="chrome-fade" onClick={() => capture("I'm not sure yet.")}>{"I'm not sure — keep going"}</button>}
    </footer>
  </motion.main>;
}
