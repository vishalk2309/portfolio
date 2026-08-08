import { useState } from "react";
import {
  FaXTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaFacebookF,
  FaEnvelope,
  FaLink,
} from "react-icons/fa6";

/** Social share row for a blog post. */
export default function ShareButtons({ url, title }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title || "");

  const links = [
    { label: "Share on X", Icon: FaXTwitter, href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { label: "Share on LinkedIn", Icon: FaLinkedinIn, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "Share on WhatsApp", Icon: FaWhatsapp, href: `https://wa.me/?text=${t}%20${u}` },
    { label: "Share on Facebook", Icon: FaFacebookF, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "Share via email", Icon: FaEnvelope, href: `mailto:?subject=${t}&body=${u}` },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-white/50">Share:</span>
      {links.map(({ label, Icon, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all hover:scale-110 hover:text-neon-cyan"
        >
          <Icon />
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        title="Copy link"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 transition-all hover:scale-110 hover:text-neon-cyan"
      >
        <FaLink />
      </button>
      {copied && <span className="text-xs text-emerald-400">Link copied!</span>}
    </div>
  );
}
