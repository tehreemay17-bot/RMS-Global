// Central place for every placeholder value. Replace these with your real details.

export const BRAND = {
  name: 'RMS',
  fullName: 'Rameen Media Solutions',
  descriptor: 'Rameen Media Solutions',
  est: 1994,
  tagline: 'Ideas. Influence. Experiences.',
}

// id must match the id of the section it scrolls to
export const NAV_LINKS = [
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Where We Work' },
  { id: 'events', label: 'Events' },
  { id: 'artists', label: 'Artists' },
  { id: 'brands', label: 'Brands' },
]

export const NAV_CTA = { id: 'book', label: 'Book a meeting' }

export const CONTACT = {
  email: 'canvas.rms@gmail.com',
  phone: '+92 349 4962950',
  whatsapp: '+92 349 4962950', // set a different number here if WhatsApp shouldn't use the phone number above
  address: 'Lahore, Pakistan', // PLACEHOLDER: add your full office address
  hours: 'Mon – Sat · 10:00 AM – 7:00 PM PKT', // PLACEHOLDER
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/rameenmediasolutions' },
    { label: 'Facebook', href: 'https://www.facebook.com/saleemkamransinger' },
  ],
}

// Booking calendar settings
export const BOOKING = {
  closedWeekdays: [0], // 0 = Sunday ... 6 = Saturday. Days listed here can't be booked.
  slots: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'],
  timezoneNote: 'Times are in Pakistan Standard Time (PKT)', // PLACEHOLDER
}

// ---------------------------------------------------------------------------
// FORMSPREE: paste your form ID here (the part after /f/ in your Formspree endpoint,
// e.g. https://formspree.io/f/xyzabcde  ->  'xyzabcde').
// Until you do, the booking form runs in demo mode locally and shows an error in production.
// ---------------------------------------------------------------------------
export const FORMSPREE_ID = 'mbglyebo'
