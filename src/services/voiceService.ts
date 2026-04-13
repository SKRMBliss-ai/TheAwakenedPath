import { useState, useEffect } from 'react';

/**
 * SERVICE: VoiceService
 * Refactored to use High-Fidelity Google Cloud Neural TTS via Backend Proxy.
 * Includes direct MP3 support and stability guards for React lifecycle.
 */

const API_BASE_URL = "/api/voice";

export class VoiceService {
    private static ttsAudio: HTMLAudioElement | null = null;
    private static musicAudio: HTMLAudioElement | null = null;
    private static _currentUrl: string | null = null;
    private static currentRequestId: number = 0;
    private static listeners: ((status: 'idle' | 'playing' | 'paused' | 'buffering', category: 'tts' | 'music' | null) => void)[] = [];
    private static _status: 'idle' | 'playing' | 'paused' | 'buffering' = 'idle';
    private static _activeCategory: 'tts' | 'music' | null = null;
    private static _savedTtsTime: number = 0;
    private static _savedMusicTime: number = 0;
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

    static get currentUrl() {
        return this._currentUrl;
    }

    static get isPlaying() {
        return this._status === 'playing';
    }

    static get activeCategory() {
        return this._activeCategory;
    }

    private static setStatus(val: 'idle' | 'playing' | 'paused' | 'buffering') {
        this._status = val;
        this.listeners.forEach(l => l(val, this._activeCategory));
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

    static subscribe(listener: (status: 'idle' | 'playing' | 'paused' | 'buffering', category: 'tts' | 'music' | null) => void) {
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
            
            // Pause music if talking
            if (this.musicAudio && !this.musicAudio.paused) {
                this._savedMusicTime = this.musicAudio.currentTime;
                this.musicAudio.pause();
            }

            // Stop current TTS segments
            this.stopTTS();
            this.currentRequestId = requestId;
            this._activeCategory = 'tts';
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
            this.ttsAudio = audio;
            this._currentUrl = "tts_blob";

            audio.onplay = () => {
                if (this.ttsAudio === audio) {
                    this._activeCategory = 'tts';
                    this.setStatus('playing');
                }
            };

            audio.onended = () => {
                if (!options.isInternal) {
                    this.setStatus('idle');
                    this._activeCategory = null;
                    this.ttsAudio = null;
                    this._currentUrl = null;
                    
                    // Auto-resume music if it was paused for guidance
                    if (this.musicAudio && this._savedMusicTime > 0) {
                        this.resume('music');
                    }
                }
                options.onEnd?.();
            };

            await audio.play();
        } catch (error: any) {
            if (!options.isInternal) {
                this.setStatus('idle');
                this._activeCategory = null;
            }
            if (error.name === 'AbortError') return;
            console.warn("Falling back to browser TTS", error);
            this.speakFallbackBrowser(text, options);
        }
    }

    private static async speakSegments(segments: string[], options: any): Promise<void> {
        const requestId = ++this.currentRequestId;
        
        // Pause music if talking
        if (this.musicAudio && !this.musicAudio.paused) {
            this._savedMusicTime = this.musicAudio.currentTime;
            this.musicAudio.pause();
        }

        this.stopTTS();
        this.currentRequestId = requestId;
        this._activeCategory = 'tts';

        // Preload all segments in background
        segments.forEach(s => this.preloadText(s, options));

        for (let i = 0; i < segments.length; i++) {
            if (this.currentRequestId !== requestId) break;
            
            await new Promise<void>((resolve) => {
                this.segmentResolver = resolve;
                this.speak(segments[i], {
                    ...options,
                    isInternal: true,
                    onEnd: () => {
                        if (this.segmentResolver === resolve) {
                            this.segmentResolver = null;
                            resolve();
                        }
                    }
                }).catch(err => {
                    console.error("Segment playback failed", err);
                    if (this.segmentResolver === resolve) {
                        this.segmentResolver = null;
                        resolve();
                    }
                });
            });
        }
        
        if (this.currentRequestId === requestId) {
            this.setStatus('idle');
            this._activeCategory = null;
            // Auto-resume music?
            if (this.musicAudio && this._savedMusicTime > 0) {
                this.resume('music');
            }
        }
    }

