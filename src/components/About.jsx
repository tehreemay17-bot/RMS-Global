import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { BRAND } from '../config'
import { CITIES } from '../data/cities'
import { PROCESS, SECTORS } from '../data/services'
import useMediaQuery from '../hooks/useMediaQuery'
import Marquee from './Marquee'
import Reveal from './Reveal'
import SplitText from './SplitText'
import Watermark from './Watermark'
import useSectionEntrance from '../hooks/useSectionEntrance'
import './About.css'

// Words of the big statement. `cls` styles individual words.
const STATEMENT = [
  { w: 'We' }, { w: 'turn' }, { w: 'ideas' }, { w: 'into' },
  { w: 'influence,', cls: 'serif about-hot' },
  { w: 'online' }, { w: 'and' }, { w: 'on' }, { w: 'the' }, { w: 'ground.' },
  { w: 'Since' }, { w: `${BRAND.est},` }, { w: BRAND.name }, { w: 'has' }, { w: 'taken' }, { w: 'brands' },
  { w: 'from' }, { w: 'strategy' }, { w: 'to' }, { w: 'spectacle', cls: 'serif about-hot' },
  { w: 'with' }, { w: 'one' }, { w: 'accountable,' }, { w: 'integrated' }, { w: 'team.' },
]

// PLACEHOLDER numbers: replace with your real figures.
const STATS = [
  { value: new Date().getFullYear() - BRAND.est, suffix: '+', label: 'Years of storytelling' },
  { value: 500, suffix: '+', label: 'Campaigns delivered' },
  { value: new Set(CITIES.map((c) => c.country)).size, suffix: '', label: 'Countries worked in' },
  { value: 1, suffix: '', label: 'Integrated team' },
]

function Word({ word, index, total, progress }) {
  const start = (index / total) * 0.85
  const opacity = useTransform(progress, [start, start + 0.09], [0.16, 1])
  const y = useTransform(progress, [start, start + 0.09], [10, 0])
  return (
    <>
      <motion.span className={`about-word ${word.cls || ''}`} style={{ opacity, y }}>
        {word.w}
      </motion.span>{' '}
    </>
  )
}

function Counter({ value, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.7 })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView || reduce) return undefined
    const controls = animate(0, value, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, reduce, value])

  return (
    <span ref={ref} className="stat-num display">
      {reduce ? value : n}
      {suffix}
    </span>
  )
}

function Step({ label, index, total, progress }) {
  const at = index / (total - 1)
  const lit = useTransform(progress, [Math.max(0, at - 0.1), at], [0, 1])
  const scale = useTransform(lit, [0, 1], [0.6, 1])
  const nodeOpacity = useTransform(lit, [0, 1], [0.3, 1])
  const labelOpacity = useTransform(lit, [0, 1], [0.28, 1])
  return (
    <li className="step">
      <motion.span className="step-node" style={{ opacity: nodeOpacity, scale }} />
      <span className="label step-num">{String(index + 1).padStart(2, '0')}</span>
      <motion.span className="step-label display" style={{ opacity: labelOpacity }}>
        {label}
      </motion.span>
    </li>
  )
}

