import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Sparkles } from 'lucide-react';
import { useKidStore } from '../../../kids/store';
import { CHROME, Cta, FONT, GrownUpExit, Question, SceneLine } from '../ui/chrome';
import { DoorHandle } from '../ui/DoorHandle';
import { Chirpy, RoomScene } from '../ui/scene';
import { useMotion } from '../ui/quiet';
import { DIM } from '../ui/scenery';
import { getRoom } from '../rooms';
import { nextStoryCase, storyCaseDone, type StoryBit } from '../kit/differentStory';
import * as sound from '../kit/sound';

/**
 * THE DIFFERENT STORY ROOM.
 *
 * The painting has had a lit dome labelled Different Story on the middle
 * shelf since the hub was rebuilt, and until now pressing it opened Helping
 * Hands Village — a room about helping out at home, reached through a sign
 * about stories, because the hub mapped domes to rooms by which ARTWORK they
 * shared rather than by what they said. A child who pressed the ship in the
 * bottle and got asked whether they'd tidied up had been told, fairly
 * clearly, that the labels in this building don't mean anything.
 *
 * So this is the room the sign has been promising. It runs the two teaching
 * moves that belong to it (kit/differentStory has both, and the founder's
 * document has the reasoning), in the order they have to go in:
 *
 *   1. SORT IT. What would a camera in that corridor actually have recorded,
 *      and what arrived afterwards, from in here? A child cannot look for a
 *      second story until they can see where the first one came from.
 *   2. TURN THEM OVER. Their mind picked one account in about a tenth of a
 *      second. Four more fit the same footage. They come face down and the
 *      child turns them, because being handed a list of alternatives is
 *      reading, and turning one over is finding it.
 *   3. STOP AT "WE DON'T KNOW". This room never says which story is true and
 *      it never prefers the kind one. It ends by asking which one they're
 *      taking with them and accepting any answer, the mind's original very
 *      much included — a room that only accepts the cheerful ending has
 *      taught a child to give the cheerful answer.
 *
 * NOTHING A CHILD DOES IN HERE IS WRONG. Put "they're cross with me" in the
 * camera pile and the room asks where they'd point it, watches them fail to
 * answer, and moves the card across itself. That is the entire lesson, and it
 * is a better version of it than getting it right first time would have been.
 */
