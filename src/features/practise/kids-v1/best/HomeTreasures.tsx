import { useKidStore } from '../../../kids/store';
import { todayKey } from '../../../kids/data';
import {
  EGG_FRIEND_BY_ID, grewBetween, stageOf, weekStartKey, weekdayIndex,
} from '../../../kids/delight';
import * as sound from '../kit/sound';
import { GardenPaints, PlantArt } from './Garden';
import { EggNest } from './SurpriseEgg';
import './HomeTreasures.css';

/*
  THE THINGS ON THE HOME-PAGE FLOOR.

  Four objects standing in the painted room rather than four more buttons: a
  planter with the child's newest plants growing in it, a rolled-up story map,
  Chirpy's egg in its nest, and a beanbag that is the way into their own corner
  of the treehouse. Each one shows what is new before it is opened — what grew
  overnight, a chapter waiting, an egg ready to hatch, the latest friend
  sitting on the beanbag — because that is the reason to tap it.
*/

function Scroll() {
  return (
    <svg className="tr-scroll" viewBox="0 0 120 90" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="tr-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6dc" /><stop offset="1" stopColor="#e6c690" /></linearGradient>
        <linearGradient id="tr-roll" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#c9975a" /><stop offset=".5" stopColor="#f6dfae" /><stop offset="1" stopColor="#a8743f" /></linearGradient>
      </defs>
      <path d="M18 16 C 40 12, 80 20, 102 14 L 102 72 C 80 78, 40 70, 18 74 Z" fill="url(#tr-paper)" />
      <path d="M28 62 C 40 52, 46 64, 58 52 C 68 42, 76 50, 86 32" stroke="#b07a3a" strokeWidth="2.4" strokeDasharray="1 5" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="61" r="3.4" fill="#9ec8ff" /><circle cx="50" cy="58" r="3.4" fill="#ffc2de" /><circle cx="68" cy="45" r="3.4" fill="#b6f5b0" />
      <path d="M88 22 l3 7 l7 1 l-5 5 l1.5 7 l-6.5 -3.5 l-6.5 3.5 l1.5 -7 l-5 -5 l7 -1 Z" fill="#ffd24a" stroke="#c98a12" strokeWidth="1" />
      <rect x="8" y="10" width="14" height="68" rx="7" fill="url(#tr-roll)" />
      <rect x="98" y="8" width="14" height="70" rx="7" fill="url(#tr-roll)" />
      <path d="M10 40 l -8 -7 l 0 16 Z M20 40 l 9 -6 l 0 14 Z" fill="#e0505a" />
      <circle cx="15" cy="40" r="5" fill="#ff6b6b" stroke="#a83232" strokeWidth="1.2" />
    </svg>
  );
}

export function HomeTreasures({ onGarden, onAdventure, onCorner }: {
  onGarden: () => void; onAdventure: () => void; onCorner: () => void;
}) {
  const plants = useKidStore((s) => s.plants);
  const gardenSeen = useKidStore((s) => s.gardenSeen);
  const friends = useKidStore((s) => s.friends);
  const chaptersRead = useKidStore((s) => s.chaptersRead);
  const today = todayKey();

  const grew = grewBetween(plants, gardenSeen, today);
  /* The three furthest along of the recent ones, in the order they went in:
     three of today's seeds would be three bumps hidden behind the rim. */
  const recent = plants.slice(-9);
  const best = [...recent].sort((a, b) => stageOf(b, today) - stageOf(a, today)).slice(0, 3);
  const latest = recent.filter((p) => best.includes(p));
  const read = chaptersRead[weekStartKey(today)] ?? [];
  const waiting = Array.from({ length: weekdayIndex(today) + 1 }, (_, i) => i).filter((i) => !read.includes(i)).length;
  const friend = friends.length ? EGG_FRIEND_BY_ID[friends[friends.length - 1]] : null;
  const go = (to: () => void) => () => { sound.play('enterRoom'); to(); };

  return (
    <div className="tr-floor">
      <GardenPaints />
      <button className="tr tr-garden" onClick={go(onGarden)}
        aria-label={`My Garden. ${plants.length} ${plants.length === 1 ? 'plant' : 'plants'}${grew ? `, and ${grew} grew overnight` : ''}.`}>
        <span className="tr-art">
          <span className="tr-planter-plants">
            {latest.length
              ? latest.map((p) => <span key={p.id} className="tr-planter-plant"><PlantArt kind={p.kind} stage={stageOf(p, today)} /></span>)
              : <span className="tr-planter-plant"><PlantArt kind="kind" stage={0} /></span>}
          </span>
          <span className="tr-planter-box" />
        </span>
        {grew > 0 && <span className="tr-badge" aria-hidden="true">🌱 {grew} grew!</span>}
        <span className="tr-tag" aria-hidden="true">My Garden</span>
      </button>

      <button className={`tr tr-map ${waiting ? 'is-waiting' : ''}`} onClick={go(onAdventure)}
        aria-label={waiting ? `Story Map. ${waiting === 1 ? 'A chapter is' : `${waiting} chapters are`} waiting for you.` : 'Story Map'}>
        <span className="tr-art"><Scroll /></span>
        {waiting > 0 && <span className="tr-badge" aria-hidden="true">New chapter!</span>}
        <span className="tr-tag" aria-hidden="true">Story Map</span>
      </button>

      <div className="tr tr-egg"><EggNest onCorner={onCorner} /></div>

      <button className="tr tr-corner" onClick={go(onCorner)}
        aria-label={friend ? `My Corner. ${friend.name} is waiting there.` : 'My Corner of the treehouse'}>
        <span className="tr-art">
          <img src="/mind-gym/corner/beanbag.webp" alt="" draggable={false} />
          {friend && <span className="tr-pet" aria-hidden="true">{friend.emoji}</span>}
        </span>
        <span className="tr-tag" aria-hidden="true">My Corner</span>
      </button>
    </div>
  );
}
