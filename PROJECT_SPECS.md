# MindGym - Project Specifications & Requirements

This document serves as the single source of truth for the **MindGym / Untethered** application's requirements, design guidelines, and strict coding standards. All future enhancements and bug fixes **must** adhere to this document to ensure consistency, type safety, and architectural integrity.

---

## 1. Project Overview
MindGym is a gamified mindfulness, mental health, and presence-intelligence application. It guides users through various mindfulness practices (Breathing, Witness Consciousness, Presence, Energy, Reframing) while rewarding them with XP and tracking their journey to mental wellness.

### 1.1. Detailed Core Features

*   **Journey / Dashboard:** A daily focus screen featuring ambient visual backgrounds, inspirational quotes, and quick access to the daily recommended practice. Entry point is `UntetheredSoulApp.tsx`, which routes to feature screens via a bottom navigation bar.

*   **Practice Library:** Categorized into:
    *   **Quick Shifts:** Short duration (< 1 minute) practices for instant resets.
    *   **Deep Dives:** Longer duration, multi-step practices with difficulty levels (beginner, intermediate, advanced).
    *   **Situational Practices:** Context-aware practices surfaced by `SituationalPractices.tsx` for specific life moments.
    *   **Weekly Assignment:** `useWeeklyAssignment` hook rotates a single Wisdom Untethered question per week based on account creation date. Designed to scale to 200+ questions via `QUESTION_IDS` array in `practiceLibrary.ts`.

*   **Practice Execution Engine (Modal):** Multi-step guided modals handling `intro` (instructions) and `active` (execution) states. Includes domain-specific visuals: `BreathingVisual`, `WitnessVisual` (floating thoughts), and `ReframingVisual`.

*   **Live Group Meditation (Meditation Room):** Zoom/Google Meet-style WebRTC live silent meditation sessions. Features include:
    *   Responsive participant video gallery with pinned self-view and mic/camera toggles (`useWebRTC` hook).
    *   Instructor Media Controls for synchronized sharing (YouTube via `react-youtube`, Audio, or Screen).
    *   Interactive floating emoji reactions, chat panel with toast notifications, and ambient Web Audio API chimes via `useRoomSounds` (join/leave/warning bells).
    *   Pre-join flow handled by `MeditationPreJoin.tsx`. Room state managed by `useMeditationStore` (Zustand).

*   **Presence Intelligence:** AI-guided (Gemini) introspection tools:
    *   **Body Truth Test:** Somatic resonance tool measuring "Expansion" vs. "Contraction" of thoughts.
    *   **Power of Now:** Structured teachings (4 chapters) with video progress tracking via `useCourseTracking`.
    *   **Witness & Release / Grounding Anchor:** Real-time AI-guided practices calling Cloud Functions via `/api/witness` and `/api/grounding`.
    *   **Analyze Emotion:** Emotion analysis calling `/api/emotion`.

*   **Courses Hub:** `CoursesHub.tsx` currently hosts the **Wisdom Untethered** course (`WisdomUntetheredCourse`), wrapping the `PowerOfNow` component with chapter-level progress. Expandable to additional courses.

*   **Sacred Soundscapes (Music Hub):** `MusicHub.tsx` — a premium audio marketplace:
    *   Flip-card UI for track browsing by mood (Calm, Uplifting, Deep, Healing, Meditation).
    *   Secure Firebase Storage streaming via `VoiceService.getCloakedUrl()` (prevents direct URL access).
    *   Per-track Razorpay purchase with regional pricing via `priceService.ts`.
    *   Post-purchase download via blob URL. Owned tracks stored in `profile.purchasedCourses`.
    *   Custom extended version requests via WhatsApp link.

*   **Voice Guidance:** `VoiceService` (`src/services/voiceService.ts`) — singleton audio manager:
    *   TTS playback routed through `/api/voice` → `textToSpeech` Cloud Function.
    *   Music/audio URL playback with status broadcasting (`subscribe` pattern).
    *   Mutual exclusivity: `useGenerativeAudio` stops when `VoiceService` starts playing, and vice versa.
    *   `MusicMiniPlayer` component for persistent playback controls.

*   **Generative Ambient Audio:** `useGenerativeAudio` hook generates procedural binaural beats + atmospheric drone entirely in-browser using Web Audio API:
    *   432Hz base with 4Hz binaural beat for Theta state (default).
    *   Vibrational state modes: `calm` (432Hz/4Hz), `focus` (528Hz/14Hz), `energy` (639Hz/40Hz).
    *   LFO-driven volume breathing effect (0.05Hz default), temple-like delay wash feedback loop.
    *   Fades in/out over 2 seconds; suspends AudioContext when idle.

