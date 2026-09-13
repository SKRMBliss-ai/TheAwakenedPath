import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useKidStore } from '../../../kids/store';
import { COMPANIONS } from '../../../kids/data';
import { CHROME, FONT } from '../ui/chrome';
import { chirpySprite, chirpySrcSet } from '../ui/sprites';
import * as sound from '../kit/sound';
import { useSpoken } from '../ui/useSpoken';

/**
 * THE FIRST NIGHT — what a child meets before anything else.
 *
 * The old opening asked a six-year-old to type his name on a phone keyboard,
 * then pick an avatar, then read a paragraph about collecting points. Three
 * screens of admin before a single thing had happened. Nothing had gone
 * wrong, nobody wanted anything, and there was therefore nothing whatsoever
 * to care about — which is the one thing an opening cannot afford, and the
 * reason no film in history has ever opened on a form.
 *
 * So this opens the way every story does: in the middle of something, with
 * somebody in trouble.
 *
 * IT IS DARK AND CHIRPY CANNOT FIND THE LIGHT. The child taps, a firefly goes
 * up, and the room comes on. That one gesture introduces the whole app at
 * once — the dark gym, the fireflies, and a companion who needs help rather
 * than gives it — and it does it without a word of explanation. It is also
 * the app's entire thesis acted out in three seconds: you turned the light on.
 *
 * THE NAME IS ASKED AFTERWARDS, AND BY CHIRPY, because by then somebody
 * actually wants to know it. Same question, same keyboard, completely
 * different act: answering a friend rather than filling in a field. And it is
 * skippable, because a child who doesn't want to type shouldn't be held at
 * the door — the hub already handles having no name.
 *
 * NOTHING HERE IS SKIPPABLE-BY-TIMER AND NOTHING AUTOPLAYS PAST. Every beat
 * waits for a tap. A child who wants to sit in the dark for a minute before
 * turning the light on is having exactly the right first experience of this
 * app.
 */

type Beat = 'dark' | 'lit' | 'name' | 'who';

