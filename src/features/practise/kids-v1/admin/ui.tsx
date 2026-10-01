import { type ReactNode } from 'react';
import { Search } from 'lucide-react';
import type { Note } from './adminKit';
import { closeness, type Match } from './similarity';

/* Small pieces every admin page shares. */

export function NoteLine({ note }: { note: Note }) {
  if (!note) return null;
  return <p className={`ka-note is-${note.tone}`} role={note.tone === 'bad' ? 'alert' : 'status'}>{note.text}</p>;
}

export function SearchBox({ value, onChange, label, placeholder }: {
  value: string; onChange: (v: string) => void; label: string; placeholder: string;
}) {
  return (
    <label className="ka-search">
      <span className="sr-only">{label}</span>
      <Search size={18} aria-hidden="true" />
      <input className="ka-input" type="search" value={value} placeholder={placeholder} aria-label={label}
        onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/** What already exists that looks like the draft being typed. */
export function Similar<T>({ draft, matches, line, where, noun }: {
  draft: string; matches: Match<T>[]; line: (item: T) => string; where?: (item: T) => string; noun: string;
}) {
  if (draft.trim().length < 6) return null;
  if (!matches.length) return <p className="ka-matches is-clear" role="status">Nothing like this yet. It’s a new {noun}.</p>;
  return (
    <div className="ka-matches" role="status">
      <b>{matches[0].score >= 0.85 ? `This ${noun} is probably already here` : matches[0].score >= 0.6 ? `Similar ${noun}s already here` : `Related ${noun}s already here`}</b>
      <ul>
        {matches.map((m, i) => (
          <li key={i}>
            <span>{closeness(m.score)} · {Math.round(m.score * 100)}%</span>
            <span>“{line(m.item)}”{where && <span className="ka-muted"> · {where(m.item)}</span>}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Ask({ text, yes, no = 'Keep it', onYes, onNo }: {
  text: string; yes: string; no?: string; onYes: () => void; onNo: () => void;
}) {
  return (
    <div className="ka-ask" role="alert">
      <p>{text}</p>
      <button className="ka-btn ka-btn-danger" onClick={onYes}>{yes}</button>
      <button className="ka-btn" onClick={onNo} autoFocus>{no}</button>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="ka-field">
      <span>{label}{hint && <small> · {hint}</small>}</span>
      {children}
    </label>
  );
}

const EMOJI = [
  '☁', '💭', '😊', '😢', '😠', '😨', '😟', '🤔', '💛', '🤝', '🌟', '✨', '🌱', '🏠', '🏫', '⚽',
  '🎮', '📚', '🎁', '🐶', '👀', '💬', '🙈', '🫶', '😴', '🍎', '🧸', '🎨', '🎵', '🌧️', '🌈', '⭐',
];

export function EmojiPicks({ onPick, label = 'Quick emoji' }: { onPick: (e: string) => void; label?: string }) {
  return (
    <div className="ka-picks" role="group" aria-label={label}>
      {EMOJI.map((e) => <button key={e} type="button" onClick={() => onPick(e)}>{e}</button>)}
    </div>
  );
}
