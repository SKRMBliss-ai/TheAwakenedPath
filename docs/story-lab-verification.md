# Story Lab and closed-door hub verification

Local verification, 17 September 2026.

- The supplied closed-home and Story Lab handoffs are integrated in commit `bff3b46`.
- Browser checked: the hub starts with seven collapsed room controls and no visible Play/Learn panels. Selecting one opens its preview, selecting another closes the first, and Escape closes the preview. Keyboard focus also reveals a preview after the configured two-second delay.
- Browser checked: mobile landing presents two destinations; My Good Choices reveals the shelf before selecting an activity.
- Browser checked: Feeling → Body → Thought → What happened → Story → Another way → Journey saved. Original wording, feeling and body clues stay visible. Test used synthetic answers on localhost only.
- Browser checked at 390px: no horizontal document overflow; original and alternative stories remain side by side with wrapping text.
- Doorbell uses synthesized audio and respects quiet/mute; audible playback was not verified. Browsers may require a user gesture before allowing audio.
- Follow-up fixes allow resaving revised answers, clear stale story confirmation/alternative clues, retain the saved journey ID, preserve mobile screen-reader progress labels, and wrap long words.
- Automated storage tests: `node scripts/test-story-lab-storage.mjs` (three tests).
- TypeScript, targeted ESLint and production build pass. Existing large-chunk and outdated Browserslist warnings remain.
- Remote fetch failed with Windows `SEC_E_NO_CREDENTIALS`. These follow-up changes are local; no deployment is claimed.
