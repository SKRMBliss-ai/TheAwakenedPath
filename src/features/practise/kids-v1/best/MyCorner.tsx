import { RoomLinks } from './RoomLinks';
import { FeelingKeepsakes } from './FeelingKeepsakes';
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useKidStore } from '../../../kids/store';
import { todayKey } from '../../../kids/data';
import {
  CORNER_ITEMS, CORNER_ITEM_BY_ID, CORNER_WALLS, EGG_FRIENDS, EGG_FRIEND_BY_ID,
  bloomsOf, isUnlocked, unlockLabel, type CornerProgress, type PlacedItem,
} from '../../../kids/delight';
import { useQuiet } from '../ui/quiet';
import { FONT } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import * as sound from '../kit/sound';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import { allAffirmations } from '../kit/affirmations';
import { BadgeSlot } from './ChildBadge';
import './MyCorner.css';

/*
  MY CORNER OF THE TREEHOUSE — the one room in the gym the child arranges.

  Everything in the tray is earned somewhere else: stickers and Mind Stars
  unlock the furniture, the garden's flowers unlock its plants, a finished
  story leaves a keepsake, and every friend hatched from an egg can come and
  live here. Nothing is bought and nothing is spent, so putting a thing in
  the room never costs the child anything they had.

  Things are placed by where they stand, as a share of the room, and drawn
  nearer the front the lower they stand — so a beanbag dragged down the
  floor walks in front of the bench behind it, the way a room does.
*/

const ROOM = '/mind-gym/corner/room.webp';
const MAX_THINGS = 30;
const SEEN_KEY = 'mindgym.corner.seen';
const PET = 'friend:';

type Tab = 'things' | 'friends' | 'colours';

function readSeen(): string[] | null {
  try { const raw = localStorage.getItem(SEEN_KEY); return raw ? JSON.parse(raw) as string[] : null; } catch { return null; }
}
function writeSeen(ids: string[]) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(ids)); } catch { /* storage off: nothing is marked new */ }
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Pause between one affirmation finishing and the next, so it stays a quiet
    background voice while the child arranges things. */
const AFFIRM_GAP_MS = 9000;
/** Read on their own in one visit. Each is a live recording on a small daily
    voice allowance, so the corner stops after these; the speaker button reads
    this many more. */
const AFFIRM_PER_VISIT = 10;

function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function nameOf(id: string): string {
  if (id.startsWith(PET)) return EGG_FRIEND_BY_ID[id.slice(PET.length)]?.name ?? 'Friend';
  return CORNER_ITEM_BY_ID[id]?.name ?? 'Thing';
}

