import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useKidStore, type SavedReflection } from '../../../kids/store';
import { FONT } from '../ui/chrome';
import { speak, stopSpeaking } from '../kit/chirpyVoice';
import { useQuiet } from '../ui/quiet';
import * as sound from '../kit/sound';
import { pickThreeAffirmations } from '../kit/affirmations';
import './ReflectionPath.css';

const MAX_BRICKS = 10;

/** The approved handoff art — MindGym_Reflection_Path_Implementation_Pack. */
const A = '/mind-gym/reflection/';

const BRICK_EMPTY  = `${A}reflection_brick_empty@4x.png`;
const BRICK_HOVER  = `${A}reflection_brick_hover@4x.png`;
const BRICK_DONE   = `${A}reflection_brick_completed@4x.png`;
const BRICK_LOCKED = `${A}reflection_brick_locked@4x.png`;

/**
 * WHERE EACH STONE SITS, AS THE REFERENCE LAYS THEM.
 *
 * reflection_path_magic_journey.png does not draw a grid — it draws a path
 * climbing from the bottom left to the Reflection Room at the top right, with
 * the stones at irregular sizes and offsets so it reads as somewhere you walk
 * rather than as a list of cards. Ten slots, in percentages of the stage, so
 * the climb holds its shape at every width.
 */
const PATH_SLOTS = [
  { left: 3,  top: 70, size: 20 },
  { left: 20, top: 79, size: 18 },
  { left: 35, top: 66, size: 21 },
  { left: 50, top: 76, size: 18 },
  { left: 57, top: 54, size: 19 },
  { left: 68, top: 67, size: 17 },
  { left: 72, top: 42, size: 18 },
  { left: 83, top: 54, size: 17 },
  { left: 85, top: 30, size: 16 },
  { left: 68, top: 22, size: 15 },
];

/** A small mark per category, as the reference paints on each stone. */
const TAG_ICON: Record<string, string> = {
  brave: '⛰', calm: '🌿', kind: '💬', belonging: '👥', try_again: '☀', other: '✦',
};

const TAG_LABELS: Record<string, string> = {
  brave: 'Brave',
  calm: 'Calm',
  kind: 'Kind',
  belonging: 'Belonging',
  try_again: 'Try Again',
  other: 'Other',
};

const FILTER_TABS = ['All', 'Recent', 'Favourites', 'Brave', 'Calm', 'Kind', 'Belonging', 'Try Again'] as const;
type FilterTab = typeof FILTER_TABS[number];

/** The four words on the spines of the book stack, straight off the sheet. */
const SPINES = ['Calmer', 'Kinder', 'Braver', 'Happier Tomorrows'];

/**
 * THE ROOM IS PAINTED, NOT DESCRIBED.
 *
 * Every screen in the handoff is a lit place — a waterfall behind the path, a
 * rug and a beanbag in the room, lanterns hung over the playback. The build had
 * none of it: 22 of the pack's plates sat unused in public/ while the CSS drew
 * flat gradients, which is the whole of why it did not look like the reference.
 *
 * So the decor is a layer of its own, behind the content and inert to the
 * pointer, arranged per screen. Each plate is optional — one that fails to load
 * removes itself rather than leaving a broken image where a lantern should be,
 * because none of this is load-bearing for the reflection underneath it.
 */
