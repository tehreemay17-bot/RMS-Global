import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { SERVICES } from '../data/services'
import useMediaQuery from '../hooks/useMediaQuery'
import SplitText from './SplitText'
import Reveal from './Reveal'
import ServiceModal from './ServiceModal'
import './Services.css'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

const ICONS = {
  social: (
    <svg viewBox="0 0 32 32" {...stroke}>
      <circle cx="16" cy="16" r="3.2" />
      <circle cx="6" cy="8" r="2.4" />
      <circle cx="26" cy="9" r="2.4" />
      <circle cx="24" cy="26" r="2.4" />
      <path d="m8 9.2 5.6 4.6M24.2 10.9l-5.4 3.6M17.8 18.8l4.8 5.2" />
    </svg>
  ),
  pr: (
    <svg viewBox="0 0 32 32" {...stroke}>
      <path d="M5 13v6a1 1 0 0 0 1 1h4l9 5V7l-9 5H6a1 1 0 0 0-1 1Z" />
      <path d="M24 12.5a5 5 0 0 1 0 7M27 9.5a9 9 0 0 1 0 13" />
    </svg>
  ),
  creative: (
    <svg viewBox="0 0 32 32" {...stroke}>
      <path d="M16 4c7.2 0 12 4.4 12 9.6 0 3.2-2.6 4.6-5 4.4-2.2-.2-3.4 1-3 2.6.4 2-.8 4-3.2 4C10.4 24.6 4 21 4 15 4 8.8 9 4 16 4Z" />
      <circle cx="10.5" cy="13" r="1.4" />
      <circle cx="15" cy="9.5" r="1.4" />
      <circle cx="20.5" cy="11" r="1.4" />
    </svg>
  ),
  production: (
    <svg viewBox="0 0 32 32" {...stroke}>
      <rect x="4" y="9" width="17" height="14" rx="2.5" />
      <path d="m21 14.5 7-4v11l-7-4" />
    </svg>
  ),
  activations: (
    <svg viewBox="0 0 32 32" {...stroke}>
      <path d="M16 3v4M16 25v4M3 16h4M25 16h4M7 7l2.8 2.8M22.2 22.2 25 25M25 7l-2.8 2.8M9.8 22.2 7 25" />
      <circle cx="16" cy="16" r="4.2" />
    </svg>
  ),
  events: (
    <svg viewBox="0 0 32 32" {...stroke}>
      <path d="M4 26h24M7 26V13l9-7 9 7v13" />
      <path d="M12 26v-7h8v7" />
      <path d="M16 6V3" />
    </svg>
  ),
}

function Card({ service, index, onOpen }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <button
      type="button"
      className="s-card"
      onPointerMove={onMove}
      onClick={() => onOpen(index)}
      aria-haspopup="dialog"
    >
      <div className="s-card-glow" aria-hidden="true" />
      <span className="s-watermark" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <header className="s-card-top">
        <span className="label">{String(index + 1).padStart(2, '0')}</span>
        <span className="s-icon" aria-hidden="true">
          {ICONS[service.icon]}
        </span>
      </header>
      <div className="s-card-body">
        <h3 className="s-title display">{service.title}</h3>
        <p className="s-blurb">{service.blurb}</p>
      </div>
      <ul className="s-tags">
        {service.tags.map((t) => (
          <li key={t} className="label">
            {t}
          </li>
        ))}
      </ul>
      <span className="s-card-more label" aria-hidden="true">
        More info
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  )
}

