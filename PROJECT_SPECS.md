# MindGym - Project Specifications & Requirements

This document serves as the single source of truth for the **MindGym / Untethered** application's requirements, design guidelines, and strict coding standards. All future enhancements and bug fixes **must** adhere to this document to ensure consistency, type safety, and architectural integrity.

## 1. Project Overview
MindGym is a gamified mindfulness, mental health, and presence-intelligence application. It guides users through various mindfulness practices (Breathing, Witness Consciousness, Presence, Energy, Reframing) while rewarding them with XP and tracking their journey to mental wellness.

### 1.1. Detailed Core Features
*   **Journey / Dashboard:** A daily focus screen featuring ambient visual backgrounds, inspirational quotes, and quick access to the daily recommended practice.
*   **Practice Library:** Categorized into:
    *   **Quick Shifts:** Short duration (< 1 minute) practices for instant resets.
    *   **Deep Dives:** Longer duration, multi-step practices with difficulty levels (beginner, intermediate, advanced).
*   **Practice Execution Engine (Modal):** Multi-step guided modals handling `intro` (instructions) and `active` (execution) states. It includes domain-specific visuals like `BreathingVisual`, `WitnessVisual` (floating thoughts), and `ReframingVisual`.
*   **Live Group Meditation (Meditation Room):** Zoom/Google Meet-style WebRTC live silent meditation sessions. Features include:
    *   Responsive participant video gallery with pinned self-view and mic/camera toggles.
    *   Instructor Media Controls for synchronized sharing (YouTube, Audio, or Screen).
    *   Interactive floating emoji reactions, chat panel with toast notifications, and ambient Web Audio API chimes (join/leave/warning bells).
*   **Presence Intelligence:** AI-guided (Gemini) introspection tools, such as the **Body Truth Test** (somatic resonance to measure "Expansion" vs. "Contraction" of thoughts) and **Power of Now** teachings.
*   **Journaling & Release:** Advanced journal forms (`GentleJournalForm`) featuring a `BodyMapSelector` to localize physical tension, and tools like `WitnessAndRelease` to process and let go of friction.
*   **Gamification & Stats System:** Tracks User Level, XP, Streak, and specific metric points (Witness Points, Presence Points, Zen Points). Displays an Energy Level alignment bar (Heart, Mind, Body). Includes a `StatsDashboard` and `PracticeLedger`.
*   **Theme & Navigation:** Full dark/light mode support, ambient UI with Framer Motion transitions, modular bottom navigation bar, and integrated external links (e.g., WhatsApp support, HabitQuest).

---

## 2. Coding Standards & Global Rules

The following rules are mandatory and supersede general best practices:

### 2.1. TypeScript Strictness & Type Safety
*   **Rule:** All new components and functions must be strictly typed.
*   **Rule:** The usage of `any` is strictly **forbidden** unless absolutely necessary for external library integration (and must be explicitly commented with justification).
*   **Reasoning:** Prevents runtime errors and ensures gamification logic (XP calculations, timers) remains robust.

### 2.2. Component Philosophy: Functional & Atomic
*   **Rule:** Use **only** React Functional Components with Hooks. Avoid class components entirely.
*   **Rule:** Adhere to **Atomic Design principles**. Components should be small, single-responsibility units.
    *   *Example:* A `PracticeCard` component should not contain the logic for the `PracticeModal`. Break the UI into manageable, reusable pieces (e.g., `<HeartbeatCard />`, `<ProgressBar />`, `<CircularTimer />`).
*   **Reasoning:** Large files (like the monolithic `App.tsx`) become unmanageable. Break UI into reusable pieces.

### 2.3. Styling Methodology
*   **Rule:** Use **Tailwind utility classes** (`clsx` and `twMerge` via a `cn()` utility) for layout, spacing, typography, and standard responsive design.
*   **Rule:** Use standard **CSS** (or CSS modules / custom Tailwind classes like `.card-heartbeat`) **only** for complex, multi-step animations or highly specific visual effects (Visual Physics) that are cumbersome in standard Tailwind utilities.
*   **Reasoning:** Keeps styling rapid and consistent via Tailwind, reserving CSS for specialized physics (e.g., "Surge" and "Heartbeat").

### 2.4. Animation Implementation
*   **Rule:** Use **CSS Animations** for infinite loops, simple hover states, or background visual physics (like ambient pulses).
*   **Rule:** Use **Framer Motion** for state-driven transitions, enter/exit animations (e.g., Modals opening, steps changing, floating thoughts), and complex gesture interactions.
*   **Reasoning:** Balances performance (CSS for background tasks) with expressive control (Framer Motion for UI flows).

### 2.5. Accessibility & Target Audience
*   **Rule:** The primary target demographic is **40+ years old**. Therefore, **simplicity and clarity are top priorities**.
*   **Rule:** All text must be clearly visible. Use adequately large font sizes, high contrast colors, and legible modern typography (avoiding overly thin or small fonts).
*   **Rule:** UI flows should be straightforward and intuitive, avoiding overly complex navigation or hidden interactions.
*   **Rule:** **Mobile and iPad Ease of Use is mandatory**. All designs must be fully responsive with touch targets (buttons, links) sized appropriately for fingers, and layouts optimized specifically for tablets and mobile screens.

---

## 3. Architecture & State Management

### 3.1. Project Structure
The project uses a feature-based architecture (e.g., `src/features/journal`, `src/features/meditation`, `src/features/practices`).
*   **Components:** Reusable UI elements should be stored in `src/components/ui/` or `src/components/domain/`.
*   **Features:** Self-contained business logic, specific UI, and hooks should reside in their respective feature folders.
*   **State:** Complex global state should use Zustand (`src/stores/`). Simple UI state can use `useState`.