function Decor({ variant, still }: { variant: 'room' | 'path' | 'library' | 'playback'; still: boolean }) {
  const hide = (e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; };
  const plate = (file: string, cls: string) => (
    <img key={file + cls} src={`${A}${file}`} alt="" aria-hidden="true" className={cls} onError={hide} draggable={false} />
  );

  return (
    <div className={`rp-decor rp-decor-${variant} ${still ? 'rp-decor-still' : ''}`} aria-hidden="true">
      {variant === 'path' && <>
        {plate('waterfall.png', 'rp-d rp-d-waterfall')}
        {plate('crystal_cluster.png', 'rp-d rp-d-crystal')}
        {plate('lantern_star.png', 'rp-d rp-d-lantern-l')}
        {plate('lantern_star.png', 'rp-d rp-d-lantern-r')}
        {plate('plant_decor.png', 'rp-d rp-d-plant-l')}
        {plate('plant_pot.png', 'rp-d rp-d-plant-r')}
        {plate('cloud_element.png', 'rp-d rp-d-cloud')}
        {plate('sparkles_trail.png', 'rp-d rp-d-sparkles')}
      </>}

      {variant === 'room' && <>
        {plate('window_view.png', 'rp-d rp-d-window')}
        {plate('waterfall.png', 'rp-d rp-d-room-fall')}
        {plate('lantern_star.png', 'rp-d rp-d-lantern-l')}
        {plate('lantern_star.png', 'rp-d rp-d-lantern-r')}
        {plate('plant_decor.png', 'rp-d rp-d-plant-l')}
        {plate('plant_pot.png', 'rp-d rp-d-plant-r')}
        {plate('rug.png', 'rp-d rp-d-rug')}
        {plate('beanbag.png', 'rp-d rp-d-beanbag')}
        {plate('table_cup.png', 'rp-d rp-d-cup')}
        {plate('magic_swirl.png', 'rp-d rp-d-swirl')}
      </>}

      {variant === 'library' && <>
        {plate('window_view.png', 'rp-d rp-d-window')}
        {plate('bench.png', 'rp-d rp-d-bench')}
        {plate('plant_decor.png', 'rp-d rp-d-plant-l')}
        {plate('plant_pot.png', 'rp-d rp-d-plant-r')}
        {plate('lantern_star.png', 'rp-d rp-d-lantern-l')}
        {plate('sparkles_trail.png', 'rp-d rp-d-sparkles')}
      </>}

      {variant === 'playback' && <>
        {plate('crystal_cluster.png', 'rp-d rp-d-crystal')}
        {plate('beanbag.png', 'rp-d rp-d-beanbag')}
        {plate('rug.png', 'rp-d rp-d-rug')}
        {plate('plant_decor.png', 'rp-d rp-d-plant-l')}
        {plate('hearts_particles.png', 'rp-d rp-d-hearts')}
        {plate('magic_swirl.png', 'rp-d rp-d-swirl')}
      </>}
    </div>
  );
}

/** The four painted word-blocks that lean against the wall in every scene. */
function Spines() {
  return <p className="rp-spines" aria-hidden="true">{SPINES.map((s) => <span key={s}>{s}</span>)}</p>;
}

/** ── Playback screen ──────────────────────────────────────────────────── */

