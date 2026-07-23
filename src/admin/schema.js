// Describes every editable table: which columns exist, how to render each as a
// form field, and which columns to show in the list view. The generic
// <TableEditor> reads this — so adding a field here adds it everywhere.
//
// field types: text | textarea | number | color | array | select | image
// A table with singleRow:true is edited in place (no add/delete), e.g. profile.

export const TABLES = [
  {
    key: "profile",
    label: "Profile",
    singleRow: true,
    
    icon: "👤",
    fields: [
      { name: "name", label: "Full name", type: "text" },
      { name: "short_name", label: "Short name / initials", type: "text" },
      { name: "role", label: "Role / tagline", type: "text", full: true },
      { name: "email", label: "Email", type: "text" },
      { name: "resume_url", label: "Resume URL", type: "text" },
      { name: "photo", label: "Photo", type: "image" },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    icon: "🚀",
    listColumns: ["title", "category"],
    orderBy: "sort_order",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "tags", label: "Tags (comma separated)", type: "array", full: true },
      { name: "image", label: "Image", type: "image" },
      { name: "glow", label: "Glow color", type: "color" },
      { name: "link", label: "Link", type: "text" },
      { name: "fit", label: "Image fit (blank or 'contain')", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "certificates",
    label: "Certificates",
    icon: "📜",
    listColumns: ["title", "issuer"],
    orderBy: "sort_order",
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "issuer", label: "Issuer", type: "text" },
      { name: "date", label: "Date", type: "text" },
      { name: "color", label: "Color", type: "color" },
      { name: "link", label: "Link", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "education",
    label: "Education",
    icon: "🎓",
    listColumns: ["title", "place"],
    orderBy: "sort_order",
    fields: [
      { name: "period", label: "Period (e.g. 2021-2025)", type: "text" },
      { name: "cgpa", label: "Result / CGPA", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "place", label: "Institution", type: "text", full: true },
      { name: "icon", label: "Icon (emoji)", type: "text" },
      { name: "color", label: "Color", type: "color" },
      { name: "progress", label: "Progress (0-100)", type: "number" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "achievements",
    label: "Achievements",
    icon: "🏆",
    listColumns: ["title", "place"],
    orderBy: "sort_order",
    fields: [
      { name: "period", label: "Period", type: "text" },
      { name: "cgpa", label: "Label (e.g. National Level)", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "place", label: "Details", type: "text", full: true },
      { name: "icon", label: "Icon (emoji)", type: "text" },
      { name: "color", label: "Color", type: "color" },
      { name: "progress", label: "Progress (0-100)", type: "number" },
      { name: "longest_streak", label: "Longest streak (optional)", type: "number" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "skills",
    label: "Skills",
    icon: "🧩",
    listColumns: ["name", "context"],
    orderBy: "sort_order",
    fields: [
      { name: "name", label: "Name", type: "text" },
      {
        name: "context",
        label: "Where it shows",
        type: "select",
        options: ["orbit", "playground"],
      },
      {
        name: "icon_name",
        label: "Icon name (e.g. SiReact) — must exist in src/lib/icons.js",
        type: "text",
        full: true,
      },
      { name: "img", label: "Image (used if no icon name)", type: "image" },
      { name: "color", label: "Color (orbit uses this)", type: "color" },
      { name: "bg", label: "Background (playground uses this)", type: "color" },
      { name: "fg", label: "Foreground (playground uses this)", type: "color" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "socials",
    label: "Socials",
    icon: "🔗",
    listColumns: ["label", "href"],
    orderBy: "sort_order",
    fields: [
      { name: "label", label: "Label", type: "text" },
      { name: "href", label: "URL (or mailto:)", type: "text", full: true },
      {
        name: "icon_name",
        label: "Icon name (e.g. FaGithub) — must exist in src/lib/icons.js",
        type: "text",
        full: true,
      },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "nav_links",
    label: "Nav links",
    icon: "🧭",
    listColumns: ["label", "href"],
    orderBy: "sort_order",
    fields: [
      { name: "label", label: "Label", type: "text" },
      { name: "href", label: "Anchor (e.g. #about)", type: "text" },
      { name: "sort_order", label: "Sort order", type: "number" },
    ],
  },
];

// Blank record for the "Add new" form.
export function emptyRecord(table) {
  const rec = {};
  for (const f of table.fields) {
    rec[f.name] = f.type === "array" ? [] : f.type === "number" ? "" : "";
  }
  return rec;
}
