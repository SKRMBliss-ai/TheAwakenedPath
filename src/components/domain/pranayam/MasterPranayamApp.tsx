import React, { useState, useEffect, useRef, useCallback } from 'react';
import { buildTimeline, type SessionTimeline } from './sessionTimeline';
import type { PranayamType } from './breathPattern';
import { PranayamCard } from './PranayamCard';
import { CircularTimer } from './CircularTimer';
import { BreathingPhasePanel } from './BreathingPhasePanel';
import { BreathAffirmationCard } from './BreathAffirmationCard';
import { NextRestPreview } from './NextRestPreview';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, Award, Flame } from 'lucide-react';

interface MasterPranayamAppProps {
  onBack?: () => void;
  onComplete?: () => void;
}

const TECHNIQUE_INSTRUCTIONS: Record<PranayamType, string[]> = {
  bhastrika: [
    'Sit comfortably with a straight spine.',
    'Deep inhale through the nose.',
    'Forceful exhale through the nose.',
    'Maintain a steady, rhythmic pace.',
    'End each round holding the breath in.',
  ],
  kapalbhati: [
    'Sit tall in a steady posture.',
    'Passive, natural inhalation.',
    'Sharp, active abdominal exhalation.',
    'Keep face & shoulders relaxed.',
    'End round with deep retention.',
  ],
  anulom_vilom: [
    'Adopt Vishnu Mudra with right hand.',
    'Inhale left nostril (4 sec).',
    'Hold both nostrils (4 sec).',
    'Exhale right nostril (4 sec).',
    'Repeat in reverse to complete cycle.',
  ],
  bahya: [
    'Inhale deeply filling the lungs.',
    'Exhale fully emptying all air.',
    'Perform external retention (Bahya Kumbhaka).',
    'Engage Mahabandha gently.',
    'Release and rest before next round.',
  ],
  bhramari: [
    'Assume Shanmukhi Mudra gently.',
    'Inhale deeply into chest.',
    'Hold breath briefly at top.',
    'Exhale with steady humming sound.',
    'Feel acoustic resonance in brain.',
  ],
};

