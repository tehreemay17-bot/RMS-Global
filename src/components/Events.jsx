import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { BRAND } from '../config'
import { EVENT_META, PLACEHOLDER_EVENTS } from '../data/events'
import Lightbox from './Lightbox'
import Magnetic from './Magnetic'
import MediaTile from './MediaTile'
import Reveal from './Reveal'
import SplitText from './SplitText'
import Watermark from './Watermark'
import useSectionEntrance from '../hooks/useSectionEntrance'
import './Events.css'

// Every file dropped into src/media/events/ is picked up here automatically (see data/events.js for naming).
const FILES = import.meta.glob('/src/media/events/*.{jpg,jpeg,png,webp,avif,gif,svg,mp4,webm,mov}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const VIDEO_EXT = /\.(mp4|webm|mov)$/i

const titleCase = (slug) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((w) => (/^\d+$/.test(w) ? w : w[0].toUpperCase() + w.slice(1)))
    .join(' ')

// "corporate-gala-01.jpg" and "corporate-gala-02.mp4" share the prefix "corporate-gala" -> one event.
function buildEventsFromFiles() {
  const groups = new Map()
  Object.entries(FILES).forEach(([path, url]) => {
    const file = path.split('/').pop()
    const m = file.match(/^(.*?)[-_ ]?(\d+)\.([a-z0-9]+)$/i)
    const key = (m ? m[1] : file.replace(/\.[^.]+$/, '')).toLowerCase()
    const n = m ? Number(m[2]) : 0
    const type = VIDEO_EXT.test(file) ? 'video' : 'image'
    const title = EVENT_META[key]?.title || titleCase(key)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push({ n, item: { type, src: url, alt: `${title}, ${type} ${n || ''}`.trim() } })
  })
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => ({
      id: key,
      title: EVENT_META[key]?.title || titleCase(key),
      category: EVENT_META[key]?.category,
      place: EVENT_META[key]?.place,
      year: EVENT_META[key]?.year,
      blurb: EVENT_META[key]?.blurb,
      items: list.sort((a, b) => a.n - b.n).map((x) => x.item),
    }))
}

