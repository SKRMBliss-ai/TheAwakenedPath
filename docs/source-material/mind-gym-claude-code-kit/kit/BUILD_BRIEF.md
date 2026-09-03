# Mind Gym for Kids — build brief for Claude Code

**Read this first, before touching any other file in this kit.** It tells you what to build,
where it lives in the existing codebase, and what order to build it in. Everything else in
this folder is reference material this brief points to.

---

## 0. What you're building

Mind Gym is a children's emotional-regulation tool, ages 3–8 for this build. A child checks
in with how they feel, and if it's an unpleasant feeling, walks a short guided path — where's
it in your body, what's your mind saying, what happened, here's the story, did your eyes see
it or did it happen in your head, here are some other maybes — ending in a spoken teaching
matched to what they came in feeling. If they're fine, they land in a grid of practice games
instead. A character called **Chirpy** — a small shoulder creature — voices the child's inner
"chatterbox" at the thought step, and is absent whenever the app senses real distress.

**This is going into the existing skrmblissai.in codebase**, as a new section/route, reusing
the site's existing React setup, Firebase project, and auth. Not a new app, not a new repo.

**A basic home page for this already exists** at skrmblissai.in/mindgymforkids. Before writing
anything, open the existing repo and find it — its route, its component(s), its current state.
Build on top of that page rather than replacing it: treat it as the entry point the rest of
this brief hangs off of, and match whatever conventions it already established (styling
approach, file layout, naming) unless they conflict with something the master plan is explicit
about (like the quiet state or the auto-advance rule).

**Non-negotiable rules — do not relitigate these, they're settled product decisions:**
- Nothing is ever marked correct. No scores, ticks, streaks, levels, "well done".
- Every answer auto-advances to the next screen. No "Next" button on a selection screen.
- Chirpy is on nearly every screen, has his own (higher, quicker) voice distinct from the
  narrator, and is **absent** from the trusted-adult flow and the quiet state.
- The quiet state (§13.3 in the master plan, and see the working prototype) is a Stage-0
  requirement, not something to add later. Read that section before building the chrome.
- Data collected: first name/nickname + age only. No surname, DOB, photo, school, location.

---

## 1. Start here: the working prototype is your interaction spec

`reference/mind-gym-prototype.html` is a complete, working, single-file build of this exact
app — open it in a browser and click through it. **Every interaction, every screen transition,
every line of copy, the quiet-state trigger, the router logic — all of it is real and tested.**
Do not redesign the flow from the docs below; port this prototype's behavior faithfully into
the real codebase. The docs are *why* it works this way; the prototype is *what* to build.

Specifically port:
- The screen state machine (`SCREENS` object, `render()`/`go()`/`back()` functions)
- The auto-advance pattern (`choose()` — tap fills the answer, pauses briefly, moves on)
- The quiet-state toggle and its effects (`setQuiet()`, the `body.quiet` CSS hooks)
- The Chirpy bar component (`bar()`) and his two-voice speech synthesis (`say()` / `sayChirpy()`)
- The teaching-move screens (`teach`, `TEACH`/`teachGo()`) — one line at a time, tap to advance
- The camera/eyes test logic (`camera()`) — now the "eyes" version, not camera

