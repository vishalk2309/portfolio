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
  name: "Vishal Kushwaha",
  shortName: "VK",
  role: "Software Developer & Web Developer",
  email: "kushwahavishal296@gmail.com",
  resumeUrl: "#",
  // Your photo lives in /public. Served at the site root.
  photo: "/profile1.png",
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export const socials = [
  { Icon: FaGithub, href: "https://github.com", label: "GitHub" },
  { Icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { Icon: FaXTwitter, href: "https://x.com", label: "X" },
  { Icon: FaEnvelope, href: "mailto:hello@vishal.dev", label: "Email" },
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
// Set your LeetCode username; `fallback` shows if the proxy is down.
export const leetcode = {
  username: "kushwahavishal296",
  profileUrl: "https://leetcode.com/u/kushwahavishal296/",
  apiBase: "https://leetcode-api-faisalshohag.vercel.app",
  fallback: {
    totalSolved: 350,
    totalQuestions: 3500,
    ranking: 200000,
    reputation: 0,
    contribution: 0,
    breakdown: [
      { label: "Easy", solved: 150, total: 900, color: "#22D3EE" },
      { label: "Medium", solved: 160, total: 1900, color: "#34D399" },
      { label: "Hard", solved: 40, total: 800, color: "#F87171" },
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
    category: "PDF-Toolkit",
    title: "PDFVish",
    description:
      "Every PDF tool you need — in one place.",
    tags: ["React", "Python", "Tailwind"],
    image: "/project1.png",
    fit: "contain", // show the full screenshot (no cropping)
    glow: "#A855F7",
    link: "https://pdfvish.onrender.com/",
  },
  {
    category: "Analytics",
    title: "Nebula Dashboard",
    description:
      "Real-time analytics dashboard with live charts, role-based access and a themable design system.",
    tags: ["TypeScript", "React", "D3"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
    glow: "#6EE7F9",
    link: "#",
  },
  {
    category: "Realtime",
    title: "Pulse Chat",
    description:
      "End-to-end encrypted realtime chat with presence, typing indicators and WebSocket updates.",
    tags: ["Node.js", "Socket.io", "Redis"],
    image:
      "https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&w=1000&q=80",
    glow: "#3B82F6",
    link: "#",
  },
  {
    category: "AI",
    title: "Aurora AI Studio",
    description:
      "AI content studio that turns prompts into polished copy with streaming responses and history.",
    tags: ["Next.js", "OpenAI", "Prisma"],
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80",
    glow: "#22D3EE",
    link: "#",
  },
];

/* --------------------------- Certificates --------------------------- */
export const certificates = [
  {
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services",
    date: "Dec 2024",
    color: "#C8881F",
    link: "#",
  },
  {
    title: "React Advanced Certification",
    issuer: "Meta Blueprint",
    date: "Nov 2024",
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
  {
    title: "Docker & Kubernetes Mastery",
    issuer: "Cloud Native CF",
    date: "Aug 2024",
    color: "#2496ED",
    link: "#",
  },
];
