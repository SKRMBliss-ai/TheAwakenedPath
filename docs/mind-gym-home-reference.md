# Mind Gym Kids home design reference

Approved reference: ChatGPT Kids app, **Plan For Two Flows**:
https://chatgpt.com/g/g-p-6a96b289445481919b989ac635a20cd7-kids-app/shared/c/6aa9b718-9430-83eb-b694-b160239fda8d

The tracked `src/assets/mind_gym_assets_for_claude.zip` contains the approved
1672×941 screenshot and asset handoff. Do not substitute the earlier three-knob
design from the other project conversation.

Home has two destinations: Funny Feeling (one connected six-stage journey)
and My Good Choices (seven rooms). The red-cap explorer and Chirpy sit between
them. Desktop uses the approved illustration with semantic, keyboard-operable
hotspots and live greeting/calendar/points overlays. At 1100px and below, the
separate art pieces are composed into a responsive layout; phone starts with
only the two destination buttons. Text baked into the desktop illustration is
also represented in the accessible DOM, but is not dynamically localizable.

Rebuild production WebP assets by extracting the archive into a temporary
directory and running `node scripts/prepare-home-assets.mjs <directory>`.
Several original crops were inaccurate; the script deliberately extracts room
art and step icons from the approved screenshot instead.

Room notes use existing local monthReviews storage, keyed by YYYY-MM-DD:roomId,
and appear under the selected month in My Inner Diary. Data stays on this device.

Verification: production build and TypeScript passed; HomeScreen, ReflectionRoom,
and preparation script pass targeted ESLint. BestApp has an existing
react-hooks/set-state-in-effect finding in the seasonal-popup initialization.
Tested desktop home, phone two-destination reveal, room game launch, and saving
a thought then reading it back in the diary. Broader Truth Lab redesign remains
separate from this home implementation.
