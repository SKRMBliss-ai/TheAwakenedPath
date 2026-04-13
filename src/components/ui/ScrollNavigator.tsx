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
  const [showUp, setShowUp] = useState(false);
  const [showDown, setShowDown] = useState(true);

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
      const scrollHeight = target instanceof Window ? document.documentElement.scrollHeight : target.scrollHeight;
      const clientHeight = target instanceof Window ? window.innerHeight : target.clientHeight;

      setShowUp(scrollY > 100);
      setShowDown(scrollY + clientHeight < scrollHeight - 100);
    };

    target.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    // Add a small delay to allow content to settle
    const t = setTimeout(handleScroll, 500);
    
    return () => {
      target.removeEventListener('scroll', handleScroll);
      clearTimeout(t);
    };
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
    <>
      <AnimatePresence>
        {showUp && (
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
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDown && (
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
        )}
      </AnimatePresence>
    </>
  );
};
