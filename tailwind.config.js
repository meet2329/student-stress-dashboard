/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5B8DEF',
        'deep-navy': '#0F1B33',
        teal: '#2FB6A8',
        'bg-alt': '#F4F7FB',
        border: '#E3E8F0',
        muted: '#6B7688',
        positive: '#3EB489',
        moderate: '#5B8DEF',
        elevated: '#F5A524',
        'high-stress': '#E5484D',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '8': '8px',
      },
    },
  },
  plugins: [],
}
