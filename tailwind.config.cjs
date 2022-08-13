/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      textColor: 'neutral-1',
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        neutral: {
          1: '#E2F5FF',
          2: '#97A9B5',
          5: '#3D4347',
          6: '#1A2227',
          7: '#0C1419',
          8: '#070F14',
          9: '#020A0F',
        },
        blue: '#00A3FF',
        green: '#00FFC2',
        red: '#F94C6B',
      },
    },
  },
  plugins: [],
}
