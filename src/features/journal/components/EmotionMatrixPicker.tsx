import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  emotionsNear, quadrantOf, QUADRANT_COLOR, ENERGY_LABELS, PLEASANT_LABELS,
  type Axis,
} from '../../../data/emotionMatrix';

/**
 * The two-axis emotion picker. Instead of scanning 120 words, the person answers
 * two body-level questions — energy, then pleasantness — and the matrix narrows
 * to a short, precise list they tap from. Granularity without the wall.
 *
 * Selected words are added to (and removed from) the journal's existing
 * `selectedEmotions` string[], so this layers on top of the thought→emotion
 * mapping rather than replacing it: the felt-experience cards give a first
 * emotion, this refines it to the exact word.
 */
export function EmotionMatrixPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (emotions: string[]) => void;
}) {
  const [energy, setEnergy] = useState<Axis | null>(null);
  const [pleasant, setPleasant] = useState<Axis | null>(null);

  const words = energy && pleasant ? emotionsNear(energy, pleasant) : [];

  const toggle = (word: string) => {
    onChange(
      selected.includes(word)
        ? selected.filter((w) => w !== word)
        : [...selected, word],
    );
  };

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
        Name it precisely — two quick questions
      </p>

      {/* Q1 · Energy */}
      <AxisRow
        label="How much energy?"
        labels={ENERGY_LABELS}
        value={energy}
        onPick={(v) => setEnergy(v)}
      />

      {/* Q2 · Pleasantness — appears once energy is set, to keep it one thing at a time */}
      <AnimatePresence>
        {energy && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 overflow-hidden"
          >
            <AxisRow
              label="How pleasant?"
              labels={PLEASANT_LABELS}
              value={pleasant}
              onPick={(v) => setPleasant(v)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The narrowed word list */}
      <AnimatePresence>
        {words.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <p className="text-[11px] text-[var(--text-muted)] mb-2">
              Which is closest? Tap any that fit.
            </p>
            <div className="flex flex-wrap gap-2">
              {words.map((e) => {
                const active = selected.includes(e.word);
                const color = QUADRANT_COLOR[quadrantOf(e)];
                return (
                  <button
                    key={e.word}
                    onClick={() => toggle(e.word)}
                    className="rounded-full px-3.5 py-1.5 text-[13px] border transition-all active:scale-95"
                    style={{
                      borderColor: active ? 'transparent' : color + '66',
                      background: active ? color : 'transparent',
                      color: active ? '#1a1410' : 'var(--text-secondary)',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {e.word}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chosen words, always visible so a selection made earlier stays in sight */}
      {selected.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
          <p className="text-[11px] text-[var(--text-muted)] mb-1.5">You named:</p>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((w) => {
              const cell = words.find((e) => e.word === w);
              const color = cell ? QUADRANT_COLOR[quadrantOf(cell)] : 'var(--accent-primary)';
              return (
                <button
                  key={w}
                  onClick={() => toggle(w)}
                  className="rounded-full pl-3 pr-2 py-1 text-[12px] flex items-center gap-1"
                  style={{ background: color + '22', color: 'var(--text-primary)', border: `1px solid ${color}55` }}
                >
                  {w} <span className="opacity-60 text-[14px] leading-none">×</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AxisRow({
  label, labels, value, onPick,
}: {
  label: string;
  labels: string[];
  value: Axis | null;
  onPick: (v: Axis) => void;
}) {
  return (
    <div>
      <p className="text-[12px] text-[var(--text-secondary)] mb-1.5">{label}</p>
      <div className="grid grid-cols-5 gap-1.5">
        {labels.map((lab, i) => {
          const v = (i + 1) as Axis;
          const active = value === v;
          return (
            <button
              key={lab}
              onClick={() => onPick(v)}
              className="rounded-lg px-1 py-2 text-[10.5px] leading-tight border transition-all active:scale-95 text-center"
              style={{
                borderColor: active ? 'transparent' : 'var(--border-subtle)',
                background: active ? 'var(--accent-solid)' : 'var(--bg-surface)',
                color: active ? 'var(--on-accent)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
              }}
            >
              {lab}
            </button>
          );
        })}
      </div>
    </div>
  );
}
