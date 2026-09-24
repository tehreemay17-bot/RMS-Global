import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { formatLong } from '../utils/date'
import './Calendar.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const sameDay = (a, b) => a && b && a.getTime() === b.getTime()

/** Dark-themed month calendar. Past days and `closedWeekdays` are disabled. */
export default function Calendar({ value, onChange, closedWeekdays = [] }) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const [view, setView] = useState(() => new Date((value || today).getFullYear(), (value || today).getMonth(), 1))
  const [dir, setDir] = useState(1)

  const year = view.getFullYear()
  const month = view.getMonth()
  const monthLabel = view.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const canGoPrev = year > today.getFullYear() || month > today.getMonth()

  const cells = useMemo(() => {
    const first = new Date(year, month, 1)
    const lead = (first.getDay() + 6) % 7 // Monday first
    const days = new Date(year, month + 1, 0).getDate()
    return [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1))]
  }, [year, month])

  const shift = (n) => {
    setDir(n)
    setView(new Date(year, month + n, 1))
  }

  return (
    <div className="cal">
      <div className="cal-head">
        <button type="button" className="cal-nav" onClick={() => shift(-1)} disabled={!canGoPrev} aria-label="Previous month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>
        <div className="cal-title" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={monthLabel}
              className="display"
              initial={{ opacity: 0, y: dir * 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: dir * -14 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {monthLabel}
            </motion.span>
          </AnimatePresence>
        </div>
        <button type="button" className="cal-nav" onClick={() => shift(1)} aria-label="Next month">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 5 7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="cal-weekdays" aria-hidden="true">
        {WEEKDAYS.map((w) => (
          <span key={w} className="label">
            {w}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={monthLabel}
          className="cal-grid"
          initial={{ opacity: 0, x: dir * 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -28 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {cells.map((d, i) => {
            if (!d) return <span key={`e-${i}`} />
            const disabled = d < today || closedWeekdays.includes(d.getDay())
            const selected = sameDay(d, value)
            return (
              <button
                key={d.getTime()}
                type="button"
                className={`cal-day ${selected ? 'is-selected' : ''} ${sameDay(d, today) ? 'is-today' : ''}`}
                disabled={disabled}
                aria-pressed={selected}
                aria-label={formatLong(d)}
                onClick={() => onChange(d)}
              >
                {d.getDate()}
              </button>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
