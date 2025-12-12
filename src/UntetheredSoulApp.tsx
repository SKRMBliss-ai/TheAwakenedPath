import { useState, useEffect } from 'react';
import { Heart, Award, Flame, BookOpen, Sparkles, Target, Clock, Eye, Wind, Star, Lock, ChevronRight, Zap, Sun, Moon, Play, Pause, RotateCcw } from 'lucide-react';

export default function UntetheredApp() {
  const [activeTab, setActiveTab] = useState('journey');
  const [darkMode, setDarkMode] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activePractice, setActivePractice] = useState<any>(null);
  const [practiceState, setPracticeState] = useState('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [selectedBook, setSelectedBook] = useState<'soul' | 'now' | 'zen'>('soul');
  const [showReward, setShowReward] = useState(null);
  const [thoughts, setThoughts] = useState([]);

  const user = {
    level: 5,
    xp: 920,
    xpToNext: 1000,
    streak: 7,
    energy: 72,
    witnessPoints: 145,
    presencePoints: 128,
    zenPoints: 87,
    nowMoments: 42,
    breathSessions: 18
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // Breathing animation
  useEffect(() => {
    if (activePractice?.type === 'breath' && practiceState === 'active') {
      const pattern = activePractice.breathPattern;
      const phases = ['inhale', 'hold', 'exhale', 'rest'];
      let phaseIndex = 0;

      const interval = setInterval(() => {
        setBreathPhase(phases[phaseIndex]);
        phaseIndex = (phaseIndex + 1) % phases.length;
        if (phaseIndex === 0) setBreathCount(prev => prev + 1);
      }, pattern[phaseIndex % pattern.length] * 1000);

      return () => clearInterval(interval);
    }
  }, [activePractice, practiceState]);

  // Thought generation for witness practice
  useEffect(() => {
    if (activePractice?.type === 'witness' && practiceState === 'active') {
      const thoughtsList = [
        "What if I fail?", "I should have...", "They think I'm...",
        "I need to...", "Why did I...", "Tomorrow I must...",
        "I'm not good enough", "What will they say?", "I forgot to..."
      ];

      const interval = setInterval(() => {
        const randomThought = thoughtsList[Math.floor(Math.random() * thoughtsList.length)];
        const newThought = {
          id: Date.now(),
          text: randomThought,
          x: Math.random() * 70 + 10,
          y: Math.random() * 60 + 10
        };
        setThoughts(prev => [...prev.slice(-4), newThought]);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activePractice, practiceState]);

  const practices = [
    {
      id: 1,
      title: "3-Step Rhythmic Breathing",
      icon: "🌬️",
      xp: 35,
      duration: 300,
      type: "breath",
      book: "zen",
      level: "beginner",
      breathPattern: [3, 3, 3, 3],
      steps: [
        {
          title: "Understanding the Practice",
          instruction: "You will breathe in a 3-3-3-3 pattern: Inhale for 3 seconds, Hold for 3 seconds, Exhale for 3 seconds, Rest for 3 seconds.",
          guidance: "This foundational breath calms the nervous system and brings you into your body. Perfect for starting your day.",
          visual: "info"
        },
        {
          title: "Find Your Position",
          instruction: "Sit comfortably with spine straight. Place one hand on your belly, one on your chest.",
          guidance: "Feel your belly expand with each inhale. This is diaphragmatic breathing - the most natural and healing way to breathe.",
          duration: 30,
          visual: "position"
        },
        {
          title: "Begin Breathing",
          instruction: "Follow the visual guide. Breathe deeply and naturally. Complete 10 full cycles.",
          guidance: "If your mind wanders, gently bring attention back to the breath. This is the practice.",
          visual: "breath"
        }
      ]
    },
    {
      id: 2,
      title: "Witness Consciousness",
      icon: "👁️",
      xp: 40,
      duration: 420,
      type: "witness",
      book: "soul",
      level: "intermediate",
      steps: [
        {
          title: "The Core Teaching",
          instruction: "You are not the voice in your head. You are the one who hears it.",
          guidance: "Michael Singer teaches: There's a constant narrator in your mind. But who is listening? That awareness - that's your true self.",
          visual: "info"
        },
        {
          title: "Identify the Voice",
          instruction: "Close your eyes. Listen to your mental chatter for 30 seconds.",
          guidance: "Notice how it never stops. It comments, judges, plans, worries. This is your 'inner roommate.'",
          duration: 30,
          visual: "listen"
        },
        {
          title: "Step Back as Observer",
          instruction: "Now ask: 'Who is hearing these thoughts?' Step back and watch them like clouds passing.",
          guidance: "You are the vast sky, not the passing clouds. Practice this detachment for 5 minutes.",
          duration: 300,
          visual: "witness"
        },
        {
          title: "Release and Let Go",
          instruction: "When thoughts hook you, notice the hook, then consciously let go. Relax behind the thoughts.",
          guidance: "The practice is simple: Notice, don't engage, let go. This is freedom.",
          duration: 90,
          visual: "release"
        }
      ]
    },
    {
      id: 3,
      title: "Inner Body Awareness",
      icon: "⚡",
      xp: 30,
      duration: 300,
      type: "presence",
      book: "now",
      level: "beginner",
      steps: [
        {
          title: "Eckhart Tolle's Gateway",
          instruction: "Feel the aliveness inside your body. This is your portal to NOW.",
          guidance: "Most people are trapped in their minds. Your inner body is always in the present moment - use it as an anchor.",
          visual: "info"
        },
        {
          title: "Feel Your Hands",
          instruction: "Close your eyes. Focus all attention on your hands. Feel the subtle energy, tingling, aliveness.",
          guidance: "Don't think about your hands - FEEL them from within. This is presence.",
          duration: 60,
          visual: "hands"
        },
        {
          title: "Expand Awareness",
          instruction: "Now expand: arms, chest, legs. Feel your whole body from within as a unified energy field.",
          guidance: "Stay with the feeling. If mind wanders to thoughts, return to feeling your inner body.",
          duration: 180,
          visual: "body"
        },
        {
          title: "Daily Integration",
          instruction: "Practice this anytime, anywhere: waiting in line, before meetings, walking.",
          guidance: "Even 10 seconds of inner body awareness breaks the mind's dominance and brings you to NOW.",
          duration: 60,
          visual: "integrate"
        }
      ]
    },
    {
      id: 4,
      title: "Box Breathing (Navy SEAL Technique)",
      icon: "📦",
      xp: 35,
      duration: 300,
      type: "breath",
      book: "zen",
      level: "beginner",
      breathPattern: [4, 4, 4, 4],
      steps: [
        {
          title: "The Military Calm",
          instruction: "Used by Navy SEALs for stress control. Equal parts: 4-4-4-4.",
          guidance: "This technique activates your parasympathetic nervous system, bringing instant calm and mental clarity.",
          visual: "info"
        },
        {
          title: "Visualize the Box",
          instruction: "Imagine tracing a box: Up (inhale 4), Right (hold 4), Down (exhale 4), Left (hold 4).",
          guidance: "The equal timing creates perfect balance in your nervous system.",
          duration: 30,
          visual: "box"
        },
        {
          title: "Practice Rounds",
          instruction: "Complete 10 full box breaths. Count silently with each phase.",
          guidance: "Feel your heart rate slow. Notice mental clarity increase. This is your reset button.",
          visual: "breath"
        }
      ]
    },
    {
      id: 5,
      title: "Pain-Body Observation",
      icon: "🎭",
      xp: 45,
      duration: 480,
      type: "presence",
      book: "now",
      level: "advanced",
      steps: [
        {
          title: "Understanding Pain-Body",
          instruction: "Tolle teaches: Your accumulated emotional pain has its own energy field - the 'pain-body.'",
          guidance: "It feeds on negative thinking and drama. When you become aware of it, you stop feeding it.",
          visual: "info"
        },
        {
          title: "Detect Activation",
          instruction: "Notice when emotional reactions seem disproportionate. That's your pain-body activating.",
          guidance: "Common triggers: criticism, feeling ignored, rejection, injustice. Your pain-body loves these.",
          duration: 60,
          visual: "detect"
        },
        {
          title: "Witness Without Judgment",
          instruction: "When triggered, don't fight the feeling. Observe it like a scientist. 'There it is. The pain-body is active.'",
          guidance: "Bring presence to the pain. Feel it in your body. Your conscious attention begins to dissolve it.",
          duration: 300,
          visual: "observe"
        },
        {
          title: "Break the Pattern",
          instruction: "Refuse to think negative thoughts about the situation. Stay present with the body sensation only.",
          guidance: "This breaks the pain-body's fuel source. You've started healing decades of accumulated pain.",
          duration: 120,
          visual: "heal"
        }
      ]
    },
    {
      id: 6,
      title: "Heart Center Opening",
      icon: "💚",
      xp: 50,
      duration: 600,
      type: "energy",
      book: "soul",
      level: "intermediate",
      steps: [
        {
          title: "The Energy of Love",
          instruction: "Michael Singer: Your heart is an energy center. When open, you experience unconditional love and joy.",
          guidance: "Most people's hearts are closed due to fear and past pain. This practice teaches you to keep it open.",
          visual: "info"
        },
        {
          title: "Notice Heart Closure",
          instruction: "Throughout the day, notice when your chest tightens. This is your heart closing in protection.",
          guidance: "Fear, judgment, resistance - all close the heart. Simply noticing is the first step.",
          duration: 90,
          visual: "notice"
        },
        {
          title: "Conscious Opening",
          instruction: "Breathe into your chest. Imagine a flower blooming. Relax the tightness. Open, open, open.",
          guidance: "You may feel vulnerable. That's okay. Vulnerability IS openness. Stay with it.",
          duration: 300,
          visual: "open"
        },
        {
          title: "Maintain Throughout Day",
          instruction: "Set intention: 'I will keep my heart open no matter what happens today.'",
          guidance: "When it closes (and it will), consciously reopen it. This is the practice of unconditional love.",
          duration: 210,
          visual: "maintain"
        }
      ]
    }
  ];

  const quickPractices = [
    {
      id: 1,
      title: "3-Breath Reset",
      icon: "🌬️",
      xp: 10,
      duration: 30,
      type: "breath",
      book: "zen",
      level: "beginner",
      breathPattern: [4, 4, 4, 4],
      steps: [
        {
          title: "Quick Reset",
          instruction: "Take 3 deep belly breaths. Inhale fully, exhale completely.",
          guidance: "This instantly calms your nervous system.",
          duration: 30,
          visual: "breath"
        }
      ]
    },
    {
      id: 2,
      title: "Witness Check",
      icon: "👁️",
      xp: 15,
      duration: 60,
      type: "witness",
      book: "soul",
      level: "beginner",
      steps: [
        {
          title: "Quick Witness",
          instruction: "Ask yourself: 'Who is aware of my thoughts right now?'",
          guidance: "Notice the observer. That's your true self.",
          duration: 60,
          visual: "witness"
        }
      ]
    },
    {
      id: 3,
      title: "Now Moment",
      icon: "⚡",
      xp: 12,
      duration: 45,
      type: "presence",
      book: "now",
      level: "beginner",
      steps: [
        {
          title: "Present Moment",
          instruction: "Look around. Name 5 things you see. Come fully into THIS moment.",
          guidance: "Your senses are always in the now.",
          duration: 45,
          visual: "presence"
        }
      ]
    },
    {
      id: 4,
      title: "Heart Opening",
      icon: "💚",
      xp: 15,
      duration: 60,
      type: "energy",
      book: "soul",
      level: "beginner",
      steps: [
        {
          title: "Open Your Heart",
          instruction: "Place hand on heart. Breathe deeply. Consciously relax and open your chest.",
          guidance: "Feel the warmth spreading from your heart center.",
          duration: 60,
          visual: "energy"
        }
      ]
    }
  ];

  const chapters = {
    soul: [
      {
        id: 1,
        title: "The Voice Inside Your Head",
        done: 5,
        total: 5,
        xp: 100,
        unlocked: true,
        completed: true,
        lessons: [
          "Who is talking? Who is listening?",
          "The constant mental narrator",
          "You are not your thoughts",
          "The freedom of awareness",
          "Living behind the voice"
        ]
      },
      {
        id: 2,
        title: "Your Inner Roommate",
        done: 6,
        total: 6,
        xp: 150,
        unlocked: true,
        completed: true,
        lessons: [
          "Would you live with this roommate?",
          "The neurotic inner dialogue",
          "Stepping back from the mind",
          "Finding the quiet space",
          "Becoming the observer",
          "Liberation from mental tyranny"
        ]
      },
      {
        id: 3,
        title: "Who Are You?",
        done: 3,
        total: 7,
        xp: 200,
        unlocked: true,
        completed: false,
        lessons: [
          "The seat of consciousness",
          "Pure awareness exercise",
          "Beyond body and mind",
          "The unchanging witness",
          "Your true nature",
          "Living from the Self",
          "Freedom from identity"
        ]
      }
    ],
    now: [
      {
        id: 4,
        title: "You Are Not Your Mind",
        done: 6,
        total: 6,
        xp: 120,
        unlocked: true,
        completed: true,
        lessons: [
          "The thinking mind is a tool",
          "Compulsive thinking identification",
          "Liberation from mind",
          "Watching the thinker",
          "Gaps between thoughts",
          "The power of presence"
        ]
      },
      {
        id: 5,
        title: "Consciousness: The Way Out",
        done: 4,
        total: 7,
        xp: 150,
        unlocked: true,
        completed: false,
        lessons: [
          "Breaking mind identification",
          "Dis-identification practice",
          "Present moment awareness",
          "The witnessing presence",
          "Freedom from thought",
          "Consciousness transformation",
          "Being vs. thinking"
        ]
      },
      {
        id: 6,
        title: "Moving Deeply Into the Now",
        done: 2,
        total: 8,
        xp: 180,
        unlocked: true,
        completed: false,
        lessons: [
          "Inner body awareness portal",
          "Feeling the energy field",
          "Rooting in the present",
          "The power of now practice",
          "Dissolving time",
          "Pure presence exercise",
          "Being-realization",
          "Living enlightenment"
        ]
      }
    ],
    zen: [
      {
        id: 7,
        title: "Foundation of Breath",
        done: 5,
        total: 5,
        xp: 140,
        unlocked: true,
        completed: true,
        lessons: [
          "Diaphragmatic breathing mastery",
          "3-step rhythmic pattern",
          "Breath as life force (Prana)",
          "Nervous system regulation",
          "Daily breath practice"
        ]
      },
      {
        id: 8,
        title: "Breath-Body Unity",
        done: 3,
        total: 7,
        xp: 160,
        unlocked: true,
        completed: false,
        lessons: [
          "Movement-breath coordination",
          "Sun salutation with breath",
          "Warrior poses flow",
          "Breath in stillness",
          "Energy channel awareness",
          "Mindful movement",
          "Integration practice"
        ]
      },
      {
        id: 9,
        title: "Advanced Pranayama",
        done: 1,
        total: 6,
        xp: 180,
        unlocked: false,
        completed: false,
        lessons: [
          "Alternate nostril breathing",
          "Ujjayi (victorious breath)",
          "Kapalabhati (skull shining)",
          "Breath retention mastery",
          "Energy lock techniques",
          "Full pranayama sequence"
        ]
      }
    ]
  };

  const handleComplete = (practice) => {
    setShowReward({ xp: practice.xp, title: practice.title, icon: practice.icon });
    setTimeout(() => {
      setShowReward(null);
      setActivePractice(null);
      setPracticeState('intro');
      setCurrentStep(0);
    }, 3000);
  };

  const startPractice = () => {
    setPracticeState('active');
    if (activePractice.steps[currentStep].duration) {
      setTimer(activePractice.steps[currentStep].duration);
      setIsTimerRunning(true);
    }
  };

  const nextStep = () => {
    if (currentStep < activePractice.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsTimerRunning(false);
      setTimer(0);
      setPracticeState('intro');
    } else {
      handleComplete(activePractice);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderBreathVisual = () => {
    const size = breathPhase === 'inhale' ? 160 : breathPhase === 'hold' ? 160 : breathPhase === 'exhale' ? 80 : 100;
    const colors = {
      inhale: { from: '#06b6d4', to: '#3b82f6', text: 'Breathe In' },
      hold: { from: '#8b5cf6', to: '#6366f1', text: 'Hold' },
      exhale: { from: '#10b981', to: '#059669', text: 'Breathe Out' },
      rest: { from: '#6b7280', to: '#4b5563', text: 'Rest' }
    };

    const current = colors[breathPhase];

    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          <div
            className="rounded-full transition-all duration-1000 ease-in-out flex items-center justify-center"
            style={{
              width: size,
              height: size,
              background: `linear-gradient(135deg, ${current.from}, ${current.to})`,
              boxShadow: `0 0 60px ${current.from}80, 0 0 100px ${current.from}40`
            }}
          >
            <div className="text-white text-center">
              <div className="text-2xl font-bold">{current.text}</div>
              <div className="text-4xl font-bold mt-2">{activePractice.breathPattern[0]}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <div className="text-5xl font-bold" style={{ color: '#ABCEC9' }}>{breathCount}</div>
          <div className="text-sm mt-1" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Breath Cycles</div>
          <div className="text-xs mt-4" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
            {breathCount < 5 ? "Keep breathing naturally..." : breathCount < 10 ? "You're doing great!" : "Excellent! Feel the calm."}
          </div>
        </div>
      </div>
    );
  };

  const renderWitnessVisual = () => (
    <div className="relative h-80 flex items-center justify-center rounded-2xl overflow-hidden" style={{
      background: darkMode ? 'rgba(30,30,35,0.65)' : 'rgba(255,255,255,0.55)',
      border: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)')
    }}>
      <div style={{
        width: 120, height: 120, borderRadius: '50%',
        background: 'linear-gradient(135deg, #ABCEC9, #C3B8D5)',
        boxShadow: '0 0 80px rgba(171, 206, 201, 0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        <Eye className="w-16 h-16 text-black" />
      </div>

      {thoughts.map((thought) => (
        <div
          key={thought.id}
          className="absolute bg-white bg-opacity-90 px-4 py-2 rounded-full text-sm text-black shadow-lg transition-all duration-500"
          style={{
            left: thought.x + '%',
            top: thought.y + '%',
            animation: 'fadeIn 0.5s ease-in'
          }}
        >
          {thought.text}
        </div>
      ))}

      <div className="absolute bottom-4 left-0 right-0 text-center text-xs" style={{ color: '#ABCEC9' }}>
        Watch thoughts arise and pass. You are the space in which they appear.
      </div>
    </div>
  );

  const renderPresenceVisual = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative mb-8">
        <div
          className="rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center"
          style={{
            width: 140,
            height: 140,
            boxShadow: '0 0 80px rgba(251, 146, 60, 0.75)',
            animation: 'pulse 3s ease-in-out infinite'
          }}
        >
          <Clock className="w-16 h-16 text-white" />
        </div>
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping" />
      </div>

      <div className="text-center space-y-4">
        <p className="text-3xl font-bold" style={{ color: '#ABCEC9' }}>THIS MOMENT</p>
        <p className="text-xl" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>is all there is</p>

        <div className="mt-6 p-4 rounded-xl" style={{
          background: darkMode ? 'rgba(30,30,35,0.65)' : 'rgba(255,255,255,0.55)',
          border: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)')
        }}>
          <p className="text-sm" style={{ color: darkMode ? '#f8fafc' : '#1e293b' }}>
            Feel your body. Hear the sounds around you. You are HERE. You are NOW.
          </p>
        </div>
      </div>
    </div>
  );

  const renderPracticeModal = () => {
    if (!activePractice) return null;

    const currentStepData = activePractice.steps[currentStep];

    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
        <div className="w-full max-w-2xl rounded-3xl overflow-hidden" style={{
          background: darkMode ? 'rgba(30,30,35,0.98)' : 'rgba(255,255,255,0.98)',
          border: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'),
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-6 text-white relative">
            <button
              onClick={() => {
                setActivePractice(null);
                setPracticeState('intro');
                setCurrentStep(0);
                setIsTimerRunning(false);
              }}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-20 transition-all"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-3">
              <div className="text-6xl">{activePractice.icon}</div>
              <div>
                <div className="text-xs opacity-80 mb-1">
                  {activePractice.book === 'soul' ? '📖 Untethered Soul' : activePractice.book === 'now' ? '⚡ Power of Now' : '🧘 Zen Yoga'} • {activePractice.level.toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold">{activePractice.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(activePractice.duration)}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-300" />
                +{activePractice.xp} XP
              </div>
              <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                Step {currentStep + 1} of {activePractice.steps.length}
              </div>
            </div>
          </div>

          <div className="p-6">
            {practiceState === 'intro' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{
                  background: darkMode ? 'rgba(171, 206, 201, 0.1)' : 'rgba(171, 206, 201, 0.15)',
                  border: '1px solid rgba(171, 206, 201, 0.3)'
                }}>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#ABCEC9' }}>
                    {currentStepData.title}
                  </h3>
                  <p className="text-lg mb-3">{currentStepData.instruction}</p>
                  <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                    {currentStepData.guidance}
                  </p>
                </div>

                {currentStepData.duration && (
                  <div className="text-center p-3 rounded-xl" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                    <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: '#ABCEC9' }} />
                    <div className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                      Duration: {formatTime(currentStepData.duration)}
                    </div>
                  </div>
                )}

                <button
                  onClick={startPractice}
                  className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #ABCEC9, #C3B8D5)',
                    color: '#000000',
                    boxShadow: '0 0 30px rgba(171, 206, 201, 0.45)'
                  }}
                >
                  <Play className="w-6 h-6" />
                  {currentStepData.duration ? 'Begin Practice' : 'Continue'}
                </button>
              </div>
            )}

            {practiceState === 'active' && (
              <div className="space-y-6">
                {timer > 0 && (
                  <div className="text-center">
                    <div className="text-6xl font-bold mb-2" style={{ color: '#ABCEC9' }}>
                      {formatTime(timer)}
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all"
                        style={{ background: 'linear-gradient(135deg, #ABCEC9, #C3B8D5)' }}
                      >
                        {isTimerRunning ? <Pause className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black" />}
                      </button>
                      <button
                        onClick={() => {
                          setTimer(currentStepData.duration);
                          setIsTimerRunning(false);
                        }}
                        className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-all"
                        style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  {activePractice.type === 'breath' && renderBreathVisual()}
                  {activePractice.type === 'witness' && renderWitnessVisual()}
                  {activePractice.type === 'presence' && renderPresenceVisual()}
                  {activePractice.type === 'energy' && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="relative mb-6">
                        <div
                          className="rounded-full flex items-center justify-center"
                          style={{
                            width: 140,
                            height: 140,
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            boxShadow: '0 0 80px rgba(16, 185, 129, 0.75)',
                            animation: 'pulse 2s ease-in-out infinite'
                          }}
                        >
                          <Heart className="w-16 h-16 text-white animate-pulse" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-center mb-4" style={{ color: '#ABCEC9' }}>
                        Breathe into your heart
                      </p>
                      <p className="text-center" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                        Feel the warmth spreading. Let your heart open like a flower blooming.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl" style={{
                  background: darkMode ? 'rgba(171, 206, 201, 0.1)' : 'rgba(171, 206, 201, 0.15)',
                  border: '1px solid rgba(171, 206, 201, 0.3)'
                }}>
                  <p className="text-sm" style={{ color: darkMode ? '#f8fafc' : '#1e293b' }}>
                    💡 {currentStepData.guidance}
                  </p>
                </div>

                {timer === 0 && (
                  <button
                    onClick={nextStep}
                    className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #ABCEC9, #C3B8D5)',
                      color: '#000000',
                      boxShadow: '0 0 30px rgba(171, 206, 201, 0.45)'
                    }}
                  >
                    <ChevronRight className="w-6 h-6" />
                    {currentStep < activePractice.steps.length - 1 ? 'Next Step' : 'Complete Practice'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const cardStyle = {
    background: darkMode ? 'rgba(30,30,35,0.65)' : 'rgba(255,255,255,0.55)',
    border: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'),
    boxShadow: '0 0 30px rgba(171, 206, 201, 0.25)'
  };

  if (showReward) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }}>
        <div style={{
          background: 'linear-gradient(135deg, #ABCEC9, #C3B8D5)',
          padding: '3rem',
          borderRadius: '2rem',
          boxShadow: '0 0 100px rgba(171, 206, 201, 0.95)',
          animation: 'bounce 0.5s ease-in-out'
        }}>
          <div className="text-center text-black">
            <div className="text-7xl mb-4">{showReward.icon}</div>
            <div className="text-3xl font-bold mb-2">Practice Complete!</div>
            <div className="text-5xl font-bold my-4" style={{ color: '#FFD700' }}>+{showReward.xp} XP</div>
            <div className="text-xl mb-2">{showReward.title}</div>
            <div className="text-4xl">✨ 🎉 ✨</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? 'linear-gradient(180deg, #050505 0%, #121214 100%)' : 'radial-gradient(circle at center, #ffffff 0%, #EDE8F8 100%)',
      color: darkMode ? '#f8fafc' : '#1e293b',
      paddingBottom: '5rem'
    }}>
      <style>{`
        @keyframes heartbeat {
          0%, 100% { box-shadow: 0 0 30px rgba(171, 206, 201, 0.25); }
          50% { box-shadow: 0 0 50px rgba(171, 206, 201, 0.45); }
        }
        .card-glow { animation: heartbeat 4s ease-in-out infinite; }
        .card-glow:hover { 
          box-shadow: 0 0 60px rgba(171, 206, 201, 0.75) !important; 
          transform: translateY(-6px) scale(1.01) !important; 
          animation: none !important; 
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>

      {renderPracticeModal()}

      <div className="max-w-md mx-auto">
        <div className="p-6 pb-8 relative" style={{ background: 'linear-gradient(135deg, #ABCEC9, #C3B8D5)' }}>
          <button onClick={() => setDarkMode(!darkMode)} className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all" style={{ background: 'rgba(0,0,0,0.2)' }}>
            {darkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-indigo-900" />}
          </button>
          <h1 className="text-2xl font-bold text-black">Awakened Path</h1>
          <p className="text-black text-opacity-80 text-sm">Soul • Now • Zen</p>
        </div>

        <div className="px-4 -mt-4">
          <div className="card-glow rounded-2xl p-6" style={cardStyle}>

            {activeTab === 'journey' && (
              <div className="space-y-4">
                <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #ABCEC9, #C3B8D5)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-black">Level {user.level}</h2>
                      <p className="text-black text-opacity-70 text-sm">Awakener</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <span className="text-2xl font-bold text-black">{user.streak}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-20 rounded-full h-4 overflow-hidden">
                    <div className="h-full transition-all" style={{ width: (user.xp / user.xpToNext * 100) + '%', background: 'linear-gradient(90deg, #FFD700, #FFA500)' }} />
                  </div>
                  <p className="text-sm text-black text-opacity-80 mt-2">{user.xp} / {user.xpToNext} XP</p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="card-glow rounded-xl p-3 cursor-pointer" style={cardStyle}>
                    <Clock className="w-5 h-5 mb-2" style={{ color: '#ABCEC9' }} />
                    <div className="text-3xl font-bold" style={{ color: '#ABCEC9' }}>{user.nowMoments}</div>
                    <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Now</p>
                  </div>
                  <div className="card-glow rounded-xl p-3 cursor-pointer" style={cardStyle}>
                    <Eye className="w-5 h-5 mb-2" style={{ color: '#C3B8D5' }} />
                    <div className="text-3xl font-bold" style={{ color: '#C3B8D5' }}>{user.witnessPoints}</div>
                    <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Witness</p>
                  </div>
                  <div className="card-glow rounded-xl p-3 cursor-pointer" style={cardStyle}>
                    <Wind className="w-5 h-5 mb-2" style={{ color: '#ABCEC9' }} />
                    <div className="text-3xl font-bold" style={{ color: '#ABCEC9' }}>{user.zenPoints}</div>
                    <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Zen</p>
                  </div>
                </div>

                <div className="card-glow rounded-xl p-4 cursor-pointer" style={cardStyle}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center animate-pulse" style={{ background: 'linear-gradient(135deg, #ABCEC9, #C3B8D5)' }}>
                      <Heart className="w-7 h-7 text-black" />
                    </div>
                    <div>
                      <h3 className="font-bold">Energy Level</h3>
                      <p className="text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Heart • Mind • Body</p>
                    </div>
                  </div>
                  <div className="rounded-full h-4 overflow-hidden" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                    <div className="h-full transition-all" style={{ width: user.energy + '%', background: 'linear-gradient(90deg, #ABCEC9, #C3B8D5)' }} />
                  </div>
                  <p className="text-sm mt-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{user.energy}% Aligned</p>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" style={{ color: '#ABCEC9' }} />
                    Quick Practices (30s-1m)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {quickPractices.map(p => (
                      <div key={p.id} onClick={() => setActivePractice(p)} className="card-glow rounded-xl p-4 cursor-pointer" style={cardStyle}>
                        <div className="text-3xl mb-2">{p.icon}</div>
                        <h4 className="font-bold text-sm mb-1">{p.title}</h4>
                        <p className="text-xs mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{p.steps[0].instruction}</p>
                        <span className="text-xs font-bold" style={{ color: '#ABCEC9' }}>+{p.xp} XP</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" style={{ color: '#ABCEC9' }} />
                    Deep Practices
                  </h3>
                  <div className="space-y-2">
                    {practices.map(p => (
                      <div key={p.id} onClick={() => setActivePractice(p)} className="card-glow rounded-xl p-4 cursor-pointer" style={cardStyle}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-4xl">{p.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{p.title}</h4>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                  background: p.level === 'beginner' ? 'rgba(34, 197, 94, 0.2)' : p.level === 'intermediate' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                  color: p.level === 'beginner' ? '#22c55e' : p.level === 'intermediate' ? '#fb923c' : '#ef4444'
                                }}>
                                  {p.level}
                                </span>
                              </div>
                              <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                                {p.steps.length} steps • {formatTime(p.duration)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold" style={{ color: '#ABCEC9' }}>+{p.xp}</div>
                            <div className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>XP</div>
                          </div>
                        </div>
                        <div className="text-xs mt-2 p-2 rounded" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: darkMode ? '#94a3b8' : '#64748b' }}>
                          📖 {p.steps[0].instruction}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chapters' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {((['soul', 'now', 'zen'] as const)).map(book => (
                    <button key={book} onClick={() => setSelectedBook(book)} className="flex-1 py-3 rounded-xl font-semibold transition-all" style={{
                      background: selectedBook === book ? 'linear-gradient(135deg, #ABCEC9, #C3B8D5)' : (darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      color: selectedBook === book ? '#000000' : (darkMode ? '#94a3b8' : '#64748b')
                    }}>
                      {book === 'soul' ? '📖 Soul' : book === 'now' ? '⚡ Now' : '🧘 Zen'}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {chapters[selectedBook].map(ch => (
                    <div key={ch.id} className="card-glow rounded-xl p-6 cursor-pointer" style={cardStyle}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(171, 206, 201, 0.2)', color: '#ABCEC9' }}>Ch {ch.id}</span>
                            {ch.completed && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
                            {!ch.unlocked && <Lock className="w-5 h-5" />}
                          </div>
                          <h3 className="text-xl font-bold mb-2">{ch.title}</h3>
                          {ch.unlocked && (
                            <div className="space-y-1">
                              {ch.lessons.slice(0, 3).map((lesson, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: idx < ch.done ? '#ABCEC9' : (darkMode ? '#4b5563' : '#d1d5db') }} />
                                  {lesson}
                                </div>
                              ))}
                              {ch.lessons.length > 3 && (
                                <div className="text-xs" style={{ color: darkMode ? '#6b7280' : '#9ca3af' }}>
                                  +{ch.lessons.length - 3} more lessons
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {ch.unlocked && <ChevronRight className="w-6 h-6" style={{ color: '#ABCEC9' }} />}
                      </div>
                      {ch.unlocked && (
                        <div className="space-y-2 mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Progress</span>
                            <span className="font-semibold">{ch.done}/{ch.total} lessons</span>
                          </div>
                          <div className="rounded-full h-2 overflow-hidden" style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            <div className="h-full transition-all" style={{ width: (ch.done / ch.total * 100) + '%', background: 'linear-gradient(90deg, #ABCEC9, #C3B8D5)' }} />
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-2">
                            <Award className="w-4 h-4" style={{ color: '#ABCEC9' }} />
                            <span style={{ color: '#ABCEC9' }}>+{ch.xp} XP</span>
                          </div>
                        </div>
                      )}
                      {!ch.unlocked && (
                        <div className="mt-3 text-sm p-3 rounded-lg" style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: darkMode ? '#94a3b8' : '#64748b' }}>
                          🔒 Complete Chapter {ch.id - 1} to unlock
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-4">
                <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, #ABCEC9, #C3B8D5)' }}>
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <Sparkles className="w-12 h-12 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold text-black">Awakened Master</h2>
                  <p className="text-black text-opacity-70">Level {user.level}</p>
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div>
                      <div className="text-2xl font-bold text-black">{user.witnessPoints}</div>
                      <div className="text-xs text-black text-opacity-70">Witness</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-black">{user.presencePoints}</div>
                      <div className="text-xs text-black text-opacity-70">Presence</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-black">{user.zenPoints}</div>
                      <div className="text-xs text-black text-opacity-70">Zen</div>
                    </div>
                  </div>
                </div>

                <div className="card-glow rounded-xl p-4" style={cardStyle}>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" style={{ color: '#ABCEC9' }} />
                    Journey Stats
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Total presence time</span>
                      <span className="font-semibold">24h 15m</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Now moments</span>
                      <span className="font-semibold">{user.nowMoments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Breath sessions</span>
                      <span className="font-semibold">{user.breathSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Practices completed</span>
                      <span className="font-semibold">127</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-4 py-3 max-w-md mx-auto" style={{
          background: darkMode ? 'rgba(30,30,35,0.95)' : 'rgba(255,255,255,0.95)',
          borderTop: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)'),
          backdropFilter: 'blur(10px)'
        }}>
          <div className="flex justify-around items-center">
            <button onClick={() => setActiveTab('journey')} className="flex flex-col items-center gap-1 transition-all hover:scale-110" style={{ color: activeTab === 'journey' ? '#ABCEC9' : (darkMode ? '#94a3b8' : '#64748b') }}>
              <Target className="w-6 h-6" />
              <span className="text-xs font-medium">Journey</span>
            </button>
            <button onClick={() => setActiveTab('chapters')} className="flex flex-col items-center gap-1 transition-all hover:scale-110" style={{ color: activeTab === 'chapters' ? '#ABCEC9' : (darkMode ? '#94a3b8' : '#64748b') }}>
              <BookOpen className="w-6 h-6" />
              <span className="text-xs font-medium">Chapters</span>
            </button>
            <button onClick={() => setActiveTab('profile')} className="flex flex-col items-center gap-1 transition-all hover:scale-110" style={{ color: activeTab === 'profile' ? '#ABCEC9' : (darkMode ? '#94a3b8' : '#64748b') }}>
              <Award className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}