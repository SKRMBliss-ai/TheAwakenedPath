import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { THEMES, useLiveContent } from '../kit/liveContent';
import { deleteLive, saveLive, suggestWording, type Suggestion } from '../kit/liveContentApi';
import { GROUPS, THEME_NAMES, teachingLines, type LineGroup, type TeachingLine } from './teachingLines';
import { WORDING_IDEAS } from './wordingIdeas';
import { search } from './similarity';
import { NoteLine, SearchBox } from './ui';
import { newId, useBusy } from './adminKit';

/* Every teaching line a child can meet, changeable, each with an idea for a better version. */

const MAX_LINE = 400;

export function WordsAdmin() {
  const texts = useLiveContent((s) => s.texts);
  const lines = useMemo(() => teachingLines(texts), [texts]);
  const [group, setGroup] = useState<LineGroup>('rooms');
  const [query, setQuery] = useState('');
  const [onlyChanged, setOnlyChanged] = useState(false);

  const found = query.trim() ? search(query, lines, (l) => `${l.text} ${l.where}`).map((m) => m.item) : null;
  const pool = (found ?? lines.filter((l) => l.group === group)).filter((l) => !onlyChanged || l.changed || l.added || l.stale);
  const sections = [...new Set(pool.map((l) => l.section))];
  const info = GROUPS.find((g) => g.id === group)!;

  return (
    <>
      <div className="ka-head">
        <h1>Teaching words</h1>
        <p className="ka-lede">
          Every line here is something a child reads or hears. Change one and every child gets the new words the next time their
          app opens; “Put the original back” undoes it. Each line has a suggested rewording, and you can ask for more ideas.
        </p>
      </div>

      <SearchBox value={query} onChange={setQuery} label="Search every line" placeholder="Search every line, e.g. brave, sorry, Friendship Park" />
      <div className="ka-section-head">
        {!found && (
          <div className="ka-tabs" role="group" aria-label="Kinds of line">
            {GROUPS.map((g) => (
              <button key={g.id} className="ka-tab" aria-pressed={g.id === group} onClick={() => setGroup(g.id)}>
                {g.title} <span className="ka-count">{lines.filter((l) => l.group === g.id).length}</span>
              </button>
            ))}
          </div>
        )}
        <label className="ka-check"><input type="checkbox" checked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} /> Only lines changed here</label>
      </div>
      {found
        ? <p className="ka-fine">{pool.length} {pool.length === 1 ? 'line matches' : 'lines match'} “{query}”.</p>
        : <p className="ka-fine">{info.blurb}</p>}

      {sections.map((section) => {
        const inSection = pool.filter((l) => l.section === section);
        const theme = THEMES.find((t) => THEME_NAMES[t] === section);
        const addPrefix = group === 'affirmations' && !found ? 'affirm:new' : group === 'another' && theme && !found ? `another:${theme}:new` : null;
        return (
          <section key={section} className="ka-section" aria-label={section}>
            <div className="ka-section-head"><h2>{section} <span className="ka-muted">({inSection.length})</span></h2></div>
            <div className="ka-list" role="list">
              {inSection.map((l) => <LineRow key={l.id} line={l} />)}
            </div>
            {addPrefix && section === sections[sections.length - 1] && group === 'affirmations' && <AddLine prefix={addPrefix} label="Add a kind-words line" />}
            {addPrefix && group === 'another' && <AddLine prefix={addPrefix} label={`Add an “another way” line for ${section.toLowerCase()}`} />}
          </section>
        );
      })}
      {!pool.length && <p className="ka-empty">{onlyChanged ? 'Nothing changed here yet.' : 'No lines match.'}</p>}
    </>
  );
}

