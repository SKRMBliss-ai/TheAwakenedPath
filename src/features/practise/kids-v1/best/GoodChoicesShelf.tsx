import { useEffect, useRef, useState } from 'react';
import { BEHAVIOURS } from '../../../kids/data';
import { useQuiet } from '../ui/quiet';
import { playDoorbell } from '../kit/doorbell';

const ROOMS = [
  ['kind', 'be_kind', 'What kind thing could you do today?'],
  ['truth', 'tell_truth', 'What happens when we tell the truth?'],
  ['choices', 'make_good_choices', 'Which choice helps you and others?'],
  ['include', 'include_everyone', 'How can you include someone today?'],
  ['body', 'take_care_body', 'What helps your body and mind feel good?'],
  ['help', 'help_others', 'Who could you help today?'],
  ['mindheart', 'mind_heart_time', 'Want a quiet moment to breathe or reflect?'],
];

export function GoodChoicesShelf({ onAction, onDiary }: {
  onAction: (id: string, mode: 'play' | 'learn') => void;
  onDiary: () => void;
}) {
  const quiet = useQuiet();
  const [hovered, setHovered] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  const pinned = useRef<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => { clearTimeout(closeTimer.current); }, []);
  const cancel = () => { clearTimeout(closeTimer.current); };
  const approach = (id: string) => {
    clearTimeout(closeTimer.current);
    setHovered(id);
    if (opened === id) return;
    if (!quiet) playDoorbell();
  };
  const leave = (id: string) => {
    setHovered(null);
    closeTimer.current = setTimeout(() => { if (pinned.current !== id) setOpened(current => current === id ? null : current); }, 250);
  };
  const pin = (id: string) => {
    cancel();
    if (pinned.current === id) { pinned.current = null; setOpened(null); }
    else { pinned.current = id; setOpened(id); if (!quiet) playDoorbell(); }
  };
  const shut = () => { cancel(); pinned.current = null; setOpened(null); setHovered(null); };

  return <div className="mg-shelf" onKeyDown={e => {
    if (e.key === 'Escape') {
      e.preventDefault(); shut();
      const door = e.currentTarget.querySelector<HTMLButtonElement>(`[data-door="${opened}"]`);
      door?.focus(); cancel();
    }
  }}>
    {ROOMS.map(([id, art, prompt]) => {
      const title = BEHAVIOURS.find(b => b.id === id)!.title;
      const isOpen = opened === id;
      return <article key={id} className={`mg-cabinet mg-cabinet-${id} ${isOpen ? 'is-open' : ''} ${hovered === id ? 'is-hovered' : ''}`}
        onPointerEnter={e => { if (e.pointerType !== 'touch') approach(id); }}
        onPointerLeave={e => { if (e.pointerType !== 'touch' && !e.currentTarget.contains(document.activeElement)) leave(id); }}
        onFocus={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) approach(id); }}
        onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) leave(id); }}>
        <img className="mg-cabinet-frame" src={`/mind-gym/closed-home/frame-${id}.webp`} alt="" />
        <div className="mg-cabinet-inside" aria-hidden="true"><img src={`/mind-gym/home/room_${art}.webp`} alt="" /></div>
        <button className="mg-cabinet-door" data-door={id} aria-label={`${title} room. Click to open preview.`} aria-expanded={isOpen}
          aria-controls={`preview-${id}`} onClick={() => pin(id)}>
          <img src={`/mind-gym/closed-home/door-${id}.png`} alt="" />
        </button>
        <span className="mg-cabinet-name" aria-hidden="true">{title}</span>
        <div id={`preview-${id}`} className="mg-cabinet-preview" hidden={!isOpen}>
          <button className="mg-preview-close" aria-label={`Close ${title} preview`} onClick={shut}>×</button>
          <p>{prompt}</p>
          <button onClick={() => { shut(); onAction(id, 'play'); }}>▶ Play<span className="sr-only"> {title}</span></button>
          <button onClick={() => { shut(); onAction(id, 'learn'); }}>▤ Learn<span className="sr-only"> {title}</span></button>
        </div>
      </article>;
    })}
    <div className="mg-shelf-note">Little choices.<br />A brighter tomorrow.<button onClick={onDiary}>📖 My Inner Diary</button></div>
  </div>;
}
