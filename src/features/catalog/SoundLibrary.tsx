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

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Lock, ListMusic, Loader2, X, Check, Download, Search } from 'lucide-react';
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
import { MinimalistChantingView } from '../mantras/sadhana/MinimalistChantingView';

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
  /** Filter row this belongs to (When, Deity, Type, Mood). One can be chosen per row, and rows combine. */
  group?: string;
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

  // Filters: one choice per row (When, Deity, Type...), and the rows combine.
  const [sel, setSel] = useState<Record<string, string>>({});
  const groupOf = (p: Playlist) => p.group || 'Playlists';
  const groups = useMemo(() => {
    const m = new Map<string, Playlist[]>();
    playlists.filter((p) => p.trackIds.length).forEach((p) => { const g = p.group || 'Playlists'; m.set(g, [...(m.get(g) ?? []), p]); });
    return Array.from(m.entries());
  }, [playlists]);
  const flatPlaylists = useMemo(() => playlists.filter((p) => p.trackIds.length > 0), [playlists]);
  const activeLists = useMemo(() => playlists.filter((p) => sel[groupOf(p)] === p.id), [playlists, sel]);
  const baseIds = useMemo(() => activeLists.reduce((ids, l) => ids.filter((id) => l.trackIds.includes(id)), tracks.map((t) => t.id)), [activeLists, tracks]);
  const playlistCounts = useMemo(() => new Map(playlists.map((p) => [p.id, tracks.filter((t) => p.trackIds.includes(t.id)
    && activeLists.filter((l) => groupOf(l) !== groupOf(p)).every((l) => l.trackIds.includes(t.id))).length])), [playlists, tracks, activeLists]);
  const countFor = (p: Playlist) => playlistCounts.get(p.id) ?? 0;
  const listName = activeLists.length ? activeLists.map((l) => l.name).join(' · ') : 'all';
  const [query, setQuery] = useState('');
  const qn = query.trim().toLowerCase();
  const rows = useMemo(() => baseIds.map((id) => tracks.find((t) => t.id === id)).filter((t): t is LibraryTrack => !!t)
    .filter((t) => !qn || `${t.title} ${t.subtitle}`.toLowerCase().includes(qn)), [baseIds, tracks, qn]);

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
  const [zenChantOpen, setZenChantOpen] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('zen') === '1');
  const closeZenChant = useCallback(() => setZenChantOpen(false), []);

  const isMantras = kind === 'mantras';

  // The player bar lines up with the page content, so the app's sidebar never covers it.
  const pageRef = useRef<HTMLDivElement>(null);
  const [barBox, setBarBox] = useState<{ left: number; width: number; bottom: number } | null>(null);
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const pad = window.innerWidth >= 768 ? 32 : 16;
      // On small screens the app has its own bottom menu; sit above it, not behind it.
      const nav = document.querySelector('[data-bottom-nav]');
      const navH = nav && getComputedStyle(nav).display !== 'none' ? nav.getBoundingClientRect().height : 0;
      setBarBox({ left: Math.max(8, r.left + pad), width: Math.max(280, r.width - pad * 2), bottom: navH + 12 });
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
  const lastMantra = tools && sadhana.state.lastSlug
    ? tracks.find((t) => t.id === `mantra:${sadhana.state.lastSlug}`) ?? null
    : null;
  const lastMantraCount = lastMantra && sadhana.state.lastSlug
    ? repsOn(sadhana.state, dateKey(), sadhana.state.lastSlug)
    : 0;

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
    const slug = slugOf(t.id);
    if (live.current.tools && slug && !isAarti(slug)) live.current.sadhana.setLastSlug(slug);
    try {
      const url = t.resolve ? await t.resolve() : t.path;
      const L = live.current;
      // Owners can loop or repeat; everyone else hears the track once.
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
    if (tools) setZenChantOpen(true);
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

  const resumeLastMantra = () => {
    if (!lastMantra) return;
    setZenChantOpen(true);
    if (trackId === lastMantra.id && isMine && (playing || status === 'paused')) {
      if (status === 'paused') VoiceService.resume('music');
      return;
    }
    setQueue(null); setPujaName(null);
    live.current.queue = null;
    void playTrack(lastMantra, null);
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
    <div ref={pageRef} data-mantra-library={kind} className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-8 pt-3 sm:pt-6 pb-28" style={{ paddingBottom: 112 + Math.max(0, (barBox?.bottom ?? 12) - 12) }}>
      {/* Header: a soft mauve hero card — compact on mobile */}
      <header className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--border-subtle)] p-3.5 sm:p-8 mb-3 sm:mb-6"
        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, #A798A5 22%, var(--bg-surface)) 0%, var(--bg-surface) 62%)' }}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(233,201,138,.28) 0%, rgba(233,201,138,0) 70%)' }} />
        <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-8 sm:items-center">
          <img src={cover} alt="" loading="lazy" decoding="async" className="hidden sm:block w-28 h-28 sm:w-40 sm:h-40 rounded-2xl object-contain p-2 flex-shrink-0 self-start sm:self-center" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)] mb-1 sm:mb-2">{kicker}</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl text-[var(--text-primary)] leading-none mb-2 sm:mb-3">{title}</h1>
            <p className="hidden sm:block text-[15px] text-[var(--text-secondary)] max-w-xl mb-5 leading-relaxed">{description}</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button onClick={playAll} className="inline-flex items-center gap-1.5 sm:gap-2 h-11 sm:h-12 px-4 sm:px-7 rounded-full bg-[var(--accent-solid)] text-[var(--on-accent)] font-bold text-sm shadow-md">
                {unlocked ? <Play size={14} fill="currentColor" /> : <Lock size={14} />} Play {listName}
              </button>
              <span className="inline-flex items-center h-7 sm:h-8 px-2.5 sm:px-3 rounded-full bg-[var(--bg-color)]/60 border border-[var(--border-subtle)] text-[11px] sm:text-xs font-bold text-[var(--text-secondary)]">
                {tracks.length} {isMantras ? 'mantras' : 'tracks'}
              </span>
              {unlocked ? (
                <span className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[var(--bg-color)]/60 border border-[var(--border-subtle)] text-xs font-bold text-[var(--accent-text)]">
                  <Check size={13} /> {isMantras ? 'Loop, playlists and practice tools' : 'Loop and playlists'}
                </span>
              ) : (
                <button onClick={goPricing} className="h-11 sm:h-12 px-4 sm:px-5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-color)]/60 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-surface)]">
                  Unlock · {priceOf(up.single)}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {lastMantra && (
        <section aria-label="Continue your mantra practice" className="mb-3 sm:mb-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 sm:p-4 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">Continue where you left off</p>
            <p className="truncate text-sm font-semibold text-[var(--text-primary)] mt-0.5">{lastMantra.title}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Today: {lastMantraCount} repetitions · Saved on this device</p>
          </div>
          <button type="button" onClick={resumeLastMantra} aria-label={`Resume ${lastMantra.title}`} className="h-11 min-w-11 px-4 rounded-full bg-[var(--accent-solid)] text-[var(--on-accent)] font-bold text-sm inline-flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
            <Play size={15} fill="currentColor" /> <span className="hidden sm:inline">Resume</span>
          </button>
        </section>
      )}

      {tools && (
        <div className="flex gap-1.5 sm:gap-2 mb-2.5 sm:mb-5" role="tablist" aria-label="Mantras sections">
          {([['library', 'Library'], ['puja', 'Puja sequences'], ['sankalp', 'My sadhana']] as const).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={cn('h-11 sm:h-9 px-3 sm:px-4 rounded-full text-sm sm:text-[13px] font-bold border transition-colors',
                tab === id ? 'bg-[var(--accent-solid)] text-[var(--on-accent)] border-transparent' : 'bg-[var(--bg-color)] text-[var(--text-primary)] border-[color-mix(in_srgb,var(--text-muted)_55%,transparent)]')}>{label}</button>
          ))}
        </div>
      )}
      {isMantras && !unlocked && <PracticeTeaser onUnlock={goPricing} price={priceOf(up.single)} />}
      {tools && tab === 'puja' && <PujaTab sequences={pujas} repeats={pujaRepeats} onRepeats={setPujaRepeats} onBegin={beginPuja} active={pujaActive} />}
      {tools && tab === 'sankalp' && (
        <SankalpTab state={sadhana.state} progress={sankalpInfo} mantraOptions={mantraOptions} titleOf={titleOf}
          onStart={(slug, days, daily) => sadhana.start(slug, days, daily)} onEnd={sadhana.end} onChant={chantNow} />
      )}
      {tools && tab === 'library' && (!counterSlug || !isAarti(counterSlug)) && (
        <MalaDeck perPlay={counterSlug && !isAarti(counterSlug) ? chantsPer(counterSlug) : 0} title={counterTrack?.title ?? null} todayReps={counterSlug ? repsOn(sadhana.state, dateKey(), counterSlug) : 0}
          malaTarget={sadhana.state.malaTarget} playing={playing} hasTrack={!!counterSlug}
          onTarget={sadhana.setMalaTarget} onTap={() => counterSlug && countOne(counterSlug)} onClear={() => counterSlug && sadhana.clearToday(counterSlug)}
          onOpenZen={() => setZenChantOpen(true)} />
      )}

      {(!tools || tab === 'library') && (<>
      {tracks.length > 12 && (
        <div className="relative mb-2 sm:mb-3">
          <Search size={15} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label={`Search ${title}`} placeholder={`Search ${title.toLowerCase()}, e.g. Ganesha or Navratri`}
            className="w-full h-11 rounded-full pl-9 sm:pl-11 pr-4 text-sm bg-[var(--bg-color)] text-[var(--text-primary)] border border-[color-mix(in_srgb,var(--text-muted)_45%,transparent)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]" />
        </div>
      )}

      {/* Filters — Single clean row on mobile, full grouped rows on desktop */}
      <div className="mb-3" role="group" aria-label="Filter the list">
        {/* Mobile: 1 single horizontal scrolling row */}
        <div className="sm:hidden">
          <div
            style={{
              maskImage: 'linear-gradient(to right, #000 calc(100% - 24px), transparent)',
              WebkitMaskImage: 'linear-gradient(to right, #000 calc(100% - 24px), transparent)',
            }}
            className="flex gap-1.5 overflow-x-auto py-0.5 pr-6 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <button
              type="button"
              aria-pressed={activeLists.length === 0}
              onClick={() => setSel({})}
              className={cn(
                'flex-shrink-0 h-11 px-3 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-colors',
                activeLists.length === 0
                  ? 'bg-[var(--accent-solid)] text-[var(--on-accent)] border-transparent shadow-xs'
                  : 'bg-[var(--bg-color)] text-[var(--text-primary)] border-[color-mix(in_srgb,var(--text-muted)_50%,transparent)]'
              )}
            >
              All
            </button>
            {flatPlaylists.map((p) => {
              const g = groupOf(p);
              const on = (sel[g] ?? '') === p.id;
              const n = countFor(p);
              if (n === 0 && !on) return null;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSel((s) => ({ ...s, [g]: on ? '' : p.id }))}
                  className={cn(
                    'flex-shrink-0 h-11 px-3 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-colors',
                    on
                      ? 'bg-[var(--accent-solid)] text-[var(--on-accent)] border-transparent shadow-xs'
                      : 'bg-[var(--bg-color)] text-[var(--text-primary)] border-[color-mix(in_srgb,var(--text-muted)_50%,transparent)] hover:border-[var(--text-muted)]'
                  )}
                >
                  {p.name}
                  {n !== null && <span className="opacity-55 ml-1 text-[10px]">{n}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop: Grouped rows (TYPE, WHEN, DEITY) */}
        <div className="hidden sm:block space-y-1.5">
          {groups.map(([g, items]) => (
            <div key={g} className="flex items-center gap-2">
              <span className="w-11 flex-shrink-0 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--text-muted)]">{g}</span>
              <div style={{ maskImage: 'linear-gradient(to right, #000 calc(100% - 24px), transparent)', WebkitMaskImage: 'linear-gradient(to right, #000 calc(100% - 24px), transparent)' }}
                className="flex gap-1.5 overflow-x-auto py-0.5 pr-6 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[{ id: '', name: 'All' } as { id: string; name: string }, ...items].map((p) => {
                  const on = (sel[g] ?? '') === p.id;
                  const full = p.id ? items.find((x) => x.id === p.id)! : null;
                  const n = full ? countFor(full) : null;
                  if (full && n === 0 && !on) return null;
                  return (
                    <button key={p.id || 'all'} type="button" aria-pressed={on} onClick={() => setSel((s) => ({ ...s, [g]: on ? '' : p.id }))}
                      className={cn('flex-shrink-0 h-11 px-3 rounded-full text-[13px] font-semibold whitespace-nowrap border transition-colors',
                        on ? 'bg-[var(--accent-solid)] text-[var(--on-accent)] border-transparent shadow-xs'
                          : 'bg-[var(--bg-color)] text-[var(--text-primary)] border-[color-mix(in_srgb,var(--text-muted)_50%,transparent)] hover:border-[var(--text-muted)]')}>
                      {p.name}{n !== null && <span className="opacity-55 ml-1 text-[10px]">{n}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {activeLists.length > 0 && (
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5 min-w-0"><ListMusic size={14} className="flex-shrink-0" /> <span className="truncate">{rows.length} {rows.length === 1 ? 'result' : 'results'} for {listName}</span></p>
            <button type="button" onClick={() => setSel({})} className="min-h-11 px-2 text-sm font-bold underline text-[var(--text-secondary)] flex-shrink-0">Clear filters</button>
          </div>
        )}
      </div>
      <style>{`@keyframes sl-eq { 0%,100% { height: 4px } 50% { height: 14px } } .sl-eq { height: 4px; animation: sl-eq .9s ease-in-out infinite; } @media (prefers-reduced-motion: reduce) { .sl-eq { animation: none; height: 10px; } }`}</style>
      {/* Tracks */}
      <ol className="grid gap-2.5 md:grid-cols-2">
        {rows.length === 0 && <li className="md:col-span-2 rounded-2xl border border-[var(--border-subtle)] px-4 py-8 text-center text-sm text-[var(--text-muted)]">No match. Try a deity or festival name.</li>}
        {rows.map((t) => {
          const active = isMine && trackId === t.id;
          const locked = isLocked(t.id);
          const mine = isMantras && boughtSingly(t.id);
          return (
            <li key={t.id} className="relative" style={{ contentVisibility: 'auto', containIntrinsicSize: '96px' }}>
              <button onClick={() => onRow(t)} className={cn('group w-full flex items-center gap-3 p-2 pr-2 sm:gap-3.5 sm:p-2.5 sm:pr-3 rounded-2xl border text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]',
                active ? 'bg-[var(--bg-surface)] border-[var(--accent-primary)] shadow-md' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:-translate-y-0.5 hover:shadow-md',
                locked && 'opacity-70')}
                aria-label={locked ? `${t.title}, locked. Unlock on the pricing page` : undefined}>
                <img src={t.cover} alt="" loading="lazy" decoding="async" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-[var(--bg-color)]"
                  onError={(e) => { if (e.currentTarget.src !== new URL(cover, location.href).href) e.currentTarget.src = cover; }} />
                <span className="min-w-0 flex-1">
                  <span className={cn('block truncate text-[15px] font-semibold', active ? 'text-[var(--accent-text)]' : 'text-[var(--text-primary)]')}>{t.title}</span>
                  <span className="block truncate text-sm text-[var(--text-muted)] mt-0.5">{t.subtitle}</span>
                  <span className="flex items-center gap-2 mt-1.5 text-[11px] text-[var(--text-muted)]">
                    {!unlocked && !locked && <span className="text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-text)]">Free</span>}
                    {locked && <span className="inline-flex items-center gap-1"><Lock size={11} /> Pass</span>}
                    {t.duration && <span>{t.duration}</span>}
                  </span>
                </span>
                <span className={cn('w-11 h-11 rounded-full grid place-items-center flex-shrink-0 border transition-colors',
                  active ? 'bg-[var(--accent-solid)] text-[var(--on-accent)] border-transparent' : 'border-[color-mix(in_srgb,var(--text-muted)_55%,transparent)] text-[var(--text-primary)] group-hover:bg-[var(--accent-solid)] group-hover:text-[var(--on-accent)] group-hover:border-transparent',
                  mine && 'mr-11')}>
                  {loadingId === t.id ? <Loader2 size={16} className="animate-spin" />
                    : locked ? <Lock size={15} />
                    : active && playing ? <span className="flex items-end justify-center gap-[2px] h-4" aria-label="Playing">{[0, 1, 2].map((b) => <span key={b} className="w-[3px] rounded-sm bg-current sl-eq" style={{ animationDelay: `${b * 0.18}s` }} />)}</span>
                    : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </span>
              </button>
              {mine && (
                <button type="button" onClick={() => void saveFile(t)} aria-label={`Download ${t.title}`} title="Download your mp3"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-color)] text-[var(--text-secondary)] hover:text-[var(--accent-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]">
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
        <div style={barBox ? { left: barBox.left, width: barBox.width, bottom: `calc(${barBox.bottom}px + env(safe-area-inset-bottom, 0px))` } : undefined} className="fixed bottom-3 z-40 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-color)]/95 backdrop-blur-xl shadow-2xl">
          <div className="h-1 bg-[var(--border-subtle)] overflow-hidden rounded-t-2xl"><div className="h-full bg-[var(--accent-primary)]" style={{ width: `${pct}%` }} /></div>
          <div className="flex items-center gap-1 sm:gap-3 p-2 sm:p-3">
            <button
              type="button"
              onClick={() => tools && setZenChantOpen(true)}
              className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer group"
              aria-label={tools ? 'Open full-screen chanting view' : undefined}
            >
              <img src={current.cover} alt="" className="hidden sm:block w-11 h-11 rounded-lg object-cover flex-shrink-0 group-hover:opacity-85 transition-opacity" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-text)] transition-colors">{current.title}</span>
                <span className="block truncate text-xs text-[var(--text-muted)]">{pujaName ? `${pujaName} · ${queue ? queue.indexOf(current.id) + 1 : 1} of ${queue?.length ?? 1}` : queue ? (activeLists.length ? `Playing ${listName}` : 'Playing the whole library') : current.subtitle}</span>
              </span>
            </button>
            {tools && (
              <button
                type="button"
                onClick={() => setZenChantOpen(true)}
                aria-label="Open Zen Chanting View"
                title="Full-screen Minimalist Chanting View"
                className="flex items-center justify-center gap-1 w-11 h-11 sm:w-auto sm:px-2.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/35 text-[var(--text-primary)] text-sm font-bold flex-shrink-0 hover:border-amber-400"
              >
                <span className="text-amber-400 font-serif text-sm">ॐ</span>
                <span className="hidden sm:inline">Zen View</span>
              </button>
            )}
            <button aria-label="Previous" onClick={() => step(-1)} className="w-11 h-11 grid place-items-center text-[var(--text-secondary)] rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"><SkipBack size={18} /></button>
            <button aria-label={playing ? 'Pause' : 'Play'} onClick={() => (playing ? VoiceService.pause() : VoiceService.resume('music'))}
              className="w-11 h-11 grid place-items-center rounded-full bg-[var(--accent-solid)] text-[var(--on-accent)]">
              {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
            <button aria-label="Next" onClick={() => step(1)} className="w-11 h-11 grid place-items-center text-[var(--text-secondary)] rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"><SkipForward size={18} /></button>
            {tools && <SleepTimerButton />}
            <button aria-label={loop ? 'Loop on' : 'Loop off'} aria-pressed={loop && unlocked} onClick={toggleLoop}
              title={!unlocked ? 'Unlock to loop this track' : loop ? 'Loop is on. Click to turn off' : 'Turn on loop mode'}
              className={cn('relative w-11 h-11 grid place-items-center rounded-full border transition-colors',
                loop && unlocked ? 'bg-[var(--accent-solid)] text-[var(--on-accent)] border-transparent' : 'text-[var(--text-muted)] border-[var(--border-subtle)]')}>
              {queue ? <Repeat size={18} /> : <Repeat1 size={18} />}
              {!unlocked && <Lock size={9} className="absolute right-0.5 bottom-1" />}
              {unlocked && <span className="sr-only">{loop ? 'On' : 'Off'}</span>}
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Minimalist Chanting View for Paid Owners on Mobile */}
      {tools && (
        <MinimalistChantingView
          isOpen={zenChantOpen}
          onClose={closeZenChant}
          title={current?.title ?? (counterTrack?.title || 'Sacred Mantra')}
          subtitle={current?.subtitle ?? counterTrack?.subtitle}
          todayReps={counterSlug ? repsOn(sadhana.state, dateKey(), counterSlug) : 0}
          malaTarget={sadhana.state.malaTarget}
          playing={playing}
          onTogglePlay={() => {
            if (!current && counterTrack) { void playTrack(counterTrack, null); return; }
            if (playing) VoiceService.pause(); else VoiceService.resume('music');
          }}
          onStop={() => VoiceService.stopMusic()}
          onCountOne={() => counterSlug && countOne(counterSlug)}
          onReset={() => counterSlug && sadhana.clearToday(counterSlug)}
          onSelectTarget={(target) => sadhana.setMalaTarget(target)}
          isDark={typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true}
          isAarti={counterSlug ? isAarti(counterSlug) : current ? isAarti(slugOf(current.id) || '') : false}
          currentTime={progress.currentTime}
          duration={progress.duration}
        />
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
                      <span className="font-bold text-[var(--text-primary)]">{p.name}{i === 1 && <span className="ml-2 text-[11px] uppercase tracking-wider text-[var(--accent-text)]">Best value</span>}</span>
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
