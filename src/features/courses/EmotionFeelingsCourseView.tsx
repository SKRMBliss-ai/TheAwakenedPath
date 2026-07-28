import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, CheckCircle2, Lock, Play, ArrowLeft, Sparkles, CalendarClock, ChevronDown } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../auth/AuthContext';
import { useCourseTracking } from '../../hooks/useCourseTracking';
import { useRazorpay } from '../../hooks/useRazorpay';
import { VoiceService } from '../../services/voiceService';
import { usePageSeo } from '../../lib/seo';

// Charge currency for in-app checkout — a subset matching the backend's
// COURSE_PRICES_BY_CURRENCY. Anything else bills in USD (backend also falls
// back to USD, so button and charge always agree).
const REGION_TO_CURRENCY: Record<string, string> = {
  IN: 'INR', GB: 'GBP', CA: 'CAD', AU: 'AUD', AE: 'AED', SG: 'SGD',
  DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', IE: 'EUR',
  PT: 'EUR', AT: 'EUR', BE: 'EUR', FI: 'EUR', GR: 'EUR',
};

function detectCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'INR';
    const langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language];
    for (const l of langs) {
      const r = (l || '').split('-').pop()?.toUpperCase();
      if (r && REGION_TO_CURRENCY[r]) return REGION_TO_CURRENCY[r];
    }
  } catch (_) { /* ignore */ }
  return 'USD';
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Human "in 3 days" / "tomorrow" / "today" for an unlock timestamp. */
function untilLabel(atMs: number, now: number): string {
  const days = Math.ceil((atMs - now) / (24 * 60 * 60 * 1000));
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days < 7) return `in ${days} days`;
  const weeks = Math.round(days / 7);
  return weeks <= 1 ? 'in a week' : `in ${weeks} weeks`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Feelings & Emotions — the gated, weekly-release course view inside Mind Gym.
//
// The intro and Episode 1 (two parts) are recorded and playable today. Episodes
// 2–7 are part of the weekly release: their curriculum is shown, but they stay
// locked until their video is added here. As each `videoId` is filled in, that
// episode becomes watchable — no other change needed.
// ─────────────────────────────────────────────────────────────────────────────

export const EMOTION_COURSE_ID = 'emotion_feelings_course';

const GOLD = '#A98A67';

interface Lesson {
  id: string;
  /** short badge shown on the circle: INTRO / 1·1 / 1·2 / 2 … */
  badge: string;
  kicker: string;           // "Course Intro" / "Episode 1 · Part 1" …
  title: string;
  desc: string;
  videoId: string | null;   // null → not yet released (coming soon)
  week: number;             // release week (0 = available immediately)
  free?: boolean;           // watchable without purchase (preview hook)
}

