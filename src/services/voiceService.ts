import { useState, useEffect } from 'react';

/**
 * SERVICE: VoiceService
 * Refactored to use High-Fidelity Google Cloud Neural TTS via Backend Proxy.
 * This bypasses robotic browser voices and keeps keys secure in Vault.
 */

// LIVE PRODUCTION URL (with Hosting Rewrites)
const API_BASE_URL = "https://awakened-path-2026.web.app";

export class VoiceService {
    private static currentAudio: HTMLAudioElement | null = null;
    private static listeners: ((isSpeaking: boolean) => void)[] = [];
    private static _isSpeaking: boolean = false;

    static get isSpeaking() {
        return this._isSpeaking;
    }

    private static setSpeaking(val: boolean) {
        this._isSpeaking = val;
        this.listeners.forEach(l => l(val));
    }

    static subscribe(listener: (isSpeaking: boolean) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * Pulls high-fidelity audio from the backend and plays it.
     * Cascades to Browser TTS if backend limits are reached.
     */
    static async speak(text: string, options: {
        gender?: 'MALE' | 'FEMALE';
        onEnd?: () => void;
    } = {}): Promise<void> {
        // Stop any currently playing audio (both backend and browser)
        this.stop();

        try {
            const response = await fetch(`${API_BASE_URL}/api/voice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    gender: options.gender || 'FEMALE'
                })
            });

            // If backend is exhausted (429/500), throw to trigger browser fallback
            if (!response.ok) throw new Error("Backend Budget Exhausted");

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            this.currentAudio = audio;
            this.setSpeaking(true);

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                this.setSpeaking(false);
                options.onEnd?.();
                this.currentAudio = null;
            };

            await audio.play();
        } catch (error) {
            console.warn("Cascading to Browser Speech Synthesis (Free Tier Fallback). Error:", error);
            this.speakFallbackBrowser(text, options);
        }
    }

    /**
     * The final "Free Forever" safety net.
     */
    private static speakFallbackBrowser(text: string, options: { onEnd?: () => void } = {}) {
        if (!window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 0.9;

        // Find a natural-ish voice if available
        const voices = window.speechSynthesis.getVoices();
        utterance.voice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices[0];

        this.setSpeaking(true);
        utterance.onend = () => {
            this.setSpeaking(false);
            options.onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
    }

    /**
     * Stops everything.
     */
    static stop() {
        this.setSpeaking(false);
        // Stop high-fidelity backend audio
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.src = "";
            this.currentAudio.load();
            this.currentAudio = null;
        }
        // Stop browser legacy audio
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    /**
     * Inits global lifecycle listeners to ensure silence when leaving the app.
     */
    static init(): Promise<void> {
        if (typeof window !== 'undefined') {
            // Stop voice if tab is hidden, minimized, or screen locked
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stop();
                }
            });

            // Stop voice on refresh/close
            window.addEventListener('pagehide', () => this.stop());
            window.addEventListener('beforeunload', () => this.stop());
        }
        return Promise.resolve();
    }
}

/**
 * HOOK: useVoiceActive
 * Reactive hook to see if the Sage is currently speaking.
 */
export function useVoiceActive() {
    const [isSpeaking, setIsSpeaking] = useState(VoiceService.isSpeaking);

    useEffect(() => {
        return VoiceService.subscribe((val: boolean) => setIsSpeaking(val));
    }, []);

    return isSpeaking;
}
