import { useEffect, useRef } from 'react';
import { CursorStyle } from '../types/mood';

interface Props {
  color: string;
  style: CursorStyle;
  intensity: number;
  isIdle: boolean;
}

export default function CursorTrail({ color, style, intensity, isIdle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ color, style, intensity, isIdle });

  useEffect(() => { stateRef.current = { color, style, intensity, isIdle }; }, [color, style, intensity, isIdle]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let rafId: number;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; r: number; life: number; decay: number; color: string }> = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      const { color: c, style: s, intensity: mi } = stateRef.current;
      const count = s === 'jitter' ? 4 + Math.floor(mi * 4) : s === 'sparkle' ? 3 : 2;

      for (let i = 0; i < count; i++) {
        const spread = s === 'jitter' ? 12 * (1 + mi) : s === 'soft' ? 8 : 4;
        const speedMult = s === 'jitter' ? 2.5 * (1 + mi) : s === 'soft' ? 0.4 : s === 'sharp' ? 3.5 : 1.2;
        const upDrift = s === 'ember' ? -1.2 : s === 'soft' ? -0.2 : (Math.random() - 0.5) * 0.5;

        particles.push({
          x: e.clientX + (Math.random() - 0.5) * spread,
          y: e.clientY + (Math.random() - 0.5) * spread,
          vx: (Math.random() - 0.5) * speedMult,
          vy: upDrift + (Math.random() - 0.5) * speedMult * 0.5,
          r: s === 'sharp' ? 1.5 + Math.random() * 2 : s === 'soft' ? 4 + Math.random() * 6 : 2 + Math.random() * 3.5,
          life: 1,
          decay: s === 'soft' ? 0.018 : s === 'jitter' ? 0.045 : 0.03,
          color: c,
        });
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    const draw = () => {
      const { style: s, isIdle: idle } = stateRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => p.life > 0.01);

      particles.forEach((p) => {
        p.life -= p.decay * (idle ? 2 : 1);
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        p.r = Math.max(0.1, p.r * 0.97);

        const a = Math.max(0, p.life);

        if (s === 'sparkle') {
          // Cross sparkle
          ctx.globalAlpha = a * 0.85;
          ctx.strokeStyle = p.color; ctx.lineWidth = p.r * 0.4;
          const arm = p.r * 2.5;
          ctx.beginPath();
          ctx.moveTo(p.x - arm, p.y); ctx.lineTo(p.x + arm, p.y);
          ctx.moveTo(p.x, p.y - arm); ctx.lineTo(p.x, p.y + arm);
          ctx.stroke();
        }

        // Glow
        const glowR = p.r * (s === 'soft' ? 8 : 4.5);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        glow.addColorStop(0, p.color + Math.floor(a * 150).toString(16).padStart(2, '0'));
        glow.addColorStop(1, p.color + '00');
        ctx.globalAlpha = a * (s === 'sharp' ? 0.9 : 0.35);
        ctx.beginPath(); ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();

        // Core
        ctx.globalAlpha = a * (s === 'blur' ? 0.4 : 0.82);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9 }}
    />
  );
}
