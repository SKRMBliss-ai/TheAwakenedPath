import { BEHAVIOURS } from '../../../kids/data';

const ROOMS = [
  ['kind', 'be_kind', 'What kind thing could you do today?'],
  ['truth', 'tell_truth', 'What happens when we tell the truth?'],
  ['choices', 'make_good_choices', 'Which choice helps you and others?'],
  ['include', 'include_everyone', 'How can you include someone today?'],
  ['body', 'take_care_body', 'What helps your body and mind feel good?'],
  ['help', 'help_others', 'Who could you help today?'],
  ['mindheart', 'mind_heart_time', 'Want a quiet moment to breathe or reflect?'],
];

export function GoodChoicesShelf({ onAction }: {
  onAction: (id: string, mode: 'play' | 'learn') => void;
  onDiary?: () => void;
}) {
  return <div className="mg-shelf">
    {ROOMS.map(([id, slug, prompt]) => {
      const title = BEHAVIOURS.find(b => b.id === id)!.title;
      return <article key={id} className={`mg-room-card mg-room-${id}`}>
        <img src={`/mind-gym/home/room_${slug}.webp`} alt={`${title} room`} className="mg-room-image" />
        <div className="mg-room-overlay">
          <h3>{title}</h3>
          <p>{prompt}</p>
          <div className="mg-room-buttons">
            <button onClick={() => onAction(id, 'play')} className="mg-play-btn">▶ Play</button>
            <button onClick={() => onAction(id, 'learn')} className="mg-learn-btn">▤ Learn</button>
          </div>
        </div>
      </article>;
    })}
  </div>;
}
