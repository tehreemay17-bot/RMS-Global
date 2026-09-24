import { useEffect, useState } from 'react'

// Returns the id of the section currently crossing the middle of the viewport.
export default function useActiveSection(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!els.length) return undefined

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids])

  return active
}
