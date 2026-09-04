# Mind Gym — Master Plan

**One app. One path. One document.**

> **Note on the kids build (current).** The interaction model for
> `/mindgymforkidsv1` described below — the check-in as the front door, the
> rooms grid as the second screen — has been superseded. That shape tested as
> too much to ask of a child before anything had given them a reason to care.
> What ships now puts My Best Every Day's daily virtue tick first, inside
> rooms, with the five-step reflection offered once a day rather than required
> up front. See **`docs/source-material/KIDS_V1_CANONICAL.md`** for the
> current direction. The principles in this document — the quiet state, the
> teaching moves, Chirpy as companion rather than authority, nothing leaving
> the device — all still hold and are still enforced in the code.

**Owner:** Sim
**Last updated:** 2 September 2026
**Status:** Consolidated build plan — supersedes the earlier ten-phase structure
**Ages:** 3–14, delivered as two reading levels of the same path

---

## Contents

1. [What Mind Gym is](#1-what-mind-gym-is)
2. [Research foundation](#2-research-foundation)
3. [Setup — name, age, grown-ups](#3-setup--name-age-grown-ups)
4. [The front door and the router](#4-the-front-door-and-the-router)
5. [The path — seven questions](#5-the-path--seven-questions)
6. [The rooms](#6-the-rooms)
7. [The game library — 53 games](#7-the-game-library--53-games)
8. [User journeys](#8-user-journeys)
9. [Complete screen inventory](#9-complete-screen-inventory)
10. [Game engines — six patterns cover everything](#10-game-engines--six-patterns-cover-everything)
11. [Data model](#11-data-model)
12. [Safety rules](#12-safety-rules)
13. [Visual style](#13-visual-style)
14. [Open decisions](#14-open-decisions)
15. [Build order](#15-build-order)

---

## 1. What Mind Gym is

A child opens the app, says how they feel, and is walked through seven questions that end somewhere different from where they started. Along the way they find the feeling in their body, catch the thought attached to it, say what actually happened, and see — often for the first time — that the story their mind wrote about it is a *story*, not the event.

That's the product. Everything else is practice for it.

**The one-line version:** *Mind Gym helps a child notice the difference between what happened and what their mind made of it.*

### What changed from the earlier plan

The original design had ten sequential phases, roughly 74 screens, and a research-then-spec cycle per phase. It was accurate but unbuildable in one go, and hard to hold in your head. This document collapses it:

| Was | Now |
|-----|-----|
| Ten phases built in sequence | One path, built once |
| Rooms grid as the home screen | Check-in as the front door; rooms are the practice area |
| Separate curricula per age band | One path, two reading levels |
| Games as phase content | Games as drills for individual path steps |
| ~74 screens | ~19 screens + 6 game engines |

Nothing is lost. The phase research still exists in the Feelings and Body Detective master specs, and the games from every phase survive in the library (§7).

### The core metaphor

**The path is the workout. The rooms are the machines.** That's what makes the name literal — and it's the organising idea for the whole build.

---

## 2. Research foundation

Six findings shape the design. Each one closes off a design option that would otherwise look reasonable.

**Naming a feeling reduces its grip.** Putting an emotion into words dampens amygdala activity and engages more deliberate, verbal parts of the brain — the mechanism behind "name it to tame it" (Lieberman et al., 2007). *So:* naming is the core skill, not a warm-up. The front door asks for a feeling before anything else.

**Children acquire emotion words in a fixed order.** Happy, sad and angry come first; surprise, fear and disgust later. Before the categories separate, children lump feelings by pleasant/unpleasant (Widen & Russell, 2008). *So:* the younger band opens with four to six big faces, not a vocabulary list.

**Emotional granularity dips in adolescence.** The ability to tell your own emotions apart falls from childhood, bottoms out around 15–16, then recovers. Teenagers begin feeling several things at once without the language to separate them (Nook et al., 2018). *So:* the older band must teach blends — two feelings held at once — not just more words.

**Interoception underpins self-regulation.** Sensing internal signals (heartbeat, gut, breath, muscle tension) is foundational to regulating anything; a child who can't detect what's happening inside has little to work with. *So:* the body question sits at step 2, immediately after naming.

**Emotions have real body maps — but only probabilistic ones.** Across cultures people report consistent topographies: anger and fear in the upper limbs, sadness as heaviness, disgust in the gut, happiness everywhere. A classifier distinguishes emotions from these maps at ~72% (Nummenmaa et al., 2014). Well above chance, nowhere near a law. *So:* body-clue guesses can be affirmed honestly — and every piece of copy says **"might"**, never "always." That's accuracy, not just gentleness.

**CASEL and executive function give the standards frame.** Identifying one's emotions sits at the heart of CASEL's self-awareness competency; pausing before acting is inhibitory control in the executive-function literature (Harvard Center on the Developing Child). *So:* there's a credible frame for parents and schools without inventing our own vocabulary.

---

## 3. Setup — name, age, grown-ups

**Adult-led, once, before the child's first session.** Age determines which reading level the path uses, so it must be settled first. A five-year-old can't reliably self-report an age, and collecting a child's data needs a grown-up in the loop anyway.

| ID | Screen | Who | What happens |
|----|--------|-----|--------------|
| SET-01 | Who's this for? | Grown-up | First name or nickname, and age. Nothing else. |
| SET-02 | Trusted grown-ups | Grown-up | One or more contacts. Set up *with* the child if possible, so they recognise the names. |
| SET-03 | What's kept | Grown-up | Plain-language storage and visibility choices. |
| SET-04 | "Pass it to Ada" | Handover | Clear boundary between the adult's part and the child's. |
| SET-05 | Welcome, Ada | Child | Two screens: what this is, nothing is scored, nobody sees it unless you choose. Skippable. |
| SET-06 | Meet your creature (3–8 only) | Child | The shoulder creature introduces itself and the child names it. That name is what P-03 asks about from then on — "what did [name] say?" See `MIND_GYM_UI_DESIGN.md` §5.2. |

**Collected:** first name or nickname · age.
**Never collected:** surname · date of birth · photo · school · location.

**Age progression.** Children get older. When a child crosses from the younger setting into the older one, the app notices and offers the switch **to the adult**, not silently. A nine-year-old still being asked five-year-old questions will quit; the reverse is worse.

**Siblings.** Multiple children can share a device. Each gets their own name, age setting and journal, and cannot see the others'.

---

## 4. The front door and the router

**The app opens on the check-in. Always. Never a menu.**

A child who is upset should be met with "how are you feeling?", not asked to browse a grid. But most days a child is basically fine — and if the app only offers the path, it becomes a thing you open on bad days, and the daily habit dies.

So the first question routes:

```
                  "How are you feeling right now?"
                              │
              ┌───────────────┴───────────────┐
              │                               │
      Something's up                     All fine today
   (unpleasant / strong)              (neutral / pleasant)
              │                               │
              ▼                               ▼
   Straight down the path            "Want to practise something?"
        (steps 2–8)                            │
                                               ▼
                                          The rooms
```

Either way the child has **already named a feeling** before any branching — which is the single most valuable thing the app does, and it happens in the first ten seconds.

**Escape hatches, available at every step:**
- "Talk to a grown-up" — one tap, from anywhere
- "I'd rather stop" — exits without penalty, saves what was captured
- "I don't know" — continues the path, never blocks

---

## 5. The path — seven questions

Same seven steps for every child. The younger band gets simpler words, more tapping, less typing, and a concrete version of the hard idea. Older ~8 minutes, younger ~4 minutes.

### Step 1 — The front door · "How are you feeling right now?"

| | |
|---|---|
| **Sees (9–14)** | A calm scene, one question, a wide spread of feeling words — *left out, wound up, flat, embarrassed, jealous, fine-ish*. |
| **Does** | Picks one or more. Sets roughly how strong. |
| **Sees (3–8)** | Four to six **big faces** — happy, sad, angry, scared, worried, excited. |
| **Does** | One tap. No typing. New faces added slowly over time. |
| **Then** | → step 1b if the feeling is an unpleasant one, → step 2, or → the rooms (see §4) |
| **Saves** | `feelings[]`, `intensity` |

**Step 1b · "How big is it?" — ages 3–8, unpleasant feelings only.** The original plan gave the young band no intensity reading at all, which left the quiet state (§13.3) with nothing to trigger on. A five-point scale is wrong for a four-year-old, but *size* is concrete and they judge it easily: three blobs — small, medium, large — labelled **a bit · quite big · really big**. Followed by *"All three are fine. There's no better one."* **Really big** is what turns the quiet state on.

**Why it's first:** naming is the skill (§2). Everything downstream is easier once a feeling has a name.

---

### Step 2 — The body · "Where do you notice it?"

| | |
|---|---|
| **Sees (9–14)** | A simple body: chest, stomach, throat, shoulders, hands, head, legs, all over. |
| **Does** | Taps where it lives, and what it's like — tight, heavy, racing, hot, hollow. |
| **Sees (3–8)** | A friendly character's body with **four big tap areas**: tummy, heart, face, hands. |
| **Does** | Taps where. No sensation words. |
| **Then** | → step 3 |
| **Saves** | `bodyRegions[]`, `quality` (older), `intensity` (older) |

**Rule:** always "might", never "always." The same feeling sits in different places in different people, and in the same child on different days. **"I can't tell" is a big obvious button, not a small link** — low interoceptive awareness is common and must never read as failure.

---

### Step 3 — The thought · "What's your mind saying?"

| | |
|---|---|
| **Sees (9–14)** | An open box, plus starters for when words won't come — *"nobody…", "I always…", "they think…", "what if…"* |
| **Does** | Types it, or picks a starter and finishes it. |
| **Sees (3–8)** | A character with an empty **thought bubble** — a shape children know from cartoons. |
| **Does** | Picks from a handful of simple thoughts, or records a sentence aloud. No typing. |
| **Then** | → step 4 |
| **Saves** | `thought` (text or selected id, or audio ref) |

**Rule:** the thought is captured **raw and uncorrected.** Nothing here evaluates it, softens it, or tells the child it isn't true. That comes later, and gently.

---

### Step 4 — The situation · "What happened?"

| | |
|---|---|
| **Sees (9–14)** | "So — what's going on?" Open text, or voice. |
| **Does** | Describes it in their own words. Can skip. |
| **Sees (3–8)** | **Picture cards** of everyday moments — someone took my toy, I wasn't invited, I got told off, I lost the game. |
| **Does** | Taps one, or talks into the microphone. Nothing to write. |
| **Then** | → step 5 |
| **Saves** | `situation` (text, card id, or audio ref) — **the most sensitive field in the app** |

**Why fourth, not first:** opening with "what happened?" is an interview. Opening with "how do you feel?" is being met. By the time you ask for facts, the child is already in it — and the answer comes more honestly.

---

### Step 5 — The hinge · "Here's the story your mind made"

| | |
|---|---|
| **Sees (9–14)** | Their own four answers assembled into one short story, and named as a *story*, out loud. |
| **Does** | Reads it. Confirms, or edits until it's right. |
| **Sees (3–8)** | The same thing as a **narrated picture strip** — the moment, the face, the body, the thought bubble. Three or four panels, read aloud. Then: "That's the story your brain made about it." |
| **Then** | → step 6 |
| **Saves** | `story` (assembled + any edits) |

**Example (older):**
> "Nobody replied to your message. Your chest felt tight. Your mind said *they don't want me around*. So the story is: **they've decided they're done with me.**"

**This screen is the whole app.** It's the first time a child sees the difference between what happened and what their mind made of it. Everything before is gathering; everything after depends on this landing. If you build one screen beautifully, build this one.

---

### Step 6 — The turn

Two versions of the same idea, because the older framing is too abstract for young children.

#### 6a · Ages 9–14 — "Is this a fear story, or a love story?"

| Fear stories | Love stories |
|---|---|
| Your mind writing to protect you. Assumes the worst so nothing catches you off guard. | Another reading that fits the same facts. Not softer — just less certain about the worst. |
| *"They've decided they're done with me."* | *"Something's going on I don't know about yet."* |

**Rule:** a fear story is **never wrong, and the child is never wrong for having one.** Its job is protection — that's what minds are for, and the app says so out loud. Anything that reads as "you shouldn't think that" or "just choose love" breaks this screen, and the child will stop being honest back at step 3.

#### 6b · Ages 3–8 — the camera test · "Would a camera see it?"

The child sorts the pieces of their own story into two boxes:

| 📷 A camera would see this | 💭 Only my brain knows this |
|---|---|
| Things that really happened, out in the world. | The bits your brain added. Not lies — just not on the camera. |
| *"Sam took the red car."* | *"Sam doesn't like me any more."* |

**Why a camera:** it gives a four-year-old a test they can actually run. Not "is this true?" — too abstract, and it lands like an accusation — but "could you point a camera at it?" Concrete, checkable, and it never makes the child wrong.

**Rule:** "only my brain knows this" is **not the mistake box.** Both boxes are normal, and everyone's story has bits in both.

**Saves:** `lens` (fear|love) or `sorted[]` (camera|brain per fragment)

---

### Step 7 — The opening · "What else could be true?"

| | |
|---|---|
| **Sees (9–14)** | "Same facts. Different story." Two or three alternatives, plus space to write their own. |
| **Does** | Picks one that feels possible, or writes one. |
| **Sees (3–8)** | Two picture options read aloud, starting with **"maybe…"** — *"maybe Sam really wanted a turn"*, *"maybe Sam forgot it was yours"*. |
| **Does** | Taps one. |
| **Then** | → step 8 |
| **Saves** | `alternative` |

**Rule:** never "the correct story." The alternative isn't the truth and the first story isn't a lie. Both fit the facts; the child gets to notice they had a choice. **"None of these yet" / "I don't know" must stay available**, or the screen becomes coercion.

---

### Step 8 — The Reflection Room · "What did you notice?"

| | |
|---|---|
| **Sees (9–14)** | A calm space. "What did you notice?" Not *did you get it right*. |
| **Does** | Answers in a line, or taps something that fits. |
| **Sees (3–8)** | Three or four tappable pictures — *"my tummy felt funny", "my brain made a story", "I found another maybe", "I'm not sure"*. |
| **Does** | One tap. Earns a small keepsake for the journal. |
| **Then** | → done, or into the journal |
| **Saves** | `reflection`, closes the session record |

Nothing is scored, ever. The reflection belongs to the child — which is what makes the journal worth returning to.

---

## 6. The rooms

Reached from the router (§4) when nothing much is going on, or after a session ends. **Each room trains one step of the path.** They aren't competing content — they're the drills that make the path answerable.

| Room | Trains | Why it matters |
|------|--------|----------------|
| **Feelings Room** | Step 1 · naming | A child who plays here can answer the front door with more than "fine". |
| **Body Detective** | Step 2 · the body | Makes step 2 answerable instead of blank. |
| **Thought Room** | Step 3 · the thought | The hardest step to face cold. This is where it gets easier. |
| **Different Story** | Steps 5–7 · story & turn | Practised on someone else's story, so it's familiar when it's their own. |
| **Pause Room** | The gap before acting | Rescues the pause, which the single path otherwise loses (see below). |
| **Big Feelings Room** | All steps, one feeling at a time | Anger, jealousy, worry, sadness, embarrassment, frustration, disappointment. |
| **Reflection Room** | Step 8 · noticing | Also the journal of everything noticed so far. |
| **Together Games** | Played with a grown-up | The strongest predictor of this sticking is a parent who joins in. |

**On the Pause Room:** collapsing to one path lost the pause — the child now reflects *after* the fact rather than catching themselves in the moment. As a room it survives as its own practice, and can be reached in seconds mid-moment without walking the whole path. Worth knowing that trade was made.

**How a room picks a game:** rotate, don't randomise. Shuffle within the room, avoid the last two played, gently favour untried games. Show the game's name on entry so a child who loves one can ask for it again.

---

## 7. The game library — 61 games

> **Superseded by Game Library v2.** The tables below are the v1 set. The current library is 61 games — eight added, nine rewritten, one cut — and every game is now tagged by **how it teaches** (see §7.0). The live, filterable version is the Game Library artifact; `MIND_GYM_TEACHING_MOVES.md` holds the full scripts.

### 7.0 · How games teach — the three moves

Added after the teaching-moves work. Sorting the library by this exposed the main weakness of v1: many games drilled a skill where a discovery moment was available.

| Move | What it is | Example |
|------|-----------|---------|
| **Trapdoor** | An instruction designed to fail. The child steps onto what looks like solid floor, it gives way, and the falling is the lesson. | *"Try not to laugh."* |
| **Experiment** | Something the child does that proves the point by what happens. The child is the evidence. | *"Find an itch. Don't scratch it. Watch."* |
| **Borrowed image** | A thing already in the child's world with the right shape. Recognition, not new understanding. | *"A wobbly tooth, and your tongue."* |
| **Practice** | Straight repetition. Not bad — but a room full of it is a worksheet. | Matching, sorting drills |

**Rule:** never explain an inner experience to a child. Build a moment where they catch it happening.

### 7.0.1 · New in v2

| Game | Room | Move | What it does |
|------|------|------|--------------|
| **Quiet Inside** | Thought | Trapdoor | *"Go completely quiet in your head. Ten seconds."* Impossible on purpose — the only way anyone notices the inner voice is by trying to switch it off. Now the room's opener |
| **Try Not To Laugh** | Pause | Trapdoor | The suppression lesson. Every child has already failed at this in assembly |
| **Are You Hopping?** | Thought | Trapdoor | *"Think about hopping. …Are you hopping?"* Thought isn't action — and quietly removes shame about unkind thoughts |
| **The Guard Dog** | Thought | Image | *"Sometimes it's right. Mostly it's the postman."* Threat appraisal without calling a worry stupid |
| **Predictions** | Thought | Experiment | Write what your mind is certain will happen; the app asks later. The only cross-session game |
| **Say It Twice** | Thought | Experiment | *"I am cross" / "I notice I am cross."* The noticer, demonstrated in the child's own mouth |
| **The Blue Cup** | Feelings | Trapdoor | Feelings pass — proved from the child's own history |
| **Secret Feet** | Body | Experiment | Off-screen mission. A thread of attention in the body, all day. Secrecy is the hook |
| **The Sofa** | Reflection | Image | Scared at a film *and* knowing you're on the sofa. The noticer, for young children |
| **Warm Light** | Pause | Image | Guided relaxation, no metaphysics. Kept small |

**Rewritten:** Emotion Detective (adds what other children picked) · Feeling Mix (last day of a holiday) · Camera or Brain (point the camera at it) · Thought Parade (opens with the purple elephant) · Sticky or Floaty (wobbly tooth) · Fear Story / Love Story (opens with the smoke alarm) · Four Maybes, was The Maybe Machine (lands on *we don't know*) · The Itch, was Ride the Wave (a real itch, not a metaphor) · Anger: What's Underneath (the scared dog that barks).

**Cut:** The Ten Count — just counting, and Red Light Green Light trains impulse control better.

### 7.0.2 · The v1 tables

Age key: **S** = 3–8 · **B** = 9–14 · **A** = all ages. ★ = flagship for that room.

### Feelings Room — 8 games · trains step 1

| Game | Age | The idea | Teaches |
|------|-----|----------|---------|
| ★ Emotion Detective | A | A character in a situation. What might they be feeling? Tap any that fit. | Reading feelings in others; more than one answer is right |
| Feeling Match | A | Pair a situation card with the feelings it might bring up. | Situations cause feelings — but not the same ones for everyone |
| Feeling Mix | B | A moment that pulls two ways. Build the blend, set how loud each is. | **Two feelings can be true at once** — the key pre-teen skill |
| Volume Dial | A | One feeling, three strengths. Annoyed → cross → furious. | Feelings have degrees, and there's a word for each |
| Same Thing, Different People | A | Two characters, same event, different feelings. Both fine. | Feelings aren't automatic; people differ |
| Inside Weather | S | Pick today's weather inside you — sunny, drizzly, stormy, foggy. | A metaphor small children already own — and weather passes |
| The Feeling Changed | A | A story where a character's feeling shifts. Spot the turn. | **Feelings come and go**, even the big ones |
| Guess My Feeling | S | A face, a posture, a voice. Guess it — then make one. | Expressions carry feelings; you can read and send them |

### Body Detective — 7 games · trains step 2

| Game | Age | The idea | Teaches |
|------|-----|----------|---------|
| ★ Body Detective | A | Tap the places a character's body might be giving clues. | Feelings show up in the body, not only in thoughts |
| Clue Hunt | A | A guided sweep of your own body, one place at a time. | How to check in with yourself; "I can't tell" is a real answer |
| Clue → Feeling | A | Given tight fists and a hot face — what might be going on? | Reading the body backwards into a feeling |
| Jump & Notice | S | Jump ten times. Stop. What do you notice now? | **The easiest way to prove the inner sense works** — exercise makes sensation undeniable before it's used on emotions |
| Where Does It Live? | A | Drag a feeling onto your own body map. No wrong place. | Your personal map is yours; nobody else's is the standard |
| Two Bodies | A | Same feeling, two characters, clues in different places. Both right. | The "might" rule made visible |
| Or Is It Something Else? | B | Racing heart — nervous, or tired, hungry, ill, just ran? | Separating emotional signals from ordinary physical ones |

### Thought Room — 7 games · trains step 3

| Game | Age | The idea | Teaches |
|------|-----|----------|---------|
| ★ Camera or Brain? | A | Sort a story into two boxes: what a camera saw, what only your brain knows. | **Fact versus story — the core skill of the whole app** |
| Thought Bubbles | S | Thought bubbles float up over a character. Tap to catch one. | Thoughts are things you can notice |
| Thought Parade | A | Thoughts march past. Watch them go — don't catch any. | You can let a thought pass without following it |
| Loud Thought, Quiet Thought | B | One thought shouting, one whispering. Which is more likely true? | **Loudness isn't truth.** The most insistent thought is often the least reliable |
| Know or Guess? | B | "She's annoyed with me." Do you know that, or did your mind guess? | Certainty vs assumption — without calling the thought wrong |
| My Mind Says / I Say | B | Put "my mind says…" in front of the thought. Read it again. | You're the one noticing the thought. You're not the thought |
| Sticky or Floaty? | A | Some thoughts drift off. Some stick like glue. Sort today's. | Not all thoughts have the same grip |

### Different Story — 7 games · trains steps 5–7

| Game | Age | The idea | Teaches |
|------|-----|----------|---------|
| ★ Two Endings | A | Same beginning, two stories. Both fit what happened. | More than one story fits the same facts |
| The Maybe Machine | S | Feed in what happened; the machine prints "maybe…" cards. | Generating alternatives — the move step 7 asks for |
| Fear Story / Love Story | B | Which place did this come from? What would the other one say? | **Fear stories protect you — never a fault.** But not the only reading |
| Whose Story? | A | The same afternoon, told by two different characters. | Perspective; others are inside their own story |
| What Would You Tell a Friend? | B | Your friend has this exact thought about themselves. What do you say? | **Self-compassion by the back door** — children are far kinder to friends than to themselves |
| Rewrite the Ending | A | Take the story your mind wrote; write a different possible one. | You have some say in the story, even when you had none in the event |
| Detective vs Storyteller | B | Which parts are evidence, which did the storyteller add? | The grown-up version of Camera or Brain |

### Pause Room — 7 games · trains the gap before acting

| Game | Age | The idea | Teaches |
|------|-----|----------|---------|
| ★ Freeze Frame | A | A scene runs. A character is about to react. Everything stops. | There's a gap between what happens and what you do |
| Choose Your Move | A | Shout · walk away · ask · breathe · get help. Watch it play out. | Responses are choices, each leading somewhere different |
| Red Light, Green Light | S | Go on green, stop on red. It gets faster. | **Impulse control, trained directly** — the classic executive-function exercise |
| Ride the Wave | B | An urge rises like a wave. Watch it crest and fall without acting. | Urges peak and pass by themselves |
| Slow the Pop | S | A balloon inflates. Stop it before it bursts — as late as you dare. | Noticing the build-up, and stopping on purpose |
| Balloon Breath | A | Breathe with a shape that grows and shrinks. Follow it, or just watch. | One gentle way to make a pause physical |
| The Ten Count | A | Something annoying happens. Count to ten before answering. | Delay is a learnable skill |

### Big Feelings Room — 10 games · all steps, one feeling at a time

| Game | Age | The idea | Teaches |
|------|-----|----------|---------|
| ★ Anger: The Volcano | A | Pressure builds underneath. Spot the early rumbles before it blows. | **Anger has a run-up.** Catching it early is the whole trick |
| Anger: What's Underneath? | B | Lift the anger and look under it — hurt, fear, embarrassment. | **Anger often covers something softer.** Naming it changes what you do |
| Jealousy: Two True Things | B | Happy for your friend AND jealous. Hold both. | Jealousy doesn't make you a bad friend |
| Jealousy: The Comparing Machine | B | A machine compares you to someone — then shows what it left out. | Comparison shows a sliver and calls it the whole picture |
| Worry: The What-If Tree | B | One worry branches into ten. Find where the guessing started. | Worry multiplies by branching; every branch is a guess |
| Worry: Now or Not Now? | A | Is this happening now, or might it happen later? | Most worry lives in the future. Sorting it shrinks it |
| Sadness: Heavy Things | A | Sadness as weight. What makes it lighter to carry — not gone? | **Sadness isn't for fixing.** Company and time make it carryable |
| Embarrassment: The Spotlight | B | You're sure everyone saw. Replay what others actually noticed. | **The spotlight effect** — people are far more absorbed in themselves |
| Frustration: The Stuck Game | A | A puzzle that deliberately resists. Notice the stuck feeling arrive. | Frustration tolerance, practised live and in safety |
| Disappointment: The Gap | A | What you hoped for, and what happened. Look at the gap. | Naming the gap makes disappointment holdable |

### Reflection Room — 4 games · trains step 8

| Game | Age | The idea | Teaches |
|------|-----|----------|---------|
| ★ Discovery Cards | A | Tap what rings true about today. "I'm not sure" is one of the cards. | Reflection without right answers |
| Looking Back | B | An entry from weeks ago. How does it feel now? | **Direct proof that feelings change** — from the child's own history |
| My Pattern | B | Where feelings land in your body; which stories keep returning. | Self-knowledge, described and never prescribed |
| Time Capsule | A | Leave a note for yourself to open later. | You keep going, and things shift |

### Together Games — 3 games · played with a grown-up

| Game | Age | The idea | Teaches |
|------|-----|----------|---------|
| ★ The Feelings Board Game | A | Roll, move, land on a square, answer its prompt. Ten minutes at the table. | **Makes the vocabulary a family habit** rather than a solo app thing |
| Guess My Feeling (2 player) | S | Charades with faces and bodies. Grown-ups act too. | Expression reading — and a child seeing an adult name feelings aloud |
| Story Swap | A | You both tell the story of the same moment. Then compare. | Two people, one event, two honest stories. Neither is lying |

---

## 8. User journeys

The realistic paths, not every permutation. Exhaustive path enumeration is a QA test matrix, built later from these.

### J1 · First ever open · ~6 min
`SET-01 → SET-02 → SET-03 → SET-04 → SET-05 → P-01 → P-02 → … → P-08`
The adult sets up, hands over, and the child walks the full path once. **The only journey you get one shot at.** If a child bounces here, nothing else matters.

### J2 · The daily habit · ~30 sec
`P-01 → (all fine) → rooms grid → exit`
Open, name a feeling, leave. The journey that actually builds the skill, because it happens every day. **Optimise this above everything.**

### J3 · Something's up · ~8 min (older) / ~4 min (younger)
`P-01 → P-02 → P-03 → P-04 → P-05 → P-06 → P-07 → P-08`
The main event. The full path, end to end.

### J4 · Fine today, wants to play · ~5 min
`P-01 → (all fine) → rooms grid → a room → a game → SH-NAME → P-08`
The most common session by volume. Still ends on reflection, so the shape stays consistent.

### J5 · Practising one weak step · ~4 min
`P-01 → rooms grid → Thought Room → Camera or Brain? → SH-NAME → P-08`
A child who freezes at step 3 drills that step. This is what makes the rooms worth having.

### J6 · Big feeling, in the moment · ~5 min
`P-01 (angry) → Big Feelings Room → Anger: The Volcano → Pause Room → Balloon Breath → P-08`
**Deliberately skips the story steps.** An angry child needs body → pause → settle, fast. The full path can wait.

### J7 · Quick pause, mid-moment · ~40 sec
`P-01 → Pause Room → Balloon Breath → exit`
A child in a real moment shouldn't sit through a lesson to reach the calm bit.

### J8 · Playing with a parent · ~10 min
`rooms grid → Together Games → The Feelings Board Game → P-08 (together)`
Off-device for most of it. The strongest retention lever in the product.

### J9 · Browsing their own history · ~3 min
`rooms grid → Reflection Room → Looking Back / My Pattern`
Only meaningful after weeks of use. Don't ship it empty.

### J10 · Child gets upset mid-session · any time
`any screen → SUP-01 Trusted adult`
Reachable from every screen. Exits cleanly, no penalty, no "are you sure?".

### J11 · Something serious is disclosed · immediate
`P-04 (situation) → SUP-01 Trusted adult`
The app stops being an app. No advice, no reassurance, no assembly. **Safeguarding review required.**

### J12 · Child ages out of the band · once
`SUP-03 Settings → age prompt → band switch`
Offered to the adult, never silent.

---

## 9. Complete screen inventory

**19 screens plus 6 game engines.** That's the whole app.

### Setup — 5
| ID | Screen | Notes |
|----|--------|-------|
| SET-01 | Who's this for? | Name + age. Adult only |
| SET-02 | Trusted grown-ups | Powers SUP-01 |
| SET-03 | What's kept | Privacy choices |
| SET-04 | Handover | "Pass it to Ada" |
| SET-05 | Child welcome | Two screens, skippable |

### The path — 8
| ID | Screen | Notes |
|----|--------|-------|
| P-01 | Check-in / front door | **Also the router.** Highest-value screen in the app |
| P-02 | The body | Tappable body, "I can't tell" prominent |
| P-03 | The thought | Text or thought bubble by band |
| P-04 | The situation | **Most sensitive data in the app** |
| P-05 | The story | **The hinge.** Build this one beautifully |
| P-06 | The turn | Fear/love (B) or camera sort (S) |
| P-07 | Another story | "None of these yet" always available |
| P-08 | Reflection | Ends every session, path or game |

### Rooms & games — 2 shells
| ID | Screen | Notes |
|----|--------|-------|
| R-00 | Rooms grid | The existing built UI. Second screen, not first |
| R-01 | Room entry / game shell | One shell, parameterised per room and game |

### Support — 4
| ID | Screen | Notes |
|----|--------|-------|
| SUP-01 | Talk to a grown-up | **Always reachable. Safety-critical** |
| SUP-02 | My journal | Past sessions and discoveries |
| SUP-03 | Grown-up settings | Age-gated. Band switch lives here |
| SUP-04 | Add another child | Siblings on one device |

### Shared component
| ID | Component | Notes |
|----|-----------|-------|
| SH-NAME | Naming + affirmation | Ends every game before routing to P-08 |

---

## 10. Game engines — six patterns cover everything

53 games do **not** mean 53 builds. Six interaction engines cover the library; each game is content plus configuration.

| Engine | Pattern | Games it runs |
|--------|---------|---------------|
| **E1 · Choose** | A scene or prompt, plus 2–6 tappable options. Multi-select. Affirm any plausible pick. | Emotion Detective, Feeling Match, Clue → Feeling, Two Endings, Choose Your Move, Know or Guess?, Whose Story?, Worry: Now or Not Now?, Disappointment: The Gap … (~18 games) |
| **E2 · Body tap** | A character body with tappable regions and large hit areas. | Body Detective, Clue Hunt, Where Does It Live?, Two Bodies, Anger: The Volcano (~6) |
| **E3 · Sort** | Drag or tap fragments into two or three labelled boxes. | **Camera or Brain?**, Sticky or Floaty?, Detective vs Storyteller, Or Is It Something Else?, Fear Story / Love Story (~7) |
| **E4 · Dial** | A slider or stepped scale, with a label that changes as it moves. | Volume Dial, Feeling Mix, Loud Thought Quiet Thought, Sadness: Heavy Things (~5) |
| **E5 · Timed** | Something moves, grows or passes; the child acts (or deliberately doesn't) in time. | Red Light Green Light, Slow the Pop, Balloon Breath, Ride the Wave, The Ten Count, Jump & Notice, Thought Parade, Frustration: The Stuck Game (~9) |
| **E6 · Story playback** | A short sequence plays, pauses for input, and replays with the child's change. | Freeze Frame, The Feeling Changed, Rewrite the Ending, Embarrassment: The Spotlight, Jealousy: The Comparing Machine, Worry: The What-If Tree, The Maybe Machine (~8) |

**Build implication:** ship E1 and E3 first — between them they run about 25 games, including Camera or Brain, which is the most important game in the library.

---

## 11. Data model

```
child:      { id, name, age, band, createdAt }
trustedAdults: [ { name, contactMethod } ]

session:    {
  id, childId, startedAt, completedAt, type: "path" | "game",
  feelings:    [ { id, intensity? } ],
  bodyRegions: [ { region, quality?, intensity? } ],
  thought:     text | selectedId | audioRef,
  situation:   text | cardId | audioRef,      // most sensitive field
  story:       text,
  lens:        "fear" | "love" | null,
  sorted:      [ { fragment, box: "camera" | "brain" } ],
  alternative: text | selectedId,
  reflection:  text | selectedId,
  gameId:      string | null
}

journal:    derived from completed sessions
patterns:   derived — never stored as judgements
```

**Rules:**
- No score, no correctness flag, anywhere in the model.
- `situation` is free text about a child's real life. Treat it as the most protected field in the system.
- "I don't know" is a stored value, not a null — it's a real answer and the pattern view should be able to show it.
- Derived patterns are computed for display, never written back as a label on the child.

---

## 12. Safety rules

Binding on every screen, every game, every line of copy.

1. **Nothing is ever scored.** No right answers, no correctness state on how a child feels or what their mind said. A game may have a puzzle with real answers — Camera or Brain does — but never a *feeling* with a wrong answer.
2. **A fear story is not a fault.** The mind wrote it to protect. Never "you shouldn't think that", never "just choose love."
3. **"Only my brain knows this" is not the mistake box.** Both boxes are normal. Everyone's story has bits in both.
4. **"Might", never "always."** Especially for the body — no feeling reliably lives in one place, in one person, on every day.
5. **Every step is skippable.** "I don't know" continues the path. A child who must answer will start making things up.
6. **The grown-up path exits the experience.** If what a child describes is serious, the app stops being an app. No advice, no reassurance, no assembly. Reachable from every screen.
7. **No diagnosis, no promises.** Nothing labels a child, and nothing claims this will make hard feelings go away.
8. **No appearance, weight, eating or exercise content.** The body is discussed only as internal sensation.
9. **No camera, no photos, no biometrics.** Self-reported taps and text only.
10. **Real physical symptoms route to an adult.** Persistent pain, breathing trouble, faintness — straight out of the game frame, no diagnosis.

A one-page version of these belongs in the content style guide, checked against every asset before ship. The "might/always" rule is worth automating as a text scan.

---

## 13. Visual style

Cinematic Pixar-style illustration, from the team's reference screenshots. Original art in that family — never studio characters or branded assets.

- **Full-bleed illustrated scenes.** The artwork *is* the background, edge to edge. UI floats on top.
- **Painterly semi-realistic 3D rendering.** Soft studio lighting, warm rim light, shallow depth of field, rich colour grading. Animated-film key art, not flat vector.
- **Moody atmospheric palettes.** Deep blues, warm amber lamp-light, night skies, glowing particles. Lighting does emotional work.
- **Minimal chrome.** Small circular back button top-left. Title and one-line subtitle in clean white sans-serif. One solid rounded pill CTA.
- **Choices as translucent pill buttons** stacked vertically over the art — not grids of tiles.
- **Rooms as poster cards** — tall illustrated scenes with a title and one-line caption, on a dark canvas.
- **Per-scene colour mood**, not one fixed brand palette. The through-line is the rendering style and the UI chrome.

**Full spec:** `MIND_GYM_UI_DESIGN.md` — design thesis, chrome tokens, type scale, per-screen art briefs, character system, the six game-engine layouts, motion, sound and accessibility.

### 13.1 · The design thesis

> **Build a place a child would tell the truth in.**

The reference art establishes a *place*, not just a look — warm lamplight inside deep darkness, a character caught mid-thought. That register matters more here than in almost any app, because of what we ask: say how you actually feel, then look at the story your own mind wrote. Children don't do that on a bright white screen with a progress bar. They do it in a den, under a duvet with a torch, in the back of a car at night. Where a visual choice and that instruction disagree, the instruction wins.

### 13.2 · Three rules that come from child psychology, not taste

- **Look where the child is looking, not at them.** A character facing the viewer reads as *being watched* — fine for an invitation, wrong for disclosure. On every screen where a child reports their own inner state, the character looks out at the scene, not out of the screen. Children talk more easily side by side than face to face.
- **Dark is private, never ominous.** Every dark scene must contain a visible warm light source. A lamp, a fire, a glowing jar. Without one, a den becomes a basement.
- **Nothing is ever marked correct.** No ticks, stars, confetti, scores or streaks. Affirmation is warmth, light and attention — the scene brightening, the character turning toward them. The moment a child can win, they start optimising their emotional self-report, which is worse than no data at all.

### 13.3 · The adaptive state — **a build requirement, not a polish item**

When the check-in returns an unpleasant feeling at high intensity, the interface enters a **quiet state** for the session. Silently — never announced.

Ambient motion stops. Choices drop to three. Touch targets grow to 64px (fine motor control degrades under stress). Copy shortens to under 20 words a screen. **All teaching moves switch off** — no trapdoors, no games, no cleverness. The shoulder creature disappears. The grown-up exit enlarges and moves to the bottom of every screen. After the body question, the app offers a real exit: *"We can carry on, or stop here. Both are completely fine."*

An interface that stays bright and clever at a distressed child communicates that it hasn't noticed, and children read that instantly. **Build this alongside the first screen, not later** — retrofitting an adaptive interface is far harder than designing one.

**Open:** dense utility screens (settings, journal, patterns) need either a toned-down illustrated treatment or a simpler solid panel for legibility. Not yet decided.

---

## 14. Open decisions

**Blocking the build:**

1. **Privacy stance.** The app holds a child's name, age, feelings, body sensations, thoughts, and a free-text account of real events. One consolidated decision needed on what's stored, retention, and parental visibility. **Nothing ships until this is settled.**
2. **Safeguarding escalation.** What triggers SUP-01 automatically, what it says, who it contacts, what gets logged. Needs legal and safeguarding input.

**Needed before art production:**

3. **Character system.** Full-body, region-legible characters in multiple states, in the cinematic style, now including the shoulder creature (see decision 9). The long pole on the art side.
4. **Utility screen treatment.** See §13.

**Decided, recorded here so they don't get relitigated:**

5. The check-in is the front door, not the rooms grid.
6. The pause lives in a room, not on the path.
7. Ages 3–8 get the camera test, not fear/love.
8. Setup is adult-led, and collects name and age only.
9. **The inner voice gets a body — for ages 3–8 only.** A shoulder creature that chatters, is often wrong, and is never punished, gives step 3 ("what's your mind saying?") a concrete handle a four-year-old can actually use, and does the real teaching work of separating the voice from the child noticing it. The child names it at setup (SET-06). It's absent from the trusted-adult flow and from the quiet state, and it phases out for the 9–14 resource, which gets the abstract "thoughts aren't facts" framing directly. Full reasoning and build notes in `MIND_GYM_UI_DESIGN.md` §5.2.

---

## 15. Build order

**Stage 0 — the chrome system** ✅ *built*
Scrim, pills, CTA, back, grown-up exit, type scale. Sits on every screen, testable against placeholder art immediately. **Build the quiet state (§13.3) here, at the same time** — it pivots the whole system and cannot be added later cheaply.

**Stage 1 — the spine (validates everything)** ✅ *built*
`P-01 check-in → P-08 reflection → SUP-01 trusted adult`
Three screens. Put it in front of children. If naming a feeling daily doesn't hold their interest, nothing downstream saves it.

**Stage 2 — the path** ✅ *built (3–8 band)*
Add P-02 through P-07. Now the full journey works. **Build P-05 (the hinge) with the most care of anything in the app.**

> **Prototype, September 2026.** Stages 0–2 exist as a running web prototype for ages 3–8, plus a compressed setup flow (SET-01, 06 and the handover), the pleasant-feeling branch, and the adult panel. Chirpy's sprites are real; every other piece of art is placeholder, and narration is browser speech standing in for a recorded voice. Two things changed in the building: step 1b above, and the thought list at P-03 trimmed from six options to five — six plus a mic button is too much choice for a four-year-old to hold at once.

**Stage 3 — the engines**
E1 (Choose) and E3 (Sort). That's ~25 games including Camera or Brain, plus R-00 and R-01 to house them.

**Stage 4 — setup and support**
SET-01–05, SUP-02 journal, SUP-03 settings. Needed for a real release, not for testing.

**Stage 5 — the rest of the engines**
E2, E4, E5, E6 — the remaining ~28 games, in whatever order the rooms need filling.

**Throughout:** the privacy decision (§14.1) can be worked in parallel, but Stage 4 cannot ship without it.

---

## Appendix — research sources

- Lieberman et al. (2007), *Putting Feelings Into Words: Affect Labeling Disrupts Amygdala Activity in Response to Affective Stimuli.*
- Widen & Russell (2008), *Children Acquire Emotion Categories Gradually.*
- Nook et al. (2018), *The Nonlinear Development of Emotion Differentiation: Granular Emotional Experience Is Low in Adolescence.*
- Nummenmaa, Glerean, Hari & Hietanen (2014), *Bodily Maps of Emotions*, PNAS.
- ZERO TO THREE, *Interoceptive Awareness in Early Childhood: Connecting Bodily Sensations to Emotions.*
- CASEL, *What Is the CASEL Framework?* — five core SEL competencies.
- Center on the Developing Child, Harvard University — *Executive Function & Self-Regulation.*

**Superseded documents** (retained for their research detail): Mind Gym Feelings Master Spec · Mind Gym Body Detective Master Spec · Mind Gym Phase Index · Mind Gym Master Screen Index · Mind Gym Phase 1 UI Plan.