function PlaybackView({ reflection, onBack, onGrownUp, onShuffle, onPlayFavourites, still, quiet }: {
  reflection: SavedReflection;
  onBack: () => void;
  onGrownUp: () => void;
  onShuffle: () => void;
  onPlayFavourites: () => void;
  still: boolean;
  quiet: boolean;
}) {
  const toggleFav = useKidStore((s) => s.toggleReflectionFavourite);
  const setAffirmation = useKidStore((s) => s.setReflectionAffirmation);
  const isFav = useKidStore((s) => s.savedReflections.find((r) => r.id === reflection.id)?.favourite ?? false);
  const currentAffirmation = useKidStore((s) => s.savedReflections.find((r) => r.id === reflection.id)?.affirmation);
  const [showAffirmationPicker, setShowAffirmationPicker] = useState(true);
  const [affirmationChoices] = useState(() => {
    const three = pickThreeAffirmations(reflection.tag);
    // If they already picked one, keep it visible so they can re-select or swap it out.
    if (currentAffirmation && !three.includes(currentAffirmation)) {
      three[2] = currentAffirmation;
    }
    return three;
  });
  /*
    THE SELECTOR RETURNS THE ARRAY, AND THE FILTER HAPPENS HERE.
    `useKidStore(s => s.savedReflections.filter(...))` builds a new array on
    every call, so useSyncExternalStore compares two different references,
    decides the store changed, and re-renders forever — which took the whole
    screen down to the error boundary rather than merely being slow.
  */
  const allSaved = useKidStore((s) => s.savedReflections);
  const favourites = useMemo(() => allSaved.filter((r) => r.favourite), [allSaved]);
  const [speaking, setSpeaking] = useState(false);
  const [withMe, setWithMe] = useState(false);
  const [breathing, setBreathing] = useState(false);

  /*
    NO INVENTED CLOCK. The reference draws a scrubber with 0:00 / 2:24 on it,
    but nothing here is a recording — the line is spoken by the browser's own
    voice, whose length we do not know and cannot seek inside. A progress bar
    counting against a made-up duration would be a lie the child can catch
    (it finishes talking while the bar is half full), so the transport shows
    whether it is speaking, and the bar animates only as a "still going"
    indicator. Every other control in the sheet is real.
  */
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => { setSpeaking(false); setWithMe(false); stopSpeaking(); }, [reflection.id]);

  const say = () => {
    if (!quiet) sound.play('tap');
    if (speaking) { stopSpeaking(); setSpeaking(false); return; }
    setSpeaking(true);
    const line = currentAffirmation || reflection.pathLabel;
    speak(line, quiet);
    /* The voice has no reliable end event across browsers, so the indicator
       stands down on a timer scaled to the length of the line. */
    window.setTimeout(() => setSpeaking(false), Math.max(2600, line.length * 95));
  };

  const chooseAffirmation = (affirmation: string) => {
    if (!quiet) sound.play('tap');
    setAffirmation(reflection.id, affirmation);
    setShowAffirmationPicker(false);
  };

  return (
    <div className="rp-room rp-playback" style={{ fontFamily: FONT }}>
      <Decor variant="playback" still={still} />
      <header className="rp-header">
        <button className="rp-back" onClick={onBack} aria-label="Back to Reflection Path">←</button>
        <div className="rp-title">
          <h1>Play &amp; Relax Mode</h1>
          <p>Your reflection, a little gentler, a little brighter.</p>
        </div>
        <button className="chrome-fade rp-grownup-btn" onClick={onGrownUp} aria-label="Talk to a grown-up">♡</button>
      </header>

      {/* The row of hung lanterns, each carrying one of the child's own lines. */}
      {favourites.length > 0 && (
        <ul className="rp-lanterns" aria-label="Your favourite reflections">
          {favourites.slice(0, 4).map((f) => (
            <li key={f.id}><button onClick={() => { sound.play('tap'); speak(f.pathLabel, quiet); }}>{f.pathLabel}</button></li>
          ))}
        </ul>
      )}

      <div className="rp-playback-stage">
        <img src={`${A}child_character.png`} alt="" aria-hidden="true" className="rp-child rp-child-rest"
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <img src={`${A}chirpy_character.png`} alt="" aria-hidden="true" className="rp-chirpy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />

        <div className="rp-playback-card">
          <span className="rp-card-eyebrow">✦ Today’s Reflection</span>
          <span className="rp-tag-pill">{TAG_LABELS[reflection.tag] ?? 'Reflection'}</span>
          <p className="rp-playback-phrase">"{reflection.pathLabel}"</p>
          {reflection.feeling && (
            <p className="rp-feeling-echo">You felt: <strong>{reflection.feeling}</strong></p>
          )}
          {/*
            MY STORY REFLECTIONS — the chain, as the transition sheet draws it.

            story_lab_to_reflection_room_transition.png lays the reflection out
            as four linked cards: what happened, the old story, another way,
            and the affirmation that came out of it. Showing only the last two
            loses the thing the walk was for — a child seeing that the same
            event carried two different stories, and that they chose one.

            Each link renders only if that step was answered, so a reflection
            saved from a shorter walk shows a shorter chain rather than empty
            cards.
          */}
          {(reflection.whatHappened || reflection.originalStory || reflection.anotherWay) && (
            <ol className="rp-chain" aria-label="My story reflection">
              {reflection.whatHappened && (
                <li><b>What happened</b><span>{reflection.whatHappened}</span></li>
              )}
              {reflection.originalStory && (
                <li className="rp-chain-old"><b>Old story</b><span>"{reflection.originalStory}"</span></li>
              )}
              {reflection.anotherWay && reflection.anotherWay !== reflection.originalStory && (
                <li className="rp-chain-new"><b>Another way</b><span>"{reflection.anotherWay}"</span></li>
              )}
              {/* Only show the affirmation slot once the child has actually chosen one */}
              {currentAffirmation && (
                <li className="rp-chain-affirm">
                  <b>My affirmation</b>
                  <span>"{currentAffirmation}"</span>
                </li>
              )}
            </ol>
          )}

          {/* Affirmation picker — always visible, above the transport */}
          {showAffirmationPicker && (
            <div className="rp-affirmation-picker">
              <p className="rp-affirmation-prompt">
                {currentAffirmation
                  ? 'Your affirmation — pick again or keep it.'
                  : 'Pick an affirmation to carry with you.'}
              </p>
              <div className="rp-affirmation-choices">
                {affirmationChoices.map((affirmation) => (
                  <button
                    key={affirmation}
                    onClick={() => chooseAffirmation(affirmation)}
                    className={`rp-affirmation-choice${currentAffirmation === affirmation ? ' rp-affirmation-chosen' : ''}`}
                  >
                    {affirmation}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  if (!quiet) sound.play('tap');
                  setShowAffirmationPicker(false);
                }}
                className="rp-affirmation-custom"
              >
                Say my own instead
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rp-transport">
        <div className={`rp-transport-bar ${speaking ? 'is-playing' : ''}`}>
          <img src={`${A}open_magic_book.png`} alt="" aria-hidden="true" className="rp-transport-art"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="rp-transport-meta">
            <b>A Kinder Story for You</b>
            <small>{speaking ? 'Playing…' : 'Narrated by your friend'}</small>
            <span className="rp-transport-track"><i /></span>
          </div>
          <button className="rp-transport-btn" onClick={say} aria-pressed={speaking}
            aria-label={speaking ? 'Stop playing this reflection' : 'Play this reflection'}>
            {speaking ? '❚❚' : '▶'}
          </button>
        </div>

        <div className="rp-relax-actions">
          <button onClick={say} aria-pressed={speaking}><span aria-hidden="true">🎧</span> Listen quietly</button>
          <button className={withMe ? 'rp-on' : ''} aria-pressed={withMe}
            onClick={() => { sound.play('tap'); setWithMe(true); speak(reflection.pathLabel, quiet); }}>
            <span aria-hidden="true">🎤</span> Say it with me
          </button>
          <button onClick={() => { sound.play('tap'); onPlayFavourites(); }} disabled={!favourites.length}>
            <span aria-hidden="true">♥</span> Play all favourites
          </button>
          <button onClick={() => { sound.play('tap'); onShuffle(); }}>
            <span aria-hidden="true">⇄</span> Shuffle one more
          </button>
          {/* The third action the transition sheet draws beside the other two. */}
          <button className={breathing ? 'rp-on' : ''} aria-pressed={breathing}
            onClick={() => { sound.play('tap'); setBreathing((v) => !v); }}>
            <span aria-hidden="true">❁</span> Breathe and believe
          </button>
        </div>
        {breathing && (
          <p className="rp-breathe" role="status">
            <span className="rp-breathe-orb" aria-hidden="true" />
            Breathe in… and out. Now say it once more, slowly.
          </p>
        )}
        {withMe && <p className="rp-with-me-hint" role="status">Say it out loud with me — as many times as you like.</p>}
      </div>

      <footer className="rp-stop">
        <button
          onClick={() => { sound.play('tap'); toggleFav(reflection.id); }}
          className={`rp-fav-btn ${isFav ? 'rp-fav-active' : ''}`}
          aria-pressed={isFav}
        >
          {isFav ? '♥ Saved to favourites' : '♡ Add to favourites'}
        </button>
        <button className="rp-cta rp-cta-small" onClick={onBack}>Back to my path</button>
        <button className="chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </footer>
      <p className="rp-footer-note" aria-hidden="true">Little by little, your brighter story grows. ♡</p>
    </div>
  );
}

/** ── Library screen ──────────────────────────────────────────────────── */

function LibraryView({ onBack, onPlay, onGrownUp, still }: {
  onBack: () => void;
  onPlay: (r: SavedReflection) => void;
  onGrownUp: () => void;
  still: boolean;
}) {
  const reflections = useKidStore((s) => s.savedReflections);
  const toggleFav = useKidStore((s) => s.toggleReflectionFavourite);
  const [tab, setTab] = useState<FilterTab>('All');

  const filtered = useMemo(() => {
    const all = [...reflections].reverse(); // newest first
    if (tab === 'All') return all;
    if (tab === 'Recent') return all.slice(0, 20);
    if (tab === 'Favourites') return all.filter((r) => r.favourite);
    if (tab === 'Brave') return all.filter((r) => r.tag === 'brave');
    if (tab === 'Calm') return all.filter((r) => r.tag === 'calm');
    if (tab === 'Kind') return all.filter((r) => r.tag === 'kind');
    if (tab === 'Belonging') return all.filter((r) => r.tag === 'belonging');
    if (tab === 'Try Again') return all.filter((r) => r.tag === 'try_again');
    return all;
  }, [reflections, tab]);

  return (
    <div className="rp-room rp-library" style={{ fontFamily: FONT }}>
      <Decor variant="library" still={still} />
      <header className="rp-header">
        <button className="rp-back" onClick={onBack} aria-label="Back to the Reflection Room">←</button>
        <div className="rp-title">
          <h1>My Reflection Library</h1>
          <p>All your reflections live here.</p>
        </div>
        <button className="chrome-fade rp-grownup-btn" onClick={onGrownUp} aria-label="Talk to a grown-up">♡</button>
      </header>

      <div className="rp-chirpy-says">
        <img src={`${A}chirpy_character.png`} alt="" aria-hidden="true"
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <p>Look how much you’ve grown!</p>
      </div>

      <nav className="rp-filter-tabs" aria-label="Filter reflections">
        {FILTER_TABS.map((t) => (
          <button
            key={t}
            className={tab === t ? 'rp-tab-active' : ''}
            onClick={() => { sound.play('tap'); setTab(t); }}
            aria-pressed={tab === t}
          >
            {t}
          </button>
        ))}
      </nav>

      <p className="rp-count" role="status">{filtered.length} {filtered.length === 1 ? 'reflection' : 'reflections'}</p>

      <div className="rp-library-grid">
        {filtered.length === 0 && (
          <p className="rp-empty">
            {tab === 'Favourites'
              ? 'No favourites yet — tap the heart on any reflection.'
              : 'Nothing here yet.'}
          </p>
        )}
        {filtered.map((r) => (
          <article key={r.id} className="rp-card">
            <button className="rp-card-open" onClick={() => onPlay(r)} aria-label={`Play reflection: ${r.pathLabel}`}>
              <span className="rp-card-art" aria-hidden="true">
                <img src={BRICK_DONE} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </span>
              <p className="rp-card-phrase">"{r.pathLabel}"</p>
              <span className={`rp-tag-pill rp-tag-${r.tag}`}>{TAG_LABELS[r.tag] ?? r.tag}</span>
              {r.feeling && <small className="rp-card-feeling">You felt: {r.feeling}</small>}
            </button>
            <button
              onClick={() => { sound.play('tap'); toggleFav(r.id); }}
              className={`rp-fav-icon ${r.favourite ? 'rp-fav-active' : ''}`}
              aria-label={r.favourite ? 'Remove from favourites' : 'Add to favourites'}
              aria-pressed={r.favourite}
            >
              {r.favourite ? '♥' : '♡'}
            </button>
          </article>
        ))}
      </div>

      <footer className="rp-stop">
        <button className="chrome-fade" onClick={onBack}>← Back to the room</button>
        <button className="chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </footer>
      <p className="rp-footer-note" aria-hidden="true">Different thoughts create brighter tomorrows. ♡</p>
    </div>
  );
}

/** ── The Reflection Room — the door the whole feature opens behind ────── */

function RoomView({ picks, onPlayOne, onShuffle, onLibrary, onPath, onExit, onGrownUp, still, hasAny }: {
  picks: SavedReflection[];
  onPlayOne: () => void;
  onShuffle: () => void;
  onLibrary: () => void;
  onPath: () => void;
  onExit: () => void;
  onGrownUp: () => void;
  still: boolean;
  hasAny: boolean;
}) {
  return (
    <div className="rp-room rp-roomview" style={{ fontFamily: FONT }}>
      <Decor variant="room" still={still} />
      <header className="rp-header">
        <button className="rp-back" onClick={onExit} aria-label="Back to Mind Gym">←</button>
        <div className="rp-title rp-arch">
          <h1>Reflection Room <span aria-hidden="true">♡</span></h1>
          <p>Welcome back! Let’s take a moment.</p>
        </div>
        <button className="chrome-fade rp-grownup-btn" onClick={onGrownUp} aria-label="Talk to a grown-up">♡</button>
      </header>

      <div className="rp-room-stage">
        <img src={`${A}child_character.png`} alt="" aria-hidden="true" className="rp-child"
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <img src={`${A}chirpy_character.png`} alt="" aria-hidden="true" className="rp-chirpy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />

        {hasAny ? (
          <>
            <p className="rp-welcome">Here are a few gentle reflections from your journey.</p>
            {/*
              THREE PICKS, NOT THE WHOLE ARCHIVE. The handoff asks the room to
              open with a small, calm handful and to keep everything else one
              tap away in the library — a child who walks in on twelve cards is
              being given homework, not a moment.
            */}
            <ul className="rp-picks" aria-label="A few reflections from your journey">
              {picks.map((r) => (
                <li key={r.id}>
                  <button onClick={onPlayOne} aria-label={`Play reflection: ${r.pathLabel}`}>
                    <span className={`rp-tag-pill rp-tag-${r.tag}`}>{TAG_LABELS[r.tag] ?? r.tag}</span>
                    <span className="rp-pick-phrase">"{r.pathLabel}"</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="rp-empty-state">
            <img src={`${A}open_magic_book.png`} alt="" className="rp-empty-book" aria-hidden="true"
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <h2>Your room is waiting.</h2>
            <p>Finish a Story Lab journey and your first reflection will be here, ready to visit again.</p>
          </div>
        )}
      </div>

      <div className="rp-room-actions">
        <button className="rp-cta rp-cta-big" onClick={onPlayOne} disabled={!hasAny}>
          <span aria-hidden="true">▶</span> Play one for me
        </button>
        <div className="rp-room-secondary">
          <button onClick={onShuffle} disabled={!hasAny}><span aria-hidden="true">⇄</span> Shuffle reflections</button>
          <button onClick={onLibrary}><span aria-hidden="true">📖</span> Open My Reflection Library</button>
          <button onClick={onPath} disabled={!hasAny}><span aria-hidden="true">✦</span> Walk my Reflection Path</button>
        </div>
      </div>

      <Spines />
      <footer className="rp-stop">
        <button className="chrome-fade" onClick={onExit}>← Back to Mind Gym</button>
        <button className="chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </footer>
      <p className="rp-footer-note" aria-hidden="true">Same you. Brighter views. ♡</p>
    </div>
  );
}

/** ── The path of bricks ──────────────────────────────────────────────── */

export function ReflectionPath({ onExit, onGrownUp }: {
  onExit: () => void;
  onGrownUp: () => void;
}) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const still = quiet || !!reduced;
  const allReflections = useKidStore((s) => s.savedReflections);
  const markPlayed = useKidStore((s) => s.markReflectionPlayed);

  const [inner, setInner] = useState<'room' | 'path' | 'library' | 'playback'>('room');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  /*
    SHUFFLE IS A REAL RESHUFFLE. The sample is seeded on the day so the path is
    the same place for the whole visit — "Shuffle reflections" bumps this nonce
    to deal a fresh hand on demand, which is the one thing that button means.
  */
  const [shuffleNonce, setShuffleNonce] = useState(0);
  const returnTo = useRef<'room' | 'path'>('room');

  const sample = useMemo(() => {
    if (!allReflections.length) return [];
    const pool: SavedReflection[] = [];
    for (const r of allReflections) { pool.push(r); if (r.favourite) pool.push(r); }
    let s = Math.floor(Date.now() / 86_400_000) + shuffleNonce * 7919;
    const rand = () => { s = ((s * 1664525 + 1013904223) | 0) >>> 0; return s / 0x100000000; };
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const seen = new Set<string>();
    const result: SavedReflection[] = [];
    for (const r of pool) {
      if (!seen.has(r.id)) { seen.add(r.id); result.push(r); }
      if (result.length >= MAX_BRICKS) break;
    }
    return result;
  }, [allReflections, shuffleNonce]);

  /*
    EVERY MOVE BETWEEN SCREENS IS AUDIBLE.

    Walking from the room to the path, opening the library, coming back — each
    is a door, and silence made them read as the page swapping. One helper so
    the cue cannot be forgotten at a call site, and so it is silenced in one
    place for a child who has asked for quiet.
  */
  const go = (next: 'room' | 'path' | 'library' | 'playback') => {
    if (!quiet) sound.play(next === 'playback' ? 'enterRoom' : 'panelSlide');
    setInner(next);
  };

  const playReflection = (r: SavedReflection, from: 'room' | 'path' = 'path') => {
    returnTo.current = from;
    if (!quiet) sound.play('roomCard');
    setPlayingId(r.id);
    setVisitedIds((v) => new Set([...v, r.id]));
    markPlayed(r.id);
    go('playback');
  };

  const playRandom = (from: 'room' | 'path' = 'path') => {
    if (!sample.length) return;
    const unvisited = sample.filter((r) => !visitedIds.has(r.id));
    const pool = unvisited.length ? unvisited : sample;
    playReflection(pool[Math.floor(Math.random() * pool.length)], from);
  };

  const playFavourites = () => {
    const favs = allReflections.filter((r) => r.favourite);
    if (favs.length) playReflection(favs[Math.floor(Math.random() * favs.length)], returnTo.current);
  };

  const playingReflection = allReflections.find((r) => r.id === playingId);

  if (inner === 'playback' && playingReflection) {
    return (
      <PlaybackView
        reflection={playingReflection}
        onBack={() => go(returnTo.current)}
        onGrownUp={onGrownUp}
        onShuffle={() => playRandom(returnTo.current)}
        onPlayFavourites={playFavourites}
        still={still}
        quiet={quiet}
      />
    );
  }

  if (inner === 'library') {
    return (
      <LibraryView
        onBack={() => go('room')}
        onPlay={(r) => playReflection(r, 'room')}
        onGrownUp={onGrownUp}
        still={still}
      />
    );
  }

  if (inner === 'room') {
    return (
      <RoomView
        picks={sample.slice(0, 3)}
        hasAny={allReflections.length > 0}
        onPlayOne={() => playRandom('room')}
        onShuffle={() => { sound.play('tap'); setShuffleNonce((n) => n + 1); }}
        onLibrary={() => go('library')}
        onPath={() => go('path')}
        onExit={onExit}
        onGrownUp={onGrownUp}
        still={still}
      />
    );
  }

  /*
    THE PATH IS A PATH.

    Laid against reflection_path_magic_journey.png rather than as a grid: the
    stones climb from the bottom left towards the Reflection Room at the top
    right, the boy walks at the near end of them with Chirpy, the signs stand
    where the reference stands them, and the three controls sit in a bar along
    the foot.

    THE PATH IS ALWAYS TEN STONES. The reference draws a full path, and the
    pack ships a `locked` plate for the ones not yet earned, so the stones the
    child has not reached stand there waiting rather than the path stopping
    short. Locked stones are inert and out of the tab order — they are scenery
    that shows where this is going, not controls that do nothing.
  */
  const walked = sample.slice(0, PATH_SLOTS.length);
  const stones = PATH_SLOTS.map((slot, i) => ({ slot, i, reflection: walked[i] ?? null }));

  return (
    <div className="rp-room rp-pathview" style={{ fontFamily: FONT }}>
      <Decor variant="path" still={still} />
      <header className="rp-header">
        <button className="rp-back" onClick={() => go('room')} aria-label="Back to the Reflection Room">←</button>
        <div className="rp-title rp-path-title">
          <h1>Reflection Path</h1>
          <p>Tap a glowing brick to open a reflection from your journey.</p>
        </div>
        <button className="chrome-fade rp-grownup-btn" onClick={onGrownUp} aria-label="Talk to a grown-up">♡</button>
      </header>

      <div className="rp-stage">
        {/* The parchment on the wall, and the bird who explains the place. */}
        <p className="rp-sign rp-sign-left" aria-hidden="true">
          Every step you’ve taken has helped you grow. Tap a glowing brick to revisit a special reflection! <b>♡</b>
        </p>
        <div className="rp-walker">
          <img className="rp-chirpy" src={`${A}chirpy_character.png`} alt="" aria-hidden="true"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <p className="rp-walker-line">Each brick holds a surprise from your journey!</p>
          <img className="rp-child" src={`${A}child_character.png`} alt="" aria-hidden="true"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>

        {/* The destination, standing at the top of the climb. */}
        <button className="rp-arch" onClick={() => go('room')}>
          <img src={`${A}reflection_portal.png`} alt="" aria-hidden="true"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span>Reflection<br />Room <b aria-hidden="true">♡</b></span>
        </button>

        <p className="rp-sign rp-sign-right" aria-hidden="true">Same You<br />Brighter Views <b>♡</b></p>
        <p className="rp-posts" aria-hidden="true">
          <span>Kinder Choices</span><span>Braver Me</span><span>Happier Tomorrows</span>
        </p>

        <ul className="rp-bricks" aria-label="Your reflection path">
          {stones.map(({ slot, i, reflection: r }) => {
            const style = { left: `${slot.left}%`, top: `${slot.top}%`, width: `${slot.size}%`, '--brick-index': i } as React.CSSProperties;

            if (!r) {
              return (
                <li key={`locked-${i}`} className="rp-slot rp-slot-locked" style={style} aria-hidden="true">
                  <span className="rp-brick rp-brick-locked">
                    <img src={BRICK_LOCKED} alt="" className="rp-brick-img"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </span>
                </li>
              );
            }

            const visited = visitedIds.has(r.id);
            const hovered = hoveredId === r.id;
            const brickSrc = hovered ? BRICK_HOVER : visited ? BRICK_DONE : BRICK_EMPTY;
            return (
              <li key={r.id} className="rp-slot" style={style}>
                <button
                  className={`rp-brick${visited ? ' rp-brick-visited' : ''}${still ? '' : ' rp-brick-animated'}`}
                  onClick={() => playReflection(r, 'path')}
                  onMouseEnter={() => setHoveredId(r.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(r.id)}
                  onBlur={() => setHoveredId(null)}
                  aria-label={`Reflection ${i + 1}: ${r.pathLabel}`}
                >
                  <img src={brickSrc} alt="" className="rp-brick-img" aria-hidden="true"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <span className="rp-brick-text">
                    <span className="rp-brick-icon" aria-hidden="true">{TAG_ICON[r.tag] ?? '\u2726'}</span>
                    <span className="rp-brick-phrase">{r.pathLabel}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {!walked.length && (
          <div className="rp-empty-state">
            <img src={`${A}open_magic_book.png`} alt="" className="rp-empty-book" aria-hidden="true"
              onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <h2>Your path is waiting.</h2>
            <p>Finish a Story Lab journey and your first reflection will appear here as a glowing brick.</p>
          </div>
        )}
      </div>

      {/* The bar along the foot, as the reference draws it. */}
      <div className="rp-footbar">
        <button className="rp-cta" onClick={() => playRandom('path')} disabled={!walked.length}>
          <span aria-hidden="true">▶</span> Play one for me
        </button>
        <button className="rp-foot-link" onClick={() => { if (!quiet) sound.play('tap'); setShuffleNonce((n) => n + 1); }} disabled={!walked.length}>
          <span aria-hidden="true">⇄</span> Shuffle reflections
        </button>
        <button className="rp-foot-link" onClick={() => go('library')}>
          <span aria-hidden="true">📖</span> Open My<br />Reflection Library
        </button>
        <p className="rp-foot-note"><span aria-hidden="true">★</span> All your experiences<br />make a brighter you. <b aria-hidden="true">♡</b></p>
      </div>

      <footer className="rp-stop rp-stop-slim">
        <button className="chrome-fade" onClick={() => go('room')}>← Back to the room</button>
        <button className="chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </footer>
    </div>
  );
}
