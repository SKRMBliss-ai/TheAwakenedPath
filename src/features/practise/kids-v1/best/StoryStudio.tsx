import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { todayKey } from '../../../kids/data';
import {
  MAX_PAGES, MAX_PAGE_TEXT, adventureForWeek, dayDate, dayKeyOf, storyProblems, weekStartKey,
  type Chapter, type ParentStory, type StoryPage,
} from '../../../kids/delight';
import { SCENE_MOODS } from '../rooms';
import { CHROME, FONT } from '../ui/chrome';
import { useQuiet } from '../ui/quiet';
import { stopSpeaking } from '../kit/chirpyVoice';
import { Reader } from './AdventureMap';
import './StoryStudio.css';

/* Where a grown-up writes a story for the Story Map. Plain on purpose, like the note composer. */

const EMPTY: number[] = [];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SWATCHES = [
  ['Sunshine', '#ffd86b'], ['Sky', '#8ec8ff'], ['Peach', '#ffb48a'], ['Lavender', '#c9a6ff'],
  ['Rose', '#ff9ec7'], ['Mint', '#9be3a7'], ['Lagoon', '#7fe0e0'], ['Honey', '#ffc46b'],
] as const;
const PICTURES = [
  '🐦', '🌙', '⭐', '✨', '☀️', '🌈', '🌳', '🌸', '🏡', '🌊', '⛰️', '🐻', '🐰', '🦊',
  '🐢', '🦉', '🐉', '🚀', '🏰', '🎁', '💛', '🤝', '😊', '😢', '😠', '😨', '🤗', '💤',
];
const MAX_SCENE = 24;

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

function useKidName(): string {
  const name = useKidStore((s) => s.name);
  return name && name !== 'Explorer' ? name : '';
}

function Back({ onClick, label }: { onClick: () => void; label: string }) {
  return <button className="ss-back" onClick={onClick} aria-label={label}><ChevronLeft size={22} /></button>;
}

export function StoryStudio({ onBack }: { onBack: () => void }) {
  const mood = SCENE_MOODS.night;
  const [passed, setPassed] = useState(false);
  const [editing, setEditing] = useState<ParentStory | null>(null);

  return (
    <main className="ss-room" style={{
      fontFamily: FONT,
      background: `linear-gradient(170deg, ${mood.ground[0]} 0%, ${mood.ground[1]} 100%)`,
      '--ss-text': CHROME.text, '--ss-soft': CHROME.textSoft, '--ss-pill': CHROME.pill, '--ss-border': CHROME.pillBorder,
      '--ss-sel': CHROME.pillSelected, '--ss-sel-border': CHROME.pillSelectedBorder,
      '--ss-back': CHROME.back, '--ss-back-border': CHROME.backBorder,
    } as CSSProperties}>
      <div className="ss-col">
        {!passed
          ? <GrownUpCheck onBack={onBack} onPass={() => setPassed(true)} />
          : editing
            ? <StoryEditor key={editing.id} initial={editing} onClose={() => setEditing(null)} />
            : <StudioHome onBack={onBack} onEdit={setEditing} />}
      </div>
    </main>
  );
}

/** A different sum each time, so a child can't learn the answer by watching. */
function GrownUpCheck({ onBack, onPass }: { onBack: () => void; onPass: () => void }) {
  const [sum] = useState(() => {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 6 + Math.floor(Math.random() * 4);
    return { q: `What is ${a} × ${b}?`, a: a * b };
  });
  const [guess, setGuess] = useState('');

  return (
    <>
      <Back onClick={onBack} label="Back to the Story Map" />
      <div className="ss-gate">
        <h1>This bit’s for a grown-up</h1>
        <label htmlFor="ss-sum">{sum.q}</label>
        <input id="ss-sum" inputMode="numeric" autoComplete="off" autoFocus value={guess}
          onChange={(e) => { setGuess(e.target.value); if (Number(e.target.value) === sum.a) onPass(); }} />
      </div>
    </>
  );
}

