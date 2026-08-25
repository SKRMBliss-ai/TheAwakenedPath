# The Daily Practice — one ritual, five minutes, filled with joy

**Supersedes the scope of `SPIRITUAL_DIARY_PLAN.md`** (the diary becomes *one
band* of this dashboard, not a separate tab). Read that doc for the diary's
category detail and the dual-audience accessibility design; this doc is the
container that holds it.

---

## The north star

> One beautiful screen a person opens once a day, mid-life, with 5 minutes and
> a busy mind — and leaves feeling they arrived somewhere, not that they filled
> a form.

Three things get captured, plus one that goes deeper:

1. **Teaching** — today's Power of Now teaching + one line of what landed.
2. **Meditation** — which technique, how long, how it went.
3. **Diary** — the self-introspection checks (simple by default).
4. **Go deeper** — one rotating prompt, chosen to match the day, answered in a line.

The whole thing is a single vertical **"day ribbon"** — you scroll down once,
top to bottom, and you're done.

---

## The one constraint that decides every design choice: 5 minutes

Every screen decision is judged against *"does this cost the busy person a
second they don't have?"* That yields hard rules:

- **Blank = complete.** A day opens pre-filled with the good state (0 lapses,
  practice pulled from your sit). You only touch what differs. Never a wall of
  empty fields.
- **Tapping, not typing, is the default path.** Chips, steppers, one-tap scales.
  Typing is always optional — the day can be "finished" without the keyboard.
- **Nothing is required.** No field blocks completion. Skipped bands stay soft,
  not red. Guidance, never gates (this is `DD-002` applied to the whole ritual).
- **Autosave, always resumable.** Interrupt at minute 2, come back at lunch, the
  ribbon is exactly where you left it. No "submit," no lost work, no dead end.
- **Surface, don't ask.** Today's teaching, this week's practice, your last sit
  — all pre-loaded. The person reacts to what's shown; they don't fetch or hunt.

---

## The day ribbon — wireframe

One screen, one scroll. Each band is self-contained; a light fills as you move
down, so progress is *felt* (an orb brightening) rather than counted (a bar).

```
┌─────────────────────────────────────────────────────────────┐
│                                              ◐  ← the day-orb │
│   Good evening, Simran.            Tue · 25 Aug · Day 128    │
│   Five quiet minutes. Begin wherever you like.               │
│                                                              │
│ ┌── ☀ TEACHING ───────────────────────────────────────────┐ │
│ │  “You are not your mind.”  — The Power of Now, Ch.1      │ │
│ │  [ ▶ 40-sec read ]                                       │ │
│ │  What landed?  ○ Clarity ○ Comfort ○ Challenge ○ —      │ │
│ │  [ one line, if you wish…                             ]  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌── 🪷 MEDITATION ─────────────────────────────────────────┐ │
│ │  Technique   [Witnessing] [Breath] [Simran] [Sound] [+] │ │
│ │  How long    ( 5 )( 10 )( 20 )( 30 )( custom )  min      │ │
│ │  How was it  restless ○───○───●───○───○ settled         │ │
│ │  (that becomes your “go deeper” prompt below)           │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌── 📿 DIARY — a gentle look ──────────────────────────────┐ │
│ │  Simple mode · tap only what slipped                    │ │
│ │  Non-harming ✓   Truthful ✓   Restraint ✓              │ │
│ │  Humility ✓      Love for all ·slipped                  │ │
│ │  Practice time  20 min ✓ from your sit                  │ │
│ │  Service today  ☐ physically  ☐ giving                 │ │
│ │  › open full diary                                      │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌── 🌙 GO DEEPER (today’s prompt) ─────────────────────────┐ │
│ │  Your sit was restless. In one line: where did the      │ │
│ │  restlessness want to take you?                         │ │
│ │  [ …                                                 ]  │ │
│ │  ↻ another prompt                                       │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│        ◉  Arrived.  128 days of showing up.                  │
│           (felt, not scored — no streak to break)           │
└──────────────────────────────────────────────────────────────┘
```

Each band takes ~45–75 seconds; skip any and still feel complete.

---

## What makes it *stunning* (the craft layer)

"Stunning" is not decoration — it's the felt difference between a form and a
ritual. Concretely:

- **The day-orb, not a progress bar.** A single soft light at the top brightens
  as bands are touched. Completion isn't "5/5" — it's the orb reaching full
  glow. This is your existing arrival-ritual language (`DD-003`) carried through
  the whole day.
- **One calm column, generous space.** No dashboard clutter, no competing tiles.
  The older user "knows what to do" (`DD-001`) because there is one path down.
- **Warm, human microcopy.** "A gentle look," "begin wherever you like,"
  "arrived" — never "Section 3 incomplete." The voice is the virtue prayers'
  voice.
- **Reward is ambient.** Points/streaks are felt, never displayed as pressure
  (per `.agent/rules/presence-over-progress`). "128 days of showing up" is a
  quiet acknowledgment, and crucially **not a streak that breaks** — miss a day
  and the number simply waits, so a busy day never becomes a failure.
- **Motion as breath.** Bands settle in on a slow ease (your Framer Motion
  is already in use); transitions feel like an exhale, not a UI animation.
- **It reads beautifully in both themes** and on a phone held one-handed on a
  commute — the real context of the 5-minute fill.

---

## "Go deeper, quickly" — the prompt engine

The prompt is the depth-in-one-line mechanism. Two sources, already partly built:

