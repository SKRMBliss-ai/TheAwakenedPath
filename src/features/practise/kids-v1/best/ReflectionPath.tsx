import { useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useKidStore, type SavedReflection } from '../../../kids/store';
import { FONT } from '../ui/chrome';
import { speak } from '../kit/chirpyVoice';
import { useQuiet } from '../ui/quiet';
import * as sound from '../kit/sound';
import './ReflectionPath.css';

const MAX_BRICKS = 10;

const BRICK_EMPTY = '/mind-gym/reflection/reflection_brick_empty@4x.png';
const BRICK_HOVER = '/mind-gym/reflection/reflection_brick_hover@4x.png';
const BRICK_DONE  = '/mind-gym/reflection/reflection_brick_completed@4x.png';

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

/**
 * Stable per-session sample — picks up to MAX_BRICKS reflections using a
 * seed based on today's date. Favourites get a small weight boost.
 */
function sampleReflections(reflections: SavedReflection[]): SavedReflection[] {
  if (!reflections.length) return [];
  // Build weighted pool: favourites appear twice
  const pool: SavedReflection[] = [];
  for (const r of reflections) { pool.push(r); if (r.favourite) pool.push(r); }
  // Seeded shuffle — stable for today
  const seed = Math.floor(Date.now() / 86_400_000);
  let s = seed;
  const rand = () => { s = ((s * 1664525 + 1013904223) | 0) >>> 0; return s / 0x100000000; };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  // Deduplicate while preserving order
  const seen = new Set<string>();
  const result: SavedReflection[] = [];
  for (const r of pool) {
    if (!seen.has(r.id)) { seen.add(r.id); result.push(r); }
    if (result.length >= MAX_BRICKS) break;
  }
  return result;
}

/** ── Playback screen ──────────────────────────────────────────────────── */

function PlaybackView({ reflection, onBack, onGrownUp }: {
  reflection: SavedReflection;
  onBack: () => void;
  onGrownUp: () => void;
}) {
  const toggleFav = useKidStore((s) => s.toggleReflectionFavourite);
  const isFav = useKidStore((s) => s.savedReflections.find((r) => r.id === reflection.id)?.favourite ?? false);

  return (
    <div className="rp-room rp-playback" style={{ fontFamily: FONT }}>
      <header className="rp-header">
        <button className="rp-back" onClick={onBack} aria-label="Back to Reflection Path">←</button>
        <h1>Play &amp; Relax</h1>
        <button className="chrome-fade rp-grownup-btn" onClick={onGrownUp}>♡</button>
      </header>

      <div className="rp-playback-stage">
        <img
          src="/mind-gym/reflection/chirpy_character.png"
          alt="Chirpy"
          className="rp-chirpy"
        />
        <div className="rp-playback-card">
          <span className="rp-tag-pill">{TAG_LABELS[reflection.tag] ?? 'Reflection'}</span>
          <p className="rp-playback-phrase">"{reflection.pathLabel}"</p>
          {reflection.feeling && (
            <p className="rp-feeling-echo">You felt: <strong>{reflection.feeling}</strong></p>
          )}
          {reflection.anotherWay && reflection.anotherWay !== reflection.pathLabel && (
            <blockquote className="rp-full-story">{reflection.anotherWay}</blockquote>
          )}
        </div>
      </div>

      <footer className="rp-stop">
        <button
          onClick={() => { sound.play('tap'); toggleFav(reflection.id); }}
          className={`rp-fav-btn ${isFav ? 'rp-fav-active' : ''}`}
          aria-pressed={isFav}
        >
          {isFav ? '♥ Saved to favourites' : '♡ Add to favourites'}
        </button>
        <button className="rp-cta" onClick={onBack}>Back to my path</button>
        <button className="chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </footer>
    </div>
  );
}

/** ── Library screen ──────────────────────────────────────────────────── */

function LibraryView({ onBack, onPlay, onGrownUp }: {
  onBack: () => void;
  onPlay: (r: SavedReflection) => void;
  onGrownUp: () => void;
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
    <div className="rp-room" style={{ fontFamily: FONT }}>
      <header className="rp-header">
        <button className="rp-back" onClick={onBack} aria-label="Back to Reflection Path">←</button>
        <h1>My Reflection Library</h1>
        <button className="chrome-fade rp-grownup-btn" onClick={onGrownUp}>♡</button>
      </header>

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

      <div className="rp-library-list">
        {filtered.length === 0 && (
          <p className="rp-empty">
            {tab === 'Favourites'
              ? 'No favourites yet — tap the heart on any reflection.'
              : 'Nothing here yet.'}
          </p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="rp-library-item">
            <button
              className="rp-library-phrase"
              onClick={() => onPlay(r)}
              aria-label={`Play reflection: ${r.pathLabel}`}
            >
              <span className="rp-tag-pill">{TAG_LABELS[r.tag] ?? r.tag}</span>
              <p>"{r.pathLabel}"</p>
              {r.feeling && <small>You felt: {r.feeling}</small>}
            </button>
            <button
              onClick={() => { sound.play('tap'); toggleFav(r.id); }}
              className={`rp-fav-icon ${r.favourite ? 'rp-fav-active' : ''}`}
              aria-label={r.favourite ? 'Remove from favourites' : 'Add to favourites'}
              aria-pressed={r.favourite}
            >
              {r.favourite ? '♥' : '♡'}
            </button>
          </div>
        ))}
      </div>

      <footer className="rp-stop">
        <button className="chrome-fade" onClick={onBack}>← Back to path</button>
        <button className="chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </footer>
    </div>
  );
}