function StudioHome({ onBack, onEdit }: { onBack: () => void; onEdit: (story: ParentStory) => void }) {
  const stories = useKidStore((s) => s.parentStories);
  const thisWeek = weekStartKey(todayKey());
  const readNow = useKidStore((s) => s.chaptersRead[thisWeek] ?? EMPTY);
  const kid = useKidName();
  const weeks = [0, 1, 2, 3].map((n) => addWeeks(thisWeek, n));

  return (
    <>
      <Back onClick={onBack} label="Back to the Story Map" />
      <header className="ss-head">
        <h1>Story Studio</h1>
        <p>Write a story for {kid || 'your child'}. Each story has the Story Map to itself for a week, and one chapter opens every day.</p>
      </header>

      <section className="ss-section" aria-labelledby="ss-coming">
        <h2 id="ss-coming">Coming up on the Story Map</h2>
        <ol className="ss-weeks">
          {weeks.map((w) => {
            const story = adventureForWeek(w, stories);
            return (
              <li key={w}>
                <span className="ss-when">{w === thisWeek ? 'This week' : weekRange(w)}</span>
                <span className="ss-week-story"><span aria-hidden="true">{story.cover}</span> {story.title}</span>
                {w === thisWeek && <span className="ss-chip">{readNow.length} of 7 read</span>}
                {stories.some((s) => s.id === story.id) && <span className="ss-chip is-yours">Yours</span>}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="ss-section" aria-labelledby="ss-yours">
        <h2 id="ss-yours">Your stories</h2>
        {stories.length === 0
          ? <p className="ss-soft">Nothing written yet. A story is seven short chapters, one for each day of the week. A few sentences a chapter is plenty.</p>
          : (
            <ul className="ss-stories">
              {stories.map((s) => (
                <li key={s.id}>
                  <span className="ss-cover" aria-hidden="true">{s.cover || '📖'}</span>
                  <span className="ss-story-text">
                    <b>{s.title.trim() || 'Untitled story'}</b>
                    <small>{statusOf(s, thisWeek)}</small>
                  </span>
                  <button className="ss-btn" onClick={() => onEdit(s)}>Edit</button>
                </li>
              ))}
            </ul>
          )}
        <div className="ss-actions">
          <button className="ss-btn ss-primary" onClick={() => onEdit(blankStory())}>Write a new story</button>
        </div>
      </section>

      <p className="ss-fine">Stories are kept on this device.</p>
    </>
  );
}

function Picks({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <div className="ss-picks" role="group" aria-label="Quick pictures">
      {PICTURES.map((e) => <button key={e} type="button" onClick={() => onPick(e)}>{e}</button>)}
    </div>
  );
}

function StoryEditor({ initial, onClose }: { initial: ParentStory; onClose: () => void }) {
  const stories = useKidStore((s) => s.parentStories);
  const saveParentStory = useKidStore((s) => s.saveParentStory);
  const deleteParentStory = useKidStore((s) => s.deleteParentStory);
  const thisWeek = weekStartKey(todayKey());
  const readNow = useKidStore((s) => s.chaptersRead[thisWeek] ?? EMPTY);
  const kid = useKidName();
  const child = kid || 'your child';
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const [draft, setDraft] = useState(initial);
  const [day, setDay] = useState(0);
  const [pickFor, setPickFor] = useState<'cover' | number | null>(null);
  const [newPage, setNewPage] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState<number | null>(null);
  const [asking, setAsking] = useState<'leave' | 'delete' | null>(null);
  const [notice, setNotice] = useState('');
  const texts = useRef<Array<HTMLTextAreaElement | null>>([]);

  const saved = stories.find((s) => s.id === draft.id);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved ?? initial);
  const others = stories.filter((s) => s.id !== draft.id);
  /* The map keeps one week's reading under that week, so a story a child has started can't be swapped out. */
  const pinned = saved?.week === thisWeek && readNow.length > 0;
  const problems = storyProblems(draft);
  const canSave = dirty && (!draft.week || problems.length === 0);
  const ch = draft.chapters[day];

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const edit = (change: (d: ParentStory) => ParentStory) => { setDraft(change); setNotice(''); setAsking(null); };
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

  const save = () => {
    if (!canSave) return;
    const clean: ParentStory = {
      ...draft,
      title: draft.title.trim(),
      cover: draft.cover.trim() || '📖',
      chapters: draft.chapters.map((c) => ({
        title: c.title.trim(),
        pages: c.pages.map((p) => ({ scene: p.scene.trim(), text: p.text.trim() })),
      })),
    };
    saveParentStory(clean);
    setDraft(clean);
    setNotice(!clean.week ? 'Saved as a draft.'
      : clean.week === thisWeek ? `Saved. It’s on the Story Map now.`
      : clean.week > thisWeek ? `Saved. It goes on the Story Map on Monday ${dayDate(clean.week).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}.`
      : 'Saved.');
  };

  const weekChoices = Array.from({ length: 8 }, (_, n) => addWeeks(thisWeek, n)).map((w, n) => {
    const taken = others.find((o) => o.week === w);
    const started = n === 0 && readNow.length > 0 && saved?.week !== thisWeek;
    const when = n === 0 ? `This week (${weekRange(w)})` : n === 1 ? `Next week (${weekRange(w)})` : weekRange(w);
    return {
      w, off: !!taken || started,
      label: taken ? `${when} · taken by “${taken.title.trim() || 'Untitled story'}”` : started ? `${when} · already started` : when,
    };
  });
  const toldWeek = draft.week && draft.week < thisWeek ? draft.week : null;
  const saveLabel = !dirty && saved ? 'Saved'
    : draft.week && draft.week >= thisWeek && saved?.week !== draft.week ? 'Save and put it on the map' : 'Save';

  const previewStory: ParentStory = { ...draft, title: draft.title.trim() || 'Untitled story', cover: draft.cover.trim() || '📖' };

  return (
    <>
      <div className="ss-topbar">
        <Back onClick={() => (dirty ? setAsking('leave') : onClose())} label="Back to your stories" />
        <span className="ss-crumb">{saved ? 'Edit story' : 'New story'}</span>
      </div>
      {asking === 'leave' && (
        <div className="ss-ask" role="alert">
          <p>Leave without saving your changes?</p>
          <button className="ss-btn ss-danger" onClick={onClose}>Leave without saving</button>
          <button className="ss-btn" onClick={() => setAsking(null)} autoFocus>Keep editing</button>
        </div>
      )}

      <section className="ss-section" aria-label="The story">
        <div className="ss-title-row">
          <label className="ss-field">
            <span>Story title</span>
            <input value={draft.title} maxLength={60} placeholder={`${kid || 'Chirpy'} and the Brave Little Boat`}
              onFocus={() => setPickFor(null)} onChange={(e) => edit((d) => ({ ...d, title: e.target.value }))} />
          </label>
          <label className="ss-field">
            <span>Cover</span>
            <input className="ss-emoji" value={draft.cover} maxLength={8} aria-describedby="ss-pick-hint"
              onFocus={() => setPickFor('cover')} onChange={(e) => edit((d) => ({ ...d, cover: e.target.value }))} />
          </label>
        </div>
        {pickFor === 'cover' && <Picks onPick={(e) => edit((d) => ({ ...d, cover: e }))} />}
        <fieldset className="ss-field">
          <legend>Colour on the map</legend>
          <div className="ss-swatches">
            {SWATCHES.map(([label, hex]) => (
              <button key={hex} type="button" className="ss-swatch" style={{ background: hex }} aria-label={label}
                aria-pressed={draft.color === hex} onClick={() => edit((d) => ({ ...d, color: hex }))} />
            ))}
          </div>
        </fieldset>
      </section>

      <section className="ss-section" aria-labelledby="ss-ch-head">
        <nav className="ss-days" aria-label="Chapters">
          {draft.chapters.map((c, i) => (
            <button key={i} className="ss-day" aria-pressed={i === day}
              aria-label={`Chapter ${i + 1}, ${DAYS[i]}${chapterWritten(c) ? ', written' : ''}`}
              onClick={() => { setDay(i); setPickFor(null); setNewPage(null); }}>
              <b>{i + 1}</b><span>{DAYS[i].slice(0, 3)}</span>
              {chapterWritten(c) && <i aria-hidden="true">✓</i>}
            </button>
          ))}
        </nav>

        <div className="ss-chapter">
          <div className="ss-chapter-head">
            <h2 id="ss-ch-head">Chapter {day + 1} <small>opens on {DAYS[day]}</small></h2>
            <button className="ss-btn" onClick={() => setPreviewing(day)}>Preview</button>
          </div>
          <label className="ss-field">
            <span>Chapter title</span>
            <input value={ch.title} maxLength={48} placeholder="A Surprise in the Garden"
              onFocus={() => setPickFor(null)} onChange={(e) => editChapter({ title: e.target.value })} />
          </label>

          <ol className="ss-pages">
            {ch.pages.map((pg, p) => (
              <li key={`${day}-${p}`} className="ss-page">
                <div className="ss-page-head">
                  <b>Page {p + 1}</b>
                  {ch.pages.length > 1 && <button className="ss-link" onClick={() => removePage(p)}>Remove page</button>}
                </div>
                <label className="ss-field">
                  <span>Picture <small>one to three emoji</small></span>
                  <input className="ss-emoji ss-scene" value={pg.scene} maxLength={MAX_SCENE} placeholder={draft.cover || '📖'}
                    aria-describedby="ss-pick-hint"
                    onFocus={() => setPickFor(p)} onChange={(e) => editPage(p, { scene: e.target.value })} />
                </label>
                {pickFor === p && (
                  <Picks onPick={(e) => { if (pg.scene.length + e.length <= MAX_SCENE) editPage(p, { scene: pg.scene + e }); }} />
                )}
                <label className="ss-field">
                  <span>Words</span>
                  <textarea ref={(el) => { texts.current[p] = el; }} value={pg.text} rows={3} maxLength={MAX_PAGE_TEXT}
                    autoFocus={newPage === p} onFocus={() => setPickFor(null)}
                    onChange={(e) => editPage(p, { text: e.target.value })} />
                </label>
                <div className="ss-page-foot">
                  <button className="ss-link" onClick={() => insertName(p)}>Add {kid ? `${kid}’s` : 'your child’s'} name</button>
                  <span aria-label={`${pg.text.length} of ${MAX_PAGE_TEXT} characters`}>{pg.text.length}/{MAX_PAGE_TEXT}</span>
                </div>
              </li>
            ))}
          </ol>
          {ch.pages.length < MAX_PAGES && <div className="ss-actions"><button className="ss-btn" onClick={addPage}>Add a page</button></div>}
          <p id="ss-pick-hint" className="ss-fine">
            Tap a picture box for quick emoji. Where it says {'{name}'}, Chirpy reads out {kid ? `${kid}’s` : 'your child’s'} name.
          </p>
        </div>
      </section>

      <section className="ss-section" aria-label="When it is read">
        <label className="ss-field">
          <span>When {child} reads it</span>
          <select value={draft.week ?? ''} disabled={pinned}
            onChange={(e) => { const week = e.target.value || undefined; edit((d) => ({ ...d, week })); }}>
            <option value="">Not yet: keep it as a draft</option>
            {toldWeek && <option value={toldWeek}>{weekRange(toldWeek)} (already told)</option>}
            {weekChoices.map((c) => <option key={c.w} value={c.w} disabled={c.off}>{c.label}</option>)}
          </select>
        </label>
        {pinned && (
          <p className="ss-soft">
            {kid || 'Your child'} has read {readNow.length} {readNow.length === 1 ? 'chapter' : 'chapters'} of it this week,
            so it stays on the map until Sunday. You can still change the words.
          </p>
        )}
        {draft.week && problems.length > 0 && (
          <div className="ss-problems" role="status">
            <b>{saved?.week === draft.week ? 'Before you can save' : 'Before it can go on the map'}</b>
            <ul>{problems.slice(0, 3).map((p) => <li key={p}>{p}</li>)}</ul>
            {problems.length > 3 && <p>And {problems.length - 3} more.</p>}
            {!pinned && <p>Or choose “keep it as a draft” to save what you have so far.</p>}
          </div>
        )}
        <div className="ss-actions">
          <button className="ss-btn ss-primary" onClick={save} disabled={!canSave}>{saveLabel}</button>
          {saved && !pinned && <button className="ss-btn ss-danger" onClick={() => setAsking('delete')}>Delete story</button>}
        </div>
        {notice && <p className="ss-notice" role="status">{notice}</p>}
        {asking === 'delete' && (
          <div className="ss-ask" role="alert">
            <p>Delete “{saved?.title.trim() || 'Untitled story'}”? This can’t be undone.</p>
            <button className="ss-btn ss-danger" onClick={() => { deleteParentStory(draft.id); onClose(); }}>Delete story</button>
            <button className="ss-btn" onClick={() => setAsking(null)} autoFocus>Keep it</button>
          </div>
        )}
      </section>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {previewing !== null && (
            <Reader key={previewing} story={previewStory} chapter={previewing} name={kid} still={quiet || !!reduced} preview
              onClose={() => { stopSpeaking(); setPreviewing(null); }}
              onCorner={() => setPreviewing(null)}
              onNext={previewing < 6 ? () => setPreviewing(previewing + 1) : null} />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
