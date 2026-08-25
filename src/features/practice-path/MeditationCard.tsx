import { useEffect, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import styles from './Triptych.module.css';
import { ringBell } from './bell';
import type { PracticeDay } from './usePracticeDay';
import type { Invocation } from './dailyRhythm';
import { practiceDayNumber, practiceWeekNumber } from './practiceOfWeek';
import { techniqueForWeek, techniqueWeekLabel, TECH_ANGLE_LABELS } from './techniques';

interface MeditationCardProps {
  day: PracticeDay | null;
  patch: (p: Partial<PracticeDay>) => void;
  invocation: Invocation;
  teaching: string;
  onShuffleInvocation: () => void;
  onShuffleTeaching: () => void;
  onBeginSit: (minutes: number) => void;
  virtueName: string;
  onOpenJournal?: () => void;
}

/** The three pre-sit checks, in the order Inner Journey lists them. */
const PRESIT = [
  ['breath', 'Steady, deep breathing', 'Slow the breath to quieten the nervous system before you begin.'],
  ['posture', 'Settle the posture and the hands', 'Spine upright but not rigid. Hold the hands lightly, not resting heavily.'],
  ['connect', 'Connect before you close the eyes', 'Take a moment with whatever you hold sacred — let it settle in the heart, not just the mind.'],
] as const;

/**
 * "Today's meditation" — the third centre card, and the only one that flips.
 *
 * Front is the overview (what today's sit is and why, plus the three sacred
 * attitudes on their own inner flip). Back is the sit itself: prepare, begin,
 * log. Flipping is driven by real buttons on both faces, never hover, so the
 * back is reachable on a touch device; Escape returns to the front.
 */
export function MeditationCard({
  day, patch, invocation, teaching,
  onShuffleInvocation, onShuffleTeaching, onBeginSit, virtueName, onOpenJournal,
}: MeditationCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [attFlipped, setAttFlipped] = useState(false);
  const [sitMinutes, setSitMinutes] = useState(20);

  useEffect(() => {
    if (!flipped && !attFlipped) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (attFlipped) setAttFlipped(false);
      else setFlipped(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [flipped, attFlipped]);

  const week = practiceWeekNumber();
  const dayN = practiceDayNumber();
  // The technique rotates on its OWN cycle — it is the method for the sit,
  // not the practice being carried into the day.
  const technique = techniqueForWeek(week);
  const angleIdx = Math.min(Math.max(dayN, 1), 7) - 1;

  return (
    <section className={cn(styles.card, styles.cardMed)}>
      <div className={cn(styles.medInner, flipped && styles.flipped)}>

        {/* ── FRONT · the overview ──────────────────────────────── */}
        <div className={cn(styles.medFace, styles.medFront)} aria-hidden={flipped}>
          <div className={styles.cmHead}>
            <div className={styles.cap}>🧘 Today's meditation</div>
            <button
              className={styles.ghostlink}
              onClick={() => setFlipped(true)}
              aria-expanded={flipped}
            >
              Meditation →
            </button>
          </div>

          <div>
            <div className={styles.cmTechLabel}>Today's meditation technique</div>
            <div className={styles.cmTechName}>{technique.name}</div>
            <div className={styles.cmTechWeek}>{techniqueWeekLabel(week)}</div>

            <div className={styles.bLabel}>{TECH_ANGLE_LABELS[angleIdx]}</div>
            <div className={styles.bText}>{technique.angles[angleIdx]}</div>

            <div className={styles.bLabel}>Why we practise it</div>
            <div className={styles.bText}>{technique.why}</div>
          </div>

          <div className={styles.cmRule} />

          {/* Love · Focus · Surrender — its own flip, inside the card */}
          <div className={styles.attWrap}>
            <div className={cn(styles.attFlip, attFlipped && styles.flipped)}>

              <div className={cn(styles.attFace, styles.attFront)} aria-hidden={attFlipped}>
                <div className={styles.attHead}>
                  <span>Love · Focus · Surrender</span>
                  <button className={styles.ghostlink} onClick={() => setAttFlipped(true)}>
                    Know more →
                  </button>
                </div>
                <div className={cn(styles.bLabel, 'mt-0')}>Today's reminder</div>
                <div className={styles.bText}>{teaching}</div>
                <div className={styles.bLabel}>Today's prayer</div>
                <div className={styles.bQuote}>{invocation.close}</div>
                <button className={styles.again} onClick={onShuffleTeaching}>
                  <RefreshCw size={10} className="inline mr-1 -mt-0.5" />another
                </button>
              </div>

              <div className={cn(styles.attFace, styles.attBack)} aria-hidden={!attFlipped}>
                <div className={styles.attHead}>
                  <span>The three sacred attitudes</span>
                  <button
                    className={styles.ghostlink}
                    onClick={() => setAttFlipped(false)}
                    aria-label="Back to today's reminder"
                  >
                    Back ←
                  </button>
                </div>
                <div className={styles.attScroll}>
                  {([
                    ['Love', invocation.love, styles.attLove],
                    ['Focus', invocation.focus, styles.attFocus],
                    ['Surrender', invocation.surrender, styles.attSurrender],
                  ] as const).map(([name, text, cls]) => (
                    <div key={name} className={cn(styles.attPart, cls)}>
                      <div className={styles.apName}>{name}</div>
                      <div className={styles.apText}>{text}</div>
                    </div>
                  ))}
                  <div className={styles.attClose}>{invocation.close}</div>
                  <button className={styles.again} onClick={onShuffleInvocation}>
                    <RefreshCw size={10} className="inline mr-1 -mt-0.5" />another invocation
                  </button>
                </div>
              </div>

            </div>
          </div>

          <button
            onClick={() => patch({ invocationRead: !day?.invocationRead })}
            className={cn(
              styles.inlineCheck,
              'flex items-center gap-2.5 w-full rounded-xl border px-3 py-2.5 text-[13.5px] transition-colors',
              day?.invocationRead
                ? 'border-[var(--done-accent-line)] bg-[var(--done-accent-soft)] text-[var(--done-accent)]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-input)] text-[var(--text-primary)]',
            )}
          >
            <span className={cn('w-4 h-4 rounded grid place-items-center border flex-shrink-0',
              day?.invocationRead ? 'bg-[var(--done-accent)] border-[var(--done-accent)]' : 'border-[var(--text-muted)]')}>
              {day?.invocationRead && <Check size={11} className="text-[var(--on-accent)]" strokeWidth={3} />}
            </span>
            I read the invocation aloud
          </button>
        </div>

        {/* ── BACK · the sit ───────────────────────────────────── */}
        <div className={cn(styles.medFace, styles.medBack)} aria-hidden={!flipped}>
          <div className={styles.cmHead}>
            <div className={styles.cap}>🧘 Meditation</div>
            <button className={styles.ghostlink} onClick={() => setFlipped(false)}>
              Overview ←
            </button>
          </div>

          <div className={styles.cmPrepHead}>Prepare to sit</div>
          <div className={styles.presit}>
            {PRESIT.map(([key, title, sub]) => {
              const on = !!day?.[key];
              return (
                <button
                  key={key}
                  onClick={() => patch({ [key]: !on })}
                  className={cn(styles.presitItem, on && styles.checked)}
                >
                  <span className={cn('w-4 h-4 mt-0.5 rounded-full grid place-items-center border flex-shrink-0',
                    on ? 'bg-[var(--done-accent)] border-[var(--done-accent)]' : 'border-[var(--text-muted)]')}>
                    {on && <Check size={11} className="text-[var(--on-accent)]" strokeWidth={3} />}
                  </span>
                  <span>
                    <span className={cn(styles.piText, 'block')}>{title}</span>
                    <span className={cn(styles.piSub, 'block')}>{sub}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <select
              value={sitMinutes}
              onChange={(e) => setSitMinutes(Number(e.target.value))}
              aria-label="Sit length in minutes"
              className="rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] px-2.5 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
            >
              {[5, 10, 15, 20, 25, 30, 40, 45, 60].map((m) => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </select>
            <button
              onClick={() => ringBell('start')}
              title="Hear the bell"
              className="px-3 py-2 rounded-full text-[13px] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              🔔
            </button>
            <span className="text-[11.5px] text-[var(--text-muted)]">
              A bell sounds at the start and the end.
            </span>
          </div>

          <button className={styles.btnBegin} onClick={() => onBeginSit(sitMinutes)}>
            Begin meditation
          </button>

          <div className={styles.cmRule} />

          <div className={styles.cmLogHead}>Reflect &amp; log</div>

          <div className="flex items-center gap-3 flex-wrap mb-3">
            <button
              onClick={() => patch({ sat: !day?.sat })}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[12.5px] font-medium border transition-colors',
                day?.sat
                  ? 'border-[var(--done-accent-line)] bg-[var(--done-accent-soft)] text-[var(--done-accent)]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              )}
            >
              <span className={cn('w-3.5 h-3.5 rounded-full grid place-items-center border',
                day?.sat ? 'bg-[var(--done-accent)] border-[var(--done-accent)]' : 'border-[var(--text-muted)]')}>
                {day?.sat && <Check size={9} className="text-[var(--on-accent)]" strokeWidth={3.5} />}
              </span>
              {day?.sat ? 'Sat today ✓' : 'I sat today'}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pp-min" className={cn(styles.bLabel, 'block mt-0')}>Minutes</label>
              <input
                id="pp-min"
                type="number"
                min={0}
                step={5}
                value={day?.minutes ?? ''}
                onChange={(e) => patch({ minutes: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="20"
                className="w-full rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] px-3 py-2.5 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
            <div>
              <span className={cn(styles.bLabel, 'block mt-0')}>Settledness</span>
              <div className="flex gap-2" role="group" aria-label="Settledness 1 to 5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => patch({ settled: day?.settled === n ? undefined : n })}
                    className={cn(
                      'w-9 h-9 rounded-full border text-[13px] transition-colors',
                      day?.settled === n
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label htmlFor="pp-refl" className={cn(styles.bLabel, 'block')}>
            What did you notice?
          </label>
          <textarea
            id="pp-refl"
            value={day?.reflection ?? ''}
            onChange={(e) => patch({ reflection: e.target.value })}
            rows={3}
            placeholder={`Where did ${virtueName.toLowerCase()} show up today — or not?`}
            className="w-full rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] px-3 py-2.5 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] resize-y"
          />
          <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
            Saved automatically. Private to you.
          </p>

          {onOpenJournal && (
            <button onClick={onOpenJournal} className={cn(styles.ghostlink, 'mt-3')}>
              Open the full journal →
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
