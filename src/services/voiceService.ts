import { useState, useEffect } from 'react';

/**
 * SERVICE: VoiceService
 * Refactored to use High-Fidelity Google Cloud Neural TTS via Backend Proxy.
 * Includes direct MP3 support and stability guards for React lifecycle.
 */

const API_BASE_URL = "/api/voice";

export class VoiceService {
    private static currentAudio: HTMLAudioElement | null = null;
    private static currentUrl: string | null = null;
    private static currentRequestId: number = 0;
    private static listeners: ((isSpeaking: boolean) => void)[] = [];
    private static _isSpeaking: boolean = false;
    private static _isEnabled: boolean = (() => {
        try {
            const saved = localStorage.getItem('awakened-voice-enabled');
            return saved === null ? true : saved !== 'off';
        } catch { return true; }
    })();

    private static audioCache: Record<string, Promise<string>> = {};

    static get isSpeaking() {
        return this._isSpeaking;
    }

    private static setSpeaking(val: boolean) {
        this._isSpeaking = val;
        this.listeners.forEach(l => l(val));
    }

    static get isEnabled() {
        return this._isEnabled;
    }

    static setEnabled(val: boolean) {
        this._isEnabled = val;
        try {
            localStorage.setItem('awakened-voice-enabled', val ? 'on' : 'off');
        } catch { }
        if (!val) this.stop();
        // Notify listeners if needed, or just let hooks re-render on toggle
    }

    static subscribe(listener: (isSpeaking: boolean) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    static preloadText(text: string, options: {
        gender?: 'MALE' | 'FEMALE';
        voice?: string;
        promptContext?: string;
    } = {}): void {
        if (!this._isEnabled || text in this.audioCache) return;
        this.audioCache[text] = fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                promptContext: options.promptContext,
                gender: options.gender || 'FEMALE',
                voice: options.voice
            })
        })
        .then(res => {
            if (!res.ok) throw new Error("Backend Budget Exhausted");
            return res.blob();
        })
        .then(blob => URL.createObjectURL(blob))
        .catch(err => {
            console.warn("Preload failed for", text, err);
            delete this.audioCache[text]; // Remove failed preload so we can retry on next speak
            throw err;
        });
    }

    /**
     * Pulls high-fidelity audio from the backend and plays it.
     */
    static async speak(text: string, options: {
        gender?: 'MALE' | 'FEMALE';
        voice?: string;
        promptContext?: string;
        onEnd?: () => void;
    } = {}): Promise<void> {
        if (!this._isEnabled) return;
        const requestId = ++this.currentRequestId;
        console.log(`VOICE REQUEST [${requestId}]: Speaking with identity [${options.voice || options.gender || 'DEFAULT'}]`);
        this.stop();
        this.currentRequestId = requestId; // Restore after stop() increases it

        try {
            if (!(text in this.audioCache)) {
                // If not preloaded, start the fetch now by leveraging preloadText
                this.preloadText(text, options);
            }

            // Wait for the preload fetch to finish (or the inline fetch we just started)
            const audioUrl = await this.audioCache[text];

            if (this.currentRequestId !== requestId) return;

            const audio = new Audio(audioUrl);
            this.currentAudio = audio;
            this.currentUrl = "tts_blob";

            // Wait until it's actually about to play before showing "Guiding..."
            audio.onplay = () => this.setSpeaking(true);

            audio.onended = () => {
                this.setSpeaking(false);
                options.onEnd?.();
                this.currentAudio = null;
                this.currentUrl = null;
            };

            await audio.play();
        } catch (error) {
            console.warn("Cascading to Browser Speech Synthesis.", error);
            this.speakFallbackBrowser(text, options);
        }
    }

    /**
     * Plays a direct audio URL (e.g., local MP3) instead of generating TTS.
     */
    static async playAudioURL(url: string, onEnd?: () => void): Promise<void> {
        if (this.currentUrl === url && this.currentAudio && !this.currentAudio.paused) {
            console.log("VoiceService: Already playing URL.");
            return;
        }

        const requestId = ++this.currentRequestId;
        console.log(`VoiceService [${requestId}]: Triggering playback for:`, url);
        this.stop();
        this.currentRequestId = requestId;

        try {
            // Use constructor directly for better browser compatibility
            const audio = new Audio(url);
            audio.preload = "auto";

            this.currentAudio = audio;
            this.currentUrl = url;
            this.setSpeaking(true);

            audio.onended = () => {
                this.setSpeaking(false);
                onEnd?.();
                this.currentAudio = null;
                this.currentUrl = null;
            };

            audio.onerror = (e: any) => {
                const mediaError = (e.target as HTMLAudioElement).error;
                console.error("VoiceService Error:", {
                    url,
                    code: mediaError?.code,
                    message: mediaError?.message
                });
                this.setSpeaking(false);
            };

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                await playPromise;
            }
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.warn("VoiceService: Playback interrupted.");
                return;
            }
            console.error("VoiceService: Playback failed:", error);
            this.setSpeaking(false);
        }
    }

    private static speakFallbackBrowser(text: string, options: { onEnd?: () => void } = {}) {
        if (!window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 0.9;
        const voices = window.speechSynthesis.getVoices();
        utterance.voice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices[0];

        this.setSpeaking(true);
        utterance.onend = () => {
            this.setSpeaking(false);
            options.onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
    }

    static pause() {
        this.setSpeaking(false);
        if (this.currentAudio) {
            this.currentAudio.pause();
        }
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.pause();
        }
    }

    static resume() {
        if (!this._isEnabled) return;
        this.setSpeaking(true);
        if (this.currentAudio) {
            this.currentAudio.play().catch(e => console.error("Resume failed", e));
        }
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.resume();
        }
    }

    static stop() {
        this.currentRequestId++; // Invalidate any in-flight requests
        this.setSpeaking(false);
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.removeAttribute('src');
            this.currentAudio.load();
            this.currentAudio = null;
        }
        this.currentUrl = null;
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    static init(): Promise<void> {
        if (typeof window !== 'undefined') {
            window.addEventListener('pagehide', () => this.stop());
            window.addEventListener('beforeunload', () => this.stop());
        }
        return Promise.resolve();
    }
}

export function useVoiceEnabled() {
    const [enabled, setEnabled] = useState(VoiceService.isEnabled);
    // Note: We need to trigger an update when it changes manually
    useEffect(() => {
        // Simple polling or event listener would work better for global sync
        const intv = setInterval(() => {
            if (VoiceService.isEnabled !== enabled) setEnabled(VoiceService.isEnabled);
        }, 500);
        return () => clearInterval(intv);
    }, [enabled]);
    return enabled;
}

export function useVoiceActive() {
    const [isSpeaking, setIsSpeaking] = useState(VoiceService.isSpeaking);
    useEffect(() => {
        return VoiceService.subscribe((val: boolean) => setIsSpeaking(val));
    }, []);
    return isSpeaking;
}
