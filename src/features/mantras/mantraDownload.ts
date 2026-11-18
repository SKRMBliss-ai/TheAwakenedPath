// Saving a purchased mantra recording to the device.
//
// The files are in Firebase Storage and are fetched here as a blob, because the
// browser ignores the `download` attribute on cross-origin links.

import { VoiceService } from '../../services/voiceService';

/** Save the audio at `path` (a Storage path or URL) as `fileName` (without extension). */
export async function downloadAudio(path: string, fileName: string): Promise<void> {
  const res = await fetch(VoiceService.getStorageUrl(path));
  if (!res.ok) throw new Error(`download failed: ${res.status}`);
  const blob = await res.blob();
  const ext = /\.wav($|\?)/i.test(path) ? 'wav' : 'mp3';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${fileName.replace(/[/\\:*?"<>|]/g, '')}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}
