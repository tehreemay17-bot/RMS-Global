import { useEffect, useState } from 'react'
import { animate, motion } from 'motion/react'
import './Preloader.css'

// Short cinematic intro: logo materialises, counter runs to 100, curtain lifts. Plays once per session.
export default function Preloader({ onDone }) {
  const [count, setCount] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('scroll-locked')
    const controls = animate(0, 100, {
      duration: 1.7,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => setLeaving(true),
    })
    return () => {
      controls.stop()
      document.documentElement.classList.remove('scroll-locked')
    }
  }, [])

  return (
    <motion.div
      className="preloader"
      data-theme="dark"
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
      animate={{ clipPath: leaving ? 'inset(0 0 100% 0)' : 'inset(0 0 0% 0)' }}
      transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1], delay: leaving ? 0.15 : 0 }}
      onAnimationComplete={() => leaving && onDone()}
      role="status"
      aria-label="Loading"
    >
      <div className="preloader-glow" />
      <motion.img
        className="preloader-logo"
        src="/logo.png"
        alt=""
        width="220"
        height="210"
        initial={{ opacity: 0, scale: 0.86, filter: 'blur(14px)' }}
        animate={{ opacity: leaving ? 0 : 1, scale: leaving ? 1.06 : 1, filter: 'blur(0px)' }}
        transition={{ duration: leaving ? 0.5 : 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className="preloader-meta">
        <span className="label">Ideas · Influence · Experiences</span>
        <span className="preloader-count">{String(count).padStart(3, '0')}</span>
      </div>
      <motion.span
        className="preloader-bar"
        style={{ scaleX: count / 100 }}
        aria-hidden="true"
      />
    </motion.div>
  )
}
