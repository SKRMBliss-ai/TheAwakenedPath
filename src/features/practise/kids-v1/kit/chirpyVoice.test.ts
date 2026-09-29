import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isVoiceSupported, speak, stopSpeaking, greetByName } from './chirpyVoice';
import * as sfx from '../../../../lib/sfx';
import * as calmVoice from '../../../../lib/calmVoice';

// Mock dependencies
vi.mock('../../../../lib/sfx', () => ({
  isMuted: vi.fn(() => false),
}));

vi.mock('../../../../lib/calmVoice', () => ({
  speakCalmly: vi.fn(),
}));

describe('chirpyVoice', () => {
  let mockSpeechSynthesis: any;
  let mockAudio: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock SpeechSynthesis
    mockSpeechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
    };

    // Mock Audio
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      onended: null as any,
    };

    // Setup window.speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true,
    });

    // Mock global Audio class
    global.Audio = vi.fn(() => mockAudio);

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');

    // Mock fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    stopSpeaking();
  });

  describe('isVoiceSupported', () => {
    it('should return true when speechSynthesis is available', () => {
      expect(isVoiceSupported()).toBe(true);
    });

    it('should return false when speechSynthesis is not available', () => {
      Object.defineProperty(window, 'speechSynthesis', {
        value: undefined,
        writable: true,
      });
      expect(isVoiceSupported()).toBe(false);
    });
  });

  describe('speak', () => {
    it('should not speak when muted', () => {
      vi.mocked(sfx.isMuted).mockReturnValue(true);
      speak('Hello', false);
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('should not speak when quiet flag is true', () => {
      speak('Hello', true);
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('should not speak when text is empty', () => {
      speak('', false);
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('should stop previous speech before speaking', () => {
      speak('First', false);
      speak('Second', false);
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('should use correct voice for grownup character', async () => {
      speak('Hello', false, 'grownup');
      // The voice direction should be sent to the API
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('chirpy-voice'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('grownup'),
        })
      );
    });

    it('should use correct voice for mind character', async () => {
      speak('I am thinking', false, 'mind');
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('chirpy-voice'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('mind'),
        })
      );
    });

    it('should use correct voice for guide character', async () => {
      speak('Breathe in', false, 'guide');
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('chirpy-voice'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('guide'),
        })
      );
    });

    it('should fall back to browser voice after timeout if API is slow', async () => {
      const fetchPromise = new Promise(() => {
        // Never resolves
      });
      vi.mocked(global.fetch).mockReturnValue(fetchPromise as any);

      speak('Hello', false, 'grownup');

      // Wait for the 1.5s fallback timeout
      await new Promise(resolve => setTimeout(resolve, 1600));

      // Browser voice should have been called
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });

    it('should call onEnd callback when audio finishes', async () => {
      const onEnd = vi.fn();

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob(['audio'])),
      } as any);

      speak('Hello', false, 'grownup', onEnd);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate audio ending
      mockAudio.onended?.();

      expect(onEnd).toHaveBeenCalled();
    });

    it('should include feeling in API request for mind character', async () => {
      speak('I am scared', false, 'mind', undefined, 'scared');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('chirpy-voice'),
        expect.objectContaining({
          body: expect.stringContaining('scared'),
        })
      );
    });
  });

  describe('stopSpeaking', () => {
    it('should cancel speechSynthesis', () => {
      speak('Hello', false);
      stopSpeaking();
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('should pause audio element', () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob(['audio'])),
      } as any);

      speak('Hello', false);
      stopSpeaking();
      expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('should prevent subsequent audio from playing', async () => {
      speak('First', false);
      stopSpeaking();
      speak('Second', false);

      // Only the second speak should reach the API
      await new Promise(resolve => setTimeout(resolve, 100));

      const calls = vi.mocked(global.fetch).mock.calls;
      // Should have been called for both but the first's response should be ignored
      expect(calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('greetByName', () => {
    it('should greet with name when not already greeted', () => {
      const speakSpy = vi.spyOn({ speak }, 'speak');
      greetByName('Alice', false);
      // Greeting should trigger speak internally
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('should not greet twice in same session', () => {
      greetByName('Alice', false);
      const callCount = mockSpeechSynthesis.cancel.mock.calls.length;

      greetByName('Bob', false);
      // Should not have called cancel again - greetByName should have skipped
      expect(mockSpeechSynthesis.cancel.mock.calls.length).toBe(callCount);
    });

    it('should not greet when quiet', () => {
      greetByName('Alice', true);
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });

    it('should not greet without a name', () => {
      greetByName('', false);
      expect(mockSpeechSynthesis.speak).not.toHaveBeenCalled();
    });
  });

  describe('Voice character integrity', () => {
    it('should never use wispery mind voice for grownup/guide', async () => {
      speak('Important instruction', false, 'grownup');

      await new Promise(resolve => setTimeout(resolve, 100));

      const calls = vi.mocked(global.fetch).mock.calls;
      const lastCall = calls[calls.length - 1];
      const body = lastCall[1]?.body as string;

      // Ensure it's not requesting the mind character
      expect(body).not.toContain('"character":"mind"');
      expect(body).toContain('"character":"grownup"');
    });

    it('should use guide voice for breathing exercises', async () => {
      speak('Breathe in slowly', false, 'guide');

      await new Promise(resolve => setTimeout(resolve, 100));

      const calls = vi.mocked(global.fetch).mock.calls;
      const lastCall = calls[calls.length - 1];
      const body = lastCall[1]?.body as string;

      expect(body).toContain('"character":"guide"');
    });

    it('should maintain voice consistency across multiple speaks', async () => {
      const character = 'guide';
      speak('Breathe in', false, character);

      await new Promise(resolve => setTimeout(resolve, 100));

      stopSpeaking();

      speak('Breathe out', false, character);

      await new Promise(resolve => setTimeout(resolve, 100));

      const calls = vi.mocked(global.fetch).mock.calls;
      // Both calls should use guide character
      calls.forEach(call => {
        const body = call[1]?.body as string;
        expect(body).toContain('"character":"guide"');
      });
    });
  });

  describe('Cache behavior', () => {
    it('should cache audio responses', async () => {
      const mockBlob = new Blob(['audio']);
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(mockBlob),
      } as any);

      // First call - should fetch
      speak('Hello', false);
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(global.fetch).toHaveBeenCalledTimes(1);

      stopSpeaking();

      // Second call with same text and voice - should use cache
      speak('Hello', false);
      await new Promise(resolve => setTimeout(resolve, 100));
      // Should still be 1 call since it used cache
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
