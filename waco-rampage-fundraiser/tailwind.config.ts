import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rampage: {
          purple: "#6B2FA0",
          "purple-light": "#8A4FC4",
          "purple-dark": "#3B1B5A",
          "purple-deep": "#1E0E30",
          charcoal: "#18171B",
          black: "#0B0A0D",
          gray: "#9C99A3",
          "gray-light": "#F2F1F4",
          white: "#FFFFFF",
          silver: "#C7C6CE",
          "silver-dark": "#8E8C97",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        brush: ["var(--font-brush)", "cursive"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(0,0,0,0.35)",
        "card-light": "0 4px 24px rgba(14,13,16,0.10)",
        glow: "0 0 40px rgba(107,47,160,0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
