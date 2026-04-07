/**
 * usePersistedState
 *
 * A generic hook that wraps useState with automatic localStorage persistence.
 * Every state change is written to localStorage under the given key.
 * On mount, the saved value is read back and used as initial state.
 *
 * Usage:
 *   const [activeTab, setActiveTab] = usePersistedState('awakened-tab', 'home');
 */

import { useState, useEffect, useCallback } from 'react';

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
  validate?: (val: T) => boolean
): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setStateInternal] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      const parsed = JSON.parse(raw) as T;
      if (validate && !validate(parsed)) return defaultValue;
      return parsed;
    } catch {
      return defaultValue;
    }
  });

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage might be full or unavailable — fail silently
    }
  }, [key, state]);

  const setState = useCallback(
    (val: T | ((prev: T) => T)) => {
      setStateInternal(val as any);
    },
    []
  );

  return [state, setState];
}
