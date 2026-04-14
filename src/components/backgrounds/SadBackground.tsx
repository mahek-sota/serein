import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props { evolutionStage: number; intensity: number; isIdle: boolean; }

export default function SadBackground({ evolutionStage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ evolutionStage });
  useEffect(() => { propsRef.current = { evolutionStage }; }, [evolutionStage]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let rafId: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const W = () => canvas.width; const H = () => canvas.height;

    // Rain: stage 0=heavy, stage 1=lighter, stage 2=drizzle, stage 3=mist only
    const drops = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      length: 12 + Math.random() * 26,
      speed: 5 + Math.random() * 10,
      opacity: 0.25 + Math.random() * 0.45,
      width: 0.5 + Math.random() * 0.7,
    }));

    const fog = Array.from({ length: 8 }, (_, i) => ({
      x: (window.innerWidth / 7) * i + Math.random() * 80,
      y: Math.random() * window.innerHeight,
      r: 200 + Math.random() * 300,
      opacity: 0.055 + Math.random() * 0.07,
      vx: (Math.random() - 0.5) * 0.12,
    }));

    const draw = () => {
      const { evolutionStage: stage } = propsRef.current;
      // Evolution: rain reduces, fog increases
      const rainCount = Math.max(0, 200 - stage * 50);
      const fogIntensity = 1 + stage * 0.5;

      ctx.clearRect(0, 0, W(), H());

      fog.forEach((f) => {
        f.x += f.vx;
        if (f.x < -f.r * 2) f.x = W() + f.r;
        if (f.x > W() + f.r * 2) f.x = -f.r;
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        grad.addColorStop(0, `rgba(147,200,255,${f.opacity * fogIntensity})`);
        grad.addColorStop(1, 'rgba(147,200,255,0)');
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      });

      for (let i = 0; i < rainCount; i++) {
        const d = drops[i];
        ctx.globalAlpha = d.opacity * (1 - stage * 0.2);
        ctx.strokeStyle = 'rgba(160,210,255,1)';
        ctx.lineWidth = d.width;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.length * 0.1, d.y + d.length);
        ctx.stroke();
        d.y += d.speed * (1 - stage * 0.15);
        d.x -= d.speed * 0.05;
        if (d.y - d.length > H() || d.x < -20) {
          d.y = -d.length - Math.random() * 180;
          d.x = Math.random() * (W() + 80);
        }
      }

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <motion.div className="bg-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.3 }}>
      <canvas ref={canvasRef} className="bg-canvas" />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(30,60,100,0.3) 0%, transparent 60%)', pointerEvents: 'none' }} />
    </motion.div>
  );
}
