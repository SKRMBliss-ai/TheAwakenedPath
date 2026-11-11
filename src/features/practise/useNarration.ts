import { useCallback, useEffect, useState } from 'react';
import { VoiceService } from '../../services/voiceService';

/**
 * Voice narration for the gym, on the app's existing neural text-to-speech
 * (/api/voice via VoiceService, browser voice as its fallback) and its
 * existing on/off switch — turning it off here turns it off everywhere, and
 * the choice is remembered by VoiceService.
 */
export function useNarration() {
  const [on, setOn] = useState(() => VoiceService.isEnabled);

  const say = useCallback((text: string, onEnd?: () => void) => {
    if (!VoiceService.isEnabled || !text.trim()) return;
    void VoiceService.speak(text, { gender: 'FEMALE', onEnd });
  }, []);

  const stop = useCallback(() => VoiceService.stop(), []);

  const toggle = useCallback(() => {
    const next = !VoiceService.isEnabled;
    VoiceService.setEnabled(next);
    setOn(next);
  }, []);

  // Never keep talking after the screen is gone.
  useEffect(() => () => VoiceService.stop(), []);

  return { on, say, stop, toggle };
}
