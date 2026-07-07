/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tnblue: {
          50: '#f7f6f7',
          100: '#ecebec',
          200: '#d5d4d5',
          300: '#b2b1b3',
          400: '#858385',
          500: '#5f5e60',
          600: '#484749',
          700: '#353335', // Dark grey/charcoal
          800: '#222022', // Primary Dark Charcoal Grey
          900: '#1a181b',
          950: '#111012',
        },
        tngreen: {
          50: '#fafce8',
          100: '#f1f7be',
          200: '#e3ed84',
          300: '#d1e141',
          400: '#C3D809', // Primary Lime Green / Yellow-Green
          500: '#b0c406',
          600: '#899a03',
          700: '#677501',
          800: '#525e04',
          900: '#464f09',
          950: '#262d02',
        },
        tnaccent: {
          orange: '#ea580c', // Saffron/Orange for alerts & Assigned status
          gold: '#d97706',   // Gold for warnings
          red: '#dc2626',    // Red for Critical / Reported
          sky: '#0284c7',    // Sky Blue for In Progress
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
