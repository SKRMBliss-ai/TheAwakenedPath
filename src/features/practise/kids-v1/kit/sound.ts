/**
 * Sound, borrowed from the live Kids Gym.
 *
 * A deliberate one-file dependency on `practise/kids/sound`, rather than a
 * copy: that module is a table mapping cue names to real audio assets in
 * src/assets, and duplicating it would mean two tables drifting apart while
 * pointing at the same mp3s. This re-export is the seam — if v1 ever needs
 * its own sound design, only this file changes, and every call site in
 * kids-v1 already imports from here rather than from across the feature
 * boundary.
 *
 * Design principle from the brief, unchanged and worth restating here
 * because this feature adds a lot of new call sites: sound says "you
 * discovered something", never "you won". There are no reward jingles.
 */

export { play, stopAll, type Cue } from '../../kids/sound';
