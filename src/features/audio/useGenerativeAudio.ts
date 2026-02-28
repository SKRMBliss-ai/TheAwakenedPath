import { useState, useRef, useEffect, useCallback } from 'react';

// Generates procedural binaural beats + atmospheric drone
export const useGenerativeAudio = () => {
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);

    const ctxRef = useRef<AudioContext | null>(null);
    const masterGain = useRef<GainNode | null>(null);

    // Oscillators for Binaural Beats
    const leftOsc = useRef<OscillatorNode | null>(null);
    const rightOsc = useRef<OscillatorNode | null>(null);

    // Drone Synth
    const droneOsc = useRef<OscillatorNode | null>(null);
    const droneFilter = useRef<BiquadFilterNode | null>(null);

    // LFO for slow breathing effect
    const lfo = useRef<OscillatorNode | null>(null);
    const lfoGain = useRef<GainNode | null>(null);

    const FADE_TIME = 2.0;

    const initAudio = () => {
        if (ctxRef.current) return;

        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        ctxRef.current = new AudioContext();

        // 1. Master Gain
        masterGain.current = ctxRef.current.createGain();
        masterGain.current.gain.value = 0; // Start silent
        masterGain.current.connect(ctxRef.current.destination);

        // 2. Binaural Beats (432Hz Base + 4Hz Beat for Theta state)
        leftOsc.current = ctxRef.current.createOscillator();
        leftOsc.current.type = 'sine';
        leftOsc.current.frequency.value = 432;

        // Left panner
        // @ts-ignore - StereoPannerNode is supported in modern browsers
        const leftPan = ctxRef.current.createStereoPanner ? ctxRef.current.createStereoPanner() : ctxRef.current.createPanner();
        if ('pan' in leftPan) leftPan.pan.value = -1;

        leftOsc.current.connect(leftPan);
        leftPan.connect(masterGain.current);

        rightOsc.current = ctxRef.current.createOscillator();
        rightOsc.current.type = 'sine';
        rightOsc.current.frequency.value = 436; // 4Hz difference

        // @ts-ignore
        const rightPan = ctxRef.current.createStereoPanner ? ctxRef.current.createStereoPanner() : ctxRef.current.createPanner();
        if ('pan' in rightPan) rightPan.pan.value = 1;

        rightOsc.current.connect(rightPan);
        rightPan.connect(masterGain.current);

        leftOsc.current.start();
        rightOsc.current.start();

        // 3. Drone Synthesis (Low frequency, filtered)
        droneOsc.current = ctxRef.current.createOscillator();
        droneOsc.current.type = 'triangle'; // Richer harmonics
        droneOsc.current.frequency.value = 108; // Sub-harmonic of 432 (432 / 4)

        droneFilter.current = ctxRef.current.createBiquadFilter();
        droneFilter.current.type = 'lowpass';
        droneFilter.current.frequency.value = 200; // Warm, muffled sound
        droneFilter.current.Q.value = 1;

        // Sub-gain to mix drone beneath binaural beats
        const droneGain = ctxRef.current.createGain();
        droneGain.gain.value = 0.4;

        droneOsc.current.connect(droneFilter.current);
        droneFilter.current.connect(droneGain);
        droneGain.connect(masterGain.current);

        droneOsc.current.start();

        // 4. LFO (Low-Frequency Oscillator) to create a "breathing" swell
        lfo.current = ctxRef.current.createOscillator();
        lfo.current.type = 'sine';
        lfo.current.frequency.value = 0.05; // 20 seconds per cycle (slow breathing)

        lfoGain.current = ctxRef.current.createGain();
        lfoGain.current.gain.value = 100; // Modulate filter cutoff up/down by 100Hz

        lfo.current.connect(lfoGain.current);
        lfoGain.current.connect(droneFilter.current.frequency);

        lfo.current.start();
    };

    const toggleAudio = useCallback(() => {
        if (!ctxRef.current) initAudio();

        const ctx = ctxRef.current!;
        const gain = masterGain.current!.gain;

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        if (isAudioEnabled) {
            // Fade out
            gain.setValueAtTime(gain.value, ctx.currentTime);
            gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_TIME);
            setTimeout(() => {
                if (ctx.state === 'running') ctx.suspend();
            }, FADE_TIME * 1000 + 100);
            setIsAudioEnabled(false);
        } else {
            // Fade in
            ctx.resume().then(() => {
                gain.setValueAtTime(gain.value, ctx.currentTime);
                gain.linearRampToValueAtTime(0.3, ctx.currentTime + FADE_TIME); // Cap volume to 30%
                setIsAudioEnabled(true);
            });
        }
    }, [isAudioEnabled]);

    // Expose a method to shift frequencies based on app state
    // e.g., 'calm' (432Hz), 'focus' (528Hz), 'energy' (639Hz)
    const setVibrationalState = useCallback((state: 'calm' | 'focus' | 'energy') => {
        if (!ctxRef.current || !leftOsc.current || !rightOsc.current || !droneOsc.current) return;

        const ctx = ctxRef.current;

        let baseFreq = 432;
        let beatFreq = 4; // Theta
        let lfoRate = 0.05;

        if (state === 'focus') {
            baseFreq = 528;
            beatFreq = 14; // Beta (active)
            lfoRate = 0.1; // Faster breathing
        } else if (state === 'energy') {
            baseFreq = 639;
            beatFreq = 40; // Gamma (high-level processing)
            lfoRate = 0.2;
        }

        // Smoothly glide to new frequencies over 3 seconds
        const time = ctx.currentTime + 3;
        leftOsc.current.frequency.linearRampToValueAtTime(baseFreq, time);
        rightOsc.current.frequency.linearRampToValueAtTime(baseFreq + beatFreq, time);
        droneOsc.current.frequency.linearRampToValueAtTime(baseFreq / 4, time);
        lfo.current?.frequency.linearRampToValueAtTime(lfoRate, time);

    }, []);

    return { isAudioEnabled, toggleAudio, setVibrationalState };
};