// Bento-style spans that repeat every 6 items.
function spanFor(i, total) {
  if (total <= 2) return { gridColumn: 'span 6', gridRow: 'span 2' }
  const p = i % 6
  const map = [
    { c: 7, r: 2 },
    { c: 5, r: 1 },
    { c: 5, r: 1 },
    { c: 4, r: 1 },
    { c: 4, r: 1 },
    { c: 4, r: 1 },
  ][p]
  return { gridColumn: `span ${map.c}`, gridRow: `span ${map.r}` }
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// "20 photos" or "3 films, 3 photos"
function countLabel(items) {
  const films = items.filter((m) => m.type === 'video').length
  const photos = items.length - films
  return [films && plural(films, 'film'), photos && plural(photos, 'photo')].filter(Boolean).join(', ')
}

function EventGroup({ event, index, onOpenPhoto }) {
  const meta = [event.place, event.year, countLabel(event.items)].filter(Boolean).join(' · ')

  // the big outlined number fills with colour as you scroll through the event
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.75', 'end 0.55'] })
  const fill = useTransform(scrollYProgress, [0, 1], ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'])
  const num = String(index + 1).padStart(2, '0')

  return (
    <motion.article
      ref={ref}
      className="event"
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="event-head">
        <span className="event-num-wrap display" aria-hidden="true">
          <span className="event-num">{num}</span>
          <motion.span className="event-num is-fill" style={reduce ? { clipPath: 'inset(0 0 0 0)' } : { clipPath: fill }}>
            {num}
          </motion.span>
        </span>
        {event.category && (
          <Reveal as="p" className="label event-cat" y={10}>
            {event.category}
          </Reveal>
        )}
        <h3 className="event-title display">
          <SplitText parts={event.title} by="word" stagger={0.05} />
        </h3>
        <Reveal as="p" className="label event-meta" y={12}>
          {meta}
        </Reveal>
        {event.blurb && (
          <Reveal as="p" className="event-blurb" y={16} delay={0.05}>
            {event.blurb}
          </Reveal>
        )}
      </header>

      <div className="event-grid">
        {event.items.map((item, i) => (
          <MediaTile
            key={item.src + i}
            item={item}
            index={i % 6}
            onOpen={onOpenPhoto}
            parallax
            style={spanFor(i, event.items.length)}
          />
        ))}
      </div>
    </motion.article>
  )
}

export default function Events() {
  const sectionRef = useRef(null)
  const entrance = useSectionEntrance(sectionRef)
  const events = useMemo(() => {
    const real = buildEventsFromFiles()
    return real.length ? real : PLACEHOLDER_EVENTS
  }, [])
  const [filter, setFilter] = useState('all')
  const [lb, setLb] = useState(null)

  const films = events.reduce((n, e) => n + e.items.filter((m) => m.type === 'video').length, 0)
  // a photo used in two projects is counted once
  const photos = new Set(events.flatMap((e) => e.items.filter((m) => m.type === 'image').map((m) => m.src))).size
  const stats = [
    { n: events.length, label: 'Projects shown' },
    { n: photos, label: 'Photos' },
    { n: films, label: 'Films' },
    { n: `Est. ${BRAND.est}`, label: 'Lahore, Pakistan' },
  ]

  const shown = filter === 'all' ? events : events.filter((e) => e.id === filter)
  const lbEvent = lb ? events.find((e) => e.id === lb.id) : null
  const lbPhotos = lbEvent ? lbEvent.items.filter((m) => m.type === 'image') : []

  return (
    <motion.section ref={sectionRef} id="portfolio" className="events section" style={entrance}>
      <Watermark text="Portfolio" align="top" from="22%" to="-48%" />
      <div className="hairline" aria-hidden="true" />

      <div className="container">
        <div className="section-head events-head">
          <Reveal as="p" className="eyebrow" y={16}>
            01 — Our portfolio
          </Reveal>
          <h2 className="section-title display">
            <SplitText
              parts={['Work we’ve', { br: true }, { t: 'delivered.', className: 'serif events-accent' }]}
              by="word"
              stagger={0.07}
            />
          </h2>
          <div className="events-tools">
            <Reveal as="p" className="lead" y={20} delay={0.1}>
              Launches, concerts, corporate activations and the nights behind them. Browse project by project, tap a
              photo to enlarge it or a film to play.
            </Reveal>
            <LayoutGroup id="event-filters">
              <div className="filters" role="group" aria-label="Browse projects">
                {[{ id: 'all', title: 'All work' }, ...events].map((e, i) => (
                  <button
                    key={e.id}
                    type="button"
                    className={`filter label ${filter === e.id ? 'is-on' : ''}`}
                    aria-pressed={filter === e.id}
                    onClick={() => setFilter(e.id)}
                  >
                    {filter === e.id && (
                      <motion.span
                        layoutId="event-filter-pill"
                        className="filter-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                      />
                    )}
                    <span>
                      {i > 0 && <b className="filter-n">{String(i).padStart(2, '0')}</b>}
                      {e.title}
                    </span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </div>
        </div>

        <ul className="pf-stats" aria-label="Portfolio at a glance">
          {stats.map((st) => (
            <Reveal as="li" key={st.label} className="pf-stat" y={20}>
              <span className="pf-stat-n display">{st.n}</span>
              <span className="label">{st.label}</span>
            </Reveal>
          ))}
        </ul>

        <div className="event-list">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((event) => (
              <EventGroup
                key={event.id}
                event={event}
                index={events.indexOf(event)}
                onOpenPhoto={(item) =>
                  setLb({ id: event.id, index: event.items.filter((m) => m.type === 'image').findIndex((p) => p.src === item.src) })
                }
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="pf-cta">
          <Reveal as="p" className="pf-cta-text display" y={20}>
            Have a project in mind?
          </Reveal>
          <Reveal y={20} delay={0.1}>
            <Magnetic>
              <a href="#book" className="btn-cta">
                <span>Start a project</span>
                <svg className="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </Magnetic>
          </Reveal>
        </div>
      </div>

      <Lightbox
        items={lbPhotos}
        index={lb ? lb.index : null}
        onClose={() => setLb(null)}
        onIndex={(i) => setLb((cur) => (cur ? { ...cur, index: i } : cur))}
      />
    </motion.section>
  )
}
