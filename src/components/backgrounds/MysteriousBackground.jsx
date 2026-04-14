import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function MysteriousBackground() {
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

    // Stars
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: 0.4 + Math.random() * 1.6,
      opacity: 0.2 + Math.random() * 0.8,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.02 + Math.random() * 0.05,
      color: Math.random() > 0.7 ? '#B8A0FF' : (Math.random() > 0.5 ? '#80BFFF' : '#FFFFFF'),
    }));

    // Nebula orbs (large, slow)
    const nebulaOrbs = Array.from({ length: 4 }, (_, i) => ({
      x: W() * (0.15 + i * 0.22),
      y: H() * (0.2 + (i % 2) * 0.5),
      r: 200 + Math.random() * 200,
      color: i % 2 === 0 ? '#A855F7' : '#3B82F6',
      phase: Math.random() * Math.PI * 2,
      speed: 0.001 + Math.random() * 0.002,
      opacity: 0.04 + Math.random() * 0.06,
    }));

    // Glowing orbs (small, drifting)
    const glowOrbs = Array.from({ length: 12 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: 3 + Math.random() * 8,
      color: Math.random() > 0.5 ? '#A855F7' : '#3B82F6',
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.4 + Math.random() * 0.5,
    }));

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W(), H());

      // Nebula
      nebulaOrbs.forEach(n => {
        n.phase += n.speed;
        const nx = n.x + Math.sin(n.phase) * 60;
        const ny = n.y + Math.cos(n.phase * 0.7) * 40;
        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, n.r);
        grad.addColorStop(0, n.color + Math.floor(n.opacity * 255).toString(16).padStart(2,'0'));
        grad.addColorStop(0.5, n.color + '0A');
        grad.addColorStop(1, n.color + '00');
        ctx.beginPath();
        ctx.arc(nx, ny, n.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Stars
      stars.forEach(s => {
        s.twinklePhase += s.twinkleSpeed;
        const alpha = s.opacity * (0.4 + 0.6 * Math.abs(Math.sin(s.twinklePhase)));

        // Star glow
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        glow.addColorStop(0, s.color + 'AA');
        glow.addColorStop(1, s.color + '00');
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
      });

      // Glowing orbs
      glowOrbs.forEach(o => {
        o.phase += 0.01;
        o.x += o.vx + Math.sin(t * 0.3 + o.phase) * 0.2;
        o.y += o.vy + Math.cos(t * 0.2 + o.phase) * 0.15;

        if (o.x < -50) o.x = W() + 50;
        if (o.x > W() + 50) o.x = -50;
        if (o.y < -50) o.y = H() + 50;
        if (o.y > H() + 50) o.y = -50;

        const alpha = o.opacity * (0.5 + 0.5 * Math.sin(t * 0.5 + o.phase));
        const glowR = o.r * 8;
        const glow = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, glowR);
        glow.addColorStop(0, o.color + 'CC');
        glow.addColorStop(0.4, o.color + '44');
        glow.addColorStop(1, o.color + '00');

        ctx.globalAlpha = alpha * 0.7;
        ctx.beginPath();
        ctx.arc(o.x, o.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = o.color;
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
      transition={{ duration: 1.4 }}
    >
      <canvas ref={canvasRef} className="bg-canvas" />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(168,85,247,0.07) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}
