// "Where We've Worked": every city shown on the map.
//
// HOW TO ADD YOUR REAL PHOTOS AND VIDEOS
// 1. Copy your files into  public/cities/<city-id>/   (for example public/cities/lahore/gala-night.jpg)
// 2. In the city's `media` array below, replace or add entries that point at them:
//      { type: 'image', src: '/cities/lahore/gala-night.jpg', alt: 'Gala night in Lahore' }
//      { type: 'video', src: '/cities/lahore/recap.mp4', poster: '/cities/lahore/recap-poster.jpg' }
// 3. Delete the "/media/…" entries once you have real ones (those are stand-in photos from your pics folders).
//
// To add a whole new city, copy any block and change id, name, country, coords ([latitude, longitude]) and region.
// region is one of: 'pakistan' | 'europe' | 'asia-pacific' | 'world' (= rest of the world). It drives the filter buttons.
// Each country is shown with one pin (its capital or best-known event city). Swap the city/coords if you worked elsewhere.
// The pin's country label and the "countries" count on the page update automatically.

const pic = (n) => `/media/pics/pic-${String(n).padStart(2, '0')}.jpg`
const gala = (n) => `/media/collab/gala-${String(n).padStart(2, '0')}.jpg`
// PLACEHOLDER video: reuses the hero reel until you add real city videos.
const PLACEHOLDER_VIDEO = '/hero-video.mp4'

const photo = (src, alt) => ({ type: 'image', src, alt })
const video = (poster, alt) => ({ type: 'video', src: PLACEHOLDER_VIDEO, poster, alt })

export const HQ_ID = 'lahore' // routes on the map fan out from this city

