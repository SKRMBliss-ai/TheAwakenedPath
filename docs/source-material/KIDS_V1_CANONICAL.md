# Mind Gym for Kids — the canonical direction

**Status:** current. Supersedes the interaction model described for
`/mindgymforkidsv1` in earlier drafts of PRODUCT_VISION.md and
MIND_GYM_MASTER_PLAN.md. The principles in those documents still hold; what
changed is the shape of the thing a child actually opens.

---

## What went wrong, stated plainly

Two things were built, and each was half right.

**My Best Every Day** had the engine that works. Seven ethical virtues, a
daily tick against each, points that accumulate per virtue, a streak, badges,
rewards — all of it on-device, all of it already earning. A child could use it
in twenty seconds a day and it asked nothing they couldn't answer. Its problem
was that it looked like a checklist, because it was one.

**Kids Gym v1** had the world that works. Painted rooms, Chirpy as a
companion, sixty-seven games, and a genuinely good five-step reflection
sequence: feeling → body → thought → what happened → another story. It was
visually the strongest thing in the product. Its problem was that it opened
with the reflection. A child arriving with nothing much wrong was walked
through a long piece of emotional work before anything had given them a
reason to care, and it read as complicated because it *was* complicated for
the moment it was asking about.

The fix is not to pick one. It is to put the second inside the first.

---

## The shape now

**Every virtue is a room.** The seven behaviours from My Best Every Day
already carried area names — Kindness Garden, Truth Lab, Courage Castle,
Friendship Park, Healthy Body Zone, Helping Hands Village, Reflection
Observatory. Those areas are now real places. The daily question for a virtue
is asked *inside the room that virtue belongs to*, next to the games that
teach it and the one small thing there is to learn about it.

**The tick is the product.** One tap, inside a room, recording how today
actually went. Everything else in the building exists to make a child want to
come and do that.

**The five steps are offered, once, and never demanded.** One situation a
day, when something is genuinely still bothering them. It sits at the bottom
of a room as an invitation with an honest label — *"something happened today
you're still thinking about?"* — and a child who taps nothing has still used
the app correctly.

**Nothing resets.** The store is My Best Every Day's existing one, untouched.
Every point, tick, streak and badge a child has already earned still counts.
There is no migration and no "start again", because asking a child to throw
away their streak to get a nicer interface is not a trade they would take.

---

## What a child does, in order

1. Opens it. Seven rooms, each showing the points they have already earned
   there. No question has been asked yet.
2. Goes into a room. Ticks whether they managed that virtue today. **This is
   the entire product** and it takes one tap.
3. Optionally plays a game in that room, or opens the one small thing there
   is to learn.
4. Optionally — at most once a day — takes one real situation through the five
   steps with Chirpy.

Step 2 is why it works. Steps 3 and 4 are why they come back.

---

## Recording a failure has to be free

A child can untick. There is no confirmation, no "are you sure", no sad face,
no animation that registers disappointment.

This is not politeness. The aim of this product is for a child to notice the
patterns that run them, and a child cannot notice a pattern they are being
quietly punished for recording. The moment "not today" costs more than "yes",
the number stops describing the child and starts describing what the child
thinks the app wants. Then the whole thing is measuring its own approval.

So: ticking and unticking cost exactly the same. Always.

---

## The games

Two sources, one shelf.

**The existing library** — sixty-seven games across six engines — is wired to
rooms by theme, so a virtue room draws on work that already exists rather than
starting empty.

**Room-native games** are written for the specific awkwardness of a specific
virtue. They follow three rules:

1. **Nobody loses.** There is no fail state anywhere. A game a child can lose
   at teaches them that virtue is a test they might fail, which is the exact
   belief this product exists to dismantle.
2. **The answer is never obvious.** If a child can pick correctly without
   thinking, they learned nothing. Every option is defensible; the teaching
   lives in the near-misses.
3. **The reveal teaches, not the score.** What a child reads after choosing
   is the lesson, and it is written to be interesting rather than approving.
   "Here's what actually happens" beats "well done".

Worked example, from the Kindness Garden — *Nobody Saw*: a coat has fallen off
a peg, you're the last one out, nobody will ever know. Pick it up and the
reveal is deliberately anticlimactic: nothing happens, nobody thanks you, the
owner never learns it was on the floor. The afterword is the point — *the
kindness nobody sees is the only kind that tells you anything about yourself.*

---

## Rooms that are not virtues

**Pause Room** — no tick, no points, no counter, reachable from everywhere at
all times. A child having a hard moment needs somewhere that isn't asking
them for anything. Visibly not one of the seven, on purpose.

**Reflection Observatory** — carries the My Best Every Day reflection
content: look back, what made me proud, the month chart.

**Friendship** and **Rewards** live in the bottom bar rather than on the map,
because they aren't things you practise. They're things you go and look at.

---

## Chirpy

Unchanged from the emotional-state system already documented in
`src/features/practise/kids-v1/chirpy/README.md`. He is a companion who is
also working things out, never an authority. He wonders; he does not conclude.
He is not the answer, and the child is always the one who decides.

---

## What this deliberately does not do

- It does not ask a child to name an emotion before they've been given a
  reason to.
- It does not open with reflection.
- It does not score, rank, or compare a child against anyone.
- It does not treat a missed day as a failure, in copy or in animation.
- It does not send anything anywhere. All of it is on-device.

---

## Still open

- Room artwork for the virtue rooms. Currently gradients; the painted-room
  treatment from Kids Gym v1 is the target.
- Room-native games exist for five of the seven rooms. Truth Lab and
  Reflection Observatory draw on the library only.
- The remaining beats of the continuous-journey spec (thought, observation,
  story, reframing) are still screen-based inside the five-step sequence.
