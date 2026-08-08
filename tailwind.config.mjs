/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0B0D',
          900: '#141417',
          800: '#1C1C21',
          700: '#28282F',
        },
        gold: {
          500: '#C9A24B',
          400: '#D6B466',
          300: '#E8D28C',
          200: '#F2E4B7',
          100: '#F9F5E6',
        },
        plum: {
          900: '#23152C',
          800: '#341E42',
          700: '#3D244E',
          600: '#4B2E5C',
          500: '#643F7A',
        },
        paper: {
          50: '#F5F2EC',
          100: '#EAE5DB',
          200: '#D5CEC1',
        },
        signal: {
          green: '#4CAF6D',
        },
        bg: '#0B0B0D',
        surface: '#141417',
        border: 'rgba(201, 162, 75, 0.15)',
        text: '#F5F2EC',
        muted: '#8B8B96',
        accent: '#C9A24B',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(201, 162, 75, 0.25)',
        'gold-border': '0 0 15px -3px rgba(201, 162, 75, 0.15)',
      },
      backgroundImage: {
        'radial-gold': 'radial-gradient(circle at top right, rgba(201, 162, 75, 0.08), transparent 50%)',
        'radial-plum': 'radial-gradient(circle at bottom left, rgba(75, 46, 92, 0.12), transparent 50%)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
};
