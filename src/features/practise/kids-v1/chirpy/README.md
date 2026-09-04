# The Chirpy Emotional State System

Chirpy is the app's emotional visual language. This folder is the canonical
implementation of that idea, and it replaces the emotion-balloon interaction
that used to open the check-in.

## The change, in one line

A child is no longer asked to pick an emotion. They are shown a room with
several Chirpys in it, in different states, and asked whether any of them
feels familiar.

That is a smaller and safer question. "Which emotion are you?" asks a child to
classify themselves and then hands the app a label to act on. "Which one feels
a little like you?" asks them to notice something, which is the actual skill
this app exists to teach, and leaves the label out of it entirely.

## What's here

| File | What it is |
| --- | --- |
| `states.ts` | The state registry, the room layout, and the mapping used for routing. Data only. |
| `ChirpyBeing.tsx` | The single component that renders any Chirpy in any state. |
| `ChirpyRoom.tsx` | The feeling beat: Chirpys placed through the room, plus Chirpy's asides. |

Art lives in `/public/chirpy/*.webp` and is the founder's real character
sheet, already cut into nine poses. Nothing in this folder invents Chirpy art.

## Adding a state

Add a row to `CHIRPY_STATES`. That is the whole procedure.

```ts
{
  id: 'lonely',
  pose: 'idle',          // nearest existing frame until real art exists
  description: 'A Chirpy sitting a little apart from the others',
  motion: 'breathe',
  scale: 0.92,
  selectable: true,
  feeling: 'sad',        // routing hint only, or null
  aside: 'That one’s a bit off on its own.',
}
```

If it should appear in the feeling beat, add a matching slot to
`CHIRPY_ROOM_SLOTS` with a position and a depth. If it needs a way of moving
that doesn't exist yet, add it to `ChirpyMotion` and to the `MOTION` table in
`ChirpyBeing.tsx`.

You should not need to write a component. If it looks like you do, the thing
that actually needs adding is a field on `ChirpyState`.

## Rules this system is built around

**No labels.** No Chirpy in the room carries a visible caption. The
`description` field exists for screen readers and for people reading the code.
The moment one of them is labelled "Worried", the screen becomes a vocabulary
quiz and the child starts answering the word instead of themselves.

**Any number, including none.** Selection is a toggle. Several can be
familiar at once, changing your mind is free, and the way forward works
whether or not anything is chosen — the button just reads differently.

**"Not sure" is a Chirpy, not an escape hatch.** It sits quietly in the room
with the others, because not knowing is a way to feel and not a failure to
answer. Its `feeling` is `null`, so it is never quietly recorded as an
emotion.

**Picking is not diagnosing.** `feeling` on a state is a routing hint: which
room to offer at the end, which on-device tally to add to. Nothing in the
interface may present it back to the child as a finding about them. This is
why the intensity beat asks "how big does it feel right now?" rather than
naming the feeling.

**Chirpy wonders, he never concludes.** The `aside` strings are all tentative
— "hmm", "that one looks familiar", "could be". Chirpy is a companion who is
also working it out, not an authority who knows. A character who knows things
creates performance pressure; one who is also guessing creates company.

**Familiarity is weather, not advice.** Where this device has seen a feeling
often, that Chirpy sits in a slightly warmer pool of light. No caption, no
arrow, no badge. A child may notice it or not.

## Still to come

The wider spec calls for the whole check-in to become one continuous journey
through the Reflection Room — body, thought, observation, story, and
reframing revealed as the space transforms, rather than as separate screens.
The feeling beat is the first part of that. The beats after it are still
screen-based and are being converted in order.
