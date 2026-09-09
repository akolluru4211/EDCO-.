/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Design System Tokens (Career & Core)
        paper: {
          DEFAULT: "#fbfaf8",
          raised: "#ffffff",
          soft: "#f4f1ea",
        },
        ink: {
          DEFAULT: "#18181b",
          soft: "#71717a",
          muted: "#a1a1aa",
        },
        forest: {
          DEFAULT: "#1b4332",
          dark: "#081c15",
          light: "#2d6a4f",
        },
        gold: {
          DEFAULT: "#d97706",
          dark: "#b45309",
          light: "#fef3c7",
        },
        teal: {
          DEFAULT: "#0d9488",
          dark: "#0f766e",
          light: "#ccfbf1",
        },
        line: {
          DEFAULT: "#e4e4e7",
          dark: "#d4d4d8",
        },
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-fraunces)", "serif"],
      },
    },
  },
  plugins: [],
};
