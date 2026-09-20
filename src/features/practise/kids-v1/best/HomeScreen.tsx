import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useKidStore } from '../../../kids/store';
import { BEHAVIOURS, todayKey } from '../../../kids/data';
import { FONT } from '../ui/chrome';
import { useQuiet } from '../ui/quiet';
import { MicButton } from '../ui/MicButton';
import { VIRTUE_ROOMS, type VirtueRoom } from './rooms';
import { roomGamesFor } from './roomGames';
import { RoomGamePlayer } from './RoomGamePlayer';
import { GoodChoicesShelf } from './GoodChoicesShelf';
import { DailyWelcome } from './DailyWelcome';
import { HowOld } from './HowOld';
import { bandUnknown } from '../kit/band';
import { chirpySprite } from '../ui/sprites';
import * as sound from '../kit/sound';
import { TEACHINGS } from '../kit/teachings';
import { speak } from '../kit/chirpyVoice';
import { isMuted, setMuted } from '../../../../lib/sfx';
import './HomeScreen.css';

const A = '/mind-gym/home/';
const STEPS = [
  ['feeling', 'Feeling', 'What are you feeling?'], ['body', 'Body', 'What do you notice?'],
  ['thought', 'Thought', 'What’s going through your mind?'], ['what_happened', 'What happened?', 'Let’s look at what happened.'],
  ['story', 'Story', 'Make sense of it.'], ['another_way', 'Another way to see it', 'Try a new perspective.'],
];

