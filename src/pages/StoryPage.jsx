import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MUSIC } from '../config'
import { STORY, STORY_TITLE, STORY_SUBTITLE } from '../story'

function Para({ text }) {
  const bold = text.startsWith('**') && text.endsWith('**')
  const italic = !bold && text.startsWith('*') && text.endsWith('*')
  const clean = bold ? text.slice(2, -2) : italic ? text.slice(1, -1) : text
  return (
    <p style={{
      margin: '0 0 14px', lineHeight: 1.85,
      fontFamily: bold || italic ? "'Dancing Script',cursive" : "'Quicksand',sans-serif",
      fontWeight: bold ? 700 : 500, fontStyle: italic ? 'italic' : 'normal',
      fontSize: bold || italic ? 20 : 15.5, color: bold ? '#FFE082' : italic ? '#81D4FA' : '#D1D5DB',
    }}>{clean}</p>
  )
}

export default function StoryPage({ onNext, onPrev }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #1e1347 0%, #0d0726 45%, #050212 100%)' }}>
      {['⭐', '✨', '🌙', '💫', '🤍'].map((d, i) => (
        <motion.div key={i} aria-hidden
          style={{ position: 'fixed', left: `${[6, 88, 14, 80, 50][i]}%`, top: `${[12, 30, 62, 78, 90][i]}%`,
            fontSize: 22, opacity: 0.35, pointerEvents: 'none' }}
          animate={{ y: [0, -14, 0], rotate: [-6, 6, -6] }}
          transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}>{d}</motion.div>
      ))}

      <div style={{ maxWidth: 440, margin: '0 auto', padding: '64px 18px 130px', position: 'relative' }}>
        <motion.div style={{ textAlign: 'center', marginBottom: 28 }}
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 style={{ fontFamily: "'Pacifico',cursive", fontSize: 'clamp(34px,9vw,46px)', color: '#FFE082',
            textShadow: '0 0 20px rgba(255,224,130,0.5)', margin: '0 0 10px' }}>{STORY_TITLE}</h1>
          <p style={{ fontFamily: "'Dancing Script',cursive", fontSize: 19, color: '#81D4FA', margin: 0 }}>{STORY_SUBTITLE}</p>
        </motion.div>

        {STORY.map((c, i) => (
          <motion.section key={i}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: 'rgba(23, 27, 62, 0.85)', backdropFilter: 'blur(12px)', borderRadius: 22,
              padding: '22px 20px 10px', marginBottom: 22, border: '1.5px solid rgba(129,212,250,0.35)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(129,212,250,0.1)' }}>
            <p style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: '0.14em',
              color: '#FFE082', margin: '0 0 4px', textTransform: 'uppercase' }}>Chapter {i + 1}</p>
            <h2 style={{ fontFamily: "'Dancing Script',cursive", fontSize: 26, color: '#81D4FA', margin: '0 0 14px', lineHeight: 1.2 }}>
              {c.title}
            </h2>
            {c.body.split(/\n\s*\n/).map((p, j) => <Para key={j} text={p.trim()} />)}
          </motion.section>
        ))}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
          <motion.button onClick={() => { window.scrollTo({ top: 0, behavior: 'instant' }); onNext() }}
            whileHover={{ scale: 1.06, boxShadow: '0 8px 30px rgba(129,212,250,0.5)' }} whileTap={{ scale: 0.96 }}
            style={{ background: 'linear-gradient(135deg,#7C4DFF,#00B0FF)', color: 'white', border: 'none', borderRadius: 100,
              padding: '16px 38px', fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 17, cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(0,176,255,0.45)' }}>
            ⭐ One last surprise →
          </motion.button>
        </div>
      </div>

      <button onClick={onPrev} style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 50, fontFamily: "'Quicksand',sans-serif",
        fontWeight: 700, fontSize: 13, padding: '10px 18px', borderRadius: 100, background: 'rgba(20,25,55,0.85)',
        color: '#81D4FA', border: '1.5px solid rgba(129,212,250,0.4)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
        ← Memories
      </button>
    </div>
  )
}
