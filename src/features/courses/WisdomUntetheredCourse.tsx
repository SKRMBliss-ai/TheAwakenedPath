import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Play, Sparkles, Flame } from 'lucide-react';
import styles from './CourseTabs.module.css';
import { cn } from '../../lib/utils';
import { Chap1Question1 } from './wisdom-untethered/Chap1Question1';
import { Chap1Question2 } from './wisdom-untethered/Chap1Question2';
import { Chap1Question3 } from './wisdom-untethered/Chap1Question3';
import { Chap1Question4 } from './wisdom-untethered/Chap1Question4';

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
  'question3': 'hNImvYFpx00',
  'question4': 'mIscD_Yd48E',
};

const QUESTION_CONTENT: Record<string, { heading: string, text: string }> = {
  'question1': {
    heading: "Deconstructing the Voice",
    text: "Chapter 1 of Wisdom Untethered explores one of the most fundamental insights in Singer's teachings: you are not your mind. The mind has a lower layer that reacts automatically based on past experiences, and a higher layer that can consciously redirect itself toward steadier ground. Singer teaches that you don't need to fight negative thoughts — you can use the mind as a tool, through affirmations and deliberate redirection, to lift yourself out of spiraling patterns. At the deepest level, the practice is even simpler: learn to relax in the face of whatever the mind is doing. Freedom isn't about fixing the mind. It's about stopping the habit of letting it run your life."
  },
  'question2': {
    heading: "Witnessing the Narrator",
    text: "In Question 2, we dive into the nature of the constant internal narrator. Michael Singer explains that the voice in your head is not trying to help you; it is simply generating noise to create an illusion of control over a world it cannot actually manage. The practice here is not to silence the voice, but to step back into the seat of the Witness—the one who is aware of the noise without being consumed by it. Once you recognize that you are the listener, not the radio, the grip of the mind naturally begins to loosen through simple awareness."
  },
  'question3': {
    heading: "The Wider Frame",
    text: "Question 3 explores the shift from our narrow, personal frame to the vast, impersonal one. The personal mind is absorbed in individual desires and fears, filtering everything through the question: 'How does this affect me?' Singer teaches that there is a much larger frame available—the perspective of being a conscious awareness on a spinning planet in a vast universe. This shift isn't a spiritual achievement, but a practical redirection of attention that brings immediate perspective. One second of genuine cosmic perspective is often worth an hour of anxious thinking."
  },
  'question4': {
    heading: "Residing in the Center",
    text: "In Question 4, we explore the culmination of the teaching: living from the stable center of your being. This stage moves beyond managing the mind to residing as the one who witnesses everything. By consistently choosing to stay 'behind' the voice rather than following it into the world of form, you discover a Clarity that remains untouched by internal or external storms. The ultimate goal is not to have better thoughts, but to realize the presence of the one who is witnessing the thoughts. Standing in this center is where true, untethered freedom actually resides."
  }
};

interface CourseProps {
  activeQuestionId: string;
  viewMode: 'explanation' | 'practice' | 'video';
  setViewMode: (mode: 'explanation' | 'practice' | 'video') => void;
  onOpenJournal?: () => void;
  onNavigateToPractice?: () => void;
}

export function WisdomUntetheredCourse({ 
  activeQuestionId, 
  viewMode, 
  setViewMode,
  onOpenJournal,
  onNavigateToPractice
}: CourseProps) {
  // Always Chapter 1 for this coarse for now
  const activeChapter = useMemo(() => CHAPTERS[0], []);
  const currentContent = useMemo(() => 
    QUESTION_CONTENT[activeQuestionId] || { heading: "Deconstructing the Mind", text: activeChapter.explanation }, 
  [activeQuestionId, activeChapter.explanation]);

  const tabs = [
    { id: 'explanation' as const, label: 'Explanation', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'video' as const,       label: 'Video',       icon: <Play className="w-3.5 h-3.5" /> },
    { id: 'practice' as const,    label: 'Practice',    icon: <BookOpen className="w-3.5 h-3.5" /> },
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

          {/* PRACTICE VIEW (Core Insights Text) */}
          {viewMode === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={styles.explanationView}
            >
              <div className={styles.explanationInner}>
                <span className={styles.explanationTag}>Initial Inquiry</span>
                <h3 className={styles.explanationHeading}>
                  {currentContent.heading}
                </h3>
                <p className={styles.explanationText}>
                  {currentContent.text}
                </p>

                <div className={styles.explanationAction}>
                  <button 
                    onClick={onNavigateToPractice}
                    className={styles.practiceBtn}
                  >
                    <Flame size={16} />
                    Transform a Situation
                  </button>
                  <button 
                    onClick={() => setViewMode('explanation')}
                    className={cn(styles.practiceBtn, "opacity-60 bg-transparent border-white/10 hover:bg-white/5")}
                  >
                    <Sparkles size={16} />
                    View Slides
                  </button>
                </div>
              </div>
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
