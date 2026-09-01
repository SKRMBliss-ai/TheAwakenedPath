export interface Section {
  heading: string;
  content: string;
  bulletPoints?: string[];
}

export interface FAQItem {
  q: string;
  a: string;
  topic?: string;
}

export interface ContentArticle {
  slug: string;
  type: 'guide' | 'glossary' | 'article' | 'video' | 'practice' | 'book-summary';
  title: string;
  subtitle: string;
  description: string;
  category: 'Mindfulness' | 'Emotional Intelligence' | 'Presence' | 'Meditation' | 'Philosophy';
  author: string;
  publishDate: string;
  readTime: string;
  heroImage?: string;
  videoId?: string;
  quickAnswer: string;
  definition?: string;
  keyTakeaways: string[];
  sections: Section[];
  faqs: FAQItem[];
  relatedSlugs: string[];
  tags: string[];
}

export interface GlossaryTerm {
  slug: string;
  term: string;
  phonetic?: string;
  shortDefinition: string;
  fullDefinition: string;
  etymology?: string;
  keyPrinciples: string[];
  commonMisconceptions: string[];
  dailyPractice: string;
  category: string;
  relatedArticleSlugs: string[];
}

export interface VideoResource {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  uploadDate: string;
  transcriptSummary: string;
  keyTakeaways: string[];
  relatedGuideSlugs: string[];
}

export interface LearningJourney {
  id: string;
  title: string;
  description: string;
  targetGoal: string;
  estimatedDays: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: {
    title: string;
    description: string;
    resourceSlug: string;
    resourceType: 'guide' | 'glossary' | 'video' | 'mindgym';
  }[];
}

export interface TopicHubInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  featuredArticleSlugs: string[];
  featuredGlossarySlugs: string[];
  featuredVideoIds: string[];
}

