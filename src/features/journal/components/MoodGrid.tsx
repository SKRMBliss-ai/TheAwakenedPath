import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FELT_EXPERIENCES } from '../../../data/feltExperiences';
import { useTheme } from '../../../theme/ThemeSystem';
import { cn } from '../../../lib/utils';

// Short card labels - cleaner for grid
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

// One gentle open-ended prompt per mood — shown after tapping the card
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

// Derive emotions from selected thoughts
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
  const { mode } = useTheme();
  
  // Which mood cards are on
  const [selectedMoods, setSelectedMoods] = useState<Set<string>>(() => {
    const s = new Set<string>();
    FELT_EXPERIENCES.forEach(fe => {
      if (fe.thoughts.some(t => selectedThoughts.includes(t))) s.add(fe.id);
    });
    return s;
  });

  // Which specific thought chips are checked
  const [selectedChips, setSelectedChips] = useState<Set<string>>(new Set(selectedThoughts));

  // The mood whose prompt + chips are currently showing
  const [focusMoodId, setFocusMoodId] = useState<string | null>(() => {
    const restored = FELT_EXPERIENCES.find(fe => fe.thoughts.some(t => selectedThoughts.includes(t)));
    return restored?.id ?? null;
  });

  const focusMood = useMemo(
    () => FELT_EXPERIENCES.find(fe => fe.id === focusMoodId) ?? null,
    [focusMoodId]
  );

  const toggleMood = (fe: typeof FELT_EXPERIENCES[number]) => {
    setSelectedMoods(prev => {
      const next = new Set(prev);
      if (next.has(fe.id)) {
        next.delete(fe.id);
        // Remove orphaned chips
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
    <div className="space-y-10 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {FELT_EXPERIENCES.map(fe => {
          const isOn = selectedMoods.has(fe.id);
          const isFocused = focusMoodId === fe.id;
          return (
            <motion.button
              key={fe.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggleMood(fe)}
              className={cn(
                "relative flex flex-col items-center gap-3 px-4 py-8 rounded-[32px] border transition-all duration-300",
                isOn ? "shadow-md ring-1" : "hover:bg-[var(--bg-input)]"
              )}
              style={{
                background: isOn ? fe.color + '15' : 'var(--bg-surface)',
                borderColor: isOn ? fe.color : 'var(--border-subtle)',
                boxShadow: isOn ? `0 8px 24px ${fe.color}15` : 'none',
                ringColor: isOn ? fe.color + '30' : 'transparent',
              }}
            >
              {isOn && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                  style={{ background: fe.color }}
                >✓</motion.div>
              )}
              <span className="text-4xl">{fe.emoji}</span>
              <span
                className="font-sans text-[12px] font-black uppercase tracking-widest text-[var(--text-main)]"
                style={{ opacity: isOn ? 1 : 0.6 }}
              >
                {SHORT_LABELS[fe.id] || fe.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {focusMood && (
          <motion.div
            key={focusMood.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[40px] p-10 border-2"
            style={{
              background: 'var(--bg-surface)',
              borderColor: focusMood.color + '40',
              boxShadow: `0 20px 40px ${focusMood.color}10`,
            }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4"
              style={{ color: focusMood.color }}>
              Exploring {SHORT_LABELS[focusMood.id] || focusMood.label}
            </p>

            <h3 className="font-serif text-3xl italic mb-8 text-[var(--text-main)] leading-relaxed">
              "{MOOD_PROMPTS[focusMood.id] || 'What sounds most familiar?'}"
            </h3>

            <div className="flex flex-wrap gap-4">
              {focusMood.thoughts.map(thought => {
                const isOn = selectedChips.has(thought);
                return (
                  <button
                    key={thought}
                    onClick={() => toggleChip(thought)}
                    className={cn(
                        "font-serif text-xl italic px-8 py-4 rounded-[24px] transition-all duration-300 border-2 text-left max-w-full",
                        isOn ? "shadow-md" : "opacity-70 hover:opacity-100"
                    )}
                    style={{
                      background: isOn ? focusMood.color + '15' : 'var(--bg-input)',
                      borderColor: isOn ? focusMood.color : 'transparent',
                      color: isOn ? focusMood.color : 'var(--text-primary)',
                    }}
                  >
                    {isOn && <span className="mr-3 font-sans not-italic font-black text-sm">✓</span>}
                    "{thought}"
                  </button>
                );
              })}
            </div>

            {focusMood.emotions.length > 0 && (
              <div className="flex items-center gap-3 mt-10 flex-wrap opacity-60">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  Identified emotions:
                </span>
                {focusMood.emotions.map(e => (
                  <span
                    key={e}
                    className="px-4 py-1.5 rounded-full text-xs font-bold"
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
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Mood Tabs (Shortcut) */}
      {selectedMoods.size > 1 && (
        <div className="flex gap-4 flex-wrap pt-4">
          {FELT_EXPERIENCES.filter(fe => selectedMoods.has(fe.id)).map(fe => (
            <button
              key={fe.id}
              onClick={() => setFocusMoodId(fe.id)}
              className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all border-2",
                  focusMoodId === fe.id ? "shadow-sm" : "opacity-50"
              )}
              style={{
                background: focusMoodId === fe.id ? fe.color + '20' : 'transparent',
                borderColor: focusMoodId === fe.id ? fe.color : 'var(--border-subtle)',
                color: focusMoodId === fe.id ? fe.color : 'var(--text-muted)',
              }}
            >
              <span>{fe.emoji}</span>
              <span>{SHORT_LABELS[fe.id]}</span>
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
