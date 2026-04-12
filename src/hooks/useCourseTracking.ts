import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface QuestionProgress {
  read: boolean;
  practice: boolean;
  video: boolean;
  musical?: boolean;
}

export interface CourseProgress {
  [questionId: string]: QuestionProgress;
}

export const useCourseTracking = (userId: string | undefined | null, courseId: string = 'wisdom-untethered') => {
  const [progress, setProgress] = useState<CourseProgress>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, 'users', userId, 'courseProgress', courseId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProgress(docSnap.data() as CourseProgress);
      } else {
        setProgress({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, courseId]);

  const updateProgress = useCallback(async (questionId: string, updates: Partial<QuestionProgress>) => {
    if (!userId) return;

    const docRef = doc(db, 'users', userId, 'courseProgress', courseId);
    const snap = await getDoc(docRef);
    const currentProgress = snap.exists() ? (snap.data() as CourseProgress) : {};
    const questionProg = currentProgress[questionId] || { read: false, practice: false, video: false };

    // Avoid unnecessary writes
    const hasChange = Object.entries(updates).some(([key, val]) => questionProg[key as keyof QuestionProgress] !== val);
    if (!hasChange) return;

    await setDoc(docRef, {
      ...currentProgress,
      [questionId]: {
        ...questionProg,
        ...updates
      }
    });
  }, [userId, courseId]);

  return { progress, updateProgress, loading };
};