/** ── Main path screen ────────────────────────────────────────────────── */

export function ReflectionPath({ onExit, onGrownUp }: {
  onExit: () => void;
  onGrownUp: () => void;
}) {
  const quiet = useQuiet();
  const reduced = useReducedMotion();
  const allReflections = useKidStore((s) => s.savedReflections);
  const markPlayed = useKidStore((s) => s.markReflectionPlayed);

  const [inner, setInner] = useState<'path' | 'library' | 'playback'>('path');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const sample = useMemo(() => sampleReflections(allReflections), [allReflections]);

  const playReflection = (r: SavedReflection) => {
    sound.play('roomCard');
    setPlayingId(r.id);
    setVisitedIds((v) => new Set([...v, r.id]));
    markPlayed(r.id);
    if (!quiet) speak(r.pathLabel, quiet);
    setInner('playback');
  };

  const playRandom = () => {
    if (!sample.length) return;
    const unvisited = sample.filter((r) => !visitedIds.has(r.id));
    const pool = unvisited.length ? unvisited : sample;
    playReflection(pool[Math.floor(Math.random() * pool.length)]);
  };

  const playingReflection = allReflections.find((r) => r.id === playingId);

  if (inner === 'playback' && playingReflection) {
    return (
      <PlaybackView
        reflection={playingReflection}
        onBack={() => setInner('path')}
        onGrownUp={onGrownUp}
      />
    );
  }

  if (inner === 'library') {
    return (
      <LibraryView
        onBack={() => setInner('path')}
        onPlay={(r) => playReflection(r)}
        onGrownUp={onGrownUp}
      />
    );
  }

  return (
    <div className="rp-room" style={{ fontFamily: FONT }}>
      <header className="rp-header">
        <button className="rp-back" onClick={onExit} aria-label="Back to Mind Gym">←</button>
        <div className="rp-title">
          <h1>My Reflection Path</h1>
          <p>Everything you've worked out. One brick at a time.</p>
        </div>
        <button className="chrome-fade rp-grownup-btn" onClick={onGrownUp}>♡</button>
      </header>

      {allReflections.length === 0 ? (
        <div className="rp-empty-state">
          <img
            src="/mind-gym/reflection/open_magic_book.png"
            alt=""
            className="rp-empty-book"
            aria-hidden="true"
          />
          <h2>Your path is waiting.</h2>
          <p>Finish a Story Lab journey and your first reflection will appear here as a glowing brick on the path.</p>
          <button className="rp-cta" onClick={onExit}>Back to Mind Gym</button>
        </div>
      ) : (
        <>
          <div className="rp-path-actions">
            <button className="rp-cta" onClick={playRandom}>
              <span aria-hidden="true">▶</span> Play one for me
            </button>
            <button className="rp-open-library" onClick={() => { sound.play('tap'); setInner('library'); }}>
              Open My Reflection Library →
            </button>
          </div>

          <div className="rp-bricks" role="list" aria-label="Your reflection path">
            {sample.map((r, i) => {
              const visited = visitedIds.has(r.id);
              const hovered = hoveredId === r.id;
              const brickSrc = hovered ? BRICK_HOVER : visited ? BRICK_DONE : BRICK_EMPTY;

              return (
                <button
                  key={r.id}
                  role="listitem"
                  className={`rp-brick${visited ? ' rp-brick-visited' : ''}${reduced ? '' : ' rp-brick-animated'}`}
                  style={{ '--brick-index': i } as React.CSSProperties}
                  onClick={() => playReflection(r)}
                  onMouseEnter={() => setHoveredId(r.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(r.id)}
                  onBlur={() => setHoveredId(null)}
                  aria-label={`Reflection ${i + 1}: ${r.pathLabel}`}
                >
                  <img src={brickSrc} alt="" className="rp-brick-img" aria-hidden="true" />
                  <div className="rp-brick-text">
                    <span className="rp-tag-pill rp-tag-small">{TAG_LABELS[r.tag] ?? r.tag}</span>
                    <span className="rp-brick-phrase">{r.pathLabel}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {allReflections.length > MAX_BRICKS && (
            <button className="rp-more-link" onClick={() => { sound.play('tap'); setInner('library'); }}>
              +{allReflections.length - MAX_BRICKS} more in your library →
            </button>
          )}
        </>
      )}

      <footer className="rp-stop">
        <button className="chrome-fade" onClick={onExit}>← Back to Mind Gym</button>
        <button className="chrome-fade" onClick={onGrownUp}>♡ Talk to a grown-up</button>
      </footer>
    </div>
  );
}
