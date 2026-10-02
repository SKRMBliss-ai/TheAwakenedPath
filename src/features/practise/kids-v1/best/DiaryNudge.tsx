import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { FONT } from '../ui/chrome';
import { useQuiet } from '../ui/quiet';
import { useDiaryFilledToday, DIARY_NUDGES } from '../kit/diaryToday';
import { speak } from '../kit/chirpyVoice';
import * as sound from '../kit/sound';
import './DiaryNudge.css';

/* Rooms speak their own lines on arrival, so the diary only asks out loud on
   the home page, and not every single time a child walks back through it. */
let lastSpoken = 0;
let rotation = Math.floor(Math.random() * DIARY_NUDGES.length);

export function DiaryNudge({ onOpen, speakAloud = false }: { onOpen: () => void; speakAloud?: boolean }) {
  const filled = useDiaryFilledToday();
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const [line] = useState(() => DIARY_NUDGES[rotation++ % DIARY_NUDGES.length]);
  const [small, setSmall] = useState(false);

  useEffect(() => {
    if (filled || quiet || !speakAloud || Date.now() - lastSpoken < 120_000) return;
    const timer = window.setTimeout(() => {
      if (document.querySelector('dialog[open]')) return;
      lastSpoken = Date.now();
      speak(line, quiet);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [filled, quiet, speakAloud, line]);

  if (filled || quiet) return null;

  const go = () => { sound.play('discovery'); onOpen(); };

  if (small) {
    return <button className={`dn-nudge dn-small ${reduced ? 'dn-still' : ''}`} style={{ fontFamily: FONT }} onClick={go}
      aria-label="Today’s diary page is still empty. Open My Inner Diary">
      <span className="dn-book" aria-hidden="true">📖</span><span className="dn-dot" aria-hidden="true" />
    </button>;
  }

  return <div className={`dn-nudge ${reduced ? 'dn-still' : ''}`} style={{ fontFamily: FONT }} role="status">
    <button className="dn-main" onClick={go}>
      <span className="dn-book" aria-hidden="true">📖</span>
      <span className="dn-text"><b>{line}</b><small>Fill in today’s diary →</small></span>
    </button>
    <button className="dn-hide" onClick={() => setSmall(true)} aria-label="Make the diary reminder smaller">–</button>
  </div>;
}
