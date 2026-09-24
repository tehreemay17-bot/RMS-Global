import { useEffect } from 'react'
import { BRAND, CONTACT } from '../config'

const SITE_URL = 'https://rameenmediasolutions.com'

// Injects LocalBusiness structured data (JSON-LD) sourced from config.js, so it can never drift
// out of sync with the contact details shown elsewhere on the site. Search engines execute JS
// reliably, so a runtime-injected script tag works fine for this (unlike the OG/Twitter meta tags
// in index.html, which have to stay static for social-share unfurl bots that don't run JS).
export default function Seo() {
  useEffect(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: BRAND.fullName,
      alternateName: BRAND.name,
      description:
        'A full-service media, creative and experiential agency: social, PR, creative, production, brand activations, events and concerts.',
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/logo.png`,
      image: `${SITE_URL}/og-image.jpg`,
      telephone: CONTACT.phone,
      email: CONTACT.email,
      foundingDate: String(BRAND.est),
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lahore',
        addressCountry: 'PK',
      },
      sameAs: CONTACT.socials.map((s) => s.href),
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    document.head.appendChild(script)
    return () => document.head.removeChild(script)
  }, [])

  return null
}
