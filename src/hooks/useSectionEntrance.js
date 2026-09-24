import { useReducedMotion, useScroll, useTransform } from 'motion/react'

// Style for a section that "rises into place": it starts slightly smaller with rounded top corners and
// settles flat as its top edge reaches the middle of the screen. Spread the result onto a motion.section.
// (Avoid using it on sections that pin/scale internally.)
export default function useSectionEntrance(ref) {
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.4'] })
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1])
  const radius = useTransform(scrollYProgress, [0, 1], [56, 0])
  if (reduce) return undefined
  return { scale, borderTopLeftRadius: radius, borderTopRightRadius: radius, transformOrigin: '50% 0%' }
}