// A card in the pinned reel: it scales, tilts and fades according to where it is on screen (centre = full size).
function ReelCard({ service, index, progress, distMV, onOpen }) {
  const ref = useRef(null)
  const centerMV = useMotionValue(0)

  useEffect(() => {
    const measure = () => {
      if (ref.current) centerMV.set(ref.current.offsetLeft + ref.current.offsetWidth / 2)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [centerMV])

  // 0 = left edge of the screen, 0.5 = centre, 1 = right edge
  const rel = useTransform([progress, distMV, centerMV], ([p, d, c]) => (c - p * d) / window.innerWidth)
  const off = useTransform(rel, (r) => Math.min(1, Math.abs(r - 0.5) * 2))
  const scale = useTransform(off, [0, 1], [1, 0.88])
  const rotateY = useTransform(rel, [0, 0.5, 1], [22, 0, -22])
  const opacity = useTransform(off, [0, 1], [1, 0.5])
  const y = useTransform(off, [0, 1], [0, 36])

  return (
    <motion.div ref={ref} className="s-reel-item" style={{ scale, rotateY, opacity, y, transformPerspective: 1300 }}>
      <Card service={service} index={index} onOpen={onOpen} />
    </motion.div>
  )
}

const HEADING = [
  'Built around what ',
  { t: 'brands', className: '' },
  { br: true },
  { t: 'need today.', className: 'serif s-accent' },
]

export default function Services() {
  const desktop = useMediaQuery('(min-width: 900px)')
  const reduce = useReducedMotion()
  const pinned = desktop && !reduce

  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const [dist, setDist] = useState(0)
  const distMV = useMotionValue(0)
  const [active, setActive] = useState(0)
  const [openIndex, setOpenIndex] = useState(null)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform([scrollYProgress, distMV], ([p, d]) => -p * d)
  const wordX = useTransform(scrollYProgress, [0, 1], ['4%', '-34%'])

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setActive(Math.min(SERVICES.length - 1, Math.max(0, Math.round(p * (SERVICES.length - 1)))))
  })

  useEffect(() => {
    if (!pinned || !trackRef.current) return undefined
    const measure = () => {
      const d = Math.max(0, trackRef.current.scrollWidth - window.innerWidth)
      distMV.set(d)
      setDist(d)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [pinned, distMV])

  return (
    <section
      id="services"
      ref={sectionRef}
      className={`services ${pinned ? 'is-pinned' : ''}`}
      style={pinned ? { height: `calc(100svh + ${dist}px)` } : undefined}
    >
      <div className="hairline" aria-hidden="true" />
      <div className="services-stage">
        <motion.span className="services-word serif" style={pinned ? { x: wordX } : undefined} aria-hidden="true">
          Services
        </motion.span>

        <div className="services-head container">
          <div className="services-head-main">
            <Reveal as="p" className="eyebrow" y={16}>
              01 — What we do
            </Reveal>
            <h2 className="section-title display services-title">
              <SplitText parts={HEADING} by="word" stagger={0.11} />
            </h2>
          </div>
          {pinned ? (
            <div className="services-meter" aria-hidden="true">
              <span className="services-count display">
                {String(active + 1).padStart(2, '0')}
                <em>/ {String(SERVICES.length).padStart(2, '0')}</em>
              </span>
              <span className="services-bar">
                <motion.span style={{ scaleX: scrollYProgress }} />
              </span>
            </div>
          ) : (
            <Reveal as="p" className="lead" y={20} delay={0.1}>
              One integrated team, shaped around the challenge in front of you, from the first idea to the final moment.
            </Reveal>
          )}
        </div>

        <motion.div ref={trackRef} className="services-track" style={pinned ? { x } : undefined}>
          {SERVICES.map((s, i) =>
            pinned ? (
              <ReelCard key={s.id} service={s} index={i} progress={scrollYProgress} distMV={distMV} onOpen={setOpenIndex} />
            ) : (
              <Reveal key={s.id} y={44} amount={0.15} className="s-flow-item">
                <Card service={s} index={i} onOpen={setOpenIndex} />
              </Reveal>
            ),
          )}
          {pinned && (
            <div className="s-end">
              <p className="serif">and every moment in between.</p>
              <a href="#book" className="btn-ghost">
                <span>Tell us about yours</span>
              </a>
            </div>
          )}
        </motion.div>
      </div>

      <ServiceModal services={SERVICES} index={openIndex} icons={ICONS} onClose={() => setOpenIndex(null)} />
    </section>
  )
}
