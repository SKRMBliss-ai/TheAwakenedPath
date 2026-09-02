# Project Directives & Architecture Rules for AwakenedPath / SKRM Bliss AI

## 1. Deployment Directive
- **ALWAYS** deploy using `npm run build:seo` (NEVER plain `npm run build`). Plain build ships empty SPA shells to crawlers/AI bots and wipes prerendered HTML.

## 2. New Content Routes
- When adding a new content route (guide/glossary/video/course):
  - Add its full URL to `public/sitemap.xml`.
  - Add its route path to the `ROUTES` array in `scripts/prerender.mjs`.

## 3. SEO & HTML Cleanliness
- **NEVER** hardcode per-subpage titles, descriptions, or canonical tags in `index.html`. Per-page SEO is handled by `usePageSeo` and baked into static HTML via `scripts/prerender.mjs`.
- **NEVER** add `display:none` keyword/content blocks (risk of search engine penalty).

## 4. Truthfulness & Authenticity
- **NEVER** fabricate testimonials, stats, user counts, reviews, or fake social proof.

## 5. Founders & Brand Identity
- **Founders**: **Shruti Khungar + Sim Katyal** (twin souls).
- Maintain this attribution consistently in schema definitions, `public/llms.txt`, and `public/llms-full.txt`.

## 6. Email & Admin Protection
- **NEVER** route admin/team emails (`ADMIN_EMAILS` / `BLOCK_ANALYTICS_EMAILS`) into unsubscribe or suppression lists. They must always receive update broadcasts.

## 7. Article Registry Accuracy
- Articles are managed via a static registry (`src/features/content/data/contentEngineData.ts`). There is no fake daily auto-publish background job. Do not describe automation that does not exist.

## 8. Commit Hygiene & Performance
- Stage **only the files you actually changed**: `git add <path> ...`. **NEVER** `git add -A` / `git add .` — this repo is worked on by more than one agent, and a blanket add sweeps someone else's in-flight files into your commit under a misleading message.
- Before committing, run `git status` and confirm every staged path is yours. Leave files you did not touch alone.
- Make clean, focused commits. Do not leave dirty uncommitted files between sessions.
- Preserve mobile loading speed: keep heavy tabs and feature modules dynamic (`React.lazy`).

## 9. Deploy What You Changed
- Changing `functions/**` requires `npx firebase deploy --only functions:<name>` — deploying hosting alone leaves the backend stale and the repo out of sync with production.
- `functions/subscribers.txt` is read at runtime by the daily sender, so **editing the subscriber list requires a functions deploy**, not just a commit.
- Changing anything under `src/**`, `public/**`, or `index.html` requires `npm run build:seo` + hosting deploy (see §1).

## 10. Email Subject Lines
- Daily subjects (`DAILY_SUBJECTS`) rotate by **day-of-week**; the featured guide rotates by **day-of-year**. They are deliberately independent.
- Therefore a subject line must **never name a specific article or guide** — it would systematically not match the guide in the email body.
- Never invent a guide title in a subject line. Only the 7 slugs in `DAILY_GUIDES` exist.

## 11. Kids Gym Card & Visual Effects Protection
- **Same-Origin Asset Paths**: `roomArt`, `roomCard`, and `roomFull` in `src/features/practise/kids/rooms.ts` **MUST ALWAYS** resolve to same-origin relative paths (`/rooms/${id}.webp`, `/rooms/${id}_card.webp`, `/rooms/full/${id}_full.webp`). NEVER change `rooms.ts` to unverified external storage buckets (e.g. `kids-rooms/`) that produce 404 broken image placeholders.
- **Image Fallback Safeguard**: All room card `<img>` tags in `KidsWorld.tsx` **MUST** retain `onError` fallback handling to Firebase Storage to guarantee 100% uptime even if a local file is missing.
- **Hover Sparkles Overlay (`<CardSparklesOverlay>`)**: The dynamic 4-point golden sparkle star animation overlay in `KidsWorld.tsx` **MUST ALWAYS** remain rendered when a room card is hovered (`hoveredId === room.id`). Any future card component updates must preserve this magical hover experience across all 10 room cards (`feelings`, `thought`, `body`, `pause`, `story`, `friendship`, `anger`, `worry`, `kindness`, `reflection`).
- **Responsive Geometry**: Maintain wide and long aspect ratio bounds (`aspect-[1/1.85]` mobile, `aspect-[1/2.1]` tablet, `aspect-[1/2.35]` desktop) and grid layout (`xl:grid-cols-5`) so cards feel premium on both web and mobile screens.

## 12. Pre-Deployment Verification Checklist
Before committing or executing `npx firebase deploy --only hosting`:
- [ ] **Build Command**: Verified build is run via `npm run build:seo` (NEVER plain `npm run build`).
- [ ] **Kids Gym Asset Paths**: Verified `rooms.ts` points to valid `/rooms/...` paths and returns HTTP 200.
- [ ] **Sparkle Animation Check**: Verified `<CardSparklesOverlay>` is present in `KidsWorld.tsx` and fires on card hover.
- [ ] **Mobile & Desktop Layout**: Verified grid columns and card aspect ratios render cleanly on desktop and mobile.
- [ ] **Git Staging Hygiene**: Checked `git status` to ensure **ONLY** modified files are staged via `git add <path>`.
- [ ] **Rebase & Push**: Executed `git pull --rebase origin main` and `git push origin main` cleanly before deploying.

