import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudio } from '../AudioContext'
import { MUSIC } from '../config'
const SONG = MUSIC.envelope

/* ─────────────────────────────────────
   FONTS (injected once)
───────────────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('ep-fonts')) {
  const l = Object.assign(document.createElement('link'), {
    id: 'ep-fonts',
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Sacramento&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Josefin+Sans:wght@300;400&family=Dancing+Script:wght@400;600;700&display=swap',
  })
  document.head.appendChild(l)
}

/* ─────────────────────────────────────
   CONSTANTS  (module-level → never recreated)
───────────────────────────────────── */
const FLOATING_ITEMS = [
  { emoji: '✨', x: '8%',  y: '12%', delay: 0,   size: 26 },
  { emoji: '⭐', x: '88%', y: '10%', delay: 0.5, size: 24 },
  { emoji: '🌙', x: '6%',  y: '68%', delay: 1.0, size: 28 },
  { emoji: '💫', x: '90%', y: '65%', delay: 0.3, size: 24 },
  { emoji: '🌟', x: '14%', y: '42%', delay: 0.8, size: 24 },
  { emoji: '✨', x: '84%', y: '38%', delay: 1.3, size: 20 },
  { emoji: '🤍', x: '6%',  y: '28%', delay: 0.6, size: 20 },
  { emoji: '⭐', x: '70%', y: '18%', delay: 0,   size: 26 },
  { emoji: '💫', x: '26%', y: '16%', delay: 0.5, size: 22 },
  { emoji: '🌙', x: '78%', y: '72%', delay: 1.0, size: 26 },
  { emoji: '🌟', x: '32%', y: '78%', delay: 0.3, size: 24 },
  { emoji: '✨', x: '68%', y: '50%', delay: 1.3, size: 20 },
  { emoji: '⭐', x: '94%', y: '28%', delay: 0.6, size: 18 },
]

const SPARKLE_POSITIONS = [
  { top: '18%',    left: '22%'  },
  { top: '25%',    right: '18%' },
  { top: '72%',    left: '15%'  },
  { bottom: '20%', right: '20%' },
  { top: '50%',    left: '6%'   },
  { top: '40%',    right: '8%'  },
]

const HEART_EMOJIS = ['💖', '💜', '💗', '💫', '🌸', '✨', '💝']

const HEART_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315]

const CONFETTI_COLORS = ['#FF6B9D', '#B76EFF', '#FFD93D', '#74B9FF', '#FF8FAB', '#FFE066', '#c0506a']

/* pre-compute confetti pieces once */
const CONFETTI_PIECES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % 7],
  rad: ((i / 40) * 360 * Math.PI) / 180,
  dist: 60 + (i % 5) * 28,
  size: 6 + (i % 4) * 3,
  shape: i % 3,
  dir: i % 2 === 0 ? 1 : -1,
}))

/* pre-compute heart burst pieces once */
const HEART_PIECES = HEART_ANGLES.map((a, i) => ({
  i,
  rad: (a * Math.PI) / 180,
  dist: 55 + (i % 3) * 12,
  emoji: HEART_EMOJIS[i % HEART_EMOJIS.length],
}))

/* shared animation variants */
const FLOAT_ANIM   = { y: [0, -14, 0], rotate: [-4, 4, -4] }
const SPARKLE_ANIM = { scale: [1, 0.3, 1], opacity: [1, 0.2, 1] }
const PULSE_ANIM   = { opacity: [0.4, 0.9, 0.4] }

/* ═══════════════════════════════════════════════════════
   MOON SVG (Cute smiling moon with expressive eyes & rosy cheeks)
═══════════════════════════════════════════════════════ */
const MoonSVG = memo(function MoonSVG({ size = 130 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF9D2"/>
          <stop offset="60%" stopColor="#FFE57F"/>
          <stop offset="100%" stopColor="#FFD54F"/>
        </radialGradient>
        <filter id="moonSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      {/* Moon body - glowing crescent/cuddle moon */}
      <circle cx="58" cy="60" r="42" fill="url(#moonGlow)" filter="url(#moonSoftGlow)" />
      {/* Soft inner crescent shading */}
      <path d="M78 26 A42 42 0 0 0 78 94 A36 36 0 0 1 78 26 Z" fill="#FFE066" opacity="0.35"/>
      {/* Cute night sleeping cap / ribbon accessory */}
      <path d="M38 25 Q48 10 70 18 Q62 26 50 28 Z" fill="#7C4DFF" opacity="0.85"/>
      <circle cx="72" cy="18" r="4.5" fill="#FFE57F"/>

      {/* Cute kawaii eyes (smiling happy curved eyes with lashes) */}
      <path d="M42 54 Q48 47 54 54" stroke="#4A3405" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M64 54 Q70 47 76 54" stroke="#4A3405" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M54 50 L56 48" stroke="#4A3405" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M76 50 L78 48" stroke="#4A3405" strokeWidth="1.8" strokeLinecap="round"/>

      {/* Cute blush cheeks */}
      <ellipse cx="40" cy="62" rx="6" ry="4" fill="#FF8FAB" opacity="0.75"/>
      <ellipse cx="78" cy="62" rx="6" ry="4" fill="#FF8FAB" opacity="0.75"/>

      {/* Sweet smiling mouth */}
      <path d="M54 64 Q59 70 64 64" stroke="#C2185B" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      {/* Twinkle sparkle beside moon */}
      <text x="24" y="32" fontSize="14" textAnchor="middle">✨</text>
      <text x="94" y="44" fontSize="11" textAnchor="middle">⭐</text>
    </svg>
  )
})

