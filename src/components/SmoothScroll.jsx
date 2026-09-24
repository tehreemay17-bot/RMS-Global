import { useEffect } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { setLenis } from '../lib/scroll'
import useSmoothScrollPref from '../hooks/useScrollPrefs'

// Inertial ("buttery") page scrolling. Off for visitors who prefer reduced motion or who switch it off in the scroll dock.
export default function SmoothScroll() {
  const enabled = useSmoothScrollPref()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!enabled || reduce) return undefined

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      smoothWheel: true,
      autoRaf: true,
      anchors: { duration: 1.6 },
    })
    setLenis(lenis)

    // Overlays (menu, photo viewer) lock page scroll by adding a class to <html>: mirror that here.
    const sync = () => (document.documentElement.classList.contains('scroll-locked') ? lenis.stop() : lenis.start())
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      mo.disconnect()
      setLenis(null)
      lenis.destroy()
    }
  }, [enabled])

  return null
}
