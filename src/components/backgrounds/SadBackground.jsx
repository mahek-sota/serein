import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function SadBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    const drops = Array.from({ length: 180 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      length: 12 + Math.random() * 22,
      speed: 5 + Math.random() * 9,
      opacity: 0.12 + Math.random() * 0.28,
      width: 0.4 + Math.random() * 0.6,
    }));

    // Slow fog orbs
    const fog = Array.from({ length: 6 }, (_, i) => ({
      x: (W() / 5) * i + Math.random() * 200,
      y: Math.random() * H(),
      r: 150 + Math.random() * 250,
      opacity: 0.025 + Math.random() * 0.04,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.08,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      // Fog
      fog.forEach(f => {
        f.x += f.vx;
        f.y += f.vy;
        if (f.x < -f.r * 2) f.x = W() + f.r;
        if (f.x > W() + f.r * 2) f.x = -f.r;
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        grad.addColorStop(0, `rgba(147,200,255,${f.opacity})`);
        grad.addColorStop(1, 'rgba(147,200,255,0)');
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Rain
      drops.forEach(d => {
        ctx.globalAlpha = d.opacity;
        ctx.strokeStyle = 'rgba(160, 210, 255, 1)';
        ctx.lineWidth = d.width;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.length * 0.12, d.y + d.length);
        ctx.stroke();

        d.y += d.speed;
        d.x -= d.speed * 0.06;

        if (d.y - d.length > H() || d.x < -20) {
          d.y = -d.length - Math.random() * 200;
          d.x = Math.random() * (W() + 100);
        }
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
      transition={{ duration: 1.2 }}
    >
      <canvas ref={canvasRef} className="bg-canvas" />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(30,60,100,0.35) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}
