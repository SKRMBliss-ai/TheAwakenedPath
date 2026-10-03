import type { ReactNode } from 'react';
import * as sound from '../kit/sound';
import './RoomLinks.css';

export function RoomLinks({ items }: { items: { label: string; icon: string; onClick?: () => void }[] }) {
  const shown = items.filter((i) => i.onClick);
  if (!shown.length) return null;
  return (
    <nav className="rl-links" aria-label="More places">
      {shown.map((i) => (
        <button key={i.label} onClick={() => { sound.play('enterRoom'); i.onClick!(); }}>
          <span aria-hidden="true">{i.icon}</span> {i.label}
        </button>
      ))}
    </nav>
  );
}

export function RoomCorner({ children }: { children: ReactNode }) {
  return <div className="rl-corner">{children}</div>;
}
