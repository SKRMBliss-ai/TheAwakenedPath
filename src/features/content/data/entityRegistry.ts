export interface CanonicalEntity {
  id: string;
  name: string;
  slug: string;
  shortDefinition: string;
  fullDefinition: string;
  aliases: string[];
  parentEntityId?: string;
  childEntityIds: string[];
  schemaType: 'DefinedTerm' | 'Organization' | 'SoftwareApplication' | 'Course' | 'Person' | 'Thing';
  relatedGuideSlugs: string[];
  relatedGlossarySlugs: string[];
  relatedVideoIds: string[];
  mindgymPracticeUrl: string;
  courseModuleUrl: string;
}

export const ENTITY_REGISTRY: Record<string, CanonicalEntity> = {
  'meditation': {
    id: 'meditation',
    name: 'Meditation',
    slug: 'meditation',
    shortDefinition: 'The practice of training attention and awareness to cultivate a calm, clear, and stable mind.',
    fullDefinition: 'Meditation encompasses a family of mental training practices designed to refine attention, regulate emotional reactivity, and foster insight into the nature of thought, self, and reality.',
    aliases: ['Dhyana', 'Mind Training', 'Seated Practice'],
    childEntityIds: ['mindfulness', 'breathwork'],
    schemaType: 'DefinedTerm',
    relatedGuideSlugs: ['stopping-overthinking-naturally', 'witness-consciousness-guide'],
    relatedGlossarySlugs: ['presence', 'somatic-tracking'],
    relatedVideoIds: ['ep1-feelings-and-emotions'],
    mindgymPracticeUrl: '/mindgym',
    courseModuleUrl: '/feelingsandemotioncourse'
  },

  'mindfulness': {
    id: 'mindfulness',
    name: 'Mindfulness',
    slug: 'mindfulness',
    shortDefinition: 'Maintaining non-judgmental, moment-by-moment awareness of thoughts, feelings, bodily sensations, and surroundings.',
    fullDefinition: 'Mindfulness is the operational capacity to observe immediate experience without pushing it away or clinging to it. Originating in Buddhist Sati practices, it is a core mechanism of neuroplastic emotional regulation.',
    aliases: ['Sati', 'Bare Attention', 'Non-judgmental Awareness'],
    parentEntityId: 'meditation',
    childEntityIds: ['presence', 'somatic-awareness'],
    schemaType: 'DefinedTerm',
    relatedGuideSlugs: ['stopping-overthinking-naturally', 'feelings-vs-emotions'],
    relatedGlossarySlugs: ['presence', 'somatic-tracking'],
    relatedVideoIds: ['ep2-art-of-witnessing'],
    mindgymPracticeUrl: '/mindgym',
    courseModuleUrl: '/feelingsandemotioncourse'
  },

  'presence': {
    id: 'presence',
    name: 'Presence',
    slug: 'presence',
    shortDefinition: 'The state of complete, un-distracted awareness in the current moment, free from psychological time.',
    fullDefinition: 'Presence is the foundational state of consciousness wherein attention is entirely anchored in the immediate Now. Popularized by Eckhart Tolle in The Power of Now, presence operates as quiet, non-reactive awareness.',
    aliases: ['The Now', 'Present Moment Awareness', 'Being Here Now'],
    parentEntityId: 'mindfulness',
    childEntityIds: ['witness-consciousness'],
    schemaType: 'DefinedTerm',
    relatedGuideSlugs: ['power-of-now-presence-guide', 'witness-consciousness-guide'],
    relatedGlossarySlugs: ['presence', 'pain-body'],
    relatedVideoIds: ['ep2-art-of-witnessing'],
    mindgymPracticeUrl: '/mindgym',
    courseModuleUrl: '/feelingsandemotioncourse'
  },

  'witness-consciousness': {
    id: 'witness-consciousness',
    name: 'Witness Consciousness',
    slug: 'witness-consciousness',
    shortDefinition: 'The transcendent awareness that observes all thoughts, emotions, and sensations without identifying with them.',
    fullDefinition: 'Witness Consciousness (Sakshi Bhava) is the realization that your true identity is the calm, unshakeable observer behind mental activity, rather than the noisy thoughts themselves. Central to Michael Singer\'s The Untethered Soul.',
    aliases: ['The Observer', 'Sakshi Bhava', 'Seat of Awareness'],
    parentEntityId: 'presence',
    childEntityIds: ['ego'],
    schemaType: 'DefinedTerm',
    relatedGuideSlugs: ['witness-consciousness-guide', 'feelings-vs-emotions'],
    relatedGlossarySlugs: ['witness-consciousness', 'pain-body'],
    relatedVideoIds: ['ep2-art-of-witnessing'],
    mindgymPracticeUrl: '/mindgym',
    courseModuleUrl: '/feelingsandemotioncourse'
  },

  'pain-body': {
    id: 'pain-body',
    name: 'Pain-Body',
    slug: 'pain-body',
    shortDefinition: 'An accumulated energetic field of past unexpressed emotional suffering that periodically activates mental drama.',
    fullDefinition: 'Coined by Eckhart Tolle, the pain-body is an energetic structure formed by unresolved emotional wounds. When brought into the light of conscious presence, it dissolves back into pure awareness.',
    aliases: ['Accumulated Pain', 'Emotional Trauma Field'],
    parentEntityId: 'witness-consciousness',
    childEntityIds: [],
    schemaType: 'DefinedTerm',
    relatedGuideSlugs: ['power-of-now-presence-guide', 'feelings-vs-emotions'],
    relatedGlossarySlugs: ['pain-body', 'somatic-tracking'],
    relatedVideoIds: ['ep1-feelings-and-emotions'],
    mindgymPracticeUrl: '/mindgym',
    courseModuleUrl: '/feelingsandemotioncourse'
  },

  'emotional-intelligence': {
    id: 'emotional-intelligence',
    name: 'Emotional Intelligence',
    slug: 'emotional-intelligence',
    shortDefinition: 'The ability to perceive, understand, manage, and regulate emotions in self and others.',
    fullDefinition: 'Emotional Intelligence (EQ) in our framework is the somatic capacity to allow physical sensations to rise and pass without being hijacked by egoic reactivity or mental overthinking.',
    aliases: ['EQ', 'Emotional Regulation', 'Somatic Mastery'],
    childEntityIds: ['feelings', 'emotions'],
    schemaType: 'DefinedTerm',
    relatedGuideSlugs: ['feelings-vs-emotions', 'stopping-overthinking-naturally'],
    relatedGlossarySlugs: ['somatic-tracking', 'witness-consciousness'],
    relatedVideoIds: ['ep1-feelings-and-emotions'],
    mindgymPracticeUrl: '/mindgym',
    courseModuleUrl: '/feelingsandemotioncourse'
  }
};

export function getEntity(idOrSlug: string): CanonicalEntity | undefined {
  return ENTITY_REGISTRY[idOrSlug.toLowerCase()] || Object.values(ENTITY_REGISTRY).find(e => e.slug === idOrSlug.toLowerCase());
}
