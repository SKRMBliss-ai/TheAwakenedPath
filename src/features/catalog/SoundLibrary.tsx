// ─────────────────────────────────────────────────────────────────────────────
// SoundLibrary — one Spotify-style library screen, used by both Sacred Sounds
// (meditation music) and Mantras inside the Mind Gym app.
//
// Free:   any track plays once through.
// Owned:  loop a track forever, or play a whole playlist back to back. In the
//         Mantras library owners also get the practice tools: mala counter,
//         sankalp tracker, puja sequences, sleep timer and lock-screen controls.
// Ownership comes from catalog.owns(); buying happens in place (Razorpay, the
// signed-in account), so the unlock shows up without leaving the app.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Lock, ListMusic, Loader2, X, Check, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { setLibraryOpen } from '../../lib/libraryOpen';
import { VoiceService, useVoiceStatus } from '../../services/voiceService';
import { useAuth } from '../auth/AuthContext';
import { track as trackEvent } from '../../lib/analytics';
import { pricingHref, UPGRADE, owns, priceOf, product, wasOf } from './catalog';
import { useSadhana, isAarti, sankalpProgress, repsOn, dateKey } from '../mantras/sadhana/sadhanaStore';
import { downloadAudio } from '../mantras/mantraDownload';
import { chantsPer } from '../mantras/sadhana/chantCounts';
import { PUJA_SEQUENCES, resolveSequence, PUJA_REPEATS } from '../mantras/sadhana/pujaSequences';
import { MalaDeck, SankalpTab, PujaTab, SleepTimerButton, PracticeTeaser } from '../mantras/sadhana/PracticeTools';
import { useMediaSession, softBell } from '../mantras/sadhana/practiceAudio';

/** Tracks anyone can play before buying (the first ones in the library). */
export const FREE_TRACKS = 3;

export interface LibraryTrack {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  duration?: string;
  /** Storage path or URL handed to VoiceService.playAudioURL. */
  path: string;
  /** Optional resolver for signed/cloaked URLs. */
  resolve?: () => Promise<string>;
}

export interface Playlist {
  id: string;
  name: string;
  blurb: string;
  trackIds: string[];
}

