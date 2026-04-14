import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CourseCommon.module.css';
import { VoiceService } from '../../../services/voiceService';

interface CourseLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  total: number;
  imgSrc: string;
}

export const CourseLightbox: React.FC<CourseLightboxProps> = ({
  isOpen,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  total,
  imgSrc
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNext, onPrev, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={styles.lightboxOverlay}
          onClick={onClose}
        >
          <button className={styles.lightboxClose} onClick={onClose}>✕</button>
          
          <motion.div
            key={imgSrc}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.05, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={VoiceService.getStorageUrl(imgSrc)} 
              alt="Slide View" 
              crossOrigin="anonymous"
            />
          </motion.div>

          <div className={styles.lightboxNav} onClick={e => e.stopPropagation()}>
            <button className={styles.lightboxNavBtn} onClick={onPrev}>←</button>
            <div className={styles.lightboxCounter}>
              {currentIndex + 1} / {total}
            </div>
            <button className={styles.lightboxNavBtn} onClick={onNext}>→</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