export const CITIES = [
  // ─────────────────────────────── PAKISTAN ───────────────────────────────
  {
    id: 'lahore',
    name: 'Lahore',
    country: 'Pakistan',
    region: 'pakistan',
    coords: [31.5204, 74.3587],
    tagline: 'Where RMS began. Home of our studio and crew.',
    stats: { events: 120, since: 1994 }, // PLACEHOLDER numbers
    // ─────────── ADD LAHORE'S REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(pic(13), 'Studio shoot with artists in Lahore'),
      photo(pic(19), 'Event poster for a live performance in Lahore'),
      video(pic(10), 'Group selfie backstage'),
      photo(pic(15), 'Event poster: Sufi Night'),
    ],
  },
  {
    id: 'karachi',
    name: 'Karachi',
    country: 'Pakistan',
    region: 'pakistan',
    coords: [24.8607, 67.0011],
    tagline: 'Concerts, launches and brand nights on the coast.',
    stats: { events: 85, since: 1998 },
    // ─────────── ADD KARACHI'S REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(pic(14), 'Music event promo with performers and host'),
      photo(pic(6), 'Artists posing outdoors'),
      photo(pic(18), 'Event poster: private live performance'),
      video(pic(2), 'Artists group portrait'),
    ],
  },
  {
    id: 'islamabad',
    name: 'Islamabad',
    country: 'Pakistan',
    region: 'pakistan',
    coords: [33.6844, 73.0479],
    tagline: 'Corporate summits and institutional campaigns.',
    stats: { events: 60, since: 2001 },
    // ─────────── ADD ISLAMABAD'S REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(pic(9), 'Artists gathered around a table'),
      photo(pic(22), 'Event poster: Qawali Night'),
      photo(pic(7), 'Artists in conversation'),
      video(pic(12), 'Backstage portrait'),
    ],
  },

  // ───────────────────────────── WORLDWIDE ─────────────────────────────
  {
    id: 'dubai',
    name: 'Dubai',
    country: 'UAE',
    region: 'world',
    coords: [25.2048, 55.2708],
    tagline: 'Launches and diaspora experiences in the Gulf.',
    stats: { events: 24, since: 2012 },
    // ─────────── ADD DUBAI'S REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(gala(4), 'Sparkle-wall brand backdrop with an illuminated logo'),
      photo(pic(23), 'Artists outside Dubai Marine Beach Resort'),
      video(pic(4), 'Backstage moment'),
      photo(pic(17), 'Event poster: private live performance'),
    ],
  },
  {
    id: 'sydney',
    name: 'Sydney',
    country: 'Australia',
    region: 'asia-pacific',
    coords: [-33.8688, 151.2093],
    tagline: 'Live shows and community nights across Australia.',
    stats: { events: 8, since: 2019 },
    // ─────────── ADD SYDNEY'S (OR ANOTHER AUSTRALIAN CITY'S) REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(gala(1), 'Blue-lit branded stage backdrop'),
      photo(pic(21), 'Event poster: Sufi music night'),
      photo(pic(1), 'Artists relaxing at a cafe'),
      video(pic(7), 'Artists on tour'),
    ],
  },
  {
    id: 'auckland',
    name: 'Auckland',
    country: 'New Zealand',
    region: 'asia-pacific',
    coords: [-36.8485, 174.7633],
    tagline: 'Touring productions and cultural evenings in New Zealand.',
    stats: { events: 5, since: 2022 },
    // ─────────── ADD AUCKLAND'S (OR ANOTHER NZ CITY'S) REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(pic(14), 'Music event promo with performers and host'),
      photo(pic(10), 'Artists group selfie'),
      video(pic(6), 'Artists outdoors'),
      photo(pic(21), 'Event poster: live performance'),
    ],
  },
  {
    id: 'london',
    name: 'London',
    country: 'England',
    region: 'europe',
    coords: [51.5072, -0.1276],
    tagline: 'Cultural nights and brand moments for the UK community.',
    stats: { events: 14, since: 2015 },
    // ─────────── ADD LONDON'S REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(gala(2), 'Product launch stage with red LED screens'),
      photo(pic(3), 'Artists on a red backdrop'),
      photo(pic(16), 'Event poster: music festival campaign'),
      video(pic(5), 'Artists in matching jackets'),
    ],
  },
  {
    id: 'new-york',
    name: 'New York',
    country: 'USA',
    region: 'world',
    coords: [40.7128, -74.006],
    tagline: 'Stage productions and press events across North America.',
    stats: { events: 9, since: 2018 },
    // ─────────── ADD YOUR US CITY'S (NEW YORK OR ANOTHER) REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(gala(3), 'Neon wings photo backdrop'),
      photo(pic(8), 'Artist selfie with friends'),
      video(pic(11), 'Artists together'),
      photo(pic(20), 'Event poster: music festival campaign'),
    ],
  },

  // ─────────────────────────────── EUROPE ───────────────────────────────
  {
    id: 'oslo',
    name: 'Oslo',
    country: 'Norway',
    region: 'europe',
    coords: [59.9139, 10.7522],
    tagline: 'Cultural evenings and community concerts in Norway.',
    stats: { events: 4, since: 2021 },
    // ─────────── ADD OSLO'S (OR ANOTHER NORWEGIAN CITY'S) REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(pic(13), 'Studio shoot with artists'),
      photo(pic(22), 'Event poster: Qawali Night'),
      video(pic(3), 'Artists on a red backdrop'),
      photo(pic(5), 'Artists in matching hoodies'),
    ],
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    country: 'Netherlands',
    region: 'europe',
    coords: [52.3676, 4.9041],
    tagline: 'Live shows and brand nights in the Netherlands.',
    stats: { events: 6, since: 2019 },
    // ─────────── ADD AMSTERDAM'S (OR ANOTHER DUTCH CITY'S) REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(gala(3), 'Neon wings photo backdrop'),
      photo(pic(17), 'Event poster: private live performance'),
      photo(pic(1), 'Artists relaxing at a cafe'),
      video(pic(9), 'Artists gathered around a table'),
    ],
  },
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    country: 'Denmark',
    region: 'europe',
    coords: [55.6761, 12.5683],
    tagline: 'Concert tours and community events across Denmark.',
    stats: { events: 3, since: 2022 },
    // ─────────── ADD COPENHAGEN'S (OR ANOTHER DANISH CITY'S) REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(pic(14), 'Music event promo with performers and host'),
      photo(pic(21), 'Event poster: Sufi music night'),
      photo(pic(12), 'Backstage portrait'),
      video(pic(8), 'Artist selfie with friends'),
    ],
  },
  {
    id: 'berlin',
    name: 'Berlin',
    country: 'Germany',
    region: 'europe',
    coords: [52.52, 13.405],
    tagline: 'Product launches and stage productions in Germany.',
    stats: { events: 7, since: 2018 },
    // ─────────── ADD BERLIN'S (OR ANOTHER GERMAN CITY'S) REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(gala(2), 'Product launch stage with red LED screens'),
      photo(pic(19), 'Event poster: live performance'),
      video(pic(6), 'Artists outdoors'),
      photo(pic(2), 'Artists group portrait'),
    ],
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    region: 'europe',
    coords: [48.8566, 2.3522],
    tagline: 'Brand activations and cultural nights in France.',
    stats: { events: 5, since: 2019 },
    // ─────────── ADD PARIS'S (OR ANOTHER FRENCH CITY'S) REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(gala(4), 'Sparkle-wall brand backdrop with an illuminated logo'),
      photo(pic(18), 'Event poster: live performance'),
      photo(pic(4), 'Artist duo portrait'),
      video(pic(11), 'Artists together'),
    ],
  },
  {
    id: 'brussels',
    name: 'Brussels',
    country: 'Belgium',
    region: 'europe',
    coords: [50.8503, 4.3517],
    tagline: 'Institutional events and concerts in Belgium.',
    stats: { events: 3, since: 2020 },
    // ─────────── ADD BRUSSELS'S (OR ANOTHER BELGIAN CITY'S) REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(pic(9), 'Artists gathered around a table'),
      photo(pic(15), 'Event poster: Sufi Night'),
      video(pic(7), 'Artists in conversation'),
      photo(pic(10), 'Artists group selfie'),
    ],
  },

  // ─────────────────────────────── ASIA-PACIFIC ───────────────────────────────
  {
    id: 'kuala-lumpur',
    name: 'Kuala Lumpur',
    country: 'Malaysia',
    region: 'asia-pacific',
    coords: [3.139, 101.6869],
    tagline: 'Regional shows and brand launches in Malaysia.',
    stats: { events: 6, since: 2019 },
    // ─────────── ADD KUALA LUMPUR'S (OR ANOTHER MALAYSIAN CITY'S) REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(gala(1), 'Blue-lit branded stage backdrop'),
      photo(pic(16), 'Event poster: music festival campaign'),
      photo(pic(13), 'Studio shoot with artists'),
      video(pic(12), 'Backstage portrait'),
    ],
  },
  {
    id: 'jakarta',
    name: 'Jakarta',
    country: 'Indonesia',
    region: 'asia-pacific',
    coords: [-6.2088, 106.8456],
    tagline: 'Touring productions and community nights in Indonesia.',
    stats: { events: 4, since: 2021 },
    // ─────────── ADD JAKARTA'S (OR ANOTHER INDONESIAN CITY'S) REAL PHOTOS AND VIDEOS HERE ───────────
    media: [
      photo(pic(14), 'Music event promo with performers and host'),
      photo(pic(20), 'Event poster: music festival campaign'),
      video(pic(3), 'Artists on a red backdrop'),
      photo(pic(6), 'Artists outdoors'),
    ],
  },
]