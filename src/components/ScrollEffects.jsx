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
    const off = smooth.on('change', (v) => {
      const skew = Math.max(-5, Math.min(5, -v / 480))
      root.style.setProperty('--scroll-skew', `${skew.toFixed(2)}deg`)
    })
    return () => {
      off()
      root.style.removeProperty('--scroll-skew')
    }
  }, [smooth, reduce])

  return null
}
