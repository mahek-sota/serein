import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

import MOODS from './constants/moods';
import { useMoodTheme } from './hooks/useMoodTheme';
import MoodSelector from './components/MoodSelector';
import MoodCard from './components/MoodCard';
import PlaylistSection from './components/PlaylistSection';

import HappyBackground from './components/backgrounds/HappyBackground';
import SadBackground from './components/backgrounds/SadBackground';
import AnxiousBackground from './components/backgrounds/AnxiousBackground';
import ContentBackground from './components/backgrounds/ContentBackground';
import AngryBackground from './components/backgrounds/AngryBackground';
import MelancholyBackground from './components/backgrounds/MelancholyBackground';
import HopefulBackground from './components/backgrounds/HopefulBackground';
import MysteriousBackground from './components/backgrounds/MysteriousBackground';

const BACKGROUND_MAP = {
  happy: HappyBackground,
  sad: SadBackground,
  anxious: AnxiousBackground,
  content: ContentBackground,
  angry: AngryBackground,
  melancholy: MelancholyBackground,
  hopeful: HopefulBackground,
  mysterious: MysteriousBackground,
};

export default function App() {
  const [currentMood, setCurrentMood] = useState('mysterious');
  const mood = MOODS[currentMood];
  const Background = BACKGROUND_MAP[currentMood];

  useMoodTheme(mood.colors);

  return (
    <div
      className="app"
      style={{ background: mood.colors.bg }}
    >
      {/* Mood gradient backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-gradient-${currentMood}`}
          className="bg-gradient"
          style={{ background: mood.gradient }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {/* Animated canvas background */}
      <AnimatePresence mode="wait">
        <Background key={currentMood} />
      </AnimatePresence>

      {/* Vignette */}
      <div className="vignette" />

      {/* Noise grain overlay */}
      <div className="grain" />

      {/* Content */}
      <div className="content-layer">
        <header className="site-header">
          <div className="header-logo">
            <motion.span
              className="logo-text"
              key={currentMood}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ color: mood.colors.primary }}
            >
              Serein
            </motion.span>
            <span className="logo-sub">feel it fully</span>
          </div>
          <MoodSelector currentMood={currentMood} onChange={setCurrentMood} />
        </header>

        <main className="site-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={`main-${currentMood}`}
              className="main-inner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MoodCard mood={mood} />
              <PlaylistSection
                playlist={mood.playlist}
                colors={mood.colors}
                moodId={currentMood}
              />
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="site-footer">
          <span style={{ color: mood.colors.muted }}>
            Shift the mood. Shift the world.
          </span>
        </footer>
      </div>
    </div>
  );
}
