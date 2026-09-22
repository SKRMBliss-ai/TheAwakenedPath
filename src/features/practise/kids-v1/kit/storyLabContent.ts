/**
 * Story Lab content — expanded age-aware source.
 *
 * GENERATED FROM: StoryLab_Content_Expanded_By_Age.xlsx
 * BASED ON: the original storyLabContent.ts architecture.
 *
 * Architecture remains:
 *   feeling -> thought pool -> selected thought's theme -> event pool
 *
 * Backwards compatibility:
 *   thoughtsFor(feeling) and eventsFor(thought, feeling) still work.
 *   Pass child age (number) or AgeBand to use developmentally filtered content.
 *
 * Editorial notes:
 * - "Theme" is a routing aid for content, not a diagnosis.
 * - Child-entered thoughts should be treated as their words, not as facts about other people.
 * - Content marked "adult-support" should route out of clever perspective-play if it
 *   appears to describe a current unsafe situation.
 * - Expanded workbook rows did not always contain an icon; those event rows receive
 *   a theme-default icon during this conversion so the existing Option UI keeps working.
 */

export type Option = { text: string; icon: string; own?: boolean };

export type Theme =
  | 'rejection' | 'failure' | 'unfairness' | 'uncertainty'
  | 'loss' | 'conflict' | 'pressure' | 'comparison' | 'bright';

export type FeelingKey =
  | 'happy' | 'excited' | 'calm' | 'sad'
  | 'angry' | 'scared' | 'worried' | 'jealous' | 'other';

export type AgeBand = '3-5' | '6-8' | '9-11' | '12-14';
export type AgeInput = number | AgeBand | undefined;
export type SafetyRouting = 'routine' | 'adult-support';
export type ContentOrigin = 'existing' | 'expanded';

type Thought = Option & {
  theme: Theme;
  ageBand: AgeBand;
  subtheme: string;
  contexts: string[];
  safety: SafetyRouting;
  origin: ContentOrigin;
};

type EventOption = Option & {
  ageBand: AgeBand;
  subtheme: string;
  contexts: string[];
  safety: SafetyRouting;
  origin: ContentOrigin;
};

export const AGE_GUIDANCE: Record<AgeBand, {
  developmentalEmphasis: string;
  presentationGuidance: string;
}> = {
  "3-5": {
    "developmentalEmphasis": "Immediate, concrete experiences: separation, turn-taking, routines, sensory surprises, simple belonging.",
    "presentationGuidance": "Very short phrases; read aloud; pictures/characters; one idea at a time."
  },
  "6-8": {
    "developmentalEmphasis": "School/playground fairness, competence, rules, friendship and being noticed become highly salient.",
    "presentationGuidance": "Concrete examples; simple cause-and-effect; 4–6 visible options."
  },
  "9-11": {
    "developmentalEmphasis": "Peer belonging, comparison, performance and responsibility become more nuanced.",
    "presentationGuidance": "Allow mixed feelings; distinguish fact vs guess; include school, clubs and early digital contexts."
  },
  "12-14": {
    "developmentalEmphasis": "Friendship shifts, autonomy, group communication, social comparison and future pressure become more complex.",
    "presentationGuidance": "Respect nuance and privacy; avoid assuming motives; use possibility language and more mature phrasing."
  }
};

export const THEME_GUIDANCE: Record<Theme, {
  whatItCaptures: string;
  appImplication: string;
  safetyNote: string;
}> = {
  "rejection": {
    "whatItCaptures": "Belonging, exclusion, being ignored or not chosen.",
    "appImplication": "Offer events about joining, invitations, replies, partners and attention.",
    "safetyNote": "Do not imply rejection is intentional unless the child says so."
  },
  "failure": {
    "whatItCaptures": "Mistakes, competence, unfinished tasks and self-evaluation.",
    "appImplication": "Use school/play/activity events without turning mistakes into identity.",
    "safetyNote": "Avoid 'you failed'; keep language about the event or attempt."
  },
  "unfairness": {
    "whatItCaptures": "Rules, turns, blame, voice and inconsistent treatment.",
    "appImplication": "Let the child separate 'I disliked it' from 'it was objectively unfair'.",
    "safetyNote": "Validate feeling without deciding facts the app cannot know."
  },
  "uncertainty": {
    "whatItCaptures": "Not knowing, waiting, change and unclear meaning.",
    "appImplication": "Useful for worry/scared and some excited/calm thoughts.",
    "safetyNote": "Current serious-safety disclosures should route to adult support."
  },
  "loss": {
    "whatItCaptures": "Separation, endings, cancelled expectations and change.",
    "appImplication": "Keep examples broad; a child may mean small or significant loss.",
    "safetyNote": "Do not force reframing; allow sadness and support."
  },
  "conflict": {
    "whatItCaptures": "Arguments, hurtful words, boundaries and repair.",
    "appImplication": "Pair with calm communication / adult help where needed.",
    "safetyNote": "Boundary violations or unsafe contact may need trusted-adult flow."
  },
  "pressure": {
    "whatItCaptures": "Performance, time, expectations and responsibility.",
    "appImplication": "Age up naturally from classroom turns to deadlines and commitments.",
    "safetyNote": "Avoid perfectionism reinforcement."
  },
  "comparison": {
    "whatItCaptures": "Comparing ability, attention, belongings, opportunity or social position.",
    "appImplication": "Normalize comparison without ranking bodies or worth.",
    "safetyNote": "Do not use appearance/body comparison as reward content."
  },
  "bright": {
    "whatItCaptures": "Positive meaning: belonging, mastery, relief, calm, kindness and anticipation.",
    "appImplication": "Keep for code compatibility; use subtheme to make positive content richer.",
    "safetyNote": "Positive experiences do not need a lesson or correction."
  }
};

