import { motion, AnimatePresence } from 'framer-motion';

export default function PlaylistSection({ playlist, colors, moodId }) {
  return (
    <motion.div
      className="playlist-wrap"
      style={{
        background: colors.cardBg,
        borderColor: colors.cardBorder,
        boxShadow: `0 0 40px ${colors.glow}40`,
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="playlist-header">
        <span className="playlist-icon" style={{ color: colors.primary }}>♫</span>
        <div>
          <h3 className="playlist-title" style={{ color: colors.text }}>
            Curated for this mood
          </h3>
          <p className="playlist-sub" style={{ color: colors.muted }}>
            Open in YouTube
          </p>
        </div>
      </div>

      <div
        className="playlist-divider"
        style={{ background: `linear-gradient(90deg, ${colors.primary}44, transparent)` }}
      />

      <AnimatePresence mode="wait">
        <motion.ul
          key={moodId}
          className="playlist-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {playlist.map((song, i) => (
            <motion.li
              key={song.url}
              className="playlist-item"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35, ease: 'easeOut' }}
            >
              <a
                href={song.url}
                target="_blank"
                rel="noopener noreferrer"
                className="playlist-link"
                style={{ '--link-color': colors.primary, '--link-glow': colors.glow }}
              >
                <span
                  className="track-num"
                  style={{ color: colors.primary, opacity: 0.5 }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="track-info">
                  <span className="track-title" style={{ color: colors.text }}>
                    {song.title}
                  </span>
                  <span className="track-artist" style={{ color: colors.muted }}>
                    {song.artist}
                  </span>
                </span>
                <span className="track-arrow" style={{ color: colors.primary }}>
                  ↗
                </span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </motion.div>
  );
}
