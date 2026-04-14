import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props { evolutionStage: number; intensity: number; isIdle: boolean; }

const COLORS = ['#FFD93D', '#FF6B6B', '#6BCB77', '#FFB347', '#FF91A4', '#FFF176', '#87CEEB'];

export default function HappyBackground({ evolutionStage, intensity }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ evolutionStage, intensity });
  useEffect(() => { propsRef.current = { evolutionStage, intensity }; }, [evolutionStage, intensity]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let rafId: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const W = () => canvas.width; const H = () => canvas.height;

    const orbs = Array.from({ length: 22 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 55 + Math.random() * 110,
      color: COLORS[i % COLORS.length],
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.12 + Math.random() * 0.3),
      opacity: 0.18 + Math.random() * 0.22,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.012,
    }));

    const sparks = Array.from({ length: 90 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 1.2 + Math.random() * 2.8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy: -(0.3 + Math.random() * 0.8),
      vx: (Math.random() - 0.5) * 0.5,
      life: Math.random(),
      decay: 0.003 + Math.random() * 0.004,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.04 + Math.random() * 0.07,
    }));

    const draw = () => {
      const { evolutionStage: stage } = propsRef.current;
      const brightness = 1 + stage * 0.1;
      ctx.clearRect(0, 0, W(), H());

      orbs.forEach((o) => {
        o.pulse += o.pulseSpeed;
        o.x += o.vx + Math.sin(o.pulse * 0.5) * 0.3;
        o.y += o.vy;
        if (o.y + o.r < -100) { o.y = H() + o.r; o.x = Math.random() * W(); }
        if (o.x < -o.r) o.x = W() + o.r;
        if (o.x > W() + o.r) o.x = -o.r;

        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * (1 + 0.1 * Math.sin(o.pulse)));
        grad.addColorStop(0, o.color + 'DD');
        grad.addColorStop(0.5, o.color + '66');
        grad.addColorStop(1, o.color + '00');
        ctx.globalAlpha = o.opacity * brightness;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      });

      sparks.forEach((s) => {
        s.twinkle += s.twinkleSpeed;
        s.x += s.vx; s.y += s.vy; s.life -= s.decay;
        if (s.life <= 0) { s.x = Math.random() * W(); s.y = H() + 10; s.life = 0.6 + Math.random() * 0.4; }
        const alpha = s.life * (0.5 + 0.5 * Math.sin(s.twinkle));
        ctx.globalAlpha = alpha * brightness;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color; ctx.fill();
        ctx.lineWidth = 0.5; ctx.strokeStyle = s.color;
        const arm = s.size * 3.5;
        ctx.beginPath();
        ctx.moveTo(s.x - arm, s.y); ctx.lineTo(s.x + arm, s.y);
        ctx.moveTo(s.x, s.y - arm); ctx.lineTo(s.x, s.y + arm);
        ctx.stroke();
      });

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <motion.div className="bg-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
      <canvas ref={canvasRef} className="bg-canvas" />
    </motion.div>
  );
}
