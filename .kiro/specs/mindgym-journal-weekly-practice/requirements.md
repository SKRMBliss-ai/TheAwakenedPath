# MindGym — Journal & Weekly Practice Upgrade
## Requirements

### Background
The MindGym emotional check-in tool (`MindGym.jsx`) needed three upgrades:
1. Richer emotion vocabulary (120+ emotions across all Barrett-model categories)
2. An intuitive emotional journal with history timeline and mood analytics
3. A structured weekly practice system — admin creates the week's practice, users log daily, a leaderboard tracks participation

---

## Requirement 1 — Expanded Emotional Granularity (120+ emotions)

### User Stories
- As a user, I want to see more precise emotion labels so I can name what I'm actually feeling
- As a user, when I'm feeling something social (ignored, excluded, belonging), I want those words available
- As a user, when I'm in self-evaluation mode (shame, proud, fraudulent), I want those words available
- As a user, when I'm future-focused (dread, hopeful, anticipatory), I want those words available
- As a user, when I'm reflective (nostalgic, wistful, bittersweet), I want those words available

### Acceptance Criteria
- [ ] Core matrix: 5 energy × 5 pleasantness = 25 cells, 7 emotions each (175 core emotions)
- [ ] Supplementary categories shown as expandable pills below the core grid:
  - Social & Belonging (belonging + rejection words, filtered by pleasantness)
  - Self-Evaluation (positive + negative words, filtered by pleasantness)
  - Future-Oriented (positive + negative words, filtered by pleasantness)
  - Reflective (15 words, always shown)
- [ ] Tapping a category pill expands its words inline with AnimatePresence
- [ ] "My own word" custom input remains available
- [ ] Total vocabulary: 120+ unique emotions accessible from one screen

---

## Requirement 2 — Emotional Journal / History Timeline

### User Stories
- As a user, I want to see all my past check-ins as a scrollable timeline
- As a user, I want to understand my mood patterns over the last 7 days
- As a user, I want to know which emotions I experience most frequently
- As a user, I want to filter my entries by difficult or pleasant states
- As a user, I want to tap any entry to see the full detail (body, thought, action, coaching)

### Acceptance Criteria
- [ ] Journal is a dedicated tab ("Journal") next to Check-in
- [ ] 7-day mood sparkline: a bar chart where bar height = average pleasantness for that day, colour-coded
- [ ] Emotional landscape: animated horizontal bar chart of top 6 emotions by frequency
- [ ] Filter pills: All / Difficult (pleasantness ≤ 2) / Pleasant (pleasantness ≥ 4)
- [ ] Entries grouped by date (e.g. "MONDAY, JULY 14")
- [ ] Each entry card shows: emotion name + colour, relative timestamp, thought snippet (2 lines max), body zone tags, action tag
- [ ] Tapping an entry opens a bottom-sheet modal (slide up) with full detail:
  - Energy + pleasantness labels
  - Full mind story quote
  - All body zones + sensations
  - Release level
  - Conscious action
- [ ] Empty state: friendly message when no check-ins exist yet
- [ ] All data sourced from `localStorage` key `mindgym-checkins`

---

## Requirement 3 — Weekly Practice System

### User Stories
- As an admin, I want to create a new weekly practice each week with a title, teacher, video, and daily instruction
- As an admin, I want to publish the practice so all users see it immediately
- As a user, I want to see this week's practice with the embedded video
- As a user, I want to mark each day's practice as done and add a short note
- As a user, I want to see my 7-day completion heatmap
- As a user, I want to see a leaderboard of who has practised most days this week

### Acceptance Criteria

#### Admin (emails: rashmi.purbey@gmail.com, skrmblissai@gmail.com)
- [ ] Practice tab shows a `⚙ Admin` sub-tab for admin users only
- [ ] Admin form fields: Practice Title, Teacher/Source, Video URL, Context/Description, Daily Practice Instruction
- [ ] Saving writes to `localStorage` key `mindgym-weekly-practice`
- [ ] After saving, admin is returned to the Practice view
- [ ] "Publish Practice" button turns to "✓ Saved!" on success

#### Practice View (all users)
- [ ] Shows week start date + "Day X of 7" badge
- [ ] Practice title and teacher attribution
- [ ] YouTube/video embed (16:9 aspect ratio, rounded corners)
- [ ] Context description card
- [ ] Daily practice instruction (left-accent highlighted block)
- [ ] "Log Today's Practice" CTA button — turns teal with ✓ if already logged today

#### Log Day
- [ ] Personal 7-day heatmap showing which days are done (teal) vs pending
- [ ] Shows "X/7 days" count
- [ ] Name capture on first use (persisted to `localStorage`)
- [ ] Done toggle: tap to mark/unmark today's practice complete
- [ ] Optional: quick note (1–2 sentences)
- [ ] Optional: deeper reflection (3–4 sentences)
- [ ] Save writes to `localStorage` keys: `mindgym-weekly-logs`, `mindgym-leaderboard`, `mindgym-username`
- [ ] Re-opening the log shows previously saved data

#### Leaderboard
- [ ] Ranked by number of days completed (done = true) this week
- [ ] Shows: rank medal (🥇🥈🥉), name, 7-dot progress bar, X/7 score
- [ ] Top entry has gold highlight
- [ ] Empty state when no one has logged yet

---

## Non-Functional Requirements
- [ ] All data stored in `localStorage` — no backend dependency for this feature
- [ ] All animations via Framer Motion (no CSS-only transitions on interactive elements)
- [ ] Mobile-first, max-width 520px container
- [ ] Minimum touch target 44px height on all interactive elements
- [ ] Dark background only (`T.bg` palette) — this component is standalone, not theme-toggled
- [ ] No TypeScript — pure JSX (`.jsx` file)
- [ ] No new npm dependencies — only `react` and `framer-motion` (already installed)
