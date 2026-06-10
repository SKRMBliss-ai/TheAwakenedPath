# Tech Stack

## Core Framework
- **React 19** with **TypeScript ~5.9** — functional components only, no class components
- **Vite 7** — build tool and dev server
- **Tailwind CSS v4** — via `@tailwindcss/vite` plugin (NOT PostCSS). Do not create `tailwind.config.js` or `postcss.config.js`

## Key Libraries
| Library | Version | Purpose |
|---|---|---|
| `framer-motion` | ^12 | State-driven animations, enter/exit transitions, modals, gestures |
| `zustand` | ^5 | Global state (e.g., `meditationStore`) |
| `firebase` | ^12 | Firestore, Auth, Storage, Hosting |
| `@google/genai` | ^1 | Gemini AI (Presence Intelligence features) |
| `@react-three/fiber` + `@react-three/drei` | ^9 / ^10 | 3D/WebGL ambient visuals (Three.js) |
| `lucide-react` | ^0.560 | Icons |
| `clsx` + `tailwind-merge` | latest | `cn()` utility at `src/lib/utils.ts` |
| `react-youtube` | ^10 | YouTube embeds in Meditation Room |
| `uuid` | ^13 | ID generation |
| `openai` | ^6 | OpenAI integration (secondary AI) |

## Backend & Cloud
- **Firebase project ID:** `awakened-path-2026` — **never rename this**
- **Cloud Functions** proxied locally via `/api` in `vite.config.ts`:

| Local route | Cloud Function |
|---|---|
| `/api/voice` | `textToSpeech` |
| `/api/witness` | `witnessPresence` |
| `/api/grounding` | `getGrounding` |
| `/api/emotion` | `analyzeEmotion` |
| `/api/daily-meditation` | `getDailyMeditation` |
| `/api/razorpay-*` | Razorpay order/verify/subscription functions |

- **Razorpay** — payment processing via `useRazorpay` hook and Cloud Function verification
- **WebRTC** — live meditation rooms via `useWebRTC` hook

## Audio Architecture
- `VoiceService` (`src/services/voiceService.ts`) — singleton for TTS (`/api/voice`) and music/Storage URL playback
- `useGenerativeAudio` (`src/features/audio/`) — procedural in-browser binaural beats via Web Audio API (432Hz base, 4Hz theta)
- These two are **mutually exclusive** — starting one stops the other

## PWA
- `vite-plugin-pwa` with `autoUpdate`, 15MB cache limit
- Manifest name: "Mind Gym"

## Build Targets
`es2015`, `chrome60`, `safari12`, `ios12`, `firefox60`

## Chunking Strategy
Only `node_modules` are manually chunked (`vendor-firebase`, `vendor-framer`, `vendor-lucide`, `vendor`). Never forcefully chunk application code — this causes circular dependency errors.

## Common Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Type-check + production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## TypeScript Config
- Composite project: `tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`
- Strict typing enforced — `any` is **forbidden** except for `(window as any).webkitAudioContext` (Safari Web Audio API compat)
