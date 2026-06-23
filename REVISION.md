# Quick Revision — Phase 1 & 2 (using THIS project)

You already know the basics — this is a **refresher**, not a course.
Best way to revise: open each file mentioned, read the marked lines, and
ask yourself "could I have written this?" Estimated time: **a weekend (2–4 days)**.

---

## 1. JavaScript (ES6+) — revise first

| Concept | Quick reminder | See it in this project |
|---------|----------------|------------------------|
| `import` / `export` | split code across files | every file; data exported in `src/data.js` |
| Array `.map()` | turn a list into UI | `Navbar.jsx` (`navLinks.map`), `Skills.jsx`, `Projects.jsx`, `Certificates.jsx` |
| Destructuring | `const { value, label } = props` | `StatCards.jsx` → `function Stat({ value, label })` |
| Template literals | `` `translate(${x}px)` `` | `Skills.jsx` transform string, dynamic `className`s |
| Arrow functions | `(e) => {...}` | event handlers everywhere |
| Ternary `? :` | inline if/else | `Contact.jsx` (`sent ? "Sent" : "Send"`), conditional classes |
| Spread `...` | copy/merge | `Background.jsx`, object building |
| Optional chaining `?.` | safe access | guards like `cardRefs.current[i]` checks |
| `async` / Promises | (lightly used) | `lazy(() => import("./HeroCube"))` |

**Self-check:** Can you explain what `playgroundSkills.map((skill, i) => ...)` returns and why each needs a `key`?

📌 Cheat sheets: [javascript.info](https://javascript.info/) · [MDN JS reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference)

---

## 2. React — the big one

| Concept | Quick reminder | See it in this project |
|---------|----------------|------------------------|
| Components | functions returning JSX | every file in `src/components/` |
| Props | pass data into a component | `SectionHeading`, `ProgressRing`, `TimelineCard` |
| `useState` | local reactive state | `Navbar.jsx` (`scrolled`, `open`), `Experience.jsx` (`active`), `Contact.jsx` (`sent`) |
| `useEffect` | run code after render / side-effects | `App.jsx` (Lenis), `Background.jsx` (listeners + canvas), `Skills.jsx` (physics), `OrbitPhoto.jsx` (ResizeObserver) |
| **cleanup** in `useEffect` | the `return () => {...}` | `Background.jsx`, `Skills.jsx` — remove listeners / stop loops |
| `useRef` | reference a DOM node | `Skills.jsx` (`sceneRef`), `Certificates.jsx` (`trackRef`), `CursorTrail.jsx` |
| Lists + `key` | unique key per item | every `.map(...)` render |
| Conditional render | `{open && <Menu/>}` | `Navbar.jsx` mobile menu |
| Event handlers | `onClick`, `onSubmit` | `Experience.jsx` tabs, `Contact.jsx` form |
| `lazy` + `Suspense` | code-split a heavy component | `Hero.jsx` loads `HeroCube` |

**Self-check:**
1. Why does `useEffect(() => {...}, [])` run only once, and what does the `[]` mean?
2. In `Navbar.jsx`, how does `scrolled` state change the navbar style?
3. Why must the `useEffect` in `Skills.jsx` return a cleanup function?

📌 Refresher: [react.dev/learn](https://react.dev/learn) → read "Describing the UI", "Adding Interactivity", "Managing State" (each is ~30 min)

---

## 3. Tailwind CSS

| Concept | Quick reminder | See it in this project |
|---------|----------------|------------------------|
| Utility classes | `flex items-center gap-4` | every component |
| Responsive prefixes | `sm:` `md:` `lg:` | `Hero.jsx` (`text-5xl sm:text-7xl`), grids (`md:grid-cols-2`) |
| State variants | `hover:` `focus:` `group-hover:` | buttons, project cards |
| Opacity shorthand | `text-white/60` = 60% | everywhere |
| Arbitrary values | `text-[18vw]`, `shadow-[0_0_25px...]` | `Footer.jsx`, glow shadows |
| Custom theme | colors/animations you defined | `tailwind.config.js` → used as `bg-neon-purple`, `animate-float` |
| `@layer` / custom classes | `.glass`, `.gradient-text` | defined in `src/index.css` |

**Self-check:** What does `class="text-lg sm:text-2xl md:text-3xl"` do at different screen sizes? Where are `neon.cyan` and the `float` animation defined?

📌 Refresher: [tailwindcss.com/docs/utility-first](https://tailwindcss.com/docs/utility-first) + keep the docs open as a searchable reference.

---

## 4. Vite (5-minute refresh)

- `npm run dev` → dev server with hot reload
- `npm run build` → production bundle into `dist/`
- `public/` folder → files served at the root (that's why your photo is `/profile1.png`)

---

## Suggested 2–4 day revision plan

```
Day 1   JavaScript table above — open each referenced file, read the lines
Day 2   React: read react.dev "Adding Interactivity" + trace useState/useEffect here
Day 3   Tailwind: skim docs, then re-read index.css + tailwind.config.js
Day 4   Build ONE new section in this project from scratch to prove it stuck
```

**Best exercise:** add a brand-new "Testimonials" section — a new component, new
array in `data.js`, `.map()` it, style with Tailwind, animate with Framer Motion.
If you can do that without help, your Phase 1 & 2 revision is complete. ✅
