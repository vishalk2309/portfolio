// Maps icon NAMES (stored as text in Supabase, e.g. "SiReact") to the actual
// react-icons components. A database can't store a React component, so we store
// the name and look it up here.
//
// To use a new icon from the dashboard: import it below and add it to ICONS,
// then set that name in the skill/social row. (One line of code per new icon.)
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

const ICONS = {
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
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaJava,
  FaXTwitter,
};

// Returns the icon component for a name, or null (callers that render an icon
// component always fall back to an <img> or skip when this is null).
export function resolveIcon(name) {
  return (name && ICONS[name]) || null;
}
