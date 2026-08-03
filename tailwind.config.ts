import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4BAEE9",
          50: "#EEF8FD",
          100: "#D9F0FB",
          200: "#B8E3F8",
          300: "#8BD3F3",
          400: "#63C2EE",
          500: "#4BAEE9",
          600: "#2E94D5",
          700: "#2477AF",
          800: "#215F8A",
          900: "#204F70",
        },
        dark: {
          DEFAULT: "#141414",
          50: "#F5F5F5",
          100: "#E0E0E0",
          200: "#B3B3B3",
          300: "#808080",
          400: "#4D4D4D",
          500: "#2B2B2B",
          600: "#1F1F1F",
          700: "#181818",
          800: "#141414",
          900: "#0A0A0A",
        },
        white: "#FFFFFF",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.6s ease-out both",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
