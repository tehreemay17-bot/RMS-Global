// Tiny bridge so any component can scroll programmatically, whether or not smooth scrolling is active.
let lenis = null

export function setLenis(instance) {
  lenis = instance
}

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function scrollToY(y, { duration = 1.6 } = {}) {
  if (lenis && !reduced()) lenis.scrollTo(y, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) })
  else window.scrollTo({ top: y, behavior: reduced() ? 'auto' : 'smooth' })
}

export function scrollToId(id) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY
  scrollToY(y)
  window.history.replaceState(null, '', `#${id}`)
}
