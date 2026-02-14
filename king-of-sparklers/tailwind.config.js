/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#e8ecf3',
          100: '#c5cee0',
          200: '#9eaecb',
          300: '#778eb6',
          400: '#5976a6',
          500: '#3b5e97',
          600: '#33528a',
          700: '#28437a',
          800: '#1f356a',
          900: '#1B2A4A',
          950: '#0f1a30',
        },
        gold: {
          50: '#fef6ee',
          100: '#fcebd5',
          200: '#f8d3aa',
          300: '#f3b574',
          400: '#E8913A',
          500: '#e47a1f',
          600: '#d56016',
          700: '#b14814',
          800: '#8d3a18',
          900: '#723116',
        },
      },
    },
  },
  plugins: [],
};