/** Composed from the approved two-flow home handoff; all controls are semantic. */
export function HomeScreen({ name, onDeepDive, onOpenRoom, onPractice, onGrownUp, onExitGym, onReflection, onReflectionPath }: {
  name: string; onDeepDive: () => void; onOpenRoom: (room: VirtueRoom) => void;
  onPractice: (room: VirtueRoom) => void;
  onGrownUp: () => void; onExitGym: () => void; onReflection: () => void;
  onReflectionPath?: () => void;
}) {
  const s = useKidStore();
  const quiet = useQuiet();
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
    const timer = setTimeout(() => setAskAge(bandUnknown()), 2600);
    return () => clearTimeout(timer);
  }, []);
  const [teaching, setTeaching] = useState<string | null>(null);
  const lastTeaching = useRef('');
  const sayTeaching = () => {
    const pool = TEACHINGS.flatMap(t => t.open).filter(line => line.length > 14 && line.length < 140);
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
    sound.play('tap');
    speak(line, quiet);
  };
  const today = todayKey();
  const room = VIRTUE_ROOMS.find((r) => r.id === selected);
  const behaviour = BEHAVIOURS.find((b) => b.id === selected);
  const game = room ? roomGamesFor(room.id)[0] : undefined;
  const points = s.points;
  const reflectionCount = s.savedReflections?.length ?? 0;
  const month = today.slice(0, 7);
  const days = Object.entries(s.completions).filter(([date, values]) => date.startsWith(month) && Object.values(values).some(Boolean)).length;
  const noteKey = `${today}:${selected ?? ''}`;
  const note = s.monthReviews[month]?.[noteKey] ?? '';
  const open = (id: string, next: typeof mode) => {
    const practiceRoom = VIRTUE_ROOMS.find(r => r.id === id);
    if (next === 'play' && practiceRoom && id !== 'mindheart') { onPractice(practiceRoom); return; }
    setSelected(id); setMode(next); setSaved(false); sound.play('roomCard'); dialog.current?.showModal();
  };
  const close = () => { dialog.current?.close(); setSelected(null); };
  const write = (value: string) => { s.setMonthReview(month, noteKey, value); setSaved(false); };

  return <main className={`mg-home ${quiet || reduced ? 'mg-still' : ''}`} style={{ fontFamily: FONT }}>
    <DailyWelcome />
    {askAge && <HowOld onDone={() => setAskAge(false)} />}
    <div className="mg-world">
      <header className="mg-top">
        <button className="mg-logo" onClick={onExitGym} aria-label="Leave Mind Gym">Mind<span>Gym</span><small>A BRIGHTER<br />YOU INSIDE</small></button>
        <div className="mg-tools"><button
            className="mg-sound"
            onClick={() => { const next = !mutedState; setMuted(next); setMutedState(next); if (!next) sound.play('tap'); }}
            aria-pressed={!mutedState}
            aria-label={mutedState ? 'Sounds are off. Turn sounds on.' : 'Sounds are on. Turn sounds off.'}
          ><span aria-hidden="true">{mutedState ? '🔇' : '🔊'}</span></button><span className="mg-points"><span aria-hidden="true">⭐</span><span><b>{points}</b><small>Mind Stars</small></span></span>
          <button className="mg-month" onClick={onReflection} aria-label="Open My Inner Diary and browse months"><b>{new Date().toLocaleString('en', { month: 'short' }).toUpperCase()}</b><span>This month<small>{days} {days === 1 ? 'day' : 'days'} remembered</small><span aria-hidden="true">● ● ● ● ✦</span></span></button></div>
      </header>
      <div className="mg-mobile-doors"><button onClick={() => setMobile(mobile === 'feelings' ? null : 'feelings')} aria-expanded={mobile === 'feelings'}>Funny Feeling?<small>Step into your mind →</small></button><button onClick={() => setMobile(mobile === 'choices' ? null : 'choices')} aria-expanded={mobile === 'choices'}>My Good Choices<small>Open your seven rooms →</small></button></div>
      <section className={`mg-feelings ${mobile === 'feelings' ? 'mg-mobile-open' : ''}`} aria-label="Funny Feeling journey">
        <h1>Funny Feeling?</h1><h2>Step into your mind.</h2><p className="mg-invitation">A guided journey to understand<br />your feelings and feel better.</p>
        <ol className="mg-steps">{STEPS.map(([icon, title, sub], i) => <li key={icon}><img src={`${A}icon_${icon}.webp`} alt="" /><div><b>{i + 1}. {title}</b><span>{sub}</span></div></li>)}</ol>
        <button className="mg-start" onClick={() => { sound.play('enterRoom'); onDeepDive(); }}>Start My Journey <span aria-hidden="true">›</span></button>
      </section>
      <section className="mg-character" aria-label="Your guide">
        <div className="mg-greeting" aria-live="polite"><img src={`${A}boy_fullbody.webp`} alt="" /><div>{teaching
          ? <><b>{teaching}</b><p>Tap me again for another one.</p></>
          : <><b>Hello{name ? `, ${name}` : ''}!<br />How would you like<br />to begin today?</b><p>You can explore your feelings<br />or make good choices!</p></>}</div></div>
        <button className={`mg-boy-wrap ${teaching ? 'mg-boy-said' : ''}`} onClick={sayTeaching} aria-label="Tap the explorer — he has something to tell you">
          <img className="mg-boy" src={`${A}boy_fullbody.webp`} alt="Your red-cap explorer" />
          <img className="mg-chirpy" src={chirpySprite(teaching ? 'excited' : 'curious')} alt="Chirpy" />
          <span className="mg-chirpy-line">I’m here<br />with you!<br />♡ Chirpy!</span>
          <span className="mg-tapme" aria-hidden="true">Tap me</span>
        </button>
      </section>
      <section className={`mg-choices ${mobile === 'choices' ? 'mg-mobile-open' : ''}`} aria-label="My Good Choices">
        <header className="mg-shelf-title"><span aria-hidden="true">☀</span><h2>My Good Choices</h2><p>Small choices. Big growth. A brighter you.</p></header>
        <GoodChoicesShelf onAction={open} onDiary={onReflection} />
      </section>
      {/*
        THE PAINTED LETTERING IN THE CORNERS.

        Both are in the approved reference and in neither shipped background —
        the clean environment asset is the room only, so these were lost in the
        hand-off. They are scenery, not controls: stacked wooden blocks on the
        left under the Feelings portal, and the four words the gym is for on
        the right by the sleeping dog. aria-hidden, because a child gains
        nothing from a screen reader listing the furniture.
      */}
      <p className="mg-blocks mg-blocks-left" aria-hidden="true"><span>Brighter<br />Feelings</span><span>Brighter<br />Tomorrows</span></p>
      <p className="mg-blocks mg-blocks-right" aria-hidden="true"><span>KINDER</span><span>BRAVER</span><span>CALMER</span><span>HAPPIER YOU ♡</span></p>

      <footer className="mg-safety">
        <button className="chrome-fade" onClick={onExitGym}>‹ Back</button>
        {onReflectionPath && reflectionCount > 0 && <button className="mg-reflection-path-btn" onClick={onReflectionPath}>✦ My Reflection Path <span className="mg-reflection-count">{reflectionCount}</span></button>}
        <button className="chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </footer>
    </div>
    <dialog className="mg-room-dialog" aria-labelledby="mg-room-title" ref={dialog} onClose={() => setSelected(null)} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      {room && behaviour && <><header><h2 id="mg-room-title">{behaviour.title}</h2><button onClick={close} aria-label="Close room">×</button></header>
        <nav aria-label="Room activities">{(['reflect', 'play', 'learn'] as const).map((item) => <button key={item} onClick={() => {
          if (item === 'play' && room.id !== 'mindheart') { close(); onPractice(room); }
          else setMode(item);
        }} aria-pressed={mode === item}>{item === 'reflect' ? 'My day' : item === 'play' ? 'Play' : 'Learn'}</button>)}</nav>
        {mode === 'reflect' && <><p>{behaviour.prompt}</p><div className="mg-day-options"><button aria-pressed={!!s.completions[today]?.[room.id]} onClick={() => s.setBehaviourOn(today, room.id, true)}>Yes, I did</button><button aria-pressed={!s.completions[today]?.[room.id]} onClick={() => s.setBehaviourOn(today, room.id, false)}>Not today</button></div><label htmlFor="mg-home-note">Something to remember (if you like)</label><textarea id="mg-home-note" value={note} onChange={(e) => write(e.target.value)} rows={3} /><MicButton onText={(text) => write(note ? `${note} ${text}` : text)} /><button className="mg-save" onClick={() => setSaved(true)}>{saved ? 'Saved in your diary' : 'Save my thought'}</button><p role="status">{saved ? 'Your thought is saved on this device.' : 'You can stop whenever you like.'}</p></>}
        {mode === 'learn' && <><h3>{room.learn.title}</h3><p>{room.learn.body}</p><button className="mg-save" onClick={() => { close(); onOpenRoom(room); }}>Explore this room →</button></>}
        {mode === 'play' && (game ? <RoomGamePlayer key={game.id} game={game} accent="#ffe099" onDone={(earned) => { const marker = `home:${game.id}`; if (!(s.scenariosDone[today] ?? []).includes(marker)) { s.completeScenario(marker); s.awardPoints(earned, room.id); } setMode('reflect'); }} /> : <button className="mg-save" onClick={() => { close(); onOpenRoom(room); }}>Enter the {behaviour.title} activity →</button>)}
        <button className="mg-dialog-grownup" onClick={() => { close(); onGrownUp(); }}>Talk to a grown-up</button>
      </>}
    </dialog>
  </main>;
}
