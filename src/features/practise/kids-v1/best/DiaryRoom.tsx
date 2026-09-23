import { useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useKidStore } from '../../../kids/store';
import { BEHAVIOURS } from '../../../kids/data';
import { FONT } from '../ui/chrome';
import { useQuiet } from '../ui/quiet';
import { MicButton } from '../ui/MicButton';
import { HearYourself } from '../ui/HearYourself';
import { DoorHandle } from '../ui/DoorHandle';
import { allLinks, linkClip } from '../kit/voiceStore';
import * as sound from '../kit/sound';
import { band } from '../kit/band';
import './DiaryRoom.css';

/*
  MY INNER DIARY, drawn against approved_reference_diary.png.

  One month at a time: a dot for every day against each of the seven good
  choices, four things to look back on, and the month put away at the end. The
  grid is the same data the rest of the gym writes — tapping a dot here is the
  same act as ticking that choice on the day, so a child can fill a day in
  late without the app pretending they did it today.
*/

/** The seven rows, in the sheet's order, each with the colour it is drawn in. */
const ROWS = [
  { id: 'kind', icon: '❤️', dot: '#ff5f8f' },
  { id: 'truth', icon: '🔎', dot: '#4a9cf0' },
  { id: 'choices', icon: '🛡️', dot: '#4fc07a' },
  { id: 'include', icon: '🌈', dot: '#a56ef0' },
  { id: 'body', icon: '🍎', dot: '#ff7fae' },
  { id: 'help', icon: '🤝', dot: '#f7b23b' },
  { id: 'mindheart', icon: '⭐', dot: '#8b6ef0' },
];

/*
  THE FOUR THINGS TO LOOK BACK ON, in two wordings.

  The sheet's own four are the older set. A six-year-old asked "what did I
  learn about myself this month" gives you a blank look and a blank box, so the
  younger band gets the same four questions in words a six-year-old answers —
  see kit/band for why the app knows which to use, and note that the ANSWERS
  are stored under the same four keys either way, so a child who has a birthday
  mid-year keeps everything they have written.
*/
const QUESTIONS = {
  older: [
    { key: 'learned', icon: '💗', q: 'What did I learn about myself this month?' },
    { key: 'proud', icon: '☁️', q: 'What made me feel proud?' },
    { key: 'hard', icon: '☀️', q: 'What was difficult? What can I do next time?' },
    { key: 'next', icon: '🌱', q: 'What are my goals for next month?' },
  ],
  young: [
    { key: 'learned', icon: '💗', q: 'What did you find out about you?' },
    { key: 'proud', icon: '☁️', q: 'What are you proud of?' },
    { key: 'hard', icon: '☀️', q: 'What was tricky? What could you try?' },
    { key: 'next', icon: '🌱', q: 'What do you want to do next month?' },
  ],
};

