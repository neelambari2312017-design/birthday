import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EnvelopePage from './pages/EnvelopePage'
import GardenPage from './pages/GardenPage'
import GalleryPage from './pages/GalleryPage'
import StoryPage from './pages/StoryPage'
import FinalePage from './pages/FinalePage'
import DashboardButton from './components/DashboardButton'
import GlobalMusicButton from './components/GlobalMusicButton'
import { AudioProvider, useAudio } from './AudioContext'

const PAGES = [EnvelopePage, GardenPage, GalleryPage, StoryPage, FinalePage]

const pageVariants = {
  initial: { opacity: 0, y: 40, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -30, scale: 0.97, transition: { duration: 0.4, ease: 'easeIn' } },
}

// ── change this to your password ──
const SECRET = 'Littlestar'

function AppContent() {
  const [unlocked,  setUnlocked]  = useState(false)
  const [pwd,       setPwd]       = useState('')
  const [wrong,     setWrong]     = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const { startMusic } = useAudio()

  const tryUnlock = () => {
    if (pwd.trim().toLowerCase() === SECRET.toLowerCase()) {
      setUnlocked(true)
      setWrong(false)
      startMusic()
    } else {
      setWrong(true)
      setPwd('')
    }
  }

  // ── PASSWORD SCREEN ──
  if (!unlocked) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, #2d1260 0%, #1a0535 40%, #0a0f1e 100%)',
      padding: '0 24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* stars */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 2.5 + 1, height: Math.random() * 2.5 + 1,
            borderRadius: '50%', background: 'white',
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2 + Math.random() * 3, delay: Math.random() * 4, repeat: Infinity }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, zIndex: 10, width: '100%', maxWidth: 340 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, position: 'relative' }}>
          {/* Cute glowing Moon */}
          <motion.div
            animate={{ y: [0, -7, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 0 16px rgba(255,229,127,0.6))' }}
          >
            <svg width="68" height="68" viewBox="0 0 120 120" fill="none">
              <circle cx="58" cy="60" r="42" fill="#FFE082"/>
              <path d="M78 26 A42 42 0 0 0 78 94 A36 36 0 0 1 78 26 Z" fill="#FFCA28" opacity="0.4"/>
              <path d="M38 25 Q48 10 70 18 Q62 26 50 28 Z" fill="#7C4DFF" opacity="0.85"/>
              <circle cx="72" cy="18" r="4.5" fill="#FFE57F"/>
              {/* Cute smiling eyes */}
              <path d="M42 54 Q48 48 54 54" stroke="#4A3405" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <path d="M64 54 Q70 48 76 54" stroke="#4A3405" strokeWidth="3" strokeLinecap="round" fill="none"/>
              {/* Cheeks & smile */}
              <ellipse cx="40" cy="62" rx="6" ry="4" fill="#FF8FAB" opacity="0.8"/>
              <ellipse cx="78" cy="62" rx="6" ry="4" fill="#FF8FAB" opacity="0.8"/>
              <path d="M54 64 Q59 70 64 64" stroke="#C2185B" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
            </svg>
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ fontSize: 22 }}
          >
            ✨
          </motion.div>

          {/* Cute Boy Star */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [3, -3, 3] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            style={{ filter: 'drop-shadow(0 0 16px rgba(129,212,250,0.6))' }}
          >
            <svg width="68" height="68" viewBox="0 0 110 110" fill="none">
              <polygon
                points="55,18 64,38 86,41 70,57 74,79 55,68 36,79 40,57 24,41 46,38"
                fill="#FFD54F"
                stroke="#FFB300"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Boy hair tuft */}
              <path d="M51 25 Q54 13 61 18 Q58 24 57 27 Z" fill="#5D4037"/>
              {/* Boy eyes with catchlights */}
              <circle cx="46" cy="48" r="4" fill="#2E1C0C"/>
              <circle cx="44.8" cy="46.5" r="1.4" fill="white"/>
              <circle cx="64" cy="48" r="4" fill="#2E1C0C"/>
              <circle cx="62.8" cy="46.5" r="1.4" fill="white"/>
              {/* Cheeks & smile */}
              <ellipse cx="40" cy="54" rx="4.5" ry="3" fill="#FF8FAB" opacity="0.7"/>
              <ellipse cx="70" cy="54" rx="4.5" ry="3" fill="#FF8FAB" opacity="0.7"/>
              <path d="M51 54 Q55 60 59 54" stroke="#D84315" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
              {/* Little blue bowtie */}
              <polygon points="50,65 55,68 50,71" fill="#4FC3F7"/>
              <polygon points="60,65 55,68 60,71" fill="#4FC3F7"/>
              <circle cx="55" cy="68" r="1.8" fill="#0288D1"/>
            </svg>
          </motion.div>
        </div>

        <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(26px,7vw,34px)', color: '#FFE082', textAlign: 'center', lineHeight: 1.3, margin: 0, textShadow: '0 0 15px rgba(255,224,130,0.4)' }}>
          Under the Moon & Stars 🌙⭐
        </p>

        <p style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 300, fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: 'center', margin: 0 }}>
          Enter the password to continue
        </p>

        <input
          type="password"
          placeholder="password"
          value={pwd}
          onChange={e => { setPwd(e.target.value); setWrong(false) }}
          onKeyDown={e => e.key === 'Enter' && tryUnlock()}
          style={{
            width: '100%', padding: '14px 20px', borderRadius: 100,
            border: `1.5px solid ${wrong ? '#FF6B9D' : 'rgba(183,110,255,0.5)'}`,
            background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: 16,
            outline: 'none', textAlign: 'center',
            fontFamily: "'Josefin Sans', sans-serif", letterSpacing: '0.12em',
            transition: 'border-color 0.2s',
          }}
        />

        <AnimatePresence>
          {wrong && (
            <motion.p
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: 12, color: '#FF6B9D', margin: '-12px 0 0', letterSpacing: '0.08em' }}
            >
              Incorrect password — try again 💔
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          onClick={tryUnlock}
          whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(183,110,255,0.5)' }}
          whileTap={{ scale: 0.96 }}
          style={{
            width: '100%', background: 'linear-gradient(135deg,#FF6B9D,#B76EFF)',
            color: 'white', border: 'none', borderRadius: 100, padding: '14px 32px',
            fontFamily: "'Josefin Sans', sans-serif", fontWeight: 400, fontSize: 14,
            letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(183,110,255,0.4)',
          }}
        >Open 💖</motion.button>

        <p style={{ fontFamily: "'Dancing Script', cursive", fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: 0 }}>
          Made with love, just for you ✨
        </p>
      </motion.div>
    </div>
  )

  // ── MAIN APP ──
  const goTo = (idx) => {
    setDirection(idx > pageIndex ? 1 : -1)
    setPageIndex(idx)
  }
  const next = () => { if (pageIndex < PAGES.length - 1) goTo(pageIndex + 1) }
  const prev = () => { if (pageIndex > 0) goTo(pageIndex - 1) }
  const CurrentPage = PAGES[pageIndex]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex gap-2">
        {PAGES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className="transition-all duration-300"
            style={{
              width: i === pageIndex ? 24 : 8, height: 8, borderRadius: 4,
              background: i === pageIndex ? '#FF6B9D' : 'rgba(255,107,157,0.35)',
              border: 'none', cursor: 'pointer',
            }}
          />
        ))}
      </div>

      <DashboardButton />
      <GlobalMusicButton />

      <AnimatePresence mode="wait">
        <motion.div
          key={pageIndex}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="min-h-screen"
        >
          <CurrentPage onNext={next} onPrev={prev} pageIndex={pageIndex} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  )
}