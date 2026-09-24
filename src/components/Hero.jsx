import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { BRAND } from '../config'
import SplitText from './SplitText'
import Magnetic from './Magnetic'
import Marquee from './Marquee'
import './Hero.css'

const CAPABILITIES = [
  'Social media',
  'PR + profile',
  'Creative',
  'Production',
  'Motion graphics',
  'Brand activations',
  'Events + concerts',
]

const EASE = [0.16, 1, 0.3, 1]

export default function Hero({ ready }) {
  const ref = useRef(null)
  const videoRef = useRef(null)
  const reduce = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(true)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const mediaOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.1])
  // the video drifts up slower than the page (parallax), so it reads as sitting behind the headline
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -110])
  const textY = useTransform(scrollYProgress, [0, 1], [0, 160])
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  // headline lines slide apart as you scroll away
  const line1X = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -220])
  const line2X = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 180])
  const line3X = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -320])
  const sealRotate = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 200])
  const sealY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120])

  // Cursor spotlight
  const mx = useMotionValue(50)
  const my = useMotionValue(60)
  const sx = useSpring(mx, { stiffness: 60, damping: 18 })
  const sy = useSpring(my, { stiffness: 60, damping: 18 })
  const spot = useMotionTemplate`radial-gradient(520px circle at ${sx}% ${sy}%, rgba(169,112,255,0.22), transparent 62%)`

  const onMove = (e) => {
    if (reduce || e.pointerType === 'touch') return
    const r = ref.current.getBoundingClientRect()
    mx.set(((e.clientX - r.left) / r.width) * 100)
    my.set(((e.clientY - r.top) / r.height) * 100)
  }

  // Autoplay only while on screen, never under reduced motion, and only if the viewer hasn't paused it.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return undefined
    if (reduce) {
      v.pause()
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && playing) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.1 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [playing, reduce, failed])

  const fade = (delay) => ({
    initial: { opacity: 0, y: 28 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
    transition: { duration: 0.7, ease: EASE, delay },
  })

  return (
    <section id="hero" ref={ref} className="hero" data-theme="dark" onPointerMove={onMove}>
      <motion.div className="hero-media" style={{ scale: mediaScale, opacity: mediaOpacity, y: mediaY }} aria-hidden="true">
        {failed ? (
          <div className="hero-fallback">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <video
            ref={videoRef}
            className="hero-video"
            src="/hero-video.mp4"
            poster="/hero-poster.jpg"
            autoPlay={!reduce}
            muted
            loop
            playsInline
            preload="auto"
            onError={() => setFailed(true)}
          />
        )}
        <div className="hero-veil" />
        <motion.div className="hero-spot" style={{ background: spot }} />
      </motion.div>

      <motion.div className="hero-content container" style={{ y: textY, opacity: textOpacity }}>
        <motion.p className="eyebrow" {...fade(0.05)}>
          Full-service media · creative · experiential
        </motion.p>

        <h1 className="hero-title display">
          <motion.span className="hero-line-wrap" style={{ x: line1X }}>
            <SplitText parts="Ideas." when={ready} delay={0.08} className="hero-line hero-line-1" />
          </motion.span>
          <motion.span className="hero-line-wrap" style={{ x: line2X }}>
            <SplitText parts="Influence." when={ready} delay={0.24} className="hero-line hero-line-2 serif" />
          </motion.span>
          <motion.span className="hero-line-wrap" style={{ x: line3X }}>
            <SplitText parts="Experiences." when={ready} delay={0.42} className="hero-line hero-line-3" />
          </motion.span>
        </h1>

        <div className="hero-lower">
          <motion.p className="hero-sub" {...fade(0.7)}>
            {BRAND.name} takes brands from strategy to spectacle, on screen, on site and on stage, with one
            integrated team and three decades of nights people still talk about.
          </motion.p>
          <motion.div className="hero-actions" {...fade(0.8)}>
            <Magnetic>
              <a href="#book" className="btn-cta">
                <span>Start a project</span>
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#work" className="btn-ghost">
                <span>See where we work</span>
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </motion.div>

      <motion.div className="hero-seal-scroll" style={{ y: sealY, rotate: sealRotate }} aria-hidden="true">
      <motion.div
        className="hero-seal"
        initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
        animate={ready ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.8, rotate: -30 }}
        transition={{ duration: 1, ease: EASE, delay: 0.65 }}
      >
        <svg viewBox="0 0 200 200" className="hero-seal-ring">
          <defs>
            <path id="seal-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
          </defs>
          <text>
            <textPath href="#seal-path" startOffset="0">
              EST. {BRAND.est} · RAMEEN MEDIA SOLUTIONS · IDEAS · INFLUENCE · EXPERIENCES ·
            </textPath>
          </text>
        </svg>
        <img src="/logo.png" alt="" width="64" height="61" />
      </motion.div>
      </motion.div>

      <motion.div
        className="hero-foot"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <div className="hero-foot-row container">
          <a href="#services" className="hero-scroll label">
            <span className="hero-scroll-line" />
            Scroll
          </a>
          {!failed && (
            <button
              type="button"
              className="hero-toggle label"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={!playing}
              aria-label={playing ? 'Pause background video' : 'Play background video'}
            >
              <span className="hero-toggle-icon" data-paused={!playing}>
                <i />
                <i />
              </span>
              {playing ? 'Pause reel' : 'Play reel'}
            </button>
          )}
        </div>
        <Marquee items={CAPABILITIES} duration={46} className="hero-marquee" />
      </motion.div>
    </section>
  )
}
