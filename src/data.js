import {
  SiReact,
  SiJavascript,
  SiNodedotjs,
  SiMongodb,
  SiTailwindcss,
  SiDocker,
  SiExpress,
  SiGit,
  SiPython,
  SiHtml5,
  SiCss,
  SiMysql,
  SiVercel,
  SiRender,
} from "react-icons/si";
import { FaGithub, FaLinkedin, FaEnvelope, FaJava } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

/* ----------------------------- Profile ----------------------------- */
export const profile = {
  name: "Vishal Kumar Kushwaha",
  shortName: "VK",
  role: "Aspiring Software Engineer & Gen AI Enthusiast",
  email: "kushwahavishal296@gmail.com",
  resumeUrl: "/Vishal_Resume.pdf",
  // Your photo lives in /public. Served at the site root.
  photo: "/profile1.png",
  // Short line shown under the role on the home page. Editable from admin.
  quote: "First, solve the problem. Then, write the code.",
  quoteAuthor: "",
  // Professional summary shown in the About section. Editable from admin.
  summary:
    "I'm a Programmer Analyst at Cognizant Technology Solutions and a Computer Science student with hands-on experience across a range of technologies — including JavaScript, React, Python, Java, MongoDB, and MySQL. I love turning ideas into clean, functional products, from full-stack web applications to interactive, data-driven interfaces. Right now I'm building projects that pair thoughtful design with solid engineering — including this portfolio, powered by a live content dashboard and real-time coding stats.",
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "#contact" },
];

export const socials = [
  { Icon: FaGithub, href: "https://github.com/vishalk2309", label: "GitHub" },
  {
    Icon: FaLinkedin,
    href: "https://linkedin.com/in/vishalkumarkushwaha",
    label: "LinkedIn",
  },
  // { Icon: FaXTwitter, href: "https://x.com", label: "X" },
  {
    Icon: FaEnvelope,
    href: "mailto:kushwahavishal296@gmail.com",
    label: "Email",
  },
];

/* --------------------------- Testimonials --------------------------- */
// "What people say" — shown as a scrolling marquee on the home page.
// Manage these from the admin dashboard (Testimonials).
export const testimonials = [
  {
    name: "Abhishek Kumar Ojha",
    message:
      "Bro, what an awesome portfolio you've made. Seriously, I loved it. Keep it up, buddy.",
    date: "2026",
  },
  // {
  //   name: "R. Verma",
  //   message:
  //     "Great attention to detail and genuinely easy to work with. The final result looked exactly how we imagined.",
  //   date: "2025",
  // },
  // {
  //   name: "P. Singh",
  //   message:
  //     "Clean code, clear communication, and delivered on time. Would happily work with him again.",
  //   date: "2024",
  // },
];

/* --------------------- About: orbiting tech icons -------------------- */
export const orbitSkills = [
  { name: "JavaScript", Icon: SiJavascript, color: "#F7DF1E" },
  { name: "Java", Icon: FaJava, color: "#E76F00" },
  { name: "Python", Icon: SiPython, color: "#3776AB" },
  { name: "React", Icon: SiReact, color: "#61DAFB" },
  { name: "HTML5", Icon: SiHtml5, color: "#E34F26" },
  { name: "CSS3", Icon: SiCss, color: "#1572B6" },
  { name: "Tailwind", Icon: SiTailwindcss, color: "#38BDF8" },
  { name: "MongoDB", Icon: SiMongodb, color: "#47A248" },
  { name: "MySQL", Icon: SiMysql, color: "#4479A1" },
  { name: "Git", Icon: SiGit, color: "#F05033" },
];

/* --------------------------- GeeksforGeeks --------------------------- */
// GFG has no working public API (the community ones broke after GFG's site
// redesign), so these numbers are STATIC. Open your GFG profile:
//   https://www.geeksforgeeks.org/user/kushwahavishal2219/
// and copy your real counts into `fallback` below. Leave apiBase empty.
// (If a working API appears later, set apiBase and it'll fetch automatically.)
export const gfg = {
  username: "kushwahavishal2219",
  profileUrl: "https://www.geeksforgeeks.org/user/kushwahavishal2219/",
  apiBase: "",
  fallback: {
    total: 223, // ← your total problems solved
    categories: [
      { label: "School", value: 0, color: "#10B981" },
      { label: "Basic", value: 23, color: "#22D3EE" },
      { label: "Easy", value: 90, color: "#34D399" },
      { label: "Medium", value: 93, color: "#FBBF24" },
      { label: "Hard", value: 17, color: "#F87171" },
    ],
  },
};

