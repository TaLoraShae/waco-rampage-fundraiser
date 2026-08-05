import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rampage: {
          purple: "var(--color-primary, #6B2FA0)",
          "purple-light": "var(--color-accent, #8A4FC4)",
          "purple-dark": "var(--color-secondary, #1E0E30)",
          "purple-deep": "color-mix(in srgb, var(--color-secondary, #1E0E30) 65%, black)",
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
