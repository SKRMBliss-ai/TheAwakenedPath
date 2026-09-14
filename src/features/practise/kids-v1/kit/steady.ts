/**
 * §18 — THE MOVES THAT WORK IN THE MOMENT.
 *
 * The last section of the founder's teaching-moves document, and the only one
 * that governs a child's worst evenings rather than their ordinary ones:
 *
 *   "When a child arrives already upset, none of the above applies. No
 *    experiments, no images, nothing clever. Short sentences and low demands.
 *    […] Teaching requires a settled child. An upset child needs company, not
 *    curriculum. Every clever idea in this document is switched off when the
 *    check-in comes back high-intensity and unpleasant — the app gets quieter
 *    and simpler, not smarter."
 *
 * THE APP HAD THE FIRST HALF OF THAT AND NOT THE SECOND. The quiet state was
 * built entirely by subtraction: no teaching moves, no secret games, no motes,
 * no motion, no Chirpy. All correct, all necessary — and all of it removal. So
 * a child who said the feeling was REALLY big got an app that went silent and
 * carried on asking them questions.
 *
 * That is not what §18 asks for. It lists five things to SAY. "Company, not
 * curriculum" means somebody is still there; an empty room is not company, it
 * is just an empty room. The absence of curriculum was implemented and the
 * presence of company was not.
 *
 * IT IS NOT CHIRPY WHO SAYS THEM, and that rule does not bend — see ui/scene,
 * where his absence in the quiet state is called the one non-negotiable thing
 * about him. He is a character: he wonders, he gets things wrong, he is funny.
 * A child who has just said the feeling is really big does not need a cartoon
 * bird, and the document knows it, which is why none of these five lines is in
 * his voice. They have no voice at all. They are short, flat, unhurried
 * sentences with nobody performing them, and that is exactly the right
 * register for the moment — the equivalent of an adult sitting down next to a
 * child and not saying very much.
 *
 * SO THERE IS NO SPRITE, NO BUBBLE, NO ANIMATION. See ui/Steady, which is
 * deliberately the plainest component in the app.
 */

/** The steps of the check-in that a distressed child is walked through. */
export type SteadyMoment =
  /** Straight after they said it was really big. */
  | 'size'
  /** Where is it. */
  | 'body'
  /** What the thought said. */
  | 'thought'
  /** What happened. */
  | 'situation'
  /** The end of the walk. */
  | 'close';

/**
 * What is said, and when.
 *
 * ONE LINE PER STEP, and several steps get none. The document's instruction is
 * "short sentences and low demands", and a sentence on every screen is a
 * presence that will not stop talking — which is its own kind of demand. The
 * gaps are load-bearing.
 *
 * EVERY ONE OF THESE IS FROM §18 VERBATIM or as close as the surrounding
 * screen allows. They were written carefully and they are not ours to improve:
 * "That sounds like a lot" is doing something precise — acknowledging the size
 * of the thing without naming it, asking nothing, and not promising it will
 * pass, which §7's safety note explicitly forbids at this moment.
 */
export const STEADY: Record<SteadyMoment, string | null> = {
  size: 'That sounds like a lot.',
  body: 'You don’t have to explain it. Just point.',
  /* Nothing here on purpose. The thought step is the hardest question in the
     walk, and a distressed child working out what their mind said does not
     need a second voice in the room while they do it. */
  thought: null,
  situation: 'Okay. Stay there a second. I’m not going anywhere.',
  close: null,
};

/**
 * The fifth line, which is an OFFER rather than something said.
 *
 * "Is this one for a grown-up?" is on the document's list with the other four,
 * but it is not the same kind of thing — it asks the child to decide
 * something, and where it appears matters. It goes at the END of the quiet
 * walk rather than during it: offered in the middle it reads as "this is too
 * much for me, go away", which is the precise opposite of the sentence above
 * it promising not to go anywhere.
 *
 * The way to a grown-up is on every screen in the app regardless (§2.10) and
 * always has been. This is the app naming it out loud, once, at the moment a
 * child has just finished telling it something big — which is the moment they
 * are most likely to need it and least likely to go looking.
 */
export const STEADY_GROWNUP = 'Is this one for a grown-up?';
