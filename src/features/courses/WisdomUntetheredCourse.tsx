import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Chap1Question1 } from './wisdom-untethered/Chap1Question1';
import { Chap1Question2 } from './wisdom-untethered/Chap1Question2';

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
    videoId: "PLACEHOLDER"
  }
];

interface CourseProps {
  activeQuestionId: string;
  viewMode: 'explanation' | 'video' | 'presentation';
  setViewMode: (mode: 'explanation' | 'video' | 'presentation') => void;
}

export function WisdomUntetheredCourse({ 
  activeQuestionId, 
  viewMode, 
  setViewMode 
}: CourseProps) {
  const [activeChapterId] = useState<number>(1);
  const activeChapter = CHAPTERS.find(c => c.id === activeChapterId);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--bg-base)]">
      {/* ── Top Bar ── */}
      <div className="flex-shrink-0 h-[60px] flex items-center justify-between px-6 border-b border-[var(--border-default)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
        {/* Chapter Title */}
        {activeChapter && (
          <div className="flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[var(--accent-primary)] mb-0.5">
              {activeChapter.subtitle}
            </span>
            <span className="text-[14px] font-serif text-[var(--text-primary)] leading-none line-clamp-1">
              {activeChapter.title}
            </span>
          </div>
        )}

        {/* View Mode Switching Tabs */}
        <div className="flex items-center gap-1 h-full">
          {[
            { id: 'explanation' as const, label: 'Explanation', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'video' as const,       label: 'Video',       icon: <Play className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 h-full text-[11px] uppercase tracking-[0.2em] font-bold transition-all",
                viewMode === tab.id
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-60 hover:opacity-100"
              )}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
              {viewMode === tab.id && (
                <motion.div
                  layoutId="tabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)] rounded-t-full shadow-[0_-1px_8px_var(--accent-primary)]"
                />
              )}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setViewMode('presentation')}
          className="flex items-center gap-2 px-5 py-2 rounded-full border border-[var(--brand-primary)] text-[var(--brand-primary)] text-[10px] uppercase tracking-[0.2em] font-bold shadow-sm hover:bg-[var(--brand-primary)] hover:text-white transition-all ml-4"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Present</span>
        </button>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {(viewMode === 'explanation' || viewMode === 'presentation') && activeChapter && (
            <motion.div
              key={activeQuestionId + (viewMode === 'presentation' ? '_present' : '_expl')}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="w-full h-full"
            >
              {activeChapter.id === 1 ? (
                activeQuestionId === 'question1' 
                  ? <Chap1Question1 isPresenting={viewMode === 'presentation'} onExitPresentation={() => setViewMode('explanation')} /> 
                  : <Chap1Question2 isPresenting={viewMode === 'presentation'} onExitPresentation={() => setViewMode('explanation')} />
              ) : (
                <div className="p-12 overflow-y-auto h-full">
                  <p className="text-[16px] leading-[2.2] font-sans text-[var(--text-secondary)] tracking-wide max-w-2xl">
                    {activeChapter.explanation}
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {viewMode === 'video' && activeChapter && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center gap-8 h-full p-6 sm:p-10 overflow-y-auto"
            >
              <div className="w-full max-w-4xl">
                <div className="aspect-video w-full rounded-[24px] overflow-hidden border border-[var(--border-default)] shadow-2xl relative bg-black">
                  <div className="absolute inset-0 bg-[var(--accent-primary)]/5 blur-3xl pointer-events-none" />
                  <iframe
                    className="w-full h-full relative z-10"
                    src={`https://www.youtube.com/embed/${activeChapter.videoId}?rel=0`}
                    title={activeChapter.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-center text-[11px] uppercase tracking-[0.22em] text-[var(--accent-primary)] font-bold mt-6 opacity-70">
                  Full lesson — {activeChapter.subtitle}: {activeChapter.title}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
