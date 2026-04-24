import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Youtube, CheckCircle2, Circle, ExternalLink, Music } from 'lucide-react';
import styles from './CourseTabs.module.css';
import { cn } from '../../lib/utils';
import { Chap1Question1 } from './wisdom-untethered/Chap1Question1';
import { Chap1Question2 } from './wisdom-untethered/Chap1Question2';
import { Chap1Question3 } from './wisdom-untethered/Chap1Question3';
import { Chap1Question4 } from './wisdom-untethered/Chap1Question4';
import { Chap1Question5 } from './wisdom-untethered/Chap1Question5';
import { Chap1Question6 } from './wisdom-untethered/Chap1Question6';
import { Chap1Question7 } from './wisdom-untethered/Chap1Question7';
import { Chap1Question8 } from './wisdom-untethered/Chap1Question8';
import { Chap1Question9 } from './wisdom-untethered/Chap1Question9';
import { useCourseTracking, type QuestionProgress } from '../../hooks/useCourseTracking';
import { useAuth } from '../auth/AuthContext';
import { ScrollNavigator } from '../../components/ui/ScrollNavigator';
import { VoiceService } from '../../services/voiceService';

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
  'question6': null,
  'question7': null,
  'question8': null,
  'question9': null,
};

const QUESTION_MUSICAL_VIDEOS: Record<string, string | null> = {
  'question2': '-yxvAQs5Dgk',
  'question3': 'i8opqcWy71A',
};

interface CourseProps {
  activeQuestionId: string;
  viewMode: string;
  setViewMode: (mode: any) => void;
  onOpenJournal?: () => void;
  onNavigateToPractice?: () => void;
  onReturn?: () => void;
}

function VideoPlayerView({ videoId }: { videoId: string | null }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      VoiceService.pause();
    }
  }, [isPlaying]);

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
             <img 
               src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
               alt="Video Preview"
               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
             <button 
               onClick={() => setIsPlaying(true)}
               className="relative z-10 w-20 h-20 rounded-full bg-[var(--accent-primary)]/90 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--accent-primary)]"
             >
               <div className="ml-1 w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent" />
             </button>
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


export function WisdomUntetheredCourse({
  activeQuestionId,
  viewMode,
  setViewMode,
  onOpenJournal,
  onNavigateToPractice: _onNavigateToPractice,
  onReturn: _onReturn
}: CourseProps) {
  const activeChapter = useMemo(() => CHAPTERS[0], []);
  const { user: currentUser } = useAuth();
  const { progress = {}, updateProgress } = useCourseTracking(currentUser?.uid);

  // Auto-mark video or musical teaching as watched when tab is selected
  useEffect(() => {
    if (viewMode === 'video' && activeQuestionId) {
      updateProgress(activeQuestionId, { video: true });
    } else if (viewMode === 'musical' && activeQuestionId) {
      updateProgress(activeQuestionId, { musical: true });
    }
  }, [viewMode, activeQuestionId, updateProgress]);

  const tabs = [
    { 
      id: 'video' as const, 
      label: 'Watch Guidance', 
      icon: <Youtube className="w-7 h-7 sm:w-4 sm:h-4" />, 
      field: 'video' as keyof QuestionProgress,
      comingSoon: !QUESTION_VIDEOS[activeQuestionId]
    },
    ...(QUESTION_MUSICAL_VIDEOS[activeQuestionId] ? [{
      id: 'musical' as const,
      label: 'Musical Teaching',
      icon: <Music className="w-7 h-7 sm:w-4 sm:h-4" />,
      field: 'musical' as keyof QuestionProgress
    }] : []),
    { 
      id: 'explanation' as const, 
      label: 'Soul Lessons', 
      icon: <Sparkles className="w-7 h-7 sm:w-4 sm:h-4" />, 
      field: 'read' as keyof QuestionProgress 
    },
    { 
      id: 'practice' as const, 
      label: 'Practice Room', 
      icon: <ExternalLink className="w-7 h-7 sm:w-4 sm:h-4" />, 
      field: 'practice' as keyof QuestionProgress 
    },
  ];

  return (
    <div className={styles.container}>
      {/* ── Top Navigation Bar ── */}
      <header 
        className={styles.topBar}
      >
        <div className="flex items-center gap-6">
          {/* Return button removed to streamline UI */}
        </div>

        <nav className={styles.tabGroup}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'practice') {
                  _onNavigateToPractice?.();
                } else {
                  setViewMode(tab.id);
                }
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

      <ScrollNavigator key={activeQuestionId} selector=".scroll-container" />

      {/* ── Dynamic Content Area ── */}
      <main className={styles.contentArea}>
        <AnimatePresence mode="wait" initial={false}>
          {/* EXPLANATION VIEW */}
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
              {activeQuestionId === 'question4' && <Chap1Question4 onOpenJournal={onOpenJournal} />}
              {activeQuestionId === 'question5' && <Chap1Question5 onOpenJournal={onOpenJournal} />}
              {activeQuestionId === 'question6' && <Chap1Question6 onOpenJournal={onOpenJournal} />}
              {activeQuestionId === 'question7' && <Chap1Question7 onOpenJournal={onOpenJournal} />}
              {activeQuestionId === 'question8' && <Chap1Question8 onOpenJournal={onOpenJournal} />}
              {activeQuestionId === 'question9' && <Chap1Question9 onOpenJournal={onOpenJournal} />}
            </motion.div>
          )}

          {/* VIDEO VIEW */}
          {viewMode === 'video' && (
            <VideoPlayerView 
              videoId={QUESTION_VIDEOS[activeQuestionId] || activeChapter.videoId} 
            />
          )}

          {/* MUSICAL TEACHING VIEW */}
          {viewMode === 'musical' && (
            <VideoPlayerView 
              videoId={QUESTION_MUSICAL_VIDEOS[activeQuestionId]} 
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

