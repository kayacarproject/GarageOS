import { useColorScheme } from 'react-native';
import { Colors, DarkColors } from '../constants/colors';

// ─── Color theme (backward compat + dark mode ready) ─────────────────────────

export const COLORS = {
  primary:      Colors.primary,
  primaryLight: Colors.primaryLight,
  primaryDark:  Colors.primaryDark,
  background:   Colors.background,
  surface:      Colors.surface,
  surfaceAlt:   Colors.surfaceAlt,
  border:       Colors.border,
  borderFocus:  Colors.borderFocus,
  text:         Colors.text,
  textSecondary:Colors.textSecondary,
  textMuted:    Colors.textMuted,
  textInverse:  Colors.textInverse,
  success:      Colors.success,
  successLight: Colors.successLight,
  successDark:  Colors.successDark,
  warning:      Colors.warning,
  warningLight: Colors.warningLight,
  warningDark:  Colors.warningDark,
  // keep both 'error' and 'danger' for backward compat
  error:        Colors.danger,
  errorLight:   Colors.dangerLight,
  danger:       Colors.danger,
  dangerLight:  Colors.dangerLight,
  dangerDark:   Colors.dangerDark,
  info:         Colors.info,
  infoLight:    Colors.infoLight,
};

/**
 * Returns the correct color set for the current color scheme.
 * Use inside components: const C = useThemeColors();
 */
export function useThemeColors() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DarkColors : Colors;
}

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────

export const RADIUS = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
// Font family names match the keys registered in useFonts.ts.
// Falls back to 'System' before fonts are loaded (no flash — same metrics).

export const FONT = {
  // Poppins — headings, buttons, labels
  heading:         'Poppins_700Bold',
  headingSemiBold: 'Poppins_600SemiBold',
  button:          'Poppins_500Medium',
  label:           'Poppins_500Medium',

  // Inter — body, data, UI text
  body:            'Inter_400Regular',
  bodyMedium:      'Inter_500Medium',
  bodySemiBold:    'Inter_600SemiBold',

  // Legacy aliases (backward compat — existing components keep working)
  regular: 'Inter_400Regular',
  medium:  'Poppins_500Medium',
  bold:    'Poppins_700Bold',

  sizes: {
    xs:   11,
    sm:   13,
    md:   15,
    lg:   17,
    xl:   20,
    xxl:  24,
    xxxl: 30,
  },
  weights: {
    regular:   '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight:  1.2,
    normal: 1.5,
    loose:  1.8,
  },
} as const;

// ─── Animation ────────────────────────────────────────────────────────────────

export const ANIMATION = {
  press: {
    duration: 100,
    scale: 0.97,
  },
  spring: {
    tension: 40,
    friction: 7,
  },
  fade: {
    duration: 200,
  },
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────────────

export const Z_INDEX = {
  base:    0,
  card:    10,
  header:  20,
  modal:   30,
  toast:   40,
  overlay: 50,
} as const;
