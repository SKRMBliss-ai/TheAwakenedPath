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
- Make clean, focused commits. Do not leave dirty uncommitted files between sessions.
- Preserve mobile loading speed: keep heavy tabs and feature modules dynamic (`React.lazy`).
