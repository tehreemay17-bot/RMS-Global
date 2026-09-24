import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import useMediaQuery from '../hooks/useMediaQuery'
import './Cursor.css'

// Things the ring "grows" for, to read as clickable.
const HOVER_SELECTOR = [
  'a', 'button', 'input', 'textarea', 'select', 'label',
  '[role="button"]', '[tabindex]:not([tabindex="-1"])',
].join(', ')

// Things that already carry their own meaningful native cursor (grab, zoom-in, not-allowed,
// progress…) — the custom cursor hides itself here so that cursor keeps doing its job.
const NATIVE_SELECTOR = '.artist-stage, .cal-day:disabled, [disabled]'

// Renders nothing on touch devices, imprecise pointers, or prefers-reduced-motion — the OS cursor
// is left completely alone in those cases.
export default function Cursor() {
  const reduce = useReducedMotion()
  const canHover = useMediaQuery('(pointer: fine) and (hover: hover)')
  const enabled = canHover && !reduce

  const [ready, setReady] = useState(false) // hides the cursor until the first real pointermove
  const [hovering, setHovering] = useState(false)
  const [native, setNative] = useState(false)
  const [down, setDown] = useState(false)
  const [inWindow, setInWindow] = useState(true)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringSpring = { stiffness: 340, damping: 28, mass: 0.5 }
  const glowSpring = { stiffness: 120, damping: 26, mass: 0.9 }
  const ringX = useSpring(x, ringSpring)
  const ringY = useSpring(y, ringSpring)
  const glowX = useSpring(x, glowSpring)
  const glowY = useSpring(y, glowSpring)

  const stateRef = useRef({ hovering: false, native: false })

  useEffect(() => {
    document.documentElement.classList.toggle('has-custom-cursor', enabled)
    return () => document.documentElement.classList.remove('has-custom-cursor')
  }, [enabled])

  useEffect(() => {
    if (!enabled) return undefined

    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
      if (!ready) setReady(true)
    }
    const over = (e) => {
      const target = e.target
      const isNative = !!target.closest?.(NATIVE_SELECTOR)
      const isHover = !isNative && !!target.closest?.(HOVER_SELECTOR)
      if (isNative !== stateRef.current.native) {
        stateRef.current.native = isNative
        setNative(isNative)
      }
      if (isHover !== stateRef.current.hovering) {
        stateRef.current.hovering = isHover
        setHovering(isHover)
      }
    }
    const down_ = () => setDown(true)
    const up = () => setDown(false)
    const leave = () => setInWindow(false)
    const enter = () => setInWindow(true)

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down_)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('mouseleave', leave)
    document.documentElement.addEventListener('mouseenter', enter)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down_)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('mouseleave', leave)
      document.documentElement.removeEventListener('mouseenter', enter)
    }
  }, [enabled, ready, x, y])

  if (!enabled) return null

  const visible = ready && inWindow && !native
  const ringScale = down ? 0.82 : hovering ? 2.05 : 1
  const dotScale = down ? 0.5 : hovering ? 0 : 1

  return (
    <div className="cursor-root" aria-hidden="true">
      <motion.div
        className="cursor-glow"
        style={{ x: glowX, y: glowY }}
        animate={{ opacity: visible ? (hovering ? 0.55 : 0.32) : 0, scale: hovering ? 1.3 : 1 }}
        transition={{ duration: 0.4 }}
      />
      <motion.div
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
        animate={{ opacity: visible ? 1 : 0, scale: ringScale }}
        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
      />
      <motion.div
        className="cursor-dot"
        style={{ x, y }}
        animate={{ opacity: visible ? 1 : 0, scale: dotScale }}
        transition={{ duration: 0.2 }}
      />
    </div>
  )
}
