// Mind Gym — Balanced Behaviour Practice Library
// 180 scenarios total: 30 in each of six child-facing behaviour pillars.
//
// Includes:
// - 8 scenarios supplied by the product team
// - 100 scenarios previously created for this project
// - 72 NEW scenarios added to balance the six pillars
//
// Design principles:
// - Reward practice and reflection, not "good child / bad child" morality.
// - "Include Everyone" means respect and belonging, never forced affection or friendship.
// - "Take Care of My Body" treats food as fuel/variety and movement as enjoyable body care;
//   it does not use weight, appearance, restriction, or food-shaming.
// - "Make Good Choices" includes respectful language / no foul language without repeating profanity.
//
// This file assumes your existing `Scenario` type is in scope.

import type { Scenario } from '../features/kids/scenarios';

export type BehaviourPillar =
  | 'BeKind'
  | 'TellTheTruth'
  | 'MakeGoodChoices'
  | 'IncludeEveryone'
  | 'TakeCareOfMyBody'
  | 'HelpOthers';

export type ScenarioOrigin =
  | 'user-original'
  | 'previous-original-by-chatgpt'
  | 'new-original-by-chatgpt';

export type TeachingMove = 'Practice' | 'Trapdoor' | 'Experiment' | 'Borrowed image';

export type PillarScenario = Scenario & {
  pillar: BehaviourPillar;
};

export const BEHAVIOUR_PILLARS = {
  "BeKind": {
    "title": "Be Kind",
    "childPromise": "Use kind words and actions, notice other people's feelings, and repair hurt when I can.",
    "focus": [
      "empathy",
      "gentle words",
      "respect",
      "apologies",
      "kind disagreement",
      "kindness online"
    ]
  },
  "TellTheTruth": {
    "title": "Tell the Truth",
    "childPromise": "Say what really happened, own mistakes, and help put things right.",
    "focus": [
      "honesty",
      "trust",
      "owning mistakes",
      "fairness",
      "repair",
      "integrity when nobody is watching"
    ]
  },
  "MakeGoodChoices": {
    "title": "Make Good Choices",
    "childPromise": "Pause, think, stay safe, and choose respectful words and actions.",
    "focus": [
      "pause before reacting",
      "safety",
      "patience",
      "self-control",
      "respectful language",
      "no foul language",
      "digital choices"
    ]
  },
  "IncludeEveryone": {
    "title": "Include Everyone",
    "subtitle": "Everyone Belongs",
    "childPromise": "Help people feel welcome and respected, even when we are different.",
    "focus": [
      "belonging",
      "fair turns",
      "welcoming new people",
      "respecting differences",
      "anti-exclusion",
      "group participation"
    ],
    "safetyNote": "Inclusion never means forced affection, forced friendship, hugs, or giving up body boundaries."
  },
  "TakeCareOfMyBody": {
    "title": "Take Care of My Body",
    "childPromise": "Notice what my body needs and care for it with food, water, movement, rest, sleep, hygiene, and safe choices.",
    "focus": [
      "movement and exercise",
      "food as fuel and variety",
      "hydration",
      "sleep",
      "rest",
      "hygiene",
      "body signals",
      "safety"
    ]
  },
  "HelpOthers": {
    "title": "Help Others",
    "childPromise": "Notice when help may be useful, ask when needed, and do one safe thing that genuinely helps.",
    "focus": [
      "home responsibilities",
      "teamwork",
      "practical help",
      "listening",
      "safe helping",
      "ask before helping",
      "do not take over"
    ]
  }
} as const;

