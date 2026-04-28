import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FELT_EXPERIENCES } from '../../../data/feltExperiences';
import { cn } from '../../../lib/utils';

const SHORT_LABELS: Record<string, string> = {
  rejected: 'Feeling unseen',
  'self-doubt': 'Doubting myself',
  overwhelm: 'Overwhelmed',
  frustration: 'Frustrated',
  'not-enough': 'Not enough',
  control: 'Need control',
  'people-pleasing': 'People-pleasing',
  numbness: 'Numb & flat',
  'inner-critic': 'Inner critic',
};

const MOOD_PROMPTS: Record<string, string> = {
  rejected: 'What happened that made you feel that way?',
  'self-doubt': "What's the thought that keeps coming back?",
  overwhelm: 'What feels like too much right now?',
  frustration: "What's blocking you or going wrong?",
  'not-enough': 'Where does "not enough" feel most true today?',
  control: 'What feels most uncertain or out of your hands?',
  'people-pleasing': 'Whose approval are you most afraid of losing?',
  numbness: 'When did you last feel something strongly?',
  'inner-critic': 'What is the voice saying most loudly?',
};

function deriveEmotions(thoughts: string[]): string[] {
  const set = new Set<string>();
  FELT_EXPERIENCES.forEach(fe => {
    if (fe.thoughts.some(t => thoughts.includes(t))) {
      fe.emotions.forEach(e => set.add(e));
    }
  });
  return Array.from(set);
}

interface MoodGridProps {
  selectedThoughts: string[];
  onSelectionChange: (thoughts: string[], emotions: string[]) => void;
}

