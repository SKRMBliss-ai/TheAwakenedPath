import { useMemo, useState } from 'react';
import {
  BEHAVIOUR_PILLARS, CATEGORISED_SCENARIOS, SCENARIO_META,
  type BehaviourPillar, type PillarScenario,
} from '../../../../assets/mind-gym-180-balanced-behaviour-scenarios';
import { ROOM_PILLARS } from '../kit/behaviourPractice';
import { CREW, PILLARS, useLiveContent, type LiveGame } from '../kit/liveContent';
import { deleteLive, saveLive } from '../kit/liveContentApi';
import { VIRTUE_ROOMS } from '../best/rooms';
import { search, similarTo } from './similarity';
import { Ask, Field, NoteLine, SearchBox, Similar } from './ui';
import { newId, plain, useBusy } from './adminKit';

/* The Games Room's questions and answers, room by room. */

type Origin = 'built-in' | 'changed' | 'hidden' | 'added';
interface Row { game: PillarScenario; origin: Origin; live?: LiveGame; builtIn?: PillarScenario; ages: string }

const BUILT_IN = new Map(CATEGORISED_SCENARIOS.map((s) => [s.id, s]));
const roomOf = (pillar: BehaviourPillar) => {
  const id = Object.entries(ROOM_PILLARS).find(([, p]) => p === pillar)?.[0];
  return VIRTUE_ROOMS.find((r) => r.id === id);
};
const roomName = (p: BehaviourPillar) => roomOf(p)?.name ?? BEHAVIOUR_PILLARS[p].title;
const crewName = (who: string) => who.charAt(0).toUpperCase() + who.slice(1);

function agesOf(game: PillarScenario, live?: LiveGame): string {
  if (live && (live.minAge !== undefined || live.maxAge !== undefined)) {
    return `Ages ${live.minAge ?? 3}–${live.maxAge ?? 14}`;
  }
  const band = SCENARIO_META[game.id]?.ageBand;
  return band ? `Ages ${band.replace('-', '–')}` : 'All ages';
}

const sameContent = (a: PillarScenario, b: PillarScenario) =>
  JSON.stringify([a.title, a.setup, a.reactions, a.choices]) === JSON.stringify([b.title, b.setup, b.reactions, b.choices]);

function useRows(): Row[] {
  const games = useLiveContent((s) => s.games);
  return useMemo(() => {
    const byId = new Map(games.map((g) => [g.id, g]));
    const rows: Row[] = CATEGORISED_SCENARIOS.map((s) => {
      const live = byId.get(s.id);
      if (!live) return { game: s, origin: 'built-in', builtIn: s, ages: agesOf(s) };
      return { game: { ...live, pillar: s.pillar }, origin: live.hidden ? 'hidden' : 'changed', live, builtIn: s, ages: agesOf(s, live) };
    });
    for (const g of games) if (!BUILT_IN.has(g.id) && !g.hidden) rows.push({ game: g, origin: 'added', live: g, ages: agesOf(g, g) });
    return rows;
  }, [games]);
}

export function GamesAdmin() {
  const rows = useRows();
  const [pillar, setPillar] = useState<BehaviourPillar>('BeKind');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<{ row?: Row; pillar: BehaviourPillar } | null>(null);
  const inRoom = rows.filter((r) => r.game.pillar === pillar);
  const found = useMemo(
    () => search(query, rows, (r) => `${r.game.title} ${r.game.setup} ${r.game.choices.map((c) => `${c.label} ${c.response}`).join(' ')}`),
    [query, rows],
  );
  const shown = query.trim() ? found.map((m) => m.item) : inRoom;

  if (editing) {
    return <GameEditor key={editing.row?.game.id ?? 'new'} row={editing.row} pillar={editing.pillar} rows={rows}
      onDone={() => { setEditing(null); window.scrollTo(0, 0); }} />;
  }

  return (
    <>
      <div className="ka-head">
        <h1>Games</h1>
        <p className="ka-lede">
          In each room’s Games Room a child reads a question, hears the Feelings Crew talk it over, then picks an answer. One
          answer is the best and earns the most points; every answer gets a kind reply, so nobody is ever told off.
        </p>
      </div>
      <SearchBox value={query} onChange={setQuery} label="Search every question" placeholder="Search every question and answer, e.g. lunch, sorry, phone" />
      {!query.trim() && (
        <div className="ka-section-head">
          <div className="ka-tabs" role="group" aria-label="Rooms">
            {PILLARS.map((p) => (
              <button key={p} className="ka-tab" aria-pressed={p === pillar} onClick={() => setPillar(p)}>
                {roomOf(p)?.emoji} {roomName(p)} <span className="ka-count">{rows.filter((r) => r.game.pillar === p && r.origin !== 'hidden').length}</span>
              </button>
            ))}
          </div>
          <button className="ka-btn ka-btn-go" onClick={() => setEditing({ pillar })}>Add a question</button>
        </div>
      )}
      {query.trim() && <p className="ka-fine">{found.length} {found.length === 1 ? 'question matches' : 'questions match'} “{query}” across all rooms.</p>}
      <ul className="ka-list" aria-label={query.trim() ? 'Search results' : `${roomName(pillar)} questions`}>
        {shown.map((r) => <GameRow key={r.game.id} row={r} showRoom={!!query.trim()} onEdit={() => setEditing({ row: r, pillar: r.game.pillar })} />)}
      </ul>
      {!shown.length && <p className="ka-empty">Nothing here yet.</p>}
    </>
  );
}

