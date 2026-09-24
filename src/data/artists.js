// "Artists We've Worked With": the photos in the carousel.
//
// HOW TO EDIT
// - Photos live in public/media/artists/ (optimised copies of your "Artists" folder).
//   To add one, copy it there (JPG/WebP, ~1500px wide is plenty) and add a line below.
// - `title` is a short description of the moment. Add `name` to show the artist's name as the headline
//   (the description then becomes the small caption). Example:
//       { src: '/media/artists/artist-03.jpg', title: 'Wedding stage', name: 'Artist Name' }

const a = (n) => `/media/artists/artist-${String(n).padStart(2, '0')}.jpg`

export const ARTISTS = [
  { src: a(1), title: 'Crowd at the stage' },
  { src: a(2), title: 'Festival night' },
  { src: a(3), title: 'Wedding stage' },
  { src: a(4), title: 'Behind the scenes' },
  { src: a(5), title: 'Green room' },
  { src: a(6), title: 'Match-day arena' },
  { src: a(7), title: 'Backstage' },
  { src: a(8), title: 'Off stage' },
  { src: a(9), title: 'Studio set' },
  { src: a(10), title: 'Studio session' },
  { src: a(11), title: 'Dubai skyline' },
  { src: a(12), title: 'Press day' },
  { src: a(13), title: 'Reception night' },
]
