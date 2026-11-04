import { lazy, Suspense } from 'react'
import { MotionConfig } from 'motion/react'
import Cursor from './components/Cursor'
import Grain from './components/Grain'
import Seo from './components/Seo'
import SmoothScroll from './components/SmoothScroll'
import ScrollEffects from './components/ScrollEffects'
import ScrollDock from './components/ScrollDock'
import WhatsAppButton from './components/WhatsAppButton'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import './App.css'

// Everything below the fold loads as its own chunk once the visitor is close to scrolling
// to it, so the initial bundle only has to cover what's visible on arrival (Hero/Services/About).
const WorkMap = lazy(() => import('./components/WorkMap'))
const Events = lazy(() => import('./components/Events'))
const Artists = lazy(() => import('./components/Artists'))
const Brands = lazy(() => import('./components/Brands'))
const Booking = lazy(() => import('./components/Booking'))
const Footer = lazy(() => import('./components/Footer'))

const fallback = (id) => <section id={id} className="section" style={{ minHeight: '100svh' }} aria-busy="true" />

// The old 2-second "counting" preloader was pure waiting: it delayed the first real content on every visit.
const ready = true

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <ScrollEffects />
      <Cursor />
      <Grain />
      <Seo />
      <Nav ready={ready} />
      <ScrollDock ready={ready} />
      <WhatsAppButton ready={ready} />
      <main>
        <Hero ready={ready} />
        <Services />
        <About />
        <Suspense fallback={fallback('work')}>
          <WorkMap />
        </Suspense>
        <Suspense fallback={fallback('events')}>
          <Events />
        </Suspense>
        <Suspense fallback={fallback('artists')}>
          <Artists />
        </Suspense>
        <Suspense fallback={fallback('brands')}>
          <Brands />
        </Suspense>
        <Suspense fallback={fallback('book')}>
          <Booking />
        </Suspense>
      </main>
      <Suspense fallback={<footer id="contact" style={{ minHeight: '40svh' }} aria-busy="true" />}>
        <Footer />
      </Suspense>
    </MotionConfig>
  )
}

export default App
