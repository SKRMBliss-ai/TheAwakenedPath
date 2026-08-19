import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import styles from './QuietMode.module.css';

const ATTITUDES = ['Love', 'Focus', 'Surrender'];
const POSTURE = [
  'Asana chosen',
  'Spine straight',
  'Tongue to roof of mouth',
  'Mudra held, above the navel',
];

interface QuietModeProps {
  open: boolean;
  /** Seconds remaining. */
  remaining: number;
  total: number;
  practiceTitle: string;
  /** Lines drawn from the day's ACTUAL practice — never generic filler. */
  lines: string[];
  onExit: () => void;
}

function clock(sec: number) {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * The sit, with everything else removed.
 *
 * Deliberately sparse: a ring, a breath, one line at a time. The rails hold
 * the three attitudes (one lit at a time) and the posture reminders, which
 * surface early then fade — a checklist that stayed lit would keep pulling
 * attention outward for the whole sit.
 */
export function QuietMode({ open, remaining, total, practiceTitle, lines, onExit }: QuietModeProps) {
  const [lineIdx, setLineIdx] = useState(0);
  const [lineVisible, setLineVisible] = useState(false);
  const [attIdx, setAttIdx] = useState(0);
  const [postureLit, setPostureLit] = useState(-1);
  const wakeRef = useRef<any>(null);

  // Rotate the inspiration line slowly — ~50s, with a long fade.
  useEffect(() => {
    if (!open || !lines.length) return;
    setLineIdx(0);
    setLineVisible(false);
    const show = setTimeout(() => setLineVisible(true), 1200);
    const iv = setInterval(() => {
      setLineVisible(false);
      setTimeout(() => {
        setLineIdx((i) => (i + 1) % lines.length);
        setLineVisible(true);
      }, 1400);
    }, 50000);
    return () => { clearTimeout(show); clearInterval(iv); };
  }, [open, lines.length]);

  // One attitude lit at a time, ~40s each.
  useEffect(() => {
    if (!open) return;
    const iv = setInterval(() => setAttIdx((i) => (i + 1) % ATTITUDES.length), 40000);
    return () => clearInterval(iv);
  }, [open]);

  // Posture reminders surface once, early, then settle back.
  useEffect(() => {
    if (!open) { setPostureLit(-1); return; }
    const timers = POSTURE.map((_, i) =>
      setTimeout(() => {
        setPostureLit(i);
        setTimeout(() => setPostureLit((cur) => (cur === i ? -1 : cur)), 5200);
      }, 1200 + i * 1700));
    return () => timers.forEach(clearTimeout);
  }, [open]);

  // Keep the screen awake — a sit is exactly when a phone would lock.
  useEffect(() => {
    if (!open) return;
    let released = false;
    (async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch { /* unsupported or denied — the sit still works */ }
    })();
    return () => {
      released = true;
      try { wakeRef.current?.release?.(); } catch { /* already gone */ }
      wakeRef.current = null;
      void released;
    };
  }, [open]);

  // Escape ends the sit.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onExit(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onExit]);

  if (!open) return null;

  const frac = total > 0 ? Math.max(0, Math.min(1, 1 - remaining / total)) : 0;
  const C = 578;

  return (
    <div className={styles.quiet} role="dialog" aria-modal="true" aria-label="Meditation in progress">
      {/* left rail — the three attitudes */}
      <aside className={cn(styles.rail, styles.railLeft)} aria-label="The three attitudes">
        <span className={styles.railCap}>Hold these</span>
        {ATTITUDES.map((a, i) => (
          <div key={a} className={cn(styles.railItem, i === attIdx && styles.lit)}>
            <span className={styles.railDot} />
            <span className={styles.railName}>{a}</span>
          </div>
        ))}
      </aside>

      <div className={styles.inner}>
        <div className={styles.practiceName}>{practiceTitle}</div>

        <div className={styles.ringWrap}>
          <svg viewBox="0 0 200 200" className={styles.ring} aria-hidden="true">
            <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,.055)" strokeWidth="1.5" />
            <circle
              cx="100" cy="100" r="92" fill="none" stroke="url(#qgrad)"
              strokeWidth="1.5" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C - frac * C}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset .4s linear' }}
            />
            <defs>
              <linearGradient id="qgrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--practice-accent)" />
                <stop offset="100%" stopColor="var(--virtue-accent)" />
              </linearGradient>
            </defs>
          </svg>
          <div className={styles.breath} />
          <div className={styles.time}>{clock(remaining)}</div>
        </div>

        <div className={cn(styles.word, lineVisible && styles.wordShow)}>
          {lines[lineIdx] ?? ''}
        </div>

        <button className={styles.exit} onClick={onExit}>End sit</button>
      </div>

      {/* right rail — posture */}
      <aside className={cn(styles.rail, styles.railRight)} aria-label="Posture reminders">
        <span className={styles.railCap}>Posture</span>
        {POSTURE.map((t, i) => (
          <div key={t} className={cn(styles.railItem, i === postureLit && styles.lit)}>
            <span className={styles.railDot} />
            <span className={styles.railName}>{t}</span>
          </div>
        ))}
      </aside>
    </div>
  );
}
