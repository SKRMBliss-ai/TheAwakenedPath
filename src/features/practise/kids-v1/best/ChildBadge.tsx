import { useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { useKidStore } from '../../../kids/store';
import { childAge } from '../kit/band';
import { AgePopup } from './AgePopup';
import { FONT } from '../ui/chrome';
import './ChildBadge.css';

/*
  WHERE THE CHILD'S NAME TAG STANDS.

  The badge used to be pinned to the top-right corner of every screen, and
  every room has its own things up there: the Games Room's Mind Stars, the
  Reflection Room's two charms, the Story Lab's grown-up button, the Home
  diary card. It sat on top of all of them, so each fix was a different
  offset in a different file and the next room added would bring it back.

  So a room that keeps something in that corner says where the tag goes by
  rendering a <BadgeSlot /> inside its own corner cluster. The badge is still
  one component mounted once; it just moves into whichever slot is on screen,
  and only falls back to the pinned corner on a room that has not made one.
*/

let slot: HTMLElement | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

function useBadgeSlot(): HTMLElement | null {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    () => slot,
    () => null,
  );
}

export function BadgeSlot() {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    slot = el;
    emit();
    /* A room leaving can unmount after the next one has already claimed the
       slot, so only let go of the one that is still this room's. */
    return () => { if (slot === el) { slot = null; emit(); } };
  }, []);
  return <span ref={ref} style={{ display: 'inline-flex', flex: '0 0 auto' }} />;
}

/**
 * A small pill showing the child's name and age. Tapping it reopens the age
 * picker so they can change it anytime.
 *
 * It stands in a room's own <BadgeSlot /> when there is one, and otherwise
 * pins itself to the top-right corner of the screen.
 */
export function ChildBadge() {
  const name = useKidStore((s) => s.name);
  const host = useBadgeSlot();
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

  const badge = (
    <button
      className={`child-badge ${host ? 'child-badge-inline' : 'child-badge-pinned'}`}
      onClick={() => setShowAge(true)}
      aria-label={`${displayName ?? 'Child'}, age ${displayAge ?? 'unknown'}. Tap to change age.`}
      style={{ fontFamily: FONT } as CSSProperties}
    >
      <span className="child-badge-icon" aria-hidden="true">👤</span>
      <span className="child-badge-text">
        {displayName && <span className="child-badge-name">{displayName}</span>}
        {displayName && displayAge !== undefined && <span className="child-badge-comma">, </span>}
        {displayAge !== undefined && <span className="child-badge-age">{displayAge}</span>}
      </span>
    </button>
  );

  return (
    <>
      {host ? createPortal(badge, host) : badge}
      <AnimatePresence>
        {showAge && <AgePopup onDone={handleDone} />}
      </AnimatePresence>
    </>
  );
}