export function SoundLibrary({ kind, title, kicker, description, cover, tracks, playlists, previewAsGuest = false, previewAsOwner = false }: {
  /** DEV preview only: show the owner view. */
  previewAsOwner?: boolean;
  /** DEV preview only: show the signed-out view. */
  previewAsGuest?: boolean;
  kind: 'mantras' | 'sacred_sounds';
  title: string;
  kicker: string;
  description: string;
  cover: string;
  tracks: LibraryTrack[];
  playlists: Playlist[];
}) {
  const { user, profile, isPremiumUser } = useAuth();
  const unlocked = previewAsOwner || (!previewAsGuest && owns(profile, kind, isPremiumUser));
  // Without the pass, only the first FREE_TRACKS tracks play; the rest open /pricing.
  const freeIds = useMemo(() => new Set(tracks.slice(0, FREE_TRACKS).map((t) => t.id)), [tracks]);
  // A track bought on its own (the older one-track purchase) stays unlocked for that buyer.
  const ownedIds = useMemo(() => new Set(profile?.purchasedCourses ?? []), [profile]);
  // A mantra bought on its own is "mantra_song_<slug>"; older single tracks use the track id.
  const boughtSingly = (id: string) => !previewAsGuest && (ownedIds.has(id) || (id.startsWith('mantra:') && ownedIds.has(`mantra_song_${id.slice(7)}`)));
  const isLocked = (id: string) => !unlocked && !freeIds.has(id) && !boughtSingly(id);
  const [saving, setSaving] = useState<string | null>(null);
  const saveFile = async (t: LibraryTrack) => {
    setSaving(t.id);
    try { await downloadAudio(t.path, t.title); } catch { alert('The download could not start. Please check your connection and try again.'); }
    finally { setSaving(null); }
  };
  const goPricing = () => { trackEvent('LIBRARY_LOCKED_CLICK', kind); window.location.assign(pricingHref(UPGRADE[kind].single)); };
  const { status, category, trackId } = useVoiceStatus();

  const allList: Playlist = useMemo(() => ({ id: 'all', name: 'All', blurb: description, trackIds: tracks.map((t) => t.id) }), [tracks, description]);
  const lists = useMemo(() => [allList, ...playlists.filter((p) => p.trackIds.length)], [allList, playlists]);
  const [listId, setListId] = useState('all');
  const list = lists.find((l) => l.id === listId) || allList;
  const rows = list.trackIds.map((id) => tracks.find((t) => t.id === id)!).filter(Boolean);

  const [loop, setLoop] = useState(true); // owners hear a track on repeat until they turn it off
  useEffect(() => { setLibraryOpen(true); return () => setLibraryOpen(false); }, []);
  const [queue, setQueue] = useState<string[] | null>(null); // playlist or puja being played through
  const [queueRepeat, setQueueRepeat] = useState(1);
  const [pujaName, setPujaName] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
  const [showUnlock, setShowUnlock] = useState(false);
  const [tab, setTab] = useState<'library' | 'puja' | 'sankalp'>('library');
  const [pujaRepeats, setPujaRepeats] = useState<number>(PUJA_REPEATS[1]);

  const isMantras = kind === 'mantras';

  // The player bar lines up with the page content, so the app's sidebar never covers it.
  const pageRef = useRef<HTMLDivElement>(null);
  const [barBox, setBarBox] = useState<{ left: number; width: number } | null>(null);
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const pad = window.innerWidth >= 768 ? 32 : 16;
      setBarBox({ left: Math.max(8, r.left + pad), width: Math.max(280, r.width - pad * 2) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  // The tab says what this screen is, not the app around it.
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} · ${kicker}`;
    return () => { document.title = prev; };
  }, [title, kicker]);
  const tools = isMantras && unlocked; // practice tools are for owners
  const sadhana = useSadhana(user?.uid ?? '');

  // Latest values for callbacks fired by the audio engine, which outlive a render.
  const live = useRef({ queue, queueRepeat, loop, sadhana, pujaName, tracks, unlocked, tools });
  useEffect(() => { live.current = { queue, queueRepeat, loop, sadhana, pujaName, tracks, unlocked, tools }; });
  const playRef = useRef<(t: LibraryTrack, q: string[] | null, repeat?: number) => Promise<void>>(async () => {});

  const current = tracks.find((t) => t.id === trackId) || null;
  const isMine = !!current && category === 'music';
  const playing = isMine && status === 'playing';
  const slugOf = (id: string | null | undefined) => (id && id.startsWith('mantra:') ? id.slice(7) : null);
  const counterSlug = slugOf(current?.id) ?? sadhana.state.lastSlug ?? slugOf(tracks[0]?.id);
  const counterTrack = counterSlug ? tracks.find((t) => t.id === `mantra:${counterSlug}`) ?? null : null;

  useEffect(() => {
    if (!isMine) return;
    const i = setInterval(() => setProgress(VoiceService.audioProgress), 300);
    return () => clearInterval(i);
  }, [isMine]);

  /** Count one repetition of a mantra and ring the bell when a mala completes. */
  const countOne = (slug: string, n = 1) => {
    if (isAarti(slug)) return; // an aarti is a song, not a repeated mantra
    const sd = live.current.sadhana;
    const before = repsOn(sd.state, dateKey(), slug);
    sd.addReps(slug, n);
    // Ring when this count carries the total across a mala boundary.
    if (Math.floor((before + n) / sd.state.malaTarget) > Math.floor(before / sd.state.malaTarget)) softBell();
  };

  const playTrack = async (t: LibraryTrack, q: string[] | null = live.current.queue, repeatOverride?: number) => {
    setLoadingId(t.id);
    setRound(0);
    try {
      const url = t.resolve ? await t.resolve() : t.path;
      const L = live.current;
      // Owners can loop or repeat; everyone else hears the track once.
      const slug = slugOf(t.id);
      const per = slug ? chantsPer(slug) : 1; // chants inside one playthrough
      const repeat = !L.unlocked ? 1 : repeatOverride ?? (q ? Math.max(1, Math.ceil(L.queueRepeat / per)) : L.loop ? Infinity : 1);
      await VoiceService.playAudioURL(url, {
        trackId: t.id, category: 'music', repeat,
        onRound: (n) => {
          setRound(n);
          if (live.current.tools && slug && !isAarti(slug)) countOne(slug, per);
        },
        onFinish: () => {
          const { queue: qq, loop: lp, pujaName: pj } = live.current;
          if (!qq) return;
          const next = qq[qq.indexOf(t.id) + 1] ?? (lp && !pj ? qq[0] : undefined);
          const nt = next ? live.current.tracks.find((x) => x.id === next) : undefined;
          if (nt) void playRef.current(nt, qq);
          else { setQueue(null); setPujaName(null); }
        },
      });
      trackEvent('LIBRARY_PLAY', `${kind}:${t.id}`);
    } catch {
      alert('This track could not be loaded. Please check your connection.');
    } finally {
      setLoadingId(null);
    }
  };
  useEffect(() => { playRef.current = playTrack; });

  const onRow = (t: LibraryTrack) => {
    if (isLocked(t.id)) { goPricing(); return; }
    if (trackId === t.id && isMine) {
      if (playing) VoiceService.pause(); else VoiceService.resume('music');
      return;
    }
    setQueue(null); setPujaName(null);
    live.current.queue = null;
    void playTrack(t, null);
  };

  const playAll = () => {
    if (!unlocked) { goPricing(); return; }
    const q = rows.map((r) => r.id);
    setQueue(q); setQueueRepeat(1); setPujaName(null);
    live.current = { ...live.current, queue: q, queueRepeat: 1, pujaName: null };
    if (rows[0]) void playTrack(rows[0], q);
  };

  const toggleLoop = () => {
    if (!unlocked) { goPricing(); return; }
    const next = !loop;
    setLoop(next);
    live.current.loop = next;
    if (!queue && isMine) VoiceService.setRepeat(next ? Infinity : 1);
  };

  const step = (dir: 1 | -1) => {
    if (!current) return;
    const order = queue ?? rows.map((r) => r.id);
    const playable = order.filter((id) => !isLocked(id));
    const t = tracks.find((x) => x.id === playable[playable.indexOf(current.id) + dir]);
    if (t) void playTrack(t, queue);
  };

  // Puja sequences: resolved against the tracks that really exist.
  const available = useMemo(() => new Set(tracks.map((t) => slugOf(t.id)).filter(Boolean) as string[]), [tracks]);
  const pujas = useMemo(() => PUJA_SEQUENCES.map((seq) => ({
    seq,
    steps: resolveSequence(seq, available).map((slug) => ({ slug, title: tracks.find((t) => t.id === `mantra:${slug}`)?.title ?? slug })),
  })).filter((p) => p.steps.length > 0), [available, tracks]);

  const beginPuja = (id: string) => {
    const p = pujas.find((x) => x.seq.id === id);
    if (!p) return;
    const q = p.steps.map((st) => `mantra:${st.slug}`);
    setQueue(q); setQueueRepeat(pujaRepeats); setPujaName(p.seq.name);
    live.current = { ...live.current, queue: q, queueRepeat: pujaRepeats, pujaName: p.seq.name };
    const first = tracks.find((t) => t.id === q[0]);
    if (first) void playTrack(first, q);
  };

  const chantNow = (slug: string, count: number) => {
    const t = tracks.find((x) => x.id === `mantra:${slug}`);
    if (!t) return;
    setQueue(null); setPujaName(null);
    live.current.queue = null;
    void playTrack(t, null, Math.max(1, Math.ceil(count / chantsPer(slug))));
  };

  useMediaSession({
    enabled: tools && isMine,
    title: current?.title ?? null,
    artwork: current?.cover ?? null,
    playing,
    onPlay: () => VoiceService.resume('music'),
    onPause: () => VoiceService.pause(),
    onNext: () => step(1),
    onPrev: () => step(-1),
  });

  const sankalpInfo = useMemo(() => sankalpProgress(sadhana.state), [sadhana.state]);
  const mantraOptions = useMemo(() => tracks.map((t) => ({ slug: slugOf(t.id) ?? t.id, title: t.title })), [tracks]);
  const titleOf = (slug: string) => tracks.find((t) => t.id === `mantra:${slug}`)?.title ?? slug;
  const pujaActive = pujaName && queue && current ? { name: pujaName, step: queue.indexOf(current.id) + 1, steps: queue.length, round, total: queueRepeat } : null;

  const pct = progress.duration ? Math.min(100, (progress.currentTime / progress.duration) * 100) : 0;
  const up = UPGRADE[kind];

  return (
    <div ref={pageRef} className="relative max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-28">
      {/* Header: a soft mauve hero card */}
      <header className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] p-5 sm:p-8 mb-6"
        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #A798A5 22%, var(--bg-surface)) 0%, var(--bg-surface) 62%)' }}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(233,201,138,.28) 0%, rgba(233,201,138,0) 70%)' }} />
        <div className="relative flex flex-col sm:flex-row gap-5 sm:gap-8 sm:items-center">
          <img src={cover} alt="" className="w-28 h-28 sm:w-40 sm:h-40 rounded-2xl object-contain p-2 flex-shrink-0 self-start sm:self-center" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] mb-2">{kicker}</p>
            <h1 className="font-serif text-4xl md:text-6xl text-[var(--text-primary)] leading-none mb-3">{title}</h1>
            <p className="text-[15px] text-[var(--text-secondary)] max-w-xl mb-5 leading-relaxed">{description}</p>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={playAll} className="inline-flex items-center gap-2 h-12 px-7 rounded-full bg-[var(--accent-primary)] text-[var(--bg-color)] font-bold text-sm shadow-lg">
                {unlocked ? <Play size={16} fill="currentColor" /> : <Lock size={15} />} Play {list.id === 'all' ? 'all' : list.name}
              </button>
              <span className="inline-flex items-center h-8 px-3 rounded-full bg-[var(--bg-color)]/60 border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)]">
                {tracks.length} {isMantras ? 'mantras' : 'tracks'}
              </span>
              {unlocked ? (
                <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--bg-color)]/60 border border-[var(--border-subtle)] text-xs font-bold text-[var(--accent-primary)]">
                  <Check size={13} /> {isMantras ? 'Loop, playlists and practice tools' : 'Loop and playlists'}
                </span>
              ) : (
                <button onClick={goPricing} className="h-12 px-5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-color)]/60 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">
                  Unlock · {priceOf(up.single)}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {tools && (
        <div className="flex gap-2 mb-5" role="tablist" aria-label="Mantras sections">
          {([['library', 'Library'], ['puja', 'Puja sequences'], ['sankalp', 'My sadhana']] as const).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={cn('h-9 px-4 rounded-full text-[13px] font-bold border transition-colors',
                tab === id ? 'bg-[var(--accent-primary)] text-[var(--bg-color)] border-transparent' : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-subtle)]')}>{label}</button>
          ))}
        </div>
      )}
      {isMantras && !unlocked && <PracticeTeaser onUnlock={goPricing} price={priceOf(up.single)} />}
      {tools && tab === 'puja' && <PujaTab sequences={pujas} repeats={pujaRepeats} onRepeats={setPujaRepeats} onBegin={beginPuja} active={pujaActive} />}
      {tools && tab === 'sankalp' && (
        <SankalpTab state={sadhana.state} progress={sankalpInfo} mantraOptions={mantraOptions} titleOf={titleOf}
          onStart={(slug, days, daily) => sadhana.start(slug, days, daily)} onEnd={sadhana.end} onChant={chantNow} />
      )}
      {tools && tab === 'library' && (
        <MalaDeck perPlay={counterSlug && !isAarti(counterSlug) ? chantsPer(counterSlug) : 0} title={counterTrack?.title ?? null} todayReps={counterSlug ? repsOn(sadhana.state, dateKey(), counterSlug) : 0}
          malaTarget={sadhana.state.malaTarget} playing={playing} hasTrack={!!counterSlug}
          onTarget={sadhana.setMalaTarget} onTap={() => counterSlug && countOne(counterSlug)} onClear={() => counterSlug && sadhana.clearToday(counterSlug)} />
      )}

      {(!tools || tab === 'library') && (<>
      {/* Playlists */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Playlists">
        {lists.map((l) => (
          <button key={l.id} role="tab" aria-selected={l.id === listId} onClick={() => setListId(l.id)}
            className={cn('flex-shrink-0 h-9 px-4 rounded-full text-[13px] font-bold whitespace-nowrap border transition-colors',
              l.id === listId ? 'bg-[var(--accent-primary)] text-[var(--bg-color)] border-transparent'
                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]')}>
            {l.name} <span className="opacity-60 ml-1">{l.trackIds.length}</span>
          </button>
        ))}
      </div>
      {list.id !== 'all' && <p className="text-sm text-[var(--text-secondary)] mb-3 flex items-center gap-2"><ListMusic size={15} /> {list.blurb}</p>}

      {/* Tracks */}
      <ol className="divide-y divide-[var(--border-subtle)]/50 rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        {rows.map((t, i) => {
          const active = isMine && trackId === t.id;
          const locked = isLocked(t.id);
          return (
            <li key={t.id} className="relative">
              <button onClick={() => onRow(t)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                active ? 'bg-[var(--bg-surface)]' : 'hover:bg-[var(--bg-surface)]/60', locked && 'opacity-60')}
                aria-label={locked ? `${t.title}, locked. Unlock on the pricing page` : undefined}>
                <span className="w-6 text-center text-xs text-[var(--text-muted)] flex-shrink-0">
                  {loadingId === t.id ? <Loader2 size={14} className="animate-spin mx-auto" />
                    : locked ? <Lock size={13} className="mx-auto" />
                    : active && playing ? <Pause size={14} className="mx-auto text-[var(--accent-primary)]" fill="currentColor" /> : i + 1}
                </span>
                <img src={t.cover} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-[var(--bg-surface)]"
                  onError={(e) => { if (e.currentTarget.src !== new URL(cover, location.href).href) e.currentTarget.src = cover; }} />
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-[15px] font-semibold', active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]')}>{t.title}</span>
                  <span className="block truncate text-xs text-[var(--text-muted)]">{t.subtitle}</span>
                </span>
                {!unlocked && !locked && <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] flex-shrink-0">Free</span>}
                {t.duration && <span className="text-xs text-[var(--text-muted)] flex-shrink-0 hidden sm:block">{t.duration}</span>}
                {isMantras && boughtSingly(t.id) && <span className="w-9 flex-shrink-0" aria-hidden="true" />}
              </button>
              {isMantras && boughtSingly(t.id) && (
                <button type="button" onClick={() => void saveFile(t)} aria-label={`Download ${t.title}`} title="Download your mp3"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 grid place-items-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)]">
                  {saving === t.id ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      </>)}
      {!unlocked && (
        <p className="text-xs text-[var(--text-muted)] mt-3">
          The first {FREE_TRACKS} tracks are free to listen to. <button onClick={goPricing} className="underline font-semibold text-[var(--text-secondary)]">Unlock</button> every track, loop any of them, and play whole playlists back to back.
        </p>
      )}

      {/* Now playing */}
      {current && isMine && (
        <div style={barBox ? { left: barBox.left, width: barBox.width } : undefined} className="fixed bottom-3 z-40 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-color)]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-[var(--border-subtle)] overflow-hidden"><div className="h-full bg-[var(--accent-primary)]" style={{ width: `${pct}%` }} /></div>
          <div className="flex items-center gap-3 p-3">
            <img src={current.cover} alt="" className="w-11 h-11 rounded-lg object-cover flex-shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">{current.title}</span>
              <span className="block truncate text-[11px] text-[var(--text-muted)]">{pujaName ? `${pujaName} · ${queue ? queue.indexOf(current.id) + 1 : 1} of ${queue?.length ?? 1}` : queue ? `Playing ${list.name} playlist` : current.subtitle}</span>
            </span>
            <button aria-label="Previous" onClick={() => step(-1)} className="p-2 text-[var(--text-secondary)]"><SkipBack size={18} /></button>
            <button aria-label={playing ? 'Pause' : 'Play'} onClick={() => (playing ? VoiceService.pause() : VoiceService.resume('music'))}
              className="w-10 h-10 grid place-items-center rounded-full bg-[var(--accent-primary)] text-[var(--bg-color)]">
              {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
            <button aria-label="Next" onClick={() => step(1)} className="p-2 text-[var(--text-secondary)]"><SkipForward size={18} /></button>
            {tools && <SleepTimerButton />}
            <button aria-label={loop ? 'Loop on' : 'Loop off'} aria-pressed={loop && unlocked} onClick={toggleLoop}
              title={!unlocked ? 'Unlock to loop this track' : loop ? 'Loop is on. Click to turn off' : 'Turn on loop mode'}
              className={cn('relative w-10 h-10 grid place-items-center rounded-full border transition-colors',
                loop && unlocked ? 'bg-[var(--accent-primary)] text-[var(--bg-color)] border-transparent' : 'text-[var(--text-muted)] border-[var(--border-subtle)]')}>
              {queue ? <Repeat size={18} /> : <Repeat1 size={18} />}
              {!unlocked && <Lock size={9} className="absolute right-0.5 bottom-1" />}
              {unlocked && <span className="sr-only">{loop ? 'On' : 'Off'}</span>}
            </button>
          </div>
        </div>
      )}

      {/* Unlock sheet */}
      {showUnlock && <UnlockSheet kind={kind} onClose={() => setShowUnlock(false)} signedIn={!!user && !user.isAnonymous} />}
    </div>
  );
}

function UnlockSheet({ kind, onClose }: { kind: 'mantras' | 'sacred_sounds'; onClose: () => void; signedIn?: boolean }) {
  const isProcessing = false;
  const done = false;
  const up = UPGRADE[kind];
  const options = [up.single, up.bundle];

  // All purchases go through the one /pricing page.
  const buy = (id: string) => {
    trackEvent('LIBRARY_BUY_CLICK', `${kind}:${id}`);
    window.location.assign(`/pricing?select=${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/50 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Unlock" onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--bg-color)] border border-[var(--border-subtle)] p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] mb-1">Pay once · yours to keep</p>
            <h2 className="font-serif text-3xl text-[var(--text-primary)]">Loop it. Play it all.</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 -m-2 text-[var(--text-muted)]"><X size={20} /></button>
        </div>
        {done ? (
          <p className="text-[var(--text-primary)] text-sm leading-relaxed">Thank you. Your library is unlocked on this account. It may take a few seconds to appear.</p>
        ) : (
          <>
            <div className="space-y-3">
              {options.map((id, i) => {
                const p = product(id);
                const was = wasOf(id);
                return (
                  <button key={id} disabled={isProcessing} onClick={() => buy(id)}
                    className={cn('w-full text-left rounded-2xl border p-4 transition-colors disabled:opacity-60',
                      i === 1 ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)]' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]')}>
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-bold text-[var(--text-primary)]">{p.name}{i === 1 && <span className="ml-2 text-[9px] uppercase tracking-wider text-[var(--accent-primary)]">Best value</span>}</span>
                      <span className="font-bold text-[var(--text-primary)] whitespace-nowrap">{was && <s className="text-xs text-[var(--text-muted)] mr-1.5">{was}</s>}{priceOf(id)}</span>
                    </span>
                    <span className="block text-xs text-[var(--text-secondary)] mt-1">{p.pitch}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-4 leading-relaxed">
              {'See every plan on one page. Full refund within 7 days.'}
              {' '}Also included in Mind Gym membership and All Access.
            </p>
            {isProcessing && <p className="text-xs text-[var(--text-secondary)] mt-2 flex items-center gap-2"><Loader2 size={13} className="animate-spin" /> Opening secure payment…</p>}
          </>
        )}
      </div>
    </div>
  );
}
