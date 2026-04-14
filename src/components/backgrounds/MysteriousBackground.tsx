import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props { evolutionStage: number; intensity: number; isIdle: boolean; mouseX?: number; mouseY?: number; }

export default function MysteriousBackground({ evolutionStage, mouseX = -1, mouseY = -1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ evolutionStage, mouseX, mouseY });
  useEffect(() => { propsRef.current = { evolutionStage, mouseX, mouseY }; }, [evolutionStage, mouseX, mouseY]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let rafId: number;
    let t = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const W = () => canvas.width; const H = () => canvas.height;

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.4 + Math.random() * 1.8,
      opacity: 0.2 + Math.random() * 0.8,
      twPhase: Math.random() * Math.PI * 2,
      twSpeed: 0.02 + Math.random() * 0.05,
      color: Math.random() > 0.65 ? '#B8A0FF' : (Math.random() > 0.5 ? '#80BFFF' : '#ffffff'),
    }));

    const nebula = Array.from({ length: 5 }, (_, i) => ({
      x: window.innerWidth * (0.1 + i * 0.2),
      y: window.innerHeight * (0.15 + (i % 2) * 0.55),
      r: 260 + Math.random() * 240,
      color: i % 3 === 0 ? '#A855F7' : i % 3 === 1 ? '#3B82F6' : '#EC4899',
      phase: Math.random() * Math.PI * 2,
      speed: 0.001 + Math.random() * 0.0018,
      opacity: 0.1 + Math.random() * 0.1,
    }));

    const glowOrbs = Array.from({ length: 10 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 4 + Math.random() * 9,
      color: Math.random() > 0.5 ? '#A855F7' : '#3B82F6',
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.18,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.4 + Math.random() * 0.5,
    }));

    // Cursor reveal: nearby stars become brighter
    const draw = () => {
      const { evolutionStage: stage, mouseX: mx, mouseY: my } = propsRef.current;
      t += 0.016;
      ctx.clearRect(0, 0, W(), H());

      nebula.forEach((n) => {
        n.phase += n.speed;
        const nx = n.x + Math.sin(n.phase) * 55;
        const ny = n.y + Math.cos(n.phase * 0.7) * 38;
        const r = n.r * (1 + stage * 0.1);
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, r);
        grad.addColorStop(0, n.color + Math.floor(n.opacity * 255 * (1 + stage * 0.15)).toString(16).padStart(2, '0'));
        grad.addColorStop(0.6, n.color + '08');
        grad.addColorStop(1, n.color + '00');
        ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      });

      stars.forEach((s) => {
        s.twPhase += s.twSpeed;
        let alpha = s.opacity * (0.4 + 0.6 * Math.abs(Math.sin(s.twPhase)));
        // Cursor reveal: stars near cursor glow brighter
        if (mx >= 0 && my >= 0) {
          const dist = Math.sqrt((s.x - mx) ** 2 + (s.y - my) ** 2);
          if (dist < 120) alpha = Math.min(1, alpha + (1 - dist / 120) * 0.8);
        }
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        glow.addColorStop(0, s.color + 'AA'); glow.addColorStop(1, s.color + '00');
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color; ctx.fill();
      });

      glowOrbs.forEach((o) => {
        o.phase += 0.01;
        o.x += o.vx + Math.sin(t * 0.28 + o.phase) * 0.18;
        o.y += o.vy + Math.cos(t * 0.2 + o.phase) * 0.13;
        if (o.x < -50) o.x = W() + 50;
        if (o.x > W() + 50) o.x = -50;
        if (o.y < -50) o.y = H() + 50;
        if (o.y > H() + 50) o.y = -50;
        const alpha = o.opacity * (0.5 + 0.5 * Math.sin(t * 0.45 + o.phase));
        const glow = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r * 8);
        glow.addColorStop(0, o.color + 'CC'); glow.addColorStop(0.4, o.color + '44'); glow.addColorStop(1, o.color + '00');
        ctx.globalAlpha = alpha * 0.65;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r * 8, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = o.color; ctx.fill();
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
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(168,85,247,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
    </motion.div>
  );
}
