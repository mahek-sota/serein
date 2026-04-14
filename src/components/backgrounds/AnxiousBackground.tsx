import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  evolutionStage: number;
  intensity: number; // mouse speed 0–1
  isIdle: boolean;
}

export default function AnxiousBackground({ evolutionStage, intensity, isIdle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ evolutionStage, intensity, isIdle });

  useEffect(() => {
    propsRef.current = { evolutionStage, intensity, isIdle };
  }, [evolutionStage, intensity, isIdle]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let rafId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.width;
    const H = () => canvas.height;

    // Erratic dots that jitter
    const dots = Array.from({ length: 140 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      baseX: 0, baseY: 0,
      r: 1.2 + Math.random() * 2.8,
      color: Math.random() > 0.4 ? '#00E5A0' : '#00CFBB',
      jAmp: 3 + Math.random() * 8,
      jFreq: 0.09 + Math.random() * 0.18,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.55,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    }));
    dots.forEach((d) => { d.baseX = d.x; d.baseY = d.y; });

    // Pulse rings
    const rings: Array<{ x: number; y: number; r: number; maxR: number; life: number }> = [];
    let nextRing = 40;

    const draw = () => {
      const { intensity: mi, isIdle: idle, evolutionStage: stage } = propsRef.current;
      const calm = idle ? 0.4 : 1 - stage * 0.15;
      t += 0.016 * (0.5 + mi * 0.8) * calm;

      ctx.clearRect(0, 0, W(), H());

      // Noise static flicker
      if (!idle && Math.random() > 0.92) {
        ctx.fillStyle = `rgba(0,229,160,${0.012 + mi * 0.025})`;
        const sx = Math.random() * W();
        const sy = Math.random() * H();
        ctx.fillRect(sx, sy, Math.random() * 200 + 50, 1);
      }

      // Rings
      nextRing--;
      if (nextRing <= 0) {
        nextRing = idle ? 120 : Math.max(15, 60 - mi * 40);
        rings.push({
          x: Math.random() * W(),
          y: Math.random() * H(),
          r: 5,
          maxR: 80 + Math.random() * 100,
          life: 1,
        });
      }
      rings.forEach((ring, i) => {
        ring.r += 1.5 * calm;
        ring.life = Math.max(0, 1 - ring.r / ring.maxR);
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,229,160,${ring.life * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
      for (let i = rings.length - 1; i >= 0; i--) {
        if (rings[i].life <= 0) rings.splice(i, 1);
      }

      // Jittery dots
      dots.forEach((d) => {
        const jScale = calm * (1 + mi * 0.8);
        const jx = d.jAmp * jScale * Math.sin(t * d.jFreq * 60 + d.phase);
        const jy = d.jAmp * jScale * Math.cos(t * d.jFreq * 55 + d.phase + 1.2);
        d.baseX += d.vx;
        d.baseY += d.vy;
        if (d.baseX < 0 || d.baseX > W()) d.vx *= -1;
        if (d.baseY < 0 || d.baseY > H()) d.vy *= -1;

        const px = d.baseX + (idle ? jx * 0.2 : jx);
        const py = d.baseY + (idle ? jy * 0.2 : jy);
        const alpha = d.opacity * (0.55 + 0.45 * Math.abs(Math.sin(t * 2 + d.phase)));

        const glow = ctx.createRadialGradient(px, py, 0, px, py, d.r * 5);
        glow.addColorStop(0, d.color + 'CC');
        glow.addColorStop(1, d.color + '00');
        ctx.globalAlpha = alpha * 0.4;
        ctx.beginPath(); ctx.arc(px, py, d.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();

        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.arc(px, py, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.color; ctx.fill();
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
      className="bg-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
    >
      <canvas ref={canvasRef} className="bg-canvas" />
    </motion.div>
  );
}
