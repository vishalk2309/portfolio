/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#FAF7F2", // page background — warm off-white / cream
        ink: "#1E1E1E", // deep black — primary text
        paper: "#FFFFFF", // real white (for dark buttons' text, etc.)
        // NOTE: `white` is intentionally remapped to deep ink so the existing
        // text-white / border-white utilities become dark on the light theme
        // without editing every component. Use `paper` when you need true white.
        white: "#1E1E1E",
        // Accent utilities (neon-*) are remapped to warm gold for the light theme.
        neon: {
          cyan: "#D9A441", // primary gold accent
          purple: "#C79A3E", // warm gold
          blue: "#BE8A3A", // warm gold
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
        serif: ['"Playfair Display"', "Georgia", "Cambria", "serif"],
      },
      backgroundImage: {
        "gradient-text":
          "linear-gradient(45deg, var(--accent-from), var(--accent-to), #FFFFFF)",
        "gradient-btn":
          "linear-gradient(90deg, var(--accent-from), var(--accent-to))",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-5px)" },
        },
        floatCard: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(3deg)" },
        },
        aurora1: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(80px, -60px) scale(1.15)" },
        },
        aurora2: {
          "0%, 100%": { transform: "translate(0, 0) scale(1.1)" },
          "50%": { transform: "translate(-100px, 50px) scale(1)" },
        },
        aurora3: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(60px, 80px) scale(1.2)" },
        },
        footerFloat: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "float-card": "floatCard 6s ease-in-out infinite",
        aurora1: "aurora1 18s ease-in-out infinite",
        aurora2: "aurora2 22s ease-in-out infinite",
        aurora3: "aurora3 26s ease-in-out infinite",
        "footer-float": "footerFloat 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
