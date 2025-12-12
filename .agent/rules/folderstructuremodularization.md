---
trigger: always_on
---

Rule: Adopt a feature-based folder structure. Do not keep everything in a flat /src directory.

Example Structure:

/src/components/ui (Reusable generic atoms: Buttons, standard Cards)

/src/components/domain (App-specific: LevelCard, PracticeGrid, ThoughtBubble)

/src/features/practices (Logic and modals for the practice flows)

/src/hooks (Custom hooks like useTimer, useBreathingPattern)

Reasoning: Essential for scaling the app beyond the current single-file prototype.