import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { resolveIcon } from "./icons";
import * as fallback from "../data";

/**
 * Loads all editable content (profile, projects, skills, …) from Supabase and
 * reshapes each row to the SAME shape the components already expect from
 * src/data.js — including resolving icon NAMES back into icon COMPONENTS.
 *
 * The initial value is the static data.js content, so the site renders instantly
 * and never shows a blank state. Once Supabase responds, the content is swapped
 * in. If Supabase is unreachable or the keys aren't set, the fallback stays.
 *
 * NOTE: the live-fetched stats (leetcode / gfg / github) are NOT handled here;
 * those keep importing directly from data.js.
 */

const ContentContext = createContext(null);

// ---- row → app-shape mappers ---------------------------------------------
const shapeProfile = (row) =>
  !row
    ? fallback.profile
    : {
        name: row.name,
        shortName: row.short_name,
        role: row.role,
        email: row.email,
        resumeUrl: row.resume_url,
        photo: row.photo,
        // web3formsKey isn't in the DB — keep the static one from data.js.
        web3formsKey: fallback.profile.web3formsKey,
      };

const shapeNav = (rows) => rows.map((r) => ({ label: r.label, href: r.href }));

const shapeSocials = (rows) =>
  rows.map((r) => ({ Icon: resolveIcon(r.icon_name), href: r.href, label: r.label }));

const shapeOrbit = (rows) =>
  rows
    .filter((r) => r.context === "orbit")
    .map((r) => ({ name: r.name, Icon: resolveIcon(r.icon_name), color: r.color }));

const shapePlayground = (rows) =>
  rows
    .filter((r) => r.context === "playground")
    .map((r) => ({
      name: r.name,
      Icon: resolveIcon(r.icon_name),
      img: r.img || undefined,
      bg: r.bg,
      fg: r.fg,
    }));

const shapeProjects = (rows) =>
  rows.map((r) => ({
    category: r.category,
    title: r.title,
    description: r.description,
    tags: r.tags || [],
    image: r.image,
    glow: r.glow,
    link: r.link,
    ...(r.fit ? { fit: r.fit } : {}),
  }));

const shapeCerts = (rows) =>
  rows.map((r) => ({
    title: r.title,
    issuer: r.issuer,
    date: r.date,
    color: r.color,
    link: r.link,
  }));

const shapeTimeline = (rows) =>
  rows.map((r) => ({
    period: r.period,
    cgpa: r.cgpa,
    title: r.title,
    place: r.place,
    icon: r.icon,
    color: r.color,
    progress: r.progress,
    ...(r.longest_streak != null ? { longest_streak: r.longest_streak } : {}),
  }));

// ---------------------------------------------------------------------------
export function ContentProvider({ children }) {
  const [content, setContent] = useState({
    profile: fallback.profile,
    navLinks: fallback.navLinks,
    socials: fallback.socials,
    orbitSkills: fallback.orbitSkills,
    playgroundSkills: fallback.playgroundSkills,
    projects: fallback.projects,
    certificates: fallback.certificates,
    education: fallback.education,
    achievements: fallback.achievements,
  });

  useEffect(() => {
    if (!supabase) return; // no keys yet → keep static fallback
    let cancelled = false;

    (async () => {
      try {
        const [profileRes, nav, soc, skills, proj, certs, edu, ach] =
          await Promise.all([
            supabase.from("profile").select("*").limit(1).maybeSingle(),
            supabase.from("nav_links").select("*").order("sort_order"),
            supabase.from("socials").select("*").order("sort_order"),
            supabase.from("skills").select("*").order("sort_order"),
            supabase.from("projects").select("*").order("sort_order"),
            supabase.from("certificates").select("*").order("sort_order"),
            supabase.from("education").select("*").order("sort_order"),
            supabase.from("achievements").select("*").order("sort_order"),
          ]);
        if (cancelled) return;

        // Merge only the pieces that came back cleanly; anything missing or
        // errored keeps its static fallback value.
        const next = {};
        if (profileRes.data) next.profile = shapeProfile(profileRes.data);
        if (nav.data?.length) next.navLinks = shapeNav(nav.data);
        if (soc.data?.length) next.socials = shapeSocials(soc.data);
        if (skills.data?.length) {
          next.orbitSkills = shapeOrbit(skills.data);
          next.playgroundSkills = shapePlayground(skills.data);
        }
        if (proj.data?.length) next.projects = shapeProjects(proj.data);
        if (certs.data?.length) next.certificates = shapeCerts(certs.data);
        if (edu.data?.length) next.education = shapeTimeline(edu.data);
        if (ach.data?.length) next.achievements = shapeTimeline(ach.data);

        setContent((c) => ({ ...c, ...next }));
      } catch (err) {
        // Network/CORS/etc. — silently keep the fallback content.
        console.warn("[content] Supabase fetch failed, using data.js", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}