// ─── ARTICLES REGISTRY ────────────────────────────────────────────────────────
export const ARTICLES_REGISTRY: Record<string, ContentArticle> = {
  'feelings-vs-emotions': {
    slug: 'feelings-vs-emotions',
    type: 'guide',
    title: 'Feelings vs Emotions: The Ultimate Guide to Inner Freedom',
    subtitle: 'Understanding physical sensations vs mental memory loops to stop overthinking and emotional reactivity.',
    description: 'Learn the fundamental difference between raw physical feelings and mental emotions. A step-by-step guide by Sim Katyal to regulate emotions in 90 seconds.',
    category: 'Emotional Intelligence',
    author: 'Sim Katyal',
    publishDate: '2026-07-28',
    readTime: '6 min read',
    quickAnswer: 'Physical feelings are immediate, raw somatic sensations in the body (e.g., chest tightness, butterflies). Emotions are mental stories, interpretations, and memory loops created by the mind around physical sensations.',
    definition: 'Feelings are physical body signals; Emotions are mental narrative loops.',
    keyTakeaways: [
      'Physical feelings last only 90 seconds in the body if unresisted.',
      'Emotions persist for hours or days because the mind keeps rehearsing the story.',
      'Shifting attention from mental stories down into physical sensations immediately dissolves anxiety and overthinking.',
      'Practicing witness consciousness creates a gap between feeling a surge and reacting to it.'
    ],
    sections: [
      {
        heading: 'What Are Physical Feelings?',
        content: 'Physical feelings are sensory signals transmitted by your nervous system. When you feel anxious or angry, your body produces real physical changes—such as an accelerated heart rate, muscle constriction, or a sensation of heat in the chest.',
        bulletPoints: [
          'Tightness or heavy pressure in the chest',
          'Knot or hollowness in the solar plexus',
          'Warmth in the face or throat restriction',
          'Shallow, rapid breathing'
        ]
      },
      {
        heading: 'What Are Mental Emotions?',
        content: 'Emotions occur when your thinking mind interprets a raw physical feeling and attaches a past memory, fear, or self-judgment to it. The ego builds a continuous narrative around the sensation, keeping the neurochemical stress response alive indefinitely.'
      },
      {
        heading: 'How to Dissolve Emotional Reactivity in 90 Seconds',
        content: 'Neuroscience demonstrates that the chemical lifecycle of an adrenaline surge is approximately 90 seconds. To let it pass:',
        bulletPoints: [
          '1. Pause: Stop acting or speaking when you feel an emotional surge.',
          '2. Name the Body Part: Locate the raw physical sensation without judgment.',
          '3. Breathe: Take 3 slow abdominal breaths (4s inhale, 6s exhale).',
          '4. Witness: Observe the feeling pass through your body like a wave.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Why do emotions get trapped in the body?',
        a: 'When we suppress or push away uncomfortable physical sensations, the energy remains stored in our nervous system and tissues (known in spiritual philosophy as samskaras).'
      },
      {
        q: 'How does witness journaling help release emotions?',
        a: 'Witness journaling separates what happened in reality from how your mind interpreted it, breaking the automatic trigger-reaction cycle.'
      }
    ],
    relatedSlugs: ['witness-consciousness-guide', 'stopping-overthinking-naturally', 'power-of-now-presence-guide'],
    tags: ['feelings', 'emotions', 'emotional-intelligence', 'somatic-awareness', 'overthinking']
  },

  'witness-consciousness-guide': {
    slug: 'witness-consciousness-guide',
    type: 'guide',
    title: 'Witness Consciousness: The Seat of the Observer Explained',
    subtitle: 'How to step back from noisy thoughts and abide in unshakeable inner calm.',
    description: 'Master witness consciousness based on The Untethered Soul by Michael Singer and The Power of Now by Eckhart Tolle. Practical guide by Soulful Intelligence Studio.',
    category: 'Presence',
    author: 'Sim Katyal',
    publishDate: '2026-07-28',
    readTime: '7 min read',
    quickAnswer: 'Witness Consciousness (or the Observer) is the awareness that observes thoughts, emotions, and sensory experiences without identifying with or being consumed by them.',
    definition: 'The calm, silent awareness behind your thinking mind.',
    keyTakeaways: [
      'You are not your thoughts; you are the awareness observing your thoughts.',
      'Shifting into the seat of the witness immediately creates peace regardless of external circumstances.',
      'The observer does not fight the mind; it simply watches with gentle curiosity.'
    ],
    sections: [
      {
        heading: 'The Core Principle of the Observer',
        content: 'In everyday life, we mistake ourselves for the voice in our head. Witness consciousness is the realization that there are two distinct aspects of your mind: the voice that speaks, and the silent awareness that listens.'
      },
      {
        heading: 'Practical Daily Witnessing Technique',
        content: 'Whenever you feel overwhelmed, silently ask yourself: "Who is aware of this thought right now?" This single question shifts your locus of identity from the chaotic thought to the quiet observer.'
      }
    ],
    faqs: [
      {
        q: 'What is the difference between witness consciousness and meditation?',
        a: 'Meditation is a specific practice session, whereas witness consciousness is a continuous state of present awareness that can be maintained during daily activities.'
      }
    ],
    relatedSlugs: ['feelings-vs-emotions', 'power-of-now-presence-guide', 'stopping-overthinking-naturally'],
    tags: ['witness-consciousness', 'observer', 'presence', 'mindfulness', 'awareness']
  },

  'stopping-overthinking-naturally': {
    slug: 'stopping-overthinking-naturally',
    type: 'guide',
    title: 'How to Stop Overthinking: 5 Somatic Presence Rituals',
    subtitle: 'Break mental loops and ground your mind in 5 minutes a day.',
    description: 'Learn why overthinking happens and how to break racing thoughts using somatic body tracking and presence breathwork by MindGym.',
    category: 'Mindfulness',
    author: 'Sim Katyal',
    publishDate: '2026-07-28',
    readTime: '5 min read',
    quickAnswer: 'Overthinking occurs when suppressed physical energy rises into the mind. Stopping overthinking requires shifting focus down from mental thoughts into physical body sensations.',
    keyTakeaways: [
      'Overthinking cannot be solved with more thinking.',
      'Somatic body scanning interrupts the brain\'s Default Mode Network (DMN).',
      '5 minutes of conscious breathwork restores vagal nerve tone.'
    ],
    sections: [
      {
        heading: 'Why Thinking Cannot Fix Overthinking',
        content: 'Attempting to solve an overthinking loop with more analysis is like trying to extinguish a fire with gasoline. The mind created the loop, so the solution lies outside the mind—in direct body awareness.'
      }
    ],
    faqs: [
      {
        q: 'How does MindGym help with daily overthinking?',
        a: 'MindGym provides guided 5-minute daily presence rituals, breathwork timers, and witness journaling to break mental chatter.'
      }
    ],
    relatedSlugs: ['feelings-vs-emotions', 'witness-consciousness-guide'],
    tags: ['overthinking', 'anxiety', 'somatic-tracking', 'breathwork', 'mindgym']
  },

  'power-of-now-presence-guide': {
    slug: 'power-of-now-presence-guide',
    type: 'article',
    title: 'The Power of Now Explained: Key Practices for Daily Presence',
    subtitle: 'A plain-English breakdown of Eckhart Tolle\'s core teachings on presence and the pain-body.',
    description: 'Understand the key concepts of Eckhart Tolle\'s The Power of Now: presence, the egoic mind, time illusion, and dissolving the pain-body.',
    category: 'Philosophy',
    author: 'Sim Katyal',
    publishDate: '2026-07-28',
    readTime: '8 min read',
    quickAnswer: 'Presence is the state of full attention in the immediate now, free from psychological time (regret over the past or anxiety about the future).',
    keyTakeaways: [
      'Psychological time is created by the ego mind.',
      'The pain-body is an accumulation of old emotional energy seeking renewal through dramatic thinking.',
      'Inner body awareness is the primary portal into continuous presence.'
    ],
    sections: [
      {
        heading: 'What is the Pain-Body?',
        content: 'Eckhart Tolle describes the pain-body as an energetic entity composed of past unexpressed human pain. It feeds on negative thinking and interpersonal conflict.'
      }
    ],
    faqs: [
      {
        q: 'How do I access inner body awareness?',
        a: 'Direct your attention into your hands, feet, or chest. Feel the subtle tingling life-force energy within your physical form.'
      }
    ],
    relatedSlugs: ['feelings-vs-emotions', 'witness-consciousness-guide'],
    tags: ['presence', 'power-of-now', 'pain-body', 'eckhart-tolle', 'ego']
  },

  'why-do-i-overthink': {
    slug: 'why-do-i-overthink',
    type: 'guide',
    title: 'Why Do I Overthink Everything? Causes, Neuroscience & 5-Minute Relief',
    subtitle: 'Understand the root cause of racing thoughts and how to ground your attention in 5 minutes.',
    description: 'Overthinking is not a personality flaw. Learn why your brain creates racing thoughts and how to stop mental loops using somatic tracking and MindGym.',
    category: 'Mindfulness',
    author: 'Sim Katyal',
    publishDate: '2026-07-28',
    readTime: '6 min read',
    quickAnswer: 'Overthinking occurs when your brain\'s Default Mode Network (DMN) becomes hyperactive in response to unexpressed emotional energy stored in the physical body.',
    definition: 'Overthinking is a protective mental loop triggered by somatic stress signals.',
    keyTakeaways: [
      'Overthinking is your brain\'s attempt to solve a physical feeling using mental logic.',
      'You cannot think your way out of overthinking—you must drop attention into the physical body.',
      '5 minutes of conscious breathwork shifts your nervous system out of fight-or-flight mode.'
    ],
    sections: [
      {
        heading: 'Why Does the Brain Overthink?',
        content: 'When your body experiences an emotional surge (such as fear, inadequacy, or anxiety) that you do not consciously allow or feel, your nervous system triggers an alert. The brain interprets this alert as an immediate problem to solve and launches a barrage of "what if" thoughts.'
      },
      {
        heading: 'The 3-Step Overthinking Circuit Breaker',
        content: 'Break mental loops in under 2 minutes:',
        bulletPoints: [
          '1. Notice: Catch yourself overthinking and say silently: "My brain is trying to protect me."',
          '2. Drop Down: Shift awareness from your forehead down into your feet or palms.',
          '3. Breathe: Take 4 slow, deep abdominal breaths in MindGym.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Is overthinking a sign of anxiety?',
        a: 'Yes, overthinking is one of the most common cognitive symptoms of high somatic anxiety.'
      }
    ],
    relatedSlugs: ['feelings-vs-emotions', 'stopping-overthinking-naturally'],
    tags: ['overthinking', 'anxiety', 'mindfulness', 'mindgym', 'stress-relief']
  },

  'meditation-for-beginners': {
    slug: 'meditation-for-beginners',
    type: 'guide',
    title: 'Meditation for Beginners: How to Start Without Sitting Still for Hours',
    subtitle: 'A simple, practical approach to meditation that fits into a busy daily life.',
    description: 'New to meditation? Learn how to start a daily 5-minute meditation habit without fighting your thoughts or sitting in uncomfortable positions.',
    category: 'Meditation',
    author: 'Sim Katyal',
    publishDate: '2026-07-28',
    readTime: '5 min read',
    quickAnswer: 'Meditation for beginners is not about forcing your mind to be empty. It is simply the practice of gently returning your attention to your breath whenever you notice your mind has wandered.',
    keyTakeaways: [
      'Wandering thoughts are a natural part of meditation, not a failure.',
      'Consistency matters far more than duration—5 minutes daily beats 1 hour once a month.',
      'Using structured apps like MindGym builds momentum without friction.'
    ],
    sections: [
      {
        heading: 'The Biggest Beginner Myth: "I Can\'t Stop My Thoughts"',
        content: 'The goal of meditation is not to stop thoughts; it is to change your relationship with thoughts. When a thought arises during practice, notice it, label it ("thinking"), and softly return to your breath.'
      }
    ],
    faqs: [
      {
        q: 'How long should a beginner meditate?',
        a: 'Start with just 3 to 5 minutes a day. Build consistency before extending your practice.'
      }
    ],
    relatedSlugs: ['power-of-now-presence-guide', 'stopping-overthinking-naturally'],
    tags: ['meditation', 'beginners', 'mindfulness', 'mindgym', 'daily-habit']
  },

  'how-to-stop-overthinking-at-night': {
    slug: 'how-to-stop-overthinking-at-night',
    type: 'guide',
    title: 'How to Stop Overthinking at Night: 4 Somatic Steps to Quiet Your Mind Before Sleep',
    subtitle: 'Falling asleep when your mind won\'t stop racing. A practical somatic relaxation guide.',
    description: 'Stuck in bed with racing thoughts? Learn why overthinking spikes at night and how 4 somatic relaxation steps release nighttime anxiety for restful sleep.',
    category: 'Mindfulness',
    author: 'Sim Katyal',
    publishDate: '2026-07-28',
    readTime: '6 min read',
    quickAnswer: 'Overthinking spikes at night because without daytime distractions, unprocessed somatic stress signals reach conscious awareness. Relaxing the physical body releases these signals so sleep can occur naturally.',
    definition: 'Nighttime overthinking is unexpressed emotional tension rising when external sensory input drops.',
    keyTakeaways: [
      'Nighttime overthinking is not a sleep disorder—it is unexpressed nervous system tension.',
      'Trying to force your mind to go quiet creates more pressure. Focus on physical relaxation instead.',
      'Use 4-7-8 extended exhale breathing to trigger the parasympathetic rest-and-digest system.'
    ],
    sections: [
      {
        heading: 'Why Does Overthinking Worse at Night?',
        content: 'During the day, your focus is occupied by work, screens, conversations, and tasks. When you lie in bed in the quiet dark, sensory input drops to zero. Your brain finally has space to process accumulated emotional tension from the day.'
      },
      {
        heading: 'The 4-Step Somatic Wind-Down Ritual',
        content: 'Follow this 4-step practice when lying in bed:',
        bulletPoints: [
          '1. Brain Dump: Write down 3 top thoughts on paper before getting into bed.',
          '2. Feet Grounding: Direct 100% of your attention down into the soles of your feet for 60 seconds.',
          '3. 4-7-8 Breathing: Inhale 4s, hold 7s, exhale 8s for 4 full breath cycles.',
          '4. Body Scan: Soften your jaw, drop your shoulders away from your ears, and release your abdominal muscles.'
        ]
      }
    ],
    faqs: [
      {
        q: 'What if I wake up overthinking at 3 AM?',
        a: 'Do not stay in bed arguing with thoughts. Get up, drink a warm sip of water, do 2 minutes of gentle breathwork in MindGym, and return to bed when sleepy.'
      }
    ],
    relatedSlugs: ['why-do-i-overthink', 'stopping-overthinking-naturally', 'meditation-for-beginners'],
    tags: ['sleep', 'overthinking', 'anxiety', 'somatic-relaxation', 'breathwork']
  },
  'breaking-overthinking-anxiety-cycle': {
    slug: 'breaking-overthinking-anxiety-cycle',
    type: 'guide',
    title: 'Breaking the Overthinking-Anxiety Cycle: Complete Guide to Calming Your Nervous System',
    subtitle: 'Understand the neuroscience of the overthinking-anxiety spiral and 9 proven techniques to interrupt it.',
    description: 'Discover why overthinking triggers anxiety, how the cycle self-perpetuates, and 9 science-backed techniques to break free. Includes daily practices and when to seek professional help.',
    category: 'Emotional Intelligence',
    author: 'Sim Katyal',
    publishDate: new Date().toISOString().split('T')[0],
    readTime: '12 min read',
    quickAnswer: 'Overthinking activates your threat-detection system. Repeated worried thinking looks like persistent danger to your brain, triggering anxiety. The cycle locks when you become anxious about your anxiety. Breaking it requires interrupting at one of four stages using specific techniques.',
    definition: 'The overthinking-anxiety cycle: a self-reinforcing loop where repetitive worried thinking activates your nervous system, which generates more anxiety, which increases rumination—creating a spiral that feels inescapable.',
    keyTakeaways: [
      'Overthinking and anxiety aren\'t separate—overthinking is often the doorway into anxiety.',
      'Your brain can\'t distinguish real threats from imagined ones, so it treats worried thinking as evidence of danger.',
      'The cycle has four stages: trigger, repetitive analysis, anxiety activation, and defensive overthinking.',
      'Nine specific techniques can interrupt the cycle at different stages—one technique, used consistently, creates measurable change within 2-3 weeks.',
      'The fastest breakthroughs come from working with your body (breathing, movement) rather than trying to think your way out.'
    ],
    sections: [
      {
        heading: 'The Neuroscience: Why Overthinking Triggers Anxiety',
        content: 'Your brain has an ancient threat-detection system designed to keep you safe. When it senses danger—real or imagined—it activates your fight-or-flight response. The problem: your threat-detection system can\'t tell the difference between a real predator and a worried thought. When you overthink, your brain interprets repeated worried thinking as evidence that something is wrong, so it activates anxiety.'
      },
      {
        heading: 'The Four Stages of the Overthinking-Anxiety Spiral',
        content: 'Understanding the structure of the cycle helps you know where to interrupt it.',
        bulletPoints: [
          'Stage 1: The Trigger (external or internal thought)',
          'Stage 2: Repetitive Analysis (mind gets stuck in the loop)',
          'Stage 3: Anxiety Activation (body shifts into fight-or-flight)',
          'Stage 4: Defensive Overthinking (anxiety about your anxiety)'
        ]
      },
      {
        heading: 'Nine Techniques to Break the Cycle',
        content: 'Different techniques work at different stages. Pick one and use it consistently.',
        bulletPoints: [
          'Stage 1: The 10-Minute Rule, Cognitive Defusion',
          'Stage 2: The Worry Dump, Thought-Stopping',
          'Stage 3: Box Breathing, Progressive Muscle Relaxation, Opposite Action',
          'Stage 4: Self-Compassion Protocol, Meta-Awareness Practice'
        ]
      },
      {
        heading: 'Daily Practices to Rewire Your Nervous System',
        content: 'Knowing the techniques is one thing. Using them consistently is how you rewire your brain. Start with a 5-minute morning reset, a 15-minute evening wind-down, and a weekly check-in to notice patterns.'
      }
    ],
    faqs: [
      {
        q: 'How quickly will these techniques work?',
        a: 'Most people see noticeable improvement within 2-3 weeks of consistent practice. One technique, used daily, is more effective than knowing all nine but using them inconsistently.'
      },
      {
        q: 'When should I seek professional help?',
        a: 'If anxiety prevents you from work or relationships, if techniques help temporarily but intensity returns, or if you\'ve experienced trauma, consult a therapist trained in CBT or ACT. These techniques complement professional support but aren\'t a substitute when you need it.'
      },
      {
        q: 'Why does box breathing work so fast?',
        a: 'Box breathing activates your vagus nerve, which is part of your parasympathetic nervous system (your "brake" on stress). It directly counteracts adrenaline and cortisol, signaling safety to your nervous system in minutes.'
      }
    ],
    relatedSlugs: ['why-do-i-overthink', 'stopping-overthinking-naturally', 'witness-consciousness-guide', 'meditation-for-beginners'],
    tags: ['anxiety', 'overthinking', 'nervous-system', 'neuroscience', 'breathing', 'emotional-regulation']
  }
};

// ─── GLOSSARY DICTIONARY REGISTRY ─────────────────────────────────────────────
export const GLOSSARY_REGISTRY: Record<string, GlossaryTerm> = {
  'presence': {
    slug: 'presence',
    term: 'Presence',
    phonetic: '/ˈprez.əns/',
    shortDefinition: 'The state of complete, un-distracted awareness in the current moment, free from psychological time and mental chatter.',
    fullDefinition: 'Presence is the foundational state of consciousness wherein attention is entirely anchored in the immediate Now. Unlike ordinary mind states dominated by memories of the past or anticipations of the future, presence operates as calm, silent awareness.',
    etymology: 'From Latin praesentia (being at hand, instant).',
    keyPrinciples: [
      'Presence is accessed through body awareness, breath focus, and sensory perception.',
      'Presence dissolves anxiety because anxiety requires psychological projection into the future.',
      'In presence, you are not reacting to life; you are witnessing life unfold.'
    ],
    commonMisconceptions: [
      'Misconception: Presence means having no thoughts. Reality: Presence means not being attached to thoughts.',
      'Misconception: Presence takes hours of seated meditation. Reality: Presence can be accessed in a single conscious breath.'
    ],
    dailyPractice: 'Take 3 slow abdominal breaths. Feel the physical sensation of air moving through your nostrils and expand your chest.',
    category: 'Presence & Awareness',
    relatedArticleSlugs: ['power-of-now-presence-guide', 'witness-consciousness-guide']
  },

  'witness-consciousness': {
    slug: 'witness-consciousness',
    term: 'Witness Consciousness',
    phonetic: '/ˈwɪt.nəs ˈkɒn.ʃəs.nəs/',
    shortDefinition: 'The transcendent awareness that observes all thoughts, emotions, and physical sensations without judgment or identification.',
    fullDefinition: 'Witness Consciousness (Sakshi Bhava in Eastern philosophy) refers to the realization that your true essence is the quiet, observing awareness behind mental activity, rather than the noisy thoughts themselves.',
    keyPrinciples: [
      'The Witness remains calm even during intense emotional surges.',
      'Abiding as the Witness breaks the automatic link between thought triggers and reactive behaviors.',
      'It is the core practice advocated in Michael Singer\'s The Untethered Soul.'
    ],
    commonMisconceptions: [
      'Misconception: Witnessing makes you emotionally numb. Reality: Witnessing allows you to feel emotions deeply without being swept away by them.'
    ],
    dailyPractice: 'Silently ask yourself: "Who is observing this thought?" and feel the quiet space that opens up behind your mind.',
    category: 'Presence & Awareness',
    relatedArticleSlugs: ['witness-consciousness-guide', 'feelings-vs-emotions']
  },

  'pain-body': {
    slug: 'pain-body',
    term: 'Pain-Body',
    phonetic: '/peɪn ˈbɒd.i/',
    shortDefinition: 'An accumulated energy field of past unexpressed emotional suffering that periodically activates to trigger mental drama.',
    fullDefinition: 'Coined by Eckhart Tolle, the pain-body is an energetic structure formed by unresolved emotional wounds from childhood and past experiences. When triggered, it compels the mind to generate negative thoughts that perpetuate emotional pain.',
    keyPrinciples: [
      'The pain-body feeds on negative thinking and emotional conflict.',
      'Brought into the light of conscious presence, the pain-body cannot survive and turns back into pure awareness.'
    ],
    commonMisconceptions: [
      'Misconception: The pain-body is a permanent personality flaw. Reality: It is merely unintegrated emotional energy.'
    ],
    dailyPractice: 'When an irrational wave of grief or anger arises, refrain from telling a story. Just feel the physical ache directly until it subsides.',
    category: 'Emotional Intelligence',
    relatedArticleSlugs: ['power-of-now-presence-guide', 'feelings-vs-emotions']
  },

  'somatic-tracking': {
    slug: 'somatic-tracking',
    term: 'Somatic Tracking',
    phonetic: '/səˈmæt.ɪk ˈtræk.ɪŋ/',
    shortDefinition: 'The mind-body practice of paying light, objective attention to raw physical sensations without fear or judgment.',
    fullDefinition: 'Somatic Tracking is a neuroplastic technique used to re-train the brain\'s threat detection system. By observing bodily sensations (tightness, heat, tingling) with curious neutrality, you signal to your nervous system that the sensations are safe.',
    keyPrinciples: [
      'Safety is communicated through non-judgmental observation.',
      'It deactivates the amygdala\'s fight-or-flight alert mechanism.'
    ],
    commonMisconceptions: [
      'Misconception: Somatic tracking is trying to make pain go away. Reality: It is observing sensation without caring if it changes.'
    ],
    dailyPractice: 'Scan your body from head to toe in MindGym, naming sensations (e.g. "warmth in shoulders") with warm curiosity.',
    category: 'Emotional Regulation',
    relatedArticleSlugs: ['stopping-overthinking-naturally', 'feelings-vs-emotions']
  }
};

// ─── VIDEO RESOURCES REGISTRY ────────────────────────────────────────────────
export const VIDEO_REGISTRY: Record<string, VideoResource> = {
  'ep1-feelings-and-emotions': {
    id: 'ep1-feelings-and-emotions',
    title: 'What Are Feelings & Emotions? — Episode 1 Preview',
    description: 'Explore the fundamental difference between raw physical feelings and mental emotional conditioning in Episode 1 of the Feelings & Emotions course series.',
    youtubeId: 'fTrY9KMLhAo',
    duration: '6:12',
    uploadDate: '2026-01-01',
    transcriptSummary: 'In this introductory video, Sim Katyal explains why emotions become trapped in the human body and how mental stories prolong physical suffering. Learn how to observe sensations directly.',
    keyTakeaways: [
      'Physical feelings arise directly in the nervous system.',
      'Mental stories turn short feelings into long-lasting emotional suffering.',
      'Presence breaks the cycle of emotional reactivity.'
    ],
    relatedGuideSlugs: ['feelings-vs-emotions', 'witness-consciousness-guide']
  },

  'ep2-art-of-witnessing': {
    id: 'ep2-art-of-witnessing',
    title: 'The Art of Witnessing — Episode 2 Preview',
    description: 'Learn how to sit in the seat of the observer and watch your thoughts and feelings pass by like clouds in the sky.',
    youtubeId: 'pES3x5XlJF0',
    duration: '5:45',
    uploadDate: '2026-01-15',
    transcriptSummary: 'Sim Katyal guides viewers through the practice of Witness Consciousness based on The Untethered Soul, demonstrating how to dis-identify from racing thoughts.',
    keyTakeaways: [
      'You are the observer, not the noisy thoughts.',
      'Non-judgmental awareness dissolves mental tension.',
      'Daily 5-minute practice builds unshakeable peace.'
    ],
    relatedGuideSlugs: ['witness-consciousness-guide', 'stopping-overthinking-naturally']
  },

  'ep5-part-1-see-your-masks': {
    id: 'ep5-part-1-see-your-masks',
    title: 'Episode 5 Part 1: Why We Keep Trying to Prove Ourselves',
    description: 'The drive to achieve, people-please, and prove ourselves — and the quiet, bottomless ache that success cannot fill.',
    youtubeId: '0nxN9fQfVKU',
    duration: '12:00',
    uploadDate: '2026-09-01',
    transcriptSummary: 'Sim Katyal explores the underlying drive to achieve, people-please, and maintain masks of validation.',
    keyTakeaways: [
      'Ego masks are constructed to protect vulnerable feelings.',
      'People-pleasing is a somatic strategy to secure safety.',
      'Awareness dissolves the need to constantly perform.'
    ],
    relatedGuideSlugs: ['feelings-vs-emotions', 'witness-consciousness-guide']
  },

  'ep5-part-2-see-your-masks': {
    id: 'ep5-part-2-see-your-masks',
    title: 'Episode 5 Part 2: The Mask of Achievement & Approval',
    description: 'Understanding why we construct ego masks to seek approval and how to stop performing for validation.',
    youtubeId: 'SajZXFmmDmQ',
    duration: '14:00',
    uploadDate: '2026-09-01',
    transcriptSummary: 'Deepening into the mechanics of the achievement mask and unmasking the observer.',
    keyTakeaways: [
      'Validation seeking reinforces the delusion of inadequacy.',
      'Sitting with the feeling of unworthiness transforms it.',
      'Presence needs no proof.'
    ],
    relatedGuideSlugs: ['feelings-vs-emotions', 'witness-consciousness-guide']
  },

  'ep5-part-3-see-your-masks': {
    id: 'ep5-part-3-see-your-masks',
    title: 'Episode 5 Part 3: Dissolving the Need to Prove Yourself',
    description: 'Somatic release of the urge to prove worth, stepping into natural presence and inner completeness.',
    youtubeId: 'F1Bcb9gmXPo',
    duration: '15:00',
    uploadDate: '2026-09-01',
    transcriptSummary: 'Final integration of Episode 5: letting go of the struggle to prove yourself.',
    keyTakeaways: [
      'Complete emotional surrender brings true freedom.',
      'You are already whole without external proof.',
      'Somatic release settles the nervous system.'
    ],
    relatedGuideSlugs: ['feelings-vs-emotions', 'witness-consciousness-guide']
  }
};

// ─── GUIDED LEARNING JOURNEYS ─────────────────────────────────────────────────
export const LEARNING_JOURNEYS: LearningJourney[] = [
  {
    id: 'overthinking-recovery',
    title: 'Overthinking Recovery Journey',
    description: 'A 3-step guided pathway to quiet racing thoughts, break mental loops, and ground your awareness in the body.',
    targetGoal: 'Dissolve mental chatter & cultivate instant calm',
    estimatedDays: '3 Days',
    level: 'Beginner',
    steps: [
      {
        title: 'Step 1: Understand Feelings vs Emotions',
        description: 'Learn why overthinking happens and how to shift attention from thoughts to body signals.',
        resourceSlug: 'feelings-vs-emotions',
        resourceType: 'guide'
      },
      {
        title: 'Step 2: Learn Somatic Tracking',
        description: 'Explore how somatic tracking deactivates the brain\'s stress network.',
        resourceSlug: 'somatic-tracking',
        resourceType: 'glossary'
      },
      {
        title: 'Step 3: Practice in MindGym',
        description: 'Complete your first 5-minute presence breathwork and witness reflection in MindGym.',
        resourceSlug: '/mindgym',
        resourceType: 'mindgym'
      }
    ]
  },
  {
    id: 'witness-consciousness-mastery',
    title: 'Witness Consciousness & Presence Journey',
    description: 'Master the seat of the observer and learn to abide as quiet awareness during daily life.',
    targetGoal: 'Freedom from emotional reactivity & deep presence',
    estimatedDays: '5 Days',
    level: 'Intermediate',
    steps: [
      {
        title: 'Step 1: The Observer Principle',
        description: 'Discover the core teachings of Eckhart Tolle and Michael Singer.',
        resourceSlug: 'witness-consciousness-guide',
        resourceType: 'guide'
      },
      {
        title: 'Step 2: Dissolving the Pain-Body',
        description: 'Learn how to recognize and disarm old emotional patterns.',
        resourceSlug: 'pain-body',
        resourceType: 'glossary'
      },
      {
        title: 'Step 3: Watch Episode 1 Preview',
        description: 'Watch Sim Katyal explain emotional regulation in action.',
        resourceSlug: 'ep1-feelings-and-emotions',
        resourceType: 'video'
      }
    ]
  }
];

// ─── TOPIC HUBS ──────────────────────────────────────────────────────────────
export const TOPIC_HUBS: TopicHubInfo[] = [
  {
    id: 'presence',
    name: 'Presence & Awareness',
    tagline: 'Living in the Now free from psychological time & overthinking.',
    description: 'Discover authoritative resources on present moment awareness, Eckhart Tolle\'s teachings, and grounding rituals.',
    iconName: 'Compass',
    featuredArticleSlugs: ['power-of-now-presence-guide', 'witness-consciousness-guide'],
    featuredGlossarySlugs: ['presence', 'pain-body'],
    featuredVideoIds: ['ep2-art-of-witnessing']
  },
  {
    id: 'emotional-intelligence',
    name: 'Emotional Intelligence & Healing',
    tagline: 'Transform emotional reactivity into somatic awareness & inner freedom.',
    description: 'Comprehensive guides on physical feelings vs mental emotions, somatic tracking, and breaking anxiety loops.',
    iconName: 'Heart',
    featuredArticleSlugs: ['feelings-vs-emotions', 'stopping-overthinking-naturally'],
    featuredGlossarySlugs: ['witness-consciousness', 'somatic-tracking'],
    featuredVideoIds: ['ep1-feelings-and-emotions']
  }
];

// ─── AUTOMATED RECOMMENDATION ENGINE ─────────────────────────────────────────
export function getRelatedContent(currentSlug: string, limit = 4): ContentArticle[] {
  const current = ARTICLES_REGISTRY[currentSlug];
  const allArticles = Object.values(ARTICLES_REGISTRY);

  if (!current) return allArticles.slice(0, limit);

  // Score articles by matching category, tags, or explicit relatedSlugs
  const scored = allArticles
    .filter((a) => a.slug !== currentSlug)
    .map((a) => {
      let score = 0;
      if (a.category === current.category) score += 3;
      if (current.relatedSlugs.includes(a.slug)) score += 5;
      const sharedTags = a.tags.filter((t) => current.tags.includes(t));
      score += sharedTags.length * 2;
      return { article: a, score };
    });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.article);
}

// ─── GLOBAL SITE-WIDE SEARCH INDEX ───────────────────────────────────────────
export interface SearchResultItem {
  title: string;
  subtitle: string;
  url: string;
  type: 'Guide' | 'Glossary' | 'Video' | 'Journey' | 'App';
  category: string;
}

export function searchKnowledgeBase(query: string): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];

  // Search Guides & Articles
  Object.values(ARTICLES_REGISTRY).forEach((art) => {
    if (art.title.toLowerCase().includes(q) || art.description.toLowerCase().includes(q) || art.tags.some(t => t.toLowerCase().includes(q))) {
      results.push({
        title: art.title,
        subtitle: art.subtitle,
        url: `/guides/${art.slug}`,
        type: 'Guide',
        category: art.category
      });
    }
  });

  // Search Glossary Terms
  Object.values(GLOSSARY_REGISTRY).forEach((term) => {
    if (term.term.toLowerCase().includes(q) || term.shortDefinition.toLowerCase().includes(q)) {
      results.push({
        title: `Glossary: ${term.term}`,
        subtitle: term.shortDefinition,
        url: `/glossary/${term.slug}`,
        type: 'Glossary',
        category: term.category
      });
    }
  });

  // Search Videos
  Object.values(VIDEO_REGISTRY).forEach((vid) => {
    if (vid.title.toLowerCase().includes(q) || vid.description.toLowerCase().includes(q)) {
      results.push({
        title: vid.title,
        subtitle: vid.description,
        url: `/videos/${vid.id}`,
        type: 'Video',
        category: 'YouTube Masterclass'
      });
    }
  });

  // Always append MindGym & Feelings Course if relevant
  if ('mindgym'.includes(q) || 'app'.includes(q) || 'practice'.includes(q) || 'meditation'.includes(q)) {
    results.push({
      title: 'MindGym Daily Mind Training App',
      subtitle: '5-minute presence breathwork, somatic body tracking & witness journaling.',
      url: '/mindgym',
      type: 'App',
      category: 'Daily Practice'
    });
  }

  if ('course'.includes(q) || 'feelings'.includes(q) || 'episodes'.includes(q)) {
    results.push({
      title: 'Understanding Feelings & Emotions Course',
      subtitle: '7-episode guided video course by Sim Katyal & Soulful Intelligence Studio.',
      url: '/feelingsandemotioncourse',
      type: 'Guide',
      category: 'Guided Course'
    });
  }

  return results.slice(0, 8);
}