### 3.2. Visual Physics Guidelines
*   **Rich Aesthetics:** Use harmonious color palettes, modern typography, glassmorphism (`backdrop-blur`), and smooth gradients.
*   **Micro-interactions:** Interactive elements must feel responsive (e.g., hover scaling, active state compression).

### 3.3. Technical Stack & Backend Integration
*   **Frameworks:** React 19 via Vite, targeting ES2015 and modern mobile browsers.
*   **Global State:** Zustand v5 for decoupled, robust state management (e.g., `useMeditationStore`). Avoid prop drilling.
*   **Backend & Cloud:** Firebase v12 (Firestore, Auth, Storage) and Google Cloud Functions. Cloud Functions are proxied locally via `/api` mapping in Vite (e.g., `/api/witness` routes to `/witnessPresence`).
*   **AI Integrations:** Google Generative AI (Gemini) via `@google/genai` and `@google/generative-ai` for Presence Intelligence.
*   **Monetization:** Razorpay integration for payments and subscriptions, securely verified via Cloud Functions.

### 3.4. Build & Performance Configuration
*   **PWA Setup:** Configured via `vite-plugin-pwa` with aggressive caching strategies (`maximumFileSizeToCacheInBytes: 15MB`).
*   **Chunking Strategy:** Vendor libraries are heavily chunked (e.g., `vendor-firebase`, `vendor-framer`, `vendor-lucide`) in `vite.config.ts`. To avoid circular dependency errors, application code should NOT be forcefully chunked; rely on Vite's default static analysis.

---

## 4. Verification & Enhancement Workflow
When implementing a new feature or fixing a bug:
1.  **Check Atomic Scope:** Are you creating a monolithic component? Break it down.
2.  **Verify Typings:** Are there any implicit or explicit `any` types? Remove them.
3.  **Review Animations:** Are state-driven animations using Framer Motion? Are ambient animations using CSS?
4.  **Confirm Gamification Logic:** Ensure timers, XP accumulation, and level calculations handle edge cases correctly.

### 4.1. Local Development Setup
To run the MindGym application locally:
1. Ensure you are in the project root (`C:\Github\Bliss\AwakenedPath` - physical folder name intentionally preserved).
2. Run `npm install` if there are new dependency changes.
3. Start the Vite development server using `npm run dev`. This will host the app at `http://localhost:5173` (or the next available port).

---

## 5. Branding & Naming

### 5.1. MindGym Rebrand
*   The application was renamed from **AwakenedPath** to **MindGym** across all UI text, package names, PWA manifest, and documentation.
*   **CRITICAL — Firebase Project IDs are NOT renamed.** The underlying GCP/Firebase project remains `awakened-path-2026`. Files like `firebase.ts`, `firebase-config.json`, and `vite.config.ts` proxy URLs **must** keep `awakened-path-2026` as the project ID. Changing these will break authentication and all backend calls.
*   The physical folder on disk remains `C:\Github\Bliss\AwakenedPath`. This is intentional.
*   The component file `AwakenedPathLogo.tsx` was renamed to `MindGymLogo.tsx`.

---

## 6. Design Philosophy & UI Rules

### 6.1. Minimalism First
*   **Rule:** Every screen should have the minimum number of text elements needed to communicate its purpose. If information can be removed without losing core functionality, remove it.
*   **Rule:** Use whitespace and breathing room instead of borders, cards, and containers to create visual hierarchy.
*   **Rule:** Avoid philosophy tags, taglines, or motivational subheadings cluttering functional screens. The app's purpose is self-evident through its actions, not through text labels.

### 6.2. Text Clarity (Top Priority)
*   **Rule:** No text element should be below **50% opacity** (e.g., avoid `text-white/25`, `text-white/30`). Minimum is `text-white/50` in dark mode or equivalent `theme.textMuted` in light mode.
*   **Rule:** Body text must be at least `text-sm` (14px). Labels and secondary info must be at least `text-xs` (12px). Never use `text-[10px]` or `text-[11px]` for user-facing content.
*   **Rule:** Use `font-medium` or `font-semibold` for secondary information, not `font-normal`.

### 6.3. Light & Dark Mode
*   **Rule:** Never hardcode `text-white/XX` for text colors. Always use the theme system: `style={{ color: theme.textPrimary }}`, `theme.textSecondary`, or `theme.textMuted`.
*   **Rule:** For accent colors that differ between modes, use Tailwind's `dark:` variant (e.g., `text-amber-500 dark:text-amber-400`).
*   **Rule:** The `useTheme()` hook from `../../theme/ThemeSystem` provides `{ theme, mode, toggle }`. Import and use it in every component that renders text or backgrounds.
*   **Rule:** Test every UI change in both dark and light mode before considering it complete.

### 6.4. Login / Email Capture Screen
*   **Rule:** Keep the login screen minimal — no verbose instructions or explanatory paragraphs.
*   **Rule:** Use placeholder text inside input fields (e.g., `placeholder="Your Email"`) instead of external labels + descriptions.
*   **Rule:** The login screen has two entry paths: email-only (anonymous Firebase auth) and Google OAuth. Both must work.

### 6.5. Meditation Landing Screen
*   **Rule:** The landing screen follows a strict 3-element hierarchy:
    1.  **The Orb** — singular hero visual, centered.
    2.  **One CTA** — either "Just Show Up →" (when live) or the countdown timer (when between sessions).
    3.  **One stats line** — streak and session count as plain inline text, no cards or borders.
*   **Rule:** The "Stats" detail panel is hidden by default, toggled via a minimal button at the bottom.
*   **Rule:** No headers, taglines, live clocks, philosophy tags, or "Session Live" badges on this screen.

*End of Specifications*