*   **Journaling & Release:** Advanced journal forms (`GentleJournalForm`) featuring:
    *   `BodyMapSelector` to localize physical tension.
    *   `WitnessAndRelease` tool to process and let go of friction.
    *   AI-guided daily meditation via `/api/daily-meditation`.
    *   Emotion analysis via `/api/emotion`.
    *   Past reflections view in `PastReflections.tsx`.

*   **Gamification & Stats System:**
    *   Tracks User Level, XP, Streak, Witness Points, Presence Points, Zen Points.
    *   Energy Level alignment bar (Heart, Mind, Body).
    *   `StatsDashboard` and `PracticeLedger` for history and progress visualization.
    *   `JourneyProgress` for visual level/XP display.

*   **Achievements System:** `AchievementsPanel` + `useAchievements` hook:
    *   16 achievements across 4 categories: `witnessing`, `presence-study`, `streaks`, `practices`.
    *   Each achievement has a `check(stats: UserStats)` function evaluated against live stats.
    *   Point awards defined in `POINT_EVENTS` (e.g., `journal_entry: 15`, `streak_28: 200`).
    *   Categories and colors: Witnessing (lavender `#C6B4CE`), Presence Study (teal `#7EB8B3`), Streaks (amber `#F4A261`), Practices (rose `#C65F9D`).
    *   Medal display rendered via `MedalGrid` using Lucide icons as medal faces.

*   **Token / Trial System:** Token-gated feature access:
    *   New accounts receive 300 tokens on creation (`buildInitialTokenFields`, 7-day trial).
    *   Token costs per feature: `voice_guidance: 15`, `daily_journal: 10`, `freestyle_journal: 2`, `situational_practice: 5`, `daily_practice: 5`, `wisdom_chapter: 10`, `pow_chapter: 10`.
    *   Atomic Firestore transaction deduction in `deductTokens()` with ledger write to `users/{uid}/token_ledger`.
    *   `TokenGate` component wraps premium features; `PaymentWall` shown when tokens are exhausted.
    *   Token balance readable via `getTokenBalance(uid)`.

*   **Theme & Navigation:** Full dark/light mode support, ambient UI with Framer Motion transitions, modular bottom navigation bar, and integrated external links (e.g., WhatsApp support).

*   **Admin:** `EngagementReport` screen (access-controlled via `src/config/admin.ts`) for monitoring user engagement metrics.

---

## 2. Coding Standards & Global Rules

The following rules are mandatory and supersede general best practices:

### 2.1. TypeScript Strictness & Type Safety
*   **Rule:** All new components and functions must be strictly typed.
*   **Rule:** The usage of `any` is strictly **forbidden** unless absolutely necessary for external library integration (must be explicitly commented with justification). The one accepted pattern is `(window as any).webkitAudioContext` for Safari Web Audio API compatibility.
*   **Reasoning:** Prevents runtime errors and ensures gamification logic (XP calculations, timers, token deductions) remains robust.

### 2.2. Component Philosophy: Functional & Atomic
*   **Rule:** Use **only** React Functional Components with Hooks. Avoid class components entirely.
*   **Rule:** Adhere to **Atomic Design principles**. Components should be small, single-responsibility units.
    *   *Example:* A `PracticeCard` component should not contain the logic for the `PracticeModal`. Break the UI into manageable, reusable pieces (e.g., `<HeartbeatCard />`, `<ProgressBar />`, `<CircularTimer />`).
*   **Reasoning:** Large files (like the monolithic `App.tsx`) become unmanageable. Break UI into reusable pieces.

### 2.3. Styling Methodology
*   **Rule:** Use **Tailwind utility classes** (`clsx` and `twMerge` via the `cn()` utility at `src/lib/utils.ts`) for layout, spacing, typography, and standard responsive design.
*   **Rule:** Use standard **CSS modules** (e.g., `MusicHub.module.css`, `CourseTabs.module.css`) **only** for complex, multi-step animations or component-scoped styles that are cumbersome in Tailwind utilities.
*   **Rule:** Use custom CSS classes (e.g., `.card-heartbeat`) for specialized visual physics like "Surge" and "Heartbeat" effects.
*   **Note:** The project uses **Tailwind CSS v4** via the `@tailwindcss/vite` plugin — not the traditional PostCSS config. Do not add a `tailwind.config.js` or `postcss.config.js`.
*   **Reasoning:** Keeps styling rapid and consistent via Tailwind, reserving CSS modules for specialized per-component physics.

