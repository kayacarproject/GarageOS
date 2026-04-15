/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // ── Font Families ────────────────────────────────────────────────────────
      fontFamily: {
        // Poppins — headings, buttons, labels
        heading:  ['Poppins_700Bold'],
        subhead:  ['Poppins_600SemiBold'],
        button:   ['Poppins_500Medium'],
        label:    ['Poppins_500Medium'],
        poppins:  ['Poppins_400Regular'],

        // Inter — body, data, UI
        body:     ['Inter_400Regular'],
        bodyMed:  ['Inter_500Medium'],
        bodySemi: ['Inter_600SemiBold'],
        inter:    ['Inter_400Regular'],

        // Fallback
        sans:     ['Inter_400Regular', 'System'],
      },

      // ── Colors ───────────────────────────────────────────────────────────────
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light:   '#EFF6FF',
          dark:    '#1D4ED8',
        },
        success: {
          DEFAULT: '#16A34A',
          light:   '#F0FDF4',
          dark:    '#15803D',
        },
        warning: {
          DEFAULT: '#D97706',
          light:   '#FFFBEB',
          dark:    '#B45309',
        },
        danger: {
          DEFAULT: '#DC2626',
          light:   '#FEF2F2',
          dark:    '#B91C1C',
        },
        surface:    '#FFFFFF',
        background: '#F7F9FC',
      },

      // ── Border Radius ────────────────────────────────────────────────────────
      borderRadius: {
        xl:   '12px',
        '2xl':'16px',
        '3xl':'24px',
      },

      // ── Font Sizes ───────────────────────────────────────────────────────────
      fontSize: {
        xs:   ['11px', { lineHeight: '16px' }],
        sm:   ['13px', { lineHeight: '20px' }],
        base: ['15px', { lineHeight: '24px' }],
        lg:   ['17px', { lineHeight: '28px' }],
        xl:   ['20px', { lineHeight: '28px' }],
        '2xl':['24px', { lineHeight: '32px' }],
        '3xl':['30px', { lineHeight: '36px' }],
      },
    },
  },
  plugins: [],
};
