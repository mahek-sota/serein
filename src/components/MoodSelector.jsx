import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MOODS, { MOOD_IDS } from '../constants/moods';

export default function MoodSelector({ currentMood, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const mood = MOODS[currentMood];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (id) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className="selector-wrap" ref={ref}>
      <motion.button
        className="selector-trigger"
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          borderColor: mood.colors.cardBorder,
          background: mood.colors.cardBg,
          color: mood.colors.text,
          boxShadow: `0 0 20px ${mood.colors.glow}`,
        }}
      >
        <span className="selector-emoji">{mood.emoji}</span>
        <span className="selector-label">{mood.label}</span>
        <motion.span
          className="selector-arrow"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ color: mood.colors.primary }}
        >
          ∨
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="selector-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ background: mood.colors.dropdownBg }}
          >
            {MOOD_IDS.map((id, i) => {
              const m = MOODS[id];
              const isActive = id === currentMood;
              return (
                <motion.button
                  key={id}
                  className={`selector-option ${isActive ? 'active' : ''}`}
                  onClick={() => select(id)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  whileHover={{ x: 4 }}
                  style={{
                    '--opt-primary': m.colors.primary,
                    '--opt-glow': m.colors.glow,
                    color: isActive ? m.colors.primary : 'rgba(255,255,255,0.65)',
                    borderLeftColor: isActive ? m.colors.primary : 'transparent',
                  }}
                >
                  <span className="opt-emoji">{m.emoji}</span>
                  <span className="opt-text">
                    <span className="opt-label">{m.label}</span>
                    <span className="opt-tagline">{m.tagline}</span>
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
