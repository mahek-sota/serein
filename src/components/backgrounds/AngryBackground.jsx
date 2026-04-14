import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

function drawLightningBolt(ctx, x1, y1, x2, y2, roughness, depth) {
  if (depth === 0) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    return;
  }
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * roughness;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * roughness * 0.5;
  drawLightningBolt(ctx, x1, y1, mx, my, roughness / 2, depth - 1);
  drawLightningBolt(ctx, mx, my, x2, y2, roughness / 2, depth - 1);

  // Branch
  if (depth > 1 && Math.random() > 0.5) {
    const bx = mx + (Math.random() - 0.5) * roughness * 2;
    const by = my + Math.random() * roughness;
    drawLightningBolt(ctx, mx, my, bx, by, roughness / 3, depth - 2);
  }
}

export default function AngryBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let rafId;
    let t = 0;
    let nextStrike = 40 + Math.random() * 60;
    let strikeTimer = 0;
    let flashOpacity = 0;
    let activeStrikes = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    // Ember particles
    const embers = Array.from({ length: 60 }, () => ({
      x: Math.random() * W(),
      y: H() * (0.5 + Math.random() * 0.5),
      r: 1 + Math.random() * 2.5,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(0.5 + Math.random() * 2),
      life: Math.random(),
      decay: 0.004 + Math.random() * 0.008,
      color: Math.random() > 0.5 ? '#FF3A1F' : '#FF7A00',
    }));

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W(), H());

      // Flash overlay
      if (flashOpacity > 0) {
        ctx.fillStyle = `rgba(255, 80, 0, ${flashOpacity})`;
        ctx.fillRect(0, 0, W(), H());
        flashOpacity = Math.max(0, flashOpacity - 0.06);
      }

      // Lightning strikes
      strikeTimer++;
      if (strikeTimer >= nextStrike) {
        strikeTimer = 0;
        nextStrike = 30 + Math.random() * 80;
        flashOpacity = 0.08 + Math.random() * 0.12;
        activeStrikes.push({
          x: W() * (0.1 + Math.random() * 0.8),
          life: 12 + Math.floor(Math.random() * 10),
        });
      }

      activeStrikes = activeStrikes.filter(s => s.life > 0);
      activeStrikes.forEach(s => {
        const alpha = s.life / 12;
        ctx.save();
        ctx.shadowColor = '#FF7A00';
        ctx.shadowBlur = 20;
        ctx.strokeStyle = `rgba(255, 200, 100, ${alpha * 0.9})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        drawLightningBolt(ctx, s.x, 0, s.x + (Math.random() - 0.5) * 100, H() * 0.6, 120, 5);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
        s.life--;
      });

      // Embers
      embers.forEach(e => {
        e.x += e.vx + Math.sin(t * 0.05 + e.life * 10) * 0.4;
        e.y += e.vy;
        e.life -= e.decay;

        if (e.life <= 0) {
          e.x = Math.random() * W();
          e.y = H() * (0.6 + Math.random() * 0.4);
          e.life = 0.8 + Math.random() * 0.2;
          e.vx = (Math.random() - 0.5) * 1.5;
          e.vy = -(0.5 + Math.random() * 2);
        }

        const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 5);
        glow.addColorStop(0, e.color + 'CC');
        glow.addColorStop(1, e.color + '00');
        ctx.globalAlpha = e.life * 0.6;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.globalAlpha = e.life;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.fill();
      });

      // Angry red ambient pulse
      const pulse = 0.03 + 0.015 * Math.sin(t * 0.04);
      const pGrad = ctx.createRadialGradient(W() / 2, H(), 0, W() / 2, H(), H() * 0.8);
      pGrad.addColorStop(0, `rgba(255,40,0,${pulse})`);
      pGrad.addColorStop(1, 'rgba(255,40,0,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = pGrad;
      ctx.fillRect(0, 0, W(), H());

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
      transition={{ duration: 0.6 }}
    >
      <canvas ref={canvasRef} className="bg-canvas" />
    </motion.div>
  );
}