    /**
     * Plays a direct audio URL (e.g., local MP3) instead of generating TTS.
     */
    static async playAudioURL(url: string, onEnd?: () => void): Promise<void> {
        if (this._currentUrl === url && this.musicAudio && !this.musicAudio.paused) {
            console.log("VoiceService: Already playing URL.");
            return;
        }

        // Pause TTS if starting music
        if (this.ttsAudio && !this.ttsAudio.paused) {
            this._savedTtsTime = this.ttsAudio.currentTime;
            this.ttsAudio.pause();
        }

        const requestId = ++this.currentRequestId;
        console.log(`VoiceService [${requestId}]: Triggering playback for:`, url);
        
        // Stop previous music, don't stop TTS
        if (this.musicAudio) {
            this.musicAudio.pause();
            this.musicAudio = null;
        }

        this.currentRequestId = requestId;

        try {
            const audio = new Audio(url);
            audio.preload = "auto";

            this.musicAudio = audio;
            this._currentUrl = url;
            this._activeCategory = 'music';
            this.setStatus('playing');

            audio.onended = () => {
                this.setStatus('idle');
                this._activeCategory = null;
                onEnd?.();
                this.musicAudio = null;
                this._currentUrl = null;
                
                // Maybe resume TTS? Let's not auto-resume TTS after music, 
                // but music after TTS is often desired for background.
            };

            audio.onerror = (e: any) => {
                const mediaError = (e.target as HTMLAudioElement).error;
                console.error("VoiceService Error:", { url, code: mediaError?.code, message: mediaError?.message });
                this.setStatus('idle');
                this._activeCategory = null;
            };

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                await playPromise;
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            console.error("VoiceService: Playback failed:", error);
            this.setStatus('idle');
            this._activeCategory = null;
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


    static pause() {
        this.setStatus('paused');
        if (this.ttsAudio && !this.ttsAudio.paused) {
            this._savedTtsTime = this.ttsAudio.currentTime;
            this.ttsAudio.pause();
        }
        if (this.musicAudio && !this.musicAudio.paused) {
            this._savedMusicTime = this.musicAudio.currentTime;
            this.musicAudio.pause();
        }
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.pause();
        }
    }

    static resume(category?: 'tts' | 'music') {
        if (!this._isEnabled) return;
        
        const target = category || this._activeCategory || 'tts';
        console.log(`[VoiceService] Resuming: ${target}`);

        if (target === 'tts' && this.ttsAudio) {
            // Pause music if resuming guidance
            if (this.musicAudio && !this.musicAudio.paused) {
                this._savedMusicTime = this.musicAudio.currentTime;
                this.musicAudio.pause();
            }
            this._activeCategory = 'tts';
            this.setStatus('playing');
            this._currentUrl = 'tts_blob';
            
            if (this._savedTtsTime > 0) {
                try {
                    this.ttsAudio.currentTime = this._savedTtsTime;
                } catch (e) {}
                this._savedTtsTime = 0;
            }
            
            this.ttsAudio.play().catch(e => console.error("TTS Resume failed", e));
        } else if (target === 'music' && this.musicAudio) {
            // Pause TTS if resuming music
            if (this.ttsAudio && !this.ttsAudio.paused) {
                this._savedTtsTime = this.ttsAudio.currentTime;
                this.ttsAudio.pause();
            }
            this._activeCategory = 'music';
            this.setStatus('playing');
            this._currentUrl = this.musicAudio.src; // Restore correct URL
            
            if (this._savedMusicTime > 0) {
                try {
                    this.musicAudio.currentTime = this._savedMusicTime;
                } catch (e) {}
                this._savedMusicTime = 0;
            }
            
            this.musicAudio.play().catch(e => console.error("Music Resume failed", e));
        }

        if (typeof window !== 'undefined' && window.speechSynthesis && target === 'tts') {
            window.speechSynthesis.resume();
        }
    }

    static stop() {
        this.currentRequestId++; // Invalidate any in-flight requests
        this.setStatus('idle');
        this.stopTTS();
        this.stopMusic();
        this._activeCategory = null;
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    private static stopTTS() {
        if (this.ttsAudio) {
            try {
                this.ttsAudio.pause();
                this.ttsAudio.currentTime = 0;
                this.ttsAudio.removeAttribute('src');
                this.ttsAudio.load();
            } catch (e) {}
            this.ttsAudio = null;
        }
        this._savedTtsTime = 0;
        if (this.segmentResolver) {
            this.segmentResolver();
            this.segmentResolver = null;
        }
    }

    private static stopMusic() {
        if (this.musicAudio) {
            try {
                this.musicAudio.pause();
                this.musicAudio.currentTime = 0;
                this.musicAudio.removeAttribute('src');
                this.musicAudio.load();
            } catch (e) {}
            this.musicAudio = null;
        }
        this._savedMusicTime = 0;
        this._currentUrl = null;
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
    const [state, setState] = useState({ 
        status: VoiceService.status, 
        category: VoiceService.activeCategory 
    });
    
    useEffect(() => {
        return VoiceService.subscribe((status, category) => {
            setState({ status, category });
        });
    }, []);
    
    return state;
}

export function useVoiceActive(targetCategory?: 'tts' | 'music') {
    const { status, category } = useVoiceStatus();
    if (targetCategory) {
        return status === 'playing' && category === targetCategory;
    }
    return status === 'playing';
}
