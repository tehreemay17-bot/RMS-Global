import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import './Watermark.css'

// A giant outlined word behind a section that slides sideways as you scroll through it.
// Put it as the first child of a <section className="section"> (sections isolate their stacking context).
export default function Watermark({ text, from = '18%', to = '-46%', align = 'center' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const x = useTransform(scrollYProgress, [0, 1], [from, to])

  return (
    <div ref={ref} className={`watermark is-${align}`} aria-hidden="true">
      <motion.span className="serif" style={reduce ? undefined : { x }}>
        {text}
      </motion.span>
    </div>
  )
}