/* ═══════════════════════════════════════════════════════
   STAR BOY SVG (Cute celestial boy star with little hair tuft, crown/cap, and bowtie)
═══════════════════════════════════════════════════════ */
const StarBoySVG = memo(function StarBoySVG({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 110 110" fill="none">
      <defs>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBE6"/>
          <stop offset="55%" stopColor="#FFEA79"/>
          <stop offset="100%" stopColor="#FFC83B"/>
        </radialGradient>
        <filter id="starSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      {/* Star 5-point rounded polygon */}
      <polygon
        points="55,18 64,38 86,41 70,57 74,79 55,68 36,79 40,57 24,41 46,38"
        fill="url(#starGlow)"
        filter="url(#starSoftGlow)"
        stroke="#FFB300"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Boy hairstyle: cute little hair tuft at top */}
      <path d="M51 25 Q54 13 61 18 Q58 24 57 27 Z" fill="#5D4037"/>
      <path d="M47 27 Q48 18 53 22" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      {/* Cute twinkling boy eyes with big bright catchlights */}
      <circle cx="46" cy="48" r="4.2" fill="#2E1C0C"/>
      <circle cx="44.8" cy="46.5" r="1.5" fill="white"/>
      <circle cx="47.2" cy="49.5" r="0.7" fill="white"/>

      <circle cx="64" cy="48" r="4.2" fill="#2E1C0C"/>
      <circle cx="62.8" cy="46.5" r="1.5" fill="white"/>
      <circle cx="65.2" cy="49.5" r="0.7" fill="white"/>

      {/* Boy eyebrows (curious & cheerful) */}
      <path d="M42 42 Q46 39 50 42" stroke="#6D4C41" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M60 42 Q64 39 68 42" stroke="#6D4C41" strokeWidth="1.8" strokeLinecap="round" fill="none"/>

      {/* Rosy boy cheeks */}
      <ellipse cx="40" cy="54" rx="4.5" ry="3" fill="#FF8FAB" opacity="0.6"/>
      <ellipse cx="70" cy="54" rx="4.5" ry="3" fill="#FF8FAB" opacity="0.6"/>

      {/* Happy open smile */}
      <path d="M51 54 Q55 60 59 54" stroke="#D84315" strokeWidth="2.2" strokeLinecap="round" fill="none"/>

      {/* Cute boy little blue bowtie */}
      <polygon points="50,65 55,68 50,71" fill="#4FC3F7"/>
      <polygon points="60,65 55,68 60,71" fill="#4FC3F7"/>
      <circle cx="55" cy="68" r="1.8" fill="#0288D1"/>

      {/* Sparkle highlight */}
      <text x="88" y="32" fontSize="13" textAnchor="middle">✨</text>
    </svg>
  )
})

/* ═══════════════════════════════════════════════════════
   CONFETTI BURST  (memo)
═══════════════════════════════════════════════════════ */
const ConfettiBurst = memo(function ConfettiBurst({ active }) {
  if (!active) return null
  return (
    <div style={styles.confettiBurstWrap}>
      {CONFETTI_PIECES.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
          animate={{
            x: Math.cos(p.rad) * p.dist * 3,
            y: Math.sin(p.rad) * p.dist * 2 - 80,
            scale: 0,
            opacity: 0,
            rotate: 360 * p.dir,
          }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: p.id * 0.01 }}
          style={{
            position: 'absolute',
            width:  p.shape === 0 ? p.size : p.size * 1.6,
            height: p.shape === 0 ? p.size : p.size * 0.7,
            borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? 2 : '50% 0',
            background: p.color,
            top: -p.size / 2,
            left: -p.size / 2,
          }}
        />
      ))}
    </div>
  )
})

/* ═══════════════════════════════════════════════════════
   SCISSORS SVG  (memo)
═══════════════════════════════════════════════════════ */
const SCISSOR_SPRING = { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }

const ScissorsSVG = memo(function ScissorsSVG({ snipped }) {
  const topRot    = snipped ? -28 : -14
  const bottomRot = snipped ?  28 :  14
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <motion.g animate={{ rotate: topRot }}    style={styles.scissorOrigin} transition={SCISSOR_SPRING}>
        <ellipse cx="18" cy="16" rx="5" ry="5" fill="#888" stroke="#555" strokeWidth="1.2"/>
        <ellipse cx="18" cy="16" rx="2.5" ry="2.5" fill="#ddd"/>
        <rect x="16" y="20" width="26" height="4" rx="2" fill="#aaa" stroke="#777" strokeWidth="0.8"/>
      </motion.g>
      <motion.g animate={{ rotate: bottomRot }} style={styles.scissorOrigin} transition={SCISSOR_SPRING}>
        <ellipse cx="18" cy="36" rx="5" ry="5" fill="#888" stroke="#555" strokeWidth="1.2"/>
        <ellipse cx="18" cy="36" rx="2.5" ry="2.5" fill="#ddd"/>
        <rect x="16" y="28" width="26" height="4" rx="2" fill="#aaa" stroke="#777" strokeWidth="0.8"/>
      </motion.g>
      <circle cx="18" cy="26" r="3.5" fill="#666" stroke="#444" strokeWidth="1"/>
      <circle cx="18" cy="26" r="1.5" fill="#999"/>
    </svg>
  )
})

