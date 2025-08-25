/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        'slt-blue': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        'slt-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'myslt': {
          primary: '#1e90ff',      // Bright blue matching SLT screenshots
          'primary-dark': '#1a365d', // Deep navy background
          'primary-light': '#4da6ff', // Lighter blue variations
          secondary: '#2563eb',     // Secondary blue
          accent: '#3b82f6',       // Accent blue for highlights
          success: '#00d084',      // Bright green matching payment buttons
          background: '#1a365d',   // Deep navy background from screenshots
          card: 'rgba(59, 130, 246, 0.15)', // Semi-transparent blue cards
          'card-solid': '#2d5aa0', // Solid card background
          'service-card': '#4a5d7a', // Lighter shade for service cards and inputs (improved contrast)
          'input-bg': '#1e3a5f', // Darker background for better input visibility
          warning: '#fbbf24',      // Warning yellow
          danger: '#f87171',       // Error red
          info: '#60a5fa',         // Info blue
          text: {
            primary: '#ffffff',    // Pure white text for best contrast
            secondary: '#f8fafc',  // Very light gray text (improved contrast)
            muted: '#cbd5e1',      // Lighter muted text for better visibility
            accent: '#60a5fa',     // Blue accent text
          }
        },
      },
      backgroundImage: {
        'slt-gradient': 'linear-gradient(135deg, #1e90ff 0%, #2563eb 50%, #1a365d 100%)',
        'myslt-gradient': 'linear-gradient(135deg, #1a365d 0%, #1e90ff 25%, #2563eb 75%, #3b82f6 100%)',
        'myslt-card-gradient': 'linear-gradient(135deg, rgba(30, 144, 255, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
        'success-gradient': 'linear-gradient(135deg, #00d084 0%, #22c55e 100%)',
      },
    },
  },
  plugins: [],
};