import { useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import styles from './Triptych.module.css';
import { virtueOfWeek, prayerOfDay, todayKey } from './dailyRhythm';
import { SIXFOLD } from './sixfold';
import { VIRTUES } from './virtues';
import {
  DAY_ANGLES, dayContentFor, practiceDayNumber, practiceWeekNumber,
  practicePrayer, weekBounds, formatWeekRange, type Practice,
} from './practiceOfWeek';

/**
 * "This week" — the virtue and the practice as ONE card split by a rule,
 * exactly as Inner Journey places them, rather than two separate flip cards.
 *
 * The two are meant to be read together: the quality to cultivate on the
 * left, the behaviour that carries it on the right. Depth opens INLINE
 * beneath the split (cwMore) instead of flipping the card over, so the
 * pillar stays on screen while the day's practice is being worked through.
 */

function DotRow({ states, todayIdx }: {
  states: ('none' | 'engaged' | 'practised')[]; todayIdx: number;
}) {
  return (
    <div className="flex gap-1.5 my-3">
      {states.map((s, i) => (
        <span
          key={i}
          className={cn(
            'flex-1 h-1.5 rounded-full transition-colors',
            s === 'practised' ? 'bg-[var(--done-accent)]'
              : s === 'engaged' ? 'bg-[var(--accent-primary)]'
                : 'bg-[var(--border-subtle)]',
            i === todayIdx && 'ring-2 ring-[var(--accent-primary)]/30',
          )}
        />
      ))}
    </div>
  );
}

function PillCheck({ done, onClick, label, doneLabel }: {
  done: boolean; onClick: () => void; label: string; doneLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[12.5px] font-medium border transition-colors',
        done
          ? 'border-[var(--done-accent-line)] bg-[var(--done-accent-soft)] text-[var(--done-accent)]'
          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
      )}
    >
      <span className={cn('w-3.5 h-3.5 rounded-full grid place-items-center border',
        done ? 'bg-[var(--done-accent)] border-[var(--done-accent)]' : 'border-[var(--text-muted)]')}>
        {done && <Check size={9} className="text-[var(--on-accent)]" strokeWidth={3.5} />}
      </span>
      {done ? doneLabel : label}
    </button>
  );
}

interface WeekCardProps {
  virtueDays: number;
  virtueDoneToday: boolean;
  onToggleVirtue: () => void;
  onOpenVirtue: () => void;

  practice: Practice | null;
  practiceWeekStates: ('none' | 'engaged' | 'practised')[];
  practiceDoneToday: boolean;
  onTogglePractice: () => void;
  onOpenPractice: () => void;
  practiceReflection: string;
  onSaveReflection: (text: string) => void;
  carried?: { text: string; week: number; gap: number } | null;
  resurfaced?: { gap: number; lastReflection?: string } | null;
  onOpenSixfold: (key: string) => void;
}

