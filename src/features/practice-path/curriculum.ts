import { QUESTION_META } from '../practices/questionMeta';
import { CHAPTERS } from '../presence-intelligence/teachingData';
import { LESSONS as EMOTION_LESSONS } from '../courses/EmotionFeelingsCourseView';
import { SCHOOL_CURRICULUM } from './schoolCurriculum';

/**
 * The Mind Gym curriculum — three courses, taken in order.
 *
 *   Power of Now  →  Wisdom Untethered  →  Feelings & Emotions
 *
 * Lesson ids are taken from each course's OWN data, not redefined here, so a
 * lesson added to a course shows up in the track automatically and the ids
 * always match the records those courses already write.
 *
 * Stage is DERIVED from which lessons are complete rather than stored. A
 * stored stage inevitably drifts out of step with the actual progress
 * records; deriving it means the badge can never lie.
 */

export interface CurriculumLesson {
  /** Matches the id the owning course uses in its own progress record. */
  id: string;
  title: string;
  tab: string;
  questionId?: string;
  /** Set for School lessons, which open in the Skool classroom. */
  href?: string;
}

export interface CurriculumStage {
  key: string;
  label: string;
  title: string;
  tab: string;
  lessons: CurriculumLesson[];
  /** Where this stage's completion records live. */
  source: 'powerOfNow' | 'courseTracking' | 'emotionCourse' | 'innerJourney';
}

// Power of Now — parts across all chapters. "Coming soon" parts have no video
// and can never be watched, so counting them would leave the stage permanently
// incomplete; they are excluded until they ship.
const powerOfNowLessons: CurriculumLesson[] = CHAPTERS.flatMap((ch: any) =>
  (ch.parts as any[])
    .filter((p) => p.youtubeId)
    .map((p) => ({ id: p.id as string, title: p.title as string, tab: 'intelligence' })),
);

const wisdomLessons: CurriculumLesson[] = Object.keys(QUESTION_META)
  .filter((k) => /^question\d+$/.test(k))
  .sort((a, b) => Number(a.replace('question', '')) - Number(b.replace('question', '')))
  .map((id) => ({ id, title: QUESTION_META[id].shortTitle, tab: 'wisdom_untethered', questionId: id }));

// Same rule for the emotions course: an unreleased episode is not a lesson
// someone has failed to do.
const emotionLessons: CurriculumLesson[] = EMOTION_LESSONS
  .filter((l) => l.videoId)
  .map((l) => ({ id: l.id, title: l.title, tab: 'emotion-course' }));

export const CURRICULUM: CurriculumStage[] = [
  {
    key: 'presence', label: 'Presence', title: 'The Power of Now',
    tab: 'intelligence', lessons: powerOfNowLessons, source: 'powerOfNow',
  },
  {
    key: 'wisdom', label: 'Wisdom', title: 'Wisdom Untethered',
    tab: 'wisdom_untethered', lessons: wisdomLessons, source: 'courseTracking',
  },
  {
    key: 'emotions', label: 'Emotions', title: 'Feelings & Emotions',
    tab: 'emotion-course', lessons: emotionLessons, source: 'emotionCourse',
  },
  // ── The Inner Journey School, carried in alongside the Mind Gym courses ──
  // These are external classroom lessons, so they are ticked by hand rather
  // than observed; see schoolCurriculum.ts.
  ...SCHOOL_CURRICULUM.map((stage) => ({
    key: stage.key,
    label: stage.label,
    title: stage.title,
    tab: 'school',
    lessons: stage.lessons.map((l) => ({
      id: l.id, title: l.title, tab: 'school', href: l.href,
    })),
    source: 'innerJourney' as const,
  })),
];

export interface StageStanding {
  stage: CurriculumStage;
  done: number;
  total: number;
  complete: boolean;
  active: boolean;
}

/**
 * Where the member stands. The active stage is the first incomplete one, so
 * finishing a stage advances the badge without anything being written.
 */
export function curriculumStanding(completedIds: Set<string>): {
  stages: StageStanding[];
  activeKey: string;
  allComplete: boolean;
} {
  let activeKey = '';
  const stages = CURRICULUM.map((stage) => {
    const done = stage.lessons.filter((l) => completedIds.has(l.id)).length;
    const complete = stage.lessons.length > 0 && done === stage.lessons.length;
    if (!complete && !activeKey) activeKey = stage.key;
    return { stage, done, total: stage.lessons.length, complete, active: false };
  });

  if (!activeKey) activeKey = CURRICULUM[CURRICULUM.length - 1].key;
  stages.forEach((s) => { s.active = s.stage.key === activeKey; });

  return { stages, activeKey, allComplete: stages.every((s) => s.complete) };
}

/** Badge text for the avatar — derived, never stored. */
export function stageBadge(activeKey: string, allComplete: boolean): string {
  if (allComplete) return 'Path complete';
  const idx = CURRICULUM.findIndex((s) => s.key === activeKey);
  const stage = CURRICULUM[idx];
  return stage ? `Stage ${idx + 1} · ${stage.label}` : 'Stage 1';
}
