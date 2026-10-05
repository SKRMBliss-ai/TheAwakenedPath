import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useKidStore } from '../../../kids/store';
import { BEHAVIOURS, todayKey } from '../../../kids/data';
import { FONT } from '../ui/chrome';
import { useQuiet } from '../ui/quiet';
import { MicButton } from '../ui/MicButton';
import { VIRTUE_ROOMS, roomText, type VirtueRoom } from './rooms';
import { roomGamesFor } from './roomGames';
import { RoomGamePlayer } from './RoomGamePlayer';
import { GoodChoicesShelf } from './GoodChoicesShelf';
import { DailyWelcome } from './DailyWelcome';
import { AgePopup } from './AgePopup';
import { BadgeSlot } from './ChildBadge';
import { bandUnknown } from '../kit/band';
import { chirpySprite, type ChirpyPose } from '../ui/sprites';
import * as sound from '../kit/sound';
import { liveAffirmations } from '../kit/affirmations';
import { useLiveContent } from '../kit/liveContent';
import { speak } from '../kit/chirpyVoice';
import { isMuted, setMuted } from '../../../../lib/sfx';
import { useDiaryFilledToday } from '../kit/diaryToday';
import { BuddyHud, FloorBuddy } from './buddies/HomeBuddy';
import { loadGameFont } from './buddies/gameFont';
import { playHoverNote, playWoodTap } from '../kit/doorbell';
import { FRIENDS, type Friend } from './homeFriends';
import { startSkyAmbience, stopAmbience } from '../kit/ambience';
import { timeOfDayForHour } from '../rooms';
import './HomeScreen.css';
import './DiaryNudge.css';

const A = '/mind-gym/home/';
type Pose = 'center' | 'left' | 'right' | 'up' | 'down' | 'happy' | 'surprised';
const POSE_SRC: Record<Exclude<Pose, 'center'>, string> = {
  left: 'boy-look-left', right: 'boy-look-right', up: 'boy-look-up', down: 'boy-look-down', happy: 'boy-happy', surprised: 'boy-surprised',
};
/** The standing boy: his resting picture, with each expression stacked on top and faded in as needed. */
function BoyPoses({ pose }: { pose: Pose }) {
  return <span className="hs-poses">
    <img className={pose === 'center' ? '' : 'hide'} src="/assets/home/boy-nobird@640.webp" alt="" />
    {(Object.keys(POSE_SRC) as (keyof typeof POSE_SRC)[]).map((k) => <img key={k} className={`p ${pose === k ? 'on' : ''}`} src={`/assets/home/${POSE_SRC[k]}@640.webp`} alt="" />)}
  </span>;
}
/** What the guide says about the card under the pointer, and how he greets by the hour. */
const HINT_LINES = ['Psst… tap the heart to start!', 'Tap here to play and choose!', 'Tap the book to remember today!'];
const CARD_LINES = ['Let’s talk about how you feel.', 'Ready to make good choices?', 'Let’s remember today together.'];
function greeting(h: number) {
  if (h < 5) return 'Up late? Let’s keep it calm.';
  if (h < 12) return 'Good morning! What shall we do?';
  if (h < 17) return 'Good afternoon! What shall we do?';
  if (h < 21) return 'Good evening! What shall we do?';
  return 'Getting sleepy? Maybe something calm.';
}
/** A gentle colour grade for the hour — warm at dawn, bright by day, deep blue at night. */
function dayGrade(h: number) {
  if (h < 5 || h >= 21) return 'linear-gradient(#0a103c66,#0a103c4d)';
  if (h < 9) return 'linear-gradient(#ffd69633,#ffb06e1f)';
  if (h < 17) return 'linear-gradient(#ffffff17,#ffffff0a)';
  return 'none';
}
/* The phone background's lanterns, in fractions of the screen. */
const PHONE_LANTERNS: [number, number][] = [[.41, .09], [.056, .35], [.15, .78], [.97, .36], [.87, .79]];
/* Which lantern is which friend (same order as LANTERNS), and where the other friends stand,
   as fractions of the 1915x821 environment: [id, x centre, y centre, width, height]. */
const INTRO_LINE = 'Everything in this room has a feeling of its own. Tap them to hear what they feel!';
const LANTERN_FRIENDS = ['glow', 'spark', 'flicker', 'hush'];
const MOON: [string, number, number, number, number] = ['luna', .5025, .154, .055, .128];
/* The same friends on the phone's background, in fractions of the screen: [id, x centre, y centre, w, h]. */
const PHONE_FRIENDS: [string, number, number, number, number][] = [
  ['glow', .41, .09, .1, .075], ['flicker', .15, .78, .1, .075], ['hush', .87, .79, .1, .075],
];
/* In fractions of the 972x1619 phone picture (it is laid out like background-size: cover). */
const PHONE_MOON: [string, number, number, number, number] = ['luna', .5, .13, .2, .1];
const SPOTS: [string, number, number, number, number][] = [
  ['rooty', .15, .36, .07, .2], ['bloom', .142, .64, .06, .22], ['snug', .43, .9, .14, .075], ['wish', .62, .07, .05, .1],
];
/* Ambient lights, in fractions of the 1916x821 environment picture. */
/* Hanging lanterns: [x (centre), y (top), height] as fractions of the 1915x821 environment. */
const LANTERNS: [number, number, number][] = [[.30, .03, .30], [.40, .03, .17], [.70, .04, .13], [.172, .25, .12]];
const FIREFLIES = [
  ...Array.from({ length: 16 }, (_, i) => ({
    x: ((i * 37 + 11) % 97) / 100, y: .12 + ((i * 53 + 7) % 70) / 100,
    d: 7 + (i * 5) % 9, s: (i * 1.3) % 8, r: 14 + (i * 7) % 26,
  })),
  /* A denser drift through the open middle of the scene, over the sky and rail. */
  ...Array.from({ length: 22 }, (_, i) => ({
    x: .28 + ((i * 41 + 5) % 45) / 100, y: .1 + ((i * 29 + 3) % 62) / 100,
    d: 6 + (i * 3) % 8, s: (i * 0.9) % 7, r: 10 + (i * 5) % 22,
  })),
];
const CHIRPY_MOODS: ChirpyPose[] = ['curious', 'calm', 'excited', 'thinking', 'hopeful', 'confused', 'sad', 'calm'];

