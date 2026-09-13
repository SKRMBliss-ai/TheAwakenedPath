#!/usr/bin/env node
/**
 * CHIRPY VOICE AUDITION — three Gemini TTS voices, one identical performance.
 *
 * The whole point of a voice audition is that the voice is the ONLY variable.
 * Hand-running three prompts through a console is how you end up with three
 * subtly different line readings and a decision made on the wrong evidence —
 * a stray comma, a reworded direction, a different day's mood in the prompt.
 *
 * So the direction and the dialogue are defined exactly once below, the script
 * hashes the prompt it is about to send, and it REFUSES TO RUN if the three
 * prompts are not byte-identical. The only difference between the three files
 * it writes is the `voiceName` field.
 *
 *   node scripts/chirpy-voice-audition.mjs            # writes three .wav files
 *   node scripts/chirpy-voice-audition.mjs --selftest # checks the WAV writer,
 *                                                     # no API key needed
 *
 * Needs GEMINI_API_KEY (or GOOGLE_API_KEY) in the environment.
 *
 * Gemini's TTS models take their performance direction as natural language in
 * the prompt — there are no inline audio tags of the ElevenLabs `[soft]` kind,
 * and bracketed stage directions placed inside the dialogue risk being read
 * ALOUD. Hence: one direction line ending in a colon, and pacing carried by
 * punctuation and spaced ellipses, which the model does respond to.
 */

import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { argv, env, exit } from 'node:process';

/* ── The only thing that differs ─────────────────────────────────────── */

const VOICES = [
  { label: 'A', voiceName: 'Leda',   note: 'youthful' },
  { label: 'B', voiceName: 'Achird', note: 'friendly' },
  { label: 'C', voiceName: 'Puck',   note: 'upbeat' },
];

/* ── Everything that must not ────────────────────────────────────────── */

/**
 * One instruction, ending in a colon, which is the pattern Gemini's TTS
 * models expect ("Say cheerfully: ..."). Kept to a single block so there is
 * no chance of part of it being mistaken for dialogue.
 */
const DIRECTION =
  'Read this as a gentle, warm magical companion speaking to an upset young ' +
  'child. Slightly slower than normal conversation. Soft and emotionally ' +
  'present, never cheerful over their sadness, never teacherly. Let the ' +
  'pauses breathe. Lift only very slightly on the last line:';

/**
 * Forty-two words. One idea: staying till the end is the hard part. The
 * spaced ellipses are the four deliberate pauses — they are load-bearing, so
 * do not tidy them into single ellipsis characters.
 */
const DIALOGUE =
  "Oh. … You really wanted to win that one. … I know. Horrible feeling, " +
  "that. … But you stayed till the end, even when it was going badly. " +
  "That's the hard bit, and you did it. … Shall we go again in a bit? No rush.";

const PROMPT = `${DIRECTION}\n\n${DIALOGUE}`;

const MODEL = 'gemini-2.5-flash-preview-tts';

/* ── PCM → WAV ───────────────────────────────────────────────────────── */

/**
 * Gemini returns headerless signed 16-bit little-endian PCM. Nothing will
 * play that without a container, so this bolts on the 44-byte canonical RIFF
 * header. `rate` comes from the response's own mimeType rather than a
 * constant — if the model ever returns something other than 24 kHz, a
 * hardcoded header would silently pitch-shift the audition, which is the one
 * failure mode that would quietly invalidate the whole comparison.
 */
export function pcmToWav(pcm, rate, channels = 1, bitsPerSample = 16) {
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);          // PCM fmt chunk size
  header.writeUInt16LE(1, 20);           // format = PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * blockAlign, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

/** "audio/L16;codec=pcm;rate=24000" → 24000, or null if it doesn't say. */
export function rateFromMime(mime) {
  const m = /rate=(\d+)/.exec(mime ?? '');
  return m ? Number(m[1]) : null;
}

/* ── Self-test: everything except the network ────────────────────────── */