export const CATEGORISED_SCENARIOS: PillarScenario[] = [
  {
    "id": "truth-broke",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "Uh oh…",
    "setup": "You were playing and accidentally knocked over a vase. It broke. Nobody saw. What do you do?",
    "reactions": [
      {
        "who": "fizz",
        "line": "But what if they get upset?! 😰"
      },
      {
        "who": "ember",
        "line": "It's not fair that it broke!"
      },
      {
        "who": "willow",
        "line": "Telling the truth might help us feel better…"
      },
      {
        "who": "sunny",
        "line": "Let's be brave and do the right thing together!"
      }
    ],
    "choices": [
      {
        "emoji": "🫣",
        "label": "Hide it",
        "points": 5,
        "response": "Hiding it makes the worry bigger. Willow gives your hand a gentle squeeze — want to try again?"
      },
      {
        "emoji": "🙅",
        "label": "Blame someone else",
        "points": 5,
        "response": "Ember stops: 'That wouldn't be fair to them.' Let's think once more."
      },
      {
        "emoji": "💬",
        "label": "Tell the truth",
        "points": 15,
        "best": true,
        "response": "Sunny beams: 'THAT took real courage!' Telling the truth felt heavy for a second — then light."
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "kind-alone",
    "behaviour": "kind",
    "world": "Everyone Belongs World",
    "title": "Someone is alone",
    "setup": "At break, you see a kid sitting by themselves, watching everyone else play.",
    "reactions": [
      {
        "who": "coco",
        "line": "Oooh, but what if it feels awkward? 😳"
      },
      {
        "who": "sunny",
        "line": "One kind hello can change a whole day!"
      },
      {
        "who": "willow",
        "line": "They might be feeling lonely."
      }
    ],
    "choices": [
      {
        "emoji": "🚶",
        "label": "Walk past",
        "points": 5,
        "response": "Coco whispers, \"It only takes one small step.\" Want to try again?"
      },
      {
        "emoji": "👋",
        "label": "Say hi and smile",
        "points": 10,
        "response": "A warm hello! Sunny does a little spin. 💛"
      },
      {
        "emoji": "🤝",
        "label": "Invite them to play",
        "points": 15,
        "best": true,
        "response": "You made someone feel welcome. The whole Garden lights up! 🌸"
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "anger-unfair",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "That's not fair!",
    "setup": "Your friend took the toy you were using without asking. You feel it — hot and fast.",
    "reactions": [
      {
        "who": "ember",
        "line": "GRRR! That's NOT fair!! 😤"
      },
      {
        "who": "pip",
        "line": "Let's stop and think before we react."
      },
      {
        "who": "sunny",
        "line": "A calm voice is a strong voice."
      }
    ],
    "choices": [
      {
        "emoji": "🔥",
        "label": "Yell at them",
        "points": 5,
        "response": "Ember gets it — but yelling makes it bigger. Pip says, 'Breathe with me.' Try again?"
      },
      {
        "emoji": "💬",
        "label": "Talk calmly",
        "points": 15,
        "best": true,
        "response": "\"Hey, I was using that — can I have it back?\" Ember high-fives you: strong AND calm. 💪"
      },
      {
        "emoji": "🙋",
        "label": "Ask a grown-up for help",
        "points": 12,
        "best": true,
        "response": "Asking for help is brave and smart. Well done! 🤝"
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "fear-safe",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "Is this safe?",
    "setup": "Some kids dare you to climb the tall fence to get a ball. It looks pretty high.",
    "reactions": [
      {
        "who": "pip",
        "line": "Whoa — is this a safe idea? 😬"
      },
      {
        "who": "fizz",
        "line": "What if someone gets hurt?"
      },
      {
        "who": "sunny",
        "line": "Being safe is a great choice too."
      }
    ],
    "choices": [
      {
        "emoji": "🧗",
        "label": "Climb it anyway",
        "points": 5,
        "response": "Pip catches your sleeve: \"Let's find a safer way.\" Try again?"
      },
      {
        "emoji": "🙋",
        "label": "Ask an adult for help",
        "points": 15,
        "best": true,
        "response": "Smart and safe! Pip breathes a happy sigh. 💜"
      },
      {
        "emoji": "🚪",
        "label": "Choose a safer plan",
        "points": 12,
        "best": true,
        "response": "You found a safer way. That takes real wisdom. 🛡️"
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "envy-gratitude",
    "behaviour": "include",
    "world": "Kindness Garden",
    "title": "They got something cool",
    "setup": "Your friend got a shiny new backpack. You look down at your old one.",
    "reactions": [
      {
        "who": "ash",
        "line": "They got something really cool… 😑"
      },
      {
        "who": "sunny",
        "line": "What good things do WE already have?"
      },
      {
        "who": "willow",
        "line": "It's okay to notice that feeling."
      }
    ],
    "choices": [
      {
        "emoji": "😠",
        "label": "I wish I had theirs",
        "points": 5,
        "response": "Ash nods — that feeling is normal. But it can weigh us down. Let's look again."
      },
      {
        "emoji": "⭐",
        "label": "I'm grateful for what I have",
        "points": 12,
        "best": true,
        "response": "You found something to be thankful for. Lighter already! 🌟"
      },
      {
        "emoji": "🎯",
        "label": "I'll work toward my own goal",
        "points": 15,
        "best": true,
        "response": "Turning the feeling into a goal — that's powerful. Go you! 🚀"
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "body-hygiene",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Snack time!",
    "setup": "You just came in from playing outside and you're about to grab a snack.",
    "reactions": [
      {
        "who": "sage",
        "line": "EWWW — those hands are DIRTY! 😖"
      },
      {
        "who": "sunny",
        "line": "Taking care of your body feels good!"
      }
    ],
    "choices": [
      {
        "emoji": "🍪",
        "label": "Just eat now",
        "points": 5,
        "response": "Sage makes a dramatic face. \"Germs! Let's wash first.\" Try again?"
      },
      {
        "emoji": "🧼",
        "label": "Wash my hands first",
        "points": 12,
        "best": true,
        "response": "Sparkly clean! Sage gives an approving nod. 💚"
      },
      {
        "emoji": "🍎",
        "label": "Wash up AND pick something healthy",
        "points": 15,
        "best": true,
        "response": "Clean hands and a healthy snack — Sage is genuinely impressed. 🍎"
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "help-home",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "A helping chance",
    "setup": "You see a grown-up at home carrying a big pile of laundry, struggling a little.",
    "reactions": [
      {
        "who": "lull",
        "line": "Ughhh… do we HAVE to get up? 😴"
      },
      {
        "who": "sunny",
        "line": "One small help can make someone's whole day!"
      }
    ],
    "choices": [
      {
        "emoji": "📺",
        "label": "Keep watching TV",
        "points": 5,
        "response": "Lull gets it — comfy is comfy. But Sunny knows you've got this. Try again?"
      },
      {
        "emoji": "🤝",
        "label": "Offer to help carry",
        "points": 15,
        "best": true,
        "response": "You helped without being asked! Lull even got up — miracle! 🎉"
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "mind-worry",
    "behaviour": "mindheart",
    "world": "Good Choices Room",
    "title": "Tomorrow feels big",
    "setup": "You have a presentation tomorrow and your tummy feels fluttery just thinking about it.",
    "reactions": [
      {
        "who": "fizz",
        "line": "What if it all goes wrong?! 😰"
      },
      {
        "who": "sunny",
        "line": "Let's focus on what we CAN do today."
      }
    ],
    "choices": [
      {
        "emoji": "😩",
        "label": "Worry about it all night",
        "points": 5,
        "response": "Fizz means well, but worry loops get bigger. Let's make a plan instead."
      },
      {
        "emoji": "📝",
        "label": "Make a little plan",
        "points": 12,
        "best": true,
        "response": "One small step at a time — Fizz feels calmer already. 🧡"
      },
      {
        "emoji": "🌬️",
        "label": "Take three slow breaths",
        "points": 15,
        "best": true,
        "response": "In… and out. The flutter softens. You've got this. ⭐"
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "truth-spill",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "The mystery puddle",
    "setup": "You accidentally spill juice on the floor. Nobody notices who did it.",
    "reactions": [
      {
        "who": "willow",
        "line": "A truth can feel hard for one moment and lighter afterwards."
      },
      {
        "who": "sunny",
        "line": "We can be honest AND help fix what happened."
      }
    ],
    "choices": [
      {
        "emoji": "🫥",
        "label": "Walk away",
        "points": 5,
        "response": "The puddle is still there, and someone could slip. Willow wonders what honest repair could look like."
      },
      {
        "emoji": "🧻",
        "label": "Clean it but say nothing",
        "points": 10,
        "response": "Cleaning helps the mess. Telling the truth can help rebuild trust too."
      },
      {
        "emoji": "💬",
        "label": "Tell the truth and help clean",
        "points": 15,
        "response": "Honest AND helpful. Sunny cheers: you owned what happened and helped make it right.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-homework",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "The forgotten homework",
    "setup": "You forgot to do your homework and the teacher asks what happened.",
    "reactions": [
      {
        "who": "willow",
        "line": "A truth can feel hard for one moment and lighter afterwards."
      },
      {
        "who": "sunny",
        "line": "We can be honest AND help fix what happened."
      }
    ],
    "choices": [
      {
        "emoji": "🐉",
        "label": "Invent a wild excuse",
        "points": 5,
        "response": "An excuse may protect us for a moment, but it can make trust wobblier."
      },
      {
        "emoji": "🤐",
        "label": "Say nothing",
        "points": 8,
        "response": "Staying silent can leave the problem unsolved."
      },
      {
        "emoji": "💬",
        "label": "Say I forgot and ask what to do next",
        "points": 15,
        "response": "That is honest problem-solving: tell what happened, then make a plan.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-marker",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "The missing marker",
    "setup": "You borrowed a classmate's special marker and now you cannot find it.",
    "reactions": [
      {
        "who": "willow",
        "line": "A truth can feel hard for one moment and lighter afterwards."
      },
      {
        "who": "sunny",
        "line": "We can be honest AND help fix what happened."
      }
    ],
    "choices": [
      {
        "emoji": "🙈",
        "label": "Pretend I never borrowed it",
        "points": 5,
        "response": "Pretending can make the worry and the trust problem bigger."
      },
      {
        "emoji": "🔎",
        "label": "Look for it quietly",
        "points": 10,
        "response": "Looking is useful. Letting them know what happened is fair too."
      },
      {
        "emoji": "💬",
        "label": "Tell them and help replace or find it",
        "points": 15,
        "response": "You took responsibility and offered repair. That is how trust grows.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-score",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "The score mistake",
    "setup": "During a game, everyone thinks your team got a point, but you know the ball was out.",
    "reactions": [
      {
        "who": "willow",
        "line": "A truth can feel hard for one moment and lighter afterwards."
      },
      {
        "who": "sunny",
        "line": "We can be honest AND help fix what happened."
      }
    ],
    "choices": [
      {
        "emoji": "🏆",
        "label": "Keep quiet so we can win",
        "points": 5,
        "response": "Winning can feel exciting, but a win built on a known mistake can feel shaky."
      },
      {
        "emoji": "🤷",
        "label": "Let someone else decide",
        "points": 10,
        "response": "That avoids lying, but you still have useful information."
      },
      {
        "emoji": "🙋",
        "label": "Say what really happened",
        "points": 15,
        "response": "Fair play! You chose honesty even when it did not benefit you.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-craft",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "The broken model",
    "setup": "You accidentally snap a piece off your friend's craft project.",
    "reactions": [
      {
        "who": "willow",
        "line": "A truth can feel hard for one moment and lighter afterwards."
      },
      {
        "who": "sunny",
        "line": "We can be honest AND help fix what happened."
      }
    ],
    "choices": [
      {
        "emoji": "🫣",
        "label": "Put it back and hope they don't notice",
        "points": 5,
        "response": "Hiding damage can make the hurt bigger later."
      },
      {
        "emoji": "🧴",
        "label": "Try to fix it secretly",
        "points": 10,
        "response": "Repair is kind, but your friend deserves to know what happened."
      },
      {
        "emoji": "💬",
        "label": "Tell them, apologise, and offer to help fix it",
        "points": 15,
        "response": "Truth plus repair is a powerful trust skill.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-money",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "Money on the floor",
    "setup": "You find some money on the classroom floor and nobody seems to know whose it is.",
    "reactions": [
      {
        "who": "willow",
        "line": "A truth can feel hard for one moment and lighter afterwards."
      },
      {
        "who": "sunny",
        "line": "We can be honest AND help fix what happened."
      }
    ],
    "choices": [
      {
        "emoji": "🪙",
        "label": "Keep it",
        "points": 5,
        "response": "Finding something does not automatically make it ours."
      },
      {
        "emoji": "👀",
        "label": "Ask one friend if it's theirs",
        "points": 10,
        "response": "Checking can help, but a trusted adult can help find the owner fairly."
      },
      {
        "emoji": "🙋",
        "label": "Give it to a teacher or trusted adult",
        "points": 15,
        "response": "That gives the owner the best chance of getting it back.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-sibling-blame",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "Wrong person blamed",
    "setup": "A grown-up thinks your sibling made a mess, but you know you made it.",
    "reactions": [
      {
        "who": "willow",
        "line": "A truth can feel hard for one moment and lighter afterwards."
      },
      {
        "who": "sunny",
        "line": "We can be honest AND help fix what happened."
      }
    ],
    "choices": [
      {
        "emoji": "😶",
        "label": "Stay quiet",
        "points": 5,
        "response": "Silence would let someone else carry your mistake."
      },
      {
        "emoji": "🧹",
        "label": "Clean it later",
        "points": 9,
        "response": "Cleaning helps, but fairness also means correcting the blame."
      },
      {
        "emoji": "🙋",
        "label": "Say it was me and help clean",
        "points": 15,
        "response": "You protected someone else from unfair blame and owned your action.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-pet",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "The pet job",
    "setup": "You said you would fill the pet's water bowl, but you forgot.",
    "reactions": [
      {
        "who": "willow",
        "line": "A truth can feel hard for one moment and lighter afterwards."
      },
      {
        "who": "sunny",
        "line": "We can be honest AND help fix what happened."
      }
    ],
    "choices": [
      {
        "emoji": "👉",
        "label": "Say someone else must have forgotten",
        "points": 5,
        "response": "Passing the blame does not help the pet or the trust problem."
      },
      {
        "emoji": "💧",
        "label": "Fill it now and say nothing",
        "points": 10,
        "response": "Fixing it matters. Honest ownership matters too."
      },
      {
        "emoji": "💬",
        "label": "Fill it and admit I forgot",
        "points": 15,
        "response": "You repaired the problem and told the truth.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-book",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "The bent library book",
    "setup": "A library book gets bent in your bag.",
    "reactions": [
      {
        "who": "willow",
        "line": "A truth can feel hard for one moment and lighter afterwards."
      },
      {
        "who": "sunny",
        "line": "We can be honest AND help fix what happened."
      }
    ],
    "choices": [
      {
        "emoji": "📚",
        "label": "Put it back without saying",
        "points": 5,
        "response": "The next person may discover the damage, and nobody can help fix it."
      },
      {
        "emoji": "🩹",
        "label": "Try to repair it myself",
        "points": 8,
        "response": "Trying to help is thoughtful, but some repairs need an adult or librarian."
      },
      {
        "emoji": "💬",
        "label": "Tell a librarian or grown-up what happened",
        "points": 15,
        "response": "Honest reporting helps the book get the right care.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-cheat",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "The tempting answer",
    "setup": "You notice the answer sheet is visible during a class activity.",
    "reactions": [
      {
        "who": "willow",
        "line": "A truth can feel hard for one moment and lighter afterwards."
      },
      {
        "who": "sunny",
        "line": "We can be honest AND help fix what happened."
      }
    ],
    "choices": [
      {
        "emoji": "👀",
        "label": "Copy the answers",
        "points": 5,
        "response": "That might raise the score, but it would not show what you actually know."
      },
      {
        "emoji": "🙃",
        "label": "Look away but tell nobody",
        "points": 11,
        "response": "Looking away protects your own choice."
      },
      {
        "emoji": "🙋",
        "label": "Look away and tell the teacher quietly",
        "points": 15,
        "response": "You protected your learning and helped fix the situation fairly.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "kind-newkid",
    "behaviour": "kind",
    "world": "Everyone Belongs World",
    "title": "A new face",
    "setup": "A new child joins and looks unsure where to sit.",
    "reactions": [
      {
        "who": "coco",
        "line": "A small kind move can change the whole moment."
      },
      {
        "who": "willow",
        "line": "Let's notice what the other person might need."
      },
      {
        "who": "sunny",
        "line": "Kind doesn't have to be huge — just real."
      }
    ],
    "choices": [
      {
        "emoji": "👀",
        "label": "Wait for someone else to help",
        "points": 7,
        "response": "Someone else might — but your small welcome could matter."
      },
      {
        "emoji": "🙂",
        "label": "Smile and say hello",
        "points": 12,
        "response": "A warm hello lowers the awkwardness."
      },
      {
        "emoji": "🪑",
        "label": "Say hello and show them a place to join",
        "points": 15,
        "response": "You turned kindness into a real invitation.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "kind-books",
    "behaviour": "kind",
    "world": "Helping Hands Station",
    "title": "Books everywhere",
    "setup": "Someone drops a pile of books in the hallway.",
    "reactions": [
      {
        "who": "coco",
        "line": "A small kind move can change the whole moment."
      },
      {
        "who": "willow",
        "line": "Let's notice what the other person might need."
      },
      {
        "who": "sunny",
        "line": "Kind doesn't have to be huge — just real."
      }
    ],
    "choices": [
      {
        "emoji": "🚶",
        "label": "Step around them",
        "points": 5,
        "response": "You can keep going, but this is a small chance to help."
      },
      {
        "emoji": "🙋",
        "label": "Ask if they want help",
        "points": 15,
        "response": "You checked what they wanted instead of assuming. Kind and respectful.",
        "best": true
      },
      {
        "emoji": "📚",
        "label": "Help pick them up after they say yes",
        "points": 15,
        "response": "You asked and then helped — excellent teamwork.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "kind-game-skill",
    "behaviour": "kind",
    "world": "Everyone Belongs World",
    "title": "Still learning",
    "setup": "A child on your team keeps missing the ball and looks embarrassed.",
    "reactions": [
      {
        "who": "coco",
        "line": "A small kind move can change the whole moment."
      },
      {
        "who": "willow",
        "line": "Let's notice what the other person might need."
      },
      {
        "who": "sunny",
        "line": "Kind doesn't have to be huge — just real."
      }
    ],
    "choices": [
      {
        "emoji": "🙄",
        "label": "Groan when they miss",
        "points": 5,
        "response": "That can make learning feel even harder."
      },
      {
        "emoji": "🤐",
        "label": "Say nothing",
        "points": 10,
        "response": "Neutral is better than unkind, but encouragement can help."
      },
      {
        "emoji": "👏",
        "label": "Encourage them and keep playing fairly",
        "points": 15,
        "response": "You made space for someone to learn without shame.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "kind-name",
    "behaviour": "kind",
    "world": "Everyone Belongs World",
    "title": "Getting a name right",
    "setup": "You keep forgetting how to say a classmate's name correctly.",
    "reactions": [
      {
        "who": "coco",
        "line": "A small kind move can change the whole moment."
      },
      {
        "who": "willow",
        "line": "Let's notice what the other person might need."
      },
      {
        "who": "sunny",
        "line": "Kind doesn't have to be huge — just real."
      }
    ],
    "choices": [
      {
        "emoji": "😅",
        "label": "Make up a nickname for them",
        "points": 5,
        "response": "A nickname they did not choose may feel dismissive."
      },
      {
        "emoji": "🙈",
        "label": "Avoid saying their name",
        "points": 9,
        "response": "That avoids the mistake but not the learning."
      },
      {
        "emoji": "💬",
        "label": "Ask politely how to say it and practise",
        "points": 15,
        "response": "Names matter. You showed respect by learning.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "kind-lunch",
    "behaviour": "kind",
    "world": "Everyone Belongs World",
    "title": "A different lunch",
    "setup": "Someone brings food that looks or smells unfamiliar to you.",
    "reactions": [
      {
        "who": "coco",
        "line": "A small kind move can change the whole moment."
      },
      {
        "who": "willow",
        "line": "Let's notice what the other person might need."
      },
      {
        "who": "sunny",
        "line": "Kind doesn't have to be huge — just real."
      }
    ],
    "choices": [
      {
        "emoji": "🤢",
        "label": "Say 'Eww!'",
        "points": 5,
        "response": "That can make someone feel judged for something normal in their home or culture."
      },
      {
        "emoji": "🤐",
        "label": "Keep the thought to myself",
        "points": 12,
        "response": "You chose not to hurt someone with a quick reaction.",
        "best": true
      },
      {
        "emoji": "🙂",
        "label": "Be curious without making fun of it",
        "points": 15,
        "response": "Respectful curiosity makes room for differences.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "kind-hobby",
    "behaviour": "kind",
    "world": "Everyone Belongs World",
    "title": "The unusual hobby",
    "setup": "A classmate excitedly tells you about a hobby you do not understand.",
    "reactions": [
      {
        "who": "coco",
        "line": "A small kind move can change the whole moment."
      },
      {
        "who": "willow",
        "line": "Let's notice what the other person might need."
      },
      {
        "who": "sunny",
        "line": "Kind doesn't have to be huge — just real."
      }
    ],
    "choices": [
      {
        "emoji": "😂",
        "label": "Laugh because it sounds weird",
        "points": 5,
        "response": "People do not need the same interests to deserve respect."
      },
      {
        "emoji": "👌",
        "label": "Say 'okay' and change the subject",
        "points": 10,
        "response": "That is neutral, but you could show a little more interest."
      },
      {
        "emoji": "❓",
        "label": "Ask one friendly question about it",
        "points": 15,
        "response": "You showed interest without pretending you love the same thing.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "kind-lastpick",
    "behaviour": "kind",
    "world": "Everyone Belongs World",
    "title": "Picked last",
    "setup": "One child is still waiting when teams are being chosen.",
    "reactions": [
      {
        "who": "coco",
        "line": "A small kind move can change the whole moment."
      },
      {
        "who": "willow",
        "line": "Let's notice what the other person might need."
      },
      {
        "who": "sunny",
        "line": "Kind doesn't have to be huge — just real."
      }
    ],
    "choices": [
      {
        "emoji": "😬",
        "label": "Complain if they join my team",
        "points": 5,
        "response": "That can turn a hard moment into a humiliating one."
      },
      {
        "emoji": "🤐",
        "label": "Say nothing",
        "points": 10,
        "response": "Neutral is okay, but welcome can help."
      },
      {
        "emoji": "👋",
        "label": "Welcome them and focus on playing together",
        "points": 15,
        "response": "You helped make the team feel like a team.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "kind-communication",
    "behaviour": "kind",
    "world": "Helping Hands Station",
    "title": "Give them time",
    "setup": "A classmate takes longer to answer a question than you do.",
    "reactions": [
      {
        "who": "coco",
        "line": "A small kind move can change the whole moment."
      },
      {
        "who": "willow",
        "line": "Let's notice what the other person might need."
      },
      {
        "who": "sunny",
        "line": "Kind doesn't have to be huge — just real."
      }
    ],
    "choices": [
      {
        "emoji": "⚡",
        "label": "Finish their answer for them",
        "points": 5,
        "response": "Helping too fast can take away their chance to speak."
      },
      {
        "emoji": "⏳",
        "label": "Wait quietly",
        "points": 12,
        "response": "Giving time is respectful.",
        "best": true
      },
      {
        "emoji": "🙂",
        "label": "Wait and listen when they are ready",
        "points": 15,
        "response": "You made room for their own voice.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "kind-mistake-laugh",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "Everyone laughs",
    "setup": "Someone makes a mistake while reading aloud and a few kids laugh.",
    "reactions": [
      {
        "who": "coco",
        "line": "A small kind move can change the whole moment."
      },
      {
        "who": "willow",
        "line": "Let's notice what the other person might need."
      },
      {
        "who": "sunny",
        "line": "Kind doesn't have to be huge — just real."
      }
    ],
    "choices": [
      {
        "emoji": "😂",
        "label": "Laugh too",
        "points": 5,
        "response": "Joining in can make the moment much harder for them."
      },
      {
        "emoji": "😶",
        "label": "Stay quiet",
        "points": 11,
        "response": "Not joining the teasing is a good choice.",
        "best": true
      },
      {
        "emoji": "💛",
        "label": "Stay kind and encourage them afterwards",
        "points": 15,
        "response": "You helped make a vulnerable moment safer.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-seat",
    "behaviour": "kind",
    "world": "Everyone Belongs World",
    "title": "The empty seat",
    "setup": "At an activity, you notice someone hovering because they are unsure where they belong.",
    "reactions": [
      {
        "who": "coco",
        "line": "A small kind move can change the whole moment."
      },
      {
        "who": "willow",
        "line": "Let's notice what the other person might need."
      },
      {
        "who": "sunny",
        "line": "Kind doesn't have to be huge — just real."
      }
    ],
    "choices": [
      {
        "emoji": "🧍",
        "label": "Ignore them",
        "points": 5,
        "response": "They may eventually find a place, but you can make belonging easier."
      },
      {
        "emoji": "👋",
        "label": "Point out an open space",
        "points": 12,
        "response": "Helpful and simple.",
        "best": true
      },
      {
        "emoji": "🤝",
        "label": "Invite them to join if there is room",
        "points": 15,
        "response": "You turned an empty space into a welcome.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "friend-cancel",
    "behaviour": "include",
    "world": "Kindness Garden",
    "title": "Plans changed",
    "setup": "Your friend cancels plans at the last minute and you feel disappointed.",
    "reactions": [
      {
        "who": "willow",
        "line": "We can care about our feelings and their feelings at the same time."
      },
      {
        "who": "pip",
        "line": "Clear words help friends understand each other."
      },
      {
        "who": "sunny",
        "line": "Let's find a fair next step."
      }
    ],
    "choices": [
      {
        "emoji": "💢",
        "label": "Send an angry message",
        "points": 5,
        "response": "The disappointment is real, but an angry message may create a second problem."
      },
      {
        "emoji": "👻",
        "label": "Ignore them for days",
        "points": 6,
        "response": "Pulling away may leave both of you guessing."
      },
      {
        "emoji": "💬",
        "label": "Say I'm disappointed and ask what happened",
        "points": 15,
        "response": "Clear words give the friendship a chance to understand and repair.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "friend-secret",
    "behaviour": "include",
    "world": "Truth & Trust HQ",
    "title": "A friend's private story",
    "setup": "A friend tells you something personal that is not about anyone being unsafe.",
    "reactions": [
      {
        "who": "willow",
        "line": "We can care about our feelings and their feelings at the same time."
      },
      {
        "who": "pip",
        "line": "Clear words help friends understand each other."
      },
      {
        "who": "sunny",
        "line": "Let's find a fair next step."
      }
    ],
    "choices": [
      {
        "emoji": "📣",
        "label": "Tell others because it's interesting",
        "points": 5,
        "response": "Sharing private information can break trust."
      },
      {
        "emoji": "🤐",
        "label": "Keep it private",
        "points": 15,
        "response": "You respected your friend's privacy.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask before sharing anything about it",
        "points": 15,
        "response": "Checking permission protects trust.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "friend-stop",
    "behaviour": "include",
    "world": "Kindness Garden",
    "title": "They say stop",
    "setup": "You are joking around, but your friend stops smiling and says, 'Stop.'",
    "reactions": [
      {
        "who": "willow",
        "line": "We can care about our feelings and their feelings at the same time."
      },
      {
        "who": "pip",
        "line": "Clear words help friends understand each other."
      },
      {
        "who": "sunny",
        "line": "Let's find a fair next step."
      }
    ],
    "choices": [
      {
        "emoji": "😜",
        "label": "Keep going because it was only a joke",
        "points": 5,
        "response": "When someone says stop, the joke needs to stop."
      },
      {
        "emoji": "🛑",
        "label": "Stop",
        "points": 15,
        "response": "You respected the boundary immediately.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Stop and check if they're okay",
        "points": 15,
        "response": "You respected the boundary and cared about the impact.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "friend-rules",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "Different rules",
    "setup": "You and a friend disagree about the rules of a game.",
    "reactions": [
      {
        "who": "willow",
        "line": "We can care about our feelings and their feelings at the same time."
      },
      {
        "who": "pip",
        "line": "Clear words help friends understand each other."
      },
      {
        "who": "sunny",
        "line": "Let's find a fair next step."
      }
    ],
    "choices": [
      {
        "emoji": "📢",
        "label": "Shout that my rule is right",
        "points": 5,
        "response": "Volume does not decide fairness."
      },
      {
        "emoji": "🚪",
        "label": "Quit immediately",
        "points": 8,
        "response": "Leaving is allowed, but you may be able to solve it together first."
      },
      {
        "emoji": "🤝",
        "label": "Pause and agree on the rule before continuing",
        "points": 15,
        "response": "You solved the problem before the game became a fight.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "friend-apology",
    "behaviour": "include",
    "world": "Truth & Trust HQ",
    "title": "You hurt their feelings",
    "setup": "You realise your joke hurt your friend's feelings.",
    "reactions": [
      {
        "who": "willow",
        "line": "We can care about our feelings and their feelings at the same time."
      },
      {
        "who": "pip",
        "line": "Clear words help friends understand each other."
      },
      {
        "who": "sunny",
        "line": "Let's find a fair next step."
      }
    ],
    "choices": [
      {
        "emoji": "🙄",
        "label": "Say 'You're too sensitive'",
        "points": 5,
        "response": "That argues with their feeling instead of noticing your impact."
      },
      {
        "emoji": "😶",
        "label": "Avoid them",
        "points": 7,
        "response": "Avoiding may leave the hurt hanging."
      },
      {
        "emoji": "💬",
        "label": "Apologise without excuses and listen",
        "points": 15,
        "response": "You took responsibility and made room for repair.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "friend-space",
    "behaviour": "include",
    "world": "Kindness Garden",
    "title": "I need a little space",
    "setup": "A friend wants to keep talking, but you are upset and need a few minutes alone.",
    "reactions": [
      {
        "who": "willow",
        "line": "We can care about our feelings and their feelings at the same time."
      },
      {
        "who": "pip",
        "line": "Clear words help friends understand each other."
      },
      {
        "who": "sunny",
        "line": "Let's find a fair next step."
      }
    ],
    "choices": [
      {
        "emoji": "💥",
        "label": "Snap 'Go away!'",
        "points": 5,
        "response": "Needing space is okay; hurting someone to get it is not the only option."
      },
      {
        "emoji": "🚶",
        "label": "Walk off without saying anything",
        "points": 9,
        "response": "Taking space can help, but a few clear words prevent confusion."
      },
      {
        "emoji": "💬",
        "label": "Say 'I need a few minutes; I'll come back'",
        "points": 15,
        "response": "You protected your space and the friendship at the same time.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "friend-notinvited",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "Not invited",
    "setup": "You find out some friends did something together without inviting you.",
    "reactions": [
      {
        "who": "willow",
        "line": "We can care about our feelings and their feelings at the same time."
      },
      {
        "who": "pip",
        "line": "Clear words help friends understand each other."
      },
      {
        "who": "sunny",
        "line": "Let's find a fair next step."
      }
    ],
    "choices": [
      {
        "emoji": "📱",
        "label": "Post something mean about them",
        "points": 5,
        "response": "That can turn hurt into a bigger conflict."
      },
      {
        "emoji": "😔",
        "label": "Decide they hate me",
        "points": 6,
        "response": "Your mind may jump there, but you do not know the whole story yet."
      },
      {
        "emoji": "💬",
        "label": "Talk to a friend calmly or choose another supportive person",
        "points": 15,
        "response": "You made room for facts, feelings, and a helpful next step.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "friend-groupwork",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "Uneven group work",
    "setup": "You feel like you are doing most of a group project.",
    "reactions": [
      {
        "who": "willow",
        "line": "We can care about our feelings and their feelings at the same time."
      },
      {
        "who": "pip",
        "line": "Clear words help friends understand each other."
      },
      {
        "who": "sunny",
        "line": "Let's find a fair next step."
      }
    ],
    "choices": [
      {
        "emoji": "😤",
        "label": "Do everything and stay angry",
        "points": 6,
        "response": "The project may finish, but the problem stays hidden."
      },
      {
        "emoji": "📢",
        "label": "Tell everyone they're lazy",
        "points": 5,
        "response": "Labels can make teamwork harder."
      },
      {
        "emoji": "💬",
        "label": "Say what needs doing and divide the tasks clearly",
        "points": 15,
        "response": "You turned frustration into a specific plan.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "friend-borrow",
    "behaviour": "include",
    "world": "Kindness Garden",
    "title": "Can I have it back?",
    "setup": "A friend borrowed something and has not returned it.",
    "reactions": [
      {
        "who": "willow",
        "line": "We can care about our feelings and their feelings at the same time."
      },
      {
        "who": "pip",
        "line": "Clear words help friends understand each other."
      },
      {
        "who": "sunny",
        "line": "Let's find a fair next step."
      }
    ],
    "choices": [
      {
        "emoji": "🫳",
        "label": "Grab it from their bag",
        "points": 5,
        "response": "Taking it without asking can start another conflict."
      },
      {
        "emoji": "😶",
        "label": "Say nothing even though I'm upset",
        "points": 8,
        "response": "Your feeling matters, and you can speak up respectfully."
      },
      {
        "emoji": "💬",
        "label": "Ask clearly for it back",
        "points": 15,
        "response": "Direct, calm, and fair.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "friend-gossip",
    "behaviour": "include",
    "world": "Kindness Garden",
    "title": "The gossip circle",
    "setup": "Friends start talking badly about someone who is not there.",
    "reactions": [
      {
        "who": "willow",
        "line": "We can care about our feelings and their feelings at the same time."
      },
      {
        "who": "pip",
        "line": "Clear words help friends understand each other."
      },
      {
        "who": "sunny",
        "line": "Let's find a fair next step."
      }
    ],
    "choices": [
      {
        "emoji": "🗣️",
        "label": "Add another story",
        "points": 5,
        "response": "That can spread hurt without giving the person a chance to respond."
      },
      {
        "emoji": "🤐",
        "label": "Stay quiet",
        "points": 11,
        "response": "Not adding to gossip is a solid choice.",
        "best": true
      },
      {
        "emoji": "🔄",
        "label": "Change the subject or say I don't want to talk about them like that",
        "points": 15,
        "response": "You stepped out of the gossip without starting a fight.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "calm-seat",
    "behaviour": "choices",
    "world": "Kindness Garden",
    "title": "My seat!",
    "setup": "Your sibling sits in the spot you wanted on the sofa.",
    "reactions": [
      {
        "who": "ember",
        "line": "Oof — that feeling came in HOT!"
      },
      {
        "who": "pip",
        "line": "Pause first. Then choose what helps."
      },
      {
        "who": "sunny",
        "line": "Calm can be strong."
      }
    ],
    "choices": [
      {
        "emoji": "💥",
        "label": "Push them out of the way",
        "points": 5,
        "response": "Ember understands the frustration, but pushing creates a bigger problem."
      },
      {
        "emoji": "📢",
        "label": "Yell 'MOVE!'",
        "points": 6,
        "response": "A loud demand may turn a small problem into a fight."
      },
      {
        "emoji": "💬",
        "label": "Ask calmly or choose another spot",
        "points": 15,
        "response": "You kept the problem small and your body safe.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "calm-line",
    "behaviour": "choices",
    "world": "Kindness Garden",
    "title": "They cut in line",
    "setup": "Someone steps in front of you in a queue.",
    "reactions": [
      {
        "who": "ember",
        "line": "Oof — that feeling came in HOT!"
      },
      {
        "who": "pip",
        "line": "Pause first. Then choose what helps."
      },
      {
        "who": "sunny",
        "line": "Calm can be strong."
      }
    ],
    "choices": [
      {
        "emoji": "🫷",
        "label": "Shove ahead of them",
        "points": 5,
        "response": "Now there would be two unsafe choices instead of one."
      },
      {
        "emoji": "😤",
        "label": "Complain loudly to everyone",
        "points": 7,
        "response": "The feeling makes sense, but public anger may add heat."
      },
      {
        "emoji": "💬",
        "label": "Say 'I think I was next' or ask an adult for help",
        "points": 15,
        "response": "Clear and calm protects fairness without a fight.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "calm-lose",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "The game didn't go your way",
    "setup": "You lose a game you really wanted to win.",
    "reactions": [
      {
        "who": "ember",
        "line": "Oof — that feeling came in HOT!"
      },
      {
        "who": "pip",
        "line": "Pause first. Then choose what helps."
      },
      {
        "who": "sunny",
        "line": "Calm can be strong."
      }
    ],
    "choices": [
      {
        "emoji": "🎮",
        "label": "Throw the controller or pieces",
        "points": 5,
        "response": "The disappointment is real; throwing things can damage objects or hurt someone."
      },
      {
        "emoji": "😡",
        "label": "Say the game is stupid",
        "points": 7,
        "response": "That may release the feeling for a second, but it can spoil the moment."
      },
      {
        "emoji": "🌬️",
        "label": "Pause, breathe, and say 'good game' when ready",
        "points": 15,
        "response": "You handled a big feeling without letting it run the room.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "calm-bump",
    "behaviour": "choices",
    "world": "Kindness Garden",
    "title": "The accidental bump",
    "setup": "Someone bumps into you and your things fall.",
    "reactions": [
      {
        "who": "ember",
        "line": "Oof — that feeling came in HOT!"
      },
      {
        "who": "pip",
        "line": "Pause first. Then choose what helps."
      },
      {
        "who": "sunny",
        "line": "Calm can be strong."
      }
    ],
    "choices": [
      {
        "emoji": "💢",
        "label": "Bump them back",
        "points": 5,
        "response": "Reacting before you know what happened can turn an accident into a fight."
      },
      {
        "emoji": "📢",
        "label": "Shout at them",
        "points": 6,
        "response": "You can speak up without adding more heat."
      },
      {
        "emoji": "👀",
        "label": "Check what happened, then speak calmly",
        "points": 15,
        "response": "You gave yourself one moment for facts before reacting.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "calm-tower",
    "behaviour": "choices",
    "world": "Helping Hands Station",
    "title": "Crash!",
    "setup": "Someone accidentally knocks over the tower you built.",
    "reactions": [
      {
        "who": "ember",
        "line": "Oof — that feeling came in HOT!"
      },
      {
        "who": "pip",
        "line": "Pause first. Then choose what helps."
      },
      {
        "who": "sunny",
        "line": "Calm can be strong."
      }
    ],
    "choices": [
      {
        "emoji": "🧱",
        "label": "Knock over theirs",
        "points": 5,
        "response": "That spreads the upset instead of fixing yours."
      },
      {
        "emoji": "😭",
        "label": "Quit forever",
        "points": 7,
        "response": "Stopping for now is okay, but you may want another option once the feeling settles."
      },
      {
        "emoji": "💬",
        "label": "Say I'm upset and ask them to help rebuild",
        "points": 15,
        "response": "You named the feeling and turned the problem toward repair.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "calm-no",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "The answer is no",
    "setup": "A grown-up says no to something you really want.",
    "reactions": [
      {
        "who": "ember",
        "line": "Oof — that feeling came in HOT!"
      },
      {
        "who": "pip",
        "line": "Pause first. Then choose what helps."
      },
      {
        "who": "sunny",
        "line": "Calm can be strong."
      }
    ],
    "choices": [
      {
        "emoji": "📢",
        "label": "Keep shouting until they change it",
        "points": 5,
        "response": "A big protest may make everyone more upset without changing the answer."
      },
      {
        "emoji": "🚪",
        "label": "Storm away and slam things",
        "points": 6,
        "response": "Taking space can help; slamming can frighten or damage."
      },
      {
        "emoji": "💬",
        "label": "Say I'm disappointed and ask when/what is possible",
        "points": 15,
        "response": "You handled disappointment and looked for useful information.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "calm-screenoff",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "Time to stop",
    "setup": "Your screen time ends right in the middle of something fun.",
    "reactions": [
      {
        "who": "ember",
        "line": "Oof — that feeling came in HOT!"
      },
      {
        "who": "pip",
        "line": "Pause first. Then choose what helps."
      },
      {
        "who": "sunny",
        "line": "Calm can be strong."
      }
    ],
    "choices": [
      {
        "emoji": "🙉",
        "label": "Pretend I didn't hear",
        "points": 5,
        "response": "Ignoring the limit usually creates a second problem."
      },
      {
        "emoji": "😤",
        "label": "Argue for ten more minutes",
        "points": 7,
        "response": "It is okay to ask once, but repeated arguing can keep the conflict going."
      },
      {
        "emoji": "💾",
        "label": "Save/finish safely if allowed, then stop",
        "points": 15,
        "response": "You practised stopping even when your brain wanted more.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "calm-noise",
    "behaviour": "choices",
    "world": "Kindness Garden",
    "title": "Too much noise",
    "setup": "Someone near you is making noise while you are trying to concentrate.",
    "reactions": [
      {
        "who": "ember",
        "line": "Oof — that feeling came in HOT!"
      },
      {
        "who": "pip",
        "line": "Pause first. Then choose what helps."
      },
      {
        "who": "sunny",
        "line": "Calm can be strong."
      }
    ],
    "choices": [
      {
        "emoji": "📢",
        "label": "Shout 'BE QUIET!'",
        "points": 5,
        "response": "Your need for quiet is valid; shouting adds more noise and tension."
      },
      {
        "emoji": "😠",
        "label": "Sit there getting angrier",
        "points": 7,
        "response": "The feeling may keep building if nobody knows what you need."
      },
      {
        "emoji": "💬",
        "label": "Ask politely for less noise or move if possible",
        "points": 15,
        "response": "You turned irritation into a clear request.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "calm-wronganswer",
    "behaviour": "choices",
    "world": "Kindness Garden",
    "title": "They correct you",
    "setup": "Someone tells you your answer is wrong in front of others.",
    "reactions": [
      {
        "who": "ember",
        "line": "Oof — that feeling came in HOT!"
      },
      {
        "who": "pip",
        "line": "Pause first. Then choose what helps."
      },
      {
        "who": "sunny",
        "line": "Calm can be strong."
      }
    ],
    "choices": [
      {
        "emoji": "💢",
        "label": "Insult them back",
        "points": 5,
        "response": "Embarrassment can feel hot, but an insult adds a new problem."
      },
      {
        "emoji": "🙄",
        "label": "Refuse to listen",
        "points": 7,
        "response": "Protecting yourself by shutting down can block useful information."
      },
      {
        "emoji": "🔎",
        "label": "Pause and check the answer",
        "points": 15,
        "response": "You made room for learning without deciding the correction means something bad about you.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "calm-sibling-toy",
    "behaviour": "choices",
    "world": "Everyone Belongs World",
    "title": "Still using it",
    "setup": "Your sibling wants the toy you are using and starts tugging it.",
    "reactions": [
      {
        "who": "ember",
        "line": "Oof — that feeling came in HOT!"
      },
      {
        "who": "pip",
        "line": "Pause first. Then choose what helps."
      },
      {
        "who": "sunny",
        "line": "Calm can be strong."
      }
    ],
    "choices": [
      {
        "emoji": "🫷",
        "label": "Tug harder",
        "points": 5,
        "response": "Two people pulling can damage the toy or hurt someone."
      },
      {
        "emoji": "📢",
        "label": "Scream for a grown-up immediately",
        "points": 9,
        "response": "Getting help is okay, especially if it feels unsafe. You can also try clear words first if safe."
      },
      {
        "emoji": "💬",
        "label": "Say 'I'm using it; you can have a turn after me'",
        "points": 15,
        "response": "Clear words and turn-taking keep the toy and people safer.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "safe-roadball",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "The ball rolls away",
    "setup": "Your ball rolls toward the road.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My worry bells are ringing — let's check what is safe."
      },
      {
        "who": "pip",
        "line": "Safe choices come before dares, pressure, or awkwardness."
      },
      {
        "who": "sunny",
        "line": "Getting a trusted grown-up is always allowed."
      }
    ],
    "choices": [
      {
        "emoji": "🏃",
        "label": "Run after it",
        "points": 5,
        "response": "A ball can be replaced. Your safety comes first."
      },
      {
        "emoji": "🛑",
        "label": "Stop at the safe edge",
        "points": 15,
        "response": "You stopped your body before the road.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Get a trusted grown-up to help",
        "points": 15,
        "response": "Smart choice — let an adult handle the risky part.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "safe-helmet",
    "behaviour": "choices",
    "world": "Body & Wellness Zone",
    "title": "Ready to ride",
    "setup": "You are excited to ride your bike or scooter, but your helmet is not on yet.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My worry bells are ringing — let's check what is safe."
      },
      {
        "who": "pip",
        "line": "Safe choices come before dares, pressure, or awkwardness."
      },
      {
        "who": "sunny",
        "line": "Getting a trusted grown-up is always allowed."
      }
    ],
    "choices": [
      {
        "emoji": "💨",
        "label": "Go quickly without it",
        "points": 5,
        "response": "Excitement can wait a moment for safety gear."
      },
      {
        "emoji": "⛑️",
        "label": "Put on the right safety gear first",
        "points": 15,
        "response": "Safety first, then fun.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Ask a grown-up for help fitting it",
        "points": 15,
        "response": "Getting help with fit is a strong safety habit.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "safe-onlineinfo",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "A stranger asks online",
    "setup": "Someone you do not know online asks your real name, school, or where you live.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My worry bells are ringing — let's check what is safe."
      },
      {
        "who": "pip",
        "line": "Safe choices come before dares, pressure, or awkwardness."
      },
      {
        "who": "sunny",
        "line": "Getting a trusted grown-up is always allowed."
      }
    ],
    "choices": [
      {
        "emoji": "⌨️",
        "label": "Tell them so they trust me",
        "points": 5,
        "response": "Private information should not be shared with unknown people online."
      },
      {
        "emoji": "🚫",
        "label": "Do not reply",
        "points": 15,
        "response": "You protected your private information.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Block/leave and tell a trusted grown-up",
        "points": 15,
        "response": "You protected yourself and brought in support.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "safe-photo",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "Send me a photo",
    "setup": "An online account you do not know asks you to send a picture of yourself.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My worry bells are ringing — let's check what is safe."
      },
      {
        "who": "pip",
        "line": "Safe choices come before dares, pressure, or awkwardness."
      },
      {
        "who": "sunny",
        "line": "Getting a trusted grown-up is always allowed."
      }
    ],
    "choices": [
      {
        "emoji": "📸",
        "label": "Send one to be friendly",
        "points": 5,
        "response": "You do not owe unknown people pictures of yourself."
      },
      {
        "emoji": "🚫",
        "label": "Do not send it",
        "points": 15,
        "response": "You kept control of your image.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Leave/block and tell a trusted grown-up",
        "points": 15,
        "response": "That is a strong digital-boundary choice.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "safe-secret",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "A secret feels unsafe",
    "setup": "Someone tells you to keep a secret that makes you feel scared, unsafe, or very uncomfortable.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My worry bells are ringing — let's check what is safe."
      },
      {
        "who": "pip",
        "line": "Safe choices come before dares, pressure, or awkwardness."
      },
      {
        "who": "sunny",
        "line": "Getting a trusted grown-up is always allowed."
      }
    ],
    "choices": [
      {
        "emoji": "🤐",
        "label": "Promise never to tell",
        "points": 5,
        "response": "You never have to keep a secret about safety."
      },
      {
        "emoji": "🏃",
        "label": "Get away from the situation if I can",
        "points": 15,
        "response": "Creating distance can be a safe first step.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Tell a trusted grown-up",
        "points": 15,
        "response": "Safety secrets should be shared with a trusted adult who can help.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "safe-hug",
    "behaviour": "choices",
    "world": "Body & Wellness Zone",
    "title": "I don't want a hug",
    "setup": "Someone wants a hug, but you do not want one right now.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My worry bells are ringing — let's check what is safe."
      },
      {
        "who": "pip",
        "line": "Safe choices come before dares, pressure, or awkwardness."
      },
      {
        "who": "sunny",
        "line": "Getting a trusted grown-up is always allowed."
      }
    ],
    "choices": [
      {
        "emoji": "😣",
        "label": "Hug them even though I don't want to",
        "points": 6,
        "response": "You are allowed to have boundaries about your own body."
      },
      {
        "emoji": "✋",
        "label": "Say 'No thanks' or step back",
        "points": 15,
        "response": "Clear, respectful body boundary.",
        "best": true
      },
      {
        "emoji": "👋",
        "label": "Offer another greeting if I want to",
        "points": 15,
        "response": "A wave or high-five can be an alternative only if YOU want it.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "safe-lostshop",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "Where did they go?",
    "setup": "You cannot see your grown-up in a busy shop.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My worry bells are ringing — let's check what is safe."
      },
      {
        "who": "pip",
        "line": "Safe choices come before dares, pressure, or awkwardness."
      },
      {
        "who": "sunny",
        "line": "Getting a trusted grown-up is always allowed."
      }
    ],
    "choices": [
      {
        "emoji": "🚪",
        "label": "Leave the shop to look outside",
        "points": 5,
        "response": "Going farther can make it harder for your grown-up to find you."
      },
      {
        "emoji": "🛑",
        "label": "Stay in a safe visible place",
        "points": 15,
        "response": "Staying nearby makes reunion easier.",
        "best": true
      },
      {
        "emoji": "🧑‍💼",
        "label": "Ask a staff member or safe adult with children for help",
        "points": 15,
        "response": "Getting safe help is a strong plan.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "safe-medicine",
    "behaviour": "choices",
    "world": "Body & Wellness Zone",
    "title": "Something on the counter",
    "setup": "You find medicine that is not yours.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My worry bells are ringing — let's check what is safe."
      },
      {
        "who": "pip",
        "line": "Safe choices come before dares, pressure, or awkwardness."
      },
      {
        "who": "sunny",
        "line": "Getting a trusted grown-up is always allowed."
      }
    ],
    "choices": [
      {
        "emoji": "🍬",
        "label": "Try it because it looks interesting",
        "points": 5,
        "response": "Medicine should only be taken as directed by a responsible adult or clinician."
      },
      {
        "emoji": "✋",
        "label": "Leave it alone",
        "points": 15,
        "response": "Good safety choice.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Tell a trusted grown-up",
        "points": 15,
        "response": "An adult can put it somewhere safe.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "safe-dare",
    "behaviour": "choices",
    "world": "Body & Wellness Zone",
    "title": "The risky dare",
    "setup": "Friends dare you to do something that feels unsafe.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My worry bells are ringing — let's check what is safe."
      },
      {
        "who": "pip",
        "line": "Safe choices come before dares, pressure, or awkwardness."
      },
      {
        "who": "sunny",
        "line": "Getting a trusted grown-up is always allowed."
      }
    ],
    "choices": [
      {
        "emoji": "😬",
        "label": "Do it so they don't laugh",
        "points": 5,
        "response": "Pressure does not make an unsafe idea safer."
      },
      {
        "emoji": "✋",
        "label": "Say no",
        "points": 15,
        "response": "A no is enough.",
        "best": true
      },
      {
        "emoji": "🚶",
        "label": "Leave and get help if needed",
        "points": 15,
        "response": "Walking away from pressure is a strong choice.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "safe-unknown-drink",
    "behaviour": "choices",
    "world": "Body & Wellness Zone",
    "title": "The unlabelled drink",
    "setup": "You find an open or unlabelled drink and do not know what is in it.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My worry bells are ringing — let's check what is safe."
      },
      {
        "who": "pip",
        "line": "Safe choices come before dares, pressure, or awkwardness."
      },
      {
        "who": "sunny",
        "line": "Getting a trusted grown-up is always allowed."
      }
    ],
    "choices": [
      {
        "emoji": "🥤",
        "label": "Taste it to find out",
        "points": 5,
        "response": "If you do not know what something is, do not drink it."
      },
      {
        "emoji": "✋",
        "label": "Leave it alone",
        "points": 15,
        "response": "You chose safety over curiosity.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Tell a trusted grown-up",
        "points": 15,
        "response": "An adult can handle it safely.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "help-table",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Before dinner",
    "setup": "A grown-up is getting dinner ready and the table still needs setting.",
    "reactions": [
      {
        "who": "lull",
        "line": "Part of me wants to leave it for later..."
      },
      {
        "who": "sunny",
        "line": "A small helpful action can make a big difference."
      },
      {
        "who": "sage",
        "line": "Let's take care of our shared space and responsibilities."
      }
    ],
    "choices": [
      {
        "emoji": "🎮",
        "label": "Keep playing and hope someone else does it",
        "points": 5,
        "response": "It is easy to stay in the fun. Helping is a skill we practise."
      },
      {
        "emoji": "🙋",
        "label": "Ask if I can help",
        "points": 15,
        "response": "You noticed a job and offered help.",
        "best": true
      },
      {
        "emoji": "🍽️",
        "label": "Do my usual safe table job",
        "points": 15,
        "response": "You took responsibility without needing a big reminder.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-mess",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Shared mess",
    "setup": "You and a friend make a big craft mess together.",
    "reactions": [
      {
        "who": "lull",
        "line": "Part of me wants to leave it for later..."
      },
      {
        "who": "sunny",
        "line": "A small helpful action can make a big difference."
      },
      {
        "who": "sage",
        "line": "Let's take care of our shared space and responsibilities."
      }
    ],
    "choices": [
      {
        "emoji": "🚪",
        "label": "Leave when the fun part is over",
        "points": 5,
        "response": "Shared fun comes with shared clean-up."
      },
      {
        "emoji": "🧹",
        "label": "Clean only my tiny spot",
        "points": 10,
        "response": "That is a start."
      },
      {
        "emoji": "🤝",
        "label": "Clean up together",
        "points": 15,
        "response": "You shared the fun and the responsibility.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-petcare",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Pet routine",
    "setup": "It is your agreed time to help with a pet-care job.",
    "reactions": [
      {
        "who": "lull",
        "line": "Part of me wants to leave it for later..."
      },
      {
        "who": "sunny",
        "line": "A small helpful action can make a big difference."
      },
      {
        "who": "sage",
        "line": "Let's take care of our shared space and responsibilities."
      }
    ],
    "choices": [
      {
        "emoji": "⏰",
        "label": "Keep saying 'later'",
        "points": 5,
        "response": "Later can quietly turn into forgotten."
      },
      {
        "emoji": "✅",
        "label": "Do the agreed job",
        "points": 15,
        "response": "Reliable care builds trust.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Ask for help if I cannot do it safely",
        "points": 15,
        "response": "Responsibility includes knowing when you need help.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-library",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Due today",
    "setup": "A borrowed library book is due back today.",
    "reactions": [
      {
        "who": "lull",
        "line": "Part of me wants to leave it for later..."
      },
      {
        "who": "sunny",
        "line": "A small helpful action can make a big difference."
      },
      {
        "who": "sage",
        "line": "Let's take care of our shared space and responsibilities."
      }
    ],
    "choices": [
      {
        "emoji": "🛋️",
        "label": "Leave it somewhere and forget",
        "points": 5,
        "response": "That makes the job harder for future-you."
      },
      {
        "emoji": "🎒",
        "label": "Put it by the door or in my bag",
        "points": 12,
        "response": "Great preparation.",
        "best": true
      },
      {
        "emoji": "✅",
        "label": "Return it or ask a grown-up for help returning it",
        "points": 15,
        "response": "You completed the responsibility.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-classroom",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "End of activity",
    "setup": "The class activity ends and materials need putting away.",
    "reactions": [
      {
        "who": "lull",
        "line": "Part of me wants to leave it for later..."
      },
      {
        "who": "sunny",
        "line": "A small helpful action can make a big difference."
      },
      {
        "who": "sage",
        "line": "Let's take care of our shared space and responsibilities."
      }
    ],
    "choices": [
      {
        "emoji": "🏃",
        "label": "Race out first",
        "points": 5,
        "response": "The shared job stays for everyone else."
      },
      {
        "emoji": "📦",
        "label": "Put away what I used",
        "points": 12,
        "response": "Good responsibility.",
        "best": true
      },
      {
        "emoji": "🤝",
        "label": "Put away mine and help with a shared job",
        "points": 15,
        "response": "You helped the whole group reset.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-borrowed",
    "behaviour": "help",
    "world": "Truth & Trust HQ",
    "title": "Return it well",
    "setup": "You borrowed something from a friend and are finished with it.",
    "reactions": [
      {
        "who": "lull",
        "line": "Part of me wants to leave it for later..."
      },
      {
        "who": "sunny",
        "line": "A small helpful action can make a big difference."
      },
      {
        "who": "sage",
        "line": "Let's take care of our shared space and responsibilities."
      }
    ],
    "choices": [
      {
        "emoji": "🫳",
        "label": "Leave it somewhere for them to find",
        "points": 5,
        "response": "They may not know where it went."
      },
      {
        "emoji": "↩️",
        "label": "Give it back",
        "points": 15,
        "response": "Simple and responsible.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Return it and mention any damage or problem",
        "points": 15,
        "response": "Clear return protects trust.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "help-chore",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "The boring job",
    "setup": "You have a small household job you agreed to do, and it feels boring.",
    "reactions": [
      {
        "who": "lull",
        "line": "Part of me wants to leave it for later..."
      },
      {
        "who": "sunny",
        "line": "A small helpful action can make a big difference."
      },
      {
        "who": "sage",
        "line": "Let's take care of our shared space and responsibilities."
      }
    ],
    "choices": [
      {
        "emoji": "🙈",
        "label": "Hide so someone else does it",
        "points": 5,
        "response": "Avoiding it moves your job onto someone else."
      },
      {
        "emoji": "⏱️",
        "label": "Start with five focused minutes",
        "points": 12,
        "response": "Starting small can beat the 'ugh' feeling.",
        "best": true
      },
      {
        "emoji": "✅",
        "label": "Do it, then return to what I enjoy",
        "points": 15,
        "response": "You practised doing a responsibility before the reward.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-group",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "One task left",
    "setup": "Your group has finished most of a project, but one boring task remains.",
    "reactions": [
      {
        "who": "lull",
        "line": "Part of me wants to leave it for later..."
      },
      {
        "who": "sunny",
        "line": "A small helpful action can make a big difference."
      },
      {
        "who": "sage",
        "line": "Let's take care of our shared space and responsibilities."
      }
    ],
    "choices": [
      {
        "emoji": "👉",
        "label": "Say someone else should do it",
        "points": 5,
        "response": "If everyone does that, the task never gets done."
      },
      {
        "emoji": "🤝",
        "label": "Offer to share the task",
        "points": 15,
        "response": "Shared effort makes the boring part lighter.",
        "best": true
      },
      {
        "emoji": "📋",
        "label": "Help divide it fairly",
        "points": 15,
        "response": "You turned 'someone should' into a fair plan.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-spill-other",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Someone else spills",
    "setup": "A younger child spills something nearby and looks worried.",
    "reactions": [
      {
        "who": "lull",
        "line": "Part of me wants to leave it for later..."
      },
      {
        "who": "sunny",
        "line": "A small helpful action can make a big difference."
      },
      {
        "who": "sage",
        "line": "Let's take care of our shared space and responsibilities."
      }
    ],
    "choices": [
      {
        "emoji": "😂",
        "label": "Laugh",
        "points": 5,
        "response": "Mistakes already feel hard; laughter can add shame."
      },
      {
        "emoji": "🙋",
        "label": "Get a grown-up if needed",
        "points": 15,
        "response": "Safe, useful help.",
        "best": true
      },
      {
        "emoji": "🧻",
        "label": "Offer simple help if it is safe",
        "points": 15,
        "response": "You helped without making the child feel small.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-door",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Hands are full",
    "setup": "Someone behind you is carrying several things and you reach the door first.",
    "reactions": [
      {
        "who": "lull",
        "line": "Part of me wants to leave it for later..."
      },
      {
        "who": "sunny",
        "line": "A small helpful action can make a big difference."
      },
      {
        "who": "sage",
        "line": "Let's take care of our shared space and responsibilities."
      }
    ],
    "choices": [
      {
        "emoji": "🚪",
        "label": "Let it swing shut",
        "points": 5,
        "response": "You do not always have to help, but this is an easy chance."
      },
      {
        "emoji": "🤲",
        "label": "Hold the door if it is safe",
        "points": 15,
        "response": "Small action, useful help.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask if they need a hand",
        "points": 15,
        "response": "You checked what help would actually be useful.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "patience-turn",
    "behaviour": "choices",
    "world": "Everyone Belongs World",
    "title": "Not my turn yet",
    "setup": "You really want the next turn, but someone else is still playing.",
    "reactions": [
      {
        "who": "ember",
        "line": "I want it NOW!"
      },
      {
        "who": "pip",
        "line": "Waiting is a skill we can practise."
      },
      {
        "who": "willow",
        "line": "We can feel impatient without letting impatience choose for us."
      }
    ],
    "choices": [
      {
        "emoji": "🫳",
        "label": "Grab it",
        "points": 5,
        "response": "Wanting a turn is okay. Grabbing skips fairness."
      },
      {
        "emoji": "📢",
        "label": "Ask again and again",
        "points": 7,
        "response": "Repeated asking can make waiting harder for everyone."
      },
      {
        "emoji": "⏳",
        "label": "Wait for my turn or ask once when it will be",
        "points": 15,
        "response": "You made a plan for waiting instead of fighting it.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "patience-interrupt",
    "behaviour": "choices",
    "world": "Everyone Belongs World",
    "title": "I know the answer!",
    "setup": "Someone else is speaking and you really want to say your idea.",
    "reactions": [
      {
        "who": "ember",
        "line": "I want it NOW!"
      },
      {
        "who": "pip",
        "line": "Waiting is a skill we can practise."
      },
      {
        "who": "willow",
        "line": "We can feel impatient without letting impatience choose for us."
      }
    ],
    "choices": [
      {
        "emoji": "📣",
        "label": "Talk over them",
        "points": 5,
        "response": "Your idea matters, and so does their turn to finish."
      },
      {
        "emoji": "🤐",
        "label": "Hold it in and forget it",
        "points": 9,
        "response": "Waiting is good; you can use a trick to remember your idea."
      },
      {
        "emoji": "☝️",
        "label": "Wait, then take my turn",
        "points": 15,
        "response": "You held onto your idea without taking over theirs.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "patience-queue",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "Long queue",
    "setup": "The line is moving very slowly.",
    "reactions": [
      {
        "who": "ember",
        "line": "I want it NOW!"
      },
      {
        "who": "pip",
        "line": "Waiting is a skill we can practise."
      },
      {
        "who": "willow",
        "line": "We can feel impatient without letting impatience choose for us."
      }
    ],
    "choices": [
      {
        "emoji": "😤",
        "label": "Complain every minute",
        "points": 5,
        "response": "That usually makes waiting feel even longer."
      },
      {
        "emoji": "👀",
        "label": "Notice five things around me",
        "points": 12,
        "response": "Attention can make waiting easier.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Wait or ask calmly how long it may be",
        "points": 15,
        "response": "You handled the delay without making it a battle.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "patience-loading",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "Still loading",
    "setup": "A game or video takes longer than you expected to load.",
    "reactions": [
      {
        "who": "ember",
        "line": "I want it NOW!"
      },
      {
        "who": "pip",
        "line": "Waiting is a skill we can practise."
      },
      {
        "who": "willow",
        "line": "We can feel impatient without letting impatience choose for us."
      }
    ],
    "choices": [
      {
        "emoji": "👊",
        "label": "Hit the device",
        "points": 5,
        "response": "The device is slow; hitting it can create a new problem."
      },
      {
        "emoji": "🔁",
        "label": "Press everything again and again",
        "points": 7,
        "response": "That may make the device or your frustration busier."
      },
      {
        "emoji": "🌬️",
        "label": "Wait, retry safely once, or choose something else",
        "points": 15,
        "response": "You kept frustration from choosing for you.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "patience-toyshop",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "I want it!",
    "setup": "You see a toy you really want, but the answer is not today.",
    "reactions": [
      {
        "who": "ember",
        "line": "I want it NOW!"
      },
      {
        "who": "pip",
        "line": "Waiting is a skill we can practise."
      },
      {
        "who": "willow",
        "line": "We can feel impatient without letting impatience choose for us."
      }
    ],
    "choices": [
      {
        "emoji": "😭",
        "label": "Keep demanding it",
        "points": 5,
        "response": "Wanting is real, but demanding does not turn 'not today' into a plan."
      },
      {
        "emoji": "😠",
        "label": "Say everything is unfair",
        "points": 7,
        "response": "The feeling makes sense, but it can make the whole trip harder."
      },
      {
        "emoji": "📝",
        "label": "Add it to a wish list or savings goal",
        "points": 15,
        "response": "You turned 'I want it now' into a future plan.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "patience-art",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "It won't look right",
    "setup": "Your drawing is not coming out how you imagined.",
    "reactions": [
      {
        "who": "ember",
        "line": "I want it NOW!"
      },
      {
        "who": "pip",
        "line": "Waiting is a skill we can practise."
      },
      {
        "who": "willow",
        "line": "We can feel impatient without letting impatience choose for us."
      }
    ],
    "choices": [
      {
        "emoji": "🗑️",
        "label": "Rip it up immediately",
        "points": 5,
        "response": "That ends the chance to learn from it."
      },
      {
        "emoji": "😤",
        "label": "Keep forcing it while getting angrier",
        "points": 7,
        "response": "Sometimes effort needs a tiny pause."
      },
      {
        "emoji": "⏸️",
        "label": "Pause, try one change, or ask for help",
        "points": 15,
        "response": "You gave your frustration a reset and your work another chance.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "patience-snack",
    "behaviour": "choices",
    "world": "Body & Wellness Zone",
    "title": "Nearly ready",
    "setup": "A snack is being prepared and you are hungry and impatient.",
    "reactions": [
      {
        "who": "ember",
        "line": "I want it NOW!"
      },
      {
        "who": "pip",
        "line": "Waiting is a skill we can practise."
      },
      {
        "who": "willow",
        "line": "We can feel impatient without letting impatience choose for us."
      }
    ],
    "choices": [
      {
        "emoji": "📢",
        "label": "Keep asking 'Is it ready yet?'",
        "points": 5,
        "response": "The wait may feel longer when all your attention is on it."
      },
      {
        "emoji": "🧩",
        "label": "Do something else for a few minutes",
        "points": 15,
        "response": "You helped your brain move through the waiting time.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask once how long it might be",
        "points": 12,
        "response": "A clear answer can help you wait.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "patience-answer",
    "behaviour": "choices",
    "world": "Everyone Belongs World",
    "title": "Teacher is helping someone else",
    "setup": "You need help, but the teacher is already helping another student.",
    "reactions": [
      {
        "who": "ember",
        "line": "I want it NOW!"
      },
      {
        "who": "pip",
        "line": "Waiting is a skill we can practise."
      },
      {
        "who": "willow",
        "line": "We can feel impatient without letting impatience choose for us."
      }
    ],
    "choices": [
      {
        "emoji": "📣",
        "label": "Call louder and louder",
        "points": 5,
        "response": "Needing help is okay. Taking over someone else's turn is not the only option."
      },
      {
        "emoji": "✋",
        "label": "Signal that I need help and keep trying",
        "points": 15,
        "response": "You made your need visible and respected the current turn.",
        "best": true
      },
      {
        "emoji": "🧑‍🤝‍🧑",
        "label": "Use an allowed backup, like checking instructions or asking a partner",
        "points": 15,
        "response": "You found a helpful next step while waiting.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "patience-boardgame",
    "behaviour": "choices",
    "world": "Kindness Garden",
    "title": "Long thinker",
    "setup": "Another player is taking a long time to choose their move.",
    "reactions": [
      {
        "who": "ember",
        "line": "I want it NOW!"
      },
      {
        "who": "pip",
        "line": "Waiting is a skill we can practise."
      },
      {
        "who": "willow",
        "line": "We can feel impatient without letting impatience choose for us."
      }
    ],
    "choices": [
      {
        "emoji": "🙄",
        "label": "Rush them loudly",
        "points": 5,
        "response": "Pressure can make thinking harder."
      },
      {
        "emoji": "😶",
        "label": "Wait but make annoyed faces",
        "points": 8,
        "response": "You waited with your body, but your face may still add pressure."
      },
      {
        "emoji": "⏳",
        "label": "Give them reasonable thinking time",
        "points": 15,
        "response": "Patience helped keep the game friendly.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "patience-story",
    "behaviour": "choices",
    "world": "Everyone Belongs World",
    "title": "Wait for the ending",
    "setup": "Someone is telling a story and you think you know what happened.",
    "reactions": [
      {
        "who": "ember",
        "line": "I want it NOW!"
      },
      {
        "who": "pip",
        "line": "Waiting is a skill we can practise."
      },
      {
        "who": "willow",
        "line": "We can feel impatient without letting impatience choose for us."
      }
    ],
    "choices": [
      {
        "emoji": "⚡",
        "label": "Blurt out the ending",
        "points": 5,
        "response": "Guessing can steal the storyteller's turn."
      },
      {
        "emoji": "🤐",
        "label": "Wait until they finish",
        "points": 15,
        "response": "You let them own their story.",
        "best": true
      },
      {
        "emoji": "❓",
        "label": "Ask a question after they finish",
        "points": 15,
        "response": "You listened first, then joined in.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "learn-handup",
    "behaviour": "mindheart",
    "world": "Good Choices Room",
    "title": "Not sure",
    "setup": "You think you know the answer, but you are worried it might be wrong.",
    "reactions": [
      {
        "who": "fizz",
        "line": "What if I get it wrong?"
      },
      {
        "who": "pip",
        "line": "Mistakes can show us what to practise next."
      },
      {
        "who": "sunny",
        "line": "Trying counts — even before we get it right."
      }
    ],
    "choices": [
      {
        "emoji": "🙈",
        "label": "Never put my hand up",
        "points": 5,
        "response": "Avoiding every risk protects you from mistakes — and from practice."
      },
      {
        "emoji": "✋",
        "label": "Try when I feel ready",
        "points": 15,
        "response": "Courage can be a small hand in the air.",
        "best": true
      },
      {
        "emoji": "📝",
        "label": "Write my idea first, then share",
        "points": 15,
        "response": "You found a bridge between thinking and speaking.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "learn-question",
    "behaviour": "mindheart",
    "world": "Helping Hands Station",
    "title": "Everyone else seems to get it",
    "setup": "You are confused, but it looks like everyone else understands.",
    "reactions": [
      {
        "who": "fizz",
        "line": "What if I get it wrong?"
      },
      {
        "who": "pip",
        "line": "Mistakes can show us what to practise next."
      },
      {
        "who": "sunny",
        "line": "Trying counts — even before we get it right."
      }
    ],
    "choices": [
      {
        "emoji": "😶",
        "label": "Pretend I understand",
        "points": 5,
        "response": "Pretending can keep the confusion stuck."
      },
      {
        "emoji": "🔎",
        "label": "Check the instructions again",
        "points": 12,
        "response": "Good first step.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Ask a question or ask for help",
        "points": 15,
        "response": "Questions are part of learning, not proof that you cannot learn.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "learn-presentation",
    "behaviour": "mindheart",
    "world": "Good Choices Room",
    "title": "Your turn to present",
    "setup": "Your name is called and your body feels nervous.",
    "reactions": [
      {
        "who": "fizz",
        "line": "What if I get it wrong?"
      },
      {
        "who": "pip",
        "line": "Mistakes can show us what to practise next."
      },
      {
        "who": "sunny",
        "line": "Trying counts — even before we get it right."
      }
    ],
    "choices": [
      {
        "emoji": "🚪",
        "label": "Run out without telling anyone",
        "points": 5,
        "response": "The nervous feeling may get even bigger if it always makes the choice."
      },
      {
        "emoji": "🌬️",
        "label": "Take one slow breath and begin",
        "points": 15,
        "response": "You made room for nerves and action at the same time.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask for an agreed support if I need it",
        "points": 15,
        "response": "Using support is still courage.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "learn-newclub",
    "behaviour": "mindheart",
    "world": "Everyone Belongs World",
    "title": "First day",
    "setup": "You arrive at a new club where you do not know anyone.",
    "reactions": [
      {
        "who": "fizz",
        "line": "What if I get it wrong?"
      },
      {
        "who": "pip",
        "line": "Mistakes can show us what to practise next."
      },
      {
        "who": "sunny",
        "line": "Trying counts — even before we get it right."
      }
    ],
    "choices": [
      {
        "emoji": "🚗",
        "label": "Leave immediately because it feels awkward",
        "points": 6,
        "response": "Leaving is allowed, but the first awkward minute does not tell you how the whole session will go."
      },
      {
        "emoji": "👀",
        "label": "Watch for a little while",
        "points": 12,
        "response": "Observing can help you settle.",
        "best": true
      },
      {
        "emoji": "👋",
        "label": "Say hello to one person or the leader",
        "points": 15,
        "response": "One small connection can make a new place feel more possible.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "learn-hardmath",
    "behaviour": "mindheart",
    "world": "Good Choices Room",
    "title": "This is hard",
    "setup": "You get stuck on a difficult maths problem.",
    "reactions": [
      {
        "who": "fizz",
        "line": "What if I get it wrong?"
      },
      {
        "who": "pip",
        "line": "Mistakes can show us what to practise next."
      },
      {
        "who": "sunny",
        "line": "Trying counts — even before we get it right."
      }
    ],
    "choices": [
      {
        "emoji": "🧠",
        "label": "Say 'I'm just bad at this'",
        "points": 5,
        "response": "That turns one hard problem into a story about your whole ability."
      },
      {
        "emoji": "⏸️",
        "label": "Take a short reset and try again",
        "points": 12,
        "response": "A reset can help your thinking come back online.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Show where I got stuck and ask for help",
        "points": 15,
        "response": "Specific help is a learning superpower.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "learn-feedback",
    "behaviour": "mindheart",
    "world": "Good Choices Room",
    "title": "Needs changes",
    "setup": "A teacher gives you feedback and asks you to improve your work.",
    "reactions": [
      {
        "who": "fizz",
        "line": "What if I get it wrong?"
      },
      {
        "who": "pip",
        "line": "Mistakes can show us what to practise next."
      },
      {
        "who": "sunny",
        "line": "Trying counts — even before we get it right."
      }
    ],
    "choices": [
      {
        "emoji": "🗑️",
        "label": "Decide the whole thing is terrible",
        "points": 5,
        "response": "Feedback points to the work, not your worth."
      },
      {
        "emoji": "👀",
        "label": "Read the feedback once calmly",
        "points": 12,
        "response": "That helps separate the message from the first feeling.",
        "best": true
      },
      {
        "emoji": "🛠️",
        "label": "Choose one change to make first",
        "points": 15,
        "response": "You turned feedback into action.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "learn-sport",
    "behaviour": "mindheart",
    "world": "Body & Wellness Zone",
    "title": "First try",
    "setup": "You try a new sport or skill and are not very good at it yet.",
    "reactions": [
      {
        "who": "fizz",
        "line": "What if I get it wrong?"
      },
      {
        "who": "pip",
        "line": "Mistakes can show us what to practise next."
      },
      {
        "who": "sunny",
        "line": "Trying counts — even before we get it right."
      }
    ],
    "choices": [
      {
        "emoji": "🚪",
        "label": "Quit because others are better",
        "points": 5,
        "response": "Comparing your first try to someone else's practice can hide your own progress."
      },
      {
        "emoji": "🔁",
        "label": "Try one more time",
        "points": 12,
        "response": "Repetition builds familiarity.",
        "best": true
      },
      {
        "emoji": "🎯",
        "label": "Pick one tiny thing to practise",
        "points": 15,
        "response": "A small target turns 'be good' into something you can actually train.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "learn-reading",
    "behaviour": "mindheart",
    "world": "Good Choices Room",
    "title": "A tricky word",
    "setup": "You reach a word you do not know while reading aloud.",
    "reactions": [
      {
        "who": "fizz",
        "line": "What if I get it wrong?"
      },
      {
        "who": "pip",
        "line": "Mistakes can show us what to practise next."
      },
      {
        "who": "sunny",
        "line": "Trying counts — even before we get it right."
      }
    ],
    "choices": [
      {
        "emoji": "😶",
        "label": "Stop and refuse to continue",
        "points": 6,
        "response": "Feeling stuck is okay; you still have options."
      },
      {
        "emoji": "🔤",
        "label": "Try sounding it out or use a clue",
        "points": 12,
        "response": "You used a strategy.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Ask for the word and keep going",
        "points": 15,
        "response": "Getting help kept the learning moving.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "learn-testmistake",
    "behaviour": "mindheart",
    "world": "Truth & Trust HQ",
    "title": "The answer was wrong",
    "setup": "You see that you got a question wrong.",
    "reactions": [
      {
        "who": "fizz",
        "line": "What if I get it wrong?"
      },
      {
        "who": "pip",
        "line": "Mistakes can show us what to practise next."
      },
      {
        "who": "sunny",
        "line": "Trying counts — even before we get it right."
      }
    ],
    "choices": [
      {
        "emoji": "😠",
        "label": "Hide the paper and never look",
        "points": 5,
        "response": "Avoiding the mistake also hides the lesson inside it."
      },
      {
        "emoji": "🔎",
        "label": "Check what the correct answer was",
        "points": 12,
        "response": "Good detective work.",
        "best": true
      },
      {
        "emoji": "🧩",
        "label": "Find where my thinking changed direction",
        "points": 15,
        "response": "You used the mistake as information for next time.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "learn-perform",
    "behaviour": "mindheart",
    "world": "Good Choices Room",
    "title": "People are watching",
    "setup": "You are about to perform, play, or speak in front of people.",
    "reactions": [
      {
        "who": "fizz",
        "line": "What if I get it wrong?"
      },
      {
        "who": "pip",
        "line": "Mistakes can show us what to practise next."
      },
      {
        "who": "sunny",
        "line": "Trying counts — even before we get it right."
      }
    ],
    "choices": [
      {
        "emoji": "🧠",
        "label": "Tell myself 'I must not feel nervous'",
        "points": 5,
        "response": "Fighting the feeling can make you notice it even more."
      },
      {
        "emoji": "🌬️",
        "label": "Notice the nerves and breathe slowly",
        "points": 12,
        "response": "You made space for the feeling.",
        "best": true
      },
      {
        "emoji": "🎯",
        "label": "Focus on my first small action",
        "points": 15,
        "response": "One next step is easier than carrying the whole performance at once.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "body-hands",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Back from outside",
    "setup": "You come in from outside and are about to eat.",
    "reactions": [
      {
        "who": "sage",
        "line": "Bodies give us clues. We can notice and take care of them."
      },
      {
        "who": "sunny",
        "line": "Taking care of your body is a strong everyday habit."
      }
    ],
    "choices": [
      {
        "emoji": "🍪",
        "label": "Eat straight away",
        "points": 5,
        "response": "A quick wash is a useful hygiene step before eating."
      },
      {
        "emoji": "🧼",
        "label": "Wash and dry my hands",
        "points": 15,
        "response": "Simple body-care habit — done.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Ask for help if the sink or soap is difficult to use",
        "points": 15,
        "response": "Getting help keeps the habit accessible.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-teeth",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Bedtime teeth",
    "setup": "You are tired and do not feel like brushing your teeth.",
    "reactions": [
      {
        "who": "sage",
        "line": "Bodies give us clues. We can notice and take care of them."
      },
      {
        "who": "sunny",
        "line": "Taking care of your body is a strong everyday habit."
      }
    ],
    "choices": [
      {
        "emoji": "🛌",
        "label": "Skip it",
        "points": 5,
        "response": "Tired brains love shortcuts. Routines help us remember care even then."
      },
      {
        "emoji": "🪥",
        "label": "Brush as part of my bedtime routine",
        "points": 15,
        "response": "You followed through on a body-care habit.",
        "best": true
      },
      {
        "emoji": "🎵",
        "label": "Use a simple routine cue or timer",
        "points": 15,
        "response": "A cue can make a boring habit easier to repeat.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-sleep",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "One more episode",
    "setup": "It is time for your usual bedtime, but you want to keep watching.",
    "reactions": [
      {
        "who": "sage",
        "line": "Bodies give us clues. We can notice and take care of them."
      },
      {
        "who": "sunny",
        "line": "Taking care of your body is a strong everyday habit."
      }
    ],
    "choices": [
      {
        "emoji": "📺",
        "label": "Keep watching secretly",
        "points": 5,
        "response": "That trades tomorrow's rest for a little more screen time now."
      },
      {
        "emoji": "🌙",
        "label": "Stop and begin my bedtime routine",
        "points": 15,
        "response": "You helped tomorrow-you by protecting rest.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask once about finishing at a sensible stopping point",
        "points": 12,
        "response": "A calm request is okay; then follow the agreed plan.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-thirst",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Body clue",
    "setup": "You notice you are thirsty while playing.",
    "reactions": [
      {
        "who": "sage",
        "line": "Bodies give us clues. We can notice and take care of them."
      },
      {
        "who": "sunny",
        "line": "Taking care of your body is a strong everyday habit."
      }
    ],
    "choices": [
      {
        "emoji": "🙈",
        "label": "Ignore it so I don't miss anything",
        "points": 5,
        "response": "Body clues are worth noticing."
      },
      {
        "emoji": "💧",
        "label": "Pause and get water",
        "points": 15,
        "response": "You noticed a body clue and responded.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Tell a grown-up if I cannot get a drink myself",
        "points": 15,
        "response": "Asking for help is part of body care.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-toilet",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Need a break",
    "setup": "You notice you need the toilet during an activity.",
    "reactions": [
      {
        "who": "sage",
        "line": "Bodies give us clues. We can notice and take care of them."
      },
      {
        "who": "sunny",
        "line": "Taking care of your body is a strong everyday habit."
      }
    ],
    "choices": [
      {
        "emoji": "😣",
        "label": "Hold it just to avoid asking",
        "points": 5,
        "response": "Body needs are allowed to interrupt an activity."
      },
      {
        "emoji": "✋",
        "label": "Ask to go",
        "points": 15,
        "response": "You listened to your body and spoke up.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Tell a trusted adult if asking feels difficult",
        "points": 15,
        "response": "Support can help you meet a basic body need.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-rest",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Running out of energy",
    "setup": "After lots of activity, your body feels tired.",
    "reactions": [
      {
        "who": "sage",
        "line": "Bodies give us clues. We can notice and take care of them."
      },
      {
        "who": "sunny",
        "line": "Taking care of your body is a strong everyday habit."
      }
    ],
    "choices": [
      {
        "emoji": "🏃",
        "label": "Keep pushing because stopping feels boring",
        "points": 5,
        "response": "Tired can be a useful body signal."
      },
      {
        "emoji": "🪑",
        "label": "Take a short rest",
        "points": 15,
        "response": "You noticed your energy and adjusted.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Tell a grown-up if the tiredness feels unusual or worrying",
        "points": 15,
        "response": "A trusted adult can help when a body signal feels concerning.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-sneeze",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Achoo!",
    "setup": "You feel a sneeze coming while you are near other people.",
    "reactions": [
      {
        "who": "sage",
        "line": "Bodies give us clues. We can notice and take care of them."
      },
      {
        "who": "sunny",
        "line": "Taking care of your body is a strong everyday habit."
      }
    ],
    "choices": [
      {
        "emoji": "🤧",
        "label": "Sneeze toward others",
        "points": 5,
        "response": "We can use simple hygiene habits to reduce spreading germs."
      },
      {
        "emoji": "💪",
        "label": "Cover with a tissue or elbow",
        "points": 15,
        "response": "Good hygiene choice.",
        "best": true
      },
      {
        "emoji": "🧼",
        "label": "Wash or clean hands afterwards when needed",
        "points": 15,
        "response": "You followed through on the hygiene routine.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-ouch",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Something hurts",
    "setup": "You notice a pain or body feeling that worries you.",
    "reactions": [
      {
        "who": "sage",
        "line": "Bodies give us clues. We can notice and take care of them."
      },
      {
        "who": "sunny",
        "line": "Taking care of your body is a strong everyday habit."
      }
    ],
    "choices": [
      {
        "emoji": "🤐",
        "label": "Hide it because I don't want to bother anyone",
        "points": 5,
        "response": "You do not have to solve worrying body symptoms alone."
      },
      {
        "emoji": "🙋",
        "label": "Tell a trusted grown-up",
        "points": 15,
        "response": "That is the right next step for a worrying body symptom.",
        "best": true
      },
      {
        "emoji": "📝",
        "label": "Describe where it hurts and when it started",
        "points": 15,
        "response": "Clear clues can help the adult decide what support you need.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-sun",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Going outside",
    "setup": "You are heading outside for a while on a sunny day and a grown-up reminds you about sun protection.",
    "reactions": [
      {
        "who": "sage",
        "line": "Bodies give us clues. We can notice and take care of them."
      },
      {
        "who": "sunny",
        "line": "Taking care of your body is a strong everyday habit."
      }
    ],
    "choices": [
      {
        "emoji": "🙄",
        "label": "Ignore the reminder",
        "points": 5,
        "response": "Body care can feel boring, but protection habits matter."
      },
      {
        "emoji": "🧴",
        "label": "Use the agreed sun protection",
        "points": 15,
        "response": "You followed a sensible body-care plan.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Ask a grown-up for help with it",
        "points": 15,
        "response": "Getting help is fine.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-dirtyclothes",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Muddy clothes",
    "setup": "You come in with muddy clothes after playing.",
    "reactions": [
      {
        "who": "sage",
        "line": "Bodies give us clues. We can notice and take care of them."
      },
      {
        "who": "sunny",
        "line": "Taking care of your body is a strong everyday habit."
      }
    ],
    "choices": [
      {
        "emoji": "🛋️",
        "label": "Sit on the clean sofa first",
        "points": 5,
        "response": "That moves the mud into another job."
      },
      {
        "emoji": "👕",
        "label": "Put the muddy things where your household expects",
        "points": 15,
        "response": "You helped contain the mess.",
        "best": true
      },
      {
        "emoji": "🧼",
        "label": "Wash up or change as needed",
        "points": 15,
        "response": "You took care of your body and shared space.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "mind-newday",
    "behaviour": "mindheart",
    "world": "Good Choices Room",
    "title": "A big new day",
    "setup": "Tomorrow is your first day somewhere new and your mind keeps imagining everything going wrong.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My mind is making a BIG story about this."
      },
      {
        "who": "willow",
        "line": "The feeling is real, and we can still choose our next step."
      },
      {
        "who": "sunny",
        "line": "Let's notice first, then decide what helps."
      }
    ],
    "choices": [
      {
        "emoji": "🔁",
        "label": "Replay every scary possibility",
        "points": 5,
        "response": "Fizz is trying to protect you, but the loop can make tomorrow feel even bigger."
      },
      {
        "emoji": "📝",
        "label": "Make a small plan for the first few minutes",
        "points": 15,
        "response": "A tiny plan gives your mind something real to hold.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Tell a trusted person what I'm worried about",
        "points": 15,
        "response": "Sharing the worry can bring support and facts.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "mind-jealous",
    "behaviour": "mindheart",
    "world": "Kindness Garden",
    "title": "Their turn to shine",
    "setup": "A friend gets praised for something you wanted to be praised for.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My mind is making a BIG story about this."
      },
      {
        "who": "willow",
        "line": "The feeling is real, and we can still choose our next step."
      },
      {
        "who": "sunny",
        "line": "Let's notice first, then decide what helps."
      }
    ],
    "choices": [
      {
        "emoji": "😒",
        "label": "Say they didn't deserve it",
        "points": 5,
        "response": "Jealousy is a feeling; putting someone down is a choice."
      },
      {
        "emoji": "🌬️",
        "label": "Notice the jealous feeling without acting on it",
        "points": 12,
        "response": "You separated feeling from action.",
        "best": true
      },
      {
        "emoji": "🎯",
        "label": "Congratulate them when ready and focus on my own next goal",
        "points": 15,
        "response": "You made room for both their success and your growth.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "mind-disappointed",
    "behaviour": "mindheart",
    "world": "Kindness Garden",
    "title": "It got cancelled",
    "setup": "Something you were really looking forward to gets cancelled.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My mind is making a BIG story about this."
      },
      {
        "who": "willow",
        "line": "The feeling is real, and we can still choose our next step."
      },
      {
        "who": "sunny",
        "line": "Let's notice first, then decide what helps."
      }
    ],
    "choices": [
      {
        "emoji": "💥",
        "label": "Take it out on everyone nearby",
        "points": 5,
        "response": "The disappointment is real, but other people did not create the feeling on purpose."
      },
      {
        "emoji": "😔",
        "label": "Let myself feel disappointed for a while",
        "points": 12,
        "response": "Feelings do not have to be rushed away.",
        "best": true
      },
      {
        "emoji": "🔄",
        "label": "Choose a different plan when I'm ready",
        "points": 15,
        "response": "You made room for the feeling and then found a next step.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "mind-embarrassed",
    "behaviour": "mindheart",
    "world": "Kindness Garden",
    "title": "Everyone saw",
    "setup": "You make a small mistake in front of other people and feel embarrassed.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My mind is making a BIG story about this."
      },
      {
        "who": "willow",
        "line": "The feeling is real, and we can still choose our next step."
      },
      {
        "who": "sunny",
        "line": "Let's notice first, then decide what helps."
      }
    ],
    "choices": [
      {
        "emoji": "🧠",
        "label": "Decide everyone will remember forever",
        "points": 5,
        "response": "Embarrassment can make a small moment feel enormous."
      },
      {
        "emoji": "🌬️",
        "label": "Pause and remind myself mistakes happen",
        "points": 12,
        "response": "You helped the moment shrink back to size.",
        "best": true
      },
      {
        "emoji": "🙂",
        "label": "Carry on or make a simple repair if needed",
        "points": 15,
        "response": "You did not let one awkward moment decide the whole day.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "mind-bored",
    "behaviour": "mindheart",
    "world": "Good Choices Room",
    "title": "Nothing feels fun",
    "setup": "You feel bored and keep saying there is nothing to do.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My mind is making a BIG story about this."
      },
      {
        "who": "willow",
        "line": "The feeling is real, and we can still choose our next step."
      },
      {
        "who": "sunny",
        "line": "Let's notice first, then decide what helps."
      }
    ],
    "choices": [
      {
        "emoji": "📢",
        "label": "Complain until someone entertains me",
        "points": 5,
        "response": "That gives all the power to someone else."
      },
      {
        "emoji": "🧠",
        "label": "Think of three possible things",
        "points": 12,
        "response": "Generating options is a skill.",
        "best": true
      },
      {
        "emoji": "🎨",
        "label": "Choose one small activity and try it for a few minutes",
        "points": 15,
        "response": "You turned boredom into action.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "mind-leftout",
    "behaviour": "mindheart",
    "world": "Everyone Belongs World",
    "title": "They started without me",
    "setup": "You see friends playing and your mind says, 'They don't want me.'",
    "reactions": [
      {
        "who": "fizz",
        "line": "My mind is making a BIG story about this."
      },
      {
        "who": "willow",
        "line": "The feeling is real, and we can still choose our next step."
      },
      {
        "who": "sunny",
        "line": "Let's notice first, then decide what helps."
      }
    ],
    "choices": [
      {
        "emoji": "🚪",
        "label": "Walk away and decide the story is true",
        "points": 5,
        "response": "The feeling is real, but you still do not know the full story."
      },
      {
        "emoji": "👀",
        "label": "Notice what I actually know versus what I'm guessing",
        "points": 12,
        "response": "Great story-detective move.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask if I can join or choose another friendly option",
        "points": 15,
        "response": "You checked reality instead of letting one thought decide.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "mind-guilt",
    "behaviour": "mindheart",
    "world": "Truth & Trust HQ",
    "title": "I wish I hadn't done that",
    "setup": "You realise you said something unkind and now you feel guilty.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My mind is making a BIG story about this."
      },
      {
        "who": "willow",
        "line": "The feeling is real, and we can still choose our next step."
      },
      {
        "who": "sunny",
        "line": "Let's notice first, then decide what helps."
      }
    ],
    "choices": [
      {
        "emoji": "🧠",
        "label": "Tell myself 'I'm a terrible person'",
        "points": 5,
        "response": "A behaviour can need repair without becoming your whole identity."
      },
      {
        "emoji": "🙈",
        "label": "Avoid the person",
        "points": 7,
        "response": "Avoiding protects you from awkwardness, but it does not repair the hurt."
      },
      {
        "emoji": "💬",
        "label": "Apologise and choose what I'll do differently next time",
        "points": 15,
        "response": "You turned guilt into responsibility and learning.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "mind-homesick",
    "behaviour": "mindheart",
    "world": "Good Choices Room",
    "title": "Missing home",
    "setup": "You are away from home and suddenly miss familiar people or places.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My mind is making a BIG story about this."
      },
      {
        "who": "willow",
        "line": "The feeling is real, and we can still choose our next step."
      },
      {
        "who": "sunny",
        "line": "Let's notice first, then decide what helps."
      }
    ],
    "choices": [
      {
        "emoji": "😣",
        "label": "Tell myself I shouldn't feel this way",
        "points": 5,
        "response": "Missing home is a feeling, not a failure."
      },
      {
        "emoji": "💬",
        "label": "Tell a trusted grown-up how I feel",
        "points": 15,
        "response": "Sharing the feeling can bring comfort and practical support.",
        "best": true
      },
      {
        "emoji": "🧸",
        "label": "Use a familiar comfort or routine if available",
        "points": 12,
        "response": "A safe familiar cue can help you settle.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "mind-overwhelmed",
    "behaviour": "mindheart",
    "world": "Good Choices Room",
    "title": "Too much at once",
    "setup": "There is lots of noise, talking, and activity and your brain feels overloaded.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My mind is making a BIG story about this."
      },
      {
        "who": "willow",
        "line": "The feeling is real, and we can still choose our next step."
      },
      {
        "who": "sunny",
        "line": "Let's notice first, then decide what helps."
      }
    ],
    "choices": [
      {
        "emoji": "💥",
        "label": "Shout at everyone to stop",
        "points": 5,
        "response": "The overload is real, but shouting may add more intensity."
      },
      {
        "emoji": "🚶",
        "label": "Move to a quieter safe place if allowed",
        "points": 15,
        "response": "You changed the environment to help your brain settle.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Tell a trusted adult I need a quieter moment",
        "points": 15,
        "response": "Clear self-advocacy is a strong skill.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "mind-choicepause",
    "behaviour": "mindheart",
    "world": "Kindness Garden",
    "title": "The two-second choice",
    "setup": "Someone says something annoying and you feel the reply racing to your mouth.",
    "reactions": [
      {
        "who": "fizz",
        "line": "My mind is making a BIG story about this."
      },
      {
        "who": "willow",
        "line": "The feeling is real, and we can still choose our next step."
      },
      {
        "who": "sunny",
        "line": "Let's notice first, then decide what helps."
      }
    ],
    "choices": [
      {
        "emoji": "⚡",
        "label": "Say the first sharp thing I think",
        "points": 5,
        "response": "Fast thoughts do not have to become fast words."
      },
      {
        "emoji": "🌬️",
        "label": "Pause for one breath",
        "points": 12,
        "response": "One breath can create a tiny gap.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Choose words that say what I need without attacking",
        "points": 15,
        "response": "You used the gap to choose your response.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "truth-screen-limit",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "Did I stop on time?",
    "setup": "You were allowed twenty more minutes on a game, but you kept playing longer. A grown-up asks if you stopped when agreed.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "😶",
        "label": "Say yes even though I didn't",
        "points": 5,
        "response": "That may avoid an awkward moment now, but it makes trust harder."
      },
      {
        "emoji": "💬",
        "label": "Tell the truth",
        "points": 12,
        "response": "You told what really happened.",
        "best": true
      },
      {
        "emoji": "🛠️",
        "label": "Tell the truth and help make a better plan for next time",
        "points": 15,
        "response": "Honesty plus a plan turns a mistake into practice.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-praise-credit",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "That wasn't all me",
    "setup": "A teacher praises you for a group idea, but you know your classmate thought of an important part.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "🏆",
        "label": "Take all the credit",
        "points": 5,
        "response": "Praise can feel good, but credit is fairest when it matches what happened."
      },
      {
        "emoji": "🤐",
        "label": "Say nothing",
        "points": 8,
        "response": "You did not lie, but someone else's contribution is still invisible."
      },
      {
        "emoji": "💬",
        "label": "Say we worked on it together",
        "points": 15,
        "response": "You told the truth and shared credit fairly.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-room-tidy",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "The super-fast tidy",
    "setup": "You were asked to tidy your room, but you pushed everything into one cupboard. A grown-up asks if it is properly done.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "✅",
        "label": "Say 'Yep, all done!'",
        "points": 5,
        "response": "That answer hides what really happened."
      },
      {
        "emoji": "😅",
        "label": "Say I did a quick tidy but there is more to finish",
        "points": 15,
        "response": "Clear and honest.",
        "best": true
      },
      {
        "emoji": "🧹",
        "label": "Tell the truth and finish the agreed job",
        "points": 15,
        "response": "You owned it and followed through.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-practice-didnt",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "Practice check",
    "setup": "You said you would practise something today, but you forgot. Someone asks how the practice went.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "🎭",
        "label": "Pretend I practised",
        "points": 5,
        "response": "Pretending can protect us from embarrassment, but it cannot build trust or skill."
      },
      {
        "emoji": "💬",
        "label": "Say I forgot",
        "points": 12,
        "response": "That is honest.",
        "best": true
      },
      {
        "emoji": "📝",
        "label": "Say I forgot and choose a new practice time",
        "points": 15,
        "response": "Truth plus a realistic next step.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-shortcut-race",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "The tiny shortcut",
    "setup": "During a friendly race, you accidentally take a shortcut and finish first. Nobody else notices.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "🥇",
        "label": "Keep the win",
        "points": 5,
        "response": "A win feels different when you know the route was not the same."
      },
      {
        "emoji": "🙋",
        "label": "Say I took the shortcut",
        "points": 15,
        "response": "You chose fairness even when no one was checking.",
        "best": true
      },
      {
        "emoji": "🔁",
        "label": "Explain and offer to redo the race",
        "points": 15,
        "response": "Honesty plus repair keeps the game fair.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-own-work",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "Whose answer is it?",
    "setup": "A friend shows you an answer for schoolwork. Later, a teacher asks whether you worked it out yourself.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "🙃",
        "label": "Say it was all my own work",
        "points": 5,
        "response": "That hides how the answer was made."
      },
      {
        "emoji": "💬",
        "label": "Explain honestly what help I had",
        "points": 15,
        "response": "That lets the teacher understand your learning fairly.",
        "best": true
      },
      {
        "emoji": "🧠",
        "label": "Ask to try a similar problem myself",
        "points": 15,
        "response": "Honesty becomes a chance to really learn it.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-used-without-asking",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "I borrowed it… sort of",
    "setup": "You used your sibling's art supplies without asking and one item ran out.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "🙈",
        "label": "Put everything back and say nothing",
        "points": 5,
        "response": "Hiding it leaves your sibling with the surprise."
      },
      {
        "emoji": "💬",
        "label": "Tell them what happened",
        "points": 12,
        "response": "You owned your choice.",
        "best": true
      },
      {
        "emoji": "🛠️",
        "label": "Tell them, apologise, and offer a fair repair",
        "points": 15,
        "response": "Truth and repair help rebuild trust.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-found-hidden-toy",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "Look what I found",
    "setup": "Everyone has been looking for a toy. You suddenly find it under your things and realise you put it there days ago.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "🫥",
        "label": "Put it somewhere else so nobody knows",
        "points": 5,
        "response": "That keeps the mystery going."
      },
      {
        "emoji": "🙋",
        "label": "Say I found it under my things",
        "points": 12,
        "response": "You brought the truth back into the room.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Explain what I remember and return it",
        "points": 15,
        "response": "Honesty helps everyone stop searching and move on.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-chore-partly",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "Almost finished",
    "setup": "You did most of your agreed job but skipped the last part. Someone asks if it is finished.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "✅",
        "label": "Say yes",
        "points": 5,
        "response": "Almost finished is not the same as finished."
      },
      {
        "emoji": "💬",
        "label": "Say which part is still left",
        "points": 12,
        "response": "That is clear and honest.",
        "best": true
      },
      {
        "emoji": "🔧",
        "label": "Tell the truth and finish it if I can",
        "points": 15,
        "response": "You matched your words and your action.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-accidental-delete",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "Where did the file go?",
    "setup": "You accidentally delete part of a shared school project while editing it.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "🤐",
        "label": "Say nothing and hope nobody notices",
        "points": 5,
        "response": "The team may lose time trying to work out what happened."
      },
      {
        "emoji": "💬",
        "label": "Tell the group or teacher what happened",
        "points": 12,
        "response": "Now people know the real problem.",
        "best": true
      },
      {
        "emoji": "🛠️",
        "label": "Tell them and help restore or redo it",
        "points": 15,
        "response": "Honesty helps the team repair faster.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-score-yourself",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "One point too many",
    "setup": "You are keeping score and notice you accidentally gave yourself an extra point.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "🏆",
        "label": "Leave it there",
        "points": 5,
        "response": "It might help you win, but the score would not be true."
      },
      {
        "emoji": "✏️",
        "label": "Fix the score",
        "points": 15,
        "response": "You corrected it even though the mistake helped you.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Fix it and tell the others",
        "points": 15,
        "response": "Transparent and fair.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-late-reason",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "Why are you late?",
    "setup": "You arrive late because you took too long getting ready. You are tempted to blame something else.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "👉",
        "label": "Blame someone or something else",
        "points": 5,
        "response": "That moves your responsibility onto someone else."
      },
      {
        "emoji": "💬",
        "label": "Say what really happened",
        "points": 12,
        "response": "Honest and simple.",
        "best": true
      },
      {
        "emoji": "📝",
        "label": "Tell the truth and think of one change for next time",
        "points": 15,
        "response": "You used honesty to make a better plan.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-online-age",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "The age box",
    "setup": "A website or game says you are too young for an account and asks for your age.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "🎭",
        "label": "Enter an older age",
        "points": 5,
        "response": "Changing your age to get around a safety rule is not an honest choice."
      },
      {
        "emoji": "🛑",
        "label": "Stop and follow the age rule",
        "points": 15,
        "response": "You respected the rule even though it was disappointing.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Ask a trusted grown-up what options are allowed",
        "points": 15,
        "response": "A grown-up can help you find a safe, honest option.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "truth-small-lie-fix",
    "behaviour": "truth",
    "world": "Truth & Trust HQ",
    "title": "Can I correct that?",
    "setup": "You say something untrue because you feel nervous, then immediately wish you had told the truth.",
    "reactions": [
      {
        "who": "fizz",
        "line": "Uh-oh… telling the truth might feel awkward for a moment."
      },
      {
        "who": "willow",
        "line": "We can tell what really happened and then think about repair."
      },
      {
        "who": "sunny",
        "line": "Honesty helps trust grow."
      }
    ],
    "choices": [
      {
        "emoji": "🏃",
        "label": "Keep adding to the story",
        "points": 5,
        "response": "One untrue thing can become harder to untangle if we keep building on it."
      },
      {
        "emoji": "💬",
        "label": "Say 'I need to correct what I just said'",
        "points": 15,
        "response": "You can choose honesty even after a wobbly start.",
        "best": true
      },
      {
        "emoji": "🛠️",
        "label": "Correct it and apologise if someone was affected",
        "points": 15,
        "response": "Repair matters more than pretending the mistake never happened.",
        "best": true
      }
    ],
    "pillar": "TellTheTruth"
  },
  {
    "id": "kind-bad-day",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "A grumpy moment",
    "setup": "Your friend answers you sharply and you can tell they are having a rough day.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "💢",
        "label": "Snap back straight away",
        "points": 5,
        "response": "That can turn one hard moment into two."
      },
      {
        "emoji": "⏸️",
        "label": "Pause before answering",
        "points": 12,
        "response": "You gave the moment less heat.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Speak calmly and ask if they need space",
        "points": 15,
        "response": "Kindness can include boundaries and calm words.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-gift-not-favourite",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "Not my favourite",
    "setup": "Someone gives you a gift that is not really your style.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "😖",
        "label": "Say 'I don't like this'",
        "points": 5,
        "response": "Honesty does not require us to dismiss someone's kind intention in the moment."
      },
      {
        "emoji": "🙏",
        "label": "Thank them for thinking of me",
        "points": 15,
        "response": "You can appreciate the care even if the item is not your favourite.",
        "best": true
      },
      {
        "emoji": "🙂",
        "label": "Focus on the kind thought behind it",
        "points": 12,
        "response": "That helps you respond warmly without pretending.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-word-mistake",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "A tricky word",
    "setup": "Someone says a word incorrectly while speaking in front of the group.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "😂",
        "label": "Laugh",
        "points": 5,
        "response": "That can make a small mistake feel huge."
      },
      {
        "emoji": "😶",
        "label": "Let them continue",
        "points": 12,
        "response": "You did not turn the mistake into a spectacle.",
        "best": true
      },
      {
        "emoji": "💛",
        "label": "Be encouraging if they seem embarrassed",
        "points": 15,
        "response": "A little kindness can help them keep going.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-win-graciously",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "You won!",
    "setup": "You win a game and the other player looks disappointed.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "📣",
        "label": "Boast about how easy it was",
        "points": 5,
        "response": "Winning does not need to make someone else feel small."
      },
      {
        "emoji": "🙂",
        "label": "Enjoy the win without rubbing it in",
        "points": 12,
        "response": "You can feel proud and still be respectful.",
        "best": true
      },
      {
        "emoji": "🤝",
        "label": "Say 'good game' and be a gracious winner",
        "points": 15,
        "response": "You carried your win kindly.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-sibling-building",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "Careful around their creation",
    "setup": "Your sibling has spent a long time building something on the floor near where you want to play.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "🦶",
        "label": "Step through it because it's in my way",
        "points": 5,
        "response": "Their work matters too."
      },
      {
        "emoji": "🚶",
        "label": "Go around it if I can",
        "points": 12,
        "response": "You respected what they made.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask how we can share the space",
        "points": 15,
        "response": "Kindness and problem-solving together.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-service-mistake",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "A small mix-up",
    "setup": "A worker or helper makes a small mistake with something your family asked for.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "🙄",
        "label": "Speak rudely to them",
        "points": 5,
        "response": "People deserve respect even when a mistake needs fixing."
      },
      {
        "emoji": "💬",
        "label": "Explain the problem politely",
        "points": 15,
        "response": "Clear and kind can happen together.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Ask a grown-up to help sort it if needed",
        "points": 12,
        "response": "You can get help without being unkind.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-online-comment",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "Before I post",
    "setup": "You see something online you disagree with and feel like writing a mean comment.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "⌨️",
        "label": "Post the mean comment",
        "points": 5,
        "response": "A screen does not make hurtful words harmless."
      },
      {
        "emoji": "⏸️",
        "label": "Pause and don't post while angry",
        "points": 15,
        "response": "You stopped a fast reaction from becoming permanent words.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Disagree respectfully or leave it alone",
        "points": 15,
        "response": "You kept your boundary without attacking the person.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-proud-art",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "Look what I made!",
    "setup": "Someone proudly shows you something they made, even though it is not your favourite style.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "😬",
        "label": "Say it looks bad",
        "points": 5,
        "response": "Taste can be different without tearing down their effort."
      },
      {
        "emoji": "👀",
        "label": "Notice something specific they worked on",
        "points": 12,
        "response": "Specific attention feels more genuine than fake praise.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Respond kindly and honestly",
        "points": 15,
        "response": "You can be warm without pretending it is your favourite.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-nervous-friend",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "They're nervous",
    "setup": "A friend is nervous before doing something in front of others.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "😜",
        "label": "Tease them to make them 'relax'",
        "points": 5,
        "response": "Teasing can make nerves feel bigger."
      },
      {
        "emoji": "💛",
        "label": "Say something encouraging",
        "points": 12,
        "response": "Support can make a hard moment feel less lonely.",
        "best": true
      },
      {
        "emoji": "👂",
        "label": "Ask what would help",
        "points": 15,
        "response": "You let them choose the kind of support they want.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-disagree",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "Different opinions",
    "setup": "You and another child strongly disagree about which idea is better.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "🙄",
        "label": "Call their idea stupid",
        "points": 5,
        "response": "Disagreement is about ideas, not someone's worth."
      },
      {
        "emoji": "💬",
        "label": "Say why I disagree without insults",
        "points": 15,
        "response": "Firm and respectful.",
        "best": true
      },
      {
        "emoji": "👂",
        "label": "Listen to their reason too",
        "points": 15,
        "response": "Kind disagreement makes room for both voices.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-animal-gentle",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "A curious animal",
    "setup": "You meet a pet or animal that belongs to someone else.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "🏃",
        "label": "Chase or grab it",
        "points": 5,
        "response": "Animals need space and safe handling too."
      },
      {
        "emoji": "✋",
        "label": "Give it space",
        "points": 12,
        "response": "Calm space is kind and safe.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask the owner before touching it",
        "points": 15,
        "response": "You respected both the animal and the owner.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-someone-crying",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "Someone is upset",
    "setup": "You notice another child crying.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "👀",
        "label": "Stare or call other people over",
        "points": 5,
        "response": "Being watched can make a vulnerable moment harder."
      },
      {
        "emoji": "💬",
        "label": "Quietly ask if they want help",
        "points": 15,
        "response": "You offered support without taking over.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Get a trusted adult if they need one",
        "points": 15,
        "response": "Sometimes the kindest help is bringing the right support.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "kind-after-impatient",
    "behaviour": "kind",
    "world": "Kindness Garden",
    "title": "I was a bit sharp",
    "setup": "You realise you spoke impatiently to someone who was trying to help you.",
    "reactions": [
      {
        "who": "coco",
        "line": "We can make this moment a little gentler."
      },
      {
        "who": "willow",
        "line": "Let's notice how our words and actions might land."
      },
      {
        "who": "sunny",
        "line": "Kind can be small, brave, and real."
      }
    ],
    "choices": [
      {
        "emoji": "🙈",
        "label": "Pretend it didn't happen",
        "points": 6,
        "response": "The moment may pass, but a small repair can make it much better."
      },
      {
        "emoji": "💬",
        "label": "Say sorry for how I spoke",
        "points": 15,
        "response": "A simple apology can reset the moment.",
        "best": true
      },
      {
        "emoji": "🔄",
        "label": "Apologise and try the request again kindly",
        "points": 15,
        "response": "You repaired the words and practised a better version.",
        "best": true
      }
    ],
    "pillar": "BeKind"
  },
  {
    "id": "include-three-friends",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "Make room for three",
    "setup": "You are talking with your close friend when another child comes over and tries to join the conversation.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "🔒",
        "label": "Turn away so they can't join",
        "points": 5,
        "response": "Close friendships are okay, but deliberately shutting someone out can hurt."
      },
      {
        "emoji": "👋",
        "label": "Acknowledge them",
        "points": 12,
        "response": "A small welcome changes the feeling of the group.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Make room in the conversation when it fits",
        "points": 15,
        "response": "You kept your friendship and made the space more welcoming.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "include-game-role",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "A way to join",
    "setup": "A child wants to join your game but is not comfortable doing one part of it.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "🚫",
        "label": "Say they can't play at all",
        "points": 5,
        "response": "Sometimes a game can flex without losing the fun."
      },
      {
        "emoji": "💡",
        "label": "Think of another role or way to join",
        "points": 15,
        "response": "You looked for access instead of exclusion.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask what part they would like to do",
        "points": 15,
        "response": "You included their voice in the solution.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "include-new-language",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "Still learning the words",
    "setup": "A new child is still learning the language your group usually speaks.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "😂",
        "label": "Copy the way they speak",
        "points": 5,
        "response": "Learning a new language takes courage; imitation can feel mocking."
      },
      {
        "emoji": "🙂",
        "label": "Use patient, simple communication",
        "points": 12,
        "response": "You made understanding easier without treating them like a baby.",
        "best": true
      },
      {
        "emoji": "🤝",
        "label": "Include them in the activity while you work out communication together",
        "points": 15,
        "response": "Belonging does not have to wait for perfect words.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "include-quiet-child",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "A quiet voice",
    "setup": "Someone in your group has not said much while louder people keep choosing everything.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "📣",
        "label": "Keep going without noticing",
        "points": 6,
        "response": "The loudest voices can accidentally take all the space."
      },
      {
        "emoji": "💬",
        "label": "Ask if they want to share an idea",
        "points": 15,
        "response": "You opened the door without forcing them through it.",
        "best": true
      },
      {
        "emoji": "⏳",
        "label": "Give them time if they choose to speak",
        "points": 15,
        "response": "Inclusion also means not rushing someone's voice.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "include-different-celebration",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "Different traditions",
    "setup": "A classmate talks about a family or cultural celebration that is different from yours.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "🙄",
        "label": "Say yours is better",
        "points": 5,
        "response": "Different traditions do not need to compete."
      },
      {
        "emoji": "👂",
        "label": "Listen respectfully",
        "points": 12,
        "response": "Respect makes room for difference.",
        "best": true
      },
      {
        "emoji": "❓",
        "label": "Ask a friendly question if they seem happy to share",
        "points": 15,
        "response": "Curiosity can build connection when it stays respectful.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "include-choice-turn",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "Who picks today?",
    "setup": "Your group always plays the game you like best, but another child has a different idea.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "🎯",
        "label": "Insist on my game again",
        "points": 5,
        "response": "Always choosing the same person's preference can quietly exclude other voices."
      },
      {
        "emoji": "🔄",
        "label": "Take turns choosing",
        "points": 15,
        "response": "Fair turns give everyone some influence.",
        "best": true
      },
      {
        "emoji": "🗳️",
        "label": "Agree on a fair way to choose",
        "points": 15,
        "response": "You made the decision about the group, not just the loudest person.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "include-younger-player",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "A younger player",
    "setup": "A younger child asks to join a simple game you are playing.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "🙄",
        "label": "Tell them they're too little without checking",
        "points": 5,
        "response": "Sometimes age matters for safety, but sometimes the game can be adjusted."
      },
      {
        "emoji": "👀",
        "label": "Check whether there is a safe way they can join",
        "points": 12,
        "response": "You looked before excluding.",
        "best": true
      },
      {
        "emoji": "💡",
        "label": "Adjust a simple rule if everyone agrees and it stays safe",
        "points": 15,
        "response": "You made belonging possible without ignoring safety.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "include-different-interest",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "Not into the same thing",
    "setup": "Someone in your group does not like the activity everyone else is excited about.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "😒",
        "label": "Tell them they're boring",
        "points": 5,
        "response": "Different interests do not make someone less part of the group."
      },
      {
        "emoji": "🙂",
        "label": "Let them feel differently",
        "points": 12,
        "response": "Belonging does not require identical tastes.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Find out whether there is another way they want to join",
        "points": 15,
        "response": "You made space for difference without forcing participation.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "include-group-role",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "Everyone gets a job",
    "setup": "Your group has a project, but two confident people have taken all the interesting roles.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "🏆",
        "label": "Keep the best roles between us",
        "points": 5,
        "response": "A group works better when everyone has a meaningful part."
      },
      {
        "emoji": "📋",
        "label": "Check that everybody has a role",
        "points": 12,
        "response": "You noticed the whole team.",
        "best": true
      },
      {
        "emoji": "🤝",
        "label": "Share or rotate roles fairly",
        "points": 15,
        "response": "You made participation more balanced.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "include-excluded-by-others",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "They say 'don't let them play'",
    "setup": "A few kids tell you not to let another child join, but they do not give a safety reason.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "🚫",
        "label": "Exclude them so the group likes me",
        "points": 5,
        "response": "Going along with exclusion can make belonging depend on popularity."
      },
      {
        "emoji": "💬",
        "label": "Say they can join if there is room and the game is safe",
        "points": 15,
        "response": "You chose fairness over pressure.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Get an adult if the exclusion is becoming bullying",
        "points": 15,
        "response": "Bringing in support can protect everyone.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "include-lunch-table",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "Room at the table",
    "setup": "There is an open place where your group is sitting and someone asks if they can sit there.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "🪑",
        "label": "Say no just because they're not usually with us",
        "points": 5,
        "response": "Groups can have friendships without turning every open seat into a wall."
      },
      {
        "emoji": "🙂",
        "label": "Let them sit if the seat is free",
        "points": 12,
        "response": "Simple welcome.",
        "best": true
      },
      {
        "emoji": "👋",
        "label": "Make a little room and include them in the conversation when natural",
        "points": 15,
        "response": "You helped the table feel open, not closed.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "include-access-needs",
    "behaviour": "include",
    "world": "Everyone Belongs World",
    "title": "Ask, don't assume",
    "setup": "A classmate sometimes does activities differently and you are not sure whether they need help.",
    "reactions": [
      {
        "who": "willow",
        "line": "Everybody deserves respect and a fair chance to belong."
      },
      {
        "who": "coco",
        "line": "We don't have to be best friends to make room for someone."
      },
      {
        "who": "sunny",
        "line": "Let's help the group feel welcoming."
      }
    ],
    "choices": [
      {
        "emoji": "🫳",
        "label": "Grab or help without asking",
        "points": 5,
        "response": "Helping without permission can take away someone's control."
      },
      {
        "emoji": "💬",
        "label": "Ask if they want help",
        "points": 15,
        "response": "You respected their choice.",
        "best": true
      },
      {
        "emoji": "🙂",
        "label": "Accept 'no thanks' and keep including them",
        "points": 15,
        "response": "Inclusion means support without taking over.",
        "best": true
      }
    ],
    "pillar": "IncludeEveryone"
  },
  {
    "id": "body-breakfast-fuel",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Fuel for the morning",
    "setup": "It is a school morning and food is available, but you are tempted to skip breakfast just to save time.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "🏃",
        "label": "Rush out without eating or telling anyone",
        "points": 5,
        "response": "Your body may need fuel for the morning."
      },
      {
        "emoji": "🍽️",
        "label": "Eat a breakfast that works for me from what's available",
        "points": 15,
        "response": "You gave your body some fuel for the day.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Tell a grown-up if mornings make eating difficult",
        "points": 15,
        "response": "Body care can include asking for help with routines or appetite.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-water-after-play",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "After a big play",
    "setup": "You have been running around and notice you are thirsty.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "🙈",
        "label": "Ignore the thirst so I can keep playing",
        "points": 5,
        "response": "Thirst is a useful body clue."
      },
      {
        "emoji": "💧",
        "label": "Take a water break",
        "points": 15,
        "response": "You listened to your body.",
        "best": true
      },
      {
        "emoji": "⏸️",
        "label": "Drink, catch my breath, then decide if I'm ready to continue",
        "points": 15,
        "response": "Hydration plus a quick body check is smart self-care.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-movement-break",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "I've been sitting ages",
    "setup": "You have been sitting for a long time doing homework, gaming, or watching something.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "🪑",
        "label": "Stay in the same position for hours",
        "points": 5,
        "response": "Bodies often appreciate a change after lots of sitting."
      },
      {
        "emoji": "🚶",
        "label": "Take a short movement break",
        "points": 15,
        "response": "A little movement can help your body reset.",
        "best": true
      },
      {
        "emoji": "🤸",
        "label": "Stretch or move in a comfortable way, then return",
        "points": 15,
        "response": "You gave your body a useful change of position.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-active-play",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Move in a way I enjoy",
    "setup": "You have some free time and have barely moved today.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "📱",
        "label": "Stay still only because moving feels like a chore",
        "points": 6,
        "response": "Rest is important, and our bodies also benefit from regular movement."
      },
      {
        "emoji": "🚲",
        "label": "Choose an active game or movement I enjoy",
        "points": 15,
        "response": "Movement counts when it is safe and enjoyable.",
        "best": true
      },
      {
        "emoji": "🚶",
        "label": "Take a walk or do a short active break",
        "points": 12,
        "response": "Small movement still counts.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-food-variety",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Build a varied plate",
    "setup": "At a meal, there are several familiar foods available from different food groups.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "🙃",
        "label": "Choose only by a 'good food/bad food' rule",
        "points": 5,
        "response": "Food does not need moral labels. Bodies benefit from variety over time."
      },
      {
        "emoji": "🍽️",
        "label": "Choose a satisfying mix from what's available",
        "points": 15,
        "response": "Variety can give your body different kinds of fuel and nutrients.",
        "best": true
      },
      {
        "emoji": "🥕",
        "label": "Try adding a fruit or vegetable I already like if available",
        "points": 12,
        "response": "A familiar extra can add variety without turning food into a test.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-hunger-fullness",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Check the body signal",
    "setup": "During a meal, you are not sure whether you want more food.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "🤖",
        "label": "Ignore my body completely",
        "points": 5,
        "response": "Hunger and fullness can be useful clues, even when they are not perfect."
      },
      {
        "emoji": "⏸️",
        "label": "Pause and notice how my body feels",
        "points": 12,
        "response": "You checked the signal instead of rushing.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask for more if I'm still hungry, or stop when comfortably full",
        "points": 15,
        "response": "You used body clues without turning eating into a rule contest.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-bed-winddown",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Landing the day",
    "setup": "Bedtime is getting close and your brain is still buzzing from the day.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "📱",
        "label": "Keep myself more and more switched on",
        "points": 5,
        "response": "Extra stimulation can make winding down harder."
      },
      {
        "emoji": "🌙",
        "label": "Start my usual calm bedtime routine",
        "points": 15,
        "response": "A predictable wind-down helps your body get ready for sleep.",
        "best": true
      },
      {
        "emoji": "📖",
        "label": "Choose a calm activity that fits my routine",
        "points": 12,
        "response": "You gave your brain a gentler landing.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-morning-teeth",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Morning routine",
    "setup": "You are in a hurry and notice you have not brushed your teeth yet.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "🏃",
        "label": "Skip it because I'm rushing",
        "points": 5,
        "response": "Rushing can make care routines disappear."
      },
      {
        "emoji": "🪥",
        "label": "Brush as part of my routine",
        "points": 15,
        "response": "You protected an everyday body-care habit.",
        "best": true
      },
      {
        "emoji": "⏰",
        "label": "Use a reminder next time if mornings are tricky",
        "points": 12,
        "response": "A cue can support a habit without needing perfect memory.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-sweaty-clean",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "After sweaty play",
    "setup": "You have been very active and feel sweaty and uncomfortable.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "🛋️",
        "label": "Ignore it even though it bothers me",
        "points": 6,
        "response": "Your comfort is a useful clue."
      },
      {
        "emoji": "🚿",
        "label": "Wash or shower when appropriate",
        "points": 15,
        "response": "You responded to your body's hygiene needs.",
        "best": true
      },
      {
        "emoji": "👕",
        "label": "Change into clean, dry clothes if needed",
        "points": 12,
        "response": "Dry, clean clothing can help you feel comfortable again.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-wet-clothes",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Cold and wet",
    "setup": "Your clothes are wet after rain or water play and you are starting to feel cold.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "🥶",
        "label": "Stay in them even though I'm uncomfortable",
        "points": 5,
        "response": "Cold, wet clothes are a good reason to change when you can."
      },
      {
        "emoji": "👕",
        "label": "Change into dry clothes",
        "points": 15,
        "response": "You responded to a clear comfort and warmth signal.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Ask a trusted grown-up for help if I need dry things",
        "points": 15,
        "response": "Getting help is part of body care.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-warmup",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "Ready to move",
    "setup": "You are about to do a sports activity and the group is doing a simple warm-up.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "⏭️",
        "label": "Skip it just to start faster",
        "points": 6,
        "response": "Starting fast is tempting, but the warm-up is part of the activity plan."
      },
      {
        "emoji": "🏃",
        "label": "Join the safe warm-up",
        "points": 15,
        "response": "You prepared your body with the group.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Tell the coach or adult if a movement hurts or feels wrong",
        "points": 15,
        "response": "Body care includes speaking up about pain.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "body-rest-day",
    "behaviour": "body",
    "world": "Body & Wellness Zone",
    "title": "My body feels worn out",
    "setup": "You planned to be active, but today your body feels unusually tired or unwell.",
    "reactions": [
      {
        "who": "sage",
        "line": "Your body gives clues about what it needs."
      },
      {
        "who": "sunny",
        "line": "Food, water, movement, rest, and hygiene all help us care for our bodies."
      }
    ],
    "choices": [
      {
        "emoji": "💪",
        "label": "Force myself to push through no matter what",
        "points": 5,
        "response": "More is not always better. Unusual tiredness or illness deserves attention."
      },
      {
        "emoji": "🛋️",
        "label": "Choose rest or gentler activity",
        "points": 15,
        "response": "Rest can be part of taking care of your body.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Tell a trusted grown-up if I feel unwell or worried",
        "points": 15,
        "response": "An adult can help decide what support you need.",
        "best": true
      }
    ],
    "pillar": "TakeCareOfMyBody"
  },
  {
    "id": "help-dropped-pencils",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Pencils everywhere",
    "setup": "A classmate drops a pencil case and the pencils scatter near you.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "🚶",
        "label": "Step around them",
        "points": 6,
        "response": "You can keep going, but this is an easy chance to help."
      },
      {
        "emoji": "💬",
        "label": "Ask if they want help",
        "points": 12,
        "response": "You checked before jumping in.",
        "best": true
      },
      {
        "emoji": "✏️",
        "label": "Help pick them up if they say yes",
        "points": 15,
        "response": "Small help, immediate difference.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-confused-classmate",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Where do we start?",
    "setup": "A classmate looks confused about the instructions and asks you what to do.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "🙄",
        "label": "Say 'It's obvious'",
        "points": 5,
        "response": "That may make asking for help feel embarrassing."
      },
      {
        "emoji": "💬",
        "label": "Explain the first step if I understand it",
        "points": 15,
        "response": "You helped without doing the whole task for them.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Help them ask the teacher if I'm not sure",
        "points": 15,
        "response": "Useful help can include finding the right person.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-zip-coat",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "A stuck zip",
    "setup": "A younger child is struggling with their coat zip.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "🫳",
        "label": "Grab it without asking",
        "points": 6,
        "response": "Even helpful hands should respect someone's space."
      },
      {
        "emoji": "💬",
        "label": "Ask if they want help",
        "points": 15,
        "response": "You let them choose.",
        "best": true
      },
      {
        "emoji": "🧥",
        "label": "Help a little if they say yes",
        "points": 15,
        "response": "You supported them without taking over more than needed.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-sports-cones",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Last ones out",
    "setup": "Practice is over and the cones or equipment need collecting.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "🏃",
        "label": "Leave it all for the coach or others",
        "points": 6,
        "response": "Shared activities often have shared reset jobs."
      },
      {
        "emoji": "🙋",
        "label": "Ask what I can carry safely",
        "points": 12,
        "response": "You offered useful help.",
        "best": true
      },
      {
        "emoji": "🧺",
        "label": "Help collect the safe equipment",
        "points": 15,
        "response": "You helped the group finish together.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-groceries",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Bags at the door",
    "setup": "A trusted grown-up comes in carrying grocery bags and you are free to help.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "📱",
        "label": "Ignore them even though they ask for a simple safe job",
        "points": 6,
        "response": "Sometimes helping means pausing our own activity for a moment."
      },
      {
        "emoji": "💬",
        "label": "Ask what I can carry safely",
        "points": 15,
        "response": "You checked what help was useful and safe.",
        "best": true
      },
      {
        "emoji": "🛍️",
        "label": "Carry a light bag or put away safe items",
        "points": 15,
        "response": "You took a real piece of the job.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-listen-friend",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "They need an ear",
    "setup": "A friend says they had a rough day and wants to talk.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "📱",
        "label": "Keep looking at my screen while they talk",
        "points": 6,
        "response": "Half-listening can feel lonely."
      },
      {
        "emoji": "👂",
        "label": "Give them attention for a while",
        "points": 15,
        "response": "Listening can be real help.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask whether they want listening, ideas, or an adult's help",
        "points": 15,
        "response": "You did not assume what kind of help they needed.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-high-shelf",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Too high to reach",
    "setup": "Someone is trying to get something from a place that is too high to reach safely.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "🪑",
        "label": "Climb unsafely to get it for them",
        "points": 5,
        "response": "Helping should not create a new danger."
      },
      {
        "emoji": "🙋",
        "label": "Get a trusted adult",
        "points": 15,
        "response": "Safe help is better than risky help.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Tell them I'll find someone who can reach it safely",
        "points": 12,
        "response": "You stayed helpful without taking an unsafe shortcut.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-school-reset",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Reset the room",
    "setup": "An activity ends and the shared room needs a quick tidy before the next group comes in.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "🚪",
        "label": "Leave my mess for the next people",
        "points": 5,
        "response": "That passes our job to someone else."
      },
      {
        "emoji": "🧹",
        "label": "Tidy what I used",
        "points": 12,
        "response": "Responsible help.",
        "best": true
      },
      {
        "emoji": "🤝",
        "label": "Tidy mine and one shared area",
        "points": 15,
        "response": "You helped the whole room get ready.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-sibling-search",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Where is it?",
    "setup": "Your sibling is getting frustrated while looking for something important.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "😏",
        "label": "Watch them struggle",
        "points": 6,
        "response": "You do not have to solve everything, but you may have an easy way to help."
      },
      {
        "emoji": "💬",
        "label": "Ask what they're looking for",
        "points": 12,
        "response": "You first found out what help was needed.",
        "best": true
      },
      {
        "emoji": "🔎",
        "label": "Help look for a few minutes if I can",
        "points": 15,
        "response": "You shared the search without taking over your whole day.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-recycling",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Right bin",
    "setup": "You notice recyclable household items mixed into the wrong place and your family has a recycling routine.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "🙈",
        "label": "Leave it because it isn't my problem",
        "points": 6,
        "response": "Shared spaces work better when people notice small jobs."
      },
      {
        "emoji": "♻️",
        "label": "Sort the safe items correctly",
        "points": 15,
        "response": "You helped the household system work.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Ask a grown-up if I'm not sure where something goes",
        "points": 15,
        "response": "Helpful and careful.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-rain-share",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Caught in the rain",
    "setup": "You have an umbrella and a friend beside you is getting soaked.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "☂️",
        "label": "Keep all the cover even though there is room",
        "points": 6,
        "response": "You can notice when a tiny adjustment would help someone."
      },
      {
        "emoji": "🤝",
        "label": "Share the umbrella if it works safely",
        "points": 15,
        "response": "A small bit of space can be a big help.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Ask if they want to walk together under it",
        "points": 12,
        "response": "You offered rather than assumed.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-stack-safe",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Can I help pack up?",
    "setup": "A trusted adult is putting away light classroom or activity materials.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "🧱",
        "label": "Lift something heavy without asking",
        "points": 5,
        "response": "Helping should stay inside what is safe for you."
      },
      {
        "emoji": "🙋",
        "label": "Ask which items I can help with",
        "points": 15,
        "response": "You matched helpfulness with safety.",
        "best": true
      },
      {
        "emoji": "📦",
        "label": "Carry the light items they give me",
        "points": 15,
        "response": "Useful, safe teamwork.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-newchild-directions",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Where is the room?",
    "setup": "A new child looks lost and asks where an activity is happening.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "👉",
        "label": "Point vaguely and walk away",
        "points": 7,
        "response": "That might help a little, but you can make the directions clearer."
      },
      {
        "emoji": "💬",
        "label": "Explain the directions clearly",
        "points": 12,
        "response": "Useful information is help.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Show them or find an adult who can, if appropriate",
        "points": 15,
        "response": "You helped them get where they needed to go safely.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-fall-get-adult",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Someone falls",
    "setup": "Someone falls during play and seems hurt or very upset.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "😂",
        "label": "Laugh or crowd around",
        "points": 5,
        "response": "They need space and support, not an audience."
      },
      {
        "emoji": "🙋",
        "label": "Get a trusted adult",
        "points": 15,
        "response": "That brings the right help quickly.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Stay nearby and reassure them without moving them unnecessarily",
        "points": 15,
        "response": "Calm company can help while an adult takes over.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-spare-pencil",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "No pencil",
    "setup": "A classmate has forgotten a pencil and you have a spare you are allowed to lend.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "😏",
        "label": "Make fun of them for forgetting",
        "points": 5,
        "response": "A small mistake does not need extra embarrassment."
      },
      {
        "emoji": "✏️",
        "label": "Offer the spare",
        "points": 15,
        "response": "Simple practical help.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Let them know when I need it back",
        "points": 12,
        "response": "Helpful and clear.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "help-homework-not-do-it",
    "behaviour": "help",
    "world": "Helping Hands Station",
    "title": "Help, not take over",
    "setup": "Your sibling or friend asks for help with homework they find difficult.",
    "reactions": [
      {
        "who": "lull",
        "line": "Helping can be one small useful thing — not doing everything for someone."
      },
      {
        "who": "willow",
        "line": "We can notice, ask, and help in a way that respects the other person."
      },
      {
        "who": "sunny",
        "line": "A helpful next step can make the load lighter."
      }
    ],
    "choices": [
      {
        "emoji": "✍️",
        "label": "Do the whole thing for them",
        "points": 6,
        "response": "That finishes the page but takes away their practice."
      },
      {
        "emoji": "💡",
        "label": "Explain one step or ask a guiding question",
        "points": 15,
        "response": "You helped their learning without replacing it.",
        "best": true
      },
      {
        "emoji": "🙋",
        "label": "Help them find a grown-up or resource if I don't know",
        "points": 15,
        "response": "You connected them with useful support.",
        "best": true
      }
    ],
    "pillar": "HelpOthers"
  },
  {
    "id": "choice-language-angry",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "The rude word is ready",
    "setup": "You are really angry and a rude or foul word pops into your mind.",
    "reactions": [
      {
        "who": "ember",
        "line": "The fast choice is trying to jump out first!"
      },
      {
        "who": "pip",
        "line": "Pause. We can choose words and actions that are safe and respectful."
      },
      {
        "who": "sunny",
        "line": "A strong choice is one you can feel good about afterwards."
      }
    ],
    "choices": [
      {
        "emoji": "💥",
        "label": "Shout it at someone",
        "points": 5,
        "response": "Anger is allowed; attacking someone with words can add a new problem."
      },
      {
        "emoji": "⏸️",
        "label": "Pause before I speak",
        "points": 12,
        "response": "You gave yourself a choice.",
        "best": true
      },
      {
        "emoji": "💬",
        "label": "Use words that say what is wrong without rude language",
        "points": 15,
        "response": "Strong feelings, respectful words.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "choice-language-dare",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "Say it!",
    "setup": "Other kids dare you to shout a rude or foul word at someone.",
    "reactions": [
      {
        "who": "ember",
        "line": "The fast choice is trying to jump out first!"
      },
      {
        "who": "pip",
        "line": "Pause. We can choose words and actions that are safe and respectful."
      },
      {
        "who": "sunny",
        "line": "A strong choice is one you can feel good about afterwards."
      }
    ],
    "choices": [
      {
        "emoji": "📣",
        "label": "Do it so they laugh",
        "points": 5,
        "response": "A dare does not decide what comes out of your mouth."
      },
      {
        "emoji": "✋",
        "label": "Say no",
        "points": 15,
        "response": "You chose your own standard instead of the crowd's.",
        "best": true
      },
      {
        "emoji": "🔄",
        "label": "Suggest a funny challenge that doesn't target anyone",
        "points": 15,
        "response": "You kept the fun and dropped the hurtful part.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "choice-language-online",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "The group chat gets rude",
    "setup": "A group chat starts filling with rude language and insults about someone.",
    "reactions": [
      {
        "who": "ember",
        "line": "The fast choice is trying to jump out first!"
      },
      {
        "who": "pip",
        "line": "Pause. We can choose words and actions that are safe and respectful."
      },
      {
        "who": "sunny",
        "line": "A strong choice is one you can feel good about afterwards."
      }
    ],
    "choices": [
      {
        "emoji": "⌨️",
        "label": "Join in",
        "points": 5,
        "response": "Online words can still hurt real people."
      },
      {
        "emoji": "🚫",
        "label": "Don't add to it",
        "points": 12,
        "response": "You stopped the chain at your keyboard.",
        "best": true
      },
      {
        "emoji": "🔄",
        "label": "Leave, change the subject, or get help if someone is being targeted",
        "points": 15,
        "response": "You chose respect and safety.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "choice-language-copy",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "Older kids say it",
    "setup": "You hear older kids using rude language and feel tempted to copy them because it sounds grown-up.",
    "reactions": [
      {
        "who": "ember",
        "line": "The fast choice is trying to jump out first!"
      },
      {
        "who": "pip",
        "line": "Pause. We can choose words and actions that are safe and respectful."
      },
      {
        "who": "sunny",
        "line": "A strong choice is one you can feel good about afterwards."
      }
    ],
    "choices": [
      {
        "emoji": "🗣️",
        "label": "Copy it to seem older",
        "points": 5,
        "response": "Growing up is not measured by rude words."
      },
      {
        "emoji": "🙂",
        "label": "Use the language that fits my values and setting",
        "points": 15,
        "response": "You chose your own words instead of copying pressure.",
        "best": true
      },
      {
        "emoji": "🚶",
        "label": "Ignore it and carry on",
        "points": 12,
        "response": "You do not have to join every behaviour you hear.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  },
  {
    "id": "choice-language-joke",
    "behaviour": "choices",
    "world": "Good Choices Room",
    "title": "Is the joke still funny?",
    "setup": "You think of a joke that uses a rude word or puts another person down.",
    "reactions": [
      {
        "who": "ember",
        "line": "The fast choice is trying to jump out first!"
      },
      {
        "who": "pip",
        "line": "Pause. We can choose words and actions that are safe and respectful."
      },
      {
        "who": "sunny",
        "line": "A strong choice is one you can feel good about afterwards."
      }
    ],
    "choices": [
      {
        "emoji": "😂",
        "label": "Say it anyway",
        "points": 5,
        "response": "A laugh is not worth making someone the target."
      },
      {
        "emoji": "🧠",
        "label": "Change the joke",
        "points": 15,
        "response": "Creative AND respectful.",
        "best": true
      },
      {
        "emoji": "🤐",
        "label": "Skip it if I can't make it kind",
        "points": 12,
        "response": "Choosing not to say something can be a strong choice.",
        "best": true
      }
    ],
    "pillar": "MakeGoodChoices"
  }
];

export const SCENARIOS_BY_PILLAR: Record<BehaviourPillar, PillarScenario[]> = {
  BeKind: CATEGORISED_SCENARIOS.filter(s => s.pillar === 'BeKind'),
  TellTheTruth: CATEGORISED_SCENARIOS.filter(s => s.pillar === 'TellTheTruth'),
  MakeGoodChoices: CATEGORISED_SCENARIOS.filter(s => s.pillar === 'MakeGoodChoices'),
  IncludeEveryone: CATEGORISED_SCENARIOS.filter(s => s.pillar === 'IncludeEveryone'),
  TakeCareOfMyBody: CATEGORISED_SCENARIOS.filter(s => s.pillar === 'TakeCareOfMyBody'),
  HelpOthers: CATEGORISED_SCENARIOS.filter(s => s.pillar === 'HelpOthers'),
};

export const SCENARIO_META: Record<string, {
  origin: ScenarioOrigin;
  teachingMove: TeachingMove;
  ageBand: string;
  pillar: BehaviourPillar;
}> = {
  "truth-broke": {
    "origin": "user-original",
    "teachingMove": "Practice",
    "ageBand": "3-14",
    "pillar": "TellTheTruth"
  },
  "kind-alone": {
    "origin": "user-original",
    "teachingMove": "Practice",
    "ageBand": "3-14",
    "pillar": "IncludeEveryone"
  },
  "anger-unfair": {
    "origin": "user-original",
    "teachingMove": "Experiment",
    "ageBand": "3-14",
    "pillar": "MakeGoodChoices"
  },
  "fear-safe": {
    "origin": "user-original",
    "teachingMove": "Trapdoor",
    "ageBand": "5-14",
    "pillar": "MakeGoodChoices"
  },
  "envy-gratitude": {
    "origin": "user-original",
    "teachingMove": "Experiment",
    "ageBand": "6-14",
    "pillar": "BeKind"
  },
  "body-hygiene": {
    "origin": "user-original",
    "teachingMove": "Practice",
    "ageBand": "3-14",
    "pillar": "TakeCareOfMyBody"
  },
  "help-home": {
    "origin": "user-original",
    "teachingMove": "Practice",
    "ageBand": "3-14",
    "pillar": "HelpOthers"
  },
  "mind-worry": {
    "origin": "user-original",
    "teachingMove": "Experiment",
    "ageBand": "6-14",
    "pillar": "MakeGoodChoices"
  },
  "truth-spill": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-8",
    "pillar": "TellTheTruth"
  },
  "truth-homework": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "6-14",
    "pillar": "TellTheTruth"
  },
  "truth-marker": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "TellTheTruth"
  },
  "truth-score": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "6-14",
    "pillar": "TellTheTruth"
  },
  "truth-craft": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "TellTheTruth"
  },
  "truth-money": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "TellTheTruth"
  },
  "truth-sibling-blame": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "3-10",
    "pillar": "TellTheTruth"
  },
  "truth-pet": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-12",
    "pillar": "TellTheTruth"
  },
  "truth-book": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "TellTheTruth"
  },
  "truth-cheat": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "9-14",
    "pillar": "TellTheTruth"
  },
  "kind-newkid": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "5-14",
    "pillar": "IncludeEveryone"
  },
  "kind-books": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "HelpOthers"
  },
  "kind-game-skill": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "IncludeEveryone"
  },
  "kind-name": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "kind-lunch": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "5-14",
    "pillar": "IncludeEveryone"
  },
  "kind-hobby": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "kind-lastpick": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "kind-communication": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "6-14",
    "pillar": "HelpOthers"
  },
  "kind-mistake-laugh": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "7-14",
    "pillar": "BeKind"
  },
  "kind-seat": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "IncludeEveryone"
  },
  "friend-cancel": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "8-14",
    "pillar": "BeKind"
  },
  "friend-secret": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "8-14",
    "pillar": "TellTheTruth"
  },
  "friend-stop": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "5-14",
    "pillar": "BeKind"
  },
  "friend-rules": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "IncludeEveryone"
  },
  "friend-apology": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "7-14",
    "pillar": "TellTheTruth"
  },
  "friend-space": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "7-14",
    "pillar": "BeKind"
  },
  "friend-notinvited": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "8-14",
    "pillar": "IncludeEveryone"
  },
  "friend-groupwork": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "9-14",
    "pillar": "IncludeEveryone"
  },
  "friend-borrow": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "BeKind"
  },
  "friend-gossip": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "9-14",
    "pillar": "BeKind"
  },
  "calm-seat": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-10",
    "pillar": "BeKind"
  },
  "calm-line": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "BeKind"
  },
  "calm-lose": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "5-14",
    "pillar": "MakeGoodChoices"
  },
  "calm-bump": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "5-14",
    "pillar": "BeKind"
  },
  "calm-tower": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-9",
    "pillar": "HelpOthers"
  },
  "calm-no": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-12",
    "pillar": "MakeGoodChoices"
  },
  "calm-screenoff": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "MakeGoodChoices"
  },
  "calm-noise": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "BeKind"
  },
  "calm-wronganswer": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "7-14",
    "pillar": "BeKind"
  },
  "calm-sibling-toy": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-9",
    "pillar": "IncludeEveryone"
  },
  "safe-roadball": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-10",
    "pillar": "MakeGoodChoices"
  },
  "safe-helmet": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-12",
    "pillar": "TakeCareOfMyBody"
  },
  "safe-onlineinfo": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "9-14",
    "pillar": "MakeGoodChoices"
  },
  "safe-photo": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "9-14",
    "pillar": "MakeGoodChoices"
  },
  "safe-secret": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "MakeGoodChoices"
  },
  "safe-hug": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-14",
    "pillar": "TakeCareOfMyBody"
  },
  "safe-lostshop": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-10",
    "pillar": "MakeGoodChoices"
  },
  "safe-medicine": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-12",
    "pillar": "TakeCareOfMyBody"
  },
  "safe-dare": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "6-14",
    "pillar": "TakeCareOfMyBody"
  },
  "safe-unknown-drink": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "TakeCareOfMyBody"
  },
  "help-table": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-12",
    "pillar": "HelpOthers"
  },
  "help-mess": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-12",
    "pillar": "HelpOthers"
  },
  "help-petcare": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "HelpOthers"
  },
  "help-library": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "HelpOthers"
  },
  "help-classroom": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "HelpOthers"
  },
  "help-borrowed": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "TellTheTruth"
  },
  "help-chore": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "6-14",
    "pillar": "HelpOthers"
  },
  "help-group": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "8-14",
    "pillar": "HelpOthers"
  },
  "help-spill-other": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "HelpOthers"
  },
  "help-door": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "HelpOthers"
  },
  "patience-turn": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-10",
    "pillar": "IncludeEveryone"
  },
  "patience-interrupt": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-12",
    "pillar": "IncludeEveryone"
  },
  "patience-queue": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "5-14",
    "pillar": "MakeGoodChoices"
  },
  "patience-loading": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "6-14",
    "pillar": "MakeGoodChoices"
  },
  "patience-toyshop": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Borrowed image",
    "ageBand": "5-12",
    "pillar": "MakeGoodChoices"
  },
  "patience-art": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "5-14",
    "pillar": "MakeGoodChoices"
  },
  "patience-snack": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "3-10",
    "pillar": "TakeCareOfMyBody"
  },
  "patience-answer": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "patience-boardgame": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "BeKind"
  },
  "patience-story": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "IncludeEveryone"
  },
  "learn-handup": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Borrowed image",
    "ageBand": "6-14",
    "pillar": "MakeGoodChoices"
  },
  "learn-question": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "HelpOthers"
  },
  "learn-presentation": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "8-14",
    "pillar": "MakeGoodChoices"
  },
  "learn-newclub": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "learn-hardmath": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "7-14",
    "pillar": "MakeGoodChoices"
  },
  "learn-feedback": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Borrowed image",
    "ageBand": "8-14",
    "pillar": "MakeGoodChoices"
  },
  "learn-sport": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Borrowed image",
    "ageBand": "5-14",
    "pillar": "TakeCareOfMyBody"
  },
  "learn-reading": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-11",
    "pillar": "MakeGoodChoices"
  },
  "learn-testmistake": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Borrowed image",
    "ageBand": "7-14",
    "pillar": "TellTheTruth"
  },
  "learn-perform": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "7-14",
    "pillar": "MakeGoodChoices"
  },
  "body-hands": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-10",
    "pillar": "TakeCareOfMyBody"
  },
  "body-teeth": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-12",
    "pillar": "TakeCareOfMyBody"
  },
  "body-sleep": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Borrowed image",
    "ageBand": "6-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-thirst": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "3-12",
    "pillar": "TakeCareOfMyBody"
  },
  "body-toilet": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-12",
    "pillar": "TakeCareOfMyBody"
  },
  "body-rest": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "4-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-sneeze": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-12",
    "pillar": "TakeCareOfMyBody"
  },
  "body-ouch": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-sun": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-dirtyclothes": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "3-12",
    "pillar": "TakeCareOfMyBody"
  },
  "mind-newday": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Borrowed image",
    "ageBand": "6-14",
    "pillar": "MakeGoodChoices"
  },
  "mind-jealous": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "7-14",
    "pillar": "BeKind"
  },
  "mind-disappointed": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "BeKind"
  },
  "mind-embarrassed": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Borrowed image",
    "ageBand": "6-14",
    "pillar": "BeKind"
  },
  "mind-bored": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "4-12",
    "pillar": "MakeGoodChoices"
  },
  "mind-leftout": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "mind-guilt": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "7-14",
    "pillar": "TellTheTruth"
  },
  "mind-homesick": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Borrowed image",
    "ageBand": "5-14",
    "pillar": "MakeGoodChoices"
  },
  "mind-overwhelmed": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "5-14",
    "pillar": "MakeGoodChoices"
  },
  "mind-choicepause": {
    "origin": "previous-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "6-14",
    "pillar": "BeKind"
  },
  "truth-screen-limit": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "TellTheTruth"
  },
  "truth-praise-credit": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "7-14",
    "pillar": "TellTheTruth"
  },
  "truth-room-tidy": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "5-12",
    "pillar": "TellTheTruth"
  },
  "truth-practice-didnt": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "TellTheTruth"
  },
  "truth-shortcut-race": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "6-14",
    "pillar": "TellTheTruth"
  },
  "truth-own-work": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "8-14",
    "pillar": "TellTheTruth"
  },
  "truth-used-without-asking": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "TellTheTruth"
  },
  "truth-found-hidden-toy": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-10",
    "pillar": "TellTheTruth"
  },
  "truth-chore-partly": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "TellTheTruth"
  },
  "truth-accidental-delete": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "9-14",
    "pillar": "TellTheTruth"
  },
  "truth-score-yourself": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "5-14",
    "pillar": "TellTheTruth"
  },
  "truth-late-reason": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "7-14",
    "pillar": "TellTheTruth"
  },
  "truth-online-age": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "8-14",
    "pillar": "TellTheTruth"
  },
  "truth-small-lie-fix": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "7-14",
    "pillar": "TellTheTruth"
  },
  "kind-bad-day": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "7-14",
    "pillar": "BeKind"
  },
  "kind-gift-not-favourite": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "5-14",
    "pillar": "BeKind"
  },
  "kind-word-mistake": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "BeKind"
  },
  "kind-win-graciously": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "BeKind"
  },
  "kind-sibling-building": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-12",
    "pillar": "BeKind"
  },
  "kind-service-mistake": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "7-14",
    "pillar": "BeKind"
  },
  "kind-online-comment": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "9-14",
    "pillar": "BeKind"
  },
  "kind-proud-art": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "BeKind"
  },
  "kind-nervous-friend": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "BeKind"
  },
  "kind-disagree": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "BeKind"
  },
  "kind-animal-gentle": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-14",
    "pillar": "BeKind"
  },
  "kind-someone-crying": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "BeKind"
  },
  "kind-after-impatient": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "BeKind"
  },
  "include-three-friends": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "include-game-role": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "5-14",
    "pillar": "IncludeEveryone"
  },
  "include-new-language": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "include-quiet-child": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "7-14",
    "pillar": "IncludeEveryone"
  },
  "include-different-celebration": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "include-choice-turn": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "IncludeEveryone"
  },
  "include-younger-player": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "5-12",
    "pillar": "IncludeEveryone"
  },
  "include-different-interest": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "include-group-role": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "7-14",
    "pillar": "IncludeEveryone"
  },
  "include-excluded-by-others": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "include-lunch-table": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "include-access-needs": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "6-14",
    "pillar": "IncludeEveryone"
  },
  "body-breakfast-fuel": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-water-after-play": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "4-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-movement-break": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "6-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-active-play": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-food-variety": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "6-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-hunger-fullness": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "6-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-bed-winddown": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-morning-teeth": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-sweaty-clean": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-wet-clothes": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-12",
    "pillar": "TakeCareOfMyBody"
  },
  "body-warmup": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "TakeCareOfMyBody"
  },
  "body-rest-day": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "6-14",
    "pillar": "TakeCareOfMyBody"
  },
  "help-dropped-pencils": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-14",
    "pillar": "HelpOthers"
  },
  "help-confused-classmate": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "HelpOthers"
  },
  "help-zip-coat": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "4-12",
    "pillar": "HelpOthers"
  },
  "help-sports-cones": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "HelpOthers"
  },
  "help-groceries": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "HelpOthers"
  },
  "help-listen-friend": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "8-14",
    "pillar": "HelpOthers"
  },
  "help-high-shelf": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "4-12",
    "pillar": "HelpOthers"
  },
  "help-school-reset": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "HelpOthers"
  },
  "help-sibling-search": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "HelpOthers"
  },
  "help-recycling": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "HelpOthers"
  },
  "help-rain-share": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "HelpOthers"
  },
  "help-stack-safe": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "HelpOthers"
  },
  "help-newchild-directions": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "HelpOthers"
  },
  "help-fall-get-adult": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "HelpOthers"
  },
  "help-spare-pencil": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "6-14",
    "pillar": "HelpOthers"
  },
  "help-homework-not-do-it": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "8-14",
    "pillar": "HelpOthers"
  },
  "choice-language-angry": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Experiment",
    "ageBand": "5-14",
    "pillar": "MakeGoodChoices"
  },
  "choice-language-dare": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "6-14",
    "pillar": "MakeGoodChoices"
  },
  "choice-language-online": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "9-14",
    "pillar": "MakeGoodChoices"
  },
  "choice-language-copy": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Practice",
    "ageBand": "5-14",
    "pillar": "MakeGoodChoices"
  },
  "choice-language-joke": {
    "origin": "new-original-by-chatgpt",
    "teachingMove": "Trapdoor",
    "ageBand": "6-14",
    "pillar": "MakeGoodChoices"
  }
};
