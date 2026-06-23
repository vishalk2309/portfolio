/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#050816",
        ink: "#0A0A0A",
        neon: {
          cyan: "#6EE7F9",
          purple: "#A855F7",
          blue: "#3B82F6",
        },
      },
      fontFamily: {
        sans: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      backgroundImage: {
        "gradient-text":
          "linear-gradient(45deg, #6EE7F9, #A855F7, #FFFFFF)",
        "gradient-btn": "linear-gradient(90deg, #6EE7F9, #A855F7)",
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
