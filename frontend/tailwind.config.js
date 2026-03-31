/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        insitro: {
          purple: {
            100: '#e0d8f0',
            300: '#b19cd9',
            500: '#7a52aa',
            700: '#4d2d73',
            900: '#2b1545',
            dark: '#0f0c1b',
          },
          pink: {
            500: '#ec4899',
            400: '#f472b6',
          }
        }
      }
    },
  },
  plugins: [],
}

