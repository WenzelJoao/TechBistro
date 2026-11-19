/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: {
          DEFAULT: '#292B2F',
          light: '#35383D',
          lighter: '#41444A',
          dark: '#212327',
          deep: '#17191C',
        },
        ivory: {
          DEFAULT: '#F2EDE3',
          bright: '#FBF8F2',
          muted: '#DED8CD',
        },
        gold: {
          DEFAULT: '#B89558',
          light: '#D6B77F',
          dark: '#937643',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        elegante: '0 24px 60px -24px rgba(0, 0, 0, 0.65)',
        gold: '0 0 0 1px rgba(184, 149, 88, 0.25), 0 18px 40px -22px rgba(0, 0, 0, 0.8)',
      },
      letterSpacing: {
        luxo: '0.28em',
      },
    },
  },
  plugins: [],
};
