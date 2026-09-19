# MindGym — Journal & Weekly Practice Upgrade
## Design

### Architecture Overview

`MindGym.jsx` is a **self-contained React component** at the project root.
It has no TypeScript, no Firebase, no theme system — it uses its own `T` colour object and `localStorage` for persistence.

The component is structured as a **3-tab shell**:

```
MindGym (root export)
├── Top nav bar  (sticky, "MIND GYM" brand + 3 tab buttons)
├── Tab: checkin  → CheckInFlow
│     ├── PauseStep
│     ├── EnergyStep
│     ├── PleasantStep
│     ├── BodyStep
│     ├── EmotionStep  ← upgraded with SUPPLEMENTARY categories
│     ├── ThoughtStep
│     ├── ObserveStep
│     ├── ReleaseStep
│     ├── ChoiceStep
│     └── CompletionStep
├── Tab: journal  → JournalTab
│     ├── MoodSparkline         (7-day bar chart)
│     ├── EmotionFrequencyChart (top-6 animated bars)
│     ├── Filter pills
│     ├── EntryCard × N         (grouped by date)
│     └── EntryDetail           (bottom-sheet modal, AnimatePresence)
└── Tab: practice → WeeklyPracticeTab
      ├── Sub-tab: practice     (video + instructions)
      ├── Sub-tab: log          (PersonalHeatmap + DailyLogForm)
      ├── Sub-tab: board        (PersonalHeatmap + Leaderboard)
      └── Sub-tab: admin        (AdminPracticeEditor — admin only)
```

---

### Data Model

#### Check-in entry (`mindgym-checkins` — array)
```js
{
  id: string,           // crypto.randomUUID()
  dateTime: string,     // ISO 8601
  energyLevel: 1-5,
  pleasantness: 1-5,
  bodyLocations: string[],   // e.g. ["chest", "stomach"]
  bodySensations: string[],  // e.g. ["Tight", "Heavy"]
  emotion: string,           // selected or custom word
  thought: string,
  observationDuration: number,  // seconds
  releaseLevel: "yes"|"somewhat"|"not-yet",
  nextAction: string,
}
```

#### Weekly practice (`mindgym-weekly-practice` — single object)
```js
{
  id: string,
  title: string,
  teacherName: string,
  videoUrl: string,          // YouTube embed URL
  description: string,
  dailyInstruction: string,
  startDate: string,         // ISO — used to calculate Day X of 7
  createdAt: string,
}
```

#### Practice daily log (`mindgym-weekly-logs` — array)
```js
{
  id: string,
  practiceId: string,
  date: string,       // YYYY-MM-DD
  userName: string,
  done: boolean,
  note: string,
  reflection: string,
  savedAt: string,
}
```

#### Leaderboard snapshot (`mindgym-leaderboard` — array)
```js
{
  // same shape as daily log entry — one record per user per practice
  // days completed = count of unique `date` values where done=true
}
```

---

### Emotion System Design

**Core matrix:** `MATRIX[energy-1][pleasantness-1]` → array of 7 strings

**Supplementary object:**
```js
SUPPLEMENTARY = {
  social:    { label, color, belonging: [...], rejection: [...] },
  selfEval:  { label, color, positive: [...], negative: [...] },
  future:    { label, color, positive: [...], negative: [...] },
  reflective:{ label, color, words: [...] },
}
```

**Selection logic:** When pleasantness ≥ 3, show `positive`/`belonging`. When < 3, show `negative`/`rejection`. Reflective always shows all words.

---

### Component Decisions

| Decision | Choice | Reason |
|---|---|---|
| State persistence | `localStorage` only | No auth dependency, instant, works offline |
| Admin guard | Email string match in component | Consistent with `src/config/admin.ts` pattern, no backend call needed |
| Leaderboard data | `localStorage` | MVP — shared leaderboard would need Firestore; local is sufficient for group sessions where everyone uses same device/browser |
| Emotion expansion | AnimatePresence height: 0 → auto | Smooth, no layout jump |
| Entry detail | Bottom-sheet slide-up | Mobile-native feel, doesn't lose scroll position |
| Video embed | `<iframe>` with `frameBorder="0"` | Works for YouTube `/embed/` URLs and most direct video URLs |

---

### Colour Tokens (T object)

```js
T.bg     = deep purple radial gradient  (background)
T.text   = #F4E3DA                      (primary text)
T.sub    = rgba(244,227,218,0.45)       (secondary text)
T.faint  = rgba(244,227,218,0.2)        (labels, timestamps)
T.rose   = #C65F9D                      (primary accent — check-in CTAs)
T.teal   = #ABCEC9                      (secondary accent — body, journal)
T.gold   = #E8B86D                      (admin, leaderboard #1)
T.card   = rgba(255,255,255,0.03)       (card backgrounds)
T.border = rgba(255,255,255,0.07)       (card borders)
```

---

### Key Utility Functions

- `formatRelativeTime(isoString)` — "just now" / "3h ago" / "yesterday" / "Jul 12"
- `emotionColor(entry)` — maps pleasantness level to PLEASANT color
- `energyBar(level)` — renders 5 dots, filled up to energy level
- `getDayNumber(startDateISO)` — days since practice started, capped 1–7
- `todayISO()` — returns `YYYY-MM-DD` for today

---

### Future Enhancements (out of scope for this spec)
- Firestore sync for leaderboard (so all users share one leaderboard)
- Weekly practice history archive (past weeks browsable)
- Push notification at chosen daily practice time
- Admin ability to set a new practice without resetting old logs
- Export journal entries as PDF
