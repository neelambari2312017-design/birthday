import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MUSIC } from '../config'
const musicSrc = MUSIC.finale

/* ── MUSIC PLAYER ── */
function MusicPlayer() {
  return null
}

const MESSAGES = [
  { emoji: '🌟', color: '#FFE082', bg: 'rgba(23, 27, 62, 0.85)', message: 'You are the most wonderful person I know, RaguKutty. Your calmness, your kind heart, everything about you.', from: '— 💖' },
  { emoji: '🌙', color: '#81D4FA', bg: 'rgba(23, 27, 62, 0.85)', message: 'Thank you for every little moment, the ones I carry quietly in my heart and will keep forever.', from: '— ⭐' },
  { emoji: '✨', color: '#FFD54F', bg: 'rgba(23, 27, 62, 0.85)', message: 'May this year bring you joy, health, peaceful days, and every dream you have been working towards.', from: '— 🤍' },
  { emoji: '💫', color: '#B388FF', bg: 'rgba(23, 27, 62, 0.85)', message: 'Please take good care of yourself, star. Eat well, rest well, and keep smiling. I will always pray for you.', from: '— 🙏' },
]

const FLOATING = ['⭐','✨','🌙','💫','🌟','🤍','🎈','💖']

/* ── CONFETTI ── */
function ConfettiParticle({ x, y, color, shape, vx, vy, delay }) {
  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{ left: x, top: y, zIndex: 9999 }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
      animate={{ x: vx, y: vy, scale: 0, opacity: 0, rotate: 720 }}
      transition={{ duration: 1.8 + Math.random() * 0.8, delay, ease: 'easeOut' }}
    >
      {shape === 'circle'
        ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
        : <div style={{ width: 10, height: 8, background: color, borderRadius: 2 }} />}
    </motion.div>
  )
}

function useConfetti() {
  const [particles, setParticles] = useState([])
  const fire = (originX = window.innerWidth / 2, originY = window.innerHeight / 2) => {
    const colors = ['#FF6B9D','#B76EFF','#FFD93D','#5EC87A','#74B9FF','#FF7B6B','#FFB3CC']
    const newParticles = Array.from({ length: 80 }, (_, i) => ({
      id: Date.now() + i,
      x: originX, y: originY,
      color: colors[i % colors.length],
      shape: i % 3 === 0 ? 'circle' : 'rect',
      vx: (Math.random() - 0.5) * 400,
      vy: -(Math.random() * 300 + 100),
      delay: Math.random() * 0.2,
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 3000)
  }
  return { particles, fire }
}

/* ── HEART BURST ── */
function HeartBurst({ active, onDone }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onAnimationComplete={onDone}
        >
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * 360
            const dist = 80 + Math.random() * 60
            return (
              <motion.div key={i} className="absolute text-3xl"
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((angle * Math.PI) / 180) * dist,
                  y: Math.sin((angle * Math.PI) / 180) * dist,
                  scale: [0, 1.4, 0.8, 0], opacity: [1, 1, 1, 0],
                }}
                transition={{ duration: 1.2, delay: i * 0.03, ease: 'easeOut' }}
              >
                {i % 3 === 0 ? '💖' : i % 3 === 1 ? '✨' : '🌸'}
              </motion.div>
            )
          })}
          <motion.div className="text-6xl"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.8, 1], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          >💖</motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── CANDLE FLAME ── */
function CandleFlame({ blown }) {
  if (blown) return null
  return (
    <motion.div
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      {/* Glow */}
      <motion.div
        style={{
          position: 'absolute', top: -6, width: 28, height: 28, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,200,50,0.6) 0%, transparent 70%)',
          filter: 'blur(4px)',
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Outer flame */}
      <motion.div
        style={{
          width: 14, height: 22,
          background: 'linear-gradient(to top, #FF6B00, #FFD700, #FFFDE0)',
          borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%',
          position: 'relative', zIndex: 2,
        }}
        animate={{ scaleX: [1, 1.15, 0.9, 1], scaleY: [1, 0.95, 1.05, 1], rotate: [-3, 3, -3] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Inner blue core */}
      <div style={{
        position: 'absolute', bottom: 2, width: 5, height: 8,
        background: 'linear-gradient(to top, #74B9FF, #B3D9FF)',
        borderRadius: '50% 50% 30% 30% / 60% 60% 40% 40%',
        zIndex: 3,
      }} />
    </motion.div>
  )
}

