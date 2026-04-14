import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AnxiousBackground() {
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

    // Jittery dots
    const dots = Array.from({ length: 120 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      baseX: 0,
      baseY: 0,
      r: 1.5 + Math.random() * 3,
      color: Math.random() > 0.5 ? '#00E5A0' : '#B4D455',
      jitterAmp: 2 + Math.random() * 6,
      jitterFreq: 0.08 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));
    dots.forEach(d => {
      d.baseX = d.x;
      d.baseY = d.y;
    });

    // Pulsing rings
    const rings = Array.from({ length: 5 }, (_, i) => ({
      x: W() * (0.2 + i * 0.15),
      y: H() * (0.3 + (i % 3) * 0.25),
      r: 20 + Math.random() * 40,
      maxR: 120 + Math.random() * 100,
      speed: 0.8 + Math.random() * 1.2,
      opacity: 0,
      growing: true,
    }));

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W(), H());

      // Pulsing rings
      rings.forEach(ring => {
        if (ring.growing) {
          ring.r += ring.speed;
          ring.opacity = Math.max(0, 0.25 * (1 - ring.r / ring.maxR));
          if (ring.r >= ring.maxR) {
            ring.r = 10;
            ring.opacity = 0;
            ring.x = Math.random() * W();
            ring.y = Math.random() * H();
            ring.maxR = 80 + Math.random() * 120;
          }
        }
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 160, ${ring.opacity})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Jittery dots
      dots.forEach(d => {
        const jx = d.jitterAmp * Math.sin(t * d.jitterFreq * 60 + d.phase);
        const jy = d.jitterAmp * Math.cos(t * d.jitterFreq * 55 + d.phase + 1);
        d.baseX += d.vx;
        d.baseY += d.vy;

        if (d.baseX < 0 || d.baseX > W()) d.vx *= -1;
        if (d.baseY < 0 || d.baseY > H()) d.vy *= -1;

        const px = d.baseX + jx;
        const py = d.baseY + jy;

        const glowR = d.r * 4;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, glowR);
        glow.addColorStop(0, d.color + 'CC');
        glow.addColorStop(1, d.color + '00');
        ctx.globalAlpha = d.opacity * (0.6 + 0.4 * Math.abs(Math.sin(t * 3 + d.phase)));
        ctx.beginPath();
        ctx.arc(px, py, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.color;
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
      transition={{ duration: 0.8 }}
    >
      <canvas ref={canvasRef} className="bg-canvas" />
    </motion.div>
  );
}
