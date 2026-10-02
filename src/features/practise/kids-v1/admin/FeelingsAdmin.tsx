import { useMemo, useState } from 'react';
import { THOUGHTS, THEME_GUIDANCE, DEFAULT_THEME_BY_FEELING, toKey, type AgeBand, type FeelingKey, type Theme } from '../kit/storyLabContent';
import { AGE_BANDS, THEMES, useLiveContent, type LiveFeeling, type LiveThought } from '../kit/liveContent';
import { deleteLive, saveLive } from '../kit/liveContentApi';
import { feelingRows, poolLabel, type FeelingRow } from './feelingRows';
import { THEME_NAMES } from './teachingLines';
import { search, similarTo } from './similarity';
import { Ask, EmojiPicks, Field, NoteLine, SearchBox, Similar } from './ui';
import { newId, plain, useBusy } from './adminKit';

/* Feelings a child can pick, and the thoughts each one offers in the Story Lab. */

interface Entry {
  text: string;
  icon: string;
  /** The feeling it is listed under: a feeling id, or a built-in pool. */
  under: string;
  label: string;
  theme?: Theme;
  bands: AgeBand[];
  added?: LiveThought;
}

const BAND_NAMES: Record<AgeBand, string> = { '3-5': 'Ages 3–5', '6-8': 'Ages 6–8', '9-11': 'Ages 9–11', '12-14': 'Ages 12–14' };
const HUES = [8, 22, 44, 70, 110, 150, 180, 195, 212, 235, 268, 300, 330, 350];

function builtInEntries(key: FeelingKey): Entry[] {
  const byText = new Map<string, Entry>();
  for (const t of THOUGHTS[key]) {
    const e = byText.get(t.text);
    if (e) { if (!e.bands.includes(t.ageBand)) e.bands.push(t.ageBand); continue; }
    byText.set(t.text, { text: t.text, icon: t.icon, under: key, label: poolLabel(key), theme: t.theme, bands: [t.ageBand] });
  }
  return [...byText.values()];
}

/** Feelings without a pool of their own would otherwise default to the pool they borrow, which rarely fits. */
const SUGGESTED_THEME: Partial<Record<string, Theme>> = {
  bored: 'uncertainty', ashamed: 'failure', embarrassed: 'rejection', grief: 'loss', anxious: 'uncertainty',
};
const themeOf = (row: FeelingRow): Theme => row.live?.theme ?? SUGGESTED_THEME[row.id] ?? DEFAULT_THEME_BY_FEELING[toKey(row.id)];

