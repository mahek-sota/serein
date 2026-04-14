import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props { evolutionStage: number; intensity: number; isIdle: boolean; }

function bolt(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, rough: number, depth: number) {
  if (depth === 0) { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); return; }
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * rough;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * rough * 0.4;
  bolt(ctx, x1, y1, mx, my, rough / 2, depth - 1);
  bolt(ctx, mx, my, x2, y2, rough / 2, depth - 1);
  if (depth > 1 && Math.random() > 0.55) {
    bolt(ctx, mx, my, mx + (Math.random() - 0.5) * rough * 2, my + Math.random() * rough, rough / 3, depth - 2);
  }
}

export default function AngryBackground({ evolutionStage, intensity }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ evolutionStage, intensity });
  useEffect(() => { propsRef.current = { evolutionStage, intensity }; }, [evolutionStage, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let rafId: number;
    let t = 0;
    let strikeTimer = 0;
    let flashOpacity = 0;
    let strikes: Array<{ x: number; life: number }> = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const W = () => canvas.width; const H = () => canvas.height;

    const embers = Array.from({ length: 70 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight * (0.5 + Math.random() * 0.5),
      r: 1.2 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(0.5 + Math.random() * 2.2),
      life: Math.random(),
      decay: 0.004 + Math.random() * 0.008,
      color: Math.random() > 0.5 ? '#FF3A1F' : '#FF7A00',
    }));

    const draw = () => {
      const { evolutionStage: stage, intensity: mi } = propsRef.current;
      // As it evolves: fewer lightning, more embers
      const calmFactor = 1 - stage * 0.2;
      t++;
      ctx.clearRect(0, 0, W(), H());

      if (flashOpacity > 0) {
        ctx.fillStyle = `rgba(255,60,0,${flashOpacity})`;
        ctx.fillRect(0, 0, W(), H());
        flashOpacity = Math.max(0, flashOpacity - 0.07);
      }

      strikeTimer++;
      const strikeInterval = Math.max(20, (60 - mi * 35) * calmFactor);
      if (strikeTimer >= strikeInterval && calmFactor > 0.3) {
        strikeTimer = 0;
        flashOpacity = 0.06 + Math.random() * 0.1;
        strikes.push({ x: W() * (0.1 + Math.random() * 0.8), life: 14 });
      }

      strikes = strikes.filter((s) => s.life > 0);
      strikes.forEach((s) => {
        const alpha = s.life / 14;
        ctx.save();
        ctx.shadowColor = '#FF7A00'; ctx.shadowBlur = 18;
        ctx.strokeStyle = `rgba(255,200,100,${alpha * 0.88})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        bolt(ctx, s.x, 0, s.x + (Math.random() - 0.5) * 80, H() * 0.65, 110, 5);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.55})`; ctx.lineWidth = 0.5; ctx.stroke();
        ctx.restore();
        s.life--;
      });

      embers.forEach((e) => {
        e.x += e.vx + Math.sin(t * 0.04 + e.life * 8) * 0.4;
        e.y += e.vy; e.life -= e.decay;
        if (e.life <= 0) {
          e.x = Math.random() * W();
          e.y = H() * (0.6 + Math.random() * 0.4);
          e.life = 0.7 + Math.random() * 0.3;
          e.vy = -(0.5 + Math.random() * 2.2) * calmFactor;
        }
        const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 5);
        glow.addColorStop(0, e.color + 'CC'); glow.addColorStop(1, e.color + '00');
        ctx.globalAlpha = e.life * 0.55;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();
        ctx.globalAlpha = e.life;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = e.color; ctx.fill();
      });

      const pulse = 0.025 + 0.01 * Math.sin(t * 0.035);
      const pg = ctx.createRadialGradient(W() / 2, H(), 0, W() / 2, H(), H() * 0.85);
      pg.addColorStop(0, `rgba(255,40,0,${pulse * calmFactor})`);
      pg.addColorStop(1, 'rgba(255,40,0,0)');
      ctx.globalAlpha = 1; ctx.fillStyle = pg; ctx.fillRect(0, 0, W(), H());

      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <motion.div className="bg-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <canvas ref={canvasRef} className="bg-canvas" />
    </motion.div>
  );
}