/* ----------------------------- LeetCode ----------------------------- */
// Live data via a CORS-enabled community proxy of LeetCode's GraphQL API.
// The hook hits `${apiBase}/userProfile/${username}`. `fallback` shows if
// the proxy is down or cold-starting. (First request can take ~30s while the
// free host wakes up — the live value replaces the fallback once it lands.)
export const leetcode = {
  username: "kushwahavishal296",
  profileUrl: "https://leetcode.com/u/kushwahavishal296/",
  apiBase: "https://alfa-leetcode-api.onrender.com",
  fallback: {
    totalSolved: 149,
    totalQuestions: 4005,
    ranking: 1131232,
    reputation: 0,
    contribution: 947,
    breakdown: [
      { label: "Easy", solved: 71, total: 956, color: "#22D3EE" },
      { label: "Medium", solved: 66, total: 2091, color: "#34D399" },
      { label: "Hard", solved: 12, total: 958, color: "#F87171" },
    ],
  },
};

/* ------------------------------ GitHub ------------------------------ */
// Live data is fetched from the public GitHub API (no token, CORS-enabled).
// `fallback` is shown until it loads, or if the rate limit (60/hr) is hit.
export const github = {
  username: "vishalk2309",
  // Shown only for the brief moment before live data loads (live overrides it).
  fallback: {
    grade: { letter: "C", pct: 35 },
    stars: 2,
    repos: 27,
    followers: 2,
    prs: 0,
    issues: 0,
    languages: [
      { name: "JavaScript", pct: 43, color: "#F1E05A" },
      { name: "C", pct: 14, color: "#555555" },
      { name: "HTML", pct: 14, color: "#E34C26" },
      { name: "Java", pct: 14, color: "#B07219" },
    ],
  },
};

/* ---------------------------- Education ----------------------------- */
export const education = [
  {
    period: "2021-2025",
    cgpa: "Secured 8.07 CGPA",
    title: "B.Tech, Computer Science & Engineering",
    place: "Maharana Pratap Engineering College, Kanpur",
    icon: "🎓",
    color: "#22D3EE",
    progress: 100,
  },
  {
    period: "2019-2021",
    cgpa: "Secured 76.8%",
    title: "Higher Secondary",
    place: "J.R.Convent School",
    icon: "🏫",
    color: "#34D399",
    progress: 100,
  },
  {
    period: "2018–2019",
    cgpa: "Secured 78.2%",
    title: "Secondary Education",
    place: "J.R.Convent School",
    icon: "🏛️",
    color: "#F472B6",
    progress: 100,
  },
];

export const achievements = [
  {
    period: "2024",
    cgpa: "National Level",
    title: "Coding Challenge",
    place: "Naukri Campus Young Turks Coding - Ranked #41 ",
    icon: "🏆",
    color: "#FBBF24",
    progress: 96,
    longest_streak: 150,
  },
  {
    period: "2023",
    cgpa: "Top 1%",
    title: "TECH-A-THON",
    place: " MPGI TECH-A-THON",
    icon: "⭐",
    color: "#A855F7",
    progress: 95,
  },
  // {
  //   period: "2022",
  //   cgpa: "Recognition",
  //   title: "Best Developer Award",
  //   place: "Awarded for outstanding project delivery",
  //   icon: "🥇",
  //   color: "#22D3EE",
  //   progress: 88,
  // },
];

