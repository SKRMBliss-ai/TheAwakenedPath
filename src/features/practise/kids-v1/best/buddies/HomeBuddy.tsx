import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CREATURE_BY_ID, WORLDS } from '../../../../kids/buddies';
import { useQuiet } from '../../ui/quiet';
import * as sound from '../../kit/sound';
import { CreatureArt } from './CreatureArt';
import { HatchParty } from './HatchParty';
import { WorldPicker } from './WorldPicker';
import { buddyNoise } from './buddySound';
import { GAME_FONT, loadGameFont } from './gameFont';
import { useBuddy } from './useBuddy';
import './HomeBuddy.css';

/*
  THE BUDDY ON THE HOME PAGE: the level panel in the top corner, and the
  buddy itself standing on the floor of the room.

  The panel is the scoreboard a child glances at: their level, their stars
  (they count up as they land), and how far the bar has to go to the next
  egg. When an egg is ready the panel says so in words, "Hatch your new
  dino!", and hatches it right there. The buddy on the floor says hello when
  tapped, and the tag under it opens the whole collection.
*/

/** Anything new on the home page shows itself for three seconds, then steps
    out of the way: the home page stays as uncluttered as it was. */
function useBriefly(ms = 3000): boolean {
  const [on, setOn] = useState(true);
  useEffect(() => { const t = window.setTimeout(() => setOn(false), ms); return () => window.clearTimeout(t); }, [ms]);
  return on;
}

/** The star total, counting up to its new value rather than jumping. */
function useCountUp(target: number, still: boolean): number {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (still) { from.current = target; const id = requestAnimationFrame(() => setShown(target)); return () => cancelAnimationFrame(id); }
    const start = performance.now();
    const a = from.current;
    let id = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      const v = Math.round(a + (target - a) * (1 - (1 - p) ** 3));
      setShown(v);
      if (p < 1) id = requestAnimationFrame(step); else from.current = target;
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target, still]);
  return shown;
}

export function BuddyHud({ name, onOpen }: { name: string; onOpen: () => void }) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const b = useBuddy();
  const shown = useCountUp(b.stars, still);
  const [hatching, setHatching] = useState(false);
  const [picking, setPicking] = useState(false);
  useEffect(() => { loadGameFont(); }, []);
  const noun = b.world?.plural === 'dinos' ? 'dino' : 'friend';
  const showPill = useBriefly();
  const gaining = shown !== b.stars;
  return (
    <div className="hb-hud-wrap">
      <div className={`hb-hud ${gaining ? 'is-gaining' : ''}`}>
        <button className="hb-hud-open" title="See your buddy and stars" onClick={() => { if (!quiet) sound.play('roomCard'); onOpen(); }}
          aria-label={`Level ${b.level.level}, ${b.stars} Mind Stars. ${b.level.left} more for the next egg. Open my buddies.`} />
        <span className="hb-badge" style={{ fontFamily: GAME_FONT }} aria-hidden="true"><small>LEVEL</small>{b.level.level}</span>
        <span className="hb-meter" aria-hidden={b.ready > 0 ? undefined : true}>
          <span className="hb-top">
            <span className="hb-name">{name}</span>
            <span className="hb-stars" style={{ fontFamily: GAME_FONT }}><span aria-hidden="true">⭐</span> {shown}</span>
          </span>
          <span className="hb-bar"><i style={{ width: `${b.level.progress * 100}%` }} /></span>
          {b.ready > 0 && showPill ? (
            <button className="hb-hatch" style={{ fontFamily: GAME_FONT }}
              aria-label={b.starting ? 'Choose your buddy' : `Hatch your new ${noun}${b.ready > 1 ? `: ${b.ready} eggs waiting` : ''}`}
              onClick={() => { if (!quiet) sound.play('roomCard'); if (b.starting) setPicking(true); else setHatching(true); }}>
              <span aria-hidden="true">🥚</span>{' '}
              <span className="hb-long">{b.starting ? 'Choose your buddy!' : `Hatch your new ${noun}!`}</span>
              <span className="hb-short">{b.starting ? 'Choose buddy!' : 'Hatch!'}</span>
              {b.ready > 1 && !b.starting ? ` ×${b.ready}` : ''}
            </button>
          ) : (
            <small className="hb-left">{b.level.left} more for Level {b.level.level + 1}</small>
          )}
        </span>
      </div>
      <AnimatePresence>{hatching && <HatchParty key="hatch" onClose={() => setHatching(false)} onCollection={() => { setHatching(false); onOpen(); }} />}</AnimatePresence>
      {picking && <WorldPicker onClose={() => setPicking(false)} onCollection={() => { setPicking(false); onOpen(); }} />}
    </div>
  );
}

const MYSTERY = WORLDS.map((w) => w.starters[0]);

export function FloorBuddy({ onOpen }: { onOpen: () => void }) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const b = useBuddy();
  const [hello, setHello] = useState<string | null>(null);
  const [hop, setHop] = useState(0);
  const [picking, setPicking] = useState(false);
  const [mystery, setMystery] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const shown = useBriefly();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!b.starting || still) return;
    const t = window.setInterval(() => setMystery((m) => (m + 1) % MYSTERY.length), 1600);
    return () => window.clearInterval(t);
  }, [b.starting, still]);

  /* The picker is rendered outside the two looks below: choosing a buddy
     turns this from the mystery into the buddy, and the hatch has to keep
     playing through that change rather than vanish with the mystery. */
  const picker = picking && <WorldPicker onClose={() => setPicking(false)} onCollection={() => { setPicking(false); onOpen(); }} />;

  if (!shown) return picker || null;

  if (b.starting || !b.buddyId || !b.buddy) {
    return (
      <>
      <div className="hb-floor">
        <button className="hb-floor-art hb-mystery" onClick={() => { if (!quiet) sound.play('roomCard'); setPicking(true); }} aria-label="Choose your buddy">
          <AnimatePresence mode="popLayout">
            <motion.span key={mystery} className="hb-mystery-sil" initial={still ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <CreatureArt id={MYSTERY[mystery]} silhouette tint="#d9c8ff" />
            </motion.span>
          </AnimatePresence>
          <span className="hb-q" aria-hidden="true" style={{ fontFamily: GAME_FONT }}>?</span>
        </button>
        <button className="hb-tag hb-tag-pink" onClick={() => setPicking(true)} style={{ fontFamily: GAME_FONT }}>Choose your buddy!</button>
      </div>
      {picker}
      </>
    );
  }

  const c = CREATURE_BY_ID[b.buddy.id];
  const sayHi = () => {
    setHop((h) => h + 1);
    setHello(c.hello);
    buddyNoise(c.world);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHello(null), 4200);
  };
  return (
    <>
    <div className="hb-floor">
      <AnimatePresence>
        {hello && (
          <motion.p key={hello + hop} className="hb-say" role="status" initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}>
            {hello}
          </motion.p>
        )}
      </AnimatePresence>
      <motion.button key={hop} className="hb-floor-art" onClick={sayHi} aria-label={`${c.name} the ${c.kind}. Tap to say hello.`}
        animate={still || !hop ? undefined : { y: [0, -30, 0, -10, 0], scaleY: [1, 1.05, 0.94, 1.02, 1] }} transition={{ duration: 0.7 }}>
        <CreatureArt id={b.buddyId} still={still} />
      </motion.button>
      <button className="hb-tag" onClick={() => { if (!quiet) sound.play('roomCard'); onOpen(); }} style={{ fontFamily: GAME_FONT }}>
        {b.world?.emoji} {c.name} <span>· My {b.world?.plural} ›</span>
      </button>
    </div>
    {picker}
    </>
  );
}
