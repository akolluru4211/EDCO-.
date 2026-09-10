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
        // Quixel Modern Gamified Aesthetic Tokens
        quixel: {
          dark: "#13141B",
          darker: "#0B0C10",
          bg: "#F4F6FB",
          card: "#FFFFFF",
          lime: "#D7FC51",
          limeLight: "#E9FFA4",
          cyan: "#00D2B4",
          cyanLight: "#E0FAF6",
          purple: "#7B57FF",
          purpleLight: "#F0ECFF",
          gold: "#FFB800",
          goldLight: "#FFF6DC",
          orange: "#FF7A50",
          orangeLight: "#FFEFEA",
          lavender: "#EDE8FD",
          border: "#E8ECF2",
          borderSoft: "#F1F4F9",
          textMuted: "#8E95A5",
          textDark: "#181920",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-fraunces)", "serif"],
      },
      boxShadow: {
        'quixel': '0 8px 30px rgba(0, 0, 0, 0.04)',
        'quixel-hover': '0 12px 36px rgba(0, 0, 0, 0.08)',
        'quixel-card': '0 2px 10px rgba(0, 0, 0, 0.02), 0 10px 30px rgba(0, 0, 0, 0.04)',
        'quixel-streak': '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
    },
  },
  plugins: [],
};
