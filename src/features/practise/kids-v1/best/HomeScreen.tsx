import { useRef, useState } from 'react';
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
import { chirpySprite } from '../ui/sprites';
import * as sound from '../kit/sound';
import './HomeScreen.css';

const A = '/mind-gym/home/';
const STEPS = [
  ['feeling', 'Feeling', 'What are you feeling?'], ['body', 'Body', 'What do you notice?'],
  ['thought', 'Thought', 'What’s going through your mind?'], ['what_happened', 'What happened?', 'Let’s look at what happened.'],
  ['story', 'Story', 'Make sense of it.'], ['another_way', 'Another way to see it', 'Try a new perspective.'],
];

/** Composed from the approved two-flow home handoff; all controls are semantic. */
export function HomeScreen({ name, onDeepDive, onOpenRoom, onGrownUp, onExitGym, onReflection }: {
  name: string; onDeepDive: () => void; onOpenRoom: (room: VirtueRoom) => void;
  onGrownUp: () => void; onExitGym: () => void; onReflection: () => void;
}) {
  const s = useKidStore();
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<'reflect' | 'play' | 'learn'>('reflect');
  const [mobile, setMobile] = useState<'feelings' | 'choices' | null>(null);
  const [saved, setSaved] = useState(false);
  const today = todayKey();
  const room = VIRTUE_ROOMS.find((r) => r.id === selected);
  const behaviour = BEHAVIOURS.find((b) => b.id === selected);
  const game = room ? roomGamesFor(room.id)[0] : undefined;
  const points = BEHAVIOURS.reduce((n, b) => n + (s.completions[today]?.[b.id] ? b.points : 0), 0);
  const month = today.slice(0, 7);
  const days = Object.entries(s.completions).filter(([date, values]) => date.startsWith(month) && Object.values(values).some(Boolean)).length;
  const noteKey = `${today}:${selected ?? ''}`;
  const note = s.monthReviews[month]?.[noteKey] ?? '';
  const open = (id: string, next: typeof mode) => {
    setSelected(id); setMode(next); setSaved(false); sound.play('roomCard'); dialog.current?.showModal();
  };
  const close = () => { dialog.current?.close(); setSelected(null); };
  const write = (value: string) => { s.setMonthReview(month, noteKey, value); setSaved(false); };

  return <main className={`mg-home ${quiet || reduced ? 'mg-still' : ''}`} style={{ fontFamily: FONT }}>
    <div className="mg-world">
      <header className="mg-top">
        <button className="mg-logo" onClick={onExitGym} aria-label="Leave Mind Gym">Mind<span>Gym</span><small>A BRIGHTER<br />YOU INSIDE</small></button>
        <div className="mg-tools"><span className="mg-points"><span aria-hidden="true">⭐</span><span><b>{points}</b><small>choice points today</small></span></span>
          <button className="mg-month" onClick={onReflection} aria-label="Open My Inner Diary and browse months"><b>{new Date().toLocaleString('en', { month: 'short' }).toUpperCase()}</b><span>This month<small>{days} {days === 1 ? 'day' : 'days'} remembered</small><span aria-hidden="true">● ● ● ● ✦</span></span></button></div>
      </header>
      <div className="mg-mobile-doors"><button onClick={() => setMobile(mobile === 'feelings' ? null : 'feelings')} aria-expanded={mobile === 'feelings'}>Funny Feeling?<small>Step into your mind →</small></button><button onClick={() => setMobile(mobile === 'choices' ? null : 'choices')} aria-expanded={mobile === 'choices'}>My Good Choices<small>Open your seven rooms →</small></button></div>
      <section className={`mg-feelings ${mobile === 'feelings' ? 'mg-mobile-open' : ''}`} aria-label="Funny Feeling journey">
        <h1>Funny Feeling?</h1><h2>Step into your mind.</h2><p className="mg-invitation">A guided journey to understand<br />your feelings and feel better.</p>
        <ol className="mg-steps">{STEPS.map(([icon, title, sub], i) => <li key={icon}><img src={`${A}icon_${icon}.webp`} alt="" /><div><b>{i + 1}. {title}</b><span>{sub}</span></div></li>)}</ol>
        <button className="mg-start" onClick={() => { sound.play('enterRoom'); onDeepDive(); }}>Start My Journey <span aria-hidden="true">›</span></button>
      </section>
      <section className="mg-character" aria-label="Your guide">
        <div className="mg-greeting"><img src={`${A}boy_fullbody.webp`} alt="" /><div><b>Hello{name ? `, ${name}` : ''}!<br />How would you like<br />to begin today?</b><p>You can explore your feelings<br />or make good choices!</p></div></div>
        <div className="mg-boy-wrap"><img className="mg-boy" src={`${A}boy_fullbody.webp`} alt="Your red-cap explorer" /><img className="mg-chirpy" src={chirpySprite('curious')} alt="Chirpy" /><p className="mg-chirpy-line">I’m here<br />with you!<br />♡ Chirpy!</p></div>
      </section>
      <section className={`mg-choices ${mobile === 'choices' ? 'mg-mobile-open' : ''}`} aria-label="My Good Choices">
        <header className="mg-shelf-title"><span aria-hidden="true">☀</span><h2>My Good Choices</h2><p>Small choices. Big growth. A brighter you.</p></header>
        <GoodChoicesShelf onAction={open} onDiary={onReflection} />
      </section>
      <footer className="mg-safety"><button onClick={onExitGym}>‹ Back</button><button onClick={onGrownUp}>♡ Talk to a grown-up</button></footer>
    </div>
    <dialog className="mg-room-dialog" aria-labelledby="mg-room-title" ref={dialog} onClose={() => setSelected(null)} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      {room && behaviour && <><header><h2 id="mg-room-title">{behaviour.title}</h2><button onClick={close} aria-label="Close room">×</button></header>
        <nav aria-label="Room activities">{(['reflect', 'play', 'learn'] as const).map((item) => <button key={item} onClick={() => setMode(item)} aria-pressed={mode === item}>{item === 'reflect' ? 'My day' : item === 'play' ? 'Play' : 'Learn'}</button>)}</nav>
        {mode === 'reflect' && <><p>{behaviour.prompt}</p><div className="mg-day-options"><button aria-pressed={!!s.completions[today]?.[room.id]} onClick={() => s.setBehaviourOn(today, room.id, true)}>Yes, I did</button><button aria-pressed={!s.completions[today]?.[room.id]} onClick={() => s.setBehaviourOn(today, room.id, false)}>Not today</button></div><label htmlFor="mg-home-note">Something to remember (if you like)</label><textarea id="mg-home-note" value={note} onChange={(e) => write(e.target.value)} rows={3} /><MicButton onText={(text) => write(note ? `${note} ${text}` : text)} /><button className="mg-save" onClick={() => setSaved(true)}>{saved ? 'Saved in your diary' : 'Save my thought'}</button><p role="status">{saved ? 'Your thought is saved on this device.' : 'You can stop whenever you like.'}</p></>}
        {mode === 'learn' && <><h3>{room.learn.title}</h3><p>{room.learn.body}</p><button className="mg-save" onClick={() => { close(); onOpenRoom(room); }}>Explore this room →</button></>}
        {mode === 'play' && (game ? <RoomGamePlayer key={game.id} game={game} accent="#ffe099" onDone={(earned) => { const marker = `home:${game.id}`; if (!(s.scenariosDone[today] ?? []).includes(marker)) { s.completeScenario(marker); s.awardPoints(earned, room.id); } setMode('reflect'); }} /> : <button className="mg-save" onClick={() => { close(); onOpenRoom(room); }}>Enter the {behaviour.title} activity →</button>)}
        <button className="mg-dialog-grownup" onClick={() => { close(); onGrownUp(); }}>Talk to a grown-up</button>
      </>}
    </dialog>
  </main>;
}
