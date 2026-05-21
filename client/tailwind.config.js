/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#b8d4fe',
          300: '#7cb4fc',
          400: '#388ff9',
          500: '#0d6efd',
          600: '#0056d6',
          700: '#0043ae',
          800: '#00398f',
          900: '#003176',
        },
      },
    },
  },
  plugins: [],
};
