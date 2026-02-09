/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 0deg at 50% 50%, var(--tw-gradient-stops))',
      },
      opacity: {
        '2': '0.02',
        '5': '0.05',
        '10': '0.10',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
        serif: ['"Apple Garamond"', 'serif'],
      },
      colors: {
        paper: '#f2f2f2',
      },
      keyframes: {
        fadeIn: {
          'from': {
            opacity: '0',
          },
          'to': {
            opacity: '1',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in forwards',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}