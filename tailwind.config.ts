import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1A2F",
          50: "#E8EEF5",
          100: "#C7D5E5",
          800: "#0E2440",
          900: "#0A1A2F",
          950: "#06101F",
        },
        ocean: {
          DEFAULT: "#0B5C8C",
          400: "#1E84C2",
          500: "#0B5C8C",
          600: "#084766",
        },
        turquoise: {
          DEFAULT: "#21C0C0",
          400: "#3FD9D9",
          500: "#21C0C0",
          600: "#149C9C",
        },
        gold: {
          DEFAULT: "#D7B36B",
          400: "#E4C887",
          500: "#D7B36B",
          600: "#BE9748",
        },
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        luxe: "0 24px 60px -20px rgba(10, 26, 47, 0.45)",
        gold: "0 18px 50px -16px rgba(215, 179, 107, 0.45)",
      },
      backgroundImage: {
        "ocean-gradient":
          "linear-gradient(135deg, #06101F 0%, #0A1A2F 45%, #0B5C8C 100%)",
        "gold-line":
          "linear-gradient(90deg, transparent, #D7B36B 50%, transparent)",
      },
      keyframes: {
        "slow-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.12)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "slow-zoom": "slow-zoom 7s ease-out forwards",
        "fade-up": "fade-up 0.8s ease forwards",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