// Curriculum copy mirrors the sales page outline so the promise and the product
// read as the same seven stages. `videoId` present = live; null = coming soon.
const LESSONS: Lesson[] = [
  {
    id: 'guide-intro',
    badge: 'Guide',
    kicker: 'Meet Your Guide',
    title: 'I Am Sim — Welcome & Guide Introduction',
    desc: 'A personal introduction from your guide Sim Katyal on the intention and heart behind this guided journey.',
    videoId: '0LoCdi1YLe0',
    week: 0,
    free: true,
  },
  {
    id: 'intro',
    badge: 'Intro',
    kicker: 'Course Introduction',
    title: 'Welcome — How This Course Works',
    desc: 'A short orientation to the journey ahead and how to get the most out of each episode.',
    videoId: 'nbyToUpT1_8',
    week: 0,
    free: true,
  },
  {
    id: 'ep1-part1',
    badge: '1·1',
    kicker: 'Episode 1 · Part 1 — Become Aware',
    title: 'What Are Feelings and Emotions?',
    desc: "We begin by understanding what feelings and emotions really are — not just in theory, but in how they show up in our everyday lives.",
    videoId: 'fTrY9KMLhAo',
    week: 0,
    free: true,
  },
  {
    id: 'ep1-part2',
    badge: '1·2',
    kicker: 'Episode 1 · Part 2 — Become Aware',
    title: 'What Are Feelings and Emotions? (continued)',
    desc: 'Part two goes deeper into noticing emotions as they arise — the first, essential skill the rest of the course builds on.',
    videoId: 'j3xiMiqnrf4',
    week: 0,
    free: true,
  },
  {
    id: 'ep1-prayer',
    badge: '1·P',
    kicker: 'Episode 1 · Guided Prayer',
    title: 'Episode 1 — Guided Prayer & Reflection',
    desc: 'A sacred opening prayer to ground your heart and open your awareness for the journey of awareness.',
    videoId: '9Wmc9ZXUtb4',
    week: 0,
    free: true,
  },
  {
    id: 'ep2',
    badge: '2',
    kicker: 'Episode 2 — Understand Childhood',
    title: 'How Childhood Shapes Our Emotional Patterns',
    desc: 'We look back at our childhood and explore the programming behind our emotional responses that still run the show today.',
    videoId: 'pES3x5XlJF0',
    week: 0,
    free: true,
  },
  {
    id: 'ep3',
    badge: '3',
    kicker: 'Episode 3 — Recognize Your Triggers',
    title: 'Why The Past Still Controls Us',
    desc: "How random triggers — songs, tones, looks — can spark intense reactions from the past that we don't even realize are running us.",
    videoId: 'j3xiMiqnrf4',
    week: 0,
  },
  {
    id: 'ep4',
    badge: '4',
    kicker: 'Episode 4 — See Your Escapes',
    title: 'Why We Keep Avoiding Our Feelings',
    desc: 'The ways we escape and avoid — phone scrolling, busyness, over-eating, shopping, alcohol — and why avoidance never truly sets us free.',
    videoId: 'nbyToUpT1_8',
    week: 0,
  },
  {
    id: 'ep5',
    badge: '5',
    kicker: 'Episode 5 — See Your Masks',
    title: 'Why We Keep Trying to Prove Ourselves',
    desc: "The drive to achieve, people-please, and prove ourselves — and the quiet, bottomless ache that success can't fill.",
    videoId: 'fTrY9KMLhAo',
    week: 0,
  },
  {
    id: 'ep6',
    badge: '6',
    kicker: 'Episode 6 — See Yourself Clearly',
    title: 'The Emotions We See in Others — And in Ourselves',
    desc: "How we project, judge, and react to emotions in others that are actually the parts of us we can't accept or feel.",
    videoId: 'j3xiMiqnrf4',
    week: 0,
  },
  {
    id: 'ep7',
    badge: '7',
    kicker: 'Episode 7 — Let Go',
    title: 'How It Gets Better — And Why Letting It Go Is The Key',
    desc: 'Why feeling it all the way through brings true healing — and how letting go is the doorway to freedom and lasting peace.',
    videoId: 'nbyToUpT1_8',
    week: 0,
  },
];

