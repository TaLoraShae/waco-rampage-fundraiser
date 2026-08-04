import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rampage: {
          purple: "#5B2A86",
          "purple-dark": "#3B1B5A",
          "purple-deep": "#2A1240",
          charcoal: "#1C1B1F",
          black: "#0E0D10",
          gray: "#8A8790",
          "gray-light": "#F1EFF4",
          white: "#FFFFFF",
          gold: "#D9C25C"
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "stitch-line": "repeating-linear-gradient(90deg, #D9C25C 0, #D9C25C 10px, transparent 10px, transparent 20px)",
      },
      boxShadow: {
        card: "0 4px 24px rgba(14,13,16,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
