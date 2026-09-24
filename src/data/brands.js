// "Brands we've worked with": each entry is one logo-wall image from your "brands" folder.
// To add another panel, drop a new image into public/media/brands/ and add a line below.

const b = (n) => `/media/brands/brands-${String(n).padStart(2, '0')}.jpg`

export const BRAND_WALLS = [
  { src: b(1), sector: 'FMCG, retail & telecom', alt: 'Logos of FMCG, retail and telecom brands RMS has worked with' },
  { src: b(2), sector: 'Schools, colleges & universities', alt: 'Logos of schools, colleges and universities RMS has worked with' },
  { src: b(3), sector: 'Healthcare, sports & more', alt: 'Logos of healthcare, sports and other brands RMS has worked with' },
]
