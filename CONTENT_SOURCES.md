# Content Sources Reference

This document maps where content originates across The Awakened Path application.

## Story Lab

### Thoughts (Clouds)
**Source:** `src/features/practise/kids-v1/kit/storyLabContent.ts`

Thoughts are hardcoded and organized by feeling. Each feeling pool contains 17 thoughts, shuffled on load and displayed 8 at a time via a rotating window.

**Feeling Categories:**
- `happy` - 17 positive affirmation thoughts
- `excited` - 17 energized/anticipatory thoughts
- `calm` - 17 peaceful/centered thoughts
- `sad` - 17 melancholic/loss-related thoughts
- `angry` - 17 frustrated/conflict-related thoughts
- `scared` - 17 fear/uncertainty-related thoughts
- `worried` - 17 anxious/anticipatory thoughts
- `jealous` - 17 comparison/envy-related thoughts
- `other` - 17 miscellaneous thoughts

**Theme Categories** (organize narrative consequences):
- `rejection` - social exclusion scenarios
- `failure` - performance/capability scenarios
- `unfairness` - justice-related scenarios
- `uncertainty` - unknown-outcome scenarios
- `loss` - absence/grief scenarios
- `conflict` - interpersonal tension scenarios
- `pressure` - demand/expectation scenarios
- `comparison` - relative-standing scenarios
- `bright` - positive reframe scenarios

### Story Events
**Source:** `src/features/practise/kids-v1/kit/storyLabContent.ts`

Events follow the thought, not the feeling. Each thought carries a theme, and themes carry event lists. This creates 12 distinct event scenarios rather than 81 feeling-thought combinations.

### "Another Way" Possibilities
**Source:** `src/features/practise/kids-v1/kit/storyLabContent.ts` (`POSSIBILITIES`, `possibilitiesFor`)

Step 6 ("Another Way") follows the same theme routing as events: the reframe options offered are keyed by the theme of the thought the child picked (or the feeling's default theme), not a single fixed list. Each of the 9 themes (`rejection`, `failure`, `unfairness`, `uncertainty`, `loss`, `conflict`, `pressure`, `comparison`, `bright`) has its own pool of 8 alternative-perspective lines, shown 3 at a time in a rotating window plus "My own idea…". This is the single file to hand to a child psychologist for editorial review of the reframe language.

### Voice (Chirpy)
**Primary:** Gemini TTS via `https://awakened-path-2026.web.app/api/chirpy-voice`
**Fallback:** Browser Web Speech API (`speechSynthesis`)

**Source:** `src/features/practise/kids-v1/kit/chirpyVoice.ts`

- Gemini provides Chirpy's real voice (character-appropriate TTS)
- Browser voice covers offline, budget exhaustion, Function downtime
- Both voices start immediately; Gemini takes over when network arrives
- Cache-Control on server response ensures repeats are CDN-served
- Voices are deferred 60ms after cancel to prevent Chrome's cancel/speak race condition

### UI Components
**Source:** `src/features/practise/kids-v1/best/StoryLabRoom.tsx`
- Thinking boy sprite
- Decorative note ("Your Thoughts Matter")
- Books on shelf graphics
- Lit sign background

**Styles:** `src/features/practise/kids-v1/best/StoryLabRoom.css`
- Drift animations with CSS custom properties
- Panel layout and responsive breakpoints
- Thought cloud scatter/positioning

### Feeling Companions
**Source:** `src/features/practise/kids-v1/kit/feelingCompanions.ts`

Companion dialogue/reaction keyed to the child's stated feeling.

---

## Games Room (Behaviour Practice)

### Behaviour Scenarios
**Source:** `src/assets/mind-gym-180-balanced-behaviour-scenarios.ts`

Contains `BEHAVIOUR_PILLARS` — behavior categories and scenario sets for the games. Imported in:
- `src/features/practise/kids-v1/best/GamesRoom.tsx`
- `src/features/practise/kids-v1/kit/gamesRoomThemes.ts`
- `src/features/practise/kids-v1/kit/behaviourPractice.ts`

### Game Themes
**Source:** `src/features/practise/kids-v1/kit/gamesRoomThemes.ts`

Defines visual themes and styling for different behavior categories.

### Voice (Narration)
Uses same system as Story Lab:
- Gemini TTS primary
- Browser API fallback
- 60ms deferral after cancel

**Source:** `src/features/practise/kids-v1/kit/sound.ts`

---

## Check-In & Navigation

### Feeling Options
**Source:** `src/features/practise/kids/checkIn/CheckIn.tsx` or equivalent

Six core feelings + two additional options (the "founder asked for" these):
- Happy, Excited, Calm, Sad, Angry, Scared, Worried, Jealous, Other

### Room Navigation
**Source:** `src/features/practise/kids-v1/hub/Hub.tsx` (or equivalent navigation module)

Handles child entry, room selection, progress tracking.

---

## Sound Effects & Muting

**Source:** `src/lib/sfx.ts`

- `isMuted()` - checks device mute toggle and app quiet state
- `setMuted()` - controls app-level sound control
- Applies to both Chirpy speech and sound effects
- One silence switch honored everywhere (not separate toggles)

---

## Data Persistence

**Kid Store:**
**Source:** `src/features/kids/store.ts` or `src/features/practise/kids/store.ts`

Stores:
- Child's name
- Current feeling (from check-in)
- Progress/journey state
- Visit tracking

---

## Assets & Sprites

### Chirpy Sprite
**Source:** `src/features/practise/kids-v1/ui/sprites.ts`

Imports Chirpy character image/animation frames.

### Other Visual Assets
- Room backgrounds
- Button icons
- Decorative elements

**Location:** Typically in `src/assets/` or embedded as data URIs

---

## Configuration & Styling

### Responsive Breakpoints
- **Phone (max-width: 899px):** 390px viewport primary
- **Desktop (min-width: 900px):** Full-width layouts

### CSS Custom Properties (Dynamic)
- `--drift-x`, `--drift-y`, `--drift-rot`, `--drift-dur`: Thought cloud animation variables
- `--drift-delay`: Stagger delay per cloud
- Generated via scattered CSS for each nth-child

---

## Summary Table

| Content | Source | Type |
|---------|--------|------|
| Story Lab thoughts | `storyLabContent.ts` | Hardcoded, feeling-keyed |
| Story Lab events | `storyLabContent.ts` | Hardcoded, theme-keyed |
| Behaviour scenarios | `mind-gym-180-balanced-behaviour-scenarios.ts` | Asset file |
| Chirpy voice (primary) | Gemini TTS API | Network |
| Chirpy voice (fallback) | Browser Web Speech API | Native API |
| Feeling companion dialogue | `feelingCompanions.ts` | Hardcoded |
| UI sprites & backgrounds | `sprites.ts` + assets | Imported images |
| Child data (name, feeling, progress) | Kid Store | Browser storage / state |
| Sound effects | `sfx.ts` | Depends on asset setup |

---

## Key Design Principles

1. **Feeling-Specific Content:** Thoughts, events, and companion reactions are tailored to the child's stated feeling, not generic
2. **Fallback Chains:** Voice has Gemini → browser; network failures don't silence the app
3. **One Silence Switch:** Device mute and app quiet state converge—no conflicting audio controls
4. **Cached Audio:** Gemini responses are cached both in-session and via CDN for repeated lines
5. **Data-Driven Isolation:** Asset files and hardcoded maps keep content separate from component logic
