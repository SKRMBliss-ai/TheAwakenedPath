import { useState } from 'react';
import { motion } from 'framer-motion';
import { FONT } from '../ui/chrome';
import { useMotion } from '../ui/quiet';
import { agoLabel } from '../kit/cases';
import { tuckAway, type Note } from '../kit/notes';
import * as sound from '../kit/sound';

/**
 * A NOTE, FOUND.
 *
 * Somebody who lives in the same house wrote one line about something they
 * saw this child do, and it has been waiting in the gym. See kit/notes for
 * why this exists — it is the only fact in the whole app that didn't come
 * from the child themselves.
 *
 * IT ARRIVES FOLDED. A child sees a folded note with their parent's name on
 * it and opens it themselves; the opening is most of the point, and a note
 * that had already unfolded itself would be a notification. There is no
 * badge, no count, no "1 new" — see the rules in kit/notes.
 *
 * "PUT IT AWAY" DOES NOT DELETE IT. It stops surfacing, and that's all. A
 * child must be able to stop looking at something without destroying a thing
 * their mum wrote — including on a day when a kind note is the last thing
 * they can face, which does happen and is allowed.
 */
export function NoteFound({ note, onDone }: { note: Note; onDone: () => void }) {
  const m = useMotion();
  const [open, setOpen] = useState(false);

  const accent = '#FFC65C';

  const unfold = () => {
    if (open) return;
    sound.play('discovery');
    setOpen(true);
  };

  const away = () => {
    tuckAway(note.id);
    onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: open ? 0 : -1.5 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: m.quiet ? 0.7 : 0.5, delay: 0.5 }}
      className="mt-4"
    >
      {!open ? (
        <button
          onClick={unfold}
          aria-label={`A note from ${note.from}. Open it.`}
          className="w-full rounded-[20px] px-4 py-4 text-left"
          style={{
            // Paper, not glass — the one object in the gym that came from
            // outside it should not look like the rest of the furniture.
            background: 'linear-gradient(168deg, #F6EEDC 0%, #E8DCC0 100%)',
            border: '1px solid rgba(0,0,0,0.18)',
            boxShadow: `0 10px 26px rgba(0,0,0,0.45), 0 0 22px -10px ${accent}`,
            fontFamily: FONT,
          }}
        >
          <span className="block text-[13px] font-extrabold" style={{ color: '#6B4A28' }}>
            There’s a note here from {note.from}.
          </span>
          <span className="mt-0.5 block text-[12px] font-bold" style={{ color: '#8A6B45' }}>
            Tap to open it
          </span>
        </button>
      ) : (
        <div
          className="rounded-[20px] px-4 py-4"
          style={{
            background: 'linear-gradient(168deg, #F6EEDC 0%, #E8DCC0 100%)',
            border: '1px solid rgba(0,0,0,0.18)',
            boxShadow: '0 10px 26px rgba(0,0,0,0.45)',
            fontFamily: FONT,
          }}
        >
          <p className="text-[16px] font-extrabold leading-snug" style={{ color: '#3B2A16', textWrap: 'balance' }}>
            {note.text}
          </p>
          <p className="mt-2 text-[12.5px] font-bold" style={{ color: '#8A6B45' }}>
            — {note.from}, {agoLabel(note.day)}
          </p>
          <button
            onClick={away}
            className="mt-3 rounded-full px-4 text-[12.5px] font-extrabold"
            style={{
              minHeight: m.target,
              background: 'rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.16)',
              color: '#6B4A28',
            }}
          >
            Put it away
          </button>
        </div>
      )}
    </motion.div>
  );
}
