/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        paper: {
          50: '#FAFAF7',
          100: '#F4F3F0',
          200: '#E8E6E1',
          300: '#D6D3CC',
        },
        olive: {
          50: '#F2F4F2',
          100: '#DCE2DC',
          200: '#B0BDB2',
          300: '#7E9482',
          400: '#5A7A5F',
          500: '#4E6B52',
          600: '#3D5542',
          700: '#2E4032',
          800: '#2A3429',
          900: '#1A211B',
        },
        copper: {
          50: '#FDF5ED',
          100: '#FAE6D0',
          200: '#F3C89A',
          300: '#E8A35E',
          400: '#D4852F',
          500: '#C26E2A',
          600: '#A65A22',
          700: '#84461A',
        },
        ink: {
          50: '#F5F5F4',
          100: '#E6E5E3',
          200: '#CDCBC7',
          300: '#A9A69F',
          400: '#8C8880',
          500: '#6E6A63',
          600: '#53504A',
          700: '#3D3B37',
          800: '#292724',
          900: '#1A1917',
        },
        odds: {
          great: '#4E6B52',
          good: '#7E9482',
          moderate: '#C26E2A',
          tough: '#B5403A',
          backup: '#3B7B95',
        },
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'slide-down': 'slide-down 0.3s ease-out both',
      },
    },
  },
  plugins: [],
}
