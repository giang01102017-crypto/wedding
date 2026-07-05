# Wedding Invitation — Liên & Trường Giang

Premium wedding invitation website for **Nguyễn Thị Liên** and **Trường Giang**.
Wedding date: **08 · 08 · 2026**.

Fully static — pure HTML, CSS, and vanilla JavaScript. No backend, no build step.
Deployable directly to GitHub Pages.

## Theme
Luxury Apple × Japanese minimal — white, sage green, and champagne gold.

## Features
- Loading screen
- Opening envelope animation
- Hero section
- Background music (toggle + autoplay on first interaction)
- Live countdown to the wedding date
- Love-story timeline
- Gallery (20 placeholders) with lightbox
- Wedding schedule
- Bride & groom family sections
- Google Maps embed
- QR gift section
- RSVP form (saves to `localStorage`; shows a success message)
- Thank-you section
- Flower petal canvas animation
- Scroll-reveal animations + smooth scroll
- Responsive (mobile → desktop)
- SEO (meta, Open Graph, Twitter cards, JSON-LD `Event` schema)
- `prefers-reduced-motion` support

## File structure
```
index.html        # markup + SEO
style.css         # theme + responsive layout
script.js         # all interactivity
assets/images/    # hero bg, bride/groom portraits, 20 gallery SVGs
assets/music/     # background-music.wav
assets/icons/     # favicon, apple-touch-icon, og-image
```

## Deploy to GitHub Pages
1. Push this folder to a GitHub repository.
2. In the repo settings → Pages, set the source to the branch and `/` root.
3. The site is live at `https://<user>.github.io/<repo>/`.