function GameRow({ row, showRoom, onEdit }: { row: Row; showRoom: boolean; onEdit: () => void }) {
  const [busy, note, run] = useBusy();
  const { game, origin, live, builtIn } = row;
  const hide = () => run(async () => {
    await saveLive('game', game.id, plain({ ...(live ?? builtIn ?? game), pillar: game.pillar, hidden: true }));
  });
  const show = () => run(async () => {
    if (live && builtIn && sameContent(live, builtIn)) await deleteLive('game', game.id);
    else await saveLive('game', game.id, plain({ ...live, hidden: undefined }));
  });

  return (
    <li style={origin === 'hidden' ? { opacity: 0.7 } : undefined}>
      <div className="ka-row-main">
        <b>{game.title}</b>
        <span>{game.setup}</span>
        <ul className="ka-answers">
          {game.choices.map((c, i) => (
            <li key={i} className={c.best ? 'is-best' : ''}>
              <span aria-hidden="true">{c.emoji}</span>
              <span>{c.label}{c.best ? ' ★ best' : ''} <span className="ka-muted">· {c.points} pts · “{c.response}”</span></span>
            </li>
          ))}
        </ul>
        {game.reactions.length > 0 && (
          <small>Feelings Crew: {game.reactions.map((r) => `${crewName(r.who)}: “${r.line}”`).join(' · ')}</small>
        )}
        <NoteLine note={note} />
      </div>
      <div className="ka-row-side" style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
        <div className="ka-chips">
          {showRoom && <span className="ka-chip">{roomName(game.pillar)}</span>}
          <span className="ka-chip">{row.ages}</span>
          {origin === 'added' && <span className="ka-chip is-added">Added here</span>}
          {origin === 'changed' && <span className="ka-chip is-edited">Changed here</span>}
          {origin === 'hidden' && <span className="ka-chip is-hidden">Hidden</span>}
        </div>
        <div className="ka-actions">
          {origin !== 'hidden' && <button className="ka-btn ka-btn-small" disabled={busy} onClick={onEdit}>Edit</button>}
          {builtIn && origin !== 'hidden' && <button className="ka-btn ka-btn-small" disabled={busy} onClick={() => void hide()}>Hide</button>}
          {origin === 'hidden' && <button className="ka-btn ka-btn-small" disabled={busy} onClick={() => void show()}>Show again</button>}
        </div>
      </div>
    </li>
  );
}

interface Draft {
  pillar: BehaviourPillar;
  title: string;
  setup: string;
  choices: { emoji: string; label: string; points: number; best: boolean; response: string }[];
  reactions: { who: string; line: string }[];
  minAge: number | '';
  maxAge: number | '';
}

function draftFrom(row: Row | undefined, pillar: BehaviourPillar): Draft {
  if (!row) {
    return {
      pillar, title: '', setup: '', minAge: '', maxAge: '', reactions: [],
      choices: [
        { emoji: '💬', label: '', points: 15, best: true, response: '' },
        { emoji: '🤔', label: '', points: 5, best: false, response: '' },
        { emoji: '🙈', label: '', points: 5, best: false, response: '' },
      ],
    };
  }
  const g = row.game;
  return {
    pillar: g.pillar, title: g.title, setup: g.setup,
    choices: g.choices.map((c) => ({ emoji: c.emoji, label: c.label, points: c.points, best: !!c.best, response: c.response })),
    reactions: g.reactions.map((r) => ({ ...r })),
    minAge: row.live?.minAge ?? '', maxAge: row.live?.maxAge ?? '',
  };
}

