export interface Section {
  heading: string;
  content: string;
  bulletPoints?: string[];
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface ContentArticle {
  slug: string;
  type: 'guide' | 'glossary' | 'article' | 'video';
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
}

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
    relatedSlugs: ['witness-consciousness-guide', 'stopping-overthinking-naturally', 'power-of-now-presence-guide']
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
    relatedSlugs: ['feelings-vs-emotions', 'power-of-now-presence-guide', 'stopping-overthinking-naturally']
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
    relatedSlugs: ['feelings-vs-emotions', 'witness-consciousness-guide']
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
    relatedSlugs: ['feelings-vs-emotions', 'witness-consciousness-guide']
  }
};
