/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        swiss: {
          white:   '#FFFFFF',
          black:   '#111111',
          red:     '#E8001D',
          gray100: '#F5F5F5',
          gray200: '#E8E8E8',
          gray400: '#999999',
          gray600: '#555555',
          // code editor palette
          bg:      '#111111',
          bgDark:  '#0E0E0E',
          border:  '#1d1d1d',
          border2: '#2a2a2a',
          text:    '#D4D4D4',
        },
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4', letterSpacing: '0.08em' }],
        xs:    ['11px', { lineHeight: '1.4' }],
        sm:    ['12px', { lineHeight: '1.5' }],
        base:  ['13px', { lineHeight: '1.6' }],
        md:    ['15px', { lineHeight: '1.7' }],
        lg:    ['20px', { lineHeight: '1.3' }],
        xl:    ['32px', { lineHeight: '1.1' }],
      },
      spacing: {
        '0.5': '4px',
        '1':   '8px',
        '1.5': '12px',
        '2':   '16px',
        '2.5': '20px',
        '3':   '24px',
        '4':   '32px',
        '5':   '40px',
        '6':   '48px',
      },
      borderWidth: {
        '1.5': '1.5px',
      },
      letterSpacing: {
        tightest: '-0.02em',
        wider:    '0.1em',
        widest:   '0.18em',
      },
    },
  },
  plugins: [],
}