1. **The day-angle engine** we just tightened in `practiceOfWeek.ts` — arrive /
   notice / apply / go deeper / embody / return / reflect, each capped to one
   line, topic-aware.
2. **A Power-of-Now presence bank** — short, concrete prompts drawn from the
   teaching (e.g. "Where did you lose the Now today — name the moment").

**The clever part: the prompt reacts to what was just logged.** If the sit was
marked *restless*, the prompt asks about restlessness. If the diary flagged a
lapse in *Truthfulness*, tonight's prompt quietly points there. This is what
makes it feel like a companion, not a random generator — depth *targeted* to
today, answerable in the 5 minutes you have. `↻ another prompt` reshuffles
without penalty.

---

## Data model — extend the doc you already have

`users/{uid}/practiceDays/{date}` already stores: `date, sat, minutes, settled,
reflection, invocationRead, breath/posture/connect, practiceReflection`. We
**add fields to the same doc** rather than making new ones — one day, one
record, one read:

```
users/{uid}/practiceDays/{YYYY-MM-DD}
  … existing sit fields …
  technique:      "witnessing" | "breath" | "simran" | "sound" | custom
  teachingId:     "pon-ch1-not-your-mind"
  teachingLanded: "clarity" | "comfort" | "challenge" | null
  teachingNote:   "…"                      // optional line
  deeperPrompt:   "…the prompt shown…"
  deeperNote:     "…the one-line answer…"
  diary: {                                 // simple-mode marks; full mode → §diary plan
    nonharm: 0, truthful: 0, restraint: 0, humility: 0, love: 1,
    practiceMin: 20,                       // pre-filled from `minutes`
    servicePhysical: false, serviceGiving: false
  }
```

- **Privacy:** owner-only, already covered by `users/{uid}/{coll}/**`
  (firestore.rules:60). Nothing here reaches the shared feed unless the person
  explicitly shares a single reflection (existing `useSharedPractice` path).
- **No new backend.** Pure client + owner-scoped Firestore, like today.

---

## Where it lives

This **becomes the Today tab** — it *is* the daily journey (`DD-001`). The
current Today card's content (virtue/sixfold) is parked per the earlier
decision; the ribbon replaces it as the single designed-for daily action.

```
PRACTICE
  ├ Today   → THE DAILY PRACTICE RIBBON   ← this doc
  ├ Practices (library)                    ← unchanged
  └ [Virtues/Sixfold parked, kept in code] ← reversible
```

---

## Build phases

1. **The ribbon shell + day-orb** — one scrolling screen, four bands, autosave
   to `practiceDays`, the felt-progress orb. Bands can be static first.
2. **Meditation band** — technique chips, duration presets, the settled scale.
   Writes `technique` + reuses `minutes`/`settled`.
3. **Teaching band** — surface today's Power of Now teaching from `teachingData`,
   the "what landed" chips + optional line.
4. **Diary band (simple)** — the 5 ethical one-taps + practice time pre-filled
   from the sit; "open full diary" links to the full view from the diary plan.
5. **Go-deeper prompt** — wire the reactive prompt engine (uses the sit's
   `settled` + diary flags to choose the prompt).
6. **The joy pass** — motion, microcopy, the orb glow, theme polish, the
   "arrived" moment. *This is the phase that makes it stunning; do not skip it.*
7. **Full diary + accessibility register** — the dual-audience toggle and full
   grid from `SPIRITUAL_DIARY_PLAN.md`.

Phases 1–2 are a usable daily log in days. 1–6 are the product you're
describing. 7 is the depth for committed users.

---

## Files this touches

| File | Change |
|---|---|
| `src/features/practice-path/DailyRibbon.tsx` | **new** — the one-screen ritual |
| `src/features/practice-path/bands/TeachingBand.tsx` | **new** |
| `src/features/practice-path/bands/MeditationBand.tsx` | **new** |
| `src/features/practice-path/bands/DiaryBand.tsx` | **new** |
| `src/features/practice-path/bands/DeeperBand.tsx` | **new** |
| `src/features/practice-path/useDailyPractice.ts` | **new** — load/save the day, prompt selection |
| `src/features/practice-path/dayOrb.tsx` | **new** — the felt-progress light |
| `src/features/practice-path/usePracticeDay.ts` | extend `PracticeDay` with the new fields |
| `src/UntetheredSoulApp.tsx` | point the `today` tab at `DailyRibbon`; park virtue/sixfold sections |
| `src/features/practice-path/diary.ts` | **new** — categories + dual labels (from diary plan) |

No `firestore.rules` change. No Cloud Functions.

---

## Open questions

1. **Teaching source** — pull the daily teaching from the existing Power of Now
   chapters (`teachingData`), or a separate short "daily teaching" set curated
   for this? (Recommend: reuse chapters, one surfaces per day.)
2. **Technique list** — what are the canonical techniques to offer as chips?
   (Witnessing, Breath, Simran, Sound/Bhajan, + custom — confirm the set.)
3. **Diary register default** — `open` (plain words) or `traditional`, per the
   accessibility design? (Recommend `open` for reach, switchable.)
4. **One screen vs 3-step flow** — single scroll (recommended for speed) or a
   swipeable 1-2-3? (Recommend single scroll; fewer taps, fully skimmable.)

---

*Next step options: (a) I build Phase 1 — the ribbon shell you can click
through; (b) I mock the ribbon visually in both themes as a design canvas
before any code, so you can feel the "stunning" before we commit. Say which.*
