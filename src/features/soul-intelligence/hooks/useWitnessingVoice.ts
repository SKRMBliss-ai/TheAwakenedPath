import { useState, useCallback, useRef, useEffect } from 'react';
import { getWitnessingReflection } from '../services/geminiService';

/**
 * HOOK: useWitnessingVoice
 * Handles Voice-to-Text (VTT) and Text-to-Voice (TTV) for Silence exercises.
 */

export function useWitnessingVoice() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [reflection, setReflection] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeCharIndex, setActiveCharIndex] = useState(-1);
    const recognitionRef = useRef<any>(null);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, []);

    const speak = useCallback((text: string) => {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        setActiveCharIndex(-1);

        const utternance = new SpeechSynthesisUtterance(text);
        utternance.rate = 0.9; // Slightly slower
        utternance.pitch = 1.0;

        utternance.onboundary = (event) => {
            if (event.name === 'word') {
                setActiveCharIndex(event.charIndex);
            }
        };

        utternance.onend = () => {
            setActiveCharIndex(-1);
        };

        // Choose a calming voice if available
        const voices = window.speechSynthesis.getVoices();

        // Priority list for more natural voices
        const preferredVoices = [
            'Google UK English Female',
            'Microsoft Zira',
            'Google US English',
            'Samantha'
        ];

        let selectedVoice = null;

        // Try to match preferred voices first
        for (const name of preferredVoices) {
            selectedVoice = voices.find(v => v.name.includes(name));
            if (selectedVoice) break;
        }

        // Fallback to any Google or Microsoft voice
        if (!selectedVoice) {
            selectedVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft'));
        }

        if (selectedVoice) {
            utternance.voice = selectedVoice;
            console.log("Selected voice:", selectedVoice.name);
        } else {
            console.log(" using default voice");
        }

        window.speechSynthesis.speak(utternance);
    }, []);

    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setReflection("Voice recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
            setReflection('');
            setActiveCharIndex(-1);
        };

        recognition.onresult = async (event: any) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            setIsProcessing(true);

            // Get AI Reflection
            const aiResponse = await getWitnessingReflection(text);
            setReflection(aiResponse);
            setIsProcessing(false);

            // Convert Text to Voice
            speak(aiResponse);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [speak]);

    // Stop speech when component unmounts or visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                window.speechSynthesis.cancel();
                setActiveCharIndex(-1);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.speechSynthesis.cancel();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    return {
        isListening,
        transcript,
        reflection,
        isProcessing,
        activeCharIndex,
        startListening,
        stopListening
    };
}
