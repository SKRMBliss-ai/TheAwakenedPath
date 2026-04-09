import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Youtube, CheckCircle2, Circle, ExternalLink, Clock } from 'lucide-react';
import styles from './CourseTabs.module.css';
import { cn } from '../../lib/utils';
import { Chap1Question1 } from './wisdom-untethered/Chap1Question1';
import { Chap1Question2 } from './wisdom-untethered/Chap1Question2';
import { Chap1Question3 } from './wisdom-untethered/Chap1Question3';
import { Chap1Question4 } from './wisdom-untethered/Chap1Question4';
import { Chap1Question5 } from './wisdom-untethered/Chap1Question5';
import { ThoughtJournal } from './wisdom-untethered/components/ThoughtJournal';
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

const QUESTION_VIDEOS: Record<string, string | null> = {
  'question1': '3oAQijy87rs',
  'question2': 'rlRi9eCyZuU',
  'question3': '_tyTb6hpGW8',
  'question4': null, 
  'question5': null, 
};

interface CourseProps {
  activeQuestionId: string;
  viewMode: string;
  setViewMode: (mode: any) => void;
  onOpenJournal?: () => void;
  onNavigateToPractice?: () => void;
}

function VideoPlayerView({ videoId }: { videoId: string | null }) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoId) {
    return (
      <motion.div
        key="coming-soon"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.videoView}
      >
        <div className="flex flex-col items-center justify-center space-y-8 p-12 text-center">
          <div className="relative group">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.1, 0.3, 0.1] 
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-[-40px] bg-[var(--accent-primary)] blur-[60px] rounded-full"
            />
            <div className="w-24 h-24 rounded-[32px] border border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-center relative z-10 shadow-2xl">
              <Sparkles className="w-10 h-10 text-[var(--accent-primary)] opacity-40" />
            </div>
          </div>
          <div className="space-y-4 max-w-sm">
            <h2 className="text-3xl font-serif font-light text-[var(--text-primary)] tracking-tight">Wisdom Arriving Soon</h2>
            <p className="text-[14px] font-serif italic text-[var(--text-secondary)] leading-relaxed opacity-60">
              The sacred insights for this reflection are currently being prepared.
              Patience is part of the path.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="video"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={styles.videoView}
    >
      <div className={styles.videoPlayerContainer}>
        {!isPlaying ? (
          <div className="relative w-full h-full flex items-center justify-center group cursor-pointer overflow-hidden rounded-[24px]">
             {/* Thumbnail Background */}
             <img 
               src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
               alt="Video Preview"
               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
             
             {/* Play Icon */}
             <button 
               onClick={() => setIsPlaying(true)}
               className="relative z-10 w-20 h-20 rounded-full bg-[var(--accent-primary)]/90 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--accent-primary)]"
             >
               <div className="ml-1 w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent" />
             </button>

             {/* Youtube Logo Branding */}
             <a 
               href={`https://www.youtube.com/watch?v=${videoId}`}
               target="_blank"
               rel="noopener noreferrer"
               className="absolute bottom-6 right-8 z-20 flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
               onClick={(e) => e.stopPropagation()}
             >
               <Youtube size={16} color="#FF0000" fill="#FF0000" />
               <span className="text-[11px] font-bold uppercase tracking-wider text-white">Watch on YouTube</span>
             </a>
          </div>
        ) : (
          <iframe
            className={styles.videoIframe}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`}
            title="Wisdom Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </motion.div>
  );
}

const QUESTION_THEMES: Record<string, string> = {
  'question1': 'rgba(56, 189, 248, 0.05)', 
  'question2': 'rgba(168, 85, 247, 0.05)', 
  'question3': 'rgba(16, 185, 129, 0.05)', 
  'question4': 'rgba(184, 151, 58, 0.12)',  
  'question5': 'rgba(255, 255, 255, 0.05)', 
};

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

  const [selectedPractice, setSelectedPractice] = useState<'example' | 'journal' | null>(null);

  // Reset selection when question changes
  useEffect(() => {
    setSelectedPractice(null);
  }, [activeQuestionId]);

  const tabs = [
    { 
      id: 'video' as const, 
      label: 'Watch Guidance', 
      icon: <Youtube className="w-3.5 h-3.5" />, 
      field: 'video' as keyof QuestionProgress,
      comingSoon: !QUESTION_VIDEOS[activeQuestionId]
    },
    { 
      id: 'explanation' as const, 
      label: 'Soul Lessons', 
      icon: <Sparkles className="w-3.5 h-3.5" />, 
      field: 'read' as keyof QuestionProgress 
    },
    { 
      id: 'practice' as const, 
      label: 'Practice Room', 
      icon: <ExternalLink className="w-3.5 h-3.5" />, 
      field: 'practice' as keyof QuestionProgress 
    },
  ];

  return (
    <div className={styles.container}>
      {/* ── Top Navigation Bar ── */}
      <header 
        className={styles.topBar}
        style={{ backgroundColor: QUESTION_THEMES[activeQuestionId] || 'var(--bg-surface)' }}
      >
        <div className={styles.chapterInfo}>
          <span className={styles.chapterSubtitle}>{activeChapter.subtitle}</span>
          <h2 className={styles.chapterTitle}>{activeChapter.title}</h2>
        </div>

        <nav className={styles.tabGroup}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setViewMode(tab.id);
                if (tab.id === 'practice') setSelectedPractice(null);
              }}
              className={cn(
                styles.tab,
                viewMode === tab.id && styles.tabActive
              )}
            >
              <div className="flex items-center gap-1.5 relative z-10">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.comingSoon && (
                  <span className="bg-amber-400/20 text-amber-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-amber-400/20 uppercase tracking-tighter">
                    Soon
                  </span>
                )}
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
              key={`exp-${activeQuestionId}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full"
            >
              {activeQuestionId === 'question1' && <Chap1Question1 onOpenJournal={onOpenJournal} />}
              {activeQuestionId === 'question2' && <Chap1Question2 onOpenJournal={onOpenJournal} />}
              {activeQuestionId === 'question3' && <Chap1Question3 onOpenJournal={onOpenJournal} />}
              {activeQuestionId === 'question4' && <Chap1Question4 />}
              {activeQuestionId === 'question5' && <Chap1Question5 onOpenJournal={onOpenJournal} />}
            </motion.div>
          )}

          {/* PRACTICE VIEW — Selection or Journal */}
          {viewMode === 'practice' && (
            <motion.div
              key={`prac-${activeQuestionId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full h-[calc(100vh-56px)] overflow-hidden bg-[var(--bg-main)]"
            >
              {activeQuestionId === 'question4' && !selectedPractice ? (
                <div className="h-full flex flex-col items-center justify-center p-8 space-y-12">
                  <div className="text-center space-y-4">
                    <h3 className="text-4xl font-serif font-light text-[var(--text-primary)]">Cultivating The Observer</h3>
                    <p className="text-sm text-[var(--text-secondary)] italic font-serif">Two paths to deepen your presence.</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <button 
                      onClick={() => setSelectedPractice('example')}
                      className="group relative p-10 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] transition-all duration-500 overflow-hidden text-left"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Sparkles size={120} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)] mb-4 block">Practice 01</span>
                      <h4 className="text-2xl font-serif font-light mb-4 group-hover:translate-x-1 transition-transform">Relational Witnessing</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed opacity-70">
                        Explore how the mind weaves stories during social friction and learn to watch the tightness rather than being it.
                      </p>
                    </button>

                    <button 
                      onClick={() => setSelectedPractice('journal')}
                      className="group relative p-10 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)] transition-all duration-500 overflow-hidden text-left"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock size={120} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)] mb-4 block">Practice 02</span>
                      <h4 className="text-2xl font-serif font-light mb-4 group-hover:translate-x-1 transition-transform">5-Min Thought Journal</h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed opacity-70">
                        A timed stream-of-consciousness capture to classify thoughts as Value, Cost, or simply Witnessed.
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                <ThoughtJournal 
                  inline 
                  defaultTab={selectedPractice || 'example'} 
                  onClose={() => setSelectedPractice(null)} 
                />
              )}
            </motion.div>
          )}

          {/* VIDEO VIEW */}
          {viewMode === 'video' && (
            <VideoPlayerView 
              videoId={QUESTION_VIDEOS[activeQuestionId] || activeChapter.videoId} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
