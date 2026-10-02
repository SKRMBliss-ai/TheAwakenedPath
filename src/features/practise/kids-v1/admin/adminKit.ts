import { useState } from 'react';
import { problemText } from '../kit/liveContentApi';

/* Helpers the admin pages share (components live in ui.tsx). */

export type Note = { tone: 'good' | 'warn' | 'bad'; text: string } | null;

/** Runs a save or delete, keeping the button busy and turning failures into a sentence. */
export function useBusy(): [boolean, Note, (job: () => Promise<string | void>) => Promise<boolean>, (n: Note) => void] {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note>(null);
  const run = async (job: () => Promise<string | void>) => {
    setBusy(true);
    setNote(null);
    try {
      const done = await job();
      if (done) setNote({ tone: 'good', text: done });
      return true;
    } catch (err) {
      setNote({ tone: 'bad', text: problemText(err) });
      return false;
    } finally {
      setBusy(false);
    }
  };
  return [busy, note, run, setNote];
}

/** A fresh id for something added on these pages. */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Firestore refuses `undefined`; a JSON round trip drops those keys. */
export function plain<T>(value: T): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
}
