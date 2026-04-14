import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoodConfig } from '../../types/mood';
import { MouseState } from '../../hooks/useMouseBehavior';
import EmotionalMetric from './EmotionalMetric';

import AnxiousBackground from '../backgrounds/AnxiousBackground';
import ContentBackground from '../backgrounds/ContentBackground';
import HappyBackground from '../backgrounds/HappyBackground';
import AngryBackground from '../backgrounds/AngryBackground';
import SadBackground from '../backgrounds/SadBackground';
import HopefulBackground from '../backgrounds/HopefulBackground';
import MysteriousBackground from '../backgrounds/MysteriousBackground';

interface Props {
  mood: MoodConfig;
  evolutionStage: number;
  timeInMood: number;
  mouseState: MouseState;
  isUnstable: boolean;
  onBack: () => void;
}

const BG_MAP: Record<string, React.ComponentType<any>> = {
  anxious: AnxiousBackground,
  content: ContentBackground,
  happy: HappyBackground,
  angry: AngryBackground,
  sad: SadBackground,
  hopeful: HopefulBackground,
  mysterious: MysteriousBackground,
};

// Animated poetry line — different per textAnimation style
function PoemLine({ text, style, colors, lineKey }: { text: string; style: string; colors: MoodConfig['colors']; lineKey: string }) {
  const words = text.split(' ');

  if (style === 'fragment') {
    // Words appear in fragments, slightly jittery
    return (
      <motion.p className="room-line room-line--fragment" key={lineKey} style={{ color: colors.text, letterSpacing: '0.02em' }}>
        {words.map((w, i) => (
          <motion.span
            key={i}
            style={{ display: 'inline-block', marginRight: '0.3em' }}
            initial={{ opacity: 0, x: (Math.random() - 0.5) * 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3, ease: 'easeOut' }}
          >{w}</motion.span>
        ))}
      </motion.p>
    );
  }

  if (style === 'snap') {
    return (
      <motion.p className="room-line" key={lineKey} style={{ color: colors.text }}
        initial={{ opacity: 0, scaleX: 0, originX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.18, ease: [0.77, 0, 0.18, 1] }}
      >{text}</motion.p>
    );
  }

  if (style === 'rise') {
    return (
      <motion.p className="room-line" key={lineKey} style={{ color: colors.text }}>
        {words.map((w, i) => (
          <motion.span key={i} style={{ display: 'inline-block', marginRight: '0.3em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.09, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >{w}</motion.span>
        ))}
      </motion.p>
    );
  }

  if (style === 'breathe') {
    return (
      <motion.p className="room-line" key={lineKey} style={{ color: colors.text }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 1] }}
        transition={{ duration: 1.8, times: [0, 0.5, 1], ease: 'easeInOut' }}
      >{text}</motion.p>
    );
  }

  // Default: fade drift
  return (
    <motion.p className="room-line" key={lineKey} style={{ color: colors.text }}
      initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >{text}</motion.p>
  );
}