/* ═══════════════════════════════════════════════════════
   RIBBON  (memo)
═══════════════════════════════════════════════════════ */
const RIBBON_TRANSITION = { duration: 0.8, ease: 'easeIn' }

const Ribbon = memo(function Ribbon({ cut }) {
  return (
    <div style={styles.ribbonWrap}>
      <motion.div animate={{ x: cut ? -80 : 0, opacity: cut ? 0 : 1 }} transition={RIBBON_TRANSITION} style={styles.ribbonLeft}>
        <div style={styles.ribbonLine}/>
      </motion.div>
      <motion.div animate={{ x: cut ? 80 : 0, opacity: cut ? 0 : 1 }} transition={RIBBON_TRANSITION} style={styles.ribbonRight}>
        <div style={styles.ribbonLine}/>
      </motion.div>
      {!cut && <div style={styles.ribbonBow}>🎀</div>}
    </div>
  )
})

/* ═══════════════════════════════════════════════════════
   OPENING SCREEN — step timings extracted
═══════════════════════════════════════════════════════ */
const STEP_TIMINGS = [800, 2200, 3000, 4000, 4350, 4800, 5600]

const LEFT_DECO  = [{ t:'15%',l:'20%' },{ t:'70%',l:'10%' },{ t:'40%',l:'70%' },{ t:'85%',l:'40%' }]
const RIGHT_DECO = [{ t:'20%',r:'15%' },{ t:'60%',r:'8%'  },{ t:'80%',r:'50%' },{ t:'35%',r:'65%' }]

const SPLIT_EASE    = [0.76, 0, 0.24, 1]
const SLIDE_EASE    = [0.22, 1, 0.36, 1]
const SPRING_EASE   = [0.34, 1.56, 0.64, 1]

