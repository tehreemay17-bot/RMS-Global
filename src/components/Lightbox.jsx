import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import './Lightbox.css'

/**
 * Full-screen photo viewer.
 * items: [{ src, alt }]   index: number | null (null = closed)
 */
export default function Lightbox({ items, index, onClose, onIndex }) {
  const open = index !== null && index !== undefined
  const closeRef = useRef(null)
  const lastFocus = useRef(null)
  const count = items.length

  const go = useCallback(
    (dir) => onIndex((index + dir + count) % count),
    [index, count, onIndex],
  )

  useEffect(() => {
    if (!open) return undefined
    lastFocus.current = document.activeElement
    document.documentElement.classList.add('scroll-locked')
    closeRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('scroll-locked')
      lastFocus.current?.focus?.()
    }
  }, [open, go, onClose])

  const item = open ? items[index] : null

  // Rendered at the top level of the page so transformed sections can't shift a position: fixed overlay.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="lightbox"
          data-theme="dark"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          onClick={onClose}
        >
          <button ref={closeRef} type="button" className="lb-btn lb-close" onClick={onClose} aria-label="Close photo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>

          {count > 1 && (
            <>
              <button
                type="button"
                className="lb-btn lb-prev"
                onClick={(e) => {
                  e.stopPropagation()
                  go(-1)
                }}
                aria-label="Previous photo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 5-7 7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                className="lb-btn lb-next"
                onClick={(e) => {
                  e.stopPropagation()
                  go(1)
                }}
                aria-label="Next photo"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <AnimatePresence mode="wait">
            <motion.figure
              key={item.src}
              className="lb-figure"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={item.src} alt={item.alt} />
              <figcaption className="label">
                {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')} · {item.alt}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