export function MyCorner({ onExit, onGrownUp, onStoryLab, onGarden, onAdventure, fresh }: { fresh?: boolean; onExit: () => void; onGrownUp: () => void; onStoryLab?: () => void; onGarden?: () => void; onAdventure?: () => void }) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const placed = useKidStore((s) => s.corner);
  const wall = useKidStore((s) => s.cornerWall);
  const friends = useKidStore((s) => s.friends);
  const stickers = useKidStore((s) => s.stickers.length);
  const stars = useKidStore((s) => s.points);
  const plants = useKidStore((s) => s.plants);
  const stories = useKidStore((s) => s.storiesFinished);
  const progress: CornerProgress = { stickers, stars, blooms: bloomsOf(plants, todayKey()), stories };

  /* ── Affirmations, read by the narrator while the child plays ── */
  const [affirmations] = useState(() => {
    const own = useKidStore.getState().savedReflections.map((r) => r.affirmation).filter((a): a is string => !!a);
    return shuffled([...new Set([...own, ...allAffirmations()])]);
  });
  const [affirmOn, setAffirmOn] = useState(true);
  const [affirmAt, setAffirmAt] = useState(0);
  const [affirmUntil, setAffirmUntil] = useState(AFFIRM_PER_VISIT);
  const [affirmShown, setAffirmShown] = useState<string | null>(null);
  const affirmPlaying = affirmOn && affirmAt < affirmUntil;
  const toggleAffirm = () => {
    if (affirmPlaying) { setAffirmOn(false); return; }
    setAffirmUntil(affirmAt + AFFIRM_PER_VISIT);
    setAffirmOn(true);
  };
  useEffect(() => {
    if (!affirmPlaying) return;
    const line = affirmations[affirmAt % affirmations.length];
    let next = 0;
    const start = window.setTimeout(() => {
      setAffirmShown(line);
      const advance = () => { window.clearTimeout(next); next = window.setTimeout(() => setAffirmAt((n) => n + 1), AFFIRM_GAP_MS); };
      /* Moves on even if the voice never reports finishing (muted, offline). */
      next = window.setTimeout(() => setAffirmAt((n) => n + 1), Math.max(4000, line.length * 110) + AFFIRM_GAP_MS);
      speak(line, quiet, 'grownup', advance);
    }, affirmAt === 0 ? 1800 : 0);
    return () => { window.clearTimeout(start); window.clearTimeout(next); stopSpeaking(); };
  }, [affirmPlaying, affirmAt, affirmations, quiet]);

  const open = (unlock: Parameters<typeof isUnlocked>[0]) => isUnlocked(unlock, progress);
  const unlockedNow = [
    ...CORNER_ITEMS.filter((i) => open(i.unlock)).map((i) => i.id),
    ...CORNER_WALLS.filter((w) => open(w.unlock)).map((w) => `wall:${w.id}`),
    ...friends.map((f) => PET + f),
  ];
  /* What was open last time, read once: anything unlocked since wears "New!".
     The very first visit has nothing to compare with, so nothing does. */
  const [seen] = useState(readSeen);
  const unlockedKey = unlockedNow.join(',');
  useEffect(() => { writeSeen(unlockedKey ? unlockedKey.split(',') : []); }, [unlockedKey]);
  const isNew = (id: string) => !!seen && !seen.includes(id);
  const newCount = { things: CORNER_ITEMS.filter((i) => open(i.unlock) && isNew(i.id)).length,
    friends: friends.filter((f) => isNew(PET + f)).length,
    colours: CORNER_WALLS.filter((w) => open(w.unlock) && isNew(`wall:${w.id}`)).length };

  const [tab, setTab] = useState<Tab>(() => (newCount.friends ? 'friends' : 'things'));
  const [trayOpen, setTrayOpen] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [hint, setHint] = useState(placed.length
    ? 'Drag your things anywhere. Tap one to change it.'
    : 'Tap something in your tray to put it in your corner!');

  /* ── Placing and moving ── */
  const room = useRef<HTMLDivElement>(null);
  const drag = useRef<{ uid: string; x0: number; y0: number; ox: number; oy: number; moved: boolean } | null>(null);
  const [live, setLive] = useState<{ uid: string; x: number; y: number } | null>(null);

  const place = (id: string) => {
    if (placed.length >= MAX_THINGS) { setHint('Your corner is full! Put something away to make room.'); return; }
    const n = placed.length;
    const floor = !!CORNER_ITEM_BY_ID[id]?.floor;
    const uid = useKidStore.getState().placeInCorner({
      id,
      x: clamp(50 + ((n * 17) % 34) - 17, 12, 88),
      y: floor ? 84 : clamp(86 + ((n * 7) % 10) - 5, 60, 96),
      scale: 1,
      flip: false,
    });
    setSelected(uid);
    setHint(`${nameOf(id)}! Drag it wherever you like.`);
    if (!quiet) sound.play('discovery');
  };

  const down = (e: PointerEvent<HTMLButtonElement>, thing: PlacedItem) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { uid: thing.uid, x0: e.clientX, y0: e.clientY, ox: thing.x, oy: thing.y, moved: false };
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    const box = room.current?.getBoundingClientRect();
    if (!d || !box) return;
    const dx = ((e.clientX - d.x0) / box.width) * 100;
    const dy = ((e.clientY - d.y0) / box.height) * 100;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 6) return;
    d.moved = true;
    setLive({ uid: d.uid, x: clamp(d.ox + dx, 3, 97), y: clamp(d.oy + dy, 14, 97) });
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved && live) {
      useKidStore.getState().updateInCorner(d.uid, { x: live.x, y: live.y });
      if (!quiet) sound.play('tapHit');
    }
    setSelected(d.uid);
    setLive(null);
  };

  const sel = placed.find((p) => p.uid === selected) ?? null;
  const change = (patch: Partial<PlacedItem>) => { if (sel) useKidStore.getState().updateInCorner(sel.uid, patch); };
  const putAway = () => {
    if (!sel) return;
    useKidStore.getState().removeFromCorner(sel.uid);
    setSelected(null);
    setHint(`${nameOf(sel.id)} went back in the tray.`);
    if (!quiet) sound.play('exitRoom');
  };
  const keys = (e: KeyboardEvent<HTMLButtonElement>, thing: PlacedItem) => {
    const step = e.shiftKey ? 6 : 2;
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (moves[e.key]) {
      e.preventDefault();
      const [dx, dy] = moves[e.key];
      useKidStore.getState().updateInCorner(thing.uid, { x: clamp(thing.x + dx, 3, 97), y: clamp(thing.y + dy, 14, 97) });
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault(); setSelected(thing.uid); putAway();
    }
  };

  const wallFilter = CORNER_WALLS.find((w) => w.id === wall)?.filter ?? 'none';
  const layer = (p: PlacedItem) => (CORNER_ITEM_BY_ID[p.id]?.floor ? 0 : 100) + Math.round((live?.uid === p.uid ? live.y : p.y) * 10) + (p.uid === selected ? 2000 : 0);

  return (
    <main className={`cn-room ${still ? 'cn-still' : ''} ${trayOpen ? '' : 'is-folded'}`} style={{ fontFamily: FONT }}>
      <img className="cn-backdrop" src={ROOM} alt="" draggable={false} style={{ filter: wallFilter }} />
      <div className="cn-glow" aria-hidden="true" />

      <FeelingKeepsakes fresh={fresh} />
      <RoomLinks items={[{ label: 'My Garden', icon: '🌱', onClick: onGarden }, { label: 'Story Map', icon: '🗺️', onClick: onAdventure }, { label: 'Story Lab', icon: '📜', onClick: onStoryLab }]} />
      <DoorHandle side="left" label="Mind Gym" onClick={onExit} accent="#ffd98a" scale={0.4} bottomVh={66} />

      <header className="cn-head">
        <h1>My Corner <span aria-hidden="true">♡</span></h1>
        <p aria-live="polite">{hint}</p>
      </header>
      <div className="cn-affirm">
        <AnimatePresence mode="wait">
          {affirmPlaying && affirmShown && (
            <motion.p key={affirmShown} aria-live="polite"
              initial={still ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: still ? 0.1 : 0.6 }}>
              ✨ {affirmShown}
            </motion.p>
          )}
        </AnimatePresence>
        <button onClick={toggleAffirm} aria-pressed={affirmPlaying}
          aria-label={affirmPlaying ? 'Stop the kind words' : 'Play kind words'}>{affirmPlaying ? '🔊' : '🔈'}</button>
      </div>
      <div className="cn-top">
        <BadgeSlot />
        <span className="cn-count">{placed.length} {placed.length === 1 ? 'thing' : 'things'}</span>
        <button className="cn-grownup chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </div>

      <div className="cn-stage" ref={room} onPointerDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
        {[...placed].sort((a, b) => layer(a) - layer(b)).map((thing) => {
          const at = live?.uid === thing.uid ? live : thing;
          const friend = thing.id.startsWith(PET) ? EGG_FRIEND_BY_ID[thing.id.slice(PET.length)] : null;
          const item = friend ? null : CORNER_ITEM_BY_ID[thing.id];
          if (!friend && !item) return null;
          return (
            <motion.button
              key={thing.uid}
              className={`cn-thing ${item?.floor ? 'is-floor' : ''} ${friend ? 'is-pet' : ''} ${thing.uid === selected ? 'is-selected' : ''} ${live?.uid === thing.uid ? 'is-dragging' : ''}`}
              style={{
                left: `${at.x}%`, top: `${at.y}%`, zIndex: layer(thing),
                '--w': friend ? 7.5 : item!.w, '--k': thing.scale,
              } as CSSProperties}
              initial={still ? false : { scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              onPointerDown={(e) => down(e, thing)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onKeyDown={(e) => keys(e, thing)}
              onFocus={() => setSelected(thing.uid)}
              aria-label={`${nameOf(thing.id)}. Drag to move it, or use the arrow keys.`}
            >
              {friend
                ? <span className="cn-pet-face" style={{ transform: thing.flip ? 'scaleX(-1)' : undefined }}>{friend.emoji}</span>
                : <img src={item!.src} alt="" draggable={false}
                    style={{ transform: `${thing.flip ? 'scaleX(-1) ' : ''}${item!.flat ? `scaleY(${item!.flat})` : ''}` || undefined }} />}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {sel && (
          <motion.div className="cn-tools" role="toolbar" aria-label={`Change ${nameOf(sel.id)}`}
            initial={still ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <b>{nameOf(sel.id)}</b>
            <button onClick={() => change({ scale: clamp(+(sel.scale - 0.15).toFixed(2), 0.55, 1.9) })} aria-label="Make it smaller">−</button>
            <button onClick={() => change({ scale: clamp(+(sel.scale + 0.15).toFixed(2), 0.55, 1.9) })} aria-label="Make it bigger">+</button>
            <button onClick={() => change({ flip: !sel.flip })} aria-label="Flip it">⇋</button>
            <button className="cn-away" onClick={putAway}>Put away</button>
            <button className="cn-done" onClick={() => setSelected(null)}>Done</button>
          </motion.div>
        )}
      </AnimatePresence>

      <section className={`cn-tray ${trayOpen ? '' : 'is-closed'}`} aria-label="My things">
        <div className="cn-tabs" role="tablist">
          {(['things', 'friends', 'colours'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'is-on' : ''}
              onClick={() => { setTab(t); setTrayOpen(true); if (!quiet) sound.play('tap'); }}>
              {t === 'things' ? 'Things' : t === 'friends' ? `Friends ${friends.length ? `(${friends.length})` : ''}` : 'Room colour'}
              {newCount[t] > 0 && <i className="cn-dot" aria-label={`${newCount[t]} new`} />}
            </button>
          ))}
          <button className="cn-fold" onClick={() => setTrayOpen((o) => !o)} aria-expanded={trayOpen}
            aria-label={trayOpen ? 'Hide my tray' : 'Show my tray'}>{trayOpen ? '▾' : '▴'}</button>
        </div>

        {trayOpen && (
          <ul className="cn-items" role="tabpanel">
            {tab === 'things' && [...CORNER_ITEMS].sort((a, b) => Number(open(b.unlock)) - Number(open(a.unlock))).map((item) => {
              const ok = open(item.unlock);
              return (
                <li key={item.id}>
                  <button className={`cn-card ${ok ? '' : 'is-locked'}`} onClick={() => ok ? place(item.id) : setHint(`${unlockLabel(item.unlock)} to unlock the ${item.name}.`)}
                    aria-label={ok ? `Put the ${item.name} in my corner` : `${item.name} is locked. ${unlockLabel(item.unlock)} to unlock it.`}>
                    {ok && isNew(item.id) && <span className="cn-new" aria-hidden="true">New!</span>}
                    <img src={item.src} alt="" draggable={false} />
                    <b>{item.name}</b>
                    {!ok && <small>🔒 {unlockLabel(item.unlock)}</small>}
                  </button>
                </li>
              );
            })}
            {tab === 'friends' && [...EGG_FRIENDS].sort((a, b) => Number(friends.includes(b.id)) - Number(friends.includes(a.id))).map((f) => {
              const have = friends.includes(f.id);
              return (
                <li key={f.id}>
                  <button className={`cn-card cn-card-pet ${have ? '' : 'is-locked'}`} style={{ '--c': f.color } as CSSProperties}
                    onClick={() => have ? place(PET + f.id) : setHint('Hatch your surprise eggs to meet new friends!')}
                    aria-label={have ? `Bring ${f.name} into my corner` : 'A friend you have not met yet. Hatch surprise eggs to meet them.'}>
                    {have && isNew(PET + f.id) && <span className="cn-new" aria-hidden="true">New!</span>}
                    <span className="cn-card-face" aria-hidden="true">{have ? f.emoji : '?'}</span>
                    <b>{have ? f.name.split(' ')[0] : 'Not met yet'}</b>
                    {!have && <small>🥚 Hatch eggs</small>}
                  </button>
                </li>
              );
            })}
            {tab === 'colours' && CORNER_WALLS.map((w) => {
              const ok = open(w.unlock);
              return (
                <li key={w.id}>
                  <button className={`cn-card cn-card-wall ${ok ? '' : 'is-locked'} ${wall === w.id ? 'is-on' : ''}`}
                    onClick={() => {
                      if (!ok) { setHint(`${unlockLabel(w.unlock)} to unlock ${w.name}.`); return; }
                      useKidStore.getState().setCornerWall(w.id);
                      setHint(`${w.name}! Your corner has a new glow.`);
                      if (!quiet) sound.play('discovery');
                    }}
                    aria-pressed={wall === w.id}
                    aria-label={ok ? `${w.name} room colour` : `${w.name} is locked. ${unlockLabel(w.unlock)}.`}>
                    {ok && isNew(`wall:${w.id}`) && <span className="cn-new" aria-hidden="true">New!</span>}
                    <span className="cn-swatch" style={{ background: `linear-gradient(135deg, ${w.swatch[0]}, ${w.swatch[1]})` }} aria-hidden="true">{wall === w.id ? '✓' : ok ? '' : '🔒'}</span>
                    <b>{w.name}</b>
                    {!ok && <small>{unlockLabel(w.unlock)}</small>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
