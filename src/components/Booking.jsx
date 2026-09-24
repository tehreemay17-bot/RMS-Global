import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { BOOKING, CONTACT, FORMSPREE_ID } from '../config'
import { formatLong } from '../utils/date'
import { waLink } from '../lib/whatsapp'
import Calendar from './Calendar'
import Reveal from './Reveal'
import SplitText from './SplitText'
import Watermark from './Watermark'
import useSectionEntrance from '../hooks/useSectionEntrance'
import './Booking.css'

const EASE = [0.16, 1, 0.3, 1]
const isConfigured = !/^YOUR_/i.test(FORMSPREE_ID)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const validPhone = (p) => /^[+\d][\d\s\-()]*$/.test(p.trim()) && p.replace(/\D/g, '').length >= 7 && p.replace(/\D/g, '').length <= 15

function Field({ id, label, error, textarea, optional, ...props }) {
  const Tag = textarea ? 'textarea' : 'input'
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="label">
        {label}
        {optional && <em> (optional)</em>}
      </label>
      <Tag
        id={id}
        name={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        data-invalid={error ? 'true' : undefined}
        rows={textarea ? 4 : undefined}
        {...props}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-err`}
            className="field-error"
            role="alert"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Sent({ name, date, slot, demo, onReset }) {
  const headingRef = useRef(null)
  useEffect(() => headingRef.current?.focus(), [])
  const first = name.trim().split(' ')[0]
  return (
    <motion.div
      className="sent"
      role="status"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <svg className="sent-check" viewBox="0 0 96 96" fill="none" aria-hidden="true">
        <motion.circle
          cx="48"
          cy="48"
          r="42"
          style={{ stroke: 'var(--accent)' }}
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: EASE }}
        />
        <motion.path
          d="m30 50 12 12 25-27"
          style={{ stroke: 'var(--text)' }}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
        />
      </svg>
      <h3 ref={headingRef} tabIndex={-1} className="sent-title display">
        Thank you, <span className="serif work-accent">{first}.</span>
      </h3>
      <p className="sent-text">
        Your meeting request is in. We&rsquo;ll confirm <strong>{formatLong(date)}</strong> at <strong>{slot}</strong> by
        email within one working day.
      </p>
      {demo && (
        <p className="sent-demo label">
          Demo mode: the Formspree ID isn&rsquo;t set yet, so nothing was actually sent.
        </p>
      )}
      <button type="button" className="btn-ghost" onClick={onReset}>
        <span>Book another time</span>
      </button>
    </motion.div>
  )
}

export default function Booking() {
  const sectionRef = useRef(null)
  const entrance = useSectionEntrance(sectionRef)
  const reduce = useReducedMotion()
  const { scrollYProgress: bookP } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const orbY1 = useTransform(bookP, [0, 1], reduce ? [0, 0] : [-160, 220])
  const orbY2 = useTransform(bookP, [0, 1], reduce ? [0, 0] : [200, -200])
  const [date, setDate] = useState(null)
  const [slot, setSlot] = useState('')
  const [values, setValues] = useState({ name: '', phone: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('')
  const [demo, setDemo] = useState(false)
  const [sentSnapshot, setSentSnapshot] = useState(null)
  const honey = useRef(null)

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }))
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }))
  }

  const validate = () => {
    const er = {}
    if (!date) er.date = 'Please pick a date.'
    if (date && !slot) er.slot = 'Please choose a time.'
    if (values.name.trim().length < 2) er.name = 'Please enter your full name.'
    if (!validPhone(values.phone)) er.phone = 'Enter a valid phone number, e.g. +92 300 1234567.'
    if (!EMAIL_RE.test(values.email.trim())) er.email = 'Enter a valid email address.'
    return er
  }

  const submit = async (e) => {
    e.preventDefault()
    if (honey.current?.value) return // bots fill the hidden field
    const er = validate()
    setErrors(er)
    if (Object.keys(er).length) {
      setTimeout(() => document.querySelector('[data-invalid="true"]')?.focus(), 30)
      return
    }

    setStatus('sending')
    setErrorMsg('')
    const snapshot = { name: values.name, date, slot }

    try {
      if (!isConfigured) {
        if (import.meta.env.DEV) {
          console.warn('[Booking] FORMSPREE_ID is not set in src/config.js. Running in demo mode: nothing was sent.')
          await sleep(1400)
          setDemo(true)
        } else {
          throw new Error('not-configured')
        }
      } else {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            _subject: `New meeting request from ${values.name.trim()}`,
            name: values.name.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
            meeting_date: formatLong(date),
            meeting_time: slot,
            message: values.message.trim() || '(no message)',
          }),
        })
        if (!res.ok) throw new Error('send-failed')
      }
      setSentSnapshot(snapshot)
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setErrorMsg(
        err.message === 'not-configured'
          ? 'The booking form is not connected yet. Please email or call us using the details on this page.'
          : `Something went wrong sending your request. Please try again, or email ${CONTACT.email}.`,
      )
    }
  }

  const reset = () => {
    setDate(null)
    setSlot('')
    setValues({ name: '', phone: '', email: '', message: '' })
    setErrors({})
    setStatus('idle')
    setDemo(false)
    setSentSnapshot(null)
  }

  const sending = status === 'sending'

  return (
    <motion.section ref={sectionRef} id="book" className="book section" style={entrance}>
      <Watermark text="Hello" align="top" from="20%" to="-44%" />
      <div className="hairline" aria-hidden="true" />
      <motion.span className="book-orb-par" style={{ y: orbY1 }} aria-hidden="true">
        <span className="book-orb book-orb-1" />
      </motion.span>
      <motion.span className="book-orb-par" style={{ y: orbY2 }} aria-hidden="true">
        <span className="book-orb book-orb-2" />
      </motion.span>

      <div className="container book-grid">
        <div className="book-copy">
          <Reveal as="p" className="eyebrow" y={16}>
            07 — Book a meeting
          </Reveal>
          <h2 className="section-title display book-title">
            <SplitText
              parts={['Let’s talk', { br: true }, 'about your', { br: true }, { t: 'next moment.', className: 'serif work-accent' }]}
              by="word"
              stagger={0.06}
            />
          </h2>
          <Reveal as="p" className="lead" y={20} delay={0.1}>
            Bring us the brief, the audience or just the ambition. Pick a date and time that suits you and we&rsquo;ll come
            back within one working day to confirm.
          </Reveal>

          <ul className="book-contact">
            {[
              ['Email', CONTACT.email, `mailto:${CONTACT.email}`],
              ['Phone', CONTACT.phone, `tel:${CONTACT.phone.replace(/\s/g, '')}`],
              ['WhatsApp', CONTACT.whatsapp, waLink(CONTACT.whatsapp)],
              ['Studio', CONTACT.address],
              ['Hours', CONTACT.hours],
            ].map(([k, v, href], i) => (
              <Reveal as="li" key={k} y={20} delay={0.15 + i * 0.07} className="book-contact-row">
                <span className="label">{k}</span>
                {href ? (
                  <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    {v}
                  </a>
                ) : (
                  <span>{v}</span>
                )}
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal className="book-card" y={70} scale={0.96} duration={1.2} amount={0.15}>
          <span className="book-card-edge" aria-hidden="true" />
          <AnimatePresence mode="wait" initial={false}>
            {status === 'sent' && sentSnapshot ? (
              <Sent key="sent" {...sentSnapshot} demo={demo} onReset={reset} />
            ) : (
              <motion.form
                key="form"
                className="book-form"
                onSubmit={submit}
                noValidate
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.4 }}
              >
                <fieldset className="step-block" data-invalid={errors.date ? 'true' : undefined} tabIndex={errors.date ? -1 : undefined}>
                  <legend>
                    <span className="step-n">01</span> Pick a date
                  </legend>
                  <Calendar
                    value={date}
                    onChange={(d) => {
                      setDate(d)
                      setSlot('')
                      setErrors((er) => ({ ...er, date: undefined, slot: undefined }))
                    }}
                    closedWeekdays={BOOKING.closedWeekdays}
                  />
                  {errors.date && <p className="field-error" role="alert">{errors.date}</p>}
                </fieldset>

                <fieldset className="step-block" data-invalid={errors.slot ? 'true' : undefined} tabIndex={errors.slot ? -1 : undefined}>
                  <legend>
                    <span className="step-n">02</span> Choose a time
                  </legend>
                  {date ? (
                    <motion.div
                      key={date.getTime()}
                      className="slots"
                      role="group"
                      aria-label={`Available times on ${formatLong(date)}`}
                      initial="hidden"
                      animate="show"
                      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                    >
                      {BOOKING.slots.map((s) => (
                        <motion.button
                          key={s}
                          type="button"
                          className={`slot ${slot === s ? 'is-selected' : ''}`}
                          aria-pressed={slot === s}
                          onClick={() => {
                            setSlot(s)
                            setErrors((er) => ({ ...er, slot: undefined }))
                          }}
                          variants={{ hidden: { opacity: 0, y: 14, scale: 0.94 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } } }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {s}
                        </motion.button>
                      ))}
                    </motion.div>
                  ) : (
                    <p className="slots-hint label">Choose a date first to see available times.</p>
                  )}
                  <p className="tz label">{BOOKING.timezoneNote}</p>
                  {errors.slot && <p className="field-error" role="alert">{errors.slot}</p>}
                </fieldset>

                <fieldset className="step-block">
                  <legend>
                    <span className="step-n">03</span> Your details
                  </legend>
                  <div className="fields">
                    <Field id="name" label="Full name" autoComplete="name" placeholder="Your full name" value={values.name} onChange={set('name')} error={errors.name} />
                    <Field id="phone" label="Phone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="+92 300 1234567" value={values.phone} onChange={set('phone')} error={errors.phone} />
                    <Field id="email" label="Email" type="email" autoComplete="email" placeholder="you@company.com" value={values.email} onChange={set('email')} error={errors.email} />
                    <Field id="message" label="Message" optional textarea placeholder="Tell us about the event, brand or idea…" value={values.message} onChange={set('message')} />
                  </div>
                </fieldset>

                <input ref={honey} type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="honey" />

                <AnimatePresence>
                  {date && slot && (
                    <motion.p
                      className="book-summary label"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {formatLong(date)} · {slot}
                    </motion.p>
                  )}
                </AnimatePresence>

                <button type="submit" className="btn-cta book-submit" disabled={sending}>
                  {sending ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      <span>Request meeting</span>
                      <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {status === 'error' && (
                    <motion.p
                      className="form-error"
                      role="alert"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {errorMsg}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </motion.section>
  )
}
