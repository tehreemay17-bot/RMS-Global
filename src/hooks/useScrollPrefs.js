import { useSyncExternalStore } from 'react'

// Visitor preference: inertial "smooth scrolling" on/off. OFF by default (native scrolling is the fastest and most
// responsive; the inertia layer felt laggy and costs work on every frame); saved in localStorage.
const KEY = 'rms-smooth-scroll'
const listeners = new Set()

function read() {
  try {
    return localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

let smooth = read()

export function setSmoothScroll(value) {
  smooth = value
  try {
    localStorage.setItem(KEY, value ? 'on' : 'off')
  } catch {
    /* storage blocked: preference lasts for this visit */
  }
  listeners.forEach((l) => l())
}

export default function useSmoothScrollPref() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => smooth,
    () => false,
  )
}
