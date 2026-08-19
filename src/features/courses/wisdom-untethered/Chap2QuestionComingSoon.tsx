import { CourseHero } from './CourseHero';
import styles from './Chap1Question6.module.css';

interface Chap2QuestionComingSoonProps {
  question: number;
  onOpenJournal?: () => void;
}

// Placeholder "Soul Lessons" tab for Chapter 2 questions until their written
// slide content (like Chap1QuestionN.tsx) is provided. The video tab already
// works independently of this.
export function Chap2QuestionComingSoon({ question, onOpenJournal }: Chap2QuestionComingSoonProps) {
  return (
    <div className={styles.container} style={{ height: '100%', overflowY: 'auto' }}>
      <CourseHero
        chapter={2}
        question={question}
        title={<>Question {question}</>}
        subtitle="The written reflection for this question is being prepared."
      />
      <section className={styles.closing} data-section="1">
        <div className={styles.closingInner}>
          <span className={styles.slideTag}>Chapter 2 · Question {question}</span>
          <h2 className={styles.closingTitle}>Coming <em>Soon</em></h2>
          <p className={styles.slideP}>
            The guided video for this question is ready under "Watch Guidance" above.
            The written Soul Lessons walkthrough is on its way.
          </p>
          <button className={styles.closingButton} onClick={onOpenJournal}>Open Journal →</button>
        </div>
      </section>
    </div>
  );
}
