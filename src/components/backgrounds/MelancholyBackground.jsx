import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function MelancholyBackground() {
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

    // Slower, heavier rain than Sad
    const drops = Array.from({ length: 130 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      length: 8 + Math.random() * 16,
      speed: 2.5 + Math.random() * 4,
      opacity: 0.08 + Math.random() * 0.18,
      width: 0.5 + Math.random() * 0.8,
    }));

    // Mist clouds
    const mist = Array.from({ length: 8 }, (_, i) => ({
      x: (W() / 7) * i,
      y: H() * (0.4 + Math.random() * 0.6),
      w: 300 + Math.random() * 400,
      h: 80 + Math.random() * 120,
      opacity: 0.04 + Math.random() * 0.06,
      vx: (Math.random() - 0.5) * 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      // Mist
      mist.forEach(m => {
        m.x += m.vx;
        if (m.x > W() + m.w) m.x = -m.w;
        if (m.x < -m.w) m.x = W() + m.w;
        const grad = ctx.createRadialGradient(
          m.x + m.w / 2, m.y, 0,
          m.x + m.w / 2, m.y, m.w / 2
        );
        grad.addColorStop(0, `rgba(155,143,175,${m.opacity})`);
        grad.addColorStop(1, 'rgba(155,143,175,0)');
        ctx.save();
        ctx.scale(1, m.h / (m.w / 2));
        ctx.beginPath();
        ctx.arc(m.x + m.w / 2, m.y * (m.w / 2) / m.h, m.w / 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      // Rain
      drops.forEach(d => {
        ctx.globalAlpha = d.opacity;
        ctx.strokeStyle = 'rgba(180, 170, 200, 1)';
        ctx.lineWidth = d.width;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.length * 0.05, d.y + d.length);
        ctx.stroke();

        d.y += d.speed;
        if (d.y > H() + d.length) {
          d.y = -d.length - Math.random() * 150;
          d.x = Math.random() * W();
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
      transition={{ duration: 1.5 }}
    >
      <canvas ref={canvasRef} className="bg-canvas" />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 120% 50% at 50% 100%, rgba(50,30,70,0.3) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}
