/** @type {import('tailwindcss').Config} */

/**
 * SLT-Mobitel brand palette.
 *
 * Sampled from sltmobitel.lk: the brand sits on a navy-blue family
 * (#0d478b primary, #0b2a58 deep navy, #1055a7 lighter) with a green accent.
 *
 * Rather than introduce a parallel `slt-*` scale and leave 190-odd existing
 * `blue-600` usages on Tailwind's default blue, the `blue` ramp itself is
 * redefined to SLT's blues. Every existing blue utility therefore renders in
 * brand colour with no change at the call site, and one primary stays one
 * primary. The 50-400 steps are lighter tints of the same hue so backgrounds,
 * borders and badges stay coherent.
 */
const sltBlue = {
  50: '#eff5fc',
  100: '#d8e6f7',
  200: '#b3ccef',
  300: '#7fa8e0',
  400: '#4a80cb',
  500: '#1f60b4',
  600: '#0d478b', // primary - brand blue
  700: '#0f3b7a', // hover / pressed
  800: '#0b2a58', // deep navy - headers, footers
  900: '#081f42',
  950: '#05142b',
};

export default {
  // Dark mode is driven by a `dark` class on <html>, set by ThemeContext.
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '475px',
      },
      colors: {
        blue: sltBlue,
        slt: {
          ...sltBlue,
          accent: '#69ca8e', // brand green, used sparingly for success
        },
      },
      fontFamily: {
        // SLT-Mobitel sets Poppins across its properties.
        sans: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
