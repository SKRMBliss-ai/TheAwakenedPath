import { useMemo, useState } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../auth/AuthContext';
import { VIRTUES } from './virtues';
import { SIXFOLD } from './sixfold';
import {
  practiceWeekNumber, practiceDayNumber, weekBounds, formatWeekRange, type Practice,
} from './practiceOfWeek';
import {
  useWeekAssignment, useAddPractice, useAssignPractice, useCarryThread,
} from './usePracticeOfWeek';
import { usePracticeHistory } from './usePracticeDay';

const LABEL = 'text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]';
const FIELD = 'w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2.5 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]';

/**
 * The Practices tab.
 *
 * The add-a-practice form is the load-bearing part: without it every new week
 * would need a code change, which is the difference between something the
 * teacher can run and something only a developer can run.
 */
export function PracticesTab() {
  const { user } = useAuth();
  const uid = user?.uid;
  const week = practiceWeekNumber();
  const { practice, practices, assignments } = useWeekAssignment(week);
  const addPractice = useAddPractice(uid);
  const assignPractice = useAssignPractice();
  const history = usePracticeHistory(uid, 400);
  const thread = useCarryThread(uid);

  const [open, setOpen] = useState<Practice | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    title: '', core: '', purpose: '', instructions: '', dailyLife: '',
    source: '', tags: '', ownWords: '', alignVirtue: '', alignSixfold: '',
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const lines = (s: string) =>
    s.split('\n').map((l) => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

  const submit = async () => {
    if (!form.title.trim() || saving) return;
    setSaving(true);
    setMsg('');
    try {
      await addPractice({
        title: form.title,
        core: form.core,
        purpose: form.purpose,
        instructions: lines(form.instructions),
        dailyLife: lines(form.dailyLife),
        source: form.source,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        ownWords: form.ownWords,
        alignVirtue: form.alignVirtue || undefined,
        alignSixfold: form.alignSixfold || undefined,
      });
      setForm({
        title: '', core: '', purpose: '', instructions: '', dailyLife: '',
        source: '', tags: '', ownWords: '', alignVirtue: '', alignSixfold: '',
      });
      setMsg("Added — it's this week's practice ✓");
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      // The one bare `catch` used to swallow the real error entirely, so a
      // permission-denied write and, say, a network failure looked identical
      // — impossible to tell apart from a screenshot of the toast alone.
      console.error('[PracticesTab] addPractice failed:', err);
      const code = (err as { code?: string })?.code;
      setMsg(
        code === 'permission-denied'
          ? "Could not save — this account isn't set up to add the week's practice yet."
          : 'Could not save. Please try again in a moment.'
      );
    } finally {
      setSaving(false);
    }
  };

  /** Per-practice history, computed from the member's own day records. */
  const statsFor = useMemo(() => (pid: string) => {
    const days = history.filter((h) => h.practiceId === pid);
    const practised = days.filter((d) => d.practicePractised);
    const featured = assignments.filter((a) => a.practiceId === pid);
    return {
      practised: practised.length,
      last: practised.map((d) => d.date).sort().slice(-1)[0],
      resurfaced: featured.filter((a) => a.assignmentType === 'resurfaced').length,
      reflections: days.filter((d) => d.practiceReflection),
      featured,
    };
  }, [history, assignments]);

  const bounds = week >= 1 ? weekBounds(week) : null;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Practices</span>
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-[var(--text-primary)] mt-1">
          The practice library
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-2 max-w-xl leading-relaxed">
          Every practice is kept permanently, word for word. Nothing is ever replaced —
          older practices resurface in later weeks instead.
        </p>
      </div>

      {/* ── Current ── */}
      <div className="rounded-2xl border border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/8 p-5">
        <div className={LABEL}>This week</div>
        {practice ? (
          <>
            <h2 className="text-[20px] font-serif text-[var(--text-primary)] mt-1">{practice.title}</h2>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">
              Week {week}{bounds ? ` · ${formatWeekRange(bounds.start, bounds.end)}` : ''} · Day {practiceDayNumber()} of 7
            </p>
            {practice.core && (
              <p className="text-[14px] font-serif italic text-[var(--text-primary)] mt-3 border-l-2 border-[var(--accent-primary)]/50 pl-3">
                “{practice.core}”
              </p>
            )}
          </>
        ) : (
          <p className="text-[14px] text-[var(--text-secondary)] mt-2">
            No practice set for week {week} yet. Add one below and it becomes this week's practice.
          </p>
        )}
      </div>

      {/* ── Add ── */}
      <details className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
        <summary className="cursor-pointer px-5 py-4 text-[14px] text-[var(--text-primary)]">
          Add this week's practice
        </summary>
        <div className="px-5 pb-5 space-y-4">
          <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed">
            Paste what your teacher gave you. The seven-day journey is built automatically
            from these words — each day reframes them from a different angle. Nothing is invented.
          </p>

          <div>
            <label htmlFor="np-title" className={LABEL}>Practice name</label>
            <input id="np-title" value={form.title} onChange={set('title')} placeholder="e.g. Right Speech" className={cn(FIELD, 'mt-1.5')} />
          </div>

          <div>
            <label htmlFor="np-core" className={LABEL}>Core instruction</label>
            <textarea id="np-core" value={form.core} onChange={set('core')} rows={2}
              placeholder="The single line to carry — in the teacher's own words." className={cn(FIELD, 'mt-1.5 resize-y')} />
          </div>

          <div>
            <label htmlFor="np-purpose" className={LABEL}>Purpose <span className="normal-case text-[var(--text-muted)]">(optional)</span></label>
            <textarea id="np-purpose" value={form.purpose} onChange={set('purpose')} rows={2}
              placeholder="What this practice is for." className={cn(FIELD, 'mt-1.5 resize-y')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="np-inst" className={LABEL}>The practice includes <span className="normal-case text-[var(--text-muted)]">— one per line</span></label>
              <textarea id="np-inst" value={form.instructions} onChange={set('instructions')} rows={4}
                placeholder={'Feeling the meaning\nNoticing without judgment\nGently realigning'} className={cn(FIELD, 'mt-1.5 resize-y')} />
            </div>
            <div>
              <label htmlFor="np-daily" className={LABEL}>Daily-life practice <span className="normal-case text-[var(--text-muted)]">— one per line</span></label>
              <textarea id="np-daily" value={form.dailyLife} onChange={set('dailyLife')} rows={4}
                placeholder={'Pause before speaking\nCheck the motive\nReview the day'} className={cn(FIELD, 'mt-1.5 resize-y')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="np-six" className={LABEL}>Aligned Sixfold flow <span className="normal-case text-[var(--text-muted)]">(optional)</span></label>
              <select id="np-six" value={form.alignSixfold} onChange={set('alignSixfold')} className={cn(FIELD, 'mt-1.5')}>
                <option value="">— none —</option>
                {SIXFOLD.map((s) => <option key={s.key} value={s.key}>{s.glyph} {s.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="np-virtue" className={LABEL}>Aligned virtue <span className="normal-case text-[var(--text-muted)]">(optional)</span></label>
              <select id="np-virtue" value={form.alignVirtue} onChange={set('alignVirtue')} className={cn(FIELD, 'mt-1.5')}>
                <option value="">— none —</option>
                {VIRTUES.map((v) => <option key={v.key} value={v.key}>{v.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="np-source" className={LABEL}>Where it came from <span className="normal-case text-[var(--text-muted)]">(optional)</span></label>
              <input id="np-source" value={form.source} onChange={set('source')} placeholder="Live class, 18 Aug · satsang" className={cn(FIELD, 'mt-1.5')} />
            </div>
            <div>
              <label htmlFor="np-tags" className={LABEL}>Tags <span className="normal-case text-[var(--text-muted)]">(comma separated)</span></label>
              <input id="np-tags" value={form.tags} onChange={set('tags')} placeholder="speech, attention, ego" className={cn(FIELD, 'mt-1.5')} />
            </div>
          </div>

          <div>
            <label htmlFor="np-own" className={LABEL}>In my own words <span className="normal-case text-[var(--text-muted)]">— restating it is half the practice</span></label>
            <textarea id="np-own" value={form.ownWords} onChange={set('ownWords')} rows={2}
              placeholder="What this means to me…" className={cn(FIELD, 'mt-1.5 resize-y')} />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={submit}
              disabled={!form.title.trim() || saving}
              className="px-5 py-2.5 rounded-full text-[13px] font-bold bg-[var(--accent-solid)] text-[var(--on-accent)] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            >
              {saving ? 'Saving…' : "Add practice & start this week"}
            </button>
            {msg && <span className="text-[12.5px] text-[var(--done-accent)]">{msg}</span>}
          </div>
        </div>
      </details>

      {/* ── The thread ── */}
      {thread.length > 0 && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-5">
          <h2 className={LABEL}>The thread</h2>
          <p className="text-[12.5px] text-[var(--text-secondary)] mt-1 mb-3">
            Everything you've carried forward, week after week — one continuous line.
          </p>
          <div className="divide-y divide-[var(--border-subtle)]">
            {thread.map((t) => (
              <div key={t.weekNumber} className="flex gap-3 py-2.5">
                <span className="text-[11.5px] text-[var(--text-muted)] w-16 flex-shrink-0 pt-0.5">Week {t.weekNumber}</span>
                <span className="text-[13.5px] font-serif italic text-[var(--text-primary)] leading-relaxed">“{t.carry}”</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Library ── */}
      <div>
        <h2 className={cn(LABEL, 'mb-3')}>Every practice</h2>
        {practices.length === 0 ? (
          <p className="text-[13px] text-[var(--text-muted)]">Nothing in the library yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {practices.map((p) => {
              const st = statsFor(p.practiceId);
              const isCurrent = practice?.practiceId === p.practiceId;
              return (
                <button
                  key={p.practiceId}
                  onClick={() => setOpen(open?.practiceId === p.practiceId ? null : p)}
                  className={cn(
                    'text-left rounded-2xl border p-4 transition-colors',
                    isCurrent
                      ? 'border-[var(--accent-primary)]/50 bg-[var(--accent-primary)]/8'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 hover:border-[var(--border-default)]',
                  )}
                >
                  {isCurrent && (
                    <span className="inline-block text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--accent-primary)]/50 text-[var(--accent-primary)] mb-2">
                      This week
                    </span>
                  )}
                  <div className="text-[16px] font-serif text-[var(--text-primary)]">{p.title}</div>
                  <div className="text-[11.5px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                    Introduced week {p.originalWeek}<br />
                    Practised {st.practised} time{st.practised === 1 ? '' : 's'}<br />
                    {st.resurfaced > 0 ? `Resurfaced ${st.resurfaced}×` : ' '}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Detail ── */}
      {open && (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-serif font-light text-[var(--text-primary)]">{open.title}</h2>
            <button onClick={() => setOpen(null)} className="text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">close</button>
          </div>

          {open.core && (
            <p className="text-[15px] font-serif italic text-[var(--text-primary)] leading-relaxed border-l-2 border-[var(--accent-primary)]/50 pl-3">
              “{open.core}”
            </p>
          )}
          {open.source && <p className="text-[12px] text-[var(--text-muted)]">Source: {open.source}</p>}
          {open.ownWords && (
            <>
              <div className={LABEL}>In my own words</div>
              <p className="text-[13.5px] italic text-[var(--text-secondary)]">{open.ownWords}</p>
            </>
          )}
          {open.purpose && (
            <>
              <div className={LABEL}>Purpose</div>
              <p className="text-[13.5px] text-[var(--text-secondary)] leading-relaxed">{open.purpose}</p>
            </>
          )}

          {(['instructions', 'dailyLife'] as const).map((k) => (
            (open[k]?.length ?? 0) > 0 && (
              <div key={k}>
                <div className={LABEL}>{k === 'instructions' ? 'The practice includes' : 'Daily-life practice'}</div>
                <div className="space-y-1.5 mt-1.5">
                  {open[k]!.map((line, i) => (
                    <div key={i} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 px-3 py-2 text-[13px] text-[var(--text-primary)]">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          <div>
            <div className={LABEL}>Weekly assignments</div>
            <div className="space-y-1 mt-1.5">
              {statsFor(open.practiceId).featured.length ? statsFor(open.practiceId).featured.map((a) => (
                <div key={a.weekNumber} className="flex gap-3 text-[12.5px] text-[var(--text-secondary)]">
                  <span className="text-[var(--text-muted)] w-32 flex-shrink-0">
                    Week {a.weekNumber} · {formatWeekRange(a.weekStart, a.weekEnd)}
                  </span>
                  <span className="text-[11px] px-2 rounded-full border border-[var(--border-subtle)]">{a.assignmentType}</span>
                </div>
              )) : <p className="text-[12.5px] text-[var(--text-muted)]">Not yet assigned.</p>}
            </div>
          </div>

          <div>
            <div className={LABEL}>Your reflections</div>
            <div className="space-y-1.5 mt-1.5">
              {statsFor(open.practiceId).reflections.length ? statsFor(open.practiceId).reflections.map((r) => (
                <div key={r.date} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 px-3 py-2">
                  <div className="text-[11px] text-[var(--text-muted)]">{r.date}</div>
                  <p className="text-[13px] font-serif italic text-[var(--text-primary)] mt-0.5">“{r.practiceReflection}”</p>
                </div>
              )) : <p className="text-[12.5px] text-[var(--text-muted)]">No reflections yet.</p>}
            </div>
          </div>

          {practice?.practiceId !== open.practiceId && (
            <div className="pt-2">
              <button
                onClick={() => { if (window.confirm(`Assign “${open.title}” to this week?`)) assignPractice(open.practiceId); }}
                className="px-4 py-2 rounded-full text-[12.5px] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Bring this practice back
              </button>
              <p className="text-[11.5px] text-[var(--text-muted)] mt-1.5">Assigns it to the current week for everyone.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
