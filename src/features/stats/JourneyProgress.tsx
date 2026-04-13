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
  CheckCircle2,
  Circle,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { InfoTooltip } from '../../components/ui/InfoTooltip';
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

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

function last7Keys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    keys.push(d.toISOString().split('T')[0]);
  }
  return keys;
}

function dayLabel(isoKey: string): string {
  const d = new Date(isoKey + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
}

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

// 7-day strip
function WeekStrip({ weekData }: { weekData: { key: string; practiced: boolean; assigned: boolean }[] }) {
  return (
    <div className="flex gap-1.5">
      {weekData.map(({ key, practiced, assigned }) => {
        const isToday = key === todayKey();
        return (
          <div key={key} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-full h-8 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{
                background: practiced
                  ? '#2E9E7A20'
                  : isToday && assigned
                    ? 'var(--bg-secondary)'
                    : 'transparent',
                border: practiced
                  ? '1.5px solid #2E9E7A40'
                  : isToday
                    ? '1.5px dashed var(--border-default)'
                    : '1.5px solid var(--border-subtle)',
              }}
            >
              {practiced
                ? <CheckCircle2 size={14} color="#2E9E7A" />
                : isToday
                  ? <Circle size={12} style={{ color: 'var(--text-muted)' }} />
                  : <div className="w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
              }
            </div>
            <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">
              {dayLabel(key)}
            </span>
          </div>
        );
      })}
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
  const [weekPracticed, setWeekPracticed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const PON_TOTAL = 30; // total PON chapters
  const WU_FUTURE_TOTAL = 200; // planned total WU questions

  // ── Fetch all data in one shot ──
  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const uid = user.uid;

    const week7 = last7Keys();

    Promise.all([
      // WU course progress
      getDoc(doc(db, 'users', uid, 'courseProgress', 'wisdom-untethered')),
      // PON progress (video watches)
      getDoc(doc(db, 'users', uid, 'progress', 'powerOfNow')),
      // Last 7 days of daily practices
      ...week7.map(key =>
        getDoc(doc(db, 'users', uid, 'dailyPractices', key)).then(snap => ({
          key,
          type: 'practice',
          data: snap.exists() ? snap.data() : null,
        }))
      ),
      // Last 7 days of journal entries
      // Note: journal entries use createdAt, so we should query or check if any exist for each day
      // For simplicity in a small "last 7 days" check, we can just fetch the recent journal and map it
      getDocs(query(collection(db, 'users', uid, 'journal'), orderBy('createdAt', 'desc'), limit(50)))
        .then(snap => snap.docs.map(d => ({ data: d.data(), key: d.data().createdAt?.toDate ? d.data().createdAt.toDate().toISOString().split('T')[0] : null })))
    ]).then(([wuSnap, ponSnap, ...rest]) => {
      // WU progress
      setWuProgress(wuSnap.exists() ? (wuSnap.data() as CourseProgress) : {});

      // PON
      if (ponSnap.exists()) {
        setPonWatched(ponSnap.data().watched?.length || 0);
      }

      const weekMap: Record<string, boolean> = {};
      
      // Initialize weekMap for the last 7 days
      week7.forEach(k => { weekMap[k] = false; });

      // Separate practices from journal results
      const practices = rest.slice(0, 7) as { key: string; data: any }[];
      const journals = rest[7] as { data: any; key: string | null }[];

      // Process practices
      for (const p of practices) {
        if (p.data) {
          const done = Object.values(p.data).some((r: any) => 
            r?.completed === true || 
            r?.reflectCompleted === true || 
            r?.learnCompleted === true || 
            r?.integrateCompleted === true
          );
          if (done) weekMap[p.key] = true;
        }
      }

      // Process journals
      for (const j of journals) {
        if (j.key && weekMap[j.key] !== undefined) {
          weekMap[j.key] = true;
        }
      }

      setWeekPracticed(weekMap);
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

  const weekData = useMemo(() =>
    last7Keys().map(key => ({
      key,
      practiced: weekPracticed[key] ?? false,
      assigned: key === todayKey(),
    })),
    [weekPracticed]
  );

  const weeklyDoneCount = Object.values(weekPracticed).filter(Boolean).length;

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

      {/* ── 1. This Week ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>This Week</SectionLabel>
          <div className="flex items-center gap-1.5 -mt-4">
            <span className="text-[11px] text-[var(--text-muted)] font-bold">
              {weeklyDoneCount}/7 days practiced
            </span>
            <InfoTooltip 
              title="Weekly Practice"
              description="A counts as 'practiced' if you complete any guided activity or reflection."
              howCalculated="Your goal is to sustain awareness every single day, building a chain of presence."
            />
          </div>
        </div>
        <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
          {weeklyDoneCount >= 5 && (
            <div className="flex items-center gap-2 mb-3">
              <Flame size={12} color="#F97316" />
              <span className="text-[14px] font-bold text-[#F97316]">Strong week! {weeklyDoneCount} of 7 days.</span>
            </div>
          )}
          <WeekStrip weekData={weekData} />
          <p className="text-[13px] text-[var(--text-secondary)] mt-3 text-center font-serif italic">
            ✓ = practiced &nbsp;·&nbsp; ○ = today &nbsp;·&nbsp; — = stillness day
          </p>
        </div>
      </div>

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
