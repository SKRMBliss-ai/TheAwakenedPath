import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

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
    private static _currentTrackId: string | null = null;
    /** Persists the music URL even while TTS is playing on top */
    private static _musicUrl: string | null = null;
    private static _volume: number = 1;
    private static currentRequestId: number = 0;
    private static listeners: ((status: 'idle' | 'playing' | 'paused' | 'buffering', category: 'tts' | 'music' | null, musicUrl: string | null, trackId: string | null) => void)[] = [];
    private static _status: 'idle' | 'playing' | 'paused' | 'buffering' = 'idle';
    private static _cloakedCache: Map<string, string> = new Map(); // trackId -> blobUrl
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

    private static STORAGE_BUCKET = "awakened-path-2026.firebasestorage.app";

    /**
     * Maps local development paths to Firebase Storage Production URLs.
     */
    private static getInternalStoragePath(path: string): string {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        let storagePath = cleanPath;
        if (cleanPath.startsWith('mp3/Music/Images/')) {
            storagePath = cleanPath.replace('mp3/Music/Images/', 'Soundscapes/Images/');
        } else if (cleanPath.startsWith('mp3/Music/')) {
            storagePath = cleanPath.replace('mp3/Music/', 'Soundscapes/');
        } else if (cleanPath.startsWith('mp3/')) {
            storagePath = cleanPath.replace('mp3/', '');
        }
        return storagePath;
    }

    public static getStorageUrl(path: string): string {
        // If it's already an absolute URL or blob, leave it alone
        if (path.startsWith('http') || path.startsWith('blob:')) return path;

        const storagePath = this.getInternalStoragePath(path);
        
        // Use the Firebase Storage public download format (encoded)
        const encodedPath = encodeURIComponent(storagePath);
        return `https://firebasestorage.googleapis.com/v0/b/${this.STORAGE_BUCKET}/o/${encodedPath}?alt=media`;
    }

    /**
     * Obtains a signed URL from the backend that expires shortly.
     * Prevents permanent link sharing and blocks direct scraper access.
     */
    public static async getCloakedUrl(trackId: string, path: string): Promise<string> {
        // 0. Check cache first
        if (this._cloakedCache.has(trackId)) {
            return this._cloakedCache.get(trackId)!;
        }

        try {
            // 1. Get the temporary signed URL
            const signedUrl = await this.getSecureUrl(trackId, path);

            // 2. Fetch the actual binary data
            console.log(`[VoiceService] Cloaking attempt for ${trackId}...`);
            const response = await fetch(signedUrl);
            
            if (!response.ok) {
                console.error(`[VoiceService] Fetch failed with status: ${response.status} ${response.statusText}`);
                throw new Error(`Vault access denied: ${response.status}`);
            }

            const blob = await response.blob();
            console.log(`[VoiceService] Success: Sacred asset cloaked (${blob.size} bytes)`);
            
            // 3. Create a local object URL (masked)
            const cloakUrl = URL.createObjectURL(blob);
            this._cloakedCache.set(trackId, cloakUrl);
            return cloakUrl;
        } catch (error: any) {
            console.error("[VoiceService] Cloaking failure details:", {
                message: error.message,
                stack: error.stack,
                type: error.name
            });
            
            if (error.message === 'Failed to fetch') {
                console.warn("[VoiceService] This is likely a CORS block. The bucket needs to allow cross-origin requests from this domain.");
            }
            
            throw error;
        }
    }

    /**
     * Obtains a signed URL from the backend that expires shortly.
     */
    public static async getSecureUrl(trackId: string, path: string): Promise<string> {
        try {
            const getUrl = httpsCallable(functions, 'getSecureTrackUrl');
            const result = await getUrl({ trackId, path });
            const data = result.data as { url?: string, error?: string };
            
            if (data.error) {
                console.error("[VoiceService] Managed Backend Error:", data.error);
                throw new Error(data.error);
            }
            
            return data.url!;
        } catch (error) {
            console.error("[VoiceService] Critical failure in Manifesting Connection:", error);
            throw error;
        }
    }

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

    /** Always returns the loaded music URL regardless of whether TTS is active */
    static get musicUrl() {
        return this._musicUrl;
    }

    static get currentTrackId() {
        return this._currentTrackId;
    }

    static get isPlaying() {
        return this._status === 'playing';
    }

    static get activeCategory() {
        return this._activeCategory;
    }

    static get volume() {
        return this._volume;
    }

    static setVolume(vol: number) {
        this._volume = Math.max(0, Math.min(1, vol));
        if (this.musicAudio) this.musicAudio.volume = this._volume;
        if (this.ttsAudio) this.ttsAudio.volume = this._volume;
    }

    /** Skip forward (positive) or rewind (negative) by `seconds` in the music channel */
    static skipBy(seconds: number) {
        if (!this.musicAudio) return;
        const next = Math.max(0, Math.min(this.musicAudio.duration || 0, this.musicAudio.currentTime + seconds));
        this.musicAudio.currentTime = next;
        if (this._status === 'paused') this._savedMusicTime = next;
    }

    static get audioProgress() {
        // Always prefer musicAudio for progress so the mini-player stays accurate
        // even when TTS is temporarily playing on top of paused music.
        const audio = this.musicAudio ?? this.ttsAudio;
        if (!audio) return { currentTime: 0, duration: 0 };
        return {
            currentTime: audio.currentTime,
            duration: audio.duration || 0
        };
    }

    private static setStatus(val: 'idle' | 'playing' | 'paused' | 'buffering') {
        console.log(`[VoiceService] Status Change: ${this._status} -> ${val} (Category: ${this._activeCategory})`);
        this._status = val;
        this.listeners.forEach(l => l(val, this._activeCategory, this._musicUrl, this._currentTrackId));
    }

    static playEffect(url: string) {
        if (!this._isEnabled) return;
        const storageUrl = this.getStorageUrl(url);
        const effect = new Audio(storageUrl);
        effect.volume = this._volume;
        effect.play().catch(err => console.error("Effect playback failed:", err));
    }

    static subscribe(cb: (status: 'idle' | 'playing' | 'paused' | 'buffering', category: 'tts' | 'music' | null, musicUrl: string | null, trackId: string | null) => void) {
        this.listeners.push(cb);
        return () => {
            this.listeners = this.listeners.filter(l => l !== cb);
        };
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
    static async playAudioURL(url: string, onEnd?: () => void, trackId?: string): Promise<void> {
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
            const storageUrl = this.getStorageUrl(url);
            const audio = new Audio();
            audio.src = storageUrl;
            audio.preload = "auto";
            audio.crossOrigin = "anonymous"; // Now safe since you set the CORS rules!
            audio.volume = 0; // Start muted for ramp-up

            this.musicAudio = audio;
            this._currentUrl = url;
            this._musicUrl = url;  // persist separately — never overwritten by TTS
            this._currentTrackId = trackId || null;
            this._activeCategory = 'music';
            this.setStatus('playing');

            audio.onended = () => {
                this.setStatus('idle');
                this._activeCategory = null;
                onEnd?.();
                this.musicAudio = null;
                this._currentUrl = null;
                this._musicUrl = null;
                this._currentTrackId = null;
                
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
                // Subtle volume ramp to avoid pops and feel "instant"
                let currentVol = 0;
                const targetVol = this._volume;
                const ramp = setInterval(() => {
                    currentVol += 0.1;
                    if (currentVol >= targetVol) {
                        audio.volume = targetVol;
                        clearInterval(ramp);
                    } else {
                        audio.volume = currentVol;
                    }
                }, 50);
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
        const target = category || this._activeCategory || 'tts';
        
        // Music is sacred and should always be allowed to resume if it exists
        if (!this._isEnabled && target !== 'music') {
            console.warn("[VoiceService] Cannot resume: VoiceService (TTS) is disabled.");
            return;
        }
        
        const audio = target === 'music' ? this.musicAudio : this.ttsAudio;
        
        console.log(`[VoiceService] Request to Resume: ${target}. Current Status: ${this._status}, ActiveCategory: ${this._activeCategory}`);
        console.log(`[VoiceService] Audio Element State: ${audio ? `exists (readyState=${audio.readyState}, networkState=${audio.networkState}, src=${audio.src ? 'YES' : 'NO'})` : 'NULL'}`);

        if (target === 'tts' && this.ttsAudio) {
            if (this.musicAudio && !this.musicAudio.paused) {
                this._savedMusicTime = this.musicAudio.currentTime;
                this.musicAudio.pause();
                console.log("[VoiceService] Paused music for TTS resume.");
            }
            this._activeCategory = 'tts';
            
            if (this._savedTtsTime > 0) {
                try {
                    this.ttsAudio.currentTime = this._savedTtsTime;
                } catch (e) {}
                this._savedTtsTime = 0;
            }
            
            this.ttsAudio.play().then(() => {
                this.setStatus('playing');
            }).catch(err => {
                console.error("[VoiceService] TTS resume failed", err);
                this.setStatus('idle');
            });
        } else if (target === 'music' && this.musicAudio) {
            const music = this.musicAudio;
            if (this.ttsAudio && !this.ttsAudio.paused) {
                this._savedTtsTime = this.ttsAudio.currentTime;
                this.ttsAudio.pause();
                console.log("[VoiceService] Paused TTS for music resume.");
            }
            
            this._activeCategory = 'music';
            
            // Only seek if we have a saved time that differs from current (e.g. after TTS interruption)
            if (this._savedMusicTime > 0 && Math.abs(music.currentTime - this._savedMusicTime) > 0.5) {
                try {
                    console.log(`[VoiceService] Syncing music to saved time: ${this._savedMusicTime}`);
                    music.currentTime = this._savedMusicTime;
                } catch (e) {
                    console.warn("[VoiceService] Sync failed during resume:", e);
                }
            }
            this._savedMusicTime = 0; 
            
            // Critical hardening: if stalled, force load
            if (music.readyState < 2 && music.src) {
                console.log("[VoiceService] Music state weak (readyState < 2). Forcing load()...");
                music.load();
            }
            
            music.play().then(() => {
                console.log("[VoiceService] Music playback resumed successfully.");
                this.setStatus('playing');
            }).catch(e => {
                console.error("[VoiceService] Music Resume failed:", e);
                this.setStatus('paused');
                
                // One-time recovery attempt
                if (music.readyState === 0 && music.src) {
                    console.log("[VoiceService] Attempting one-time recovery play...");
                    setTimeout(() => music.play().catch(() => {}), 100);
                }
            });
        } else {
            console.warn(`[VoiceService] Cannot resume ${target}: Audio element missing.`);
            this.setStatus('idle');
        }

        if (typeof window !== 'undefined' && window.speechSynthesis && target === 'tts') {
            window.speechSynthesis.resume();
        }
    }

    /** 
     * Stops the current voice guidance (TTS) but keeps background music loaded/playing.
     * This is the default 'cleanup' method used when navigating between screens.
     */
    static stop() {
        this.currentRequestId++; // Invalidate any in-flight requests
        
        this.stopTTS();

        // If music was paused by the TTS being stopped, resume it now
        if (this._activeCategory === 'tts') {
            const hasSavedMusic = this._savedMusicTime > 0;
            this.setStatus('idle');
            this._activeCategory = null;
            
            if (this.musicAudio && hasSavedMusic) {
                this.resume('music');
            }
        }
        
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    /** 
     * Completely stops all audio including background music. 
     * Used for the 'X' close button on players or app shutdown.
     */
    static stopAll() {
        this.currentRequestId++;
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
        this._musicUrl = null;
        this._currentTrackId = null;
    }

    static init(): Promise<void> {
        if (typeof window !== 'undefined') {
            window.addEventListener('pagehide', () => this.stopAll());
            window.addEventListener('beforeunload', () => this.stopAll());
        }
        return Promise.resolve();
    }

    static seek(time: number) {
        const audio = this._activeCategory === 'music' ? this.musicAudio : this.ttsAudio;
        if (audio) {
            audio.currentTime = time;
            if (this._status === 'paused') {
                if (this._activeCategory === 'music') this._savedMusicTime = time;
                else this._savedTtsTime = time;
            }
        }
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
        category: VoiceService.activeCategory,
        musicUrl: VoiceService.musicUrl,
        trackId: VoiceService.currentTrackId
    });
    
    useEffect(() => {
        return VoiceService.subscribe((status, category, musicUrl, trackId) => {
            setState({ status, category, musicUrl, trackId });
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
