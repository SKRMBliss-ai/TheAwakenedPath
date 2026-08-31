# CLAUDE.md

## Project North Star

**My Best Every Day — The Personal Practice Gym for the Mind**

Read these documents before implementing substantial product changes:

1. `docs/PRODUCT_VISION.md`
2. `docs/PRODUCT_PRINCIPLES.md`
3. `docs/PRACTICE_ENGINE.md`
4. `docs/CURRENT_STATE.md`
5. `docs/ARCHITECTURE.md`

## Engineering rule

Before coding:

1. Inspect the existing implementation.
2. Read the relevant documentation.
3. Propose the smallest change that satisfies the request.
4. Do not create topic-specific screens when an existing Practice Room capability can be reused.
5. Protect the reusable Practice Room engine.

THIS IS A HARD RULE.

For the current development phase, Claude MUST ONLY work on the PRACTISE area of the application.

Everything outside the Practise area is FROZEN.

DO NOT modify, refactor, redesign, rename, remove or restructure anything outside Practise.

If a requested change appears to require modifying something outside Practise:
1. STOP.
2. Explain what outside file/component would need changing.
3. Explain why it is necessary.
4. Ask for approval before changing it.
   Do NOT make assumptions.

Do NOT fix unrelated bugs.

Do NOT improve unrelated UI.

Do NOT refactor unrelated code.

Do NOT change global styles unless the change is completely isolated to Practise.

Do NOT modify navigation, authentication, settings, profiles, dashboards or other application areas unless explicitly approved.

## Product rule

The product is a practice gym, not a system for “fixing” people.

## AI rule

The Practice Coach helps users explore situations and create practices. It should not diagnose psychological conditions.

## Source-material rule

Philosophical source material may inform the design philosophy. Do not reproduce large passages from copyrighted books.


# IMPLEMENTATION METHOD

Work in small vertical slices.

For each task:

1. Understand the relevant existing Practise code.
2. Identify the smallest useful implementation.
3. State what you intend to change.
4. Implement only the approved scope.
5. Test the change.
6. Report exactly what changed.
7. Identify the next logical Practise slice.

Never implement the entire product vision in one pass.

---

# CURRENT PRODUCT DIRECTION

Practise is the practice gym of the application.

The long-term vision includes:

- Kids Gym
- Adult Gym
- Practice rooms
- Predefined practices
- Today's real-life situations
- Situation → appropriate practice
- Guided practice
- Daily practice
- Completion and reflection
- Progress/rewards where appropriate

However:

THESE ARE THE PRODUCT VISION, NOT A COMMAND TO IMPLEMENT EVERYTHING NOW.

Only implement the specific Practise slice requested.

---

# SCOPE PRIORITY

When deciding whether to make a change:

PRACTISE REQUIREMENT
        ↓
PRACTISE EXISTING ARCHITECTURE
        ↓
SMALLEST NECESSARY CHANGE
        ↓
TEST
        ↓
STOP

Avoid scope creep.