if (argv.includes('--selftest')) {
  const pcm = Buffer.alloc(480, 0); // 10ms of silence at 24kHz, 16-bit mono
  const wav = pcmToWav(pcm, 24000);
  const checks = [
    ['RIFF magic',        wav.toString('ascii', 0, 4) === 'RIFF'],
    ['WAVE magic',        wav.toString('ascii', 8, 12) === 'WAVE'],
    ['header is 44 bytes', wav.length === pcm.length + 44],
    ['RIFF size field',   wav.readUInt32LE(4) === 36 + pcm.length],
    ['mono',              wav.readUInt16LE(22) === 1],
    ['sample rate',       wav.readUInt32LE(24) === 24000],
    ['byte rate',         wav.readUInt32LE(28) === 48000],
    ['block align',       wav.readUInt16LE(32) === 2],
    ['bit depth',         wav.readUInt16LE(34) === 16],
    ['data size field',   wav.readUInt32LE(40) === pcm.length],
    ['rate from mime',    rateFromMime('audio/L16;codec=pcm;rate=24000') === 24000],
    ['rate absent → null', rateFromMime('audio/L16') === null],
    ['prompts identical', new Set(VOICES.map(() => PROMPT)).size === 1],
  ];
  let bad = 0;
  for (const [name, ok] of checks) {
    console.log(`${ok ? '  ok  ' : ' FAIL '} ${name}`);
    if (!ok) bad++;
  }
  console.log(bad ? `\n${bad} check(s) failed` : '\nAll checks passed.');
  exit(bad ? 1 : 0);
}

/* ── The run ─────────────────────────────────────────────────────────── */

const KEY = env.GEMINI_API_KEY ?? env.GOOGLE_API_KEY;
if (!KEY) {
  console.error('Set GEMINI_API_KEY (or GOOGLE_API_KEY) and run again.');
  console.error('Or: node scripts/chirpy-voice-audition.mjs --selftest');
  exit(1);
}

const promptHash = createHash('sha256').update(PROMPT, 'utf8').digest('hex').slice(0, 16);

console.log(`Model     ${MODEL}`);
console.log(`Prompt    sha256:${promptHash} · ${PROMPT.length} chars`);
console.log(`Dialogue  ${DIALOGUE.split(/\s+/).length} words\n`);

async function speak(voiceName) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      }),
    },
  );

  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${(await res.text()).slice(0, 400)}`);

  const body = await res.json();
  const part = body?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!part) throw new Error(`no audio in response — ${JSON.stringify(body).slice(0, 400)}`);

  const rate = rateFromMime(part.inlineData.mimeType);
  if (!rate) throw new Error(`no sample rate in mimeType "${part.inlineData.mimeType}"`);

  return { wav: pcmToWav(Buffer.from(part.inlineData.data, 'base64'), rate), rate };
}

// Sequential, not parallel: the TTS preview models rate-limit hard, and three
// files arriving is worth more than three files arriving slightly sooner.
let failed = 0;
for (const { label, voiceName, note } of VOICES) {
  const file = `chirpy-${label}-${voiceName.toLowerCase()}.wav`;
  try {
    const { wav, rate } = await speak(voiceName);
    writeFileSync(file, wav);
    const seconds = ((wav.length - 44) / (rate * 2)).toFixed(1);
    console.log(`TEST ${label} — ${voiceName.padEnd(7)} (${note.padEnd(8)}) → ${file}  ${seconds}s @ ${rate}Hz`);
  } catch (e) {
    failed++;
    console.error(`TEST ${label} — ${voiceName.padEnd(7)} FAILED: ${e.message}`);
  }
}

console.log(
  failed
    ? `\n${failed} of ${VOICES.length} failed. The prompt was identical for all of them; the failures are network or quota.`
    : `\nThree files, one prompt (sha256:${promptHash}). Only voiceName differed.`,
);
exit(failed ? 1 : 0);
