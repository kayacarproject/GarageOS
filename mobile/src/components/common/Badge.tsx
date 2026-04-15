import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT } from '../../config/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'error' | 'default' | 'primary';
export type BadgeSize    = 'sm' | 'md';

interface Props {
  label:    string;
  variant?: BadgeVariant;
  size?:    BadgeSize;
  dot?:     boolean;   // show colored dot before label
  outline?: boolean;   // border-only style
}

// ─── Color map ────────────────────────────────────────────────────────────────

const MAP: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  success: { bg: COLORS.successLight, color: COLORS.success, border: COLORS.success },
  warning: { bg: COLORS.warningLight, color: COLORS.warning, border: COLORS.warning },
  danger:  { bg: COLORS.dangerLight,  color: COLORS.danger,  border: COLORS.danger  },
  error:   { bg: COLORS.errorLight,   color: COLORS.error,   border: COLORS.error   },
  info:    { bg: COLORS.infoLight,    color: COLORS.info,    border: COLORS.info    },
  primary: { bg: COLORS.primaryLight, color: COLORS.primary, border: COLORS.primary },
  gray:    { bg: '#F3F4F6',           color: COLORS.textSecondary, border: COLORS.border },
  default: { bg: '#F3F4F6',           color: COLORS.textSecondary, border: COLORS.border },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Badge: React.FC<Props> = ({
  label,
  variant = 'default',
  size    = 'sm',
  dot     = false,
  outline = false,
}) => {
  const { bg, color, border } = MAP[variant] ?? MAP.default;
  const isMd = size === 'md';

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: outline ? 'transparent' : bg },
        outline && { borderWidth: 1.5, borderColor: border },
        isMd && styles.pillMd,
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text style={[styles.text, { color }, isMd && styles.textMd]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    gap: 4,
  },
  pillMd: { paddingHorizontal: SPACING.md, paddingVertical: 5 },
  dot:  { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: FONT.sizes.xs, fontWeight: FONT.weights.semibold },
  textMd: { fontSize: FONT.sizes.sm },
});
