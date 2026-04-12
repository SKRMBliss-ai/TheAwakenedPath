import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ScrollNavigatorProps {
  containerRef?: React.RefObject<HTMLElement>;
  selector?: string;
  className?: string;
}

export const ScrollNavigator: React.FC<ScrollNavigatorProps> = ({ containerRef, selector, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const getTarget = () => {
      if (containerRef?.current) return containerRef.current;
      if (selector) return document.querySelector(selector) as HTMLElement;
      return window;
    };

    const target = getTarget();
    if (!target) return;
    
    const handleScroll = () => {
      const scrollY = target instanceof Window ? window.scrollY : target.scrollTop;
      setIsVisible(scrollY > 50); // Lowered threshold so portals appear sooner
    };

    target.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => target.removeEventListener('scroll', handleScroll);
  }, [containerRef, selector]);

  const scrollTo = (direction: 'top' | 'bottom') => {
    const getTarget = () => {
      if (containerRef?.current) return containerRef.current;
      if (selector) return document.querySelector(selector) as HTMLElement;
      return window;
    };

    const target = getTarget();
    if (!target) return;

    const options: ScrollToOptions = {
      top: direction === 'top' ? 0 : (target instanceof Window ? document.documentElement.scrollHeight : target.scrollHeight),
      behavior: 'smooth'
    };

    target.scrollTo(options);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* UP ARROW - Parallel to Voice Guidance Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className={cn(
              "fixed bottom-[118px] right-28 z-[110]",
              className
            )}
          >
            <button
              onClick={() => scrollTo('top')}
              className="w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--accent-primary)] flex items-center justify-center shadow-2xl hover:bg-[var(--accent-primary)] hover:text-black transition-all duration-300 group backdrop-blur-md"
              title="Scroll to Top"
            >
              <ChevronUp size={24} className="group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </motion.div>

          {/* DOWN ARROW - Parallel to WhatsApp Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className={cn(
              "fixed bottom-[32px] right-28 z-[110]",
              className
            )}
          >
            <button
              onClick={() => scrollTo('bottom')}
              className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-black flex items-center justify-center shadow-[0_0_20px_rgba(94,196,176,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 group"
              title="Scroll to Bottom"
            >
              <ChevronDown size={24} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