export function FirstNight() {
  const completeOnboarding = useKidStore((s) => s.completeOnboarding);
  const [beat, setBeat] = useState<Beat>('dark');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const lit = beat !== 'dark';

  /*
    THE FIRST THING A CHILD MEETS, SAID OUT LOUD. Every word here lands
    before a six-year-old has been asked to read anything, and this is the
    one screen where failing to read it means failing to understand what has
    happened at all — that somebody is in the dark and wants the light on.
  */
  useSpoken(
    beat === 'dark' ? 'Is somebody there? I can\u2019t find the light. I\u2019m not scared. I\u2019d just rather it was on.'
    : beat === 'lit' ? 'Oh! Oh, that\u2019s much better. You did that. I\u2019ve been sitting here for ages.'
    : beat === 'name' ? 'What do I call you?'
    : name.trim() ? `Right. ${name.trim()}. Who else is coming?` : 'Fair enough. Who else is coming?',
  );

  /**
   * THE SOUND THE APP OPENS WITH — Chirpy's voice, and a bed under it.
   *
   * The voice was already here (the useSpoken above); what was missing was
   * anything for it to sit on, so the first thing a child met was one
   * sentence and then a silent black screen. The lullaby is the same
   * forest bed the hub uses, so arriving at the hub a minute later is a
   * continuation rather than a key change.
   *
   * ON BY DEFAULT AND NOT ASKED ABOUT. lib/sfx treats "no preference
   * recorded" as sound-on, and the hub ships the switch to turn it off —
   * see BestApp's SoundToggle. Asking a six-year-old to opt into audio on
   * a screen they cannot read yet is how you ship an app nobody hears.
   *
   * playMusicWhenAllowed rather than playMusic because this is the one
   * screen in the app guaranteed to run before the page has been touched,
   * which is precisely when a browser refuses to start audio. It waits for
   * the tap that turns the light on and starts then.
   */
  useEffect(() => sound.playMusicWhenAllowed('twoStories'), []);

  /** The bed belongs to the opening. The hub starts its own on arrival. */
  useEffect(() => () => sound.stopMusic(), []);

  const turnOnTheLight = () => {
    if (lit) return;
    sound.play('discovery');
    setBeat('lit');
  };

  const finish = (a: string) => completeOnboarding(name.trim(), a);

  return (
    <div
      onClick={turnOnTheLight}
      className="relative min-h-[100svh] w-full overflow-hidden"
      style={{ fontFamily: FONT }}
    >
      {/* The room itself, coming on. Two layers rather than one so the warm
          lamp blooms a beat after the ground does — a light being found,
          rather than a screen changing colour. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ background: 'linear-gradient(168deg,#07050E 0%,#04030A 100%)' }}
        animate={{
          background: lit
            ? 'linear-gradient(168deg,#1B1F4A 0%,#080A1F 100%)'
            : 'linear-gradient(168deg,#07050E 0%,#04030A 100%)',
        }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0"
        animate={{ opacity: lit ? 1 : 0 }}
        transition={{ duration: 2.2, delay: 0.35, ease: 'easeOut' }}
        style={{ background: 'radial-gradient(56% 40% at 50% 38%, rgba(255,214,150,0.34) 0%, transparent 72%)' }}
      />

      {/* The firefly that does it. It goes up on the tap and stays up. */}
      <AnimatePresence>
        {lit && (
          <motion.span
            aria-hidden
            className="absolute left-1/2 block h-[7px] w-[7px] rounded-full"
            style={{ background: '#FFE7B4', boxShadow: '0 0 18px 4px #FFC65C' }}
            initial={{ bottom: '18%', opacity: 0, scale: 0.4 }}
            animate={{ bottom: '62%', opacity: 1, scale: 1 }}
            transition={{ duration: 1.7, ease: [0.2, 0.7, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      <div className="relative grid min-h-[100svh] place-items-center px-7">
        <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
          <AnimatePresence mode="wait">
            {beat === 'dark' && (
              <motion.div
                key="dark"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-4"
              >
                {/* He is barely there. A shape in the dark that moves. */}
                <motion.img
                  src={chirpySprite('worried')}
                  srcSet={chirpySrcSet('worried')}
                  sizes="76px"
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="select-none"
                  animate={{ opacity: [0.13, 0.26, 0.13], y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.4, ease: 'easeInOut' }}
                  /* Height only, width auto. It was h-N w-N, i.e. a ~240x290 drawing forced into a square — squashed flat, which is most of what made him look cheap. */
                  style={{ height: 76, width: 'auto', filter: 'brightness(0.35)' }}
                />
                <p
                  className="text-[19px] font-extrabold leading-snug"
                  style={{ color: 'rgba(255,255,255,0.66)', textWrap: 'balance' }}
                >
                  …is somebody there?
                </p>
                <p
                  className="text-[15px] font-semibold leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.42)', textWrap: 'balance' }}
                >
                  I can’t find the light. I’m not scared. I’d just rather it was on.
                </p>
                <motion.p
                  className="mt-1 text-[13px] font-bold"
                  style={{ color: 'rgba(255,255,255,0.32)' }}
                  animate={{ opacity: [0.3, 0.85, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                >
                  tap anywhere
                </motion.p>
              </motion.div>
            )}

            {beat === 'lit' && (
              <motion.div
                key="lit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                /*
                  The exit carries its own timing, and it has to.

                  The 1.5s delay below is there so Chirpy is revealed AFTER
                  the room has finished coming on — but a `transition` on a
                  motion element applies to the exit as well, so with one
                  shared value the child tapped "Go on then" and watched
                  nothing happen for two full seconds while this faded out on
                  a delay. A six-year-old taps again. And again.
                */
                exit={{ opacity: 0, transition: { duration: 0.22, delay: 0 } }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="flex flex-col items-center gap-4"
              >
                {/*
                  HE IS THE THING THAT JUST HAPPENED, so he arrives rather
                  than appears. The old version was a still image on the one
                  beat of the app where a character is supposed to be
                  overjoyed — the copy said "Oh! Oh, that's much better" over
                  a bird standing perfectly still, which reads as the picture
                  having failed to load.

                  Two animations, deliberately: he pops in once (spring, so
                  the landing overshoots the way a delighted thing does) and
                  then keeps bouncing on a loop. One-shot alone leaves him
                  frozen again a second later; loop alone means he was
                  already bouncing before the light came on.
                */}
                <motion.img
                  src={chirpySprite('excited')}
                  srcSet={chirpySrcSet('excited')}
                  sizes="112px"
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="select-none"
                  style={{ height: 112, width: 'auto', filter: 'drop-shadow(0 10px 22px rgba(0,0,0,0.55))' }}
                  initial={{ scale: 0.5, opacity: 0, y: 18 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: [0, -13, 0, -7, 0],
                    rotate: [0, -5, 0, 5, 0],
                  }}
                  transition={{
                    scale: { type: 'spring', stiffness: 340, damping: 13, delay: 1.5 },
                    opacity: { duration: 0.3, delay: 1.5 },
                    y: { repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 1.9 },
                    rotate: { repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 1.9 },
                  }}
                />
                <p className="text-[22px] font-extrabold leading-snug" style={{ color: CHROME.text }}>
                  Oh! Oh, that’s much better.
                </p>
                <p className="text-[15px] font-semibold leading-relaxed" style={{ color: CHROME.textSoft }}>
                  You did that. I’ve been sitting here for ages.
                </p>
                <Next onClick={() => setBeat('name')}>Go on then</Next>
              </motion.div>
            )}

            {beat === 'name' && (
              <motion.div
                key="name"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex w-full flex-col items-center gap-4"
              >
                {/* Head cocked, waiting on an answer. Slower and smaller
                    than the bounce above — he is asking, not celebrating. */}
                <motion.img
                  src={chirpySprite('curious')}
                  srcSet={chirpySrcSet('curious')}
                  sizes="76px"
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="select-none"
                  style={{ height: 76, width: 'auto' }}
                  animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }}
                  transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                />
                <p className="text-[21px] font-extrabold leading-snug" style={{ color: CHROME.text }}>
                  What do I call you?
                </p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 24))}
                  placeholder="…"
                  aria-label="Your name"
                  className="w-full rounded-2xl px-4 py-3.5 text-center text-[18px] font-extrabold outline-none"
                  style={{ background: CHROME.pill, border: `1px solid ${CHROME.pillBorder}`, color: CHROME.text }}
                />
                <Next onClick={() => setBeat('who')}>
                  {name.trim() ? `That’s me` : 'I’ll say later'}
                </Next>
              </motion.div>
            )}

            {beat === 'who' && (
              <motion.div
                key="who"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex w-full flex-col items-center gap-4"
              >
                <p className="text-[21px] font-extrabold leading-snug" style={{ color: CHROME.text, textWrap: 'balance' }}>
                  {name.trim() ? `Right. ${name.trim()}.` : 'Fair enough.'} Who else is coming?
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {COMPANIONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setAvatar(c.id); sound.play('tap'); }}
                      className="rounded-2xl px-4 py-3 text-[13.5px] font-extrabold"
                      style={{
                        background: avatar === c.id ? c.color : CHROME.pill,
                        border: `1px solid ${avatar === c.id ? c.color : CHROME.pillBorder}`,
                        color: avatar === c.id ? '#1B1630' : CHROME.text,
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <Next onClick={() => finish(avatar ?? 'sunny')}>
                  {avatar ? 'Come on then' : 'Just us two’s fine'}
                </Next>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** One shape for every forward step, so the child learns one button. */
function Next({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); sound.play('tap'); onClick(); }}
      className="mt-1 rounded-full px-7 py-3.5 text-[15px] font-extrabold"
      style={{ background: '#FFC65C', color: '#2B1A05' }}
    >
      {children}
    </button>
  );
}
