/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'raleway': ['Raleway', 'sans-serif'],
        'bio-rhyme': ['BioRhyme Expanded', 'serif'],
      },
    },
  },
  plugins: [],
};