/* --------------------- Skills physics playground -------------------- */
export const playgroundSkills = [
  { name: "JavaScript", Icon: SiJavascript, bg: "#F7DF1E", fg: "#000000" },
  { name: "Java", Icon: FaJava, bg: "#E76F00", fg: "#FFFFFF" },
  { name: "Python", Icon: SiPython, bg: "#3776AB", fg: "#FFFFFF" },
  { name: "React", Icon: SiReact, bg: "#22D3EE", fg: "#000000" },
  { name: "HTML5", Icon: SiHtml5, bg: "#E34F26", fg: "#FFFFFF" },
  { name: "CSS3", Icon: SiCss, bg: "#1572B6", fg: "#FFFFFF" },
  { name: "Tailwind", Icon: SiTailwindcss, bg: "#38BDF8", fg: "#FFFFFF" },
  { name: "Node.js", Icon: SiNodedotjs, bg: "#3C873A", fg: "#FFFFFF" },
  { name: "Express", Icon: SiExpress, bg: "#A8A8A8", fg: "#000000" },
  { name: "MongoDB", Icon: SiMongodb, bg: "#47A248", fg: "#FFFFFF" },
  { name: "MySQL", Icon: SiMysql, bg: "#4479A1", fg: "#FFFFFF" },
  { name: "Docker", Icon: SiDocker, bg: "#2496ED", fg: "#FFFFFF" },
  { name: "Git", Icon: SiGit, bg: "#F05033", fg: "#FFFFFF" },
  { name: "Render", Icon: SiRender, bg: "#46E3B7", fg: "#000000" },
  { name: "Vercel", Icon: SiVercel, bg: "#FFFFFF", fg: "#000000" },
  // Real Aiven logo from /public (react-icons has no Aiven icon).
  // Save the logo as public/aiven.svg (or .png and change the path).
  { name: "Aiven", img: "/aiven.svg", bg: "#FF3554", fg: "#FFFFFF" },
];

/* ----------------------------- Projects ----------------------------- */
export const projects = [
  {
    category: "AI",
    title: "AI WorkHub",
    description:
      "AI WorkHub is an enterprise-grade AI-powered project management platform. It combines classic PM features (projects, Kanban boards, tasks, comments, file attachments) with an AI assistant that can break a raw project idea into actionable tasks and answer project-management questions.",
    tags: [
      "React 19",
      "Vite",
      "Java 21",
      "Spring Boot",
      "Spring Security",
      "Spring Data JPA",
      "JWT (jjwt)",
      "OpenAI",
    ],
    image: "/portfolio-banner.svg",
    glow: "#22D3EE",
    link: "#",
  },

  {
    category: "PDF-Toolkit",
    title: "PDFVish",
    description: "Every PDF tool you need — in one place.",
    tags: ["React", "Python", "Tailwind"],
    image: "/project1.png",
    fit: "contain", // show the full screenshot (no cropping)
    glow: "#A855F7",
    link: "https://pdfvish.onrender.com/",
  },
  {
    category: "Food & Menu",
    title: "Kitchen King",
    description:
      "Kitchen King that has daily menu as well as logs and stocks also remind for water intake.",
    tags: ["React", "MySql"],
    image: "/project2.jpg",
    glow: "#6EE7F9",
    link: "https://kitchen-king.onrender.com",
  },
  {
    category: "E-Commerce",
    title: "Vi-mmerce",
    description: "Creating a E-Commerce website",
    tags: ["Node.js", "React js", "Springboot", "MySql", "Redis"],
    image: "/ecommerce.svg",
    glow: "#3B82F6",
    link: "#",
  },
];

/* --------------------------- Certificates --------------------------- */
export const certificates = [
  {
    title: "Python From Scratch",
    issuer: "CodeWithHarry",
    date: "June 2026",
    color: "#C8881F",
    link: "#",
  },
  {
    title: "AWS from Scratch",
    issuer: "Telusko",
    date: "July 2026",
    color: "#2496ED",
    link: "#",
  },

  {
    title: "Generative AI",
    issuer: "Aakriti E-Learning Academy",
    date: "April 2026",
    color: "#3E7C97",
    link: "#",
  },
  {
    title: "Full Stack Web Developer",
    issuer: "Google Cloud",
    date: "Oct 2024",
    color: "#2D5B9E",
    link: "#",
  },
  {
    title: "UI/UX Design Professional",
    issuer: "Adobe",
    date: "Sep 2024",
    color: "#B23A63",
    link: "#",
  },
];