export default function About() {
  const sectionRef = useRef(null)
  const entrance = useSectionEntrance(sectionRef)
  const statementRef = useRef(null)
  const emblemRef = useRef(null)
  const processRef = useRef(null)
  const bgVideoRef = useRef(null)

  const reduce = useReducedMotion()
  const isNarrow = useMediaQuery('(max-width: 719px)')
  const [bgFailed, setBgFailed] = useState(false)

  const { scrollYProgress: statementP } = useScroll({ target: statementRef, offset: ['start 0.85', 'end 0.55'] })
  const { scrollYProgress: emblemP } = useScroll({ target: emblemRef, offset: ['start end', 'end start'] })
  const { scrollYProgress: processP } = useScroll({ target: processRef, offset: ['start 0.8', 'end 0.6'] })
  // Tracks the whole section, top to bottom, so the background video's zoom/drift plays out very
  // slowly across the full scroll of "About" and finishes exactly as the section ends.
  const { scrollYProgress: bgP } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  const spinA = useTransform(emblemP, [0, 1], [0, 140])
  const spinB = useTransform(emblemP, [0, 1], [0, -200])
  const lift = useTransform(emblemP, [0, 1], [40, -40])

  const zoomEnd = reduce ? 1.02 : isNarrow ? 1.1 : 1.2
  const driftEnd = reduce ? 0 : isNarrow ? -16 : -38
  const bgScale = useTransform(bgP, [0, 1], [1.02, zoomEnd])
  const bgY = useTransform(bgP, [0, 1], [0, driftEnd])

  // Autoplay only while the section is actually on screen, and never under reduced motion.
  useEffect(() => {
    const v = bgVideoRef.current
    if (!v || bgFailed) return undefined
    if (reduce) {
      v.pause()
      return undefined
    }
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? v.play().catch(() => {}) : v.pause()), {
      threshold: 0.05,
    })
    io.observe(v)
    return () => io.disconnect()
  }, [reduce, bgFailed])

  return (
    <motion.section ref={sectionRef} id="about" className="about section" data-theme="dark" style={entrance}>
      <div className="about-bg" aria-hidden="true">
        {!bgFailed && (
          <motion.video
            ref={bgVideoRef}
            className="about-bg-video"
            style={{ scale: bgScale, y: bgY }}
            src="/production-bg.mp4"
            autoPlay={!reduce}
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setBgFailed(true)}
          />
        )}
        <div className="about-bg-overlay" />
      </div>
      <Watermark text="About" align="top" from="24%" to="-52%" />
      <div className="hairline" aria-hidden="true" />

      <div className="container about-grid">
        <div className="about-copy">
          <Reveal as="p" className="eyebrow" y={16}>
            02 — About {BRAND.name}
          </Reveal>

          <p ref={statementRef} className="about-statement display" aria-label={STATEMENT.map((s) => s.w).join(' ')}>
            {STATEMENT.map((word, i) => (
              <Word key={`${word.w}-${i}`} word={word} index={i} total={STATEMENT.length} progress={statementP} />
            ))}
          </p>

          <Reveal as="p" className="lead" y={24} delay={0.05}>
            {/* PLACEHOLDER: replace with your real story */}
            Founded in {BRAND.est} as a single-room production house, {BRAND.fullName} has grown into a full-service
            media, creative and experiential agency. We plan the campaign, shoot the film, book the artist and run the
            stage, so the idea never gets lost between departments.
          </Reveal>

          <ul className="stats">
            {STATS.map((s, i) => (
              <Reveal as="li" key={s.label} className="stat" y={28} delay={i * 0.08}>
                <Counter value={s.value} suffix={s.suffix} />
                <span className="label">{s.label}</span>
              </Reveal>
            ))}
          </ul>
        </div>

        <motion.div ref={emblemRef} className="about-visual" style={{ y: lift }} aria-hidden="true">
          <motion.div
            className="emblem"
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="emblem-glow" />
            <motion.span className="ring ring-1" style={{ rotate: spinA }}>
              <i className="orbit-dot" />
            </motion.span>
            <motion.span className="ring ring-2" style={{ rotate: spinB }}>
              <i className="orbit-dot" />
              <i className="orbit-dot dot-2" />
            </motion.span>
            <span className="ring ring-3" />
            <img className="emblem-logo" src="/logo.png" alt="" width="220" height="210" />
            <span className="emblem-est label">Est. {BRAND.est}</span>
          </motion.div>
        </motion.div>
      </div>

      <div ref={processRef} className="container process">
        <div className="process-head">
          <Reveal as="p" className="eyebrow" y={16}>
            The RMS method
          </Reveal>
          <h3 className="process-title display">
            <SplitText parts={['One team, ', { t: 'five moves.', className: 'serif about-hot' }]} by="word" stagger={0.06} />
          </h3>
        </div>
        <div className="process-track">
          <span className="process-line" aria-hidden="true">
            <motion.span style={{ scaleX: processP }} />
          </span>
          <ol className="steps">
            {PROCESS.map((p, i) => (
              <Step key={p} label={p} index={i} total={PROCESS.length} progress={processP} />
            ))}
          </ol>
        </div>
      </div>

      <div className="sectors">
        <p className="label sectors-label">Trusted across sectors</p>
        <Marquee items={SECTORS} duration={60} className="sectors-marquee" />
      </div>
    </motion.section>
  )
}
