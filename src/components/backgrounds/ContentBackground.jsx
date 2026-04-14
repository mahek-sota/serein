import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#C9B8FF', '#E8A5B5', '#A8D8EA', '#D4B8FF', '#F0C8D8'];

export default function ContentBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    // Slow drifting particles
    const particles = Array.from({ length: 60 }, (_, i) => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: 2 + Math.random() * 5,
      color: COLORS[i % COLORS.length],
      vx: (Math.random() - 0.5) * 0.2,
      vy: -(0.08 + Math.random() * 0.18),
      phase: Math.random() * Math.PI * 2,
      waveAmp: 15 + Math.random() * 30,
      waveFreq: 0.003 + Math.random() * 0.005,
      opacity: 0.25 + Math.random() * 0.45,
      opacityPhase: Math.random() * Math.PI * 2,
    }));

    // Large ambient blobs
    const blobs = Array.from({ length: 5 }, (_, i) => ({
      x: (W() / 4) * i + W() * 0.1,
      y: Math.random() * H(),
      r: 180 + Math.random() * 200,
      color: COLORS[i % COLORS.length],
      phase: Math.random() * Math.PI * 2,
      speed: 0.002 + Math.random() * 0.003,
    }));

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W(), H());

      // Ambient blobs
      blobs.forEach(b => {
        b.phase += b.speed;
        const bx = b.x + Math.sin(b.phase) * 40;
        const by = b.y + Math.cos(b.phase * 0.7) * 25;
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, b.r);
        grad.addColorStop(0, b.color + '18');
        grad.addColorStop(0.5, b.color + '08');
        grad.addColorStop(1, b.color + '00');
        ctx.beginPath();
        ctx.arc(bx, by, b.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Floating particles
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(t * p.waveFreq * 60 + p.phase) * 0.3;

        if (p.y + p.r < -10) {
          p.y = H() + p.r;
          p.x = Math.random() * W();
        }

        const alpha =
          p.opacity * (0.6 + 0.4 * Math.sin(t * 0.8 + p.opacityPhase));

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        glow.addColorStop(0, p.color + 'BB');
        glow.addColorStop(1, p.color + '00');

        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <motion.div
      className="background-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      <canvas ref={canvasRef} className="bg-canvas" />
    </motion.div>
  );
}
