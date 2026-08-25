import { useCallback, useEffect, useMemo, useState } from 'react';
import { arrayRemove, arrayUnion, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCourseTracking } from '../../hooks/useCourseTracking';
import { EMOTION_COURSE_ID } from '../courses/EmotionFeelingsCourseView';
import { CURRICULUM } from './curriculum';

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
  const [school, setSchool] = useState<string[]>([]);
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

  // The School lessons live in the Skool classroom, so there is nothing to
  // observe — this record IS the completion, written by the manual tick.
  useEffect(() => {
    if (!uid) { setSchool([]); return; }
    return onSnapshot(
      doc(db, 'users', uid, 'progress', 'innerJourney'),
      (snap) => setSchool(snap.exists() ? (snap.data().watched ?? []) : []),
      () => setSchool([]),
    );
  }, [uid]);

  return useMemo(() => {
    const done = new Set<string>([...powerOfNow, ...school]);

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
  }, [powerOfNow, school, wisdom, emotion]);
}

/**
 * Mark a curriculum lesson studied, or un-mark it.
 *
 * Completion is READ from three different stores, so it has to be WRITTEN
 * back to whichever store owns the lesson — writing to a fourth "curriculum"
 * doc would make the tick disagree with the course itself the moment either
 * one changed.
 */
export function useLessonToggle(uid: string | null | undefined) {
  const { updateProgress: updateWisdom } = useCourseTracking(uid);
  const { updateProgress: updateEmotion } = useCourseTracking(uid, EMOTION_COURSE_ID);

  return useCallback(async (lessonId: string, done: boolean) => {
    if (!uid) return;
    const stage = CURRICULUM.find((s) => s.lessons.some((l) => l.id === lessonId));
    if (!stage) return;

    if (stage.source === 'powerOfNow' || stage.source === 'innerJourney') {
      const docId = stage.source === 'powerOfNow' ? 'powerOfNow' : 'innerJourney';
      await setDoc(
        doc(db, 'users', uid, 'progress', docId),
        { watched: done ? arrayUnion(lessonId) : arrayRemove(lessonId) },
        { merge: true },
      );
      return;
    }

    // A Wisdom question counts as done if ANY step is set, so un-marking has
    // to clear all three — clearing only `video` would leave it still "done".
    const update = stage.source === 'emotionCourse' ? updateEmotion : updateWisdom;
    await update(lessonId, done
      ? { video: true }
      : { read: false, practice: false, video: false });
  }, [uid, updateWisdom, updateEmotion]);
}
