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
import { rememberedGreeting } from '../../../kids/delight';
import { GuideArrow, PathSteps } from './TodayPath';
import { useTodayPath } from '../kit/useTodayPath';
import { BuddyHud, FloorBuddy } from './buddies/HomeBuddy';
import type { PathStepId } from '../kit/todayPath';
import './HomeScreen.css';
import './DiaryNudge.css';

const A = '/mind-gym/home/';
const STEPS = [
  ['feeling', 'Feeling', 'What are you feeling?'], ['body', 'Body', 'What do you notice?'],
  ['thought', 'Thought', 'What’s going through your mind?'], ['what_happened', 'What happened?', 'Let’s look at what happened.'],
  /* "Another Way", not "Another way to see it" — the panel this step opens
     is titled "6. Another Way" (StoryLabRoom's TITLES), and the long version
     was the one label here that would not fit a row, so it wrapped onto two
     lines and sat on top of the Start My Journey button. The subtitle
     already says what it means. */
  ['story', 'Story', 'Make sense of it.'], ['another_way', 'Another Way', 'Try a new perspective.'],
];

/** Composed from the approved two-flow home handoff; all controls are semantic. */
const CHIRPY_MOODS: ChirpyPose[] = ['curious', 'calm', 'excited', 'thinking', 'hopeful', 'confused', 'sad', 'calm'];