const CHIPS = [
  { icon: '❤️', text: 'Be kind to yourself' },
  { icon: '🎧', text: 'Listen to your heart' },
  { icon: '✅', text: 'Do your best' },
  { icon: '⭐', text: 'Learn from mistakes' },
  { icon: '💗', text: 'Be grateful always' },
  { icon: '👥', text: 'Everyone is my teacher' },
  { icon: '🌱', text: 'I create my own path' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const dayKey = (d: Date, day: number) => `${monthKey(d)}-${String(day).padStart(2, '0')}`;
const daysIn = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const shift = (d: Date, by: number) => new Date(d.getFullYear(), d.getMonth() + by, 1);

export function DiaryRoom({ onExit, onOlder }: { onExit: () => void; onOlder: () => void }) {
  const s = useKidStore();
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const today = new Date();
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [clips, setClips] = useState(allLinks);
  const [selectedDay, setSelectedDay] = useState<{ day: number; behaviour: string } | null>(null);
  const dayDialog = useRef<HTMLDialogElement>(null);
  /*
    THE MONTH LIVES IN THE BOOK.

    Seven rows of thirty-one dots is a spreadsheet, and it read as one: a child
    opening their own diary met a grid before they met anything else. It is the
    same grid — same rows, same taps, same data — but it now comes OUT of the
    book on the page, one day at a time, and goes back into it when shut.

    `flight` is bumped on every open and on every month change so the stagger
    replays; it keys the grid, which is what makes React mount a fresh set of
    dots rather than re-using the ones already sitting still.
  */
  const [bookOpen, setBookOpen] = useState(true);
  const [flight, setFlight] = useState(0);
  const questions = QUESTIONS[band() === 'young' ? 'young' : 'older'];

  const key = monthKey(month);
  const total = daysIn(month);
  const days = useMemo(() => Array.from({ length: total }, (_, i) => i + 1), [total]);
  const review = s.monthReviews[key] ?? {};
  const thisMonth = key === monthKey(today);

  const done = (day: number, id: string) => !!s.completions[dayKey(month, day)]?.[id];
  const tally = (id: string) => days.reduce((n, day) => n + (done(day, id) ? 1 : 0), 0);
  const toggle = (day: number, id: string) => {
    /* You cannot have done something on a day that has not happened yet. */
    if (thisMonth && day > today.getDate()) return;
    const on = done(day, id);
    s.setBehaviourOn(dayKey(month, day), id, !on);
    setSaved(false); setSaveError('');
    if (!quiet) sound.play(on ? 'tap' : 'discovery');
  };
  const go = (by: number) => {
    const next = shift(month, by);
    if (next > new Date(today.getFullYear(), today.getMonth(), 1)) return;
    setMonth(next); setSaved(false); setFlight(f => f + 1);
    if (!quiet) sound.play('exitRoom');
  };
  const write = (k: string, value: string) => { s.setMonthReview(key, k, value); setSaved(false); setSaveError(''); };
  const keep = () => {
    try {
      // Retry the existing store's persistence without creating a second diary.
      s.setMonthReview(key, 'learned', review.learned ?? '');
      const stored = JSON.parse(localStorage.getItem('my-best-every-day') ?? '{}').state;
      const current = useKidStore.getState();
      if (!stored || JSON.stringify(stored.monthReviews?.[key]) !== JSON.stringify(current.monthReviews[key]) ||
        days.some(day => JSON.stringify(stored.completions?.[dayKey(month, day)] ?? {}) !== JSON.stringify(current.completions[dayKey(month, day)] ?? {}))) {
        throw new Error('Diary could not be persisted');
      }
      setSaved(true); setSaveError('');
      if (!quiet) sound.play('resolve');
    } catch {
      setSaved(false);
      setSaveError('Your words are still here, but this device could not save them. Keep this page open and ask a grown-up for help.');
    }
  };

  /* The three months behind this one, as the spines on the shelf. */
  const behind = [1, 2, 3].map(n => shift(month, -n));

  return <motion.main
    initial={still ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6 }}
    className={`dy-room ${still ? 'dy-still' : ''}`} style={{ fontFamily: FONT }}
  >
    <DoorHandle side="left" label="Back to Mind Gym" onClick={onExit} accent="#ff5f8f" />
    <div className="dy-page">
      <header className="dy-top">
        {/* The friend leaning on her books, from the sheet's own art. */}
        <div className="dy-friend" aria-hidden="true">
          <img className="dy-bust" src="/mind-gym/diary/character-bust.webp" alt="" />
          <img className="dy-books" src="/mind-gym/diary/book-stack-star-friend.webp" alt="" />
        </div>

        <div className="dy-title">
          <h1>My Inner Diary</h1>
          <p><span aria-hidden="true">⭐</span>{FULL[month.getMonth()]} {month.getFullYear()}<span aria-hidden="true">⭐</span></p>
        </div>

        <div className="dy-months">
          <button className="dy-arrow" onClick={() => go(-1)} aria-label="Earlier month">‹</button>
          <ol>
            <li className="dy-month-now"><span><i aria-hidden="true">★</i><b>{MONTHS[month.getMonth()]}</b><small>{month.getFullYear()}</small></span></li>
            {behind.map(d => <li key={monthKey(d)}><button onClick={() => { setMonth(d); setSaved(false); setFlight(f => f + 1); if (!quiet) sound.play('exitRoom'); }}><b>{MONTHS[d.getMonth()]}</b><small>{d.getFullYear()}</small></button></li>)}
          </ol>
          <button className="dy-arrow" onClick={() => go(1)} aria-label="Later month" disabled={thisMonth}>›</button>
          <p className="dy-tagline" aria-hidden="true">Small steps<br />make a brighter you <span>♡</span></p>
        </div>
      </header>

      <section className={`dy-grid-panel ${bookOpen ? 'dy-book-open' : 'dy-book-shut'}`} aria-label={`Good choices in ${MONTHS[month.getMonth()]} ${month.getFullYear()}`}>
        {/*
          THE BOOK IS THE SWITCH, and it is a real one rather than a picture
          with a button next to it — the whole thing is the control, because a
          shut book that cannot be opened by pressing it is a lie a child
          notices immediately.
        */}
        <button
          type="button"
          className="dy-book"
          aria-expanded={bookOpen}
          aria-controls="dy-month-grid"
          onClick={() => {
            const next = !bookOpen;
            setBookOpen(next);
            if (next) setFlight(f => f + 1);
            if (!quiet) sound.play(next ? 'discovery' : 'exitRoom');
          }}
        >
          <img src="/mind-gym/reflection/open_magic_book.png" alt="" aria-hidden="true"
            onError={e => { e.currentTarget.style.display = 'none'; }} />
          <span className="dy-book-label">
            {bookOpen ? 'Close the month' : `Open ${FULL[month.getMonth()]}`}
          </span>
          <span className="dy-book-sparks" aria-hidden="true" />
        </button>

        <div id="dy-month-grid" key={flight} className="dy-grid" hidden={!bookOpen} style={{ ['--dy-days' as string]: total }}>
          <div className="dy-row dy-head-row">
            <span className="dy-row-name">Day</span>
            {days.map(day => <span key={day} className="dy-daynum">{day}</span>)}
            <span />
          </div>
          {ROWS.map(row => {
            const b = BEHAVIOURS.find(x => x.id === row.id);
            return <div key={row.id} className="dy-row" style={{ ['--dot' as string]: row.dot }}>
              <span className="dy-row-name"><span className="dy-row-icon" aria-hidden="true">{row.icon}</span>{b?.title ?? row.id}</span>
              {days.map(day => {
                const ahead = thisMonth && day > today.getDate();
                const isToday = thisMonth && day === today.getDate();
                return <button
                  key={day}
                  className={`dy-dot ${done(day, row.id) ? 'dy-on' : ''} ${isToday ? 'dy-today' : ''}`}
                  style={{ ['--dy-delay' as string]: `${(day * 9) + (ROWS.findIndex(r => r.id === row.id) * 34)}ms` }}
                  disabled={ahead}
                  onClick={() => { setSelectedDay({ day, behaviour: row.id }); dayDialog.current?.showModal(); }}
                  aria-pressed={done(day, row.id)}
                  aria-label={`${b?.title ?? row.id}, ${FULL[month.getMonth()]} ${day}, ${month.getFullYear()}. Open diary day`}
                  aria-haspopup="dialog"
                >{isToday && row.id === 'kind' && <span aria-hidden="true">★</span>}</button>;
              })}
              <span className="dy-tally">{tally(row.id)}</span>
            </div>;
          })}
        </div>
        {bookOpen && <p className="dy-grid-foot"><span aria-hidden="true">✨</span>Tap a day to remember a choice or read your words. Blank days are okay.<span aria-hidden="true">✨</span></p>}
      </section>

      <section className="dy-learn" aria-label="Look Back &amp; Learn">
        {/* The crystal the four lanterns rise out of. Scenery — the cards
            below are the controls, and there is nothing here to press. */}
        <img className="dy-crystal" src="/mind-gym/reflection/crystal_cluster.png" alt="" aria-hidden="true"
          onError={e => { e.currentTarget.style.display = 'none'; }} />
        <h2><span aria-hidden="true">✦</span>Look Back &amp; Learn<span aria-hidden="true">✦</span></h2>
        <p className="dy-learn-sub">Your thoughts matter. Be honest, be you. <span aria-hidden="true">💜</span></p>
        <div className="dy-cards">
          {questions.map((q, qi) => <div key={`${key}:${q.key}`} className="dy-card"
            style={{ ['--dy-lantern' as string]: `${qi * 130}ms` }}>
            <label htmlFor={`dy-${q.key}`}><span className="dy-card-icon" aria-hidden="true">{q.icon}</span>{q.q}</label>
            <textarea id={`dy-${q.key}`} rows={2} placeholder="Write your thoughts…" value={review[q.key] ?? ''} onChange={e => write(q.key, e.target.value)} />
            <MicButton className="dy-card-mic" accent="#663398" onText={text => write(q.key, review[q.key] ? `${review[q.key]} ${text}` : text)} onVoice={clip => {
              const voiceKey = `${key}:${q.key}`;
              linkClip(voiceKey, clip); setClips(allLinks()); setSaved(false);
            }} />
            <HearYourself clipId={clips[`${key}:${q.key}`] ?? null} accent="#663398" />
          </div>)}
        </div>
      </section>

      <ul className="dy-chips" aria-label="Things worth remembering">
        {CHIPS.map(chip => <li key={chip.text}><span aria-hidden="true">{chip.icon}</span>{chip.text}</li>)}
      </ul>

      <footer className="dy-foot">
        <button className="dy-save" onClick={keep} disabled={saved}>
          <span aria-hidden="true">✦ 📖</span>{saved ? 'This month is kept' : 'Save This Month'}<span aria-hidden="true">→</span>
        </button>
        <button className="dy-older" onClick={onOlder}>My pictures &amp; saved cases →</button>
      </footer>
      <p className="dy-note" role="status">{saveError || (saved ? 'Kept on this device. You can keep adding to it whenever you like.' : '')}</p>
    </div>
    <dialog ref={dayDialog} className="dy-day-dialog" aria-labelledby="dy-day-heading" onClose={() => setSelectedDay(null)}>
      {selectedDay && <>
        <header><h2 id="dy-day-heading">{FULL[month.getMonth()]} {selectedDay.day}, {month.getFullYear()}</h2><button autoFocus aria-label="Close diary day" onClick={() => dayDialog.current?.close()}>×</button></header>
        <p>Remember a small choice. You can change your mind.</p>
        <div className="dy-day-choices">{BEHAVIOURS.map(b => <button key={b.id} aria-pressed={done(selectedDay.day, b.id)} onClick={() => toggle(selectedDay.day, b.id)}>
          {b.icon} {b.title} {done(selectedDay.day, b.id) ? '✓' : ''}
        </button>)}</div>
        <label htmlFor="dy-day-behaviour">A thought about</label>
        <select id="dy-day-behaviour" value={selectedDay.behaviour} onChange={e => setSelectedDay({ ...selectedDay, behaviour: e.target.value })}>
          {BEHAVIOURS.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
        </select>
        <label htmlFor="dy-day-words">My words</label>
        <textarea id="dy-day-words" rows={4} value={review[`${dayKey(month, selectedDay.day)}:${selectedDay.behaviour}`] ?? ''} onChange={e => write(`${dayKey(month, selectedDay.day)}:${selectedDay.behaviour}`, e.target.value)} />
        <button onClick={() => dayDialog.current?.close()}>Back to my diary</button>
      </>}
    </dialog>
  </motion.main>;
}