function LineRow({ line }: { line: TeachingLine }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Suggestion[] | null>(null);
  const [busy, note, run, setNote] = useBusy();
  const [asking, setAsking] = useState(false);
  const idea = WORDING_IDEAS[line.id];
  const ready = idea && idea.for === line.base && !line.changed && !line.added && idea.text !== line.text ? idea : null;

  const save = (text: string) => run(async () => {
    await saveLive('text', line.id, { text: text.trim(), original: line.added ? '' : line.base });
    setEditing(null);
    return 'Saved. Children get the new words the next time their app opens.';
  });
  const reset = () => run(async () => {
    await deleteLive('text', line.id);
    setEditing(null);
    return line.added ? undefined : 'The original is back.';
  });
  const more = (again: boolean) => run(async () => {
    const r = await suggestWording(editing ?? line.text, line.where, line.guide, again);
    setIdeas(r.suggestions);
    if (!r.suggestions.length) return 'No new ideas this time. This one may already be in good shape.';
  });

  return (
    <div className="ka-line" role="listitem">
      <div className="ka-line-head">
        <span className="ka-line-where">{line.where}</span>
        {line.changed && <span className="ka-chip is-edited">Changed here</span>}
        {line.added && <span className="ka-chip is-added">Added here</span>}
        {line.stale && <span className="ka-chip is-hidden">Old change no longer applies</span>}
      </div>

      {editing === null
        ? <p className="ka-line-text">{line.text}</p>
        : (
          <>
            <textarea className="ka-textarea" value={editing} maxLength={MAX_LINE} rows={Math.min(6, Math.max(2, Math.ceil(editing.length / 70)))}
              aria-label={`New words for ${line.where}`} autoFocus onChange={(e) => { setEditing(e.target.value); setNote(null); }} />
            <div className="ka-actions">
              <button className="ka-btn ka-btn-go ka-btn-small" disabled={busy || !editing.trim() || editing.trim() === line.text}
                onClick={() => void save(editing)}>{busy ? 'Saving…' : 'Save'}</button>
              <button className="ka-btn ka-btn-small" disabled={busy} onClick={() => setEditing(null)}>Cancel</button>
              <span className="ka-fine">{editing.length}/{MAX_LINE}</span>
            </div>
          </>
        )}
      {line.changed && <p className="ka-line-was">Was: <s>{line.base}</s></p>}
      {line.stale && <p className="ka-line-was">This line was changed here, then the built-in words changed too, so the old change was set aside.</p>}

      {ready && editing === null && (
        <div className="ka-idea">
          <span className="ka-idea-head"><Sparkles size={14} aria-hidden="true" /> Suggestion</span>
          <p>{ready.text}</p>
          <small>{ready.why}</small>
          <div className="ka-actions"><button className="ka-link" onClick={() => setEditing(ready.text)}>Use this</button></div>
        </div>
      )}
      {ideas && ideas.length > 0 && (
        <div className="ka-idea">
          <span className="ka-idea-head"><Sparkles size={14} aria-hidden="true" /> More ideas</span>
          {ideas.map((s, i) => (
            <div key={i}>
              <p>{s.text}</p>
              <small>{s.why}</small>
              <div className="ka-actions"><button className="ka-link" onClick={() => setEditing(s.text)}>Use this</button></div>
            </div>
          ))}
        </div>
      )}

      <div className="ka-actions">
        {editing === null && <button className="ka-btn ka-btn-small" disabled={busy} onClick={() => setEditing(line.text)}>Edit</button>}
        <button className="ka-btn ka-btn-small" disabled={busy} onClick={() => void more(!!ideas)}>
          {busy ? 'Thinking…' : ideas ? 'Different ideas' : 'More ideas'}
        </button>
        {line.changed && <button className="ka-btn ka-btn-small" disabled={busy} onClick={() => void reset()}>Put the original back</button>}
        {line.stale && <button className="ka-btn ka-btn-small" disabled={busy} onClick={() => void reset()}>Remove the old change</button>}
        {line.added && <button className="ka-btn ka-btn-small ka-btn-danger" disabled={busy} onClick={() => setAsking(true)}>Delete</button>}
      </div>
      <NoteLine note={note} />
      {asking && (
        <div className="ka-ask" role="alert">
          <p>Delete this line for everyone?</p>
          <button className="ka-btn ka-btn-danger" onClick={() => { setAsking(false); void reset(); }}>Delete</button>
          <button className="ka-btn" onClick={() => setAsking(false)} autoFocus>Keep it</button>
        </div>
      )}
    </div>
  );
}

function AddLine({ prefix, label }: { prefix: string; label: string }) {
  const [text, setText] = useState('');
  const [busy, note, run] = useBusy();
  const add = () => run(async () => {
    await saveLive('text', newId(prefix).replace(`${prefix}-`, `${prefix}:`), { text: text.trim(), original: '' });
    setText('');
    return 'Added. Children get it the next time their app opens.';
  });
  return (
    <div className="ka-panel">
      <span className="ka-label">{label}</span>
      <div className="ka-actions" style={{ flexWrap: 'nowrap' }}>
        <input className="ka-input" value={text} maxLength={MAX_LINE} placeholder="A new line, in a child’s own words" aria-label={label} onChange={(e) => setText(e.target.value)} />
        <button className="ka-btn ka-btn-go" disabled={busy || text.trim().length < 3} onClick={() => void add()}>{busy ? 'Adding…' : 'Add'}</button>
      </div>
      <NoteLine note={note} />
    </div>
  );
}
