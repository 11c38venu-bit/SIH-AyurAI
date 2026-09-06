/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ayur: {
          50: '#f0fdf9',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e5ece5',
          200: '#ceddce',
          300: '#abc5ab',
          400: '#84a784',
          500: '#648b64',
          600: '#4e6f4e',
          700: '#3e583e',
          800: '#344734',
          900: '#2c3c2c',
        },
        herbal: {
          light: '#E8F5E9',
          DEFAULT: '#2E7D32',
          dark: '#1B5E20',
          accent: '#81C784',
        },
        dosha: {
          vata: '#6366F1',
          'vata-light': '#EEF2FF',
          pitta: '#E11D48',
          'pitta-light': '#FFF1F2',
          kapha: '#16A34A',
          'kapha-light': '#F0FDF4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'clinical': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