### 2.4. Animation Implementation
*   **Rule:** Use **CSS Animations** for infinite loops, simple hover states, or background visual physics (like ambient pulses, mouse glow).
*   **Rule:** Use **Framer Motion** for state-driven transitions, enter/exit animations (e.g., modals opening, steps changing, floating thoughts, flip cards), and complex gesture interactions.
*   **Rule:** Use **Web Audio API** (via `useGenerativeAudio`) for procedural ambient sound. Use `VoiceService` for TTS and music playback. The two are mutually exclusive — starting one stops the other.
*   **Reasoning:** Balances performance (CSS for background tasks) with expressive control (Framer Motion for UI flows).

### 2.5. Accessibility & Target Audience
*   **Rule:** The primary target demographic is **40+ years old**. Simplicity and clarity are top priorities.
*   **Rule:** All text must be clearly visible. Use adequately large font sizes, high contrast colors, and legible modern typography (avoiding overly thin or small fonts).
*   **Rule:** UI flows should be straightforward and intuitive, avoiding overly complex navigation or hidden interactions.
*   **Rule:** **Mobile and iPad Ease of Use is mandatory**. All designs must be fully responsive with touch targets (buttons, links) sized appropriately for fingers, and layouts optimized specifically for tablets and mobile screens.

---

## 3. Architecture & State Management

### 3.1. Project Structure
The project uses a feature-based architecture:

```
src/
  features/
    achievements/       # AchievementsPanel, useAchievements, achievementsDefs
    admin/              # EngagementReport (admin-only)
    audio/              # useGenerativeAudio (Web Audio API binaural beats)
    auth/               # AuthContext, EmailCaptureScreen, SignInScreen
    breath/             # Breathing practice components
    courses/            # CoursesHub, WisdomUntetheredCourse
    journal/            # GentleJournalForm, BodyMapSelector, WitnessAndRelease
    landing/            # AboutJournal
    meditation/         # MeditationRoom, MeditationDashboard, MeditationFeature
    music/              # MusicHub, Sacred Soundscapes marketplace
    practices/          # DailyPracticeCard, SituationalPractices, TodayPath
    presence-intelligence/ # BodyTruthTest, PowerOfNow, Grounding
    showcase/           # SacredUIShowcase (dev only)
    stats/              # StatsDashboard, PracticeLedger, JourneyProgress
    tokens/             # PaymentWall, TokenGate, tokenService, useTokens
  components/
    ui/                 # Reusable visual: EtherealOrb, MindGymLogo, VoiceGuidance, etc.
    domain/             # Domain-specific reusable: MedalGrid, ReframingVisual
  hooks/                # Shared hooks: useWebRTC, useRazorpay, useWeeklyAssignment, etc.
  stores/               # Zustand stores: meditationStore
  theme/                # ThemeSystem.tsx, constants.ts
  lib/                  # utils.ts (cn() helper)
  services/             # voiceService.ts (VoiceService singleton)
  config/               # admin.ts
  data/                 # dailyQuotes, emotionColors, feltExperiences
```

*   **Reusable UI elements** → `src/components/ui/` or `src/components/domain/`
*   **Business logic + feature-specific UI** → respective `src/features/` folder
*   **Complex global state** → Zustand (`src/stores/`). Simple UI state → `useState`.

### 3.2. Visual Physics Guidelines
*   **Rich Aesthetics:** Harmonious color palettes, modern typography, glassmorphism (`backdrop-blur`), smooth gradients, and 3D visuals via `@react-three/fiber` + `@react-three/drei` (Three.js).
*   **Micro-interactions:** Interactive elements must feel responsive (hover scaling, active state compression).
*   **Mouse Glow:** Dark mode renders a `MouseGlow` component (in `ThemeSystem.tsx`) that follows the cursor with a subtle ambient light effect using the `.mouse-glow` CSS class.

### 3.3. Theme System
The theme is managed by `ThemeSystem.tsx` at `src/theme/ThemeSystem.tsx`.

**Hook:** `useTheme()` — returns `{ theme, mode, toggle }`
*   `theme` — the full `Theme` object (from `src/theme/constants.ts`) with all color/spacing tokens
*   `mode` — `"dark"` | `"light"`
*   `toggle` — switches mode and persists to `localStorage` under key `"awakened-theme"`

**Additional exports:**
*   `ThemeProvider` — wraps the app; syncs ~40 CSS custom properties on `documentElement` on every mode change
*   `ThemeToggle` — animated toggle switch component (48×26px pill, Framer Motion thumb)
*   `useThemedStyles()` — returns pre-built inline style objects: `page`, `card`, `chip`, `chipSelected`, `input`, `quote`, `btnPrimary`, `btnSecondary`, `h1`, `sub`, `label`, `accentText`, `tealText`

