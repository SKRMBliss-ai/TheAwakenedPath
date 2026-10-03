import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useKidStore, type BuddyHatch } from '../../../../kids/store';
import { CREATURE_BY_ID, RARITY, WORLD_BY_ID, eggsReady, nextHatch, type WorldId } from '../../../../kids/buddies';
import { useQuiet } from '../../ui/quiet';
import { FONT } from '../../ui/chrome';
import { speak, stopSpeaking } from '../../kit/chirpyVoice';
import * as sound from '../../kit/sound';
import { CreatureArt } from './CreatureArt';
import { BuddyEgg } from './BuddyEgg';
import { GAME_FONT, loadGameFont } from './gameFont';
import { buddyNoise } from './buddySound';
import './HatchParty.css';

/*
  THE HATCH.

  The biggest moment in the gym, so it gets the whole screen: the egg drops
  in and wobbles, three taps crack it, it bursts in a flash of light and
  confetti, and out comes someone new with their name, how rare they are, and
  one true thing about them. Then the child can make them their buddy, hatch
  the next egg if more are waiting, or just say "Yay!".

  A child who has asked for less motion, or who is upset, gets the same
  moment without the flying pieces.
*/

/** Confetti spread round the circle without Math.random, so a render is pure. */
const CONFETTI = Array.from({ length: 52 }, (_, i) => {
  const a = (i * 137.5 * Math.PI) / 180;
  const dist = 140 + ((i * 53) % 120);
  return {
    x: Math.cos(a) * dist,
    y: Math.sin(a) * dist - 60,
    r: (i * 97) % 360,
    d: ((i * 31) % 10) / 40,
    c: ['#ffd45c', '#ff7ab6', '#7cc8ff', '#8fe388', '#c9a6ff', '#ffffff'][i % 6],
    w: i % 3 === 0 ? 9 : 13,
  };
});

type Plan = { world: WorldId; id: string | null; shiny: boolean };

