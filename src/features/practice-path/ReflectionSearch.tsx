import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

export interface SearchableEntry {
  id: string;
  text: string;
  date: string;
  /** Where it came from — "Right Speech", "Evening reflection", "Insight". */
  source: string;
}

/** Escape a user string so it can go inside a RegExp safely. */
function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Split text into matched / unmatched runs so matches can be marked without
 *  ever injecting HTML from user-written reflections. */
function highlight(text: string, q: string) {
  if (!q.trim()) return [{ t: text, hit: false }];
  try {
    const re = new RegExp(`(${escapeRe(q)})`, 'ig');
    return text.split(re).filter(Boolean).map((part) => ({
      t: part,
      hit: part.toLowerCase() === q.toLowerCase(),
    }));
  } catch {
    return [{ t: text, hit: false }];
  }
}

export function ReflectionSearch({ entries }: { entries: SearchableEntry[] }) {
  const [q, setQ] = useState('');

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries
      .filter((e) => !needle || (e.text + ' ' + e.source).toLowerCase().includes(needle))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, q]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Try: patience, speech, intention…"
          className="w-full rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] pl-9 pr-3 py-2.5 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)]"
        />
      </div>

      {hits.length === 0 ? (
        <p className="text-[13px] text-[var(--text-muted)] py-4 text-center">
          {q ? `Nothing found for “${q}”.` : 'Your reflections will collect here.'}
        </p>
      ) : (
        <>
          <p className="text-[11.5px] text-[var(--text-muted)]">
            {hits.length} reflection{hits.length === 1 ? '' : 's'}
          </p>
          <div className="space-y-2">
            {hits.slice(0, 60).map((e) => (
              <div key={e.id} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-3">
                <div className="flex justify-between gap-3 text-[11.5px] mb-1.5">
                  <span className="text-[var(--accent-primary)]">{e.source}</span>
                  <span className="text-[var(--text-muted)]">
                    {new Date(e.date + 'T00:00:00').toLocaleDateString(undefined, {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-[13.5px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                  {highlight(e.text, q).map((part, i) =>
                    part.hit
                      ? <mark key={i} className="bg-[var(--accent-primary)]/30 text-[var(--text-primary)] rounded px-0.5">{part.t}</mark>
                      : <span key={i}>{part.t}</span>,
                  )}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