function OpeningScreen({ onDone }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timers = STEP_TIMINGS.map((delay, i) =>
      setTimeout(() => i < 6 ? setStep(i + 1) : onDone(), delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  const isCut       = step >= 4
  const isSnipping  = step >= 4
  const isCelebrate = step >= 5
  const isSplit     = step >= 6

  const slideAnim   = isSplit ? '100%'  : '0%'
  const slideDur    = isSplit ? 1.4     : (step === 1 ? 1.5 : 0)
  const slideEase   = isSplit ? SPLIT_EASE : SLIDE_EASE

  const moonAnim   = isCelebrate ? { y:[0,-18,0,-12,0], rotate:[0,-8,8,-4,4,0] } : { y:[0,-7,0] }
  const starAnim   = isCelebrate ? { y:[0,-18,0,-12,0], rotate:[0,8,-8,4,-4,0]  } : { y:[0,-9,0] }
  const celebTrans  = { duration:0.9, ease:'easeInOut', repeat:2 }
  const floatTrans  = (d) => ({ duration:d, repeat:Infinity, ease:'easeInOut' })
  const scaleTrans  = isCelebrate ? { duration:0.8, repeat:2 } : { duration:2, repeat:Infinity }
  const hintText    = step < 3 ? '✦  under the starry night sky  ✦' : step < 4 ? '✦  ready to open?  ✦' : '✦  happy birthday, my star!  ✦'

  return (
    <div style={styles.openingRoot}>
      {/* LEFT PANEL - Moon */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isSplit ? '-100%' : '0%' }}
        transition={{ duration: slideDur, ease: slideEase }}
        style={styles.leftPanel}
      >
        {LEFT_DECO.map((p, i) => (
          <motion.div key={i} style={{ position:'absolute', top:p.t, left:p.l, fontSize:16, opacity:0.65 }}
            animate={{ y:[0,-8,0], opacity:[0.3,0.9,0.3], scale:[0.9,1.2,0.9] }}
            transition={{ duration:2+i*0.4, repeat:Infinity, delay:i*0.3 }}>✨</motion.div>
        ))}
        <motion.div style={styles.charWrap}>
          <motion.div animate={moonAnim} transition={isCelebrate ? celebTrans : floatTrans(2)}>
            <MoonSVG size={isCelebrate ? 140 : 124}/>
          </motion.div>
          <motion.p animate={isCelebrate ? { scale:[1,1.15,1,1.1,1] } : { scale:[1,1.04,1] }}
            transition={scaleTrans}
            style={styles.charLabel('#FFD54F')}>
            {isCelebrate ? 'Yay, Star! 🌙' : 'My Moon 🌙'}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* RIGHT PANEL - Star Boy */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isSplit ? '100%' : '0%' }}
        transition={{ duration: slideDur, ease: slideEase }}
        style={styles.rightPanel}
      >
        {RIGHT_DECO.map((p, i) => (
          <motion.div key={i} style={{ position:'absolute', top:p.t, right:p.r, fontSize:15, opacity:0.65 }}
            animate={{ y:[0,-8,0], opacity:[0.3,0.9,0.3], scale:[0.9,1.2,0.9] }}
            transition={{ duration:2+i*0.4, repeat:Infinity, delay:0.5+i*0.3 }}>⭐</motion.div>
        ))}
        <motion.div style={styles.charWrap}>
          <motion.div animate={starAnim} transition={isCelebrate ? celebTrans : floatTrans(2.2)}>
            <StarBoySVG size={isCelebrate ? 132 : 118}/>
          </motion.div>
          <motion.p animate={isCelebrate ? { scale:[1,1.15,1,1.1,1] } : { scale:[1,1.04,1] }}
            transition={isCelebrate ? { duration:0.8, repeat:2 } : { duration:2.2, repeat:Infinity }}
            style={styles.charLabel('#81D4FA')}>
            {isCelebrate ? 'Woohoo! ✨' : 'Little Star ⭐'}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* RIBBON */}
      <AnimatePresence>
        {step >= 1 && step < 6 && (
          <motion.div key="ribbon-strip"
            initial={{ opacity:0, scaleX:0 }} animate={{ opacity:1, scaleX:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.6, ease:SLIDE_EASE }}
            style={styles.ribbonStrip}>
            <Ribbon cut={isCut}/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCISSORS */}
      <AnimatePresence>
        {step >= 3 && step < 6 && (
          <motion.div key="scissors"
            initial={{ opacity:0, scale:0.5, y:60 }} animate={{ opacity:1, scale:1.15, y:0 }} exit={{ opacity:0, scale:0.4, y:-40 }}
            transition={{ duration:0.5, ease:SPRING_EASE }}
            style={styles.scissorsWrap}>
            <ScissorsSVG snipped={isSnipping}/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONFETTI */}
      {isCut && (
        <div style={styles.confettiAnchor}>
          <ConfettiBurst active/>
        </div>
      )}

      {/* FLASH */}
      <AnimatePresence>
        {step === 4 && (
          <motion.div key="flash" initial={{ opacity:0.9 }} animate={{ opacity:0 }} transition={{ duration:0.5 }} style={styles.flash}/>
        )}
      </AnimatePresence>

      {/* CENTER LINE */}
      {!isSplit && <div style={styles.centerLine}/>}

      {/* HINT */}
      {step < 6 && (
        <div style={styles.hintWrap}>
          <motion.p animate={PULSE_ANIM} transition={{ duration:1.6, repeat:Infinity }} style={styles.hintText}>
            {hintText}
          </motion.p>
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────
   MUSIC PLAYER  (memo)
───────────────────────────────────── */
const MusicPlayer = memo(function MusicPlayer({ audioRef }) {
  const [muted,   setMuted]   = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.25
    const onPlay  = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    audio.addEventListener('play',  onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('play',  onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [audioRef])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(m => !m)
  }, [audioRef])

  return (
    <motion.button
      onClick={toggle}
      initial={{ opacity:0, scale:0.7 }}
      animate={{ opacity:1, scale:1 }}
      transition={{ delay:0.8, type:'spring', stiffness:260, damping:20 }}
      whileHover={{ scale:1.12 }}
      whileTap={{ scale:0.92 }}
      title={muted ? 'Unmute music' : 'Mute music'}
      style={styles.musicBtn}
    >
      {muted ? '🔇' : '🎵'}
      {!muted && playing && (
        <motion.span
          animate={{ scale:[1,1.5,1], opacity:[0.6,0,0.6] }}
          transition={{ duration:2, repeat:Infinity, ease:'easeOut' }}
          style={styles.musicRing}
        />
      )}
    </motion.button>
  )
})

/* ─────────────────────────────────────
   HEART BURST  (memo, pre-computed pieces)
───────────────────────────────────── */
const HeartBurst = memo(function HeartBurst({ active }) {
  if (!active) return null
  return (
    <div style={styles.heartBurstWrap}>
      {HEART_PIECES.map(({ i, rad, dist, emoji }) => (
        <motion.div key={i}
          initial={{ opacity:1, x:0, y:0, scale:1 }}
          animate={{ opacity:0, x:Math.cos(rad)*dist, y:Math.sin(rad)*dist-20, scale:0.3 }}
          transition={{ duration:0.85+(i%3)*0.2, ease:'easeOut' }}
          style={styles.heartPiece}>
          {emoji}
        </motion.div>
      ))}
    </div>
  )
})

/* ─────────────────────────────────────
   ENVELOPE SVG  (memo)
───────────────────────────────────── */
const EnvelopeSVG = memo(function EnvelopeSVG({ onTap }) {
  const [hovered, setHovered] = useState(false)

  const onEnter = useCallback(() => setHovered(true),  [])
  const onLeave = useCallback(() => setHovered(false), [])

  const filter = hovered
    ? 'drop-shadow(0 14px 42px rgba(183,110,255,0.55))'
    : 'drop-shadow(0 8px 28px rgba(183,110,255,0.35))'

  return (
    <motion.div
      onClick={onTap}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      animate={{ y:[0,-12,0] }}
      transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
      whileHover={{ scale:1.04 }}
      whileTap={{ scale:0.95 }}
      style={{ cursor:'pointer', userSelect:'none', filter, transition:'filter 0.2s' }}
    >
      <svg width="260" height="200" viewBox="0 0 260 200">
        <defs>
          <linearGradient id="eBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#1E234A"/><stop offset="100%" stopColor="#121634"/></linearGradient>
          <linearGradient id="eFlap" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2E2A66"/><stop offset="100%" stopColor="#1A1C44"/></linearGradient>
          <linearGradient id="eSeal" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFE082"/><stop offset="50%" stopColor="#FFB300"/><stop offset="100%" stopColor="#FF8F00"/></linearGradient>
        </defs>
        <rect x="10" y="60" width="240" height="130" rx="14" fill="url(#eBody)" stroke="rgba(129,212,250,0.5)" strokeWidth="1.8"/>
        <polygon points="10,190 130,130 250,190" fill="#15193B" stroke="rgba(129,212,250,0.4)" strokeWidth="1.2"/>
        <polygon points="10,60 10,190 100,125" fill="#181D43" stroke="rgba(129,212,250,0.3)" strokeWidth="1"/>
        <polygon points="250,60 250,190 160,125" fill="#181D43" stroke="rgba(129,212,250,0.3)" strokeWidth="1"/>
        <polygon points="10,60 250,60 130,138" fill="url(#eFlap)" stroke="rgba(129,212,250,0.5)" strokeWidth="1.5"/>
        <line x1="40" y1="160" x2="90" y2="160" stroke="rgba(129,212,250,0.3)" strokeWidth="1" strokeDasharray="3,3"/>
        <line x1="170" y1="160" x2="220" y2="160" stroke="rgba(129,212,250,0.3)" strokeWidth="1" strokeDasharray="3,3"/>
        <circle cx="130" cy="120" r="30" fill="rgba(255,224,130,0.2)" stroke="rgba(255,224,130,0.6)" strokeWidth="1"/>
        <circle cx="130" cy="120" r="26" fill="url(#eSeal)" opacity="0.95"/>
        <circle cx="130" cy="120" r="21" fill="url(#eSeal)"/>
        <g opacity="0.35">
          <ellipse cx="130" cy="105" rx="4" ry="7" fill="white"/>
          <ellipse cx="144" cy="114" rx="4" ry="7" fill="white" transform="rotate(72,144,114)"/>
          <ellipse cx="139" cy="131" rx="4" ry="7" fill="white" transform="rotate(144,139,131)"/>
          <ellipse cx="121" cy="131" rx="4" ry="7" fill="white" transform="rotate(216,121,131)"/>
          <ellipse cx="116" cy="114" rx="4" ry="7" fill="white" transform="rotate(288,116,114)"/>
        </g>
        <text x="130" y="126" textAnchor="middle" fontSize="17" fill="#422500" opacity="0.95">⭐</text>
      </svg>
    </motion.div>
  )
})

/* ─────────────────────────────────────
   OPENING PHASE  (memo)
───────────────────────────────────── */
const OpeningPhase = memo(function OpeningPhase() {
  return (
    <motion.div key="opening" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={styles.openingPhaseWrap}>
      <HeartBurst active/>
      <motion.div
        animate={{ rotate:[0,-15,15,-8,8,-3,0], scale:[1,1.2,0.92,1.12,1,1.05,1], y:[0,-10,0,-6,0,-3,0] }}
        transition={{ duration:1.0, ease:'easeInOut' }}
        style={styles.openingEmoji}>
        💌
      </motion.div>
      <motion.p animate={{ opacity:[0.2,1,0.2] }} transition={{ duration:0.65, repeat:Infinity, ease:'easeInOut' }}
        style={styles.openingText}>
        Opening with love...
      </motion.p>
    </motion.div>
  )
})

/* ─────────────────────────────────────
   LETTER  (memo)
───────────────────────────────────── */
const UnfoldingLetter = memo(function UnfoldingLetter({ onNext }) {
  return (
    <div style={styles.letterWrap}>
      <motion.div initial={{ scaleY:0, opacity:0 }} animate={{ scaleY:1, opacity:1 }}
        transition={{ duration:0.7, ease:SLIDE_EASE, delay:0.1 }}
        style={{ transformOrigin:'top', width:'100%' }}>
        <div style={styles.letterCard}>
          {/* lined paper background */}
          <div style={styles.letterLines}/>
          {/* HEADER */}
          <div style={styles.letterHeader}>
            <div style={styles.letterHeaderDeco}>⭐</div>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }} style={styles.letterSubtitle}>
              ✦ &nbsp; A Letter Under The Stars &nbsp; ✦
            </motion.p>
            <motion.h2 initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.0 }} style={styles.letterTitle}>
              ☆ Happy Birthday RaguKutty ♡
            </motion.h2>
            <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ delay:1.15, duration:0.6 }} style={styles.letterDivider}/>
          </div>
          {/* BODY */}
          <div style={styles.letterBody}>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.3 }} style={styles.letterBodyText}>
              {`I'm so glad that I got to know someone like you. You may not know how much you mean to me, but you'll always have a special place in my heart. 🤍

I wish I could be there to care for you, but for now, I'll keep praying that God always protects you and keeps you happy.

Study well, eat well, take care of yourself, and keep chasing your dreams. ✨

Stay the same kind hearted person you are. Always keep smiling! ♡`}
            </motion.p>
            <motion.div initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ delay:1.8, duration:0.7 }} style={styles.letterMidDivider}/>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:2.1 }} style={styles.letterSign}>
              <p style={styles.letterSignText}>Always with love,</p>
              <p style={styles.letterSignName}>Neela ☆</p>
              <svg viewBox="0 0 140 12" width="140" height="12" style={{ display:'block', marginLeft:'auto', marginTop:2 }}>
                <path d="M4 8 Q40 2 80 8 Q110 12 136 6" stroke="#81D4FA" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
              </svg>
            </motion.div>
          </div>
          {/* FOOTER */}
          <div style={styles.letterFooter}>
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:2.4 }} style={styles.letterFooterText}>
              ✦ &nbsp; 🌙⭐ Always Under The Same Sky ⭐🌙 &nbsp; ✦
            </motion.p>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:2.7 }}
        onClick={onNext}
        whileHover={{ scale:1.06, boxShadow:'0 8px 36px rgba(129,212,250,0.55)' }}
        whileTap={{ scale:0.96 }}
        style={styles.nextBtn}>
        Step into the Garden 🌸
      </motion.button>

      <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:2.9 }} style={styles.awaitsText}>
        ✨ A magical starry world awaits ✨
      </motion.p>
    </div>
  )
})

