import { useRef, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../auth/AuthContext';
import { usePracticeHistory, type PracticeDay } from './usePracticeDay';
import { usePracticeEntries } from './useSharedPractice';
import { useCurriculumProgress } from './useCurriculumProgress';

/**
 * Backup & restore.
 *
 * Everything here already lives in Firestore, so this is not the only copy of
 * anyone's practice — it exists so a member can hold their own reflections
 * outside the app, which is the point of a practice log that spans years.
 *
 * Restore MERGES rather than replaces. An import that overwrote the day
 * documents would silently destroy anything written since the backup was
 * taken, and the member would have no way to tell until they went looking.
 */

interface BackupFile {
  kind: 'mind-gym-practice-backup';
  version: 1;
  exportedAt: string;
  uid: string;
  practiceDays: PracticeDay[];
  entries: { kind: string; text: string; status?: string; createdAt?: string }[];
  completedLessons: string[];
}

function Card({ title, sub, children }: {
  title: string; sub?: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/50 p-5">
      <h2 className="text-[18px] font-serif font-light text-[var(--text-primary)]">{title}</h2>
      {sub && <p className="text-[13px] text-[var(--text-secondary)] mt-1 mb-4 leading-relaxed">{sub}</p>}
      {children}
    </div>
  );
}

export function BackupView() {
  const { user } = useAuth();
  const uid = user?.uid;
  const history = usePracticeHistory(uid, 2000);
  const { entries, loaded } = usePracticeEntries('all', uid);
  const completed = useCurriculumProgress(uid);

  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mine = entries.filter((e) => e.uid === uid);

  const download = () => {
    if (!uid) return;
    const payload: BackupFile = {
      kind: 'mind-gym-practice-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      uid,
      practiceDays: history,
      entries: mine.map((e) => ({
        kind: e.kind,
        text: e.text,
        status: e.status,
        createdAt: (e.createdAt as { toDate?: () => Date } | undefined)?.toDate?.().toISOString(),
      })),
      completedLessons: [...completed],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mind-gym-practice-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg(`Exported ${history.length} days and ${mine.length} entries.`);
  };

  const restore = async (file: File) => {
    if (!uid) return;
    setBusy(true);
    setMsg(null);
    try {
      const parsed = JSON.parse(await file.text()) as BackupFile;
      if (parsed.kind !== 'mind-gym-practice-backup' || !Array.isArray(parsed.practiceDays)) {
        setMsg('That does not look like a Mind Gym practice backup.');
        return;
      }
      const days = parsed.practiceDays.filter((d) => d && typeof d.date === 'string');
      if (!days.length) { setMsg('No practice days found in that file.'); return; }
      if (!window.confirm(
        `Merge ${days.length} day${days.length === 1 ? '' : 's'} into your log?\n\n`
        + 'Existing days are kept and filled in — nothing already recorded is removed.',
      )) return;

      for (const d of days) {
        await setDoc(doc(db, 'users', uid, 'practiceDays', d.date), d, { merge: true });
      }
      setMsg(`Restored ${days.length} days.`);
    } catch {
      setMsg('That file could not be read.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)]">Backup</span>
        <h1 className="text-2xl sm:text-3xl font-serif font-light text-[var(--text-primary)] mt-1">
          Backup &amp; restore
        </h1>
      </div>

      <Card
        title="Take a copy"
        sub="Your practice days, your insights and questions, and which lessons you have completed — as one JSON file you keep."
      >
        <button
          onClick={download}
          disabled={!uid}
          className="px-5 py-2.5 rounded-full text-[13px] font-bold bg-[var(--accent-solid)] text-[var(--on-accent)] disabled:opacity-40 hover:opacity-90"
        >
          Download backup
        </button>
      </Card>

      <Card
        title="Restore from a file"
        sub="Days are merged into your log, never replaced — anything you have written since the backup stays exactly as it is."
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) restore(f); }}
          disabled={!uid || busy}
          className="text-[13px] text-[var(--text-secondary)] file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:text-[12.5px] file:font-bold file:bg-[var(--bg-surface)] file:text-[var(--text-primary)]"
        />
        {busy && <p className="text-[12.5px] text-[var(--text-muted)] mt-2">Restoring…</p>}
      </Card>

      <Card title="Sync status">
        <dl className="space-y-2 text-[13px]">
          {([
            ['Signed in as', user?.email ?? user?.displayName ?? '—'],
            ['Practice days recorded', `${history.length}`],
            ['Insights & questions', loaded ? `${mine.length}` : '…'],
            ['Lessons completed', `${completed.size}`],
            ['Storage', 'Firestore — saved as you type, on every device'],
          ] as const).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-[var(--border-subtle)] pb-2 last:border-0">
              <dt className="text-[var(--text-muted)]">{k}</dt>
              <dd className="text-[var(--text-primary)] text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {msg && (
        <p className="text-[13px] text-[var(--done-accent)] px-1">{msg}</p>
      )}
    </div>
  );
}
