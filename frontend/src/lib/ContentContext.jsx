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
        // Fall back to the static default if the column isn't set/created yet.
        quote: row.quote ?? fallback.profile.quote,
        quoteAuthor: row.quote_author ?? fallback.profile.quoteAuthor,
        summary: row.summary ?? fallback.profile.summary,
      };

const shapeNav = (rows) => rows.map((r) => ({ label: r.label, href: r.href }));

const shapeTestimonials = (rows) =>
  rows.map((r) => ({ name: r.name, message: r.message, date: r.date }));

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

const shapeResourceFile = (r) => ({
  id: r.id,
  resourceId: r.resource_id,
  label: r.label || "",
  fileUrl: r.file_url || "",
  filePath: r.file_path || "",
});

// `filesByResource` maps resource_id → shaped file rows (may be undefined).
const shapeResources = (rows, filesByResource = {}) =>
  rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    coverImage: r.cover_image || "",
    fileUrl: r.file_url || "#",
    fileName: r.file_name || "",
    isPaid: !!r.is_paid,
    // 'free' | 'paid' | 'request'. Derived from the old boolean when the
    // access_type column hasn't been added/backfilled yet.
    accessType: r.access_type || (r.is_paid ? "paid" : "free"),
    price: r.price,
    currency: r.currency || "INR",
    // Kept so /resources can offer "Newest" and "Default order" sorting.
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    files: filesByResource[r.id] || [],
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
    testimonials: fallback.testimonials,
    resources: fallback.resources,
  });

  useEffect(() => {
    if (!supabase) return; // no keys yet → keep static fallback
    let cancelled = false;

    (async () => {
      try {
        console.log("[content] Fetching data from Supabase...");
        const [profileRes, nav, soc, skills, proj, certs, edu, ach, testi, res, rfiles] =
          await Promise.all([
            supabase.from("profile").select("*").limit(1).maybeSingle(),
            supabase.from("nav_links").select("*").order("sort_order"),
            supabase.from("socials").select("*").order("sort_order"),
            supabase.from("skills").select("*").order("sort_order"),
            supabase.from("projects").select("*").order("sort_order"),
            supabase.from("certificates").select("*").order("sort_order"),
            supabase.from("education").select("*").order("sort_order"),
            supabase.from("achievements").select("*").order("sort_order"),
            supabase.from("testimonials").select("*").order("sort_order"),
            supabase.from("resources").select("*").order("sort_order"),
            supabase.from("resource_files").select("*").order("sort_order"),
          ]);
        if (cancelled) return;

        // Merge only the pieces that came back cleanly; anything missing or
        // errored keeps its static fallback value.
        const next = {};
        if (profileRes.data) next.profile = shapeProfile(profileRes.data);
        if (nav.data?.length) next.navLinks = shapeNav(nav.data);

        // Always prefer Supabase socials if they exist, otherwise use fallback
        console.log("[content] Supabase socials response:", soc);
        if (soc.data?.length) {
          next.socials = shapeSocials(soc.data);
          console.log("[content] Loaded socials from Supabase:", soc.data.length);
        } else {
          // Keep fallback if Supabase returned empty or has an error
          next.socials = fallback.socials;
          console.log("[content] Using fallback socials - Supabase returned empty/error");
        }
        if (skills.data?.length) {
          next.orbitSkills = shapeOrbit(skills.data);
          next.playgroundSkills = shapePlayground(skills.data);
        }
        if (proj.data?.length) next.projects = shapeProjects(proj.data);
        if (certs.data?.length) next.certificates = shapeCerts(certs.data);
        if (edu.data?.length) next.education = shapeTimeline(edu.data);
        if (ach.data?.length) next.achievements = shapeTimeline(ach.data);
        if (testi.data?.length) next.testimonials = shapeTestimonials(testi.data);

        // Resources with fallback
        if (res.data?.length) {
          // Group files under their resource so each resource carries a
          // `files` array (a "folder" can hold many files).
          const filesByResource = {};
          for (const f of rfiles.data || []) {
            (filesByResource[f.resource_id] ||= []).push(shapeResourceFile(f));
          }
          next.resources = shapeResources(res.data, filesByResource);
        } else {
          // Keep fallback if Supabase returned empty or has an error
          next.resources = fallback.resources;
        }

        // Ensure critical data always has fallback
        setContent((c) => ({
          ...c,
          ...next,
          socials: next.socials || fallback.socials,
          resources: next.resources || fallback.resources,
        }));
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