/* ─────────────────────────────────────
   SHARED STYLE OBJECTS  (module-level → never recreated)
───────────────────────────────────── */
const styles = {
  /* OpeningScreen */
  openingRoot:   { position:'fixed', inset:0, zIndex:100, display:'flex', overflow:'hidden' },
  leftPanel:     { width:'50%', height:'100%', position:'relative', background:'radial-gradient(ellipse at 80% 50%, #1a103c 0%, #0d0628 55%, #050212 100%)', display:'flex', flexDirection:'column', alignItems:'flex-end', justifyContent:'center', paddingRight:24, gap:12, borderRight:'1.5px solid rgba(183,110,255,0.4)', boxShadow:'inset -10px 0 30px rgba(0,0,0,0.5)' },
  rightPanel:    { width:'50%', height:'100%', position:'relative', background:'radial-gradient(ellipse at 20% 50%, #151b47 0%, #0b1033 55%, #050212 100%)', display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'center', paddingLeft:24, gap:12, borderLeft:'1.5px solid rgba(129,212,250,0.4)', boxShadow:'inset 10px 0 30px rgba(0,0,0,0.5)' },
  charWrap:      { display:'flex', flexDirection:'column', alignItems:'center', gap:6 },
  charLabel:     (color) => ({ fontFamily:"'Dancing Script',cursive", fontSize:23, color, fontWeight:700, whiteSpace:'nowrap', textShadow:`0 2px 10px ${color}55` }),
  ribbonStrip:   { position:'absolute', top:'50%', left:0, right:0, transform:'translateY(-50%)', zIndex:10, padding:'0 16px' },
  ribbonWrap:    { position:'relative', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', height:32 },
  ribbonLeft:    { position:'absolute', right:'50%', width:'42%', height:22, background:'linear-gradient(90deg,#7C4DFF,#B388FF)', borderRadius:'4px 0 0 4px', boxShadow:'0 3px 14px rgba(124,77,255,0.6)', display:'flex', alignItems:'center', paddingLeft:10 },
  ribbonRight:   { position:'absolute', left:'50%', width:'42%', height:22, background:'linear-gradient(90deg,#B388FF,#4FC3F7)', borderRadius:'0 4px 4px 0', boxShadow:'0 3px 14px rgba(79,195,247,0.6)', display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:10 },
  ribbonLine:    { width:'100%', height:2, background:'rgba(255,255,255,0.6)', borderRadius:2 },
  ribbonBow:     { position:'relative', zIndex:2, fontSize:26 },
  scissorsWrap:  { position:'absolute', top:'calc(50% - 52px)', left:'50%', transform:'translateX(-50%)', zIndex:20, filter:'drop-shadow(0 4px 18px rgba(0,0,0,0.5))' },
  scissorOrigin: { transformOrigin:'18px 26px' },
  confettiAnchor:{ position:'absolute', top:'50%', left:'50%', zIndex:30, pointerEvents:'none' },
  confettiBurstWrap: { position:'absolute', top:'50%', left:'50%', pointerEvents:'none', zIndex:60 },
  flash:         { position:'absolute', inset:0, background:'white', zIndex:25, pointerEvents:'none' },
  centerLine:    { position:'absolute', top:0, bottom:0, left:'50%', width:2, background:'linear-gradient(180deg,transparent,rgba(183,110,255,0.7),rgba(129,212,250,0.7),transparent)', transform:'translateX(-50%)', zIndex:5, pointerEvents:'none' },
  hintWrap:      { position:'absolute', bottom:28, left:0, right:0, textAlign:'center', zIndex:30, pointerEvents:'none' },
  hintText:      { fontFamily:"'Josefin Sans',sans-serif", fontWeight:300, fontSize:12, letterSpacing:'0.24em', textTransform:'uppercase', color:'rgba(224,208,255,0.85)', textShadow:'0 0 10px rgba(183,110,255,0.6)' },
  /* MusicPlayer */
  musicBtn:      { position:'fixed', bottom:24, right:24, zIndex:200, width:48, height:48, borderRadius:'50%', border:'1.5px solid rgba(183,110,255,0.6)', background:'rgba(10,5,30,0.75)', backdropFilter:'blur(8px)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 4px 20px rgba(183,110,255,0.35)' },
  musicRing:     { position:'absolute', inset:-4, borderRadius:'50%', border:'1.5px solid #B76EFF', pointerEvents:'none' },
  /* HeartBurst */
  heartBurstWrap: { position:'absolute', top:'50%', left:'50%', pointerEvents:'none' },
  heartPiece:     { position:'absolute', fontSize:22, top:-11, left:-11 },
  /* OpeningPhase */
  openingPhaseWrap: { display:'flex', flexDirection:'column', alignItems:'center', gap:20, position:'relative' },
  openingEmoji:     { fontSize:90, filter:'drop-shadow(0 8px 28px rgba(183,110,255,0.5))' },
  openingText:      { fontFamily:"'Sacramento',cursive", fontSize:36, color:'#B76EFF' },
  /* Letter */
  letterWrap:       { width:'100%', maxWidth:440, display:'flex', flexDirection:'column', alignItems:'center', gap:22, padding:'4px 4px 28px' },
  letterCard:       { background:'radial-gradient(ellipse at 50% 0%, #171b3e 0%, #0d1029 60%, #080918 100%)', borderRadius:18, border:'1.5px solid rgba(129,212,250,0.4)', overflow:'hidden', position:'relative', boxShadow:'0 8px 32px rgba(0,0,0,0.6),0 0 40px rgba(129,212,250,0.15)' },
  letterLines:      { position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'repeating-linear-gradient(transparent,transparent 31px,rgba(129,212,250,0.06) 31px,rgba(129,212,250,0.06) 32px)', backgroundPositionY:60 },
  letterHeader:     { background:'linear-gradient(135deg,rgba(26,16,60,0.9),rgba(21,27,71,0.9))', padding:'22px 24px 18px', borderBottom:'1.5px solid rgba(129,212,250,0.3)', position:'relative', overflow:'hidden' },
  letterHeaderDeco: { position:'absolute', right:-10, top:-10, fontSize:90, opacity:0.1, lineHeight:1, userSelect:'none', pointerEvents:'none' },
  letterSubtitle:   { fontFamily:"'Josefin Sans',sans-serif", fontWeight:300, fontSize:11, letterSpacing:'0.24em', textTransform:'uppercase', color:'#81D4FA', marginBottom:10, textAlign:'center' },
  letterTitle:      { fontFamily:"'Dancing Script',cursive", fontWeight:700, fontSize:'clamp(30px,7vw,40px)', color:'#FFE082', textAlign:'center', lineHeight:1.3, marginBottom:6, textShadow:'0 0 16px rgba(255,224,130,0.4)' },
  letterDivider:    { height:1.5, background:'linear-gradient(90deg,transparent,#81D4FA,#B388FF,#FFE082,transparent)', margin:'6px 0', transformOrigin:'left' },
  letterBody:       { padding:'24px 26px 20px 28px' },
  letterBodyText:   { fontFamily:"'Cormorant Garamond',serif", fontSize:18, color:'#E0E7FF', lineHeight:2.0, marginBottom:20, whiteSpace:'pre-wrap' },
  letterMidDivider: { height:1.5, background:'linear-gradient(90deg,transparent,rgba(129,212,250,0.4),transparent)', margin:'18px 0', transformOrigin:'left' },
  letterSign:       { textAlign:'right' },
  letterSignText:   { fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:16, color:'#B0BEC5', marginBottom:4 },
  letterSignName:   { fontFamily:"'Sacramento',cursive", fontSize:38, color:'#81D4FA', lineHeight:1.2, textShadow:'0 0 12px rgba(129,212,250,0.5)' },
  letterFooter:     { background:'linear-gradient(135deg,rgba(15,19,48,0.95),rgba(26,16,60,0.95))', padding:'10px 24px', borderTop:'1.5px solid rgba(129,212,250,0.25)', display:'flex', justifyContent:'center' },
  letterFooterText: { fontFamily:"'Josefin Sans',sans-serif", fontWeight:300, fontSize:10.5, letterSpacing:'0.22em', textTransform:'uppercase', color:'#81D4FA', opacity:0.85, textAlign:'center' },
  nextBtn:          { background:'linear-gradient(135deg,#7C4DFF,#00B0FF)', color:'#fff', border:'none', borderRadius:100, padding:'14px 40px', fontFamily:"'Josefin Sans',sans-serif", fontWeight:400, fontSize:13, letterSpacing:'0.18em', textTransform:'uppercase', cursor:'pointer', boxShadow:'0 4px 24px rgba(0,176,255,0.45)' },
  awaitsText:       { fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:15, color:'rgba(129,212,250,0.7)' },
  /* Root page */
  pageRoot:         { position:'relative', minHeight:'100svh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'radial-gradient(ellipse at 50% 20%, #1c1547 0%, #0d0928 50%, #050212 100%)', overflow:'hidden' },
  pageContent:      { width:'100%', position:'relative', zIndex:10 },
  pageInner:        { position:'relative', zIndex:10, width:'100%', display:'flex', flexDirection:'column', alignItems:'center', padding:'28px 16px' },
  sealedWrap:       { display:'flex', flexDirection:'column', alignItems:'center', gap:20, textAlign:'center', padding:'0 12px' },
  sealedTitle:      { fontFamily:"'Sacramento',cursive", fontSize:'clamp(46px,11vw,74px)', color:'#FFE082', textShadow:'0 0 24px rgba(255,224,130,0.45), 0 0 8px rgba(129,212,250,0.3)', lineHeight:1.2 },
  sealedSub:        { fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:19, color:'#81D4FA', fontWeight:600 },
  sealedHint:       { fontFamily:"'Josefin Sans',sans-serif", fontWeight:300, fontSize:12, letterSpacing:'0.2em', color:'#B388FF' },
}

/* ═══════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════ */

export default function EnvelopePage({ onNext }) {
  const [showOpening, setShowOpening] = useState(true)
  const [phase, setPhase] = useState('sealed')
  const { startMusic } = useAudio()

  const handleOpeningDone = useCallback(() => setShowOpening(false), [])

  const handleSealTap = useCallback(() => {
    if (phase !== 'sealed') return
    startMusic()
    setPhase('opening')
    setTimeout(() => setPhase('letter'), 1300)
  }, [phase, startMusic])

  /* memoize floating decorations so they don't re-render on phase changes */
  const floatingDeco = useMemo(() => (
    <>
      {FLOATING_ITEMS.map((item, i) => (
        <motion.div key={i}
          style={{ position:'absolute', left:item.x, top:item.y, fontSize:item.size, pointerEvents:'none', userSelect:'none' }}
          animate={FLOAT_ANIM}
          transition={{ duration:3.5+i*0.3, delay:item.delay, repeat:Infinity, ease:'easeInOut' }}>
          {item.emoji}
        </motion.div>
      ))}
      {SPARKLE_POSITIONS.map((pos, i) => (
        <motion.div key={i}
          style={{ position:'absolute', ...pos, width:8, height:8, borderRadius:'50%', background:i%2===0?'#FF6B9D':'#B76EFF', pointerEvents:'none' }}
          animate={SPARKLE_ANIM}
          transition={{ duration:1.8+i*0.3, delay:i*0.25, repeat:Infinity }}/>
      ))}
    </>
  ), []) // empty deps — positions/emojis never change

  return (
    <div style={styles.pageRoot}>
      <AnimatePresence>
        {showOpening && (
          <motion.div key="opening-screen" initial={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.6 }}
            style={{ position:'fixed', inset:0, zIndex:100 }}>
            <OpeningScreen onDone={handleOpeningDone}/>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity:0 }}
        animate={{ opacity: showOpening ? 0 : 1 }}
        transition={{ duration:0.8, delay:0.3 }}
        style={styles.pageContent}
      >
        {floatingDeco}

        <div style={styles.pageInner}>
          <AnimatePresence mode="wait">

            {phase === 'sealed' && (
              <motion.div key="sealed"
                initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:1.1 }}
                transition={{ duration:0.6, ease:SPRING_EASE }}
                style={styles.sealedWrap}>
                <motion.h1 initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} style={styles.sealedTitle}>
                  Something magical<br/>awaits you
                </motion.h1>
                <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }} style={styles.sealedSub}>
                  A letter sealed with love, just for you
                </motion.p>
                <motion.div initial={{ opacity:0, scale:0.85, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
                  transition={{ delay:0.9, type:'spring', stiffness:220, damping:20 }}>
                  <EnvelopeSVG onTap={handleSealTap}/>
                </motion.div>
                <motion.p animate={PULSE_ANIM} transition={{ delay:1.6, duration:2.2, repeat:Infinity }} style={styles.sealedHint}>
                  ✨ Tap the wax seal to open ✨
                </motion.p>
              </motion.div>
            )}

            {phase === 'opening' && <OpeningPhase key="opening"/>}

            {phase === 'letter' && (
              <motion.div key="letter" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.5 }}
                style={{ width:'100%', display:'flex', justifyContent:'center' }}>
                <UnfoldingLetter onNext={onNext}/>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}