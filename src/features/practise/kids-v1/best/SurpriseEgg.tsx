import { useEffect, useId, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useKidStore } from '../../../kids/store';
import { todayKey } from '../../../kids/data';
import { STICKER_BY_ID } from '../../../kids/stickers';
import { EGG_FRIEND_BY_ID, JOKES, eggLook, isGoldenEgg, type EggPrize } from '../../../kids/delight';
import { useQuiet } from '../ui/quiet';
import { FONT } from '../ui/chrome';
import { chirpySprite } from '../ui/sprites';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import * as sound from '../kit/sound';
import { StickerArt } from './Stickers';
import './SurpriseEgg.css';

/*
  CHIRPY'S SURPRISE EGG.

  One egg a day, a different colour every morning, sitting in a nest on the
  home-page floor. It stays warm and still until the child has done one thing
  today — a game, a story, a diary page, a few calm breaths — and then it
  starts to wobble. Three taps crack it open.

  Missing a day costs nothing: the egg just waits. The point is a small,
  certain surprise for showing up, not a streak to protect.
*/

const EGG = 'M50 4 C 76 4, 92 44, 92 72 C 92 100, 72 116, 50 116 C 28 116, 8 100, 8 72 C 8 44, 24 4, 50 4 Z';
const TOP = 'M8 64 C 8 44, 24 4, 50 4 C 76 4, 92 44, 92 64 L 82 56 L 72 66 L 62 56 L 50 66 L 38 56 L 28 66 L 18 56 Z';
const BOTTOM = 'M8 64 L 18 56 L 28 66 L 38 56 L 50 66 L 62 56 L 72 66 L 82 56 L 92 64 C 92 100, 72 116, 50 116 C 28 116, 8 100, 8 64 Z';
const CRACKS = [
  'M46 30 L 52 40 L 45 48 L 53 56',
  'M53 56 L 62 60 L 70 54 M45 48 L 36 52 L 30 46',
  'M70 54 L 80 62 L 88 58 M30 46 L 20 56 L 12 60',
];

