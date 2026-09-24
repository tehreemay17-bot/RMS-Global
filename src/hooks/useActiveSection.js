import { useEffect, useState } from 'react'

// Returns the id of the section currently crossing the middle of the viewport.
export default function useActiveSection(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )

    // Lazy-loaded sections (React.lazy/Suspense) swap their placeholder for the real section
    // after mount, which replaces the DOM node — a MutationObserver catches that and re-points
    // the IntersectionObserver at the real element instead of the now-detached placeholder.
    const tracked = new Map() // id -> currently-observed Element
    const scan = () => {
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el && tracked.get(id) !== el) {
          const prev = tracked.get(id)
          if (prev) io.unobserve(prev)
          io.observe(el)
          tracked.set(id, el)
        }
      })
    }

    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [ids])

  return active
}