export function MoodGrid({ selectedThoughts, onSelectionChange }: MoodGridProps) {
  const [selectedMoods, setSelectedMoods] = useState<Set<string>>(() => {
    const s = new Set<string>();
    FELT_EXPERIENCES.forEach(fe => {
      if (fe.thoughts.some(t => selectedThoughts.includes(t))) s.add(fe.id);
    });
    return s;
  });

  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set(selectedThoughts));

  const [focusMoodId, setFocusMoodId] = useState<string | null>(() => {
    const restored = FELT_EXPERIENCES.find(fe => fe.thoughts.some(t => selectedThoughts.includes(t)));
    return restored?.id ?? null;
  });

  const focusMood = useMemo(
    () => FELT_EXPERIENCES.find(fe => fe.id === focusMoodId) ?? null,
    [focusMoodId]
  );

  // Auto-scroll the focus panel into view when a mood is tapped
  const focusPanelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusMoodId && focusPanelRef.current) {
      setTimeout(() => {
        focusPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 120);
    }
  }, [focusMoodId]);

  const toggleMood = (fe: typeof FELT_EXPERIENCES[number]) => {
    setSelectedMoods(prev => {
      const next = new Set(prev);
      if (next.has(fe.id)) {
        next.delete(fe.id);
        const stillNeeded = new Set<string>();
        FELT_EXPERIENCES.forEach(f => { if (next.has(f.id)) f.thoughts.forEach(t => stillNeeded.add(t)); });
        setSelectedChips(prev2 => {
          const c = new Set(prev2);
          fe.thoughts.forEach(t => { if (!stillNeeded.has(t)) c.delete(t); });
          onSelectionChange(Array.from(c), deriveEmotions(Array.from(c)));
          return c;
        });
        const remaining = Array.from(next);
        setFocusMoodId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
      } else {
        next.add(fe.id);
        setSelectedChips(prev2 => {
          const c = new Set(prev2);
          if (fe.thoughts[0]) c.add(fe.thoughts[0]);
          onSelectionChange(Array.from(c), deriveEmotions(Array.from(c)));
          return c;
        });
        setFocusMoodId(fe.id);
      }
      return next;
    });
  };

  const toggleChip = (t: string) => {
    setSelectedChips(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      onSelectionChange(Array.from(next), deriveEmotions(Array.from(next)));
      return next;
    });
  };

  return (
    <div className="space-y-5 w-full max-w-4xl mx-auto px-1">

      {/* ── Compact 3-col mood grid ── */}
      <div className="grid grid-cols-3 gap-3">
        {FELT_EXPERIENCES.map((fe, idx) => {
          const isOn = selectedMoods.has(fe.id);
          return (
            <motion.button
              key={fe.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleMood(fe)}
              className={cn(
                "relative flex flex-col items-center gap-2 px-2 py-4 rounded-[20px] border transition-all duration-300 text-center",
                isOn ? "shadow-md" : "hover:opacity-90"
              )}
              style={{
                background: isOn ? `linear-gradient(135deg, ${fe.color}20, ${fe.color}08)` : 'var(--bg-surface)',
                borderColor: isOn ? fe.color : 'var(--border-subtle)',
                boxShadow: isOn ? `0 6px 20px ${fe.color}18` : 'var(--shadow)',
              }}
            >
              {isOn && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                  style={{ background: fe.color }}
                >✓</motion.div>
              )}
              <span className="text-2xl leading-none">{fe.emoji}</span>
              <span
                className="font-sans text-[10px] sm:text-[11px] font-semibold text-center leading-tight"
                style={{ color: 'var(--text-main)', opacity: isOn ? 1 : 0.65 }}
              >
                {SHORT_LABELS[fe.id] || fe.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Focus detail panel — auto-scrolled into view on tap ── */}
      <AnimatePresence mode="wait">
        {focusMood && (
          <motion.div
            ref={focusPanelRef}
            key={focusMood.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
            className="rounded-[24px] p-6 sm:p-8 border"
            style={{
              background: `linear-gradient(to bottom right, var(--bg-surface), ${focusMood.color}06)`,
              borderColor: focusMood.color + '50',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{focusMood.emoji}</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: focusMood.color }}>
                {SHORT_LABELS[focusMood.id]}
              </p>
            </div>

            {/* Prompt */}
            <h3 className="font-sans font-semibold text-base md:text-lg mb-5 leading-snug" style={{ color: 'var(--text-main)' }}>
              "{MOOD_PROMPTS[focusMood.id] || 'What sounds most familiar?'}"
            </h3>

            {/* Thought chips */}
            <div className="flex flex-col gap-2">
              {focusMood.thoughts.map((thought, idx) => {
                const isOn = selectedChips.has(thought);
                return (
                  <motion.button
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    key={thought}
                    onClick={() => toggleChip(thought)}
                    className={cn(
                      "font-sans text-sm px-4 py-2.5 rounded-[14px] transition-all duration-250 border text-left",
                      isOn ? "shadow-sm" : "opacity-65 hover:opacity-90"
                    )}
                    style={{
                      borderColor: isOn ? focusMood.color : 'var(--border-subtle)',
                      color: 'var(--text-main)',
                      background: isOn ? focusMood.color + '12' : 'var(--bg-surface)',
                      fontWeight: isOn ? 600 : 400
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center transition-all"
                        style={{
                          background: isOn ? focusMood.color : 'transparent',
                          borderColor: isOn ? focusMood.color : 'var(--border-subtle)',
                        }}
                      >
                        {isOn && <Check size={9} className="text-white" />}
                      </div>
                      <span className="leading-snug">"{thought}"</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Emotion tags */}
            {focusMood.emotions.length > 0 && (
              <div className="flex items-center gap-2 mt-5 flex-wrap p-3 rounded-[16px]"
                style={{ border: '1px solid var(--border-subtle)', background: 'var(--bg-input)' }}>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                  Resonating with:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {focusMood.emotions.map(e => (
                    <span
                      key={e}
                      className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wide"
                      style={{
                        background: focusMood.color + '15',
                        border: `1px solid ${focusMood.color}30`,
                        color: focusMood.color,
                      }}
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-mood switcher (only shows when 2+ selected) */}
      {selectedMoods.size > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 flex-wrap justify-center pt-1"
        >
          {FELT_EXPERIENCES.filter(fe => selectedMoods.has(fe.id)).map(fe => (
            <button
              key={fe.id}
              onClick={() => setFocusMoodId(fe.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.12em] transition-all border",
                focusMoodId === fe.id ? "shadow-sm scale-105" : "opacity-50 hover:opacity-90"
              )}
              style={{
                background: focusMoodId === fe.id ? fe.color + '20' : 'var(--bg-surface)',
                borderColor: focusMoodId === fe.id ? fe.color : 'var(--border-subtle)',
                color: focusMoodId === fe.id ? fe.color : 'var(--text-muted)',
              }}
            >
              <span>{fe.emoji}</span>
              <span>{SHORT_LABELS[fe.id]}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function Check({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
