# The Mind Gym - Technical Requirements & Rules

This document outlines critical architectural rules, UI requirements, and implementation details. It serves as a guardrail for future enhancements and bug fixes to ensure fragile features are not disturbed.

## 1. Meditation Room (UI & Layout Isolation)

**Rule: No Global Widget Overlap in the Meditation Room**
- The Meditation Room (`MeditationRoom.tsx`) requires the entire viewport for video grids, emojis, chat, and instructor controls.
- When a user enters the Meditation Room (`activeTab === 'meditation'` and `isSidebarCollapsed` is true in `UntetheredSoulApp.tsx`), **all global floating widgets** (such as the Voice Guidance Avatar, Watcher's Pause, and right-aligned WhatsApp Button) MUST be hidden.
- The hiding mechanism uses CSS transitions: `opacity-0 pointer-events-none scale-90 translate-x-10` to smoothly clear the right side of the screen.

**Rule: WhatsApp Button Placement in the Room**
- If a WhatsApp support button is needed during meditation, it must NOT be placed on the right (where chat and emojis live).
- It is instantiated explicitly inside `MeditationRoom.tsx` in the **bottom-left** corner (`<WhatsAppButton position="left" bottomOffset={96} />`).
- The `WhatsAppButton` component supports a `position` prop (`"left" | "right"`) which correctly reverses the direction of its hover tooltip ("Connect with us") so it doesn't render off-screen.

## 2. Meditation Room (Media Synchronization)

**Rule: Accurate True-Time Media Playback (Late Joiner Fix)**
- The Firestore `mediaShare` object tracks `timestamp` (the play head), `isPlaying` (boolean), and `updatedAt` (the precise `Date.now()` when the state was last changed).
- **Participants (`MediaViewer.tsx`):** The `useEffect` that listens for Firestore state changes MUST calculate the "True Live Time". If `isPlaying` is true, it calculates `currentTrueTime = timestamp + (Date.now() - updatedAt) / 1000`. This ensures that if a user joins late, or refreshes the page, they are instantly fast-forwarded to the live moment, rather than restarting from `timestamp`.
- **Admins (`InstructorMediaControls.tsx`):** When the admin plays, pauses, or seeks, they MUST save `Date.now()` into `updatedAt` alongside the current timestamp.

**Rule: Admin Seeking (+15s / -15s)**
- The native YouTube timeline scrubber is blocked to prevent accidental catastrophic desyncs.
- Admins seek using custom custom UI buttons (+15s / -15s) in `InstructorMediaControls.tsx`.
- When these buttons are clicked, the application calculates the *current true time* using the same `updatedAt` formula above, adds or subtracts 15 seconds, and updates Firestore with the new `timestamp` and a fresh `updatedAt = Date.now()`. This ensures precise, instant synchronization across all connected clients.

**Rule: Autoplay Block Resolution Overlay (Participant Autoplay Fix)**
- Modern browsers strictly block programmatic `playVideo()` calls on cross-origin iframes (like YouTube) if the video is unmuted and the user hasn't explicitly interacted with the video itself.
- Because `MediaViewer.tsx` has an invisible `div` overlay blocking direct interactions with the iframe, autoplay will fail for participants joining the stream.
- **The Fix:** The `useEffect` listening for `isPlaying` must verify if the play call was successful. It waits `1500ms` after calling `player.playVideo()`, then checks `player.getPlayerState()`. If the state is not `PLAYING` (1) or `BUFFERING` (3), it flags `needsInteraction = true`.
- This triggers a large "Tap to Sync Video" UI button. When the participant taps this button, `playVideo()` is fired within a synchronous click handler, satisfying browser autoplay policies and flawlessly jumping the user into the live synced stream.
