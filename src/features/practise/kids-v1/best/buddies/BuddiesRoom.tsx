import { useEffect, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useKidStore } from '../../../../kids/store';
import {
  CREATURE_BY_ID, RARITY, WORLDS, creaturesOf, hatchLevel, shinyOf, stillToHatch, type Creature, type WorldId,
} from '../../../../kids/buddies';
import { useQuiet } from '../../ui/quiet';
import { FONT } from '../../ui/chrome';
import { DoorHandle } from '../../ui/DoorHandle';
import { BadgeSlot } from '../ChildBadge';
import { speak, stopSpeaking } from '../../kit/chirpyVoice';
import * as sound from '../../kit/sound';
import { CreatureArt } from './CreatureArt';
import { BuddyEgg } from './BuddyEgg';
import { HatchParty } from './HatchParty';
import { WorldPicker } from './WorldPicker';
import { WorldBackdrop } from './WorldBackdrop';
import { buddyNoise } from './buddySound';
import { GAME_FONT, loadGameFont } from './gameFont';
import { useBuddy } from './useBuddy';
import './Buddies.css';

/*
  MY DINOS (or my sea friends, or my space friends).

  The collection is the reason to come back: every one already found, big and
  bright, and every one still to come as a shadow with the level it hatches
  at, so the next one is always a few stars away and a child can guess who it
  is from its outline. The buddy stands on the left with the level bar and,
  when one is waiting, the egg to hatch.
*/

