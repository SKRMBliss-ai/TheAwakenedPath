# Spiritual Diary — Integration Plan & Wireframe

**Source:** The Self-Introspective Diary of **Sant Kirpal Singh Ji Maharaj** — a
daily ledger of ethical lapses kept for one month, tallied at month's end
against inner spiritual experience.

**Goal:** Bring this diary into the Practice section so it works *with* the
existing Nine Virtues and Sixfold Path, not as a bolted-on second system.

---

## 0. The one decision to make first (philosophy)

The diary and this app pull in opposite directions, and that has to be resolved
before a line of code is written:

| The diary as written | This app's stated design |
|---|---|
| Count your **failures** each day | `DD-*` + `.agent/rules/presence-over-progress` — *no competitive scoring*, reward is ambient |
| A grid of 8 categories × 31 days | Sixfold is deliberately **checkbox-free** ("asking for three daily completions would make it a chore") |
| Tally lapses, judge the month | Virtues meet lapses "with equal kindness", "without judgment" |

**Recommendation — keep the diary's honesty, drop its scorekeeping tone.**
Sant Kirpal Singh's own instruction was that the diary is *for seeing, not for
self-punishment* — "note failures without justification, then let them go." That
is already the exact voice of the Virtues rail (`virtues.ts` prayers). So:

- We keep the **structure** (his 8 categories, the daily entry, the month-end
  reflection) faithfully.
- We reframe the **verb**: not "log a failure" but "note where it slipped" —
  the same phrase the daily journal prompts already use.
- Marks are **private, never shared, never scored competitively**. No streaks,
  no leaderboards, no points. A month-end view *shows the writer their own
  pattern* — that is the only "result".

If the studio wants the literal failure-count faithfully, that's a legitimate
call — this plan supports both; see §6 (display modes). But the default should
match the app's covenant with its (older, non-competitive) users.

---

## 1. What the diary actually contains

Eight observation categories, each with sub-lines marked daily:

1. **Ahimsa (Non-violence)** — In Thought · In Word · In Deed
2. **Truthfulness** — Falsehood · Deceit · Hypocrisy · Fraud · Illegal gain
3. **Chastity** — In Thought · In Word · In Deed
4. **Humility** — Vanity of Knowledge · Pride of Wealth · Intoxication of Power
5. **Love for All / Hatred for None** — In Thought · In Word · In Deed
6. **Spiritual Practice (time devoted)** — Simran/Dhyan · Bhajan (Sound Current) · Satsang
7. **Diet** — Foods
8. **Selfless Service** — Physically · Financially

Month-end reflection column:
- Extent of Withdrawal from Sensual Consciousness
- Inner Experience of Vision
- Inner Experience of Hearing
- Any Difficulty in Meditation

Note two different row *types*: categories **1–5, 7, 8** are ethical
self-observation (mark a lapse); category **6** is a **positive time log** (how
long you practised) — the opposite polarity. The UI must treat them differently.

---

## 2. How it maps onto what already exists

The diary is not a competing framework — it's a **third lens** on the same
practice. Mapping keeps the three coherent instead of three parallel silos.

### 2a. Diary ethics ↔ Nine Virtues (`virtues.ts`)

The nine virtues are the *aspirational* face; the five diary ethics are the
*guardrail* face of the same ground.

| Diary category | Closest virtue(s) | Relationship |
|---|---|---|
| Ahimsa (non-violence) | Gentleness, Caring, Tolerance | the restraint under the warmth |
| Truthfulness | Sincerity, Commitment | the diary tests the virtue in the concrete |
| Chastity | Detachment, Commitment | energy not leaking outward |
| Humility | Graciousness, Acceptance | the diary names the three prides to watch |
| Love for All / Hatred for None | Caring, Tolerance, Gentleness | the virtue's daily audit |

**Design use:** in the week a virtue is active, its diary counterpart's rows are
gently highlighted — "this is where today's virtue gets tested." One arc, seen
from two sides.

### 2b. Diary practice ↔ Sixfold Path (`sixfold.ts`)

| Diary category | Sixfold flow |
|---|---|
| Truthfulness | Right Speech, Right Vision |
| Ahimsa / Love for All | Right Action, Right Intention |
| Spiritual Practice (Simran/Bhajan) | Right Devotion, Right Presence |
| Humility | Right Vision |

The Sixfold rail already surfaces one flow per week — when a diary category
lines up with that week's flow, the rail can point to it.

### 2c. Diary category 6 ↔ existing sit/meditation tracking

Category 6 (Simran/Dhyan, Bhajan, Satsang) is **already half-built**:
- `users/{uid}/practiceDays.sat` records the daily sit.
- `meditation_sessions` / `meditation_journals` record community sits.