export function FeelingsAdmin() {
  const { feelings, thoughts } = useLiveContent();
  const rows = useMemo(() => feelingRows(feelings, thoughts), [feelings, thoughts]);
  const [selected, setSelected] = useState(() => rows.find((r) => r.gap)?.id ?? rows[0].id);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const row = rows.find((r) => r.id === selected) ?? rows[0];

  const all = useMemo<Entry[]>(() => {
    const label = (id: string) => rows.find((r) => r.id === id)?.label ?? id;
    const builtIn = (Object.keys(THOUGHTS) as FeelingKey[]).flatMap(builtInEntries);
    const added = thoughts.map((t): Entry => ({
      text: t.text, icon: t.icon, under: t.feeling, label: label(t.feeling), theme: t.theme, bands: t.ageBand ? [t.ageBand] : [], added: t,
    }));
    return [...added, ...builtIn];
  }, [rows, thoughts]);
  const results = useMemo(() => search(query, all, (e) => e.text).slice(0, 40), [query, all]);
  const gaps = rows.filter((r) => r.gap);

  return (
    <>
      <div className="ka-head">
        <h1>Feelings and thoughts</h1>
        <p className="ka-lede">
          A child picks a feeling ball, then a thought cloud that matches what was going through their head. Each thought also
          decides which “what happened” cards and “another way” lines come next, through what it is about.
        </p>
      </div>

      {gaps.length > 0 && (
        <section className="ka-panel" aria-labelledby="ka-gaps">
          <h2 id="ka-gaps" className="ka-label">Gaps worth filling</h2>
          <ul className="ka-list">
            {gaps.map((g) => (
              <li key={g.id}>
                <span className="ka-dot" style={{ background: `hsl(${g.hue} 80% 60%)`, marginTop: 5 }} />
                <span className="ka-row-main"><b>{g.label}</b><small>{g.gap}</small></span>
                <span className="ka-row-side">
                  {!g.ball && g.id !== 'other'
                    ? <GiveBall row={g} />
                    : <button className="ka-btn ka-btn-small" onClick={() => setSelected(g.id)}>Add thoughts</button>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="ka-section" aria-label="Search every thought">
        <SearchBox value={query} onChange={setQuery} label="Search every thought" placeholder="Search every thought, e.g. left out, mistake, mum" />
        {query.trim() && (
          results.length
            ? (
              <ul className="ka-list" aria-label={`${results.length} thoughts found`}>
                {results.map(({ item }, i) => (
                  <li key={i}>
                    <span className="ka-icon" aria-hidden="true">{item.icon}</span>
                    <span className="ka-row-main"><b>{item.text}</b><small>{item.label}{item.theme ? ` · ${THEME_NAMES[item.theme]}` : ''}{item.bands.length ? ` · ${item.bands.join(', ')}` : ''}</small></span>
                    <span className="ka-row-side">{item.added && <span className="ka-chip is-added">Added here</span>}</span>
                  </li>
                ))}
              </ul>
            )
            : <p className="ka-empty">No thought matches “{query}”.</p>
        )}
      </section>

      <div className="ka-split">
        <nav className="ka-picker" aria-label="Feelings">
          {rows.map((r) => (
            <button key={r.id} className="ka-pick" aria-current={r.id === row.id} onClick={() => { setSelected(r.id); setAdding(false); }}>
              <span className="ka-dot" style={{ background: `hsl(${r.hue} 80% 60%)` }} />
              {r.label}{r.gap && <span className="ka-chip is-gap" title={r.gap}>gap</span>}
              <span className="ka-count" title="Thoughts a child sees for this feeling">{r.own + r.borrowed + r.added}</span>
            </button>
          ))}
          <div className="ka-pick-sub">
            <button className="ka-btn ka-btn-small" onClick={() => setAdding(true)}>Add a feeling</button>
          </div>
        </nav>

        <div className="ka-section">
          {adding
            ? <FeelingForm key="new" rows={rows} onDone={(id) => { setAdding(false); if (id) setSelected(id); }} />
            : <FeelingDetail key={row.id} row={row} all={all} />}
        </div>
      </div>
    </>
  );
}

function GiveBall({ row }: { row: FeelingRow }) {
  const [busy, note, run] = useBusy();
  const give = () => run(async () => {
    const f: LiveFeeling = { id: row.id, label: row.label, hue: row.id === 'calm' ? 160 : row.hue, ok: row.id === 'calm', theme: themeOf(row) };
    await saveLive('feeling', f.id, plain(f));
    return `${row.label} is a feeling ball now.`;
  });
  return (
    <>
      <button className="ka-btn ka-btn-small ka-btn-go" disabled={busy} onClick={() => void give()}>Give it a feeling ball</button>
      <NoteLine note={note} />
    </>
  );
}

function FeelingDetail({ row, all }: { row: FeelingRow; all: Entry[] }) {
  const thoughts = useLiveContent((s) => s.thoughts);
  const mine = thoughts.filter((t) => t.feeling === row.id);
  const builtIn = row.borrows ? [] : builtInEntries(row.pool);
  const borrowed = row.borrows ? builtInEntries(row.pool) : [];
  const [editingFeeling, setEditingFeeling] = useState(false);
  const [editing, setEditing] = useState<LiveThought | null>(null);

  return (
    <>
      <div className="ka-panel">
        <div className="ka-section-head">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="ka-dot" style={{ background: `hsl(${row.hue} 80% 60%)`, width: 16, height: 16 }} />{row.label}
          </h2>
          {row.live && !editingFeeling && <button className="ka-btn ka-btn-small" onClick={() => setEditingFeeling(true)}>Edit feeling</button>}
        </div>
        <div className="ka-chips">
          {row.ball ? <span className="ka-chip is-good">Feeling ball</span> : <span className="ka-chip is-gap">No feeling ball</span>}
          {row.minAge ? <span className="ka-chip">Age {row.minAge}+</span> : row.ball ? <span className="ka-chip">All ages</span> : null}
          {row.live && <span className="ka-chip is-added">Added here</span>}
          <span className="ka-chip">New thoughts usually about: {THEME_NAMES[themeOf(row)]}</span>
        </div>
        {row.gap && <p className="ka-note is-warn">{row.gap}</p>}
        {row.info && <p className="ka-fine">{row.info}</p>}
        {editingFeeling && row.live && <FeelingForm rows={[]} existing={row.live} onDone={() => setEditingFeeling(false)} />}
      </div>

      {editing
        ? <ThoughtForm key={editing.id} row={row} all={all} existing={editing} onDone={() => setEditing(null)} />
        : <ThoughtForm key={`new-${row.id}`} row={row} all={all} onDone={() => undefined} />}

      <section className="ka-section" aria-label="Added here">
        <div className="ka-section-head"><h2>Added here <span className="ka-muted">({mine.length})</span></h2></div>
        {mine.length
          ? (
            <ul className="ka-list">
              {mine.map((t) => (
                <li key={t.id}>
                  <span className="ka-icon" aria-hidden="true">{t.icon}</span>
                  <span className="ka-row-main"><b>{t.text}</b><small>{t.theme ? THEME_NAMES[t.theme] : 'Follows the feeling'} · {t.ageBand ? BAND_NAMES[t.ageBand] : 'All ages'}</small></span>
                  <span className="ka-row-side"><button className="ka-btn ka-btn-small" onClick={() => setEditing(t)}>Edit</button></span>
                </li>
              ))}
            </ul>
          )
          : <p className="ka-empty">None yet. Add the first above.</p>}
      </section>

      {builtIn.length > 0 && <BuiltInList title="Built in" entries={builtIn} />}
      {borrowed.length > 0 && (
        <details className="ka-section">
          <summary className="ka-link" style={{ cursor: 'pointer' }}>Borrowed from {poolLabel(row.pool)} ({borrowed.length})</summary>
          <BuiltInList title="" entries={borrowed} />
        </details>
      )}
    </>
  );
}

function BuiltInList({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <section className="ka-section" aria-label={title || 'Borrowed thoughts'}>
      {title && <div className="ka-section-head"><h2>{title} <span className="ka-muted">({entries.length})</span></h2></div>}
      {AGE_BANDS.map((band) => {
        const inBand = entries.filter((e) => e.bands[0] === band);
        if (!inBand.length) return null;
        return (
          <div key={band} className="ka-section" style={{ gap: 6 }}>
            <span className="ka-label">{BAND_NAMES[band]} · {inBand.length}</span>
            <ul className="ka-list">
              {inBand.map((e) => (
                <li key={e.text}>
                  <span className="ka-icon" aria-hidden="true">{e.icon}</span>
                  <span className="ka-row-main"><b>{e.text}</b><small>{e.theme ? THEME_NAMES[e.theme] : ''}{e.bands.length > 1 ? ` · also ${e.bands.slice(1).join(', ')}` : ''}</small></span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

function ThoughtForm({ row, all, existing, onDone }: { row: FeelingRow; all: Entry[]; existing?: LiveThought; onDone: () => void }) {
  const [text, setText] = useState(existing?.text ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? '☁');
  const [band, setBand] = useState<AgeBand | ''>(existing?.ageBand ?? '');
  const [theme, setTheme] = useState<Theme>(existing?.theme ?? themeOf(row));
  const [picking, setPicking] = useState(false);
  const [asking, setAsking] = useState(false);
  const [busy, note, run] = useBusy();
  const others = existing ? all.filter((e) => e.added?.id !== existing.id) : all;
  const matches = useMemo(() => similarTo(text, others, (e) => e.text), [text, others]);
  const exact = matches[0]?.score >= 0.999;

  const save = () => run(async () => {
    const t: LiveThought = {
      id: existing?.id ?? newId('t'), feeling: row.id, text: text.trim(), icon: icon.trim() || '☁',
      ageBand: band || undefined, theme, safety: 'routine',
    };
    await saveLive('thought', t.id, plain(t));
    if (existing) onDone();
    else { setText(''); setPicking(false); }
    return existing ? undefined : `Added to ${row.label}. Children see it the next time their app opens.`;
  });
  const remove = () => run(async () => { await deleteLive('thought', existing!.id); onDone(); });

  return (
    <section className="ka-panel" aria-label={existing ? 'Change this thought' : `Add a thought to ${row.label}`}>
      <h2 className="ka-label">{existing ? 'Change this thought' : `Add a thought to ${row.label}`}</h2>
      <div className="ka-title-row">
        <Field label="The thought, as a child would think it">
          <input className="ka-input" value={text} maxLength={160} placeholder="Nobody picked me for their team."
            onChange={(e) => setText(e.target.value)} />
        </Field>
        <Field label="Icon">
          <input className="ka-input ka-emoji" value={icon} maxLength={8} onFocus={() => setPicking(true)} onChange={(e) => setIcon(e.target.value)} />
        </Field>
      </div>
      {picking && <EmojiPicks onPick={(e) => { setIcon(e); setPicking(false); }} />}
      <Similar draft={text} matches={matches} line={(e) => e.text} where={(e) => e.label} noun="thought" />
      <div className="ka-grid2">
        <Field label="What it’s about" hint="decides what comes next">
          <select className="ka-select" value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            {THEMES.map((t) => <option key={t} value={t}>{THEME_NAMES[t]}: {THEME_GUIDANCE[t].whatItCaptures}</option>)}
          </select>
        </Field>
        <Field label="Who sees it">
          <select className="ka-select" value={band} onChange={(e) => setBand(e.target.value as AgeBand | '')}>
            <option value="">All ages</option>
            {AGE_BANDS.map((b) => <option key={b} value={b}>{BAND_NAMES[b]}</option>)}
          </select>
        </Field>
      </div>
      <div className="ka-actions">
        <button className="ka-btn ka-btn-go" disabled={busy || text.trim().length < 3 || exact} onClick={() => void save()}>
          {busy ? 'Saving…' : existing ? 'Save changes' : 'Add thought'}
        </button>
        {existing && <button className="ka-btn" disabled={busy} onClick={onDone}>Cancel</button>}
        {existing && <button className="ka-btn ka-btn-danger" disabled={busy} onClick={() => setAsking(true)}>Delete</button>}
        {exact && <span className="ka-fine">That exact thought is already here.</span>}
      </div>
      <NoteLine note={note} />
      {asking && <Ask text="Delete this thought for everyone?" yes="Delete" onYes={() => { setAsking(false); void remove(); }} onNo={() => setAsking(false)} />}
    </section>
  );
}

function slug(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
}

function FeelingForm({ rows, existing, onDone }: { rows: FeelingRow[]; existing?: LiveFeeling; onDone: (id?: string) => void }) {
  const thoughts = useLiveContent((s) => s.thoughts);
  const [label, setLabel] = useState(existing?.label ?? '');
  const [hue, setHue] = useState(existing?.hue ?? 195);
  const [ok, setOk] = useState(existing?.ok ?? false);
  const [minAge, setMinAge] = useState<number | ''>(existing?.minAge ?? '');
  const [theme, setTheme] = useState<Theme>(existing?.theme ?? 'uncertainty');
  const [asking, setAsking] = useState(false);
  const [busy, note, run] = useBusy();
  const id = existing?.id ?? slug(label);
  const clash = !existing && rows.find((r) => r.id === id && (r.ball || r.id === 'other'));
  const mine = existing ? thoughts.filter((t) => t.feeling === existing.id) : [];

  const save = () => run(async () => {
    const f: LiveFeeling = { id, label: label.trim(), hue, ok, minAge: minAge === '' ? undefined : minAge, theme };
    await saveLive('feeling', id, plain(f));
    onDone(id);
  });
  const remove = () => run(async () => {
    for (const t of mine) await deleteLive('thought', t.id);
    await deleteLive('feeling', existing!.id);
    onDone();
  });

  return (
    <section className="ka-panel" aria-label={existing ? 'Change this feeling' : 'Add a feeling'}>
      <h2 className="ka-label">{existing ? 'Change this feeling' : 'Add a feeling'}</h2>
      {!existing && <p className="ka-fine">It appears as a new ball in the Feelings room. Add a few thoughts to it straight after; until then it offers the general “Other” thoughts.</p>}
      <div className="ka-grid2">
        <Field label="Name on the ball">
          <input className="ka-input" value={label} maxLength={16} placeholder="Lonely" onChange={(e) => setLabel(e.target.value)} />
        </Field>
        <Field label="Who sees it">
          <select className="ka-select" value={minAge} onChange={(e) => setMinAge(e.target.value ? Number(e.target.value) : '')}>
            <option value="">All ages</option>
            {[5, 6, 7, 8, 9, 10, 12].map((a) => <option key={a} value={a}>Age {a} and up</option>)}
          </select>
        </Field>
      </div>
      <fieldset className="ka-field">
        <legend>Colour</legend>
        <div className="ka-swatches">
          {HUES.map((h) => (
            <button key={h} type="button" className="ka-swatch" aria-label={`Colour ${h}`} aria-pressed={hue === h}
              style={{ background: `radial-gradient(circle at 34% 26%, hsl(${h} 92% 76%), hsl(${h} 76% 46%) 72%)` }} onClick={() => setHue(h)} />
          ))}
        </div>
      </fieldset>
      <div className="ka-grid2">
        <Field label="Kind of feeling">
          <select className="ka-select" value={ok ? 'ok' : 'hard'} onChange={(e) => setOk(e.target.value === 'ok')}>
            <option value="hard">Hard to feel, like Worried</option>
            <option value="ok">Pleasant, like Happy</option>
          </select>
        </Field>
        <Field label="Its thoughts are mostly about">
          <select className="ka-select" value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            {THEMES.map((t) => <option key={t} value={t}>{THEME_NAMES[t]}</option>)}
          </select>
        </Field>
      </div>
      {clash && <p className="ka-note is-warn">There’s already a {clash.label} feeling ball.</p>}
      <div className="ka-actions">
        <button className="ka-btn ka-btn-go" disabled={busy || !label.trim() || !id || !!clash} onClick={() => void save()}>
          {busy ? 'Saving…' : existing ? 'Save changes' : 'Add feeling'}
        </button>
        <button className="ka-btn" disabled={busy} onClick={() => onDone()}>Cancel</button>
        {existing && <button className="ka-btn ka-btn-danger" disabled={busy} onClick={() => setAsking(true)}>Delete feeling</button>}
      </div>
      <NoteLine note={note} />
      {asking && (
        <Ask text={`Delete ${existing?.label}${mine.length ? ` and its ${mine.length} ${mine.length === 1 ? 'thought' : 'thoughts'}` : ''} for everyone?`}
          yes="Delete" onYes={() => { setAsking(false); void remove(); }} onNo={() => setAsking(false)} />
      )}
    </section>
  );
}