/** A card title bent along the arch of its ribbon. */
function ArcTitle({ id, children }: { id: string; children: string }) {
  return <h2 className="hs-arc" aria-label={children}>
    <svg viewBox="0 0 100 15" aria-hidden="true"><path id={id} d="M5 12Q50 3 95 12" fill="none" />
      <text className="hs-arc-hi"><textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{children}</textPath></text>
      <text className="hs-arc-ink"><textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{children}</textPath></text></svg>
    <span className="hs-plain" aria-hidden="true">{children}</span>
  </h2>;
}
/** Composed from the approved two-flow home handoff; all controls are semantic. */

export function HomeScreen({ name, onDeepDive, onOpenRoom, onPractice, onGrownUp, onExitGym, onReflection, onKeepsakes, onBuddies }: {
  name: string; onDeepDive: () => void; onOpenRoom: (room: VirtueRoom) => void;
  onPractice: (room: VirtueRoom) => void;
  onGrownUp: () => void; onExitGym: () => void; onReflection: () => void;
  onKeepsakes?: () => void;
  onBuddies: () => void;
}) {
  const s = useKidStore();
  useEffect(() => { loadGameFont(); }, []);
  const quiet = useQuiet();
  const diaryDone = useDiaryFilledToday();
  const playedToday = (s.scenariosDone[todayKey()] ?? []).length;
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<'reflect' | 'play' | 'learn'>('reflect');
  const [rooms, setRooms] = useState(false);
  const [saved, setSaved] = useState(false);
  /*
    THE SOUND SWITCH CAME BACK.

    The redesign dropped it: the only way to turn audio on became the "Enable
    sound" button inside the daily welcome dialog, which a child dismisses once
    and never sees again — after that the gym is silent with no way to fix it,
    and nothing on screen explains why. It is the one control that has to be
    reachable from the room a child is standing in.
  */
  const [mutedState, setMutedState] = useState(() => isMuted());
  /*
    THE BOY HAS SOMETHING TO SAY, AND HE ASKS TO BE ASKED.

    He stood in the middle of the home page doing nothing, which on a screen
    where everything else lights up and opens reads as scenery. Now he shifts
    his weight, wears a "Tap me", and hands back one of the founder's own
    teaching lines when a child takes him up on it — read out loud, in Chirpy's
    voice, and written into the bubble he is already standing under.

    The lines come from the teaching-moves document via kit/teachings, never
    from a list kept in here: the document is the source, and it is meant to
    grow. Only the OPENING lines are used — a teaching's dare and its landing
    need the whole move around them, and half a trapdoor is just a confusing
    instruction.
  */
  /*
    CHIRPY ASKS HOW OLD THEY ARE, ON THE SCREEN THEY ACTUALLY LAND ON.

    He has always had the question (see HowOld and kit/band), and it has always
    been ordered above everything else he could say — but it was only ever
    offered in the painted hub, behind a tap on the boy there. A child who
    comes in through this home page and walks straight into a journey is never
    asked, so ten of the eighteen teaching moves and three of the eight secret
    games stay locked for them for good.

    Asked once, ever: bandUnknown() goes false the moment they tap a number OR
    say they would rather not, it is kept on this device only, and it is read
    back on every later visit. It waits for the welcome film to be out of the
    way first — two things asking for attention at once is neither of them.
  */
  const [askAge, setAskAge] = useState(false);
  useEffect(() => {
    if (!bandUnknown()) return;
    /* Waits for the welcome film (a modal dialog) to close first. */
    const timer = setInterval(() => {
      if (document.querySelector('dialog[open]')) return;
      clearInterval(timer);
      setAskAge(bandUnknown());
    }, 900);
    return () => clearInterval(timer);
  }, []);
  const [teaching, setTeaching] = useState<string | null>(null);
  const [look, setLook] = useState<number | null>(null);
  /* A card press: sparkles burst from it, the room zooms toward the viewer, and
     only then does the next screen open. Instant when motion is off. */
  const [burst, setBurst] = useState<number | null>(null);
  const [leaving, setLeaving] = useState<number | null>(null);
  const leaveTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);
  const go = (card: number, next: () => void, zoom = true) => {
    if (!quiet) playWoodTap();
    if (quiet || reduced) { next(); return; }
    setBurst(card); window.setTimeout(() => setBurst(null), 700); react('surprised', 700);
    if (!zoom) { next(); return; }
    setLeaving(card);
    leaveTimer.current = window.setTimeout(() => { next(); setLeaving(null); }, 320);
  };
  /* A card tilts toward the pointer and a sheen follows it, like a lit wooden plank. */
  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    if (quiet || reduced || e.pointerType === 'touch') return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    const s = e.currentTarget.style;
    s.setProperty('--rx', `${((x - .5) * 9).toFixed(2)}deg`); s.setProperty('--ry', `${((.5 - y) * 7).toFixed(2)}deg`);
    s.setProperty('--hx', `${(x * 100).toFixed(1)}%`); s.setProperty('--hy', `${(y * 100).toFixed(1)}%`);
  };
  const untilt = (e: React.PointerEvent<HTMLDivElement>) => { const s = e.currentTarget.style; s.setProperty('--rx', '0deg'); s.setProperty('--ry', '0deg'); };
  /* LOADING — the room stays dark with a single lantern until its art has arrived, so a child
     never sees a bare sky or half-built scene. Gives up waiting after four seconds. */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let done = false; const finish = () => { if (!done) { done = true; setReady(true); } };
    const srcs = [`${A}environment.webp`, '/assets/home/boy@640.webp', `${A}LanternON.webp`];
    let left = srcs.length;
    srcs.forEach((s) => { const im = new Image(); im.onload = im.onerror = () => { left -= 1; if (left <= 0) finish(); }; im.src = s; });
    const t = window.setTimeout(finish, 4000);
    return () => window.clearTimeout(t);
  }, []);
  /* TAP SPARKLES — on touch screens a tap on the scenery leaves a little burst of light. */
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const sparkId = useRef(0);
  const spark = (e: React.PointerEvent) => {
    if (quiet || reduced || e.pointerType !== 'touch') return;
    const id = ++sparkId.current;
    setSparks((s) => [...s.slice(-4), { id, x: e.clientX, y: e.clientY }]);
    window.setTimeout(() => setSparks((s) => s.filter((p) => p.id !== id)), 700);
  };
  /* TILT — on a phone the scene leans a little with the device (asks once, where the platform requires it). */
  useEffect(() => {
    const el = home.current;
    if (!el || quiet || reduced || !window.matchMedia('(pointer: coarse)').matches || typeof DeviceOrientationEvent === 'undefined') return;
    const on = (e: DeviceOrientationEvent) => {
      const g = Math.max(-25, Math.min(25, e.gamma ?? 0)) / 25, b = Math.max(-25, Math.min(25, (e.beta ?? 45) - 45)) / 25;
      el.style.setProperty('--px', g.toFixed(3)); el.style.setProperty('--py', b.toFixed(3));
    };
    const start = () => window.addEventListener('deviceorientation', on);
    const req = (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
    if (typeof req === 'function') {
      const ask = () => { req().then((r) => { if (r === 'granted') start(); }).catch(() => {}); };
      window.addEventListener('pointerdown', ask, { once: true });
      return () => { window.removeEventListener('pointerdown', ask); window.removeEventListener('deviceorientation', on); };
    }
    start();
    return () => window.removeEventListener('deviceorientation', on);
  }, [quiet, reduced]);
  /* FRIENDS — tap a thing in the scene and it tells you how it feels. */
  const [friend, setFriend] = useState<{ f: Friend; x: number; y: number } | null>(null);
  const friendTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(friendTimer.current), []);
  const meet = (id: string, e: React.MouseEvent) => {
    const f = FRIENDS[id]; if (!f) return;
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFriend({ f, x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setIntro(false);
    setMet((m) => {
      if (m.includes(id)) return m;
      const next = [...m, id];
      try { localStorage.setItem('mg-friends-met', JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
    sound.play('tap'); speak(`${f.line} ${f.lesson}`, quiet);
    window.clearTimeout(friendTimer.current);
    friendTimer.current = window.setTimeout(() => setFriend(null), 14_000);
  };
  /* Which friends this child has met, kept on this device only. */
  const [met, setMet] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('mg-friends-met') || '[]') as string[]; } catch { return []; }
  });
  const [intro, setIntro] = useState(true);
  useEffect(() => { const t = window.setTimeout(() => setIntro(false), 9000); return () => window.clearTimeout(t); }, []);
  const [all, setAll] = useState(false);
  const callAll = () => { setAll(true); window.setTimeout(() => setAll(false), 2600); sound.play('tap'); };
  const [lamp, setLamp] = useState<number | null>(null);
  const [wave, setWave] = useState(0);
  useEffect(() => {
    if (quiet || reduced) return;
    const t = window.setInterval(() => setWave((n) => (n + 1) % 10), 6000);
    return () => window.clearInterval(t);
  }, [quiet, reduced]);
  const [hour] = useState(() => new Date().getHours());
  /* NIGHT — from seven in the evening to six in the morning the sky has a full moon and the clouds go moonlit. */
  const night = hour >= 19 || hour < 6;
  /* The sky follows the hour: morning, midday, evening, night. */
  const phase = night ? 'night' : hour < 10 ? 'morning' : hour < 16 ? 'midday' : 'evening';
  const starry = night || (hour >= 16 && hour < 19);
  const total = night ? 11 : starry ? 10 : 9;
  const mark = starry ? '✦' : '●';
  /* The place has its own night air — the same bed the hub uses for this hour.
     Silent while sound is off (the default) and in the quiet state. */
  useEffect(() => {
    if (quiet) { stopAmbience(); return; }
    startSkyAmbience(timeOfDayForHour(hour));
    return () => stopAmbience();
  }, [quiet, hour, mutedState]);
  /* EYES AND FACE. He looks toward the pointer (web), smiles at a card you point at or
     when he speaks, and is startled for a moment when a card is pressed. */
  const [gaze, setGaze] = useState<Pose>('center');
  const [flash, setFlash] = useState<Pose | null>(null);
  const flashTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(flashTimer.current), []);
  const react = (p: Pose, ms = 900) => { setFlash(p); window.clearTimeout(flashTimer.current); flashTimer.current = window.setTimeout(() => setFlash(null), ms); };
  const boyBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (quiet || typeof window === 'undefined' || !window.matchMedia('(hover: hover)').matches) return;
    const move = (e: PointerEvent) => {
      const r = boyBtn.current?.getBoundingClientRect();
      if (!r || !r.width) return;
      const dx = e.clientX - (r.left + r.width * 0.5), dy = e.clientY - (r.top + r.height * 0.2);
      let next: Pose = 'center';
      if (Math.abs(dx) < 50 && Math.abs(dy) < 50) next = 'center';
      else if (dy < -Math.abs(dx) * 0.7 && dy < -70) next = 'up';
      else if (dy > Math.abs(dx) * 1.1 && dy > 190) next = 'down';
      else next = dx < 0 ? 'left' : 'right';
      setGaze((g) => (g === next ? g : next));
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [quiet]);
  const notes = [523.25, 659.25, 783.99];
  const hearCard = (i: number) => { setLook(i); if (!quiet) playHoverNote(notes[i]); };
  const [mood, setMood] = useState(0);
  useEffect(() => {
    if (quiet || reduced) return;
    const t = window.setInterval(() => setMood((m) => (m + 1) % CHIRPY_MOODS.length), 3500);
    return () => window.clearInterval(t);
  }, [quiet, reduced]);
  const lastTeaching = useRef('');
  /* A kind word stays in the bubble for a while, then the bubble goes back to
     showing the way. */
  const teachingTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(teachingTimer.current), []);
  const sayTeaching = () => {
    const pool = liveAffirmations();
    if (!pool.length) return;
    let line = pool[Math.floor(Math.random() * pool.length)];
    /* Never the same one twice running — a repeat reads as the tap not
       working, and they will stop tapping. */
    if (pool.length > 1) {
      for (let tries = 0; tries < 6 && line === lastTeaching.current; tries += 1) {
        line = pool[Math.floor(Math.random() * pool.length)];
      }
    }
    lastTeaching.current = line;
    setTeaching(line);
    window.clearTimeout(teachingTimer.current);
    teachingTimer.current = window.setTimeout(() => setTeaching(null), 12_000);
    sound.play('tap');
    speak(line, quiet);
  };
  /* PARALLAX — the scene leans a little toward the pointer. Web only (it needs a
     hover pointer), and never in the quiet or reduced-motion states. */
  const home = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = home.current;
    if (!el || quiet || reduced || !window.matchMedia('(hover: hover)').matches) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', String(((e.clientX / window.innerWidth) * 2 - 1).toFixed(3)));
        el.style.setProperty('--py', String(((e.clientY / window.innerHeight) * 2 - 1).toFixed(3)));
      });
    };
    window.addEventListener('pointermove', move);
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, [quiet, reduced]);
  /* IDLE — after a quiet spell the boy and Chirpy hop once, visibly and silently. */
  const [hop, setHop] = useState(0);
  /* NUDGE — after a quiet spell the boy turns to one card in turn and the bubble says so,
     so a child who has stopped and is unsure always has something to follow. */
  const [hint, setHint] = useState<number | null>(null);
  const hintTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(hintTimer.current), []);
  useEffect(() => {
    if (!hop || quiet) return;
    setHint((hop - 1) % 3);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(null), 5000);
  }, [hop, quiet]);
  useEffect(() => {
    if (quiet || reduced) return;
    let timer = 0;
    const arm = () => { window.clearTimeout(timer); timer = window.setTimeout(() => { setHop((n) => n + 1); arm(); }, 11_000); };
    arm();
    const reset = () => arm();
    window.addEventListener('pointerdown', reset); window.addEventListener('keydown', reset);
    return () => { window.clearTimeout(timer); window.removeEventListener('pointerdown', reset); window.removeEventListener('keydown', reset); };
  }, [quiet, reduced]);
  const today = todayKey();
  useEffect(() => { useKidStore.getState().noteVisit(); }, []);
  /*
    CHIRPY REMEMBERS — in the card he is already standing under, as words on
    the page rather than as speech. This home page does not talk until it is
    spoken to; see delight.rememberedGreeting for what he will and will not
    say about a child coming back.
  */
  const room = VIRTUE_ROOMS.find((r) => r.id === selected);
  const texts = useLiveContent((st) => st.texts);
  const words = room && roomText(room, texts);
  const behaviour = BEHAVIOURS.find((b) => b.id === selected);
  const game = room ? roomGamesFor(room.id)[0] : undefined;
  const month = today.slice(0, 7);
  const noteKey = `${today}:${selected ?? ''}`;
  const note = s.monthReviews[month]?.[noteKey] ?? '';
  const open = (id: string, next: typeof mode) => {
    const practiceRoom = VIRTUE_ROOMS.find(r => r.id === id);
    /*
      MIND & HEART TIME OPENS THE REFLECTION ROOM.

      Its door stays on the shelf and it still earns its ten a day — this is
      only about where it leads. The Observatory behind it was a second quiet
      room for looking back at what you found, which is what the Reflection
      Room on the other side of the hub is for, so the hub offered a child two
      doors to the same idea and neither of them said so.
    */
    if (next === 'play') {
      /* The prop is optional, so a caller that does not pass it keeps the old
         behaviour — the dialog — rather than a door that does nothing. */
      if (id === 'mindheart') { if (onKeepsakes) { onKeepsakes(); return; } }
      else if (practiceRoom) { onPractice(practiceRoom); return; }
    }
    setSelected(id); setMode(next); setSaved(false); sound.play('roomCard'); dialog.current?.showModal();
  };
  const close = () => { dialog.current?.close(); setSelected(null); };
  const write = (value: string) => { s.setMonthReview(month, noteKey, value); setSaved(false); };

  const aim = look ?? hint;
  /* CHIRPY FLIES. He rests on the boy's shoulder, flies up over the card you point at (never onto it),
     takes a turn round the sky, and is back on the shoulder when someone speaks. */
  const [tour, setTour] = useState<'shoulder' | 'sky' | 'c1' | 'c2' | 'c3'>('shoulder');
  const [flying, setFlying] = useState(false);
  useEffect(() => {
    if (quiet || reduced) return;
    const order: ('sky' | 'c3' | 'shoulder' | 'c1' | 'shoulder' | 'c2')[] = ['sky', 'c3', 'shoulder', 'c1', 'shoulder', 'c2'];
    let i = 0;
    const t = window.setInterval(() => { setTour(order[i % order.length]); i += 1; }, 7000);
    return () => window.clearInterval(t);
  }, [quiet, reduced]);
  const spot: 'shoulder' | 'sky' | 'c1' | 'c2' | 'c3' = teaching ? 'shoulder' : aim !== null ? (`c${aim + 1}` as 'c1' | 'c2' | 'c3') : tour;
  useEffect(() => {
    setFlying(true);
    const t = window.setTimeout(() => setFlying(false), 1000);
    return () => window.clearTimeout(t);
  }, [spot]);
  const chirpyPose: ChirpyPose = teaching ? 'excited' : flying ? 'excited' : aim !== null ? 'wondering' : CHIRPY_MOODS[mood];
  const pose: Pose = flash ?? (teaching || aim !== null ? 'happy' : gaze);
  return <main ref={home} onPointerDown={(e) => { spark(e); if (!(e.target as HTMLElement).closest?.('.hs-friend-card,.hs-friend')) setFriend(null); }} onKeyDown={(e) => { if (e.key === 'Escape') setFriend(null); }} className={`mg-home ${night ? 'hs-night' : 'hs-day'} hs-${phase} ${quiet || reduced ? 'mg-still' : ''} ${leaving !== null ? `hs-leaving hs-leaving-${leaving + 1}` : ''}`} style={{ fontFamily: FONT }}>
    <div className={`hs-loading ${ready ? 'is-done' : ''}`} aria-hidden="true"><img src={`${A}LanternON.webp`} alt="" /></div>
    {sparks.map((p) => <span key={p.id} className="hs-tapspark" style={{ left: p.x, top: p.y }}>{Array.from({ length: 8 }, (_, k) => <i key={k} style={{ ['--a' as string]: `${k * 45}deg` }} />)}</span>)}
    {friend && <div className="hs-friend-card" role="status" style={{ left: Math.min(Math.max(friend.x, 190), (typeof window === 'undefined' ? 800 : window.innerWidth) - 190), top: Math.min(Math.max(friend.y + 36, 20), (typeof window === 'undefined' ? 600 : window.innerHeight) - 220) }} onClick={(e) => e.stopPropagation()}>
      <button className="x" aria-label="Close" onClick={() => setFriend(null)}>×</button>
      <header><b>{friend.f.name}</b><span>{friend.f.feeling}</span></header>
      <p className="kind">{mark} A friend — just sharing a feeling</p>
      <p className="say">“{friend.f.line}”</p>
      <p className="learn">{friend.f.lesson}</p>
    </div>}
    <DailyWelcome />
    {askAge && <AgePopup onDone={() => setAskAge(false)} />}
    <div className="hs-tod" aria-hidden="true" style={{ background: dayGrade(hour) }} />
    <div className="hs-sky" aria-hidden="true">
      {night && <i className="hs-moon" />}
      <i className="hs-cloud cv-drift" /><i className="hs-cloud cv-puff" /><i className="hs-cloud c3" /><i className="hs-cloud c4" />
      <b className="hs-shoot s1" /><b className="hs-shoot s2" />
    </div>
    <div className="hs-bg" aria-hidden="true">
      <i className="hs-rugfx" />

      {!quiet && !reduced && FIREFLIES.map((f, i) => <b key={i} className="hs-fly" style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%`, animationDuration: `${f.d}s`, animationDelay: `-${f.s}s`, ['--r' as string]: `${f.r}px` }} />)}
    </div>
    <div className="hs-veil" aria-hidden="true" />
    <div className="hs-cloudpop" aria-hidden="true"><i className="hs-cloud cv-drift" /><i className="hs-cloud cv-puff" /></div>
    <span className="hs-rugpop" aria-hidden="true" />
    <span className="hs-pop hs-pop-rooty" aria-hidden="true" />
    <span className="hs-pop hs-pop-bloom" aria-hidden="true" />
    <div className="hs-friends-m">
      {(night ? [...PHONE_FRIENDS, PHONE_MOON] : PHONE_FRIENDS).map(([id, x, y, w, h], i) => <button key={id} className={`hs-friend-m ${(wave + 2) % 10 === i || all ? 'is-calling' : ''}`}
        style={{ left: `calc(50vw - var(--pw) / 2 + var(--pw) * ${x - w / 2})`, top: `calc(var(--ph) * ${y - h / 2})`, width: `calc(var(--pw) * ${w})`, height: `calc(var(--ph) * ${h})` }}
        aria-label={`${FRIENDS[id].name}, ${FRIENDS[id].thing}. Tap to hear how it feels.`} onClick={(e) => meet(id, e)}>
        {id !== 'luna' && <i className="hs-spk-m" aria-hidden="true">{mark}</i>}</button>)}
      <button className="hs-meet-m" onClick={callAll} aria-label="Sparkles are friends that share a feeling. Tap to see who you can meet.">{mark} friends <em>{met.length}/{total}</em></button>
    </div>
    <div className="hs-friends">
      <button className={`hs-meet ${met.length >= total ? 'is-done' : ''}`} onClick={callAll} aria-label="Arrows open another place. Sparkles are friends that share a feeling. Tap to see who you can meet.">
        <span className="k-door"><b aria-hidden="true">→</b> opens a place</span>
        <span className="k-friend"><b aria-hidden="true">{mark}</b> {met.length >= total ? 'you met every friend!' : 'a friend’s feeling'}</span>
        <em>{met.length}/{total}</em>
      </button>
      {LANTERNS.map(([x, y, h], i) => <button key={`l${i}`} className={`hs-friend hs-f-lan ${wave === i || all ? 'is-calling' : ''}`} style={{ left: `${x * 100}%`, top: `${y * 100}%`, height: `${h * 100}%` }}
        aria-label={`${FRIENDS[LANTERN_FRIENDS[i]].name}, ${FRIENDS[LANTERN_FRIENDS[i]].thing}. Tap to hear how it feels.`} onPointerEnter={() => setLamp(i)} onPointerLeave={() => setLamp(null)} onFocus={() => setLamp(i)} onBlur={() => setLamp(null)} onClick={(e) => meet(LANTERN_FRIENDS[i], e)}><i className="hs-spk" aria-hidden="true">{mark}</i></button>)}
      {(night ? [...SPOTS, MOON] : starry ? SPOTS : SPOTS.filter(([id]) => id !== 'wish')).map(([id, x, y, w, h], i) => <button key={id} className={`hs-friend hs-f-spot hs-f-${id} ${wave === 4 + i || all ? 'is-calling' : ''}`} style={{ left: `${(x - w / 2) * 100}%`, top: `${(y - h / 2) * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
        aria-label={`${FRIENDS[id].name}, ${FRIENDS[id].thing}. Tap to hear how it feels.`} onClick={(e) => meet(id, e)}>{id === 'luna' ? null : id === 'wish' ? <span aria-hidden="true">✦</span> : <i className="hs-spk" aria-hidden="true">{mark}</i>}</button>)}
      {(['drift', 'puff'] as const).map((id) => <button key={id} className={`hs-friend hs-f-cloud hs-f-${id}`}
        aria-label={`${FRIENDS[id].name}, ${FRIENDS[id].thing}. Tap to hear how it feels.`} onClick={(e) => meet(id, e)}><i className="hs-spk" aria-hidden="true">{mark}</i></button>)}
    </div>
    <div className="hs-lanterns" aria-hidden="true">
      {LANTERNS.map(([x, y, h], i) => <span key={i} className={`hs-lan ${lamp === i ? 'is-hot' : ''}`} style={{ left: `${x * 100}%`, top: `${y * 100}%`, height: `${h * 100}%`, ['--d' as string]: `${(i * 0.7).toFixed(1)}s` }}>
        <img className="off" src={`${A}LanternOFF.webp`} alt="" /><img className="on" src={`${A}LanternON.webp`} alt="" /></span>)}
    </div>
    {onKeepsakes && <span className="hs-sofa" aria-hidden="true" />}
    {/* Wide screens: the guide is pinned to the window's right-most edge, outside the scaled stage. */}
    <div className="hs-wide">
      <div className="hs-bubble hs-wide-bubble" aria-live="polite">{teaching ? <>{teaching}<small>Tap me again for another one.</small></> : aim !== null ? (look === null ? HINT_LINES[aim] : CARD_LINES[aim]) : (intro && met.length < total ? INTRO_LINE : greeting(hour))}</div>
      <button className={`hs-flyer hs-at-${spot} ${flying ? 'is-flying' : ''}`} onClick={sayTeaching} aria-label="Chirpy. Tap him to hear something kind."><img src={chirpySprite(chirpyPose)} alt="" /></button>
      <button ref={boyBtn} className={`hs-wide-boy ${aim !== null ? `hs-look-${aim + 1}` : ''} ${teaching ? 'mg-boy-said' : ''} ${hop ? (hop % 2 ? 'hs-hop-a' : 'hs-hop-b') : ''}`} onClick={sayTeaching} aria-label="Tap the explorer — he has something to tell you"><BoyPoses pose={pose} /><span className="mg-tapme hs-tapme" aria-hidden="true">Tap me</span></button>
    </div>
    <div className="hs-stage">
      <span className="hs-pool" aria-hidden="true" />
      <div className="hs-bg-m" aria-hidden="true">{PHONE_LANTERNS.map(([x, y], i) => <i key={i} className="hs-glow-m" style={{ left: `${x * 100}%`, top: `${y * 100}%`, animationDelay: `${i * 0.9}s` }} />)}</div>
      <header className="mg-top">
        <div className="mg-brand">
          <button className="mg-logo" onClick={onExitGym} aria-label="Leave Mind Gym">Mind<span>Gym</span><small>A BRIGHTER<br />YOU INSIDE</small></button>
          <span className="mg-badge-home" hidden><BadgeSlot /></span>
        </div>
        <div className="mg-tools"><button
            className="mg-sound" title={mutedState ? 'Turn sound on' : 'Turn sound off'}
            onClick={() => { const next = !mutedState; setMuted(next); setMutedState(next); if (!next) sound.play('tap'); }}
            aria-pressed={!mutedState}
            aria-label={mutedState ? 'Sounds are off. Turn sounds on.' : 'Sounds are on. Turn sounds off.'}
          ><span aria-hidden="true">{mutedState ? '🔇' : '🔊'}</span></button>
          <BuddyHud name={name} onOpen={onBuddies} /></div>
      </header>

      {/* Phone only: a standing boy at the left edge, fixed to the screen. */}
      <button className={`hs-side hs-side-l ${teaching ? 'mg-boy-said' : ''} ${hop ? (hop % 2 ? 'hs-hop-a' : 'hs-hop-b') : ''}`} onClick={sayTeaching} aria-label="Tap the explorer — he has something to tell you"><BoyPoses pose={pose} /><img className="hs-chirp-m" src={chirpySprite(chirpyPose)} alt="" /><span className="mg-tapme hs-tapme" aria-hidden="true">Tap me</span></button>
      <section className="hs-guide" aria-label="Your guide">
        <div className="hs-bubble" aria-live="polite">{teaching ? <>{teaching}<small>Tap me again for another one.</small></> : aim !== null ? (look === null ? HINT_LINES[aim] : CARD_LINES[aim]) : (intro && met.length < total ? INTRO_LINE : greeting(hour))}</div>
        <button className={`hs-boy-wrap ${teaching ? 'mg-boy-said' : ''}`} onClick={sayTeaching} aria-label="Tap the explorer — he has something to tell you">
          <img className="hs-boy mg-boy" src={`${A}boy_fullbody.webp`} alt="Your red-cap explorer" />
          <img className="hs-chirpy mg-chirpy" src={chirpySprite(teaching ? 'excited' : CHIRPY_MOODS[mood])} alt="Chirpy" />
          <span className="mg-chirpy-line hs-chirpy-line">I’m here<br />with you!<br />♡ Chirpy!</span>
          <span className="mg-tapme hs-tapme" aria-hidden="true">Tap me</span>
        </button>
      </section>

      <div className={`hs-card hs-card-1${hint === 0 && look === null ? ' hs-hint' : ''}`} onPointerEnter={() => hearCard(0)} onPointerMove={tilt} onPointerLeave={(e) => { setLook(null); untilt(e); }} onFocus={() => hearCard(0)} onBlur={() => setLook(null)}>
        <img className="hs-card-art" src={`${A}card-HomeScreen.webp`} alt="" />
        <img className="hs-card-icon" src={`${A}hs-icon-heart.webp`} alt="" />
        <ArcTitle id="hs-arc-1">How Are You Feeling?</ArcTitle>
        <p>Explore a feeling with Chirpy <br className="hs-br" />and feel better.</p>
        {burst === 0 && <span className="hs-burst" aria-hidden="true">{Array.from({ length: 10 }, (_, k) => <i key={k} style={{ ['--a' as string]: `${k * 36}deg`, animationDelay: `${(k % 3) * 30}ms` }} />)}</span>}
        <button className="hs-go hs-go-blue" data-guide="feel" data-guide-rank="1" onClick={() => { sound.play('enterRoom'); go(0, onDeepDive); }}>Start My Journey <span aria-hidden="true">→</span></button>
      </div>
      <div className={`hs-card hs-card-2${hint === 1 && look === null ? ' hs-hint' : ''}`} onPointerEnter={() => hearCard(1)} onPointerMove={tilt} onPointerLeave={(e) => { setLook(null); untilt(e); }} onFocus={() => hearCard(1)} onBlur={() => setLook(null)}>
        <img className="hs-card-art" src={`${A}card-HomeScreen.webp`} alt="" />
        <img className="hs-card-icon" src={`${A}hs-icon-games.webp`} alt="" />
        <ArcTitle id="hs-arc-2">Good Choices Games</ArcTitle>
        <p>Play situations. Make a choice. <br className="hs-br" />Earn Mind Stars.</p>
        {playedToday > 0 && <span className="hs-chip"><span aria-hidden="true">★</span> {playedToday} played today</span>}
        {burst === 1 && <span className="hs-burst" aria-hidden="true">{Array.from({ length: 10 }, (_, k) => <i key={k} style={{ ['--a' as string]: `${k * 36}deg`, animationDelay: `${(k % 3) * 30}ms` }} />)}</span>}
        <button className="hs-go hs-go-green" data-guide="practise" data-guide-rank="1" onClick={() => { sound.play('roomCard'); go(1, () => setRooms(true), false); }}>Visit My Rooms <span aria-hidden="true">→</span></button>
      </div>
      <div className={`hs-card hs-card-3${hint === 2 && look === null ? ' hs-hint' : ''}`} onPointerEnter={() => hearCard(2)} onPointerMove={tilt} onPointerLeave={(e) => { setLook(null); untilt(e); }} onFocus={() => hearCard(2)} onBlur={() => setLook(null)}>
        <img className="hs-card-art" src={`${A}card-HomeScreen.webp`} alt="" />
        <img className="hs-card-icon" src={`${A}hs-icon-diary.webp`} alt="" />
        <ArcTitle id="hs-arc-3">My Inner Diary</ArcTitle>
        <p>Remember your day, <br className="hs-br" />thoughts and progress.</p>
        {burst === 2 && <span className="hs-burst" aria-hidden="true">{Array.from({ length: 10 }, (_, k) => <i key={k} style={{ ['--a' as string]: `${k * 36}deg`, animationDelay: `${(k % 3) * 30}ms` }} />)}</span>}
        <button className="hs-go hs-go-purple" data-guide="diary" data-guide-rank="1" onClick={() => go(2, onReflection)}>Open My Diary <span aria-hidden="true">→</span></button>
        {s.streak >= 2 && <span className="hs-chip hs-chip-streak"><span aria-hidden="true">🔥</span> {s.streak}-day streak</span>}
        {!diaryDone && <span className="hs-today"><span aria-hidden="true">★</span> Today’s page<br />is waiting</span>}
      </div>

      {onKeepsakes && <button className="hs-corner" onClick={onKeepsakes} aria-label="My Corner. Rest, reflect and revisit.">
        <img className="hs-bean" src="/mind-gym/corner/hs-beanbag.webp" alt="" />
        <img src="/mind-gym/corner/hs-sign.webp" alt="" />
        <span><b>My Corner</b><small>Rest, reflect and revisit.</small></span>
        <em className="hs-tag" aria-hidden="true">Go in <b>→</b></em>
      </button>}

      <FloorBuddy onOpen={onBuddies} />
      <footer className="mg-safety">
        <button onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </footer>
    </div>
    {rooms && <div className="hs-rooms" role="dialog" aria-modal="true" aria-label="My Good Choices rooms" onClick={(e) => { if (e.target === e.currentTarget) setRooms(false); }} onKeyDown={(e) => { if (e.key === 'Escape') setRooms(false); }}>
      <section className="mg-choices hs-rooms-panel" aria-label="My Good Choices">
        <button className="hs-rooms-close" onClick={() => setRooms(false)} aria-label="Close rooms">×</button>
        <header className="mg-shelf-title"><span aria-hidden="true">☀</span><h2>My Good Choices</h2><p>Small choices. Big growth. A brighter you.</p></header>
        <GoodChoicesShelf onAction={(id, next) => { setRooms(false); open(id, next); }} onDiary={() => { setRooms(false); onReflection(); }} diaryWaiting={!diaryDone} />
      </section>
    </div>}
    <dialog className="mg-room-dialog" aria-labelledby="mg-room-title" ref={dialog} onClose={() => setSelected(null)} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      {room && behaviour && <><header><h2 id="mg-room-title">{behaviour.title}</h2><button onClick={close} aria-label="Close room">×</button></header>
        <nav aria-label="Room activities">{(['reflect', 'play', 'learn'] as const).map((item) => <button key={item} onClick={() => {
          if (item !== 'play') { setMode(item); return; }
          /* Same door, same destination, whichever way a child reaches it. */
          const go = room.id === 'mindheart' ? onKeepsakes : () => onPractice(room);
          if (!go) { setMode(item); return; }
          close(); go();
        }} aria-pressed={mode === item}>{item === 'reflect' ? 'My day' : item === 'play' ? 'Play' : 'Learn'}</button>)}</nav>
        {mode === 'reflect' && <><p>{words?.prompt ?? behaviour.prompt}</p><div className="mg-day-options"><button aria-pressed={!!s.completions[today]?.[room.id]} onClick={() => s.setBehaviourOn(today, room.id, true)}>Yes, I did</button><button aria-pressed={!s.completions[today]?.[room.id]} onClick={() => s.setBehaviourOn(today, room.id, false)}>Not today</button></div><label htmlFor="mg-home-note">Something to remember (if you like)</label><textarea id="mg-home-note" value={note} onChange={(e) => write(e.target.value)} rows={3} /><MicButton onText={(text) => write(note ? `${note} ${text}` : text)} /><button className="mg-save" onClick={() => setSaved(true)}>{saved ? 'Saved in your diary' : 'Save my thought'}</button><p role="status">{saved ? 'Your thought is saved on this device.' : 'You can stop whenever you like.'}</p></>}
        {mode === 'learn' && <><h3>{words?.learn.title}</h3><p>{words?.learn.body}</p><button className="mg-save" onClick={() => { close(); if (room.id === 'mindheart' && onKeepsakes) onKeepsakes(); else onOpenRoom(room); }}>{room.id === 'mindheart' && onKeepsakes ? 'Visit My Corner →' : 'Explore this room →'}</button></>}
        {mode === 'play' && (game ? <RoomGamePlayer key={game.id} game={game} accent="#ffe099" onDone={(earned) => { const marker = `home:${game.id}`; if (!(s.scenariosDone[today] ?? []).includes(marker)) { s.completeScenario(marker); s.awardPoints(earned, room.id); } setMode('reflect'); }} /> : <button className="mg-save" onClick={() => { close(); onOpenRoom(room); }}>Enter the {behaviour.title} activity →</button>)}
        <button className="mg-dialog-grownup" onClick={() => { close(); onGrownUp(); }}>Talk to a grown-up</button>
      </>}
    </dialog>
  </main>;
}
