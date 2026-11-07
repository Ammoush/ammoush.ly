# ammoush.ly

Personal site of Ahmed Ammoush, Technical Operations Manager, working across ERP (Odoo), data, and operations.

Live at [ammoush.ly](https://ammoush.ly/).

## Stack

- [Astro](https://astro.build) 7, static output
- Plain CSS with design tokens and logical properties
- CSS scroll-driven animations for the "How I work" sequence and the experience timeline, with no animation library
- Cross-document View Transitions, and a view transition on theme change
- About 4 KB of JavaScript in total (theme toggle, header tone, copy email, hero replay, backdrop)
- A raw WebGL backdrop behind the hero (no library): half resolution, 30 fps, paused when off screen or hidden, skipped under reduced motion or data saver
- Built-in Astro CSP with hashed scripts and styles, plus security headers in `public/_headers`
- Self-hosted font: IBM Plex Sans
- vCard and QR code generated at build time from the same content file

Browsers without scroll-driven animations, and visitors who prefer reduced motion, get a static layout with all content visible.

## Editing content

Everything the site says lives in one file: [`src/content/profile.yaml`](src/content/profile.yaml). Each entry has an English (`en`) value and an Arabic (`ar`) value; only the English version is built right now.

- Change the text between the quotes; keep the keys as they are.
- Dates use `YYYY-MM`. `end: null` means the role is current.
- To add a role, copy an existing item under `experience.items` and edit it. Items are shown in the order they appear.
- The CV is `public/cv.pdf`. To update it, replace that file. Set `contact.cv: null` to hide the download buttons.

The file is validated on every build. If something is missing or malformed, the build stops and names the exact field, so a broken page is never published.

## Running locally

Requires Node 22.23 or later.

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview   # serves dist/
```

## Deployment

Hosted on Cloudflare Pages. Every push to `main` builds and deploys; other branches get a preview URL.

- Build command: `npm run build`
- Output directory: `dist`
