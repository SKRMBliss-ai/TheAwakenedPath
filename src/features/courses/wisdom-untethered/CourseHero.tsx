import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './CourseCommon.module.css';
import { cn } from '../../../lib/utils';

interface CourseHeroProps {
  chapter: number;
  question: number;
  title: React.ReactNode;
  subtitle: string;
  className?: string;
}

export const CourseHero: React.FC<CourseHeroProps> = ({ chapter, question, title, subtitle, className }) => {
  const starsRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const parent = starsRef.current;
    if (!parent) return;

    parent.innerHTML = '';
    const starCount = isDark ? 150 : 50;

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = styles.star;
      const size = Math.random() * 2 + 0.5;
      
      star.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        background: ${isDark ? 'white' : '#B8973A'};
        --min-op: ${(Math.random() * 0.2 + 0.1).toFixed(2)};
        --max-op: ${(Math.random() * 0.6 + 0.3).toFixed(2)};
        --d: ${(Math.random() * 4 + 2).toFixed(1)}s;
        --delay: ${(Math.random() * 5).toFixed(1)}s;
      `;
      parent.appendChild(star);
    }
  }, [isDark]);

  return (
    <section className={cn(styles.hero, className)} data-section="0">
      <div className={styles.heroStars} ref={starsRef} />
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={styles.heroContent}
      >
        <div className={styles.heroChapter}>Wisdom Untethered · Chapter {chapter} · Question {question}</div>
        <h1 className={styles.heroTitle}>{title}</h1>
        <div className={styles.heroRule} />
        <p className={styles.heroSub}>{subtitle}</p>
      </motion.div>
      <div className={styles.heroScroll}>Scroll to Explore</div>
    </section>
  );
};
