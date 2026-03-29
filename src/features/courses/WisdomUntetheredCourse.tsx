import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Play } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Chap1Question1 } from './wisdom-untethered/Chap1Question1';

interface Chapter {
  id: number;
  title: string;
  explanation: string;
  videoId: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    title: "Chapter 1: The Mind",
    explanation: "Chapter 1 of Wisdom Untethered explores one of the most fundamental insights in Singer's teachings: you are not your mind. The mind has a lower layer that reacts automatically based on past experiences, and a higher layer that can consciously redirect itself toward steadier ground. Singer teaches that you don't need to fight negative thoughts — you can use the mind as a tool, through affirmations and deliberate redirection, to lift yourself out of spiraling patterns. At the deepest level, the practice is even simpler: learn to relax in the face of whatever the mind is doing. When you stop feeding the reaction, the negativity gradually loses its grip. Freedom isn't about fixing the mind. It's about stopping the habit of letting it run your life.",
    videoId: "PLACEHOLDER"
  }
];

export function WisdomUntetheredCourse() {
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [activeInnerTab, setActiveInnerTab] = useState<'question1' | 'video'>('question1');

  const activeChapter = CHAPTERS.find(c => c.id === activeChapterId);

  // When Chapter 1 + Question 1 tab: go full-frame (no card, full width)
  const isFullFrame = activeChapter?.id === 1 && activeInnerTab === 'question1';

  return (
    <div className="flex h-full w-full overflow-hidden">

      {/* ── Slim Chapter Sidebar ── */}
      <div className={cn(
        "flex-shrink-0 flex flex-col border-r border-[var(--border-default)] bg-[var(--bg-surface)] transition-all duration-500",
        isFullFrame ? "w-14 items-center py-4 gap-3" : "w-72 lg:w-80 p-6 gap-4"
      )}>
        {!isFullFrame && (
          <h2 className="text-lg font-serif font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
            Wisdom Untethered
          </h2>
        )}

        {isFullFrame && (
          <div className="mb-2 mt-1">
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
        )}

        <div className={cn("flex flex-col overflow-y-auto", isFullFrame ? "gap-3 items-center w-full" : "gap-2")}>
          {CHAPTERS.map(chapter => (
            <button
              key={chapter.id}
              title={isFullFrame ? chapter.title : undefined}
              onClick={() => {
                setActiveChapterId(chapter.id);
                setActiveInnerTab('question1');
              }}
              className={cn(
                "transition-all duration-500 group flex items-center",
                isFullFrame
                  ? cn(
                      "w-10 h-10 rounded-full border justify-center flex-shrink-0",
                      activeChapterId === chapter.id
                        ? "border-[var(--accent-primary)] bg-[var(--bg-surface-hover)] shadow-[0_0_14px_var(--accent-primary)]"
                        : "border-[var(--border-default)] hover:border-[var(--accent-primary)]"
                    )
                  : cn(
                      "w-full text-left px-5 py-4 rounded-[20px] border gap-3",
                      activeChapterId === chapter.id
                        ? "bg-[var(--bg-surface-hover)] border-[var(--accent-primary)] shadow-[0_0_20px_var(--accent-primary)]"
                        : "bg-[var(--bg-surface)] border-[var(--border-default)] hover:border-[var(--border-glass)] hover:bg-[var(--bg-surface-hover)]"
                    )
              )}
            >
              {isFullFrame ? (
                <span className="text-[var(--accent-primary)] font-serif text-xs font-bold">
                  {chapter.id}
                </span>
              ) : (
                <>
                  <span className={cn(
                    "font-serif text-sm tracking-wide transition-colors flex-1",
                    activeChapterId === chapter.id
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                  )}>
                    {chapter.title}
                  </span>
                  {activeChapterId === chapter.id && (
                    <motion.div
                      layoutId="activeChapterDot"
                      className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]"
                    />
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Tab bar */}
        <div className="flex-shrink-0 flex items-center gap-8 px-6 border-b border-[var(--border-default)] bg-[var(--bg-surface)]/60 backdrop-blur-md z-20">
          {!isFullFrame && activeChapter && (
            <div className="mr-4 border-r border-[var(--border-subtle)] pr-8 py-4">
              <p className="text-sm font-serif font-light text-[var(--text-primary)] leading-none">{activeChapter.title}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)] mt-1">The Journey Within</p>
            </div>
          )}

          {[
            { id: 'question1', label: 'Question 1', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'video',     label: 'Video',      icon: <Play className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveInnerTab(tab.id as 'question1' | 'video')}
              className={cn(
                "py-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-bold transition-all relative",
                activeInnerTab === tab.id
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] opacity-60 hover:opacity-100"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {activeInnerTab === tab.id && (
                <motion.div
                  layoutId="innerTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)] rounded-t-full shadow-[0_-2px_8px_var(--accent-primary)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeInnerTab === 'question1' && activeChapter && (
              <motion.div
                key="question1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                {activeChapter.id === 1 ? (
                  <Chap1Question1 />
                ) : (
                  <div className="p-12 overflow-y-auto h-full">
                    <p className="text-[16px] leading-[2.2] font-sans text-[var(--text-secondary)] tracking-wide">
                      {activeChapter.explanation}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {activeInnerTab === 'video' && activeChapter && (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex flex-col gap-8 h-full p-10 overflow-y-auto"
              >
                <div className="aspect-video w-full rounded-[24px] overflow-hidden border border-[var(--border-default)] shadow-2xl relative bg-black">
                  <div className="absolute inset-0 bg-[#D16BA5]/5 blur-3xl pointer-events-none" />
                  <iframe
                    className="w-full h-full relative z-10"
                    src={`https://www.youtube.com/embed/${activeChapter.videoId}?rel=0`}
                    title={activeChapter.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="text-center text-[12px] uppercase tracking-[0.2em] text-[var(--accent-primary)] font-bold">
                  Watch the full lesson for {activeChapter.title.split(':')[0]}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
