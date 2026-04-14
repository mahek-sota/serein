import { motion } from 'framer-motion';
import { MoodConfig } from '../../types/mood';

interface Props {
  mood: MoodConfig;
  index: number;
  isHovered: boolean;
  isDefocused: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

export default function WeatherCard({ mood, index, isHovered, isDefocused, onHover, onLeave, onClick }: Props) {
  const { symbol, landingCard, colors } = mood;

  return (
    <motion.div
      className={`weather-card weather-card--${mood.id}`}
      onClick={onClick}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={{
        opacity: isDefocused ? 0.3 : 1,
        scale: isHovered ? 1.06 : isDefocused ? 0.94 : 1,
        y: isHovered ? -8 : 0,
        filter: isDefocused ? 'blur(1.5px)' : 'blur(0px)',
      }}
      transition={{
        opacity: { duration: 0.4, delay: index * 0.09 + 0.3 },
        scale: { type: 'spring', stiffness: 260, damping: 22 },
        y: { type: 'spring', stiffness: 260, damping: 22 },
        filter: { duration: 0.35 },
      }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: colors.cardBg,
        borderColor: isHovered ? colors.primary : colors.cardBorder,
        boxShadow: isHovered
          ? `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}60, inset 0 1px 0 ${colors.cardBorder}`
          : `0 0 20px ${colors.glow}40, inset 0 1px 0 ${colors.cardBorder}`,
      }}
    >
      {/* Floating background pulse */}
      <motion.div
        className="card-pulse"
        style={{ background: `radial-gradient(ellipse at 50% 80%, ${colors.primary}18 0%, transparent 70%)` }}
        animate={{ opacity: isHovered ? 1 : 0.4 }}
        transition={{ duration: 0.5 }}
      />

      {/* Glow bar */}
      <div
        className="card-top-bar"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          opacity: isHovered ? 0.8 : 0.3,
        }}
      />

      <div className="card-body">
        {/* Symbol */}
        <motion.span
          className="card-symbol"
          style={{ color: colors.primary }}
          animate={isHovered ? {
            textShadow: [`0 0 15px ${colors.glow}`, `0 0 30px ${colors.glow}`, `0 0 15px ${colors.glow}`],
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {symbol}
        </motion.span>

        {/* Name */}
        <h3 className="card-name" style={{ color: colors.text }}>
          {mood.id.charAt(0).toUpperCase() + mood.id.slice(1)}
        </h3>

        {/* Description */}
        <p className="card-desc" style={{ color: colors.muted }}>
          {landingCard.description}
        </p>
      </div>

      {/* Float animation wrapper */}
      <motion.div
        className="card-float-layer"
        animate={{ y: [0, -landingCard.floatDistance, 0] }}
        transition={{
          duration: landingCard.floatDuration,
          delay: landingCard.floatDelay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {isHovered && (
        <motion.div
          className="card-enter-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ color: colors.primary }}
        >
          enter →
        </motion.div>
      )}
    </motion.div>
  );
}