**CSS Custom Properties** (set automatically by `ThemeProvider`):

| Token | Purpose |
|---|---|
| `--bg-primary`, `--bg-secondary`, `--bg-surface`, `--bg-input` | Background layers |
| `--bg-surface-rgb` | RGB triplet for rgba() transparency |
| `--text-primary`, `--text-secondary`, `--text-muted`, `--text-disabled` | Text hierarchy |
| `--accent-primary`, `--accent-secondary`, `--teal-glow` | Brand accents |
| `--card-glow-base`, `--card-glow-pulse`, `--card-glow-surge` | Glow intensity levels |
| `--orb-fill`, `--orb-text`, `--orb-particle`, `--orb-shadow` | EtherealOrb visual tokens |
| `--chip-bg`, `--chip-border`, `--chip-selected-bg`, `--chip-selected-border` | Chip/filter button states |
| `--nav-active-bg`, `--nav-active-border` | Bottom nav active state |
| `--glow-cyan`, `--glow-gold` | Named glow colors |
| `--font-serif`, `--font-sans` | Typography |
| `--blur-val` | Backdrop blur value |
| `--video-shadow`, `--video-border` | Meditation Room video tiles |

**Rule:** Never hardcode `text-white/XX` for text. Always use `style={{ color: theme.textPrimary }}` or the CSS variables.

### 3.4. Technical Stack & Backend Integration
*   **Frameworks:** React 19 via Vite 7, targeting ES2015, Chrome 60+, Safari 12+, iOS 12+, Firefox 60+.
*   **3D / WebGL:** `@react-three/fiber` v9 + `@react-three/drei` v10 + `three.js` v0.183 — used for 3D ambient visuals.
*   **Global State:** Zustand v5 (`useMeditationStore`). Avoid prop drilling.
*   **Backend & Cloud:** Firebase v12 (Firestore, Auth, Storage) and Google Cloud Functions. Cloud Functions are proxied locally via `/api` in `vite.config.ts`:

    | Local route | Cloud Function |
    |---|---|
    | `/api/voice` | `textToSpeech` |
    | `/api/witness` | `witnessPresence` |
    | `/api/grounding` | `getGrounding` |
    | `/api/emotion` | `analyzeEmotion` |
    | `/api/daily-meditation` | `getDailyMeditation` |
    | `/api/razorpay-subscription-verify` | `verifyRazorpaySubscription` |
    | `/api/razorpay-subscription` | `createRazorpaySubscription` |
    | `/api/razorpay-order` | `createRazorpayOrder` |
    | `/api/razorpay-verify` | `verifyRazorpayPayment` |

*   **AI Integrations:** Google Generative AI (Gemini) via both `@google/genai` (v1.x) and `@google/generative-ai` (v0.24) for Presence Intelligence features. `openai` package (v6) is also installed.
*   **Monetization:** Razorpay integration for per-track purchases and subscriptions, verified via Cloud Functions. `useRazorpay` hook wraps the checkout flow.
*   **WebRTC:** `useWebRTC` hook manages peer connections for live meditation rooms.
*   **Audio:** `VoiceService` singleton for TTS/music playback. `useGenerativeAudio` for procedural in-browser audio.

### 3.5. Build & Performance Configuration
*   **PWA Setup:** `vite-plugin-pwa` v1 with `autoUpdate` register. Cache limit: `maximumFileSizeToCacheInBytes: 15MB`. Glob patterns include `.js`, `.css`, `.html`, `.ico`, `.png`, `.svg`, `.webp`, `.woff2`. PWA manifest name: "Mind Gym".
*   **Chunking Strategy:** Only vendor `node_modules` are manually chunked (`vendor-firebase`, `vendor-framer`, `vendor-lucide`, `vendor`). Application code is **never** forcefully chunked — rely on Vite's static analysis to avoid circular dependency errors.
*   **CSS Target:** Tailwind v4 configured via `@tailwindcss/vite` plugin (not PostCSS). Do not add `tailwind.config.js`.

---

## 4. Verification & Enhancement Workflow
When implementing a new feature or fixing a bug:
1.  **Check Atomic Scope:** Are you creating a monolithic component? Break it down.
2.  **Verify Typings:** Are there any implicit or explicit `any` types? Remove them.
3.  **Review Animations:** Are state-driven animations using Framer Motion? Are ambient animations using CSS?
4.  **Confirm Gamification Logic:** Ensure timers, XP accumulation, token deductions, and level calculations handle edge cases correctly.
5.  **Check Token Gate:** Does the new feature require a token cost? Add it to `TOKEN_COSTS` in `tokenService.ts` and wrap the entry point with `<TokenGate>`.
6.  **Theme Test:** Verify the change renders correctly in both dark and light mode.

