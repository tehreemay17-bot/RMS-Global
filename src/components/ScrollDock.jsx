import { useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import useActiveSection from '../hooks/useActiveSection'
import useSmoothScrollPref, { setSmoothScroll } from '../hooks/useScrollPrefs'
import { scrollToId, scrollToY } from '../lib/scroll'
import './ScrollDock.css'

const STOPS = [
  { id: 'hero', label: 'Intro' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Where we work' },
  { id: 'events', label: 'Events' },
  { id: 'artists', label: 'Artists' },
  { id: 'brands', label: 'Brands' },
  { id: 'book', label: 'Book a meeting' },
  { id: 'contact', label: 'Contact' },
]
const IDS = STOPS.map((s) => s.id)

// Scroll controls: section dots + progress on the right (desktop), and a back-to-top ring button (all sizes).
export default function ScrollDock({ ready }) {
  const active = useActiveSection(IDS)
  const smoothOn = useSmoothScrollPref()
  const [shown, setShown] = useState(false)
  const [pct, setPct] = useState(0)

  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

  useMotionValueEvent(scrollY, 'change', (y) => setShown(y > window.innerHeight * 0.55))
  useMotionValueEvent(scrollYProgress, 'change', (v) => setPct(Math.round(Math.min(1, Math.max(0, v)) * 100)))

  const visible = ready && shown

  return (
    <>
      <motion.aside
        className="dock"
        aria-label="Scroll controls"
        initial={{ opacity: 0, x: 24 }}
        animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
      >
        <nav aria-label="Page sections" className="dock-nav">
          <span className="dock-track" aria-hidden="true">
            <motion.span className="dock-fill" style={{ scaleY: progress }} />
          </span>
          <ul>
            {STOPS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`dock-dot ${active === s.id ? 'is-active' : ''}`}
                  onClick={() => scrollToId(s.id)}
                  aria-label={`Go to ${s.label}`}
                  aria-current={active === s.id ? 'true' : undefined}
                >
                  <span className="dock-label label">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <span className="dock-pct label" aria-hidden="true">
          {String(pct).padStart(2, '0')}%
        </span>

        <button
          type="button"
          className={`dock-smooth label ${smoothOn ? 'is-on' : ''}`}
          onClick={() => setSmoothScroll(!smoothOn)}
          aria-pressed={smoothOn}
          title="Toggle smooth, inertial scrolling"
        >
          <span className="dock-smooth-knob" aria-hidden="true" />
          Smooth
        </button>
      </motion.aside>

      <motion.button
        type="button"
        className="to-top"
        onClick={() => scrollToY(0, { duration: 2.2 })}
        aria-label="Back to top"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
        whileHover={{ y: -3 }}
      >
        <svg viewBox="0 0 52 52" className="to-top-ring" aria-hidden="true">
          <circle cx="26" cy="26" r="24" className="to-top-bg" />
          <motion.circle cx="26" cy="26" r="24" className="to-top-fg" style={{ pathLength: progress }} />
        </svg>
        <svg viewBox="0 0 24 24" className="to-top-arrow" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5M6 11l6-6 6 6" />
        </svg>
      </motion.button>
    </>
  )
}
