# RMS website: progress and handover (2026-11-04)

Live site: https://rms-global-nine.vercel.app (domain rameenmediasolutions.com). Stack: Vite + React 19 + Motion. Deploys to Vercel automatically when `main` is pushed to https://github.com/tehreemay17-bot/RMS-Global.

## Where the work is saved

Everything below is on the branch **`speed-and-malkoo`**, NOT on `main`, so the live site is unchanged until you merge it.
To publish: review the branch, then merge it into `main` and push (Vercel redeploys in about a minute).

## What this branch contains

### 1. Malkoo Perfumes Launch (new block in the Events section)
- 20 event photos (no videos), resized to web size (3.4 MB total, lazy-loaded) in `public/media/malkoo/`.
- Added as the last event in `src/data/events.js` (`id: 'malkoo-launch'`, place Lahore, year 2026).
- Left out on purpose: 6 Malkoo product poster images (ads, not event photos) and 5 videos. Originals are in `C:\Users\bilal\Downloads\Malkoo`.
- To reorder or retitle: edit the `malkoo-launch` entry in `src/data/events.js`.

### 2. Speed fixes
Measured first: a Lighthouse mobile test of the live site scored 52/100 (first content 3.7s, main headline 4.5s, 740ms blocked). Time went mostly to style/layout recalculation and a 1.1s script task. Changes:
- Removed the 2-second "counting" preloader (`src/components/Preloader.*` deleted; `ready` is now always true in `src/App.jsx`). It only added waiting.
- Google Fonts now load without blocking the first paint (`index.html`).
- Hero video downloads only after the page finishes loading (poster shows first). The About background video downloads only when the section is about to scroll into view. (`Hero.jsx`, `About.jsx`)
- Artist photos are all lazy-loaded (`Artists.jsx`).
- Smooth-scroll (Lenis) is now OFF by default (it felt laggy and runs on every frame). Visitors can still switch it on in the scroll dock. (`src/hooks/useScrollPrefs.js`)
- Animations the browser had to repaint every frame were rewritten to GPU-friendly versions with the same look: the spinning gradient borders on the booking card and active artist card (now a rotating layer), the video play-button pulse, and the hero scroll hint. The pulsing glow on the active artist card was removed. The booking card's blur (invisible, since its background is solid) was removed.

## Not finished: verify before merging

1. **Before/after speed test was interrupted.** The plan was to build the old and new versions side by side and run the same Lighthouse test three times each. Not done, so the speed gain is not yet measured.
2. **Look at it in a real browser** (dev server: `npm run dev`). Check: the rotating border on the booking card and the centered artist card, the video play badge in Events, hero video starts after load, About video starts when you scroll to it, nav still highlights sections, and the Malkoo block looks right.
3. If a visual change is unwanted, it is a small, separate edit in the files listed above.

## Setup notes (this computer)

- The project folder had been emptied; it was restored from GitHub with `git init` + `git fetch` + `git reset --hard origin/main`. `node_modules` was reinstalled with `npm ci`.
- Node is not on PATH in Git Bash: run `export PATH="/c/Program Files/nodejs:$PATH"` first.
- Commands: `npm run dev`, `npm run lint`, `npm run build`.
- Photos and videos are cached for 30 days (`vercel.json`). When replacing a media file, give the new one a new filename.
- Original large videos and raw photos are not in git (`source-media/` is ignored) and were lost with the emptied folder; the compressed web versions in `public/` are what the site uses.
