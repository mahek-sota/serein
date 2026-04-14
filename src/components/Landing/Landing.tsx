import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoodId, MoodMap } from '../../types/mood';
import WeatherCard from './WeatherCard';

interface Props {
  moods: MoodMap;
  onSelect: (id: MoodId) => void;
}

const MOOD_ORDER: MoodId[] = ['anxious', 'content', 'happy', 'angry', 'sad', 'hopeful', 'mysterious'];

// Landing atmospheric canvas — slow cosmic dust
function LandingAtmosphere({ accentColor }: { accentColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(accentColor);
  useEffect(() => { colorRef.current = accentColor; }, [accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let rafId: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const W = () => canvas.width; const H = () => canvas.height;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.5 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.08,
      opacity: 0.1 + Math.random() * 0.5,
      twPhase: Math.random() * Math.PI * 2,
      twSpeed: 0.015 + Math.random() * 0.03,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());
      const c = colorRef.current;

      particles.forEach((p) => {
        p.twPhase += p.twSpeed;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W(); if (p.x > W()) p.x = 0;
        if (p.y < 0) p.y = H(); if (p.y > H()) p.y = 0;
        const alpha = p.opacity * (0.4 + 0.6 * Math.abs(Math.sin(p.twPhase)));
        ctx.globalAlpha = alpha * 0.6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.5, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.5);
        g.addColorStop(0, c + '88'); g.addColorStop(1, c + '00');
        ctx.fillStyle = g; ctx.fill();
        ctx.globalAlpha = alpha;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = c; ctx.fill();
      });

      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
}

export default function Landing({ moods, onSelect }: Props) {
  const [hoveredId, setHoveredId] = useState<MoodId | null>(null);
  const hoveredMood = hoveredId ? moods[hoveredId] : null;
  const accentColor = hoveredMood?.colors.primary ?? '#A855F7';

  // Stagger title letters
  const title = 'Serein';

  return (
    <motion.div
      className="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <LandingAtmosphere accentColor={accentColor} />

      {/* Gradient background that shifts on hover */}
      <motion.div
        className="landing-bg"
        animate={{
          background: hoveredMood
            ? `radial-gradient(ellipse 80% 60% at 50% 60%, ${hoveredMood.colors.glow} 0%, transparent 65%), linear-gradient(180deg, #020208 0%, #07050f 100%)`
            : 'linear-gradient(180deg, #020208 0%, #07050f 100%)',
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      <div className="vignette" />
      <div className="grain" />

      <div className="landing-content">
        {/* Logo */}
        <div className="landing-logo-wrap">
          {title.split('').map((char, i) => (
            <motion.span
              key={i}
              className="landing-logo-char"
              style={{ color: hoveredMood?.colors.primary ?? '#A855F7' }}
              initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          className="landing-tagline"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ delay: 0.95, duration: 0.8 }}
        >
          How is the world touching you today?
        </motion.p>

        {/* Cards */}
        <motion.div
          className="landing-cards"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          {/* Row 1: first 4 */}
          <div className="cards-row">
            {MOOD_ORDER.slice(0, 4).map((id, i) => (
              <WeatherCard
                key={id}
                mood={moods[id]}
                index={i}
                isHovered={hoveredId === id}
                isDefocused={hoveredId !== null && hoveredId !== id}
                onHover={() => setHoveredId(id)}
                onLeave={() => setHoveredId(null)}
                onClick={() => onSelect(id)}
              />
            ))}
          </div>
          {/* Row 2: last 3 */}
          <div className="cards-row">
            {MOOD_ORDER.slice(4).map((id, i) => (
              <WeatherCard
                key={id}
                mood={moods[id]}
                index={i + 4}
                isHovered={hoveredId === id}
                isDefocused={hoveredId !== null && hoveredId !== id}
                onHover={() => setHoveredId(id)}
                onLeave={() => setHoveredId(null)}
                onClick={() => onSelect(id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom hint */}
        <AnimatePresence mode="wait">
          <motion.p
            key={hoveredId ?? 'default'}
            className="landing-hint"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.32, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {hoveredMood ? `${hoveredMood.poeticName} — ${hoveredMood.tagline}` : 'select a climate to enter'}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
