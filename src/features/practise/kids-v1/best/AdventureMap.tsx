import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useKidStore } from '../../../kids/store';
import { todayKey } from '../../../kids/data';
import {
  CORNER_ITEM_BY_ID, adventureForWeek, chapterOpen, dayDate, weekStartKey, weekdayIndex, withName, type Adventure,
} from '../../../kids/delight';
import { useQuiet } from '../ui/quiet';
import { FONT } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { chirpySprite } from '../ui/sprites';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import * as sound from '../kit/sound';
import { BadgeSlot } from './ChildBadge';
import './AdventureMap.css';

/*
  THE STORY MAP — one story a week, told in seven chapters, one opening each
  morning on a stepping stone across a map.

  A chapter that has opened stays open for the rest of the week, so a child
  who comes on Thursday finds four chapters waiting rather than three missed.
  Every chapter ends looking at tomorrow's title, which is the whole of the
  pull: a story you want to know the end of.
*/

const EMPTY: number[] = [];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Layout { w: number; h: number; stones: Array<[number, number]>; path: string }

const WIDE: Layout = {
  w: 1000, h: 560,
  stones: [[118, 462], [252, 392], [392, 440], [522, 346], [652, 262], [790, 304], [900, 170]],
  path: 'M60 500 C 120 480, 190 400, 252 392 S 340 466, 392 440 S 470 340, 522 346 S 612 282, 652 262 S 744 330, 790 304 S 860 210, 900 170',
};
const TALL: Layout = {
  w: 560, h: 1000,
  stones: [[150, 900], [380, 800], [180, 680], [400, 560], [170, 440], [390, 320], [250, 170]],
  path: 'M90 960 C 120 930, 130 910, 150 900 S 330 840, 380 800 S 230 720, 180 680 S 360 600, 400 560 S 220 480, 170 440 S 350 360, 390 320 S 300 200, 250 170',
};

function weekdayOf(week: string, i: number): string {
  const d = dayDate(week);
  d.setDate(d.getDate() + i);
  return d.toLocaleDateString('en', { weekday: 'long' });
}

function useTall(): boolean {
  const [tall, setTall] = useState(() => typeof window !== 'undefined' && window.innerWidth < 700);
  useEffect(() => {
    const q = window.matchMedia('(max-width: 699px)');
    const sync = () => setTall(q.matches);
    sync();
    q.addEventListener('change', sync);
    return () => q.removeEventListener('change', sync);
  }, []);
  return tall;
}

/** Scenery that does not depend on the week: the land the path crosses. */
function Land({ tall }: { tall: boolean }) {
  if (tall) {
    return <g>
      <path d="M0 860 C 120 820, 260 880, 560 830 L 560 1000 L 0 1000 Z" fill="#cfe8a8" opacity=".8" />
      <path d="M0 600 C 140 640, 300 560, 560 620" stroke="#8ec8ff" strokeWidth="26" fill="none" opacity=".8" strokeLinecap="round" />
      <rect x="250" y="566" width="80" height="16" rx="5" fill="#b07a3a" transform="rotate(-6 290 574)" />
      <path d="M20 170 L 90 60 L 160 170 Z M120 170 L 200 40 L 280 170 Z" fill="#b9a7e6" opacity=".85" />
      <path d="M180 66 L 200 40 L 220 66 Z" fill="#ffffff" />
      {[[470, 900], [60, 760], [500, 680], [40, 470], [500, 420]].map(([x, y], i) => <g key={i}>
        <rect x={x - 4} y={y} width="8" height="22" rx="3" fill="#8a5a33" /><circle cx={x} cy={y - 6} r="20" fill="#8fd67c" /><circle cx={x - 6} cy={y - 12} r="8" fill="#b6ec9e" />
      </g>)}
    </g>;
  }
  return <g>
    <path d="M0 560 L 0 500 C 70 462, 150 448, 230 486 C 300 516, 360 470, 450 498 C 500 512, 530 534, 560 560 Z" fill="#cfe8a8" opacity=".8" />
    <path d="M560 30 C 600 160, 540 280, 600 400 S 620 520, 590 560" stroke="#8ec8ff" strokeWidth="26" fill="none" opacity=".8" strokeLinecap="round" />
    <rect x="556" y="296" width="80" height="16" rx="5" fill="#b07a3a" transform="rotate(-28 596 304)" />
    <path d="M700 150 L 790 30 L 880 150 Z M820 150 L 900 50 L 980 150 Z" fill="#b9a7e6" opacity=".85" />
    <path d="M770 56 L 790 30 L 810 56 Z M884 70 L 900 50 L 916 70 Z" fill="#ffffff" />
    {[[180, 300], [320, 260], [430, 540], [720, 470], [860, 420], [90, 180]].map(([x, y], i) => <g key={i}>
      <rect x={x - 4} y={y} width="8" height="22" rx="3" fill="#8a5a33" /><circle cx={x} cy={y - 6} r="20" fill="#8fd67c" /><circle cx={x - 6} cy={y - 12} r="8" fill="#b6ec9e" />
    </g>)}
    <g transform="translate(80 80)" opacity=".7">
      <circle r="34" fill="none" stroke="#b07a3a" strokeWidth="2" />
      <path d="M0 -40 L 7 0 L 0 40 L -7 0 Z" fill="#c0504a" /><path d="M-40 0 L 0 7 L 40 0 L 0 -7 Z" fill="#b07a3a" />
      <text y="-46" textAnchor="middle" fontSize="16" fontWeight="900" fill="#8a5a33">N</text>
    </g>
  </g>;
}

