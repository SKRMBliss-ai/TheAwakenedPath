import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Play, ChevronLeft, ChevronRight } from 'lucide-react';
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

type ViewMode = 'explanation' | 'video';

interface Question {
  id: string;
  label: string;
}

const CHAPTER_QUESTIONS: Record<number, Question[]> = {
  1: [
    { id: 'question1', label: 'Question 1' },
    { id: 'question2', label: 'Question 2' },
  ]
};

export function WisdomUntetheredCourse() {
  const [activeChapterId, setActiveChapterId] = useState<number>(1);
  const [activeQuestionId, setActiveQuestionId] = useState<string>('question1');
  const [viewMode, setViewMode] = useState<ViewMode>('explanation');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeChapter = CHAPTERS.find(c => c.id === activeChapterId);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[var(--bg-base)]">

      {/* ── Sidebar ── */}
      <motion.div
        animate={{ width: sidebarCollapsed ? 64 : 280 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 flex flex-col border-r border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden relative z-10"
      >
        {/* Sidebar header */}
        <div className={cn(
          "flex items-center border-b border-[var(--border-default)] transition-all duration-300",
          sidebarCollapsed ? "justify-center px-0 py-4 h-[60px]" : "justify-between px-5 h-[60px]"
        )}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)] flex-shrink-0" />
              <span className="text-[11px] uppercase tracking-[0.25em] font-bold text-[var(--text-muted)]">
                Wisdom Untethered
              </span>
            </motion.div>
          )}
          {sidebarCollapsed && (
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          )}
        </div>

        {/* Chapter list */}
        <div className="flex-1 overflow-y-auto py-4 px-2 flex flex-col gap-1">
          {CHAPTERS.map(chapter => (
            <div key={chapter.id} className="flex flex-col gap-1">
              <button
                title={sidebarCollapsed ? `${chapter.subtitle}: ${chapter.title}` : undefined}
                onClick={() => {
                  setActiveChapterId(chapter.id);
                  setActiveQuestionId('question1');
                  setViewMode('explanation');
                }}
                className={cn(
                  "group w-full flex items-center transition-all duration-200 rounded-2xl border text-left",
                  sidebarCollapsed
                    ? "justify-center h-10 w-10 mx-auto px-0"
                    : "gap-3 px-4 py-3",
                  activeChapterId === chapter.id
                    ? "bg-[var(--bg-surface-hover)] border-[var(--accent-primary)] shadow-[0_0_16px_-2px_var(--accent-primary)]"
                    : "border-transparent hover:border-[var(--border-default)] hover:bg-[var(--bg-surface-hover)]"
                )}
              >
                {/* Chapter number badge */}
                <div className={cn(
                  "flex-shrink-0 rounded-full flex items-center justify-center font-serif font-bold transition-all",
                  sidebarCollapsed ? "w-7 h-7 text-xs" : "w-8 h-8 text-sm",
                  activeChapterId === chapter.id
                    ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                    : "bg-[var(--border-default)] text-[var(--text-muted)] group-hover:bg-[var(--accent-primary)]/10 group-hover:text-[var(--accent-primary)]"
                )}>
                  {chapter.id}
                </div>

                {!sidebarCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      "text-[10px] uppercase tracking-[0.2em] font-bold transition-colors",
                      activeChapterId === chapter.id ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
                    )}>
                      {chapter.subtitle}
                    </span>
                    <span className={cn(
                      "text-[13px] font-serif truncate transition-colors mt-0.5",
                      activeChapterId === chapter.id ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                    )}>
                      {chapter.title}
                    </span>
                  </div>
                )}
              </button>

              {/* Sub-items (Questions) */}
              {!sidebarCollapsed && activeChapterId === chapter.id && (
                <div className="flex flex-col gap-1 pl-11 pr-2 pb-2">
                  {CHAPTER_QUESTIONS[chapter.id]?.map(q => (
                    <button
                      key={q.id}
                      onClick={() => {
                        setActiveQuestionId(q.id);
                        setViewMode('explanation');
                      }}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-[0.15em] transition-all",
                        activeQuestionId === q.id && viewMode === 'explanation'
                          ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                      )}
                    >
                      <BookOpen className="w-3 h-3 opacity-70" />
                      <span className="truncate">{q.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Collapse toggle at bottom */}
        <div className="flex-shrink-0 border-t border-[var(--border-default)] p-3 flex justify-end">
          <button
            onClick={() => setSidebarCollapsed(prev => !prev)}
            className="w-8 h-8 rounded-xl flex items-center justify-center border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-glass)] hover:bg-[var(--bg-surface-hover)] transition-all"
          >
            {sidebarCollapsed
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <ChevronLeft className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </motion.div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar: Chapter title + Tabs */}
        <div className="flex-shrink-0 h-[60px] flex items-center gap-0 px-6 border-b border-[var(--border-default)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
          {/* Chapter label */}
          {activeChapter && (
            <div className="flex flex-col justify-center mr-8 pr-8 border-r border-[var(--border-default)] h-full">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[var(--text-muted)]">
                {activeChapter.subtitle}
              </span>
              <span className="text-[14px] font-serif text-[var(--text-primary)] mt-0.5 leading-none">
                {activeChapter.title}
              </span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 h-full">
            {[
              { id: 'explanation' as ViewMode, label: 'Explanation', icon: <BookOpen className="w-3.5 h-3.5" /> },
              { id: 'video' as ViewMode,       label: 'Video',       icon: <Play className="w-3.5 h-3.5" /> },
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
                <span>{tab.label}</span>
                {viewMode === tab.id && (
                  <motion.div
                    layoutId="tabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)] rounded-t-full shadow-[0_-1px_8px_var(--accent-primary)]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {viewMode === 'explanation' && activeChapter && (
              <motion.div
                key={activeQuestionId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="w-full h-full"
              >
                {activeChapter.id === 1 ? (
                  activeQuestionId === 'question1' ? <Chap1Question1 /> : <Chap1Question2 />
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
                className="flex flex-col items-center justify-center gap-8 h-full p-10 overflow-y-auto"
              >
                <div className="w-full max-w-3xl">
                  <div className="aspect-video w-full rounded-[20px] overflow-hidden border border-[var(--border-default)] shadow-2xl relative bg-black">
                    <div className="absolute inset-0 bg-[var(--accent-primary)]/5 blur-3xl pointer-events-none" />
                    <iframe
                      className="w-full h-full relative z-10"
                      src={`https://www.youtube.com/embed/${activeChapter.videoId}?rel=0`}
                      title={activeChapter.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-center text-[11px] uppercase tracking-[0.22em] text-[var(--accent-primary)] font-bold mt-5 opacity-70">
                    Full lesson — {activeChapter.subtitle}: {activeChapter.title}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