`reference/sprites/` has Chirpy's real art, cut from the founder's character sheet, as
transparent WebP at 3x. Nine states: idle, curious, worried, excited, jumping, hopeful, and
three "said something" poses. Use these; nothing else in the app has real art yet — build
everything else as clean placeholder (the prototype's SVG scenes are a fine starting point,
or swap to whatever the site's existing design system prefers for now).

---

## 2. Reference docs (read in this order, as needed)

Don't read all of these up front — come back to them when a screen needs more depth than the
prototype shows.

1. `reference/MIND_GYM_MASTER_PLAN.md` — the source of truth. §9 (screen inventory), §11 (data
   model), §13 (visual style + adaptive state), §15 (build order) are the sections you'll want most.
2. `reference/MIND_GYM_TEACHING_MOVES.md` — where every closing teaching and trapdoor moment
   comes from. If you need to add a new one, match this doc's format and tone.
3. `reference/MIND_GYM_UI_DESIGN.md` — the cinematic visual direction, for when real art
   production starts. Not required to write code against.
4. `reference/MIND_GYM_VOICE_SCRIPT.md` — all 179 spoken lines, IDs, delivery notes. The
   founder is recording these himself; build audio playback to key off these exact IDs (see §5).

---

## 3. Where this lives in the codebase

Inspect the existing skrmblissai.in repo structure before creating anything — match its
conventions (routing, component patterns, state management, styling approach) rather than
introducing a parallel style. As a starting point, assuming a fairly standard React setup:

```
src/
  mindgym/
    MindGymApp.jsx          # top-level route component, mounts the whole experience
    engine/
      screens.js             # the SCREENS registry, ported from the prototype
      state.js                # session state (feeling, size, body, thought, situation, ...)
      router.js                # go()/back()/choose() — the auto-advance engine
    components/
      Chirpy.jsx               # the shoulder-bar component + two-voice speech
      SceneBackground.jsx       # the mood-scene SVGs (or your design system's replacement)
      Pill.jsx, FaceGrid.jsx, BodyMap.jsx, TeachScreen.jsx, ...
    content/
      thoughts.js, situations.js, maybes.js, closers.js   # ported from the prototype's JS objects
    audio/
      voiceIndex.js            # maps line IDs (from the voice script) to asset URLs
    assets/
      chirpy/                  # the sprite files from reference/sprites/
  routes/
    mindgymforkids.jsx (or however routing is done)  # wires MindGymApp into the existing site
```

Adjust freely to match how the rest of the site is actually organized — this is a shape, not
a mandate.

---

## 4. Data model — Firebase

Use the existing Firebase project. Suggested collections (adjust to match existing naming
conventions in the codebase):

```
mindgym_children/{childId}
  firstName: string
  age: number
  chirpyName: string
  createdAt: timestamp
  parentUserId: string        # link to the existing site's auth user

mindgym_sessions/{sessionId}
  childId: string
  startedAt, completedAt: timestamp
  feeling: string
  intensity: "bit" | "quite" | "really"
  bodyRegion: string
  thought: string
  situation: string
  eyesTestAnswers: [...]
  maybe: string
  noticed: string              # which "I caught..." option
  quietStateTriggered: boolean
```

**Privacy, non-negotiable:** no free-text field the child fills in should leave the device
without the parent account's explicit visibility already established at setup — see the
master plan §11 and §14 (open decisions) before wiring this up for real. The two blocking
open decisions in §14 (privacy stance, safeguarding escalation) are **not resolved** — treat
session data as sensitive-by-default and don't build any feature that shares or exports it
until the founder has settled those two items. This is a hold on scope, not a technical blocker
— build the local session flow now, hold off on cloud sync of session content specifically.

---

## 5. Voice

The founder is recording 179 lines himself (`reference/MIND_GYM_VOICE_SCRIPT.md`), keyed by
ID (`intro.01`, `close.sad.7`, `eyes.a1`, etc). Build the audio layer so it:

1. Looks up `AUDIO_MANIFEST[lineId]` for a real recorded file.
2. Falls back to the browser's `SpeechSynthesisUtterance` (as the prototype does) when the
   ID has no recording yet — this lets the app work end-to-end before recording is finished.
3. Uses two different synthetic voices for the fallback (see `pickVoices()` in the prototype)
   so narrator vs. Chirpy stays distinguishable even before real audio exists.

Don't build a text-to-speech-only version and bolt files on later — build the manifest lookup
from day one, ship with an empty manifest, and files slot in as the founder finishes recording.

---

## 6. Build order

Follow the master plan's §15 build order. The existing home page already covers the entry
point; from there:

**First — chrome.** Scrim, pills, CTA, back button, grown-up press-and-hold gate, type scale.
Build the quiet state at the same time — it's a small CSS/state toggle, not a separate
feature, and it's much harder to retrofit than to build in.

**Then — the spine.** Check-in → reflection → trusted-adult screen. Three screens, fully
working, including the auto-advance and the quiet-state branch. This is the smallest version
of the app that's worth putting in front of a real child — stop here and ask the founder to
test it before building further.

**After that** — the rest of the path, then the rooms/games — only once the spine is
validated. Don't build ahead of what's been tested with an actual child.

---

## 7. Acceptance checklist for the first milestone (chrome + spine)

Before calling this done, verify against the prototype:

- [ ] Every tap on a choice auto-advances — no screen has a lingering "Next" button on a
      selection screen (the CTA screens like the closing teaching are the exception; those
      advance on tap-anywhere too, but show a visible "Next"/final button by design)
- [ ] Picking "really big" on the intensity screen triggers the quiet state: motion stops,
      choices shrink, Chirpy disappears, touch targets grow, a real "stop here for now" exit appears
      — and none of this is announced to the child
- [ ] Chirpy never appears on the trusted-adult screen
- [ ] "I don't know" / "I can't tell" render as full-width options, same size and weight as
      every other choice — never smaller, never a link
- [ ] No screen anywhere shows a score, a streak, a checkmark, or the word "correct"
- [ ] The grown-up panel is reachable only by a ~1.4s press-and-hold, not a tap
