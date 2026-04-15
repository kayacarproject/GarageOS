/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', light: '#EFF6FF', dark: '#1D4ED8' },
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '24px' },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
