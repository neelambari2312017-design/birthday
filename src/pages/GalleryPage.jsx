import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudio } from '../AudioContext'
import { MUSIC, VOICE, VIDEO, PHOTOS } from '../config'

const musicSrc = MUSIC.gallery
const voiceSrc = VOICE.src

function MusicPlayer() {
  return null
}

/* ─────────────────────────────────────────────────────────
   VOICE NOTE PLAYER
   FIX: use a ref for bgAudio so toggle/seek always have
   the latest audio element — no stale closure problem.
   BG music pauses when voice plays, resumes when it stops.
───────────────────────────────────────────────────────── */
function VoiceNotePlayer({ bgAudioRef }) {
  const audioRef      = useRef(null)
  const [playing,     setPlaying]     = useState(false)
  const [progress,    setProgress]    = useState(0)
  const [duration,    setDuration]    = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const bars = useMemo(() =>
    Array.from({ length: 36 }, (_, i) =>
      18 + Math.sin(i * 0.7) * 10 + Math.sin(i * 1.4) * 6 + (i % 3) * 3
    ), [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => {
      const ct = audio.currentTime
      const d  = audio.duration || 0
      setCurrentTime(ct)
      setProgress(d ? (ct / d) * 100 : 0)
    }
    const onLoad = () => setDuration(audio.duration)
    const onEnd  = () => {
      setPlaying(false)
      setProgress(0)
      setCurrentTime(0)
      // ✅ Resume bg music when voice note ends naturally
      const bg = bgAudioRef.current
      if (bg) bg.muted = false
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoad)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoad)
      audio.removeEventListener('ended', onEnd)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    const bg    = bgAudioRef.current
    if (!audio || !voiceSrc) return

    if (playing) {
      audio.pause()
      setPlaying(false)
      if (bg) bg.muted = false  // unmute bg instantly
    } else {
      if (bg) bg.muted = true   // mute bg instantly — no pause/play race
      audio.play()
        .then(() => setPlaying(true))
        .catch(err => console.warn('Voice play failed:', err))
    }
  }

  const seek = (e) => {
    const audio = audioRef.current
    if (!audio || !duration || !voiceSrc) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = pct * duration
    setCurrentTime(pct * duration)
    setProgress(pct * 100)
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'linear-gradient(135deg,#2d1260,#1a0535)',
        borderRadius: 20,
        padding: '22px 20px',
        boxShadow: '0 8px 32px rgba(183,110,255,0.35)',
        border: '1px solid rgba(183,110,255,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(183,110,255,0.3),transparent)',
        pointerEvents: 'none',
      }}/>

      {voiceSrc && <audio ref={audioRef} src={voiceSrc} preload="metadata" />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg,#FF6B9D,#B76EFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
          boxShadow: '0 4px 12px rgba(183,110,255,0.4)',
        }}>🎙️</div>
        <div>
          <p style={{ fontFamily: "'Dancing Script',cursive", fontSize: 18, color: 'white', lineHeight: 1.2 }}>
            Your voice, my favourite sound 🎙️
          </p>
          <p style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>
            Voice note · {duration ? fmt(duration) : '—:——'}
          </p>
        </div>
      </div>

      {/* Waveform — click to seek */}
      <div
        onClick={seek}
        style={{
          display: 'flex', alignItems: 'center', gap: 2.5,
          height: 44, marginBottom: 14,
          cursor: voiceSrc ? 'pointer' : 'default',
          padding: '0 4px',
        }}
      >
        {bars.map((h, i) => {
          const filled = (i / bars.length) * 100 <= progress
          return (
            <motion.div
              key={i}
              animate={playing ? { scaleY: [1, 1.2 + Math.sin(i) * 0.4, 1] } : { scaleY: 1 }}
              transition={{ duration: 0.5 + i * 0.01, repeat: playing ? Infinity : 0, ease: 'easeInOut' }}
              style={{
                flex: 1, height: h, borderRadius: 3,
                background: filled ? 'linear-gradient(180deg,#FF6B9D,#B76EFF)' : 'rgba(255,255,255,0.18)',
                transformOrigin: 'center', transition: 'background 0.1s', minWidth: 3,
              }}
            />
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <motion.button
          onClick={toggle}
          whileHover={{ scale: voiceSrc ? 1.08 : 1 }}
          whileTap={{ scale: voiceSrc ? 0.94 : 1 }}
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: voiceSrc ? 'linear-gradient(135deg,#FF6B9D,#B76EFF)' : 'rgba(255,255,255,0.15)',
            color: 'white', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: voiceSrc ? 'pointer' : 'not-allowed',
            flexShrink: 0,
            boxShadow: voiceSrc ? '0 4px 16px rgba(183,110,255,0.45)' : 'none',
          }}
        >
          {playing ? '⏸' : '▶'}
        </motion.button>

        <div style={{ flex: 1 }}>
          <div
            onClick={seek}
            style={{
              height: 4, background: 'rgba(255,255,255,0.15)',
              borderRadius: 4, overflow: 'hidden',
              cursor: voiceSrc ? 'pointer' : 'default',
            }}
          >
            <motion.div
              style={{
                height: '100%', borderRadius: 4,
                background: 'linear-gradient(90deg,#FF6B9D,#B76EFF)',
                width: `${progress}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginTop: 5,
            fontFamily: "'Quicksand',sans-serif",
            fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600,
          }}>
            <span>{fmt(currentTime)}</span>
            <span>{duration ? fmt(duration) : '--:--'}</span>
          </div>
        </div>
      </div>

      {!voiceSrc && (
        <p style={{
          fontFamily: "'Quicksand',sans-serif", fontSize: 11,
          color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 10,
        }}>
          Add voice: import voiceSrc from '../assets/voice.mp3'
        </p>
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────
   VIDEO SECTION — plays your video right here.
   Change the file/captions in src/config.js (VIDEO).
───────────────────────────────────────────────────────── */
function VideoSection({ bgAudioRef }) {
  const setBg = (m) => { const bg = bgAudioRef.current; if (bg) bg.muted = m }
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ background: 'rgba(23, 27, 62, 0.85)', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)', border: '1.5px solid rgba(129,212,250,0.35)', backdropFilter: 'blur(10px)' }}
    >
      <div style={{ background: 'linear-gradient(135deg,rgba(30,19,71,0.9),rgba(21,27,71,0.9))', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(129,212,250,0.25)' }}>
        <span style={{ fontSize: 20 }}>🎬</span>
        <p style={{ fontFamily: "'Dancing Script',cursive", fontSize: 18, color: '#FFE082' }}>{VIDEO.title}</p>
      </div>
      <video src={VIDEO.src} controls playsInline preload="metadata"
        onPlay={() => setBg(true)} onPause={() => setBg(false)} onEnded={() => setBg(false)}
        style={{ width: '100%', display: 'block', background: '#080918', maxHeight: 460 }} />
      <p style={{ fontFamily: "'Dancing Script',cursive", fontSize: 16, color: '#81D4FA', textAlign: 'center', padding: '12px 18px' }}>
        {VIDEO.caption}
      </p>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────────────────────── */
function Lightbox({ items, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose, onPrev, onNext])

  if (index === null) return null
  const item = items[index]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        background: 'radial-gradient(ellipse at center, rgba(40,10,70,0.85) 0%, rgba(5,0,15,0.97) 70%)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.5 }}
        style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(183,110,255,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ scale: 0.75, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.75, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', maxWidth: 380 }}
      >
        <div style={{
          background: 'white', borderRadius: 4,
          padding: '10px 10px 48px',
          boxShadow: '0 24px 70px rgba(0,0,0,0.7), 0 0 30px rgba(183,110,255,0.2)',
        }}>
          <div style={{ width: '100%', borderRadius: 2, overflow: 'hidden', background: '#f0e8f8', lineHeight: 0 }}>
            <img
              src={item.src} alt="Memory"
              style={{ width: '100%', height: 'auto', maxHeight: 420, objectFit: 'contain', display: 'block' }}
            />
          </div>
          {item.caption && (
            <p style={{
              fontFamily: "'Dancing Script',cursive",
              fontSize: 20, color: '#555',
              textAlign: 'center', marginTop: 12, lineHeight: 1.3, padding: '0 8px',
            }}>
              {item.caption}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, padding: '0 4px' }}>
          <motion.button onClick={onPrev} whileHover={{ x: -3 }} whileTap={{ scale: 0.93 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 50,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: 'white', fontSize: 13, fontWeight: 600,
              fontFamily: "'Quicksand',sans-serif", cursor: 'pointer',
              backdropFilter: 'blur(6px)',
            }}>
            ← Prev
          </motion.button>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' }}>
              {index + 1} of {items.length}
            </span>
            <div style={{ display: 'flex', gap: 5 }}>
              {items.slice(Math.max(0, index - 3), Math.min(items.length, index + 4)).map((_, i) => {
                const ri = i + Math.max(0, index - 3)
                return (
                  <div key={ri} style={{
                    width: ri === index ? 20 : 5, height: 5, borderRadius: 4,
                    background: ri === index ? 'linear-gradient(90deg,#FFD700,#FF6B9D)' : 'rgba(255,255,255,0.28)',
                    transition: 'all 0.3s',
                  }}/>
                )
              })}
            </div>
          </div>

          <motion.button onClick={onNext} whileHover={{ x: 3 }} whileTap={{ scale: 0.93 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 50,
              background: 'linear-gradient(135deg,#FF6B9D,#B76EFF)',
              border: 'none', color: 'white', fontSize: 13, fontWeight: 600,
              fontFamily: "'Quicksand',sans-serif", cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(183,110,255,0.45)',
            }}>
            Next →
          </motion.button>
        </div>

        <motion.button onClick={onClose} whileTap={{ scale: 0.9 }}
          style={{
            position: 'absolute', top: -15, right: -10,
            width: 36, height: 36, borderRadius: '50%',
            background: 'black',
            border: '1.5px solid rgba(255,255,255,0.35)',
            color: 'white', fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</motion.button>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────────────────
   MASONRY / POLAROID PHOTO GALLERY
───────────────────────────────────────────────────────── */
function MasonryGallery({ photos, onTap }) {
  if (!photos || photos.length === 0) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 16,
      width: '100%',
    }}>
      {photos.map((p, idx) => {
        // slight charming alternating tilt angles for polaroid feel
        const rot = idx % 2 === 0 ? (idx % 4 === 0 ? -2.2 : -1.2) : (idx % 3 === 0 ? 2.5 : 1.5)
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (idx % 4) * 0.1 }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10, boxShadow: '0 16px 36px rgba(129,212,250,0.35)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onTap(idx)}
            style={{
              cursor: 'pointer',
              background: '#FFFFFF',
              borderRadius: 12,
              padding: p.caption ? '10px 10px 14px' : '10px 10px 10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 2px 8px rgba(183,110,255,0.15)',
              transform: `rotate(${rot}deg)`,
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Cute pin or tape on top */}
            <div style={{
              position: 'absolute',
              top: -6,
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: 14,
              opacity: 0.85,
              zIndex: 2,
            }}>
              {idx % 2 === 0 ? '⭐' : '✨'}
            </div>

            {/* Photo frame */}
            <div style={{
              width: '100%',
              aspectRatio: '1 / 1.1',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f0e6ff, #e1f5fe)',
              position: 'relative',
            }}>
              <img
                src={p.src}
                alt={`Memory ${idx + 1}`}
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:28px;">📷</div>`
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Caption only if provided */}
            {p.caption && (
              <p style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: 14,
                color: '#37474F',
                textAlign: 'center',
                marginTop: 10,
                marginBottom: 0,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {p.caption}
              </p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   SECTION DIVIDER
───────────────────────────────────────────────────────── */
function SectionDivider({ label, emoji }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '32px 0 20px' }}
    >
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(183,110,255,0.35))' }}/>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(183,110,255,0.12)',
        border: '1px solid rgba(183,110,255,0.25)',
        borderRadius: 100, padding: '5px 14px',
        fontFamily: "'Quicksand',sans-serif",
        fontWeight: 700, fontSize: 12,
        color: '#B76EFF', letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        <span>{emoji}</span> {label}
      </div>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(183,110,255,0.35),transparent)' }}/>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function GalleryPage({ onNext, onPrev }) {
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const { audioRef } = useAudio()

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [])

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    onNext()
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1e1347 0%, #0d0726 45%, #050212 100%)' }}
    >

      {['✨','⭐','🌙','💫','🌟','🤍'].map((d, i) => (
        <motion.div key={i}
          style={{ position:'absolute', left:`${[5,88,12,80,45,70][i]}%`, top:`${[8,5,50,55,80,25][i]}%`, fontSize:22, pointerEvents:'none', opacity:0.3, userSelect:'none' }}
          animate={{ y:[0,-12,0], rotate:[-5,5,-5] }}
          transition={{ duration:3+i*0.4, delay:i*0.3, repeat:Infinity, ease:'easeInOut' }}
        >{d}</motion.div>
      ))}

      <div style={{ maxWidth: 420, margin: '0 auto', padding: '40px 16px 120px' }}>

        {/* HEADER */}
        <motion.div
          style={{ textAlign:'center', marginBottom: 32 }}
          initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
          transition={{ duration:0.7 }}
        >
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6,
            background:'rgba(255,224,130,0.15)', color:'#FFE082',
            border: '1px solid rgba(255,224,130,0.3)',
            fontFamily:"'Quicksand',sans-serif", fontWeight:700,
            fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase',
            padding:'6px 16px', borderRadius:100, marginBottom:14,
          }}>📸 Memories Under The Stars</div>
          <h1 style={{
            fontFamily:"'Pacifico',cursive",
            fontSize:'clamp(34px,9vw,48px)',
            color:'#FFE082',
            textShadow:'0 0 20px rgba(255,224,130,0.4)',
            marginBottom:8, lineHeight:1.2,
          }}>Our Memories</h1>
          <p style={{ fontFamily:"'Dancing Script',cursive", fontSize:20, color:'#81D4FA' }}>
            Every moment, glowing in the stars 🌙⭐
          </p>
          <p style={{ fontFamily:"'Quicksand',sans-serif", fontSize:13, color:'rgba(224,231,255,0.7)', fontWeight:600, marginTop:6 }}>
            Tap any photo to view it ✨
          </p>
        </motion.div>

        <div style={{ height:1, background:'linear-gradient(90deg,transparent,#81D4FA,transparent)', marginBottom:20, opacity:0.4 }}/>

        {/* MASONRY GALLERY */}
        <SectionDivider label="Photos" emoji="📷" />
        <MasonryGallery photos={PHOTOS} onTap={setLightboxIdx} />

        {/* VOICE NOTE */}
        <SectionDivider label="Your voice" emoji="🎙️" />
        {/* ✅ Pass audioRef directly — no bgStarted boolean needed */}
        <VoiceNotePlayer bgAudioRef={audioRef} />

        {/* VIDEO */}
        <SectionDivider label="Special Moments" emoji="🎬" />
        {/* ✅ Pass audioRef directly */}
        <VideoSection bgAudioRef={audioRef} />

        {/* NEXT BUTTON */}
        <motion.div
          style={{ display:'flex', justifyContent:'center', marginTop:48 }}
          initial={{ opacity:0, y:20 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
        >
          <motion.button
            onClick={handleNext}
            whileHover={{ scale:1.06, boxShadow:'0 10px 36px rgba(129,212,250,0.5)' }}
            whileTap={{ scale:0.96 }}
            style={{
              background:'linear-gradient(135deg,#7C4DFF,#00B0FF)',
              color:'white', border:'none', borderRadius:100,
              padding:'16px 40px',
              fontFamily:"'Quicksand',sans-serif", fontWeight:700,
              fontSize:17, cursor:'pointer',
              boxShadow:'0 4px 20px rgba(0,176,255,0.4)',
            }}
          >
            ⭐ Read our story →
          </motion.button>
        </motion.div>
      </div>

      {/* Back button */}
      <button onClick={onPrev}
        style={{
          position:'fixed', bottom:24, left:24, zIndex:50,
          fontFamily:"'Quicksand',sans-serif", fontWeight:700,
          fontSize:13, padding:'10px 18px', borderRadius:100,
          background:'rgba(20,25,55,0.85)', color:'#81D4FA',
          border:'1.5px solid rgba(129,212,250,0.4)',
          boxShadow:'0 4px 16px rgba(0,0,0,0.4)',
          cursor:'pointer', backdropFilter:'blur(8px)',
        }}
      >← Garden</button>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox
            items={PHOTOS}
            index={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
            onPrev={() => setLightboxIdx(i => (i + PHOTOS.length - 1) % PHOTOS.length)}
            onNext={() => setLightboxIdx(i => (i + 1) % PHOTOS.length)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}