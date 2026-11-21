import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

interface StartHerePortalProps {
  onSelectAdult: (target?: 'dashboard' | 'workout') => void;
  onSelectKids: () => void;
  onSelectMantras: () => void;
  onSelectMusic?: () => void;
  userName?: string;
}

export function StartHerePortal({
  onSelectAdult,
  onSelectKids,
  onSelectMantras,
  userName,
}: StartHerePortalProps) {
  return (
    <div className="relative min-h-full w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 select-none">
      {/* ── Welcome Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
          <Sparkles size={13} />
          <span>Welcome to Soulful Studio</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] leading-[1.1] mb-3">
          {userName ? `Welcome, ${userName}` : 'Choose Your Sanctuary'}
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          Three complete spaces crafted for personal presence, child emotional growth, and sacred calm. Where would you like to begin today?
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* ── CARD 1: Adult Mind Gym ── */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-xl hover:border-amber-500/40 hover:shadow-2xl transition-all duration-300 group"
        >
          {/* Visual Header - Bigger Image */}
          <div className="relative h-72 sm:h-80 lg:h-[350px] w-full overflow-hidden bg-[#F7F1E6]">
            <img
              src="/marketing/adult-character-hero.webp"
              alt="Adult Mind Gym guide in serene presence"
              loading="lazy"
              className="w-full h-full object-contain sm:object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg-surface)] via-[var(--bg-surface)]/60 to-transparent pointer-events-none" />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold uppercase tracking-wider">
              <Heart size={12} className="text-rose-400" />
              <span>For You · Presence</span>
            </span>
          </div>

          {/* Card Body - Less Text */}
          <div className="flex-1 flex flex-col p-6 pt-3">
            <h2 className="font-serif text-2xl sm:text-3xl text-[var(--text-primary)] font-semibold mb-2">
              Adult Mind Gym
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
              Daily situation mind workouts, reflection journal, conscious breathwork &amp; deep life courses.
            </p>

            {/* Action */}
            <div className="mt-auto">
              <button
                type="button"
                onClick={() => onSelectAdult('dashboard')}
                className="w-full flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[var(--accent-primary)] text-[var(--bg-color)] font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-md active:scale-95 transition-all"
              >
                <span>Enter Adult Mind Gym</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </motion.article>

        {/* ── CARD 2: Kids Mind Gym ── */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-xl hover:border-amber-500/40 hover:shadow-2xl transition-all duration-300 group"
        >
          {/* Visual Header - Bigger Image */}
          <div className="relative h-72 sm:h-80 lg:h-[350px] w-full overflow-hidden bg-[#F7F1E6]">
            <img
              src="/marketing/kids/smily-boy-chirpy-hero.webp"
              alt="Smiling boy with Chirpy companion"
              loading="lazy"
              className="w-full h-full object-contain sm:object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg-surface)] via-[var(--bg-surface)]/60 to-transparent pointer-events-none" />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold uppercase tracking-wider">
              <Sparkles size={12} className="text-yellow-300" />
              <span>Ages 3–12 · Habits</span>
            </span>
          </div>

          {/* Card Body - Less Text */}
          <div className="flex-1 flex flex-col p-6 pt-3">
            <h2 className="font-serif text-2xl sm:text-3xl text-[var(--text-primary)] font-semibold mb-2">
              Kids Mind Gym
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
              Interactive feelings adventures, brave daily habits &amp; live Sunday classes with Sim Katyal.
            </p>

            {/* Action */}
            <div className="mt-auto">
              <button
                type="button"
                onClick={onSelectKids}
                className="w-full flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-[var(--accent-primary)] text-[var(--bg-color)] font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-md active:scale-95 transition-all"
              >
                <span>Explore Kids Mind Gym</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </motion.article>

        {/* ── CARD 3: Mantras and Meditation Music Soundscape ── */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col rounded-3xl border border-amber-500/35 bg-gradient-to-b from-amber-500/[0.04] to-[var(--bg-surface)] overflow-hidden shadow-xl hover:border-amber-400 hover:shadow-2xl transition-all duration-300 group"
        >
          {/* Visual Header - Bigger Image */}
          <div className="relative h-72 sm:h-80 lg:h-[350px] w-full overflow-hidden bg-[#F7F1E6]">
            <img
              src="/marketing/mantras/ganesha-hero-matched.webp"
              alt="Lord Ganesha in meditation on lotus"
              loading="lazy"
              className="w-full h-full object-contain sm:object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--bg-surface)] via-[var(--bg-surface)]/60 to-transparent pointer-events-none" />
            <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <span>ॐ Sacred Chanting</span>
            </span>
          </div>

          {/* Card Body - Less Text */}
          <div className="flex-1 flex flex-col p-6 pt-3">
            <h2 className="font-serif text-2xl sm:text-3xl text-[var(--text-primary)] font-semibold mb-2">
              Mantras &amp; Meditation
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
              Ad-free sacred Vedic chanting with automated 108 mala counting, evening aartis &amp; calm soundscapes.
            </p>

            {/* Action */}
            <div className="mt-auto">
              <button
                type="button"
                onClick={onSelectMantras}
                className="w-full flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-[#1C1409] font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-md active:scale-95 transition-all"
              >
                <span>Open Mantras Library</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </motion.article>

      </div>

      {/* ── Bottom note ── */}
      <p className="text-center text-xs text-[var(--text-muted)] mt-10">
        You can easily switch between any sanctuary anytime from the left navigation menu.
      </p>
    </div>
  );
}

export default StartHerePortal;

