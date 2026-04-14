import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function HopefulBackground() {
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

    // Rising ember particles
    const embers = Array.from({ length: 80 }, () => {
      const colors = ['#FFB347', '#FF8C69', '#FFDB89', '#FFD93D', '#FFA07A'];
      return {
        x: Math.random() * W(),
        y: H() + Math.random() * H(),
        r: 1.5 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: -(0.4 + Math.random() * 1.2),
        vx: (Math.random() - 0.5) * 0.5,
        phase: Math.random() * Math.PI * 2,
        waveAmp: 8 + Math.random() * 20,
        waveFreq: 0.02 + Math.random() * 0.04,
        opacity: 0.4 + Math.random() * 0.5,
        opacityPhase: Math.random() * Math.PI * 2,
      };
    });

    // Glowing rays from below (sunrise)
    const numRays = 9;

    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W(), H());

      // Sunrise glow at bottom
      const sunGrad = ctx.createRadialGradient(W() / 2, H() * 1.1, 0, W() / 2, H() * 1.1, H() * 0.9);
      sunGrad.addColorStop(0, 'rgba(255, 179, 71, 0.28)');
      sunGrad.addColorStop(0.4, 'rgba(255, 140, 105, 0.12)');
      sunGrad.addColorStop(1, 'rgba(255, 140, 105, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, W(), H());

      // Rays
      for (let i = 0; i < numRays; i++) {
        const angle = -Math.PI * 0.9 + (Math.PI * 0.8 / (numRays - 1)) * i;
        const len = H() * 1.5;
        const spread = 0.015 + 0.005 * Math.sin(t * 0.5 + i);
        const opacity = 0.018 + 0.008 * Math.sin(t * 0.4 + i * 0.8);

        ctx.save();
        ctx.translate(W() / 2, H() * 1.1);
        ctx.rotate(angle);
        const rayGrad = ctx.createLinearGradient(0, 0, 0, -len);
        rayGrad.addColorStop(0, `rgba(255, 200, 100, ${opacity})`);
        rayGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
        ctx.beginPath();
        ctx.moveTo(-Math.tan(spread) * 0, 0);
        ctx.lineTo(-Math.tan(spread) * len, -len);
        ctx.lineTo(Math.tan(spread) * len, -len);
        ctx.lineTo(Math.tan(spread) * 0, 0);
        ctx.fillStyle = rayGrad;
        ctx.fill();
        ctx.restore();
      }

      // Embers
      embers.forEach(e => {
        e.y += e.vy;
        e.x += e.vx + Math.sin(t * e.waveFreq * 60 + e.phase) * 0.25;
        e.phase += 0.01;

        if (e.y + e.r < -20) {
          e.y = H() + e.r + Math.random() * 200;
          e.x = Math.random() * W();
        }

        const alpha = e.opacity * (0.55 + 0.45 * Math.sin(t * 1.5 + e.opacityPhase));
        const glowR = e.r * 6;
        const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, glowR);
        glow.addColorStop(0, e.color + 'BB');
        glow.addColorStop(1, e.color + '00');

        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
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
      transition={{ duration: 1.2 }}
    >
      <canvas ref={canvasRef} className="bg-canvas" />
    </motion.div>
  );
}
