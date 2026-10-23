import { motion } from 'framer-motion'
import { useAudio } from '../AudioContext'

export default function GlobalMusicButton() {
  const { isPlaying, isMuted, toggleMute, togglePlay, started } = useAudio()

  return (
    <motion.button
      onClick={toggleMute}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.12, boxShadow: '0 6px 24px rgba(129,212,250,0.5)' }}
      whileTap={{ scale: 0.92 }}
      title={isMuted ? 'Unmute music' : 'Mute music'}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 200,
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '1.5px solid rgba(129,212,250,0.5)',
        background: 'rgba(20,25,55,0.85)',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        color: '#FFE082',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {isMuted ? '🔇' : '🎵'}
      {!isMuted && isPlaying && (
        <motion.span
          animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '1.5px solid #81D4FA',
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.button>
  )
}