export function HomeScreen({ name, onDeepDive, onOpenRoom, onPractice, onGrownUp, onExitGym, onReflection, onKeepsakes, onCorner, onBuddies }: {
  name: string; onDeepDive: () => void; onOpenRoom: (room: VirtueRoom) => void;
  onPractice: (room: VirtueRoom) => void;
  onGrownUp: () => void; onExitGym: () => void; onReflection: () => void;
  onKeepsakes?: () => void;
  onCorner: () => void;
  onBuddies: () => void;
}) {
  const s = useKidStore();
  const quiet = useQuiet();
  const diaryDone = useDiaryFilledToday();
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<'reflect' | 'play' | 'learn'>('reflect');
  const [mobile, setMobile] = useState<'feelings' | 'choices' | null>(null);
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
  const today = todayKey();
  useEffect(() => { useKidStore.getState().noteVisit(); }, []);
  /*
    CHIRPY REMEMBERS — in the card he is already standing under, as words on
    the page rather than as speech. This home page does not talk until it is
    spoken to; see delight.rememberedGreeting for what he will and will not
    say about a child coming back.
  */
  const greeting = rememberedGreeting({
    name, today, memories: s.memories,
    eggReady: s.eggHatchedOn !== today && s.activeDays.includes(today),
  });
  const room = VIRTUE_ROOMS.find((r) => r.id === selected);
  const texts = useLiveContent((st) => st.texts);
  const words = room && roomText(room, texts);
  const behaviour = BEHAVIOURS.find((b) => b.id === selected);
  const game = room ? roomGamesFor(room.id)[0] : undefined;
  /*
    WHAT TO DO FIRST, AND WHAT NEXT. Feel, practise, diary, play: the stones in
    the bubble say the order and the arrow points at the real thing to tap.
    See kit/todayPath for the order and best/TodayPath for the arrow.
  */
  const world = useRef<HTMLDivElement>(null);
  const path = useTodayPath();
  const go = (step: PathStepId) => {
    sound.play('enterRoom');
    if (step === 'feel') onDeepDive();
    else if (step === 'practise') {
      const practiceRoom = VIRTUE_ROOMS.find((r) => r.id === path.room);
      if (practiceRoom) onPractice(practiceRoom);
    } else if (step === 'diary') onReflection();
    else onCorner();
  };
  const hello = greeting?.title ?? 'Hello!';
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

  return <main className={`mg-home ${quiet || reduced ? 'mg-still' : ''}`} style={{ fontFamily: FONT }}>
    <DailyWelcome />
    {askAge && <AgePopup onDone={() => setAskAge(false)} />}
    <div className="mg-world" ref={world}>
      <header className="mg-top">
        <div className="mg-brand">
          <button className="mg-logo" onClick={onExitGym} aria-label="Leave Mind Gym">Mind<span>Gym</span><small>A BRIGHTER<br />YOU INSIDE</small></button>
          {/* The name tag would stand here, under the logo, saying again
              what the level panel in the other corner already says. The
              slot is kept (so the tag does not pin itself over that panel)
              and hidden. */}
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
      <PathSteps path={path} title={hello} variant="strip" quiet={quiet} onGo={go} />
      <div className="mg-mobile-doors"><button data-guide="feel" data-guide-rank="1" onClick={() => setMobile(mobile === 'feelings' ? null : 'feelings')} aria-expanded={mobile === 'feelings'}>Funny Feeling?<small>Step into your mind →</small></button><button data-guide="practise" data-guide-rank="1" onClick={() => setMobile(mobile === 'choices' ? null : 'choices')} aria-expanded={mobile === 'choices'}>My Good Choices<small>Open your seven rooms →</small></button><button className="mg-mobile-diary" data-guide="diary" data-guide-rank="1" onClick={onReflection}>📖 My Inner Diary<small>{diaryDone ? '✓ Today is in your diary' : 'Today’s page is waiting'}</small></button></div>
      <FloorBuddy onOpen={onBuddies} />
      <section className={`mg-feelings ${mobile === 'feelings' ? 'mg-mobile-open' : ''}`} aria-label="Funny Feeling journey" role="button" tabIndex={0} onClick={() => { sound.play('enterRoom'); onDeepDive(); }} onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); sound.play('enterRoom'); onDeepDive(); } }}>
        <h1>Funny Feeling?</h1><h2>Step into your mind.</h2><p className="mg-invitation">A guided journey to understand<br />your feelings and feel better.</p>
        <ol className="mg-steps">{STEPS.map(([icon, title, sub], i) => <li key={icon}><img src={`${A}icon_${icon}.webp`} alt="" /><div><b>{i + 1}. {title}</b><span>{sub}</span></div></li>)}</ol>
        <button className="mg-start" data-guide="feel" data-guide-rank="2" onClick={(e) => { e.stopPropagation(); sound.play('enterRoom'); onDeepDive(); }}>Start My Journey <span aria-hidden="true">›</span></button>
      </section>
      <section className="mg-character" aria-label="Your guide">
        <div className={`mg-greeting ${teaching ? '' : 'is-path'}`} aria-live="polite"><img src={`${A}boy_fullbody.webp`} alt="" />{teaching
          ? <div><b>{teaching}</b><p>Tap me again for another one.</p></div>
          : <PathSteps path={path} title={hello} variant="card" quiet={quiet} onGo={go} />}</div>
        <button className={`mg-boy-wrap ${teaching ? 'mg-boy-said' : ''}`} onClick={sayTeaching} aria-label="Tap the explorer — he has something to tell you">
          <img className="mg-boy" src={`${A}boy_fullbody.webp`} alt="Your red-cap explorer" />
          <img className="mg-chirpy" src={chirpySprite(teaching ? 'excited' : CHIRPY_MOODS[mood])} alt="Chirpy" />
          <span className="mg-chirpy-line">I’m here<br />with you!<br />♡ Chirpy!</span>
          <span className="mg-tapme" aria-hidden="true">Tap me</span>
        </button>
      </section>
      <section className={`mg-choices ${mobile === 'choices' ? 'mg-mobile-open' : ''}`} aria-label="My Good Choices">
        <header className="mg-shelf-title"><span aria-hidden="true">☀</span><h2>My Good Choices</h2><p>Small choices. Big growth. A brighter you.</p></header>
        <GoodChoicesShelf onAction={open} onDiary={onReflection} diaryWaiting={!diaryDone}
          guideDoor={path.current === 'practise' ? path.room : undefined} />
      </section>
      {/*
        THE PAINTED LETTERING BY THE SLEEPING DOG: the four words the gym is
        for. Scenery, not a control, so aria-hidden. (The two wooden blocks that
        stood bottom-left came out: they took the corner the arrow now uses.)
      */}
      <p className="mg-blocks mg-blocks-right" aria-hidden="true"><span>KINDER</span><span>BRAVER</span><span>CALMER</span><span>HAPPIER YOU ♡</span></p>

      <GuideArrow worldRef={world} path={path} still={quiet || !!reduced} />
      <footer className="mg-safety">
        <button className="chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </footer>
    </div>
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