function Round({ starter, onClose, onNext, onCollection }: {
  starter?: { world: WorldId; id: string };
  onClose: () => void;
  onNext: () => void;
  onCollection?: () => void;
}) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const [plan] = useState<Plan>(() => {
    if (starter) return { world: starter.world, id: starter.id, shiny: false };
    const s = useKidStore.getState();
    const world = s.buddyWorld ?? 'dino';
    const next = nextHatch(world, s.buddies[world] ?? []);
    return { world, id: next?.id ?? null, shiny: next?.shiny ?? false };
  });
  const [crack, setCrack] = useState(0);
  const [result, setResult] = useState<BuddyHatch | null>(null);
  const [nudge, setNudge] = useState(0);
  const buddyId = useKidStore((s) => s.buddyId);
  const waiting = useKidStore((s) => eggsReady(s.points, s.buddyEggsOpened));

  const creature = plan.id ? CREATURE_BY_ID[plan.id] : null;
  const rarity = creature?.rarity ?? 'common';
  const world = WORLD_BY_ID[plan.world];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && result) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, result]);

  useEffect(() => () => stopSpeaking(), []);

  const tap = () => {
    if (result) return;
    const n = crack + 1;
    setNudge((x) => x + 1);
    if (n < 3) {
      setCrack(n);
      if (!quiet) sound.play('tapHit');
      return;
    }
    let out: BuddyHatch | null;
    if (starter) {
      useKidStore.getState().pickStarter(starter.world, starter.id);
      out = { id: starter.id, shiny: false };
    } else {
      out = useKidStore.getState().hatchBuddyEgg();
    }
    if (!out) { onClose(); return; }
    setCrack(3);
    setResult(out);
    if (!quiet) {
      sound.play('balloonPop');
      window.setTimeout(() => sound.play('levelUp'), 260);
      window.setTimeout(() => buddyNoise(plan.world), 900);
    }
    if ('id' in out) {
      const c = CREATURE_BY_ID[out.id];
      speak(`You hatched ${c.name} the ${c.kind}! ${c.hello}`, quiet, 'grownup');
    } else {
      speak(`Bonus stars! You have hatched every friend in ${world.name}.`, quiet, 'grownup');
    }
  };

  const hatchedId = result && 'id' in result ? (result.shiny ? `${result.id}*` : result.id) : null;
  const isBuddy = hatchedId !== null && buddyId === hatchedId;
  const hint = crack === 0 ? 'Tap the egg to hatch it!' : crack === 1 ? 'Crack! Keep tapping!' : 'One more tap…';

  return (
    <div className={`hp-stage ${result ? 'is-open' : ''} hp-${rarity}`}>
      <div className="hp-rays" aria-hidden="true" />
      {!result && (
        <>
          <p className="hp-kicker" style={{ fontFamily: GAME_FONT }}>
            {starter ? `Your first ${world.plural === 'dinos' ? 'dino' : 'buddy'}!` : rarity === 'legendary' ? 'A golden egg!' : rarity === 'epic' ? 'A glowing egg!' : rarity === 'rare' ? 'A shimmering egg!' : 'A new egg!'}
          </p>
          <motion.button
            key={nudge}
            className="hp-egg"
            onClick={tap}
            aria-label={`Tap to hatch the egg. ${3 - crack} more ${3 - crack === 1 ? 'tap' : 'taps'}.`}
            initial={still ? false : nudge ? { rotate: -9, scale: 1.06 } : { y: -260, scale: 0.6 }}
            animate={{ rotate: 0, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: nudge ? 420 : 160, damping: nudge ? 7 : 12 }}
            autoFocus
          >
            <span className={`hp-egg-glow hp-glow-${rarity}`} aria-hidden="true" />
            <BuddyEgg world={plan.world} rarity={rarity} crack={crack} className={still ? '' : 'hp-wobble'} />
          </motion.button>
          <p className="hp-hint" aria-live="polite">{hint}</p>
          <div className="hp-taps" aria-hidden="true">{[0, 1, 2].map((i) => <i key={i} className={i < crack ? 'is-on' : ''} />)}</div>
        </>
      )}

      {result && (
        <div className="hp-reveal">
          {!still && <div className="hp-flash" aria-hidden="true" />}
          {!still && (
            <span className="hp-confetti" aria-hidden="true">
              {CONFETTI.map((p, i) => (
                <i key={i} style={{ '--x': `${p.x}px`, '--y': `${p.y}px`, '--r': `${p.r}deg`, '--d': `${p.d}s`, '--c': p.c, '--w': `${p.w}px` } as CSSProperties} />
              ))}
            </span>
          )}
          {'id' in result ? (() => {
            const c = CREATURE_BY_ID[result.id];
            const r = RARITY[c.rarity];
            return (
              <>
                <div className="hp-ribbon" style={{ '--rc': r.color, '--rd': r.deep, fontFamily: GAME_FONT } as CSSProperties}>
                  {'★'.repeat(r.stars)} {result.shiny ? `Shiny ${r.label}` : r.label}{c.rarity === 'legendary' ? '!' : ''}
                </div>
                <div className="hp-creature">
                  <div className="hp-shell" aria-hidden="true"><BuddyEgg world={plan.world} rarity={rarity} open className={still ? '' : 'hp-burst'} /></div>
                  <motion.div
                    initial={still ? false : { scale: 0.2, y: 60, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 11, delay: still ? 0 : 0.18 }}>
                    <CreatureArt id={hatchedId!} className={still ? '' : 'hp-hop'} still={still} size="100%" />
                  </motion.div>
                </div>
                <h2 className="hp-name" style={{ fontFamily: GAME_FONT }}>
                  <span className="hp-new">NEW!</span> {c.name} <small>the {c.kind}</small>
                </h2>
                <div className="hp-fact">
                  <b>Did you know?</b>
                  <p>{c.fact}</p>
                  <button className="hp-hear" onClick={() => speak(c.fact, false, 'grownup')} aria-label="Hear the fact">🔊</button>
                </div>
                <div className="hp-actions">
                  {!isBuddy && !starter && (
                    <button className="hp-btn hp-btn-gold" onClick={() => { useKidStore.getState().setBuddy(hatchedId!); buddyNoise(plan.world); }}>
                      Make {c.name} my buddy
                    </button>
                  )}
                  {!starter && waiting > 0 ? (
                    <button className="hp-btn hp-btn-pink" onClick={onNext}>Hatch the next egg! 🥚 {waiting > 1 ? `(${waiting})` : ''}</button>
                  ) : (
                    <button className="hp-btn" onClick={onClose}>{starter ? `Hello, ${c.name}!` : 'Yay!'}</button>
                  )}
                  {onCollection && !starter && <button className="hp-btn hp-btn-ghost" onClick={onCollection}>See my {world.plural}</button>}
                </div>
              </>
            );
          })() : (
            <>
              <div className="hp-bonus" style={{ fontFamily: GAME_FONT }}>⭐ +{result.bonus}</div>
              <h2 className="hp-name" style={{ fontFamily: GAME_FONT }}>Bonus stars!</h2>
              <div className="hp-fact"><p>You have hatched every friend in {world.name}, even the shiny ones. What a collector!</p></div>
              <div className="hp-actions"><button className="hp-btn" onClick={onClose}>Yay!</button></div>
            </>
          )}
        </div>
      )}
      <button className="hp-close" onClick={onClose} aria-label="Close">✕</button>
    </div>
  );
}

/** The whole-screen hatch. With `starter`, it hatches the first buddy a child picked. */
export function HatchParty({ starter, onClose, onCollection }: {
  starter?: { world: WorldId; id: string };
  onClose: () => void;
  onCollection?: () => void;
}) {
  const [round, setRound] = useState(0);
  useEffect(() => { loadGameFont(); }, []);
  if (typeof document === 'undefined') return null;
  return createPortal(
    <motion.div className="hp-veil" style={{ fontFamily: FONT }} role="dialog" aria-modal="true" aria-label="Hatch your egg"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Round key={round} starter={round === 0 ? starter : undefined} onClose={onClose} onNext={() => setRound((r) => r + 1)} onCollection={onCollection} />
    </motion.div>,
    document.body,
  );
}