/* ── Reading a chapter ────────────────────────────────────────────────────── */

type Finish = { firstTime: boolean; finished: boolean; seed: boolean };

function Reader({ story, chapter, name, onClose, onNext, onCorner, still }: {
  story: Adventure; chapter: number; name: string; onClose: () => void; onNext: (() => void) | null; onCorner: () => void; still: boolean;
}) {
  const quiet = useQuiet();
  const ch = story.chapters[chapter];
  const [page, setPage] = useState(0);
  const [done, setDone] = useState<Finish | null>(null);
  const text = withName(ch.pages[page].text, name);
  const last = page === ch.pages.length - 1;
  const nextTitle = story.chapters[chapter + 1]?.title;
  const keepsake = CORNER_ITEM_BY_ID[story.keepsake];

  useEffect(() => { if (!done) speak(text, quiet, 'storyteller'); }, [text, done, quiet]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const turn = (by: number) => { if (!quiet) sound.play('panelSlide'); setPage((p) => p + by); };
  const finish = () => {
    const before = useKidStore.getState().plants.length;
    const result = useKidStore.getState().readChapter(weekStartKey(todayKey()), chapter, story.id, ch.title);
    const seed = useKidStore.getState().plants.length > before;
    setDone({ ...result, seed });
    if (!quiet) sound.play(result.finished ? 'levelUp' : 'resolve');
    speak(result.finished
      ? `You finished the whole story! ${keepsake?.name ?? 'A keepsake'} is waiting in your corner.`
      : nextTitle ? `The end of chapter ${chapter + 1}. Next time: ${nextTitle}.` : `The end of chapter ${chapter + 1}.`, quiet, 'storyteller');
  };

  return (
    <motion.div className="am-veil" style={{ fontFamily: FONT }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: still ? .1 : .3 }}>
      <motion.div className={`am-book ${done ? 'is-done' : ''}`} role="dialog" aria-modal="true" aria-label={`Chapter ${chapter + 1}: ${ch.title}`}
        style={{ '--story': story.color } as CSSProperties}
        initial={still ? false : { scale: .92, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}>
        <button className="am-close" onClick={onClose} aria-label="Close the book">✕</button>
        {!done ? <>
          <div className="am-page am-page-art">
            <AnimatePresence mode="wait">
              <motion.div key={page} className="am-scene" aria-hidden="true"
                initial={still ? false : { opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <span>{ch.pages[page].scene}</span>
              </motion.div>
            </AnimatePresence>
            <span className="am-sparkle am-sparkle-a" aria-hidden="true">✦</span>
            <span className="am-sparkle am-sparkle-b" aria-hidden="true">✧</span>
          </div>
          <div className="am-page am-page-text">
            <small>{story.title}</small>
            <h2>Chapter {chapter + 1}: {ch.title}</h2>
            <AnimatePresence mode="wait">
              <motion.p key={page} className="am-text" aria-live="polite"
                initial={still ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>{text}</motion.p>
            </AnimatePresence>
            <div className="am-turns">
              <button className="am-again" onClick={() => speak(text, quiet, 'storyteller')} aria-label="Read this page to me again">🔊</button>
              <span className="am-dots" aria-label={`Page ${page + 1} of ${ch.pages.length}`}>
                {ch.pages.map((_, i) => <i key={i} className={i === page ? 'is-on' : ''} />)}
              </span>
              {page > 0 && <button className="am-turn" onClick={() => turn(-1)}>◀ Back</button>}
              {last
                ? <button className="am-turn am-turn-go" onClick={finish}>The end ★</button>
                : <button className="am-turn am-turn-go" onClick={() => turn(1)} autoFocus>Next ▶</button>}
            </div>
          </div>
        </> : (
          <div className="am-end">
            {done.finished && keepsake ? <>
              <img className="am-keepsake" src={keepsake.src} alt="" />
              <h2>You finished the whole story!</h2>
              <p><b>{keepsake.name}</b> is waiting for you in your corner of the treehouse.</p>
            </> : <>
              <span className="am-end-cover" aria-hidden="true">{story.cover}</span>
              <h2>The end of Chapter {chapter + 1}!</h2>
              {nextTitle && <p className="am-next">Next: <b>Chapter {chapter + 2}, {nextTitle}</b></p>}
            </>}
            {done.firstTime && <p className="am-chips">
              <span>⭐ +10 Mind Stars</span>
              {done.seed && <span>🌱 A seed for your garden</span>}
            </p>}
            <div className="am-end-actions">
              {done.finished
                ? <button className="am-turn am-turn-go" onClick={onCorner}>Visit My Corner →</button>
                : onNext
                  ? <button className="am-turn am-turn-go" onClick={onNext}>Read Chapter {chapter + 2} ▶</button>
                  : nextTitle && <span className="am-tomorrow">It opens tomorrow. See you then!</span>}
              <button className="am-turn" onClick={onClose}>Back to the map</button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── The map ──────────────────────────────────────────────────────────────── */

export function AdventureMap({ onExit, onGrownUp, onCorner }: { onExit: () => void; onGrownUp: () => void; onCorner: () => void }) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const today = todayKey();
  const week = weekStartKey(today);
  const story = adventureForWeek(week);
  const read = useKidStore((s) => s.chaptersRead[week] ?? EMPTY);
  const name = useKidStore((s) => s.name);
  const kid = name && name !== 'Explorer' ? name : '';
  const tall = useTall();
  const layout = tall ? TALL : WIDE;
  const todayIdx = weekdayIndex(today);
  const next = story.chapters.findIndex((_, i) => chapterOpen(i, today) && !read.includes(i));
  const keepsake = CORNER_ITEM_BY_ID[story.keepsake];
  const [reading, setReading] = useState<number | null>(null);
  const [note, setNote] = useState(next >= 0
    ? `Chapter ${next + 1} is ready! Tap the glowing stone.`
    : read.length >= 7 ? 'You read the whole story this week! A new one starts on Monday.' : `Chapter ${todayIdx + 2} opens tomorrow.`);

  const tap = (i: number) => {
    if (!chapterOpen(i, today)) {
      if (!quiet) sound.play('tapHit');
      setNote(`Chapter ${i + 1} opens on ${weekdayOf(week, i)}. Come back then!`);
      return;
    }
    if (!quiet) sound.play('roomCard');
    setReading(i);
  };
  const close = () => {
    stopSpeaking();
    setReading(null);
    const nowRead = useKidStore.getState().chaptersRead[week] ?? [];
    const after = story.chapters.findIndex((_, i) => chapterOpen(i, today) && !nowRead.includes(i));
    setNote(after >= 0 ? `Chapter ${after + 1} is ready when you are!`
      : nowRead.length >= 7 ? 'You read the whole story this week! A new one starts on Monday.'
      : 'All caught up! The next chapter opens tomorrow.');
  };
  const chirpyAt = layout.stones[next >= 0 ? next : Math.min(todayIdx, 6)];

  return (
    <main className={`am-room ${still ? 'am-still' : ''}`} style={{ fontFamily: FONT, '--story': story.color } as CSSProperties}>
      <DoorHandle side="left" label="Mind Gym" onClick={onExit} accent={story.color} scale={0.4} bottomVh={62} />
      <header className="am-head">
        <h1>Story Map <span aria-hidden="true">{story.cover}</span></h1>
        <p>This week: <b>{story.title}</b></p>
      </header>
      <div className="am-top">
        <BadgeSlot />
        <span className="am-count">{read.length} of 7 read</span>
        <button className="am-grownup chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </div>

      <div className="am-map-wrap">
        <svg className="am-map" viewBox={`0 0 ${layout.w} ${layout.h}`} role="group" aria-label={`Map of ${story.title}`}>
          <defs>
            <linearGradient id="am-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6dc" /><stop offset="1" stopColor="#ecd09a" /></linearGradient>
            <radialGradient id="am-vignette" cx=".5" cy=".5" r=".75"><stop offset=".6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#7a4a1f" stopOpacity=".35" /></radialGradient>
            <radialGradient id="am-gold" cx=".38" cy=".32" r=".8"><stop offset="0" stopColor="#fff6c8" /><stop offset="1" stopColor="#f0a12c" /></radialGradient>
            <radialGradient id="am-open" cx=".38" cy=".32" r=".8"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#e9dcff" /></radialGradient>
            <clipPath id="am-paper-clip"><rect x="12" y="12" width={layout.w - 24} height={layout.h - 24} rx="22" /></clipPath>
          </defs>
          <rect x="8" y="8" width={layout.w - 16} height={layout.h - 16} rx="26" fill="url(#am-paper)" stroke="#c49a5a" strokeWidth="5" />
          <rect x="8" y="8" width={layout.w - 16} height={layout.h - 16} rx="26" fill="url(#am-vignette)" />
          <g clipPath="url(#am-paper-clip)"><Land tall={tall} /></g>
          <path d={layout.path} fill="none" stroke="#a8743f" strokeWidth="7" strokeDasharray="2 16" strokeLinecap="round" />
          <text x={layout.stones[6][0]} y={layout.stones[6][1] - (tall ? 70 : 60)} textAnchor="middle" fontSize={tall ? 76 : 64} className="am-goal">{story.cover}</text>
          {layout.stones.map(([x, y], i) => {
            const isRead = read.includes(i);
            const isOpen = chapterOpen(i, today);
            const state = isRead ? 'read' : isOpen ? 'open' : 'locked';
            return (
              <g key={i} className={`am-stone is-${state} ${i === next ? 'is-next' : ''}`} transform={`translate(${x} ${y})`}
                role="button" tabIndex={0}
                aria-label={isRead ? `Chapter ${i + 1}, ${story.chapters[i].title}. Read. Tap to read it again.`
                  : isOpen ? `Chapter ${i + 1}, ${story.chapters[i].title}. Ready to read.` : `Chapter ${i + 1} opens on ${weekdayOf(week, i)}.`}
                onClick={() => tap(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(i); } }}>
                {i === next && <circle className="am-halo" r="52" fill={story.color} opacity=".35" />}
                <ellipse cx="0" cy="30" rx="34" ry="9" fill="#7a4a1f" opacity=".25" />
                <circle r="34" fill={isRead ? 'url(#am-gold)' : isOpen ? 'url(#am-open)' : '#d8c49a'} stroke={isRead ? '#c98a12' : isOpen ? story.color : '#b8a070'} strokeWidth="5" />
                <text y={isRead ? 11 : 10} textAnchor="middle" fontSize={isRead ? 32 : 28} fontWeight="900" fill={isRead ? '#8a4a00' : isOpen ? '#4a2c79' : '#9a8460'}>
                  {isRead ? '★' : isOpen ? i + 1 : '🔒'}
                </text>
                <text y="62" textAnchor="middle" fontSize="20" fontWeight="900" fill={i === todayIdx ? '#c0504a' : '#8a5a33'}>
                  {i === todayIdx ? 'Today' : DAYS[i]}
                </text>
              </g>
            );
          })}
          <image href={chirpySprite(read.length >= 7 ? 'excited' : 'curious')} x={chirpyAt[0] - (tall ? 120 : 108)} y={chirpyAt[1] - 96}
            width="78" height="78" className="am-chirpy" />
        </svg>
      </div>

      <div className="am-foot">
        <p className="am-note" aria-live="polite">{note}</p>
        {keepsake && (
          <p className="am-keep">
            <img src={keepsake.src} alt="" />
            <span>Read all 7 chapters to win <b>{keepsake.name}</b> for your corner</span>
          </p>
        )}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {reading !== null && (
            <Reader key={reading} story={story} chapter={reading} name={kid} still={still}
              onClose={close}
              onCorner={() => { stopSpeaking(); setReading(null); onCorner(); }}
              onNext={reading < 6 && chapterOpen(reading + 1, today) ? () => setReading(reading + 1) : null} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </main>
  );
}
