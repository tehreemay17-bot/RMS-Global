import { useCallback, useState } from 'react'
import { flushSync } from 'react-dom'

const KEY = 'rms-theme'
const META_COLOR = { dark: '#000000', light: '#f8f5fd' }

// index.html sets data-theme before first paint (dark unless the visitor previously chose light).
const read = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* storage blocked: the choice simply lasts for this visit */
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme])
}

export default function useTheme() {
  const [theme, setTheme] = useState(read)

  // origin: the element to expand the colour change from (the toggle button)
  const toggle = useCallback(
    (origin) => {
      const next = theme === 'dark' ? 'light' : 'dark'
      const commit = () => {
        if (read() === next) return
        apply(next)
        flushSync(() => setTheme(next))
      }

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce || typeof document.startViewTransition !== 'function') {
        commit()
        return
      }

      const rect = origin?.getBoundingClientRect()
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
      const y = rect ? rect.top + rect.height / 2 : 0
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

      const transition = document.startViewTransition(commit)
      // safety net: if the browser stalls rendering, the switch must still happen
      window.setTimeout(commit, 1500)
      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 900, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
          )
        })
        .catch(() => {})
    },
    [theme],
  )

  return { theme, toggle }
}
