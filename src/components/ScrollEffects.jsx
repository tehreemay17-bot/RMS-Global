import { useEffect } from 'react'
import { useReducedMotion, useScroll, useSpring, useVelocity } from 'motion/react'

// Publishes the page's scroll speed as a CSS variable (--scroll-skew, in degrees) so big headings
// lean into the direction you're scrolling and settle back when you stop. One subscription for the whole site.
export default function ScrollEffects() {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { stiffness: 250, damping: 40, mass: 0.6 })

  useEffect(() => {
    if (reduce) return undefined
    const root = document.documentElement
    let last = ''
    const off = smooth.on('change', (v) => {
      const skew = Math.max(-5, Math.min(5, -v / 480))
      const next = `${skew.toFixed(2)}deg`
      // skip the (very frequent) ticks that round to the same value already on screen —
      // this is set on the root element and read by every big heading, so a redundant
      // write there isn't free.
      if (next === last) return
      last = next
      root.style.setProperty('--scroll-skew', next)
    })
    return () => {
      off()
      root.style.removeProperty('--scroll-skew')
    }
  }, [smooth, reduce])

  return null
}
