import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ARTISTS } from '../data/artists'
import useMediaQuery from '../hooks/useMediaQuery'
import { scrollToY } from '../lib/scroll'
import Lightbox from './Lightbox'
import Marquee from './Marquee'
import Reveal from './Reveal'
import SplitText from './SplitText'
import Watermark from './Watermark'
import useSectionEntrance from '../hooks/useSectionEntrance'
import './Artists.css'

const N = ARTISTS.length
const EASE = [0.16, 1, 0.3, 1]
const AUTOPLAY_MS = 4800
const WORDS = ['Live on stage', 'Backstage', 'Studio sessions', 'Festival nights', 'Weddings', 'Concerts']
const pad = (n) => String(n).padStart(2, '0')

// Shortest circular distance from the active card (negative = left, positive = right).
function offsetOf(i, active) {
  let d = (((i - active) % N) + N) % N
  if (d > N / 2) d -= N
  return d
}

// Fixed burst layout, computed once at module load (not during render, so it stays a pure function
// of props/state — see https://react.dev/reference/rules/components-and-hooks-must-be-pure).
const SPARKLE_SHARDS = Array.from({ length: 7 }, (_, i) => {
  const angle = (i / 7) * Math.PI * 2 + Math.random() * 0.6
  const dist = 70 + Math.random() * 48
  return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * 0.7 - 10, rotate: Math.random() * 180, delay: i * 0.035 }
})

// Small burst of glowing shards, replayed every time the active card changes (key={active} below).
function Sparkles() {
  return (
    <div className="artist-sparkles" aria-hidden="true">
      {SPARKLE_SHARDS.map((s, i) => (
        <motion.span
          key={i}
          className="artist-sparkle"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.4], x: s.x, y: s.y, rotate: s.rotate }}
          transition={{ duration: 0.95, ease: EASE, delay: s.delay }}
        />
      ))}
    </div>
  )
}

