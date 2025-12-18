import { useState, useEffect } from 'react';
import { Heart, Award, Flame, BookOpen, Sparkles, Target, Clock, Eye, Wind, Star, Lock, ChevronRight, Zap, Sun, Moon, Play, Pause, RotateCcw, Home, User, Power } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UntetheredApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [darkMode, setDarkMode] = useState(true); // Default to dark for the warm theme
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activePractice, setActivePractice] = useState<any>(null);
  const [practiceState, setPracticeState] = useState('intro');
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const [selectedBook, setSelectedBook] = useState<'soul' | 'now' | 'zen'>('soul');
  const [showReward, setShowReward] = useState<{ xp: number; title: string; icon: string } | null>(null);
  const [thoughts, setThoughts] = useState<{ id: number; text: string; x: number; y: number }[]>([]);
  // ... existing state
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [lessonSlide, setLessonSlide] = useState(0);

  // Reframe practice state
  const [reframeThought, setReframeThought] = useState('');
  const [reframePattern, setReframePattern] = useState('');
  const [reframeQuestionIndex, setReframeQuestionIndex] = useState(0);
  const [refinedThought, setRefinedThought] = useState('');

  const resetReframeState = () => {
    setReframeThought('');
    setReframePattern('');
    setReframeQuestionIndex(0);
    setRefinedThought('');
  };

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
    breathSessions: 18,
    totalTime: "24h 15m"
  };
  // Reset practice state when starting any new practice
  useEffect(() => {
    if (activePractice) {
      setCurrentStep(0);
      setPracticeState('intro');
      setIsTimerRunning(false);
      setBreathCount(0);
      setBreathPhase('inhale');
      resetReframeState();

      const firstStep = activePractice.steps?.[0];
      if (firstStep?.duration) {
        setTimer(firstStep.duration);
      } else {
        setTimer(0);
      }
    }
  }, [activePractice]);

  // Timer effect
  useEffect(() => {
    let interval: any;
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
    },
    {
      id: 7,
      title: "Thought Reframe",
      icon: "🧠",
      xp: 45,
      duration: 240,
      type: "reframe",
      book: "soul",
      level: "intermediate",
      steps: [
        {
          title: "Capture Thought",
          instruction: "What thought is bothering you right now?",
          guidance: "Write it down exactly as it sounds in your head. No judgment.",
          visual: "reframe"
        },
        {
          title: "Name the Pattern",
          instruction: "Look at the thought. Which of these patterns does it follow?",
          guidance: "Naming the pattern weakens its hold on you. It's just a habit of the mind.",
          visual: "reframe"
        },
        {
          title: "Question the Thought",
          instruction: "Let's investigate the truth of this thought.",
          guidance: "Witness the thought from a distance. Is it as solid as it seems?",
          visual: "reframe"
        },
        {
          title: "Replace + Integrate",
          instruction: "What is a more gentle or truthful thought?",
          guidance: "Find a perspective that feels aligned with your heart. Notice the softening in your body.",
          visual: "reframe"
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
        title: "The Voice Inside",
        done: 5,
        total: 5,
        xp: 100,
        unlocked: true,
        completed: true,
        lessons: [
          {
            title: "Who is talking?",
            slides: [
              { type: "Concept", title: "The Roommate", text: "Have you noticed there is a voice in your head that never shuts up? It narrates the world, judges people, and worries about the future." },
              { type: "Insight", title: "You Are Not It", text: "If you can hear the voice talking, then you cannot BE the voice. You are the one listening to it." },
              { type: "Practice", title: "Say Hello", text: "Let's prove it right now.", action: "Say 'Hello' internally. Now ask: Who heard that?" }
            ]
          },
          {
            title: "Catching the Narrator",
            slides: [
              { type: "Concept", title: "The 5-Second Catch", text: "The voice loves to sneak up on you. It starts complaining about the weather, and suddenly you're angry at the rain." },
              { type: "Practice", title: "Watch Like a Cat", text: "Close your eyes for a moment. Watch your mind like a cat watching a mouse hole.", action: "Wait for the very next thought. Catch it." },
              { type: "Insight", title: "The Gap", text: "Did you notice a moment of silence while you were waiting? That silence is YOU." }
            ]
          },
          {
            title: "The Subject-Object Relationship",
            slides: [
              { type: "Concept", title: "The Glass Wall", text: "Imagine you are looking at a coffee cup. You are the subject; the cup is the object. You are separate." },
              { type: "Insight", title: "Thoughts are Objects", text: "Thoughts are just objects passing through your awareness, just like the coffee cup." },
              { type: "Practice", title: "Step Back", text: "Visualize your thoughts projected on a movie screen.", action: "Sit in the audience. Just watch the show." }
            ]
          },
          {
            title: "The Real Source of Problems",
            slides: [
              { type: "Concept", title: "The Interpreter", text: "Events happen. Then your mind interprets them. 'This is bad,' 'He is rude.' The event isn't the problem; the interpretation is." },
              { type: "Insight", title: "Remove the Middleman", text: "You can experience life directly, without the constant commentary." },
              { type: "Practice", title: "Direct Experience", text: "Look at something nearby.", action: "See it without naming it. Just pure vision." }
            ]
          },
          {
            title: "The Silence Behind the Noise",
            slides: [
              { type: "Concept", title: "The Backdrop", text: "Behind every thought, there is a silent awareness. It is always there, peaceful and watching." },
              { type: "Insight", title: "Resting in Awareness", text: "You don't need to silence the mind. You just need to lose interest in it." },
              { type: "Practice", title: "Drop Back", text: "Instead of focusing forward on thoughts, lean back into the one who is aware.", action: "Relax into the seat of Self." }
            ]
          }
        ]
      },
      // ... (Rest of SOUL chapters with same structure if desired, or keep simplified for now)
      {
        id: 2,
        title: "The Inner Roommate",
        done: 0,
        total: 5,
        xp: 150,
        unlocked: true,
        completed: false,
        lessons: [
          { title: "Personifying the Voice", slides: [{ type: "Concept", title: "Meet the Roommate", text: "Imagine if your inner voice was a real person walking next to you." }] },
          { title: "Would you live with them?", slides: [{ type: "Insight", title: "The Crazy Roommate", text: "If a real person said the things your mind says, you'd kick them out in 5 minutes." }] },
          { title: "Neurotic Loops", slides: [{ type: "Practice", title: "Notice the Repetition", text: "Watch how the mind repeats the same fears over and over." }] },
          { title: "Stepping Back", slides: [{ type: "Concept", title: "Don't Engage", text: "You don't argue with a crazy person. Don't argue with your mind." }] },
          { title: "Firing the Roommate", slides: [{ type: "Insight", title: "Freedom", text: "You don't have to listen. You can just smile and walk away." }] }
        ]
      },
      // ... Placeholder for Chapters 3, 4, 5 to maintain structure
      { id: 3, title: "Infinite Energy", done: 0, total: 5, xp: 200, unlocked: false, completed: false, lessons: [] },
      { id: 4, title: "Removing the Thorn", done: 0, total: 5, xp: 250, unlocked: false, completed: false, lessons: [] },
      { id: 5, title: "The Vow of Happiness", done: 0, total: 5, xp: 300, unlocked: false, completed: false, lessons: [] }
    ],
    // Keep 'now' and 'zen' simplified for this delta, or upgrade similarly
    now: [],
    zen: []
  };

  const handleComplete = (practice: any) => {
    setShowReward({ xp: practice.xp, title: practice.title, icon: practice.icon });
    setTimeout(() => {
      setShowReward(null);
      setActivePractice(null);
      setPracticeState('intro');
      setCurrentStep(0);
      resetReframeState();
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderLessonOverlay = () => {
    if (!activeLesson) return null;

    const currentSlide = activeLesson.slides[lessonSlide];
    const isLastSlide = lessonSlide === activeLesson.slides.length - 1;

    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]">
        {/* Dynamic Background based on Book */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 animate-[slow-spin_60s_linear_infinite] 
            ${selectedBook === 'soul' ? 'bg-[conic-gradient(from_0deg,#ABCEC9,#000,#ABCEC9)]' :
              selectedBook === 'now' ? 'bg-[conic-gradient(from_0deg,#fb923c,#000,#fb923c)]' :
                'bg-[conic-gradient(from_0deg,#818cf8,#000,#818cf8)]'}`}
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {activeLesson.slides.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 
                ${i <= lessonSlide ? 'bg-white shadow-[0_0_10px_white]' : 'bg-white/10'}`}
              />
            ))}
          </div>

          {/* Card Content */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group">
            {/* Slide Visual Accent */}
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <div className="text-9xl font-serif select-none">{lessonSlide + 1}</div>
            </div>

            <div className="min-h-[300px] flex flex-col justify-center animate-[slideUp_0.5s_ease-out]">
              <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit">
                <Sparkles className="w-3 h-3 text-[#ABCEC9]" />
                <span className="text-xs font-bold tracking-widest uppercase text-[#ABCEC9]">{currentSlide.type}</span>
              </div>

              <h2 className="text-3xl font-bold mb-6 leading-tight text-white/90">
                {currentSlide.title}
              </h2>

              <p className="text-lg leading-relaxed text-white/70 font-light">
                {currentSlide.text}
              </p>

              {currentSlide.action && (
                <div className="mt-8 p-4 rounded-xl bg-[#ABCEC9]/10 border border-[#ABCEC9]/20 flex items-start gap-4">
                  <Eye className="w-6 h-6 text-[#ABCEC9] mt-1 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#ABCEC9] uppercase tracking-wider mb-1">Try This Now</div>
                    <div className="text-sm text-white/80 italic">"{currentSlide.action}"</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                if (isLastSlide) {
                  // Complete Lesson
                  const xpGain = 20;
                  setShowReward({ xp: xpGain, title: "Lesson Mastered", icon: "🧠" });
                  setActiveLesson(null);
                  setLessonSlide(0);
                  // Here you would typically update user state/db
                  setTimeout(() => setShowReward(null), 3000);
                } else {
                  setLessonSlide(prev => prev + 1);
                }
              }}
              className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(171,206,201,0.3)]"
              style={{
                background: 'linear-gradient(135deg, #ABCEC9, #C3B8D5)',
                color: '#000000',
              }}
            >
              {isLastSlide ? (
                <>Complete Lesson <Award className="w-5 h-5" /></>
              ) : (
                <>Continue <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBreathVisual = () => {
    const size = breathPhase === 'inhale' ? 160 : breathPhase === 'hold' ? 160 : breathPhase === 'exhale' ? 80 : 100;
    const colors = {
      inhale: { from: '#06b6d4', to: '#3b82f6', text: 'Breathe In' },
      hold: { from: '#8b5cf6', to: '#6366f1', text: 'Hold' },
      exhale: { from: '#10b981', to: '#059669', text: 'Breathe Out' },
      rest: { from: '#6b7280', to: '#4b5563', text: 'Rest' }
    };

    const current = colors[breathPhase as keyof typeof colors];

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

  const renderReframeVisual = () => (
    <div className="relative h-64 flex items-center justify-center rounded-2xl overflow-hidden" style={{
      background: darkMode ? 'rgba(30,30,35,0.65)' : 'rgba(255,255,255,0.55)',
      border: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)')
    }}>
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: 'linear-gradient(135deg, #ABCEC9, #C3B8D5)',
        boxShadow: '0 0 60px rgba(171, 206, 201, 0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2,
        animation: 'pulse 3s ease-in-out infinite'
      }}>
        <Sparkles className="w-10 h-10 text-black" />
      </div>

      {reframeThought && practiceState === 'active' && currentStep > 0 && (
        <div
          className="absolute text-center px-6 py-3 rounded-2xl backdrop-blur-md transition-all duration-[2000ms]"
          style={{
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            border: '1px solid ' + (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
            color: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
            maxWidth: '80%',
            opacity: currentStep === 3 ? 0.2 : 0.6,
            transform: `scale(${currentStep === 3 ? 0.8 : 1}) translateY(${currentStep === 3 ? -20 : 0}px)`,
            filter: currentStep === 3 ? 'blur(4px)' : 'none'
          }}
        >
          {reframeThought}
        </div>
      )}

      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-[#ABCEC9] to-transparent" style={{ transform: 'rotate(45deg)', backgroundSize: '200% 200%' }} />
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
                resetReframeState();
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
                  {activePractice.type === 'reframe' && renderReframeVisual()}
                  {activePractice.type === 'reframe' && (
                    <div className="mt-8 space-y-6">
                      {currentStep === 0 && (
                        <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
                          <textarea
                            value={reframeThought}
                            onChange={(e) => setReframeThought(e.target.value)}
                            placeholder="Type the thought here..."
                            className="w-full p-4 rounded-xl bg-transparent border-2 focus:border-[#ABCEC9] outline-none transition-all min-h-[100px]"
                            style={{
                              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                              color: darkMode ? '#f8fafc' : '#1e293b'
                            }}
                          />
                          {(() => {
                            const highRiskPhrases = ["I want to die", "kill myself", "I hate myself", "can't go on"];
                            const isRiskDetected = highRiskPhrases.some(phrase =>
                              reframeThought.toLowerCase().includes(phrase.toLowerCase())
                            );
                            if (isRiskDetected) {
                              return (
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-[fadeIn_0.5s_ease-out]">
                                  <p className="text-sm italic" style={{ color: '#ABCEC9' }}>
                                    "Strong emotions noticed. You are not alone. Consider reaching out to someone you trust."
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          {reframeThought.length > 3 && (
                            <button
                              onClick={nextStep}
                              className="w-full py-3 rounded-xl font-bold bg-[#ABCEC9] text-black hover:scale-[1.02] transition-all"
                            >
                              Continue
                            </button>
                          )}
                        </div>
                      )}

                      {currentStep === 1 && (
                        <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
                          <div className="grid grid-cols-2 gap-3">
                            {['Fear', 'Self-doubt', 'Control', 'Judgment', 'Future worry'].map(pattern => (
                              <button
                                key={pattern}
                                onClick={() => setReframePattern(pattern)}
                                className="p-3 rounded-xl border-2 transition-all text-sm font-medium"
                                style={{
                                  background: reframePattern === pattern ? 'rgba(171, 206, 201, 0.2)' : 'transparent',
                                  borderColor: reframePattern === pattern ? '#ABCEC9' : (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                                  color: reframePattern === pattern ? '#ABCEC9' : (darkMode ? '#94a3b8' : '#64748b')
                                }}
                              >
                                {pattern}
                              </button>
                            ))}
                          </div>
                          {reframePattern && (
                            <button
                              onClick={nextStep}
                              className="w-full py-3 rounded-xl font-bold bg-[#ABCEC9] text-black hover:scale-[1.02] transition-all"
                            >
                              Confirm Pattern
                            </button>
                          )}
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                          {(() => {
                            const prompts = [
                              "Is this thought absolutely true?",
                              "Is this thought helping you right now?",
                              "Who would you be without this thought?",
                              "Pause. Feel your breath. Notice the space in which this thought appears."
                            ];
                            const isGrounding = reframeQuestionIndex === 3;
                            return (
                              <div className="text-center space-y-6">
                                <p className={cn("text-xl font-medium italic", isGrounding ? "text-[#ABCEC9]" : "")} style={{ color: isGrounding ? '#ABCEC9' : (darkMode ? '#f8fafc' : '#1e293b') }}>
                                  {isGrounding ? prompts[reframeQuestionIndex] : `"${prompts[reframeQuestionIndex]}"`}
                                </p>
                                <button
                                  onClick={() => {
                                    if (reframeQuestionIndex < prompts.length - 1) {
                                      setReframeQuestionIndex(prev => prev + 1);
                                    } else {
                                      nextStep();
                                    }
                                  }}
                                  className="px-8 py-3 rounded-full border-2 border-[#ABCEC9] text-[#ABCEC9] font-bold hover:bg-[#ABCEC9] hover:text-black transition-all"
                                >
                                  {reframeQuestionIndex < prompts.length - 1 ? 'Deepen Enquiry' : 'I am Ready'}
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                          <div className="space-y-3">
                            <label className="text-xs uppercase tracking-widest opacity-60">Your New Perspective</label>
                            <textarea
                              value={refinedThought}
                              onChange={(e) => setRefinedThought(e.target.value)}
                              placeholder="Write a more gentle truth..."
                              className="w-full p-4 rounded-xl bg-transparent border-2 focus:border-[#ABCEC9] outline-none transition-all min-h-[100px]"
                              style={{
                                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                color: darkMode ? '#f8fafc' : '#1e293b'
                              }}
                            />
                          </div>
                          <div className="p-4 rounded-xl bg-[#ABCEC9]/10 border border-[#ABCEC9]/20">
                            <p className="text-sm font-medium italic text-center" style={{ color: '#ABCEC9' }}>
                              "Notice how your body feels when you let this thought soften."
                            </p>
                          </div>
                          {refinedThought.length > 3 && (
                            <button
                              onClick={() => nextStep()}
                              className="w-full py-4 rounded-xl font-bold bg-[#ABCEC9] text-black shadow-lg shadow-[#ABCEC9]/30"
                            >
                              Complete Integration
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
    // Kept for legacy ref if needed, but mostly using .card-glow now
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    color: '#ffffff',
    transform: 'translateZ(0)',
    willChange: 'box-shadow, transform'
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
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reverse-spin {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes nebula-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        @keyframes text-shimmer {
          0% { opacity: 0.8; }
          50% { opacity: 1; text-shadow: 0 0 15px #ABCEC9; }
          100% { opacity: 0.8; }
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
      {renderLessonOverlay()}

      <div className={`max-w-md mx-auto min-h-screen relative overflow-hidden transition-all duration-500`}>
        {/* Ambient Glows - purely decorative, muted in light mode */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-brand opacity-20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[40%] bg-purple-500 opacity-10 rounded-full blur-[100px] pointer-events-none" />

        <div className="p-6 pb-28 relative z-10">

          {activeTab === 'home' && (
            <div className="space-y-6 pt-2">

              {/* 1. Greeting Header */}
              <div className="flex justify-between items-center px-2">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-main)' }}>Hi, Soul</h1>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Welcome home.</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      const newMode = !darkMode;
                      setDarkMode(newMode);
                      if (!newMode) {
                        document.body.classList.add('light-mode');
                      } else {
                        document.body.classList.remove('light-mode');
                      }
                    }}
                    className="p-3 rounded-full card-glow transition-all hover:scale-110 active:scale-95"
                  >
                    {darkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-indigo-600" />}
                  </button>
                  <button className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-purple-400 overflow-hidden border-2 border-white/20">
                    <img src="https://api.dicebear.com/7.x/micah/svg?seed=soul" alt="User" />
                  </button>
                </div>
              </div>

              {/* 2. Room/Section Filter Pills */}
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
                {['Meditation', 'Focus', 'Sleep', 'Sounds'].map((pill, i) => (
                  <button
                    key={pill}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all whitespace-nowrap card-glow
                        ${i === 0
                        ? 'border-brand text-brand'
                        : 'text-muted hover:border-white/20'}`}
                    style={{
                      borderColor: i === 0 ? 'var(--brand-primary)' : 'var(--glass-border)',
                      color: i === 0 ? 'var(--brand-primary)' : 'var(--text-muted)'
                    }}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              {/* 3. Main Feature Card (Inner Light / Smart Lamp style) */}
              <div className="p-6 relative overflow-hidden group transition-all duration-500 card-glow h-[320px] flex flex-col justify-between"
                style={{ borderRadius: '32px' }}>

                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-main)' }}>Inner Light</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Practice • Bedroom</p>
                  </div>
                  <button className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10">
                    <Power className="w-5 h-5" style={{ color: 'var(--text-main)' }} />
                  </button>
                </div>

                {/* The Visual (Brand specific glow) */}
                <div className="flex justify-center items-center flex-1 relative z-10">
                  <div className="relative w-40 h-40 cursor-pointer group-hover:scale-105 transition-transform duration-700"
                    onClick={() => setActivePractice(practices[0])}
                  >
                    {/* Light bulb/Sun Glow */}
                    <div className="absolute inset-0 rounded-full blur-[60px] opacity-40 animate-pulse" style={{ background: 'var(--brand-primary)' }} />
                    <div className="absolute inset-8 rounded-full blur-[40px] opacity-60" style={{ background: 'var(--brand-secondary)' }} />

                    {/* Physical Object */}
                    <div className="absolute inset-0 rounded-full border border-white/20 shadow-[0_0_30px_inset_rgba(255,255,255,0.1)] backdrop-blur-sm flex items-center justify-center"
                      style={{ background: 'var(--glass-surface)' }}>
                      <Sun className="w-14 h-14 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" style={{ color: 'var(--brand-primary)' }} />
                    </div>
                  </div>
                </div>

                {/* Slider Element (Visual only for now) */}
                <div className="bg-black/20 rounded-2xl p-4 flex items-center gap-4 relative z-10">
                  <Sun className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[75%] rounded-full shadow-[0_0_10px_rgba(171,206,201,0.5)]" style={{ background: 'var(--brand-primary)' }} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>75%</span>
                </div>
              </div>

              {/* 4. Grid of Smart Toggles */}
              <div className="grid grid-cols-2 gap-4">
                {/* Card 1: Quick Focus */}
                <button
                  onClick={() => setActivePractice(quickPractices[2])}
                  className="p-5 text-left transition-all hover:translate-y-[-2px] card-glow h-40 flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-full bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
                    </div>
                    <div className="w-8 h-5 rounded-full border border-brand/30 flex items-center px-1" style={{ background: 'var(--card-glow-base)' }}>
                      <div className="w-3 h-3 rounded-full shadow-[0_0_5px_white]" style={{ background: 'var(--brand-primary)' }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>Quick Focus</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>2 Devices • 5 min</p>
                  </div>
                </button>

                {/* Card 2: Deep Rest */}
                <button
                  onClick={() => setActivePractice(practices[3])}
                  className="p-5 text-left transition-all hover:translate-y-[-2px] card-glow h-40 flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-full bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                      <Moon className="w-6 h-6" style={{ color: '#818cf8' }} />
                    </div>
                    {/* Toggle Off state */}
                    <div className="w-8 h-5 rounded-full bg-white/5 border border-white/10 flex items-center px-1">
                      <div className="w-3 h-3 rounded-full bg-white/20" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>Deep Rest</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Bedroom • 20 min</p>
                  </div>
                </button>

                {/* Card 3: Witness */}
                <button
                  onClick={() => setActivePractice(practices[1])}
                  className="p-5 text-left transition-all hover:translate-y-[-2px] card-glow h-40 flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-full bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                      <Eye className="w-6 h-6" style={{ color: 'var(--brand-secondary)' }} />
                    </div>
                    <div className="w-8 h-5 rounded-full bg-white/5 border border-white/10 flex items-center px-1">
                      <div className="w-3 h-3 rounded-full bg-white/20" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>Witness</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Living Room</p>
                  </div>
                </button>

                {/* Card 4: Breath */}
                <button
                  onClick={() => setActivePractice(practices[0])}
                  className="p-5 text-left transition-all hover:translate-y-[-2px] card-glow h-40 flex flex-col justify-between group"
                >
                  <div className="flex justify-between items-start">
                    <div className="p-3 rounded-full bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                      <Wind className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
                    </div>
                    <div className="w-8 h-5 rounded-full border border-brand/30 flex items-center px-1" style={{ background: 'var(--card-glow-base)' }}>
                      <div className="w-3 h-3 rounded-full shadow-[0_0_5px_white]" style={{ background: 'var(--brand-primary)' }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>Breath</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Everywhere</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'journey' && (
            <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
              <div className="px-2">
                <h2 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-main)' }}>Your Journey</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Explore the path of awareness through these practices.</p>
              </div>

              <div className="space-y-4">
                {practices.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePractice(p)}
                    className="w-full p-5 text-left transition-all hover:translate-y-[-2px] card-glow flex items-center gap-6 group"
                  >
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform text-4xl shadow-lg">
                      {p.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold tracking-widest uppercase opacity-60" style={{ color: '#ABCEC9' }}>
                          {p.book === 'soul' ? 'Untethered' : p.book === 'now' ? 'Now' : 'Zen'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 opacity-70">
                          {p.level}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>{p.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs opacity-60">
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.floor(p.duration / 60)}m</div>
                        <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" /> +{p.xp} XP</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>

              {/* Quick Shifts Section */}
              <div className="pt-4">
                <h3 className="px-2 text-lg font-bold mb-4 opacity-80 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" /> Quick Shifts
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {quickPractices.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setActivePractice(p)}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group"
                    >
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{p.icon}</div>
                      <h4 className="font-bold text-sm mb-1">{p.title}</h4>
                      <p className="text-[10px] opacity-60">+{p.xp} XP • {p.duration}s</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="space-y-6">
              {/* Book Selector (Keep existing) */}
              <div className="flex gap-2 p-1 rounded-xl bg-black/20 backdrop-blur-md">
                {/* ... (Same as before) ... */}
                {((['soul', 'now', 'zen'] as const)).map(book => (
                  <button key={book} onClick={() => setSelectedBook(book)} className="flex-1 py-3 rounded-lg font-bold text-sm transition-all relative overflow-hidden" style={{
                    color: selectedBook === book ? '#000000' : (darkMode ? '#94a3b8' : '#64748b')
                  }}>
                    {selectedBook === book && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#ABCEC9] to-[#C3B8D5] opacity-100" />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {book === 'soul' ? '📖 Soul' : book === 'now' ? '⚡ Now' : '🧘 Zen'}
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {chapters[selectedBook].map((ch, idx) => (
                  <div key={ch.id} className="group relative overflow-hidden rounded-2xl border border-white/5 transition-all duration-500 hover:border-[#ABCEC9]/40" style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)'
                  }}>
                    {/* Glow Bar */}
                    {ch.unlocked && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ABCEC9] to-[#C3B8D5] shadow-[0_0_15px_#ABCEC9]" />
                    )}

                    <div className="p-6 pl-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-widest text-[#ABCEC9]/80 uppercase">
                            Chapter 0{ch.id}
                            {ch.completed && <Sparkles className="w-3 h-3 text-yellow-400" />}
                          </div>
                          <h3 className={`text-2xl font-bold mb-1 ${!ch.unlocked && 'opacity-50'}`}>{ch.title}</h3>
                        </div>
                        {/* Locked/Unlocked Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ch.unlocked ? 'bg-[#ABCEC9]/10 text-[#ABCEC9]' : 'bg-white/5 text-white/30'}`}>
                          {ch.unlocked ? <ChevronRight className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        </div>
                      </div>

                      {ch.unlocked ? (
                        <div className="space-y-4">
                          {/* Progress Bar */}
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#ABCEC9] to-[#C3B8D5] transition-all duration-1000" style={{ width: `${(ch.done / ch.total) * 100}%` }} />
                          </div>

                          {/* NEW: Clickable Micro-Lessons */}
                          <div className="mt-4 grid gap-2">
                            {ch.lessons && ch.lessons.map((lesson, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  // Open the Lesson Overlay
                                  setActiveLesson(lesson);
                                  setLessonSlide(0);
                                }}
                                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left group/lesson"
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold 
                                          ${i < ch.done ? 'bg-[#ABCEC9] text-black' : 'bg-white/10 text-white/40'}`}>
                                  {i + 1}
                                </div>
                                <div className="flex-1">
                                  <div className={`text-sm font-medium ${i < ch.done ? 'text-white' : 'text-white/60'}`}>
                                    {typeof lesson === 'string' ? lesson : lesson.title}
                                  </div>
                                </div>
                                <Play className="w-3 h-3 opacity-0 group-hover/lesson:opacity-100 transition-opacity text-[#ABCEC9]" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm opacity-40 italic">Unlock previous chapter to continue path.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
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
                    <span className="text-black text-opacity-60 text-xs">Day Streak</span>
                  </div>
                </div>
                <div className="bg-black bg-opacity-20 rounded-full h-4 overflow-hidden">
                  <div className="h-full transition-all" style={{ width: (user.xp / user.xpToNext * 100) + '%', background: 'linear-gradient(90deg, #FFD700, #FFA500)' }} />
                </div>
                <p className="text-sm text-black text-opacity-80 mt-2">{user.xp} / {user.xpToNext} XP</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="card-glow rounded-xl p-3 text-center" style={cardStyle}>
                  <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: '#ABCEC9' }} />
                  <div className="text-2xl font-bold" style={{ color: '#ABCEC9' }}>{user.nowMoments}</div>
                  <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Now</p>
                </div>
                <div className="card-glow rounded-xl p-3 text-center" style={cardStyle}>
                  <Eye className="w-5 h-5 mx-auto mb-2" style={{ color: '#C3B8D5' }} />
                  <div className="text-2xl font-bold" style={{ color: '#C3B8D5' }}>{user.witnessPoints}</div>
                  <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Witness</p>
                </div>
                <div className="card-glow rounded-xl p-3 text-center" style={cardStyle}>
                  <Wind className="w-5 h-5 mx-auto mb-2" style={{ color: '#ABCEC9' }} />
                  <div className="text-2xl font-bold" style={{ color: '#ABCEC9' }}>{user.zenPoints}</div>
                  <p className="text-xs" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Zen</p>
                </div>
              </div>

              <div className="card-glow rounded-xl p-4" style={cardStyle}>
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

              <div className="card-glow rounded-xl p-4" style={cardStyle}>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" style={{ color: '#ABCEC9' }} />
                  Total Progress
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>Total presence time</span>
                    <span className="font-semibold">{user.totalTime}</span>
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
          <button onClick={() => { setActiveTab('home'); setActivePractice(null); resetReframeState(); }} className="flex flex-col items-center gap-1 transition-all hover:scale-110" style={{ color: activeTab === 'home' ? '#ABCEC9' : (darkMode ? '#94a3b8' : '#64748b') }}>
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button onClick={() => { setActiveTab('journey'); setActivePractice(null); resetReframeState(); }} className="flex flex-col items-center gap-1 transition-all hover:scale-110" style={{ color: activeTab === 'journey' ? '#ABCEC9' : (darkMode ? '#94a3b8' : '#64748b') }}>
            <Target className="w-6 h-6" />
            <span className="text-xs font-medium">Journey</span>
          </button>
          <button onClick={() => { setActiveTab('chapters'); setActivePractice(null); resetReframeState(); }} className="flex flex-col items-center gap-1 transition-all hover:scale-110" style={{ color: activeTab === 'chapters' ? '#ABCEC9' : (darkMode ? '#94a3b8' : '#64748b') }}>
            <BookOpen className="w-6 h-6" />
            <span className="text-xs font-medium">Chapters</span>
          </button>
          <button onClick={() => { setActiveTab('profile'); setActivePractice(null); resetReframeState(); }} className="flex flex-col items-center gap-1 transition-all hover:scale-110" style={{ color: activeTab === 'profile' ? '#ABCEC9' : (darkMode ? '#94a3b8' : '#64748b') }}>
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}