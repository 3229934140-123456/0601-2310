/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        space: {
          950: "#050A14",
          900: "#0A1628",
          800: "#0F1E37",
          700: "#162A4A",
          600: "#1E3A5F",
          500: "#2A4A78",
        },
        ship: {
          silver: "#8B9DC3",
          gray: "#5A6A8A",
          dark: "#3A4860",
        },
        energy: {
          cyan: "#00D4FF",
          blue: "#4A9EFF",
          purple: "#9D6CFF",
        },
        danger: {
          red: "#FF2E63",
          orange: "#FF6B35",
          yellow: "#FFC93C",
        },
        life: {
          green: "#39FF14",
          teal: "#20DFC0",
        },
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['Exo 2', 'sans-serif'],
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 212, 255, 0.35)",
        'glow-lg': "0 0 40px rgba(0, 212, 255, 0.5)",
        'glow-red': "0 0 20px rgba(255, 46, 99, 0.4)",
        'glow-green': "0 0 20px rgba(57, 255, 20, 0.4)",
        'glow-orange': "0 0 20px rgba(255, 107, 53, 0.5)",
        card: "0 4px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
      },
      backgroundImage: {
        'gradient-space': 'linear-gradient(135deg, #050A14 0%, #0A1628 50%, #0F1E37 100%)',
        'gradient-energy': 'linear-gradient(135deg, #00D4FF 0%, #4A9EFF 100%)',
        'gradient-danger': 'linear-gradient(135deg, #FF2E63 0%, #FF6B35 100%)',
        'gradient-life': 'linear-gradient(135deg, #39FF14 0%, #20DFC0 100%)',
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'scan': 'scan 3s linear infinite',
        'shake': 'shake 0.5s ease-in-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'blink': 'blink 1s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.35)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.7)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
};
