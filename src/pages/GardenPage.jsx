import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MUSIC, PHOTOS } from '../config'
const musicSrc = MUSIC.garden
const [photo1, photo2, photo3, photo4, photo5, photo6, photo7, photo8] =
  [5, 4, 1, 3, 6, 7, 2, 0].map(i => PHOTOS[i % PHOTOS.length].src)


/* ─────────────────────────────────────
   CONSTANTS  (module-level → never recreated)
───────────────────────────────────── */
const LANTERNS = [
  { photo: photo1, note: 'My star ⭐',   color: '#B76EFF', glowColor: '#B76EFF', x: '8%',  startY: '88%', size: 150, delay: 0,   duration: 18, swayAmp: 22 },
  { photo: photo2, note: 'Birthday magic ✨',      color: '#FF6B9D', glowColor: '#FF6B9D', x: '50%', startY: '92%', size: 200, delay: 2.5, duration: 22, swayAmp: 18 },
  { photo: photo3, note: 'Ooty roads 🌿',           color: '#FFD93D', glowColor: '#FFD93D', x: '15%', startY: '90%', size: 90,  delay: 1,   duration: 20, swayAmp: 28 },
  { photo: photo4, note: 'Sweet sips 🥤',       color: '#74B9FF', glowColor: '#74B9FF', x: '10%', startY: '94%', size: 100, delay: 3.5, duration: 24, swayAmp: 20 },
  { photo: photo5, note: 'Little bows 🎀',    color: '#FF7B6B', glowColor: '#FF7B6B', x: '50%', startY: '89%', size: 85,  delay: 0.8, duration: 19, swayAmp: 24 },
  { photo: photo6, note: 'Our names 💚',  color: '#5EC87A', glowColor: '#5EC87A', x: '60%', startY: '93%', size: 100, delay: 4,   duration: 21, swayAmp: 16 },
  { photo: photo7, note: 'Chocolate evenings 🍫',        color: '#FFB3CC', glowColor: '#FFB3CC', x: '30%', startY: '95%', size: 75,  delay: 5.5, duration: 23, swayAmp: 20 },
  { photo: photo8, note: 'The video call 📱', color: '#A8E6CF', glowColor: '#A8E6CF', x: '25%', startY: '96%', size: 78,  delay: 1.8, duration: 26, swayAmp: 30 },
]

const WISHES = [
  { emoji: '🌹', color: '#FF6B9D', stem: '#5EC87A', wish: 'You make every ordinary day feel extraordinary, RaguKutty.',   from: '💖' },
  { emoji: '🌻', color: '#FFD93D', stem: '#6BBF52', wish: 'Your smile heals me, every single time. Always keep smiling! ♡', from: '☺️' },
  { emoji: '🌺', color: '#FF7B6B', stem: '#5EC87A', wish: 'You will always have a special place in my heart, my star.',      from: '🤍' },
  { emoji: '🌸', color: '#81D4FA', stem: '#4A8F52', wish: 'Even across silent days, I quietly pray for your happiness.',    from: '✨' },
  { emoji: '🌼', color: '#FFE082', stem: '#5EC87A', wish: 'Stay the same kind hearted person you are. I admire you so much.', from: '⭐' },
  { emoji: '🌷', color: '#B388FF', stem: '#6BBF52', wish: 'May God protect you and make all your dreams come true.',        from: '🙏' },
]

const BUTTERFLIES = [
  { color: '#FF6B9D', x: '15%', delay: 0   },
  { color: '#B76EFF', x: '75%', delay: 1.2 },
  { color: '#FFD93D', x: '45%', delay: 0.6 },
  { color: '#5EC87A', x: '85%', delay: 1.8 },
]

const MUSHROOM_ROW = ['🍄', '🌿', '🍄', '🌿', '🍄']

/* pre-seeded random values so Math.random() never runs in render */
const STAR_DATA = Array.from({ length: 50 }, () => ({
  w:     Math.random() * 2.5 + 1,
  left:  Math.random() * 100,
  top:   Math.random() * 55,
  dur:   2 + Math.random() * 3,
  delay: Math.random() * 4,
}))

