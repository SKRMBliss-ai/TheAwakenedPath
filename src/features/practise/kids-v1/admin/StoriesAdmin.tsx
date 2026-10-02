import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { todayKey } from '../../../kids/data';
import {
  ADVENTURES, MAX_PAGES, MAX_PAGE_TEXT, adventureForWeek, dayDate, dayKeyOf, storyProblems, weekStartKey,
  type Adventure, type Chapter, type ParentStory, type StoryPage,
} from '../../../kids/delight';
import { useLiveContent } from '../kit/liveContent';
import { deleteLive, saveLive } from '../kit/liveContentApi';
import { stopSpeaking } from '../kit/chirpyVoice';
import { Reader } from '../best/AdventureMap';
import { Ask, EmojiPicks, NoteLine } from './ui';
import { plain, useBusy } from './adminKit';

/* Stories for the Story Map, shared with every child. */

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SWATCHES = [
  ['Sunshine', '#ffd86b'], ['Sky', '#8ec8ff'], ['Peach', '#ffb48a'], ['Lavender', '#c9a6ff'],
  ['Rose', '#ff9ec7'], ['Mint', '#9be3a7'], ['Lagoon', '#7fe0e0'], ['Honey', '#ffc46b'],
] as const;
const MAX_SCENE = 24;
/** Who the preview reads to. Every child hears their own name. */
const SAMPLE_NAME = 'Sam';

function addWeeks(week: string, n: number): string {
  const d = dayDate(week);
  d.setDate(d.getDate() + 7 * n);
  return dayKeyOf(d);
}

/** "5 – 11 Oct", or "28 Sep – 4 Oct" across a month end. */
function weekRange(week: string): string {
  const start = dayDate(week);
  const end = dayDate(week);
  end.setDate(end.getDate() + 6);
  const short = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return start.getMonth() === end.getMonth() ? `${start.getDate()} – ${short(end)}` : `${short(start)} – ${short(end)}`;
}

function chapterWritten(ch: Chapter): boolean {
  return !!ch.title.trim() && ch.pages.length > 0 && ch.pages.every((p) => p.text.trim());
}

function statusOf(story: ParentStory, thisWeek: string): string {
  if (!story.week) return `Draft · ${story.chapters.filter(chapterWritten).length} of 7 chapters written`;
  if (story.week === thisWeek) return 'On the Story Map this week';
  return story.week > thisWeek ? `On the Story Map ${weekRange(story.week)}` : `Told ${weekRange(story.week)}`;
}

function blankStory(): ParentStory {
  return {
    id: `own-${Date.now().toString(36)}`,
    title: '', cover: '📖', color: SWATCHES[0][1], keepsake: '',
    chapters: DAYS.map(() => ({ title: '', pages: [{ scene: '', text: '' }] })),
  };
}

/*
  STORIES WRITTEN BEFORE THEY WERE SHARED. For a few hours the Story Studio
  kept stories on the device that wrote them. They sit in that device's saved
  progress until someone shares them from here.
*/
const KID_STORE = 'my-best-every-day';

function deviceStories(): ParentStory[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KID_STORE) ?? 'null') as { state?: { parentStories?: unknown } } | null;
    const list = raw?.state?.parentStories;
    return Array.isArray(list) ? (list as ParentStory[]).filter((s) => s && typeof s.id === 'string' && Array.isArray(s.chapters)) : [];
  } catch { return []; }
}

function forgetDeviceStories(): void {
  try {
    const raw = JSON.parse(localStorage.getItem(KID_STORE) ?? 'null') as { state?: Record<string, unknown> } | null;
    if (!raw?.state) return;
    delete raw.state.parentStories;
    localStorage.setItem(KID_STORE, JSON.stringify(raw));
  } catch { /* nothing to tidy */ }
}