// ─── YouTube facade → iframe (matches the Wisdom course pattern) ──────────────
function VideoPlayer({ videoId }: { videoId: string }) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => { if (playing) VoiceService.pause(); }, [playing]);

  return (
    <div className="relative w-full aspect-video rounded-[24px] overflow-hidden bg-black shadow-2xl">
      {!playing ? (
        <button
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 w-full h-full flex items-center justify-center"
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Lesson preview"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
          <span
            className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-black shadow-2xl transition-transform group-hover:scale-110"
            style={{ background: GOLD }}
          >
            <Play className="w-8 h-8 ml-1 fill-black" />
          </span>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
          >
            <Youtube size={14} color="#FF0000" fill="#FF0000" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">YouTube</span>
          </a>
        </button>
      ) : (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
          title="Lesson video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

interface Props {
  owns?: boolean;          // has purchased (or all-access / admin) → paywall lifted
  adminPreview?: boolean;  // admin/test — also bypass the weekly-drip schedule
  onReturn?: () => void;
}

// A lesson's state for the current viewer.
//   play      → watchable now
//   paywall   → recorded, paid, viewer hasn't purchased
//   scheduled → owned & recorded, but its weekly-release date hasn't arrived
//   soon      → not recorded yet
type LessonState = 'play' | 'paywall' | 'scheduled' | 'soon';

/** Timestamp (ms) at which a lesson unlocks for an owner, given their start date. */
function unlockAt(l: Lesson, startedAtMs: number | null): number | null {
  if (!l.week || !startedAtMs) return null; // week 0 (intro/ep1) or no anchor → immediate
  return startedAtMs + l.week * WEEK_MS;
}

function lessonState(
  l: Lesson,
  owns: boolean,
  startedAtMs: number | null,
  bypassSchedule: boolean,
  now: number,
): LessonState {
  if (!l.videoId) return 'soon';               // not recorded yet
  if (!owns && !l.free) return 'paywall';      // recorded, paid, not owned
  if (owns && !bypassSchedule) {               // owned → respect the weekly drip
    const at = unlockAt(l, startedAtMs);
    if (at && now < at) return 'scheduled';
  }
  return 'play';
}

const MODULE_GROUPS: { id: string; kicker: string; title: string; lessonIds: string[] }[] = [
  {
    id: 'orientation',
    kicker: 'Course Orientation',
    title: 'Welcome & Guide Introduction',
    lessonIds: ['guide-intro', 'intro'],
  },
  {
    id: 'ep1',
    kicker: 'Episode 1',
    title: 'Episode 1 — Become Aware',
    lessonIds: ['ep1-part1', 'ep1-part2', 'ep1-prayer'],
  },
  {
    id: 'ep2',
    kicker: 'Episode 2',
    title: 'Episode 2 — Understand Childhood',
    lessonIds: ['ep2'],
  },
  {
    id: 'ep3',
    kicker: 'Episode 3',
    title: 'Episode 3 — Recognize Your Triggers',
    lessonIds: ['ep3'],
  },
  {
    id: 'ep4',
    kicker: 'Episode 4',
    title: 'Episode 4 — See Your Escapes',
    lessonIds: ['ep4'],
  },
  {
    id: 'ep5',
    kicker: 'Episode 5',
    title: 'Episode 5 — See Your Masks',
    lessonIds: ['ep5'],
  },
  {
    id: 'ep6',
    kicker: 'Episode 6',
    title: 'Episode 6 — See Yourself Clearly',
    lessonIds: ['ep6'],
  },
  {
    id: 'ep7',
    kicker: 'Episode 7',
    title: 'Episode 7 — Let Go',
    lessonIds: ['ep7'],
  },
];

export function EmotionFeelingsCourseView({ owns = false, adminPreview = false, onReturn }: Props) {
  const { user } = useAuth();
  const { progress = {}, updateProgress } = useCourseTracking(user?.uid, EMOTION_COURSE_ID);
  const { checkOut, isProcessing } = useRazorpay();

  usePageSeo({
    title: 'Feelings & Emotions Course — Guided Video Lessons | Mind Gym',
    description: 'A 7-episode guided journey inside Mind Gym. Understand emotional conditioning, break reactivity, and cultivate presence.',
    url: 'https://www.skrmblissai.in/feelingsandemotioncourse',
    image: 'https://www.skrmblissai.in/og/course.png',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Understanding Feelings & Emotions Course',
      description: 'A 7-episode guided video journey for emotional intelligence and mindfulness.',
      provider: {
        '@type': 'Organization',
        name: 'Soulful Intelligence Studio',
        sameAs: 'https://www.skrmblissai.in',
      },
    },
  });

  // Launch Razorpay checkout in-app. On success the profile snapshot flips
  // `owns` → true, which re-renders the locked lesson as the playable video.
  const handleUnlock = () => {
    if (!user?.uid) { window.location.href = '/feelingsandemotioncourse'; return; }
    checkOut(
      user.uid,
      user.email || '',
      user.displayName || '',
      EMOTION_COURSE_ID,
      detectCurrency(),
      () => { /* entitlement arrives via the users-doc onSnapshot */ },
    );
  };

  // Weekly-drip anchor: the moment this owner first opened the course. Recorded
  // once (best-effort) so future episodes unlock a week apart from that point,
  // instead of all at once the day their videos are added.
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!owns || !user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const ref = doc(db, 'users', user.uid, 'courseMeta', EMOTION_COURSE_ID);
        const snap = await getDoc(ref);
        const existing = snap.exists() ? snap.data()?.startedAt : null;
        if (existing?.toMillis) {
          if (!cancelled) setStartedAtMs(existing.toMillis());
        } else {
          await setDoc(ref, { startedAt: serverTimestamp() }, { merge: true });
          if (!cancelled) setStartedAtMs(Date.now()); // optimistic — good enough for gating
        }
      } catch (_) { /* non-fatal — falls back to no schedule gating */ }
    })();
    return () => { cancelled = true; };
  }, [owns, user?.uid]);

  const stateOf = (l: Lesson) => lessonState(l, owns, startedAtMs, adminPreview, now);

  // Lessons the current viewer can actually play (owned → unlocked-so-far; else free previews).
  const playable = useMemo(
    () => LESSONS.filter((l) => stateOf(l) === 'play'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [owns, startedAtMs, adminPreview, now],
  );
  const [activeId, setActiveId] = useState<string>('intro');
  useEffect(() => { setActiveId((id) => (playable.some((l) => l.id === id) ? id : (playable[0]?.id ?? 'intro'))); }, [playable]);
  const active = LESSONS.find((l) => l.id === activeId) ?? LESSONS[0];
  const activeState = stateOf(active);

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>('orientation');
  useEffect(() => {
    const matchingGroup = MODULE_GROUPS.find((g) => g.lessonIds.includes(activeId));
    if (matchingGroup) setExpandedGroupId(matchingGroup.id);
  }, [activeId]);

  // Watching a playable lesson marks it as seen for progress tracking.
  useEffect(() => {
    if (activeState === 'play') updateProgress(active.id, { video: true });
  }, [active.id, activeState, updateProgress]);

  const watchedCount = playable.filter((l) => progress[l.id]?.video).length;

  return (
    <div className="w-full max-w-5xl mx-auto pb-16">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          {onReturn && (
            <button
              onClick={onReturn}
              className="w-9 h-9 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all active:scale-95 flex-shrink-0"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: GOLD }}>
              Your Course
            </p>
            <h1 className="text-xl sm:text-2xl font-serif font-light text-[var(--text-primary)] truncate">
              Feelings &amp; Emotions
            </h1>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end flex-shrink-0">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Watched</span>
          <span className="text-sm font-bold text-[var(--text-primary)]">
            {watchedCount} / {playable.length} available
          </span>
        </div>
      </div>

      {/* ── Player ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeState === 'play' && active.videoId ? (
            <VideoPlayer videoId={active.videoId} />
          ) : activeState === 'paywall' ? (
            <div className="w-full aspect-video rounded-[24px] flex flex-col items-center justify-center text-center gap-3 px-6 border" style={{ borderColor: `${GOLD}55`, background: `${GOLD}0f` }}>
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: `${GOLD}22` }}>
                <Lock className="w-7 h-7" style={{ color: GOLD }} />
              </div>
              <p className="text-lg font-serif text-[var(--text-primary)]">Unlock the full course</p>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm">
                You&apos;ve watched the free preview. Get lifetime access to every episode — including this one — for a one-time payment.
              </p>
              <button
                onClick={handleUnlock}
                disabled={isProcessing}
                className="mt-1 inline-block px-6 py-3 rounded-full font-bold text-black text-sm active:scale-95 transition-transform disabled:opacity-60"
                style={{ background: GOLD }}
              >
                {isProcessing ? 'Opening secure payment…' : 'Unlock full course →'}
              </button>
            </div>
          ) : activeState === 'scheduled' ? (
            <div className="w-full aspect-video rounded-[24px] flex flex-col items-center justify-center text-center gap-3 px-6 border border-[var(--border-default)] bg-[var(--bg-surface)]">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: `${GOLD}22` }}>
                <CalendarClock className="w-7 h-7" style={{ color: GOLD }} />
              </div>
              <p className="text-lg font-serif text-[var(--text-primary)]">
                Unlocks {(() => { const at = unlockAt(active, startedAtMs); return at ? untilLabel(at, now) : 'soon'; })()}
              </p>
              <p className="text-sm text-[var(--text-secondary)] max-w-xs">
                One new episode is released each week. This one opens up on schedule — it&apos;s already yours.
              </p>
            </div>
          ) : (
            <div className="w-full aspect-video rounded-[24px] flex flex-col items-center justify-center text-center gap-4 border border-[var(--border-default)] bg-[var(--bg-surface)]">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: `${GOLD}22` }}>
                <Sparkles className="w-7 h-7" style={{ color: GOLD }} />
              </div>
              <p className="text-lg font-serif text-[var(--text-primary)]">Arriving soon</p>
              <p className="text-sm text-[var(--text-secondary)] max-w-xs">
                This episode is part of the weekly release and will unlock here shortly.
              </p>
            </div>
          )}
          <div className="mt-4 px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>{active.kicker}</p>
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mt-1">{active.title}</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-2 max-w-2xl">{active.desc}</p>
          </div>
        </motion.div>
      </AnimatePresence>



      {/* ── Lesson list ── */}
      <div className="mt-8 space-y-4">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] px-1 mb-2">
          Course Contents
        </p>

        {MODULE_GROUPS.map((group) => {
          const groupLessons = group.lessonIds
            .map((lid) => LESSONS.find((item) => item.id === lid))
            .filter((l): l is Lesson => Boolean(l));

          const isExpanded = expandedGroupId === group.id;
          const hasActiveChild = group.lessonIds.includes(activeId);

          const renderLessonRow = (l: Lesson) => {
            const state = stateOf(l);
            const soon = state === 'soon';
            const paywall = state === 'paywall';
            const scheduled = state === 'scheduled';
            const isActive = l.id === active.id;
            const watched = !!progress[l.id]?.video;
            const dim = state !== 'play';
            const at = scheduled ? unlockAt(l, startedAtMs) : null;

            return (
              <button
                key={l.id}
                disabled={soon}
                onClick={() => !soon && setActiveId(l.id)}
                className={[
                  'w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all',
                  soon
                    ? 'opacity-60 cursor-default border-[var(--border-subtle)] bg-transparent'
                    : 'active:scale-[0.995] hover:bg-[var(--bg-surface-hover)]',
                  isActive
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 shadow-sm'
                    : 'border-[var(--border-default)] bg-[var(--bg-surface)]',
                ].join(' ')}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-black"
                  style={{
                    background: dim ? 'transparent' : `${GOLD}1f`,
                    border: `1.5px solid ${dim ? 'var(--border-subtle)' : GOLD}`,
                    color: dim ? 'var(--text-muted)' : GOLD,
                  }}
                >
                  {state === 'play' ? l.badge : scheduled ? <CalendarClock size={15} /> : <Lock size={15} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] sm:text-sm font-bold text-[var(--text-primary)] truncate">{l.title}</p>
                  <p className="text-[11px] sm:text-xs text-[var(--text-muted)] truncate">
                    {soon
                      ? `Unlocks in week ${l.week}`
                      : paywall
                      ? 'Paid — tap to unlock'
                      : scheduled
                      ? `Unlocks ${at ? untilLabel(at, now) : 'soon'}`
                      : l.kicker}
                  </p>
                </div>
                {!owns && l.free && l.videoId && (
                  <span
                    className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none flex-shrink-0"
                    style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                  >
                    Free
                  </span>
                )}
                {watched ? (
                  <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                ) : state === 'play' ? (
                  <Play size={16} className="text-[var(--text-muted)] flex-shrink-0" />
                ) : null}
              </button>
            );
          };

          return (
            <div
              key={group.id}
              className={[
                'rounded-3xl border text-left transition-all overflow-hidden shadow-sm',
                hasActiveChild
                  ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)]'
                  : 'border-[var(--border-default)] bg-[var(--bg-surface)]/80',
              ].join(' ')}
            >
              {/* Card Header — Clickable Accordion Trigger */}
              <button
                onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-[var(--bg-surface-hover)] transition-colors select-none text-left"
              >
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: GOLD }}>
                    {group.kicker}
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-medium text-[var(--text-primary)] truncate mt-0.5">
                    {group.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `${GOLD}1f`, color: GOLD, border: `1px solid ${GOLD}44` }}
                  >
                    {groupLessons.length} {groupLessons.length === 1 ? 'Part' : 'Parts'}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--border-subtle)] text-[var(--text-muted)] transition-transform duration-300"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <ChevronDown size={16} />
                  </div>
                </div>
              </button>

              {/* Expandable Sub-Parts */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30 p-3 sm:p-4 space-y-2 overflow-hidden"
                  >
                    <div className="space-y-2 pl-2 sm:pl-3 border-l-2" style={{ borderColor: `${GOLD}44` }}>
                      {groupLessons.map((l) => renderLessonRow(l))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EmotionFeelingsCourseView;
