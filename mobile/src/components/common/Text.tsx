import React from 'react';
import {
  Text as RNText,
  TextStyle,
  StyleSheet,
  TextProps as RNTextProps,
  useWindowDimensions,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors, DarkColors } from '../../constants/colors';
import {
  TextVariant,
  VariantStyles,
  FontFamily,
} from '../../constants/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';
export type TextAlign  = 'left' | 'center' | 'right';

interface Props extends RNTextProps {
  variant?:        TextVariant;
  weight?:         TextWeight;
  color?:          string;
  align?:          TextAlign;
  /** Scale font size relative to base. 1 = no change, 1.1 = 10% larger */
  scale?:          number;
  /** Disable system font scaling (accessibility override) */
  noScale?:        boolean;
  children:        React.ReactNode;
}

// ─── Weight → font family override ───────────────────────────────────────────
// When a weight is explicitly passed it overrides the variant's default family.

const WEIGHT_FONT: Record<TextWeight, string> = {
  regular:  FontFamily.interRegular,
  medium:   FontFamily.interMedium,
  semibold: FontFamily.poppinsSemiBold,
  bold:     FontFamily.poppinsBold,
};

// ─── Component ────────────────────────────────────────────────────────────────

export const AppText: React.FC<Props> = ({
  variant  = 'body',
  weight,
  color,
  align,
  scale    = 1,
  noScale  = false,
  style,
  children,
  ...rest
}) => {
  const scheme = useColorScheme();
  const C      = scheme === 'dark' ? DarkColors : Colors;

  const variantStyle = VariantStyles[variant];

  // Resolve font family: explicit weight overrides variant default
  const fontFamily = weight ? WEIGHT_FONT[weight] : variantStyle.fontFamily;

  // Resolve text color: explicit prop > variant default > theme text
  const textColor = color ?? defaultColorForVariant(variant, C);

  // Apply optional scale (for accessibility or emphasis)
  const fontSize = variantStyle.fontSize * scale;

  const computed: TextStyle = {
    fontFamily,
    fontSize,
    lineHeight: variantStyle.lineHeight * scale,
    letterSpacing: variantStyle.letterSpacing,
    color: textColor,
    textAlign: align,
  };

  return (
    <RNText
      style={[computed, style]}
      allowFontScaling={!noScale}
      maxFontSizeMultiplier={noScale ? 1 : 1.3}
      {...rest}
    >
      {children}
    </RNText>
  );
};

// ─── Default color per variant ────────────────────────────────────────────────

type AnyColors = typeof Colors | typeof DarkColors;

function defaultColorForVariant(
  variant: TextVariant,
  C: AnyColors,
): string {
  switch (variant) {
    case 'caption':
    case 'overline':
      return C.textMuted;
    case 'label':
      return C.textSecondary;
    default:
      return C.text;
  }
}

// ─── Convenience aliases ──────────────────────────────────────────────────────
// Import these directly for common patterns.

export const H1: React.FC<Omit<Props, 'variant'>> = (p) => <AppText variant="h1" {...p} />;
export const H2: React.FC<Omit<Props, 'variant'>> = (p) => <AppText variant="h2" {...p} />;
export const H3: React.FC<Omit<Props, 'variant'>> = (p) => <AppText variant="h3" {...p} />;
export const H4: React.FC<Omit<Props, 'variant'>> = (p) => <AppText variant="h4" {...p} />;
export const Body: React.FC<Omit<Props, 'variant'>> = (p) => <AppText variant="body" {...p} />;
export const Caption: React.FC<Omit<Props, 'variant'>> = (p) => <AppText variant="caption" {...p} />;
export const Label: React.FC<Omit<Props, 'variant'>> = (p) => <AppText variant="label" {...p} />;