So the diary's "time devoted" row should **read from existing data**, not ask
the user to log the same sit twice. The sit they already recorded pre-fills the
diary. This is the single most important integration point — it makes the diary
feel connected rather than redundant.

---

## 3. Data model

Follows the established owner-only subcollection pattern. Firestore rule
`match /users/{userId}/{coll}/{doc=**}` (firestore.rules:60) **already protects
any new subcollection** — no rule change needed for private diary data.

```
users/{uid}/diaryDays/{YYYY-MM-DD}
  date:        "2026-08-25"
  month:       "2026-08"          // for month-end rollup queries
  marks: {                        // category.subline -> count (lapses) or minutes (cat 6)
    ahimsa_thought: 2,
    ahimsa_word: 0,
    truthfulness_deceit: 1,
    practice_simran: 20,          // minutes, pre-filled from practiceDays.sat where possible
    practice_satsang: 0,
    diet_foods: 0,                // 0 = kept / 1 = lapsed  (binary for diet)
    service_physically: 1,
    ...
  }
  note:        "one private line"  // optional, mirrors the journal prompt box
  updatedAt:   serverTimestamp

users/{uid}/diaryMonths/{YYYY-MM}
  month:       "2026-08"
  totals: { ahimsa_thought: 14, ... }        // computed on read or on close
  withdrawal:  "…"        // the four month-end reflection fields
  visionExp:   "…"
  hearingExp:  "…"
  meditationDifficulty: "…"
  closedAt:    serverTimestamp
```

- **Private only.** Nothing here is ever written to `practice_entries` (the
  shared feed). This is the most intimate data in the app; it never leaves the
  owner's subtree. State that explicitly in code comments, as the existing
  privacy rule block does.
- Month-end totals can be derived on the fly from `diaryDays`; store them only
  when the month is "closed" so a completed month is immutable.

---

## 4. Where it lives in the app

Practice section already has: **Today · Practices · Virtues** (sidebar group,
`UntetheredSoulApp.tsx`). The diary is a fourth sibling.

```
PRACTICE
  ├ Today        (daily rhythm + journal prompt)   ← existing
  ├ Practices    (library)                          ← existing
  ├ Virtues      (9-virtue arc + sixfold rails)     ← existing
  └ Diary        (self-introspection)               ← NEW  tab id: 'diary'
```

Plus a **lightweight daily touchpoint on the Today card**: a single collapsed
row "Tonight's diary — 8 quiet checks" that opens the full Diary tab. Evening
is when this diary is traditionally kept, so it belongs in the day's closing,
not competing with the morning sit.

---

## 5. Wireframes

### 5a. Diary tab — daily entry (the primary screen)

```
┌───────────────────────────────────────────────────────────────┐
│  Spiritual Diary                          Tue · 25 Aug          │
│  A quiet, honest look — noted without judgment, then released.  │
│                                                                 │
│  ┌─ This week's virtue: Detachment ───────────────────────┐    │
│  │  Its guardrail in the diary is Chastity ↓ highlighted   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  1 · AHIMSA — Non-violence                                      │
│      In thought      · · · · ·   [–]  0  [+]                    │
│      In word         · · · · ·   [–]  0  [+]                    │
│      In deed         · · · · ·   [–]  0  [+]                    │
│                                                                 │
│  2 · TRUTHFULNESS                                               │
│      Falsehood       [–] 0 [+]   Deceit   [–] 1 [+]            │
│      Hypocrisy · Fraud · Illegal gain      (tap to expand)     │
│                                                                 │
│  3 · CHASTITY   ◆ highlighted — today's virtue tests here      │
│      In thought / word / deed              [–] 0 [+]           │
│                                                                 │
│  4 · HUMILITY   Vanity · Pride of wealth · Intoxication of power│
│  5 · LOVE FOR ALL / HATRED FOR NONE   thought / word / deed    │
│  ─────────────────────────────────────────────────────────    │
│  6 · SPIRITUAL PRACTICE  (time — pulled from your sit)         │
│      Simran / Dhyan   ▓▓▓▓░  20 min   ✓ from today's sit       │
│      Bhajan (Sound Current)          [ 0 min ]                 │
│      Satsang                          [ 0 min ]                 │
│  ─────────────────────────────────────────────────────────    │
│  7 · DIET — kept today?          ( ) kept   ( ) slipped        │
│  8 · SELFLESS SERVICE   Physically ☐   Financially ☐          │
│                                                                 │
│  A private line, if you wish:                                   │
│  [ ......................................................... ]  │
│                                                                 │
│                              [ Save today's diary ]            │
└───────────────────────────────────────────────────────────────┘
```

Interaction notes:
- **Steppers, not a 31-wide grid.** The paper grid is for a whole month at a
  glance; on a phone that's unreadable. One day at a time; the month grid is a
  separate read-only view (§5b).