### 4.1. Local Development Setup
1. Ensure you are in the project root: `C:\Github\Bliss\AwakenedPath`
2. Run `npm install` if there are new dependency changes.
3. Start the Vite development server: `npm run dev` → `http://localhost:5173` (or next available port).
4. The Firebase project ID used in all backend calls is `awakened-path-2026`. **Do not change this.**

---

## 5. Branding & Naming

### 5.1. MindGym Rebrand
*   The application was renamed from **AwakenedPath** to **MindGym** across all UI text, package names (`"name": "mind-gym"` in `package.json`), PWA manifest, and documentation.
*   **CRITICAL — Firebase Project IDs are NOT renamed.** The underlying GCP/Firebase project remains `awakened-path-2026`. Files like `firebase.ts`, `firebase-config.json`, and `vite.config.ts` proxy URLs **must** keep `awakened-path-2026` as the project ID. Changing these will break authentication and all backend calls.
*   The physical folder on disk remains `C:\Github\Bliss\AwakenedPath`. This is intentional.
*   The logo component is `MindGymLogo.tsx` (renamed from `AwakenedPathLogo.tsx`), located at `src/components/ui/MindGymLogo.tsx`.
*   The `localStorage` theme key is `"awakened-theme"` — intentionally not renamed to preserve existing user preferences.

---

## 6. Design Philosophy & UI Rules

### 6.1. Minimalism First
*   **Rule:** Every screen should have the minimum number of text elements needed to communicate its purpose. Remove anything that doesn't serve core functionality.
*   **Rule:** Use whitespace and breathing room instead of borders, cards, and containers to create visual hierarchy.
*   **Rule:** Avoid philosophy tags, taglines, or motivational subheadings cluttering functional screens. The app's purpose is self-evident through its actions.

### 6.2. Text Clarity (Top Priority)
*   **Rule:** No text element should be below **50% opacity** (avoid `text-white/25`, `text-white/30`). Minimum is `text-white/50` in dark mode or equivalent `theme.textMuted` in light mode.
*   **Rule:** Body text must be at least `text-sm` (14px). Labels and secondary info must be at least `text-xs` (12px). Never use `text-[10px]` or `text-[11px]` for user-facing content.
*   **Rule:** Use `font-medium` or `font-semibold` for secondary information, not `font-normal`.

### 6.3. Light & Dark Mode
*   **Rule:** Never hardcode `text-white/XX` for text colors. Always use the theme system: `style={{ color: theme.textPrimary }}`, `theme.textSecondary`, or `theme.textMuted`.
*   **Rule:** For accent colors that differ between modes, use Tailwind's `dark:` variant (e.g., `text-amber-500 dark:text-amber-400`).
*   **Rule:** Import `useTheme()` from `../../theme/ThemeSystem` in every component that renders text or backgrounds.
*   **Rule:** Test every UI change in both dark and light mode before considering it complete.

### 6.4. Login / Email Capture Screen
*   **Rule:** Keep the login screen minimal — no verbose instructions or explanatory paragraphs.
*   **Rule:** Use placeholder text inside input fields (e.g., `placeholder="Your Email"`) instead of external labels.
*   **Rule:** The login screen has two entry paths: email-only (anonymous Firebase auth) and Google OAuth. Both must work.

### 6.5. Meditation Landing Screen
*   **Rule:** The landing screen follows a strict 3-element hierarchy:
    1.  **The Orb** — singular hero visual (`EtherealOrb`), centered.
    2.  **One CTA** — either "Just Show Up →" (when live) or the countdown timer (when between sessions).
    3.  **One stats line** — streak and session count as plain inline text, no cards or borders.
*   **Rule:** The "Stats" detail panel is hidden by default, toggled via a minimal button at the bottom.
*   **Rule:** No headers, taglines, live clocks, philosophy tags, or "Session Live" badges on this screen.

### 6.6. Music Hub / Sacred Soundscapes
*   **Rule:** Track cards use a flip interaction (front: cover image + play button; back: details + purchase). The flip is triggered by clicking anywhere on the card.
*   **Rule:** Playback is preview-only (streamed via `VoiceService`). Full ownership requires Razorpay purchase.
*   **Rule:** Regional pricing is derived from `priceService.ts` — do not hardcode currency or amounts.
*   **Rule:** The `console.log` debug statement in `MusicHub` (track render logging) should be removed before production builds.

---

*End of Specifications — Last updated: June 2026*
