# Mind Gym — Domain Glossary & Design Decisions

## Glossary

**Daily Journey** — The primary daily action. A 4-step sequence: Learn → Practice → Reflect → Live It. This is the single designed-for action when a user opens the app. Everything else is secondary.

**Witness Consciousness** — The state of observing one's thoughts without being identified with them. The core capability the app develops. Sourced from Michael A. Singer and Eckhart Tolle.

**Presence** — Being fully aware in the current moment, not lost in thought. The destination of all practices.

**Practice** — A structured exercise (breath, witness, grounding, journaling, etc.) that develops Presence or Witness Consciousness.

**Quick Shift** — A practice under 1 minute. Designed for in-the-moment resets.

**Deep Dive** — A multi-step guided practice session, typically 5–20 minutes.

**Seeker** — The premium tier user. Has full access to all features.

**Traveler** — The free/trial tier user. Limited access, 300 token trial.

**Token** — The in-app currency. New users get 300 (7-day trial equivalent). Premium features deduct tokens per use.

**Weekly Assignment** — A single contemplative question assigned for the full week. Drives the content of the Daily Journey for that week.

**Sacred Soundscapes** — Premium ambient audio tracks available in the Music Hub.

**Witness Points / Presence Points / Zen Points** — Gamification metrics. Felt as ambient reward, not displayed as competitive scores.

---

## Design Decisions

### DD-001: Daily Journey is the Primary Screen
The 4-step DashboardGrid (Learn → Practice → Reflect → Live It) is the dominant visual element on the home screen. The sidebar navigation is secondary and should feel collapsed/subdued by default — even on desktop. A user opening the app should feel "I know what to do" not "I wonder what else is here."

*Decided: 2026-06-10*

### DD-002: Daily Journey Steps are Loosely Sequential
Steps 1–4 (Learn → Practice → Reflect → Live It) guide the user in order but are never hard-locked. An incomplete prior step causes the next card to appear subtly dimmed (reduced opacity, muted border) — not disabled. The user can always tap any card. This respects the older user's autonomy while providing clear directional guidance.

Hard-locking is explicitly rejected: a user who skips "Learn" should still be able to "Practice" without feeling punished.

*Decided: 2026-06-10*

### DD-003: Orb is an Arrival Ritual, Not a Practice
The home screen orb (currently labelled "AWAKEN") is a **centering/arrival ritual** — a 30-second breath moment before starting the Daily Journey. It is not a competing practice entry point.

- Label changes from "AWAKEN" → "Arrive" or "Centre" (to be finalised at implementation)
- The orb should feel like "settling in before the work begins"
- The Practice card in the 4-step grid is the clear "today's work" action
- Visual hierarchy must reflect this: orb is smaller/softer, Practice card is prominent

Explicitly rejected: treating the orb and Practice card as equal entry points to separate practices.

*Decided: 2026-06-10*