function Card({ item, index, d, size, onSelect, fx }) {
  const a = Math.abs(d)
  const side = Math.sign(d)
  const visible = a <= 3
  const isActive = d === 0

  // Holographic tilt + glare: plain CSS custom properties updated on pointermove (no React
  // re-render), read by the inner .artist-card-tilt layer. Kept off touch/reduced-motion (fx=false).
  const onMove = (e) => {
    if (!fx) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    e.currentTarget.style.setProperty('--tilt-x', `${(0.5 - py) * 14}deg`)
    e.currentTarget.style.setProperty('--tilt-y', `${(px - 0.5) * 14}deg`)
    e.currentTarget.style.setProperty('--px', `${px * 100}%`)
    e.currentTarget.style.setProperty('--py', `${py * 100}%`)
  }
  const onLeave = (e) => {
    if (!fx) return
    e.currentTarget.style.setProperty('--tilt-x', '0deg')
    e.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <motion.button
      type="button"
      className={`artist-card ${isActive ? 'is-active' : ''}`}
      style={{
        width: size.w,
        height: size.h,
        marginLeft: -size.w / 2,
        marginTop: -size.h / 2,
        zIndex: 50 - a * 10,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      initial={false}
      animate={{
        x: d === 0 ? 0 : d * size.step + side * size.w * 0.14,
        z: -a * 140,
        rotateY: -side * Math.min(a * 26, 54),
        scale: 1 - Math.min(a, 3) * 0.06,
        opacity: visible ? 1 : 0,
        filter: `brightness(${1 - Math.min(a, 3) * 0.2})`,
      }}
      transition={{ type: 'spring', stiffness: 120, damping: 21, mass: 0.95 }}
      onClick={() => onSelect(index, d)}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label={isActive ? `Enlarge photo ${index + 1}: ${item.name || item.title}` : `Show photo ${index + 1}: ${item.name || item.title}`}
    >
      <div className="artist-card-tilt" onPointerMove={onMove} onPointerLeave={onLeave}>
        {isActive && <span className="artist-card-edge" aria-hidden="true" />}
        <img src={item.src} alt="" draggable="false" loading={a <= 2 ? 'eager' : 'lazy'} />
        <span className="artist-card-shine" aria-hidden="true" />
        <span className="artist-shade" aria-hidden="true" />
        <span className="artist-card-info" aria-hidden="true">
          <span className="label">{pad(index + 1)}</span>
          <span className="artist-card-title">{item.name || item.title}</span>
          <span className="artist-card-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            View full size
          </span>
        </span>
      </div>
    </motion.button>
  )
}

export default function Artists() {
  const sectionRef = useRef(null)
  const entrance = useSectionEntrance(sectionRef)
  const reduce = useReducedMotion()
  const canTilt = useMediaQuery('(pointer: fine) and (hover: hover)')
  const fx = canTilt && !reduce // holographic tilt/glare/spin-border: fine pointer only, off under reduced motion
  const wide = useMediaQuery('(min-width: 720px)')
  const short = useMediaQuery('(max-height: 780px)')
  const tiny = useMediaQuery('(max-height: 640px)')
  // On desktop the stage pins to the screen and scrolling itself turns the carousel.
  const pinned = useMediaQuery('(min-width: 900px)') && !reduce
  const size = !wide
    ? { w: 232, h: 312, step: 118 }
    : tiny
      ? { w: 236, h: 306, step: 176 }
      : short
        ? { w: 280, h: 362, step: 208 }
        : { w: 340, h: 440, step: 250 }

  const [active, setActive] = useState(Math.floor(N / 2))
  const [hover, setHover] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [lb, setLb] = useState(null)

  const sceneRef = useRef(null)
  const stageRef = useRef(null)
  const thumbsRef = useRef(null)
  const pinRef = useRef(null)
  const inView = useInView(stageRef, { amount: 0.45 })

  const running = inView && !hover && !userPaused && !reduce && lb === null && !pinned

  // pinned mode: photo i lives at scroll position i/(N-1) of the pinned range, so navigation scrolls the page there
  const jumpTo = useCallback((i) => {
    const el = pinRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const range = el.offsetHeight - window.innerHeight
    scrollToY(top + (i / (N - 1)) * range, { duration: 1.2 })
  }, [])
  const goTo = useCallback((i) => (pinned ? jumpTo(i) : setActive(i)), [pinned, jumpTo])
  const go = useCallback(
    (dir) => (pinned ? jumpTo(Math.min(N - 1, Math.max(0, active + dir))) : setActive((a) => (a + dir + N) % N)),
    [pinned, active, jumpTo],
  )

  // autoplay: advance every few seconds while the stage is on screen and not hovered/paused
  useEffect(() => {
    if (!running) return undefined
    const id = setTimeout(() => go(1), AUTOPLAY_MS)
    return () => clearTimeout(id)
  }, [running, active, go])

  // keep the active thumbnail centred in its strip (scrolls only the strip, never the page)
  useEffect(() => {
    const strip = thumbsRef.current
    const el = strip?.children[active]
    if (!strip || !el) return
    strip.scrollTo({ left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' })
  }, [active, reduce])

  const select = (i, d) => (d === 0 ? setLb(i) : goTo(i))

  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(1)
    else if (e.key === 'ArrowLeft') go(-1)
    else if (e.key === 'Home') goTo(0)
    else if (e.key === 'End') goTo(N - 1)
    else if (e.key === 'Enter' && e.target === e.currentTarget) setLb(active)
    else return
    e.preventDefault()
  }

  const onPanEnd = (_, info) => {
    if (info.offset.x < -50 || info.velocity.x < -450) go(1)
    else if (info.offset.x > 50 || info.velocity.x > 450) go(-1)
  }

  // the whole stage tilts up into place as it scrolls into view
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ['start end', 'start 0.3'] })
  const tilt = useTransform(scrollYProgress, [0, 1], [16, 0])
  const rise = useTransform(scrollYProgress, [0, 1], [90, 0])
  const grow = useTransform(scrollYProgress, [0, 1], [0.93, 1])

  // scroll-scrub: while pinned, the page's scroll position chooses the active photo
  const { scrollYProgress: pinP } = useScroll({ target: pinRef, offset: ['start start', 'end end'] })
  useMotionValueEvent(pinP, 'change', (p) => {
    if (pinned) setActive(Math.min(N - 1, Math.max(0, Math.round(p * (N - 1)))))
  })

  const lbItems = useMemo(() => ARTISTS.map((a) => ({ src: a.src, alt: a.name || a.title })), [])
  const current = ARTISTS[active]

  return (
    <motion.section ref={sectionRef} id="artists" className="artists section" style={entrance}>
      <Watermark text="Stage" align="bottom" from="-34%" to="24%" />
      <div className="hairline" aria-hidden="true" />

      <div className="container">
        <div className="section-head artists-head">
          <Reveal as="p" className="eyebrow" y={16}>
            05 — Artists we&rsquo;ve worked with
          </Reveal>
          <h2 className="section-title display">
            <SplitText
              parts={['The voices', { br: true }, 'behind ', { t: 'the nights.', className: 'serif artists-accent' }]}
              by="word"
              stagger={0.12}
            />
          </h2>
          <div className="artists-sub">
            <Reveal as="p" className="lead" y={20} delay={0.1}>
              From intimate sufi evenings to festival stages, these are the performers who trust us to make every night
              land. Drag, swipe or use the arrow keys to look around.
            </Reveal>
            <Reveal as="p" className="artists-count display" y={20} delay={0.18}>
              {pad(N)}
              <span className="label"> moments on stage</span>
            </Reveal>
          </div>
        </div>
      </div>

      <div
        ref={pinRef}
        className={`artist-pin ${pinned ? 'is-pinned' : ''}`}
        style={pinned ? { height: `calc(100svh + ${(N - 1) * 34}vh)` } : undefined}
      >
      <div className="artist-pin-inner">
      <div ref={sceneRef} className="artist-scene">
        <span className="artist-beams" aria-hidden="true" />
        <span className="artist-floor" aria-hidden="true" />

        <motion.div
          className="artist-tilt"
          style={reduce ? undefined : { rotateX: tilt, y: rise, scale: grow, transformPerspective: 1600 }}
        >
          <motion.div
            ref={stageRef}
            className="artist-stage"
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label={`Artist photos, ${active + 1} of ${N}`}
            onKeyDown={onKey}
            onPanEnd={onPanEnd}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            initial={reduce ? false : { opacity: 0, scale: 0.72, rotateX: 30, y: 130, filter: 'blur(20px)' }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.3, ease: EASE }}
          >
            <div className="artist-track">
              {ARTISTS.map((item, i) => (
                <Card key={item.src} item={item} index={i} d={offsetOf(i, active)} size={size} onSelect={select} fx={fx} />
              ))}
              {!reduce && <Sparkles key={active} />}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="container artist-controls">
        <button type="button" className="artist-arrow" onClick={() => go(-1)} aria-label="Previous photo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>

        <div className="artist-caption" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <span className="label">
                {pad(active + 1)} / {pad(N)} · {current.name ? current.title : 'Featured artists'}
              </span>
              <h3 className="artist-caption-title display">{current.name || current.title}</h3>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="artist-controls-right">
          <button
            type="button"
            className="artist-arrow"
            onClick={() => setUserPaused((p) => !p)}
            aria-pressed={userPaused}
            aria-label={userPaused ? 'Play slideshow' : 'Pause slideshow'}
          >
            {userPaused ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            )}
          </button>
          <button type="button" className="artist-arrow" onClick={() => go(1)} aria-label="Next photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="container">
        <div className="artist-progress" aria-hidden="true">
          {pinned ? (
            <motion.span style={{ scaleX: pinP }} />
          ) : (
            <motion.span
              key={active}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: running ? 1 : 0 }}
              transition={running ? { duration: AUTOPLAY_MS / 1000, ease: 'linear' } : { duration: 0.3 }}
            />
          )}
        </div>
        {pinned && <p className="artist-hint label">Scroll to spin the carousel</p>}

        <div ref={thumbsRef} className="artist-thumbs" role="group" aria-label="Choose a photo">
          {ARTISTS.map((item, i) => (
            <button
              key={item.src}
              type="button"
              className={`artist-thumb ${i === active ? 'is-active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Show photo ${i + 1}: ${item.name || item.title}`}
              aria-current={i === active ? 'true' : undefined}
            >
              <img src={item.src} alt="" loading="lazy" draggable="false" />
              {i === active && (
                <motion.span
                  layoutId="artist-thumb-ring"
                  className="artist-thumb-ring"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
      </div>
      </div>

      <div className="artists-marquee-wrap">
        <Marquee items={WORDS} duration={55} reverse className="artists-marquee" />
      </div>

      <Lightbox items={lbItems} index={lb} onClose={() => setLb(null)} onIndex={setLb} />
    </motion.section>
  )
}
