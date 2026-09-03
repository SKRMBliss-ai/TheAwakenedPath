# Mind Gym — UI Design Document

**Cinematic illustration, built for a child who might be upset.**

**Owner:** Sim · **Last updated:** 2 September 2026
**Reference:** three team screenshots — Body Detective scene, "How do you feel now?" night scene, the Rooms poster grid
**Companions:** `MIND_GYM_MASTER_PLAN.md` (what the app does) · `MIND_GYM_TEACHING_MOVES.md` (how it teaches) · Game Library v2 (61 games)

---

## Contents

1. [Design thesis](#1-design-thesis)
2. [Ten principles](#2-ten-principles)
3. [The visual system](#3-the-visual-system)
4. [Art direction brief](#4-art-direction-brief)
5. [Character system](#5-character-system)
6. [Screen specs — the path](#6-screen-specs--the-path)
7. [The adaptive state — when a child is upset](#7-the-adaptive-state--when-a-child-is-upset)
8. [Rooms and the six game engines](#8-rooms-and-the-six-game-engines)
9. [Motion](#9-motion)
10. [Sound and voice](#10-sound-and-voice)
11. [Accessibility and non-readers](#11-accessibility-and-non-readers)
12. [Build order for design](#12-build-order-for-design)

---

## 1. Design thesis

The reference screenshots establish something more useful than a look. They establish a **place**.

Full-bleed painterly scenes, warm lamplight inside deep blue-green darkness, a character caught mid-thought — that isn't decoration on top of a form. It reads as somewhere you go. And that matters more for this app than for almost any other, because of what we're asking a child to do: say how they actually feel, and then look at the story their own mind wrote about it.

Children don't do that on a bright white screen with a progress bar. They do it in a den, under a duvet with a torch, in the back of a car at night, at the edge of a campfire. **Dark, warm, contained, unhurried, private.** That's exactly what the reference art already is, and it's why the direction is right — not because Pixar looks expensive, but because that particular quality of light says *nobody's watching, take your time.*

So the whole design system follows one instruction:

> **Build a place a child would tell the truth in.**

Everything below is downstream of that. Where a visual choice and that instruction disagree, the instruction wins.

---

## 2. Ten principles

Design decisions that come from child psychology rather than from taste. These are the ones that make this app different from a beautiful app.

### 2.1 · One thing on the screen

Emotional load eats cognitive capacity. An upset child has very little working memory to spare. **One question per screen, always** — never two, never a question plus a tip, never a question plus a progress meter.

### 2.2 · Look where the child is looking, not at them

The single most important art-direction rule in this document.

A character facing the viewer, eyes locked on, reads as *being watched*. Fine for an invitation ("Start the scan" — the reference does this, correctly). Wrong for disclosure. Children — like adults — talk more easily side by side than face to face; it's why difficult conversations happen in cars and on walks rather than across tables.

So: **during any screen where the child reports their own inner state, the character looks out at the scene, not out of the screen.** Shared gaze, not direct gaze. The child is accompanied, not observed.

### 2.3 · Dark is private, never ominous

Deep, low-key scenes are the right register — but the difference between *safe dark* and *frightening dark* is a warm light source inside the frame. A lamp, a fire, a glowing jar, moonlight through a window, bioluminescence.

**Every dark scene must contain a visible warm source.** A dark scene with only cool light, or no light source at all, reads as threat. This is not a stylistic preference; it's the whole difference between a den and a basement.

### 2.4 · Nothing is ever marked correct

No ticks, no stars, no confetti, no score, no streak flame. Not one. The moment a child can win, they start optimising, and a child optimising their emotional self-report is worse than no data at all.

Affirmation is expressed as **warmth, light and attention** — the scene brightening slightly, the character turning toward them, a soft swell in the sound — never as reward iconography.

### 2.5 · The interface calms down when the child doesn't

If the check-in comes back high-intensity and unpleasant, the UI changes: less motion, fewer choices, larger targets, slower transitions, plainer language. Full spec in §7.

Almost no app does this, and it's the single most valuable thing in this document. An interface that stays chirpy at a distressed child is an interface that doesn't understand.

### 2.6 · Fine motor control degrades under stress

Upset children tap less accurately. Minimum target is 44px everywhere; **in the adaptive state, minimum 64px with 16px of separation.** Never place a destructive or exiting action adjacent to a primary one.

### 2.7 · The character is a companion, not a teacher

Characters who *know things* create performance pressure. Characters who are also working it out create company. Our characters wonder, guess, get it wrong, and are never corrected.

This directly serves the teaching moves: a trapdoor only works if the child doesn't feel tested.

### 2.8 · Text is optional, always

For ages 3–8, assume the child cannot read. Every word on screen has a voice equivalent, playing automatically, replayable by tapping the text. Nothing is gated behind reading.

### 2.9 · No timers, no urgency, no loss

No countdowns on any reflective screen. No "you have 10 seconds". No lives, no fails, no retry-from-the-start. The two timed games (Red Light Green Light, Slow the Pop) are physical impulse-control exercises where timing *is* the content — and even they have no losing state.

### 2.10 · The exit is always visible

"Talk to a grown-up" is present on every screen of the path, at the same position, in the same form. Never buried in a menu, never behind a confirm dialog, never dimmed. A child deciding to tell someone must not have to hunt.

---

## 3. The visual system

### 3.1 Colour

There is **no single brand palette.** Each scene has its own lighting and mood, the way film does. What stays constant is the *chrome* — the UI floating on top.

**Scene palettes (art direction, per screen):**

| Mood | Ground | Light source | Used for |
|------|--------|--------------|----------|
| Night calm | deep indigo, blue-black | moonlight, stars, distant window | check-in, reflection |
| Warm den | dark umber, deep brown-green | oil lamp, candle, hearth | the hinge, the story |
| Investigation | teal-black, cool slate | lantern, cyan bio-glow | Body Detective, Thought Room |
| Dawn | soft violet to amber | low sun | after reflection, the journal |
| Storm | charcoal, deep grey-blue | lightning-adjacent, gentle | Big Feelings, anger content |

**Chrome tokens (constant across all scenes):**

| Token | Value | Notes |
|-------|-------|-------|
| `chrome.text` | `#FFFFFF` | titles over art |
| `chrome.text.soft` | `rgba(255,255,255,0.78)` | subtitles, secondary |
| `chrome.scrim` | linear-gradient, transparent → `rgba(0,0,0,0.62)` over bottom 55% | guarantees legibility over any art |
| `chrome.back` | 40px circle, `rgba(0,0,0,0.34)`, 1px `rgba(255,255,255,0.18)` border, white chevron | top-left, every screen but the front door |
| `chrome.pill` | `rgba(255,255,255,0.10)` fill, 1px `rgba(255,255,255,0.22)` border, `border-radius: 999px` | choice buttons |
| `chrome.pill.selected` | `rgba(255,255,255,0.20)` fill, 1.5px `rgba(255,255,255,0.55)` border | selection, never a tick |
| `cta.primary` | solid, high-contrast, hue drawn from the scene's warm light | one per screen, max |
| `cta.label` | `#0E1A1C` on light CTA, `#FFFFFF` on dark | contrast ≥ 4.5:1 always |
| `adult.exit` | `rgba(255,255,255,0.16)` fill, white heart-outline icon, 44px | fixed position, every path screen |

**The scrim is not optional.** Illustrated backgrounds vary wildly in luminance; the bottom gradient is what stops white text from disappearing over a bright lamp.

### 3.2 Typography

One family, used with restraint. The reference screenshots use a clean geometric sans — keep that.

| Role | Spec |
|------|------|
| Screen title | 30–36px, weight 600, `letter-spacing: -0.01em`, `text-wrap: balance` |
| Subtitle | 16–18px, weight 400, 78% white, max 2 lines |
| Choice pill label | 17px, weight 600, **left-aligned** (never centred — left edges scan faster in a vertical stack) |
| CTA label | 17px, weight 700 |
| Body / narration | 17px, weight 400, line-height 1.55, max 34 characters per line for the young band |
| Micro-label | 12px, weight 700, `letter-spacing: 0.1em`, uppercase, 60% white |

**Never:** italic body text over illustration, text smaller than 15px anywhere a child reads it, or more than 60 words on a single screen.

### 3.3 Layout

Phone-first, 390×844 reference.

```
┌─────────────────────────┐
│ ○ back        ♡ grown-up│  ← 56px from top, both persistent
│                         │
│                         │
│     FULL-BLEED          │
│     ILLUSTRATION        │  ← the screen IS the art
│                         │
│                         │
│▒▒▒▒▒▒ scrim ▒▒▒▒▒▒▒▒▒▒▒▒│  ← begins ~45% down
│  Title                  │
│  One line of subtitle   │
│                         │
│  ▢ choice pill          │  ← 56px tall, 12px gap
│  ▢ choice pill          │
│  ▢ choice pill          │
│                         │
│      ( primary CTA )    │  ← 54px tall
│         ● ○ ○           │  ← pager, only if multi-step
└─────────────────────────┘
```

Safe areas: 24px horizontal margin, 56px top, 34px bottom. Never place interactive elements in the top 15% — that's where the character's face usually is, and children tap faces.

---

## 4. Art direction brief

For whoever generates or commissions the illustration. Hand this section over directly.

### 4.1 The house style

Painterly semi-realistic 3D, in the register of contemporary animated feature key art. Soft studio-quality lighting, warm rim light separating the character from the ground, shallow depth of field with a crisp subject and softly falling-off background, rich but not saturated colour grading, visible atmosphere — dust motes, haze, light shafts.

**Not:** flat vector, cartoon outlines, sticker aesthetic, chibi proportions, or 2010s "corporate Memphis" illustration.

### 4.2 Original characters only

Match the *rendering style and cinematic staging*. Never reproduce, trace or closely imitate any studio's actual characters, or their distinctive character designs. Our cast is designed from scratch: original faces, original proportions, original costume language. If a generated character reads as recognisable from a specific film, reject it and regenerate.

### 4.3 Casting

Children of a range of ethnicities, skin tones, hair textures and body types, consistently across the app — not one diverse hero screen and a default elsewhere. At least one recurring character with a visible disability, portrayed incidentally rather than as a story point. No character is the pretty one or the clever one.

### 4.4 Per-screen prompt structure

Every scene brief specifies these six, in this order:

1. **Who** — character, age, pose, and *where they are looking*
2. **Where** — the environment, one clear location
3. **Light** — the warm source, named and placed (§2.3)
4. **Mood** — three adjectives maximum
5. **Composition** — where the character sits in frame, and which 45% of the canvas must stay quiet for the scrim
6. **Negative** — no text, no UI, no logos, no watermarks, no direct-to-camera gaze unless specified

**Worked example — the front door:**

> A nine-year-old child sits on a wide windowsill at night, knees drawn up, **looking out of the window, away from the viewer**. A city or treeline sits soft and out of focus beyond the glass. A small warm lamp on the sill lights one side of their face; the rest of the room falls into deep indigo. Mood: quiet, private, unhurried. Character occupies the left third; the lower-right 45% of frame is dark, empty sky and glass for the scrim. No text, no UI, no direct gaze.

### 4.5 Continuity

Same characters, same rooms, same time of day within a session. A child who walks the path should feel they stayed in one place — not that they were teleported through eight unrelated paintings. Keep a scene bible: each recurring location gets a reference sheet.

---

## 5. Character system

### 5.1 The two casts

**Ages 3–8 — Pip and friends.** Softer, rounder, larger heads and eyes, exaggerated but never grotesque expressions. Full-body poses are required, not head-and-shoulders — the body carries the content in the Body Detective work. Clue states must be legible at a glance: fists, hunched shoulders, hot face, curled-up posture, bouncing energy.

**Ages 9–14 — the crew.** Realistic proportions, subtler expression, feelings shown through posture and micro-behaviour: a set jaw, shoulders near the ears, a leg bouncing under a desk, arms folded tight, someone very still. Ordinary clothes, ordinary rooms, no whimsy.

### 5.2 The inner voice needs a body

**Decided.** Give it a body — but only for the young band, and only as a teaching tool, not a mascot.

A small creature that rides on the shoulder, chatters constantly, jumps to conclusions, is often wrong, and is **never punished or silenced.** It's anxious and well-meaning, like the guard dog barking at the postman — this is the same image already in `MIND_GYM_TEACHING_MOVES.md` §2, so the character isn't a new idea grafted on, it's the existing metaphor given a face.

The reason to do this rather than leave step 3 abstract: four-year-olds mostly can't answer "what's your mind saying" cold — that's asking a child to observe their own thinking with no handle to hold. Therapy for young children solves this the same way, over and over, by moving the thought outside the child's body so there's something to point at instead of something to introspect on (worry monsters, anger volcanoes, the "Unthinkables" in the Superflex curriculum). It works because a four-year-old can watch a creature chatter and disagree with it far more easily than they can watch their own mind and describe it.

That's also the actual teaching content, not just an access ramp. The line to build every P-03 interaction around is: *the creature talks, and you decide.* The child isn't asked what they think — they're asked what the creature just said, and then, separately, whether that's true. That gap is the whole lesson from step 3 onward: the voice and the self that notices it are two different things. Losing that distinction was the risk with a shoulder character — a badly built version teaches "there's a thing inside me making me think stuff," which undercuts the entire app. A well-built version teaches the opposite: there's a thing that talks, and it isn't you.

**What makes this work rather than backfire:**

- The child names it, at setup, right after they name themselves. That's what turns "what's [name] saying right now" into a real question with a real answer, and it gives them ownership of it from day one rather than being handed a branded character.
- It's wrong constantly, visibly, and without consequence. If it's usually right, children start treating its opinions as fact — the exact habit the app exists to undo.
- It never appears during the trusted-adult flow, and it disappears in the quiet state (§7). A child in real distress doesn't need a chattering companion; they need the room to go quiet and an adult's voice, human or narrated, to be the only one left.
- It fades out for 9–14. That band gets the abstract version — "thoughts are mental events, not facts" — because they can hold it without a prop, and a shoulder creature on a thirteen-year-old reads as babyish against the "intelligent, modern, empowering" tone the older resource is built on (see the master prompt's own instruction not to talk down to that age group). If continuity across the age switch-over matters later, the oldest 3–8 sessions can start weaning the creature's presence before the handover rather than cutting it off in one screen.
- Design notes carried over from the earlier sketch still hold: small enough to sit in the corner of frame without stealing focus, expressive in silhouette since it's often small on screen, never sinister or a villain, with its own idle chatter animation and a "just said something" beat.

This also becomes ownable IP, unlike a borrowed metaphor — a real secondary benefit, but not the reason to build it. The reason is that it's the cleanest way anyone's found to make an abstract noticing skill concrete for a four-year-old, provided the app is disciplined about what the creature is allowed to mean.

### 5.3 Expression sheets required

Per character: neutral, happy, sad, angry, scared, worried, embarrassed, surprised, tired, "can't tell" — plus, for 3–8, the full-body clue states above. That's the long pole in the art production and should start first.

---

## 6. Screen specs — the path

Each screen: art brief, layout, chrome, and the psychological reason for the staging.

---

### P-01 · The front door — "How are you feeling right now?"

**Art:** child at a night window, **looking out**, warm lamp on the sill, deep indigo room, city or trees soft beyond the glass.
**Why this staging:** the very first thing the app does is ask for something private. A character looking *away* removes the sense of being examined (§2.2). The window says night, quiet, nobody around.

**Layout**
- Title at 46% height: *"How are you feeling right now?"*
- **9–14:** vertical stack of translucent pills — a wide, specific vocabulary, six visible with a gentle scroll. Multi-select. Selected pills fill slightly and gain a brighter border. **No ticks.**
- **3–8:** 2×3 grid of large illustrated faces, each 96px, name beneath. One tap. Faces are *characters*, not emoji.
- Intensity (9–14 only): after a feeling is picked, its pill expands in place to reveal a five-segment scale. Never a separate screen.
- CTA: *"That's how I feel"* — disabled until one selection, and disabled state is 40% opacity, never hidden.
- **"I don't know"** is a full-width pill at the bottom of the stack, styled identically to the others. Not a link. Not smaller. It is a real answer and must look like one.

**Never here:** no greeting by name before the question (it delays the ask), no streak, no "welcome back", no menu.

---

### P-02 · The body — "Where do you notice it?"

**Art:** the character in the same room, seen three-quarter, a soft warm glow at the region the child taps.
**Why:** the glow gives immediate, non-judgemental feedback — the app confirms a tap was received without confirming it was *right*.

**Layout**
- **9–14:** a body diagram with seven tappable regions. Tapping opens a small inline chip row: *tight · heavy · racing · hot · hollow · buzzing*.
- **3–8:** the character's body with four large regions — tummy, heart, face, hands. Minimum 88px targets. No sensation words.
- **"I can't tell"** as a full-width pill, prominent, always.
- Micro-copy beneath: *"There's no right place. Yours lives wherever yours lives."*

---

### P-03 · The thought — "What's your mind saying?"

**Art:** the shoulder creature appears here for the first time in the session, mid-chatter, small in frame. The child character is present but not looking at the viewer.
**Why:** externalising the voice into a visible, named companion is what makes this step answerable for the young band — the question isn't "what are you thinking," it's "what did [creature's name] just say."

**Layout**
- **9–14:** a single text field over the scrim, generously sized, plus four tappable starters: *"nobody…" · "I always…" · "they think…" · "what if…"*. Tapping a starter fills the field and places the cursor. No creature here — this band gets the abstract framing directly.
- **3–8:** an empty thought bubble above the creature, headed *"What did [creature's name] just say?"* Six simple pre-written thoughts to choose from, plus a large microphone button to say one aloud. **No typing.**
- Nothing on this screen evaluates, softens, autocorrects or suggests. Raw capture only.

---

### P-04 · The situation — "What happened?"

**Art:** the environment pulls back — a wider, quieter shot with the character small in frame. Less face, more room.
**Why:** this is the most exposing question in the app. Reducing character presence lowers the sense of an audience.

**Layout**
- **9–14:** large text field, voice-note alternative given equal weight (not a secondary option).
- **3–8:** a horizontally scrolling row of illustrated situation cards — *someone took my toy · I wasn't invited · I got told off · I lost the game · someone wouldn't share* — plus a microphone card.
- *"I'd rather not say"* is always present and continues the path.

---

### P-05 · The hinge — "Here's the story your mind made"

**The most important screen in the app. Give it the most art budget.**

**Art:** the warmest scene in the session — the character somewhere enclosed and safe: a reading nook, a den, a tent with a lamp. The story appears as something *held* — a book, a projection, motes of light forming words in the air.
**Why:** the child is about to see their own thinking from outside for the first time. It should feel like being shown something interesting, not like being caught.

**Layout**
- The story assembles **line by line, unhurried**, each fragment fading in over ~400ms with a beat between. This pacing is content, not polish: it's what lets the child hear it as a constructed thing rather than a fact.
- Their own words are rendered in a lighter weight than the connecting text, so they can see what was theirs.
- One CTA: *"That's it"* · one secondary: *"Not quite — let me fix it"*.
- **3–8 variant:** the story becomes a three-panel illustrated strip, narrated aloud, each panel arriving with the voice.

---

### P-06 · The turn

**Two versions.**

**6a · Ages 9–14 — fear story or love story**

**Art:** the frame splits. Left: cooler, more shadowed, the character braced. Right: same character, same room, warmer light, more open posture. Same scene, different lighting — **the point is that nothing changed except the light.**
**Why:** the visual carries the idea before a word is read. The two panels must be recognisably the same moment, or the metaphor breaks.

- Opens with the smoke-alarm line (see Teaching Moves §8) before either option is tappable.
- Two large tappable panels, no default selection.
- Fear panel must never be uglier, darker-toned or visually punished. It is *protective*, and if it looks like the wrong answer this screen fails and the child stops being honest at P-03.

**6b · Ages 3–8 — the camera test**

**Art:** a warm, well-lit workspace — a table with two open boxes, one with a small camera resting beside it, one with a soft glowing thought-bubble shape.
**Layout:** the child's story appears as physical draggable cards. Two large drop zones: *📷 A camera would see this* · *💭 Only my brain knows this*.
- Both boxes light up warmly on drop. **Neither is the mistake box** — identical visual treatment, identical sound.
- Cards that could go either way are accepted in both, with: *"That one could go in either! Lots can."*

---

### P-07 · The opening — "What else could be true?"

**Art:** the widest, lightest scene so far. Sky, horizon, open space. The first hint of dawn colour in the session.
**Why:** the visual language of the path is a slow opening-out, from a small dark window to open sky. That arc should be felt without ever being pointed at.

**Layout**
- Two or three alternative-story pills, plus *"I'll write my own"*.
- **"None of these yet"** is present, full width, styled the same. Non-negotiable — without it this screen becomes coercion.
- **3–8:** two illustrated "maybe" cards, narrated, each beginning with the word *maybe*.

---

### P-08 · The Reflection Room

**Art:** dawn, or a warm interior after dark. Genuinely calm — no activity, no motion, nothing to do. The one screen where the character may look toward the viewer, softly.
**Why:** the session is over; company is now appropriate rather than pressuring.

**Layout**
- *"What did you notice?"* — never *"what did you learn?"*
- **3–8:** four illustrated discovery cards, one tap.
- **9–14:** three prompt cards plus an optional free note.
- Closing: the reflection is added to the journal with a small, quiet animation. **No score, no summary of performance, no "great session!"**

---

## 7. The adaptive state — when a child is upset

**The most important section in this document, and the thing almost no wellbeing app does.**

### 7.1 Trigger

When the P-01 check-in returns a feeling tagged unpleasant at intensity 4–5, or the child selects one of a small set of high-distress words, the app enters the **quiet state** for the rest of the session. Silent — never announced, never named to the child.

### 7.2 What changes

| Dimension | Normal | Quiet state |
|-----------|--------|-------------|
| Ambient motion | Present — light shafts, dust, gentle parallax | **Stopped.** Static art only |
| Transitions | 300ms crossfade | 500ms, slower ease |
| Choices per screen | Up to 6 | **Maximum 3**, plus "I don't know" |
| Touch targets | 44px min | **64px min, 16px separation** |
| Copy length | Up to 60 words | **Under 20 words per screen** |
| Teaching moves | Trapdoors, experiments, games | **All off.** No cleverness, no games offered |
| Scene brightness | As designed | Warmer, slightly lifted shadows — dark should not deepen when a child is low |
| Sound | Ambient bed + voice | Ambient reduced 60%, voice slower and lower |
| The shoulder creature | Present, chattering | **Absent.** No extra voice in the room |
| Grown-up exit | Standard | **Enlarged, moved to bottom of every screen**, above the CTA |

### 7.3 Copy shifts

Every screen swaps to its short form:

- *"That sounds like a lot."*
- *"You don't have to explain it."*
- *"Where is it? Just point."*
- *"Okay. Take your time."*
- *"Is this one for a grown-up?"*

### 7.4 The offer to stop

After P-02, the quiet state offers a genuine exit:

> *"We can carry on, or stop here. Both are completely fine."*
> **[ Keep going ]  [ Stop for now ]**

"Stop for now" saves what was captured, goes to a calm screen, and offers the grown-up path. **No persuasion to continue, no "are you sure?", no partial-progress guilt.**

### 7.5 Why this matters more than anything else here

An interface that stays bright, animated and clever at a distressed child communicates that it hasn't noticed. Children read that instantly and stop telling the truth. Getting this right is what separates a wellbeing app from a beautiful one.

---

## 8. Rooms and the six game engines

### 8.1 The rooms grid

Keep the built UI — it's good and it matches the reference. Poster cards, roughly 2:3, full-bleed illustrated scene per room, title and one-line caption over a bottom gradient, dark navy-purple canvas, horizontal scroll on phone.

**Changes:** the grid is now the **second** screen, reached after the check-in routes there (§4 of the master plan). And each card gains a small, quiet line: *"Trains: how you notice feelings"* — because a child who knows what a room is for chooses better.

### 8.2 Engine rendering

61 games run on six engines. Each engine is one layout, skinned per game.

**E1 · Choose** — *~18 games*
Full-bleed scene, scrim, question at 46%, 2–6 translucent pills. **Identical to the reference screenshot.** After choosing: the scene warms slightly, the pill fills, an affirming line appears. Never a tick.

**E2 · Body tap** — *~6 games*
Character three-quarter or full body, regions invisible until touched, warm glow on contact, generous targets. Selected regions keep a soft persistent glow.

**E3 · Sort** — *~7 games, including Camera or Brain*
Two or three labelled zones with a warm workspace scene behind. Physical draggable cards with weight and a little bounce on landing. **Both zones light identically.** Accepts ambiguous placements gracefully.

**E4 · Dial** — *~5 games*
A slider or five-segment scale, with the scene responding live — light intensifying, colour warming, a character's posture shifting as the value moves. The art *is* the feedback.

**E5 · Timed** — *~9 games, including Try Not To Laugh, The Itch, Red Light Green Light*
Minimal chrome, near-full-bleed, one moving element. **No countdown numerals, no score.** Trapdoors live here, and they need a beat of silence before the reveal — a genuine pause, 800ms or more, so the child registers what just happened before the app speaks.

**E6 · Story playback** — *~8 games*
Cinematic sequence, illustrated panels or a slow pan, narrated. Pauses for input, then replays with the child's change. The replay is the payoff — it must be visibly different, not just re-narrated.

### 8.3 Trapdoors need specific handling

The trapdoor games — Quiet Inside, Try Not To Laugh, Are You Hopping?, Don't Think About a Purple Elephant, What Would You Tell a Friend?, The Spotlight — depend on **timing and restraint**:

1. Give the instruction. Nothing else on screen.
2. Let it run. Silence, no encouragement, no progress indicator.
3. **Wait.** 800ms of nothing after the moment lands.
4. Then the reveal, in one short line, delivered warmly and slightly wryly.
5. Never *"see?"*, never *"that shows us that…"*, never a moral.

If the app talks during step 2 or explains at step 5, the trapdoor closes and the game becomes a lecture.

---

## 9. Motion

**Ambient:** slow. Dust motes, light shafts, a curtain, water. Nothing faster than about 4 seconds per cycle. Ambient motion is atmosphere, never attention-seeking.

**Transitions:** 300ms crossfade between path screens, with the environment holding continuity — same room, camera moving, rather than a hard cut to a new place.

**Feedback:** 150ms, ease-out. Pills fill; they don't bounce. Nothing overshoots.

**Character idle:** breathing, a blink, small weight shifts. The shoulder creature has a busier idle — it's a fidget by nature.

**Reduced motion:** `prefers-reduced-motion` stops all ambient and idle animation, and shortens transitions to 120ms cross-dissolves. The app must be fully usable and still beautiful with every animation off. **This is also exactly the quiet state**, which is a useful coincidence — build it once.

---

## 10. Sound and voice

**Ambient bed** per scene: room tone, distant rain, a fire, night insects. Low, loopable, never musical enough to become a tune. Off by default on first launch; offered once.

**Narration** is required for 3–8 and optional for 9–14. Warm, unhurried, adult but not sing-song. **Never the exaggerated children's-TV register** — children hear it as being talked down to by about age six.

**No sound effects for correctness.** No dings, no chimes on selection. Selection gets a soft, low, almost-tactile sound at most.

**Voice casting:** one voice throughout, so the app has a consistent companion. Regionally neutral. If the shoulder creature speaks, it's a distinctly different, lighter voice — and it never delivers the important lines.

---

## 11. Accessibility and non-readers

- **Contrast:** all text ≥ 4.5:1 against the *actual composited pixels*, not against the intended background. Illustrated grounds vary — check every screen against its own art, not a swatch.
- **Targets:** 44px minimum, 64px in the quiet state.
- **Reading:** everything voiced for 3–8. Tap any text to hear it again.
- **Dyslexia:** generous line height, no justified text, no italic body copy, and a font-size control in settings.
- **Colour independence:** never encode meaning in hue alone. The camera/brain boxes differ by icon, label and position, not just colour.
- **Screen reader:** all art gets a description. Decorative flourishes are marked as such.
- **One-handed:** all primary actions reachable in the lower 60% of the screen.
- **Interruption:** the app can be closed at any point and resumes exactly where it was, with everything captured kept.

---

## 12. Build order for design

1. **The chrome system.** Scrim, pills, CTA, back, grown-up exit, type scale. It sits on every screen and it's testable against placeholder art immediately.
2. **P-01 front door, fully art-directed.** It's the highest-traffic screen in the app and it sets the register for everything else.
3. **The quiet state.** Build it alongside P-01, not later. Retrofitting an adaptive interface is far harder than designing one, and the whole system pivots on it.
4. **P-05 the hinge.** The most important screen. Most art budget, most care, most iteration.
5. **Character expression sheets.** The long pole in production — start commissioning while screens are still being designed.
6. **E1 Choose and E3 Sort.** Two engines, ~25 games, including Camera or Brain.
7. **Everything else**, in whatever order the rooms need filling.

---

## Open questions for the design lead

1. **Utility screens** — journal, settings, patterns. Full cinematic treatment hurts legibility for dense content. Toned-down illustrated panel, or plain surface? Unresolved.
2. **Art pipeline** — generated, commissioned, or hybrid? Consistency across ~40 scenes with the same recurring characters is genuinely hard with generation alone, and §4.5 continuity is a real requirement rather than a nicety, and now includes a creature that has to stay recognisable across every 3–8 screen it appears on.

*(The shoulder creature itself is no longer open — see §5.2. In for 3–8, phased out for 9–14, child-named at setup.)*
4. **Landscape and tablet** — phone-first is specified; tablet is likely for the 3–8 band, often shared with a parent. Worth deciding before layouts are finalised.
