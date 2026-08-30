/**
 * Choice scenes — the heart of the game. A real situation, the Feelings Crew
 * debating it, and the child making the ethical decision. The DECISION is the
 * gameplay; the emotions provide the debate around it.
 *
 * Every option is honoured — the "best" choice earns the most points and a
 * celebration, but a gentler option is never shamed. There is no "wrong" that
 * scolds; there is only "let's think again together".
 */

export interface Reaction { who: string; line: string; }
export interface Choice { emoji: string; label: string; points: number; best?: boolean; response: string; }
export interface Scenario {
  id: string;
  behaviour: string;   // maps to BEHAVIOURS id
  world: string;
  title: string;
  setup: string;
  reactions: Reaction[];
  choices: Choice[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'truth-broke', behaviour: 'truth', world: 'Truth & Trust HQ',
    title: 'Uh oh…',
    setup: 'You were playing and accidentally knocked over a vase. It broke. Nobody saw. What do you do?',
    reactions: [
      { who: 'fizz', line: 'But what if they get upset?! 😰' },
      { who: 'ember', line: "It's not fair that it broke!" },
      { who: 'willow', line: 'Telling the truth might help us feel better…' },
      { who: 'sunny', line: "Let's be brave and do the right thing together!" },
    ],
    choices: [
      { emoji: '🫣', label: 'Hide it', points: 5, response: 'Hiding it makes the worry bigger. Willow gives your hand a gentle squeeze — want to try again?' },
      { emoji: '🙅', label: 'Blame someone else', points: 5, response: "Ember stops: 'That wouldn't be fair to them.' Let's think once more." },
      { emoji: '💬', label: 'Tell the truth', points: 15, best: true, response: "Sunny beams: 'THAT took real courage!' Telling the truth felt heavy for a second — then light." },
    ],
  },
  {
    id: 'kind-alone', behaviour: 'kind', world: 'Kindness Garden',
    title: 'Someone is alone',
    setup: 'At break, you see a kid sitting by themselves, watching everyone else play.',
    reactions: [
      { who: 'coco', line: 'Oooh, but what if it feels awkward? 😳' },
      { who: 'sunny', line: 'One kind hello can change a whole day!' },
      { who: 'willow', line: 'They might be feeling lonely.' },
    ],
    choices: [
      { emoji: '🚶', label: 'Walk past', points: 5, response: 'Coco whispers, "It only takes one small step." Want to try again?' },
      { emoji: '👋', label: 'Say hi and smile', points: 10, response: 'A warm hello! Sunny does a little spin. 💛' },
      { emoji: '🤝', label: 'Invite them to play', points: 15, best: true, response: 'You made someone feel welcome. The whole Garden lights up! 🌸' },
    ],
  },
  {
    id: 'anger-unfair', behaviour: 'choices', world: 'Good Choices Room',
    title: "That's not fair!",
    setup: 'Your friend took the toy you were using without asking. You feel it — hot and fast.',
    reactions: [
      { who: 'ember', line: "GRRR! That's NOT fair!! 😤" },
      { who: 'pip', line: "Let's stop and think before we react." },
      { who: 'sunny', line: 'A calm voice is a strong voice.' },
    ],
    choices: [
      { emoji: '🔥', label: 'Yell at them', points: 5, response: "Ember gets it — but yelling makes it bigger. Pip says, 'Breathe with me.' Try again?" },
      { emoji: '💬', label: 'Talk calmly', points: 15, best: true, response: '"Hey, I was using that — can I have it back?" Ember high-fives you: strong AND calm. 💪' },
      { emoji: '🙋', label: 'Ask a grown-up for help', points: 12, best: true, response: 'Asking for help is brave and smart. Well done! 🤝' },
    ],
  },
  {
    id: 'fear-safe', behaviour: 'choices', world: 'Good Choices Room',
    title: 'Is this safe?',
    setup: 'Some kids dare you to climb the tall fence to get a ball. It looks pretty high.',
    reactions: [
      { who: 'pip', line: 'Whoa — is this a safe idea? 😬' },
      { who: 'fizz', line: 'What if someone gets hurt?' },
      { who: 'sunny', line: 'Being safe is a great choice too.' },
    ],
    choices: [
      { emoji: '🧗', label: 'Climb it anyway', points: 5, response: 'Pip catches your sleeve: "Let\'s find a safer way." Try again?' },
      { emoji: '🙋', label: 'Ask an adult for help', points: 15, best: true, response: 'Smart and safe! Pip breathes a happy sigh. 💜' },
      { emoji: '🚪', label: 'Choose a safer plan', points: 12, best: true, response: 'You found a safer way. That takes real wisdom. 🛡️' },
    ],
  },
  {
    id: 'envy-gratitude', behaviour: 'include', world: 'Friendship World',
    title: 'They got something cool',
    setup: 'Your friend got a shiny new backpack. You look down at your old one.',
    reactions: [
      { who: 'ash', line: 'They got something really cool… 😑' },
      { who: 'sunny', line: 'What good things do WE already have?' },
      { who: 'willow', line: "It's okay to notice that feeling." },
    ],
    choices: [
      { emoji: '😠', label: 'I wish I had theirs', points: 5, response: "Ash nods — that feeling is normal. But it can weigh us down. Let's look again." },
      { emoji: '⭐', label: "I'm grateful for what I have", points: 12, best: true, response: 'You found something to be thankful for. Lighter already! 🌟' },
      { emoji: '🎯', label: "I'll work toward my own goal", points: 15, best: true, response: 'Turning the feeling into a goal — that\'s powerful. Go you! 🚀' },
    ],
  },
  {
    id: 'body-hygiene', behaviour: 'body', world: 'Body & Wellness Zone',
    title: 'Snack time!',
    setup: "You just came in from playing outside and you're about to grab a snack.",
    reactions: [
      { who: 'sage', line: 'EWWW — those hands are DIRTY! 😖' },
      { who: 'sunny', line: 'Taking care of your body feels good!' },
    ],
    choices: [
      { emoji: '🍪', label: 'Just eat now', points: 5, response: 'Sage makes a dramatic face. "Germs! Let\'s wash first." Try again?' },
      { emoji: '🧼', label: 'Wash my hands first', points: 12, best: true, response: 'Sparkly clean! Sage gives an approving nod. 💚' },
      { emoji: '🍎', label: 'Wash up AND pick something healthy', points: 15, best: true, response: 'Clean hands and a healthy snack — Sage is genuinely impressed. 🍎' },
    ],
  },
  {
    id: 'help-home', behaviour: 'help', world: 'Helping Hands Station',
    title: 'A helping chance',
    setup: 'You see a grown-up at home carrying a big pile of laundry, struggling a little.',
    reactions: [
      { who: 'lull', line: 'Ughhh… do we HAVE to get up? 😴' },
      { who: 'sunny', line: 'One small help can make someone\'s whole day!' },
    ],
    choices: [
      { emoji: '📺', label: 'Keep watching TV', points: 5, response: 'Lull gets it — comfy is comfy. But Sunny knows you\'ve got this. Try again?' },
      { emoji: '🤝', label: 'Offer to help carry', points: 15, best: true, response: 'You helped without being asked! Lull even got up — miracle! 🎉' },
    ],
  },
  {
    id: 'mind-worry', behaviour: 'mindheart', world: 'Reflection Room',
    title: 'Tomorrow feels big',
    setup: "You have a presentation tomorrow and your tummy feels fluttery just thinking about it.",
    reactions: [
      { who: 'fizz', line: 'What if it all goes wrong?! 😰' },
      { who: 'sunny', line: "Let's focus on what we CAN do today." },
    ],
    choices: [
      { emoji: '😩', label: 'Worry about it all night', points: 5, response: 'Fizz means well, but worry loops get bigger. Let\'s make a plan instead.' },
      { emoji: '📝', label: 'Make a little plan', points: 12, best: true, response: 'One small step at a time — Fizz feels calmer already. 🧡' },
      { emoji: '🌬️', label: 'Take three slow breaths', points: 15, best: true, response: 'In… and out. The flutter softens. You\'ve got this. ⭐' },
    ],
  },
];

/** Today's featured scenario — deterministic by day so it feels fresh daily. */
export function scenarioForDay(dateKey: string): Scenario {
  const seed = [...dateKey].reduce((a, c) => a + c.charCodeAt(0), 0);
  return SCENARIOS[seed % SCENARIOS.length];
}

export function scenariosForBehaviour(behaviour: string): Scenario[] {
  return SCENARIOS.filter((s) => s.behaviour === behaviour);
}
