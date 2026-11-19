import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface StartHerePortalProps {
  onSelectAdult: (target?: 'dashboard' | 'workout') => void;
  onSelectKids: () => void;
  onSelectMantras: () => void;
  onSelectMusic: () => void;
  userName?: string;
}

const CARDS = [
  {
    id: 'adult',
    kicker: 'For you',
    title: 'Adult Mind Gym',
    image: '/marketing/mind-gym-guide-namaste.webp',
    imageAlt: 'Adult Mind Gym guide in namaste',
    imageFit: 'cover' as const,
    glow: 'rgba(244, 196, 168, 0.38)',
    halo: 'rgba(201, 140, 120, 0.45)',
  },
  {
    id: 'kids',
    kicker: 'Ages 3–12',
    title: 'Kids Mind Gym',
    image: '/marketing/kids/hero-sim-diary.webp',
    imageAlt: 'Sim Katyal with son and kids daily diary',
    imageFit: 'cover' as const,
    glow: 'rgba(232, 196, 120, 0.4)',
    halo: 'rgba(255, 210, 120, 0.35)',
  },
  {
    id: 'mantras',
    kicker: 'Sacred chanting',
    title: 'Mantras & Music',
    image: '/marketing/mantras/exec-ce641b41-377a-428e-9ae9-53d82af4accf.png',
    backdrop: '/marketing/mantras/lotus-pedestal.webp',
    imageAlt: 'Sacred Om medallion',
    imageFit: 'contain' as const,
    glow: 'rgba(233, 201, 138, 0.55)',
    halo: 'rgba(255, 196, 90, 0.42)',
  },
] as const;

export function StartHerePortal({
  onSelectAdult,
  onSelectKids,
  onSelectMantras,
  onSelectMusic: _onSelectMusic,
  userName,
}: StartHerePortalProps) {
  const enter = (id: (typeof CARDS)[number]['id']) => {
    if (id === 'adult') onSelectAdult('dashboard');
    else if (id === 'kids') onSelectKids();
    else onSelectMantras();
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 select-none flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto mb-8 sm:mb-12"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[11px] font-bold uppercase tracking-[0.2em] mb-4">
          <Sparkles size={13} />
          <span>Welcome to Soulful Studio</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl text-[var(--text-primary)] leading-[1.1]">
          {userName ? `Welcome, ${userName}` : 'Choose your space'}
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {CARDS.map((card, i) => (
          <motion.button
            key={card.id}
            type="button"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 * i }}
            onClick={() => enter(card.id)}
            aria-label={`Enter ${card.title}`}
            className="relative aspect-[3/4] max-h-[560px] w-full rounded-[2rem] overflow-hidden text-left group cursor-pointer border-0 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
            style={{
              boxShadow: `0 0 0 1px ${card.glow}, 0 18px 50px rgba(0,0,0,0.35), 0 0 64px ${card.glow}`,
            }}
          >
            {'backdrop' in card && card.backdrop && (
              <img
                src={card.backdrop}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover scale-110 opacity-70"
              />
            )}
            <img
              src={card.image}
              alt={card.imageAlt}
              className={
                card.imageFit === 'contain'
                  ? 'absolute inset-0 m-auto h-[68%] w-[68%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)] group-hover:scale-105 transition-transform duration-700'
                  : 'absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700'
              }
            />
            <div
              className="absolute inset-0 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              style={{
                background: `radial-gradient(ellipse at 50% 30%, ${card.halo} 0%, transparent 58%)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
            <div
              className="absolute -inset-8 pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity duration-700 blur-2xl"
              style={{
                background: `radial-gradient(circle at 50% 80%, ${card.glow} 0%, transparent 62%)`,
              }}
            />

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 flex flex-col items-start gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">
                {card.kicker}
              </span>
              <h2 className="font-serif text-2xl sm:text-[1.7rem] text-white font-semibold leading-tight drop-shadow-md">
                {card.title}
              </h2>
              <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/90">
                Enter
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default StartHerePortal;
