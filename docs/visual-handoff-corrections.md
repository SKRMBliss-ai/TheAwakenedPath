# Mind Gym visual corrections — 17 September 2026

## Scope

Local implementation, not a deployment. Based on the closed-door home and Story Lab handoffs in `src/assets`. The approved screenshots guide the composition; text and controls remain interactive HTML.

## Corrections

- Removed the old room-frame/interior layers and conflicting screenshot CSS that exposed open-door fragments behind closed doors.
- Closed rooms use transparent-background artwork; only a click reveals the corresponding supplied open reference. Hover lifts/glows and rings the existing doorbell, respecting quiet mode.
- Removed mobile destination-panel borders. An opened mobile room spans both columns so its artwork and controls remain legible.
- Welcome dialog and video occupy the full viewport. Video uses contain to preserve the complete supplied frame; portrait screens may letterbox. Existing once-per-local-day, Skip, sound and reduced-motion behavior remains.
- Story Lab now uses a persistent illustrated room with journey progress, thought clouds, the approved thoughtful explorer, an illustrated memory theatre, connected clues, an open-book story and original/alternative windows. Original words remain intact.
- Hidden door buttons leave the tab sequence; closing a preview restores focus to its door.

## Asset provenance

Original assets are preserved. `scripts/prepare-reference-layers.mjs` converts the supplied open-room crops and extracts the playground illustration from the approved Story Lab screenshot.

The built-in image generation tool was used for reference-based background removal/restoration, not for a new character design:

- `public/mind-gym/closed-home/door-{kind,truth,choices,include,body,help,mindheart}-clean.webp`: remove only white outer backgrounds; preserve wood, symbols, foliage and wording. Mind & Heart additionally closes the source's ajar door.
- `public/mind-gym/story-lab/thinking-boy-clean.webp`: extract the supplied thoughtful pose, remove the sheet caption/background, retain identity, clothing and pose at higher resolution.
- `public/mind-gym/story-lab/room-backdrop-v2.webp`: restore the supplied low-resolution clean treehouse room in high resolution, retaining arches, night window, sofa, lanterns and books; no characters, labels or UI.

These are restored derivatives, not claims of pixel-identical source images. The existing home explorer and Chirpy assets remain in use.

## Verification

- TypeScript build: passed.
- Targeted ESLint: passed (existing outdated Browserslist data warning).
- Seven Node tests: passed — daily welcome/date/reload/storage fallback and Story Lab identity/revision/storage failure.
- Production Vite build: passed; existing chunk-size and mixed-import warnings remain.
- Desktop browser: seven closed doors, no legacy interior layers; Make Good Choices click exposes its open artwork and Play/Learn controls.
- 390px mobile browser: borderless home destinations, two-column closed rooms, full-row opened room; no horizontal page overflow.
- Story Lab browser walkthrough: Thought, Event, Story and Another Way render, with retained clues and original story, including mobile scenes.
- Fresh-origin welcome: dialog and video measured 1280 × 720 at (0,0), matching the viewport. Playback visually confirmed; reload after first presentation did not show it again.

## Remaining release check

Review on a physical touch device and verify the deployed URL after the changes are committed/published. Browser sound playback requires user interaction and may be blocked before the first gesture.
