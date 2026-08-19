import { useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FlipCard, FlipBackScroll } from './FlipCard';
import { virtueOfWeek, prayerOfDay, ideasOfDay, todayKey, isoWeek } from './dailyRhythm';
import { SIXFOLD, sixfoldOfWeek, sixfoldDayIndex } from './sixfold';
import {
  DAY_ANGLES, dayContentFor, practiceDayNumber, practiceWeekNumber,
  practicePrayer, weekBounds, formatWeekRange, type Practice,
} from './practiceOfWeek';

const LABEL = 'text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]';

function Ring({ done, total = 7, size = 46 }: { done: number; total?: number; size?: number }) {
  const full = done >= total;
  return (
    <div className="relative flex-shrink-0 grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" style={{ width: size, height: size }}>
        <circle cx="22" cy="22" r="18" fill="none" strokeWidth="3.5" className="stroke-[var(--border-subtle)]" />
        <circle
          cx="22" cy="22" r="18" fill="none" strokeWidth="3.5" strokeLinecap="round"
          stroke={full ? 'var(--done-accent)' : 'var(--accent-primary)'}
          strokeDasharray={113} strokeDashoffset={113 - (Math.min(done, total) / total) * 113}
        />
      </svg>
      <span className={cn('text-[10px] font-bold', full ? 'text-[var(--done-accent)]' : 'text-[var(--accent-primary)]')}>
        {Math.min(done, total)}/{total}
      </span>
    </div>
  );
}

