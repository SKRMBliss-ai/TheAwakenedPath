import { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Youtube, CheckCircle2, Circle } from 'lucide-react';
import styles from './CourseTabs.module.css';
import { WisdomUntetheredPracticeTab } from './WisdomUntetheredPracticeTab';
import { cn } from '../../lib/utils';
import { Chap1Question1 } from './wisdom-untethered/Chap1Question1';
import { Chap1Question2 } from './wisdom-untethered/Chap1Question2';
import { Chap1Question3 } from './wisdom-untethered/Chap1Question3';
import { Chap1Question4 } from './wisdom-untethered/Chap1Question4';
import { useCourseTracking, type QuestionProgress } from '../../hooks/useCourseTracking';
import { useAuth } from '../auth/AuthContext';

interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  explanation: string;
  videoId: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "The Mind",
    subtitle: "Chapter 1",
    explanation: "Chapter 1 of Wisdom Untethered explores one of the most fundamental insights in Singer's teachings: you are not your mind. The mind has a lower layer that reacts automatically based on past experiences, and a higher layer that can consciously redirect itself toward steadier ground. Singer teaches that you don't need to fight negative thoughts — you can use the mind as a tool, through affirmations and deliberate redirection, to lift yourself out of spiraling patterns. At the deepest level, the practice is even simpler: learn to relax in the face of whatever the mind is doing. When you stop feeding the reaction, the negativity gradually loses its grip. Freedom isn't about fixing the mind. It's about stopping the habit of letting it run your life.",
    videoId: "_tyTb6hpGW8"
  }
];

const QUESTION_VIDEOS: Record<string, string> = {
  'question1': '3oAQijy87rs',
  'question2': 'rlRi9eCyZuU',
  'question3': '_tyTb6hpGW8',
  'question4': 'mIscD_Yd48E',
};

interface CourseProps {
  activeQuestionId: string;
  viewMode: string;
  setViewMode: (mode: any) => void;
  onOpenJournal?: () => void;
  onNavigateToPractice?: () => void;
}

export function WisdomUntetheredCourse({
  activeQuestionId,
  viewMode,
  setViewMode,
  onOpenJournal,
}: CourseProps) {
  const activeChapter = useMemo(() => CHAPTERS[0], []);
  
  const { user: currentUser } = useAuth();
  const { progress = {}, updateProgress } = useCourseTracking(currentUser?.uid);

  // Auto-mark video as watched when tab is selected
  useEffect(() => {
    if (viewMode === 'video' && activeQuestionId) {
      updateProgress(activeQuestionId, { video: true });
    }
  }, [viewMode, activeQuestionId, updateProgress]);

  // Mark "learn" as done when user visits explanation tab.
  useEffect(() => {
    if (viewMode === 'explanation') {
      const key = `awakened-learn-done-${activeQuestionId}-${new Date().toISOString().split('T')[0]}`;
      localStorage.setItem(key, '1');
    }
  }, [viewMode, activeQuestionId]);

  const tabs = [
    { id: 'explanation' as const, label: 'Explanation', icon: <Sparkles className="w-3.5 h-3.5" />, field: 'read' as keyof QuestionProgress },
    { id: 'video' as const, label: 'Video', icon: <Youtube className="w-3.5 h-3.5" />, field: 'video' as keyof QuestionProgress },
    { id: 'practice' as const, label: 'Practice', icon: <BookOpen className="w-3.5 h-3.5" />, field: 'practice' as keyof QuestionProgress },
  ];

  return (
    <div className={styles.container}>
      {/* ── Top Navigation Bar ── */}
      <header className={styles.topBar}>
        <div className={styles.chapterInfo}>
          <span className={styles.chapterSubtitle}>{activeChapter.subtitle}</span>
          <h2 className={styles.chapterTitle}>{activeChapter.title}</h2>
        </div>

        <nav className={styles.tabGroup}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={cn(
                styles.tab,
                viewMode === tab.id && styles.tabActive
              )}
            >
              <div className="flex items-center gap-1.5 relative z-10">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {progress[activeQuestionId]?.[tab.field] ? (
                  <div className="flex items-center justify-center w-3 h-3 rounded-full bg-emerald-500 border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 size={8} className="text-white" />
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-2.5 h-2.5 bg-amber-400/20 rounded-full animate-ping" />
                    <Circle size={6} className={cn(
                      "transition-all duration-500",
                      "fill-transparent text-[var(--border-subtle)]"
                    )} />
                  </div>
                )}
              </div>
              {viewMode === tab.id && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className={styles.tabUnderline}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Dynamic Content Area ── */}
      <main className={styles.contentArea}>
        <AnimatePresence mode="wait" initial={false}>
          {/* EXPLANATION VIEW (Slides & Interactive content) */}
          {viewMode === 'explanation' && (
            <motion.div
              key={activeQuestionId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              {activeQuestionId === 'question1' && <Chap1Question1 onOpenJournal={onOpenJournal} />}
              {activeQuestionId === 'question2' && <Chap1Question2 onOpenJournal={onOpenJournal} />}
              {activeQuestionId === 'question3' && <Chap1Question3 onOpenJournal={onOpenJournal} />}
              {activeQuestionId === 'question4' && <Chap1Question4 onOpenJournal={onOpenJournal} />}
            </motion.div>
          )}

          {/* PRACTICE VIEW (Practice Tab Content) */}
          {viewMode === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full overflow-y-auto"
            >
              <WisdomUntetheredPracticeTab
                activeQuestionId={activeQuestionId}
                userId={currentUser?.uid}
                onSelectQuestion={() => {}} // Dummy as required by interface
              />
            </motion.div>
          )}

          {/* VIDEO VIEW */}
          {viewMode === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={styles.videoView}
            >
              <div className={styles.videoContainer}>
                <iframe
                  className={styles.videoIframe}
                  src={`https://www.youtube.com/embed/${QUESTION_VIDEOS[activeQuestionId] || activeChapter.videoId}?autoplay=1&modestbranding=1&rel=0`}
                  title="Wisdom Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
