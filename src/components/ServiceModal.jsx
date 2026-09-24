import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'
import { NAV_CTA } from '../config'
import { scrollToId } from '../lib/scroll'
import './ServiceModal.css'

/**
 * Text-only "more information" popup for a Services card.
 * services: SERVICES array   index: number | null (null = closed)
 */
export default function ServiceModal({ services, index, icons, onClose }) {
  const open = index !== null && index !== undefined
  const closeRef = useRef(null)
  const lastFocus = useRef(null)
  const service = open ? services[index] : null

  useEffect(() => {
    if (!open) return undefined
    lastFocus.current = document.activeElement
    document.documentElement.classList.add('scroll-locked')
    closeRef.current?.focus()

    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('scroll-locked')
      lastFocus.current?.focus?.()
    }
  }, [open, onClose])

  const goBook = () => {
    onClose()
    window.setTimeout(() => scrollToId(NAV_CTA.id), 250)
  }

  // Rendered at the top level of the page so transformed sections can't shift a position: fixed overlay.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="svc-modal-backdrop"
          data-theme="dark"
          role="dialog"
          aria-modal="true"
          aria-label={`${service.title} — more information`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="svc-modal"
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button ref={closeRef} type="button" className="svc-modal-close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>

            <span className="svc-modal-num label">
              {String(index + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
            </span>
            <span className="svc-modal-icon" aria-hidden="true">
              {icons[service.icon]}
            </span>

            <h3 className="svc-modal-title display">{service.title}</h3>
            <p className="svc-modal-blurb">{service.blurb}</p>

            {service.details && (
              <>
                <p className="svc-modal-overview">{service.details.overview}</p>
                <ul className="svc-modal-points">
                  {service.details.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </>
            )}

            <div className="svc-modal-foot">
              <ul className="svc-modal-tags">
                {service.tags.map((t) => (
                  <li key={t} className="label">
                    {t}
                  </li>
                ))}
              </ul>
              <button type="button" className="btn-cta" onClick={goBook}>
                <span>Talk to us about this</span>
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
