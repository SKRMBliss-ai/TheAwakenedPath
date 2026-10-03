/* How each creature stands in the world. Most stand on the floor and cast a
   shadow under their feet; a flier hovers above its shadow; a swimmer bobs in
   its own little pool of water, drawn with it. */
export type Stance = 'ground' | 'flier' | 'swimmer';

const FLIERS = new Set(['ptero', 'phoenix', 'jelly', 'ufo', 'planet', 'rocket']);
const SWIMMERS = new Set(['plesio', 'dolphin', 'turtle', 'octopus', 'puffer', 'seahorse', 'shark', 'narwhal', 'whale']);

export function stanceOf(id: string): Stance {
  return FLIERS.has(id) ? 'flier' : SWIMMERS.has(id) ? 'swimmer' : 'ground';
}
