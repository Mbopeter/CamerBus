/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'cam-green':  '#007A33',
        'cam-yellow': '#FCD116',
        'cam-red':    '#CE1126',
        'cam-dark':   '#1A1A2E',
        'cam-card':   '#F8F9FA',
        'cam-muted':  '#6C757D',
      },
    },
  },
  plugins: [],
};
