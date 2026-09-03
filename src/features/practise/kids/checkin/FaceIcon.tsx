/** One feeling's face, drawn as simple line art — ported from the prototype's faceSVG(). */
export function FaceIcon({ face, className }: { face: 'happy' | 'excited' | 'sad' | 'angry' | 'scared' | 'worried'; className?: string }) {
  const eyes: Record<string, string> = {
    happy: '<path d="M20 26 q5-6 10 0"/><path d="M45 26 q5-6 10 0"/>',
    excited: '<circle cx="25" cy="26" r="4.6" fill="currentColor" stroke="none"/><circle cx="50" cy="26" r="4.6" fill="currentColor" stroke="none"/>',
    sad: '<path d="M20 24 q5 5 10 0"/><path d="M45 24 q5 5 10 0"/>',
    angry: '<path d="M18 20 l13 6"/><path d="M57 20 l-13 6"/><circle cx="26" cy="29" r="3.4" fill="currentColor" stroke="none"/><circle cx="49" cy="29" r="3.4" fill="currentColor" stroke="none"/>',
    scared: '<circle cx="25" cy="26" r="6" fill="currentColor" stroke="none"/><circle cx="50" cy="26" r="6" fill="currentColor" stroke="none"/>',
    worried: '<path d="M18 21 l12 3"/><path d="M57 21 l-12 3"/><circle cx="26" cy="29" r="3.6" fill="currentColor" stroke="none"/><circle cx="49" cy="29" r="3.6" fill="currentColor" stroke="none"/>',
  };
  const mouth: Record<string, string> = {
    happy: '<path d="M26 44 q11 11 22 0"/>',
    excited: '<path d="M25 41 q12 15 25 0 q-12 6 -25 0z" fill="currentColor"/>',
    sad: '<path d="M27 50 q11-10 21 0"/>',
    angry: '<path d="M26 50 q11-9 22 0"/>',
    scared: '<ellipse cx="37" cy="47" rx="7" ry="9" fill="currentColor" stroke="none"/>',
    worried: '<path d="M26 47 q6 5 11 0 q5-5 11 0"/>',
  };

  return (
    <svg viewBox="0 0 75 68" width={54} height={54} fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" className={className}>
      <circle cx="37.5" cy="36" r="30" fill="rgba(255,255,255,.1)" stroke="currentColor" strokeWidth={2.6} />
      <g dangerouslySetInnerHTML={{ __html: eyes[face] + mouth[face] }} />
    </svg>
  );
}
