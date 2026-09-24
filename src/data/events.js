// "Events We've Covered": media is grouped into events by FILE NAME.
//
// HOW TO ADD YOUR REAL EVENTS
// Drop files into  src/media/events/  named  <event-name>-<number>.<ext>  (same prefix = same event):
//
//   corporate-gala-01.jpg
//   corporate-gala-02.mp4        <- videos work too (mp4, webm, mov)
//   wedding-lahore-01.jpg
//   product-launch-dubai-01.webp
//
// The page picks them up automatically: "wedding-lahore" becomes the title "Wedding Lahore", and the
// number sets the order. A new prefix creates a new event. No code changes needed.
//
// Optional: give an event a nicer title, place and blurb by adding its prefix to EVENT_META below.
//
// While src/media/events/ contains no files, the placeholder events at the bottom of this file are shown
// (they use your photos from the "Collaborative events" and "pics" folders, copied to public/media/).

export const EVENT_META = {
  // 'corporate-gala': { title: 'Corporate Gala 2025', place: 'Lahore', year: 2025, blurb: 'Annual awards evening for 600 guests.' },
}

const evc = (name) => `/media/events-coverages/${name}`
const gal = (n) => `/media/gallery/gallery-${String(n).padStart(2, '0')}.jpg`
const proj = (n) => `/media/recent-projects/project-${String(n).padStart(2, '0')}.jpg`

export const PLACEHOLDER_EVENTS = [
  {
    id: 'events-coverages',
    title: 'Events and Coverages',
    place: 'Lahore',
    year: 2025,
    blurb: 'Branded stages, LED walls and launch nights: the corporate side of RMS.',
    // The original highlight video is kept; everything else comes from your "events" folder
    // (2 real highlight videos + 3 photos — no poster images needed, MediaTile shows a frame
    // from each video automatically).
    items: [
      { type: 'video', src: '/media/collab/gala-video.mp4', alt: 'Corporate event highlight video' },
      { type: 'video', src: evc('video-aiko-solar.mp4'), alt: 'Aiko x Solar Pakistan, Day 1 highlight video' },
      { type: 'video', src: evc('video-carrefour.mp4'), alt: 'Carrefour activation, Day 3 highlight video' },
      { type: 'image', src: evc('photo-01.jpg'), alt: 'Event coverage photo' },
      { type: 'image', src: evc('photo-02.jpg'), alt: 'Event coverage photo' },
      { type: 'image', src: evc('photo-03.jpg'), alt: 'Event coverage photo' },
    ],
  },
  {
    id: 'gallery',
    title: 'Gallery',
    blurb: 'Candid moments from the sets, shoots and shows — a wider look behind the scenes.',
    // All 12 photos, only from your "gallery" folder.
    items: [
      { type: 'image', src: gal(1), alt: 'Group sitting together at a restaurant table' },
      { type: 'image', src: gal(2), alt: 'Two people seated together backstage, one taking notes' },
      { type: 'image', src: gal(3), alt: 'Two people posing together, one in traditional attire' },
      { type: 'image', src: gal(4), alt: 'Two people relaxing together, black-and-white photo' },
      { type: 'image', src: gal(5), alt: 'Group of five posing together at an event' },
      { type: 'image', src: gal(6), alt: 'Two people posing, one in formal traditional dress' },
      { type: 'image', src: gal(7), alt: 'Three people seated together in a green room' },
      { type: 'image', src: gal(8), alt: 'Three people posing together outdoors' },
      { type: 'image', src: gal(9), alt: 'Group of four posing outdoors under a blue sky' },
      { type: 'image', src: gal(10), alt: 'Group selfie at an outdoor dinner table' },
      { type: 'image', src: gal(11), alt: 'Group of four posing together at night' },
      { type: 'image', src: gal(12), alt: 'Two people posing together at a media event backdrop' },
    ],
  },
  {
    id: 'our-recent-projects',
    title: 'Our Recent Projects',
    blurb: 'A look at the live shows, campaigns and promos we have delivered lately.',
    // All 7 photos, only from your "Our recent projects" folder.
    items: [
      { type: 'image', src: proj(1), alt: 'PGC Music Festival poster: Farhan Saeed, Aima Baig, Bilal Saeed, hosted by Musaddaq Munir' },
      { type: 'image', src: proj(2), alt: 'PGC Music Festival poster: Aima Baig, Bilal Saeed and Musaddiq Munir live at PGC Phalia and Wazirabad' },
      { type: 'image', src: proj(3), alt: 'Jashn-e-Azadi Festival poster: Sain Zahoor, Farhan Saeed and Saba Butt in Sialkot' },
      { type: 'image', src: proj(4), alt: 'Young Stunners live in concert at First Step School, Faisalabad' },
      { type: 'image', src: proj(5), alt: 'Event poster: Sufi Night' },
      { type: 'image', src: proj(6), alt: 'Event poster: music festival campaign' },
      { type: 'image', src: proj(7), alt: 'Asrar live in concert in Dallas, Texas' },
    ],
  },
]
