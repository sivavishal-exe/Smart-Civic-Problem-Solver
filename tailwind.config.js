/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tnblue: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc4fa',
          400: '#36a5f5',
          500: '#0c87eb',
          600: '#006bcb',
          700: '#0055a5', // Trustworthy TN Govt Blue
          800: '#054987',
          900: '#0a3e70',
          950: '#07274a',
        },
        tngreen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d', // Agricultural Green
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
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
