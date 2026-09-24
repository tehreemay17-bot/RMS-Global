import { useCallback, useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { LayoutGroup, animate, motion, useInView, useReducedMotion } from 'motion/react'
import { CITIES, HQ_ID } from '../data/cities'
import useMediaQuery from '../hooks/useMediaQuery'
import Reveal from './Reveal'
import SplitText from './SplitText'
import Watermark from './Watermark'
import useSectionEntrance from '../hooks/useSectionEntrance'
import './WorkMap.css'

const EASE = [0.16, 1, 0.3, 1]
// Free OpenStreetMap raster tiles, no API key. Fine for a portfolio; for heavy traffic use your own tile host.
const OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// ids match the `region` field in data/cities.js
const FILTERS = [
  { id: 'all', label: 'All cities' },
  { id: 'pakistan', label: 'Pakistan' },
  { id: 'europe', label: 'Europe' },
  { id: 'asia-pacific', label: 'Asia-Pacific' },
  { id: 'world', label: 'Rest of world' },
]

const HQ = CITIES.find((c) => c.id === HQ_ID)
const COUNTRY_COUNT = new Set(CITIES.map((c) => c.country)).size
const NUMBER_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
]

// Curved "flight path" between two cities (quadratic bezier in lat/lng space).
function arc(from, to, steps = 72) {
  const [lat1, lng1] = from
  const [lat2, lng2] = to
  const dLat = lat2 - lat1
  const dLng = lng2 - lng1
  const s = dLng >= 0 ? 1 : -1
  const k = 0.26
  const cLat = (lat1 + lat2) / 2 + dLng * k * s
  const cLng = (lng1 + lng2) / 2 - dLat * k * s
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const u = 1 - t
    pts.push([u * u * lat1 + 2 * u * t * cLat + t * t * lat2, u * u * lng1 + 2 * u * t * cLng + t * t * lng2])
  }
  return pts
}

function pointAt(pts, t) {
  const f = t * (pts.length - 1)
  const i = Math.min(pts.length - 2, Math.floor(f))
  const k = f - i
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]
}

function pinIcon(city) {
  const hq = city.id === HQ_ID
  return L.divIcon({
    className: 'pin-wrap',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `<span class="pin ${hq ? 'is-hq' : ''}"><span class="pin-ring"></span><span class="pin-ring pin-ring-2"></span><span class="pin-core"></span><span class="pin-label">${city.name}</span></span>`,
  })
}