export function WeekCard(p: WeekCardProps) {
  const date = new Date();
  const dateKey = todayKey(date);
  const virtue = virtueOfWeek(date);
  const [open, setOpen] = useState(false);
  const [wayShuffle, setWayShuffle] = useState(0);
  const [prayerShuffle, setPrayerShuffle] = useState(0);
  const [reflDraft, setReflDraft] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const week = practiceWeekNumber();
  const dayN = practiceDayNumber();
  const angle = DAY_ANGLES[Math.max(0, dayN - 1)];
  const content = p.practice ? dayContentFor(p.practice, Math.max(1, dayN)) : null;
  const bounds = week >= 1 ? weekBounds(week) : null;
  const explored = p.practiceWeekStates.filter((s) => s !== 'none').length;
  const alignedFlow = SIXFOLD.find((s) => s.key === p.practice?.alignSixfold) ?? null;
  const alignedVirtue = VIRTUES.find((v) => v.key === p.practice?.alignVirtue) ?? null;

  const virtueStates = Array.from({ length: 7 }, (_, i) =>
    (i < p.virtueDays ? 'practised' : 'none') as 'none' | 'practised');

  return (
    <section className={cn(styles.card, styles.cardWeek)}>
      <div className={styles.cap}>This week</div>

      <div className={styles.cwSplit}>
        {/* ── the quality ─────────────────────────────────────────── */}
        <div className={cn(styles.cwHalf, styles.cwVirtue)}>
          <div className={styles.cwKind}>
            <span className={cn(styles.capDot, styles.vDot)} />Virtue
          </div>
          <div className={styles.cwName}>{virtue.name}</div>
          <div className={styles.cwRole}>The quality to cultivate</div>

          <div className={styles.cwInvite}>
            <div className={styles.ftLabel}>Today</div>
            <div className={styles.ftText}>{prayerOfDay(virtue, date)}</div>
          </div>

          <DotRow states={virtueStates} todayIdx={(date.getDay() + 6) % 7} />

          <div className={styles.cwAct}>
            <PillCheck
              done={p.virtueDoneToday}
              onClick={p.onToggleVirtue}
              label="Practised today"
              doneLabel="Practised ✓"
            />
            <button className={styles.ghostlink} onClick={p.onOpenVirtue}>Explore →</button>
          </div>
        </div>

        <div className={styles.cwDiv} />

        {/* ── the behaviour ───────────────────────────────────────── */}
        <div className={cn(styles.cwHalf, styles.cwPractice)}>
          <div className={styles.cwKind}>
            <span className={cn(styles.capDot, styles.pDot)} />Practice
          </div>

          {!p.practice ? (
            <>
              <div className={styles.cwName}>Not set</div>
              <div className={styles.cwRole}>No practice for this week yet</div>
              <div className={styles.cwAct}>
                <button className={styles.ghostlink} onClick={p.onOpenPractice}>
                  Add this week's practice →
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.cwName}>{p.practice.title}</div>
              <div className={styles.cwRole}>
                Week {week}{bounds ? ` · ${formatWeekRange(bounds.start, bounds.end)}` : ''}
              </div>

              {/* Alignment tags carry their KIND as well as their name —
                  "Sixfold Path · Right Intention" reads as a relationship,
                  where a bare pill reads as an unexplained label. */}
              <div className={styles.alignRow}>
                {alignedFlow && (
                  <button
                    onClick={() => p.onOpenSixfold(alignedFlow.key)}
                    className={cn(styles.alignTag, styles.alignSixfold)}
                  >
                    <span className={styles.atKind}>Sixfold Path</span>
                    <span className={styles.atName}>{alignedFlow.glyph} {alignedFlow.name}</span>
                  </button>
                )}
                {alignedVirtue && (
                  <button
                    onClick={p.onOpenVirtue}
                    className={cn(styles.alignTag, styles.alignVirtue)}
                  >
                    <span className={styles.atKind}>Virtue</span>
                    <span className={styles.atName}>🪷 {alignedVirtue.name}</span>
                  </button>
                )}
              </div>

              <div className={styles.cwInvite}>
                <div className={styles.ftLabel}>Day {dayN} · {angle?.label}</div>
                <div className={styles.ftText}>{content?.invitation}</div>
              </div>

              <DotRow states={p.practiceWeekStates} todayIdx={dayN - 1} />
              <div className="text-[11px] text-[var(--text-muted)]">
                {explored === 0
                  ? 'Not yet explored this week.'
                  : `${explored} ${explored === 1 ? 'day' : 'days'} explored`}
              </div>

              <div className={styles.cwAct}>
                <PillCheck
                  done={p.practiceDoneToday}
                  onClick={p.onTogglePractice}
                  label="I practised this today"
                  doneLabel="Practised ✓"
                />
                <button
                  className={styles.ghostlink}
                  onClick={() => setOpen((o) => !o)}
                  aria-expanded={open}
                >
                  {open ? 'Close ←' : 'Practise →'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── depth, revealed in place ──────────────────────────────── */}
      {open && p.practice && content && (
        <div className={styles.cwMore}>
          {p.carried && (
            <div className="rounded-xl border border-[var(--done-accent-line)] bg-[var(--done-accent-soft)] p-3 mb-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--done-accent)] mb-1">
                ↝ Carried forward
              </div>
              <p className="text-[14px] font-serif italic text-[var(--text-primary)] leading-relaxed">
                “{p.carried.text}”
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                From week {p.carried.week}{p.carried.gap > 1 ? ` · ${p.carried.gap} weeks ago` : ''}
              </p>
            </div>
          )}

          {p.resurfaced && (
            <div className="rounded-xl border border-[var(--virtue-accent-line)] bg-[var(--virtue-accent-soft)] p-3 mb-3">
              <div className="text-[12.5px] font-semibold text-[var(--virtue-accent)] mb-1">
                ↻ You've worked with this before.
              </div>
              <p className="text-[12.5px] text-[var(--text-secondary)]">
                Last explored {p.resurfaced.gap} week{p.resurfaced.gap === 1 ? '' : 's'} ago.
              </p>
              {p.resurfaced.lastReflection && (
                <p className="text-[12.5px] font-serif italic text-[var(--text-secondary)] mt-1.5">
                  Last time you noticed: “{p.resurfaced.lastReflection}”
                </p>
              )}
            </div>
          )}

          <div className={styles.bLabel}>Today's focus</div>
          <div className={styles.bText}>{content.focus}</div>

          <div className={styles.bLabel}>A way to explore</div>
          <div className={styles.bText}>{content.explore}</div>

          <div className={styles.bLabel}>Inspiration</div>
          <div className={styles.bQuote}>{content.inspiration}</div>

          <div className={styles.bLabel}>Ways to practise</div>
          <div className="space-y-1.5">
            {([['morning', '☀', 'Morning'], ['day', '💬', 'During the day'], ['evening', '🌙', 'Evening']] as const)
              .map(([k, icon, label]) => {
                const arr = content.ways[k] ?? [];
                return (
                  <div key={k} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
                    <div className="text-[10.5px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">
                      {icon} {label}
                    </div>
                    <p className="text-[12.5px] text-[var(--text-primary)] leading-relaxed">
                      {arr.length ? arr[wayShuffle % arr.length] : '—'}
                    </p>
                  </div>
                );
              })}
          </div>
          <button className={styles.again} onClick={() => setWayShuffle((s) => s + 1)}>
            <RefreshCw size={10} className="inline mr-1 -mt-0.5" />another way
          </button>

          <div className={styles.bLabel}>What did I notice?</div>
          <textarea
            value={reflDraft ?? p.practiceReflection}
            onChange={(e) => { setReflDraft(e.target.value); setSaved(false); }}
            rows={3}
            placeholder="A word, a moment, an observation…"
            className="w-full rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] resize-y"
          />
          <div className={styles.cwAct}>
            <button
              onClick={() => {
                p.onSaveReflection(reflDraft ?? p.practiceReflection);
                setReflDraft(null);
                setSaved(true);
              }}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-bold bg-[var(--accent-solid)] text-[var(--on-accent)] hover:opacity-90"
            >
              Save reflection
            </button>
            {saved && <span className="text-[12px] text-[var(--done-accent)]">Saved</span>}
            <button className={styles.ghostlink} onClick={p.onOpenPractice}>Full practice →</button>
          </div>

          <div className="mt-4 rounded-xl border border-[var(--practice-accent-line)] bg-[var(--practice-accent-soft)] p-3">
            <div className={cn(styles.bLabel, 'mt-0')}>A prayer for today</div>
            <div className={styles.bQuote}>
              {practicePrayer(angle?.key ?? 'ARRIVE', p.practice, dateKey, prayerShuffle)}
            </div>
            <button className={styles.again} onClick={() => setPrayerShuffle((s) => s + 1)}>
              <RefreshCw size={10} className="inline mr-1 -mt-0.5" />another prayer
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
