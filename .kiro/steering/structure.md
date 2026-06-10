# Project Structure

## Root Layout

```
AwakenedPath/
├── src/                  # Application source
├── public/               # Static assets (favicon, PWA icons, images)
├── functions/            # Firebase Cloud Functions (Node.js)
├── server/               # Express server (Dockerfile + index.js)
├── scripts/              # Utility scripts (e.g., image conversion)
├── dist/                 # Build output (gitignored)
├── index.html            # Vite HTML entry point
├── vite.config.ts        # Vite + Tailwind + PWA config
├── firebase.json         # Firebase Hosting/Functions config
├── firestore.rules       # Firestore security rules
├── storage.rules         # Firebase Storage security rules
├── PROJECT_SPECS.md      # Authoritative spec & coding standards doc
└── tsconfig*.json        # TypeScript composite config
```

## src/ Structure

```
src/
├── features/             # Feature modules (primary home for business logic + UI)
│   ├── achievements/     # AchievementsPanel, useAchievements, achievementsDefs
│   ├── admin/            # EngagementReport (access-controlled)
│   ├── audio/            # useGenerativeAudio (Web Audio API binaural beats)
│   ├── auth/             # AuthContext, EmailCaptureScreen, SignInScreen
│   ├── breath/           # Breathing practice components
│   ├── courses/          # CoursesHub, WisdomUntetheredCourse
│   ├── journal/          # GentleJournalForm, BodyMapSelector, WitnessAndRelease
│   ├── landing/          # Landing/marketing page components
│   ├── meditation/       # MeditationRoom, Dashboard, PreJoin, meditationService
│   ├── music/            # MusicHub (Sacred Soundscapes marketplace)
│   ├── practices/        # DailyPracticeCard, SituationalPractices, TodayPath
│   ├── presence-intelligence/ # BodyTruthTest, PowerOfNow, Grounding, Emotion
│   ├── showcase/         # SacredUIShowcase (dev/design reference only)
│   ├── stats/            # StatsDashboard, PracticeLedger, JourneyProgress
│   └── tokens/           # PaymentWall, TokenGate, tokenService, useTokens
│
├── components/
│   ├── ui/               # Generic reusable atoms (EtherealOrb, MusicMiniPlayer, etc.)
│   └── domain/           # App-specific reusables (MedalGrid, ReframingVisual)
│
├── hooks/                # Shared hooks (useWebRTC, useRazorpay, useWeeklyAssignment, etc.)
├── stores/               # Zustand stores (meditationStore.ts)
├── services/             # Singletons (voiceService.ts — VoiceService)
├── theme/                # ThemeSystem.tsx, constants.ts (Theme tokens + useTheme hook)
├── lib/                  # utils.ts — cn() helper (clsx + tailwind-merge)
├── config/               # admin.ts (admin access control)
├── data/                 # Static data (dailyQuotes, emotionColors, feltExperiences)
├── pages/                # Page-level wrappers (JournalPage.tsx)
├── App.tsx               # Root component
├── UntetheredSoulApp.tsx # Main app shell with bottom navigation routing
├── main.tsx              # Vite entry point
└── firebase.ts           # Firebase SDK initialization
```

## Placement Rules

| What | Where |
|---|---|
| New feature (UI + logic together) | `src/features/<feature-name>/` |
| Generic, reusable visual component | `src/components/ui/` |
| App-specific reusable component | `src/components/domain/` |
| Hook used across multiple features | `src/hooks/` |
| Hook used only within one feature | `src/features/<feature-name>/hooks/` or inline |
| Global state (Zustand) | `src/stores/` |
| Singleton service | `src/services/` |
| Static/hardcoded data | `src/data/` |
| Theme tokens and useTheme | `src/theme/` |

## Key Files

- **`src/UntetheredSoulApp.tsx`** — main app shell, bottom nav routing; entry point for all feature screens
- **`src/theme/ThemeSystem.tsx`** — `ThemeProvider`, `useTheme()`, `useThemedStyles()`, `ThemeToggle`
- **`src/theme/constants.ts`** — full `Theme` type and dark/light token values
- **`src/lib/utils.ts`** — `cn()` utility, use everywhere instead of manual clsx/twMerge calls
- **`src/services/voiceService.ts`** — `VoiceService` singleton for TTS and music playback
- **`src/features/tokens/tokenService.ts`** — `TOKEN_COSTS`, `deductTokens()`, `getTokenBalance()`
- **`src/stores/meditationStore.ts`** — Zustand store for live meditation room state
- **`src/config/admin.ts`** — admin user access control list

## State Management Convention

- **Zustand** (`src/stores/`) for complex shared global state (meditation room)
- **React Context** (`AuthContext`) for auth state
- **`useTheme()`** for theme — never read theme from localStorage directly
- **`useState` / `useReducer`** for local component state
- Avoid prop drilling — use Zustand or Context for anything crossing more than 2 component levels

## Styling Convention

- **Tailwind utility classes** for layout, spacing, typography — always via `cn()` from `src/lib/utils.ts`
- **CSS Modules** (`.module.css`) only for complex multi-step animations or highly scoped component physics
- **CSS custom animations** for infinite loops and ambient background effects
- **Framer Motion** for all state-driven enter/exit transitions and gesture interactions
- Never hardcode `text-white/XX` for text colors — always use `theme.textPrimary`, `theme.textSecondary`, etc. from `useTheme()`
- Import `useTheme()` in every component that renders text or backgrounds

## Theme Token Usage

```tsx
// Correct
const { theme } = useTheme();
<p style={{ color: theme.textPrimary }}>...</p>
<div style={{ background: theme.bgSurface }}>...</div>

// Wrong — never do this
<p className="text-white/60">...</p>
```

## Token-Gating New Features

When adding a premium feature:
1. Add a cost entry to `TOKEN_COSTS` in `src/features/tokens/tokenService.ts`
2. Wrap the feature entry point with `<TokenGate feature="your_feature_key">`
