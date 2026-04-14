import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props { evolutionStage: number; intensity: number; isIdle: boolean; }

export default function HopefulBackground({ evolutionStage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ evolutionStage });
  useEffect(() => { propsRef.current = { evolutionStage }; }, [evolutionStage]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let rafId: number;
    let t = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const W = () => canvas.width; const H = () => canvas.height;

    const colors = ['#FFB347', '#FF8C69', '#FFDB89', '#FFD93D', '#FFA07A'];
    const embers = Array.from({ length: 85 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * window.innerHeight,
      r: 1.5 + Math.random() * 3.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vy: -(0.35 + Math.random() * 1.1),
      vx: (Math.random() - 0.5) * 0.45,
      phase: Math.random() * Math.PI * 2,
      waveAmp: 8 + Math.random() * 22,
      opacity: 0.4 + Math.random() * 0.5,
      opPhase: Math.random() * Math.PI * 2,
    }));

    const numRays = 10;

    const draw = () => {
      const { evolutionStage: stage } = propsRef.current;
      // Evolves: gets brighter, more particles, stronger rays
      const brightMult = 0.75 + stage * 0.25;
      t += 0.016;
      ctx.clearRect(0, 0, W(), H());

      // Sunrise glow
      const sunGrad = ctx.createRadialGradient(W() / 2, H() * 1.1, 0, W() / 2, H() * 1.1, H() * 0.95);
      sunGrad.addColorStop(0, `rgba(255,179,71,${0.38 + stage * 0.12})`);
      sunGrad.addColorStop(0.4, `rgba(255,140,105,${0.18 + stage * 0.07})`);
      sunGrad.addColorStop(1, 'rgba(255,140,105,0)');
      ctx.fillStyle = sunGrad; ctx.fillRect(0, 0, W(), H());

      for (let i = 0; i < numRays; i++) {
        const angle = -Math.PI * 0.9 + (Math.PI * 0.8 / (numRays - 1)) * i;
        const len = H() * 1.5;
        const spread = 0.014 + 0.005 * Math.sin(t * 0.45 + i);
        const opacity = (0.014 + 0.007 * Math.sin(t * 0.38 + i * 0.9)) * brightMult;
        ctx.save();
        ctx.translate(W() / 2, H() * 1.1); ctx.rotate(angle);
        const rg = ctx.createLinearGradient(0, 0, 0, -len);
        rg.addColorStop(0, `rgba(255,200,100,${opacity})`);
        rg.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.beginPath();
        ctx.moveTo(-Math.tan(spread) * 0, 0);
        ctx.lineTo(-Math.tan(spread) * len, -len);
        ctx.lineTo(Math.tan(spread) * len, -len);
        ctx.lineTo(Math.tan(spread) * 0, 0);
        ctx.fillStyle = rg; ctx.fill();
        ctx.restore();
      }

      embers.forEach((e) => {
        e.y += e.vy * (0.7 + stage * 0.1);
        e.x += e.vx + Math.sin(t * 0.04 + e.phase) * 0.22;
        if (e.y + e.r < -20) { e.y = H() + e.r + Math.random() * 150; e.x = Math.random() * W(); }
        const alpha = e.opacity * (0.55 + 0.45 * Math.sin(t * 1.4 + e.opPhase));
        const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
        glow.addColorStop(0, e.color + 'BB'); glow.addColorStop(1, e.color + '00');
        ctx.globalAlpha = alpha * 0.45 * brightMult;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();
        ctx.globalAlpha = alpha * brightMult;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = e.color; ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <motion.div className="bg-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
      <canvas ref={canvasRef} className="bg-canvas" />
    </motion.div>
  );
}
