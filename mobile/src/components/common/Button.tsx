import React, { useRef } from 'react';
import {
  Animated, TouchableWithoutFeedback,
  ActivityIndicator, Text, StyleSheet, ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, FONT, ANIMATION } from '../../config/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize    = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress: () => void;
  variant?:   ButtonVariant;
  size?:      ButtonSize;
  loading?:   boolean;
  disabled?:  boolean;
  fullWidth?: boolean;
  icon?:      keyof typeof Ionicons.glyphMap;
  iconRight?: boolean;
  style?:     ViewStyle;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const BG: Record<ButtonVariant, string> = {
  primary:   COLORS.primary,
  secondary: COLORS.primaryLight,
  danger:    COLORS.danger,
  ghost:     'transparent',
  outline:   'transparent',
};

const TEXT_COLOR: Record<ButtonVariant, string> = {
  primary:   '#fff',
  secondary: COLORS.primary,
  danger:    '#fff',
  ghost:     COLORS.primary,
  outline:   COLORS.primary,
};

const BORDER: Partial<Record<ButtonVariant, object>> = {
  outline: { borderWidth: 1.5, borderColor: COLORS.primary },
  ghost:   { borderWidth: 1.5, borderColor: 'transparent' },
};

const SIZE_STYLE: Record<ButtonSize, object> = {
  sm: { paddingVertical: SPACING.xs,  paddingHorizontal: SPACING.md, minHeight: 36, gap: 5 },
  md: { paddingVertical: 10,          paddingHorizontal: SPACING.lg, minHeight: 44, gap: 6 },
  lg: { paddingVertical: SPACING.md,  paddingHorizontal: SPACING.xl, minHeight: 52, gap: 8 },
};

const TEXT_SIZE: Record<ButtonSize, number> = {
  sm: FONT.sizes.sm,
  md: FONT.sizes.md,
  lg: FONT.sizes.lg,
};

const ICON_SIZE: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18 };

// ─── Component ────────────────────────────────────────────────────────────────

export const Button: React.FC<Props> = ({
  title,
  onPress,
  variant   = 'primary',
  size      = 'md',
  loading,
  disabled,
  fullWidth,
  icon,
  iconRight = false,
  style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: ANIMATION.press.scale,
      tension: ANIMATION.spring.tension,
      friction: ANIMATION.spring.friction,
      useNativeDriver: true,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      tension: ANIMATION.spring.tension,
      friction: ANIMATION.spring.friction,
      useNativeDriver: true,
    }).start();

  const spinnerColor = variant === 'primary' || variant === 'danger' ? '#fff' : COLORS.primary;
  const iconColor    = TEXT_COLOR[variant];
  const iconEl = icon && !loading
    ? <Ionicons name={icon} size={ICON_SIZE[size]} color={iconColor} />
    : null;

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={isDisabled}
    >
      <Animated.View
        style={[
          styles.base,
          { backgroundColor: BG[variant] },
          BORDER[variant],
          SIZE_STYLE[size],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          { transform: [{ scale }] },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={spinnerColor} size="small" />
        ) : (
          <>
            {!iconRight && iconEl}
            <Text style={[styles.text, { color: TEXT_COLOR[variant], fontSize: TEXT_SIZE[size] }]}>
              {title}
            </Text>
            {iconRight && iconEl}
          </>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { width: '100%' },
  disabled:  { opacity: 0.5 },
  text:      { fontWeight: FONT.weights.semibold },
});