export const MasterPranayamApp: React.FC<MasterPranayamAppProps> = ({ onBack, onComplete }) => {
  const timelineRef = useRef<SessionTimeline>(buildTimeline('beginner'));
  const timeline = timelineRef.current;

  // App State
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSummary, setShowSummary] = useState(false);

  // Audio Ref Cache to avoid re-triggering clips
  const playedClipsRef = useRef<Set<string>>(new Set());

  // Derive active technique slot index from currentTime
  const activeSlotIndex = timeline.techniques.findIndex((slot, i) => {
    const nextSlot = timeline.techniques[i + 1];
    const slotEnd = nextSlot ? nextSlot.startSec : timeline.T_FINALE;
    return currentTime >= slot.startSec && currentTime < slotEnd;
  });
  const safeSlotIndex = activeSlotIndex >= 0 ? activeSlotIndex : 0;
  const currentSlot = timeline.techniques[safeSlotIndex] || timeline.techniques[0];
  const relTime = Math.max(0, currentTime - currentSlot.startSec);

  // Play audio voice clip helper
  const playVoiceClip = useCallback((clipName: string) => {
    if (!soundEnabled) return;
    try {
      const audio = new Audio(`/media/pranayam/${clipName}`);
      audio.volume = 0.85;
      audio.play().catch(() => {
        // Fallback gracefully if audio blocked
      });
    } catch {
      // Ignore audio errors
    }
  }, [soundEnabled]);

  // Voice Guidance Trigger on technique change
  useEffect(() => {
    if (!isPlaying) return;
    const slot = timeline.techniques[safeSlotIndex];
    if (slot) {
      const voiceClip = `${slot.type}_voice.mp3`;
      if (!playedClipsRef.current.has(voiceClip)) {
        playedClipsRef.current.add(voiceClip);
        playVoiceClip(voiceClip);
      }
    }
  }, [safeSlotIndex, isPlaying, playVoiceClip, timeline]);

  // Main Timer Loop
  useEffect(() => {
    let intervalId: number | null = null;

    if (isPlaying) {
      intervalId = window.setInterval(() => {
        setCurrentTime((prevTime) => {
          const nextTime = prevTime + 0.1;

          // Check for session completion
          if (nextTime >= timeline.SESSION_SEC - 1) {
            setIsPlaying(false);
            setShowSummary(true);
            if (onComplete) onComplete();
            return timeline.SESSION_SEC;
          }

          return nextTime;
        });
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, onComplete, timeline]);

  const togglePlay = () => {
    if (!isPlaying && currentTime === 0) {
      playVoiceClip('intro_voice.mp3');
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#FFFDF8',
      color: '#1C160F',
      fontFamily: "'Outfit', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px 24px 28px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Header Control Bar */}
      <div style={{
        width: '100%',
        maxWidth: '1800px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '14px',
        borderBottom: '1.5px solid rgba(207, 168, 100, 0.25)',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            style={{
              backgroundColor: 'rgba(255, 253, 248, 0.9)',
              border: '1.5px solid rgba(207, 168, 100, 0.4)',
              borderRadius: '16px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontWeight: 700,
              color: '#1C160F',
              fontSize: '13px'
            }}
          >
            <ChevronLeft size={16} />
            <span>RETURN TO MINDGYM</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🪷</span>
            <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', fontWeight: 700, color: '#CFA864', letterSpacing: '0.04em' }}>
              DAILY 5 PRANAYAMA SESSION
            </span>
          </div>
        </div>

        {/* Global Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              backgroundColor: 'rgba(255, 253, 248, 0.9)',
              border: '1.5px solid rgba(207, 168, 100, 0.4)',
              borderRadius: '14px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 700,
              color: '#1C160F'
            }}
          >
            {soundEnabled ? <Volume2 size={16} color="#5a8a6a" /> : <VolumeX size={16} color="#9C8F7E" />}
            <span>{soundEnabled ? 'VOICE ON' : 'MUTED'}</span>
          </button>

          <button
            onClick={togglePlay}
            style={{
              backgroundColor: '#CFA864',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '14px',
              letterSpacing: '0.08em',
              boxShadow: '0 6px 20px rgba(207, 168, 100, 0.35)'
            }}
          >
            {isPlaying ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" />}
            <span>{isPlaying ? 'PAUSE' : 'START PRACTICE'}</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Video Layout Mirroring Screenshot */}
      <div style={{
        width: '100%',
        maxWidth: '1800px',
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '380px 1fr 380px',
        gap: '24px',
        alignItems: 'stretch',
        boxSizing: 'border-box'
      }}>
        {/* LEFT COLUMN: PranayamCard */}
        <div style={{ width: '100%', height: '100%' }}>
          <PranayamCard
            number={currentSlot.index}
            title={currentSlot.title}
            sanskritName={currentSlot.sanskrit}
            durationMinutes={5}
            instructions={TECHNIQUE_INSTRUCTIONS[currentSlot.type]}
          />
        </div>

        {/* CENTER COLUMN: CircularTimer & Affirmation Card */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          width: '100%',
          height: '100%'
        }}>
          {/* Main Ring Canvas Card */}
          <div style={{
            width: '100%',
            flex: 1,
            backgroundColor: 'rgba(255, 253, 248, 0.85)',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            outline: '1.5px solid rgba(207, 168, 100, 0.35)',
            borderRadius: '32px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(122, 106, 88, 0.12)',
            backdropFilter: 'blur(30px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <CircularTimer relTime={relTime} type={currentSlot.type} level="beginner" />
          </div>

          {/* Bottom Affirmation Card */}
          <div style={{ width: '100%' }}>
            <BreathAffirmationCard />
          </div>
        </div>

        {/* RIGHT COLUMN: BreathingPhasePanel & NextRestPreview */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '20px',
          width: '100%',
          height: '100%'
        }}>
          {/* Technique Pattern Panel */}
          <div style={{ flex: 1, width: '100%' }}>
            <BreathingPhasePanel relTime={relTime} type={currentSlot.type} level="beginner" />
          </div>

          {/* Next Rest Preview Card */}
          <div style={{ width: '100%' }}>
            <NextRestPreview label="NEXT: 10 SEC RELAXATION" durationSec={10} />
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showSummary && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          backgroundColor: 'rgba(28, 22, 15, 0.85)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: '#FFFDF8',
            border: '2px solid #CFA864',
            borderRadius: '32px',
            padding: '40px',
            maxWidth: '520px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.4)'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(207, 168, 100, 0.2)', border: '2px solid #CFA864', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={36} color="#CFA864" />
            </div>

            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '32px', fontWeight: 700, color: '#1C160F', marginBottom: '4px' }}>
                DAILY 5 PRANAYAMA COMPLETE!
              </div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', color: '#6A5F52' }}>
                You completed all 5 beginner techniques (25 minutes total practice).
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '10px' }}>
              <div style={{ flex: 1, backgroundColor: 'rgba(207, 168, 100, 0.1)', border: '1.5px solid rgba(207, 168, 100, 0.3)', padding: '16px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Flame size={20} color="#CFA864" />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 800, color: '#1C160F', marginTop: '4px' }}>+250 XP</span>
                <span style={{ fontSize: '11px', color: '#6A5F52', fontWeight: 700 }}>MINDGYM EARNED</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSummary(false);
                if (onBack) onBack();
              }}
              style={{
                width: '100%',
                backgroundColor: '#CFA864',
                color: '#ffffff',
                border: 'none',
                borderRadius: '20px',
                padding: '16px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: '0.08em',
                marginTop: '10px'
              }}
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterPranayamApp;
