import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useKidStore } from '../../../../kids/store';
import { levelOf } from '../../../../kids/buddies';
import * as sound from '../../kit/sound';
import { starChime } from './buddySound';
import { GAME_FONT, loadGameFont } from './gameFont';
import './RewardLayer.css';

/*
  STARS LANDING, WHEREVER THEY ARE EARNED.

  Mounted once for the whole gym. Every time Mind Stars go up (a good choice
  in the Games Room, a tick in the diary, a chapter read, a feelings journey
  finished) a little "+12" pops at the top of the screen, stars spray out of
  it, and the level bar under it fills by exactly that much, so a child can
  see how close the next egg is. Crossing a level turns it gold: LEVEL UP!
  A new egg is waiting at home.

  It never blocks a tap (pointer-events: none), it merges gains that land
  close together into one, and in the quiet state it stays away entirely.
*/

interface Gain { key: number; from: number; to: number }

const SPRAY = Array.from({ length: 7 }, (_, i) => {
  const a = ((-160 + i * 47) * Math.PI) / 180;
  return { x: Math.cos(a) * (46 + (i % 3) * 14), y: Math.sin(a) * (34 + (i % 2) * 16) - 10, d: i * 0.03 };
});

export function RewardLayer({ quiet }: { quiet: boolean }) {
  const reduced = useReducedMotion();
  const [gain, setGain] = useState<Gain | null>(null);
  const quietRef = useRef(quiet);
  const hide = useRef<number | undefined>(undefined);

  useEffect(() => { quietRef.current = quiet; }, [quiet]);
  useEffect(() => { loadGameFont(); }, []);

  useEffect(() => {
    const unsub = useKidStore.subscribe((s, prev) => {
      if (s.points <= prev.points || quietRef.current || !useKidStore.persist.hasHydrated()) return;
      const up = levelOf(s.points).level > levelOf(prev.points).level;
      setGain((g) => ({ key: Date.now(), from: g ? g.from : prev.points, to: s.points }));
      starChime(Math.min(4, Math.ceil((s.points - prev.points) / 5)));
      if (up) window.setTimeout(() => sound.play('levelUp'), 420);
      window.clearTimeout(hide.current);
      hide.current = window.setTimeout(() => setGain(null), up ? 4800 : 2900);
    });
    return () => { unsub(); window.clearTimeout(hide.current); };
  }, []);

  if (!gain || quiet) return null;
  const now = levelOf(gain.to);
  const before = levelOf(gain.from);
  const leveled = now.level > before.level;
  const fromPct = leveled ? 0 : before.progress * 100;
  const toPct = now.progress * 100;
  return (
    <div className="rl-wrap" aria-live="polite">
      <div key={gain.key} className={`rl-toast ${leveled ? 'is-level' : ''} ${reduced ? 'is-still' : ''}`} style={{ fontFamily: GAME_FONT }}>
        <span className="rl-star" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 2.2l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17l-6 3.3 1.3-6.6L2.4 9.1l6.7-.8z" /></svg>
          {!reduced && SPRAY.map((p, i) => <i key={i} style={{ '--x': `${p.x}px`, '--y': `${p.y}px`, '--d': `${p.d}s` } as CSSProperties} />)}
        </span>
        <span className="rl-plus">+{gain.to - gain.from}</span>
        <span className="rl-meter">
          <b>{leveled ? `LEVEL ${now.level}!` : `Level ${now.level}`}</b>
          <span className="rl-bar"><i style={{ '--from': `${fromPct}%`, '--to': `${toPct}%` } as CSSProperties} /></span>
          <small>{leveled ? 'A new egg is ready! 🥚' : `${now.left} more for Level ${now.level + 1}`}</small>
        </span>
        <span className="rl-sr">{`You earned ${gain.to - gain.from} Mind Stars.${leveled ? ` Level ${now.level}! A new egg is ready.` : ''}`}</span>
      </div>
    </div>
  );
}
