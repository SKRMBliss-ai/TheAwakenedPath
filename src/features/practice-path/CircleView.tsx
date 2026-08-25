import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuth } from '../auth/AuthContext';
import { usePracticeEntries, usePracticeEntryActions, type PracticeEntryKind } from './useSharedPractice';
import { virtueOfWeek } from './dailyRhythm';
import { VIRTUE_BY_KEY } from './virtues';
import { ReflectionSearch, type SearchableEntry } from './ReflectionSearch';
import { usePracticeHistory } from './usePracticeDay';

/**
 * The Circle — insights and questions from the whole community.
 *
 * This is the feed, and it fills itself from practice rather than from a blank
 * compose box, so it is never empty on launch day.
 */

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '·';
}

function timeAgo(ts: unknown): string {
  const ms = ts && typeof (ts as any)?.toMillis === 'function' ? (ts as any).toMillis() : null;
  if (!ms) return 'just now';
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/**
 * `circle`  — the whole feed, both kinds, with the tab strip (Everyone).
 * `insight` / `question` — one kind only, as its own sidebar destination,
 *   matching Inner Journey's separate Insights and Questions views.
 */
export type CircleMode = 'circle' | PracticeEntryKind;

const HEADINGS: Record<CircleMode, { eyebrow: string; title: string; sub?: string }> = {
  circle: {
    eyebrow: 'Everyone',
    title: 'What the practice is showing us',
  },
  insight: {
    eyebrow: 'Insights',
    title: 'Capture an insight',
    sub: 'A realisation, a shift, something that landed. Dated automatically.',
  },
  question: {
    eyebrow: 'Questions',
    title: 'Ask a question',
    sub: 'Something to bring to the circle, or to sit with. Mark it answered when it resolves.',
  },
};

export function CircleView({ mode = 'circle' }: { mode?: CircleMode } = {}) {
  const { user } = useAuth();
  const [tab, setTab] = useState<PracticeEntryKind>(mode === 'circle' ? 'insight' : mode);
  const [text, setText] = useState('');
  const [shared, setShared] = useState(true);
  const [saving, setSaving] = useState(false);

  // In a single-kind view the tab is fixed by the route, not by the strip.
  const kind: PracticeEntryKind = mode === 'circle' ? tab : mode;
  const { entries, loaded } = usePracticeEntries(kind, user?.uid);
  const { add, answer, reopen, remove } = usePracticeEntryActions(
    user?.uid,
    user?.displayName ?? null,
  );

  const virtue = virtueOfWeek();

  // Everything this member has written, searchable in one place.
  const history = usePracticeHistory(user?.uid, 400);
  const searchable: SearchableEntry[] = [
    ...history.filter((h) => h.reflection).map((h) => ({
      id: `d-${h.date}`, text: h.reflection!, date: h.date, source: 'Evening reflection',
    })),
    ...history.filter((h) => h.practiceReflection).map((h) => ({
      id: `p-${h.date}`, text: h.practiceReflection!, date: h.date, source: 'Practice',
    })),
    ...entries.filter((e) => e.uid === user?.uid).map((e) => ({
      id: e.id, text: e.text, date: (e.createdAt as any)?.toDate?.()?.toISOString?.().slice(0, 10) ?? '',
      source: e.kind === 'insight' ? 'Insight' : 'Question',
    })).filter((e) => e.date),
  ];

  // Private entries are stored under the member's own document, so the feed
  // already contains only what this member is allowed to see.
  const visible = entries;
  const open = visible.filter((e) => e.status !== 'answered');
  const answered = visible.filter((e) => e.status === 'answered');

  const submit = async () => {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await add(kind, text, shared);
      setText('');
    } finally {
      setSaving(false);
    }
  };

  const Entry = ({ e }: { e: (typeof entries)[number] }) => (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-4"
    >
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className="w-6 h-6 rounded-full grid place-items-center bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-secondary)]">
          {initials(e.displayName || '')}
        </span>
        <span className="text-[12.5px] font-medium text-[var(--text-primary)]">{e.displayName}</span>
        {e.virtueKey && VIRTUE_BY_KEY[e.virtueKey] && (
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)]">
            {VIRTUE_BY_KEY[e.virtueKey].name}
          </span>
        )}
        {!e.shared && (
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border-subtle)] text-[var(--text-muted)]">
            private
          </span>
        )}
        {e.kind === 'question' && (
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full border',
            e.status === 'answered'
              ? 'border-[var(--done-accent-line)] text-[var(--done-accent)] bg-[var(--done-accent-soft)]'
              : 'border-[var(--accent-primary)]/40 text-[var(--accent-primary)]',
          )}>
            {e.status === 'answered' ? 'answered' : 'open'}
          </span>
        )}
        <span className="text-[11px] text-[var(--text-muted)] ml-auto">{timeAgo(e.createdAt)}</span>
      </div>

      <p className="text-[14px] text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{e.text}</p>

      {e.answer && (
        <p className="mt-2.5 pt-2.5 border-t border-[var(--border-subtle)] text-[13px] italic text-[var(--text-secondary)] whitespace-pre-wrap">
          {e.answer}
        </p>
      )}

      {e.uid === user?.uid && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {e.kind === 'question' && (
            e.status === 'answered' ? (
              <button onClick={() => reopen(e)} className="text-[11.5px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                reopen
              </button>
            ) : (
              <button
                onClick={() => {
                  const a = window.prompt('What was the answer or resolution?');
                  if (a) answer(e, a);
                }}
                className="text-[11.5px] text-[var(--accent-primary)] hover:underline"
              >
                mark answered
              </button>
            )
          )}
          <button
            onClick={() => { if (window.confirm('Delete this entry?')) remove(e); }}
            className="text-[11.5px] text-[var(--text-muted)] hover:text-red-400"
          >
            delete
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">
          {HEADINGS[mode].eyebrow}
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-[var(--text-primary)] mt-1">
          {HEADINGS[mode].title}
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-2">
          {HEADINGS[mode].sub ?? (
            <>This week everyone is practising <strong className="text-[var(--text-primary)]">{virtue.name}</strong>.</>
          )}
        </p>
      </div>

      {/* Search across everything written */}
      <details className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
        <summary className="cursor-pointer px-4 py-3 text-[13.5px] text-[var(--text-primary)]">
          Search everything you've noticed
        </summary>
        <div className="px-4 pb-4">
          <ReflectionSearch entries={searchable} />
        </div>
      </details>

      {/* Tabs — only when this view holds both kinds. */}
      {mode === 'circle' && (
      <div className="flex gap-1 border-b border-[var(--border-subtle)]">
        {([['insight', 'Insights'], ['question', 'Questions']] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              'px-4 py-2.5 text-[13.5px] border-b-2 -mb-px transition-colors',
              tab === k
                ? 'border-[var(--accent-primary)] text-[var(--text-primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      )}

      {/* Compose */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={kind === 'insight' ? 'Today I saw that…' : 'What happens when…?'}
          className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-3 py-2.5 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] resize-y"
        />
        <div className="flex items-center justify-between gap-3 mt-3 flex-wrap">
          <button
            onClick={() => setShared((s) => !s)}
            className={cn(
              'text-[12px] px-3 py-1.5 rounded-full border transition-colors',
              shared
                ? 'border-[var(--accent-primary)]/40 text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                : 'border-[var(--border-subtle)] text-[var(--text-muted)]',
            )}
          >
            {shared ? 'Sharing with the circle' : 'Private to me'}
          </button>
          <button
            onClick={submit}
            disabled={!text.trim() || saving}
            className="px-5 py-2 rounded-full text-[13px] font-bold bg-[var(--accent-solid)] text-[var(--on-accent)] disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {saving ? 'Saving…' : kind === 'insight' ? 'Share insight' : 'Ask'}
          </button>
        </div>
      </div>

      {/* Feed */}
      {!loaded ? (
        <p className="text-[13px] text-[var(--text-muted)]">Loading…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-8 text-center">
          <p className="text-[15px] font-serif italic text-[var(--text-secondary)]">
            Nothing here yet.
          </p>
          <p className="text-[13px] text-[var(--text-muted)] mt-2">
            The first {kind === 'insight' ? 'insight' : 'question'} can be yours.
          </p>
        </div>
      ) : kind === 'question' ? (
        <div className="space-y-5">
          {open.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">Open</h2>
              {open.map((e) => <Entry key={e.id} e={e} />)}
            </div>
          )}
          {answered.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)]">Answered</h2>
              {answered.map((e) => <Entry key={e.id} e={e} />)}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((e) => <Entry key={e.id} e={e} />)}
        </div>
      )}
    </div>
  );
}
