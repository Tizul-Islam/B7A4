/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0f19',
        darkPanel: '#131b2e',
        darkCard: '#1e293b',
        accentTeal: '#0ea5e9',
        accentTealHover: '#0284c7',
        accentOrange: '#f97316',
        accentOrangeHover: '#ea580c',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
