import { useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCourseTracking } from '../../hooks/useCourseTracking';
import { EMOTION_COURSE_ID } from '../courses/EmotionFeelingsCourseView';

/**
 * The set of completed lesson ids across all three courses.
 *
 * Each course already records its own progress in its own shape, so this
 * READS those records rather than introducing a fourth store:
 *
 *   Power of Now        users/{uid}/progress/powerOfNow → { watched: [partId] }
 *   Wisdom Untethered   useCourseTracking(uid)          → { [questionId]: {...} }
 *   Feelings & Emotions useCourseTracking(uid, course)  → { [lessonId]: {...} }
 *
 * Writing a separate completion record would mean two sources that could
 * disagree, and the older one would win half the time.
 */
export function useCurriculumProgress(uid: string | null | undefined): Set<string> {
  const [powerOfNow, setPowerOfNow] = useState<string[]>([]);
  const { progress: wisdom = {} } = useCourseTracking(uid);
  const { progress: emotion = {} } = useCourseTracking(uid, EMOTION_COURSE_ID);

  useEffect(() => {
    if (!uid) { setPowerOfNow([]); return; }
    return onSnapshot(
      doc(db, 'users', uid, 'progress', 'powerOfNow'),
      (snap) => setPowerOfNow(snap.exists() ? (snap.data().watched ?? []) : []),
      () => setPowerOfNow([]),
    );
  }, [uid]);

  return useMemo(() => {
    const done = new Set<string>(powerOfNow);

    // A Wisdom question counts as done once any of its steps is complete —
    // matching how the course itself shows a question as started.
    Object.entries(wisdom).forEach(([id, rec]) => {
      const r = rec as { read?: boolean; practice?: boolean; video?: boolean };
      if (r?.read || r?.practice || r?.video) done.add(id);
    });

    // An emotions lesson is done when its video is watched — the same signal
    // the course view uses for its own "watched N / M" count.
    Object.entries(emotion).forEach(([id, rec]) => {
      if ((rec as { video?: boolean })?.video) done.add(id);
    });

    return done;
  }, [powerOfNow, wisdom, emotion]);
}
