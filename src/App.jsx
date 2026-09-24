import { lazy, Suspense, useState } from 'react'
import { MotionConfig } from 'motion/react'
import Cursor from './components/Cursor'
import Grain from './components/Grain'
import Preloader from './components/Preloader'
import SmoothScroll from './components/SmoothScroll'
import ScrollEffects from './components/ScrollEffects'
import ScrollDock from './components/ScrollDock'
import WhatsAppButton from './components/WhatsAppButton'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import Events from './components/Events'
import Artists from './components/Artists'
import Brands from './components/Brands'
import Booking from './components/Booking'
import Footer from './components/Footer'
import './App.css'

// Leaflet is the heaviest dependency, so the map loads as its own chunk.
const WorkMap = lazy(() => import('./components/WorkMap'))

const seen = () => {
  try {
    return sessionStorage.getItem('rms-intro') === '1'
  } catch {
    return false
  }
}

function App() {
  // The intro plays once per browser session; later visits go straight to the page.
  const [ready, setReady] = useState(seen)

  const finishIntro = () => {
    try {
      sessionStorage.setItem('rms-intro', '1')
    } catch {
      /* storage unavailable: intro simply plays again next visit */
    }
    setReady(true)
  }

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <ScrollEffects />
      <Cursor />
      <Grain />
      {!ready && <Preloader onDone={finishIntro} />}
      <Nav ready={ready} />
      <ScrollDock ready={ready} />
      <WhatsAppButton ready={ready} />
      <main>
        <Hero ready={ready} />
        <Services />
        <About />
        <Suspense fallback={<section id="work" className="section" style={{ minHeight: '100svh' }} aria-busy="true" />}>
          <WorkMap />
        </Suspense>
        <Events />
        <Artists />
        <Brands />
        <Booking />
      </main>
      <Footer />
    </MotionConfig>
  )
}

export default App