function DotRow({ states, todayIdx }: { states: ('none' | 'engaged' | 'practised')[]; todayIdx: number }) {
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

function CheckPill({ done, onClick, label, doneLabel }: {
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

interface TwoPillarsProps {
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
  /** Carried forward from a previous week, if any. */
  carried?: { text: string; week: number; gap: number } | null;
  /** Set when this practice has been seen before. */
  resurfaced?: { gap: number; lastReflection?: string } | null;
  onOpenSixfold: (key: string) => void;
}

export function TwoPillars(p: TwoPillarsProps) {
  const date = new Date();
  const dateKey = todayKey(date);
  const virtue = virtueOfWeek(date);
  const flow = sixfoldOfWeek(isoWeek(date));
  const [wayShuffle, setWayShuffle] = useState(0);
  const [prayerShuffle, setPrayerShuffle] = useState(0);
  const [reflDraft, setReflDraft] = useState<string | null>(null);

  const week = practiceWeekNumber();
  const dayN = practiceDayNumber();
  const angle = DAY_ANGLES[Math.max(0, dayN - 1)];
  const content = p.practice ? dayContentFor(p.practice, Math.max(1, dayN)) : null;
  const bounds = week >= 1 ? weekBounds(week) : null;

  const virtueStates = Array.from({ length: 7 }, (_, i) =>
    (i < p.virtueDays ? 'practised' : 'none') as 'none' | 'practised');

  return (
    <div className="space-y-4">
      <p className={cn(LABEL, 'text-center')}>The two pillars</p>

      <div className="grid gap-4 md:grid-cols-2 items-stretch">
        {/* ── PILLAR 1 · VIRTUE ─────────────────────────────────────── */}
        <FlipCard
          faceStyle={{ background: 'linear-gradient(158deg, var(--virtue-accent-soft), transparent 62%, transparent)' }}
          front={(flip) => (
            <>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--virtue-accent)]" />
                <span className={LABEL}>Virtue of the week</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[24px] font-serif font-light text-[var(--text-primary)] leading-tight">
                  {virtue.name}
                </h2>
                <Ring done={p.virtueDays} />
              </div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-1.5">
                {virtue.desc.split('—')[0].trim()}
              </p>

              <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] flex-1">
                <div className={cn(LABEL, 'mb-1.5')}>Today</div>
                <p className="text-[14.5px] font-serif italic text-[var(--text-primary)] leading-relaxed">
                  {prayerOfDay(virtue, date)}
                </p>
              </div>

              <DotRow states={virtueStates} todayIdx={(date.getDay() + 6) % 7} />

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border-subtle)] flex-wrap">
                <CheckPill
                  done={p.virtueDoneToday} onClick={p.onToggleVirtue}
                  label="Practised today" doneLabel="Practised ✓"
                />
                <button onClick={flip} className="text-[12.5px] text-[var(--accent-primary)] hover:underline">
                  Explore →
                </button>
              </div>
            </>
          )}
          back={(flip) => (
            <>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--virtue-accent)]" />
                <span className={LABEL}>{virtue.name}</span>
                <button onClick={flip} className="ml-auto text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕</button>
              </div>
              <FlipBackScroll>
                <div className={LABEL}>What this cultivates</div>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-1 mb-3">{virtue.desc}</p>
                <div className={LABEL}>Ways into it today</div>
                <div className="space-y-1.5 mt-1.5">
                  {ideasOfDay(virtue, date).map((idea) => (
                    <div key={idea.place} className="flex gap-2 items-start rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 p-2.5">
                      <span className="text-[14px] leading-none mt-0.5">{idea.icon}</span>
                      <p className="text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
                        <strong className="text-[var(--text-primary)]">{idea.place}</strong> — {idea.how}
                      </p>
                    </div>
                  ))}
                </div>
                <div className={cn(LABEL, 'mt-3')}>This week</div>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                  {p.virtueDays} of 7 days{p.virtueDays >= 7 ? ' · embedded' : ''}
                </p>
              </FlipBackScroll>
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <button onClick={p.onOpenVirtue} className="text-[12.5px] text-[var(--accent-primary)] hover:underline">
                  See all nine virtues →
                </button>
              </div>
            </>
          )}
        />

        {/* ── PILLAR 2 · PRACTICE ───────────────────────────────────── */}
        <FlipCard
          faceStyle={{ background: 'linear-gradient(158deg, var(--practice-accent-soft), rgba(131,184,160,.04) 62%, transparent)' }}
          front={(flip) => (
            <>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                <span className={LABEL}>Practice of the week</span>
              </div>
              {!p.practice ? (
                <div className="flex-1 grid place-items-center text-center py-8">
                  <div>
                    <p className="text-[15px] font-serif italic text-[var(--text-secondary)]">
                      No practice set for this week yet.
                    </p>
                    <button onClick={p.onOpenPractice} className="text-[12.5px] text-[var(--accent-primary)] hover:underline mt-2">
                      Add this week's practice →
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-[24px] font-serif font-light text-[var(--text-primary)] leading-tight">
                    {p.practice.title}
                  </h2>
                  <p className="text-[11.5px] text-[var(--text-muted)] mt-1">
                    Week {week}{bounds ? ` · ${formatWeekRange(bounds.start, bounds.end)}` : ''}
                  </p>

                  {/* alignment tags */}
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {p.practice.alignSixfold && (
                      <button
                        onClick={() => p.onOpenSixfold(p.practice!.alignSixfold!)}
                        className="text-[10.5px] px-2 py-1 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                      >
                        {SIXFOLD.find((s) => s.key === p.practice!.alignSixfold)?.name ?? 'Sixfold'}
                      </button>
                    )}
                    {p.practice.alignVirtue && (
                      <span className="text-[10.5px] px-2 py-1 rounded-full border border-[var(--virtue-accent-line)] bg-[var(--virtue-accent)]/10 text-[var(--virtue-accent)]">
                        {p.practice.alignVirtue}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] flex-1">
                    <div className={cn(LABEL, 'mb-1.5')}>Day {dayN} · {angle?.label}</div>
                    <p className="text-[14.5px] text-[var(--text-primary)] leading-relaxed">
                      {content?.invitation}
                    </p>
                  </div>

                  <DotRow states={p.practiceWeekStates} todayIdx={dayN - 1} />
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {p.practiceWeekStates.filter((s) => s !== 'none').length === 0
                      ? 'Not yet explored this week.'
                      : `${p.practiceWeekStates.filter((s) => s !== 'none').length} days explored`}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[var(--border-subtle)] flex-wrap">
                    <CheckPill
                      done={p.practiceDoneToday} onClick={p.onTogglePractice}
                      label="Practised today" doneLabel="Practised ✓"
                    />
                    <button onClick={flip} className="text-[12.5px] text-[var(--accent-primary)] hover:underline">
                      Practise →
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          back={(flip) => (
            <>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                <span className={LABEL}>Right now</span>
                <button onClick={flip} className="ml-auto text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕</button>
              </div>
              <FlipBackScroll>
                {p.carried && (
                  <div className="rounded-xl border border-[var(--done-accent-line)] bg-[var(--done-accent-soft)] p-3 mb-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--done-accent)] mb-1">↝ Carried forward</div>
                    <p className="text-[14px] font-serif italic text-[var(--text-primary)] leading-relaxed">“{p.carried.text}”</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                      From week {p.carried.week}{p.carried.gap > 1 ? ` · ${p.carried.gap} weeks ago` : ''}
                    </p>
                  </div>
                )}
                {p.resurfaced && (
                  <div className="rounded-xl border border-[var(--virtue-accent-line)] bg-[var(--virtue-accent)]/8 p-3 mb-3">
                    <div className="text-[12.5px] font-semibold text-[var(--virtue-accent)] mb-1">↻ You've worked with this before.</div>
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

                <div className={LABEL}>Today's focus</div>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-1 mb-3">{content?.focus}</p>

                <div className={LABEL}>A way to explore</div>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mt-1 mb-3">{content?.explore}</p>

                {p.practice && (
                  <div className="rounded-xl border border-[var(--accent-primary)]/35 bg-[var(--accent-primary)]/8 p-3 mb-3">
                    <div className={LABEL}>A prayer for today</div>
                    <p className="text-[14px] font-serif italic text-[var(--text-primary)] leading-relaxed mt-1">
                      {practicePrayer(angle?.key ?? 'ARRIVE', p.practice, dateKey, prayerShuffle)}
                    </p>
                    <button
                      onClick={() => setPrayerShuffle((s) => s + 1)}
                      className="flex items-center gap-1 text-[11.5px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] mt-2"
                    >
                      <RefreshCw size={10} /> another prayer
                    </button>
                  </div>
                )}

                <div className={LABEL}>Ways to practise</div>
                <div className="space-y-1.5 mt-1.5">
                  {([['morning', '☀', 'Morning'], ['day', '💬', 'During the day'], ['evening', '🌙', 'Evening']] as const).map(
                    ([k, icon, label]) => {
                      const arr = content?.ways[k] ?? [];
                      return (
                        <div key={k} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 p-2.5">
                          <div className="text-[10.5px] uppercase tracking-wider text-[var(--text-muted)] mb-0.5">{icon} {label}</div>
                          <p className="text-[12.5px] text-[var(--text-primary)] leading-relaxed">
                            {arr.length ? arr[wayShuffle % arr.length] : '—'}
                          </p>
                        </div>
                      );
                    })}
                </div>
                <button
                  onClick={() => setWayShuffle((s) => s + 1)}
                  className="flex items-center gap-1 text-[11.5px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] mt-2"
                >
                  <RefreshCw size={10} /> another way
                </button>

                <div className={cn(LABEL, 'mt-4')}>What did I notice?</div>
                <textarea
                  value={reflDraft ?? p.practiceReflection}
                  onChange={(e) => setReflDraft(e.target.value)}
                  rows={3}
                  placeholder="A word, a moment, an observation…"
                  className="w-full mt-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] resize-y"
                />
                <button
                  onClick={() => { p.onSaveReflection(reflDraft ?? p.practiceReflection); setReflDraft(null); }}
                  className="mt-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold bg-[var(--accent-solid)] text-[var(--on-accent)] hover:opacity-90"
                >
                  Save reflection
                </button>
              </FlipBackScroll>
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <button onClick={p.onOpenPractice} className="text-[12.5px] text-[var(--accent-primary)] hover:underline">
                  See full practice →
                </button>
              </div>
            </>
          )}
        />
      </div>

      {/* ── The wider framework ─────────────────────────────────────── */}
      <div className="flex items-baseline justify-between gap-3 flex-wrap pt-2">
        <span className={LABEL}>The Sixfold Path — the wider framework</span>
        <span className="text-[11.5px] text-[var(--text-secondary)]">
          In focus: <strong>{flow.glyph} {flow.name}</strong>
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {SIXFOLD.map((s) => (
          <button
            key={s.key}
            onClick={() => p.onOpenSixfold(s.key)}
            title={s.essence}
            className={cn(
              'rounded-xl border p-2.5 text-center transition-colors min-h-[72px] flex flex-col items-center justify-center gap-1',
              s.key === flow.key
                ? 'border-[var(--border-default)] bg-[var(--bg-surface)]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 hover:border-[var(--border-default)]',
            )}
          >
            <span className="text-[9.5px] tracking-wider text-[var(--text-muted)]">0{s.num}</span>
            <span className="text-[15px] leading-none">{s.glyph}</span>
            <span className={cn('text-[11px] leading-tight',
              s.key === flow.key ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}>
              {s.name.replace('Right ', '')}
            </span>
          </button>
        ))}
      </div>
      <p className="text-[12.5px] text-[var(--text-secondary)] italic">
        {flow.daily[sixfoldDayIndex(date)]}
      </p>
    </div>
  );
}
