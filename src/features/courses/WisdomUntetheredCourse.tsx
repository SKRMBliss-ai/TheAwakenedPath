import { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Sparkles, Flame, Youtube } from 'lucide-react';
import styles from './CourseTabs.module.css';
import { WisdomUntetheredPracticeTab } from './WisdomUntetheredPracticeTab';
import { cn } from '../../lib/utils';
import { Chap1Question1 } from './wisdom-untethered/Chap1Question1';
import { Chap1Question2 } from './wisdom-untethered/Chap1Question2';
import { Chap1Question3 } from './wisdom-untethered/Chap1Question3';
import { Chap1Question4 } from './wisdom-untethered/Chap1Question4';
import { Target, CheckCircle2 } from 'lucide-react';
import { useCourseTracking } from '../../hooks/useCourseTracking';
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
    videoId: "3oAQijy87rs"
  }
];

const QUESTION_VIDEOS: Record<string, string> = {
  'question1': '3oAQijy87rs',
  'question2': 'rlRi9eCyZuU',
  'question3': 'hNImvYFpx00', // Placeholder or real ID
  'question4': 'mIscD_Yd48E', // Placeholder or real ID
};

interface CourseProps {
  activeQuestionId: string;
  viewMode: 'explanation' | 'practice' | 'video' | 'progress';
  setViewMode: (mode: 'explanation' | 'practice' | 'video' | 'progress') => void;
  onOpenJournal?: () => void;
  onNavigateToPractice?: () => void;
}

export function WisdomUntetheredCourse({ 
  activeQuestionId, 
  viewMode, 
  setViewMode,
  onOpenJournal,
}: CourseProps) {
  // Always Chapter 1 for this coarse for now
  const activeChapter = useMemo(() => CHAPTERS[0], []);
  const tabs = [
    { id: 'explanation' as const, label: 'Explanation', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'video' as const,       label: 'Video',       icon: <Youtube className="w-3.5 h-3.5" /> },
    { id: 'practice' as const,    label: 'Practice',    icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'progress' as const,    label: 'Progress',    icon: <Target className="w-3.5 h-3.5" /> },
  ];

  const { user: currentUser } = useAuth();
  const { progress, updateProgress } = useCourseTracking(currentUser?.uid);

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
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
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
                onSelectQuestion={(_id) => {
                  // If WisdomUntetheredCourse has a way to change activeQuestionId from parent, use it
                  // In this component, activeQuestionId comes from props.
                  // Usually, the parent handles this.
                }}
              />
            </motion.div>
          )}

          {/* VIDEO VIEW */}
          {viewMode === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={styles.videoView}
            >
              <div className={styles.videoPlayerContainer}>
                <iframe
                  className={styles.videoIframe}
                  src={`https://www.youtube.com/embed/${QUESTION_VIDEOS[activeQuestionId] || activeChapter.videoId}?rel=0&modestbranding=1&autohide=1&showinfo=0`}
                  title="Lesson Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className={styles.videoInfo}>
                <span className={styles.videoLabel}>
                  Deep Dive Teaching • {activeChapter.subtitle}
                </span>
              </div>
            </motion.div>
          )}

          {/* PROGRESS DASHBOARD VIEW */}
          {viewMode === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full h-full overflow-y-auto p-8 lg:p-16 flex flex-col items-center bg-[var(--bg-primary)]"
            >
              <div className="max-w-4xl w-full">
                <div className="mb-12 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)] opacity-70 font-sans">Curriculum Mastery</span>
                  <h2 className="text-4xl font-serif font-light text-[var(--text-primary)] mt-4">Journey of Presence</h2>
                  <p className="text-[var(--text-secondary)] mt-4 font-light italic">Your evolution through the chapters of the soul.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: 'question1', label: 'Q1: Mind as a Tool' },
                    { id: 'question2', label: 'Q2: The Witness' },
                    { id: 'question3', label: 'Q3: Cosmic Pause' },
                    { id: 'question4', label: 'Q4: Achieving Clarity' },
                  ].map((q) => {
                    const prog = progress[q.id] || { read: false, video: false, practice: false };
                    const isAllDone = prog.read && prog.video && prog.practice;

                    return (
                      <div key={q.id} className={cn(
                        "p-8 rounded-[32px] border transition-all duration-500 bg-[var(--bg-surface)]",
                        isAllDone ? "border-[var(--accent-primary)]/40 shadow-[0_0_30px_rgba(var(--accent-primary-rgb),0.05)]" : "border-[var(--border-default)]"
                      )}>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center justify-between font-sans">
                          {q.label}
                          {isAllDone && <CheckCircle2 className="text-[var(--accent-primary)] w-5 h-5" />}
                        </h4>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex flex-col items-center gap-2">
                            <div className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500",
                              prog.read ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30 text-[var(--accent-primary)]" : "bg-[var(--bg-surface-hover)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                            )}>
                              <BookOpen size={18} />
                            </div>
                            <span className="text-[8px] uppercase tracking-widest font-bold font-sans">Content</span>
                          </div>

                          <div className="flex flex-col items-center gap-2">
                            <div className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500",
                              prog.video ? "bg-[var(--accent-secondary)]/10 border-[var(--accent-secondary)]/30 text-[var(--accent-secondary)]" : "bg-[var(--bg-surface-hover)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                            )}>
                              <Play size={18} />
                            </div>
                            <span className="text-[8px] uppercase tracking-widest font-bold font-sans">Video</span>
                          </div>

                          <div className="flex flex-col items-center gap-2">
                            <div className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500",
                              prog.practice ? "bg-orange-400/10 border-orange-400/30 text-orange-400/70" : "bg-[var(--bg-surface-hover)] border-[var(--border-subtle)] text-[var(--text-muted)]"
                            )}>
                              <Flame size={18} />
                            </div>
                            <span className="text-[8px] uppercase tracking-widest font-bold font-sans">Practice</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
