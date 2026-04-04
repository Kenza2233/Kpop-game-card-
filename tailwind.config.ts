import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'kpop-dark': '#0a0a0f',
        'kpop-darker': '#050508',
        'kpop-card': '#12121a',
        'kpop-pink': '#ff2d78',
        'kpop-purple': '#8b5cf6',
        'kpop-gold': '#ffd700',
        'kpop-blue': '#60a5fa',
        'kpop-green': '#34d399',
      },
      fontFamily: {
        display: ['var(--font-righteous)', 'cursive'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'sparkle': 'sparkle 2s infinite',
        'holo-shift': 'holo-shift 4s infinite linear',
        'pull-reveal': 'pull-reveal 0.6s ease-in-out',
        'float': 'float 3s infinite ease-in-out',
        'shimmer': 'shimmer 2s infinite',
        'confetti': 'confetti-fall 3s ease-in',
        'pulse-glow': 'pulse-glow 2s infinite',
        'pity-warning': 'pity-warning 1s infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};
export default config;
