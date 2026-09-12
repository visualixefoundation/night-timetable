/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        chalkboard: '#16241B',
        paper: '#FBF6EA',
        ink: '#211E19',
        muted: '#726C5E',
        line: '#E3DAC3',
        sage: '#4F6F55',
        gold: '#C68A2E',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-serif', 'serif'],
        sans: ['var(--font-body)', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
