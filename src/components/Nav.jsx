import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react'
import { BRAND, CONTACT, NAV_CTA, NAV_LINKS } from '../config'
import useActiveSection from '../hooks/useActiveSection'
import Logo from './Logo'
import RollText from './RollText'
import ThemeToggle from './ThemeToggle'
import useTheme from '../hooks/useTheme'
import { scrollToId } from '../lib/scroll'
import './Nav.css'

const SECTION_IDS = ['hero', ...NAV_LINKS.map((l) => l.id), NAV_CTA.id]

const goTo = scrollToId

export default function Nav({ ready = true }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const active = useActiveSection(SECTION_IDS)
  const { theme, toggle: toggleTheme } = useTheme()

  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    if (open) return
    if (y > 320 && y > prev + 2) setHidden(true)
    else if (y <= 320 || y < prev - 2) setHidden(false)
  })

  useEffect(() => {
    document.documentElement.classList.toggle('scroll-locked', open)
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('scroll-locked')
    }
  }, [open])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1081px)')
    const close = () => mq.matches && setOpen(false)
    mq.addEventListener('change', close)
    return () => mq.removeEventListener('change', close)
  }, [])

  const handleNav = useCallback(
    (e, id) => {
      e.preventDefault()
      if (open) {
        setOpen(false)
        window.setTimeout(() => goTo(id), 60)
      } else {
        goTo(id)
      }
    },
    [open],
  )

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'is-scrolled' : ''}`}
        data-theme={scrolled || open ? undefined : 'dark'}
        initial={{ y: -90, opacity: 0 }}
        animate={ready ? { y: hidden && !open ? -100 : 0, opacity: 1 } : { y: -90, opacity: 0 }}
        transition={{ duration: hidden ? 0.4 : 0.9, ease: [0.16, 1, 0.3, 1], delay: hidden ? 0 : 0.15 }}
      >
        <nav className="nav-inner" aria-label="Primary">
          <a href="#hero" className="nav-logo" aria-label={`${BRAND.name} — back to top`} onClick={(e) => handleNav(e, 'hero')}>
            <Logo />
          </a>

          <ul className="nav-links">
            {NAV_LINKS.map((link, i) => (
              <motion.li
                key={link.id}
                initial={{ opacity: 0, y: -12 }}
                animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.45 + i * 0.07 }}
              >
                <a
                  href={`#${link.id}`}
                  className={`nav-link ${active === link.id ? 'is-active' : ''}`}
                  aria-current={active === link.id ? 'true' : undefined}
                  onClick={(e) => handleNav(e, link.id)}
                >
                  <RollText>{link.label}</RollText>
                  {active === link.id && (
                    <motion.span
                      layoutId="nav-dot"
                      className="nav-dot"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </a>
              </motion.li>
            ))}
          </ul>

          <div className="nav-right">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <motion.a
            href={`#${NAV_CTA.id}`}
            className="btn-cta nav-cta"
            onClick={(e) => handleNav(e, NAV_CTA.id)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={ready ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
            whileTap={{ scale: 0.96 }}
          >
            <span>{NAV_CTA.label}</span>
            <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.a>

          <button
            type="button"
            className={`menu-btn ${open ? 'is-open' : ''}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span className="menu-lines" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
          </div>
        </nav>

        <motion.div className="nav-progress" style={{ scaleX: progress }} aria-hidden="true" />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease: [0.7, 0, 0.2, 1] }}
          >
            <ul className="mobile-links">
              {[...NAV_LINKS, NAV_CTA].map((link, i) => (
                <li key={link.id} className="mobile-li">
                  <motion.a
                    href={`#${link.id}`}
                    className="mobile-link"
                    onClick={(e) => handleNav(e, link.id)}
                    initial={{ y: '110%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '110%' }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.07 }}
                  >
                    <span className="mobile-num">0{i + 1}</span>
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              className="mobile-foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.7 }}
            >
              <a href={`mailto:${CONTACT.email}`} className="label">
                {CONTACT.email}
              </a>
              <span className="mobile-socials">
                {CONTACT.socials.map((s) => (
                  <a key={s.label} href={s.href} className="label" target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                ))}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
