import { useRef, useState } from 'react'
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
import { BRAND_WALLS } from '../data/brands'
import Reveal from './Reveal'
import SplitText from './SplitText'
import Watermark from './Watermark'
import useSectionEntrance from '../hooks/useSectionEntrance'
import './Brands.css'

const EASE = [0.16, 1, 0.3, 1]
const wrap = (min, max, v) => {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

function BrandCard({ wall, index }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <figure className="brand-card" style={{ '--i': index }} onPointerMove={onMove}>
      <span className="brand-card-glow" aria-hidden="true" />
      <img src={wall.src} alt={wall.alt} loading="lazy" draggable="false" />
      <figcaption>
        <span className="label">{String(index + 1).padStart(2, '0')}</span>
        <span>{wall.sector}</span>
      </figcaption>
    </figure>
  )
}

// The image wall below reuses the same velocity-reactive endless-scroll technique as
// components/Marquee.jsx (speeds up and reverses with page-scroll direction, pauses on
// hover/off-screen) — rebuilt inline here for image cards rather than text.
export default function Brands() {
  const sectionRef = useRef(null)
  const entrance = useSectionEntrance(sectionRef)
  const reduce = useReducedMotion()

  const wallRef = useRef(null)
  const inView = useInView(wallRef, { amount: 0.2 })
  const paused = useRef(false)
  const dir = useRef(-1)
  const pos = useMotionValue(0) // percent of one group: 0 .. -100
  const [hover, setHover] = useState(false)

  const { scrollY } = useScroll()
  const smooth = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })

  useAnimationFrame((_, delta) => {
    if (reduce || !inView || paused.current) return
    const v = smooth.get()
    if (v < -40) dir.current = 1
    else if (v > 40) dir.current = -1
    const rest = (16 / 42) * (delta / 1000)
    const move = dir.current * rest * (1 + Math.min(Math.abs(v) / 260, 9))
    pos.set(wrap(-100, 0, pos.get() + move))
  })

  const x = useTransform(pos, (v) => `${v / 2}%`)

  const group = (
    <div className="brand-group">
      {BRAND_WALLS.map((wall, i) => (
        <BrandCard key={wall.src} wall={wall} index={i} />
      ))}
    </div>
  )

  return (
    <motion.section ref={sectionRef} id="brands" className="brands section" style={entrance}>
      <Watermark text="Brands" align="top" from="-28%" to="26%" />
      <div className="hairline" aria-hidden="true" />

      <div className="container section-head brands-head">
        <Reveal as="p" className="eyebrow" y={16}>
          06 — Brands we&rsquo;ve worked with
        </Reveal>
        <h2 className="section-title display">
          <SplitText parts={['Trusted by ', { t: 'names you know.', className: 'serif brands-accent' }]} by="word" stagger={0.12} />
        </h2>
        <Reveal as="p" className="lead" y={20} delay={0.1}>
          From campuses to household names, here are some of the brands and institutions RMS has partnered with.
        </Reveal>
      </div>

      <motion.div
        ref={wallRef}
        className={`brand-wall ${hover ? 'is-hover' : ''}`}
        initial={reduce ? false : { opacity: 0, scale: 0.92, y: 60 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1, ease: EASE }}
        onPointerEnter={() => {
          paused.current = true
          setHover(true)
        }}
        onPointerLeave={() => {
          paused.current = false
          setHover(false)
        }}
      >
        <motion.div className="brand-track" style={{ x }}>
          {group}
          {group}
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
