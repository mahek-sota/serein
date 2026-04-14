import { motion, AnimatePresence } from 'framer-motion';
import { MoodConfig } from '../../types/mood';

interface Props {
  mood: MoodConfig;
  evolutionStage: number;
  timeInMood: number;
  isUnstable: boolean;
}

export default function EmotionalMetric({ mood, evolutionStage, timeInMood, isUnstable }: Props) {
  const { emotionalMetric, colors } = mood;
  const stageValue = emotionalMetric.stages[Math.min(evolutionStage, emotionalMetric.stages.length - 1)];

  // Format time
  const mins = Math.floor(timeInMood / 60);
  const secs = Math.floor(timeInMood % 60);
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <motion.div
      className="emotional-metric"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      <div className="metric-label" style={{ color: colors.primary }}>
        {emotionalMetric.label}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stageValue}
          className="metric-value"
          style={{ color: colors.text }}
          initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.45 }}
        >
          {stageValue}
        </motion.div>
      </AnimatePresence>

      <div className="metric-time" style={{ color: colors.muted }}>
        {isUnstable ? (
          <motion.span
            style={{ color: colors.primary }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            unstable — shifting
          </motion.span>
        ) : (
          <>in this climate for {timeStr}</>
        )}
      </div>

      {/* Evolution progress bar */}
      <div className="metric-progress-track" style={{ background: `${colors.primary}20` }}>
        <motion.div
          className="metric-progress-fill"
          style={{ background: `linear-gradient(90deg, ${colors.primary}80, ${colors.primary})` }}
          animate={{ width: `${Math.min((timeInMood / 180) * 100, 100)}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}