- **Default 0 / "kept".** Opening the diary shows a clean day — you only touch
  what slipped. A blank day is a good day, not an unfilled form.
- **Category 6 pre-fills** from `practiceDays.sat` — the checkmark shows it came
  from a sit already recorded.
- The tone line at top is fixed and gentle — this is the guardrail against the
  ledger feeling punitive.

### 5b. Month view — the "results at end of the month"

```
┌───────────────────────────────────────────────────────────────┐
│  August 2026                        ‹ prev   month   next ›     │
│                                                                 │
│         1  2  3  4  5 … 25 26 … 31     ← faithful grid, read-only│
│  Ahimsa ·  ·  1  ·  · …  ·        Σ 6                           │
│  Truth   ·  2  ·  ·  · …  1       Σ 9                           │
│  …                                                              │
│  Practice(min)  20 15 0 30 …            Σ 410 min               │
│                                                                 │
│  ── Pattern, gently ────────────────────────────────           │
│  Most-noted this month: Truthfulness · Deceit (9)              │
│  Quietest: Ahimsa in deed (0)                                  │
│  Practice held on 22 of 31 days.                               │
│                                                                 │
│  ── Sant Kirpal Singh's month-end reflection ──                │
│  Extent of withdrawal from sensual consciousness   [        ]  │
│  Inner experience of Vision                        [        ]  │
│  Inner experience of Hearing                       [        ]  │
│  Any difficulty in meditation                      [        ]  │
│                                                                 │
│                              [ Close & keep this month ]        │
└───────────────────────────────────────────────────────────────┘
```

This is the one place the original 8×31 grid is reproduced faithfully — as a
**reflection**, after the month, not as a daily data-entry surface.

---

## 6. Display modes (studio's philosophy toggle)

One config flag decides tone, so the studio need not fork the code:

- **`gentle` (default):** counts shown, but framed as "noted", warm copy, no
  streak/score, month view emphasises *pattern* over *total*.
- **`faithful`:** literal "Failures" heading and raw tallies exactly as the
  paper diary, for initiates who keep it the traditional way.

Store as a per-user preference (`users/{uid}.diaryMode`) so a traditional
practitioner and a newcomer each get the register they expect.

---

## 7. Build phases

1. **Data + tab shell** — `diaryDays` model, `'diary'` tab, sidebar entry,
   empty daily screen. (rule already covers privacy)
2. **Daily entry UI** — the eight categories as steppers/toggles, save/load a
   day, the gentle tone line.
3. **Sit pre-fill** — read `practiceDays.sat` into category 6 so the diary
   reuses the recorded sit instead of asking twice. *(highest-value link)*
4. **Virtue/Sixfold cross-highlight** — light up the diary rows tied to the
   active virtue and sixfold flow (§2a/§2b).
5. **Month view** — read-only 8×31 grid, the pattern summary, the four
   month-end reflection fields, "close month" → immutable `diaryMonths` doc.
6. **Today-card touchpoint** — the collapsed evening row that opens the diary.
7. **Mode toggle** — `gentle` / `faithful` (§6).

Phases 1–3 are the meaningful MVP: a private daily diary that reuses the sit
you already log. 4–7 are what make it feel native rather than adjacent.

---

## 8. Files this will touch

| File | Change |
|---|---|
| `src/features/practice-path/diary.ts` | **new** — the 8 categories + sublines as data, mode copy |
| `src/features/practice-path/DiaryView.tsx` | **new** — daily entry screen (§5a) |
| `src/features/practice-path/DiaryMonth.tsx` | **new** — month grid + reflection (§5b) |
| `src/features/practice-path/useDiary.ts` | **new** — load/save `diaryDays`, month rollup, sit pre-fill |
| `src/UntetheredSoulApp.tsx` | add `'diary'` to allowed tabs, sidebar Practice group, and the tab render block |
| `src/features/practice-path/PracticePathView.tsx` | the collapsed evening touchpoint row |
| `firestore.rules` | **no change** — `users/{uid}/{coll}/**` already owner-only |

No backend/Cloud Function work: the diary is pure client + owner-scoped
Firestore, like `practiceDays` today.

---

## 9. Open questions for the studio

1. **Default mode** — `gentle` or `faithful`? (This plan assumes `gentle`.)
2. **Diet & Service granularity** — the paper diary leaves Diet/Service open;
   binary kept/slipped, or free count? (Plan assumes binary Diet, count Service.)
3. **Calendar month vs practice week** — the diary is monthly; the virtues run
   on a 9-week arc and the sit on a fixed anchor. Month view stays calendar-month
   (faithful to the source); the cross-highlight bridges to the weekly systems.
4. **Attribution** — show "The Self-Introspective Diary of Sant Kirpal Singh Ji
   Maharaj" as a credited subtitle on the tab? (Recommended — honours the source.)
```
