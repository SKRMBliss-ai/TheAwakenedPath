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
     */
    static async speak(text: string, options: {
        gender?: 'MALE' | 'FEMALE';
        voice?: string;
        promptContext?: string;
        onEnd?: () => void;
    } = {}): Promise<void> {
        const requestId = ++this.currentRequestId;
        console.log(`VOICE REQUEST [${requestId}]: Speaking with identity [${options.voice || options.gender || 'DEFAULT'}]`);
        this.stop();
        this.currentRequestId = requestId; // Restore after stop() increases it

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    promptContext: options.promptContext,
                    gender: options.gender || 'FEMALE',
                    voice: options.voice
                })
            });

            if (this.currentRequestId !== requestId) return;
            if (!response.ok) throw new Error("Backend Budget Exhausted");

            const audioBlob = await response.blob();
            if (this.currentRequestId !== requestId) return;
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            this.currentAudio = audio;
            this.currentUrl = "tts_blob";
            this.setSpeaking(true);

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
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
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) this.stop();
            });
            window.addEventListener('pagehide', () => this.stop());
            window.addEventListener('beforeunload', () => this.stop());
        }
        return Promise.resolve();
    }
}

export function useVoiceActive() {
    const [isSpeaking, setIsSpeaking] = useState(VoiceService.isSpeaking);
    useEffect(() => {
        return VoiceService.subscribe((val: boolean) => setIsSpeaking(val));
    }, []);
    return isSpeaking;
}