/* ── SMOKE PUFF ── */
function SmokePuff({ x, delay }) {
  return (
    <motion.div
      style={{
        position: 'absolute', left: x, bottom: 30,
        width: 10, height: 10, borderRadius: '50%',
        background: 'rgba(200,200,200,0.7)',
        filter: 'blur(3px)',
      }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{ opacity: [0, 0.8, 0], scale: [0, 2.5, 4], y: -60 }}
      transition={{ duration: 1.4, delay, ease: 'easeOut' }}
    />
  )
}

/* ── BIRTHDAY CAKE ── */
const NUM_CANDLES = 5
const CANDLE_COLORS = ['#FF6B9D','#B76EFF','#FFD93D','#5EC87A','#FF7B6B']

function BirthdayCake({ onBlow }) {
  const [blownCandles, setBlownCandles] = useState([])
  const [smokeKeys, setSmokeKeys] = useState([])
  const [allBlown, setAllBlown] = useState(false)
  const [blowing, setBlowing] = useState(false)
  const blownRef = useRef([])

  const blowCandle = (idx) => {
    if (blownRef.current.includes(idx)) return
    blownRef.current = [...blownRef.current, idx]
    setBlownCandles([...blownRef.current])
    // Add smoke puff
    setSmokeKeys(k => [...k, { id: Date.now(), idx }])

    if (blownRef.current.length === NUM_CANDLES) {
      setAllBlown(true)
      setTimeout(() => onBlow(), 600)
    }
  }

  const handleBlowAll = () => {
    if (allBlown || blowing) return
    setBlowing(true)
    // Blow candles one by one with stagger
    Array.from({ length: NUM_CANDLES }).forEach((_, i) => {
      setTimeout(() => blowCandle(i), i * 180)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {/* Candles row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 0, position: 'relative', zIndex: 2 }}>
        {Array.from({ length: NUM_CANDLES }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Smoke */}
            {smokeKeys.filter(s => s.idx === i).map(s => (
              <SmokePuff key={s.id} x={0} delay={0} />
            ))}
            {/* Flame */}
            <CandleFlame blown={blownCandles.includes(i)} />
            {/* Candle body */}
            <motion.div
              style={{
                width: 12, height: 36,
                background: `linear-gradient(to bottom, ${CANDLE_COLORS[i]}, ${CANDLE_COLORS[i]}99)`,
                borderRadius: '3px 3px 2px 2px',
                marginTop: 2,
                boxShadow: `0 0 8px ${CANDLE_COLORS[i]}66`,
              }}
              animate={!blownCandles.includes(i) ? { boxShadow: [`0 0 8px ${CANDLE_COLORS[i]}44`, `0 0 18px ${CANDLE_COLORS[i]}99`, `0 0 8px ${CANDLE_COLORS[i]}44`] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </div>
        ))}
      </div>

      {/* Cake layers */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -2 }}>
        {/* Frosting drips on top tier */}
        <div style={{ position: 'relative', width: 170 }}>
          <div style={{
            width: '100%', height: 14,
            background: 'white',
            borderRadius: '8px 8px 0 0',
            position: 'relative', overflow: 'hidden',
          }}>
            {[10,30,55,80,105,130,150].map((x, i) => (
              <div key={i} style={{
                position: 'absolute', left: x, top: 6,
                width: 10, height: 14 + (i % 3) * 4,
                background: 'white',
                borderRadius: '0 0 6px 6px',
              }} />
            ))}
          </div>

          {/* Top tier */}
          <div style={{
            width: '100%', height: 54,
            background: 'linear-gradient(135deg, #FF6B9D, #FF8FB3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Polka dots */}
            {[20,50,80,110,140,35,65,95,125].map((x, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: x, top: [10,25,10,25,10,35,15,35,15][i],
                width: 8, height: 8, borderRadius: '50%',
                background: 'rgba(255,255,255,0.35)',
              }} />
            ))}
            <span style={{ fontFamily: "'Dancing Script', cursive", color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>
              Happy Birthday Precious!
            </span>
          </div>
        </div>

        {/* Middle tier separator frosting */}
        <div style={{
          width: 200, height: 12,
          background: 'white',
          position: 'relative', overflow: 'visible',
        }}>
          {[8,28,48,68,88,108,128,148,168].map((x, i) => (
            <div key={i} style={{
              position: 'absolute', left: x, top: 6,
              width: 12, height: 14 + (i % 2) * 5,
              background: 'white',
              borderRadius: '0 0 6px 6px',
            }} />
          ))}
        </div>

        {/* Bottom tier */}
        <div style={{
          width: 200, height: 64,
          background: 'linear-gradient(135deg, #B76EFF, #D4A8FF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          borderRadius: '0 0 4px 4px',
        }}>
          {/* Stripes */}
          {[20,50,80,110,140,170].map((x, i) => (
            <div key={i} style={{
              position: 'absolute', left: x, top: 0, bottom: 0,
              width: 12, background: 'rgba(255,255,255,0.12)',
              transform: 'skewX(-8deg)',
            }} />
          ))}
          {/* Stars decoration */}
          {['✨','🐷','✨'].map((s, i) => (
            <span key={i} style={{ fontSize: 18, position: 'absolute', left: [20, 88, 160][i], top: [20, 28, 18][i] }}>{s}</span>
          ))}
        </div>

        {/* Cake board / base */}
        <div style={{
          width: 224, height: 14,
          background: 'linear-gradient(135deg, #FFD93D, #FFA500)',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
        }} />
      </div>

      {/* Blow button */}
      <AnimatePresence mode="wait">
        {!allBlown ? (
          <motion.button
            key="blow-btn"
            onClick={handleBlowAll}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            style={{
              marginTop: 22,
              padding: '12px 32px',
              borderRadius: 50,
              background: 'linear-gradient(135deg,#FF6B9D,#B76EFF)',
              border: 'none', cursor: 'pointer',
              fontFamily: "'Quicksand', sans-serif",
              fontWeight: 700, fontSize: 15,
              color: 'white',
              boxShadow: '0 6px 24px rgba(183,110,255,0.5)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{ fontSize: 20 }}>🌬️</span>
            {blowing ? 'Blowing...' : 'Blow the candles!'}
          </motion.button>
        ) : (
          <motion.div
            key="wish-msg"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            style={{
              marginTop: 22, textAlign: 'center',
              fontFamily: "'Dancing Script', cursive",
              fontSize: 22, color: '#FFD93D',
              filter: 'drop-shadow(0 0 10px rgba(255,217,61,0.7))',
            }}
          >
            🌼 Make a wish! 🌼
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── MAIN ── */
export default function FinalePage({ onPrev }) {
  const { particles, fire } = useConfetti()
  const [heartActive, setHeartActive] = useState(false)
  const [tapCount, setTapCount] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => fire(window.innerWidth / 2, window.innerHeight / 3), 600)
    const t2 = setTimeout(() => fire(window.innerWidth * 0.2, window.innerHeight * 0.4), 1200)
    const t3 = setTimeout(() => fire(window.innerWidth * 0.8, window.innerHeight * 0.4), 1500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const handleHeartTap = (e) => {
    setTapCount(c => c + 1)
    setHeartActive(true)
    fire(e.clientX, e.clientY)
  }

  const handleCakeBlow = () => {
    fire(window.innerWidth / 2, window.innerHeight / 2)
    setTimeout(() => fire(window.innerWidth * 0.25, window.innerHeight * 0.4), 300)
    setTimeout(() => fire(window.innerWidth * 0.75, window.innerHeight * 0.4), 500)
    setHeartActive(true)
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #2d1260 0%, #1a0535 35%, #3D0D2B 70%, #1a0535 100%)' }}
    >
      <MusicPlayer />
      {particles.map(p => <ConfettiParticle key={p.id} {...p} />)}
      <HeartBurst active={heartActive} onDone={() => setHeartActive(false)} />

      {/* Stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div key={i} className="absolute rounded-full pointer-events-none"
          style={{
            width: Math.random() * 3 + 1, height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            background: 'white',
          }}
          animate={{ opacity: [0.1, 1, 0.1], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2 + Math.random() * 3, delay: Math.random() * 5, repeat: Infinity }}
        />
      ))}

      {/* Floating emojis */}
      {FLOATING.map((f, i) => (
        <motion.div key={i} className="absolute pointer-events-none select-none text-2xl opacity-30"
          style={{ left: `${(i * 11) % 90 + 5}%`, top: `${(i * 17) % 80 + 5}%` }}
          animate={{ y: [0, -18, 0], rotate: [-5, 5, -5], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3 + i * 0.3, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
        >{f}</motion.div>
      ))}

      <div className="max-w-sm mx-auto px-4 py-12 relative z-10">

        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            style={{
              fontFamily: "'Sacramento', cursive",
              fontSize: 'clamp(52px, 14vw, 76px)',
              lineHeight: 1.1,
              marginBottom: 8,
              background: 'linear-gradient(135deg, #FFF9D2 0%, #FFE082 45%, #81D4FA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 20px rgba(255,224,130,0.5))',
            }}
          >
            Happy Birthday!
          </h1>
          <p
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: 'clamp(26px, 7vw, 34px)',
              color: '#FFE082',
              fontWeight: 700,
              textShadow: '0 0 14px rgba(255,224,130,0.45), 0 0 28px rgba(129,212,250,0.3)',
              margin: '4px 0 0',
            }}
          >
            To my RaguKutty 🤍⭐
          </p>
        </motion.div>

        {/* ── INTERACTIVE CAKE ── */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 18 }}
        >
          <BirthdayCake onBlow={handleCakeBlow} />
        </motion.div>

        {/* Love messages */}
        <div className="space-y-5 mb-10">
          {MESSAGES.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl p-5 shadow-xl"
              style={{ background: msg.bg, border: `1.5px solid ${msg.color}30` }}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl flex-shrink-0">{msg.emoji}</span>
                <div>
                  <p className="font-dancing text-lg text-slate-100 leading-relaxed mb-2">
                    "{msg.message}"
                  </p>
                  <p className="font-quicksand text-xs font-bold text-right" style={{ color: msg.color }}>
                    {msg.from}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Big interactive heart */}
        <motion.div
          className="flex flex-col items-center gap-4 mb-10"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-dancing text-xl text-pink-200">Tap the heart with love 💖</p>
          <motion.button
            onClick={handleHeartTap}
            className="text-7xl cursor-pointer select-none border-none bg-transparent"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,157,0.6))' }}
          >💖</motion.button>
          {tapCount > 0 && (
            <motion.p
              key={tapCount}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-quicksand text-sm font-bold text-pink-300"
            >
              {tapCount === 1 ? '💕 Sending love!' : tapCount < 5 ? `✨ ${tapCount}x the love!` : `😍 So much love! (${tapCount}x)`}
            </motion.p>
          )}
        </motion.div>

        {/* Final poem */}
        <motion.div
          className="rounded-3xl p-6 text-center mb-10"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,107,157,0.3)', backdropFilter: 'blur(10px)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-4xl block mb-4">🌹</span>
          <p className="font-dancing text-2xl text-pink-200 leading-relaxed mb-2">"May every birthday candle</p>
          <p className="font-dancing text-2xl text-purple-200 leading-relaxed mb-2">carry a wish that comes true,</p>
          <p className="font-dancing text-2xl text-yellow-200 leading-relaxed mb-2">wishing you the best</p>
          <p className="font-dancing text-3xl text-pink-300 font-bold leading-relaxed">you will shine brighter" take care, star 💖</p>
        </motion.div>

        {/* Replay confetti */}
        <motion.div
          className="flex flex-col gap-4 items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={() => { fire(window.innerWidth / 2, window.innerHeight / 3); setHeartActive(true) }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
            className="font-quicksand font-bold text-sm px-8 py-3 rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,107,157,0.5)', color: '#FFB3CC' }}
          >
            🎊 More confetti!
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12 pb-8"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-dancing text-xl text-yellow-200 mb-1">Made with infinite love</p>
          <p className="font-quicksand text-sm text-sky-300 font-semibold">Just for you, RaguKutty 💖 Happy Birthday! 🎂</p>
          <p className="font-dancing text-lg text-purple-200 mt-2">Always with love, Neela ☆</p>
          <div className="flex justify-center gap-3 mt-4 text-2xl">
            {['🌙','⭐','✨','🤍','💫'].map((e, i) => (
              <motion.span key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}>
                {e}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Back button */}
      <button
        onClick={onPrev}
        className="fixed bottom-6 left-6 z-50 font-quicksand font-bold text-sm px-5 py-2.5 rounded-full shadow-lg"
        style={{ background: 'rgba(255,255,255,0.15)', color: '#FFB3CC', border: '1.5px solid rgba(255,107,157,0.4)', backdropFilter: 'blur(8px)' }}
      >← Our Story</button>
    </div>
  )
}