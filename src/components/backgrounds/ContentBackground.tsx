import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props { evolutionStage: number; intensity: number; isIdle: boolean; }

const COLORS = ['#C9B8FF', '#E8A5B5', '#A8D8EA', '#D4B8FF', '#F0C8D8'];

export default function ContentBackground({ evolutionStage, isIdle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ evolutionStage, isIdle });
  useEffect(() => { propsRef.current = { evolutionStage, isIdle }; }, [evolutionStage, isIdle]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let rafId: number;
    let t = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const W = () => canvas.width;
    const H = () => canvas.height;

    // Very slow drifting particles
    const particles = Array.from({ length: 55 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 2.5 + Math.random() * 5,
      color: COLORS[i % COLORS.length],
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(0.06 + Math.random() * 0.14),
      phase: Math.random() * Math.PI * 2,
      waveAmp: 18 + Math.random() * 28,
      waveFreq: 0.003 + Math.random() * 0.004,
      opacity: 0.22 + Math.random() * 0.4,
      opPhase: Math.random() * Math.PI * 2,
    }));

    // Large ambient blobs
    const blobs = Array.from({ length: 6 }, (_, i) => ({
      x: (window.innerWidth / 5) * i + window.innerWidth * 0.05,
      y: Math.random() * window.innerHeight,
      r: 220 + Math.random() * 260,
      color: COLORS[i % COLORS.length],
      phase: Math.random() * Math.PI * 2,
      speed: 0.0015 + Math.random() * 0.002,
    }));

    const draw = () => {
      const { evolutionStage: stage } = propsRef.current;
      // As we evolve, the blobs get brighter/larger
      const brightness = 1 + stage * 0.15;
      t += 0.016;

      ctx.clearRect(0, 0, W(), H());

      blobs.forEach((b) => {
        b.phase += b.speed;
        const bx = b.x + Math.sin(b.phase) * 50;
        const by = b.y + Math.cos(b.phase * 0.7) * 30;
        const r = b.r * brightness;
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, r);
        grad.addColorStop(0, b.color + '55');
        grad.addColorStop(0.5, b.color + '1A');
        grad.addColorStop(1, b.color + '00');
        ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      });

      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(t * p.waveFreq * 60 + p.phase) * 0.25;
        if (p.y + p.r < -10) { p.y = H() + p.r; p.x = Math.random() * W(); }

        const alpha = p.opacity * (0.55 + 0.45 * Math.sin(t * 0.7 + p.opPhase)) * brightness;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        glow.addColorStop(0, p.color + 'BB');
        glow.addColorStop(1, p.color + '00');

        ctx.globalAlpha = alpha * 0.55;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <motion.div className="bg-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4 }}>
      <canvas ref={canvasRef} className="bg-canvas" />
    </motion.div>
  );
}
