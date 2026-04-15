import { Platform } from 'react-native';

// ─── Font Family Names ────────────────────────────────────────────────────────
// These must match the keys passed to useFonts() exactly.

export const FontFamily = {
  // Poppins — headings, buttons, labels
  poppinsRegular:  'Poppins_400Regular',
  poppinsMedium:   'Poppins_500Medium',
  poppinsSemiBold: 'Poppins_600SemiBold',
  poppinsBold:     'Poppins_700Bold',

  // Inter — body text, data, UI
  interRegular:    'Inter_400Regular',
  interMedium:     'Inter_500Medium',
  interSemiBold:   'Inter_600SemiBold',

  // System fallbacks (used before fonts load or on unsupported platforms)
  systemDefault: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' })!,
} as const;

// ─── Semantic Font Roles ──────────────────────────────────────────────────────
// Maps usage intent → font family name.
// Components should use these, not FontFamily directly.

export const FontRole = {
  heading:  FontFamily.poppinsBold,
  subhead:  FontFamily.poppinsSemiBold,
  button:   FontFamily.poppinsMedium,
  label:    FontFamily.poppinsMedium,
  body:     FontFamily.interRegular,
  bodyMed:  FontFamily.interMedium,
  data:     FontFamily.interMedium,
  caption:  FontFamily.interRegular,
  mono:     FontFamily.systemDefault,
} as const;

// ─── Type Scale ───────────────────────────────────────────────────────────────
// All sizes in sp (scale-independent pixels) — respects system font size.

export const TypeScale = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   15,
  lg:   17,
  xl:   20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

// ─── Line Heights ─────────────────────────────────────────────────────────────

export const LineHeight = {
  none:    1,
  tight:   1.2,
  snug:    1.375,
  normal:  1.5,
  relaxed: 1.625,
  loose:   2,
} as const;

// ─── Letter Spacing ───────────────────────────────────────────────────────────

export const LetterSpacing = {
  tighter: -0.5,
  tight:   -0.25,
  normal:   0,
  wide:     0.25,
  wider:    0.5,
  widest:   1,
} as const;

// ─── Variant Definitions ──────────────────────────────────────────────────────
// Each variant maps to a complete text style spec.

export type TextVariant =
  | 'h1' | 'h2' | 'h3' | 'h4'
  | 'body' | 'bodyMedium'
  | 'label' | 'caption' | 'overline'
  | 'button' | 'buttonSm'
  | 'data' | 'dataSm';

export interface VariantStyle {
  fontFamily:    string;
  fontSize:      number;
  lineHeight:    number;
  letterSpacing: number;
}

export const VariantStyles: Record<TextVariant, VariantStyle> = {
  // ── Headings ────────────────────────────────────────────────────────────────
  h1: {
    fontFamily:    FontRole.heading,
    fontSize:      TypeScale['3xl'],
    lineHeight:    TypeScale['3xl'] * LineHeight.tight,
    letterSpacing: LetterSpacing.tight,
  },
  h2: {
    fontFamily:    FontRole.heading,
    fontSize:      TypeScale['2xl'],
    lineHeight:    TypeScale['2xl'] * LineHeight.snug,
    letterSpacing: LetterSpacing.tight,
  },
  h3: {
    fontFamily:    FontRole.subhead,
    fontSize:      TypeScale.xl,
    lineHeight:    TypeScale.xl * LineHeight.snug,
    letterSpacing: LetterSpacing.normal,
  },
  h4: {
    fontFamily:    FontRole.subhead,
    fontSize:      TypeScale.lg,
    lineHeight:    TypeScale.lg * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },

  // ── Body ────────────────────────────────────────────────────────────────────
  body: {
    fontFamily:    FontRole.body,
    fontSize:      TypeScale.base,
    lineHeight:    TypeScale.base * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },
  bodyMedium: {
    fontFamily:    FontRole.bodyMed,
    fontSize:      TypeScale.base,
    lineHeight:    TypeScale.base * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },

  // ── Labels & Captions ───────────────────────────────────────────────────────
  label: {
    fontFamily:    FontRole.label,
    fontSize:      TypeScale.sm,
    lineHeight:    TypeScale.sm * LineHeight.normal,
    letterSpacing: LetterSpacing.normal,
  },
  caption: {
    fontFamily:    FontRole.caption,
    fontSize:      TypeScale.xs,
    lineHeight:    TypeScale.xs * LineHeight.relaxed,
    letterSpacing: LetterSpacing.normal,
  },
  overline: {
    fontFamily:    FontRole.label,
    fontSize:      TypeScale.xs,
    lineHeight:    TypeScale.xs * LineHeight.normal,
    letterSpacing: LetterSpacing.widest,
  },

  // ── Buttons ─────────────────────────────────────────────────────────────────
  button: {
    fontFamily:    FontRole.button,
    fontSize:      TypeScale.base,
    lineHeight:    TypeScale.base * LineHeight.none,
    letterSpacing: LetterSpacing.wide,
  },
  buttonSm: {
    fontFamily:    FontRole.button,
    fontSize:      TypeScale.sm,
    lineHeight:    TypeScale.sm * LineHeight.none,
    letterSpacing: LetterSpacing.wide,
  },

  // ── Data / Numbers ──────────────────────────────────────────────────────────
  data: {
    fontFamily:    FontRole.data,
    fontSize:      TypeScale['2xl'],
    lineHeight:    TypeScale['2xl'] * LineHeight.tight,
    letterSpacing: LetterSpacing.tight,
  },
  dataSm: {
    fontFamily:    FontRole.data,
    fontSize:      TypeScale.lg,
    lineHeight:    TypeScale.lg * LineHeight.tight,
    letterSpacing: LetterSpacing.tight,
  },
};

/*
 * ─── Web (Admin Panel) Equivalents ───────────────────────────────────────────
 *
 * In the admin panel (React + Tailwind), add to index.html:
 *
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
 *
 * Then in tailwind.config.js:
 *   fontFamily: {
 *     heading: ['Poppins', 'sans-serif'],
 *     body:    ['Inter', 'sans-serif'],
 *   }
 *
 * Usage: className="font-heading text-2xl font-bold"
 *        className="font-body text-sm font-medium"
 *
 * This ensures pixel-perfect parity between mobile and web.
 */
