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
    private static listeners: ((status: 'idle' | 'playing' | 'paused' | 'buffering') => void)[] = [];
    private static _status: 'idle' | 'playing' | 'paused' | 'buffering' = 'idle';
    private static _isEnabled: boolean = (() => {
        try {
            // Sync with usePersistedState key used in app
            const saved = localStorage.getItem('voice-guidance-enabled');
            if (saved === null) return true;
            return JSON.parse(saved) === true;
        } catch { return true; }
    })();

    private static audioCache: Record<string, Promise<string>> = {};
    private static segmentResolver: (() => void) | null = null;

    static get isSpeaking() {
        return this._status === 'playing';
    }

    static get status() {
        return this._status;
    }

    private static setStatus(val: 'idle' | 'playing' | 'paused' | 'buffering') {
        this._status = val;
        this.listeners.forEach(l => l(val));
    }

    static get isEnabled() {
        return this._isEnabled;
    }

    static setEnabled(val: boolean) {
        this._isEnabled = val;
        try {
            localStorage.setItem('voice-guidance-enabled', JSON.stringify(val));
        } catch { }
        if (!val) this.stop();
    }

    static subscribe(listener: (status: 'idle' | 'playing' | 'paused' | 'buffering') => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private static getCacheKey(text: string, voice?: string) {
        // Robust unique key combining voice identity, content sample, and total length
        const voiceId = voice || 'default';
        const textSample = text.substring(0, 50).replace(/\s+/g, '_');
        return `${voiceId}_${textSample}_${text.length}`;
    }

    static preloadText(text: string, options: {
        gender?: 'MALE' | 'FEMALE';
        voice?: string;
        promptContext?: string;
    } = {}): void {
        const key = this.getCacheKey(text, options.voice);
        if (!this._isEnabled || key in this.audioCache) return;
        
        // Append voice ID to URL to bypass any potential POST-body ignoring proxies
        const fetchUrl = options.voice ? `${API_BASE_URL}?voice=${encodeURIComponent(options.voice)}` : API_BASE_URL;
        
        console.log(`[VoiceService] Preloading: ${options.voice || 'default'} via ${fetchUrl}`);
        this.audioCache[key] = fetch(fetchUrl, {
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
            if (!res.ok) throw new Error(`Backend Error: ${res.status}`);
            return res.blob();
        })
        .then(blob => URL.createObjectURL(blob))
        .catch(err => {
            console.warn("Preload failed for", options.voice, err);
            delete this.audioCache[key]; 
            throw err;
        });
    }

    /**
     * Pulls high-fidelity audio from the backend and plays it.
     * Supports segmenting long text for faster initial response.
     */
    static async speak(text: string, options: {
        gender?: 'MALE' | 'FEMALE';
        voice?: string;
        promptContext?: string;
        onEnd?: () => void;
        isInternal?: boolean;
    } = {}): Promise<void> {
        if (!this._isEnabled) return;
        
        const segments = text.split(/\n\n+/).filter(s => s.trim().length > 0);
        if (segments.length > 1 && !options.isInternal) {
            return this.speakSegments(segments, options);
        }

        const requestId = options.isInternal ? this.currentRequestId : ++this.currentRequestId;
        const key = this.getCacheKey(text, options.voice);
        
        if (!options.isInternal) {
            console.log(`[VoiceService] speak requestId: ${requestId}, key: ${key}`);
            this.stop();
            this.currentRequestId = requestId;
        }

        try {
            if (!(key in this.audioCache)) {
                console.log(`[VoiceService] cache miss for key: ${key}, calling preloadText`);
                this.setStatus('buffering');
                this.preloadText(text, options);
            }

            const audioUrl = await this.audioCache[key];
            if (this.currentRequestId !== requestId) {
                console.log(`[VoiceService] speak ${requestId} cancelled, currentRequestId is now ${this.currentRequestId}`);
                return;
            }

            console.log(`[VoiceService] playing blob: ${audioUrl.substring(0, 30)}... for key: ${key}`);
            const audio = new Audio(audioUrl);
            this.currentAudio = audio;
            this.currentUrl = "tts_blob";

            audio.onplay = () => {
                if (this.currentAudio === audio) this.setStatus('playing');
            };

            audio.onended = () => {
                if (options.isInternal) {
                    // Internal calls don't set status to idle immediately 
                    // unless it's the last segment (handled by speakSegments)
                } else {
                    this.setStatus('idle');
                }
                options.onEnd?.();
                this.currentAudio = null;
                this.currentUrl = null;
            };

            await audio.play();
        } catch (error: any) {
            if (!options.isInternal) this.setStatus('idle');
            if (error.name === 'AbortError') return;
            console.warn("Falling back to browser TTS", error);
            this.speakFallbackBrowser(text, options);
        }
    }

    private static async speakSegments(segments: string[], options: any): Promise<void> {
        const requestId = ++this.currentRequestId;
        this.stop();
        this.currentRequestId = requestId;

        // Preload all segments in background
        segments.forEach(s => this.preloadText(s, options));

        for (let i = 0; i < segments.length; i++) {
            if (this.currentRequestId !== requestId) break;
            
            await new Promise<void>(async (resolve) => {
                try {
                    this.segmentResolver = resolve;
                    await this.speak(segments[i], {
                        ...options,
                        isInternal: true,
                        onEnd: () => {
                            if (this.segmentResolver === resolve) {
                                this.segmentResolver = null;
                                resolve();
                            }
                        }
                    });
                } finally {
                    if (this.segmentResolver === resolve) {
                        this.segmentResolver = null;
                        resolve();
                    }
                }
            });
        }
        
        if (this.currentRequestId === requestId) {
            this.setStatus('idle');
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
            this.setStatus('playing');

            audio.onended = () => {
                this.setStatus('idle');
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
                console.error("VoiceService Error:", {
                    url,
                    code: mediaError?.code,
                    message: mediaError?.message
                });
                this.setStatus('idle');
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
            this.setStatus('idle');
        }
    }

    private static speakFallbackBrowser(text: string, options: { onEnd?: () => void } = {}) {
        if (!window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 0.9;
        const voices = window.speechSynthesis.getVoices();
        utterance.voice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices[0];

        this.setStatus('playing');
        utterance.onend = () => {
            this.setStatus('idle');
            options.onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
    }

    private static savedTime: number = 0;

    static pause() {
        this.setStatus('paused');
        if (this.currentAudio) {
            this.savedTime = this.currentAudio.currentTime;
            this.currentAudio.pause();
        }
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.pause();
        }
    }

    static resume() {
        if (!this._isEnabled) return;
        
        if (this.currentAudio) {
            this.setStatus('playing');
            try {
                if (this.savedTime > 0 && this.currentAudio.readyState >= 1) {
                    this.currentAudio.currentTime = this.savedTime;
                }
            } catch (err) {
                console.warn("Could not set audio currentTime", err);
            } finally {
                this.savedTime = 0;
            }
            this.currentAudio.play().catch(e => console.error("Resume failed", e));
        }
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.resume();
        }
    }

    static stop() {
        this.currentRequestId++; // Invalidate any in-flight requests
        this.setStatus('idle');
        this.savedTime = 0;
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.removeAttribute('src');
            this.currentAudio.load();
            this.currentAudio = null;
        }
        this.currentUrl = null;
        if (this.segmentResolver) {
            this.segmentResolver();
            this.segmentResolver = null;
        }
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

export function useVoiceStatus() {
    const [status, setStatus] = useState(VoiceService.status);
    useEffect(() => {
        return VoiceService.subscribe((val) => setStatus(val));
    }, []);
    return status;
}

export function useVoiceActive() {
    const status = useVoiceStatus();
    return status === 'playing';
}
