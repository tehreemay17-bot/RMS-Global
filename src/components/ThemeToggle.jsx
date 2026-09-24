import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const icon = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

// Shows the mode you would switch TO: a sun while in dark mode, a moon while in light mode.
export default function ThemeToggle({ theme, onToggle }) {
  const ref = useRef(null)
  const toLight = theme === 'dark'
  const label = toLight ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <button
      ref={ref}
      type="button"
      className="theme-toggle"
      onClick={() => onToggle(ref.current)}
      aria-label={label}
      title={label}
    >
      <AnimatePresence initial={false} mode="wait">
        {toLight ? (
          <motion.svg
            key="sun"
            viewBox="0 0 24 24"
            {...icon}
            aria-hidden="true"
            initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
          </motion.svg>
        ) : (
          <motion.svg
            key="moon"
            viewBox="0 0 24 24"
            {...icon}
            aria-hidden="true"
            initial={{ rotate: 90, scale: 0.4, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  )
}
