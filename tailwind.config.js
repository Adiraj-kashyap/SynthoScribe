/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#1E40AF',
        'brand-secondary': '#3B82F6',
        'light-bg': '#F9FAFB',
        'dark-bg': '#111827',
        'light-text': '#1F2937',
        'dark-text': '#F9FAFB',
        'light-card': '#FFFFFF',
        'dark-card': '#1F2937',
        'light-border': '#E5E7EB',
        'dark-border': '#374151',
      }
    }
  },
  plugins: [],
}

