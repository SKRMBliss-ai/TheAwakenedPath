/**
 * InfoTooltip.tsx
 *
 * A small ⓘ icon that opens a friendly popup explaining what a metric means.
 * Designed for 40-50s readers: large text, clear language, no jargon.
 *
 * Usage:
 *   <InfoTooltip title="Reflections" description="Each time you write or record..." />
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InfoTooltipProps {
  title: string;
  description: string;
  howCalculated?: string;
  className?: string;
}

export function InfoTooltip({ title, description, howCalculated, className = '' }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [direction, setDirection] = useState<'up' | 'down'>('up');

  // Detect if near top of viewport to flip direction
  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < 300) {
        setDirection('down');
      } else {
        setDirection('up');
      }
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-flex items-center ${className}`}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v); }}
        aria-label={`What is ${title}?`}
        className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
        style={{
          background: 'var(--accent-primary)15',
          border: '1px solid var(--accent-primary)30',
          color: 'var(--accent-primary)',
        }}
      >
        <Info size={11} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: direction === 'up' ? 8 : -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: direction === 'up' ? 8 : -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
               "absolute z-[100] right-0 w-64 min-w-[240px] rounded-2xl shadow-2xl",
               direction === 'up' ? "bottom-full mb-4 origin-bottom-right" : "top-full mt-4 origin-top-right"
            )}
            style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 12px 48px rgba(0,0,0,0.25), 0 0 0 1px var(--border-subtle)',
            }}
            role="dialog"
            aria-modal="false"
            aria-label={`About ${title}`}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 pt-4 pb-2 border-b"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--accent-primary)18', border: '1px solid var(--accent-primary)30' }}
                >
                  <Info size={12} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <p
                  className="text-[13px] font-bold"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}
                >
                  {title}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-6 h-6 rounded-full flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-3 space-y-2.5">
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)' }}
              >
                {description}
              </p>
              {howCalculated && (
                <div
                  className="rounded-xl px-3 py-2"
                  style={{ background: 'var(--accent-primary)08', border: '1px solid var(--accent-primary)20' }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent-primary)' }}>
                    How it's counted
                  </p>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {howCalculated}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
