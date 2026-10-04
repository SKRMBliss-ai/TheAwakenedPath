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
import { playHoverNote } from '../kit/doorbell';
import { startSkyAmbience, stopAmbience } from '../kit/ambience';
import { timeOfDayForHour } from '../rooms';
import './HomeScreen.css';
import './DiaryNudge.css';

const A = '/mind-gym/home/';
/** What the guide says about the card under the pointer, and how he greets by the hour. */
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
/* Ambient lights, in fractions of the 1916x821 environment picture. */
const LANTERNS: [number, number][] = [[.247, .12], [.161, .38], [.063, .8], [.867, .17], [.947, .32], [.885, .69]];
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
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);
  const go = (card: number, next: () => void, zoom = true) => {
    if (quiet || reduced) { next(); return; }
    setBurst(card); window.setTimeout(() => setBurst(null), 700);
    if (!zoom) { next(); return; }
    setLeaving(true);
    leaveTimer.current = window.setTimeout(() => { next(); setLeaving(false); }, 320);
  };
  const [hour] = useState(() => new Date().getHours());
  /* The place has its own night air — the same bed the hub uses for this hour.
     Silent while sound is off (the default) and in the quiet state. */
  useEffect(() => {
    if (quiet) { stopAmbience(); return; }
    startSkyAmbience(timeOfDayForHour(hour));
    return () => stopAmbience();
  }, [quiet, hour, mutedState]);
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

  return <main ref={home} className={`mg-home ${quiet || reduced ? 'mg-still' : ''} ${leaving ? 'hs-leaving' : ''}`} style={{ fontFamily: FONT }}>
    <DailyWelcome />
    {askAge && <AgePopup onDone={() => setAskAge(false)} />}
    <div className="hs-tod" aria-hidden="true" style={{ background: dayGrade(hour) }} />
    <div className="hs-bg" aria-hidden="true">
      {LANTERNS.map(([x, y], i) => <i key={i} className="hs-glow" style={{ left: `${x * 100}%`, top: `${y * 100}%`, animationDelay: `${i * 0.7}s` }} />)}
      {!quiet && !reduced && FIREFLIES.map((f, i) => <b key={i} className="hs-fly" style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%`, animationDuration: `${f.d}s`, animationDelay: `-${f.s}s`, ['--r' as string]: `${f.r}px` }} />)}
    </div>
    <div className="hs-veil" aria-hidden="true" />
    {onKeepsakes && <span className="hs-sofa" aria-hidden="true" />}
    {/* Wide screens: the guide is pinned to the window's right-most edge, outside the scaled stage. */}
    <div className="hs-wide">
      <div className="hs-bubble hs-wide-bubble" aria-live="polite">{teaching ? <>{teaching}<small>Tap me again for another one.</small></> : look !== null ? CARD_LINES[look] : greeting(hour)}</div>
      <button className={`hs-wide-boy ${look !== null ? `hs-look-${look + 1}` : ''} ${teaching ? 'mg-boy-said' : ''} ${hop ? (hop % 2 ? 'hs-hop-a' : 'hs-hop-b') : ''}`} onClick={sayTeaching} aria-label="Tap the explorer — he has something to tell you"><img src="/assets/home/boy@640.webp" alt="" /><span className="mg-tapme hs-tapme" aria-hidden="true">Tap me</span></button>
    </div>
    <div className="hs-stage">
      <header className="mg-top">
        <div className="mg-brand">
          <button className="mg-logo" onClick={onExitGym} aria-label="Leave Mind Gym">Mind<span>Gym</span><small>A BRIGHTER<br />YOU INSIDE</small></button>
          <span className="mg-badge-home" hidden><BadgeSlot /></span>
        </div>
        <div className="mg-tools"><button
            className="mg-sound"
            onClick={() => { const next = !mutedState; setMuted(next); setMutedState(next); if (!next) sound.play('tap'); }}
            aria-pressed={!mutedState}
            aria-label={mutedState ? 'Sounds are off. Turn sounds on.' : 'Sounds are on. Turn sounds off.'}
          ><span aria-hidden="true">{mutedState ? '🔇' : '🔊'}</span></button>
          <BuddyHud name={name} onOpen={onBuddies} /></div>
      </header>

      {/* Phone only: a standing boy at the left edge, fixed to the screen. */}
      <button className={`hs-side hs-side-l ${teaching ? 'mg-boy-said' : ''} ${hop ? (hop % 2 ? 'hs-hop-a' : 'hs-hop-b') : ''}`} onClick={sayTeaching} aria-label="Tap the explorer — he has something to tell you"><img src="/assets/home/boy@640.webp" alt="" /><span className="mg-tapme hs-tapme" aria-hidden="true">Tap me</span></button>
      <section className="hs-guide" aria-label="Your guide">
        <div className="hs-bubble" aria-live="polite">{teaching ? <>{teaching}<small>Tap me again for another one.</small></> : look !== null ? CARD_LINES[look] : greeting(hour)}</div>
        <button className={`hs-boy-wrap ${teaching ? 'mg-boy-said' : ''}`} onClick={sayTeaching} aria-label="Tap the explorer — he has something to tell you">
          <img className="hs-boy mg-boy" src={`${A}boy_fullbody.webp`} alt="Your red-cap explorer" />
          <img className="hs-chirpy mg-chirpy" src={chirpySprite(teaching ? 'excited' : CHIRPY_MOODS[mood])} alt="Chirpy" />
          <span className="mg-chirpy-line hs-chirpy-line">I’m here<br />with you!<br />♡ Chirpy!</span>
          <span className="mg-tapme hs-tapme" aria-hidden="true">Tap me</span>
        </button>
      </section>

      <div className="hs-card hs-card-1" onPointerEnter={() => hearCard(0)} onPointerLeave={() => setLook(null)} onFocus={() => hearCard(0)} onBlur={() => setLook(null)}>
        <img className="hs-card-art" src={`${A}card-HomeScreen.webp`} alt="" />
        <img className="hs-card-icon" src={`${A}hs-icon-heart.webp`} alt="" />
        <ArcTitle id="hs-arc-1">How Are You Feeling?</ArcTitle>
        <p>Explore a feeling with Chirpy <br className="hs-br" />and feel better.</p>
        {burst === 0 && <span className="hs-burst" aria-hidden="true">{Array.from({ length: 10 }, (_, k) => <i key={k} style={{ ['--a' as string]: `${k * 36}deg`, animationDelay: `${(k % 3) * 30}ms` }} />)}</span>}
        <button className="hs-go hs-go-blue" data-guide="feel" data-guide-rank="1" onClick={() => { sound.play('enterRoom'); go(0, onDeepDive); }}>Start My Journey <span aria-hidden="true">→</span></button>
      </div>
      <div className="hs-card hs-card-2" onPointerEnter={() => hearCard(1)} onPointerLeave={() => setLook(null)} onFocus={() => hearCard(1)} onBlur={() => setLook(null)}>
        <img className="hs-card-art" src={`${A}card-HomeScreen.webp`} alt="" />
        <img className="hs-card-icon" src={`${A}hs-icon-games.webp`} alt="" />
        <ArcTitle id="hs-arc-2">Good Choices Games</ArcTitle>
        <p>Play situations. Make a choice. <br className="hs-br" />Earn Mind Stars.</p>
        {playedToday > 0 && <span className="hs-chip"><span aria-hidden="true">★</span> {playedToday} played today</span>}
        {burst === 1 && <span className="hs-burst" aria-hidden="true">{Array.from({ length: 10 }, (_, k) => <i key={k} style={{ ['--a' as string]: `${k * 36}deg`, animationDelay: `${(k % 3) * 30}ms` }} />)}</span>}
        <button className="hs-go hs-go-green" data-guide="practise" data-guide-rank="1" onClick={() => { sound.play('roomCard'); go(1, () => setRooms(true), false); }}>Visit My Rooms <span aria-hidden="true">→</span></button>
      </div>
      <div className="hs-card hs-card-3" onPointerEnter={() => hearCard(2)} onPointerLeave={() => setLook(null)} onFocus={() => hearCard(2)} onBlur={() => setLook(null)}>
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
