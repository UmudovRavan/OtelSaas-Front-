/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#12101C',
        'bg-card': '#211E30',
        'primary': '#A78BFA',
        'text-muted': '#DDD6FE',
        'accent-dark': '#000000',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Plus Jakarta Sans"',
          'system-ui',
          'sans-serif'
        ],
      },
    },
  },
  plugins: [],
}