// Playlist panel
function PlaylistPanel({ mood, onClose, visible }: { mood: MoodConfig; onClose: () => void; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="playlist-panel"
          style={{ background: mood.colors.dropdownBg, borderColor: mood.colors.cardBorder }}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="playlist-header">
            <span style={{ color: mood.colors.primary }}>♫</span>
            <span style={{ color: mood.colors.text }}>curated sounds</span>
            <button className="playlist-close" onClick={onClose} style={{ color: mood.colors.muted }}>✕</button>
          </div>
          <div className="playlist-divider" style={{ background: `linear-gradient(90deg, ${mood.colors.primary}44, transparent)` }} />
          <ul className="playlist-list">
            {mood.playlist.map((song, i) => (
              <li key={song.url} className="playlist-item">
                <a href={song.url} target="_blank" rel="noopener noreferrer" className="playlist-link"
                  style={{ '--link-color': mood.colors.primary } as React.CSSProperties}>
                  <span className="track-num" style={{ color: mood.colors.primary }}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="track-info">
                    <span className="track-title" style={{ color: mood.colors.text }}>{song.title}</span>
                    <span className="track-artist" style={{ color: mood.colors.muted }}>{song.artist}</span>
                  </span>
                  <span className="track-arrow" style={{ color: mood.colors.primary }}>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Room({ mood, evolutionStage, timeInMood, mouseState, isUnstable, onBack }: Props) {
  const [lineIndex, setLineIndex] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const Background = BG_MAP[mood.id];
  const { colors, interaction, lines, poeticName, symbol, typography } = mood;

  // Rotate lines
  useEffect(() => {
    const ms = Math.max(8000, interaction.transitionDuration * 12);
    const t = setInterval(() => setLineIndex((i) => (i + 1) % lines.length), ms);
    return () => clearInterval(t);
  }, [lines.length, interaction.transitionDuration]);

  // Keyboard: escape → home
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  const txDuration = interaction.transitionDuration / 1000;

  return (
    <motion.div
      className={`room room--${mood.id}`}
      style={{
        background: colors.bg,
        fontFamily: typography.fontFamily,
        '--mood-primary': colors.primary,
        '--mood-text': colors.text,
        '--mood-muted': colors.muted,
        '--mood-radius': interaction.borderRadius,
        '--mood-transition': `${txDuration}s`,
      } as React.CSSProperties}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated background */}
      <AnimatePresence mode="wait">
        <Background
          key={mood.id}
          evolutionStage={evolutionStage}
          intensity={mouseState.intensity}
          isIdle={mouseState.isIdle}
          mouseX={mouseState.x}
          mouseY={mouseState.y}
        />
      </AnimatePresence>

      {/* Gradient overlay */}
      <motion.div
        className="bg-gradient-overlay"
        key={mood.id}
        style={{ background: `radial-gradient(ellipse 140% 120% at 50% 50%, ${colors.bg}00 0%, ${colors.bg}44 50%, ${colors.bg}99 80%, ${colors.bg}EE 100%)` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <div className="vignette" />
      <div className="grain" />

      {/* UI layer */}
      <div className="room-ui">
        {/* Top bar */}
        <div className="room-topbar">
          <motion.button
            className="room-back"
            style={{ color: colors.muted, borderColor: colors.cardBorder }}
            onClick={onBack}
            whileHover={{ scale: 1.04, color: colors.primary }}
            whileTap={{ scale: 0.96 }}
          >
            ← back
          </motion.button>

          <EmotionalMetric mood={mood} evolutionStage={evolutionStage} timeInMood={timeInMood} isUnstable={isUnstable} />
        </div>

        {/* Main content */}
        <div className="room-center">
          {/* Symbol */}
          <motion.div
            className="room-symbol"
            style={{ color: colors.primary }}
            animate={{ textShadow: [`0 0 20px ${colors.glow}`, `0 0 45px ${colors.glow}`, `0 0 20px ${colors.glow}`] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {symbol}
          </motion.div>

          {/* Mood name */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={mood.id}
              className="room-mood-name"
              style={{ color: colors.primary, fontFamily: typography.fontFamily, fontWeight: typography.weight, letterSpacing: typography.letterSpacing }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: txDuration * 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {poeticName}
            </motion.h1>
          </AnimatePresence>

          {/* Decorative rule */}
          <motion.div
            className="room-name-rule"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
              boxShadow: `0 0 8px ${colors.glow}`,
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Poetry line */}
          <div className="room-line-wrap">
            <span className="quote-mark" style={{ color: colors.primary }}>&#8220;</span>
            <AnimatePresence mode="wait">
              <PoemLine
                key={`${mood.id}-${lineIndex}`}
                lineKey={`${mood.id}-${lineIndex}`}
                text={lines[lineIndex]}
                style={interaction.textAnimation}
                colors={colors}
              />
            </AnimatePresence>
          </div>

          {/* Line navigator dots */}
          <div className="line-dots">
            {lines.map((_, i) => (
              <motion.button
                key={i}
                className={`line-dot${i === lineIndex ? ' line-dot--active' : ''}`}
                style={{ background: i === lineIndex ? colors.primary : colors.cardBorder }}
                onClick={() => setLineIndex(i)}
                whileHover={{ scale: 1.3 }}
              />
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="room-bottombar">
          <motion.button
            className="playlist-toggle"
            style={{
              color: colors.muted,
              borderColor: colors.cardBorder,
              background: colors.cardBg,
              borderRadius: interaction.borderRadius,
            }}
            onClick={() => setShowPlaylist((v) => !v)}
            whileHover={{ scale: 1.03, color: colors.primary }}
            whileTap={{ scale: 0.97 }}
          >
            ♫ {showPlaylist ? 'close' : 'playlist'}
          </motion.button>
        </div>
      </div>

      {/* Playlist panel */}
      <PlaylistPanel mood={mood} visible={showPlaylist} onClose={() => setShowPlaylist(false)} />
    </motion.div>
  );
}
