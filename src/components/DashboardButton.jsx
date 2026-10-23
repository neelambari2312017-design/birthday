import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DASHBOARD } from '../config'

const pill = {
  display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none',
  background: 'linear-gradient(135deg,#FF6B9D,#B76EFF)', color: 'white', border: 'none',
  borderRadius: 100, padding: '9px 16px', cursor: 'pointer',
  fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 13,
  boxShadow: '0 4px 18px rgba(183,110,255,0.45)',
}

export default function DashboardButton() {
  const [note, setNote] = useState(false)
  const hasUrl = DASHBOARD.url.trim() !== ''

  const soon = () => { setNote(true); setTimeout(() => setNote(false), 2500) }

  return (
    <div style={{ position: 'fixed', top: 14, right: 14, zIndex: 60, textAlign: 'right' }}>
      <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
        {hasUrl ? (
          <a href={DASHBOARD.url} target="_blank" rel="noopener noreferrer" style={pill}>{DASHBOARD.label}</a>
        ) : (
          <button onClick={soon} style={pill}>{DASHBOARD.label}</button>
        )}
      </motion.div>
      <AnimatePresence>
        {note && (
          <motion.p
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ marginTop: 8, padding: '6px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.92)',
              color: '#B76EFF', fontFamily: "'Quicksand',sans-serif", fontSize: 12, fontWeight: 600 }}
          >
            Coming soon 💌
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