export function DifferentStoryRoom({
  onExit,
  onGrownUp,
}: {
  onExit: () => void;
  onGrownUp: () => void;
}) {
  const m = useMotion();
  const awardPoints = useKidStore((s) => s.awardPoints);
  const art = getRoom('story');
  const accent = art.palette.accent;

  /* Fixed for the life of the visit. Picked in a memo rather than in state so
     a re-render can't quietly swap the situation under a child halfway
     through sorting it. */
  const kase = useMemo(() => nextStoryCase(), []);

  const [beat, setBeat] = useState<'sort' | 'others' | 'land'>('sort');
  /** Which bits have been placed, and where they ended up. */
  const [placed, setPlaced] = useState<Record<string, 'camera' | 'mind'>>({});
  /** What Chirpy said about the last card placed. */
  const [reply, setReply] = useState<string | null>(null);
  /** Which of the other accounts have been turned over. */
  const [turned, setTurned] = useState<string[]>([]);
  /** The one they're taking with them, if they've said. */
  const [carrying, setCarrying] = useState<string | null>(null);

  const unplaced = kase.bits.filter((b) => !placed[b.text]);
  const card: StoryBit | undefined = unplaced[0];
  const cameraPile = kase.bits.filter((b) => placed[b.text] === 'camera');
  const mindPile = kase.bits.filter((b) => placed[b.text] === 'mind');

  /* Sorting done — on to the stories. A beat's pause so the last card can
     land before the room changes what it's asking. */
  useEffect(() => {
    if (beat !== 'sort' || unplaced.length) return;
    const t = window.setTimeout(() => { setBeat('others'); setReply(null); }, 1500);
    return () => window.clearTimeout(t);
  }, [beat, unplaced.length]);

  const place = (bit: StoryBit, said: 'camera' | 'mind') => {
    sound.play('tap');
    /* The card always ends up where it belongs. What changes is what Chirpy
       says on the way — agreement, or the camera question, which a child
       cannot answer and is not meant to. */
    setPlaced((p) => ({ ...p, [bit.text]: bit.camera ? 'camera' : 'mind' }));
    setReply(
      bit.camera === (said === 'camera')
        ? (bit.camera ? 'Click. Got it.' : 'Yep. That one lives in here.')
        : (bit.camera
            ? 'Careful — the camera did get that one. It really happened.'
            : 'Go on then, point a camera at that. Where would you even aim it? There’s nothing out there to point at. That bit happened in here.'),
    );
  };

  const turn = (other: string) => {
    if (turned.includes(other)) return;
    sound.play('roomCard');
    setTurned((t) => [...t, other]);
  };

  const allTurned = turned.length >= kase.others.length;

  const finish = () => {
    storyCaseDone(kase.id);
    /* Unattributed on purpose — this is not one of the seven virtues and its
       points must not land in any of their totals. */
    awardPoints(12);
    sound.play('resolve');
    onExit();
  };

  /* What he says, by beat. One voice, one line at a time. */
  const chirpyLine =
    beat === 'sort'
      ? (reply ?? 'Pretend you’ve got a camera. Point it at what happened.')
      : beat === 'others'
        ? (allTurned
            ? 'Right. Five accounts of the same thing.'
            : 'Your mind picked that one in about a tenth of a second and then stopped looking. Have a look underneath.')
        : 'So which one’s true?';

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden" style={{ fontFamily: FONT }}>
      <DoorHandle side="left" label="Back" onClick={onExit} accent={accent} />
      <RoomScene room={art} dim={DIM.content} />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-end p-3 sm:p-4">
        <div className="pointer-events-auto"><GrownUpExit onClick={onGrownUp} /></div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[27rem] flex-col gap-3.5 px-4 pb-28 pt-16">
        <Chirpy pose={beat === 'land' ? 'hopeful' : 'curious'} line={chirpyLine} align="left" />

        {/* THE SITUATION, and it stays on screen the whole way through. Every
            question in this room is about these two sentences, and a child
            who has to remember them while sorting cards is doing a memory
            exercise instead of this one. */}
        <div
          className="rounded-[20px] px-4 py-3.5"
          style={{ background: 'rgba(10,6,22,0.55)', border: `1px solid ${accent}44` }}
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: accent }}>
            What happened
          </p>
          <p className="mt-1 text-[15px] font-bold leading-snug" style={{ color: CHROME.text }}>
            {kase.scene}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── 1 · The camera test ─────────────────────────────────────── */}
          {beat === 'sort' && (
            <motion.div
              key="sort"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32 }}
              className="flex flex-col gap-3"
            >
              <Question room={art}>Which bits did the camera get?</Question>

              <AnimatePresence mode="wait">
                {card && (
                  <motion.div
                    key={card.text}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.26 }}
                    className="rounded-[22px] px-4 py-5 text-center"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.18)',
                    }}
                  >
                    <p className="text-[17px] font-extrabold leading-snug" style={{ color: CHROME.text }}>
                      “{card.text}”
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {card && (
                <div className="grid grid-cols-2 gap-2.5">
                  <SortButton
                    icon={<Camera size={19} strokeWidth={2.4} />}
                    label="The camera saw it"
                    accent="#7FC7F0"
                    onClick={() => place(card, 'camera')}
                    minHeight={m.target}
                  />
                  <SortButton
                    icon={<Sparkles size={19} strokeWidth={2.4} />}
                    label="That bit’s in my head"
                    accent={accent}
                    onClick={() => place(card, 'mind')}
                    minHeight={m.target}
                  />
                </div>
              )}

              {/* The two piles, building up as they go. This is the picture
                  the whole move is trying to leave behind — two short lists,
                  both of them true, made of different stuff. */}
              {(cameraPile.length > 0 || mindPile.length > 0) && (
                <div className="mt-1 grid grid-cols-2 gap-2.5">
                  <Pile title="The camera got" hue="#7FC7F0" items={cameraPile.map((b) => b.text)} />
                  <Pile title="Added in here" hue={accent} items={mindPile.map((b) => b.text)} />
                </div>
              )}
            </motion.div>
          )}

          {/* ── 2 · The other accounts ──────────────────────────────────── */}
          {beat === 'others' && (
            <motion.div
              key="others"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32 }}
              className="flex flex-col gap-3"
            >
              <Question room={art}>What else would fit?</Question>
              <SceneLine>
                Not nicer ones. Just ones that fit everything the camera got.
              </SceneLine>

              {/* The mind's own account, named as the first one rather than
                  the wrong one. It gets the same card as the others. */}
              <StoryCard text={kase.minds} hue={accent} eyebrow="What your mind went with" open />

              <div className="flex flex-col gap-2">
                {kase.others.map((o) => (
                  <StoryCard
                    key={o}
                    text={o}
                    hue="#7FC7F0"
                    eyebrow="Also fits"
                    open={turned.includes(o)}
                    onOpen={() => turn(o)}
                  />
                ))}
              </div>

              {allTurned && (
                <Cta label="So which one’s true?" onClick={() => { sound.play('roomCard'); setBeat('land'); }} accent={accent} />
              )}
            </motion.div>
          )}

          {/* ── 3 · We don't know ───────────────────────────────────────── */}
          {beat === 'land' && (
            <motion.div
              key="land"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32 }}
              className="flex flex-col gap-3"
            >
              <Question room={art}>We don’t know.</Question>
              <SceneLine>
                That’s the interesting bit. We don’t actually know, and neither did your mind — it
                just picked fast and showed you one.
              </SceneLine>

              <p className="mt-1 text-[13px] font-extrabold" style={{ color: accent }}>
                Which one are you taking with you?
              </p>

              {/* Every account is on this list, the mind's first one included,
                  and picking it is a perfectly good answer. The room records
                  nothing about which — the choice is the exercise, not the
                  data. */}
              <div className="flex flex-col gap-2">
                {[kase.minds, ...kase.others].map((o) => (
                  <button
                    key={o}
                    onClick={() => { sound.play('tap'); setCarrying(o); }}
                    className="rounded-[16px] px-4 py-3 text-left text-[14px] font-bold leading-snug"
                    style={{
                      minHeight: m.target,
                      color: CHROME.text,
                      background: carrying === o ? `${accent}26` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${carrying === o ? accent : 'rgba(255,255,255,0.14)'}`,
                    }}
                  >
                    {o}
                  </button>
                ))}
              </div>

              {carrying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-[14px] font-bold leading-snug" style={{ color: CHROME.textSoft }}>
                    You don’t have to believe it. You just have to know your mind had options and only
                    showed you one.
                  </p>
                  <Cta label="Out you go" onClick={finish} accent={accent} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** One of the two places a card can go. */
function SortButton({
  icon, label, accent, onClick, minHeight,
}: {
  icon: React.ReactNode; label: string; accent: string; onClick: () => void; minHeight: number;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 rounded-[18px] px-2 py-3 text-center"
      style={{
        minHeight,
        background: `${accent}1A`,
        border: `1px solid ${accent}77`,
        color: CHROME.text,
      }}
    >
      <span style={{ color: accent }}>{icon}</span>
      <span className="text-[12.5px] font-extrabold leading-tight">{label}</span>
    </motion.button>
  );
}

/** A short list of what has gone where, under a heading in its own colour. */
function Pile({ title, hue, items }: { title: string; hue: string; items: string[] }) {
  return (
    <div className="rounded-[16px] px-3 py-2.5" style={{ border: `1px solid ${hue}44` }}>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: hue }}>
        {title}
      </p>
      {items.map((t) => (
        <p key={t} className="mt-1 text-[11.5px] font-bold leading-snug" style={{ color: CHROME.textSoft }}>
          {t}
        </p>
      ))}
    </div>
  );
}

/**
 * One account of what happened.
 *
 * Face down until it's turned. The alternatives arrive this way because a
 * list of four explanations read straight off the screen is somebody else's
 * thinking — the small act of turning one over is what makes it feel like the
 * child found it, which is the only version of this that does anything.
 */
function StoryCard({
  text, hue, eyebrow, open, onOpen,
}: {
  text: string; hue: string; eyebrow: string; open: boolean; onOpen?: () => void;
}) {
  const m = useMotion();
  return (
    <motion.button
      whileTap={open ? undefined : { scale: 0.98 }}
      onClick={open ? undefined : onOpen}
      className="w-full rounded-[16px] px-4 py-3 text-left"
      style={{
        minHeight: m.target,
        background: open ? `${hue}1F` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${open ? `${hue}99` : 'rgba(255,255,255,0.14)'}`,
        cursor: open ? 'default' : 'pointer',
      }}
    >
      <AnimatePresence mode="wait">
        {open ? (
          <motion.span
            key="face"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="block"
          >
            <span className="block text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: hue }}>
              {eyebrow}
            </span>
            <span className="mt-0.5 block text-[14px] font-bold leading-snug" style={{ color: CHROME.text }}>
              {text}
            </span>
          </motion.span>
        ) : (
          <motion.span
            key="back"
            exit={{ opacity: 0 }}
            className="block text-[13.5px] font-bold"
            style={{ color: CHROME.textSoft }}
          >
            Turn this one over
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
