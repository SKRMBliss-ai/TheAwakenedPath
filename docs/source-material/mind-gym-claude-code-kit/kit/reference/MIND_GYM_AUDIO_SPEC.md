# Mind Gym — Audio Design Spec

**A sourcing brief. Hand this to whoever finds or makes the sound.**

**Owner:** Sim · **Last updated:** 2 September 2026
**Companion to:** `MIND_GYM_UI_DESIGN.md` §10

---

## 0. Licensing — read before downloading anything

| Source | Verdict | Why |
|--------|---------|-----|
| **Voicy** | ❌ **Do not use** | Soundboard clips ripped from films. Actual Disney/Pixar audio in a commercial children's app is straightforward infringement |
| **Pixabay** | ⚠️ **Prototype only** | Commercial use permitted, no attribution needed — but Pixabay does not verify uploader rights and offers **zero indemnification**. You indemnify them |
| **Epidemic Sound / Artlist / Soundstripe** | ✅ **For ship** | Real licences with real indemnification. A few hundred pounds removes an entire risk category |
| **Commissioned** | ✅ **Best for the beds** | Six ambient loops is a small, cheap brief for a sound designer, and they'll be better than anything stock |

**Rule for the whole project:** anything that reaches a real child's device must be traceable to a licence with indemnification. Prototype freely; don't let a placeholder ship.

---

## 1. The principle

> **Sound makes the room feel real. It never comments on what the child does.**

There is no success sound in this app. No ding on selection, no chime on completion, no fanfare at the end of a session. The moment a child hears a reward sound, they start optimising their emotional self-report — and the absence of that sound is a bigger design statement than anything we add.

Three tests every asset must pass:

1. **The 30% test.** Play it at 30% volume for sixty seconds. If you *notice* it, it's wrong.
2. **The quiet-state test.** In the adaptive state ambient drops by 60%. If the bed becomes thin or empty at 40% volume, it's wrong.
3. **The bedtime test.** Would this be tolerable in a dark room at 8pm with a tired seven-year-old? If not, it's wrong.

---

## 2. Ambient beds — 6 assets

The main investment. Loopable, seamless, 60–120 seconds, no discernible melody, nothing that becomes a tune on the fortieth listen.

| ID | Scene | Character | Search terms |
|----|-------|-----------|--------------|
| `AMB-night` | The front door, check-in | Distant city hum or far-off wind. Very low. One faint, occasional distant event — a car, a dog, a train — no more than twice per loop | `night room tone` · `distant city ambience quiet` · `bedroom night atmosphere` |
| `AMB-den` | The hinge, the story | Fire crackle, soft and irregular, no sharp pops. Warm, enclosed, small room | `fireplace crackle loop soft` · `cozy room tone fire` |
| `AMB-investigate` | Thought Room, Body Detective | Cool, low electrical or air hum. Slightly hollow. Curious rather than tense | `low hum room tone` · `laboratory ambience quiet` · `subtle air conditioning drone` |
| `AMB-dawn` | Reflection, the journal | Sparse birdsong — three or four calls per minute, not a dawn chorus. Air, light, space | `sparse morning birds distant` · `quiet dawn ambience` |
| `AMB-weather` | Big Feelings, anger content | Steady rain on glass, distant. **No thunder cracks.** Enveloping, not threatening | `rain on window loop` · `distant rain ambience no thunder` |
| `AMB-still` | Trusted-adult screen, quiet state | Near silence with one sustained low tone, barely present. Holding, not empty | `deep drone soft low` · `calm sustained tone ambient` |

**Rejection criteria:** anything with a melody, a beat, swelling strings, a "magical" shimmer, or a sound that repeats often enough to be recognised as a loop.

---

## 3. Interface sounds — 4 assets

All under 200ms. All so quiet a child would struggle to describe them.

| ID | Trigger | Character | Search terms |
|----|---------|-----------|--------------|
| `UI-select` | Tapping a choice pill or face | Soft, low, felt or wood. A *placement*, not a click. Absolutely not a bell | `soft wood tap` · `felt button press` · `muted thud ui` |
| `UI-deselect` | Un-choosing | Same sound, pitched down slightly | derive from `UI-select` |
| `UI-move` | Screen transition | A breath of air. Almost subliminal — the child should feel it, not hear it | `soft air whoosh subtle` · `gentle transition swell` |
| `UI-line` | A line of story appearing (P-05) | Papery, tiny. Like a page settling | `paper settle soft` · `subtle page turn quiet` |

