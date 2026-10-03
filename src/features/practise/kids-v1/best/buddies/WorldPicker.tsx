import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useKidStore } from '../../../../kids/store';
import { CREATURE_BY_ID, RARITY, WORLDS, WORLD_BY_ID, type WorldId } from '../../../../kids/buddies';
import { useQuiet } from '../../ui/quiet';
import { FONT } from '../../ui/chrome';
import { speak } from '../../kit/chirpyVoice';
import * as sound from '../../kit/sound';
import { CreatureArt } from './CreatureArt';
import { HatchParty } from './HatchParty';
import { GAME_FONT, loadGameFont } from './gameFont';
import './Buddies.css';

/*
  CHOOSING A WORLD, THEN CHOOSING A FIRST BUDDY.

  Every world is open from the start: dinosaurs for the child who lives and
  breathes them, and unicorns, sea creatures or space friends for everyone
  else. The first buddy is the child's own pick from three, the way every
  great collecting game begins, and it hatches from its egg right there.
*/
export function WorldPicker({ startWorld, onClose, onCollection }: { startWorld?: WorldId; onClose: () => void; onCollection?: () => void }) {
  const quiet = useQuiet();
  const buddies = useKidStore((s) => s.buddies);
  const [world, setWorld] = useState<WorldId | null>(startWorld ?? null);
  const [starter, setStarter] = useState<string | null>(null);
  useEffect(() => { loadGameFont(); }, []);
  useEffect(() => {
    speak(world ? 'Choose your very first buddy!' : 'Which world do you want to explore?', quiet, 'grownup');
  }, [world, quiet]);

  if (world && starter) {
    return <HatchParty starter={{ world, id: starter }} onClose={onClose} onCollection={onCollection} />;
  }

  const pickWorld = (id: WorldId) => {
    if (!quiet) sound.play('roomCard');
    if ((buddies[id] ?? []).length) { useKidStore.getState().chooseWorld(id); onClose(); return; }
    setWorld(id);
  };

  if (typeof document === 'undefined') return null;
  const w = world ? WORLD_BY_ID[world] : null;
  return createPortal(
    <motion.div className="wp-veil" style={{ fontFamily: FONT }} role="dialog" aria-modal="true" aria-label={w ? 'Choose your first buddy' : 'Choose your world'}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <button className="hp-close" onClick={onClose} aria-label="Close">✕</button>
      {!w ? (
        <div className="wp-panel">
          <h2 className="wp-title" style={{ fontFamily: GAME_FONT }}>Choose your world!</h2>
          <p className="wp-sub">Every level you reach hatches a new friend from it.</p>
          <div className="wp-worlds">
            {WORLDS.map((x, i) => (
              <motion.button key={x.id} className="wp-world" onClick={() => pickWorld(x.id)}
                style={{ '--a': x.colors[0], '--b': x.colors[1], '--c': x.colors[2] } as CSSProperties}
                initial={quiet ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <span className="wp-world-art" aria-hidden="true">
                  {x.starters.map((id) => <CreatureArt key={id} id={id} still={quiet} />)}
                </span>
                <b style={{ fontFamily: GAME_FONT }}>{x.emoji} {x.name}</b>
                <small>{x.tagline}</small>
                {(buddies[x.id] ?? []).length > 0 && <i className="wp-have">{buddies[x.id].length} found</i>}
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="wp-panel">
          <h2 className="wp-title" style={{ fontFamily: GAME_FONT }}>Choose your first buddy!</h2>
          <p className="wp-sub">{w.emoji} {w.name}: you will hatch the others as you level up.</p>
          <div className="wp-starters">
            {w.starters.map((id, i) => {
              const c = CREATURE_BY_ID[id];
              const r = RARITY[c.rarity];
              return (
                <motion.button key={id} className="wp-starter" onClick={() => { if (!quiet) sound.play('enterRoom'); setStarter(id); }}
                  style={{ '--a': w.colors[0], '--b': w.colors[1], '--rc': r.color } as CSSProperties}
                  initial={quiet ? false : { opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.1, type: 'spring', stiffness: 260, damping: 16 }}>
                  <span className="wp-starter-art"><CreatureArt id={id} still={quiet} /></span>
                  <b style={{ fontFamily: GAME_FONT }}>{c.name}</b>
                  <small>{c.kind} · <span style={{ color: r.color }}>{'★'.repeat(r.stars)}</span></small>
                </motion.button>
              );
            })}
          </div>
          {!startWorld && <button className="wp-back" onClick={() => setWorld(null)}>← Other worlds</button>}
        </div>
      )}
    </motion.div>,
    document.body,
  );
}