function problemsOf(d: Draft): string[] {
  const out: string[] = [];
  if (!d.title.trim()) out.push('Give it a short title.');
  if (!d.setup.trim()) out.push('Write the question.');
  if (d.choices.length < 2) out.push('It needs at least two answers.');
  d.choices.forEach((c, i) => {
    if (!c.label.trim()) out.push(`Answer ${i + 1} needs words.`);
    if (!c.response.trim()) out.push(`Answer ${i + 1} needs Chirpy’s reply.`);
  });
  if (!d.choices.some((c) => c.best)) out.push('Mark at least one best answer.');
  if (d.minAge !== '' && d.maxAge !== '' && d.minAge > d.maxAge) out.push('The youngest age is above the oldest.');
  return out;
}

function GameEditor({ row, pillar, rows, onDone }: { row?: Row; pillar: BehaviourPillar; rows: Row[]; onDone: () => void }) {
  const [d, setD] = useState<Draft>(() => draftFrom(row, pillar));
  const [asking, setAsking] = useState<'leave' | 'undo' | 'delete' | null>(null);
  const [busy, note, run] = useBusy();
  const start = useMemo(() => JSON.stringify(draftFrom(row, pillar)), [row, pillar]);
  const dirty = JSON.stringify(d) !== start;
  const problems = problemsOf(d);
  const others = rows.filter((r) => r.game.id !== row?.game.id);
  const matches = useMemo(() => similarTo(d.setup, others, (r) => r.game.setup, 0.45, 4), [d.setup, others]);
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const setChoice = (i: number, patch: Partial<Draft['choices'][number]>) =>
    setD((x) => ({ ...x, choices: x.choices.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));
  const setReaction = (i: number, patch: Partial<Draft['reactions'][number]>) =>
    setD((x) => ({ ...x, reactions: x.reactions.map((r, j) => (j === i ? { ...r, ...patch } : r)) }));

  const save = () => run(async () => {
    const id = row?.game.id ?? newId('game');
    const game = {
      id, pillar: d.pillar, title: d.title.trim(), setup: d.setup.trim(),
      choices: d.choices.map((c) => ({ emoji: c.emoji.trim() || '💬', label: c.label.trim(), points: c.points, best: c.best || undefined, response: c.response.trim() })),
      reactions: d.reactions.filter((r) => r.line.trim()).map((r) => ({ who: r.who, line: r.line.trim() })),
      minAge: d.minAge === '' ? undefined : d.minAge,
      maxAge: d.maxAge === '' ? undefined : d.maxAge,
    };
    await saveLive('game', id, plain(game));
    onDone();
  });
  const undo = () => run(async () => { await deleteLive('game', row!.game.id); onDone(); });

  return (
    <>
      <div className="ka-section-head">
        <button className="ka-link" onClick={() => (dirty ? setAsking('leave') : onDone())}>← All questions</button>
      </div>
      <div className="ka-head">
        <h1>{row ? 'Change a question' : 'Add a question'}</h1>
        {row?.builtIn && <p className="ka-lede">This is one of the built-in questions. Your version replaces it for every child; “Undo changes” brings the original back.</p>}
      </div>
      {asking === 'leave' && <Ask text="Leave without saving your changes?" yes="Leave without saving" no="Keep editing" onYes={onDone} onNo={() => setAsking(null)} />}

      <section className="ka-panel" aria-label="The question">
        <div className="ka-grid2">
          <Field label="Room">
            <select className="ka-select" value={d.pillar} disabled={!!row?.builtIn} onChange={(e) => set({ pillar: e.target.value as BehaviourPillar })}>
              {PILLARS.map((p) => <option key={p} value={p}>{roomName(p)}</option>)}
            </select>
          </Field>
          <Field label="Short title" hint="shown above the question">
            <input className="ka-input" value={d.title} maxLength={60} placeholder="Someone is alone" onChange={(e) => set({ title: e.target.value })} />
          </Field>
        </div>
        <Field label="The question">
          <textarea className="ka-textarea" value={d.setup} maxLength={300} rows={3}
            placeholder="At break, you see a kid sitting by themselves, watching everyone else play. What do you do?"
            onChange={(e) => set({ setup: e.target.value })} />
        </Field>
        <Similar draft={d.setup} matches={matches} line={(r) => r.game.setup} where={(r) => roomName(r.game.pillar)} noun="question" />
      </section>

      <section className="ka-section" aria-label="Answers">
        <div className="ka-section-head">
          <h2>Answers <span className="ka-muted">({d.choices.length})</span></h2>
          {d.choices.length < 4 && (
            <button className="ka-btn ka-btn-small" onClick={() => set({ choices: [...d.choices, { emoji: '💭', label: '', points: 5, best: false, response: '' }] })}>Add an answer</button>
          )}
        </div>
        {d.choices.map((c, i) => (
          <div key={i} className="ka-answer-edit">
            <Field label="Emoji"><input className="ka-input ka-emoji" value={c.emoji} maxLength={8} onChange={(e) => setChoice(i, { emoji: e.target.value })} /></Field>
            <Field label={`Answer ${i + 1}`}><input className="ka-input" value={c.label} maxLength={60} placeholder="Say hi and smile" onChange={(e) => setChoice(i, { label: e.target.value })} /></Field>
            <Field label="Points">
              <select className="ka-select" value={c.points} onChange={(e) => setChoice(i, { points: Number(e.target.value) })}>
                {[5, 8, 10, 12, 15, 20].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <div className="ka-wide">
              <Field label="Chirpy’s reply after this answer">
                <input className="ka-input" value={c.response} maxLength={300} placeholder="A warm hello! Sunny does a little spin."
                  onChange={(e) => setChoice(i, { response: e.target.value })} />
              </Field>
            </div>
            <div className="ka-wide ka-actions">
              <label className="ka-check">
                <input type="checkbox" checked={c.best}
                  onChange={(e) => setChoice(i, e.target.checked ? { best: true, points: Math.max(c.points, 15) } : { best: false })} />
                A best answer <span className="ka-muted">(most have one; a few have two)</span>
              </label>
              {d.choices.length > 2 && <button className="ka-link" onClick={() => set({ choices: d.choices.filter((_, j) => j !== i) })}>Remove this answer</button>}
            </div>
          </div>
        ))}
      </section>

      <section className="ka-panel" aria-label="Feelings Crew">
        <div className="ka-section-head">
          <h2 className="ka-label">Feelings Crew lines before the answers <span className="ka-muted">(optional)</span></h2>
          {d.reactions.length < 3 && <button className="ka-btn ka-btn-small" onClick={() => set({ reactions: [...d.reactions, { who: 'sunny', line: '' }] })}>Add a line</button>}
        </div>
        {d.reactions.map((r, i) => (
          <div key={i} className="ka-title-row" style={{ gridTemplateColumns: '140px 1fr' }}>
            <Field label="Who">
              <select className="ka-select" value={r.who} onChange={(e) => setReaction(i, { who: e.target.value })}>
                {CREW.map((c) => <option key={c} value={c}>{crewName(c)}</option>)}
              </select>
            </Field>
            <Field label="Says">
              <input className="ka-input" value={r.line} maxLength={140} placeholder="They might be feeling lonely." onChange={(e) => setReaction(i, { line: e.target.value })} />
            </Field>
          </div>
        ))}
        {!d.reactions.length && <p className="ka-fine">Most questions have two or three lines from the crew, each a different way of feeling about it.</p>}
      </section>

      <section className="ka-panel" aria-label="Ages and saving">
        {row?.builtIn ? <p className="ka-fine">{row.ages}, as built in.</p> : <div className="ka-grid2">
          <Field label="Youngest age">
            <select className="ka-select" value={d.minAge} onChange={(e) => set({ minAge: e.target.value ? Number(e.target.value) : '' })}>
              <option value="">Any</option>
              {Array.from({ length: 12 }, (_, i) => i + 3).map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Oldest age">
            <select className="ka-select" value={d.maxAge} onChange={(e) => set({ maxAge: e.target.value ? Number(e.target.value) : '' })}>
              <option value="">Any</option>
              {Array.from({ length: 12 }, (_, i) => i + 3).map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
        </div>}
        {problems.length > 0 && dirty && (
          <div className="ka-note is-warn" role="status">Before it can be saved:<ul>{problems.slice(0, 4).map((p) => <li key={p}>{p}</li>)}</ul></div>
        )}
        <div className="ka-actions">
          <button className="ka-btn ka-btn-go" disabled={busy || !dirty || problems.length > 0} onClick={() => void save()}>{busy ? 'Saving…' : 'Save'}</button>
          {row?.origin === 'changed' && <button className="ka-btn" disabled={busy} onClick={() => setAsking('undo')}>Undo changes</button>}
          {row?.origin === 'added' && <button className="ka-btn ka-btn-danger" disabled={busy} onClick={() => setAsking('delete')}>Delete question</button>}
        </div>
        <NoteLine note={note} />
        {asking === 'undo' && <Ask text="Put the original question back for everyone?" yes="Undo changes" no="Keep mine" onYes={() => { setAsking(null); void undo(); }} onNo={() => setAsking(null)} />}
        {asking === 'delete' && <Ask text="Delete this question for everyone?" yes="Delete question" onYes={() => { setAsking(null); void undo(); }} onNo={() => setAsking(null)} />}
      </section>
    </>
  );
}
