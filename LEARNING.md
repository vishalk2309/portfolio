# Learning Roadmap — Technologies in This Portfolio

Estimates assume you **already know basic programming** (you do — B.Tech CSE)
and study **~2 hours/day**. Two goals:

- 🟢 **Fast track** — just enough to confidently *edit & extend this project*
- 🔵 **Full mastery** — understand and rebuild everything from scratch

---

## TL;DR timeline

| Goal | Time @ 2 hrs/day |
|------|------------------|
| 🟢 Edit content + build new sections (HTML/CSS/JS basics + React + Tailwind) | **4–6 weeks** |
| 🔵 Comfortably rebuild the whole project (add Framer Motion, Matter.js, Three.js) | **3–4 months** |

You don't need the advanced 3D/physics parts to use or customize the site.

---

## The learning order (do it in this sequence)

### Phase 1 — Foundations  ⏱ 4–6 weeks
| Tech | Time | Why | Best free resources |
|------|------|-----|---------------------|
| **HTML + CSS** | 1–2 weeks | structure + styling basics | [MDN](https://developer.mozilla.org/), [freeCodeCamp Responsive Web Design](https://www.freecodecamp.org/learn), [Kevin Powell (YouTube)](https://www.youtube.com/kepowob) |
| **JavaScript (ES6+)** | 3–4 weeks | the language everything is built on | [javascript.info](https://javascript.info/), [MDN JS Guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide), [Wes Bos — JavaScript30 (free)](https://javascript30.com/) |

> Focus on JS: functions, arrays (`map`/`filter`), objects, destructuring, modules
> (`import`/`export`), promises/`async`, and the DOM. ~80% of this project is JS.

### Phase 2 — Core of this project  ⏱ 4–5 weeks
| Tech | Time | Why | Best resources |
|------|------|-----|----------------|
| **React 18** | 3–4 weeks | the whole UI is React components | [react.dev (official — start here)](https://react.dev/learn), [Scrimba "Learn React" (free)](https://scrimba.com/learn/learnreact), [Net Ninja React (YouTube)](https://www.youtube.com/@NetNinja) |
| **Vite** | ½ day | dev server + build tool | [vitejs.dev guide](https://vitejs.dev/guide/) — learn it *while* doing React |
| **Tailwind CSS** | 3–5 days | all styling classes (`flex`, `rounded-3xl`…) | [tailwindcss.com/docs](https://tailwindcss.com/docs), [Tailwind Labs (YouTube)](https://www.youtube.com/@TailwindLabs) |

> After this phase you can fully edit `data.js`, restyle, and add new sections. 🟢

### Phase 3 — Animation & polish  ⏱ 1.5 weeks
| Tech | Time | Why | Best resources |
|------|------|-----|----------------|
| **Framer Motion** | 1 week | fade/slide/stagger reveals, tabs | [motion.dev/docs](https://motion.dev/docs), [Sam Selikoff (YouTube)](https://www.youtube.com/@samselikoff) |
| **Lenis** | 1 day | smooth scrolling | [GitHub README](https://github.com/darkroomengineering/lenis) (short) |
| **react-icons** | ~1 hour | the icon set | [react-icons.github.io](https://react-icons.github.io/react-icons/) |

### Phase 4 — Advanced (the "wow" parts)  ⏱ 4–5 weeks
| Tech | Time | Why | Best resources |
|------|------|-----|----------------|
| **Matter.js** | 1 week | the physics Skills playground | [brm.io/matter-js (docs+demos)](https://brm.io/matter-js/), [The Coding Train (YouTube)](https://www.youtube.com/@TheCodingTrain) |
| **Three.js + React Three Fiber** | 3–4 weeks | the 3D hero cube | [Three.js Journey — Bruno Simon (paid, the best)](https://threejs-journey.com/), [R3F docs](https://r3f.docs.pmnd.rs/), [Wawa Sensei (free YouTube)](https://www.youtube.com/@WawaSensei) |

> Three.js is the steepest. It's optional for using this site — treat it as a
> stretch goal once everything else is solid.

---

## Suggested study plan (calendar view, ~2 hrs/day)

```
Weeks 1–2    HTML + CSS
Weeks 3–6    JavaScript (most important — don't rush)
Weeks 7–10   React + Vite + Tailwind   ← you can now edit this project 🟢
Weeks 11–12  Framer Motion + Lenis
Weeks 13–14  Matter.js
Weeks 15–18  Three.js + React Three Fiber  ← full mastery 🔵
```

## Tips
- **Learn by editing this repo.** Open `src/data.js`, change text, see it live with `npm run dev`.
- Build *small* things, not just watch tutorials (avoid "tutorial hell").
- Use the official docs first — `react.dev`, `tailwindcss.com`, `motion.dev` are excellent.
- One paid recommendation worth it: **Three.js Journey** (only if you want serious 3D).
