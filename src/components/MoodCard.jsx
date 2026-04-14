import { motion, AnimatePresence } from 'framer-motion';

const textVariants = {
  enter: { opacity: 0, y: 18, filter: 'blur(6px)' },
  center: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -12, filter: 'blur(4px)' },
};

export default function MoodCard({ mood }) {
  const { colors, label, emoji, tagline, quote, author, description } = mood;

  return (
    <motion.div
      className="mood-card"
      style={{
        background: colors.cardBg,
        borderColor: colors.cardBorder,
        boxShadow: `0 0 60px ${colors.glow}, 0 0 120px ${colors.glow}40, inset 0 1px 0 ${colors.cardBorder}`,
      }}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glow top border */}
      <div
        className="card-glow-bar"
        style={{
          background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          className="card-inner"
          variants={textVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mood identity */}
          <div className="card-identity">
            <motion.span
              className="card-emoji"
              style={{ color: colors.primary }}
              animate={{
                textShadow: [
                  `0 0 20px ${colors.glow}`,
                  `0 0 40px ${colors.glow}`,
                  `0 0 20px ${colors.glow}`,
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {emoji}
            </motion.span>
            <div className="card-title-group">
              <h2 className="card-mood-name" style={{ color: colors.primary }}>
                {label}
              </h2>
              <span className="card-tagline" style={{ color: colors.muted }}>
                {tagline}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div
            className="card-divider"
            style={{ background: `linear-gradient(90deg, ${colors.primary}44, transparent)` }}
          />

          {/* Quote */}
          <blockquote className="card-quote">
            <span className="quote-mark" style={{ color: colors.primary }}>&#8220;</span>
            <p className="quote-text" style={{ color: colors.text }}>
              {quote}
            </p>
            <footer className="quote-author" style={{ color: colors.muted }}>
              — {author}
            </footer>
          </blockquote>

          {/* Description */}
          <p className="card-description" style={{ color: colors.muted }}>
            {description}
          </p>

          {/* Ambient dot */}
          <motion.div
            className="card-ambient-dot"
            style={{ background: colors.primary }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
