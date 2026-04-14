import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

import MOODS from './constants/moods';
import { useMoodEngine } from './hooks/useMoodEngine';
import { useMouseBehavior } from './hooks/useMouseBehavior';
import CursorTrail from './components/CursorTrail';
import Landing from './components/Landing/Landing';
import Room from './components/Room/Room';

export default function App() {
  const engine = useMoodEngine();
  const mouse = useMouseBehavior();
  const mood = MOODS[engine.moodId];

  return (
    <div className="app">
      <CursorTrail
        color={mood.colors.primary}
        style={mood.interaction.cursorStyle}
        intensity={mouse.intensity}
        isIdle={mouse.isIdle}
      />

      {/* Cinematic transition flash */}
      <AnimatePresence>
        {engine.phase === 'transitioning' && (
          <motion.div
            key="transition-flash"
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: mood.colors.bg,
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1, times: [0, 0.3, 0.7, 1], ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {engine.phase === 'landing' && (
          <Landing
            key="landing"
            moods={MOODS}
            onSelect={engine.selectMood}
          />
        )}

        {engine.phase === 'room' && (
          <Room
            key={`room-${engine.moodId}`}
            mood={mood}
            evolutionStage={engine.evolutionStage}
            timeInMood={engine.timeInMood}
            mouseState={mouse}
            isUnstable={engine.isUnstable}
            onBack={engine.goHome}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
