import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { BRAND, CONTACT, NAV_CTA, NAV_LINKS } from '../config'
import { waLink } from '../lib/whatsapp'
import Magnetic from './Magnetic'
import Reveal from './Reveal'
import RollText from './RollText'
import SplitText from './SplitText'
import useSectionEntrance from '../hooks/useSectionEntrance'
import './Footer.css'

export default function Footer() {
  const ref = useRef(null)
  const entrance = useSectionEntrance(ref)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const fill = useTransform(scrollYProgress, [0.25, 0.95], ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'])

  return (
    <motion.footer ref={ref} id="contact" className="footer" style={entrance}>
      <div className="hairline" aria-hidden="true" />

      <div className="container footer-top">
        <div className="footer-lead">
          <Reveal as="p" className="eyebrow" y={16}>
            08 — Say hello
          </Reveal>
          <h2 className="footer-tagline display">
            <SplitText
              parts={[
                'Ideas.',
                { br: true },
                { t: 'Influence.', className: 'serif footer-hot' },
                { br: true },
                'Experiences.',
              ]}
              by="word"
              stagger={0.14}
            />
          </h2>
          <Reveal y={20} delay={0.1}>
            <Magnetic>
              <a href={`#${NAV_CTA.id}`} className="btn-cta">
                <span>{NAV_CTA.label}</span>
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </Magnetic>
          </Reveal>
        </div>

        <div className="footer-cols">
          <Reveal className="footer-col" y={28} delay={0.05}>
            <h3 className="label">Contact</h3>
            <ul>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="footer-link">
                  <RollText>{CONTACT.email}</RollText>
                </a>
              </li>
              <li>
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className="footer-link">
                  <RollText>{CONTACT.phone}</RollText>
                </a>
              </li>
              <li>
                <a href={waLink(CONTACT.whatsapp)} className="footer-link" target="_blank" rel="noreferrer">
                  <RollText>WhatsApp</RollText>
                </a>
              </li>
              <li className="footer-plain">{CONTACT.address}</li>
              <li className="footer-plain footer-hours">{CONTACT.hours}</li>
            </ul>
          </Reveal>

          <Reveal className="footer-col" y={28} delay={0.12}>
            <h3 className="label">Follow</h3>
            <ul>
              {CONTACT.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className="footer-link" target="_blank" rel="noreferrer">
                    <RollText>{s.label}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="footer-col" y={28} delay={0.19}>
            <h3 className="label">Explore</h3>
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="footer-link">
                    <RollText>{l.label}</RollText>
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>

      <div className="footer-mark" aria-hidden="true">
        <span className="footer-mark-outline">{BRAND.name}</span>
        <motion.span className="footer-mark-fill" style={{ clipPath: fill }}>
          {BRAND.name}
        </motion.span>
      </div>

      <div className="container footer-bar">
        <p className="label">
          © {new Date().getFullYear()} {BRAND.name} — {BRAND.fullName}
        </p>
        <a href="#hero" className="footer-top-link label">
          Back to top
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 13V3M4 7l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
        <p className="label footer-est">Est. {BRAND.est}</p>
      </div>
    </motion.footer>
  )
}