**Never:** clicks, beeps, pops, taps with high-frequency content, or anything with an obvious attack transient. Children use these apps in bed with the volume up.

---

## 4. Moment beats — 4 assets

The only emotionally-loaded sounds in the app. Handle with restraint.

| ID | Moment | Character | Search terms |
|----|--------|-----------|--------------|
| `MOM-name` | After a feeling is named (SH-NAME) | **A warmth, not a reward.** A low sustained note swelling and fading over ~1.5s. It should feel like being met, not like scoring | `warm low swell ambient` · `soft pad rise gentle` |
| `MOM-story` | Story assembling at the hinge | One per line, ~400ms apart. A soft shimmer with no bell tone — think dust catching light | `soft shimmer no bell` · `gentle airy texture short` |
| `MOM-saved` | Reflection saved to the journal | A book closing. Soft, final, satisfying, quiet | `book close soft` · `gentle wooden close` |
| `MOM-reveal` | The trapdoor reveal, after the 800ms silence | **One** warm note. Low, single, unhurried. Never triumphant — the child has just discovered something, not won | `single warm note low` · `soft piano single note reverb` |

`MOM-name` is the one to get right. It's the emotional payoff of the entire app and it must not sound like a video game.

---

## 5. Game-specific — 5 assets

| ID | Game | Character | Search terms |
|----|------|-----------|--------------|
| `GAM-go` / `GAM-stop` | Red Light, Green Light | Two clearly distinguishable tones, neither harsh. Distinguishable by *timbre* as well as pitch, for colour-blind and hard-of-hearing children | `soft marimba two tone` · `gentle chime pair low` |
| `GAM-inflate` | Slow the Pop | Rising tension, stretching. **No bang at the end** — the balloon bursting is a soft give, not a shock | `balloon stretch slow` · `rising tension soft no impact` |
| `GAM-breath` | Balloon Breath, Warm Light | A slow rise and fall, 4s in, 6s out, loopable. The pacing *is* the instruction | `breathing pad slow loop` · `calm swell 4 seconds` |
| `GAM-glow` | Body scan region tap | A very soft pulse. Warmer and rounder than `UI-select` | `soft pulse warm low` |
| `GAM-laugh` | Try Not To Laugh | The silly stimulus itself. Needs to be genuinely funny to a child and not annoying on the twentieth play | *commission or curate — stock will not deliver this* |

---

## 6. Voice

**Record this. Do not use stock or synthesis.**

- **One narrator throughout**, so the app has a consistent companion. Warm, unhurried, adult.
- **Never the children's-television register.** No sing-song, no exaggerated brightness. Children hear that as being talked down to by about six.
- **Two takes of every line:** normal, and a *quiet-state* take — slower, lower, softer. The adaptive state (§7 of the UI doc) swaps to the second set.
- Regionally neutral; consider recording a second locale later rather than compromising the first.
- **The shoulder creature**, if it survives design, gets a distinctly lighter voice and **never delivers an important line.** Wordless mutters and chirps are enough — it doesn't need language to read as chattering.

---

## 7. Mix and behaviour

- **Default: sound off** on first launch. Offered once, plainly, then never nagged.
- **Quiet state:** ambient to 40%, voice slower and lower, all interface sound off except `UI-select`.
- **Ducking:** ambient drops 6dB under narration, recovers over 800ms.
- **Loudness:** target −23 LUFS integrated. Peaks never above −6dBFS. This app is used in bed.
- **Respect the silence.** The 800ms pause before a trapdoor reveal has **no sound at all** — no ambient duck, no breath, nothing. The silence is the content.
- **Headphones assumed** for the older band, **device speaker** for the younger. Test both; low-frequency beds vanish on a tablet speaker.

---

## 8. What to never download

Everything a "pixar sound effects" search will actually return:

magic sparkles · twinkles · chimes · dings · level-up stings · coin sounds · fanfares · cartoon boings · slide whistles · comedy pops · dramatic orchestral hits · whooshes with impacts · applause · "success" sounds of any kind · anything with a bell in it.

None of these belong in an app where nothing is ever correct.

---

## 9. Sourcing checklist

For each asset, before it goes near the build:

- [ ] Licence permits commercial use in a mobile app
- [ ] Source provides indemnification (required for ship, not for prototype)
- [ ] Passes the 30% test
- [ ] Passes the quiet-state test at 40%
- [ ] Passes the bedtime test
- [ ] Loops seamlessly with no audible seam (ambient only)
- [ ] No melody, no beat, no bell
- [ ] Licence documentation filed with the asset
