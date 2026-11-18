/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#071426',
          900: '#0B1B32',
          850: '#0E213D',
          800: '#102440',
          750: '#142B49',
          700: '#1C385E',
          600: '#243F60',
        },
        furaBlue: '#0788F9',
        furaGreen: '#00C875',
        furaOrange: '#FFA526',
        furaPurple: '#8055F5',
        furaRed: '#EF4444',
      },
    },
  },
  plugins: [],
};
