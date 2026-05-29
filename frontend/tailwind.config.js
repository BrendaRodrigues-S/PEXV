/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{vue,ts,js}',
    './components/**/*.{vue,ts,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#f3f9f1',
          100: '#e4f4e0',
          200: '#c5e8be',
          300: '#97d48d',
          400: '#74c465',   // verde claro
          500: '#4da83e',
          600: '#00804d',   // verde escuro
          700: '#006b40',
          800: '#005533',
          900: '#003d25',
        },
        accent: {
          300: '#e8f04e',
          400: '#dbe64c',   // verde limão
          500: '#c9d438',
          600: '#aab528',
        },
        navy: {
          500: '#1e4890',   // azul
          600: '#183a75',
          700: '#122d5c',
          800: '#0d2147',
        },
        surface: {
          50:  '#f6f8ed',   // branco esverdeado
          100: '#edf0de',
          200: '#dde2c4',
          300: '#c4cab0',
          400: '#9da48a',
          500: '#787f67',
          600: '#5c6250',
          700: '#454a3c',
          800: '#2e3229',
          900: '#1a1c17',
          950: '#0d0e0b',
        },
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