function Preview({ story, chapter, onChapter, onClose }: {
  story: Adventure; chapter: number | null; onChapter: (n: number) => void; onClose: () => void;
}) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {chapter !== null && (
        <Reader key={chapter} story={story} chapter={chapter} name={SAMPLE_NAME} still preview
          onClose={() => { stopSpeaking(); onClose(); }}
          onCorner={onClose}
          onNext={chapter < story.chapters.length - 1 ? () => onChapter(chapter + 1) : null} />
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function StoriesAdmin() {
  const [editing, setEditing] = useState<ParentStory | null>(null);
  return editing
    ? <StoryEditor key={editing.id} initial={editing} onClose={() => { setEditing(null); window.scrollTo(0, 0); }} />
    : <StoriesHome onEdit={(s) => { setEditing(s); window.scrollTo(0, 0); }} />;
}

function StoriesHome({ onEdit }: { onEdit: (story: ParentStory) => void }) {
  const stories = useLiveContent((s) => s.stories);
  const thisWeek = weekStartKey(todayKey());
  const weeks = [0, 1, 2, 3, 4, 5].map((n) => addWeeks(thisWeek, n));
  const [reading, setReading] = useState<{ story: Adventure; chapter: number } | null>(null);
  const [device, setDevice] = useState(() => deviceStories().filter((d) => !stories.some((s) => s.id === d.id)));
  const [busy, note, run] = useBusy();

  const shareDevice = () => run(async () => {
    for (const s of device) await saveLive('story', s.id, plain({ ...s, keepsake: '' }));
    forgetDeviceStories();
    setDevice([]);
    return `Shared ${device.length === 1 ? 'the story' : `all ${device.length} stories`} from this device.`;
  });

  return (
    <>
      <div className="ka-head">
        <h1>Stories</h1>
        <p className="ka-lede">
          One story a week on the Story Map, seven chapters, one opening each day. A week with nothing booked gets one of the
          four built-in stories, which take turns. A child who has started a story finishes it that week, even if you book a
          different one.
        </p>
      </div>

      {device.length > 0 && (
        <div className="ka-panel">
          <b>{device.length === 1 ? 'A story written on this device isn’t shared yet' : `${device.length} stories written on this device aren’t shared yet`}</b>
          <p className="ka-soft" style={{ margin: 0 }}>
            {device.map((s) => `“${s.title.trim() || 'Untitled story'}”`).join(', ')}. Sharing them makes them part of the Story Map
            for every child, in the weeks they were booked for.
          </p>
          <div className="ka-actions">
            <button className="ka-btn ka-btn-go" disabled={busy} onClick={() => void shareDevice()}>{busy ? 'Sharing…' : 'Share them'}</button>
          </div>
        </div>
      )}
      <NoteLine note={note} />

      <section className="ka-section" aria-labelledby="ka-coming">
        <div className="ka-section-head"><h2 id="ka-coming">Coming up on the Story Map</h2></div>
        <ol className="ka-list ka-weeks">
          {weeks.map((w) => {
            const story = adventureForWeek(w, stories);
            const yours = stories.some((s) => s.id === story.id);
            return (
              <li key={w}>
                <span className="ka-when">{w === thisWeek ? 'This week' : weekRange(w)}</span>
                <span className="ka-icon" aria-hidden="true">{story.cover}</span>
                <span className="ka-row-main"><b>{story.title}</b></span>
                <span className="ka-row-side">{yours ? <span className="ka-chip is-added">Written here</span> : <span className="ka-chip">Built in</span>}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="ka-section" aria-labelledby="ka-yours">
        <div className="ka-section-head">
          <h2 id="ka-yours">Written here</h2>
          <button className="ka-btn ka-btn-go" onClick={() => onEdit(blankStory())}>Write a new story</button>
        </div>
        {stories.length === 0
          ? <p className="ka-empty">Nothing written yet. A story is seven short chapters, one for each day of the week. A few sentences a chapter is plenty.</p>
          : (
            <ul className="ka-list">
              {[...stories].sort((a, b) => (b.week ?? '9999').localeCompare(a.week ?? '9999')).map((s) => (
                <li key={s.id}>
                  <span className="ka-icon" aria-hidden="true">{s.cover || '📖'}</span>
                  <span className="ka-row-main"><b>{s.title.trim() || 'Untitled story'}</b><small>{statusOf(s, thisWeek)}</small></span>
                  <span className="ka-row-side"><button className="ka-btn ka-btn-small" onClick={() => onEdit(s)}>Edit</button></span>
                </li>
              ))}
            </ul>
          )}
      </section>

      <section className="ka-section" aria-labelledby="ka-built">
        <div className="ka-section-head"><h2 id="ka-built">Built in</h2></div>
        <ul className="ka-list">
          {ADVENTURES.map((s) => (
            <li key={s.id}>
              <span className="ka-icon" aria-hidden="true">{s.cover}</span>
              <span className="ka-row-main"><b>{s.title}</b><small>{s.chapters.map((c) => c.title).join(' · ')}</small></span>
              <span className="ka-row-side"><button className="ka-btn ka-btn-small" onClick={() => setReading({ story: s, chapter: 0 })}>Read it</button></span>
            </li>
          ))}
        </ul>
      </section>
      <Preview story={reading?.story ?? ADVENTURES[0]} chapter={reading?.chapter ?? null}
        onChapter={(chapter) => setReading((r) => r && { ...r, chapter })} onClose={() => setReading(null)} />
    </>
  );
}

function StoryEditor({ initial, onClose }: { initial: ParentStory; onClose: () => void }) {
  const stories = useLiveContent((s) => s.stories);
  const thisWeek = weekStartKey(todayKey());
  const [draft, setDraft] = useState(initial);
  const [day, setDay] = useState(0);
  const [pickFor, setPickFor] = useState<'cover' | number | null>(null);
  const [newPage, setNewPage] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState<number | null>(null);
  const [asking, setAsking] = useState<'leave' | 'delete' | null>(null);
  const [busy, note, run, setNote] = useBusy();
  const texts = useRef<Array<HTMLTextAreaElement | null>>([]);

  const saved = stories.find((s) => s.id === draft.id);
  const dirty = JSON.stringify(plain(draft)) !== JSON.stringify(plain(saved ?? initial));
  const others = stories.filter((s) => s.id !== draft.id);
  const problems = storyProblems(draft);
  const canSave = dirty && !busy && (!draft.week || problems.length === 0);
  const ch = draft.chapters[day];

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const edit = (change: (d: ParentStory) => ParentStory) => { setDraft(change); setNote(null); setAsking(null); };
  const editChapter = (patch: Partial<Chapter>) =>
    edit((d) => ({ ...d, chapters: d.chapters.map((c, i) => (i === day ? { ...c, ...patch } : c)) }));
  const editPage = (p: number, patch: Partial<StoryPage>) =>
    editChapter({ pages: ch.pages.map((pg, i) => (i === p ? { ...pg, ...patch } : pg)) });

  const addPage = () => {
    editChapter({ pages: [...ch.pages, { scene: '', text: '' }] });
    setNewPage(ch.pages.length);
  };
  const removePage = (p: number) => editChapter({ pages: ch.pages.filter((_, i) => i !== p) });

  const insertName = (p: number) => {
    const el = texts.current[p];
    const text = ch.pages[p].text;
    const from = el?.selectionStart ?? text.length;
    const to = el?.selectionEnd ?? text.length;
    if (text.length - (to - from) + 6 > MAX_PAGE_TEXT) return;
    editPage(p, { text: `${text.slice(0, from)}{name}${text.slice(to)}` });
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(from + 6, from + 6); });
  };

  const save = () => run(async () => {
    const clean: ParentStory = {
      ...draft,
      title: draft.title.trim(),
      cover: draft.cover.trim() || '📖',
      keepsake: '',
      chapters: draft.chapters.map((c) => ({
        title: c.title.trim(),
        pages: c.pages.map((p) => ({ scene: p.scene.trim(), text: p.text.trim() })),
      })),
    };
    await saveLive('story', clean.id, plain(clean));
    setDraft(clean);
    if (!clean.week) return 'Saved as a draft. Only you can see it here.';
    if (clean.week === thisWeek) return 'Saved. Children who haven’t started this week’s story get this one the next time they open the app.';
    if (clean.week > thisWeek) return `Saved. It goes on the Story Map on Monday ${dayDate(clean.week).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}.`;
    return 'Saved.';
  });

  const remove = () => run(async () => {
    await deleteLive('story', draft.id);
    onClose();
  });

  const weekChoices = Array.from({ length: 8 }, (_, n) => addWeeks(thisWeek, n)).map((w, n) => {
    const taken = others.find((o) => o.week === w);
    const when = n === 0 ? `This week (${weekRange(w)})` : n === 1 ? `Next week (${weekRange(w)})` : weekRange(w);
    return { w, off: !!taken, label: taken ? `${when} · taken by “${taken.title.trim() || 'Untitled story'}”` : when };
  });
  const toldWeek = draft.week && draft.week < thisWeek ? draft.week : null;
  const saveLabel = busy ? 'Saving…' : !dirty && saved ? 'Saved'
    : draft.week && draft.week >= thisWeek && saved?.week !== draft.week ? 'Save and put it on the map' : 'Save';
  const previewStory: ParentStory = { ...draft, title: draft.title.trim() || 'Untitled story', cover: draft.cover.trim() || '📖' };

  return (
    <>
      <div className="ka-section-head">
        <button className="ka-link" onClick={() => (dirty ? setAsking('leave') : onClose())}>← All stories</button>
      </div>
      <div className="ka-head">
        <h1>{saved ? (saved.title.trim() || 'Untitled story') : 'New story'}</h1>
        <p className="ka-lede">Seven chapters, one for each day of the week. Each chapter has up to {MAX_PAGES} short pages, and each page has a picture made of emoji.</p>
      </div>
      {asking === 'leave' && <Ask text="Leave without saving your changes?" yes="Leave without saving" no="Keep editing" onYes={onClose} onNo={() => setAsking(null)} />}

      <section className="ka-panel" aria-label="The story">
        <div className="ka-title-row">
          <label className="ka-field">
            <span>Story title</span>
            <input className="ka-input" value={draft.title} maxLength={60} placeholder="Chirpy and the Brave Little Boat"
              onFocus={() => setPickFor(null)} onChange={(e) => edit((d) => ({ ...d, title: e.target.value }))} />
          </label>
          <label className="ka-field">
            <span>Cover</span>
            <input className="ka-input ka-emoji" value={draft.cover} maxLength={8}
              onFocus={() => setPickFor('cover')} onChange={(e) => edit((d) => ({ ...d, cover: e.target.value }))} />
          </label>
        </div>
        {pickFor === 'cover' && <EmojiPicks onPick={(e) => edit((d) => ({ ...d, cover: e }))} />}
        <fieldset className="ka-field">
          <legend>Colour on the map</legend>
          <div className="ka-swatches">
            {SWATCHES.map(([label, hex]) => (
              <button key={hex} type="button" className="ka-swatch" style={{ background: hex }} aria-label={label}
                aria-pressed={draft.color === hex} onClick={() => edit((d) => ({ ...d, color: hex }))} />
            ))}
          </div>
        </fieldset>
      </section>

      <section className="ka-section" aria-labelledby="ka-ch-head">
        <nav className="ka-days" aria-label="Chapters">
          {draft.chapters.map((c, i) => (
            <button key={i} className="ka-day" aria-pressed={i === day}
              aria-label={`Chapter ${i + 1}, ${DAYS[i]}${chapterWritten(c) ? ', written' : ''}`}
              onClick={() => { setDay(i); setPickFor(null); setNewPage(null); }}>
              <b>{i + 1}</b><span>{DAYS[i].slice(0, 3)}</span>
              {chapterWritten(c) && <i aria-hidden="true">✓</i>}
            </button>
          ))}
        </nav>

        <div className="ka-panel">
          <div className="ka-chapter-head">
            <h2 id="ka-ch-head">Chapter {day + 1} <small>opens on {DAYS[day]}</small></h2>
            <button className="ka-btn ka-btn-small" onClick={() => setPreviewing(day)}>Preview</button>
          </div>
          <label className="ka-field">
            <span>Chapter title</span>
            <input className="ka-input" value={ch.title} maxLength={48} placeholder="A Surprise in the Garden"
              onFocus={() => setPickFor(null)} onChange={(e) => editChapter({ title: e.target.value })} />
          </label>

          {ch.pages.map((pg, p) => (
            <div key={`${day}-${p}`} className="ka-page">
              <div className="ka-page-head">
                <b>Page {p + 1}</b>
                {ch.pages.length > 1 && <button className="ka-link" onClick={() => removePage(p)}>Remove page</button>}
              </div>
              <label className="ka-field">
                <span>Picture <small>one to three emoji</small></span>
                <input className="ka-input ka-emoji ka-scene" value={pg.scene} maxLength={MAX_SCENE} placeholder={draft.cover || '📖'}
                  onFocus={() => setPickFor(p)} onChange={(e) => editPage(p, { scene: e.target.value })} />
              </label>
              {pickFor === p && (
                <EmojiPicks onPick={(e) => { if (pg.scene.length + e.length <= MAX_SCENE) editPage(p, { scene: pg.scene + e }); }} />
              )}
              <label className="ka-field">
                <span>Words</span>
                <textarea className="ka-textarea" ref={(el) => { texts.current[p] = el; }} value={pg.text} rows={3} maxLength={MAX_PAGE_TEXT}
                  autoFocus={newPage === p} onFocus={() => setPickFor(null)}
                  onChange={(e) => editPage(p, { text: e.target.value })} />
              </label>
              <div className="ka-page-foot">
                <button className="ka-link" onClick={() => insertName(p)}>Add the child’s name</button>
                <span aria-label={`${pg.text.length} of ${MAX_PAGE_TEXT} characters`}>{pg.text.length}/{MAX_PAGE_TEXT}</span>
              </div>
            </div>
          ))}
          {ch.pages.length < MAX_PAGES && <div className="ka-actions"><button className="ka-btn" onClick={addPage}>Add a page</button></div>}
          <p className="ka-fine">Where it says {'{name}'}, Chirpy says the reading child’s own name. The preview uses “{SAMPLE_NAME}”.</p>
        </div>
      </section>

      <section className="ka-panel" aria-label="When it is told">
        <label className="ka-field">
          <span>When children read it</span>
          <select className="ka-select" value={draft.week ?? ''}
            onChange={(e) => { const week = e.target.value || undefined; edit((d) => ({ ...d, week })); }}>
            <option value="">Not yet: keep it as a draft</option>
            {toldWeek && <option value={toldWeek}>{weekRange(toldWeek)} (already told)</option>}
            {weekChoices.map((c) => <option key={c.w} value={c.w} disabled={c.off}>{c.label}</option>)}
          </select>
        </label>
        {draft.week === thisWeek && (
          <p className="ka-fine">Children who have already started this week’s story finish it first. Everyone else gets this one.</p>
        )}
        {draft.week && problems.length > 0 && (
          <div className="ka-note is-warn" role="status">
            {saved?.week === draft.week ? 'Before you can save:' : 'Before it can go on the map:'}
            <ul>{problems.slice(0, 3).map((p) => <li key={p}>{p}</li>)}</ul>
            {problems.length > 3 && <div>And {problems.length - 3} more.</div>}
            <div>Or choose “keep it as a draft” to save what you have so far.</div>
          </div>
        )}
        <div className="ka-actions">
          <button className="ka-btn ka-btn-go" onClick={() => void save()} disabled={!canSave}>{saveLabel}</button>
          {saved && <button className="ka-btn ka-btn-danger" disabled={busy} onClick={() => setAsking('delete')}>Delete story</button>}
        </div>
        <NoteLine note={note} />
        {asking === 'delete' && (
          <Ask text={`Delete “${saved?.title.trim() || 'Untitled story'}” for everyone? This can’t be undone.`} yes="Delete story"
            onYes={() => { setAsking(null); void remove(); }} onNo={() => setAsking(null)} />
        )}
      </section>

      <Preview story={previewStory} chapter={previewing} onChapter={setPreviewing} onClose={() => setPreviewing(null)} />
    </>
  );
}
