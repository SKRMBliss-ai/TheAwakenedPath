---
trigger: always_on
---

Rule: Move global user state (XP, Level, Streaks, Theme Preference) out of local component state and into a React Context provider (e.g., UserProvider or ThemeProvider).

Reasoning: Prevents "prop drilling" user stats down through every component layer, making the code cleaner.