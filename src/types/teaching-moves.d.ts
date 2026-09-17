/**
 * The shape of the module the Vite plugin serves from the teaching-moves
 * document. See `teachingMoves()` in vite.config.ts, which parses
 * MIND_GYM_TEACHING_MOVES.md and emits exactly these two exports.
 *
 * Kept deliberately structural rather than importing kit/teachings' own
 * `Teaching`: that file imports THIS one, and a cycle between a module and its
 * own declaration is a thing TypeScript will let you write and then regret.
 */
declare module 'virtual:teaching-moves' {
  export const TEACHINGS: {
    id: string;
    number: number;
    title: string;
    kind: 'trapdoor' | 'experiment' | 'image';
    band?: 'young' | 'older';
    open: string[];
    dare?: string;
    go?: string;
    hold?: number;
    /** Set instead of hold/dare when the child answers before the trapdoor springs. */
    pick?: { ask: string; replies: string[] };
    land: string[];
  }[];
  export const ASIDES: { id: string; number: number; title: string; lines: string[] }[];
}