function Detail({ c, owned, buddyId, onClose }: { c: Creature; owned: readonly string[]; buddyId: string | null; onClose: () => void }) {
  const quiet = useQuiet();
  const hasShiny = owned.includes(shinyOf(c.id));
  const [shiny, setShiny] = useState(buddyId === shinyOf(c.id));
  const id = shiny ? shinyOf(c.id) : c.id;
  const r = RARITY[c.rarity];
  const mine = buddyId === id;
  useEffect(() => () => stopSpeaking(), []);
  return (
    <motion.div className="br-detail-veil" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="br-detail" role="dialog" aria-modal="true" aria-label={`${c.name} the ${c.kind}`}
        initial={quiet ? false : { scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
        <button className="br-detail-close" onClick={onClose} aria-label="Close">✕</button>
        <div className="hp-ribbon" style={{ '--rc': r.color, '--rd': r.deep, fontFamily: GAME_FONT } as CSSProperties}>{'★'.repeat(r.stars)} {shiny ? `Shiny ${r.label}` : r.label}</div>
        <button className="br-detail-art" onClick={() => { buddyNoise(c.world); speak(c.hello, quiet, 'grownup'); }} aria-label={`${c.name} says hello`}>
          <CreatureArt id={id} still={quiet} />
        </button>
        <h3 style={{ fontFamily: GAME_FONT }}>{c.name} <small>the {c.kind}</small></h3>
        <p className="br-hello">“{c.hello}”</p>
        {hasShiny && (
          <div className="br-variants" role="group" aria-label="Colours">
            <button aria-pressed={!shiny} onClick={() => setShiny(false)}>Normal</button>
            <button aria-pressed={shiny} onClick={() => setShiny(true)}>✨ Shiny</button>
          </div>
        )}
        <div className="hp-fact">
          <b>Did you know?</b>
          <p>{c.fact}</p>
          <button className="hp-hear" onClick={() => speak(c.fact, false, 'grownup')} aria-label="Hear the fact">🔊</button>
        </div>
        <div className="hp-actions">
          {mine
            ? <span className="br-mine">♡ {c.name} is your buddy</span>
            : <button className="hp-btn hp-btn-gold" onClick={() => { useKidStore.getState().setBuddy(id); buddyNoise(c.world); if (!quiet) sound.play('discovery'); }}>Make {c.name} my buddy</button>}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function BuddiesRoom({ onExit }: { onExit: () => void }) {
  const quiet = useQuiet();
  const b = useBuddy();
  const buddies = useKidStore((s) => s.buddies);
  const opened = useKidStore((s) => s.buddyEggsOpened);
  const [hatching, setHatching] = useState(false);
  const [picker, setPicker] = useState<WorldId | 'any' | null>(null);
  const [open, setOpen] = useState<Creature | null>(null);
  const [hi, setHi] = useState(0);
  useEffect(() => { loadGameFont(); }, []);

  /* No buddy yet: the room is the place to choose one. */
  useEffect(() => {
    if (!b.starting) return;
    const t = window.setTimeout(() => setPicker('any'), 350);
    return () => window.clearTimeout(t);
  }, [b.starting]);

  const world = b.world ?? WORLDS[0];
  const owned = b.owned;
  const all = creaturesOf(world.id);
  const coming = stillToHatch(world.id, owned);
  const found = all.filter((c) => owned.includes(c.id)).length;
  const buddy = b.buddyId ?? owned[0] ?? null;
  const buddyC = buddy ? CREATURE_BY_ID[buddy.replace('*', '')] : null;

  const sayHi = () => {
    if (!buddyC) return;
    setHi((n) => n + 1);
    buddyNoise(buddyC.world);
    speak(buddyC.hello, quiet, 'grownup');
  };

  return (
    <main className={`br-room br-${world.id}`} style={{ fontFamily: FONT, '--a': world.colors[0], '--b': world.colors[1], '--c': world.colors[2] } as CSSProperties}>
      <WorldBackdrop world={world.id} />
      <DoorHandle side="left" label="Mind Gym" onClick={onExit} accent="#ffd98a" scale={0.4} bottomVh={66} />
      <header className="br-head">
        <h1 style={{ fontFamily: GAME_FONT }}>{world.emoji} {world.name}</h1>
        <p>{b.rank} · Level {b.level.level}</p>
        <span className="br-badge"><BadgeSlot /></span>
      </header>

      <div className="br-layout">
        <section className="br-buddy" aria-label="Your buddy">
          {buddyC ? (
            <>
              <motion.button key={hi} className="br-buddy-art" onClick={sayHi} aria-label={`${buddyC.name}. Tap to say hello.`}
                animate={quiet || !hi ? undefined : { y: [0, -24, 0], scale: [1, 1.06, 1] }} transition={{ duration: 0.5 }}>
                <CreatureArt id={buddy!} still={quiet} />
              </motion.button>
              <p className="br-buddy-name" style={{ fontFamily: GAME_FONT }}>{buddyC.name} <small>♡ my buddy</small></p>
            </>
          ) : (
            <button className="br-buddy-art br-mystery" onClick={() => setPicker('any')} aria-label="Choose your first buddy">
              <BuddyEgg world="dino" />
            </button>
          )}
          <div className="br-level">
            <span className="br-level-badge" style={{ fontFamily: GAME_FONT }}><small>LEVEL</small>{b.level.level}</span>
            <div className="br-level-meter">
              <b style={{ fontFamily: GAME_FONT }}>⭐ {b.stars} Mind Stars</b>
              <span className="br-bar"><i style={{ width: `${b.level.progress * 100}%` }} /></span>
              <small>{b.level.left} more {b.level.left === 1 ? 'star' : 'stars'} to Level {b.level.level + 1}, and another egg</small>
            </div>
          </div>
          {b.ready > 0 && !b.starting && (
            <button className="br-hatch" onClick={() => { if (!quiet) sound.play('roomCard'); setHatching(true); }} style={{ fontFamily: GAME_FONT }}>
              <span className="br-hatch-egg" aria-hidden="true"><BuddyEgg world={world.id} rarity={b.next ? CREATURE_BY_ID[b.next.id].rarity : 'common'} /></span>
              Hatch your egg!{b.ready > 1 ? ` (${b.ready})` : ''}
            </button>
          )}
        </section>

        <section className="br-dex" aria-label={`My ${world.plural}`}>
          <h2 style={{ fontFamily: GAME_FONT }}>My {world.plural} <span>{found} / {all.length}</span></h2>
          <ul className="br-grid">
            {all.map((c) => {
              const have = owned.includes(c.id);
              const shiny = owned.includes(shinyOf(c.id));
              const k = coming.indexOf(c.id);
              const next = k === 0;
              const at = hatchLevel(k, opened);
              const r = RARITY[c.rarity];
              return (
                <li key={c.id}>
                  <button className={`br-card ${have ? 'is-have' : 'is-locked'} ${next ? 'is-next' : ''} br-${c.rarity}`}
                    style={{ '--rc': r.color } as CSSProperties}
                    onClick={() => { if (have) { if (!quiet) sound.play('roomCard'); setOpen(c); } }}
                    aria-label={have ? `${c.name} the ${c.kind}, ${r.label}` : next ? `The next egg: a ${r.label.toLowerCase()} one. Who could it be?` : `Not found yet. Hatches at level ${at}.`}>
                    <span className="br-card-art"><CreatureArt id={shiny && buddy === shinyOf(c.id) ? shinyOf(c.id) : c.id} silhouette={!have} still /></span>
                    <b>{have ? c.name : '???'}</b>
                    <small className="br-stars" style={{ color: r.color }}>{'★'.repeat(r.stars)}</small>
                    {!have && <i className="br-when">{next ? (b.ready > 0 ? 'Egg ready!' : 'Next egg!') : at <= b.level.level ? 'Egg ready!' : `Level ${at}`}</i>}
                    {shiny && <i className="br-shiny" aria-label="Shiny found">✨</i>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <nav className="br-worlds" aria-label="Other worlds">
        <span>Other worlds:</span>
        {WORLDS.filter((x) => x.id !== world.id).map((x) => {
          const n = (buddies[x.id] ?? []).length;
          return (
            <button key={x.id} onClick={() => {
              if (!quiet) sound.play('roomCard');
              if (n) useKidStore.getState().chooseWorld(x.id); else setPicker(x.id);
            }} style={{ '--a': x.colors[0], '--b': x.colors[1] } as CSSProperties}>
              {x.emoji} {x.name} <small>{n ? `${n}/${x.order.length}` : 'New!'}</small>
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {open && <Detail key={open.id} c={open} owned={owned} buddyId={b.buddyId} onClose={() => setOpen(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {hatching && <HatchParty key="hatch" onClose={() => setHatching(false)} />}
      </AnimatePresence>
      {picker && <WorldPicker startWorld={picker === 'any' ? undefined : picker} onClose={() => setPicker(null)} />}
    </main>
  );
}
