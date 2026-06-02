import { useEffect, useRef } from 'react';

const BreathingOrb = ({ size = 200, participantCount = 0 }: { size?: number; participantCount?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, baseR = size * 0.28;

    const draw = (t: number) => {
      const breathe = Math.sin(t * 0.0008);
      const r = baseR * (1 + breathe * 0.12);
      const alpha = 0.55 + breathe * 0.2;
      ctx.clearRect(0, 0, size, size);

      for (let i = 3; i >= 1; i--) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * (1 + i * 0.4));
        g.addColorStop(0, `rgba(212,175,55,${alpha * 0.08 / i})`);
        g.addColorStop(0.5, `rgba(94,196,176,${alpha * 0.05 / i})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(cx, cy, r * (1 + i * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      }
      const core = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 0, cx, cy, r);
      core.addColorStop(0, `rgba(255,240,180,${alpha})`);
      core.addColorStop(0.4, `rgba(212,175,55,${alpha * 0.9})`);
      core.addColorStop(0.75, `rgba(94,196,176,${alpha * 0.7})`);
      core.addColorStop(1, `rgba(15,23,42,${alpha * 0.3})`);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = core; ctx.fill();
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [size]);

  return (
    <div className="relative flex items-center justify-center select-none pointer-events-none">
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
      {participantCount > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-amber-400 font-black text-2xl tabular-nums">{participantCount}</span>
          <span className="text-amber-400/50 text-[9px] font-bold uppercase tracking-widest mt-0.5">present</span>
        </div>
      )}
    </div>
  );
};

export default BreathingOrb;
