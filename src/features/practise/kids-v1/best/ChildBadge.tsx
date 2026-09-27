import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useKidStore } from '../../../kids/store';
import { childAge } from '../kit/band';
import { AgePopup } from './AgePopup';
import { FONT } from '../ui/chrome';

/**
 * A small pill in the top-right corner showing the child's name and age.
 * Tapping it reopens the age picker so they can change it anytime.
 */
export function ChildBadge() {
  const name = useKidStore((s) => s.name);
  const [showAge, setShowAge] = useState(false);
  const [age, setLocalAge] = useState(() => childAge());

  const displayName = name && name !== 'Explorer' ? name : null;
  const displayAge = age;

  // Re-read age from localStorage after the popup closes
  const handleDone = () => {
    setShowAge(false);
    setLocalAge(childAge());
  };

  if (!displayName && displayAge === undefined) return null;

  return (
    <>
      <button
        onClick={() => setShowAge(true)}
        aria-label={`${displayName ?? 'Child'}, age ${displayAge ?? 'unknown'}. Tap to change age.`}
        style={{
          position: 'fixed',
          top: 'clamp(10px, 2.4vh, 22px)',
          right: 'clamp(10px, 2.4vw, 26px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 20,
          border: '1.5px solid rgba(255, 217, 138, 0.45)',
          background: 'linear-gradient(rgba(58, 34, 96, 0.85), rgba(34, 19, 63, 0.9))',
          backdropFilter: 'blur(7px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(7px) saturate(1.2)',
          boxShadow: '0 6px 18px -6px rgba(11, 4, 24, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          color: '#fff3dc',
          fontFamily: FONT,
          fontSize: 'clamp(11px, 1.1vw, 14px)',
          fontWeight: 850,
          cursor: 'pointer',
          transition: 'transform .2s ease, box-shadow .2s ease',
        }}
        onPointerEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px) scale(1.04)';
        }}
        onPointerLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = '';
        }}
      >
        <span style={{ fontSize: '1.1em' }} aria-hidden="true">👤</span>
        <span>
          {displayName && <span>{displayName}</span>}
          {displayName && displayAge !== undefined && <span style={{ opacity: 0.6 }}>, </span>}
          {displayAge !== undefined && (
            <span style={{ color: '#ffd98a' }}>{displayAge}</span>
          )}
        </span>
      </button>

      <AnimatePresence>
        {showAge && <AgePopup onDone={handleDone} />}
      </AnimatePresence>
    </>
  );
}