const FIREFLY_DATA = Array.from({ length: 18 }, () => ({
  left: `${Math.random() * 90 + 5}%`,
  top:  `${Math.random() * 60}%`,
}))

const GRASS_DATA = Array.from({ length: 12 }, (_, i) => ({
  h:     18 + Math.random() * 14,
  dur:   2 + i * 0.2,
  rot:   [-(2 + i % 4), (2 + i % 3), -(2 + i % 4)],
}))

const SHOOTING_STARS = Array.from({ length: 5 }, (_, i) => ({
  top:      `${8 + i * 10}%`,
  delay:    i * 4.5 + 1,
  duration: 1.2 + i * 0.3,
  repeatDelay: 12 + i * 3,
}))

/* shared / reused animation objects */
const GLOW_ANIM  = { opacity: [0.18, 0.35, 0.18], scaleX: [1, 1.15, 1] }
const GLOW_TRANS = { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
const BFLY_ANIM  = { x:[0,30,-20,15,0], y:[0,-30,-60,-40,0], rotate:[0,8,-6,4,0] }
const MOON_ANIM  = {
  filter: [
    'drop-shadow(0 0 18px rgba(255,217,61,0.45))',
    'drop-shadow(0 0 36px rgba(255,217,61,0.75))',
    'drop-shadow(0 0 18px rgba(255,217,61,0.45))',
  ],
}
const MOON_TRANS = { duration: 4, repeat: Infinity, ease: 'easeInOut' }

/* shared style objects */
const S = {
  musicBtn:  { position:'fixed', bottom:24, right:24, zIndex:100, width:48, height:48, borderRadius:'50%', border:'1.5px solid rgba(183,110,255,0.6)', background:'rgba(10,5,30,0.75)', backdropFilter:'blur(8px)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, boxShadow:'0 4px 20px rgba(183,110,255,0.35)' },
  musicRing: { position:'absolute', inset:-4, borderRadius:'50%', border:'1.5px solid #B76EFF', pointerEvents:'none' },
  overlay:   { position:'fixed', inset:0, zIndex:100, background:'rgba(10,5,30,0.75)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', backdropFilter:'blur(4px)' },
  lanternLayer: { position:'absolute', inset:0, pointerEvents:'none', zIndex:5, overflow:'hidden' },
  groundBg:  { background:'linear-gradient(180deg,#0d2b1a 0%,#1a4a2e 20%,#2d6b3e 50%,#3d8a4e 75%,#4a9e5c 100%)' },
  nextBtn:   { background:'linear-gradient(135deg,#B76EFF,#FF6B9D)' },
  backBtn:   { color:'#B76EFF', border:'1.5px solid #B76EFF', background:'rgba(10,5,30,0.7)' },
}

/* ═══════════════════════════════════════════════════════
   LANTERN SVG SHAPE  (memo — pure SVG, no state)
═══════════════════════════════════════════════════════ */
const LanternShape = memo(function LanternShape({ color, size }) {
  const w    = size
  const h    = size * 1.35
  const id   = color.replace('#', '')
  const lgId = `lg-${id}`
  const lcId = `lc-${id}`

  return (
    <svg width={w} height={h} viewBox="0 0 80 108" xmlns="http://www.w3.org/2000/svg" style={{ display:'block' }}>
      <defs>
        <radialGradient id={lgId} cx="38%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#fff"  stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.12"/>
        </radialGradient>
        <clipPath id={lcId}>
          <path d="M40 12 C15 12 8 30 8 50 C8 72 18 90 40 95 C62 90 72 72 72 50 C72 30 65 12 40 12Z"/>
        </clipPath>
      </defs>

      {/* Top crown */}
      <rect x="30" y="0"  width="20" height="7" rx="3" fill={color} opacity="0.9"/>
      <rect x="34" y="6"  width="12" height="6" rx="2" fill={color} opacity="0.85"/>
      <line x1="34" y1="6" x2="28" y2="13" stroke={color} strokeWidth="1.5" opacity="0.7"/>
      <line x1="46" y1="6" x2="52" y2="13" stroke={color} strokeWidth="1.5" opacity="0.7"/>
      <line x1="40" y1="6" x2="40" y2="13" stroke={color} strokeWidth="1.5" opacity="0.7"/>

      {/* Body */}
      <path d="M40 13 C16 13 8 31 8 51 C8 73 19 92 40 97 C61 92 72 73 72 51 C72 31 64 13 40 13Z"
        fill={color} opacity="0.18" stroke={color} strokeWidth="1.2" strokeOpacity="0.55"/>

      <circle cx="40" cy="52" r="24" fill="transparent" clipPath={`url(#${lcId})`}/>

      <path d="M40 13 C16 13 8 31 8 51 C8 73 19 92 40 97 C61 92 72 73 72 51 C72 31 64 13 40 13Z"
        fill={`url(#${lgId})`}/>

      {[-16,-8,0,8,16].map((offset, i) => (
        <line key={i} x1={40+offset} y1="17" x2={40+offset} y2="93"
          stroke={color} strokeWidth="0.8" strokeOpacity="0.35"/>
      ))}

      {[30,52,72].map((y, i) => (
        <ellipse key={i} cx="40" cy={y} rx={i===1?31:26} ry="3.5"
          fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4"/>
      ))}

      <line x1="40" y1="96" x2="40" y2="105" stroke={color} strokeWidth="1.5" strokeOpacity="0.7"/>
      <circle cx="40" cy="107" r="2" fill={color} opacity="0.8"/>
    </svg>
  )
})

/* ═══════════════════════════════════════════════════════
   SINGLE FLOATING LANTERN  (memo)
═══════════════════════════════════════════════════════ */
const FloatingLantern = memo(function FloatingLantern({ data, skyHeight }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), data.delay * 1000)
    return () => clearTimeout(t)
  }, [data.delay])

  /* pre-compute animation values once */
  const yAnim      = useMemo(() => [0, -(skyHeight * 1.1)], [skyHeight])
  const xAnim      = useMemo(() => [0, data.swayAmp, -data.swayAmp*0.7, data.swayAmp*0.5, -data.swayAmp*0.3, 0], [data.swayAmp])
  const repeatOpts = useMemo(() => ({ duration: data.duration, ease: 'linear', repeat: Infinity, repeatDelay: data.delay * 0.3 }), [data.duration, data.delay])
  const xTrans     = useMemo(() => ({ ...repeatOpts, ease: 'easeInOut' }), [repeatOpts])
  const opTrans    = useMemo(() => ({ ...repeatOpts, ease: 'easeInOut', times: [0,0.05,0.5,0.85,0.95,1] }), [repeatOpts])

  const clipId  = `photoClip-${data.color.replace('#','')}-${data.note.replace(/\s/g,'')}`
  const labelStyle = useMemo(() => ({
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Dancing Script, cursive',
    fontSize: Math.max(9, data.size * 0.13),
    color: data.glowColor,
    textShadow: `0 0 8px ${data.glowColor}99, 0 1px 3px rgba(0,0,0,0.8)`,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: data.size * 1.4,
    marginLeft: '50%',
    transform: 'translateX(-50%)',
  }), [data.size, data.glowColor])

  const glowStyle = useMemo(() => ({
    position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
    width: data.size * 0.9, height: data.size * 0.25,
    borderRadius: '50%', background: data.glowColor,
    opacity: 0.18, filter: 'blur(10px)', pointerEvents: 'none',
  }), [data.size, data.glowColor])

  if (!visible) return null

  return (
    <motion.div
      style={{ position:'absolute', left:data.x, bottom:0, width:data.size, zIndex:4 }}
      initial={{ y:0, opacity:0 }}
      animate={{ y: yAnim, x: xAnim, opacity:[0,1,1,1,0.85,0] }}
      transition={{ y: repeatOpts, x: xTrans, opacity: opTrans }}
    >
      <motion.div style={glowStyle} animate={GLOW_ANIM} transition={GLOW_TRANS}/>

      <div style={{ position:'relative' }}>
        <LanternShape color={data.glowColor} size={data.size}/>
        <svg width={data.size} height={data.size*1.35} viewBox="0 0 80 108"
          style={{ position:'absolute', top:0, left:0, pointerEvents:'none' }}>
          <defs>
            <clipPath id={clipId}><circle cx="40" cy="52" r="23"/></clipPath>
          </defs>
          <image href={data.photo} x="17" y="29" width="46" height="46"
            preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`}/>
          <circle cx="40" cy="52" r="23" fill="none" stroke={data.glowColor} strokeWidth="2" strokeOpacity="0.5"/>
        </svg>
      </div>

      <div style={labelStyle}>{data.note}</div>
    </motion.div>
  )
})

/* ═══════════════════════════════════════════════════════
   MUSIC PLAYER  (memo)
═══════════════════════════════════════════════════════ */
const MusicPlayer = memo(function MusicPlayer() {
  return null
})

/* ═══════════════════════════════════════════════════════
   BUTTERFLY  (memo)
═══════════════════════════════════════════════════════ */
const Butterfly = memo(function Butterfly({ color, style, delay = 0 }) {
  const trans = useMemo(() => ({ duration:6, delay, repeat:Infinity, ease:'easeInOut' }), [delay])
  return (
    <motion.div className="absolute pointer-events-none" style={style} animate={BFLY_ANIM} transition={trans}>
      <svg width="36" height="28" viewBox="0 0 36 28">
        <ellipse cx="10" cy="12" rx="10" ry="8" fill={color} fillOpacity="0.85">
          <animateTransform attributeName="transform" type="rotate" values="0 18 14;-25 18 14;0 18 14" dur="0.4s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="26" cy="12" rx="10" ry="8" fill={color} fillOpacity="0.85">
          <animateTransform attributeName="transform" type="rotate" values="0 18 14;25 18 14;0 18 14" dur="0.4s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="18" cy="14" rx="2.5" ry="7" fill="#3D2530"/>
        <line x1="18" y1="7" x2="13" y2="2" stroke="#3D2530" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="18" y1="7" x2="23" y2="2" stroke="#3D2530" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="13" cy="2" r="1.5" fill={color}/>
        <circle cx="23" cy="2" r="1.5" fill={color}/>
      </svg>
    </motion.div>
  )
})

/* ═══════════════════════════════════════════════════════
   FLOWER  (memo)
═══════════════════════════════════════════════════════ */
const Flower = memo(function Flower({ data, index, onOpen }) {
  const [bloomed, setBloomed] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setBloomed(true) },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleClick = useCallback(() => onOpen(data), [onOpen, data])

  const springTrans  = useMemo(() => ({ type:'spring', stiffness:200, damping:14, delay:index*0.15 }), [index])
  const stemAnim     = useMemo(() => bloomed ? { height:50+index*8, opacity:1 } : {}, [bloomed, index])
  const stemTrans    = useMemo(() => ({ delay:index*0.15+0.3, duration:0.6 }), [index])
  const dotStyle     = useMemo(() => ({ background: data.color }), [data.color])
  const emojiFilter  = useMemo(() => ({ filter:`drop-shadow(0 4px 8px ${data.color}55)` }), [data.color])
  const stemStyle    = useMemo(() => ({ width:4, background:data.stem }), [data.stem])

  return (
    <div ref={ref} className="flex flex-col items-center relative">
      <motion.div
        className="cursor-pointer relative"
        initial={{ scale:0, rotate:-20, opacity:0 }}
        animate={bloomed ? { scale:1, rotate:0, opacity:1 } : {}}
        transition={springTrans}
        whileHover={{ scale:1.15 }}
        whileTap={{ scale:0.9 }}
        onClick={handleClick}
      >
        <div className="text-5xl sm:text-6xl select-none" style={emojiFilter}>{data.emoji}</div>
        {bloomed && (
          <motion.div
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={dotStyle}
            animate={{ scale:[1,1.3,1] }}
            transition={{ duration:1.5, repeat:Infinity }}
          >!</motion.div>
        )}
      </motion.div>
      <motion.div
        className="rounded-full"
        style={stemStyle}
        initial={{ height:0, opacity:0 }}
        animate={stemAnim}
        transition={stemTrans}
      />
    </div>
  )
})

/* ═══════════════════════════════════════════════════════
   FIREFLY  (memo)
═══════════════════════════════════════════════════════ */
const Firefly = memo(function Firefly({ style, dur, delay }) {
  const trans = useMemo(() => ({ duration:dur, repeat:Infinity, delay }), [dur, delay])
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
      style={{ ...style, background:'#FFD93D' }}
      animate={{ opacity:[0,1,0], scale:[0.5,1,0.5] }}
      transition={trans}
    />
  )
})

/* ═══════════════════════════════════════════════════════
   WISH MODAL  (memo)
═══════════════════════════════════════════════════════ */
const WishModal = memo(function WishModal({ wish, onClose }) {
  if (!wish) return null

  const cardStyle = useMemo(() => ({
    background: 'rgba(255,255,255,0.97)', borderRadius:24,
    border:`2.5px solid ${wish.color}`, padding:'32px 28px 28px',
    maxWidth:340, width:'100%',
    boxShadow:`0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${wish.color}44`,
    position:'relative', textAlign:'center',
  }), [wish.color])

  const dividerStyle = useMemo(() => ({
    height:1.5,
    background:`linear-gradient(90deg,transparent,${wish.color},transparent)`,
    marginBottom:14,
  }), [wish.color])

  const fromStyle = useMemo(() => ({ color:wish.color, fontSize:15 }), [wish.color])

  return (
    <AnimatePresence>
      <motion.div key="overlay"
        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onClose}
        style={S.overlay}
      >
        <motion.div key="card"
          initial={{ opacity:0, scale:0.75, y:40 }}
          animate={{ opacity:1, scale:1, y:0 }}
          exit={{ opacity:0, scale:0.75, y:40 }}
          transition={{ type:'spring', stiffness:280, damping:22 }}
          onClick={e => e.stopPropagation()}
          style={cardStyle}
        >
          <div style={{ fontSize:56, marginBottom:12, lineHeight:1 }}>{wish.emoji}</div>
          <p className="font-dancing" style={{ fontSize:22, color:'#3a1a4a', lineHeight:1.6, marginBottom:16 }}>
            "{wish.wish}"
          </p>
          <div style={dividerStyle}/>
          <p className="font-quicksand font-bold" style={fromStyle}>— {wish.from}</p>
          <button onClick={onClose}
            style={{ position:'absolute', top:14, right:16, background:'none', border:'none', fontSize:20, color:'#aaa', cursor:'pointer', lineHeight:1, padding:4 }}>
            ✕
          </button>
          <p className="font-quicksand" style={{ fontSize:11, color:'#bbb', marginTop:16 }}>Tap outside to close</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
})

/* ═══════════════════════════════════════════════════════
   SHOOTING STARS  (memo — static data, no state)
═══════════════════════════════════════════════════════ */
const ShootingStars = memo(function ShootingStars() {
  return (
    <>
      {SHOOTING_STARS.map((s, i) => (
        <motion.div key={i}
          style={{ position:'absolute', top:s.top, left:'-5%', width:80, height:1.5,
            background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)',
            borderRadius:2, pointerEvents:'none', zIndex:2 }}
          animate={{ x:['0vw','120vw'], opacity:[0,1,1,0] }}
          transition={{ duration:s.duration, delay:s.delay, repeat:Infinity, repeatDelay:s.repeatDelay, ease:'easeIn' }}
        />
      ))}
    </>
  )
})

/* ═══════════════════════════════════════════════════════
   CRESCENT MOON  (memo — no props, no state)
═══════════════════════════════════════════════════════ */
const CrescentMoon = memo(function CrescentMoon() {
  return (
    <motion.div className="absolute" style={{ top:'5%', left:'50%', x:'-50%', zIndex:3 }}
      animate={MOON_ANIM} transition={MOON_TRANS}>
      <svg width="90" height="90" viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="moonGrad" cx="38%" cy="32%" r="62%">
            <stop offset="0%"   stopColor="#FFFDE8"/>
            <stop offset="55%"  stopColor="#FFE87A"/>
            <stop offset="100%" stopColor="#F5C842"/>
          </radialGradient>
          <mask id="crescentMask">
            <rect width="90" height="90" fill="black"/>
            <circle cx="45" cy="45" r="36" fill="white"/>
            <circle cx="63" cy="38" r="30" fill="black"/>
          </mask>
        </defs>
        <circle cx="45" cy="45" r="36" fill="url(#moonGrad)" mask="url(#crescentMask)"/>
        <circle cx="28" cy="54" r="4.5" fill="rgba(190,150,20,0.22)" mask="url(#crescentMask)"/>
        <circle cx="20" cy="38" r="3"   fill="rgba(190,150,20,0.18)" mask="url(#crescentMask)"/>
        <circle cx="35" cy="65" r="3.5" fill="rgba(190,150,20,0.18)" mask="url(#crescentMask)"/>
        <circle cx="14" cy="50" r="2"   fill="rgba(190,150,20,0.15)" mask="url(#crescentMask)"/>
        <circle cx="45" cy="45" r="35" fill="none" stroke="rgba(255,240,130,0.4)" strokeWidth="1.5" mask="url(#crescentMask)"/>
      </svg>
    </motion.div>
  )
})

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function GardenPage({ onNext, onPrev }) {
  const skyRef = useRef(null)
  const [activeWish, setActiveWish] = useState(null)
  const [skyHeight,  setSkyHeight]  = useState(600)

  useEffect(() => {
    const measure = () => { if (skyRef.current) setSkyHeight(skyRef.current.offsetHeight) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const closeWish = useCallback(() => setActiveWish(null), [])

  /* memoize static scene elements so parent re-renders don't rebuild them */
  const stars = useMemo(() => (
    STAR_DATA.map((s, i) => (
      <motion.div key={i} className="absolute rounded-full"
        style={{ width:s.w, height:s.w, left:`${s.left}%`, top:`${s.top}%`, background:'white' }}
        animate={{ opacity:[0.2,1,0.2] }}
        transition={{ duration:s.dur, delay:s.delay, repeat:Infinity }}/>
    ))
  ), [])

  const skyFireflies = useMemo(() => (
    FIREFLY_DATA.slice(0, 10).map((pos, i) => (
      <Firefly key={i} style={pos} dur={2 + (i % 3)} delay={(i * 0.4) % 3}/>
    ))
  ), [])

  const groundFireflies = useMemo(() => (
    FIREFLY_DATA.slice(10).map((pos, i) => (
      <Firefly key={i} style={{ ...pos, top:`${20 + (i * 13) % 80}%` }} dur={2 + (i % 3)} delay={(i * 0.5) % 3}/>
    ))
  ), [])

  const lanterns = useMemo(() => (
    LANTERNS.map((l, i) => <FloatingLantern key={i} data={l} skyHeight={skyHeight}/>)
  ), [skyHeight])

  const butterflies = useMemo(() => (
    BUTTERFLIES.map((b, i) => (
      <Butterfly key={i} color={b.color} delay={b.delay} style={{ left:b.x, top:`${10+i*18}%` }}/>
    ))
  ), [])

  const grass = useMemo(() => (
    GRASS_DATA.map((g, i) => (
      <motion.div key={i} className="rounded-full"
        style={{ width:3, background:'#4a9e5c', height:g.h, transformOrigin:'bottom' }}
        animate={{ rotate:g.rot }}
        transition={{ duration:g.dur, repeat:Infinity, ease:'easeInOut' }}/>
    ))
  ), [])

  const mushrooms = useMemo(() => (
    MUSHROOM_ROW.map((m, i) => (
      <motion.span key={i} style={{ fontSize:24 }}
        animate={{ y:[0,-4,0] }}
        transition={{ duration:2.5, delay:i*0.3, repeat:Infinity, ease:'easeInOut' }}>
        {m}
      </motion.span>
    ))
  ), [])

  return (
    <div className="relative h-screen overflow-hidden">
      <MusicPlayer/>

      <AnimatePresence>
        {activeWish && <WishModal wish={activeWish} onClose={closeWish}/>}
      </AnimatePresence>

      <div className="h-full overflow-y-scroll" style={{ scrollSnapType:'none' }}>

        {/* ── NIGHT SKY ── */}
        <div ref={skyRef} className="relative flex flex-col items-center justify-between pt-16 pb-0 overflow-hidden"
          style={{ minHeight:'100vh', background:'radial-gradient(ellipse at 50% 0%,#2d1260 0%,#1a0535 40%,#0a0f1e 100%)' }}>

          {stars}
          <ShootingStars/>
          <CrescentMoon/>

          <motion.div className="flex flex-col items-center gap-3 mt-24 px-6 text-center z-10"
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
            <h1 className="font-pacifico text-4xl sm:text-5xl text-white"
              style={{ textShadow:'0 0 30px rgba(183,110,255,0.8),2px 2px 0 rgba(0,0,0,0.3)' }}>
              The Secret Garden
            </h1>
            <p className="font-dancing text-xl text-purple-200">
              Where wishes bloom and lanterns carry your memories 🏮
            </p>
            <p className="font-quicksand text-sm text-purple-300 font-semibold mt-2">
              ↓ Scroll to make the garden bloom ↓
            </p>
          </motion.div>

          {skyFireflies}

          <div style={S.lanternLayer}>{lanterns}</div>

          <motion.div className="z-10 text-center px-6 mt-auto mb-6"
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.5 }}>
            <p className="font-dancing text-lg text-yellow-200" style={{ textShadow:'0 0 12px rgba(255,217,61,0.5)' }}>
              🏮 Our memories, floating into forever
            </p>
          </motion.div>

          <div className="w-full h-32 mt-auto" style={{ background:'linear-gradient(to bottom,transparent,#0d2b1a)' }}/>
        </div>

        {/* ── GARDEN GROUND ── */}
        <div style={S.groundBg} className="relative pb-16 pt-8">
          {butterflies}
          {groundFireflies}

          <motion.div className="text-center px-6 mb-12"
            initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}>
            <p className="font-dancing text-2xl text-green-200">Each flower holds a wish, just for you 💫</p>
            <p className="font-quicksand text-sm text-green-300 font-semibold mt-1">Tap any flower to read its wish</p>
          </motion.div>

          {/* Flowers Row 1 */}
          <div className="flex justify-around items-end px-4 mb-4 relative z-10">
            {WISHES.slice(0, 3).map((wish, i) => (
              <Flower key={i} data={wish} index={i} onOpen={setActiveWish}/>
            ))}
          </div>

          <div className="flex justify-around px-2 opacity-60">{grass}</div>

          {/* Flowers Row 2 */}
          <div className="flex justify-around items-end px-6 mt-8 mb-4 relative z-10">
            {WISHES.slice(3).map((wish, i) => (
              <Flower key={i} data={wish} index={i+3} onOpen={setActiveWish}/>
            ))}
          </div>

          <div className="flex justify-around px-8 mt-4">{mushrooms}</div>

          <motion.div className="text-center mt-12 px-6"
            initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <p className="font-dancing text-3xl text-yellow-200 mb-2">You are loved beyond measure 💖</p>
            <p className="font-quicksand text-sm text-green-300 font-semibold">
              Every flower, every firefly, every lantern — all for you.
            </p>
          </motion.div>

          <div className="flex justify-center mt-12">
            <motion.button onClick={onNext}
              whileHover={{ scale:1.06 }} whileTap={{ scale:0.96 }}
              className="font-quicksand font-bold text-white text-lg px-10 py-4 rounded-full shadow-2xl"
              style={S.nextBtn}
              initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
              📸 See the Gallery →
            </motion.button>
          </div>
        </div>
      </div>

      <button onClick={onPrev}
        className="fixed bottom-6 left-6 z-50 font-quicksand font-bold text-sm px-5 py-2.5 rounded-full shadow-lg"
        style={S.backBtn}>
        ← Back
      </button>
    </div>
  )
}