# MindGym — Journal & Weekly Practice Upgrade
## Tasks

### Status key
- [x] Done
- [ ] Not started
- [~] In progress

---

## Phase 1 — Expanded Emotion Matrix

- [x] **1.1** Replace `MORE_WORDS` flat arrays with structured `SUPPLEMENTARY` object covering 4 categories: Social & Belonging, Self-Evaluation, Future-Oriented, Reflective
- [x] **1.2** Add expandable category pills to `EmotionStep` below the core matrix grid
- [x] **1.3** Implement pleasantness-aware word filtering (pleasant → positive/belonging, unpleasant → negative/rejection)
- [x] **1.4** Animate category expansion with `AnimatePresence` (height 0 → auto)
- [x] **1.5** Verify total emotion vocabulary ≥ 120 unique words

---

## Phase 2 — Journal Tab

- [x] **2.1** Add `JournalTab` component as second tab in the 3-tab shell
- [x] **2.2** Build `MoodSparkline` — 7-day animated bar chart, bars coloured by average pleasantness, day labels below
- [x] **2.3** Build `EmotionFrequencyChart` — top-6 emotions, animated width bars, frequency count labels
- [x] **2.4** Add filter pills (All / Difficult / Pleasant) with instant filtering
- [x] **2.5** Group entries by date with date header labels
- [x] **2.6** Build `EntryCard` — emotion name + colour dot, relative timestamp, thought snippet (2-line clamp), body zone + action tags
- [x] **2.7** Build `EntryDetail` bottom-sheet modal — full breakdown, spring animation, drag-handle, close button
- [x] **2.8** Add empty state (🌿 illustration + message) when no check-ins exist
- [x] **2.9** Wire journal to read from `localStorage` key `mindgym-checkins` (same array the check-in flow writes to)

---

## Phase 3 — Weekly Practice System

- [x] **3.1** Add `WeeklyPracticeTab` as third tab with inner sub-tab navigation (Practice / Log Day / Leaders / ⚙ Admin)
- [x] **3.2** Build `AdminPracticeEditor` form — title, teacher, video URL, description, daily instruction; writes to `localStorage`
- [x] **3.3** Gate admin sub-tab behind email check (`ADMIN_EMAILS` array in component)
- [x] **3.4** Build practice display view — Day X of 7 badge, title, teacher, video iframe embed, description, daily instruction highlight block
- [x] **3.5** Build `PersonalHeatmap` — 7-square grid showing done/pending days with day labels and X/7 counter
- [x] **3.6** Build `DailyLogForm` — name capture (first use), done toggle, quick note, deeper reflection, save to `localStorage`
- [x] **3.7** Pre-populate log form with today's existing entry if already logged
- [x] **3.8** Build `Leaderboard` — aggregate days done per user, rank by count, medals 🥇🥈🥉, 7-dot progress bars
- [x] **3.9** Empty state for leaderboard ("No one has logged yet — be the first")
- [x] **3.10** Empty state for practice tab when no practice set and user is not admin

---

## Phase 4 — Shell & Polish

- [x] **4.1** Build 3-tab top nav bar (sticky, MIND GYM brand + Check-in / Journal / Practice tabs)
- [x] **4.2** Lift `entries` state and `saveEntry` to root `MindGym` component
- [x] **4.3** Pass `userEmail` prop to `MindGym` for admin detection
- [x] **4.4** Remove unused `useRef` import
- [x] **4.5** Fix `SUPPLEMENTARY.social.belonging` typo ("Purchased" → "Cherished")
- [x] **4.6** Verify all tabs transition with `AnimatePresence mode="wait"` + `fade` variant

---

## Remaining / Future Work

- [ ] **F.1** Firestore sync for leaderboard — so all users across devices share one leaderboard per practice week
- [ ] **F.2** Weekly practice archive — admins can browse past weeks; users can see historical practices
- [ ] **F.3** Wire `userEmail` prop from `UntetheredSoulApp.tsx` or wherever `MindGym` is rendered
- [ ] **F.4** Admin: "Start New Week" button that archives current logs and resets the practice (preserving history)
- [ ] **F.5** Streak tracking per user across weeks in the practice leaderboard
- [ ] **F.6** Export journal entries (PDF or share card)
- [ ] **F.7** Daily reminder notification at user-chosen time
