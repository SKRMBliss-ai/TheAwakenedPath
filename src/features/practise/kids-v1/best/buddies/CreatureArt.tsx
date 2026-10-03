import { useId, type ComponentType } from 'react';
import { CREATURE_BY_ID, baseOf, isShiny } from '../../../../kids/buddies';
import { paintOf, shinyPal } from './art/color';
import { PALETTES } from './art/palettes';
import { stanceOf } from './art/traits';
import { Defs, type ArtProps } from './art/parts';
import { Anky, CrystalRex, Longneck, Pachy, Para, Plesio, Ptero, Raptor, Rex, Spino, Stego, Trike } from './art/dinos';
import { Bunny, Dragon, Fox, GalaxyDragon, Lamb, Pegasus, Phoenix, RainbowUnicorn, Unicorn } from './art/magic';
import { Alien, Jelly, Planet, Pup, Robot, Rocket, Ufo } from './art/space';
import { Dolphin, Narwhal, Octopus, Puffer, RainbowWhale, Seahorse, Shark, Turtle } from './art/ocean';
import './CreatureArt.css';

const ART: Record<string, ComponentType<ArtProps>> = {
  rex: Rex, trike: Trike, longneck: Longneck, stego: Stego, anky: Anky, para: Para,
  pachy: Pachy, raptor: Raptor, ptero: Ptero, spino: Spino, plesio: Plesio, crystal: CrystalRex,
  unicorn: Unicorn, pegasus: Pegasus, dragon: Dragon, bunny: Bunny, lamb: Lamb, fox: Fox, phoenix: Phoenix, rainbow: RainbowUnicorn,
  dolphin: Dolphin, turtle: Turtle, octopus: Octopus, puffer: Puffer, seahorse: Seahorse, shark: Shark, narwhal: Narwhal, whale: RainbowWhale,
  robot: Robot, alien: Alien, pup: Pup, rocket: Rocket, ufo: Ufo, jelly: Jelly, planet: Planet, galaxy: GalaxyDragon,
};

/**
 * One creature, drawn. `id` may be a shiny one (`rex*`), which is the same
 * drawing turned to new colours with a sparkle round it. A silhouette is how
 * the collection shows one not found yet: the outline only, so it is a guess.
 */
export function CreatureArt({ id, size, silhouette = false, tint = '#2b1f52', still = false, className = '', title }: {
  id: string; size?: number | string; silhouette?: boolean; tint?: string; still?: boolean; className?: string; title?: string;
}) {
  const u = `c${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const base = baseOf(id);
  const shiny = isShiny(id);
  const Art = ART[base];
  const pal = PALETTES[base];
  const stance = stanceOf(base);
  const label = title ?? (silhouette ? 'A buddy you have not found yet' : CREATURE_BY_ID[base]?.name ?? 'Buddy');
  if (!Art || !pal) return null;
  const k = paintOf(shiny ? shinyPal(pal) : pal);
  const filter = silhouette ? `url(#${u}-sil)` : undefined;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={label}
      className={`cr cr-${stance} ${still || silhouette ? 'cr-still' : ''} ${className}`}>
      <Defs u={u} k={k} />
      <defs>
        <filter id={`${u}-sil`} colorInterpolationFilters="sRGB">
          <feFlood floodColor={tint} result="f" />
          <feComposite in="f" in2="SourceAlpha" operator="in" />
        </filter>
        <radialGradient id={`${u}-glow`}>
          <stop offset="0" stopColor="#fff6c4" stopOpacity=".9" />
          <stop offset="1" stopColor="#fff6c4" stopOpacity="0" />
        </radialGradient>
      </defs>
      {shiny && !silhouette && <circle className="cr-aura" cx="100" cy="112" r="92" fill={`url(#${u}-glow)`} />}
      {stance !== 'swimmer' && (
        <ellipse className="cr-shadow" cx="100" cy={stance === 'flier' ? 188 : 184} rx={stance === 'flier' ? 40 : 62} ry={stance === 'flier' ? 5 : 7.5}
          fill="#1a0b2e" opacity={silhouette ? 0.12 : 0.2} />
      )}
      <g className="cr-body" filter={filter}>
        <Art u={u} k={k} />
      </g>
      {shiny && !silhouette && (
        <g className="cr-shiny-sparks" fill="#fff8c8">
          <path d="M 26 40 Q 28 46 34 48 Q 28 50 26 56 Q 24 50 18 48 Q 24 46 26 40 Z" />
          <path d="M 176 30 Q 177.5 34.5 182 36 Q 177.5 37.5 176 42 Q 174.5 37.5 170 36 Q 174.5 34.5 176 30 Z" />
          <path d="M 180 150 Q 181.5 154 185 155.5 Q 181.5 157 180 161 Q 178.5 157 175 155.5 Q 178.5 154 180 150 Z" />
        </g>
      )}
    </svg>
  );
}
