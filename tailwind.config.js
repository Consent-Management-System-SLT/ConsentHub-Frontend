/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        'brand': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Primary brand color
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        'myslt': {
          primary: '#2563eb',
          'primary-dark': '#1e3a8a',
          'primary-light': '#60a5fa',
          secondary: '#3b82f6',
          accent: '#2563eb',
          success: '#16a34a',
          background: '#f8fafc', // Light slate
          card: '#ffffff', // White cards
          'card-solid': '#ffffff',
          'service-card': '#f1f5f9',
          'input-bg': '#ffffff',
          warning: '#d97706',
          danger: '#dc2626',
          info: '#2563eb',
          text: {
            primary: '#0f172a',    // Dark slate for text
            secondary: '#475569',
            muted: '#64748b',
            accent: '#2563eb',
          }
        },
      },
      backgroundImage: {
        'slt-gradient': 'none',
        'myslt-gradient': 'none',
        'myslt-card-gradient': 'none',
        'success-gradient': 'none',
      },
    },
  },
  plugins: [],
};