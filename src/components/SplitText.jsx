import { motion } from 'motion/react'
import './SplitText.css'

const EASE = [0.16, 1, 0.3, 1]

function toWords(parts) {
  const list = Array.isArray(parts) ? parts : [parts]
  const words = []
  list.forEach((part) => {
    const p = typeof part === 'string' ? { t: part } : part
    if (p.br) {
      words.push({ br: true })
      return
    }
    p.t
      .split(' ')
      .filter(Boolean)
      .forEach((w) => words.push({ w, className: p.className || '' }))
  })
  return words
}

/**
 * Kinetic headline: words/characters rise out of a mask.
 * parts: 'plain string' or [ 'text ', { t: 'italic', className: 'serif' }, { br: true } ]
 * when:  omit to animate on scroll-in; pass true/false to control it yourself (e.g. after the intro).
 */
export default function SplitText({
  parts,
  as = 'span',
  by = 'char',
  delay = 0,
  stagger,
  y = '118%',
  rotate = 5,
  when,
  amount = 0.5,
  className = '',
}) {
  const Tag = motion[as]
  const words = toWords(parts)
  const step = stagger ?? (by === 'char' ? 0.018 : 0.055)
  const label = words.filter((w) => !w.br).map((w) => w.w).join(' ')

  const item = {
    hidden: { y, rotate },
    show: (i) => ({ y: 0, rotate: 0, transition: { duration: 0.65, ease: EASE, delay: delay + i * step } }),
  }

  const trigger =
    when === undefined
      ? { initial: 'hidden', whileInView: 'show', viewport: { once: true, amount } }
      : { initial: 'hidden', animate: when ? 'show' : 'hidden' }

  let n = 0
  return (
    <Tag className={`split ${className}`} {...trigger}>
      <span className="sr-only">{label}</span>
      {words.map((word, wi) => {
        if (word.br) return <br key={`br-${wi}`} aria-hidden="true" />
        const isLast = wi === words.length - 1 || words[wi + 1]?.br
        return (
          <span key={`${word.w}-${wi}`} className={`split-word ${word.className}`} aria-hidden="true">
            {by === 'char' ? (
              word.w.split('').map((ch, ci) => (
                <motion.span key={ci} className="split-char" variants={item} custom={n++}>
                  {ch}
                </motion.span>
              ))
            ) : (
              <motion.span className="split-char" variants={item} custom={n++}>
                {word.w}
              </motion.span>
            )}
            {!isLast && ' '}
          </span>
        )
      })}
    </Tag>
  )
}
