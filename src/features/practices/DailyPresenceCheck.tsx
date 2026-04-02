import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Sparkles, Brain, Eye } from 'lucide-react';
import { db } from '../../firebase';
import { doc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { cn } from '../../lib/utils';
import { WhisperInput } from '../../components/ui/SacredUI';

interface DailyPresenceCheckProps {
  userId: string;
 className?: string;
}

interface PracticeEntry {
  completed: boolean;
  timestamp: any;
  practices: string[];
  journalNote?: string;
}

export const DailyPresenceCheck = ({ userId, className }: DailyPresenceCheckProps) => {
  const [entry, setEntry] = useState<PracticeEntry | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [note, setNote] = useState('');

  const dateString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!userId) return;
    const docRef = doc(db, 'users', userId, 'dailyPractices', dateString);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as PracticeEntry;
        setEntry(data);
        if (data.journalNote && !note) {
          setNote(data.journalNote);
        }
      } else {
        setEntry(null);
      }
    });
    return unsub;
  }, [userId, dateString]);

  const togglePractice = async (practiceId: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    const docRef = doc(db, 'users', userId, 'dailyPractices', dateString);
    const currentPractices = entry?.practices || [];
    const newPractices = currentPractices.includes(practiceId)
      ? currentPractices.filter(p => p !== practiceId)
      : [...currentPractices, practiceId];

    try {
      await setDoc(docRef, {
        completed: newPractices.length > 0 || !!note.trim(),
        timestamp: Timestamp.now(),
        practices: newPractices,
      }, { merge: true });
    } catch (error) {
      console.error("Error updating practice:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const saveNote = async (val: string) => {
    setNote(val);
    const docRef = doc(db, 'users', userId, 'dailyPractices', dateString);
    try {
      await setDoc(docRef, {
        journalNote: val,
        completed: (entry?.practices.length || 0) > 0 || !!val.trim(),
        timestamp: Timestamp.now(),
      }, { merge: true });
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const practices = [
    { 
      id: 'not_answering', 
      label: 'The Practice of Not Answering', 
      sub: 'Q1: Witnessing the Inner Monologue',
      icon: Brain,
      color: 'text-indigo-400' 
    },
    { 
      id: 'watcher_identity', 
      label: 'The Watcher Identity', 
      sub: 'Q2: "I am the one who is aware"',
      icon: Eye,
      color: 'text-emerald-400' 
    }
  ];

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex items-center justify-between px-4">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--text-muted)] flex items-center gap-3">
          <Sparkles className="w-3 h-3" />
          Daily Presence Check
        </h4>
        {entry?.completed && (
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest animate-pulse">
            Centered for Today
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 px-2">
        {practices.map((p) => {
          const Icon = p.icon;
          const isDone = entry?.practices.includes(p.id);
          
          return (
            <motion.button
              key={p.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => togglePractice(p.id)}
              className={cn(
                "relative flex items-center gap-5 p-5 rounded-[28px] border transition-all duration-500 text-left overflow-hidden group",
                isDone 
                  ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30" 
                  : "bg-[var(--bg-surface)]/40 border-[var(--border-subtle)]/50 hover:bg-[var(--bg-surface-hover)]"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                isDone 
                  ? "bg-[var(--accent-primary)]/20 shadow-[0_0_20px_var(--glow-primary)]" 
                  : "bg-black/10"
              )}>
                <Icon className={cn("w-6 h-6", isDone ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")} />
              </div>

              <div className="flex-1">
                <h5 className={cn(
                  "text-[13px] font-serif font-bold transition-colors",
                  isDone ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                )}>
                  {p.label}
                </h5>
                <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1 opacity-70">
                  {p.sub}
                </p>
              </div>

              <div className="relative">
                {isDone ? (
                  <CheckCircle2 className="w-6 h-6 text-[var(--accent-primary)]" />
                ) : (
                  <Circle className="w-6 h-6 text-[var(--text-muted)] opacity-30" />
                )}
              </div>

              {/* Ambient Glow */}
              <AnimatePresence>
                {isDone && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)] to-transparent pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Journal Entry Part */}
      <div className="px-4 mt-4">
        <div className="p-8 rounded-[38px] bg-[var(--bg-surface)]/20 border border-[var(--border-subtle)]/30 relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Brain size={120} />
             </div>
             <WhisperInput 
                label="The Witness Journal"
                placeholder="What is the mind saying right now? Watch it..."
                multiline
                value={note}
                onChange={saveNote}
             />
             <p className="text-[9px] font-bold text-[var(--text-muted)] tracking-widest uppercase mt-6 opacity-40">
                Your thoughts are recorded as observations, not identity.
             </p>
        </div>
      </div>
    </div>
  );
};
