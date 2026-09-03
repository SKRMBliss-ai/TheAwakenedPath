import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChirpyBar } from './ChirpyBar';
import type { TeachSequence } from './content';

const FONT_DISPLAY = "'Baloo 2', 'Outfit', ui-rounded, system-ui, sans-serif";

/**
 * One line at a time, tap to advance — ported from the prototype's `teach`
 * screen and teachNext(). Reused for the eyes/camera-test explanations here,
 * and built to be reused again for the five closing teachings (not yet
 * wired up) without changes: both are "a short spoken sequence that ends in
 * one button", just with different content.
 */
export function TeachScreen({
  sequence, onDone, speak,
}: { sequence: TeachSequence; onDone: () => void; speak: (text: string) => void }) {
  const [i, setI] = useState(0);
  const last = i >= sequence.lines.length - 1;
  const line = sequence.lines[i];

  useEffect(() => { speak(line); }, [line, speak]);

  return (
    <div className="flex flex-col items-center text-center">
      <ChirpyBar pose={sequence.pose} size={i === 0 ? 'big' : 'md'} />
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.46 }}
          className="flex min-h-[150px] items-center text-[26px] font-medium leading-snug text-white"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {line}
        </motion.div>
      </AnimatePresence>
      <button
        onClick={() => (last ? onDone() : setI((n) => n + 1))}
        className="mt-3 w-full rounded-full font-semibold"
        style={{
          minHeight: 56,
          fontSize: 19,
          background: 'rgba(255,255,255,0.94)',
          color: '#241d3d',
          fontFamily: FONT_DISPLAY,
        }}
      >
        {last ? sequence.endLabel : 'Next'}
      </button>
    </div>
  );
}
