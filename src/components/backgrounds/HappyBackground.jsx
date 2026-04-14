import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#FFD93D', '#FF6B6B', '#6BCB77', '#FFB347', '#FF91A4', '#FFF176'];

export default function HappyBackground() {
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

    // Floating orbs
    const orbs = Array.from({ length: 22 }, (_, i) => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: 30 + Math.random() * 80,
      color: COLORS[i % COLORS.length],
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.15 + Math.random() * 0.35),
      opacity: 0.06 + Math.random() * 0.1,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.012,
    }));

    // Sparkle particles
    const sparks = Array.from({ length: 80 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      size: 1 + Math.random() * 2.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy: -(0.3 + Math.random() * 0.7),
      vx: (Math.random() - 0.5) * 0.4,
      life: Math.random(),
      decay: 0.003 + Math.random() * 0.004,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.04 + Math.random() * 0.06,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      // Draw orbs
      orbs.forEach(o => {
        o.pulse += o.pulseSpeed;
        o.x += o.vx + Math.sin(o.pulse * 0.5) * 0.3;
        o.y += o.vy;
        if (o.y + o.r < -100) {
          o.y = H() + o.r;
          o.x = Math.random() * W();
        }
        if (o.x < -o.r) o.x = W() + o.r;
        if (o.x > W() + o.r) o.x = -o.r;

        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        grad.addColorStop(0, o.color + 'AA');
        grad.addColorStop(0.5, o.color + '44');
        grad.addColorStop(1, o.color + '00');
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r * (1 + 0.1 * Math.sin(o.pulse)), 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      // Draw sparks
      sparks.forEach(s => {
        s.twinkle += s.twinkleSpeed;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        if (s.life <= 0) {
          s.x = Math.random() * W();
          s.y = H() + 10;
          s.life = 0.7 + Math.random() * 0.3;
        }

        const alpha = s.life * (0.5 + 0.5 * Math.sin(s.twinkle));
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 4);
        glow.addColorStop(0, s.color);
        glow.addColorStop(1, s.color + '00');
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();

        // Cross sparkle shape
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = s.color;
        const arm = s.size * 3;
        ctx.beginPath();
        ctx.moveTo(s.x - arm, s.y);
        ctx.lineTo(s.x + arm, s.y);
        ctx.moveTo(s.x, s.y - arm);
        ctx.lineTo(s.x, s.y + arm);
        ctx.stroke();
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
