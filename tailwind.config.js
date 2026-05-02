/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2e071d',
        secondary: '#213847',
        accent: '#486e6b',
        soft: '#b38f86',
        light: '#dbd0bf',
      },
    },
  },
  plugins: [],
}
