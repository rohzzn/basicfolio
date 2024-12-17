// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enables dark mode via a CSS class
  theme: {
    extend: {
      opacity: {
        '2': '0.02',
        '5': '0.05',
        '10': '0.10', /* Added 10% opacity */
      },
      mixBlendMode: {
        'multiply': 'multiply',
        'overlay': 'overlay', /* Added overlay */
        'soft-light': 'soft-light',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
        serif: ['"Apple Garamond"', 'serif'], /* Added serif font */
      },
      colors: {
        paper: '#f5f5dc', /* Optional: Custom color for paper aesthetic */
      },
    },
  },
  plugins: [],
}