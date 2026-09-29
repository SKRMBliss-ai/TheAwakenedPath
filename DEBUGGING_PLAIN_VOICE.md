# Debugging Plain Voice Issue

## The Problem

Some thoughts are being spoken in "plain voice" (no emotional direction, no character voice) instead of with the proper "mind" voice (Puck) and emotion/feeling. When searching the admin cache for these plain-voice thoughts, they don't appear in either the cached lines or the failed lines sections.

Examples from recent testing:
- "What if I don't finish in time?" - plain voice instead of with emotions
- "what if nobody tell me what is happening" - plain voice by Leda
- "There are too many things to remember" - plain voice, not found in cache

## The Root Cause

The cache key system uses: `${who}|${feeling}|${text}`

A thought like "What if I don't finish in time?" should be cached under:
- **Correct key**: `mind|scared|What if I don't finish in time?`
- **Plain voice key**: `grownup||What if I don't finish in time?`

These are **completely different cache entries**. If a thought is spoken with the wrong key, it won't be found when searched by the correct key.

## Investigation Steps

### Step 1: Deploy Latest Changes

Deploy from Cloud Shell with:
```bash
firebase deploy --only functions:chirpyVoice,functions:cacheStats,functions:cacheClear,functions:cacheByEmotion,hosting
```

This includes:
- Enhanced admin panel with cached lines grouped by date
- "Failed, not cached" section showing lines that couldn't cache and why
- Search functionality across both sections

### Step 2: Access Admin Panel

Navigate to: `https://awakened-path-2026.web.app/?admin=<your-admin-token>`

The admin panel will show:
- **Cached lines** - organized by date, showing: text, character, emotion, voice, creation time
- **Failed lines** - showing: text, reason, failure count, last attempt time
- **Search** - filter both sections by text, character, emotion, or reason

### Step 3: Test Plain Voice Thoughts

While using the app normally:

1. Navigate to a section that shows thoughts (Story Lab, Feelings selection, etc.)
2. Listen for thoughts that sound like plain voice (no emotional tone, adult voice)
3. Note the exact text of the plain-voice thought
4. Go to admin panel (`?admin=<token>`)
5. Search for that thought text

### Step 4: Analyze Results

**If the thought appears in "Cached lines":**
- Check the listed "character" and "emotion" fields
- If showing `grownup` + `plain` or empty emotion: it was cached with the WRONG key
- It should show `mind` + the appropriate feeling (sad, happy, scared, etc.)
- **Action**: Identify where in the code this thought is being spoken with the wrong speaker/feeling

**If the thought appears in "Failed, not cached":**
- Check the "reason" field
- Possible reasons:
  - `rate limited (429)` - too many API calls
  - `daily budget spent (503)` - Gemini API daily limit reached
  - `synthesis failed (502)` - TTS synthesis error with details
- **Action**: Check server logs or retry later if rate limited/budget

**If the thought does NOT appear anywhere:**
- The thought may be using the plain-voice cache key: `grownup||<text>`
- Try searching with partial text
- Check browser dev tools → Network tab → requests to `/api/chirpy-voice`
- Look for cache key in request parameters
- **Action**: Identify the code path calling `speak()` with this text

## Code Locations to Investigate

### Where thoughts are correctly spoken:

1. **thoughtAudioCache.ts line 28** - `playThoughtAudios()`
   ```typescript
   speak(text, false, 'mind', () => window.setTimeout(next, 700), feeling);
   ```
   ✅ Correct: Uses `who='mind'` and passes `feeling`

2. **StoryLabRoom.tsx line 685** - hover on thought clouds
   ```typescript
   speak(text, quiet, 'mind', undefined, carried.feeling || '');
   ```
   ✅ Correct: Uses `who='mind'` and passes `feeling`

### Where plain voice might be coming from:

Look for `speak()` calls without `who` or `feeling` parameters:
- **useSpoken.ts** - now supports optional `who` and `feeling` (UPDATED)
- **scene.tsx** - check if it's speaking thoughts
- **ReflectionPath.tsx** - check for thought playback
- **GamesRoom.tsx** - check for secret thoughts
- Any new component that displays/speaks thoughts

## Likely Fix

If you find a code path speaking thoughts with the wrong parameters:

### Before (plain voice):
```typescript
speak(thought, quiet);  // defaults to grownup, no feeling
```

### After (with emotions):
```typescript
speak(thought, quiet, 'mind', undefined, feeling);  // mind voice + emotion
```

Or if using `useSpoken`:
```typescript
useSpoken(thought, 'mind', feeling);  // now supports these parameters
```

## Testing the Fix

After making changes:

1. Rebuild: `npm run build`
2. Deploy functions: `firebase deploy --only functions:chirpyVoice,hosting`
3. Go to app and generate the plain-voice thought again
4. Check admin panel → search for that thought
5. Should now appear in "Cached lines" with:
   - Character: mind (Puck) ✓
   - Emotion: correct feeling (sad, scared, etc.) ✓
   - Should NOT appear in "Failed, not cached"

## Key Insight

The admin panel is your window into what's actually being cached and how. Use it to:
- Verify cache keys are correct
- See exactly which character/emotion combination each line is being stored under
- Identify mismatches between intended and actual voice rendering
- Debug why specific lines aren't cached as expected

## Questions to Answer

1. **Is "There are too many things to remember" cached?** - Check cached lines section
2. **If cached, what emotion is it under?** - Look at the emotion column
3. **If not cached, why not?** - Check failed lines section for reason
4. **What cache key was used?** - `${character}|${emotion}|${text}`

Use these answers to trace back to the code that's speaking the thought.
