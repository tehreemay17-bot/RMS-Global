import { motion } from 'motion/react'

const EASE = [0.16, 1, 0.3, 1]

// Fade + slide + scale in as the element enters the viewport.
export default function Reveal({
  as = 'div',
  y = 32,
  x = 0,
  scale = 1,
  delay = 0,
  duration = 0.95,
  amount = 0.25,
  once = true,
  children,
  ...rest
}) {
  const Tag = motion[as]
  return (
    <Tag
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
