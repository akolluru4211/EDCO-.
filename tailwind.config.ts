import type { Config } from "tailwindcss";

const config: Config = {
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
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'border-beam': {
          '100%': { 'offset-distance': '100%' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.8' },
          '50%': { transform: 'scale(1.25)', opacity: '0' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', filter: 'blur(20px)' },
          '50%': { opacity: '0.8', filter: 'blur(28px)' },
        },
        'flame-flicker': {
          '0%': { transform: 'scale(1) rotate(-1deg)', filter: 'drop-shadow(0 0 6px rgba(255, 122, 80, 0.6))' },
          '50%': { transform: 'scale(1.08) rotate(2deg)', filter: 'drop-shadow(0 0 14px rgba(255, 184, 0, 0.8))' },
          '100%': { transform: 'scale(0.96) rotate(-2deg)', filter: 'drop-shadow(0 0 8px rgba(255, 75, 43, 0.7))' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'float-gentle': 'float-gentle 4s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        'flame-flicker': 'flame-flicker 1.8s ease-in-out infinite alternate',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-scale': 'fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'gradient-x': 'gradient-x 8s ease infinite',
      },
    },
  },
  plugins: [],
};
export default config;