export default function WorkMap() {
  const sectionRef = useRef(null)
  const entrance = useSectionEntrance(sectionRef)
  const reduce = useReducedMotion()
  const isDesktop = useMediaQuery('(min-width: 900px)')

  const shellRef = useRef(null)
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(new Map())
  const routesRef = useRef([])
  const travelRef = useRef([])
  const timersRef = useRef([])
  const desktopRef = useRef(true)
  const activeRef = useRef(null)

  const [mapReady, setMapReady] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const [activeId, setActiveId] = useState(null)
  const [filter, setFilter] = useState('all')

  const revealed = useInView(shellRef, { once: true, amount: 0.25 })
  const visible = useInView(shellRef, { amount: 0.05 })

  desktopRef.current = isDesktop
  activeRef.current = activeId

  const inFilter = useCallback((c) => filter === 'all' || c.region === filter, [filter])

  const fitCities = useCallback(
    (list, { padRight = 0, instant = false, maxZoom } = {}) => {
      const map = mapRef.current
      if (!map || !list.length) return
      const bounds = L.latLngBounds(list.map((c) => c.coords))
      const pad = desktopRef.current ? 60 : 26
      const opts = {
        paddingTopLeft: [pad, desktopRef.current ? 80 : 64],
        paddingBottomRight: [pad + padRight, desktopRef.current ? 70 : 50],
        maxZoom: maxZoom ?? (list.length === 1 ? 6 : 5),
        duration: 2.2,
        easeLinearity: 0.2,
      }
      if (instant || reduce) map.fitBounds(bounds, { ...opts, animate: false })
      else map.flyToBounds(bounds, opts)
    },
    [reduce],
  )

  // Hide pin labels that would collide with another label or pin (Europe gets crowded on the world view).
  // HQ and the selected city always keep their labels; everything reappears as you zoom in.
  const declutter = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const pts = CITIES.map((c) => ({ city: c, p: map.latLngToContainerPoint(c.coords) }))
    const dots = pts.map(({ p }) => ({ l: p.x - 12, r: p.x + 12, t: p.y - 12, b: p.y + 12 }))
    const placed = []
    const overlap = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t
    const priority = [...pts].sort((a, b) => {
      const rank = (x) => (x.city.id === activeRef.current ? 0 : x.city.id === HQ_ID ? 1 : 2)
      return rank(a) - rank(b)
    })
    priority.forEach(({ city, p }) => {
      const pin = markersRef.current.get(city.id)?.getElement()?.querySelector('.pin')
      if (!pin) return
      const w = city.name.length * 8.4 + 26
      const box = { l: p.x - w / 2, r: p.x + w / 2, t: p.y + 12, b: p.y + 34 }
      const idx = pts.findIndex((x) => x.city.id === city.id)
      const hitsLabel = placed.some((q) => overlap(box, q))
      const hitsDot = dots.some((d, i) => i !== idx && overlap(box, d))
      const keep = city.id === activeRef.current || city.id === HQ_ID || (!hitsLabel && !hitsDot)
      pin.classList.toggle('label-off', !keep)
      if (keep) placed.push(box)
    })
  }, [])

  // ---- build the map once ------------------------------------------------------------------
  useEffect(() => {
    const map = L.map(mapEl.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      worldCopyJump: true,
      minZoom: 0.5,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      inertia: true,
    })
    map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>')
    L.tileLayer(OSM_URL, { attribution: OSM_ATTR, maxZoom: 18, subdomains: 'abc' }).addTo(map)
    L.control.zoom({ position: 'bottomleft' }).addTo(map)
    map.setView([30.2, 69], 5)
    mapRef.current = map

    const markFar = () => mapEl.current?.classList.toggle('is-far', map.getZoom() < 3.6)
    map.on('zoomend', markFar)
    map.on('moveend zoomend', declutter)
    markFar()

    // Scroll-wheel zoom only after the visitor clicks the map, so the page never gets "stuck".
    map.on('click', () => map.scrollWheelZoom.enable())
    const el = mapEl.current
    const off = () => map.scrollWheelZoom.disable()
    el.addEventListener('mouseleave', off)

    // Flight routes fanning out from HQ
    CITIES.filter((c) => c.id !== HQ_ID).forEach((city) => {
      const pts = arc(HQ.coords, city.coords)
      // colours come from CSS (.route-base / .route-flow) so they follow the light/dark theme
      const base = L.polyline(pts, { className: 'route route-base', weight: 1.6, opacity: 0.55, interactive: false }).addTo(map)
      const flow = L.polyline(pts, {
        className: 'route route-flow',
        weight: 2.2,
        opacity: 0.95,
        dashArray: '1 14',
        lineCap: 'round',
        interactive: false,
      }).addTo(map)
      routesRef.current.push({ id: city.id, base, flow, pts })
    })

    // Pins
    CITIES.forEach((city) => {
      const marker = L.marker(city.coords, {
        icon: pinIcon(city),
        title: `${city.name}, ${city.country}`,
        alt: `${city.name}, ${city.country}. Open our work here.`,
        keyboard: true,
        riseOnHover: true,
      }).addTo(map)
      marker.on('click', () => setActiveId(city.id))
      markersRef.current.set(city.id, marker)
    })

    declutter()
    setMapReady(true)
    const markers = markersRef.current
    const routes = routesRef.current
    const travel = travelRef.current
    const timers = timersRef.current
    return () => {
      el.removeEventListener('mouseleave', off)
      timers.forEach(clearTimeout)
      timers.length = 0
      travel.forEach((t) => t.controls.stop())
      travel.length = 0
      routes.length = 0
      markers.clear()
      map.remove()
      mapRef.current = null
      setMapReady(false)
      setIntroDone(false)
    }
  }, [declutter])

  // ---- cinematic intro: Pakistan pins -> fly out -> world pins + routes draw in -------------
  useEffect(() => {
    if (!revealed || !mapReady) return undefined
    const map = mapRef.current
    map.invalidateSize()
    const later = (fn, ms) => timersRef.current.push(setTimeout(fn, ms))

    const dropPins = (list, baseDelay) =>
      list.forEach((city, i) => {
        const inner = markersRef.current.get(city.id)?.getElement()?.querySelector('.pin')
        if (!inner) return
        animate(inner, { opacity: [0, 1], scale: [0, 1.35, 1] }, { duration: 0.9, delay: baseDelay + i * 0.14, ease: EASE })
      })

    if (reduce) {
      fitCities(CITIES, { instant: true, maxZoom: 4 })
      routesRef.current.forEach((r) => r.flow.getElement()?.classList.add('is-live'))
      setIntroDone(true)
      return undefined
    }

    const pk = CITIES.filter((c) => c.region === 'pakistan')
    const world = CITIES.filter((c) => c.region !== 'pakistan')
    dropPins(pk, 0.5)

    later(() => {
      fitCities(CITIES, { maxZoom: 4 })
      dropPins(world, 1.4)
      routesRef.current.forEach((r, i) => {
        const path = r.base.getElement()
        if (!path) return
        const len = path.getTotalLength()
        path.style.strokeDasharray = len
        path.style.strokeDashoffset = len
        animate(len, 0, {
          duration: 2,
          delay: 0.9 + i * 0.11,
          ease: EASE,
          onUpdate: (v) => {
            path.style.strokeDashoffset = v
          },
          onComplete: () => {
            path.style.strokeDasharray = ''
            path.style.strokeDashoffset = ''
            r.flow.getElement()?.classList.add('is-live')
          },
        })
      })
    }, 1700)

    later(() => setIntroDone(true), 4900 + routesRef.current.length * 110)
    later(declutter, 3200)
    return undefined
  }, [revealed, mapReady, reduce, fitCities, declutter])

  // ---- light pulses travelling along each route --------------------------------------------
  useEffect(() => {
    if (!introDone || reduce || !mapRef.current) return undefined
    const map = mapRef.current
    if (!travelRef.current.length) {
      routesRef.current.forEach((r, i) => {
        const marker = L.marker(r.pts[0], {
          icon: L.divIcon({ className: 'travel-wrap', html: '<span class="travel"></span>', iconSize: [9, 9], iconAnchor: [4.5, 4.5] }),
          interactive: false,
          keyboard: false,
          zIndexOffset: -200,
        }).addTo(map)
        const controls = animate(0, 1, {
          duration: 5 + (i % 6) * 0.9,
          ease: 'linear',
          repeat: Infinity,
          repeatDelay: 0.6 + (i % 5) * 0.4,
          onUpdate: (t) => marker.setLatLng(pointAt(r.pts, t)),
        })
        travelRef.current.push({ marker, controls })
      })
    }
    return undefined
  }, [introDone, reduce])

  // pause the travelling pulses while the map is off screen
  useEffect(() => {
    travelRef.current.forEach((t) => (visible ? t.controls.play() : t.controls.pause()))
  }, [visible, introDone])

  // ---- highlight the active pin, dim pins outside the filter --------------------------------
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const pin = marker.getElement()?.querySelector('.pin')
      if (!pin) return
      pin.classList.toggle('is-active', id === activeId)
      pin.classList.toggle('is-dim', !inFilter(CITIES.find((c) => c.id === id)))
    })
    declutter()
  }, [activeId, inFilter, mapReady, introDone, declutter])

  const focusCity = useCallback(
    (id) => {
      const city = CITIES.find((c) => c.id === id)
      if (!city) return
      setActiveId(id)
      fitCities([city], { maxZoom: city.region === 'pakistan' ? 6 : 5 })
    },
    [fitCities],
  )

  // clicking a pin (marker handler only sets state) also flies the camera there
  useEffect(() => {
    if (activeId && introDone) focusCity(activeId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  const changeFilter = (id) => {
    setFilter(id)
    setActiveId(null)
    const list = CITIES.filter((c) => id === 'all' || c.region === id)
    fitCities(list, { maxZoom: id === 'all' ? 4 : 6 })
  }

  return (
    <motion.section ref={sectionRef} id="work" className="work section" style={entrance}>
      <Watermark text="World" align="bottom" from="-30%" to="20%" />
      <div className="hairline" aria-hidden="true" />

      <div className="container work-head">
        <div className="work-head-main">
          <Reveal as="p" className="eyebrow" y={16}>
            03 — Where we&rsquo;ve worked
          </Reveal>
          <h2 className="section-title display">
            <SplitText
              parts={['From Lahore to', { br: true }, { t: 'the world.', className: 'serif work-accent' }]}
              by="word"
              stagger={0.07}
            />
          </h2>
        </div>
        <div className="work-head-side">
          <Reveal as="p" className="lead" y={20} delay={0.1}>
            {NUMBER_WORDS[COUNTRY_COUNT] ?? COUNTRY_COUNT} countries, three decades, one crew.
          </Reveal>
          <LayoutGroup id="map-filters">
            <div className="filters" role="group" aria-label="Filter cities">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`filter label ${filter === f.id ? 'is-on' : ''}`}
                  aria-pressed={filter === f.id}
                  onClick={() => changeFilter(f.id)}
                >
                  {filter === f.id && <motion.span layoutId="filter-pill" className="filter-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </div>
      </div>

      <div className="container">
        {/* shellRef watches this plain wrapper: an element with a zero-size clip-path is never "in view" for Chrome's IntersectionObserver */}
        <div ref={shellRef}>
        <motion.div
          className={`map-shell ${reduce ? 'is-static' : ''}`}
          initial={reduce ? false : { clipPath: 'circle(0% at 50% 50%)', scale: 1.05, opacity: 0 }}
          animate={
            revealed || reduce
              ? { clipPath: 'circle(150% at 50% 50%)', scale: 1, opacity: 1 }
              : { clipPath: 'circle(0% at 50% 50%)', scale: 1.05, opacity: 0 }
          }
          transition={{ duration: 1.7, ease: [0.65, 0, 0.35, 1] }}
        >
          <div className="map-stage">
            <div ref={mapEl} className="map" data-lenis-prevent role="application" aria-label="Interactive map of cities where RMS has worked" />
            <div className="map-vignette" aria-hidden="true" />
            <div className="map-scan" aria-hidden="true" />
            <div className="map-legend label" aria-hidden="true">
              <span><i className="lg lg-hq" /> HQ</span>
              <span><i className="lg" /> Cities</span>
              <span><i className="lg lg-route" /> Routes</span>
            </div>
            <p className="map-hint label" aria-hidden="true">Click map, then scroll to zoom</p>
          </div>
        </motion.div>
        </div>

        <ul className="city-list" aria-label="Cities">
          {CITIES.map((c, i) => (
            <Reveal as="li" key={c.id} y={24} delay={i * 0.05} amount={0.3}>
              <button
                type="button"
                className={`city-chip ${c.id === activeId ? 'is-on' : ''} ${inFilter(c) ? '' : 'is-dim'}`}
                onClick={() => focusCity(c.id)}
              >
                <span className="label city-chip-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="city-chip-name display">{c.name}</span>
                <span className="label city-chip-c">{c.country}</span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
    </motion.section>
  )
}
