import { FEELINGS } from '../kit/checkinContent';
import { THOUGHTS, toKey, type FeelingKey } from '../kit/storyLabContent';
import type { LiveFeeling, LiveThought } from '../kit/liveContent';

/*
  ONE ROW PER FEELING, and what it really offers a child in the Story Lab.

  A feeling ball and a pool of thoughts are two separate lists in the code,
  and they have drifted apart: some balls have no thoughts of their own and
  quietly borrow the general "Other" pool, and Calm has a full pool of
  thoughts but no ball, so no child can ever reach it. Those are the gaps
  this page exists to show.
*/

const POOL_LABEL: Record<FeelingKey, string> = {
  happy: 'Happy', excited: 'Excited', calm: 'Calm', sad: 'Sad', angry: 'Angry',
  scared: 'Scared', worried: 'Worried', jealous: 'Jealous', other: 'Other',
};

export interface FeelingRow {
  id: string;
  label: string;
  hue: number;
  /** A child can pick it in the Feelings room. */
  ball: boolean;
  minAge?: number;
  /** Added on this admin page rather than built in. */
  live?: LiveFeeling;
  /** The built-in thought pool it uses, its own or a borrowed one. */
  pool: FeelingKey;
  borrows: boolean;
  /** Built-in thoughts in its own pool (0 when it borrows). */
  own: number;
  borrowed: number;
  added: number;
  gap: string | null;
  info: string | null;
}

const poolSize = (key: FeelingKey) => new Set(THOUGHTS[key].map((t) => t.text)).size;

export function feelingRows(liveFeelings: readonly LiveFeeling[], liveThoughts: readonly LiveThought[]): FeelingRow[] {
  const addedFor = (id: string) => liveThoughts.filter((t) => t.feeling === id).length;
  const rows: FeelingRow[] = [];

  const describe = (row: Omit<FeelingRow, 'gap' | 'info'>): FeelingRow => {
    let gap: string | null = null;
    let info: string | null = null;
    if (!row.ball && row.id !== 'other') {
      gap = `Has ${row.own + row.added} thoughts but no feeling ball, so children can’t pick it.`;
    } else if (row.ball && row.borrows && row.pool === 'other' && row.added === 0) {
      gap = 'No thoughts of its own yet. It borrows the general “Other” thoughts.';
    } else if (row.ball && row.borrows && row.pool !== 'other') {
      info = `Shares ${POOL_LABEL[row.pool]}’s thoughts${row.added ? `, plus ${row.added} of its own` : ''}.`;
    } else if (row.ball && row.borrows) {
      info = `Has ${row.added} of its own, and borrows the general “Other” thoughts too.`;
    }
    if (row.id === 'other') info = 'The fallback: feelings without thoughts of their own use these.';
    return { ...row, gap, info };
  };

  for (const f of FEELINGS) {
    const pool = toKey(f.id);
    const borrows = pool !== f.id;
    rows.push(describe({
      id: f.id, label: f.label, hue: f.hue, ball: true, minAge: f.minAge, pool, borrows,
      own: borrows ? 0 : poolSize(pool), borrowed: borrows ? poolSize(pool) : 0, added: addedFor(f.id),
    }));
  }

  for (const f of liveFeelings) {
    if (rows.some((r) => r.id === f.id)) continue;
    const pool = toKey(f.id);
    const borrows = pool !== f.id;
    rows.push(describe({
      id: f.id, label: f.label, hue: f.hue, ball: true, minAge: f.minAge, live: f, pool, borrows,
      own: borrows ? 0 : poolSize(pool), borrowed: borrows ? poolSize(pool) : 0, added: addedFor(f.id),
    }));
  }

  /* Story Lab pools nobody can pick: Calm today, and Other, which is the fallback by design. */
  for (const key of Object.keys(THOUGHTS) as FeelingKey[]) {
    if (rows.some((r) => r.id === key)) continue;
    rows.push(describe({
      id: key, label: POOL_LABEL[key], hue: key === 'calm' ? 160 : 260, ball: false, pool: key, borrows: false,
      own: poolSize(key), borrowed: 0, added: addedFor(key),
    }));
  }
  return rows;
}

export const poolLabel = (key: FeelingKey) => POOL_LABEL[key];
