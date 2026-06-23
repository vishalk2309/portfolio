# Futuristic Developer Portfolio

A fully responsive portfolio with a dark glassmorphism theme, neon glow,
3D WebGL hero, an orbiting-skills "about", live-style LeetCode/GitHub stat
cards, a tabbed Education/Achievements timeline, a physics-based draggable
Skills playground, large Featured Projects, a Certificates carousel, smooth
scrolling and a mouse-following spotlight.

## Stack

- **React 18** + **Vite**
- **Tailwind CSS** (custom theme, keyframes, glass + gradient-text utilities)
- **Framer Motion** (entry reveals, staggered scroll-in, tab transitions)
- **@react-three/fiber** + **drei** + **three** (hero 3D cube, lazy-loaded)
- **matter-js** (physics Skills playground — drag, throw, bounce)
- **Lenis** (smooth scrolling)
- **react-icons** (skill + social icons)

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build -> dist/
npm run preview  # preview the production build
```

## Sections (in order)

1. **Hero** — 3D floating cube, name fade+scale, subtitle, dual CTAs, socials, scroll cue
2. **About** (`#about`) — profile photo with orbiting tech icons + LeetCode & GitHub stat cards
3. **Experience** (`#experience`) — Education / Achievements tabs with a zig-zag timeline
4. **Skills** (`#skills`) — matter.js physics playground (drag & throw the cards)
5. **Projects** (`#projects`) — large alternating featured showcases
6. **Certificates** (`#certificates`) — horizontal carousel of certificate cards
7. **Contact** (`#contact`) — big heading, direct email, socials, glass form
8. **Footer** — giant gradient name, slow float

## Customizing

**Everything content-related lives in [`src/data.js`](src/data.js):**
`profile` (name, role, email, photo, resume), `navLinks`, `socials`,
`orbitSkills`, `leetcode`, `github`, `education`, `achievements`,
`playgroundSkills`, `projects`, `certificates`.

- Stats are static mock data — swap the `leetcode` / `github` objects for live
  API responses when ready.
- Theme colors / animations live in `tailwind.config.js`.
- Project & profile images use Unsplash URLs (need network); replace with your own.