export function EggArt({ day, golden, crack = 0, open = false, peek }: {
  day: string; golden: boolean; crack?: number; open?: boolean; peek?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const look = eggLook(day, golden);
  const shell = `url(#e${uid})`;
  const spots = <g fill={look.spots} opacity={golden ? .7 : .55}>
    <ellipse cx="34" cy="40" rx="5" ry="3.6" /><ellipse cx="66" cy="32" rx="3.6" ry="2.6" /><ellipse cx="72" cy="78" rx="6" ry="4.2" />
    <ellipse cx="28" cy="86" rx="4" ry="3" /><ellipse cx="52" cy="96" rx="3.4" ry="2.4" /><ellipse cx="56" cy="58" rx="2.6" ry="2" />
  </g>;
  return (
    <svg className="egg-svg" viewBox="0 0 100 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`e${uid}`} cx=".36" cy=".3" r=".85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".25" stopColor={look.shell[0]} />
          <stop offset="1" stopColor={look.shell[1]} />
        </radialGradient>
        <clipPath id={`k${uid}`}><path d={EGG} /></clipPath>
        <clipPath id={`t${uid}`}><path d={TOP} /></clipPath>
        <clipPath id={`b${uid}`}><path d={BOTTOM} /></clipPath>
      </defs>
      {open ? <>
        {peek && <text x="50" y="84" textAnchor="middle" fontSize="44" className="egg-peek">{peek}</text>}
        <g clipPath={`url(#b${uid})`}>
          <path d={EGG} fill={shell} />
          {spots}
        </g>
        <path d={BOTTOM} fill="none" stroke="#ffffff99" strokeWidth="1.4" />
        <g className="egg-lid" clipPath={`url(#t${uid})`} transform="translate(-14 -30) rotate(-28 50 40)">
          <path d={EGG} fill={shell} />
          {spots}
        </g>
      </> : <>
        <path d={EGG} fill={shell} />
        <g clipPath={`url(#k${uid})`}>
          {spots}
          <ellipse cx="36" cy="30" rx="14" ry="20" fill="#fff" opacity=".45" transform="rotate(-24 36 30)" />
          {golden && <rect className="egg-shine" x="-30" y="-10" width="18" height="140" fill="#fff" opacity=".55" />}
        </g>
        {CRACKS.slice(0, crack).map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#5a3a2a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </>}
    </svg>
  );
}

/** A nest of woven twigs, drawn as a back half and a front lip so the egg sits down inside it. */
function Nest({ part }: { part: 'back' | 'front' }) {
  if (part === 'back') {
    return <svg className="egg-nest egg-nest-back" viewBox="0 0 160 70" aria-hidden="true" focusable="false">
      <ellipse cx="80" cy="34" rx="72" ry="24" fill="#4a2c18" />
      <ellipse cx="80" cy="32" rx="60" ry="17" fill="#2e190c" />
    </svg>;
  }
  const twigs = Array.from({ length: 11 }, (_, i) => {
    const x = 12 + i * 13;
    return <path key={i} d={`M${x} ${40 + (i % 3) * 3} C ${x + 14} ${30 + (i % 2) * 8}, ${x + 26} ${46 - (i % 3) * 4}, ${x + 34} ${38 + (i % 2) * 6}`}
      stroke={i % 2 ? '#c8935a' : '#a8743f'} strokeWidth="3.2" fill="none" strokeLinecap="round" />;
  });
  return <svg className="egg-nest egg-nest-front" viewBox="0 0 160 70" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="egg-nest-lip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b98250" /><stop offset="1" stopColor="#6b4222" /></linearGradient>
    </defs>
    <path d="M6 36 C 20 56, 140 56, 154 36 C 152 54, 132 66, 80 66 C 28 66, 8 54, 6 36 Z" fill="url(#egg-nest-lip)" />
    {twigs}
    <path d="M4 34 l -4 -6 M150 32 l 8 -7 M30 58 l -6 6 M128 60 l 7 5" stroke="#d9a868" strokeWidth="2.4" strokeLinecap="round" />
  </svg>;
}

/* ── The reveal ───────────────────────────────────────────────────────────── */

function prizeLine(prize: EggPrize, name: string): string {
  switch (prize.type) {
    case 'friend': {
      const f = EGG_FRIEND_BY_ID[prize.id];
      return `You hatched ${f.name}! ${f.line} ${f.name.split(' ')[0]} has moved into your corner of the treehouse.`;
    }
    case 'joke': return `${name ? `${name}, ` : ''}I have a joke for you! ${JOKES[prize.index][0]}`;
    case 'sticker': return `A rare sticker for your book: ${STICKER_BY_ID[prize.id]?.name ?? 'a surprise'}!`;
  }
}

function peekOf(prize: EggPrize | null): string | undefined {
  if (!prize) return undefined;
  if (prize.type === 'friend') return EGG_FRIEND_BY_ID[prize.id]?.emoji;
  if (prize.type === 'joke') return '😂';
  return STICKER_BY_ID[prize.id]?.glyph;
}

const BURST = Array.from({ length: 14 }, (_, i) => i);

function Hatch({ phase, crack, onCrack, prize, golden, onClose, onCorner, still }: {
  phase: 'crack' | 'reveal'; crack: number; onCrack: () => void; prize: EggPrize | null; golden: boolean;
  onClose: () => void; onCorner: () => void; still: boolean;
}) {
  const day = todayKey();
  const name = useKidStore((s) => s.name);
  const [punchline, setPunchline] = useState(false);
  const quiet = useQuiet();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const friend = prize?.type === 'friend' ? EGG_FRIEND_BY_ID[prize.id] : null;
  const joke = prize?.type === 'joke' ? JOKES[prize.index] : null;
  const sticker = prize?.type === 'sticker' ? STICKER_BY_ID[prize.id] : null;

  return (
    <motion.div className="egg-veil" style={{ fontFamily: FONT }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: still ? .1 : .3 }}
      onPointerDown={(e) => { if (e.target === e.currentTarget && phase === 'reveal') onClose(); }}>
      <div className="egg-stage" role="dialog" aria-modal="true" aria-label={phase === 'crack' ? 'Your surprise egg' : 'What was inside your egg'}>
        <button className="egg-close" onClick={onClose} aria-label="Close">✕</button>
        {phase === 'crack' ? (
          <>
            <p className="egg-title">{golden ? 'A golden egg!' : 'Your surprise egg!'}</p>
            <motion.button
              key={crack}
              className={`egg-big ${golden ? 'is-golden' : ''}`}
              onClick={onCrack}
              aria-label={`Tap to crack the egg. ${3 - crack} more ${3 - crack === 1 ? 'tap' : 'taps'}.`}
              initial={still ? false : { rotate: crack ? -8 : 0, scale: crack ? 1.06 : .6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: crack ? 7 : 14 }}
              autoFocus
            >
              <EggArt day={day} golden={golden} crack={crack} />
            </motion.button>
            <p className="egg-hint">{crack === 0 ? 'Tap the egg to crack it open!' : crack === 1 ? 'Crack! Keep tapping!' : 'One more tap…'}</p>
          </>
        ) : prize && (
          <motion.div className="egg-reveal"
            initial={still ? false : { scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}>
            {!still && <span className="egg-burst" aria-hidden="true">
              {BURST.map((i) => <i key={i} style={{ '--a': `${(i * 360) / BURST.length}deg`, '--d': `${(i % 3) * 0.05}s` } as CSSProperties} />)}
            </span>}
            <div className="egg-shells"><EggArt day={day} golden={golden} open peek={peekOf(prize)} /></div>
            {friend && <>
              <span className="egg-friend" style={{ '--c': friend.color } as CSSProperties} aria-hidden="true">{friend.emoji}</span>
              <h2>You hatched {friend.name}!</h2>
              <p>{friend.line}</p>
              <p className="egg-note">{friend.name.split(' ')[0]} has moved into your corner of the treehouse.</p>
              <div className="egg-actions">
                <button className="egg-go" onClick={onCorner}>Visit My Corner →</button>
                <button className="egg-ok" onClick={onClose}>Yay!</button>
              </div>
            </>}
            {joke && <>
              <img className="egg-chirpy" src={chirpySprite(punchline ? 'excited' : 'curious')} alt="" />
              <h2>Chirpy’s joke of the day</h2>
              <p className="egg-joke">{joke[0]}</p>
              {punchline
                ? <motion.p className="egg-punch" initial={still ? false : { scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{joke[1]}</motion.p>
                : <button className="egg-go" onClick={() => { setPunchline(true); if (!quiet) sound.play('bonusPoints'); speak(joke[1], quiet, 'grownup'); }}>Tell me!</button>}
              <div className="egg-actions"><button className="egg-ok" onClick={onClose}>{punchline ? 'Ha ha! Done' : 'Maybe later'}</button></div>
            </>}
            {sticker && <>
              <span className="egg-sticker"><StickerArt sticker={sticker} size={150} /></span>
              <h2>A rare sticker: {sticker.name}!</h2>
              <p>It is in your sticker book now. Only surprise eggs have these.</p>
              <div className="egg-actions"><button className="egg-ok" onClick={onClose}>Amazing!</button></div>
            </>}
            <p className="egg-tomorrow">A new egg will be waiting tomorrow{name ? `, ${name}` : ''}.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ── The nest on the home-page floor ──────────────────────────────────────── */

export function EggNest({ onCorner }: { onCorner: () => void }) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const today = todayKey();
  const activeDays = useKidStore((s) => s.activeDays);
  const hatchedOn = useKidStore((s) => s.eggHatchedOn);
  const hatched = useKidStore((s) => s.eggsHatched);
  const lastPrize = useKidStore((s) => s.eggPrize);
  const name = useKidStore((s) => s.name);

  const hatchedToday = hatchedOn === today;
  const ready = !hatchedToday && activeDays.includes(today);
  const golden = isGoldenEgg(hatchedToday ? hatched - 1 : hatched);

  const [open, setOpen] = useState<null | 'crack' | 'reveal'>(null);
  const [crack, setCrack] = useState(0);
  const [prize, setPrize] = useState<EggPrize | null>(null);
  const [tip, setTip] = useState(false);
  const [wiggle, setWiggle] = useState(0);

  useEffect(() => {
    if (!tip) return;
    const t = window.setTimeout(() => setTip(false), 5200);
    return () => window.clearTimeout(t);
  }, [tip]);

  const tap = () => {
    if (hatchedToday) {
      if (!quiet) sound.play('roomCard');
      setPrize(lastPrize);
      setOpen('reveal');
      return;
    }
    if (!ready) {
      if (!quiet) sound.play('tapHit');
      setWiggle((n) => n + 1);
      setTip(true);
      speak('Your egg is warming up! Do one good thing today, like a game, a story or a diary page, and it will hatch.', quiet, 'grownup');
      return;
    }
    if (!quiet) sound.play('roomCard');
    setCrack(0);
    setOpen('crack');
  };

  const crackOnce = () => {
    const next = crack + 1;
    if (next < 3) {
      if (!quiet) sound.play('tapHit');
      setCrack(next);
      return;
    }
    const inside = useKidStore.getState().hatchEgg();
    if (!inside) { setOpen(null); return; }
    if (!quiet) { sound.play('balloonPop'); window.setTimeout(() => sound.play('levelUp'), 260); }
    setPrize(inside);
    setOpen('reveal');
    speak(prizeLine(inside, name && name !== 'Explorer' ? name : ''), quiet, 'grownup');
  };

  const close = () => { stopSpeaking(); setOpen(null); };
  const peek = hatchedToday ? peekOf(lastPrize) : undefined;
  const label = hatchedToday
    ? 'Your egg has hatched today. Tap to see what was inside again.'
    : ready ? 'Your surprise egg is ready to hatch! Tap it.' : 'Your surprise egg is warming up. Do one thing today to hatch it.';

  return (
    <>
      <button className={`egg-home ${ready ? 'is-ready' : ''} ${hatchedToday ? 'is-hatched' : ''} ${golden ? 'is-golden' : ''}`} onClick={tap} aria-label={label}>
        <Nest part="back" />
        <motion.span key={wiggle} className="egg-home-egg"
          animate={still || !wiggle ? undefined : { rotate: [0, -12, 10, -6, 0] }} transition={{ duration: .6 }}>
          <EggArt day={today} golden={golden} open={hatchedToday} peek={peek} />
        </motion.span>
        <Nest part="front" />
        <span className="egg-tag" aria-hidden="true">{hatchedToday ? 'Hatched! ✓' : ready ? 'Hatch me!' : 'Warming up…'}</span>
      </button>
      <AnimatePresence>
        {tip && (
          <motion.p className="egg-tip" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            Your egg is warming up! Do one good thing today and it will hatch.
          </motion.p>
        )}
      </AnimatePresence>
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && <Hatch key="hatch" phase={open} crack={crack} onCrack={crackOnce} prize={prize} golden={golden}
            onClose={close} onCorner={() => { close(); onCorner(); }} still={still} />}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
