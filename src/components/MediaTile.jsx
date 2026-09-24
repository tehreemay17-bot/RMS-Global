import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import './MediaTile.css'

const PLAY_EVENT = 'rms:video-play'

/**
 * One photo or video thumbnail.
 * - photos: hover zoom, click calls onOpen(item) (opens the lightbox)
 * - videos: poster with a play button; click swaps in a real <video> and plays it. Only one plays at a time.
 */
export default function MediaTile({ item, index = 0, onOpen, className = '', style, eager = false, parallax = false }) {
  const id = useId()
  const videoRef = useRef(null)
  const figureRef = useRef(null)
  const reduce = useReducedMotion()
  const [playing, setPlaying] = useState(false)
  const isVideo = item.type === 'video'

  // parallax: the picture drifts inside its frame at a different speed to the page
  const { scrollYProgress } = useScroll({ target: figureRef, offset: ['start end', 'end start'] })
  const driftY = useTransform(scrollYProgress, [0, 1], ['-7%', '7%'])
  const drift = parallax && !reduce

  useEffect(() => {
    if (!isVideo) return undefined
    const onOther = (e) => e.detail !== id && setPlaying(false)
    window.addEventListener(PLAY_EVENT, onOther)
    return () => window.removeEventListener(PLAY_EVENT, onOther)
  }, [id, isVideo])

  const startVideo = () => {
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }))
    setPlaying(true)
  }

  return (
    <motion.figure
      ref={figureRef}
      className={`tile ${isVideo ? 'is-video' : ''} ${className}`}
      style={style}
      initial={eager ? false : { opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: Math.min(index, 6) * 0.07 }}
    >
      {playing ? (
        <video
          ref={videoRef}
          className="tile-video"
          src={item.src}
          poster={item.poster}
          controls
          autoPlay
          playsInline
          onEnded={() => setPlaying(false)}
          aria-label={item.alt}
        />
      ) : (
        <button
          type="button"
          className="tile-btn"
          onClick={() => (isVideo ? startVideo() : onOpen?.(item))}
          aria-label={isVideo ? `Play video: ${item.alt}` : `Open photo: ${item.alt}`}
        >
          <motion.span className={`tile-par ${drift ? 'is-par' : ''}`} style={drift ? { y: driftY } : undefined}>
            {isVideo && !item.poster ? (
              // No poster supplied (e.g. a video dropped into the events folder): show a frame from the video itself.
              <video className="tile-img" src={`${item.src}#t=0.4`} muted playsInline preload="metadata" tabIndex={-1} />
            ) : (
              <img
                className="tile-img"
                src={isVideo ? item.poster : item.src}
                alt=""
                loading={eager ? 'eager' : 'lazy'}
                draggable="false"
              />
            )}
          </motion.span>
          <span className="tile-shade" aria-hidden="true" />
          <span className="tile-badge label" aria-hidden="true">
            {isVideo ? 'Video' : 'Photo'}
          </span>
          <span className="tile-icon" aria-hidden="true">
            {isVideo ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            )}
          </span>
        </button>
      )}
    </motion.figure>
  )
}
