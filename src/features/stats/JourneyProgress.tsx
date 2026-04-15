/**
 * JourneyProgress.tsx
 *
 * Consolidated progress section for the Progress tab.
 * Shows:
 * 1.  Today's Snapshot — what was done today
 * 2.  By Course cards — PON + Wisdom Untethered (with deep links)
 * 3.  This Week strip — 7-day practice check
 *
 * Designed to scale to 200+ WU questions.
 */

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
} from 'lucide-react';
import { db } from '../../firebase';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { PRACTICE_LIBRARY, QUESTION_IDS } from '../practices/practiceLibrary';
import { useWeeklyAssignment } from '../../hooks/useWeeklyAssignment';
import { useAuth } from '../auth/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface QuestionProgress {
  read: boolean;
  practice: boolean;
  video: boolean;
}

interface CourseProgress {
  [questionId: string]: QuestionProgress;
}



interface Props {
  onNavigate?: (tab: string, questionId?: string, view?: 'explanation' | 'video' | 'practice') => void;
  /** user account creation date for weekly assignment */
  accountCreatedAt?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--text-muted)] mb-4">
      {children}
    </p>
  );
}

// SnapshotRow removed — "Today's Practice" is owned by Dashboard's TodayPath widget

// Course progress card
function CourseCard({
  title,
  subtitle,
  progressLabel,
  progressPct,
  color,
  ctaLabel,
  onCta,
  children,
}: {
  title: string;
  subtitle: string;
  progressLabel: string;
  progressPct: number;
  color: string;
  ctaLabel: string;
  onCta?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
      {/* Color band */}
      <div className="h-1" style={{ background: color }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[14px] font-serif font-medium text-[var(--text-primary)] leading-tight">
              {title}
            </p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          </div>
          <button
            onClick={onCta}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-opacity opacity-60 hover:opacity-100 flex-shrink-0 ml-3"
            style={{ color }}
          >
            {ctaLabel} <ChevronRight size={10} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1.5 rounded-full bg-[var(--border-subtle)] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
          <span className="text-[11px] font-bold flex-shrink-0" style={{ color }}>
            {progressLabel}
          </span>
        </div>

        {children}
      </div>
    </div>
  );
}

// WU question strip — one dot per question
function WUQuestionStrip({
  wuProgress,
  totalQuestionsInApp,
  onNavigate,
}: {
  wuProgress: CourseProgress;
  totalQuestionsInApp: number;
  onNavigate?: (tab: string, questionId?: string, view?: 'explanation' | 'video' | 'practice') => void;
}) {
  return (
    <div>
      <p className="text-[10px] text-[var(--text-muted)] mb-2.5 font-medium">
        Questions explored · {QUESTION_IDS.length} available now &nbsp;
        <span className="opacity-50">· {totalQuestionsInApp - QUESTION_IDS.length} coming soon</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {QUESTION_IDS.map((qId, i) => {
          const qp = wuProgress[qId];
          const done = qp?.read || qp?.video || qp?.practice;
          const practice = PRACTICE_LIBRARY[qId];
          const color = practice?.color ?? '#B8973A';
          return (
            <button
              key={qId}
              title={`Q${i + 1} — ${practice?.name || qId}`}
              onClick={() => onNavigate?.('wisdom_untethered', qId, 'explanation')}
              className="group relative w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all duration-200 hover:scale-110"
              style={{
                background: done ? color + '20' : 'var(--bg-secondary)',
                border: `1.5px solid ${done ? color + '50' : 'var(--border-subtle)'}`,
                color: done ? color : 'var(--text-muted)',
              }}
            >
              {i + 1}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                <p className="text-[12px] font-bold text-[var(--text-primary)]">Q{i + 1}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{practice?.name}</p>
              </div>
            </button>
          );
        })}
        {/* Future questions placeholder */}
        {totalQuestionsInApp > QUESTION_IDS.length && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] opacity-30"
            style={{ border: '1px dashed var(--border-subtle)', color: 'var(--text-muted)' }}
          >
            +{totalQuestionsInApp - QUESTION_IDS.length}
          </div>
        )}
      </div>
    </div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function JourneyProgress({ onNavigate, accountCreatedAt }: Props) {
  const { user } = useAuth();
  const weeklyAssignment = useWeeklyAssignment(accountCreatedAt ?? null);

  // State
  const [wuProgress, setWuProgress] = useState<CourseProgress>({});
  const [ponWatched, setPonWatched] = useState(0);
  const [loading, setLoading] = useState(true);

  const PON_TOTAL = 30; // total PON chapters
  const WU_FUTURE_TOTAL = 200; // planned total WU questions

  // ── Fetch all data in one shot ──
  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const uid = user.uid;

    Promise.all([
      // WU course progress
      getDoc(doc(db, 'users', uid, 'courseProgress', 'wisdom-untethered')),
      // PON progress (video watches)
      getDoc(doc(db, 'users', uid, 'progress', 'powerOfNow')),
    ]).then(([wuSnap, ponSnap]) => {
      // WU progress
      setWuProgress(wuSnap.exists() ? (wuSnap.data() as CourseProgress) : {});

      // PON
      if (ponSnap.exists()) {
        setPonWatched(ponSnap.data().watched?.length || 0);
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  // ── Derived values ──

  const { questionId: assignedQId } = weeklyAssignment;
  const practice = PRACTICE_LIBRARY[assignedQId];
  const accentColor = practice?.color ?? '#B8973A';

  const wuExploredCount = useMemo(() =>
    QUESTION_IDS.filter(qId => {
      const qp = wuProgress[qId];
      return qp?.read || qp?.video || qp?.practice;
    }).length,
    [wuProgress]
  );

  const ponPct = Math.round((ponWatched / PON_TOTAL) * 100);
  const wuPct = Math.round((wuExploredCount / QUESTION_IDS.length) * 100);



  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-[11px] font-serif italic text-[var(--text-muted)] animate-pulse">
          Gathering your journey…
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">



      {/* ── 3. By Course cards ── */}
      <div>
        <SectionLabel>Your Courses</SectionLabel>
        <div className="space-y-4">

          {/* Power of Now */}
          <CourseCard
            title="The Power of Now"
            subtitle="Eckhart Tolle · Living Study"
            progressLabel={`${ponWatched}/${PON_TOTAL}`}
            progressPct={ponPct}
            color="#6B7CA4"
            ctaLabel="Continue"
            onCta={() => onNavigate?.('power_of_now')}
          />

          {/* Wisdom Untethered */}
          <CourseCard
            title="Wisdom Untethered"
            subtitle={`Michael Singer · ${QUESTION_IDS.length} questions available`}
            progressLabel={`${wuExploredCount}/${QUESTION_IDS.length} explored`}
            progressPct={wuPct}
            color={accentColor}
            ctaLabel="This week's Q"
            onCta={() => onNavigate?.('wisdom_untethered', assignedQId, 'explanation')}
          >
            <WUQuestionStrip
              wuProgress={wuProgress}
              totalQuestionsInApp={WU_FUTURE_TOTAL}
              onNavigate={onNavigate}
            />
          </CourseCard>

        </div>
      </div>

    </div>
  );
}
