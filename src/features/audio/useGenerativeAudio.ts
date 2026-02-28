import { useState, useRef, useCallback } from 'react';

// Generates procedural binaural beats + atmospheric drone
export const useGenerativeAudio = () => {
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);

    const ctxRef = useRef<AudioContext | null>(null);
    const masterGain = useRef<GainNode | null>(null);

    // Oscillators for Binaural Beats
    const leftOsc = useRef<OscillatorNode | null>(null);
    const rightOsc = useRef<OscillatorNode | null>(null);

    // Drone Synth Arrays
    const droneOscs = useRef<OscillatorNode[]>([]);

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

        // 3. Ethereal Singing Bowl / Pad (Layered Sine Waves)
        // Three pure sine waves (root, slightly detuned root, and an octave up)
        const droneFrequencies = [108, 108.5, 216];
        const droneGains = [0.4, 0.4, 0.1]; // Octave is very subtle

        // Sub-mix for the drone
        const droneMasterGain = ctxRef.current.createGain();
        droneMasterGain.gain.value = 0.5;

        // Massive deep space delay feedback loop (creates a lush, temple-like reverb wash)
        const delay = ctxRef.current.createDelay(4.0);
        delay.delayTime.value = 3.14; // Pi seconds for organic rhythm
        const feedback = ctxRef.current.createGain();
        feedback.gain.value = 0.65; // High feedback for long trailing wash

        delay.connect(feedback);
        feedback.connect(delay);

        // Connect the drone directly to master AND into the delay wash
        droneMasterGain.connect(masterGain.current);
        droneMasterGain.connect(delay);
        delay.connect(masterGain.current); // Bring the delayed wash into the master out

        droneOscs.current = droneFrequencies.map((freq, i) => {
            const osc = ctxRef.current!.createOscillator();
            osc.type = 'sine'; // Pure rounded tone, no buzz
            osc.frequency.value = freq;

            const oscGain = ctxRef.current!.createGain();
            oscGain.gain.value = droneGains[i];

            // Pan them slowly across the stereo field
            // @ts-ignore
            const panner = ctxRef.current!.createStereoPanner ? ctxRef.current!.createStereoPanner() : ctxRef.current!.createPanner();
            if ('pan' in panner) {
                panner.pan.value = i === 1 ? -0.4 : (i === 2 ? 0.4 : 0);
            }

            osc.connect(oscGain);
            oscGain.connect(panner);
            panner.connect(droneMasterGain);

            osc.start();
            return osc;
        });

        // 4. LFO (Low-Frequency Oscillator) to create a "breathing" swell on the volume (Tremolo effect)
        lfo.current = ctxRef.current.createOscillator();
        lfo.current.type = 'sine';
        lfo.current.frequency.value = 0.05; // 20 seconds per cycle (slow deep breathing)

        lfoGain.current = ctxRef.current.createGain();
        lfoGain.current.gain.value = 0.25; // Modulate drone volume by +/- 25%

        lfo.current.connect(lfoGain.current);
        lfoGain.current.connect(droneMasterGain.gain);

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
        if (!ctxRef.current || !leftOsc.current || !rightOsc.current) return;

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

        // Glide the drone layered chords
        if (droneOscs.current.length === 3) {
            droneOscs.current[0].frequency.linearRampToValueAtTime(baseFreq / 4, time);
            droneOscs.current[1].frequency.linearRampToValueAtTime((baseFreq / 4) + 0.5, time); // stay slightly detuned
            droneOscs.current[2].frequency.linearRampToValueAtTime(baseFreq / 2, time); // glide octave
        }

        lfo.current?.frequency.linearRampToValueAtTime(lfoRate, time);

    }, []);

    return { isAudioEnabled, toggleAudio, setVibrationalState };
};
