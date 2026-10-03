import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FEELINGS } from '../../kids/checkin/content';
import { agoLabel, loadCases, type Case } from '../kit/cases';
import * as sound from '../kit/sound';
import './FeelingKeepsakes.css';

const SEEN_KEY = 'mindgym.kidsv1.keepsakeSeen';

function seenId(): string | null {
  try { return localStorage.getItem(SEEN_KEY); } catch { return null; }
}
function markSeen(id: string) {
  try { localStorage.setItem(SEEN_KEY, id); } catch { /* private mode */ }
}

function feelingOf(c: Case) {
  const f = FEELINGS.find((x) => x.label.toLowerCase() === (c.feeling ?? '').toLowerCase());
  return { hue: f?.hue ?? 270, face: f ? `/feelings/${f.id}.webp` : null };
}

function Orb({ c, fresh, onOpen, i }: { c: Case; fresh?: boolean; onOpen: () => void; i: number }) {
  const { hue, face } = feelingOf(c);
  return (
    <motion.button
      className={`fk-orb ${fresh ? 'is-fresh' : ''}`}
      style={{ ['--h' as string]: hue, ['--d' as string]: `${(i % 5) * 0.4}s` }}
      onClick={onOpen}
      initial={fresh ? { y: -260, scale: 0.3, opacity: 0 } : false}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      transition={fresh ? { type: 'spring', stiffness: 120, damping: 9, delay: 0.9 } : undefined}
      aria-label={`${c.feeling ?? 'A feeling'} journey, ${agoLabel(c.day)}. Open it.`}
    >
      <span className="fk-glass">
        {c.drawing ? <img src={c.drawing} alt="" /> : face ? <img src={face} alt="" /> : <span aria-hidden="true">✨</span>}
      </span>
      <span className="fk-name" aria-hidden="true">{c.feeling ?? 'Feeling'}</span>
    </motion.button>
  );
}

function Memory({ c, onClose }: { c: Case; onClose: () => void }) {
  const { hue } = feelingOf(c);
  return (
    <motion.div className="fk-veil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.article className="fk-card" style={{ ['--h' as string]: hue }} role="dialog" aria-modal="true"
        aria-label={`The day I felt ${c.feeling ?? 'a feeling'}`}
        initial={{ scale: 0.6, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }} onClick={(e) => e.stopPropagation()}>
        <button className="fk-x" onClick={onClose} aria-label="Close">×</button>
        <h2>The day I felt {c.feeling?.toLowerCase() ?? 'something'}</h2>
        <p className="fk-ago">{agoLabel(c.day)}</p>
        {c.drawing && <img className="fk-draw" src={c.drawing} alt="What I drew" />}
        {c.body && c.body.length > 0 && <p><b>I felt it in my</b> {c.body.join(', ').toLowerCase()}.</p>}
        {c.story && <p><b>My mind said</b> “{c.story}”</p>}
        {c.eyes && <p><b>My eyes saw</b> {c.eyes}</p>}
        {c.other && <p className="fk-other"><b>✨ The other story I found</b> {c.other}</p>}
        <p className="fk-chirpy">Look how brave you were to look inside. I’m proud of you!</p>
      </motion.article>
    </motion.div>
  );
}

/** Each finished feeling journey becomes a glowing orb on a shelf in My Corner. */
export function FeelingKeepsakes({ fresh }: { fresh?: boolean }) {
  const reduced = useReducedMotion();
  const cases = useMemo(() => loadCases(), []);
  const newest = cases[0];
  const celebrate = !!fresh && !!newest?.id && seenId() !== newest.id;
  const [intro, setIntro] = useState(celebrate && !reduced);
  const [open, setOpen] = useState<Case | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  if (!cases.length) return null;
  const others = cases.filter((c) => c.other).length;
  const shown = cases.slice(0, 8);

  const finishIntro = () => { setIntro(false); if (newest?.id) markSeen(newest.id); };

  return (
    <>
      <aside className={`fk-shelf ${collapsed ? 'is-collapsed' : ''}`} aria-label="My feeling keepsakes">
        <button className="fk-title" onClick={() => setCollapsed((v) => !v)} aria-expanded={!collapsed}>
          🔮 My Feeling Keepsakes <small>{cases.length} {cases.length === 1 ? 'journey' : 'journeys'}</small>
        </button>
        {!collapsed && (
          <>
            <div className="fk-row">
              {shown.map((c, i) => (
                <Orb key={c.id ?? i} c={c} i={i} fresh={celebrate && i === 0}
                  onOpen={() => { sound.play('tap'); setOpen(c); }} />
              ))}
            </div>
            <div className="fk-plank" aria-hidden="true" />
            {others > 0 && <p className="fk-learnt">You’ve found {others} other {others === 1 ? 'story' : 'stories'} so far ✨</p>}
          </>
        )}
      </aside>

      <AnimatePresence>
        {intro && newest && (
          <motion.div className="fk-intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={finishIntro}
            role="status">
            <div className="fk-intro-card">
              <h2>You finished a feeling journey!</h2>
              <p>I turned it into a keepsake so it can glow on your shelf. You can open it any time you want to remember.</p>
              <button onClick={finishIntro}>Show me ✨</button>
            </div>
          </motion.div>
        )}
        {open && <Memory c={open} onClose={() => setOpen(null)} />}
      </AnimatePresence>
    </>
  );
}
