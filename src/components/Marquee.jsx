import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import './Marquee.css'

const wrap = (min, max, v) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

/**
 * Endless scrolling strip of text. It drifts on its own, speeds up while the visitor scrolls, and
 * reverses direction when they scroll back up. Pauses on hover and while off screen. Decorative (aria-hidden).
 * duration: seconds for one full loop at rest.
 */
export default function Marquee({ items, duration = 40, reverse = false, className = '' }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref)
  const paused = useRef(false)
  const dir = useRef(reverse ? 1 : -1)
  const pos = useMotionValue(0) // percent of one group: 0 .. -100

  const { scrollY } = useScroll()
  const smooth = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })

  useAnimationFrame((_, delta) => {
    if (reduce || !inView || paused.current) return
    const v = smooth.get()
    const base = reverse ? 1 : -1
    if (v < -40) dir.current = -base
    else if (v > 40) dir.current = base
    const rest = (100 / duration) * (delta / 1000)
    const move = dir.current * rest * (1 + Math.min(Math.abs(v) / 260, 9))
    pos.set(wrap(-100, 0, pos.get() + move))
  })

  const x = useTransform(pos, (v) => `${v / 2}%`) // the track holds two identical groups

  const group = (
    <ul className="marquee-group">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="marquee-item">
          {item}
          <span className="marquee-dot" />
        </li>
      ))}
    </ul>
  )

  return (
    <div
      ref={ref}
      className={`marquee ${className}`}
      aria-hidden="true"
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      <motion.div className="marquee-track" style={{ x }}>
        {group}
        {group}
      </motion.div>
    </div>
  )
}
