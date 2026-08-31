import { useState } from "react";
import { motion } from "framer-motion";
import { FiCopy, FiCheck, FiMail, FiDownload } from "react-icons/fi";
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa";

export default function CopyButtons({ email = "vishalkumar.kushwaha@cognizant.com", resumeUrl = "/resume.pdf", socials = {} }) {
  const [copied, setCopied] = useState(null);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const buttons = [
    {
      id: "email",
      icon: FiMail,
      label: "Email",
      value: email,
      color: "text-rose-400",
      bgColor: "from-rose-500/20 to-rose-500/5",
    },
    {
      id: "resume",
      icon: FiDownload,
      label: "Resume",
      value: resumeUrl,
      color: "text-emerald-400",
      bgColor: "from-emerald-500/20 to-emerald-500/5",
      isDownload: true,
    },
  ];

  // Add social media buttons if available
  if (socials.linkedin) {
    buttons.push({
      id: "linkedin",
      icon: FaLinkedin,
      label: "LinkedIn",
      value: socials.linkedin,
      color: "text-blue-400",
      bgColor: "from-blue-500/20 to-blue-500/5",
      isLink: true,
    });
  }

  if (socials.github) {
    buttons.push({
      id: "github",
      icon: FaGithub,
      label: "GitHub",
      value: socials.github,
      color: "text-purple-400",
      bgColor: "from-purple-500/20 to-purple-500/5",
      isLink: true,
    });
  }

  if (socials.twitter) {
    buttons.push({
      id: "twitter",
      icon: FaTwitter,
      label: "Twitter",
      value: socials.twitter,
      color: "text-cyan-400",
      bgColor: "from-cyan-500/20 to-cyan-500/5",
      isLink: true,
    });
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
    >
      {buttons.map((btn) => {
        const Icon = btn.icon;
        const isCopied = copied === btn.id;

        return (
          <motion.button
            key={btn.id}
            variants={item}
            onClick={() => {
              if (btn.isDownload) {
                window.open(btn.value, "_blank");
              } else if (btn.isLink) {
                window.open(btn.value, "_blank");
              } else {
                copyToClipboard(btn.value, btn.id);
              }
            }}
            className={`glass group relative overflow-hidden rounded-xl p-4 border border-white/10 transition-all hover:border-white/20 hover:bg-white/5 active:scale-95 bg-gradient-to-br ${btn.bgColor}`}
          >
            <div className="flex flex-col items-center gap-2">
              <Icon className={`text-xl ${btn.color}`} />
              <span className="text-xs font-semibold text-white">{btn.label}</span>
            </div>

            {/* Feedback indicator */}
            <motion.div
              animate={
                isCopied
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.5 }
              }
              className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-sm rounded-xl"
            >
              <div className="text-center">
                <FiCheck className="text-emerald-400 text-lg mx-auto mb-1" />
                <span className="text-xs font-bold text-emerald-400">
                  {btn.isDownload || btn.isLink ? "Opened" : "Copied"}
                </span>
              </div>
            </motion.div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