const THOUGHTS: Record<FeelingKey, Thought[]> = {
  "happy": [
    {
      "text": "Today went well.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone was kind to me.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "connection / belonging",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I did something I was proud of.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I felt like I belonged.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I made someone else smile.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'm lucky to have my people.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Something good happened for once.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I hope it stays like this.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I wonder if it will last.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I want to tell someone about it.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I felt properly myself today.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "That was worth it.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I want to remember this bit.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "That was a good surprise.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody chose me.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I laughed properly today.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I feel lighter than I did.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They asked me to play.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I did it by myself.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My grown-up came back.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone shared with me.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "connection / belonging",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I made something I like.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "We laughed together.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I finally learned how to do it.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone saved me a place.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My friend came looking for me.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "connection / belonging",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I helped and it made a difference.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was brave enough to try.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Today felt easy to be myself.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I handled something that used to be hard for me.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I felt included without having to try so hard.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone trusted me with something important.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I am proud of how I treated someone.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I did better because I kept practising.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had a day where I wasn't comparing myself.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I felt accepted without having to change myself.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I did something difficult and stayed true to myself.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friendship felt easy and mutual today.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "connection / belonging",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I noticed that I have actually improved.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I enjoyed something without worrying how I looked doing it.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I handled a disagreement better than I used to.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "excited": [
    {
      "text": "I can't wait for it.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Something great is coming.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I want to tell everyone.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I hope it's as good as I imagine.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "What if it doesn't happen?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I've been waiting ages for this.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I can't sit still.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "This is going to be brilliant.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "What if I mess it up?",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I want to be really good at it.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Finally something for me.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I keep thinking about it.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I keep imagining how it will go.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I want it to be tomorrow already.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I've got butterflies, the good kind.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "connection / belonging",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everyone is going to be there.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I hope I get a turn.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Is it time yet?",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I want to go now!",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I get to try something new.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I hope I get a turn.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I want to show everyone.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I have happy butterflies.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I keep imagining what it will be like.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I want to tell my friend straight away.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "connection / belonging",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I hope I get chosen.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I have so much energy I can't sit still.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "This could be really fun.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if it is even better than I think?",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "This feels like a chance to do something new.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I keep thinking about who will be there.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I really want this to go well.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "9-11",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I can't stop planning what I might do.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I hope I get the part or place I want.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel nervous and excited at the same time.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "This feels like a real opportunity for me.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I'm excited, but I also really want it to go well.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "12-14",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I keep imagining all the ways this could unfold.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I want to share this with people who will get why it matters.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I hope I can enjoy it without overthinking it.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "12-14",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel nervous because I care about this.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "12-14",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "calm": [
    {
      "text": "Things are alright just now.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't need to rush.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I can handle what comes.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "It's quiet in my head.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "calm / relief",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I feel safe here.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'm glad I have this moment.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nothing needs fixing right now.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "calm / relief",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I did what I could today.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I wonder how long this will last.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'd like to feel like this more often.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'm okay with not knowing yet.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I can breathe properly.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nothing is pulling at me.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "calm / relief",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I like it being this quiet.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "calm / relief",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't have to be anywhere.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Today was enough.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I feel steady.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "calm / relief",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I feel cosy here.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I like this quiet bit.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "calm / relief",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I can take my time.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My body feels soft and slow.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "body",
        "sensory"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I know what happens next.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I am okay right now.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I know I don't have to hurry.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I can hear myself think.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel safe with these people.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I finished what I needed to do.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I can wait and see.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "waiting / not knowing",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Nothing needs fixing this minute.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "calm / relief",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I can leave some things unfinished for tomorrow.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't need everyone to agree with me right now.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My brain feels less crowded.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I know what I can control today.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I can wait for more information.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "9-11",
      "subtheme": "waiting / not knowing",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel settled even though everything isn't perfect.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't have to solve everything tonight.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I can let someone else's opinion be theirs.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I know what matters to me in this moment.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I can wait before deciding what something means.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "12-14",
      "subtheme": "waiting / not knowing",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel steady enough to choose instead of react.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "calm / relief",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I am okay with not having every answer yet.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "12-14",
      "subtheme": "waiting / not knowing",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "sad": [
    {
      "text": "Nobody wants me around.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't belong here.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nobody understands me.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'm all on my own.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I miss how things used to be.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "6-8",
      "subtheme": "separation / relationship change",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "It's never going to get better.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'm not good enough.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I can't do anything right.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I ruined everything.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everything is going wrong.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "mistake / performance",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "It's not fair.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "3-5",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I wish today hadn't happened.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't want to talk to anyone.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everything feels heavy today.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I let everyone down.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nobody even noticed.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "being unseen / unheard",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I just want today to be over.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They didn't play with me.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "3-5",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I wanted them to stay.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "3-5",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My picture didn't work.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "3-5",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I miss my grown-up.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "3-5",
      "subtheme": "separation / relationship change",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Nobody picked my game.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "3-5",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I wanted today to be different.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "3-5",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They played without me.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I tried hard and it still went wrong.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "mistake / performance",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My friend didn't sit with me today.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Something I was looking forward to got cancelled.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "6-8",
      "subtheme": "cancelled expectation",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel like nobody noticed I was upset.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "being unseen / unheard",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I wish I could start the day again.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "It feels like my group has moved on without me.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "9-11",
      "subtheme": "social acceptance",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I worked hard and I'm still disappointed.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "9-11",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I miss how close we used to be.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "9-11",
      "subtheme": "separation / relationship change",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel invisible when everyone is together.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "9-11",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I wish I hadn't said that.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "9-11",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I thought today would matter more than it did.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "9-11",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel like I'm drifting away from people I used to be close to.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "12-14",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I keep wondering whether I matter to this group.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "12-14",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I put a lot into this and it still wasn't enough.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "12-14",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I miss how uncomplicated things used to feel.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "12-14",
      "subtheme": "separation / relationship change",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel left out even when I'm technically there.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "12-14",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I wish I could undo that conversation.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "12-14",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "angry": [
    {
      "text": "It's not fair.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "3-5",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They did that on purpose.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nobody ever listens to me.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They started it.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I always get the blame.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "blame / consequence",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They should have known better.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I want to shout at someone.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "words / disagreement",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everyone else gets what they want.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They're being mean to me.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Why does this always happen to me?",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I hate this.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nobody is on my side.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nobody asked me first.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They never say sorry.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'm sick of being told what to do.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Why am I the only one who cares?",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I want to shout and not stop.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They took my turn.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "3-5",
      "subtheme": "turn-taking",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They grabbed my toy.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "3-5",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "game",
        "play",
        "possessions"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I said stop and they didn't.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "3-5",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "adult-support",
      "origin": "expanded"
    },
    {
      "text": "I wanted to choose.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "3-5",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They knocked it down.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "3-5",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't want to wait.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "3-5",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They changed the rules when I was winning.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "rules / consistency",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I got blamed before anyone asked me.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "blame / consequence",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They kept interrupting me.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My sibling used my thing without asking.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I did the work and they got the praise.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They laughed when I was being serious.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "words / disagreement",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They decided what happened without hearing me.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "9-11",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They shared my business with other people.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "9-11",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was told to calm down before anyone listened.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "9-11",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They got credit for something I helped with.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "9-11",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They keep making the same joke after I asked them to stop.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "9-11",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel like the rules are different for me.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "9-11",
      "subtheme": "rules / consistency",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They made a decision about me without including me.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "12-14",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone shared something private that wasn't theirs to share.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "12-14",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel controlled when nobody explains the reason.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "12-14",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They keep pushing the same boundary after I said no.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "12-14",
      "subtheme": "words / disagreement",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was expected to take responsibility for everyone else's part.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "12-14",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "People are judging my reaction instead of what happened.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "12-14",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "scared": [
    {
      "text": "Something bad is going to happen.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'm going to get in trouble.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I can't do it.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "3-5",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everyone will be looking at me.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'll get it wrong in front of everyone.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "social performance",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I want to run away from this.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't feel safe.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "safety / reassurance",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "adult-support",
      "origin": "existing"
    },
    {
      "text": "What if nobody helps me?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "safety / reassurance",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "It's too big for me.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't know what's coming.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They'll laugh at me.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I can't tell anyone.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "adult-support",
      "origin": "existing"
    },
    {
      "text": "I want somebody with me.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "My heart is going too fast.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "body",
        "sensory"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "What if I can't get out of it?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't want to go.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I keep looking at the door.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "safety / reassurance",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't want to be by myself.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "That noise was too big.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "body",
        "sensory"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if my grown-up doesn't come back yet?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't know this place.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I think I might get told off.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "3-5",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I want someone to stay with me.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I have to do it in front of everyone?",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "social performance",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I can't find my grown-up?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't know anyone there.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I get the answer wrong?",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "mistake / performance",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if they laugh at me?",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't know what the teacher is going to say.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I freeze when everyone is watching?",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "9-11",
      "subtheme": "social performance",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I don't fit in with this group?",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "9-11",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I mess up something people are counting on me for?",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "9-11",
      "subtheme": "expectations / responsibility",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't know what that message means.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "digital"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I ask for help and people think I'm silly?",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "9-11",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if things at home are changing?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I don't belong in this new group?",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "12-14",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if one mistake follows me around?",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "12-14",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't know what people will think if I say what I really think.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "12-14",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I let everyone down when it matters?",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "12-14",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't know what this change means for me.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "12-14",
      "subtheme": "change / unknown",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I ask for help and it becomes a big deal?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "12-14",
      "subtheme": "safety / reassurance",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "worried": [
    {
      "text": "What if it all goes wrong?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I keep thinking about it.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'm going to forget something important.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I should have done it differently.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everyone is expecting a lot from me.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "expectations / responsibility",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "What if they're upset with me?",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "There isn't enough time.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "time / workload",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'm not ready.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Something feels off and I don't know why.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "What if I let someone down?",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I can't stop my brain.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "What if I made it worse?",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I might have got it wrong already.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "mistake / performance",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "What if nobody tells me what is happening?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I keep checking it over and over.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "It has to be perfect.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "9-11",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't want to make a fuss.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "What if I forget what to do?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if they say no?",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "3-5",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I can't do it?",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "3-5",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if we are late?",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "3-5",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if my toy is lost?",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "3-5",
      "subtheme": "lost possession / change",
      "contexts": [
        "game",
        "play",
        "possessions"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I keep thinking about it.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I forgot my homework?",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if my friend is cross with me?",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "friendship shift",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I don't finish in time?",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "time / workload",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I keep wondering if I did it wrong.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "mistake / performance",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if the plan changes again?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I want to check one more time.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I missed something everyone else understood?",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "9-11",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I keep replaying what I said.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "9-11",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if they are talking about me?",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "9-11",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "There are too many things to remember.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "9-11",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't know how this is going to turn out.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I disappoint someone who trusts me?",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "9-11",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I keep checking for a reply because I don't know where I stand.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "12-14",
      "subtheme": "waiting / not knowing",
      "contexts": [
        "digital"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if I'm falling behind and everyone else can tell?",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "12-14",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "There is always something else I should be doing.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "12-14",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I keep analysing whether I said the wrong thing.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "12-14",
      "subtheme": "mistake / performance",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "What if this friendship is changing?",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "12-14",
      "subtheme": "separation / relationship change",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't know which choice I'll regret less.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "12-14",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "jealous": [
    {
      "text": "They have what I want.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Why not me?",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everyone likes them more.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They're better at it than me.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I got left out again.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "It should have been my turn.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "turn-taking",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They didn't even have to try.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'll never catch up.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They took my friend away.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "friendship shift",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nobody notices what I do.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "It's not fair that they got it.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I wish I was more like them.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They make it look easy.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I wanted to be the one who did that.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everyone was talking about them.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "9-11",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I worked harder and got nothing.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't want to be pleased for them.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I wanted that toy too.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "3-5",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "game",
        "play",
        "possessions"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Why did they get the first turn?",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "3-5",
      "subtheme": "turn-taking",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I wanted the grown-up to watch me.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "3-5",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They got the bigger piece.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "3-5",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My friend is playing with them.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "3-5",
      "subtheme": "friendship shift",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I wanted to win.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "3-5",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They got picked for the job I wanted.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Everyone keeps talking about what they did.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My friend chose someone else as their partner.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "school",
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They got a reward and I didn't.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I wanted that turn to be mine.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "6-8",
      "subtheme": "turn-taking",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They seem to get attention without even trying.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "9-11",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel replaced when my friend is with them.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "9-11",
      "subtheme": "friendship shift",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Their work looks better than mine.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "9-11",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They got the opportunity I wanted.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "9-11",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I hate that I care so much about their score.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "9-11",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I wish people noticed my effort too.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "9-11",
      "subtheme": "being unseen / unheard",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Their life looks easier from where I'm standing.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "12-14",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel pushed aside when my friend is closer to someone else.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "12-14",
      "subtheme": "friendship shift",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "They got recognised for something I wanted to be known for.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "12-14",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I keep comparing my progress to theirs.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "12-14",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I wish I could be happy for them without feeling bad about myself.",
      "icon": "☁",
      "theme": "conflict",
      "ageBand": "12-14",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "It feels unfair that we worked differently and got the same result.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "12-14",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "other": [
    {
      "text": "I can't do it.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "3-5",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They don't like me.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "It's not fair.",
      "icon": "☁",
      "theme": "unfairness",
      "ageBand": "3-5",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "What if something goes wrong?",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'm going to get in trouble.",
      "icon": "☁",
      "theme": "pressure",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I always mess things up.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nobody understands me.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I got left out.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I should have done better.",
      "icon": "☁",
      "theme": "failure",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everyone else finds it easy.",
      "icon": "☁",
      "theme": "comparison",
      "ageBand": "6-8",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't know what to do.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Something good happened.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I'm not sure what I'm feeling.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Something is on my mind.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I wish today had gone differently.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "6-8",
      "subtheme": "lost possession / change",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I did my best anyway.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I need a bit of space.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I don't know what this feeling is.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I want a little space.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "3-5",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Something feels different.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "change / unknown",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I want my grown-up.",
      "icon": "☁",
      "theme": "loss",
      "ageBand": "3-5",
      "subtheme": "change / missing what was",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I did something hard.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "3-5",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I don't know what to do next.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "3-5",
      "subtheme": "change / unknown",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Part of me wants to go and part of me doesn't.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel funny but I can't name it.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I want to be left alone for a bit.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Something from earlier is still in my head.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I think I handled that better than before.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I need help figuring out what happened.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "6-8",
      "subtheme": "safety / reassurance",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I have two feelings at once.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Something feels off but I don't know what part.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I need time before I talk about it.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "9-11",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I keep switching between caring and not caring.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I think I learned something about myself.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I need to work out what is fact and what I'm guessing.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I can't tell whether I'm upset, tired, or just overwhelmed.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "12-14",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I feel different around different people.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "12-14",
      "subtheme": "change / unknown",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I need some space before I know what I think.",
      "icon": "☁",
      "theme": "rejection",
      "ageBand": "12-14",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Part of me cares a lot and part of me wants to switch off.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "12-14",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I think this matters to me more than I expected.",
      "icon": "☁",
      "theme": "uncertainty",
      "ageBand": "12-14",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I want to understand my reaction before I act on it.",
      "icon": "☁",
      "theme": "bright",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ]
};

const EVENTS: Record<Theme, EventOption[]> = {
  "rejection": [
    {
      "text": "Someone said no to me",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I wasn't invited to something",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nobody sat with me",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They walked off without me",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I asked to join and they said no",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone ignored me",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "being unseen / unheard",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They were talking and stopped when I came",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I got picked last",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "My friend played with someone else",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "friendship shift",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone laughed at what I said",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nobody answered my message",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "being unseen / unheard",
      "contexts": [
        "digital",
        "school"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody ignored me when I spoke",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "being unseen / unheard",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They made plans without me",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was left standing on my own",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "peer",
        "social"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone moved away from where I sat",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "social acceptance",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They picked someone else to partner with",
      "icon": "♧",
      "ageBand": "9-11",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "The other children kept playing when I asked to join",
      "icon": "♧",
      "ageBand": "3-5",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "playground"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone chose a different friend to sit beside",
      "icon": "♧",
      "ageBand": "3-5",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My grown-up was busy when I wanted attention",
      "icon": "♧",
      "ageBand": "3-5",
      "subtheme": "social acceptance",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Another child said I could not play with their toy",
      "icon": "♧",
      "ageBand": "3-5",
      "subtheme": "social acceptance",
      "contexts": [
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Nobody answered when I said hello",
      "icon": "♧",
      "ageBand": "3-5",
      "subtheme": "being unseen / unheard",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My friend went to play somewhere else",
      "icon": "♧",
      "ageBand": "3-5",
      "subtheme": "friendship shift",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My friends started a game without me",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "friendship shift",
      "contexts": [
        "playground"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone chose a different partner",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I asked to sit with them and there was no space",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend did not answer me at break",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "friendship shift",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was not invited to a small party or playdate",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "The team was full when I asked to join",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A group chat carried on without replying to my message",
      "icon": "♧",
      "ageBand": "9-11",
      "subtheme": "social acceptance",
      "contexts": [
        "digital"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My friends paired up before I joined them",
      "icon": "♧",
      "ageBand": "9-11",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I found out about plans after they had already happened",
      "icon": "♧",
      "ageBand": "9-11",
      "subtheme": "social acceptance",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone I usually sit with chose another group",
      "icon": "♧",
      "ageBand": "9-11",
      "subtheme": "belonging / exclusion",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A joke carried on after I stopped finding it funny",
      "icon": "♧",
      "ageBand": "9-11",
      "subtheme": "social acceptance",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I felt ignored while everyone else was talking",
      "icon": "♧",
      "ageBand": "9-11",
      "subtheme": "being unseen / unheard",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A group chat was active but my message was left unanswered",
      "icon": "♧",
      "ageBand": "12-14",
      "subtheme": "being unseen / unheard",
      "contexts": [
        "digital"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Friends made plans and I heard about them later",
      "icon": "♧",
      "ageBand": "12-14",
      "subtheme": "friendship shift",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone I felt close to became more distant",
      "icon": "♧",
      "ageBand": "12-14",
      "subtheme": "social acceptance",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I felt present in the group but not really included",
      "icon": "♧",
      "ageBand": "12-14",
      "subtheme": "social acceptance",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone removed or excluded me from an online space",
      "icon": "♧",
      "ageBand": "12-14",
      "subtheme": "social acceptance",
      "contexts": [
        "digital"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A person I trusted chose to confide in someone else",
      "icon": "♧",
      "ageBand": "12-14",
      "subtheme": "social acceptance",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "failure": [
    {
      "text": "I got an answer wrong",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "mistake / performance",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I couldn't finish it in time",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "completion / time",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I forgot something I needed",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I dropped or broke something",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "accident / repair",
      "contexts": [
        "possessions"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I lost a game",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "game",
        "play",
        "possessions"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I tried and it didn't work",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone corrected me",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I got a mark I was unhappy with",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "mistake / performance",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I had to start again",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I said the wrong thing",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "mistake / performance",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I needed help and had to ask",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I practised and still got it wrong",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "mistake / performance",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I had to hand it in unfinished",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "completion / time",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody redid my work for me",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I could not remember the answer",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "mistake / performance",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I came last",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning",
        "achievement"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "My tower fell down",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I could not fasten something by myself",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "self-care"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My drawing did not look how I wanted",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "creative"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I forgot what I was supposed to do",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "routine"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I missed the ball",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "movement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I tried to build something and it would not stay up",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I got several answers wrong",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "mistake / performance",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I forgot something I needed for class",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I lost a game after trying hard",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "game"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My project broke before I finished it",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "completion / time",
      "contexts": [
        "creative"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I could not do a skill other children seemed able to do",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I needed help after saying I could do it alone",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "learning"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I got a result that was lower than I expected",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I forgot part of a presentation",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "performance"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I made a mistake that other people noticed",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I practised for something and still did not make the team or group",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I handed work in that I knew was not my best",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I misunderstood the instructions and had to redo it",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I got a result that felt below what I am capable of",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I made a mistake in front of people whose opinion matters to me",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I did not get selected for something I had worked towards",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I missed a deadline or forgot an important responsibility",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "completion / time",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I tried to fix something and made it more complicated",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "competence / self-evaluation",
      "contexts": [
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I compared my finished work with someone else's and felt disappointed",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "completion / time",
      "contexts": [
        "comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "unfairness": [
    {
      "text": "Someone else got picked instead of me",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I got told off for something I did not do",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "blame / consequence",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "The rule changed partway through",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "rules / consistency",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone took my turn",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "turn-taking",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They got away with it and I did not",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nobody asked what I thought",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I did the work and someone else got the credit",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I had to share when they did not",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was blamed for the whole thing",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "blame / consequence",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone broke a promise to me",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I waited and never got my go",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was punished along with everybody else",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "blame / consequence",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody copied me and did not say",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was not allowed to explain",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "rules / consistency",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They changed their mind after I agreed",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody else chose for me",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "fairness"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone had two turns before I had one",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "turn-taking",
      "contexts": [
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to stop playing before someone else did",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "fairness / voice",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone got the cup or seat I wanted",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "fairness / voice",
      "contexts": [
        "routine"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was told no when another child was told yes",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "fairness / voice",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone chose the game without asking me",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "fairness / voice",
      "contexts": [
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to share something I was still using",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "fairness / voice",
      "contexts": [
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "The rules changed after we started playing",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "rules / consistency",
      "contexts": [
        "game"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was blamed before anyone asked what happened",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "blame / consequence",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone skipped my turn",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "turn-taking",
      "contexts": [
        "game"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Another child got a reward and I did not understand why",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "fairness / voice",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to redo something someone else was allowed to leave",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "rules / consistency",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A sibling got a different rule at home",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "rules / consistency",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone else got credit for an idea I helped create",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "fairness / voice",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A decision was made before I could explain my side",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "fairness / voice",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "The consequence felt bigger for me than for someone else",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "fairness / voice",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was expected to do more because I am usually responsible",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "fairness / voice",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone broke a rule and nothing happened",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "rules / consistency",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was left with the boring part of a group task",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "fairness / voice",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A rule was applied differently to me than to someone else",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "rules / consistency",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "People expected me to take responsibility for a group problem",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "fairness / voice",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone made a decision about me without including me",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "fairness / voice",
      "contexts": [
        "autonomy"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I felt judged for my reaction before anyone asked what happened",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "fairness / voice",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone else got recognition for shared work",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "fairness / voice",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had less freedom than someone my age and did not understand why",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "fairness / voice",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "uncertainty": [
    {
      "text": "I was told something is changing",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I have something coming up",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody said we need to talk",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I overheard part of a conversation",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Plans changed without warning",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I am going somewhere new",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I do not know what happens next",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Something felt different at home",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I am waiting to find out",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "waiting / not knowing",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone would not tell me what was wrong",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I saw something that worried me",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nobody would answer my question",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "waiting / not knowing",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was told to wait and see",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "waiting / not knowing",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Something at home was different today",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I have to meet new people soon",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I do not know if I am in trouble",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "change",
        "unknown"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "A new grown-up was looking after me",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "change / unknown",
      "contexts": [
        "care"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was going to a new place",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "change / unknown",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "The usual plan changed",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "change / unknown",
      "contexts": [
        "routine"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I heard a loud sound and did not know what it was",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "sensory"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was waiting for my grown-up to come back",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "waiting / not knowing",
      "contexts": [
        "separation"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone said we were going somewhere later but I did not know where",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "unknown outcome",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "There was a supply teacher or new club leader",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Our plans changed at the last minute",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to go somewhere I had never been",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A grown-up said we would talk later",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "unknown outcome",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was waiting to hear whether something was happening",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "waiting / not knowing",
      "contexts": [
        "waiting"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My friend seemed different but did not say why",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "change / unknown",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I got a short message and could not tell what tone it had",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "digital"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My friendship group felt different for no clear reason",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "change / unknown",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was waiting for a result, place or decision",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "waiting / not knowing",
      "contexts": [
        "waiting"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My family plans might be changing",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was joining a new club or group",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "change / unknown",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone said they needed to talk to me later",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "unknown outcome",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was waiting for a reply that could change what happens next",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "change / unknown",
      "contexts": [
        "digital"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friendship felt different but nobody had said why",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "change / unknown",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to make a choice without knowing the outcome",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "unknown outcome",
      "contexts": [
        "decision"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "There might be a change at home or school",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "change / unknown",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was starting something where I did not know anyone well",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "unknown outcome",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had mixed signals from someone and did not know what they meant",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "unknown outcome",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "loss": [
    {
      "text": "Somebody I like went away",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "separation / relationship change",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Something I had has gone",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "lost possession / change",
      "contexts": [
        "possessions"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "A friendship changed",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "separation / relationship change",
      "contexts": [
        "friendship",
        "transition"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I had to say goodbye",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "separation / relationship change",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Something I looked forward to was cancelled",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "cancelled expectation",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "We moved or something moved",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone at home was sad",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "A pet or a person is not well",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I remembered something from before",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Things are not the way they were",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was on my own for a while",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody is not coming back",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "A thing I liked got broken",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "lost possession / change",
      "contexts": [
        "possessions"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I had to give something up",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "A place I liked has changed",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody I miss was mentioned",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "separation / relationship change",
      "contexts": [
        "separation",
        "change"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "My grown-up left for a while",
      "icon": "↝",
      "ageBand": "3-5",
      "subtheme": "change / missing what was",
      "contexts": [
        "separation"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A favourite toy was missing",
      "icon": "↝",
      "ageBand": "3-5",
      "subtheme": "separation / relationship change",
      "contexts": [
        "possessions"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A playdate ended",
      "icon": "↝",
      "ageBand": "3-5",
      "subtheme": "change / missing what was",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "We had to leave somewhere fun",
      "icon": "↝",
      "ageBand": "3-5",
      "subtheme": "change / missing what was",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Something I made got broken",
      "icon": "↝",
      "ageBand": "3-5",
      "subtheme": "lost possession / change",
      "contexts": [
        "creative"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A familiar person was not there today",
      "icon": "↝",
      "ageBand": "3-5",
      "subtheme": "change / missing what was",
      "contexts": [
        "care"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend moved class or school",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "separation / relationship change",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "An activity I liked ended",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A favourite item was lost or broken",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "lost possession / change",
      "contexts": [
        "possessions"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A plan I had been excited about was cancelled",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "cancelled expectation",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone I usually see was away",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "change / missing what was",
      "contexts": [
        "connection"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friendship felt different after an argument",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "separation / relationship change",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A close friend moved away or changed groups",
      "icon": "↝",
      "ageBand": "9-11",
      "subtheme": "separation / relationship change",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A routine I liked changed",
      "icon": "↝",
      "ageBand": "9-11",
      "subtheme": "change / missing what was",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Something I had worked towards was cancelled",
      "icon": "↝",
      "ageBand": "9-11",
      "subtheme": "cancelled expectation",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friendship became less close",
      "icon": "↝",
      "ageBand": "9-11",
      "subtheme": "separation / relationship change",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A meaningful possession was lost or damaged",
      "icon": "↝",
      "ageBand": "9-11",
      "subtheme": "lost possession / change",
      "contexts": [
        "possessions"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A familiar teacher, coach or adult left",
      "icon": "↝",
      "ageBand": "9-11",
      "subtheme": "change / missing what was",
      "contexts": [
        "connection"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friendship faded rather than ending clearly",
      "icon": "↝",
      "ageBand": "12-14",
      "subtheme": "separation / relationship change",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A person or group that mattered to me changed",
      "icon": "↝",
      "ageBand": "12-14",
      "subtheme": "change / missing what was",
      "contexts": [
        "connection"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A plan or opportunity I had pictured for a long time ended",
      "icon": "↝",
      "ageBand": "12-14",
      "subtheme": "change / missing what was",
      "contexts": [
        "future"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I outgrew an activity or place that used to feel like mine",
      "icon": "↝",
      "ageBand": "12-14",
      "subtheme": "change / missing what was",
      "contexts": [
        "identity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A meaningful possession, message or memory was lost",
      "icon": "↝",
      "ageBand": "12-14",
      "subtheme": "lost possession / change",
      "contexts": [
        "possessions"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A familiar routine changed because life moved on",
      "icon": "↝",
      "ageBand": "12-14",
      "subtheme": "change / missing what was",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "conflict": [
    {
      "text": "Someone said something mean to me",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "words / disagreement",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "We had an argument",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "words / disagreement",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody took something of mine",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone pushed or grabbed me",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "adult-support",
      "origin": "existing"
    },
    {
      "text": "They would not stop when I asked",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "adult-support",
      "origin": "existing"
    },
    {
      "text": "Someone told on me",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "We disagreed about the rules",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody shouted",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "words / disagreement",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They said something about me to others",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "words / disagreement",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was interrupted again and again",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone would not let me explain",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody called me a name",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "words / disagreement",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "We stopped speaking to each other",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone laughed while I was upset",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "words / disagreement",
      "contexts": [
        "relationship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was left out of a game on purpose",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody would not share",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "game",
        "play"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Another child grabbed the toy I was using",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone knocked down what I built",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone shouted at me",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "words / disagreement",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I said stop and they kept going",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "boundary"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My sibling would not give my thing back",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "We both wanted the same toy",
      "icon": "☏",
      "ageBand": "3-5",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone kept interrupting me",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend told someone else something I said",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "words / disagreement",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My sibling used my belongings without asking",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone laughed after I asked them to stop",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "boundary"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "We argued about who was right",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone called me an unkind name",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "words / disagreement",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone shared something private I told them",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend kept making a joke after I asked them to stop",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "boundary"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "We disagreed in front of other people",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone posted or said something unkind about me",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "words / disagreement",
      "contexts": [
        "digital"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I felt talked over in a group",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend expected me to take sides",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone shared a screenshot or private message without asking",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "digital"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend pushed a boundary after I had been clear",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "boundary / physical conflict",
      "contexts": [
        "boundary"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was pressured to take sides in someone else's disagreement",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "An argument continued in messages after it should have ended",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "words / disagreement",
      "contexts": [
        "digital"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone misrepresented what I said to other people",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "words / disagreement",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I felt controlled or dismissed during a disagreement",
      "icon": "☏",
      "ageBand": "12-14",
      "subtheme": "interpersonal conflict",
      "contexts": [
        "autonomy"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "pressure": [
    {
      "text": "I have a test or a performance coming",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "social performance",
      "contexts": [
        "performance"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone is expecting something from me",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "expectations / responsibility",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I have a lot to get done",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "time / workload",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I had to speak in front of people",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "social performance",
      "contexts": [
        "performance"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "There is a deadline",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "time / workload",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was asked to do something hard",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everyone was watching me",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "social performance",
      "contexts": [
        "performance"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I promised I would do it",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "expectations / responsibility",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was being timed or scored",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "time / workload",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I had to make a decision",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone said they were counting on me",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "expectations / responsibility",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was told I had to get it right",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody was waiting on me",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I had two things to do at once",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "time / workload",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was put in front of the class",
      "icon": "♧",
      "ageBand": "9-11",
      "subtheme": "social performance",
      "contexts": [
        "school",
        "performance"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I had to try something new today",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "performance",
        "responsibility"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everyone was waiting for me to answer",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "performance demand",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was asked to try something new in front of people",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "social performance",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to get ready quickly",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "performance demand",
      "contexts": [
        "routine"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A grown-up asked me to remember several things",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "performance demand",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "It was my turn and people were watching",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "social performance",
      "contexts": [
        "performance"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was trying to finish before time was up",
      "icon": "◷",
      "ageBand": "3-5",
      "subtheme": "time / workload",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had a spelling test or quiz",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to read or speak in front of the class",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "social performance",
      "contexts": [
        "performance"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was trying to finish before the lesson ended",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had several instructions to remember",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A team was relying on me for my turn",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to choose quickly",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "performance demand",
      "contexts": [
        "decision"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had several tests or deadlines close together",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "time / workload",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to perform or present in front of others",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "social performance",
      "contexts": [
        "performance"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "People were relying on me in a team or group task",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "performance demand",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was trying to keep up with school and another commitment",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "performance demand",
      "contexts": [
        "pressure"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to make a choice quickly",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "performance demand",
      "contexts": [
        "decision"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was expected to do well because I had done well before",
      "icon": "◷",
      "ageBand": "9-11",
      "subtheme": "time / workload",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Several deadlines, tests or commitments landed together",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "time / workload",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I felt I had to perform well because people expect that from me",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "expectations / responsibility",
      "contexts": [
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was balancing school, friends, family and another commitment",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "performance demand",
      "contexts": [
        "pressure"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to speak or perform in front of people whose opinions matter to me",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "social performance",
      "contexts": [
        "performance"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had to make a decision that could affect future options",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "performance demand",
      "contexts": [
        "future"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I felt responsible for keeping everyone else okay",
      "icon": "◷",
      "ageBand": "12-14",
      "subtheme": "performance demand",
      "contexts": [
        "responsibility"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "comparison": [
    {
      "text": "Someone did better than me",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They got something I wanted",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody was praised and I was not",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I saw what other people have",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They found it easy and I did not",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone else was chosen",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "My friend has a new friend",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "friendship comparison",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They were ahead of me",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody said I should be more like them",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I saw their work next to mine",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They got more attention",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Their score was read out",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody showed everyone what they made",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was moved to a different group",
      "icon": "↝",
      "ageBand": "9-11",
      "subtheme": "social comparison",
      "contexts": [
        "transition"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "They were asked and I was not",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Everyone was talking about what they did",
      "icon": "☏",
      "ageBand": "9-11",
      "subtheme": "social comparison",
      "contexts": [
        "peer comparison"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Another child built something taller than mine",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "social comparison",
      "contexts": [
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone else got praised",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My friend ran faster than me",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "friendship comparison",
      "contexts": [
        "movement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Another child had a toy I wanted",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "possessions"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone else got picked first",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "group"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My sibling was allowed to do something I could not",
      "icon": "✧",
      "ageBand": "3-5",
      "subtheme": "social comparison",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone got a higher score than me",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend was chosen for a special job",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "friendship comparison",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone else learned the skill faster",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "social comparison",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "My friend got something new that I wanted",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "friendship comparison",
      "contexts": [
        "possessions"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Another child got more praise for similar work",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was placed in a different group from my friend",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "friendship comparison",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone's score or result was better than mine",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend seemed to have an easier social life",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "friendship comparison",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I saw someone else's work next to mine",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "school"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone was praised for a skill I care about",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "social comparison",
      "contexts": [
        "activity"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend got something expensive or exciting",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "friendship comparison",
      "contexts": [
        "possessions"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I noticed other people were further ahead than me",
      "icon": "✧",
      "ageBand": "9-11",
      "subtheme": "ability / achievement comparison",
      "contexts": [
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I saw other people's achievements online and compared them with mine",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "social comparison",
      "contexts": [
        "digital"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend seemed more confident or socially comfortable than me",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "friendship comparison",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone my age reached a goal before I did",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "social comparison",
      "contexts": [
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I noticed who got attention, praise or opportunities",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "possessions / opportunity comparison",
      "contexts": [
        "social"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I compared my progress with someone who started somewhere different",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "social comparison",
      "contexts": [
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend's life looked easier from the outside",
      "icon": "✧",
      "ageBand": "12-14",
      "subtheme": "friendship comparison",
      "contexts": [
        "comparison"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ],
  "bright": [
    {
      "text": "Somebody was kind to me",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "connection / belonging",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I finished something I was working on",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was asked to join in",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "connection / belonging",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone noticed what I did",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I had a laugh with someone",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Something I hoped for happened",
      "icon": "✳",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I got somewhere I had been trying to get",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "achievement / mastery",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I spent time with someone I like",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "connection / belonging",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I had a quiet bit of the day",
      "icon": "◷",
      "ageBand": "6-8",
      "subtheme": "calm / relief",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I helped somebody out",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Nothing much went wrong",
      "icon": "✳",
      "ageBand": "6-8",
      "subtheme": "calm / relief",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody said well done",
      "icon": "☏",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I was picked for something",
      "icon": "♧",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "A friend came to find me",
      "icon": "↝",
      "ageBand": "6-8",
      "subtheme": "connection / belonging",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "I got something I had been saving for",
      "icon": "✧",
      "ageBand": "6-8",
      "subtheme": "achievement / mastery",
      "contexts": [
        "possessions"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Somebody shared with me",
      "icon": "✳",
      "ageBand": "6-8",
      "subtheme": "connection / belonging",
      "contexts": [
        "positive experience"
      ],
      "safety": "routine",
      "origin": "existing"
    },
    {
      "text": "Someone invited me to play",
      "icon": "✳",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I finished something by myself",
      "icon": "✳",
      "ageBand": "3-5",
      "subtheme": "achievement / mastery",
      "contexts": [
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A grown-up noticed my effort",
      "icon": "✳",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "home"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone shared with me",
      "icon": "✳",
      "ageBand": "3-5",
      "subtheme": "connection / belonging",
      "contexts": [
        "play"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I helped tidy something up",
      "icon": "✳",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "helping"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "We had a silly laugh together",
      "icon": "✳",
      "ageBand": "3-5",
      "subtheme": "positive moment",
      "contexts": [
        "connection"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend saved me a place",
      "icon": "✳",
      "ageBand": "6-8",
      "subtheme": "connection / belonging",
      "contexts": [
        "friendship"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I finally understood something hard",
      "icon": "✳",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "learning"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone thanked me for helping",
      "icon": "✳",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "helping"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I was brave enough to try something new",
      "icon": "✳",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I got to spend time with someone I like",
      "icon": "✳",
      "ageBand": "6-8",
      "subtheme": "connection / belonging",
      "contexts": [
        "connection"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I noticed I was getting better at something",
      "icon": "✳",
      "ageBand": "6-8",
      "subtheme": "positive moment",
      "contexts": [
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I handled a difficult moment better than last time",
      "icon": "✳",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "growth"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "Someone included me without me having to ask",
      "icon": "✳",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "belonging"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I helped solve a problem in a group",
      "icon": "✳",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "helping"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I noticed practice paying off",
      "icon": "✳",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend checked in on me",
      "icon": "✳",
      "ageBand": "9-11",
      "subtheme": "connection / belonging",
      "contexts": [
        "connection"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I enjoyed something without worrying about being the best",
      "icon": "✳",
      "ageBand": "9-11",
      "subtheme": "positive moment",
      "contexts": [
        "calm"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I noticed I had become better at handling something difficult",
      "icon": "✳",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "growth"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I felt accepted without having to perform or impress anyone",
      "icon": "✳",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "belonging"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "A friend respected a boundary I set",
      "icon": "✳",
      "ageBand": "12-14",
      "subtheme": "connection / belonging",
      "contexts": [
        "connection"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I enjoyed an achievement without immediately comparing it",
      "icon": "✳",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "achievement"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I had a conversation where I felt heard",
      "icon": "✳",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "connection"
      ],
      "safety": "routine",
      "origin": "expanded"
    },
    {
      "text": "I chose something because it mattered to me, not because others expected it",
      "icon": "✳",
      "ageBand": "12-14",
      "subtheme": "positive moment",
      "contexts": [
        "autonomy"
      ],
      "safety": "routine",
      "origin": "expanded"
    }
  ]
};

const DEFAULT_THEME_BY_FEELING: Record<FeelingKey, Theme> = {
  happy: 'bright',
  excited: 'bright',
  calm: 'bright',
  sad: 'rejection',
  angry: 'unfairness',
  scared: 'uncertainty',
  worried: 'uncertainty',
  jealous: 'comparison',
  other: 'failure',
};

/** Normalise whatever the check-in stored ("Worried", "worried") to a key. */
function toKey(feeling: string | undefined): FeelingKey {
  const k = (feeling ?? '').trim().toLowerCase();
  return k in THOUGHTS ? (k as FeelingKey) : 'other';
}

export function ageBandFor(age: number): AgeBand {
  if (!Number.isFinite(age)) return '6-8';
  if (age <= 5) return '3-5';
  if (age <= 8) return '6-8';
  if (age <= 11) return '9-11';
  return '12-14';
}

function toAgeBand(age: AgeInput): AgeBand | undefined {
  if (typeof age === 'number') return ageBandFor(age);
  return age;
}

function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function uniqueByText<T extends { text: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.text)) return false;
    seen.add(item.text);
    return true;
  });
}

function forAge<T extends { ageBand: AgeBand }>(
  items: readonly T[],
  age: AgeInput,
): T[] {
  const band = toAgeBand(age);
  if (!band) return [...items];
  return items.filter((item) => item.ageBand === band);
}

/**
 * Thought clouds for this child's feeling.
 *
 * Existing call remains valid:
 *   thoughtsFor(feeling)
 *
 * Age-aware:
 *   thoughtsFor(feeling, childAge)
 *   thoughtsFor(feeling, '9-11')
 */
export function thoughtsFor(
  feeling: string | undefined,
  age?: AgeInput,
): Option[] {
  const pool = forAge(THOUGHTS[toKey(feeling)], age);
  return shuffled(uniqueByText(pool)).map(({ text, icon }) => ({ text, icon }));
}

function findThought(
  thought: string,
  feeling: string | undefined,
  age?: AgeInput,
): Thought | undefined {
  const key = toKey(feeling);
  const band = toAgeBand(age);

  const sameFeeling = THOUGHTS[key].filter(
    (t) => t.text === thought && (!band || t.ageBand === band),
  );
  if (sameFeeling.length) return sameFeeling[0];

  for (const feelingKey of Object.keys(THOUGHTS) as FeelingKey[]) {
    const match = THOUGHTS[feelingKey].find(
      (t) => t.text === thought && (!band || t.ageBand === band),
    );
    if (match) return match;
  }

  // If a known thought was selected but the caller passed a different/no age,
  // recover its theme before falling back to the feeling default.
  for (const feelingKey of Object.keys(THOUGHTS) as FeelingKey[]) {
    const match = THOUGHTS[feelingKey].find((t) => t.text === thought);
    if (match) return match;
  }

  return undefined;
}

/**
 * What a camera could have seen behind the selected thought.
 *
 * Existing call remains valid:
 *   eventsFor(thought, feeling)
 *
 * Age-aware:
 *   eventsFor(thought, feeling, childAge)
 *
 * Typed/spoken thoughts that are not in the library use the feeling's default
 * theme, preserving the original source behaviour while keeping the fallback stable.
 */
export function eventsFor(
  thought: string,
  feeling: string | undefined,
  age?: AgeInput,
): Option[] {
  const key = toKey(feeling);
  const match = findThought(thought, feeling, age);
  const theme = match?.theme ?? DEFAULT_THEME_BY_FEELING[key];

  const pool = forAge(EVENTS[theme], age);
  return shuffled(uniqueByText(pool)).map(({ text, icon }) => ({ text, icon }));
}

/** Metadata for a tapped library thought, for safety routing / analytics. */
export function thoughtMetaFor(
  thought: string,
  feeling: string | undefined,
  age?: AgeInput,
): Omit<Thought, 'text' | 'icon'> | undefined {
  const match = findThought(thought, feeling, age);
  if (!match) return undefined;
  const { text: _text, icon: _icon, ...meta } = match;
  return meta;
}

/** Metadata for an event option. */
export function eventMetaFor(
  eventText: string,
  age?: AgeInput,
): Omit<EventOption, 'text' | 'icon'> | undefined {
  const band = toAgeBand(age);

  for (const theme of Object.keys(EVENTS) as Theme[]) {
    const match = EVENTS[theme].find(
      (event) => event.text === eventText && (!band || event.ageBand === band),
    );
    if (match) {
      const { text: _text, icon: _icon, ...meta } = match;
      return meta;
    }
  }

  // Recover metadata if the caller does not have the exact age used to show it.
  for (const theme of Object.keys(EVENTS) as Theme[]) {
    const match = EVENTS[theme].find((event) => event.text === eventText);
    if (match) {
      const { text: _text, icon: _icon, ...meta } = match;
      return meta;
    }
  }

  return undefined;
}

export function thoughtNeedsAdultSupport(
  thought: string,
  feeling: string | undefined,
  age?: AgeInput,
): boolean {
  return thoughtMetaFor(thought, feeling, age)?.safety === 'adult-support';
}

export function eventNeedsAdultSupport(
  eventText: string,
  age?: AgeInput,
): boolean {
  return eventMetaFor(eventText, age)?.safety === 'adult-support';
}
