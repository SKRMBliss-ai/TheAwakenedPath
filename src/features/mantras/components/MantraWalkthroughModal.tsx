import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Repeat, Sunrise, ListMusic, Moon, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { type Palette } from '../../../lib/siteTheme';
import { SERIF, SANS } from '../../../components/site/SiteChrome';
import { passPrice } from '../mantraData';

interface MantraWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: Palette;
}

const ORDER_PATH = '/pricing?select=mantra_lifetime_pass';
const BRAND_VIDEO = '/marketing/mantras/soulful-mantra-studio.mp4';

export const MantraWalkthroughModal: React.FC<MantraWalkthroughModalProps> = ({ isOpen, onClose, palette }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="walkthrough-modal-title"
            style={{
              background: palette.CARD,
              color: palette.INK,
              border: `1px solid ${palette.BORDER}`,
              fontFamily: SANS,
            }}
            className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto z-10 flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div
              style={{ borderBottom: `1px solid ${palette.BORDER}` }}
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            >
              <div>
                <span
                  style={{ color: palette.BROWN }}
                  className="text-[11px] font-extrabold uppercase tracking-[0.2em] block"
                >
                  Walkthrough & Guide
                </span>
                <h2
                  id="walkthrough-modal-title"
                  style={{ fontFamily: SERIF }}
                  className="text-2xl font-medium tracking-tight m-0"
                >
                  Inside the Mantra Pass
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                style={{
                  background: palette.BG2,
                  color: palette.INK2,
                  border: `1px solid ${palette.BORDER}`,
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Brand Video Player */}
              <div
                style={{
                  border: `1px solid ${palette.BORDER}`,
                  background: '#0B0907',
                }}
                className="relative aspect-video rounded-2xl overflow-hidden shadow-inner flex items-center justify-center"
              >
                <video
                  src={BRAND_VIDEO}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* What You Get Walkthrough */}
              <div>
                <h3
                  style={{ fontFamily: SERIF }}
                  className="text-xl font-medium mb-3"
                >
                  What changes in your daily practice
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      icon: Repeat,
                      title: 'Automatic Mala Counter',
                      desc: 'Counts every repetition with a gentle temple bell chime at 108.',
                    },
                    {
                      icon: Sunrise,
                      title: '21 & 40-Day Sankalp Tracker',
                      desc: 'Stay anchored with streak tracking and your daily discipline goal.',
                    },
                    {
                      icon: ListMusic,
                      title: 'Curated Puja Sequences',
                      desc: 'Diwali, Dhanteras, Chhath and morning prayers in sacred traditional order.',
                    },
                    {
                      icon: Moon,
                      title: 'Infinite Loop & Sleep Timer',
                      desc: 'Peaceful background audio with lock-screen controls and fade-out timer.',
                    },
                    {
                      icon: CheckCircle2,
                      title: '100% Ad-Free Sanctuary',
                      desc: 'No commercial interruptions, no clickbait feeds—pure sacred sound.',
                    },
                    {
                      icon: ShieldCheck,
                      title: 'Pay Once, Lifetime Access',
                      desc: `Just ${passPrice()} once. All future mantras added free. 14-day refund guarantee.`,
                    },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div
                      key={title}
                      style={{
                        background: palette.BG2,
                        border: `1px solid ${palette.BORDER}`,
                      }}
                      className="p-3.5 rounded-2xl flex items-start gap-3"
                    >
                      <div
                        style={{
                          background: palette.BAND,
                          color: palette.ON_BAND,
                        }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <strong className="block text-sm font-semibold leading-snug">
                          {title}
                        </strong>
                        <span
                          style={{ color: palette.INK2 }}
                          className="block text-xs leading-relaxed mt-0.5"
                        >
                          {desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Purchase CTA */}
            <div
              style={{
                borderTop: `1px solid ${palette.BORDER}`,
                background: palette.BG2,
              }}
              className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0"
            >
              <div>
                <p className="text-sm font-bold m-0">
                  Mantra Pass · {passPrice()} Once
                </p>
                <p
                  style={{ color: palette.INK2 }}
                  className="text-xs m-0"
                >
                  Pay once, keep forever. 14-day full refund guarantee.
                </p>
              </div>
              <a
                href={ORDER_PATH}
                style={{
                  background: palette.PURPLE_STRONG,
                  color: palette.ON_ACCENT,
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-sm font-bold tracking-wide text-center transition-transform hover:scale-[1.02] shadow-sm text-decoration-none inline-flex items-center justify-center gap-2"
              >
                Get the Mantra Pass — {passPrice()}
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
