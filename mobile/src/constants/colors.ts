// ─── Primitive Palette ────────────────────────────────────────────────────────

export const Palette = {
  // Blue
  blue50:  '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  blue800: '#1E40AF',
  blue900: '#1E3A8A',

  // Green
  green50:  '#F0FDF4',
  green100: '#DCFCE7',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',
  green800: '#166534',

  // Amber
  amber50:  '#FFFBEB',
  amber100: '#FEF3C7',
  amber500: '#F59E0B',
  amber600: '#D97706',
  amber700: '#B45309',

  // Red
  red50:  '#FEF2F2',
  red100: '#FEE2E2',
  red500: '#EF4444',
  red600: '#DC2626',
  red700: '#B91C1C',

  // Violet
  violet50:  '#F5F3FF',
  violet600: '#7C3AED',

  // Gray scale (full)
  gray50:  '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Absolute
  white: '#FFFFFF',
  black: '#000000',
} as const;

// ─── Light Mode Tokens ────────────────────────────────────────────────────────

export const Colors = {
  // Brand
  primary:      Palette.blue600,
  primaryLight: Palette.blue50,
  primaryDark:  Palette.blue700,

  // Semantic
  success:      Palette.green600,
  successLight: Palette.green50,
  successDark:  Palette.green700,

  warning:      Palette.amber600,
  warningLight: Palette.amber50,
  warningDark:  Palette.amber700,

  danger:       Palette.red600,
  dangerLight:  Palette.red50,
  dangerDark:   Palette.red700,

  info:         Palette.blue600,
  infoLight:    Palette.blue50,

  // Gray scale (named for direct use)
  gray50:  Palette.gray50,
  gray100: Palette.gray100,
  gray200: Palette.gray200,
  gray300: Palette.gray300,
  gray400: Palette.gray400,
  gray500: Palette.gray500,
  gray600: Palette.gray600,
  gray700: Palette.gray700,
  gray800: Palette.gray800,
  gray900: Palette.gray900,

  // Surface
  white:      Palette.white,
  background: '#F7F9FC',
  surface:    Palette.white,
  surfaceAlt: Palette.gray50,
  border:     Palette.gray200,
  borderFocus: Palette.blue400,

  // Text
  text:          Palette.gray900,
  textSecondary: Palette.gray500,
  textMuted:     Palette.gray400,
  textInverse:   Palette.white,
} as const;

// ─── Dark Mode Tokens ─────────────────────────────────────────────────────────
// Ready to use with useColorScheme() — swap Colors → DarkColors

export const DarkColors = {
  primary:      Palette.blue500,
  primaryLight: '#1E3A5F',
  primaryDark:  Palette.blue400,

  success:      Palette.green500,
  successLight: '#052E16',
  successDark:  Palette.green600,

  warning:      Palette.amber500,
  warningLight: '#451A03',
  warningDark:  Palette.amber600,

  danger:       Palette.red500,
  dangerLight:  '#450A0A',
  dangerDark:   Palette.red600,

  info:         Palette.blue500,
  infoLight:    '#1E3A5F',

  gray50:  Palette.gray900,
  gray100: Palette.gray800,
  gray200: Palette.gray700,
  gray300: Palette.gray600,
  gray400: Palette.gray500,
  gray500: Palette.gray400,
  gray600: Palette.gray300,
  gray700: Palette.gray200,
  gray800: Palette.gray100,
  gray900: Palette.gray50,

  white:      Palette.gray900,
  background: '#0F172A',
  surface:    Palette.gray800,
  surfaceAlt: Palette.gray700,
  border:     Palette.gray700,
  borderFocus: Palette.blue500,

  text:          Palette.gray50,
  textSecondary: Palette.gray400,
  textMuted:     Palette.gray500,
  textInverse:   Palette.gray900,
} as const;

export type ColorToken = keyof typeof Colors;
export type ColorKey   = keyof typeof Colors; // backward compat alias
